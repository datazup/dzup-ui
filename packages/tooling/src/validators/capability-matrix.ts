/**
 * Capability-matrix validator (TASK-OSS-P5-06).
 *
 * Four gates:
 *
 *   1. **freshness** — the committed `capability-matrix.json` equals what the
 *      generator produces now.
 *   2. **tier D** — a Tier D component may not carry an unexplained `unrun`
 *      cell. TASK-OSS-P5-06 names this one directly. Tier D is where a defect
 *      is a security defect, and "nobody has produced this evidence" is not an
 *      answer there; an `excepted` cell with a reason is.
 *   3. **stale** — a cell whose artifact predates the component's last change
 *      is reported per tier, never folded into a pass count.
 *   4. **inputs** — an absent input is reported by name. Without this, a whole
 *      column of `unrun` reads as a catalog-wide failure when it is one
 *      artifact nobody generated.
 *
 * Gates 3 and 4 report; 1 and 2 fail. That split is the packet's own rule: the
 * page exists to make gaps visible, and a validator that failed on every
 * visible gap would be a validator people delete.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/capability-matrix.ts
 *   tsx packages/tooling/src/validators/capability-matrix.ts --all
 *
 * Exit code 1 if a hard gate fails.
 */

import type { CapabilityMatrix } from '../quality/capability-matrix.ts'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  buildCapabilityMatrix,
  CAPABILITY_MATRIX_PATH,
  serializeCapabilityMatrix,
} from '../quality/generate-capability-matrix.ts'

export interface CapabilityViolation {
  rule: 'freshness' | 'tier-d' | 'stale' | 'inputs'
  level: 'error' | 'report'
  message: string
}

/** Run the content gates. Pure — this is what the unit tests drive. */
export function checkCapabilityMatrix(matrix: CapabilityMatrix): CapabilityViolation[] {
  const violations: CapabilityViolation[] = []

  for (const row of matrix.rows) {
    if (row.tier === 'D') {
      for (const cell of row.cells) {
        // "Unexplained" is the word TASK-OSS-P5-06 uses, and it has to mean
        // something checkable. An `unrun` cell with an artifact is a gap
        // somebody has made a place for — the AT task file exists with six
        // pairs waiting for a human, which is a scheduled gap, not an absent
        // one. An `unrun` cell with nothing behind it is the case this gate is
        // for. Accepting a `note` as an explanation instead would have made the
        // gate unfailable: the generator writes a note on almost every unrun
        // cell, precisely so the page reads well.
        if (cell.state !== 'unrun' || cell.artifacts.length > 0)
          continue
        violations.push({
          rule: 'tier-d',
          level: 'error',
          message: `${row.component} is Tier D and its \`${cell.kind}\` cell is unrun with no `
            + `artifact (required by ${cell.origin}). Produce the evidence, or record an `
            + `exception in component-tiers.ts saying why this component cannot. A Tier D gap `
            + `is a security gap and does not get to be an empty cell.`,
        })
      }
    }

    for (const cell of row.cells) {
      if (cell.state !== 'stale')
        continue
      violations.push({
        rule: 'stale',
        level: 'report',
        message: `${row.component} / \`${cell.kind}\`: the artifact predates the component's `
          + `last change (${row.componentCommit.slice(0, 8)}).`,
      })
    }
  }

  for (const [name, input] of Object.entries(matrix.inputs)) {
    if (input.available)
      continue
    violations.push({
      rule: 'inputs',
      level: 'report',
      message: `input \`${name}\` is absent (${input.path}). Every cell that reads it is `
        + `\`unrun\` for that reason, not because the evidence failed.`,
    })
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const fresh = buildCapabilityMatrix()
  const violations = checkCapabilityMatrix(fresh)

  if (!existsSync(CAPABILITY_MATRIX_PATH)) {
    violations.push({
      rule: 'freshness',
      level: 'error',
      message: 'packages/core/docs/capability-matrix.json does not exist. Run '
        + '`yarn generate:capability-matrix`.',
    })
  }
  else {
    const committed = readFileSync(CAPABILITY_MATRIX_PATH, 'utf8')
    // `sourceCommit` is excluded for the reason the ownership validator states:
    // it records which checkout produced the file, and gating on it would fail
    // this on every unrelated commit while proving nothing about the cells.
    const strip = (json: string) => json.replace(/"sourceCommit": "[^"]*"/, '"sourceCommit": "-"')
    if (strip(committed) !== strip(serializeCapabilityMatrix(fresh))) {
      violations.push({
        rule: 'freshness',
        level: 'error',
        message: 'packages/core/docs/capability-matrix.json is stale. Run '
          + '`yarn generate:capability-matrix` and commit the result.',
      })
    }
  }

  const errors = violations.filter(v => v.level === 'error')
  const stale = violations.filter(v => v.rule === 'stale')
  const inputs = violations.filter(v => v.rule === 'inputs')

  console.warn('Capability matrix — TASK-OSS-P5-06\n')
  console.warn('  tier   pass  present  stale  unrun  excepted')
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    const t = fresh.totals[tier]
    console.warn(
      `  ${tier}     ${String(t.pass).padStart(5)}${String(t.present).padStart(9)}`
      + `${String(t.stale).padStart(7)}${String(t.unrun).padStart(7)}`
      + `${String(t.excepted).padStart(10)}`,
    )
  }
  console.warn('\n  Counts are per tier and per state on purpose. One percentage over cells of')
  console.warn('  different weight is the number this packet exists to stop reporting.')

  for (const v of inputs)
    console.warn(`\n  ! ${v.message}`)

  if (stale.length > 0) {
    console.warn(`\n  ${stale.length} stale cell(s)`)
    if (showAll) {
      for (const v of stale)
        console.warn(`    · ${v.message}`)
    }
  }

  if (errors.length === 0) {
    console.warn(`\n✓ capability-matrix: fresh, and no Tier D cell is unexplained.`)
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${errors.length} capability-matrix violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
