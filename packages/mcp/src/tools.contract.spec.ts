/**
 * Contract Spec for the `@dzup-ui/mcp` tool surface (TASK-N2-A1).
 *
 * The repo's component Contract Specs assert the properties that hold for EVERY
 * component of a family rather than the behaviour of one. This is the same
 * instrument for a tool surface: every clause below is asserted against the live
 * `tools/list` response of the real server, so a tool added tomorrow is covered
 * the moment it is registered, and a tool that violates a clause fails here
 * rather than in whatever client happens to call it.
 *
 * That is why `docs/mcp-tool-surface.json` records the `contract-spec` cell with
 * `scope: "corpus"` — the same shape the capability matrix already uses for
 * `token-contrast`, a gate that covers the whole catalog in one pass.
 *
 * Clauses:
 *   C1  identity      — every tool has a name, a title and a description.
 *   C2  input schema  — draft-07 object schema, no `additionalProperties`,
 *                       every property described.
 *   C3  validation    — a wrong-typed argument is REJECTED at the protocol
 *                       boundary, as an MCP error, not passed through.
 *   C4  output shape  — a successful call returns exactly one text content block.
 *   C5  error shape   — an addressable miss returns `isError: true` and text, not
 *                       a thrown protocol error.
 *   C6  data source   — every tool reads at least one generated catalog artifact.
 *   C7  no mutation   — nothing in the surface names a write.
 *   C8  coverage      — every registered tool has a behaviour block in
 *                       `tools.spec.ts` and an entry in the generator's probe
 *                       table, so the surface cannot grow uncovered.
 */

import type { RegistryClient as RegistryClientType } from './registry.js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'
import { MISS_PROBES, PROBES, topLevelDescribeBlocks } from '../scripts/generate-tool-surface.js'
import { FIXTURE_FILES, recordingFixtureReader } from './__fixtures__/catalog.js'
import { createServer } from './index.js'
import { RegistryClient } from './registry.js'

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function fixtureClient(): { client: RegistryClientType, reads: string[] } {
  const { read, reads } = recordingFixtureReader()
  return { client: new RegistryClient({ base: 'https://dzup-ui.com', reader: read }), reads }
}

/** Connect a real client to a real server over the SDK's in-memory transport. */
async function connected(client = fixtureClient().client) {
  const server = createServer(client)
  const [a, b] = InMemoryTransport.createLinkedPair()
  const c = new Client({ name: 'contract-spec', version: '1.0.0' })
  await Promise.all([server.connect(b), c.connect(a)])
  const close = async (): Promise<void> => {
    await c.close()
    await server.close()
  }
  return { c, close }
}

interface ListedTool {
  name: string
  title?: string
  description?: string
  inputSchema: {
    type?: string
    $schema?: string
    properties?: Record<string, { type?: string, description?: string, enum?: string[] }>
    required?: string[]
    additionalProperties?: boolean
  }
}

let tools: ListedTool[] = []

beforeAll(async () => {
  const { c, close } = await connected()
  tools = (await c.listTools()).tools as unknown as ListedTool[]
  await close()
})

describe('mcp tool surface — contract', () => {
  it('exposes a non-empty tool surface over a real tools/list round-trip', () => {
    expect(tools.length).toBeGreaterThan(0)
    expect(new Set(tools.map(t => t.name)).size).toBe(tools.length)
  })

  it('clause C1 · every tool has a name, a title and a description', () => {
    for (const t of tools) {
      expect(t.name, 'name').toMatch(/^[a-z][a-z0-9_]*$/)
      expect(t.title ?? '', `${t.name}.title`).not.toBe('')
      expect((t.description ?? '').length, `${t.name}.description`).toBeGreaterThan(20)
    }
  })

  it('clause C2 · every input schema is a closed draft-07 object with described properties', () => {
    for (const t of tools) {
      const s = t.inputSchema
      expect(s.type, t.name).toBe('object')
      expect(s.$schema, t.name).toBe('http://json-schema.org/draft-07/schema#')
      expect(s.additionalProperties, `${t.name} must not accept unknown arguments`).toBe(false)
      for (const [prop, def] of Object.entries(s.properties ?? {})) {
        expect(def.type, `${t.name}.${prop}.type`).toBeTruthy()
        expect((def.description ?? '').length, `${t.name}.${prop}.description`).toBeGreaterThan(5)
      }
    }
  })

  it('clause C3 · a wrong-typed argument is rejected at the protocol boundary', async () => {
    const { c, close } = await connected()
    try {
      for (const t of tools) {
        const props = Object.entries(t.inputSchema.properties ?? {})
        if (!props.length)
          continue
        const [prop] = props[0]!
        const res = await c.callTool({ name: t.name, arguments: { [prop]: 12345 } })
        expect(res.isError, `${t.name}.${prop} accepted a number`).toBe(true)
        expect(JSON.stringify(res.content)).toMatch(/-32602|validation/i)
      }
    }
    finally {
      await close()
    }
  })

  it('clause C3 · an unknown argument is rejected rather than ignored', async () => {
    const { c, close } = await connected()
    try {
      for (const t of tools) {
        const args = { ...(PROBES[t.name] ?? {}), notARealArgument: 'x' }
        const res = await c.callTool({ name: t.name, arguments: args })
        expect(res.isError, `${t.name} accepted an unknown argument`).toBe(true)
      }
    }
    finally {
      await close()
    }
  })

  it('clause C4 · a successful call returns exactly one text content block', async () => {
    const { c, close } = await connected()
    try {
      for (const t of tools) {
        const res = await c.callTool({ name: t.name, arguments: PROBES[t.name]! })
        expect(res.isError, `${t.name} probe failed: ${JSON.stringify(res.content)}`).toBeFalsy()
        const content = res.content as Array<{ type: string, text?: string }>
        expect(content, t.name).toHaveLength(1)
        expect(content[0]!.type, t.name).toBe('text')
        expect((content[0]!.text ?? '').length, t.name).toBeGreaterThan(0)
      }
    }
    finally {
      await close()
    }
  })

  it('clause C5 · an addressable miss is an isError result, not a thrown protocol error', async () => {
    const { c, close } = await connected()
    try {
      for (const [name, args] of Object.entries(MISS_PROBES)) {
        const res = await c.callTool({ name, arguments: args })
        expect(res.isError, `${name} should report a miss as isError`).toBe(true)
        const content = res.content as Array<{ type: string, text?: string }>
        expect(content[0]!.type).toBe('text')
        expect(content[0]!.text).toMatch(/not found|not in the dzup-ui registry/i)
      }
    }
    finally {
      await close()
    }
  })

  it('clause C6 · every tool answers from a generated catalog artifact, none from a list in this package', async () => {
    const noSource: string[] = []
    for (const t of tools) {
      const { client, reads } = fixtureClient()
      const server = createServer(client)
      const [a, b] = InMemoryTransport.createLinkedPair()
      const c = new Client({ name: 'data-source', version: '1.0.0' })
      await Promise.all([server.connect(b), c.connect(a)])
      await c.callTool({ name: t.name, arguments: PROBES[t.name]! })
      if (!reads.length)
        noSource.push(t.name)
      else
        expect(reads.every(p => p in FIXTURE_FILES), `${t.name} read an unknown site path`).toBe(true)
      await c.close()
      await server.close()
    }
    expect(noSource, 'tools answering without reading the catalog').toEqual([])
  })

  it('clause C7 · the surface is read-only — no tool name or description offers a write', () => {
    const writeVerbs = /\b(?:create|update|delete|remove|write|publish|installs? into|mutate|set)\b/i
    for (const t of tools) {
      expect(t.name, `${t.name} names a mutation`).not.toMatch(/^(?:create|update|delete|write|set|add)_/)
      // `get_install_command` legitimately talks about installing; it PRINTS a
      // command, it never runs one. The clause is about this server's own verbs.
      if (t.name !== 'get_install_command')
        expect(writeVerbs.test(t.title ?? ''), `${t.name}.title: ${t.title}`).toBe(false)
    }
  })

  it('clause C8 · every registered tool has a behaviour block and a generator probe', () => {
    const blocks = topLevelDescribeBlocks(readFileSync(resolve(PKG_ROOT, 'src/tools.spec.ts'), 'utf8'))
    const missingBlock = tools.filter(t => !blocks.has(t.name)).map(t => t.name)
    const missingProbe = tools.filter(t => !(t.name in PROBES)).map(t => t.name)
    expect(missingBlock, 'tools with no describe() block in tools.spec.ts').toEqual([])
    expect(missingProbe, 'tools with no probe in generate-tool-surface.ts').toEqual([])
  })

  it('clause C8 · every behaviour block and probe names a tool that is actually registered', () => {
    const names = new Set(tools.map(t => t.name))
    const blocks = topLevelDescribeBlocks(readFileSync(resolve(PKG_ROOT, 'src/tools.spec.ts'), 'utf8'))
    expect([...blocks.keys()].filter(n => !names.has(n)), 'orphan describe blocks').toEqual([])
    expect(Object.keys(PROBES).filter(n => !names.has(n)), 'orphan probes').toEqual([])
    expect(Object.keys(MISS_PROBES).filter(n => !names.has(n)), 'orphan miss-probes').toEqual([])
  })

  it('reports the version it reads from package.json, not a literal', async () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf8')) as { version: string }
    const { c, close } = await connected()
    try {
      expect(c.getServerVersion()).toMatchObject({ name: 'dzup-ui', version: pkg.version })
    }
    finally {
      await close()
    }
  })
})
