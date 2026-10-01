/**
 * Per-export size gate (D140, owner decision D135 (a), 2026-09-29).
 *
 * `packages/core/perf/baselines.json` records a `size:*` budget for each
 * Tier C/D export, and until this file nothing read them: `perf-bench.spec.ts`
 * benches runtime scenarios only, and `component-size-report.ts` prints a table
 * and cannot fail. This measures every budgeted export with the same
 * tree-shaken fixture build the budgets were captured with
 * ({@link measureExportSizes}) and exits non-zero naming each one over its
 * threshold.
 *
 * It does **not** sit behind `DZUP_PERF_GATE`. That flag exists because a
 * wall-clock number measures the machine; a gzipped byte count of a
 * deterministic build does not, so there is nothing to opt out of.
 *
 * Raising a budget is still an owner act (`yarn perf:capture`, D132): the gate
 * never writes the file it reads.
 *
 * Usage:
 *   yarn perf:size-gate
 *   tsx packages/tooling/src/perf/size-gate.ts --baselines <path>
 *
 * @module @dzup-ui/tooling/perf/size-gate
 */

import type { Baseline } from './baselines.ts'
import type { ExportSize } from './export-sizes.ts'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { measureExportSizes } from './export-sizes.ts'
import { BASELINES_PATH, readBaselineFile } from './read-baselines.ts'

export interface SizeVerdict {
  readonly component: string
  readonly gzipBytes: number | null
  readonly threshold: number | null
  readonly ok: boolean
  readonly detail: string
}

/**
 * Compare measured sizes against the `size:*` budgets.
 *
 * A budget with no threshold, or with no measurement, fails: a deterministic
 * size always earns a threshold, so either case means the gate measured
 * something other than what the file budgets.
 */
export function checkSizes(
  budgets: readonly Baseline[],
  sizes: readonly ExportSize[],
): SizeVerdict[] {
  const measured = new Map(sizes.map(s => [s.component, s.gzipBytes]))

  return budgets
    .filter(b => b.kind === 'size')
    .map((b) => {
      const gzipBytes = measured.get(b.component) ?? null
      const threshold = b.threshold
      if (threshold === null)
        return { component: b.component, gzipBytes, threshold, ok: false, detail: `${b.id} has no threshold` }
      if (gzipBytes === null)
        return { component: b.component, gzipBytes, threshold, ok: false, detail: `${b.id} was not measured` }
      const ok = gzipBytes <= threshold
      const delta = ((gzipBytes - threshold) / threshold * 100).toFixed(1)
      return {
        component: b.component,
        gzipBytes,
        threshold,
        ok,
        detail: `${b.id}: ${gzipBytes} B ${ok ? '<=' : '>'} ${threshold} B (${ok ? '' : '+'}${delta}% vs threshold)`,
      }
    })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const flag = process.argv.indexOf('--baselines')
  const path = flag >= 0 ? resolve(process.argv[flag + 1] ?? '') : BASELINES_PATH
  const file = readBaselineFile(path)
  const budgets = file?.baselines.filter(b => b.kind === 'size') ?? []

  if (budgets.length === 0) {
    console.error(`size-gate: no size:* budgets in ${path}`)
    process.exit(1)
  }

  const verdicts = checkSizes(budgets, measureExportSizes(budgets.map(b => b.component)))
  for (const v of verdicts)
    console.warn(`  ${v.ok ? 'ok  ' : 'FAIL'} ${v.detail}`)

  const failed = verdicts.filter(v => !v.ok)
  if (failed.length > 0) {
    console.error(
      `\nsize-gate: ${failed.length} of ${verdicts.length} over budget: `
      + `${failed.map(v => v.component).join(', ')}. `
      + 'Shrink the bundle, or record an owner decision and re-capture (`yarn perf:capture`).',
    )
    process.exit(1)
  }
  console.warn(`\nsize-gate: all ${verdicts.length} size:* budgets within threshold`)
}
/* c8 ignore stop */
