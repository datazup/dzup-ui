/**
 * Protocol-level specs: the server driven the way a real client drives it
 * (TASK-N2-A1).
 *
 * `tools.spec.ts` calls the exported functions; this file goes through
 * `initialize` → `tools/list` → `tools/call` over the SDK's in-memory transport,
 * so it covers the wiring in `index.ts` that unit tests cannot reach — the zod
 * input schemas, the `guard()` wrapper, the `content` envelope and the values in
 * `serverInfo`. `scripts/e2e-smoke.mjs` does the same over a real spawned
 * process against `dist/`; that is a build-artifact check and stays a separate,
 * manual lane.
 *
 * Tool names appear here as literals on purpose:
 * `scripts/generate-tool-surface.ts` records a `protocol-roundtrip` cell per
 * tool by looking for its name in this file, so a tool that is not exercised
 * here is `unrun` in the surface artifact rather than quietly assumed covered.
 */

import type { RegistryClient as RegistryClientType } from './registry.js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { describe, expect, it } from 'vitest'
import { FIXTURE_FILES } from './__fixtures__/catalog.js'
import { createServer, registerTools, VERSION } from './index.js'
import { RegistryClient } from './registry.js'

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function fixtureClient(): RegistryClientType {
  return new RegistryClient({
    base: 'https://dzup-ui.com',
    reader: async (p) => {
      const hit = FIXTURE_FILES[p]
      if (hit === undefined)
        throw new Error(`fixture 404: ${p}`)
      return hit
    },
  })
}

async function connect(client: RegistryClientType = fixtureClient()) {
  const server = createServer(client)
  const [a, b] = InMemoryTransport.createLinkedPair()
  const c = new Client({ name: 'server-spec', version: '1.0.0' })
  await Promise.all([server.connect(b), c.connect(a)])
  const close = async (): Promise<void> => {
    await c.close()
    await server.close()
  }
  return { c, close }
}

async function callText(name: string, args: Record<string, unknown>): Promise<{ text: string, isError: boolean }> {
  const { c, close } = await connect()
  try {
    const res = await c.callTool({ name, arguments: args })
    const content = res.content as Array<{ type: string, text?: string }>
    return { text: content[0]?.text ?? '', isError: res.isError === true }
  }
  finally {
    await close()
  }
}

/**
 * One protocol round-trip per registered tool, with the substring that proves
 * the CALL reached the real implementation rather than an empty envelope.
 */
const ROUND_TRIPS: Array<[name: string, args: Record<string, unknown>, expected: RegExp]> = [
  ['list_components', { family: 'Buttons' }, /\*\*DzButton\*\*/],
  ['get_component', { name: 'DzButton' }, /### DzButton/],
  ['list_blocks', { query: 'hero' }, /\*\*hero-centered\*\*/],
  ['get_block', { name: 'hero-centered' }, /shadcn@latest add https:\/\/dzup-ui\.com\/r\/hero-centered\.json/],
  ['list_templates', {}, /\*\*analytics-dashboard\*\*/],
  ['get_template', { name: 'analytics-dashboard' }, /\/r\/templates\/analytics-dashboard\.json/],
  ['list_tokens', { theme: 'light' }, /\| `--dz-radius-sm` \|/],
  ['get_install_command', { name: 'hero-centered', packageManager: 'bun' }, /bunx shadcn@latest add/],
  ['search', { query: 'hero' }, /# Search "hero"/],
  ['search_components', { family: 'buttons' }, /\*\*DzButton\*\*/],
  ['get_component_metadata', { name: 'DzButton' }, /\| Prop \| Type \| Required \| Default \| Description \|/],
  ['get_component_example', { name: 'DzButton' }, /Real Storybook story `Default`/],
]

describe('mcp server over a real client', () => {
  it('reports its identity and instructions on initialize', async () => {
    const { c, close } = await connect()
    try {
      expect(c.getServerVersion()).toMatchObject({ name: 'dzup-ui' })
      expect(c.getInstructions()).toMatch(/search_components \/ get_component_metadata/)
    }
    finally {
      await close()
    }
  })

  it('reports the version from package.json, which is what a client displays', async () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf8')) as { version: string }
    expect(VERSION).toBe(pkg.version)
    const { c, close } = await connect()
    try {
      expect(c.getServerVersion()?.version).toBe(pkg.version)
    }
    finally {
      await close()
    }
  })

  it('lists every tool the package advertises', async () => {
    const { c, close } = await connect()
    try {
      const names = (await c.listTools()).tools.map(t => t.name).sort()
      expect(names).toEqual([
        'get_block',
        'get_component',
        'get_component_example',
        'get_component_metadata',
        'get_install_command',
        'get_template',
        'list_blocks',
        'list_components',
        'list_templates',
        'list_tokens',
        'search',
        'search_components',
      ])
    }
    finally {
      await close()
    }
  })

  it.each(ROUND_TRIPS)('%s round-trips through the protocol', async (name, args, expected) => {
    const out = await callText(name, args)
    expect(out.isError, `${name}: ${out.text.slice(0, 200)}`).toBe(false)
    expect(out.text).toMatch(expected)
  })

  it('rejects a malformed argument with an MCP validation error', async () => {
    const out = await callText('get_block', { name: 'Not An Id' })
    expect(out.isError).toBe(true)
    expect(out.text).toMatch(/-32602|validation/i)
  })

  it('rejects an over-long free-text argument', async () => {
    const out = await callText('search', { query: 'x'.repeat(5000) })
    expect(out.isError).toBe(true)
  })

  it('reports an unknown tool as an error result rather than crashing the session', async () => {
    const out = await callText('not_a_tool', {})
    expect(out.isError).toBe(true)
    expect(out.text).toMatch(/not found/i)
  })

  it('turns a registry transport failure into an isError result naming the origin', async () => {
    const broken = new RegistryClient({
      base: 'https://preview.example',
      reader: async () => {
        throw new Error('ENOTFOUND')
      },
    })
    const server = createServer(broken)
    const [a, b] = InMemoryTransport.createLinkedPair()
    const c = new Client({ name: 'server-spec-broken', version: '1.0.0' })
    await Promise.all([server.connect(b), c.connect(a)])
    const res = await c.callTool({ name: 'list_blocks', arguments: {} })
    const content = res.content as Array<{ text?: string }>
    expect(res.isError).toBe(true)
    expect(content[0]?.text).toContain('Failed to reach the dzup-ui registry (https://preview.example)')
    expect(content[0]?.text).toContain('ENOTFOUND')
    await c.close()
    await server.close()
  })

  it('registerTools is usable on a caller-supplied server — the exported wiring path', async () => {
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js')
    const server = new McpServer({ name: 'host-app', version: '9.9.9' })
    registerTools(server, fixtureClient())
    const [a, b] = InMemoryTransport.createLinkedPair()
    const c = new Client({ name: 'embedder', version: '1.0.0' })
    await Promise.all([server.connect(b), c.connect(a)])
    expect((await c.listTools()).tools).toHaveLength(12)
    await c.close()
    await server.close()
  })
})
