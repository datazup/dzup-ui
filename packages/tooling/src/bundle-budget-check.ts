/**
 * Bundle Budget Check
 *
 * Reads `bundlesize.config.json` from the repo root and validates each
 * file's gzipped size against the declared maxSize budget.
 *
 * Features:
 * - Gzip compression measurement via `node:zlib`
 * - Human-readable size parsing and formatting
 * - `--ci` flag for machine-readable JSON output
 * - Non-zero exit code when any budget is exceeded
 *
 * Usage:
 *   npx tsx packages/tooling/src/bundle-budget-check.ts
 *   npx tsx packages/tooling/src/bundle-budget-check.ts --ci
 *
 * @module @dzup-ui/tooling/bundle-budget-check
 */

import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BudgetEntry {
  /** Relative path from repo root to the file */
  path: string
  /** Human-readable max size, e.g. "150 kB", "1.5 MB", "500 B" */
  maxSize: string
  /** Compression algorithm (currently only "gzip" supported) */
  compression?: 'gzip' | 'none'
}

export interface BundleSizeConfig {
  files: BudgetEntry[]
}

export interface CheckResult {
  path: string
  maxSizeBytes: number
  maxSizeLabel: string
  actualSizeBytes: number
  actualSizeLabel: string
  passed: boolean
  exists: boolean
}

export interface CheckSummary {
  results: CheckResult[]
  passed: number
  failed: number
  skipped: number
  allPassed: boolean
}

// ---------------------------------------------------------------------------
// Size Parsing & Formatting
// ---------------------------------------------------------------------------

const SIZE_REGEX = /^([\d.]+)\s*(B|kB|MB)$/i

/**
 * Parses a human-readable size string into bytes.
 *
 * @example
 * parseSizeToBytes("150 kB") // 153600
 * parseSizeToBytes("1.5 MB") // 1572864
 * parseSizeToBytes("500 B")  // 500
 */
export function parseSizeToBytes(sizeStr: string): number {
  const match = SIZE_REGEX.exec(sizeStr.trim())

  if (match === null || match[1] === undefined || match[2] === undefined) {
    throw new Error(
      `Invalid size format: "${sizeStr}". Expected format like "150 kB", "1.5 MB", or "500 B".`,
    )
  }

  const value = Number.parseFloat(match[1])

  if (Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid size value: "${match[1]}" — must be a non-negative number.`)
  }

  const unit = match[2].toLowerCase()

  switch (unit) {
    case 'b':
      return Math.round(value)
    case 'kb':
      return Math.round(value * 1024)
    case 'mb':
      return Math.round(value * 1024 * 1024)
    default:
      throw new Error(`Unsupported size unit: "${unit}"`)
  }
}

/**
 * Formats bytes into a human-readable string.
 *
 * @example
 * formatBytes(500)     // "500 B"
 * formatBytes(4331)    // "4.23 kB"
 * formatBytes(1572864) // "1.50 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} kB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ---------------------------------------------------------------------------
// Gzip Measurement
// ---------------------------------------------------------------------------

/**
 * Computes the gzipped size of a file in bytes.
 * Uses maximum compression level (9) for consistent measurement.
 */
export function getGzippedSize(filePath: string): number {
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content, { level: 9 })
  return gzipped.length
}

/**
 * Gets the raw file size in bytes (no compression).
 */
export function getRawSize(filePath: string): number {
  const content = readFileSync(filePath)
  return content.length
}

// ---------------------------------------------------------------------------
// Core Check Logic
// ---------------------------------------------------------------------------

/**
 * Loads and parses bundlesize.config.json from the given root directory.
 */
export function loadConfig(rootDir: string): BundleSizeConfig {
  const configPath = resolve(rootDir, 'bundlesize.config.json')

  if (!existsSync(configPath)) {
    throw new Error(
      `Bundle size config not found: ${relative(rootDir, configPath)}\n`
      + 'Expected bundlesize.config.json at repo root.',
    )
  }

  const raw = readFileSync(configPath, 'utf-8')
  const config = JSON.parse(raw) as BundleSizeConfig

  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error('bundlesize.config.json has no files entries.')
  }

  return config
}

/**
 * Checks a single budget entry against its actual file size.
 */
export function checkEntry(rootDir: string, entry: BudgetEntry): CheckResult {
  const filePath = resolve(rootDir, entry.path)
  const relPath = relative(rootDir, filePath)
  const maxSizeBytes = parseSizeToBytes(entry.maxSize)

  if (!existsSync(filePath)) {
    return {
      path: relPath,
      maxSizeBytes,
      maxSizeLabel: entry.maxSize,
      actualSizeBytes: 0,
      actualSizeLabel: 'N/A',
      passed: false,
      exists: false,
    }
  }

  const useGzip = entry.compression !== 'none'
  const actualSizeBytes = useGzip ? getGzippedSize(filePath) : getRawSize(filePath)
  const passed = actualSizeBytes <= maxSizeBytes

  return {
    path: relPath,
    maxSizeBytes,
    maxSizeLabel: entry.maxSize,
    actualSizeBytes,
    actualSizeLabel: formatBytes(actualSizeBytes),
    passed,
    exists: true,
  }
}

/**
 * Runs the full bundle budget check against all configured entries.
 */
export function runBudgetCheck(rootDir: string): CheckSummary {
  const config = loadConfig(rootDir)
  const results: CheckResult[] = config.files.map(entry => checkEntry(rootDir, entry))

  const passed = results.filter(r => r.exists && r.passed).length
  const failed = results.filter(r => r.exists && !r.passed).length
  const skipped = results.filter(r => !r.exists).length

  return {
    results,
    passed,
    failed,
    skipped,
    allPassed: failed === 0,
  }
}

// ---------------------------------------------------------------------------
// Output Formatting
// ---------------------------------------------------------------------------

/**
 * Prints results in human-readable format.
 */
function printHumanReport(summary: CheckSummary): void {
  console.log('\n=== Bundle Budget Check ===\n')

  const maxPathLen = Math.max(...summary.results.map(r => r.path.length))

  for (const result of summary.results) {
    const paddedPath = result.path.padEnd(maxPathLen + 2)

    if (!result.exists) {
      console.log(`  SKIP  ${paddedPath} (file not found — build first)`)
      continue
    }

    const status = result.passed ? 'PASS' : 'FAIL'
    const arrow = result.passed ? '<=' : '> '
    const pct = ((result.actualSizeBytes / result.maxSizeBytes) * 100).toFixed(1)
    console.log(
      `  ${status}  ${paddedPath} ${result.actualSizeLabel} ${arrow} ${result.maxSizeLabel} (${pct}% of budget)`,
    )
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(
    `Results: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`,
  )

  if (summary.failed > 0) {
    console.error(`\nBundle budget EXCEEDED for ${summary.failed} file(s)`)
  }
  else if (summary.skipped > 0) {
    console.log(`\nNote: ${summary.skipped} file(s) not found — run yarn build first.`)
  }
  else {
    console.log('\nAll bundle budgets within limits.')
  }
}

/**
 * Prints results in machine-readable JSON format for CI pipelines.
 */
function printCiReport(summary: CheckSummary): void {
  const output = {
    status: summary.allPassed ? 'pass' : 'fail',
    summary: {
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
    },
    entries: summary.results.map(r => ({
      path: r.path,
      exists: r.exists,
      passed: r.passed,
      actualBytes: r.actualSizeBytes,
      actualLabel: r.actualSizeLabel,
      budgetBytes: r.maxSizeBytes,
      budgetLabel: r.maxSizeLabel,
      usagePercent: r.exists ? Number(((r.actualSizeBytes / r.maxSizeBytes) * 100).toFixed(1)) : 0,
    })),
  }

  console.log(JSON.stringify(output, null, 2))
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2)
  const ciMode = args.includes('--ci')
  const rootDir = resolve(import.meta.dirname, '..', '..', '..')

  try {
    const summary = runBudgetCheck(rootDir)

    if (ciMode) {
      printCiReport(summary)
    }
    else {
      printHumanReport(summary)
    }

    process.exit(summary.failed > 0 ? 1 : 0)
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Bundle budget check failed: ${message}`)
    process.exit(1)
  }
}

// Only run when executed directly (not when imported by tests)
const isDirectRun = process.argv[1]?.includes('bundle-budget-check')
if (isDirectRun) {
  main()
}
