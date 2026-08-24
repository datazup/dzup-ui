/**
 * Quality-matrix generator (TASK-OSS-P5-01).
 *
 * Joins three inputs into `packages/core/docs/quality-matrix.json`:
 *
 *   1. the ownership manifest — which symbols are public components, which
 *      compound parts belong to them, and where their source lives;
 *   2. `quality-tiers.ts` in `@dzup-ui/contracts` — the tier, trait and
 *      boundary rules;
 *   3. `./component-tiers.ts` — the reviewed assignment.
 *
 * The output is what TASK-OSS-P5-02 joins the Story DoD report to, what
 * TASK-OSS-P5-03 reads to decide which components enter the browser matrix,
 * what TASK-OSS-P5-04 generates AT task files from, and what TASK-OSS-P5-06
 * renders. Everything downstream reads this file rather than re-deriving the
 * join, so there is one answer to "what does DzX owe".
 *
 * Determinism: entries are sorted with the ownership manifest's own
 * locale-independent comparator, evidence and WCAG lists are emitted in the
 * order their catalogs declare, and nothing reads the clock. `generate &&
 * generate && diff` is empty.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-quality-matrix.ts
 */

import type {
  ApgPattern,
  ComponentQuality,
  ComponentTrait,
  EvidenceKind,
  RiskTier,
  SecurityBoundary,
} from '@dzup-ui/contracts'
import type { OwnershipEntry, OwnershipManifest } from '../ownership/ownership-manifest.types.ts'
import type { TierAssignment } from './component-tiers.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
// Relative into contracts' SOURCE rather than the `@dzup-ui/contracts`
// specifier, for the reason `validators/ownership-manifest.ts` states: this
// runs under `tsx` with no build step, and these are runtime values, not types.
import {
  baselineWcagFor,
  BOUNDARY_EVIDENCE,
  evidenceFor,
  evidenceOrigin,
  TIER_EVIDENCE_INCREMENT,
  TRAIT_EVIDENCE,
  TRAIT_WCAG,
  WCAG_22_CRITERIA,
} from '../../../contracts/src/quality-tiers.ts'
import {
  OWNERSHIP_MANIFEST_PATH,
  ROOT,
} from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import { COMPONENT_TIERS } from './component-tiers.ts'

export const QUALITY_MATRIX_PATH = resolve(ROOT, 'packages/core/docs/quality-matrix.json')

/** Schema version of the emitted file, not of any package. */
export const QUALITY_MATRIX_SCHEMA_VERSION = '1.0.0'

/** One row, plus the provenance a reader needs to check it. */
export interface QualityMatrixRow extends ComponentQuality {
  /** Which rule put each evidence row here — `tier B`, `trait teleports`, … */
  readonly evidenceOrigin: Readonly<Record<string, string>>
  /** Source file the tier was reviewed against. */
  readonly source: string
  /** Compound parts that ship as part of this component, sorted. */
  readonly parts: readonly string[]
  /** Whether the component declares a `Dz{Name}.anatomy.ts`. */
  readonly hasAnatomy: boolean
}

export interface QualityMatrix {
  readonly schemaVersion: string
  readonly sourceCommit: string
  readonly generatedFrom: readonly string[]
  /** The rules, copied in so the file explains itself without a second read. */
  readonly rules: {
    readonly tierIncrement: Readonly<Record<RiskTier, readonly EvidenceKind[]>>
    readonly traitEvidence: Readonly<Record<ComponentTrait, readonly EvidenceKind[]>>
    readonly boundaryEvidence: Readonly<Record<SecurityBoundary, readonly EvidenceKind[]>>
  }
  readonly wcag: readonly { id: string, name: string, level: string, since: string }[]
  readonly components: readonly QualityMatrixRow[]
}

/** `packages/core/src/components/overlays/DzDialog.vue` → `overlays`. */
export function familyOf(sourcePath: string): string {
  const match = /src\/(?:components\/([\w-]+)|(providers))\//.exec(sourcePath)
  return match?.[1] ?? match?.[2] ?? 'unknown'
}

/** The `.vue` path an entry was classified from, or `''` when it has none. */
export function sourceOf(entry: OwnershipEntry): string {
  return entry.evidence.find(path => path.endsWith('.vue')) ?? ''
}

/**
 * Build the matrix from a manifest and the assignment.
 *
 * Reports rather than throws: a component with no assignment still produces a
 * row (at the tier the validator will complain about) so that the generator
 * output and the validator output describe the same catalog. A generator that
 * silently dropped the component would make the gap invisible in exactly the
 * artifact built to show gaps.
 */
export function buildQualityMatrix(
  manifest: OwnershipManifest,
  assignments: Readonly<Record<string, TierAssignment>> = COMPONENT_TIERS,
): { matrix: QualityMatrix, problems: string[] } {
  const problems: string[] = []

  const publicComponents = manifest.entries
    .filter(entry => entry.kind === 'public-component')
    .sort((a, b) => compareSymbols(a.symbol, b.symbol))

  const partsByParent = new Map<string, string[]>()
  for (const entry of manifest.entries) {
    if (entry.kind !== 'compound-part' || entry.parentComponent === undefined)
      continue
    const list = partsByParent.get(entry.parentComponent) ?? []
    list.push(entry.symbol)
    partsByParent.set(entry.parentComponent, list)
  }

  const components: QualityMatrixRow[] = []

  for (const entry of publicComponents) {
    const assignment = assignments[entry.symbol]
    if (assignment === undefined) {
      problems.push(
        `${entry.symbol} is a public component with no entry in component-tiers.ts. `
        + `Assign a tier; the file is a review artifact and a missing row means nobody looked.`,
      )
      continue
    }

    const tier = assignment.tier
    const boundary = assignment.boundary ?? 'none'
    const traits = [...(assignment.traits ?? [])].sort()

    const evidence = evidenceFor(tier, boundary, traits)
    const origin: Record<string, string> = {}
    for (const kind of evidence)
      origin[kind] = evidenceOrigin(kind, tier, boundary, traits)

    const wcagSet = new Set([
      ...baselineWcagFor(tier, traits),
      ...(assignment.wcag ?? []),
    ])
    const wcag = WCAG_22_CRITERIA.map(c => c.id).filter(id => wcagSet.has(id))

    const row: QualityMatrixRow = {
      component: entry.symbol,
      family: familyOf(sourceOf(entry)),
      tier,
      pattern: assignment.pattern as ApgPattern,
      ...(assignment.why === undefined ? {} : { patternJustification: assignment.why }),
      securityBoundary: boundary,
      ...(assignment.boundaryWhy === undefined
        ? {}
        : { boundaryJustification: assignment.boundaryWhy }),
      traits,
      wcag,
      evidence,
      ...(assignment.exceptions === undefined ? {} : { exceptions: assignment.exceptions }),
      evidenceOrigin: origin,
      source: sourceOf(entry),
      parts: (partsByParent.get(entry.symbol) ?? []).sort(compareSymbols),
      hasAnatomy: entry.anatomy !== undefined,
    }
    components.push(row)
  }

  for (const symbol of Object.keys(assignments).sort(compareSymbols)) {
    if (!publicComponents.some(entry => entry.symbol === symbol)) {
      problems.push(
        `component-tiers.ts assigns a tier to ${symbol}, which the ownership manifest does not `
        + `list as a public component. Remove the row, or find out why the symbol stopped `
        + `being public.`,
      )
    }
  }

  const matrix: QualityMatrix = {
    schemaVersion: QUALITY_MATRIX_SCHEMA_VERSION,
    sourceCommit: manifest.sourceCommit,
    generatedFrom: [
      'packages/core/manifests/component-ownership.manifest.json',
      'packages/contracts/src/quality-tiers.ts',
      'packages/tooling/src/quality/component-tiers.ts',
    ],
    rules: {
      tierIncrement: TIER_EVIDENCE_INCREMENT,
      traitEvidence: TRAIT_EVIDENCE,
      boundaryEvidence: BOUNDARY_EVIDENCE,
    },
    wcag: WCAG_22_CRITERIA.map(c => ({
      id: c.id,
      name: c.name,
      level: c.level,
      since: c.since,
    })),
    components,
  }

  return { matrix, problems }
}

/** Read the committed ownership manifest. */
export function readOwnershipManifest(path: string = OWNERSHIP_MANIFEST_PATH): OwnershipManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as OwnershipManifest
}

/** Serialize with a trailing newline, matching every other generated JSON here. */
export function serializeMatrix(matrix: QualityMatrix): string {
  return `${JSON.stringify(matrix, null, 2)}\n`
}

/** The committed matrix, or `undefined` when it has never been generated. */
export function readCommittedMatrix(path: string = QUALITY_MATRIX_PATH): QualityMatrix | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as QualityMatrix
}

/** Trait-carrying WCAG additions, exported so the validator can explain a row. */
export { TRAIT_WCAG }

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const manifest = readOwnershipManifest()
  const { matrix, problems } = buildQualityMatrix(manifest)

  writeFileSync(QUALITY_MATRIX_PATH, serializeMatrix(matrix), 'utf8')

  const byTier = new Map<RiskTier, number>()
  for (const row of matrix.components)
    byTier.set(row.tier, (byTier.get(row.tier) ?? 0) + 1)

  console.warn(
    `quality-matrix: ${matrix.components.length} public components — `
    + `${[...byTier.entries()].sort().map(([t, n]) => `${t}:${n}`).join(' ')}`,
  )
  console.warn(`  → packages/core/docs/quality-matrix.json`)

  if (problems.length > 0) {
    console.error('')
    for (const problem of problems)
      console.error(`✗ ${problem}`)
    console.error(`\n${problems.length} problem(s). The file was written anyway — see the header.`)
    process.exit(1)
  }
}
/* c8 ignore stop */
