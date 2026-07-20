/**
 * End-to-end smoke test: spawn the built MCP server over stdio exactly as a real
 * client (Cursor / Claude Code / Windsurf) would, then drive it with real
 * JSON-RPC — initialize, tools/list, and a couple of tools/call round-trips.
 *
 * Points the server at the local repo checkout (DZUP_UI_REGISTRY_URL=<repoRoot>)
 * so it reads the committed artifacts without needing the site deployed.
 *
 * Run: node scripts/e2e-smoke.mjs   (after `yarn build`)
 */
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const SERVER = resolve(HERE, '..', 'dist', 'index.js')

const child = spawn('node', [SERVER], {
  env: { ...process.env, DZUP_UI_REGISTRY_URL: REPO_ROOT },
  stdio: ['pipe', 'pipe', 'inherit'],
})

let buf = ''
const pending = new Map()
child.stdout.on('data', (chunk) => {
  buf += chunk.toString()
  let nl = buf.indexOf('\n')
  for (; nl !== -1; nl = buf.indexOf('\n')) {
    const line = buf.slice(0, nl).trim()
    buf = buf.slice(nl + 1)
    if (!line)
      continue
    const msg = JSON.parse(line)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
})

let id = 0
function rpc(method, params) {
  const reqId = ++id
  return new Promise((res) => {
    pending.set(reqId, res)
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: reqId, method, params })}\n`)
  })
}
function notify(method, params) {
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
}

function assert(cond, label) {
  if (!cond) {
    console.error(`✗ ${label}`)
    child.kill()
    process.exit(1)
  }
  console.error(`✓ ${label}`)
}

const init = await rpc('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'e2e-smoke', version: '0.0.0' },
})
assert(init.result?.serverInfo?.name === 'dzup-ui', `initialize → serverInfo.name = dzup-ui`)
notify('notifications/initialized', {})

const tools = await rpc('tools/list', {})
const names = (tools.result?.tools ?? []).map(t => t.name).sort()
assert(names.length >= 9, `tools/list → ${names.length} tools: ${names.join(', ')}`)
for (const expected of ['list_components', 'get_component', 'list_blocks', 'get_block', 'list_templates', 'get_template', 'list_tokens', 'get_install_command', 'search']) {
  assert(names.includes(expected), `  exposes ${expected}`)
}

const comps = await rpc('tools/call', { name: 'list_components', arguments: { family: 'Buttons' } })
assert(comps.result?.content?.[0]?.text?.includes('DzButton'), 'list_components(Buttons) → includes DzButton')

const block = await rpc('tools/call', { name: 'get_block', arguments: { name: 'hero-centered' } })
const blockText = block.result?.content?.[0]?.text ?? ''
assert(blockText.includes('shadcn@latest add') && blockText.includes('/r/hero-centered.json'), 'get_block(hero-centered) → real install command')
assert(blockText.includes('<template>'), 'get_block(hero-centered) → real .vue source')

const search = await rpc('tools/call', { name: 'search', arguments: { query: 'pricing' } })
assert((search.result?.content?.[0]?.text ?? '').toLowerCase().includes('pricing'), 'search(pricing) → results')

const bad = await rpc('tools/call', { name: 'get_block', arguments: { name: 'nope-nope' } })
assert(bad.result?.isError === true, 'get_block(nope) → isError')

console.error('\nAll end-to-end MCP checks passed.')
child.kill()
process.exit(0)
