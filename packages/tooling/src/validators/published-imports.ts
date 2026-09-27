/**
 * `validate:published-imports` — import every published entry the way a
 * consumer does: from the tarball, under plain Node.
 *
 * TASK-R1-O2, closing `N5-03-D3`(2) and the Pro release rehearsal's `G8-7`.
 *
 * **The defect class.** `@dzup-ui/contracts` followed CLAUDE.md Quick Rule 5
 * ("use `.ts` extensions in all relative imports"), which is correct for a
 * Vite-bundled package and actively wrong for a `tsc`-emitted one: `tsc` strips
 * the extension, and the emitted ESM is unloadable by Node. The package shipped
 * broken for a whole release cycle and **no gate noticed**, because every gate
 * this repository had reads the built files without ever loading one —
 * `validate:exports` checks that targets exist, `validate:dts` that each `.js`
 * has a `.d.ts`, `validate:externals` that imports are declared. A file can
 * satisfy all three and still throw `ERR_MODULE_NOT_FOUND` on line 12. Vite's
 * resolver passes it vacuously, so a green unit suite says nothing either.
 * It took a *different repository's* release rehearsal to find it.
 *
 * Three failure modes it catches that nothing else does:
 *   1. extensionless relative specifiers in emitted ESM (the contracts defect);
 *   2. a subpath a consumer is told to use that `exports` does not declare —
 *      `ERR_PACKAGE_PATH_NOT_EXPORTED`, which is how the i18n catalog was
 *      unreachable for three import paths (N5-04 `D4`);
 *   3. a target that exists in the workspace but is **not in the tarball**,
 *      because `files` or `.npmignore` excluded it. `validate:exports` reads
 *      `packages/<p>/`; only a packed tarball can answer this one.
 *
 * **What it does.** For every package in `release-policy.json`'s `published`
 * list: `yarn pack` (never `npm pack` — `npm pack` copies `workspace:*`
 * verbatim and produces a tarball that dies with `EUNSUPPORTEDPROTOCOL` on
 * install), extract the tarball into a scratch consumer, then walk the *packed*
 * `package.json`'s `exports` map and probe every leaf:
 *
 *   - **every leaf** — the target file must exist inside the tarball;
 *   - **JS subpaths** — `await import('<pkg><subpath>')` under plain Node,
 *     by specifier, so Node's own `exports` resolution is what is tested;
 *   - **JSON subpaths** — the same with `with { type: 'json' }`;
 *   - **asset subpaths** (`./styles` → `dist/core.css`) — existence only, and
 *     reported as such: Node cannot import CSS and pretending otherwise would
 *     be a gate that passes for the wrong reason;
 *   - **`types` leaves** — one generated `.ts` probe per package, checked with
 *     `tsc --noEmit` under a *consumer's* tsconfig, not this repository's.
 *     That distinction is the point: the repo sets `allowImportingTsExtensions`
 *     and `paths` that redirect `@dzup-ui/*` to source, so a repo-flavoured
 *     probe would answer a question no consumer asks.
 *
 * **The scratch consumer, and its one honest boundary.** The tarballs are
 * extracted (never `npm install`ed) into `<tmp>/consumer/node_modules/`, and a
 * junction one level up points at this repository's `node_modules` so that
 * third-party peers — `vue`, `reka-ui`, `tailwind-variants` — resolve. Node
 * finds the extracted copy first, so every `@dzup-ui/*` specifier, including
 * the cross-package ones inside `core`'s own dist, resolves to packed content.
 * Extraction also means **no lifecycle script ever runs** (`--ignore-scripts`
 * by construction) and the gate needs **no network**, which is what lets it be
 * a `validate:all` link rather than a CI-only lane.
 *
 * The boundary: third-party dependencies come from this repository's install
 * rather than a fresh registry resolve, so an *undeclared* runtime dependency
 * would still import here. That hole is covered by `validate:externals` and
 * `validate:peers`; this gate does not claim it. See `--install` in the
 * handoff's owner decisions for the full-fidelity variant.
 *
 * **Freshness.** `yarn pack` archives whatever `dist/` is on disk, so a stale
 * build would be probed and reported green (N5-04 `F10`). The same mtime check
 * `test:nuxt-fixtures:pack` uses runs first: unbuilt packages are SKIPPED with
 * a warning and stale ones are reported in the summary, exactly as
 * `validate:exports` does; `--built` turns both into errors. Run `--built` in
 * CI after `yarn build`.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/published-imports.ts
 *   tsx packages/tooling/src/validators/published-imports.ts --built
 *   tsx packages/tooling/src/validators/published-imports.ts --keep   # keep the scratch dir
 *   tsx packages/tooling/src/validators/published-imports.ts --no-types
 *
 * Exit code 1 if any entry fails.
 */

import type { FreshnessResult } from '../pack-freshness.d.mts'
import type { WorkspacePackage } from '../release/pack.ts'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { checkAllDistFreshness, formatFreshnessRefusal } from '../pack-freshness.mjs'
import { extractTarball, packWorkspace, publishedPackages } from '../release/pack.ts'
import { collectExportTargets } from './export-map.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

// --- Types ---

/** What a probe of one subpath actually asks Node (or TypeScript). */
export type ProbeKind = 'esm' | 'json' | 'asset' | 'types'

export interface LeafTarget {
  subpath: string
  conditions: string[]
  target: string
}

export interface RuntimeProbe {
  /** `@dzup-ui/core` */
  packageName: string
  /** `.` | `./i18n` | `./i18n/locales/en.json` */
  subpath: string
  /** What a consumer writes: `@dzup-ui/core/i18n`. */
  specifier: string
  kind: Exclude<ProbeKind, 'types'>
  /** The condition chain Node would walk to reach it. */
  conditions: string[]
  /** The declared target, for the failure line. */
  target: string
}

export interface ProbeResult {
  packageName: string
  version: string
  subpath: string
  conditions: string[]
  kind: ProbeKind
  ok: boolean
  /** Number of exported bindings, for an `esm`/`json` probe that loaded. */
  exportCount?: number
  error?: string
}

interface PublishedImportsPolicy {
  sideEffectOnly: Array<{ entry: string, reason: string }>
}

/**
 * Subpaths allowed to export nothing, as `<package>#<subpath>`.
 *
 * The rule this qualifies matters more than the exception: a barrel whose
 * `export * from './x.ts'` no longer resolves produces an EMPTY namespace, not
 * a throw. "It imported" would then be a pass for a package that exports
 * nothing at all — the loudest possible defect, silently green. So zero
 * exports fails by default, and the legitimate cases (a vitest setup module) are
 * named data with a reason, not a softened rule.
 */
export function sideEffectOnlyEntries(): Set<string> {
  const policyPath = resolve(ROOT, 'packages/tooling/scripts/published-imports-policy.json')
  if (!existsSync(policyPath))
    return new Set()
  const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as PublishedImportsPolicy
  return new Set((policy.sideEffectOnly ?? []).map(e => e.entry))
}

/** The key `published-imports-policy.json` spells an entry with. */
export function entryKey(packageName: string, subpath: string): string {
  return `${packageName}#${subpath}`
}

interface PackedPackageJson {
  name?: string
  version?: string
  exports?: unknown
  main?: string
  module?: string
  types?: string
}

// --- Pure helpers (unit-tested in published-imports.spec.ts) ---

/**
 * What kind of probe a target deserves, from its extension.
 *
 * A `types` condition is decided by the condition chain, not the extension: a
 * `.d.ts` reached through `import` would be a defect (Node would load a
 * declaration file as a module), and calling it `types` here would hide it.
 */
export function classifyTarget(target: string, conditions: string[]): ProbeKind {
  if (conditions.includes('types'))
    return 'types'
  if (/\.json$/i.test(target))
    return 'json'
  if (/\.(?:css|svg|png|woff2?|ttf|otf|webp|jpe?g|gif|map)$/i.test(target))
    return 'asset'
  return 'esm'
}

/**
 * The specifier a consumer writes for a subpath — `.` is the bare package name,
 * everything else is the package name plus the subpath minus its leading dot.
 */
export function specifierFor(packageName: string, subpath: string): string {
  return subpath === '.' ? packageName : `${packageName}${subpath.slice(1)}`
}

/**
 * Which leaf Node would actually load for `import()` of this subpath.
 *
 * Node walks conditions in the order the object declares them, taking the first
 * it recognises: for ESM that is `import` (or `module`/`node`), falling back to
 * `default`. A leaf reached only through `types` or `require` is never what
 * `import()` gets, so it is probed as a file, not as a module. Returning
 * `undefined` means "this subpath has no runtime leaf", which is itself worth
 * reporting — a subpath that only declares `types` is not importable.
 */
export function runtimeLeafFor(leaves: LeafTarget[]): LeafTarget | undefined {
  const runtime = leaves.filter(l => !l.conditions.includes('types') && !l.conditions.includes('require'))
  return runtime.find(l => l.conditions.length === 0)
    ?? runtime.find(l => l.conditions.includes('import'))
    ?? runtime.find(l => l.conditions.includes('default'))
    ?? runtime[0]
}

/** Every leaf of an `exports` map, grouped by subpath, in declaration order. */
export function leavesBySubpath(exportsField: unknown): Map<string, LeafTarget[]> {
  const grouped = new Map<string, LeafTarget[]>()
  for (const leaf of collectExportTargets(exportsField)) {
    const list = grouped.get(leaf.subpath) ?? []
    list.push({ subpath: leaf.subpath, conditions: leaf.conditions, target: leaf.target })
    grouped.set(leaf.subpath, list)
  }
  return grouped
}

/**
 * The runtime probes for one packed package: one per subpath that has a
 * runtime leaf. Wildcard subpaths (`./*`) are skipped — there is no single
 * specifier to import — and reported as uncovered rather than silently dropped.
 */
export function planRuntimeProbes(packageName: string, exportsField: unknown): {
  probes: RuntimeProbe[]
  skippedWildcards: string[]
} {
  const probes: RuntimeProbe[] = []
  const skippedWildcards: string[] = []

  for (const [subpath, leaves] of leavesBySubpath(exportsField)) {
    if (subpath.includes('*')) {
      skippedWildcards.push(subpath)
      continue
    }
    const leaf = runtimeLeafFor(leaves)
    if (leaf === undefined)
      continue
    const kind = classifyTarget(leaf.target, leaf.conditions)
    if (kind === 'types')
      continue
    probes.push({
      packageName,
      subpath,
      specifier: specifierFor(packageName, subpath),
      kind,
      conditions: leaf.conditions,
      target: leaf.target,
    })
  }

  return { probes, skippedWildcards }
}

/** The subpaths whose `types` condition should be compiled against. */
export function planTypeProbes(packageName: string, exportsField: unknown): RuntimeProbe[] {
  const probes: RuntimeProbe[] = []
  for (const [subpath, leaves] of leavesBySubpath(exportsField)) {
    if (subpath.includes('*'))
      continue
    const typesLeaf = leaves.find(l => l.conditions.includes('types'))
    if (typesLeaf === undefined)
      continue
    probes.push({
      packageName,
      subpath,
      specifier: specifierFor(packageName, subpath),
      kind: 'esm',
      conditions: typesLeaf.conditions,
      target: typesLeaf.target,
    })
  }
  return probes
}

/**
 * The failure report. One line per failed entry, in the shape TASK-R1-O2's
 * `<failure_shape>` fixes, so a reader sees package, subpath, condition and
 * the raw runtime error without opening a log.
 */
export function formatReport(results: ProbeResult[], tarballDir: string): string {
  const failed = results.filter(r => !r.ok)
  const lines: string[] = []

  if (failed.length === 0) {
    // Broken down by kind rather than summed: 3 of these are CSS files Node
    // cannot import, and a line reading "31 entries imported cleanly" would be
    // claiming evidence for them that this gate does not have.
    const count = (kind: ProbeKind): number => results.filter(r => r.kind === kind).length
    lines.push(`validate:published-imports PASSED`)
    lines.push(
      `  ${results.length} entries verified: ${count('esm')} imported under Node`
      + ` · ${count('json')} imported as JSON · ${count('asset')} assets present in the tarball (not importable under Node)`,
    )
    lines.push(`  tarballs: ${tarballDir}`)
    return lines.join('\n')
  }

  lines.push('validate:published-imports FAILED')
  for (const r of failed) {
    const condition = r.conditions.length > 0 ? r.conditions.join('.') : r.kind
    lines.push(`  ${r.packageName}@${r.version}  ${r.subpath}  ${condition}  → ${r.error ?? 'unknown error'}`)
  }
  lines.push(`${failed.length} of ${results.length} entries failed · tarballs: ${tarballDir}`)
  return lines.join('\n')
}

// --- Workspace discovery, packing and staging ---

/*
 * `publishedPackages`, `packWorkspace` and `extractTarball` moved to
 * `../release/pack.ts` in TASK-R1-O3 and are re-exported here so that this
 * gate's own API is unchanged. The move is not tidiness: `release:api-diff`
 * and `release:evidence` must read the SAME tarballs this gate loads, or the
 * bundle would describe two different artifacts and call them one — which is
 * doc 08's "tarball differs from the reviewed build" stop condition produced
 * by our own tooling.
 */
export { extractTarball, packWorkspace, publishedPackages }
export type { WorkspacePackage }

/**
 * Build the scratch consumer: extracted tarballs in its own `node_modules`, and
 * a junction one level up to this repository's `node_modules` so third-party
 * peers resolve. Node checks the nearer directory first, so every `@dzup-ui/*`
 * specifier — including the ones inside `core`'s own dist — hits packed
 * content, never the workspace symlink.
 */
function stageConsumer(stage: string, tarballs: Map<string, string>): string {
  const consumer = join(stage, 'consumer')
  mkdirSync(join(consumer, 'node_modules'), { recursive: true })

  for (const [name, tgz] of tarballs)
    extractTarball(tgz, join(consumer, 'node_modules', ...name.split('/')))

  // 'junction' is the only symlink type Windows grants without elevation; on
  // POSIX the type argument is ignored and a directory symlink is made.
  const fallback = join(stage, 'node_modules')
  if (!existsSync(fallback))
    symlinkSync(resolve(ROOT, 'node_modules'), fallback, 'junction')

  // A consumer is ESM; without this the probe would be parsed as CommonJS.
  writeFileSync(join(consumer, 'package.json'), `${JSON.stringify({
    name: 'dzup-published-imports-consumer',
    private: true,
    type: 'module',
  }, null, 2)}\n`, 'utf8')

  return consumer
}

// --- Runtime probe ---

/**
 * The probe script. It runs in its OWN Node process, in the consumer
 * directory, with no knowledge of this repository: that is the whole point.
 * Each entry is imported inside its own try/catch so one broken package
 * reports one failure instead of aborting the run, and the result comes back
 * as JSON on stdout between markers (yarn and Node both write to this stream).
 */
function renderRuntimeProbe(probes: RuntimeProbe[]): string {
  return `${[
    '// GENERATED by validate:published-imports — a scratch consumer, not repository source.',
    `const probes = ${JSON.stringify(probes.map(p => ({ specifier: p.specifier, kind: p.kind, subpath: p.subpath, packageName: p.packageName })), null, 2)}`,
    'const results = []',
    'for (const probe of probes) {',
    '  try {',
    '    const mod = probe.kind === \'json\'',
    '      ? await import(probe.specifier, { with: { type: \'json\' } })',
    '      : await import(probe.specifier)',
    '    const value = probe.kind === \'json\' ? mod.default : mod',
    '    const exportCount = value === null || typeof value !== \'object\' ? 1 : Object.keys(value).length',
    '    results.push({ ...probe, ok: true, exportCount })',
    '  }',
    '  catch (error) {',
    // Concatenation, not interpolation: `${…}` inside these quoted lines is
    // generated-code text, and `no-template-curly-in-string` cannot tell the
    // difference between that and a template literal someone forgot to mark.
    '    const code = error && error.code ? error.code + \': \' : \'\'',
    '    const detail = error && error.message ? error.message : String(error)',
    '    results.push({ ...probe, ok: false, error: (code + detail).split(\'\\n\')[0] })',
    '  }',
    '}',
    'process.stdout.write(\'--DZUP-PROBE--\' + JSON.stringify(results) + \'--DZUP-PROBE--\')',
  ].join('\n')}\n`
}

interface RawProbeResult {
  specifier: string
  subpath: string
  packageName: string
  kind: Exclude<ProbeKind, 'types'>
  ok: boolean
  exportCount?: number
  error?: string
}

function runRuntimeProbe(consumer: string, probes: RuntimeProbe[]): RawProbeResult[] {
  const probeFile = join(consumer, 'probe.mjs')
  writeFileSync(probeFile, renderRuntimeProbe(probes), 'utf8')

  const stdout = execSync(`node "${probeFile}"`, {
    cwd: consumer,
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 32 * 1024 * 1024,
  })
  const marked = /--DZUP-PROBE--([\s\S]*)--DZUP-PROBE--/.exec(stdout)
  if (marked === null || marked[1] === undefined)
    throw new Error(`probe process produced no result block. Output:\n${stdout}`)

  return JSON.parse(marked[1]) as RawProbeResult[]
}

// --- Types probe ---

/**
 * One `.ts` file per run that imports every `types`-declaring subpath, plus the
 * `DzMessageCatalog` assertion.
 *
 * The catalog check is not decoration. `DzMessageCatalog` is an empty interface
 * in `@dzup-ui/contracts` that Core augments through `declare module`; if the
 * emitted declarations never *reference* the file holding that augmentation, a
 * consumer's TypeScript never loads it and every message key is `never`
 * (N5-04 `F9`/`D4`). Nothing else in the repository notices, because inside the
 * repository the augmentation is always in the program.
 */
export function renderTypesProbe(probes: RuntimeProbe[]): string {
  const lines: string[] = [
    '// GENERATED by validate:published-imports — a scratch consumer, not repository source.',
    '/* eslint-disable */',
  ]

  // `export * as nsN from …` is the smallest statement that forces TypeScript to
  // resolve the specifier's `types` condition AND surface the failure in this
  // file (a non-declaration file), where `skipLibCheck` cannot suppress it.
  probes.forEach((probe, index) => {
    lines.push(`export * as ns${index} from '${probe.specifier}'`)
  })

  return `${lines.join('\n')}\n`
}

/**
 * The catalog probe — its OWN program, importing ONLY the package root.
 *
 * That isolation is the whole check, and it was measured: with the assertion
 * living in `types-probe.ts` alongside `export * as nsN from
 * '@dzup-ui/core/i18n'`, deleting the augmentation's reference from
 * `dist/index.d.ts` still passed, because the sibling subpath import had
 * already pulled `i18n/messages.d.ts` into the program. The question is
 * specifically *"does a consumer who writes `import '@dzup-ui/core'` and
 * nothing else see the catalog?"* — N5-04 `F9`/`D4` — and only a program with
 * nothing else in it can ask it.
 */
export function renderCatalogProbe(): string {
  return `${[
    '// GENERATED by validate:published-imports — a scratch consumer, not repository source.',
    '/* eslint-disable */',
    '// N5-04 D4 / F9: `DzMessageCatalog` is an empty interface in @dzup-ui/contracts that',
    '// Core augments with `declare module`. If the emitted declarations never REFERENCE the',
    '// file holding that augmentation, a consumer TypeScript never loads it, every message',
    '// key is `never`, and locale packs are pointless. Nothing inside the repository notices,',
    '// because there the augmentation is always already in the program.',
    'import type { DzMessageCatalog } from \'@dzup-ui/contracts\'',
    'import \'@dzup-ui/core\'',
    '',
    'type CatalogGroups = keyof DzMessageCatalog',
    'type CatalogIsNonEmpty = [CatalogGroups] extends [never]',
    '  ? { DZUP_ERROR: \'DzMessageCatalog is EMPTY for consumers — the declare-module augmentation is unreachable from the published root types (N5-04 D4/F9)\' }',
    '  : true',
    'export const catalogNonEmpty: CatalogIsNonEmpty = true',
  ].join('\n')}\n`
}

/**
 * A *consumer's* tsconfig, deliberately not this repository's.
 *
 * `allowImportingTsExtensions` is absent on purpose — the repo sets it, and
 * with it a `.d.ts` that re-exports `'./x.ts'` type-checks here and nowhere
 * else. `skipLibCheck: true` is what essentially every real consumer runs; it
 * suppresses errors *inside* library declarations while still failing when a
 * specifier does not resolve to types at all, which is the question this probe
 * asks.
 */
function renderConsumerTsconfig(entry: string): string {
  return `${JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      resolveJsonModule: true,
      types: [],
    },
    files: [entry],
  }, null, 2)}\n`
}

interface TypesProbeOutcome {
  ok: boolean
  output: string
}

/** One isolated `tsc --noEmit` program: one source file, one tsconfig, no repo config. */
function runTsProgram(consumer: string, entry: string, source: string): TypesProbeOutcome {
  const configName = `tsconfig.${entry.replace(/\.ts$/, '')}.json`
  writeFileSync(join(consumer, entry), source, 'utf8')
  writeFileSync(join(consumer, configName), renderConsumerTsconfig(entry), 'utf8')

  // By module path: `npx tsc` in this environment fetches a dependency-confusion
  // placeholder that exits 1 with a message that reads exactly like a gate failure.
  const tsc = resolve(ROOT, 'node_modules/typescript/bin/tsc')
  try {
    execSync(`node "${tsc}" -p "${configName}"`, { cwd: consumer, encoding: 'utf8', stdio: 'pipe' })
    return { ok: true, output: '' }
  }
  catch (error) {
    const e = error as { stdout?: string, stderr?: string, message?: string }
    return { ok: false, output: (e.stdout ?? '') + (e.stderr ?? '') || (e.message ?? 'tsc failed') }
  }
}

// --- Main ---

function main(): void {
  const argv = process.argv.slice(2)
  const requireBuilt = argv.includes('--built')
  const keep = argv.includes('--keep')
  const skipTypes = argv.includes('--no-types')

  const started = Date.now()
  const packages = publishedPackages()

  console.warn(`validate:published-imports — ${packages.length} published packages (packages/tooling/scripts/release-policy.json)`)

  // 1. Freshness. A tarball from a stale dist is evidence about a build nobody
  //    has; the same check test:nuxt-fixtures:pack refuses on.
  const freshness: FreshnessResult[] = checkAllDistFreshness(packages)
  const unbuilt = freshness.filter(f => f.status === 'unbuilt')
  const stale = freshness.filter(f => f.status === 'stale')

  if (requireBuilt && (unbuilt.length > 0 || stale.length > 0)) {
    console.error(`\n${formatFreshnessRefusal([...stale, ...unbuilt], {
      repoRoot: ROOT,
      buildHint: '  --built was passed: run `yarn build` first, or drop --built to skip unbuilt packages.',
    })}\n`)
    process.exit(1)
  }

  for (const f of stale) {
    console.warn(
      `  STALE ${f.name}: dist (${new Date(f.newestDist!.mtimeMs).toISOString()}) predates `
      + `${relative(ROOT, f.newestSource!.file).replaceAll('\\', '/')} (${new Date(f.newestSource!.mtimeMs).toISOString()}) `
      + `— this run is evidence about that older build`,
    )
  }
  for (const f of unbuilt)
    console.warn(`  SKIP  ${f.name}: no dist/ — run \`yarn build\` (or pass --built) to probe it`)

  const probeable = packages.filter(p => !unbuilt.some(f => f.name === p.name))
  if (probeable.length === 0) {
    console.warn('\nNothing to probe: no published package is built. Run `yarn build`.')
    process.exit(0)
  }

  const stage = mkdtempSync(join(tmpdir(), 'dzup-published-imports-'))

  try {
    // 2. Pack.
    const tarballDir = join(stage, 'tarballs')
    mkdirSync(tarballDir, { recursive: true })
    const tarballs = new Map<string, string>()
    for (const { name } of probeable)
      tarballs.set(name, packWorkspace(name, tarballDir))

    // 3. Stage a consumer and read the PACKED manifests — not the workspace ones.
    const consumer = stageConsumer(stage, tarballs)

    const allRuntimeProbes: RuntimeProbe[] = []
    const allTypeProbes: RuntimeProbe[] = []
    const versions = new Map<string, string>()
    const fileResults: ProbeResult[] = []
    const wildcardNotes: string[] = []
    let leafCount = 0

    for (const { name } of probeable) {
      const packedDir = join(consumer, 'node_modules', ...name.split('/'))
      const packed = JSON.parse(readFileSync(join(packedDir, 'package.json'), 'utf8')) as PackedPackageJson
      const version = packed.version ?? '0.0.0'
      versions.set(name, version)

      // 3a. Every leaf must exist INSIDE the tarball. This is the check
      //     validate:exports structurally cannot make: it reads the workspace,
      //     where a file `files`/`.npmignore` excluded is still present.
      //     `main`/`module`/`types` ride along — older resolvers read them, and
      //     a package that ships neither is broken for those consumers only.
      const tarballLeaves: LeafTarget[] = [
        ...[...leavesBySubpath(packed.exports).values()].flat(),
        ...(['main', 'module', 'types'] as const).flatMap((field): LeafTarget[] => {
          const value = packed[field]
          return typeof value === 'string' ? [{ subpath: field, conditions: [], target: value }] : []
        }),
      ]

      for (const leaf of tarballLeaves) {
        leafCount += 1
        if (leaf.subpath.includes('*') || leaf.target.includes('*'))
          continue
        if (existsSync(resolve(packedDir, leaf.target)))
          continue
        fileResults.push({
          packageName: name,
          version,
          subpath: leaf.subpath,
          conditions: leaf.conditions,
          kind: classifyTarget(leaf.target, leaf.conditions),
          ok: false,
          error: `declared target ${leaf.target} is not in the tarball (excluded by "files"?)`,
        })
      }

      const { probes, skippedWildcards } = planRuntimeProbes(name, packed.exports)
      allRuntimeProbes.push(...probes)
      allTypeProbes.push(...planTypeProbes(name, packed.exports))
      for (const subpath of skippedWildcards)
        wildcardNotes.push(`${name} ${subpath}`)
    }

    // 4. Import every runtime entry under plain Node, from the consumer.
    const sideEffectOnly = sideEffectOnlyEntries()
    const raw = runRuntimeProbe(consumer, allRuntimeProbes.filter(p => p.kind !== 'asset'))
    const runtimeResults: ProbeResult[] = raw.map((r) => {
      const emptyButShouldNotBe = r.ok
        && r.kind === 'esm'
        && (r.exportCount ?? 0) === 0
        && !sideEffectOnly.has(entryKey(r.packageName, r.subpath))
      return {
        packageName: r.packageName,
        version: versions.get(r.packageName) ?? '0.0.0',
        subpath: r.subpath,
        conditions: allRuntimeProbes.find(p => p.specifier === r.specifier)?.conditions ?? [],
        kind: r.kind,
        ok: r.ok && !emptyButShouldNotBe,
        exportCount: r.exportCount,
        error: r.ok
          ? (emptyButShouldNotBe
              ? 'resolved but exports nothing — a barrel whose `export *` no longer resolves looks exactly like this (add it to published-imports-policy.json only if it is side-effect-only)'
              : undefined)
          : r.error,
      }
    })

    // Assets: existence only, and said out loud. Node cannot import CSS.
    const assetResults: ProbeResult[] = allRuntimeProbes
      .filter(p => p.kind === 'asset')
      .map((p) => {
        const abs = resolve(consumer, 'node_modules', ...p.packageName.split('/'), p.target)
        return {
          packageName: p.packageName,
          version: versions.get(p.packageName) ?? '0.0.0',
          subpath: p.subpath,
          conditions: p.conditions,
          kind: 'asset' as const,
          ok: existsSync(abs),
          error: existsSync(abs) ? undefined : `asset target ${p.target} is not in the tarball`,
        }
      })

    const results = [...fileResults, ...runtimeResults, ...assetResults]

    // 5. Types — two independent programs, see renderCatalogProbe().
    let typesOk = true
    let catalogOk: boolean | undefined
    if (!skipTypes) {
      const outcome = runTsProgram(consumer, 'types-probe.ts', renderTypesProbe(allTypeProbes))
      typesOk = outcome.ok
      if (!outcome.ok) {
        results.push({
          packageName: 'types-probe',
          version: '—',
          subpath: `${allTypeProbes.length} types subpaths`,
          conditions: ['types'],
          kind: 'types',
          ok: false,
          error: outcome.output.trim().split('\n').slice(0, 12).join(' | '),
        })
      }

      const catalogPackagesPresent = probeable.some(p => p.name === '@dzup-ui/core')
        && probeable.some(p => p.name === '@dzup-ui/contracts')
      if (catalogPackagesPresent) {
        const catalog = runTsProgram(consumer, 'catalog-probe.ts', renderCatalogProbe())
        catalogOk = catalog.ok
        if (!catalog.ok) {
          results.push({
            packageName: '@dzup-ui/core',
            version: versions.get('@dzup-ui/core') ?? '0.0.0',
            subpath: 'DzMessageCatalog augmentation',
            conditions: ['types'],
            kind: 'types',
            ok: false,
            error: catalog.output.trim().split('\n').slice(0, 8).join(' | '),
          })
        }
      }
    }

    // 6. Report.
    const elapsed = ((Date.now() - started) / 1000).toFixed(1)
    console.warn('')
    for (const { name } of probeable) {
      const mine = results.filter(r => r.packageName === name)
      const bad = mine.filter(r => !r.ok).length
      console.warn(`  ${bad === 0 ? 'PASS' : 'FAIL'}  ${name}@${versions.get(name)}: ${mine.length} probes`)
    }
    if (wildcardNotes.length > 0)
      console.warn(`\n  not probed (wildcard subpaths, no single specifier): ${wildcardNotes.join(', ')}`)
    console.warn(`\n  ${leafCount} exports leaves · ${allRuntimeProbes.length} runtime entries · ${allTypeProbes.length} types entries · ${elapsed}s`)
    if (!skipTypes) {
      console.warn(`  types probe: ${typesOk ? 'PASS' : 'FAIL'} (consumer tsconfig: moduleResolution bundler, skipLibCheck, no allowImportingTsExtensions)`)
      if (catalogOk !== undefined)
        console.warn(`  DzMessageCatalog reachable from \`import '@dzup-ui/core'\` alone: ${catalogOk ? 'YES' : 'NO'} (isolated program — N5-04 D4/F9)`)
    }
    console.warn('')
    console.warn(formatReport(results, keep ? tarballDir : '(removed — pass --keep to inspect)'))

    if (results.some(r => !r.ok))
      process.exit(1)
  }
  finally {
    if (!keep)
      rmSync(stage, { recursive: true, force: true })
    else
      console.warn(`\n  scratch kept: ${stage}`)
  }
}

// Guarded so published-imports.spec.ts can import the pure planners without
// packing six tarballs as a side effect of `import`.
const invokedDirectly = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (invokedDirectly)
  main()
