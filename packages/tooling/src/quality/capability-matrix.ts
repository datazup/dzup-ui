/**
 * Capability/evidence matrix — the shape (TASK-OSS-P5-06).
 *
 * P5-01 through P5-05 each produce evidence in their own place: contract specs
 * beside components, story status in a validator report, browser results in a
 * Playwright JSON file, AT runs in markdown, baselines in a perf file. Somebody
 * asking "what evidence exists for `DzSelect`?" has, until now, had to know all
 * six places and how to read each one.
 *
 * This is the join. One row per public component, one cell per evidence row
 * that component's tier and traits owe, and four states a cell can be in.
 *
 * **Why there is no percentage in the header.** A single number over cells of
 * different weight is the thing this packet exists to replace: "84% qualified"
 * is satisfied equally by closing four badge cells and by closing one combobox
 * cell, and it hides which. The page reports counts per state per tier and
 * refuses to reduce them further. TASK-OSS-P5-06 states the rule outright —
 * "never aggregate into a single percentage on the page header" — and this is
 * where it is enforced rather than remembered.
 *
 * @module @dzup-ui/tooling/quality/capability-matrix
 */

import type { EvidenceKind, RiskTier } from '@dzup-ui/contracts'

/**
 * What is known about one evidence cell.
 *
 * - `pass` — an artifact exists AND something recorded it passing.
 * - `present` — an artifact exists; nothing here proves it ran green. A spec
 *   file on disk is `present`; the same spec with a passing result recorded
 *   against it is `pass`. Collapsing the two would let a skipped test read as
 *   evidence.
 * - `stale` — an artifact exists and its `sourceCommit` predates the
 *   component's last change. Not a pass: it is a pass about different code.
 * - `unrun` — no artifact. The default, and the one the page must not hide.
 * - `excepted` — the component provably cannot produce this row, and the
 *   reason travels with the cell. Still printed.
 */
export type CellState = 'pass' | 'present' | 'stale' | 'unrun' | 'excepted'

export const CELL_STATES: readonly CellState[] = [
  'pass',
  'present',
  'stale',
  'unrun',
  'excepted',
]

/**
 * Whether a cell is evidence about *this component* or about the whole corpus.
 *
 * `validate:tokens` proves every colour pair in the repository passes contrast;
 * that is real evidence and it is not per-component. Marking it `pass` at
 * component scope would let a corpus gate stand in for 144 component checks,
 * which is precisely how an aggregate count comes to mean nothing. So the scope
 * rides along and the page shows it.
 */
export type EvidenceScope = 'component' | 'corpus'

export interface EvidenceCell {
  readonly kind: EvidenceKind
  readonly state: CellState
  /** Which rule asked for this row — `tier B`, `trait teleports`, … */
  readonly origin: string
  readonly scope: EvidenceScope
  /** Repo-relative paths a reader can open. Empty when `unrun`. */
  readonly artifacts: readonly string[]
  /** Why the cell is in this state, when that is not obvious from the state. */
  readonly note?: string
}

export interface CapabilityRow {
  readonly component: string
  readonly family: string
  readonly tier: RiskTier
  readonly pattern: string
  readonly securityBoundary: string
  readonly traits: readonly string[]
  /** Whether the component declares a `Dz{Name}.anatomy.ts`. */
  readonly anatomy: 'declared' | 'absent'
  readonly source: string
  /** The commit that last touched `source`, for staleness. */
  readonly componentCommit: string
  readonly cells: readonly EvidenceCell[]
}

export interface CapabilityMatrix {
  readonly schemaVersion: string
  readonly sourceCommit: string
  readonly generatedFrom: readonly string[]
  /**
   * Which inputs were actually available when this was generated.
   *
   * A missing input turns a whole column `unrun`, and a reader has to be able
   * to tell "nobody has run the browser matrix" from "the browser matrix ran
   * and everything failed". Recording the inputs is the difference.
   */
  readonly inputs: Readonly<Record<string, { available: boolean, path: string, note?: string }>>
  /** tier → state → count. Never reduced to one number. */
  readonly totals: Readonly<Record<RiskTier, Record<CellState, number>>>
  readonly rows: readonly CapabilityRow[]
}

export const CAPABILITY_SCHEMA_VERSION = '1.0.0'

/** An empty per-state tally. */
export function emptyTally(): Record<CellState, number> {
  return { pass: 0, present: 0, stale: 0, unrun: 0, excepted: 0 }
}
