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
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const SERVER = resolve(HERE, '..', 'dist', 'index.js')
const PKG = JSON.parse(readFileSync(resolve(HERE, '..', 'package.json'), 'utf8'))

/**
 * The tool list and version are READ from the generated surface artifact, not
 * typed here (TASK-N2-A1). This script used to carry its own copy of the nine
 * names — the fourth hand-maintained copy in the package, after the source, the
 * README table and the CHANGELOG — so it could only ever confirm what someone
 * had already remembered to update.
 */
const SURFACE = JSON.parse(readFileSync(resolve(HERE, '..', 'docs', 'mcp-tool-surface.json'), 'utf8'))
const EXPECTED_TOOLS = SURFACE.tools.map(t => t.name).sort()

/**
 * Spawn the server the way a CLIENT does — through the installed `bin`, not
 * through `dist/index.js` (TASK-N2-A4).
 *
 * `node dist/index.js` puts `index.js` in `process.argv[1]`, so it satisfied the
 * name-based guard this script was written against while the path clients
 * actually run — the `node_modules/.bin/dzup-ui-mcp` symlink npm installs, which
 * `npx -y @dzup-ui/mcp` executes — was reporting the file as `dzup-ui-mcp` and
 * exiting without starting. This lane asserted the whole protocol surface and
 * still could not see that the shipped entry point was dead; now it goes through
 * the entry point, so a regression here fails here.
 *
 * The bin name comes from `package.json`, and the symlink is created if the
 * workspace install does not provide one, so the layout is exercised from a bare
 * checkout too. `node <symlink>` rather than executing it directly: argv[1] being
 * the symlink path is the thing under test, and that does not depend on the
 * target's mode bits.
 */
const BIN_NAME = Object.keys(PKG.bin ?? {})[0]
if (BIN_NAME === undefined)
  throw new Error('package.json declares no bin — the published entry point is missing')

const installed = [
  resolve(HERE, '..', 'node_modules', '.bin', BIN_NAME),
  resolve(REPO_ROOT, 'node_modules', '.bin', BIN_NAME),
].find(path => existsSync(path))

let ENTRY = installed
let cleanupEntry = () => {}
if (ENTRY === undefined) {
  const dir = mkdtempSync(join(tmpdir(), 'dzup-ui-mcp-bin-'))
  ENTRY = join(dir, BIN_NAME)
  symlinkSync(SERVER, ENTRY)
  cleanupEntry = () => rmSync(dir, { recursive: true, force: true })
}
console.error(`· entry: ${ENTRY}${installed === undefined ? ' (symlinked for this run)' : ''}`)

const child = spawn('node', [ENTRY], {
  env: { ...process.env, DZUP_UI_REGISTRY_URL: REPO_ROOT },
  stdio: ['pipe', 'pipe', 'inherit'],
})

let buf = ''
const pending = new Map()
child.stdout.on('data', (chunk) => {
  buf += chunk.toString()
  let nl = buf.indexOf('\n')
  while (nl !== -1) {
    const line = buf.slice(0, nl).trim()
    buf = buf.slice(nl + 1)
    nl = buf.indexOf('\n')
    if (!line)
      continue
    const msg = JSON.parse(line)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
})

/**
 * A server that dies instead of answering must FAIL this run, not hang it
 * (TASK-N2-A4). Every `rpc()` here waits for a reply, so a `main()` that never
 * runs — the exact regression this lane now covers — used to leave the script
 * waiting on a closed pipe with no diagnostic. One JSON-RPC line the server
 * cannot answer still proves it is alive, so this records the first reply.
 */
let answered = false
child.on('exit', (code) => {
  if (answered)
    return
  console.error(`✗ the bin entry exited (code ${code}) without answering JSON-RPC — the stdio server did not start`)
  cleanupEntry()
  process.exit(1)
})

let id = 0
function rpc(method, params) {
  const reqId = ++id
  return new Promise((res) => {
    pending.set(reqId, (msg) => {
      answered = true
      res(msg)
    })
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: reqId, method, params })}\n`)
  })
}
function notify(method, params) {
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
}

function assert(cond, label) {
  if (!cond) {
    console.error(`✗ ${label}`)
    answered = true
    cleanupEntry()
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
assert(
  init.result?.serverInfo?.name === 'dzup-ui',
  `initialize → serverInfo.name = dzup-ui (answered through ${BIN_NAME}, the installed entry point)`,
)
assert(
  init.result?.serverInfo?.version === PKG.version,
  `initialize → serverInfo.version = ${init.result?.serverInfo?.version} (package.json says ${PKG.version})`,
)
notify('notifications/initialized', {})

const tools = await rpc('tools/list', {})
const names = (tools.result?.tools ?? []).map(t => t.name).sort()
assert(
  JSON.stringify(names) === JSON.stringify(EXPECTED_TOOLS),
  `tools/list → exactly the ${EXPECTED_TOOLS.length} tools in docs/mcp-tool-surface.json: ${names.join(', ')}`,
)

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

// ── Component metadata (TASK-N2-A2) ─────────────────────────────────────────
//
// These three exercise the generated `component-meta.json` end to end, over real
// JSON-RPC, against the BUILT dist/ — the only lane that does. They also prove
// the artifact is reachable from a local base, which is the same resolution the
// deployed site performs over HTTP.

const meta = await rpc('tools/call', { name: 'get_component_metadata', arguments: { name: 'DzRating' } })
const metaText = meta.result?.content?.[0]?.text ?? ''
// DzRating on purpose: it was one of the 43 symbols `public-api.manifest.json`
// omits (TASK-N2-A1 F-1). A2 routed around the gap with this tool; A3 closed it
// at the source — see the two assertions below.
assert(
  metaText.includes('# DzRating') && metaText.includes('| Prop | Type | Required | Default | Description |'),
  'get_component_metadata(DzRating) → a real prop table',
)

// ── The A1-F1 regression, end to end (TASK-N2-A3) ───────────────────────────
//
// `list_components` and `get_component` answer from `/storybook/llms.txt`.
// While that file was rendered from `public-api.manifest.json`, 43 public
// components — DzRating among them — were invisible to every MCP client. It is
// now rendered from `component-meta.json`, so these two tools see all 144.
// `GovernanceBadge` is the second half of the fix: a public component with no
// `Dz` prefix, present in the document but unparseable until the name pattern
// was widened (TASK-N2-A2 F-5).
const oldTool = await rpc('tools/call', { name: 'get_component', arguments: { name: 'DzRating' } })
const oldText = oldTool.result?.content?.[0]?.text ?? ''
assert(
  oldTool.result?.isError !== true && oldText.includes('### DzRating'),
  'get_component(DzRating) → the 43-symbol blind spot is closed at the source',
)

const allComps = await rpc('tools/call', { name: 'list_components', arguments: {} })
const allText = allComps.result?.content?.[0]?.text ?? ''
assert(
  allText.includes('DzAppShell') && allText.includes('DzCalendar') && allText.includes('GovernanceBadge'),
  'list_components() → reaches the previously-invisible components, Dz-prefixed or not',
)

const found = await rpc('tools/call', { name: 'search_components', arguments: { family: 'buttons' } })
assert(
  (found.result?.content?.[0]?.text ?? '').includes('**DzButton**'),
  'search_components(buttons) → includes DzButton',
)

const example = await rpc('tools/call', { name: 'get_component_example', arguments: { name: 'DzButton' } })
const exampleText = example.result?.content?.[0]?.text ?? ''
assert(
  exampleText.includes('Real Storybook story') && exampleText.includes('export const'),
  'get_component_example(DzButton) → verbatim story source, not synthesised',
)

console.error('\nAll end-to-end MCP checks passed.')
answered = true
cleanupEntry()
child.kill()
process.exit(0)
