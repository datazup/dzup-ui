/**
 * Bundle Budget Validator
 *
 * Reads `bundlesize.config.json` from the repo root and checks each
 * file's gzipped size against the declared maxSize budget.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-bundle.ts
 *
 * Exit code 1 if any file exceeds its budget.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

// --- Types ---

interface BudgetEntry {
  path: string
  maxSize: string
}

interface BundleSizeConfig {
  files: BudgetEntry[]
}

interface CheckResult {
  path: string
  maxSizeBytes: number
  maxSizeLabel: string
  actualSizeBytes: number
  actualSizeLabel: string
  passed: boolean
  exists: boolean
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')
const CONFIG_PATH = resolve(ROOT, 'bundlesize.config.json')

// --- Helpers ---

/**
 * Parses a human-readable size string (e.g. "150 kB", "1.5 MB") into bytes.
 * Supports kB and MB units (case-insensitive).
 */
function parseSizeToBytes(sizeStr: string): number {
  const match = /^([\d.]+)\s*(kB|MB|B)$/i.exec(sizeStr.trim())
  if (match === null || match[1] === undefined || match[2] === undefined) {
    throw new Error(`Invalid size format: "${sizeStr}". Expected format like "150 kB" or "1.5 MB".`)
  }

  const value = Number.parseFloat(match[1])
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
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} kB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Computes the gzipped size of a file in bytes.
 */
function getGzippedSize(filePath: string): number {
  const content = readFileSync(filePath)
  const gzipped = gzipSync(content, { level: 9 })
  return gzipped.length
}

// --- Main ---

function main(): void {
  if (!existsSync(CONFIG_PATH)) {
    console.error(`Bundle size config not found: ${relative(ROOT, CONFIG_PATH)}`)
    console.error('Expected bundlesize.config.json at repo root.')
    process.exit(1)
  }

  const raw = readFileSync(CONFIG_PATH, 'utf-8')
  const config: BundleSizeConfig = JSON.parse(raw) as BundleSizeConfig

  if (!Array.isArray(config.files) || config.files.length === 0) {
    console.error('bundlesize.config.json has no files entries.')
    process.exit(1)
  }

  console.warn('Bundle size validation\n')

  const results: CheckResult[] = []

  for (const entry of config.files) {
    const filePath = resolve(ROOT, entry.path)
    const relPath = relative(ROOT, filePath)
    const maxSizeBytes = parseSizeToBytes(entry.maxSize)

    if (!existsSync(filePath)) {
      results.push({
        path: relPath,
        maxSizeBytes,
        maxSizeLabel: entry.maxSize,
        actualSizeBytes: 0,
        actualSizeLabel: 'N/A',
        passed: false,
        exists: false,
      })
      continue
    }

    const actualSizeBytes = getGzippedSize(filePath)
    const passed = actualSizeBytes <= maxSizeBytes

    results.push({
      path: relPath,
      maxSizeBytes,
      maxSizeLabel: entry.maxSize,
      actualSizeBytes,
      actualSizeLabel: formatBytes(actualSizeBytes),
      passed,
      exists: true,
    })
  }

  // Print results
  const maxPathLen = Math.max(...results.map(r => r.path.length))

  for (const result of results) {
    const paddedPath = result.path.padEnd(maxPathLen + 2)

    if (!result.exists) {
      console.warn(`  SKIP  ${paddedPath} (file not found — build first)`)
      continue
    }

    const status = result.passed ? 'PASS' : 'FAIL'
    const arrow = result.passed ? '<=' : '> '
    console.warn(`  ${status}  ${paddedPath} ${result.actualSizeLabel} ${arrow} ${result.maxSizeLabel} (budget)`)
  }

  const failedCount = results.filter(r => r.exists && !r.passed).length
  const skippedCount = results.filter(r => !r.exists).length
  const passedCount = results.filter(r => r.exists && r.passed).length

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Results: ${passedCount} passed, ${failedCount} failed, ${skippedCount} skipped`)

  if (failedCount > 0) {
    console.error(`\nBundle budget EXCEEDED for ${failedCount} file(s)`)
    process.exit(1)
  }

  if (skippedCount > 0) {
    console.warn(`\nNote: ${skippedCount} file(s) not found — run build first to validate.`)
  }

  console.warn('\nBundle budget check passed.')
  process.exit(0)
}

main()
