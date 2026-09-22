/**
 * The icon-library duplication gate — TASK-R1-O6, closes N5-04-F4.
 *
 * `packages/core` declares `lucide-vue-next@^0.477.0`; `apps/landing` and
 * `apps/sandbox` declare `^0.475.0`. A caret on a `0.x` version pins the minor,
 * so the two ranges can **never** unify and `yarn.lock` carries both. Two copies
 * of the same icon library have been installed in this repository since at least
 * 2026-09-03 and **nothing in `validate:all` could see it**: `validate:peers`
 * reads `peerDependencies` only, and `validate:externals` checks that what
 * `dist` imports is *declared*, not that it resolves once.
 *
 * What makes this gate different from "count the lockfile entries": the icon
 * library has **two names**. `lucide-vue-next` is deprecated upstream in favour
 * of `@lucide/vue` (`npm view lucide-vue-next@0.477.0 deprecated` →
 * "Package deprecated. Please use @lucide/vue instead."), so a half-finished
 * swap leaves one workspace on each name and *one version of each* — which a
 * naive per-package version count calls clean. The identity set below says the
 * two names are one logical library, and the gate counts across it.
 *
 * The identity set is **declared, not discovered**, for the same reason
 * `validate:registry` declares its three registries: discovery cannot see an
 * absence. `declared-family` is the guard on the declaration — any dependency
 * whose name looks like a lucide package and is not in the set fails, so the
 * set cannot silently go stale when a fourth icon package appears.
 *
 * Reads `yarn.lock`, not `node_modules`: a lockfile is what a consumer's CI
 * installs from, and `node_modules` may be absent, pruned, or (as
 * `test:min-peer` does) temporarily pinned to a floor. When `node_modules` IS
 * present its resolved versions are compared to the lockfile's and any
 * disagreement is reported.
 *
 * **That comparison is a hint, not a second gate — corrected 2026-09-22.** This
 * header used to call it *"a second, independent route to the same fact"*, which
 * overstates it in a way the independent release-exit pass proved: with
 * `yarn.lock` seeded to resolve a single version while `node_modules` still held
 * two, clause 6 printed
 * `! [lock-vs-disk] yarn.lock resolves [0.477.0] but node_modules holds [0.475.0, 0.477.0]`
 * **and the gate exited 0** (finding **S7**). `lock-vs-disk` is `report`-level
 * and cannot fail the build, so a duplication that exists on disk but is hidden
 * by the lockfile passes. The single enforcing route is clause 1
 * (`single-version`) over the lockfile; clause 6 is install hygiene — "your
 * `node_modules` does not match your lock" — and is unfireable at all on a fresh
 * checkout, where `node_modules` is absent and `onDisk` is `null`.
 *
 * Whether it should be able to fail, and on what rule, is decision **D193**.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/peer-icon-duplicates.ts
 *   tsx packages/tooling/src/validators/peer-icon-duplicates.ts --json
 *   tsx packages/tooling/src/validators/peer-icon-duplicates.ts --self-test
 *
 * `--self-test` is the proof the gate fires: it drives each clause with a
 * seeded lockfile and asserts that clause — not merely *some* clause — catches
 * it, and drives a clean single-version fixture that must pass. Exit 1 if any
 * seeded defect survives, or if the clean fixture fails.
 *
 * Exit 1 when the library resolves to more than one version, resolves under
 * more than one name, an undeclared lucide-family package is declared, or a
 * declared range has no lockfile entry.
 *
 * @module @dzup-ui/tooling/validators/peer-icon-duplicates
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

/**
 * The icon library, by every name it has shipped under. These are ONE logical
 * dependency: `@lucide/vue` 1.x is the renamed continuation of
 * `lucide-vue-next` 0.x/1.0 (same repository, `lucide-icons/lucide`,
 * `packages/vue`). More than one *name* resolving at once is a half-finished
 * swap; more than one *version* under any name is the duplication N5-04-F4
 * measured.
 *
 * Adding a name here is a deliberate act: it declares that the new package is
 * the same library and therefore must not coexist with the others.
 */
export const ICON_LIBRARIES: readonly string[] = ['lucide-vue-next', '@lucide/vue']

/**
 * Names in {@link ICON_LIBRARIES} that npm marks deprecated. Reported, not
 * failed — currency is TASK-R1-O6 decision item 1, an owner decision. The day
 * it is taken, the entry moves out of this list and into history.
 */
export const DEPRECATED_ICON_LIBRARIES: readonly string[] = ['lucide-vue-next']

/**
 * Anything matching this is *probably* the icon library under a name the set
 * does not know. It exists so the declaration above cannot go stale silently.
 */
const ICON_FAMILY_PATTERN = /(?:^|\/)lucide(?:-|$)|^@lucide\//

/**
 * Manifests this repository **ships to consumers** but does not install: they
 * sit outside the `packages/*` / `apps/*` workspace globs, so `yarn.lock` knows
 * nothing about them and the duplication clauses cannot see them.
 *
 * There is exactly one today — the playground template a visitor downloads —
 * and it declares `lucide-vue-next@^0.475.0` while `packages/core` declares
 * `^0.477.0`. That drift is reported. What is an **error** is an *ident*
 * disagreement: if the workspaces swap to `@lucide/vue` and this file is
 * forgotten, every playground user installs a package npm has deprecated, and
 * every other clause here would be green about it.
 */
export const SHIPPED_MANIFESTS: readonly string[] = ['apps/landing/playground-template/package.json']

/**
 * Generated consumer surfaces that name the icon package by hand-off rather
 * than by install: the shadcn registry payloads under `apps/landing/public/r/`.
 * A `shadcn add` **copies** the listed `dependencies` and the inlined source
 * into a consumer's repository, and that copy is irrevocable (A4-F5) — so a
 * registry regenerated before a swap, or not regenerated after one, hands a
 * deprecated package to every consumer who installs a block.
 *
 * Reported, not failed: these are build output, `validate:registry` owns their
 * internal consistency, and the fix is always "re-run the generator", never
 * "edit the file".
 */
const REGISTRY_DIR = 'apps/landing/public/r'

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

// --- Types ---

export type IconViolationLevel = 'error' | 'report'

export interface IconViolation {
  rule:
    | 'single-version'
    | 'single-ident'
    | 'declared-family'
    | 'lockfile-coverage'
    | 'shipped-manifest-ident'
    | 'deprecated-ident'
    | 'lock-vs-disk'
    | 'shipped-manifest-range'
    | 'generated-surface-drift'
  level: IconViolationLevel
  message: string
}

/** One resolved lockfile entry for a package in the identity set. */
export interface LockResolution {
  /** The package name, e.g. `lucide-vue-next`. */
  ident: string
  /** Every descriptor (range) that resolves to this entry. */
  ranges: string[]
  /** The concrete version the lockfile pins. */
  version: string
}

/** One workspace manifest's declaration of an icon package. */
export interface IconDeclaration {
  /** The declaring workspace's package name. */
  workspace: string
  /** The manifest path, relative to the repository root. */
  manifest: string
  field: (typeof DEPENDENCY_FIELDS)[number]
  ident: string
  range: string
}

export interface IconDuplicateReport {
  resolutions: LockResolution[]
  declarations: IconDeclaration[]
  /** Distinct concrete versions across every name in the identity set. */
  versions: string[]
  /** Distinct names in the identity set that resolve at all. */
  idents: string[]
  violations: IconViolation[]
}

// --- Lockfile ---

/**
 * Splits a Yarn descriptor (`@lucide/vue@npm:^1.0.0`) into ident and range.
 * The ident may itself begin with `@`, so the split is on the LAST `@` that is
 * not at index 0.
 */
export function splitDescriptor(descriptor: string): { ident: string, range: string } {
  const at = descriptor.lastIndexOf('@')
  if (at <= 0)
    return { ident: descriptor, range: '' }
  return { ident: descriptor.slice(0, at), range: normaliseRange(descriptor.slice(at + 1)) }
}

/**
 * Drops the `npm:` protocol Yarn writes into every registry descriptor, so a
 * lockfile range compares equal to the range a `package.json` declares. Other
 * protocols (`workspace:`, `patch:`, `portal:`) are meaningful and kept.
 */
export function normaliseRange(range: string): string {
  return range.startsWith('npm:') ? range.slice(4) : range
}

/**
 * Parses the entries of a Yarn 4 lockfile that belong to `idents`.
 *
 * Deliberately a line reader rather than a YAML dependency: `packages/tooling`
 * has no YAML parser, the lockfile's shape is fixed by Yarn, and a gate that
 * needs a new dependency to check dependencies is its own kind of joke.
 */
export function parseLockfile(text: string, idents: readonly string[] = ICON_LIBRARIES): LockResolution[] {
  const wanted = new Set(idents)
  const out: LockResolution[] = []
  const lines = text.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    // A block header sits at column 0 and ends in a colon.
    if (line.length === 0 || /^\s/.test(line) || !line.endsWith(':'))
      continue

    const header = line.slice(0, -1).replace(/^"|"$/g, '')
    const descriptors = header.split(',').map(d => d.trim().replace(/^"|"$/g, '')).filter(Boolean)
    const parsed = descriptors.map(splitDescriptor)
    if (!parsed.some(p => wanted.has(p.ident)))
      continue

    let version = ''
    for (let j = i + 1; j < lines.length; j++) {
      const body = lines[j] ?? ''
      if (body.length > 0 && !/^\s/.test(body))
        break
      const m = /^\s+version:\s*"?([^"\s]+)"?\s*$/.exec(body)
      if (m?.[1] !== undefined) {
        version = m[1]
        break
      }
    }

    const ident = parsed.find(p => wanted.has(p.ident))?.ident ?? ''
    out.push({ ident, ranges: parsed.filter(p => p.ident === ident).map(p => p.range), version })
  }

  return out
}

// --- Manifests ---

interface Manifest {
  name?: string
  private?: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

function readManifest(path: string): Manifest | null {
  if (!existsSync(path))
    return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Manifest
  }
  catch {
    return null
  }
}

/** Every workspace manifest path in the repository, root first. */
export function workspaceManifests(root: string = ROOT): string[] {
  const out = [resolve(root, 'package.json')]
  for (const group of ['packages', 'apps']) {
    const dir = resolve(root, group)
    if (!existsSync(dir))
      continue
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const manifest = resolve(dir, entry.name, 'package.json')
      if (existsSync(manifest))
        out.push(manifest)
    }
  }
  return out
}

/**
 * Collects every declaration of a package in the identity set, plus every
 * declaration of a lucide-family package that is NOT in the set.
 */
export function collectDeclarations(
  manifestPaths: readonly string[],
  root: string = ROOT,
  idents: readonly string[] = ICON_LIBRARIES,
): { declared: IconDeclaration[], undeclaredFamily: IconDeclaration[] } {
  const wanted = new Set(idents)
  const declared: IconDeclaration[] = []
  const undeclaredFamily: IconDeclaration[] = []

  for (const path of manifestPaths) {
    const pkg = readManifest(path)
    if (pkg === null)
      continue
    const rel = path.slice(root.length).replace(/\\/g, '/').replace(/^\//, '')
    for (const field of DEPENDENCY_FIELDS) {
      for (const [ident, range] of Object.entries(pkg[field] ?? {})) {
        const row: IconDeclaration = { workspace: pkg.name ?? rel, manifest: rel, field, ident, range }
        if (wanted.has(ident))
          declared.push(row)
        else if (ICON_FAMILY_PATTERN.test(ident))
          undeclaredFamily.push(row)
      }
    }
  }

  return { declared, undeclaredFamily }
}

/**
 * Icon declarations in manifests this repository SHIPS but does not install
 * ({@link SHIPPED_MANIFESTS}). Returned separately from the workspace
 * declarations because they are not in `yarn.lock` and must not feed the
 * duplication count — they are a consumer surface, not an install.
 */
export function collectShippedDeclarations(
  root: string = ROOT,
  manifests: readonly string[] = SHIPPED_MANIFESTS,
  idents: readonly string[] = ICON_LIBRARIES,
): IconDeclaration[] {
  const wanted = new Set(idents)
  const out: IconDeclaration[] = []
  for (const rel of manifests) {
    const pkg = readManifest(resolve(root, rel))
    if (pkg === null)
      continue
    for (const field of DEPENDENCY_FIELDS) {
      for (const [ident, range] of Object.entries(pkg[field] ?? {})) {
        if (wanted.has(ident))
          out.push({ workspace: pkg.name ?? rel, manifest: rel, field, ident, range })
      }
    }
  }
  return out
}

/**
 * How many generated shadcn-registry items name each icon ident in their
 * `dependencies`. A `shadcn add` copies those into a consumer's repository, so
 * a registry that disagrees with the workspace hands out the wrong package.
 * Returns an empty map when the registry has not been built.
 */
export function registryIdentCounts(
  root: string = ROOT,
  dir: string = REGISTRY_DIR,
  idents: readonly string[] = ICON_LIBRARIES,
): ReadonlyMap<string, number> {
  const wanted = new Set(idents)
  const counts = new Map<string, number>()
  const abs = resolve(root, dir)
  if (!existsSync(abs))
    return counts
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json'))
      continue
    let item: { name?: string, dependencies?: unknown }
    try {
      item = JSON.parse(readFileSync(resolve(abs, entry.name), 'utf-8')) as typeof item
    }
    catch {
      continue
    }
    if (typeof item.name !== 'string' || !Array.isArray(item.dependencies))
      continue
    for (const dep of item.dependencies) {
      const ident = String(dep).replace(/@[^@/]*$/, '')
      if (wanted.has(String(dep)))
        counts.set(String(dep), (counts.get(String(dep)) ?? 0) + 1)
      else if (wanted.has(ident))
        counts.set(ident, (counts.get(ident) ?? 0) + 1)
    }
  }
  return counts
}

// --- The check ---

/**
 * The whole gate, over data rather than over the filesystem, so the self-test
 * and the unit spec can drive it with seeded lockfiles.
 *
 * @param lockText the `yarn.lock` contents
 * @param declared every declaration of a package in the identity set
 * @param undeclaredFamily lucide-family declarations the identity set does not know
 * @param onDisk optional `ident -> versions found in node_modules`, the second route
 * @param idents the identity set to count across
 * @param shipped declarations in manifests shipped to consumers but not installed
 * @param registry `ident -> count` of generated registry items naming each ident
 */
export function checkIconDuplicates(
  lockText: string,
  declared: readonly IconDeclaration[],
  undeclaredFamily: readonly IconDeclaration[] = [],
  onDisk: ReadonlyMap<string, readonly string[]> | null = null,
  idents: readonly string[] = ICON_LIBRARIES,
  shipped: readonly IconDeclaration[] = [],
  registry: ReadonlyMap<string, number> = new Map(),
): IconDuplicateReport {
  const resolutions = parseLockfile(lockText, idents)
  const versions = [...new Set(resolutions.map(r => r.version).filter(Boolean))].sort()
  const resolvedIdents = [...new Set(resolutions.map(r => r.ident).filter(Boolean))].sort()
  const violations: IconViolation[] = []

  // 1. single-version — the finding this gate exists for.
  if (versions.length > 1) {
    const detail = resolutions
      .map((r) => {
        const who = declared
          .filter(d => d.ident === r.ident && r.ranges.includes(d.range))
          .map(d => `${d.workspace} (${d.manifest})`)
        return `      ${r.ident}@${r.version}  declared as ${r.ranges.map(x => `"${x}"`).join(', ')}`
          + `${who.length > 0 ? ` by ${who.join(', ')}` : ''}`
      })
      .join('\n')
    violations.push({
      rule: 'single-version',
      level: 'error',
      message: `${versions.length} versions of the icon library resolve (${versions.join(', ')}); exactly 1 may.\n${detail}`,
    })
  }

  // 2. single-ident — a half-finished swap is worse than either end of it.
  if (resolvedIdents.length > 1) {
    violations.push({
      rule: 'single-ident',
      level: 'error',
      message: `the icon library resolves under ${resolvedIdents.length} names at once (${resolvedIdents.join(', ')}); `
        + 'these are the same library and only one may be installed. A swap is finished or it is not started.',
    })
  }

  // 3. declared-family — the identity set must not go stale silently.
  for (const row of undeclaredFamily) {
    violations.push({
      rule: 'declared-family',
      level: 'error',
      message: `${row.workspace} (${row.manifest}) declares "${row.ident}" in ${row.field}, which looks like the icon `
        + `library under a name ICON_LIBRARIES does not know. Add it to the identity set in `
        + 'packages/tooling/src/validators/peer-icon-duplicates.ts, or remove the dependency.',
    })
  }

  // 4. lockfile-coverage — a declaration with no lockfile entry means a stale lock.
  for (const row of declared) {
    const covered = resolutions.some(r => r.ident === row.ident && r.ranges.includes(row.range))
    if (!covered) {
      violations.push({
        rule: 'lockfile-coverage',
        level: 'error',
        message: `${row.workspace} (${row.manifest}) declares ${row.ident}@"${row.range}" in ${row.field}, `
          + 'and yarn.lock has no entry resolving it — the lockfile is stale. Run `yarn install`.',
      })
    }
  }

  // 5. deprecated-ident — reported, because currency is an owner decision.
  for (const ident of resolvedIdents) {
    if (DEPRECATED_ICON_LIBRARIES.includes(ident)) {
      violations.push({
        rule: 'deprecated-ident',
        level: 'report',
        message: `${ident} is deprecated upstream ("Package deprecated. Please use @lucide/vue instead."). `
          + 'TASK-R1-O6 decision item 1 decides the swap; this line is not a failure.',
      })
    }
  }

  // 6. lock-vs-disk — install hygiene, NOT a second gate (S7, D193). It is
  //    `report` on purpose and cannot fail the build: node_modules is not a
  //    governed artifact, it is absent entirely on a fresh checkout (onDisk ===
  //    null, so this clause is unreachable exactly where a gate matters most),
  //    and `test:min-peer` makes it disagree deliberately. The cost is real and
  //    named: a duplication present on disk but hidden by the lockfile passes.
  if (onDisk !== null) {
    const diskVersions = [...new Set([...onDisk.values()].flat())].sort()
    if (diskVersions.length > 0 && diskVersions.join(',') !== versions.join(',')) {
      violations.push({
        rule: 'lock-vs-disk',
        level: 'report',
        message: `yarn.lock resolves [${versions.join(', ')}] but node_modules holds [${diskVersions.join(', ')}]. `
          + 'A floor lane (test:min-peer) or a partial install can cause this; the lockfile is the gate\'s truth. '
          + 'REPORT ONLY — this line cannot fail the build (D193), so a duplication on disk that the '
          + 'lockfile hides passes clause 1. Run `yarn install` before trusting a green run.',
      })
    }
  }

  // 7. shipped-manifest-ident — a manifest this repo HANDS OUT but never
  //    installs. The lockfile cannot see it, so no clause above can. An ident
  //    the workspaces no longer use means the swap stopped halfway and every
  //    consumer who downloads the template installs the abandoned package.
  const workspaceIdents = new Set(declared.map(d => d.ident))
  for (const row of shipped) {
    if (workspaceIdents.size > 0 && !workspaceIdents.has(row.ident)) {
      violations.push({
        rule: 'shipped-manifest-ident',
        level: 'error',
        message: `${row.manifest} ships ${row.ident}@"${row.range}" to consumers, but no workspace `
          + `declares ${row.ident} any more (the workspaces are on ${[...workspaceIdents].join(', ')}). `
          + 'This file is not in yarn.lock, so nothing else here can see it: swap it in lockstep.',
      })
      continue
    }
    const workspaceRanges = [...new Set(declared.filter(d => d.ident === row.ident).map(d => d.range))]
    if (workspaceRanges.length > 0 && !workspaceRanges.includes(row.range)) {
      violations.push({
        rule: 'shipped-manifest-range',
        level: 'report',
        message: `${row.manifest} ships ${row.ident}@"${row.range}" while the workspaces declare `
          + `${workspaceRanges.map(r => `"${r}"`).join(', ')}. Reported, not failed — a template is `
          + 'allowed to lag, but it is the surface a consumer copies.',
      })
    }
  }

  // 8. generated-surface-drift — the shadcn registry COPIES its dependencies
  //    into a consumer's repository and that copy is irrevocable (A4-F5). Its
  //    freshness is validate:registry's job; naming the wrong package is this
  //    gate's business. Report-level: the fix is always "re-run the generator".
  for (const [ident, count] of registry) {
    if (workspaceIdents.size > 0 && !workspaceIdents.has(ident)) {
      violations.push({
        rule: 'generated-surface-drift',
        level: 'report',
        message: `${count} generated registry item(s) under ${REGISTRY_DIR} still name ${ident} in their `
          + `dependencies, but the workspaces are on ${[...workspaceIdents].join(', ')}. `
          + 'Re-run `yarn build:registry` — a `shadcn add` copies this list into a consumer repo.',
      })
    }
    else if (DEPRECATED_ICON_LIBRARIES.includes(ident)) {
      violations.push({
        rule: 'generated-surface-drift',
        level: 'report',
        message: `${count} generated registry item(s) under ${REGISTRY_DIR} hand consumers a dependency `
          + `on ${ident}, which npm has deprecated. Consequence of the open decision, not a defect here.`,
      })
    }
  }

  return { resolutions, declarations: [...declared], versions, idents: resolvedIdents, violations }
}

/** Reads the repository and runs the gate. */
export function checkRepository(root: string = ROOT): IconDuplicateReport {
  const lockPath = resolve(root, 'yarn.lock')
  const lockText = existsSync(lockPath) ? readFileSync(lockPath, 'utf-8') : ''
  const { declared, undeclaredFamily } = collectDeclarations(workspaceManifests(root), root)
  return checkIconDuplicates(
    lockText,
    declared,
    undeclaredFamily,
    diskVersions(root),
    ICON_LIBRARIES,
    collectShippedDeclarations(root),
    registryIdentCounts(root),
  )
}

/**
 * The second route: what is actually unpacked. Walks the root and every
 * workspace's `node_modules` for each name in the identity set. Returns null
 * when nothing is installed, so a fresh clone does not manufacture a finding.
 */
export function diskVersions(root: string = ROOT): ReadonlyMap<string, readonly string[]> | null {
  const found = new Map<string, string[]>()
  const roots = [root, ...workspaceManifests(root).map(p => dirname(p))]
  for (const base of new Set(roots)) {
    for (const ident of ICON_LIBRARIES) {
      const pkg = readManifest(resolve(base, 'node_modules', ...ident.split('/'), 'package.json'))
      const version = (pkg as { version?: string } | null)?.version
      if (typeof version === 'string') {
        const list = found.get(ident) ?? []
        if (!list.includes(version))
          list.push(version)
        found.set(ident, list)
      }
    }
  }
  return found.size === 0 ? null : found
}

// --- Self-test ---

export interface Seed {
  rule: IconViolation['rule'] | 'none'
  name: string
  lock: string
  declared: IconDeclaration[]
  undeclaredFamily?: IconDeclaration[]
  shipped?: IconDeclaration[]
  registry?: Map<string, number>
}

function decl(workspace: string, ident: string, range: string): IconDeclaration {
  return { workspace, manifest: `${workspace}/package.json`, field: 'dependencies', ident, range }
}

function shippedDecl(manifest: string, ident: string, range: string): IconDeclaration {
  return { workspace: 'dzup-ui-playground', manifest, field: 'dependencies', ident, range }
}

const CLEAN_LOCK = `__metadata:
  version: 10

"lucide-vue-next@npm:^0.477.0":
  version: 0.477.0
  resolution: "lucide-vue-next@npm:0.477.0"
  languageName: node
`

/** One seeded defect per clause, plus a clean control that must pass. */
export function seeds(): Seed[] {
  return [
    {
      rule: 'single-version',
      name: 'two versions of lucide-vue-next (the state at 527dbd1)',
      lock: `${CLEAN_LOCK}
"lucide-vue-next@npm:^0.475.0":
  version: 0.475.0
  resolution: "lucide-vue-next@npm:0.475.0"
  languageName: node
`,
      declared: [decl('@dzup-ui/core', 'lucide-vue-next', '^0.477.0'), decl('@dzup-ui/landing', 'lucide-vue-next', '^0.475.0')],
    },
    {
      rule: 'single-ident',
      name: 'a half-finished swap: one version of each name',
      lock: `${CLEAN_LOCK}
"@lucide/vue@npm:^1.47.0":
  version: 1.47.0
  resolution: "@lucide/vue@npm:1.47.0"
  languageName: node
`,
      declared: [decl('@dzup-ui/core', '@lucide/vue', '^1.47.0'), decl('@dzup-ui/landing', 'lucide-vue-next', '^0.477.0')],
    },
    {
      rule: 'declared-family',
      name: 'a lucide package the identity set does not know',
      lock: CLEAN_LOCK,
      declared: [decl('@dzup-ui/core', 'lucide-vue-next', '^0.477.0')],
      undeclaredFamily: [decl('@dzup-ui/landing', 'lucide-static', '^0.500.0')],
    },
    {
      rule: 'lockfile-coverage',
      name: 'a declared range with no lockfile entry',
      lock: CLEAN_LOCK,
      declared: [decl('@dzup-ui/core', 'lucide-vue-next', '^0.477.0'), decl('@dzup-ui/docs', 'lucide-vue-next', '^0.480.0')],
    },
    {
      rule: 'shipped-manifest-ident',
      name: 'the workspaces swapped and the playground template was forgotten',
      lock: `__metadata:
  version: 10

"@lucide/vue@npm:^1.47.0":
  version: 1.47.0
  resolution: "@lucide/vue@npm:1.47.0"
  languageName: node
`,
      declared: [decl('@dzup-ui/core', '@lucide/vue', '^1.47.0')],
      shipped: [shippedDecl('apps/landing/playground-template/package.json', 'lucide-vue-next', '^0.475.0')],
    },
    {
      rule: 'none',
      name: 'the control: one name, one version, fully covered, template and registry agreeing',
      lock: CLEAN_LOCK,
      declared: [decl('@dzup-ui/core', 'lucide-vue-next', '^0.477.0')],
      shipped: [shippedDecl('apps/landing/playground-template/package.json', 'lucide-vue-next', '^0.477.0')],
      registry: new Map([['lucide-vue-next', 40]]),
    },
  ]
}

export interface SeedResult {
  rule: Seed['rule']
  name: string
  caught: boolean
  firedRules: string[]
}

export function runSeeds(): SeedResult[] {
  return seeds().map((seed) => {
    const report = checkIconDuplicates(
      seed.lock,
      seed.declared,
      seed.undeclaredFamily ?? [],
      null,
      ICON_LIBRARIES,
      seed.shipped ?? [],
      seed.registry ?? new Map(),
    )
    const errors = report.violations.filter(v => v.level === 'error')
    const firedRules = errors.map(v => v.rule)
    const caught = seed.rule === 'none' ? errors.length === 0 : firedRules.includes(seed.rule)
    return { rule: seed.rule, name: seed.name, caught, firedRules }
  })
}

// --- CLI ---

/* c8 ignore start */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  if (process.argv.includes('--self-test')) {
    const results = runSeeds()
    console.warn('Icon-library duplication gate — seeded defects\n')
    for (const r of results) {
      console.warn(`  ${r.caught ? '✓' : '✗'} [${r.rule}] ${r.name}`)
      if (!r.caught) {
        console.error(`      fired instead: ${r.firedRules.join(', ') || '<nothing>'}`)
      }
    }
    const missed = results.filter(r => !r.caught)
    if (missed.length > 0) {
      console.error(`\n${missed.length} seeded case(s) behaved wrongly. A clause that cannot be `
        + 'made to fail — or one that fires on a clean tree — is not a gate.')
      process.exit(1)
    }
    const defects = results.filter(r => r.rule !== 'none').length
    const controls = results.length - defects
    console.warn(`\n✓ all ${results.length} seeded cases behaved: ${defects} defects caught by their own `
      + `clause, ${controls} clean control${controls === 1 ? '' : 's'} passed.`)
    process.exit(0)
  }

  const report = checkRepository()

  if (process.argv.includes('--json')) {
    console.warn(JSON.stringify(report, null, 2))
    process.exit(report.violations.some(v => v.level === 'error') ? 1 : 0)
  }

  console.warn('Icon-library duplication — TASK-R1-O6 (N5-04-F4)\n')
  console.warn(`  identity set: ${ICON_LIBRARIES.join(' = ')}`)
  console.warn(`  ${report.resolutions.length} lockfile entr(ies) · ${report.versions.length} distinct version(s) · `
    + `${report.idents.length} name(s) · ${report.declarations.length} declaration(s)`)
  for (const r of report.resolutions)
    console.warn(`    ${`${r.ident}@${r.version}`.padEnd(30)} ${r.ranges.map(x => `"${x}"`).join(', ')}`)
  for (const d of report.declarations)
    console.warn(`    ${d.workspace.padEnd(22)} ${d.field.padEnd(17)} ${d.ident}@"${d.range}"`)

  // Surfaces the lockfile cannot see, printed so a swap cannot forget them.
  const shipped = collectShippedDeclarations()
  const registry = registryIdentCounts()
  if (shipped.length > 0 || registry.size > 0) {
    console.warn('\n  shipped to consumers, not installed here:')
    for (const s of shipped)
      console.warn(`    ${s.manifest.padEnd(48)} ${s.ident}@"${s.range}"`)
    for (const [ident, count] of registry)
      console.warn(`    ${`${REGISTRY_DIR}/*.json`.padEnd(48)} ${ident} in ${count} item(s)`)
  }

  const errors = report.violations.filter(v => v.level === 'error')
  const reports = report.violations.filter(v => v.level === 'report')

  for (const r of reports)
    console.warn(`\n  ! [${r.rule}] ${r.message}`)

  if (errors.length === 0) {
    console.warn('\n✓ icon library: one name, one version.')
    process.exit(0)
  }

  console.error('')
  for (const e of errors)
    console.error(`✗ [${e.rule}] ${e.message}`)
  console.error(`\n${errors.length} icon-library violation(s). Run with --self-test to see the gate fire on seeded defects.`)
  process.exit(1)
}
/* c8 ignore stop */
