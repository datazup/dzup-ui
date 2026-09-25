#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Public API diff for the six published packages (TASK-R1-O3).
 *
 * Reads the surface out of the PACKED declarations (`api-surface.ts`), compares
 * it to a baseline, classifies every change against
 * `packages/contracts/VERSIONING.md`, maps each to the **changeset level that
 * policy requires**, and reports every change no changeset explains.
 *
 * ## The 0.x mapping is not the usual one
 *
 * `VERSIONING.md` §1: while every package is `0.x`, `^0.2.0` resolves to
 * `>=0.2.0 <0.3.0`, so the *minor* position is the only one a caret range
 * protects. A **breaking** change therefore ships as a **minor**, an additive
 * change or a fix as a **patch**, and `major` is refused by
 * `validate:release-policy` because a `major` bump *is* the 1.0 release. Pro's
 * api-diff maps breaking → `major`; porting that mapping verbatim into OSS
 * would have produced a changeset every gate in this repository refuses.
 *
 * ## There is no previous version, and that is the finding
 *
 * `git tag` lists no release tag, nothing has been published (npm 404), and
 * the versions in `package.json` exist only as worktree numbers. So there is no
 * "last release" to diff against, and the tool says so rather than reporting a
 * comfortable zero. Three comparisons are available, and every run states which
 * one it made:
 *
 *   `snapshot`      a recorded surface exists for a ref (`--record` writes one).
 *                   Names, kinds, props, emits, slots and signatures all
 *                   comparable. This is the only full-fidelity mode, and the
 *                   first `--record` on a clean tree is what creates it.
 *   `manifest-only` the baseline is `public-api.manifest.json` at a ref, which
 *                   records NAMES. Additions and removals are real; signature
 *                   changes are undetectable and renames cannot be told from a
 *                   removal plus an addition. Reported, not guessed.
 *   `none`          no baseline at all (the five packages with no manifest).
 *                   Every symbol is reported as unbaselined, never as "added".
 *
 * ## Two further comparisons, both every run
 *
 * **Barrel drift** — what `yarn generate:exports` would actually change.
 * `renderBarrel` produces the exact text the generator would write and this
 * compares it to `packages/core/src/index.ts` **without writing anything**. A
 * dropped star-re-export line is a breaking removal a generator would perform
 * with no changeset behind it. This is the `generate:exports` drift the 1.0
 * exit memo records, measured instead of quoted.
 *
 * **Manifest reconciliation** — packed surface vs the manifest's documented
 * name lists. NOT the same question, and conflating the two was this tool's
 * first bug: the generator star-re-exports components, composables and
 * providers, so those name lists are documentation a star re-export never
 * consults. What the reconciliation measures is how stale that documentation
 * is against the surface a consumer receives.
 *
 * Usage:
 *   yarn release:api-surface:record            # refuses on a dirty tree
 *   yarn release:api-surface:record --force    # records an INADMISSIBLE snapshot
 *   yarn release:api-diff
 *   yarn release:api-diff --against 2d51eec
 *   yarn release:api-diff --out docs/qa/release/<bundle>
 *
 * @module @dzup-ui/tooling/release/api-diff
 */

import type { PackageSurface, SurfaceSymbol } from './api-surface.ts'
import type { SourceBinding } from './binding.ts'
import type { PackedPackage } from './pack.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { renderBarrel } from '../manifest-generator.ts'
import { countKinds, readSurface } from './api-surface.ts'
import { bundleId, gitState, provenanceOf, ROOT } from './binding.ts'
import { cleanStage, packAll, publishedPackages, scratchDir } from './pack.ts'

/** Snapshot file schema version. */
export const SURFACE_SNAPSHOT_SCHEMA = 1

export const SNAPSHOT_DIR = resolve(ROOT, 'packages/tooling/api-surface')
export const CHANGESET_DIR = resolve(ROOT, '.changeset')
export const CORE_MANIFEST = resolve(ROOT, 'packages/core/manifests/public-api.manifest.json')
export const EVIDENCE_DIR = resolve(ROOT, 'docs/qa/release')

// --- The policy mapping (VERSIONING.md §1 and §2) ---

/** What a change does to a consumer, independent of how it is numbered. */
export type Severity = 'breaking' | 'additive' | 'none'

/** The changeset level VERSIONING.md requires for a severity, while 0.x. */
export type Level = 'minor' | 'patch' | 'none'

const LEVEL_ORDER: Level[] = ['none', 'patch', 'minor']

/**
 * Severity → changeset level, under the 0.x policy.
 *
 * `major` is deliberately unreachable: `release-policy.json` sets
 * `allowMajor: false` and `validate:release-policy` refuses a changeset that
 * declares one, because such a bump ships 1.0.0 as a side effect.
 */
export function levelFor(severity: Severity): Level {
  return severity === 'breaking' ? 'minor' : severity === 'additive' ? 'patch' : 'none'
}

/** The stronger of two levels. */
export function maxLevel(a: Level, b: Level): Level {
  return LEVEL_ORDER[Math.max(LEVEL_ORDER.indexOf(a), LEVEL_ORDER.indexOf(b))] as Level
}

/**
 * Whether a member-list change is additive-only.
 *
 * A member added as OPTIONAL cannot break a consumer's object literal; a
 * required addition can, and so can any removal or retype. Under VERSIONING.md
 * §2.1 that is exactly the line between `patch` and `minor`, so it is computed
 * rather than assumed.
 */
export function isWidening(before: string[], after: string[]): boolean {
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  for (const member of beforeSet) {
    if (!afterSet.has(member))
      return false
  }
  for (const member of afterSet) {
    if (!beforeSet.has(member) && !member.includes('?:'))
      return false
  }
  return true
}

export type ChangeKind = 'added' | 'removed' | 'renamed' | 'signature-changed' | 'type-only' | 'unbaselined'

export interface ApiChange {
  package: string
  kind: ChangeKind
  symbol: string
  symbolKind: string
  severity: Severity
  level: Level
  detail: string
}

export type Fidelity = 'snapshot' | 'manifest-only' | 'none'

export interface PackageDiff {
  package: string
  version: string
  fidelity: Fidelity
  baseline: string
  degraded: boolean
  comparedSymbols: number
  changes: ApiChange[]
  requiredLevel: Level
  /** Symbols the baseline could not see at all (manifest-only fidelity). */
  beyondBaseline: Array<{ name: string, kind: string, subpaths: string[] }>
}

/** A readable summary of what moved between two sorted member lists. */
function describeListChange(before: string[], after: string[], widening: boolean): string {
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const gone = before.filter(m => !afterSet.has(m))
  const arrived = after.filter(m => !beforeSet.has(m))
  const parts: string[] = []
  if (arrived.length)
    parts.push(`+${arrived.length} (${arrived.slice(0, 3).join(', ')}${arrived.length > 3 ? ', …' : ''})`)
  if (gone.length)
    parts.push(`−${gone.length} (${gone.slice(0, 3).join(', ')}${gone.length > 3 ? ', …' : ''})`)
  parts.push(widening ? 'additive only' : 'not additive')
  return parts.join(' · ')
}

function change(
  pkg: string,
  kind: ChangeKind,
  symbol: string,
  symbolKind: string,
  severity: Severity,
  detail: string,
): ApiChange {
  return { package: pkg, kind, symbol, symbolKind, severity, level: levelFor(severity), detail }
}

/**
 * Classify the difference between two surfaces.
 *
 * At `manifest-only` fidelity only the **root-reachable** symbols are
 * comparable: a `public-api.manifest.json` records what the root barrel
 * exports, while the packed surface covers every declared entry point. Diffing
 * all of one against the root of the other reports hundreds of "additions" that
 * are a units mismatch dressed up as a finding (Pro measured 1,140). Everything
 * reachable only through another subpath is counted separately, as surface the
 * baseline was never in a position to see.
 */
export function diffSurfaces(
  before: { symbols: SurfaceSymbol[] },
  after: PackageSurface,
  fidelity: Fidelity,
  baseline: string,
): PackageDiff {
  const base: PackageDiff = {
    package: after.package,
    version: after.version,
    fidelity,
    baseline,
    degraded: after.degraded,
    comparedSymbols: 0,
    changes: [],
    requiredLevel: 'none',
    beyondBaseline: [],
  }

  if (fidelity === 'none') {
    base.comparedSymbols = 0
    base.changes = [change(
      after.package,
      'unbaselined',
      `${after.symbols.length} symbol(s)`,
      'surface',
      'none',
      'no baseline of any kind exists for this package — nothing has been published and no snapshot has been recorded. The surface is reported, not diffed.',
    )]
    return base
  }

  const rootOnly = fidelity === 'manifest-only'
  const comparable = rootOnly ? after.symbols.filter(s => s.subpaths.includes('.')) : after.symbols
  const beyond = rootOnly ? after.symbols.filter(s => !s.subpaths.includes('.')) : []
  const beforeByName = new Map(before.symbols.map(s => [s.name, s]))
  const afterByName = new Map(comparable.map(s => [s.name, s]))

  const removed = [...beforeByName.keys()].filter(n => !afterByName.has(n))
  const added = [...afterByName.keys()].filter(n => !beforeByName.has(n))
  const changes: ApiChange[] = []

  /*
   * Rename detection needs signatures, so it only runs at snapshot fidelity.
   * At manifest fidelity a rename is indistinguishable from a removal plus an
   * addition, and reporting it as a rename anyway would be a guess presented as
   * a fact.
   */
  const pairedRemovals = new Set<string>()
  const pairedAdditions = new Set<string>()
  if (fidelity === 'snapshot') {
    for (const removedName of removed) {
      const gone = beforeByName.get(removedName)
      if (!gone)
        continue
      const match = added.find((addedName) => {
        if (pairedAdditions.has(addedName))
          return false
        const arrived = afterByName.get(addedName)
        return arrived?.kind === gone.kind && arrived.signature === gone.signature && gone.signature !== ''
      })
      if (match) {
        pairedRemovals.add(removedName)
        pairedAdditions.add(match)
        changes.push(change(
          after.package,
          'renamed',
          `${removedName} → ${match}`,
          gone.kind,
          'breaking',
          'same kind and identical signature — a rename, not a removal plus an addition (VERSIONING.md §2.1)',
        ))
      }
    }
  }

  for (const name of removed) {
    if (pairedRemovals.has(name))
      continue
    const gone = beforeByName.get(name)
    changes.push(change(
      after.package,
      'removed',
      name,
      gone?.kind ?? 'unknown',
      'breaking',
      gone?.kind
        ? `${gone.kind} no longer exported by the packed declarations`
        : 'no longer in the public surface',
    ))
  }

  for (const name of added) {
    if (pairedAdditions.has(name))
      continue
    const arrived = afterByName.get(name)
    changes.push(change(
      after.package,
      'added',
      name,
      arrived?.kind ?? 'unknown',
      'additive',
      `new ${arrived?.kind ?? 'symbol'} on ${arrived?.subpaths.join(', ') ?? '?'}`,
    ))
  }

  if (fidelity === 'snapshot') {
    for (const [name, arrived] of afterByName) {
      const previous = beforeByName.get(name)
      if (!previous)
        continue

      if (previous.kind !== arrived.kind) {
        changes.push(change(after.package, 'signature-changed', name, arrived.kind, 'breaking', `kind changed: ${previous.kind} → ${arrived.kind}`))
        continue
      }

      if (arrived.kind === 'component') {
        for (const facet of ['props', 'emits', 'slots'] as const) {
          const wasList = previous[facet] ?? []
          const isList = arrived[facet] ?? []
          if (wasList.join('|') === isList.join('|'))
            continue
          /*
           * Only `props` can widen harmlessly. `emits` and `slots` are types
           * the library hands OUT, and VERSIONING.md §2.1 names widening those
           * as breaking in so many words — "widening `file: File` to
           * `file: File | DzFileRef` on a slot is source code the consumer
           * already wrote that no longer type-checks". Pro's tool applies the
           * widening test to props only for the same reason; the difference is
           * that here the rule is written down.
           */
          const widening = facet === 'props' && isWidening(wasList, isList)
          changes.push(change(
            after.package,
            'signature-changed',
            `${name}.$${facet}`,
            'component',
            widening ? 'additive' : 'breaking',
            describeListChange(wasList, isList, widening),
          ))
        }
        continue
      }

      if (previous.signature === arrived.signature)
        continue

      const typeOnly = arrived.kind === 'interface' || arrived.kind === 'type' || arrived.kind === 'enum'
      const wasList = String(previous.signature).split('; ').filter(Boolean)
      const isList = String(arrived.signature).split('; ').filter(Boolean)
      const widening = typeOnly && isWidening(wasList, isList)
      changes.push(change(
        after.package,
        typeOnly ? 'type-only' : 'signature-changed',
        name,
        arrived.kind,
        widening ? 'additive' : 'breaking',
        typeOnly ? describeListChange(wasList, isList, widening) : `${previous.signature} → ${arrived.signature}`,
      ))
    }
  }

  changes.sort((a, b) => (a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : 0))

  base.comparedSymbols = afterByName.size
  base.changes = changes
  base.requiredLevel = changes.reduce<Level>((acc, c) => maxLevel(acc, c.level), 'none')
  base.beyondBaseline = beyond.map(s => ({ name: s.name, kind: s.kind, subpaths: s.subpaths }))
  return base
}

// --- Baselines ---

/** Every symbol name a `public-api.manifest.json` accounts for. */
export function manifestNames(manifest: Record<string, unknown>): Set<string> {
  const names = new Set<string>()
  const exportsField = (manifest.exports ?? {}) as Record<string, unknown>
  for (const group of ['components', 'composables', 'providers', 'utilities']) {
    const entries = (exportsField[group] ?? {}) as Record<string, { exports?: string[] }>
    for (const entry of Object.values(entries)) {
      for (const name of entry.exports ?? [])
        names.add(name)
    }
  }
  for (const group of ['injectionKeys', 'variants', 'types', 'runtimeExports']) {
    for (const name of (exportsField[group] ?? []) as string[])
      names.add(name)
  }
  return names
}

/** Read `packages/core/manifests/public-api.manifest.json` at a git ref, or at HEAD's worktree. */
export function manifestAtRef(ref: string | null): Record<string, unknown> | null {
  if (ref === null)
    return existsSync(CORE_MANIFEST) ? JSON.parse(readFileSync(CORE_MANIFEST, 'utf8')) as Record<string, unknown> : null
  try {
    const raw = execFileSync('git', ['show', `${ref}:packages/core/manifests/public-api.manifest.json`], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
    return JSON.parse(raw) as Record<string, unknown>
  }
  catch {
    return null
  }
}

export interface SnapshotFile {
  snapshotSchema: number
  provenance: ReturnType<typeof provenanceOf>
  surfaces: Record<string, PackageSurface>
}

/** The recorded snapshots, newest-named last. */
export function listSnapshots(): string[] {
  if (!existsSync(SNAPSHOT_DIR))
    return []
  return readdirSync(SNAPSHOT_DIR).filter(f => f.endsWith('.json') && f !== 'index.json').sort()
}

function readSnapshot(file: string): SnapshotFile {
  return JSON.parse(readFileSync(join(SNAPSHOT_DIR, file), 'utf8')) as SnapshotFile
}

// --- Changesets ---

export interface DeclaredLevels {
  /** Package name → the strongest level any pending changeset declares. */
  byPackage: Map<string, Level>
  /** Package name → the changeset files that declare it. */
  filesByPackage: Map<string, string[]>
  /** Changesets declaring `major`, which `validate:release-policy` refuses. */
  majorOffenders: Array<{ file: string, package: string }>
  total: number
}

/** What the pending changesets promise, per package. */
export function declaredLevels(changesetDir: string = CHANGESET_DIR): DeclaredLevels {
  const byPackage = new Map<string, Level>()
  const filesByPackage = new Map<string, string[]>()
  const majorOffenders: Array<{ file: string, package: string }> = []
  let total = 0

  if (!existsSync(changesetDir))
    return { byPackage, filesByPackage, majorOffenders, total }

  for (const file of readdirSync(changesetDir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
    const text = readFileSync(join(changesetDir, file), 'utf8')
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
    if (!frontmatter)
      continue
    total++
    for (const line of (frontmatter[1] ?? '').split(/\r?\n/)) {
      const entry = /^\s*['"]?(@?[\w./-]+)['"]?\s*:\s*(major|minor|patch)\s*$/.exec(line)
      if (!entry)
        continue
      const [, name, declared] = entry
      if (name === undefined || declared === undefined)
        continue
      if (declared === 'major') {
        majorOffenders.push({ file, package: name })
        continue
      }
      byPackage.set(name, maxLevel(byPackage.get(name) ?? 'none', declared as Level))
      filesByPackage.set(name, [...(filesByPackage.get(name) ?? []), file])
    }
  }

  return { byPackage, filesByPackage, majorOffenders, total }
}

// --- The reconciliation ---

export interface Reconciliation {
  package: string
  manifestVersion: string
  packageVersion: string
  /** Exported by the packed build, absent from the manifest's documented name lists. */
  undocumented: Array<{ name: string, kind: string }>
  /** Promised by the manifest's name lists, absent from the packed build. */
  undelivered: string[]
}

/**
 * Packed surface vs `public-api.manifest.json`'s documented name lists.
 *
 * **This is not the `generate:exports` drift** — see `barrelDrift` for that,
 * and the distinction matters because the first version of this function
 * conflated them and reported 455 symbols as "`generate:exports` would delete
 * these". It would not. `manifest-generator.ts` emits
 * `export * from '<family index>'` for components, composables and providers
 * and enumerates names only for `utilities`, so the per-entry `exports` arrays
 * are **documentation of intent**, which a star re-export never consults.
 *
 * What this measures is therefore the staleness of that documentation against
 * the surface a consumer actually receives — the same defect TASK-N2-A1 found
 * ("stale by 43 public components") one level deeper, and the reason
 * `generate:component-meta` was moved off this manifest and onto the ownership
 * manifest. It is a real finding; it is just a different finding.
 *
 * Only root-reachable symbols are compared, for the units reason in
 * `diffSurfaces`: the manifest describes the root barrel.
 */
export function reconcileWithManifest(surface: PackageSurface, manifest: Record<string, unknown>): Reconciliation {
  const declared = manifestNames(manifest)
  const rootSymbols = surface.symbols.filter(s => s.subpaths.includes('.'))
  const exported = new Map(rootSymbols.map(s => [s.name, s]))

  return {
    package: surface.package,
    manifestVersion: String(manifest.version ?? 'unknown'),
    packageVersion: surface.version,
    undocumented: rootSymbols.filter(s => !declared.has(s.name)).map(s => ({ name: s.name, kind: s.kind })),
    undelivered: [...declared].filter(n => !exported.has(n)).sort(),
  }
}

export interface BarrelDrift {
  package: string
  packageDir: string
  /**
   * True when `yarn generate:exports` would neither drop nor add an `export`
   * line. Comments and line order are not API: the hand-kept barrel carries
   * comments the generator strips, and the generator's key order is one the
   * `perfectionist/sort-exports` lint rule rejects, so byte identity is
   * unreachable and was never the release question.
   */
  clean: boolean
  /** `export` lines the current barrel has and a regenerated one would not. */
  wouldDrop: string[]
  /** `export` lines a regenerated barrel would have and the current one does not. */
  wouldAdd: string[]
}

/**
 * What `yarn generate:exports` would actually change — measured, not quoted.
 *
 * `renderBarrel` (split out of `manifest-generator.ts` for this) produces the
 * exact text the generator would write, and this compares it to the file on
 * disk **without writing anything**. A release tool that mutated the tree it is
 * measuring would be the problem, not the measurement.
 *
 * A dropped line is a `export * from '<path>'` the barrel has today and the
 * manifest does not list: running the generator removes every symbol behind it
 * from the public surface. Under VERSIONING.md §2.1 that is a **breaking
 * removal**, requiring a `minor` under the 0.x policy — performed by a
 * generator, with no changeset and no decision behind it. Reported here, never
 * resolved: which side is right (the barrel or the manifest) is an owner call,
 * routed to TASK-R0-O1.
 */
export function barrelDrift(packageDir: string): BarrelDrift {
  const rendered = renderBarrel(resolve(ROOT, packageDir))
  const current = existsSync(rendered.indexPath) ? readFileSync(rendered.indexPath, 'utf8') : ''
  const exportLines = (text: string): Set<string> =>
    new Set(text.split(/\r?\n/).filter(line => line.startsWith('export ')))
  const now = exportLines(current)
  const next = exportLines(rendered.output)
  return {
    package: rendered.package,
    packageDir,
    clean: [...now].every(line => next.has(line)) && [...next].every(line => now.has(line)),
    wouldDrop: [...now].filter(line => !next.has(line)).sort(),
    wouldAdd: [...next].filter(line => !now.has(line)).sort(),
  }
}

// --- Stop conditions ---

export interface StopCondition {
  code: string
  detail: string
}

/**
 * doc 08's release stop conditions this tool can evaluate.
 *
 * It **reports** them; nothing here blocks or auto-fixes. A removal with no
 * changeset behind it is the canonical "unexplained public API diff".
 */
export function stopConditions(
  diffs: PackageDiff[],
  reconciliations: Reconciliation[],
  drifts: BarrelDrift[],
  changesets: DeclaredLevels,
  binding: SourceBinding,
): StopCondition[] {
  const stops: StopCondition[] = []

  if (!binding.admissible) {
    stops.push({
      code: 'dirty-source',
      detail: `${binding.inadmissibleReason}. doc 08: "dirty/unidentified source, generated drift, or evidence bound to a different commit/configuration".`,
    })
  }

  for (const diff of diffs) {
    const breaking = diff.changes.filter(c => c.severity === 'breaking')
    if (breaking.length === 0)
      continue
    const declared = changesets.byPackage.get(diff.package) ?? 'none'
    if (LEVEL_ORDER.indexOf(declared) < LEVEL_ORDER.indexOf(diff.requiredLevel)) {
      stops.push({
        code: 'unexplained-api-diff',
        detail: `${diff.package}: ${breaking.length} breaking change(s) require a \`${diff.requiredLevel}\` changeset; the pending changesets declare \`${declared}\`. First: ${breaking[0]?.kind} ${breaking[0]?.symbol}.`,
      })
    }
  }

  for (const drift of drifts) {
    if (drift.clean)
      continue
    if (drift.wouldDrop.length > 0) {
      stops.push({
        code: 'unexplained-api-diff',
        detail: `${drift.package}: \`yarn generate:exports\` would DROP ${drift.wouldDrop.length} barrel line(s) — every symbol behind them leaves the public surface. Breaking under VERSIONING.md §2.1, requiring a \`minor\`, performed by a generator with no changeset behind it: ${drift.wouldDrop.join(' / ')}. Owner decision, routed to TASK-R0-O1.`,
      })
    }
    if (drift.wouldAdd.length > 0) {
      stops.push({
        code: 'manifest-omission',
        detail: `${drift.package}: \`yarn generate:exports\` would ADD ${drift.wouldAdd.length} barrel line(s) the manifest declares and the barrel does not have: ${drift.wouldAdd.join(' / ')}.`,
      })
    }
  }

  for (const rec of reconciliations) {
    if (rec.undocumented.length > 0) {
      stops.push({
        code: 'manifest-omission',
        detail: `${rec.package}: ${rec.undocumented.length} symbol(s) reach a consumer through the root barrel and are absent from public-api.manifest.json's documented name lists. Not a generator action (the barrel star-re-exports); a stale document other tooling has already been moved off (TASK-N2-A1).`,
      })
    }
    if (rec.undelivered.length > 0) {
      stops.push({
        code: 'manifest-omission',
        detail: `${rec.package}: ${rec.undelivered.length} symbol(s) are promised by public-api.manifest.json and absent from the packed build.`,
      })
    }
  }

  if (changesets.majorOffenders.length > 0) {
    stops.push({
      code: 'illegal-level',
      detail: `${changesets.majorOffenders.length} changeset(s) declare \`major\`, which release-policy.json forbids while allowMajor is false (a major bump IS the 1.0 release).`,
    })
  }

  return stops
}

// --- CLI ---

export interface Args {
  record: boolean
  force: boolean
  against: string | null
  out: string | null
  keep: boolean
}

export function parseArgs(argv: string[]): Args {
  const args: Args = { record: false, force: false, against: null, out: null, keep: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--record') {
      args.record = true
    }
    else if (arg === '--force' || arg === '--force-record') {
      args.record = true
      args.force = true
    }
    else if (arg === '--against') {
      args.against = argv[++i] ?? null
    }
    else if (arg === '--out') {
      args.out = argv[++i] ?? null
    }
    else if (arg === '--keep') {
      args.keep = true
    }
    else {
      throw new Error(`unknown argument: ${arg}`)
    }
  }
  return args
}

export interface DiffReport {
  provenance: ReturnType<typeof provenanceOf>
  packages: PackageDiff[]
  reconciliations: Reconciliation[]
  barrelDrift: BarrelDrift[]
  changesets: {
    total: number
    byPackage: Record<string, Level>
    majorOffenders: Array<{ file: string, package: string }>
  }
  stopConditions: StopCondition[]
  summary: Record<string, { added: number, removed: number, changed: number, requiredLevel: Level, declaredLevel: Level, fidelity: Fidelity }>
}

export function renderMarkdown(report: DiffReport): string {
  const lines: string[] = []
  const p = report.provenance
  lines.push('# API diff — `@dzup-ui/*` published packages')
  lines.push('')
  lines.push(`> Generated ${p.generatedAt} by \`${p.generator}\`.`)
  lines.push(`> Source: \`${p.sourceCommit}\` on \`${p.branch}\` · worktree **${p.worktreeDirty ? `dirty (${p.dirtyCount} path(s))` : 'clean'}** · **admissible: ${p.admissible}**`)
  if (p.inadmissibleReason)
    lines.push(`> ${p.inadmissibleReason}`)
  lines.push('')
  lines.push('| Package | Baseline (fidelity) | Added | Removed | Changed | Level required | Changeset declares |')
  lines.push('|---|---|---|---|---|---|---|')
  for (const [name, s] of Object.entries(report.summary)) {
    const diff = report.packages.find(d => d.package === name)
    lines.push(`| \`${name}\` | ${diff?.baseline ?? '—'} (${s.fidelity}) | ${s.added} | ${s.removed} | ${s.changed} | **${s.requiredLevel}** | ${s.declaredLevel} |`)
  }
  lines.push('')

  lines.push('## `generate:exports` drift — what the generator would actually change')
  lines.push('')
  for (const drift of report.barrelDrift) {
    lines.push(`### \`${drift.package}\` (\`${drift.packageDir}/src/index.ts\`) — ${drift.clean ? '**clean**' : '**drifted**'}`)
    lines.push('')
    if (drift.clean) {
      lines.push('`yarn generate:exports` would neither drop nor add an export line (comments and order are not compared).')
    }
    else {
      lines.push(`- **would DROP ${drift.wouldDrop.length} line(s)** — every symbol behind them leaves the public surface (breaking, VERSIONING.md §2.1, requires \`minor\`):`)
      for (const line of drift.wouldDrop)
        lines.push(`  - \`${line}\``)
      lines.push(`- **would ADD ${drift.wouldAdd.length} line(s)** the manifest declares and the barrel lacks:`)
      for (const line of drift.wouldAdd)
        lines.push(`  - \`${line}\``)
      lines.push('')
      lines.push('  Reported, never resolved: which side is right — the barrel or the manifest — is an owner call, routed to **TASK-R0-O1**.')
    }
    lines.push('')
  }

  lines.push('## Manifest reconciliation — packed surface vs the documented name lists')
  lines.push('')
  lines.push('**A different question from the drift above.** The generator star-re-exports components, composables and providers and enumerates names only for `utilities`, so a manifest name list is documentation a star re-export never consults. These rows measure how stale that documentation is against what a consumer receives.')
  lines.push('')
  for (const rec of report.reconciliations) {
    lines.push(`### \`${rec.package}\` — manifest declares version ${rec.manifestVersion}, package is ${rec.packageVersion}`)
    lines.push('')
    const byKind = rec.undocumented.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.kind] = (acc[entry.kind] ?? 0) + 1
      return acc
    }, {})
    lines.push(`- **${rec.undocumented.length} exported and undocumented**${rec.undocumented.length ? ` — by kind: ${Object.entries(byKind).sort().map(([k, n]) => `${n} ${k}`).join(', ')}` : ''}`)
    lines.push(`- **${rec.undelivered.length} documented and undelivered**${rec.undelivered.length ? `: ${rec.undelivered.map(n => `\`${n}\``).join(', ')}` : ''}`)
    lines.push('')
  }

  lines.push('## Stop conditions (doc 08 §Release stop conditions)')
  lines.push('')
  if (report.stopConditions.length === 0) {
    lines.push('None.')
  }
  else {
    lines.push('| Code | Detail |')
    lines.push('|---|---|')
    for (const stop of report.stopConditions)
      lines.push(`| \`${stop.code}\` | ${stop.detail} |`)
  }
  lines.push('')

  const withChanges = report.packages.filter(d => d.changes.length > 0)
  if (withChanges.length > 0) {
    lines.push('## Changes')
    lines.push('')
    for (const diff of withChanges) {
      lines.push(`### \`${diff.package}\` — ${diff.changes.length} change(s), fidelity \`${diff.fidelity}\``)
      lines.push('')
      lines.push('| Kind | Symbol | Severity | Level | Detail |')
      lines.push('|---|---|---|---|---|')
      for (const c of diff.changes.slice(0, 200))
        lines.push(`| ${c.kind} | \`${c.symbol}\` | ${c.severity} | ${c.level} | ${c.detail.replaceAll('|', '\\|')} |`)
      if (diff.changes.length > 200)
        lines.push(`| … | _${diff.changes.length - 200} more — see the JSON_ | | | |`)
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const binding = gitState()

  if (args.record && !binding.admissible && !args.force) {
    console.error('release:api-surface:record — REFUSED')
    console.error('')
    console.error(`  ${binding.inadmissibleReason}`)
    console.error('')
    console.error('  A recorded surface is the baseline every future release is diffed against.')
    console.error('  A baseline taken from a tree nobody can check out is a number with no')
    console.error('  referent: the next release would report changes against content that')
    console.error('  exists in no commit. doc 08 names this as a release stop condition')
    console.error('  ("dirty/unidentified source").')
    console.error('')
    console.error('  Commit (or stash) first, then re-run. `--force` records an INADMISSIBLE')
    console.error('  snapshot, stamped `admissible: false`, for exercising the machinery only.')
    process.exit(1)
  }

  const stage = scratchDir('dzup-api-surface-')
  let packed: PackedPackage[] = []
  try {
    process.stdout.write('packing the published packages… ')
    packed = packAll(stage)
    console.log(`${packed.length} tarball(s)`)

    const surfaces: Record<string, PackageSurface> = {}
    for (const pkg of packed) {
      const surface = readSurface(pkg.root)
      surfaces[pkg.name] = surface
      const kinds = countKinds(surface)
      console.log(`  ${pkg.name}@${pkg.version}: ${surface.symbols.length} symbol(s) · ${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(' · ')}${surface.degraded ? ' · DEGRADED (module resolution)' : ''}`)
    }

    if (args.record) {
      mkdirSync(SNAPSHOT_DIR, { recursive: true })
      const provenance = provenanceOf('release:api-surface:record', binding)
      const file = join(SNAPSHOT_DIR, `${binding.shortCommit}${binding.admissible ? '' : '-INADMISSIBLE'}.json`)
      const snapshot: SnapshotFile = { snapshotSchema: SURFACE_SNAPSHOT_SCHEMA, provenance, surfaces }
      writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
      console.log('')
      console.log(`recorded → ${file.slice(ROOT.length + 1).replaceAll('\\', '/')}`)
      console.log(`  admissible: ${provenance.admissible}${provenance.admissible ? '' : ` — ${provenance.inadmissibleReason}`}`)
      return
    }

    // --- Baseline selection ---
    const snapshots = listSnapshots()
    const admissibleSnapshots = snapshots.filter(f => !f.includes('INADMISSIBLE'))
    const chosenSnapshot = args.against
      ? snapshots.find(f => f.startsWith(args.against as string))
      : admissibleSnapshots.at(-1)

    const diffs: PackageDiff[] = []
    if (chosenSnapshot) {
      const snapshot = readSnapshot(chosenSnapshot)
      for (const pkg of packed) {
        const before = snapshot.surfaces[pkg.name]
        const after = surfaces[pkg.name] as PackageSurface
        diffs.push(before
          ? diffSurfaces(before, after, 'snapshot', `snapshot ${chosenSnapshot}`)
          : diffSurfaces({ symbols: [] }, after, 'none', `snapshot ${chosenSnapshot} (package absent)`))
      }
    }
    else {
      const manifest = manifestAtRef(args.against)
      for (const pkg of packed) {
        const after = surfaces[pkg.name] as PackageSurface
        if (pkg.name === '@dzup-ui/core' && manifest) {
          const names = [...manifestNames(manifest)].sort()
          diffs.push(diffSurfaces(
            { symbols: names.map(name => ({ name, kind: 'const' as const, subpaths: ['.'], signature: '', source: 'public-api.manifest.json' })) },
            after,
            'manifest-only',
            `public-api.manifest.json@${args.against ?? 'worktree'}`,
          ))
        }
        else {
          diffs.push(diffSurfaces({ symbols: [] }, after, 'none', 'no published version, no snapshot, no manifest'))
        }
      }
    }

    const worktreeManifest = manifestAtRef(null)
    const reconciliations = worktreeManifest
      ? [reconcileWithManifest(surfaces['@dzup-ui/core'] as PackageSurface, worktreeManifest)]
      : []

    /*
     * Only `packages/core` carries a `public-api.manifest.json`, so it is the
     * only package whose barrel a generator writes. The list is derived rather
     * than hard-coded so a second manifest enters the measurement by existing.
     */
    const drifts = publishedPackages()
      .filter(pkg => existsSync(join(pkg.packageDir, 'manifests/public-api.manifest.json')))
      .map(pkg => barrelDrift(pkg.packageDir.slice(ROOT.length + 1).replaceAll('\\', '/')))

    const changesets = declaredLevels()
    const stops = stopConditions(diffs, reconciliations, drifts, changesets, binding)

    const summary: DiffReport['summary'] = {}
    for (const diff of diffs) {
      summary[diff.package] = {
        added: diff.changes.filter(c => c.kind === 'added').length,
        removed: diff.changes.filter(c => c.kind === 'removed' || c.kind === 'renamed').length,
        changed: diff.changes.filter(c => c.kind === 'signature-changed' || c.kind === 'type-only').length,
        requiredLevel: diff.requiredLevel,
        declaredLevel: changesets.byPackage.get(diff.package) ?? 'none',
        fidelity: diff.fidelity,
      }
    }

    const report: DiffReport = {
      provenance: provenanceOf('release:api-diff', binding),
      packages: diffs,
      reconciliations,
      barrelDrift: drifts,
      changesets: {
        total: changesets.total,
        byPackage: Object.fromEntries(changesets.byPackage),
        majorOffenders: changesets.majorOffenders,
      },
      stopConditions: stops,
      summary,
    }

    const outDir = args.out ? resolve(ROOT, args.out) : join(EVIDENCE_DIR, bundleId(binding))
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'api-diff.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    writeFileSync(join(outDir, 'api-diff.md'), renderMarkdown(report), 'utf8')

    console.log('')
    for (const [name, s] of Object.entries(summary))
      console.log(`  ${name.padEnd(20)} +${s.added} −${s.removed} ~${s.changed}  requires ${s.requiredLevel.padEnd(5)} declared ${s.declaredLevel.padEnd(5)} (${s.fidelity})`)
    console.log('')
    for (const drift of drifts)
      console.log(`  generate:exports drift ${drift.package}: ${drift.clean ? 'clean' : `would DROP ${drift.wouldDrop.length} line(s), ADD ${drift.wouldAdd.length}`}`)
    for (const rec of reconciliations)
      console.log(`  manifest reconciliation ${rec.package}: ${rec.undocumented.length} exported-and-undocumented, ${rec.undelivered.length} documented-and-undelivered`)
    console.log('')
    if (stops.length === 0) {
      console.log('  no stop conditions')
    }
    else {
      console.log(`  ${stops.length} STOP CONDITION(S) — reported, not blocked:`)
      for (const stop of stops)
        console.log(`    [${stop.code}] ${stop.detail}`)
    }
    console.log('')
    console.log(`written → ${outDir.slice(ROOT.length + 1).replaceAll('\\', '/')}/api-diff.{json,md}`)
  }
  finally {
    if (args.keep)
      console.log(`scratch kept at ${stage}`)
    else
      cleanStage(stage)
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && /api-diff\.(?:ts|js|mjs)$/.test(process.argv[1].replaceAll('\\', '/'))
if (invokedDirectly)
  main()
