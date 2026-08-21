/**
 * Component-ownership manifest generator (TASK-OSS-P0-01).
 *
 * Emits `packages/core/manifests/component-ownership.manifest.json`: one entry
 * per exported symbol, stating the owning package, the import path, what the
 * symbol is, and the authority paths that justified saying so.
 *
 * It *reports*; it never decides public API (README.md §3 `<generated_authority>`).
 * Nothing here adds, removes, or re-owns an export, and anything the authorities
 * cannot settle is emitted as `unclassified` with its evidence rather than
 * guessed from a `Dz` prefix.
 *
 * Usage:
 *   tsx packages/tooling/src/ownership/generate-ownership-manifest.ts            # write
 *   tsx packages/tooling/src/ownership/generate-ownership-manifest.ts --check    # print, do not write
 */

import type { Classification } from './classify.ts'
import type {
  OwnershipEntry,
  OwnershipManifest,
  OwnershipStatus,
} from './ownership-manifest.types.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { readAnatomyFor } from './anatomy-source.ts'
import { buildOwnershipMap, readManifest } from './build-ownership-map.ts'
import { classifyComponent, resolveCompoundParents } from './classify.ts'
import { buildContextGraph, contextComposablePairs, contextParentsOf } from './context-graph.ts'
import { renderAnatomyData } from './emit-anatomy-data.ts'
import { renderRuntimeLookup } from './emit-runtime-lookup.ts'
import { scanModuleExports } from './module-exports.ts'
import { compareSymbols, OWNERSHIP_SCHEMA_VERSION } from './ownership-manifest.types.ts'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

export const OWNERSHIP_MANIFEST_PATH = resolve(
  ROOT,
  'packages/core/manifests/component-ownership.manifest.json',
)

export const RUNTIME_LOOKUP_PATH = resolve(
  ROOT,
  'packages/core/src/generated/component-ownership.ts',
)

/**
 * Declared anatomy, projected for the Storybook `<Anatomy>` block
 * (TASK-OSS-P3-02). A narrowing of the manifest, not a second source of truth —
 * `validate:ownership` fails when the two disagree.
 */
export const ANATOMY_DATA_PATH = resolve(
  ROOT,
  'apps/storybook/stories/_data/anatomy.generated.ts',
)

/**
 * Path to a **Pro** ownership manifest, supplied by whoever has a Pro checkout.
 *
 * Core never reads Pro source: the input is a JSON file a Pro checkout produced
 * (Pro TASK-GOV-01). When it is unset the emitted table covers the Core tier
 * only and says so, rather than fabricating Pro entries from a name list.
 */
export const PRO_MANIFEST_ENV = 'DZUP_PRO_OWNERSHIP_MANIFEST'

/**
 * Build the resolver's runtime table from the Core manifest plus, when one is
 * supplied, a Pro manifest.
 *
 * The returned `tiers` are recorded in the emitted file so the freshness check
 * can regenerate with the same inputs instead of failing on a machine that
 * happens not to have a Pro checkout.
 */
export function buildRuntimeLookup(manifest: OwnershipManifest, proManifestPath?: string): {
  source: string
  tiers: string[]
  problems: string[]
} {
  const inputs = [manifest]
  if (proManifestPath !== undefined && existsSync(proManifestPath))
    inputs.push(readManifest(proManifestPath))

  const { map, problems } = buildOwnershipMap(inputs)
  return {
    source: renderRuntimeLookup(map),
    tiers: map.inputs.map(input => input.tier),
    problems,
  }
}

/** `status:stable` on a story `meta.tags`, mirroring validators/story-status.ts. */
const STATUS_TAG_RE = /['"]status:(experimental|beta|stable|deprecated)['"]/

/** An injection key, by the naming convention the repo already enforces. */
const INJECTION_KEY_RE = /^DZ_[A-Z0-9_]+_KEY$/

/** A composable, by the `use` + PascalCase convention the repo applies without exception. */
const COMPOSABLE_NAME_RE = /^use[A-Z]/

/** `import { DzButton } from '@dzup-ui/core'` inside a compat adapter. */
const CORE_IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*['"]@dzup-ui\/core['"]/

interface PublicApiManifest {
  exports: {
    components?: Record<string, { path: string, exports: string[] }>
    composables?: Record<string, { path: string, exports: string[] }>
    providers?: Record<string, { path: string, exports: string[] }>
    utilities?: Record<string, { path: string, exports: string[] }>
    injectionKeys?: string[]
    variants?: string[]
    types?: string[]
  }
}

/**
 * Repo-relative, forward-slashed path. Bare package specifiers (a barrel
 * re-exporting `@dzup-ui/contracts`) are returned unchanged — they are evidence
 * too, just not paths.
 */
function rel(pathOrSpecifier: string): string {
  if (!isAbsolute(pathOrSpecifier))
    return pathOrSpecifier
  return relative(ROOT, pathOrSpecifier).replaceAll('\\', '/')
}

/** Recursively collect files under `dir` whose name ends with `suffix`. */
function collectFiles(dir: string, suffix: string): string[] {
  if (!existsSync(dir))
    return []
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist')
      continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory())
      out.push(...collectFiles(full, suffix))
    else if (entry.endsWith(suffix))
      out.push(full)
  }
  return out
}

/**
 * Map a `package.json` exports target back to its source entry.
 *
 * `exports` names build output (`./dist/index.js`); the authority for what a
 * subpath exposes is the source barrel that produced it.
 */
function sourceEntryFor(packageDir: string, target: string): string | undefined {
  const fromDist = target.replace(/^\.\/dist\//, '').replace(/\.js$/, '.ts')
  const candidate = resolve(packageDir, 'src', fromDist)
  return existsSync(candidate) ? candidate : undefined
}

/** Every `(subpath, source entry)` pair a package declares, `./styles`-style asset targets skipped. */
export function declaredEntryPoints(packageDir: string): { subpath: string, entry: string }[] {
  const packageJson = JSON.parse(
    readFileSync(resolve(packageDir, 'package.json'), 'utf8'),
  ) as { exports?: Record<string, string | Record<string, string>> }

  const out: { subpath: string, entry: string }[] = []
  for (const [subpath, value] of Object.entries(packageJson.exports ?? {})) {
    const target = typeof value === 'string' ? value : value.import ?? value.types
    if (target === undefined || !target.endsWith('.js'))
      continue
    const entry = sourceEntryFor(packageDir, target)
    if (entry !== undefined)
      out.push({ subpath, entry })
  }
  return out.sort((a, b) => compareSymbols(a.subpath, b.subpath))
}

/** symbol → story file path, for every `*.stories.ts` named after a symbol. */
function collectStories(storiesDir: string): Map<string, { path: string, status?: OwnershipStatus }> {
  const out = new Map<string, { path: string, status?: OwnershipStatus }>()
  for (const file of collectFiles(storiesDir, '.stories.ts')) {
    const symbol = basename(file, '.stories.ts')
    const status = STATUS_TAG_RE.exec(readFileSync(file, 'utf8'))?.[1] as OwnershipStatus | undefined
    out.set(symbol, { path: rel(file), status })
  }
  return out
}

function gitHead(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
  }
  catch {
    return 'unknown'
  }
}

/**
 * Classify everything `@dzup-ui/core` exports, then everything
 * `@dzup-ui/compat` exports as aliases over it.
 */
export function buildOwnershipManifest(): { manifest: OwnershipManifest, warnings: string[] } {
  const warnings: string[] = []
  // Barrels are reachable from more than one subpath (`.` and `./layout` both
  // reach the layout family), so the same drift is observed more than once.
  const note = (message: string): void => {
    if (!warnings.includes(message))
      warnings.push(message)
  }
  const coreDir = resolve(ROOT, 'packages/core')
  const compatDir = resolve(ROOT, 'packages/compat')

  const publicApi = JSON.parse(
    readFileSync(resolve(coreDir, 'manifests/public-api.manifest.json'), 'utf8'),
  ) as PublicApiManifest

  const manifestVariants = new Set(publicApi.exports.variants ?? [])
  const manifestTypes = new Set(publicApi.exports.types ?? [])
  const manifestProviders = new Set(
    Object.values(publicApi.exports.providers ?? {}).flatMap(entry => entry.exports),
  )
  const manifestComponents = new Set(
    Object.values(publicApi.exports.components ?? {}).flatMap(entry => entry.exports),
  )
  const composableExports = Object.values(publicApi.exports.composables ?? {}).flatMap(e => e.exports)

  // ── 1. What the barrels actually export, and from which subpaths ──
  const subpathsBySymbol = new Map<string, Set<string>>()
  const declaredIn = new Map<string, string>()
  const typeOnly = new Map<string, boolean>()

  for (const { subpath, entry } of declaredEntryPoints(coreDir)) {
    const scan = scanModuleExports(entry)
    for (const unreadable of scan.unreadable)
      note(`unresolved module reference from ${subpath}: ${rel(unreadable)}`)

    for (const [symbol, discovered] of scan.exports) {
      const paths = subpathsBySymbol.get(symbol) ?? new Set<string>()
      paths.add(subpath)
      subpathsBySymbol.set(symbol, paths)
      if (!declaredIn.has(symbol)) {
        declaredIn.set(symbol, discovered.declaredIn)
        typeOnly.set(symbol, discovered.typeOnly)
      }
    }
  }

  // ── 2. Context graph over every component source ──
  const componentSymbols = [...declaredIn]
    .filter(([, file]) => file.endsWith('.vue'))
    .map(([symbol]) => symbol)

  const sources = new Map<string, string>()
  for (const symbol of componentSymbols) {
    const file = declaredIn.get(symbol)!
    if (existsSync(file))
      sources.set(symbol, readFileSync(file, 'utf8'))
  }
  const graph = buildContextGraph(sources, contextComposablePairs(composableExports))

  // ── 3. Classify ──
  const stories = collectStories(resolve(coreDir, 'stories'))
  const classifications = new Map<string, Classification>()
  const membersByDir = new Map<string, string[]>()
  for (const symbol of componentSymbols) {
    const dir = dirname(declaredIn.get(symbol)!)
    membersByDir.set(dir, [...(membersByDir.get(dir) ?? []), symbol])
  }

  for (const symbol of componentSymbols) {
    const file = declaredIn.get(symbol)!
    const dir = dirname(file)
    const family = basename(dir)
    const siblings = membersByDir.get(dir) ?? []
    const story = stories.get(symbol)

    // The public-api manifest's `providers` section names a public component
    // outright; the `components` sections only say "this family exports it",
    // which leaves public-vs-part to the story and the wiring.
    if (story === undefined && manifestProviders.has(symbol)) {
      classifications.set(symbol, {
        kind: 'public-component',
        evidence: [
          rel(file),
          'packages/core/manifests/public-api.manifest.json#exports.providers',
        ],
      })
      continue
    }

    classifications.set(symbol, classifyComponent({
      symbol,
      family,
      siblings,
      vuePath: rel(file),
      storyPath: story?.path,
      contextParents: contextParentsOf(symbol, siblings, graph),
    }))

    if (!manifestComponents.has(symbol) && !manifestProviders.has(symbol)) {
      note(
        `${symbol} is exported from a barrel (${rel(file)}) but the public-api manifest lists it in no section`,
      )
    }
  }

  resolveCompoundParents(classifications)

  // ── 4. Entries ──
  const entries: OwnershipEntry[] = []
  const asEntry = (
    symbol: string,
    packageName: string,
    classification: Classification,
    extra: Partial<OwnershipEntry> = {},
  ): OwnershipEntry => {
    const paths = [...(subpathsBySymbol.get(symbol) ?? new Set(['.']))].sort(compareSymbols)
    return {
      symbol,
      package: packageName,
      subpath: paths.includes('.') ? '.' : paths[0]!,
      ...(paths.length > 1 || !paths.includes('.') ? { subpaths: paths } : {}),
      kind: classification.kind,
      ...(classification.parentComponent !== undefined
        ? { parentComponent: classification.parentComponent }
        : {}),
      ...extra,
      evidence: classification.evidence,
    }
  }

  for (const [symbol, file] of declaredIn) {
    const path = rel(file)
    const component = classifications.get(symbol)
    if (component !== undefined) {
      const status = stories.get(symbol)?.status
      // A component may declare its styling surface in `Dz{Name}.anatomy.ts`
      // (ADR-19). Most have not yet; the absence is counted by
      // `validate:ownership`, never invented here.
      const declared = readAnatomyFor(file)
      for (const problem of declared.problems)
        note(problem)

      entries.push(asEntry(
        symbol,
        '@dzup-ui/core',
        component,
        {
          ...(status ? { status } : {}),
          ...(declared.anatomy !== undefined ? { anatomy: declared.anatomy } : {}),
        },
      ))
      continue
    }

    if (typeOnly.get(symbol) === true) {
      const evidence = [path]
      if (!manifestTypes.has(symbol))
        evidence.push('type-only export not listed in public-api.manifest.json#exports.types')
      entries.push(asEntry(symbol, '@dzup-ui/core', { kind: 'type', evidence }))
      continue
    }

    if (manifestVariants.has(symbol) || path.endsWith('.variants.ts')) {
      entries.push(asEntry(symbol, '@dzup-ui/core', {
        kind: 'recipe',
        evidence: [path, 'tailwind-variants recipe (ADR-04)'],
      }))
      continue
    }

    if (path.endsWith('.tokens.ts')) {
      entries.push(asEntry(symbol, '@dzup-ui/core', {
        kind: 'token-module',
        evidence: [path, 'component token module (ADR-17)'],
      }))
      continue
    }

    // `use*` is a convention the repo applies without exception, and it is the
    // only authority for the composables that live outside `src/composables/`
    // (`useTheme` ships from `src/providers/`).
    if (COMPOSABLE_NAME_RE.test(symbol)) {
      entries.push(asEntry(symbol, '@dzup-ui/core', {
        kind: 'composable',
        evidence: [
          path,
          path.includes('/composables/')
            ? 'packages/core/manifests/public-api.manifest.json#exports.composables'
            : 'composable naming convention (use* prefix)',
        ],
      }))
      continue
    }

    // `src/generated/` is machine-written integration data — the ownership
    // table the resolver and the Nuxt module read through the `./ownership`
    // subpath. It is a public *path* so our own packages can reach it without
    // importing the component library, but it is not part of the consumer
    // component surface, which is exactly what `internal` means here.
    if (path.includes('/generated/')) {
      entries.push(asEntry(symbol, '@dzup-ui/core', {
        kind: 'internal',
        evidence: [path, 'generated integration data, reachable only from the ./ownership subpath'],
      }))
      continue
    }

    if (INJECTION_KEY_RE.test(symbol)) {
      entries.push(asEntry(symbol, '@dzup-ui/core', {
        kind: 'unclassified',
        evidence: [
          path,
          'compound-component injection key: ownership schema 1.0.0 has no `injection-key` kind. '
          + 'Maintainer decision required — add the kind in 1.1.0 or fold these into `internal`.',
        ],
      }))
      continue
    }

    entries.push(asEntry(symbol, '@dzup-ui/core', {
      kind: 'unclassified',
      evidence: [
        path,
        'runtime export that is not a component, composable, recipe, token module, or type. '
        + 'Ownership schema 1.0.0 has no `utility` kind — maintainer decision required.',
      ],
    }))
  }

  // ── 5. @dzup-ui/compat aliases ──
  for (const { subpath, entry } of declaredEntryPoints(compatDir)) {
    const scan = scanModuleExports(entry)
    for (const [symbol, discovered] of scan.exports) {
      const path = rel(discovered.declaredIn)
      if (!discovered.declaredIn.endsWith('.vue')) {
        entries.push({
          symbol,
          package: '@dzup-ui/compat',
          subpath,
          kind: 'unclassified',
          evidence: [
            path,
            'migration helper that is not an adapter component. '
            + 'Ownership schema 1.0.0 has no `utility` kind — maintainer decision required.',
          ],
        })
        continue
      }

      const imported = CORE_IMPORT_RE.exec(readFileSync(discovered.declaredIn, 'utf8'))?.[1] ?? ''
      const target = imported
        .split(',')
        .map(name => name.trim())
        .find(name => symbol === `${name}Compat`)

      entries.push(target === undefined
        ? {
            symbol,
            package: '@dzup-ui/compat',
            subpath,
            kind: 'unclassified',
            evidence: [path, 'adapter component whose @dzup-ui/core target could not be read from its imports'],
          }
        : {
            symbol,
            package: '@dzup-ui/compat',
            subpath,
            kind: 'compat-alias',
            aliasOf: target,
            evidence: [path, `imports ${target} from @dzup-ui/core`],
          })
    }
  }

  entries.sort((a, b) => compareSymbols(a.symbol, b.symbol) || compareSymbols(a.package, b.package))

  return {
    manifest: {
      schemaVersion: OWNERSHIP_SCHEMA_VERSION,
      tier: 'core',
      sourceCommit: gitHead(),
      generatedFrom: [
        'packages/compat/src/adapters/*.vue',
        'packages/compat/src/index.ts',
        'packages/core/manifests/public-api.manifest.json',
        'packages/core/package.json#exports',
        'packages/core/src/**/*.anatomy.ts',
        'packages/core/src/**/*.vue',
        'packages/core/src/index.ts',
        'packages/core/stories/**/*.stories.ts',
      ],
      entries,
    },
    warnings,
  }
}

/** 2-space JSON with a trailing newline — the repo's committed-artifact format. */
export function serializeManifest(manifest: OwnershipManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const { manifest, warnings } = buildOwnershipManifest()
  const serialized = serializeManifest(manifest)

  const proManifest = process.env[PRO_MANIFEST_ENV]
  const runtime = buildRuntimeLookup(manifest, proManifest)

  if (!process.argv.includes('--check')) {
    writeFileSync(OWNERSHIP_MANIFEST_PATH, serialized, 'utf8')
    mkdirSync(dirname(RUNTIME_LOOKUP_PATH), { recursive: true })
    writeFileSync(RUNTIME_LOOKUP_PATH, runtime.source, 'utf8')
    mkdirSync(dirname(ANATOMY_DATA_PATH), { recursive: true })
    writeFileSync(ANATOMY_DATA_PATH, renderAnatomyData(manifest), 'utf8')
  }

  const counts = new Map<string, number>()
  for (const entry of manifest.entries)
    counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1)

  console.warn(`✓ ownership: ${manifest.entries.length} entries → ${rel(OWNERSHIP_MANIFEST_PATH)}`)
  for (const kind of [...counts.keys()].sort(compareSymbols))
    console.warn(`  ${kind}: ${counts.get(kind)}`)

  console.warn(
    `✓ runtime lookup → ${rel(RUNTIME_LOOKUP_PATH)} (tiers: ${runtime.tiers.join(', ')})`,
  )

  const declaredAnatomy = manifest.entries.filter(entry => entry.anatomy !== undefined).length
  const publicComponents = manifest.entries.filter(entry => entry.kind === 'public-component').length
  console.warn(
    `✓ anatomy data → ${rel(ANATOMY_DATA_PATH)} `
    + `(${declaredAnatomy}/${publicComponents} public components have declared one)`,
  )
  if (!runtime.tiers.includes('pro')) {
    console.warn(
      `  · no Pro tier: set ${PRO_MANIFEST_ENV} to a Pro ownership manifest to include it. `
      + 'Until then every Pro component name resolves to undefined.',
    )
  }
  for (const problem of runtime.problems)
    console.error(`✗ runtime lookup: ${problem}`)

  if (warnings.length > 0) {
    console.warn(`\n${warnings.length} drift note(s) — reported, not resolved:`)
    for (const warning of warnings)
      console.warn(`  · ${warning}`)
  }
}
/* c8 ignore stop */
