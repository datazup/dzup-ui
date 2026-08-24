/**
 * Tier-required Story DoD gate (TASK-OSS-P5-02).
 *
 * `validate:story-dod` reports 366 advisory items and enforces none of them,
 * which is the right call for a corpus-wide check nobody has triaged. This is
 * the triaged half: it enforces a **ceiling** on the items a component's risk
 * tier actually requires, and that ceiling may only fall.
 *
 * **Why a ceiling rather than zero.** Promoting the three tier-required
 * categories to hard failures today would land 51 red items on a green build,
 * and TASK-OSS-P5-02's own stop condition forbids that: "Stop if promoting a
 * check to enforced turns a currently-green CI red for reasons unrelated to the
 * touched families." A ceiling gets the same guarantee — nothing may get worse,
 * and every fix is permanent — without a red build on the day it lands. It is
 * the mechanism `unclassified-ceiling.json` already uses for the ownership
 * generator, for the same reason.
 *
 * The ceiling is per check, not one total, so 30 new `states` gaps cannot hide
 * behind 30 closed `real-world` ones.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/story-dod-tiers.ts
 *   tsx packages/tooling/src/validators/story-dod-tiers.ts --all      # list items
 *   tsx packages/tooling/src/validators/story-dod-tiers.ts --write    # lower the ceiling
 *
 * Exit code 1 when a count exceeds its ceiling, or when the ceiling is stale.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { TIER_REQUIRED_CHECKS, triage } from '../quality/story-dod-triage.ts'

export const CEILING_PATH = resolve(ROOT, 'packages/tooling/src/quality/story-dod-ceiling.json')

export interface StoryDodCeiling {
  /** check id → the most open tier-required items this repository tolerates. */
  readonly ceilings: Readonly<Record<string, number>>
  /** Items deliberately not counted, with the reason. `component:check`. */
  readonly waived: Readonly<Record<string, string>>
}

export interface CeilingViolation {
  rule: 'exceeded' | 'stale' | 'waiver'
  message: string
}

export function readCeiling(path: string = CEILING_PATH): StoryDodCeiling | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as StoryDodCeiling
}

/** Count open tier-required items per check, honouring waivers. */
export function countOpen(
  summary: ReturnType<typeof triage>,
  waived: Readonly<Record<string, string>>,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const check of Object.keys(TIER_REQUIRED_CHECKS)) {
    if (TIER_REQUIRED_CHECKS[check] === null)
      continue
    counts[check] = 0
  }
  for (const item of summary.items) {
    if (!item.required)
      continue
    if (waived[`${item.component}:${item.check}`] !== undefined)
      continue
    counts[item.check] = (counts[item.check] ?? 0) + 1
  }
  return counts
}

/** Compare counts to the ceiling. Pure — this is what the unit tests drive. */
export function checkCeiling(
  counts: Readonly<Record<string, number>>,
  ceiling: StoryDodCeiling,
  openKeys: ReadonlySet<string>,
): CeilingViolation[] {
  const violations: CeilingViolation[] = []

  for (const [check, count] of Object.entries(counts)) {
    const limit = ceiling.ceilings[check]
    if (limit === undefined) {
      violations.push({
        rule: 'stale',
        message: `\`${check}\` is a tier-required check with no ceiling. Add one at its `
          + `current count (${count}); a check with no ceiling is a check nothing holds.`,
      })
      continue
    }
    if (count > limit) {
      violations.push({
        rule: 'exceeded',
        message: `\`${check}\`: ${count} open tier-required item(s), ceiling ${limit}. `
          + `Close the new one, or say why the tier does not apply — the ceiling only falls.`,
      })
    }
    else if (count < limit) {
      violations.push({
        rule: 'stale',
        message: `\`${check}\`: ${count} open, ceiling still ${limit}. Run with --write to `
          + `lower it, so the progress cannot be undone silently.`,
      })
    }
  }

  for (const key of Object.keys(ceiling.waived)) {
    if (!openKeys.has(key)) {
      violations.push({
        rule: 'waiver',
        message: `\`${key}\` is waived and is no longer an open item. Delete the waiver — a `
          + `waiver nothing is using is a claim about a gap that has moved.`,
      })
    }
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const write = process.argv.includes('--write')

  const summary = triage()
  const ceiling = readCeiling() ?? { ceilings: {}, waived: {} }
  const counts = countOpen(summary, ceiling.waived)
  const openKeys = new Set(
    summary.items.filter(i => i.required).map(i => `${i.component}:${i.check}`),
  )

  console.warn('Story DoD, triaged by risk tier — TASK-OSS-P5-02\n')
  console.warn('  check           requires   open / ceiling')
  for (const [check, count] of Object.entries(counts).sort()) {
    const limit = ceiling.ceilings[check]
    const from = TIER_REQUIRED_CHECKS[check]
    console.warn(
      `  ${check.padEnd(16)}tier ${from}+    ${String(count).padStart(3)} / `
      + `${limit === undefined ? '(none)' : limit}`,
    )
  }
  console.warn(
    `\n  ${summary.requiredTotal} tier-required, ${summary.advisoryTotal} advisory `
    + `(of ${summary.items.length} reported)`,
  )
  console.warn(
    `  the largest advisory category is \`gallery\` at ${summary.byCheck.gallery?.total ?? 0}, `
    + `and no tier requires it`,
  )

  if (showAll) {
    console.warn('\n--- open tier-required items ---')
    for (const item of summary.items.filter(i => i.required)) {
      const waiver = ceiling.waived[`${item.component}:${item.check}`]
      console.warn(
        `  · ${item.component} [${item.check}] tier ${item.tier}`
        + `${waiver === undefined ? '' : ` — WAIVED: ${waiver}`}`,
      )
    }
  }

  if (write) {
    const next: StoryDodCeiling = { ceilings: counts, waived: ceiling.waived }
    writeFileSync(CEILING_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    console.warn(`\n✓ ceiling written to packages/tooling/src/quality/story-dod-ceiling.json`)
    process.exit(0)
  }

  const violations = checkCeiling(counts, ceiling, openKeys)
  if (violations.length === 0) {
    console.warn(`\n✓ story-dod-tiers: no tier-required category is above its ceiling.`)
    process.exit(0)
  }

  console.error('')
  for (const v of violations)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${violations.length} story-dod-tier violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
