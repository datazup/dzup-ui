/**
 * `@dzup-ui/mcp` public-surface validator (TASK-N2-A1).
 *
 * `@dzup-ui/mcp` is a PUBLISHED package with an MCP-registry manifest, a `bin`,
 * and an audience of AI coding tools. Before this gate it shipped outside every
 * governance mechanism in the repo: its only test file was named `*.test.ts`
 * where the root vitest config includes `*.spec.ts`, so it ran in no lane;
 * `.github/workflows/` contains no occurrence of `mcp`; and its tool list lived
 * in four hand-typed places that nothing compared. This validator is the
 * missing comparison.
 *
 * It deliberately does NOT import the package. `packages/tooling` is declared
 * with no allowed `@dzup-ui/*` dependencies (`validators/import-boundary.ts`),
 * and the mcp sources use NodeNext `.js` specifiers that the rest of tooling
 * does not. Freshness is delegated to the package's own generator in `--check`
 * mode, run as a child process; every other clause is an INDEPENDENT read of
 * files on disk, in the same spirit as the DTCG round-trip gate carrying its own
 * reader.
 *
 * Clauses
 *   A. freshness      — `docs/mcp-tool-surface.json` and the generated README
 *                       table agree with a live `tools/list` round-trip.
 *   B. version        — package.json / server.json (x2) / CHANGELOG / the
 *                       artifact all name the same version.
 *   C. registry facts — server.json identifies the package it ships, points at
 *                       the repository package.json points at, and documents the
 *                       env-var default the source actually uses.
 *   D. evidence       — every tool has a unit spec, a `[malformed]` case, a
 *                       contract clause and an observed data source.
 *   E. packaging      — `files` ships every artifact the manifests reference.
 *   F. ratchets       — catalog visibility and e2e-smoke coverage, downward only.
 *
 * Usage: tsx packages/tooling/src/validators/mcp-surface.ts
 * Exit 1 on any error. Warnings are printed and do not fail.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
export const PKG_DIR = resolve(ROOT, 'packages/mcp')
export const CEILINGS_PATH = resolve(
  ROOT,
  'packages/tooling/src/validators/mcp-surface-ceilings.json',
)

export interface Ceilings {
  catalogVisibilityUnreachable: { ceiling: number }
  toolsWithoutE2eSmoke: { ceiling: number }
}

export interface SurfaceCellLike {
  kind: string
  state: string
}

export interface SurfaceToolLike {
  name: string
  dataSource: { kind: string, reads: string[] }
  cells: SurfaceCellLike[]
}

export interface SurfaceLike {
  version: string
  serverName: string
  totals: Record<string, number>
  catalogVisibility: { unreachable: number, unreachableSymbols: string[] }
  tools: SurfaceToolLike[]
}

export interface Report {
  errors: string[]
  warnings: string[]
  notes: string[]
}

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8')
}

function json<T>(rel: string): T {
  return JSON.parse(read(rel)) as T
}

// ---------------------------------------------------------------------------
// B. version coherence
// ---------------------------------------------------------------------------

/** The first `## <semver>` heading in a Changesets CHANGELOG. */
export function latestChangelogVersion(changelog: string): string | null {
  const m = /^##\s+(\d+\.\d+\.\d+(?:-[\w.]+)?)\s*$/m.exec(changelog)
  return m ? m[1]! : null
}

export function checkVersions(
  pkg: { version: string },
  server: { version?: string, packages?: Array<{ version?: string, identifier?: string }> },
  changelog: string,
  surface: SurfaceLike,
  r: Report,
): void {
  const expected = pkg.version
  const claims: Array<[where: string, value: string | undefined]> = [
    ['packages/mcp/server.json#version', server.version],
    ['packages/mcp/server.json#packages[0].version', server.packages?.[0]?.version],
    ['packages/mcp/docs/mcp-tool-surface.json#version (what the server reports over MCP)', surface.version],
  ]
  for (const [where, value] of claims) {
    if (value !== expected) {
      r.errors.push(
        `${where} says ${JSON.stringify(value)} but packages/mcp/package.json says "${expected}". `
        + 'Every client that connects reads one of these; they must be the same number.',
      )
    }
  }
  const cl = latestChangelogVersion(changelog)
  if (cl !== expected) {
    r.errors.push(
      `packages/mcp/CHANGELOG.md's newest release heading is ${JSON.stringify(cl)} but `
      + `package.json is "${expected}".`,
    )
  }
}

// ---------------------------------------------------------------------------
// C. MCP-registry manifest facts
// ---------------------------------------------------------------------------

export function checkRegistryManifest(
  pkg: {
    name: string
    homepage?: string
    repository?: { url?: string }
    files?: string[]
    bin?: Record<string, string>
    exports?: Record<string, unknown>
  },
  server: {
    name?: string
    repository?: { url?: string, subfolder?: string }
    packages?: Array<{
      identifier?: string
      registryType?: string
      transport?: { type?: string }
      environmentVariables?: Array<{ name?: string, default?: string }>
    }>
  },
  registrySource: string,
  publishing: string,
  r: Report,
): void {
  const entry = server.packages?.[0]
  if (entry?.identifier !== pkg.name) {
    r.errors.push(
      `server.json packages[0].identifier is ${JSON.stringify(entry?.identifier)} but the package is "${pkg.name}". `
      + 'The MCP registry entry would point clients at a different npm package.',
    )
  }
  if (server.repository?.url && pkg.repository?.url) {
    const norm = (u: string) => u.replace(/^git\+/, '').replace(/\.git$/, '').replace(/\/+$/, '')
    if (norm(server.repository.url) !== norm(pkg.repository.url)) {
      r.errors.push(
        `server.json repository.url (${server.repository.url}) and package.json repository.url `
        + `(${pkg.repository.url}) name different repositories.`,
      )
    }
  }

  // The env-var default advertised to the registry must be the default the
  // source actually uses — the one fact in server.json a reader cannot check.
  const declared = entry?.environmentVariables?.find(v => v.name === 'DZUP_UI_REGISTRY_URL')?.default
  const inSource = /export const DEFAULT_REGISTRY_URL\s*=\s*'([^']+)'/.exec(registrySource)?.[1]
  if (!inSource) {
    r.errors.push('Could not find DEFAULT_REGISTRY_URL in packages/mcp/src/registry.ts.')
  }
  else if (declared !== inSource) {
    r.errors.push(
      `server.json advertises DZUP_UI_REGISTRY_URL default ${JSON.stringify(declared)} but `
      + `src/registry.ts uses "${inSource}".`,
    )
  }
  if (pkg.homepage && inSource && pkg.homepage.replace(/\/+$/, '') !== inSource.replace(/\/+$/, '')) {
    r.warnings.push(
      `package.json homepage (${pkg.homepage}) and DEFAULT_REGISTRY_URL (${inSource}) differ. `
      + 'The server reads its catalog from the latter.',
    )
  }

  // PUBLISHING.md tells a human what to put in server.json; if it names a value
  // server.json no longer holds, it is instructions for a file that moved on.
  if (server.name && !publishing.includes(server.name)) {
    r.errors.push(
      `packages/mcp/PUBLISHING.md never mentions the namespace server.json actually declares `
      + `(${server.name}). It documents a value the manifest no longer uses.`,
    )
  }
}

// ---------------------------------------------------------------------------
// D. per-tool evidence
// ---------------------------------------------------------------------------

/** Cells a tool may not be missing. `protocol-roundtrip` and `e2e-smoke` are ratcheted, not required. */
export const REQUIRED_CELLS = ['contract-spec', 'unit-spec', 'malformed-input', 'data-source'] as const

export function checkEvidence(surface: SurfaceLike, r: Report): void {
  if (!surface.tools.length)
    r.errors.push('The surface artifact lists no tools at all.')

  for (const t of surface.tools) {
    for (const kind of REQUIRED_CELLS) {
      const cell = t.cells.find(c => c.kind === kind)
      if (!cell) {
        r.errors.push(`${t.name}: the artifact has no \`${kind}\` cell.`)
        continue
      }
      if (cell.state === 'unrun') {
        const remedy = kind === 'malformed-input'
          ? 'Add an `it(\'[malformed] …\')` case inside its describe block in packages/mcp/src/tools.spec.ts.'
          : kind === 'unit-spec'
            ? `Add a top-level \`describe('${t.name}', …)\` block in packages/mcp/src/tools.spec.ts.`
            : 'See packages/mcp/scripts/generate-tool-surface.ts for how this cell is derived.'
        r.errors.push(`${t.name}: \`${kind}\` is unrun. ${remedy}`)
      }
    }
    if (t.dataSource.kind !== 'generated-artifact') {
      r.errors.push(
        `${t.name} answered without reading a single generated catalog artifact. `
        + 'A tool that answers from a list inside this package is a second source of truth.',
      )
    }
  }
}

// ---------------------------------------------------------------------------
// E. packaging
// ---------------------------------------------------------------------------

export function checkPackaging(
  pkg: { files?: string[], bin?: Record<string, string>, exports?: Record<string, unknown> },
  r: Report,
  readme?: string,
): void {
  const files = pkg.files ?? []
  const shipped = (p: string) => files.some(f => p === f || p.startsWith(`${f}/`) || p.startsWith(`./${f}`))

  // A README link is the first thing a reader of the npm page clicks. One that
  // points inside the package at a path `files` does not ship is a 404 that only
  // exists in the published artifact, which is exactly where nobody looks.
  if (readme !== undefined) {
    for (const m of readme.matchAll(/\]\((\.\.?\/[^)#\s]+)/g)) {
      const target = m[1]!
      if (target.startsWith('../')) {
        r.warnings.push(
          `README.md links to ${target}, which is outside the package — it 404s on the npm page.`,
        )
        continue
      }
      const rel = target.replace(/^\.\//, '')
      if (!existsSync(resolve(PKG_DIR, rel)))
        r.errors.push(`README.md links to ${target}, which does not exist.`)
      else if (!shipped(rel))
        r.errors.push(`README.md links to ${target}, which package.json \`files\` does not ship.`)
    }
  }

  for (const [name, target] of Object.entries(pkg.bin ?? {})) {
    const rel = target.replace(/^\.\//, '')
    if (!shipped(rel))
      r.errors.push(`bin "${name}" points at ${target}, which package.json \`files\` does not ship.`)
  }
  if (!files.includes('server.json'))
    r.errors.push('package.json `files` does not ship server.json, which PUBLISHING.md treats as part of the release.')

  // dist modules that are built and shipped but unreachable through `exports`.
  const declared = new Set(
    Object.values(pkg.exports ?? {}).flatMap((v) => {
      if (typeof v === 'string')
        return [v]
      return Object.values(v as Record<string, string>)
    }),
  )
  const distDir = resolve(PKG_DIR, 'dist')
  if (existsSync(distDir)) {
    const built = ['index.js', 'registry.js', 'tools.js'].filter(f => existsSync(resolve(distDir, f)))
    const unreachable = built.filter(f => !declared.has(`./dist/${f}`))
    if (unreachable.length) {
      r.notes.push(
        `dist modules shipped but not reachable through the \`exports\` map: ${unreachable.join(', ')}. `
        + 'Encapsulated by Node, so this is dead weight in the tarball rather than an accidental API.',
      )
    }
  }
  else {
    r.notes.push('packages/mcp/dist is absent — packaging checks that need it were skipped (run `yarn build`).')
  }
}

// ---------------------------------------------------------------------------
// F. ratchets
// ---------------------------------------------------------------------------

export function checkRatchets(surface: SurfaceLike, ceilings: Ceilings, r: Report): void {
  const vis = surface.catalogVisibility.unreachable
  const visCeil = ceilings.catalogVisibilityUnreachable.ceiling
  if (vis > visCeil) {
    r.errors.push(
      `${vis} public components are unreachable through this MCP server, above the ceiling of ${visCeil}. `
      + `New: ${surface.catalogVisibility.unreachableSymbols.slice(0, 10).join(', ')}…`,
    )
  }
  else if (vis < visCeil) {
    r.errors.push(
      `Unreachable public components fell to ${vis} (ceiling ${visCeil}). `
      + `Lower \`catalogVisibilityUnreachable.ceiling\` in ${'packages/tooling/src/validators/mcp-surface-ceilings.json'} to ${vis}.`,
    )
  }

  const noSmoke = surface.tools.filter(
    t => t.cells.find(c => c.kind === 'e2e-smoke')?.state === 'unrun',
  ).length
  const smokeCeil = ceilings.toolsWithoutE2eSmoke.ceiling
  if (noSmoke > smokeCeil) {
    r.errors.push(
      `${noSmoke} tools are never called by scripts/e2e-smoke.mjs, above the ceiling of ${smokeCeil}.`,
    )
  }
  else if (noSmoke < smokeCeil) {
    r.errors.push(
      `Tools with no e2e-smoke call fell to ${noSmoke} (ceiling ${smokeCeil}). Lower the ceiling.`,
    )
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export function runChecks(): Report {
  const r: Report = { errors: [], warnings: [], notes: [] }

  const surfacePath = 'packages/mcp/docs/mcp-tool-surface.json'
  if (!existsSync(resolve(ROOT, surfacePath))) {
    r.errors.push(`${surfacePath} is missing. Run \`yarn generate:mcp-surface\`.`)
    return r
  }

  // A. freshness — the package's own generator, in --check mode.
  try {
    execFileSync(
      process.execPath,
      [
        resolve(ROOT, 'node_modules/tsx/dist/cli.mjs'),
        resolve(ROOT, 'packages/mcp/scripts/generate-tool-surface.ts'),
        '--check',
      ],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  }
  catch (err) {
    const e = err as { stderr?: string, stdout?: string, message?: string }
    r.errors.push(
      `The generated surface is stale or the generator failed:\n${(e.stderr ?? e.stdout ?? e.message ?? '').trim()}`,
    )
  }

  const pkg = json<Parameters<typeof checkRegistryManifest>[0] & { version: string }>('packages/mcp/package.json')
  const server = json<Parameters<typeof checkRegistryManifest>[1] & Parameters<typeof checkVersions>[1]>('packages/mcp/server.json')
  const surface = json<SurfaceLike>(surfacePath)
  const ceilings = json<Ceilings>('packages/tooling/src/validators/mcp-surface-ceilings.json')

  checkVersions(pkg, server, read('packages/mcp/CHANGELOG.md'), surface, r)
  checkRegistryManifest(
    pkg,
    server,
    read('packages/mcp/src/registry.ts'),
    read('packages/mcp/PUBLISHING.md'),
    r,
  )
  checkEvidence(surface, r)
  checkPackaging(pkg, r, read('packages/mcp/README.md'))
  checkRatchets(surface, ceilings, r)

  return r
}

function main(): void {
  const r = runChecks()
  for (const n of r.notes) console.error(`  note: ${n}`)
  for (const w of r.warnings) console.warn(`  warn: ${w}`)

  if (r.errors.length) {
    console.error(`\n@dzup-ui/mcp surface: ${r.errors.length} error(s)\n`)
    for (const e of r.errors) console.error(`  ✗ ${e}`)
    console.error('')
    process.exit(1)
  }
  const surface = json<SurfaceLike>('packages/mcp/docs/mcp-tool-surface.json')
  console.error(
    `@dzup-ui/mcp surface OK — ${surface.tools.length} tools, all with a contract clause, a unit spec, `
    + `a [malformed] case and an observed data source; version ${surface.version} agrees across `
    + `package.json, server.json (x2), CHANGELOG.md and the artifact.`,
  )
  console.error(
    `  ratchets: ${surface.catalogVisibility.unreachable} public components unreachable · `
    + `${surface.tools.filter(t => t.cells.find(c => c.kind === 'e2e-smoke')?.state === 'unrun').length} tools not smoke-called`,
  )
}

const invokedDirectly = process.argv[1]
  && /mcp-surface\.ts$/.test(process.argv[1].replaceAll('\\', '/'))
if (invokedDirectly)
  main()
