/**
 * Manual AT task-matrix validator (TASK-OSS-P5-04).
 *
 * A matrix of recorded runs decays in two directions: rows go stale as the
 * component changes under them, and rows drift as people fill them in by hand.
 * Five gates:
 *
 *   1. **coverage** — every Tier B–D component has a file, and no file names a
 *      component that is no longer in that lane.
 *   2. **shape** — every row names a real pair and a real result value.
 *   3. **substance** — a row claiming anything other than `unrun` carries the
 *      AT versions, a tester, a date and a `sourceCommit`. A `pass` with four
 *      dashes in it is not evidence, and it is the single easiest thing to
 *      write into a table nobody validates.
 *   4. **freshness** — a recorded result whose `sourceCommit` predates the
 *      component's last change is **stale**, not passing. Reported, and counted
 *      separately, so a component that was qualified six months and forty
 *      commits ago cannot read as qualified now.
 *   5. **index** — `index.json` equals what the markdown files say, byte for
 *      byte, with `componentCommit` excluded. That field is
 *      `lastCommitFor(source)` — git provenance inside a byte comparison,
 *      which makes the artifact stale in the very commit that writes it and
 *      the gate unfailable-into-green (TASK-N5-03). Nothing reads the
 *      committed value; clause 4 recomputes it. Same exclusion
 *      `validate:component-meta` makes for `sourceCommit`.
 *
 * Stale and unrun are **reported, not failed**. The lane is new and every row
 * in it starts unrun; failing the build on that would mean the gate is turned
 * off the day it lands. What fails is a row that is *wrong* — a bad pair, an
 * unrecognised result, a pass with no evidence behind it, or an index that
 * disagrees with the files. Those are the ones that make the matrix lie.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/at-matrix.ts
 *   tsx packages/tooling/src/validators/at-matrix.ts --all   # list every stale/unrun cell
 *
 * Exit code 1 if a hard gate fails.
 */

import type { AtMatrixIndex } from '../quality/at-matrix.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ALL_TASKS, AT_PAIRS, AT_RESULTS } from '../quality/at-matrix.ts'
import {
  AT_MATRIX_DIR,
  AT_MATRIX_INDEX,
  buildAtIndex,
  serializeIndex,
} from '../quality/generate-at-matrix.ts'
import { readCommittedMatrix } from '../quality/generate-quality-matrix.ts'
import { evidenceIsCurrent, stripComponentCommits } from '../quality/git.ts'

export interface AtViolation {
  rule: string
  level: 'error' | 'report'
  message: string
}

const PAIR_IDS = new Set(AT_PAIRS.map(p => p.id))
const RESULT_VALUES = new Set<string>(AT_RESULTS)
const BLANK = new Set(['', '-', 'n/a', 'tbd'])

/** Run every gate against an index. Pure — this is what the unit tests drive. */
export function checkAtMatrix(
  index: AtMatrixIndex,
  expectedComponents: readonly string[],
  filesOnDisk: readonly string[],
): AtViolation[] {
  const violations: AtViolation[] = []
  const indexed = new Set(index.entries.map(e => e.component))

  for (const component of expectedComponents) {
    if (!indexed.has(component)) {
      violations.push({
        rule: 'coverage',
        level: 'error',
        message: `${component} is Tier B or above and has no AT task file. Run `
          + `\`yarn generate:at-matrix\`.`,
      })
    }
  }

  const expected = new Set(expectedComponents)
  for (const file of filesOnDisk) {
    if (!expected.has(file)) {
      violations.push({
        rule: 'coverage',
        level: 'error',
        message: `e2e/at-matrix/${file}.md records runs for a component that is no longer Tier B `
          + `or above. Do not delete it — recorded runs are history. Move it under `
          + `e2e/at-matrix/retired/ and say why in the file.`,
      })
    }
  }

  for (const entry of index.entries) {
    if (entry.rows.length === 0) {
      violations.push({
        rule: 'shape',
        level: 'error',
        message: `${entry.component} has an AT file with no results table. The table is `
          + `generated with one \`unrun\` row per pair; an empty one means the file was edited `
          + `into a shape the parser cannot read.`,
      })
      continue
    }

    for (const row of entry.rows) {
      if (!PAIR_IDS.has(row.pair)) {
        violations.push({
          rule: 'shape',
          level: 'error',
          message: `${entry.component} records a run against pair \`${row.pair}\`, which is not `
            + `one of ${[...PAIR_IDS].join(', ')}.`,
        })
      }

      if (!RESULT_VALUES.has(row.result)) {
        violations.push({
          rule: 'shape',
          level: 'error',
          message: `${entry.component} / ${row.pair} records result \`${row.result}\`, which is `
            + `not one of ${AT_RESULTS.join(', ')}.`,
        })
        continue
      }

      // TASK-R2-O2. A run record now names the task it is evidence about, and a
      // task id that is not one the component owes makes the row
      // unattributable: it cannot be counted toward qualification, it cannot be
      // re-tested against the right step, and the likeliest cause is a typo that
      // would otherwise sit in the matrix reading as evidence.
      if (row.task !== ALL_TASKS && !entry.tasks.includes(row.task)) {
        violations.push({
          rule: 'shape',
          level: 'error',
          message: `${entry.component} / ${row.pair} records a run against task \`${row.task}\`, `
            + `which is not one of the tasks ${entry.component} owes `
            + `(${entry.tasks.join(', ')}, or \`${ALL_TASKS}\` for all of them). Either the id is `
            + `a typo, or the scaffold was regenerated after the component's pattern changed — `
            + `check which before editing the row, because the row is somebody's session.`,
        })
        continue
      }

      if (row.result === 'unrun') {
        violations.push({
          rule: 'unrun',
          level: 'report',
          message: `${entry.component} / ${row.pair} has never been run.`,
        })
        continue
      }

      // An `unrun` row is the generator's own default and says nothing about a
      // task, so it may carry `*`. A row claiming a real outcome may not: an
      // unattributed result cannot be re-tested, and `pass` over eight tasks at
      // once is the aggregate this matrix exists to refuse.
      if (row.task === ALL_TASKS && entry.tasks.length > 1) {
        violations.push({
          rule: 'substance',
          level: 'error',
          message: `${entry.component} / ${row.pair} claims \`${row.result}\` for \`${ALL_TASKS}\` `
            + `— all ${entry.tasks.length} tasks at once. Record one row per {task, pair} you `
            + `actually drove, naming the task: ${entry.tasks.join(', ')}.`,
        })
        continue
      }

      const missing = (['versions', 'tester', 'date', 'sourceCommit'] as const)
        .filter(field => BLANK.has(row[field].toLowerCase()))
      if (missing.length > 0) {
        violations.push({
          rule: 'substance',
          level: 'error',
          message: `${entry.component} / ${row.pair} claims \`${row.result}\` with no `
            + `${missing.join(', ')}. A result with nothing behind it is worse than \`unrun\`, `
            + `because \`unrun\` is true.`,
        })
        continue
      }

      if (!evidenceIsCurrent(row.sourceCommit, entry.componentCommit)) {
        violations.push({
          rule: 'stale',
          level: 'report',
          message: `${entry.component} / ${row.pair} was ${row.result} at `
            + `${row.sourceCommit.slice(0, 8)}, and the component has changed since `
            + `(${entry.componentCommit.slice(0, 8)}). Re-run or record why it still holds.`,
        })
      }
    }
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('✗ quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }

  const expected = matrix.components.filter(row => row.tier !== 'A').map(row => row.component)
  const filesOnDisk = existsSync(AT_MATRIX_DIR)
    ? readdirSync(AT_MATRIX_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => basename(f, '.md'))
    : []

  const fresh = buildAtIndex(matrix.components, (component) => {
    const path = resolve(AT_MATRIX_DIR, `${component}.md`)
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
  })

  const violations = checkAtMatrix(fresh, expected, filesOnDisk)

  if (!existsSync(AT_MATRIX_INDEX)) {
    violations.push({
      rule: 'index',
      level: 'error',
      message: 'e2e/at-matrix/index.json does not exist. Run `yarn generate:at-matrix`.',
    })
  }
  // `componentCommit` is excluded for the reason `stripComponentCommits`
  // states: it is `lastCommitFor(source)`, i.e. git provenance inside an
  // artifact that is byte-compared against a fresh build, so the file is stale
  // in the very commit that writes it. Nothing reads the committed value — the
  // staleness clause above runs against `fresh`, where it is recomputed. Same
  // exclusion `validate:component-meta` and `validate:ownership` make for
  // `sourceCommit`. Every content field still compares byte for byte.
  else if (
    stripComponentCommits(readFileSync(AT_MATRIX_INDEX, 'utf8'))
    !== stripComponentCommits(serializeIndex(fresh))
  ) {
    violations.push({
      rule: 'index',
      level: 'error',
      message: 'e2e/at-matrix/index.json disagrees with the markdown files. Run '
        + '`yarn generate:at-matrix` and commit the result.',
    })
  }

  const errors = violations.filter(v => v.level === 'error')
  const stale = violations.filter(v => v.rule === 'stale')
  const unrun = violations.filter(v => v.rule === 'unrun')
  const cells = fresh.entries.flatMap(e => e.rows).length

  // TASK-R2-O2. Both denominators, always. `required` is the subset whose
  // absence blocks qualification (`requiredAtPairs(tier)`); `cells` is every
  // pairing the scaffold carries. Printing only the smaller one would make the
  // ratchet look better for free, which is the specific move
  // `<generated_authority>` forbids — a ratchet moves by work, not by
  // redefinition.
  const requiredCells = fresh.entries
    .reduce((n, e) => n + e.requiredPairs.length, 0)
  const requiredExecuted = fresh.entries.reduce((n, e) => {
    const req = new Set(e.requiredPairs)
    return n + e.rows.filter(r => req.has(r.pair) && r.result !== 'unrun').length
  }, 0)

  console.warn('Manual AT task matrix — TASK-OSS-P5-04\n')
  console.warn(`  components (Tier B–D)  ${fresh.entries.length}`)
  console.warn(`  cells                  ${cells}`)
  console.warn(`  executed               ${cells - unrun.length}`)
  console.warn(`  required cells         ${requiredCells}  (tier-differentiated, TASK-R2-O2)`)
  console.warn(`  required executed      ${requiredExecuted}`)
  console.warn(`  unrun                  ${unrun.length}  (reported)`)
  console.warn(`  stale                  ${stale.length}  (reported)`)

  if (showAll) {
    for (const v of [...stale, ...unrun])
      console.warn(`  · [${v.rule}] ${v.message}`)
  }
  else if (unrun.length + stale.length > 0) {
    console.warn(`\n  run with --all to list every unrun and stale cell`)
  }

  if (errors.length === 0) {
    console.warn(`\n✓ at-matrix: no malformed or unevidenced rows.`)
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${errors.length} at-matrix violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
