/**
 * Generate `packages/mcp/docs/mcp-tool-surface.json` — the evidence artifact for
 * the `@dzup-ui/mcp` public tool surface (TASK-N2-A1).
 *
 * WHY this exists at all. `@dzup-ui/mcp` is a published, AI-facing surface, and
 * README.md §3 `<generated_authority>` says generated artifacts are the truth.
 * Before this file the tool list existed in four hand-typed places — the source,
 * the README table, the smoke script's expectation array and the CHANGELOG — and
 * nothing compared them. This artifact replaces all four with one derived
 * record, and `yarn validate:mcp` fails when the record and the server disagree.
 *
 * HOW it derives, rather than describes:
 *   • the tool list, titles, descriptions and JSON Schemas come from a REAL MCP
 *     `tools/list` round-trip over `InMemoryTransport` against the real
 *     `createServer()` — not from reading `index.ts` and hoping;
 *   • each tool's DATA SOURCE is observed, not declared: every tool is called
 *     through a reader that records the site paths it requests, so a tool that
 *     answers from a hand-written list in its own module shows up as an empty
 *     `dataSource.reads` and fails the gate. That is the check the task asks for
 *     ("no tool answers from a handwritten list") expressed as a measurement;
 *   • spec coverage is scanned out of the spec files by tag, so a tool cannot be
 *     marked covered by adding a row here.
 *
 * WHY fixtures and not the real catalog for the PROBES: a generator that called
 * the tools against real site artifacts would emit a different surface on a
 * machine that had built the apps than on one that had not, and the freshness
 * gate would be noise. See `src/__fixtures__/catalog.ts`.
 *
 * `catalogVisibility` is the one exception, and it is not one: since TASK-N2-A3
 * it reads `packages/core/docs/llms.txt`, which is a COMMITTED generated
 * artifact (`yarn generate:llms`, gated by `yarn validate:llms`) rather than a
 * build output. It is present in every checkout, so the determinism argument
 * above is preserved — and reading the file the tools actually answer from is
 * the entire point of that measurement.
 *
 * Usage:
 *   tsx packages/mcp/scripts/generate-tool-surface.ts            # write
 *   tsx packages/mcp/scripts/generate-tool-surface.ts --check    # fail on drift
 */

import type { RegistryClient as RegistryClientType } from '../src/registry.js'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { FIXTURE_PATHS, recordingFixtureReader } from '../src/__fixtures__/catalog.js'
import { createServer } from '../src/index.js'
import { parseComponentIndex, RegistryClient } from '../src/registry.js'

const HERE = dirname(fileURLToPath(import.meta.url))
export const PKG_ROOT = resolve(HERE, '..')
export const REPO_ROOT = resolve(PKG_ROOT, '../..')
export const SURFACE_PATH = resolve(PKG_ROOT, 'docs/mcp-tool-surface.json')
export const README_PATH = resolve(PKG_ROOT, 'README.md')

/** Schema version of THIS artifact, not of the package. */
export const SURFACE_SCHEMA_VERSION = '1.0.0'

const README_BEGIN = '<!-- tools:generated -->'
const README_END = '<!-- /tools:generated -->'

// ---------------------------------------------------------------------------
// Probe inputs
// ---------------------------------------------------------------------------

/**
 * One call per tool, chosen to exercise the tool's happy path against the
 * fixture catalog.
 *
 * This is the only hand-written table in the generator, and it is INPUT, never
 * an answer: nothing here is copied into the artifact. `validate:mcp` fails when
 * a tool exists on the server with no probe, so adding a tool without saying how
 * to exercise it is a red gate rather than a silently uncovered row.
 */
export const PROBES: Readonly<Record<string, Record<string, unknown>>> = Object.freeze({
  list_components: { family: 'Buttons' },
  get_component: { name: 'DzButton' },
  list_blocks: { query: 'hero' },
  get_block: { name: 'hero-centered' },
  list_templates: {},
  get_template: { name: 'analytics-dashboard' },
  list_tokens: { theme: 'light' },
  get_install_command: { name: 'hero-centered', packageManager: 'pnpm' },
  search: { query: 'hero' },
  search_components: { family: 'buttons' },
  get_component_metadata: { name: 'DzButton' },
  get_component_example: { name: 'DzButton' },
})

/**
 * A second call per tool with a name that cannot resolve, used to observe
 * whether the tool HAS an error path at all. Tools absent from this table are
 * recorded as having no addressable-miss path (a `list_*` cannot 404).
 */
export const MISS_PROBES: Readonly<Record<string, Record<string, unknown>>> = Object.freeze({
  get_component: { name: 'DzDefinitelyNotAComponent' },
  get_block: { name: 'definitely-not-a-block' },
  get_template: { name: 'definitely-not-a-template' },
  get_component_metadata: { name: 'DzDefinitelyNotAComponent' },
  get_component_example: { name: 'DzDefinitelyNotAComponent' },
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CellKind
  = | 'contract-spec'
    | 'unit-spec'
    | 'malformed-input'
    | 'data-source'
    | 'protocol-roundtrip'
    | 'e2e-smoke'

export interface SurfaceCell {
  kind: CellKind
  scope: 'tool' | 'corpus'
  state: 'pass' | 'present' | 'unrun'
  artifacts: string[]
  note?: string
}

export interface SurfaceTool {
  name: string
  title: string
  description: string
  inputSchema: unknown
  required: string[]
  optional: string[]
  dataSource: {
    /** Site paths the tool actually requested during the probe, sorted. */
    reads: string[]
    /**
     * The same paths with the probe's own argument values substituted back out,
     * so an item-addressed read reads as `/r/<name>.json` rather than as the one
     * fixture id that happened to be probed. Derived from `reads`, never typed.
     */
    readPatterns: string[]
    /** `generated-artifact` when it read at least one; `none` when it read nothing. */
    kind: 'generated-artifact' | 'none'
  }
  /** Whether an unresolvable identifier produces an `isError` result. */
  errorsOnUnknown: boolean | null
  cells: SurfaceCell[]
}

export interface ToolSurface {
  schemaVersion: string
  package: string
  version: string
  serverName: string
  /**
   * Repo HEAD at generation time. Provenance only, and EXCLUDED from the
   * freshness diff — see `--check`. Note the repo-wide caveat recorded as N1-F1:
   * an artifact committed in a later commit records that commit's parent.
   */
  sourceCommit: string
  generatedFrom: string[]
  totals: {
    tools: number
    withUnitSpec: number
    withMalformedInputSpec: number
    withProtocolRoundtrip: number
    withE2eSmoke: number
    answeringFromNoDataSource: number
  }
  catalogVisibility: {
    publicComponents: number
    reachable: number
    unreachable: number
    unreachableSymbols: string[]
    note: string
  }
  tools: SurfaceTool[]
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

function repoRelative(abs: string): string {
  return abs.slice(REPO_ROOT.length + 1).replaceAll('\\', '/')
}

/** `git rev-parse HEAD`, or `unknown` outside a checkout. */
function headCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  }
  catch {
    return 'unknown'
  }
}

/** A fresh client per probe: `RegistryClient` caches, so one shared instance would hide reads. */
function probeClient(): { client: RegistryClientType, reads: string[] } {
  const { read, reads } = recordingFixtureReader()
  return { client: new RegistryClient({ base: 'https://fixture.invalid', reader: read }), reads }
}

/**
 * Slice a spec file into top-level `describe('<name>', …)` blocks.
 *
 * Deliberately anchored at column 0: every per-tool block in `tools.spec.ts` is
 * top-level, so the slice is exact rather than a brace-matching approximation.
 */
export function topLevelDescribeBlocks(source: string): Map<string, string> {
  const out = new Map<string, string>()
  const re = /^describe\((['"`])(.+?)\1/gm
  const starts: Array<{ name: string, at: number }> = []
  for (const m of source.matchAll(re)) starts.push({ name: m[2]!, at: m.index! })
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i]!.at
    const to = i + 1 < starts.length ? starts[i + 1]!.at : source.length
    out.set(starts[i]!.name, source.slice(from, to))
  }
  return out
}

/** `it('[malformed] …')` — the tag convention the scanner reads. */
function hasTaggedTest(block: string | undefined, tag: string): boolean {
  if (!block)
    return false
  return new RegExp(`\\bit(?:\\.\\w+)?\\((['"\`])\\[${tag}\\]`).test(block)
}

/**
 * Replace the probe's own argument values inside an observed path with the
 * argument NAME, so `/r/hero-centered.json` is recorded as `/r/<name>.json`.
 *
 * Derived, not declared: the substitution uses the probe arguments that produced
 * the read, so a tool whose path stops depending on its argument stops producing
 * a pattern, and the artifact says so.
 */
export function patternize(reads: string[], args: Record<string, unknown>): string[] {
  const pairs = Object.entries(args)
    .filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0)
    .sort((a, b) => b[1].length - a[1].length)
  return reads
    .map((r) => {
      let out = r
      for (const [key, value] of pairs) out = out.split(value).join(`<${key}>`)
      return out
    })
    .sort()
}

function readIfPresent(abs: string): string {
  return existsSync(abs) ? readFileSync(abs, 'utf8') : ''
}

/**
 * Public components the MCP surface can and cannot see.
 *
 * Derived from two COMMITTED files, and — since TASK-N2-A3 — from the file the
 * tools **actually read**: `packages/core/docs/llms.txt`, parsed with this
 * package's own `parseComponentIndex`. That is the point of the measurement.
 * Until A3 this function intersected the ownership manifest with
 * `public-api.manifest.json` because that was what `build-llms.mjs` consumed;
 * once `yarn generate:llms` began rendering the index from
 * `component-meta.json` instead, the old computation would have kept reporting
 * a 43-symbol blind spot that no longer existed — a ratchet describing an input
 * that is no longer wired to the output it claims to measure.
 *
 * Parsing the index with the shipped parser also makes the number cover the
 * parser's own limits, not just the roster's: a component present in the file
 * but unparseable is exactly as invisible to a client as one that is absent.
 * Both inputs are committed, so the number is the same on CI, on a cold clone
 * and here.
 */
export function catalogVisibility(root = REPO_ROOT): ToolSurface['catalogVisibility'] {
  const own = JSON.parse(
    readFileSync(resolve(root, 'packages/core/manifests/component-ownership.manifest.json'), 'utf8'),
  ) as { entries: Array<{ symbol: string, kind: string }> }

  const indexPath = resolve(root, 'packages/core/docs/llms.txt')
  const exposed = new Set(
    existsSync(indexPath)
      ? parseComponentIndex(readFileSync(indexPath, 'utf8')).map(c => c.name)
      : [],
  )

  const publicComponents = own.entries.filter(e => e.kind === 'public-component').map(e => e.symbol)
  const unreachable = publicComponents.filter(s => !exposed.has(s)).sort()

  return {
    publicComponents: publicComponents.length,
    reachable: publicComponents.length - unreachable.length,
    unreachable: unreachable.length,
    unreachableSymbols: unreachable,
    note:
      'Components classified `public-component` by the ownership manifest that this package\'s '
      + 'own `parseComponentIndex` cannot find in packages/core/docs/llms.txt — the file '
      + '`yarn generate:llms` renders from component-meta.json and apps/storybook copies to '
      + '/storybook/llms.txt, and the file list_components/get_component answer from. Every '
      + 'symbol listed here is invisible to every MCP client. Ratcheted by yarn validate:mcp.',
  }
}

export async function buildSurface(): Promise<ToolSurface> {
  const pkg = JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf8')) as {
    name: string
    version: string
  }

  // ── the real protocol, not a source read ────────────────────────────────
  const listServer = createServer(probeClient().client)
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'generate-tool-surface', version: SURFACE_SCHEMA_VERSION })
  await Promise.all([listServer.connect(serverSide), client.connect(clientSide)])
  const listed = await client.listTools()
  const serverInfo = client.getServerVersion()

  const unitSpecSrc = readIfPresent(resolve(PKG_ROOT, 'src/tools.spec.ts'))
  const contractSpecSrc = readIfPresent(resolve(PKG_ROOT, 'src/tools.contract.spec.ts'))
  const protocolSpecSrc = readIfPresent(resolve(PKG_ROOT, 'src/server.spec.ts'))
  const smokeSrc = readIfPresent(resolve(PKG_ROOT, 'scripts/e2e-smoke.mjs'))
  const unitBlocks = topLevelDescribeBlocks(unitSpecSrc)

  const tools: SurfaceTool[] = []
  for (const t of [...listed.tools].sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const schema = t.inputSchema as { properties?: Record<string, unknown>, required?: string[] }
    const required = [...(schema.required ?? [])].sort()
    const optional = Object.keys(schema.properties ?? {})
      .filter(k => !required.includes(k))
      .sort()

    // ── data-source observation ───────────────────────────────────────────
    const probe = PROBES[t.name]
    let reads: string[] = []
    if (probe) {
      const { client: rc, reads: recorded } = probeClient()
      const one = createServer(rc)
      const [cs, ss] = InMemoryTransport.createLinkedPair()
      const c = new Client({ name: 'probe', version: SURFACE_SCHEMA_VERSION })
      await Promise.all([one.connect(ss), c.connect(cs)])
      await c.callTool({ name: t.name, arguments: probe })
      reads = [...new Set(recorded)].sort()
      await c.close()
      await one.close()
    }

    // ── error path observation ────────────────────────────────────────────
    let errorsOnUnknown: boolean | null = null
    const miss = MISS_PROBES[t.name]
    if (miss) {
      const { client: rc } = probeClient()
      const one = createServer(rc)
      const [cs, ss] = InMemoryTransport.createLinkedPair()
      const c = new Client({ name: 'probe-miss', version: SURFACE_SCHEMA_VERSION })
      await Promise.all([one.connect(ss), c.connect(cs)])
      const res = await c.callTool({ name: t.name, arguments: miss })
      errorsOnUnknown = res.isError === true
      await c.close()
      await one.close()
    }

    const unitBlock = unitBlocks.get(t.name)
    const cells: SurfaceCell[] = [
      {
        kind: 'contract-spec',
        scope: 'corpus',
        state: contractSpecSrc ? 'pass' : 'unrun',
        artifacts: contractSpecSrc ? ['packages/mcp/src/tools.contract.spec.ts'] : [],
        note: 'Corpus gate: the contract suite enumerates the live `tools/list` response, so it covers every registered tool by construction rather than by a per-tool row.',
      },
      {
        kind: 'unit-spec',
        scope: 'tool',
        state: unitBlock ? 'present' : 'unrun',
        artifacts: unitBlock ? ['packages/mcp/src/tools.spec.ts'] : [],
      },
      {
        kind: 'malformed-input',
        scope: 'tool',
        state: hasTaggedTest(unitBlock, 'malformed') ? 'present' : 'unrun',
        artifacts: hasTaggedTest(unitBlock, 'malformed') ? ['packages/mcp/src/tools.spec.ts'] : [],
      },
      {
        kind: 'data-source',
        scope: 'tool',
        state: reads.length ? 'pass' : 'unrun',
        artifacts: reads,
        note: reads.length
          ? undefined
          : 'Observed reading no catalog artifact — the answer is computed in-process. Verify it is not a hand-written list.',
      },
      {
        kind: 'protocol-roundtrip',
        scope: 'tool',
        state: protocolSpecSrc.includes(`'${t.name}'`) ? 'present' : 'unrun',
        artifacts: protocolSpecSrc.includes(`'${t.name}'`) ? ['packages/mcp/src/server.spec.ts'] : [],
      },
      {
        // `name: '<tool>'` — an actual tools/call, not a mention. The smoke
        // script also asserts the full tool LIST, and scanning for the bare name
        // would have marked every tool covered by that one assertion.
        kind: 'e2e-smoke',
        scope: 'tool',
        state: smokeSrc.includes(`name: '${t.name}'`) ? 'present' : 'unrun',
        artifacts: smokeSrc.includes(`name: '${t.name}'`)
          ? ['packages/mcp/scripts/e2e-smoke.mjs']
          : [],
        note: smokeSrc.includes(`name: '${t.name}'`)
          ? undefined
          : 'Named in the smoke script\'s tools/list assertion but never called against the built dist/.',
      },
    ]

    tools.push({
      name: t.name,
      title: t.title ?? '',
      description: t.description ?? '',
      inputSchema: t.inputSchema,
      required,
      optional,
      dataSource: {
        reads,
        readPatterns: patternize(reads, probe ?? {}),
        kind: reads.length ? 'generated-artifact' : 'none',
      },
      errorsOnUnknown,
      cells,
    })
  }

  await client.close()
  await listServer.close()

  const cell = (t: SurfaceTool, k: CellKind) => t.cells.find(c => c.kind === k)!

  return {
    schemaVersion: SURFACE_SCHEMA_VERSION,
    package: pkg.name,
    version: serverInfo?.version ?? pkg.version,
    serverName: String(serverInfo?.name ?? ''),
    sourceCommit: headCommit(),
    generatedFrom: [
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/core/manifests/public-api.manifest.json',
      'packages/mcp/package.json',
      'packages/mcp/scripts/e2e-smoke.mjs',
      'packages/mcp/src/__fixtures__/catalog.ts',
      'packages/mcp/src/index.ts (live tools/list over InMemoryTransport)',
      'packages/mcp/src/server.spec.ts',
      'packages/mcp/src/tools.contract.spec.ts',
      'packages/mcp/src/tools.spec.ts',
    ],
    totals: {
      tools: tools.length,
      withUnitSpec: tools.filter(t => cell(t, 'unit-spec').state !== 'unrun').length,
      withMalformedInputSpec: tools.filter(t => cell(t, 'malformed-input').state !== 'unrun').length,
      withProtocolRoundtrip: tools.filter(t => cell(t, 'protocol-roundtrip').state !== 'unrun').length,
      withE2eSmoke: tools.filter(t => cell(t, 'e2e-smoke').state !== 'unrun').length,
      answeringFromNoDataSource: tools.filter(t => t.dataSource.kind === 'none').length,
    },
    catalogVisibility: catalogVisibility(),
    tools,
  }
}

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

export function serializeSurface(s: ToolSurface): string {
  return `${JSON.stringify(s, null, 2)}\n`
}

/** The README table, rendered from the derived tools. */
export function renderReadmeTable(s: ToolSurface): string {
  const rows = s.tools.map((t) => {
    const args = [
      ...t.required.map(r => `\`${r}\`*`),
      ...t.optional.map(o => `\`${o}\``),
    ]
    const src = t.dataSource.readPatterns.length
      ? t.dataSource.readPatterns.map(r => `\`${r}\``).join(' ')
      : '—'
    return `| \`${t.name}\` | ${t.description.replace(/\|/g, '\\|')} | ${args.join(' ') || '—'} | ${src} |`
  })
  return [
    README_BEGIN,
    `<!-- Generated by \`yarn generate:mcp-surface\` from a live tools/list round-trip. Do not edit by hand. -->`,
    '',
    `**${s.tools.length} tools** · server \`${s.serverName}\` v\`${s.version}\``,
    '',
    '| Tool | What it does | Arguments (`*` = required) | Reads |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    README_END,
  ].join('\n')
}

export function spliceReadme(readme: string, table: string): string {
  const start = readme.indexOf(README_BEGIN)
  const end = readme.indexOf(README_END)
  if (start === -1 || end === -1) {
    throw new Error(
      `packages/mcp/README.md is missing the ${README_BEGIN} … ${README_END} markers; `
      + 'the generated tool table cannot be placed.',
    )
  }
  return readme.slice(0, start) + table + readme.slice(end + README_END.length)
}

/** Everything except the provenance stamp, which every unrelated commit would move. */
function comparable(json: string): string {
  const parsed = JSON.parse(json) as ToolSurface
  return serializeSurface({ ...parsed, sourceCommit: 'excluded-from-diff' })
}

async function main(): Promise<void> {
  const check = process.argv.includes('--check')
  const surface = await buildSurface()
  const json = serializeSurface(surface)
  const readme = spliceReadme(readFileSync(README_PATH, 'utf8'), renderReadmeTable(surface))

  if (!check) {
    writeFileSync(SURFACE_PATH, json, 'utf8')
    writeFileSync(README_PATH, readme, 'utf8')
    console.error(
      `[mcp-surface] wrote ${surface.tools.length} tools → ${repoRelative(SURFACE_PATH)} `
      + `(+ the generated table in ${repoRelative(README_PATH)})`,
    )
    return
  }

  const problems: string[] = []
  if (!existsSync(SURFACE_PATH)) {
    problems.push(`${repoRelative(SURFACE_PATH)} does not exist — run \`yarn generate:mcp-surface\`.`)
  }
  else if (comparable(readFileSync(SURFACE_PATH, 'utf8')) !== comparable(json)) {
    problems.push(
      `${repoRelative(SURFACE_PATH)} is STALE — it disagrees with a live tools/list round-trip. `
      + 'Run `yarn generate:mcp-surface`.',
    )
  }
  if (readFileSync(README_PATH, 'utf8') !== readme) {
    problems.push(
      `${repoRelative(README_PATH)}'s generated tool table is STALE. Run \`yarn generate:mcp-surface\`.`,
    )
  }
  // Every fixture path must be reachable; an orphan fixture means a tool stopped
  // reading something and nobody noticed.
  const readAll = new Set(surface.tools.flatMap(t => t.dataSource.reads))
  const orphans = FIXTURE_PATHS.filter(p => !readAll.has(p))
  if (orphans.length)
    console.error(`[mcp-surface] note: fixture paths no probe reads: ${orphans.join(', ')}`)

  if (problems.length) {
    console.error('[mcp-surface] FAIL')
    for (const p of problems) console.error(`  • ${p}`)
    process.exit(1)
  }
  console.error(
    `[mcp-surface] fresh — ${surface.tools.length} tools, `
    + `${surface.totals.answeringFromNoDataSource} answering from no data source.`,
  )
}

const invokedDirectly = process.argv[1]
  && /generate-tool-surface\.(?:ts|js)$/.test(process.argv[1].replaceAll('\\', '/'))
if (invokedDirectly) {
  main().catch((err) => {
    console.error('[mcp-surface] generator failed:', err)
    process.exit(1)
  })
}
