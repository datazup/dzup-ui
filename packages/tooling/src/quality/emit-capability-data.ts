/**
 * Storybook capability-matrix projection (TASK-OSS-P5-06).
 *
 * Renders `apps/storybook/stories/_data/capability.generated.ts` from
 * `packages/core/docs/capability-matrix.json`.
 *
 * **Why a projection and not the file itself** — the same reason
 * `emit-anatomy-data.ts` gives, and more so. The capability matrix is 480 KB of
 * cells, origins, scopes and notes; Vite inlines a JSON import whole, so the
 * docs page would ship every byte to render a table of states and links. The
 * projection keeps the state, the artifact links and the notes that say
 * something a reader cannot infer, and drops the derivation.
 *
 * It is generated in the same run that writes the matrix, and
 * `validate:capability-matrix` fails when the two disagree — so this is a
 * narrowing, not a second source of truth.
 */

import type { CapabilityMatrix } from './capability-matrix.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'

const HEADER = `/**
 * AUTO-GENERATED — do not edit.
 *
 * Written by \`yarn generate:capability-matrix\` from
 * packages/core/docs/capability-matrix.json.
 * \`yarn validate:capability-matrix\` fails if this file drifts from it.
 *
 * A narrowing of the capability matrix to what the docs page renders: per
 * component, the state of each evidence row its tier and traits require, the
 * artifacts a reader can open, and the notes that say something the state does
 * not. See TASK-OSS-P5-06.
 */
`

function str(value: string): string {
  return JSON.stringify(value)
}

/** Render the module. */
export function renderCapabilityData(matrix: CapabilityMatrix): string {
  const rows = [...matrix.rows]
    .sort((a, b) => compareSymbols(a.component, b.component))
    .map((row) => {
      const cells = row.cells.map((cell) => {
        const parts = [
          `      kind: ${str(cell.kind)}`,
          `state: ${str(cell.state)}`,
          `origin: ${str(cell.origin)}`,
        ]
        if (cell.scope !== 'component')
          parts.push(`scope: ${str(cell.scope)}`)
        if (cell.artifacts.length > 0)
          parts.push(`artifacts: [${cell.artifacts.map(str).join(', ')}]`)
        if (cell.note !== undefined)
          parts.push(`note: ${str(cell.note)}`)
        return `    { ${parts.join(', ').replace(/^\s+/, '')} },`
      })

      return [
        `  {`,
        `    component: ${str(row.component)},`,
        `    family: ${str(row.family)},`,
        `    tier: ${str(row.tier)},`,
        `    pattern: ${str(row.pattern)},`,
        `    boundary: ${str(row.securityBoundary)},`,
        `    anatomy: ${str(row.anatomy)},`,
        `    source: ${str(row.source)},`,
        `    visual: { ${[
          `state: ${str(row.visual.state)}`,
          ...(row.visual.baselines === 0 ? [] : [`baselines: ${row.visual.baselines}`]),
          ...(row.visual.themes.length === 0 ? [] : [`themes: [${row.visual.themes.map(str).join(', ')}]`]),
          ...(row.visual.note === undefined ? [] : [`note: ${str(row.visual.note)}`]),
        ].join(', ')} },`,
        `    cells: [`,
        ...cells,
        `    ],`,
        `  },`,
      ].join('\n')
    })

  const inputs = Object.entries(matrix.inputs).map(([name, input]) => {
    const parts = [`available: ${input.available}`, `path: ${str(input.path)}`]
    if (input.note !== undefined)
      parts.push(`note: ${str(input.note)}`)
    return `  ${str(name)}: { ${parts.join(', ')} },`
  })

  return `${HEADER}
/** One evidence cell as the docs render it. */
export interface DocEvidenceCell {
  readonly kind: string
  readonly state: 'pass' | 'present' | 'stale' | 'unrun' | 'excepted'
  /** Which rule required this row: \`tier B\`, \`trait teleports\`, … */
  readonly origin: string
  /** \`corpus\` when the evidence is a repository-wide gate, not per component. */
  readonly scope?: 'component' | 'corpus'
  readonly artifacts?: readonly string[]
  readonly note?: string
}

/** One component's row. */
export interface DocCapabilityRow {
  readonly component: string
  readonly family: string
  readonly tier: 'A' | 'B' | 'C' | 'D'
  readonly pattern: string
  readonly boundary: string
  readonly anatomy: 'declared' | 'absent'
  readonly source: string
  /**
   * Visual-baseline coverage (TASK-N1-O6).
   *
   * \`not-covered\` is a declared state, not a missing one: the lane's scope
   * lives in a committed ledger, so a component outside it is a known gap with
   * a rollout rank rather than something nobody looked at.
   */
  readonly visual: {
    readonly state: 'covered' | 'not-covered' | 'stale'
    readonly baselines?: number
    readonly themes?: readonly string[]
    readonly note?: string
  }
  readonly cells: readonly DocEvidenceCell[]
}

/**
 * Which evidence inputs existed when this was generated.
 *
 * A column of \`unrun\` means one of two very different things — nobody ran the
 * lane, or the lane ran and found nothing — and only this table tells them
 * apart. The page prints it above the matrix for that reason.
 */
export const CAPABILITY_INPUTS: Readonly<Record<string, {
  readonly available: boolean
  readonly path: string
  readonly note?: string
}>> = {
${inputs.join('\n')}
}

/** Per tier, per state. Deliberately never reduced to one percentage. */
export const CAPABILITY_TOTALS = ${JSON.stringify(matrix.totals, null, 2)} as const

/** Repository HEAD the evidence was collected at. */
export const CAPABILITY_SOURCE_COMMIT = ${str(matrix.sourceCommit)}

export const CAPABILITY_ROWS: readonly DocCapabilityRow[] = [
${rows.join('\n')}
]
`
}
