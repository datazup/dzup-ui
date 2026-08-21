/**
 * Ownership manifest validator (TASK-OSS-P0-01).
 *
 * Four gates, in the order a reviewer would apply them:
 *
 *   1. **freshness** — the committed manifest equals what the generator produces
 *      now. `sourceCommit` is excluded from that comparison: it records which
 *      checkout produced the file, and gating on it would fail the validator on
 *      every unrelated commit while proving nothing about the entries.
 *   2. **schema** — every entry satisfies `ownership-manifest.schema.json`,
 *      checked against the same field rules the schema states. (Hand-rolled: the
 *      repo ships no JSON Schema runtime, and adding one to validate a file this
 *      tool also generates would buy nothing.)
 *   3. **referential integrity** — a `compound-part` names a `public-component`
 *      parent; a `compat-alias` names a symbol that exists.
 *   4. **unclassified ratchet** — the count of entries no authority could settle
 *      may fall, never rise, against `ownership/unclassified-ceiling.json`.
 *   5. **runtime lookup freshness** — `packages/core/src/generated/component-ownership.ts`,
 *      which the auto-import resolver reads, equals what the same manifest
 *      produces now. It is regenerated with the tiers the committed file itself
 *      records, so a machine without a Pro checkout does not fail a file that
 *      was generated with one; if the file claims a Pro tier and no Pro
 *      manifest is available, that is reported as a missing input rather than
 *      as drift.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/ownership-manifest.ts
 *
 * Exit code 1 if violations found.
 */

import type { OwnershipEntry, OwnershipManifest } from '../ownership/ownership-manifest.types.ts'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
// Relative into contracts' SOURCE, not the `@dzup-ui/contracts` specifier: this
// validator runs under `tsx` with no build step, and the package specifier
// resolves through node to `packages/contracts/dist/`, which a fresh clone has
// not built. Every other tooling reference to contracts is type-only and so
// erases; this one is a runtime value.
import { ANATOMY_PART_VOCABULARY } from '../../../contracts/src/anatomy.types.ts'
import { referencedComponentTokens } from '../ownership/anatomy-source.ts'
import { renderAnatomyData } from '../ownership/emit-anatomy-data.ts'
import {
  ANATOMY_DATA_PATH,
  buildOwnershipManifest,
  buildRuntimeLookup,
  OWNERSHIP_MANIFEST_PATH,
  PRO_MANIFEST_ENV,
  ROOT,
  RUNTIME_LOOKUP_PATH,
  serializeManifest,
} from '../ownership/generate-ownership-manifest.ts'
import {
  compareSymbols,
  OWNERSHIP_KINDS,
  OWNERSHIP_SCHEMA_VERSION,
  OWNERSHIP_STATUSES,
} from '../ownership/ownership-manifest.types.ts'

export const CEILING_PATH = resolve(ROOT, 'packages/tooling/src/ownership/unclassified-ceiling.json')

export interface OwnershipViolation {
  rule: string
  message: string
}

interface Ceiling {
  /** Highest number of `unclassified` entries this repository still tolerates. */
  maxUnclassified: number
  /**
   * Highest number of public components still allowed to ship with no declared
   * anatomy (TASK-OSS-P3-02, ADR-19).
   *
   * The packet's requirement is "the validator fails on a public component with
   * neither anatomy nor an explicit none". Applied literally on the day it was
   * written, that fails on 142 of 143 components and the gate has to be turned
   * off — which is not a gate. So it is a ratchet, like `maxUnclassified` beside
   * it: a component that declares an anatomy lowers the number, and nothing may
   * raise it.
   */
  maxWithoutAnatomy: number
}

/** Everything except `sourceCommit`, which is provenance rather than content. */
function comparable(manifest: OwnershipManifest): string {
  return serializeManifest({ ...manifest, sourceCommit: 'excluded-from-freshness-diff' })
}

/** The schema's field rules, applied entry by entry. */
export function checkEntry(entry: OwnershipEntry, index: number): OwnershipViolation[] {
  const at = `entries[${index}] (${entry.symbol || '<unnamed>'})`
  const violations: OwnershipViolation[] = []
  const require = (rule: string, ok: boolean, message: string): void => {
    if (!ok)
      violations.push({ rule, message: `${at}: ${message}` })
  }

  require('schema', typeof entry.symbol === 'string' && entry.symbol.length > 0, 'symbol is required')
  require('schema', /^@[a-z0-9-]+\/[a-z0-9-]+$/.test(entry.package ?? ''), `package "${entry.package}" is not a scoped package name`)
  require('schema', /^\.(?:\/[\w.-]+)*$/.test(entry.subpath ?? ''), `subpath "${entry.subpath}" is not an exports subpath`)
  require('schema', OWNERSHIP_KINDS.includes(entry.kind), `kind "${entry.kind}" is not a known kind`)
  require('schema', Array.isArray(entry.evidence) && entry.evidence.length > 0, 'evidence must name at least one authority')
  require(
    'schema',
    entry.status === undefined || OWNERSHIP_STATUSES.includes(entry.status),
    `status "${entry.status}" is not a known maturity`,
  )
  require(
    'schema',
    entry.kind !== 'compound-part' || entry.parentComponent !== undefined,
    'a compound-part must name its parentComponent',
  )
  require(
    'schema',
    entry.kind !== 'compat-alias' || entry.aliasOf !== undefined,
    'a compat-alias must name the symbol it aliases',
  )

  return violations
}

/** Rules that need the whole manifest: parent and alias targets must exist and be right. */
export function checkReferences(manifest: OwnershipManifest): OwnershipViolation[] {
  const violations: OwnershipViolation[] = []
  const byName = new Map(manifest.entries.map(entry => [entry.symbol, entry]))

  for (const entry of manifest.entries) {
    if (entry.kind === 'compound-part') {
      const parent = byName.get(entry.parentComponent ?? '')
      if (parent === undefined) {
        violations.push({
          rule: 'compound-part-parent',
          message: `${entry.symbol} is a part of ${entry.parentComponent}, which this manifest does not contain`,
        })
      }
      else if (parent.kind !== 'public-component') {
        violations.push({
          rule: 'compound-part-parent',
          message: `${entry.symbol} names ${parent.symbol} as its parent, but ${parent.symbol} is ${parent.kind}, `
            + 'not a public-component',
        })
      }
    }

    if (entry.kind === 'compat-alias' && !byName.has(entry.aliasOf ?? '')) {
      violations.push({
        rule: 'compat-alias-target',
        message: `${entry.symbol} aliases ${entry.aliasOf}, which this manifest does not contain`,
      })
    }
  }

  return violations
}

/**
 * The resolver's generated table must equal what the manifest produces now.
 *
 * It is regenerated with the tier set the *committed file* records, not with
 * whatever this machine happens to have: a Core-only checkout must not fail a
 * table that a Pro-equipped machine generated, and vice versa. What it must
 * never do is pass silently when the file claims a tier nobody can supply.
 */
export function checkRuntimeLookup(manifest: OwnershipManifest): OwnershipViolation[] {
  if (!existsSync(RUNTIME_LOOKUP_PATH)) {
    return [{
      rule: 'runtime-lookup',
      message: 'packages/core/src/generated/component-ownership.ts does not exist. '
        + 'Run `yarn generate:ownership`.',
    }]
  }

  const committed = readFileSync(RUNTIME_LOOKUP_PATH, 'utf8')
  const claimsPro = /OWNERSHIP_TIERS = \[[^\]]*'pro'/.test(committed)
  const proManifest = process.env[PRO_MANIFEST_ENV]

  if (claimsPro && (proManifest === undefined || !existsSync(proManifest))) {
    return [{
      rule: 'runtime-lookup',
      message: 'the committed runtime lookup includes a Pro tier, but no Pro ownership manifest '
        + `is available to re-derive it. Set ${PRO_MANIFEST_ENV} to the manifest a Pro checkout `
        + 'produced. (This is a missing input, not drift — the file is not assumed stale.)',
    }]
  }

  const { source, problems } = buildRuntimeLookup(manifest, claimsPro ? proManifest : undefined)
  const violations: OwnershipViolation[] = problems.map(problem => ({
    rule: 'runtime-lookup',
    message: problem,
  }))

  if (source !== committed) {
    violations.push({
      rule: 'runtime-lookup',
      message: 'packages/core/src/generated/component-ownership.ts differs from what the '
        + 'ownership manifest produces now. Run `yarn generate:ownership` — the resolver reads '
        + 'this file, so a stale one silently misroutes imports.',
    })
  }

  return violations
}

export function readCeiling(): Ceiling {
  if (!existsSync(CEILING_PATH))
    return { maxUnclassified: 0, maxWithoutAnatomy: 0 }
  return JSON.parse(readFileSync(CEILING_PATH, 'utf8')) as Ceiling
}

/**
 * Public components that have not declared a styling surface.
 *
 * Compound parts are excluded: a part's anatomy belongs to the component that
 * owns it, and requiring `DzCardBody` to declare its own would double-count one
 * decision.
 */
/**
 * The docs' anatomy projection must equal what the manifest produces now.
 *
 * Without this the docs could keep rendering a part a component no longer emits
 * — the exact failure mode ADR-19 exists to close, reintroduced one directory
 * over.
 */
export function checkAnatomyData(manifest: OwnershipManifest): OwnershipViolation[] {
  if (!existsSync(ANATOMY_DATA_PATH)) {
    return [{
      rule: 'anatomy-data',
      message: 'apps/storybook/stories/_data/anatomy.generated.ts does not exist. '
        + 'Run `yarn generate:ownership`.',
    }]
  }

  if (readFileSync(ANATOMY_DATA_PATH, 'utf8') !== renderAnatomyData(manifest)) {
    return [{
      rule: 'anatomy-data',
      message: 'apps/storybook/stories/_data/anatomy.generated.ts differs from what the ownership '
        + 'manifest produces now. Run `yarn generate:ownership` — the docs render this file, so a '
        + 'stale one documents a styling surface the components no longer have.',
    }]
  }

  return []
}

/**
 * Declared part names that are outside the shared vocabulary.
 *
 * ADR-19 §3 admits a component-specific part name when the vocabulary genuinely
 * has no word for the node — a table's `row` and `cell` are the motivating
 * case. What it does not admit is that happening unnoticed: reported here so
 * the vocabulary grows by a decision someone made rather than by whatever the
 * last component author reached for.
 *
 * Reported, never a failure. A validator that blocked a new part name would
 * push authors toward a vocabulary word that fits worse, which is the outcome
 * this is meant to prevent.
 */
export function partsOutsideVocabulary(
  manifest: OwnershipManifest,
): { symbol: string, parts: string[] }[] {
  const vocabulary = new Set<string>(ANATOMY_PART_VOCABULARY)

  return manifest.entries
    .filter(entry => entry.anatomy !== undefined && entry.anatomy.parts !== 'none')
    .map(entry => ({
      symbol: entry.symbol,
      parts: (entry.anatomy!.parts as string[]).filter(part => !vocabulary.has(part)),
    }))
    .filter(entry => entry.parts.length > 0)
    .sort((a, b) => compareSymbols(a.symbol, b.symbol))
}

/**
 * Component tokens a component reads but does not declare.
 *
 * Reported, not enforced — but this is the check that would have caught
 * DzButton shipping an anatomy with five of its thirty-one `--dz-button-*`
 * tokens listed, which a Playwright run found instead when a fixture set the
 * radius token a reader would guess rather than the one the button reads.
 *
 * Only components that HAVE declared an anatomy are examined: the 138 that have
 * not are already counted by the ceiling, and listing their tokens too would
 * bury the actionable finding.
 */
export function undeclaredComponentTokens(
  manifest: OwnershipManifest,
): { symbol: string, tokens: string[] }[] {
  return manifest.entries
    .filter(entry => entry.anatomy !== undefined)
    .map((entry) => {
      const source = entry.evidence.find(path => path.endsWith('.vue'))
      if (source === undefined)
        return { symbol: entry.symbol, tokens: [] }

      const declared = new Set(entry.anatomy!.componentTokens)
      const referenced = referencedComponentTokens(resolve(ROOT, source), entry.symbol)
      return { symbol: entry.symbol, tokens: referenced.filter(token => !declared.has(token)) }
    })
    .filter(entry => entry.tokens.length > 0)
    .sort((a, b) => compareSymbols(a.symbol, b.symbol))
}

export function componentsWithoutAnatomy(manifest: OwnershipManifest): OwnershipEntry[] {
  return manifest.entries.filter(
    entry => entry.kind === 'public-component' && entry.anatomy === undefined,
  )
}

export interface OwnershipReport {
  violations: OwnershipViolation[]
  unclassified: OwnershipEntry[]
  ceiling: number
  total: number
  /** Public components with no declared anatomy, and the ceiling they are under. */
  withoutAnatomy: OwnershipEntry[]
  anatomyCeiling: number
  /** Component-specific part names, reported so the vocabulary grows deliberately. */
  vocabularyExtensions: { symbol: string, parts: string[] }[]
  /** Component tokens a component reads without declaring them as override points. */
  undeclaredTokens: { symbol: string, tokens: string[] }[]
}

/**
 * @param manifestPath - the committed file to check. Overridable so the specs
 * can point at a tampered copy instead of writing to the real artifact.
 */
export function validateOwnershipManifest(
  manifestPath: string = OWNERSHIP_MANIFEST_PATH,
): OwnershipReport {
  const violations: OwnershipViolation[] = []
  const { manifest: regenerated } = buildOwnershipManifest()

  if (!existsSync(manifestPath)) {
    violations.push({
      rule: 'freshness',
      message: 'packages/core/manifests/component-ownership.manifest.json does not exist. '
        + 'Run `yarn generate:ownership:core`.',
    })
    return {
      violations,
      unclassified: [],
      ceiling: readCeiling().maxUnclassified,
      total: 0,
      withoutAnatomy: [],
      anatomyCeiling: readCeiling().maxWithoutAnatomy,
      vocabularyExtensions: [],
      undeclaredTokens: [],
    }
  }

  const committedRaw = readFileSync(manifestPath, 'utf8')
  let committed: OwnershipManifest
  try {
    committed = JSON.parse(committedRaw) as OwnershipManifest
  }
  catch (error) {
    violations.push({
      rule: 'freshness',
      message: `the committed manifest is not valid JSON: ${(error as Error).message}`,
    })
    return {
      violations,
      unclassified: [],
      ceiling: readCeiling().maxUnclassified,
      total: 0,
      withoutAnatomy: [],
      anatomyCeiling: readCeiling().maxWithoutAnatomy,
      vocabularyExtensions: [],
      undeclaredTokens: [],
    }
  }

  if (committed.schemaVersion !== OWNERSHIP_SCHEMA_VERSION) {
    violations.push({
      rule: 'schema',
      message: `committed schemaVersion ${committed.schemaVersion} is not the generator's `
        + `${OWNERSHIP_SCHEMA_VERSION}`,
    })
  }

  if (comparable(committed) !== comparable(regenerated)) {
    const committedNames = new Set(committed.entries.map(entry => entry.symbol))
    const currentNames = new Set(regenerated.entries.map(entry => entry.symbol))
    const added = [...currentNames].filter(name => !committedNames.has(name)).sort(compareSymbols)
    const removed = [...committedNames].filter(name => !currentNames.has(name)).sort(compareSymbols)
    const detail = added.length + removed.length > 0
      ? ` (+${added.slice(0, 5).join(', ')}${added.length > 5 ? '…' : ''}`
      + ` -${removed.slice(0, 5).join(', ')}${removed.length > 5 ? '…' : ''})`
      : ' (same symbols, different classification or evidence)'
    violations.push({
      rule: 'freshness',
      message: `the committed manifest differs from what the generator produces now${detail}. `
        + 'Run `yarn generate:ownership:core` — do not hand-edit the file.',
    })
  }

  committed.entries.forEach((entry, index) => violations.push(...checkEntry(entry, index)))
  violations.push(...checkReferences(committed))

  violations.push(...checkRuntimeLookup(regenerated))
  violations.push(...checkAnatomyData(regenerated))

  const unclassified = committed.entries.filter(entry => entry.kind === 'unclassified')
  const { maxUnclassified } = readCeiling()
  if (unclassified.length > maxUnclassified) {
    violations.push({
      rule: 'unclassified-ceiling',
      message: `${unclassified.length} unclassified entries exceed the checked-in ceiling of `
        + `${maxUnclassified}. The ceiling ratchets down, never up: classify the new symbols `
        + 'or record a maintainer decision — do not raise the number.',
    })
  }

  const withoutAnatomy = componentsWithoutAnatomy(committed)
  const { maxWithoutAnatomy } = readCeiling()
  if (withoutAnatomy.length > maxWithoutAnatomy) {
    violations.push({
      rule: 'anatomy-ceiling',
      message: `${withoutAnatomy.length} public components have no declared anatomy, over the `
        + `checked-in ceiling of ${maxWithoutAnatomy} (ADR-19). Declare one in `
        + 'Dz{Name}.anatomy.ts — a new component ships with its styling surface stated, not added later.',
    })
  }

  return {
    violations,
    unclassified,
    ceiling: maxUnclassified,
    total: committed.entries.length,
    withoutAnatomy,
    anatomyCeiling: maxWithoutAnatomy,
    vocabularyExtensions: partsOutsideVocabulary(committed),
    undeclaredTokens: undeclaredComponentTokens(committed),
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = validateOwnershipManifest()

  if (report.violations.length === 0) {
    console.warn(
      `✓ ownership-manifest: ${report.total} entries fresh and internally consistent, `
      + `runtime lookup in sync; ${report.unclassified.length}/${report.ceiling} unclassified; `
      + `${report.withoutAnatomy.length}/${report.anatomyCeiling} public components without anatomy`,
    )
    if (report.vocabularyExtensions.length > 0) {
      console.warn('  part names outside the shared vocabulary (reported, not a failure):')
      for (const entry of report.vocabularyExtensions)
        console.warn(`   · ${entry.symbol} — ${entry.parts.join(', ')}`)
    }
    if (report.undeclaredTokens.length > 0) {
      console.warn('  component tokens read but not declared as override points (reported, not a failure):')
      for (const entry of report.undeclaredTokens)
        console.warn(`   · ${entry.symbol} — ${entry.tokens.join(', ')}`)
    }
    if (report.unclassified.length > 0) {
      console.warn('  awaiting a maintainer decision (reported, not a failure):')
      for (const entry of report.unclassified)
        console.warn(`   · ${entry.package} ${entry.symbol} — ${entry.evidence.at(-1)}`)
    }
    process.exit(0)
  }

  for (const violation of report.violations)
    console.error(`✗ [${violation.rule}] ${violation.message}`)
  console.error(`\n${report.violations.length} ownership-manifest violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
