/* eslint-disable no-console */
/**
 * Landing bundle-size budget.
 *
 * Guards the initial JavaScript/CSS the landing site ships on first paint — the
 * bytes that most directly move Core Web Vitals (LCP/TBT). Complements the
 * Lighthouse CI job (apps/landing/lighthouserc.json), which asserts the *lab*
 * metrics; this asserts the *payload* that produces them, so a regression is
 * caught even on a fast CI runner where the timings still pass.
 *
 * What "initial JS" means here: the entry chunk (`index-*.js`) plus the two
 * always-loaded vendor chunks it imports (`vendor-vue-*`, `vendor-icons-*` — see
 * the manualChunks split in vite.config.ts). Those three download on the first
 * render of every route, so their combined gzip size is the number that matters.
 * Lazy route chunks (themes, templates, blocks, …) are reported but not gated —
 * they load on navigation, not first paint.
 *
 * Sizes are gzip level 9, matching packages/tooling/src/bundle-budget-check.ts so
 * the two budgets speak the same units.
 *
 * Usage:
 *   tsx apps/landing/scripts/check-bundle-budget.ts            # human report, exit 1 on fail
 *   tsx apps/landing/scripts/check-bundle-budget.ts --badge dist/perf-badge.json
 *
 * @module @dzup-ui/landing/scripts/check-bundle-budget
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const HERE = dirname(fileURLToPath(import.meta.url))
const LANDING_ROOT = resolve(HERE, '..')
const ASSETS_DIR = join(LANDING_ROOT, 'dist', 'assets')

// ---------------------------------------------------------------------------
// Budgets (gzip). Set with modest headroom over the measured baseline so normal
// growth is fine but a big regression (an eager import, an un-lazy demo, a heavy
// dependency) trips the gate. Tighten these as the entry chunk is trimmed.
// ---------------------------------------------------------------------------

const KB = 1024

interface Budget {
  label: string
  /** Filename matcher for the chunk(s) this budget covers. */
  match: RegExp
  /** Max combined gzip size in bytes for all files that match. */
  maxGzipBytes: number
  /** Whether this budget is part of the "initial load" total. */
  initial: boolean
}

const BUDGETS: Budget[] = [
  { label: 'Entry JS (index-*.js)', match: /^index-.*\.js$/, maxGzipBytes: 320 * KB, initial: true },
  { label: 'Vendor · Vue runtime', match: /^vendor-vue-.*\.js$/, maxGzipBytes: 55 * KB, initial: true },
  { label: 'Vendor · Lucide icons', match: /^vendor-icons-.*\.js$/, maxGzipBytes: 30 * KB, initial: true },
  { label: 'Entry CSS (index-*.css)', match: /^index-.*\.css$/, maxGzipBytes: 60 * KB, initial: false },
]

/** The initial-load JS total (entry + always-loaded vendors) gets its own gate. */
const INITIAL_JS_BUDGET = 400 * KB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`
  return `${(bytes / KB).toFixed(2)} kB`
}

function gzipSize(filePath: string): number {
  return gzipSync(readFileSync(filePath), { level: 9 }).length
}

interface BudgetResult extends Budget {
  files: string[]
  actualGzipBytes: number
  passed: boolean
}

function evaluate(): { results: BudgetResult[], initialJs: number, allFiles: string[] } {
  if (!existsSync(ASSETS_DIR)) {
    throw new Error(`Build output not found: ${ASSETS_DIR}\nRun \`yarn workspace @dzup-ui/landing build\` first.`)
  }

  const allFiles = readdirSync(ASSETS_DIR)
  const results: BudgetResult[] = BUDGETS.map((budget) => {
    const files = allFiles.filter(f => budget.match.test(f))
    const actualGzipBytes = files.reduce((sum, f) => sum + gzipSize(join(ASSETS_DIR, f)), 0)
    return { ...budget, files, actualGzipBytes, passed: actualGzipBytes <= budget.maxGzipBytes }
  })

  const initialJs = results
    .filter(r => r.initial && r.match.source.endsWith('js$'))
    .reduce((sum, r) => sum + r.actualGzipBytes, 0)

  return { results, initialJs, allFiles }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function main(): void {
  const badgeFlagIndex = process.argv.indexOf('--badge')
  const badgePath = badgeFlagIndex !== -1 ? process.argv[badgeFlagIndex + 1] : undefined

  let evaluation: ReturnType<typeof evaluate>
  try {
    evaluation = evaluate()
  }
  catch (error) {
    console.error(`Landing bundle budget check failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
    return
  }

  const { results, initialJs } = evaluation

  console.log('\n=== Landing Bundle Budget (gzip) ===\n')

  let failed = 0
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL'
    if (!r.passed) failed++
    const missing = r.files.length === 0 ? '  (no matching chunk)' : ''
    const pct = ((r.actualGzipBytes / r.maxGzipBytes) * 100).toFixed(0)
    console.log(
      `  ${status}  ${r.label.padEnd(26)} ${formatBytes(r.actualGzipBytes).padStart(10)} / ${formatBytes(r.maxGzipBytes).padStart(9)}  (${pct}%)${missing}`,
    )
  }

  const initialPassed = initialJs <= INITIAL_JS_BUDGET
  if (!initialPassed) failed++
  const initialPct = ((initialJs / INITIAL_JS_BUDGET) * 100).toFixed(0)
  console.log(
    `\n  ${initialPassed ? 'PASS' : 'FAIL'}  ${'Initial load JS (total)'.padEnd(26)} ${formatBytes(initialJs).padStart(10)} / ${formatBytes(INITIAL_JS_BUDGET).padStart(9)}  (${initialPct}%)`,
  )

  console.log(`\n${'='.repeat(64)}`)
  console.log(failed === 0 ? 'All landing bundle budgets within limits.' : `Landing bundle budget EXCEEDED for ${failed} target(s).`)

  // Emit a shields.io endpoint badge (schemaVersion 1) for the initial-JS size so
  // CI can publish it as an artifact / the README can point at it.
  if (badgePath) {
    const badge = {
      schemaVersion: 1,
      label: 'landing initial JS',
      message: `${formatBytes(initialJs)} gzip`,
      color: initialPassed ? (initialJs < INITIAL_JS_BUDGET * 0.85 ? 'brightgreen' : 'green') : 'red',
    }
    const outPath = resolve(process.cwd(), badgePath)
    writeFileSync(outPath, JSON.stringify(badge, null, 2))
    console.log(`\nWrote perf badge → ${outPath}`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

main()
