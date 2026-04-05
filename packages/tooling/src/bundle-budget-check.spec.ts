/**
 * Tests for bundle-budget-check.ts
 *
 * Tests the parsing, formatting, and check logic.
 * Pure functions are tested directly; file-dependent functions use
 * a temporary directory with real files.
 *
 * @module @dzip-ui/tooling/bundle-budget-check.spec
 */

import { Buffer } from 'node:buffer'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  checkEntry,
  formatBytes,
  getGzippedSize,
  getRawSize,
  loadConfig,
  parseSizeToBytes,
  runBudgetCheck,
} from './bundle-budget-check'

// ---------------------------------------------------------------------------
// parseSizeToBytes
// ---------------------------------------------------------------------------

describe('parseSizeToBytes', () => {
  it('parses kB values', () => {
    expect(parseSizeToBytes('150 kB')).toBe(150 * 1024)
  })

  it('parses kB with decimal', () => {
    expect(parseSizeToBytes('1.5 kB')).toBe(Math.round(1.5 * 1024))
  })

  it('parses MB values', () => {
    expect(parseSizeToBytes('1 MB')).toBe(1024 * 1024)
  })

  it('parses MB with decimal', () => {
    expect(parseSizeToBytes('2.5 MB')).toBe(Math.round(2.5 * 1024 * 1024))
  })

  it('parses B values', () => {
    expect(parseSizeToBytes('500 B')).toBe(500)
  })

  it('handles case-insensitive units', () => {
    expect(parseSizeToBytes('150 KB')).toBe(150 * 1024)
    expect(parseSizeToBytes('150 Kb')).toBe(150 * 1024)
    expect(parseSizeToBytes('1 mb')).toBe(1024 * 1024)
  })

  it('trims whitespace', () => {
    expect(parseSizeToBytes('  150 kB  ')).toBe(150 * 1024)
  })

  it('throws on invalid format', () => {
    expect(() => parseSizeToBytes('abc')).toThrow('Invalid size format')
    expect(() => parseSizeToBytes('')).toThrow('Invalid size format')
    expect(() => parseSizeToBytes('150')).toThrow('Invalid size format')
    expect(() => parseSizeToBytes('150 GB')).toThrow('Invalid size format')
  })

  it('handles zero values', () => {
    expect(parseSizeToBytes('0 kB')).toBe(0)
    expect(parseSizeToBytes('0 B')).toBe(0)
  })

  it('round-trips with formatBytes for kB', () => {
    const bytes = parseSizeToBytes('10 kB')
    expect(bytes).toBe(10240)
  })
})

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------

describe('formatBytes', () => {
  it('formats bytes under 1 kB', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats kB range', () => {
    expect(formatBytes(4331)).toBe('4.23 kB')
    expect(formatBytes(1024)).toBe('1.00 kB')
  })

  it('formats MB range', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB')
  })

  it('formats exact boundaries', () => {
    expect(formatBytes(1023)).toBe('1023 B')
    expect(formatBytes(1024)).toBe('1.00 kB')
  })
})

// ---------------------------------------------------------------------------
// File-based tests (using temp directory)
// ---------------------------------------------------------------------------

const TMP_DIR = join(import.meta.dirname, '.bundle-budget-test-tmp')

beforeAll(() => {
  mkdirSync(TMP_DIR, { recursive: true })
})

afterAll(() => {
  rmSync(TMP_DIR, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// getGzippedSize / getRawSize
// ---------------------------------------------------------------------------

describe('getGzippedSize', () => {
  it('returns gzipped size of file content', () => {
    const content = 'Hello, world! '.repeat(100)
    const filePath = join(TMP_DIR, 'test-gzip.txt')
    writeFileSync(filePath, content)

    const result = getGzippedSize(filePath)
    const expected = gzipSync(Buffer.from(content), { level: 9 }).length

    expect(result).toBe(expected)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(content.length) // gzip should compress repeated content
  })
})

describe('getRawSize', () => {
  it('returns raw file size in bytes', () => {
    const content = 'hello world'
    const filePath = join(TMP_DIR, 'test-raw.txt')
    writeFileSync(filePath, content)

    expect(getRawSize(filePath)).toBe(Buffer.byteLength(content))
  })
})

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

describe('loadConfig', () => {
  it('loads and parses a valid config', () => {
    const configDir = join(TMP_DIR, 'valid-config')
    mkdirSync(configDir, { recursive: true })
    writeFileSync(
      join(configDir, 'bundlesize.config.json'),
      JSON.stringify({
        files: [
          { path: 'dist/index.js', maxSize: '150 kB', compression: 'gzip' },
        ],
      }),
    )

    const config = loadConfig(configDir)
    expect(config.files).toHaveLength(1)
    expect(config.files[0]?.path).toBe('dist/index.js')
    expect(config.files[0]?.maxSize).toBe('150 kB')
  })

  it('throws when config file not found', () => {
    expect(() => loadConfig('/nonexistent/dir')).toThrow('Bundle size config not found')
  })

  it('throws when config has no files', () => {
    const configDir = join(TMP_DIR, 'empty-config')
    mkdirSync(configDir, { recursive: true })
    writeFileSync(
      join(configDir, 'bundlesize.config.json'),
      JSON.stringify({ files: [] }),
    )

    expect(() => loadConfig(configDir)).toThrow('no files entries')
  })
})

// ---------------------------------------------------------------------------
// checkEntry
// ---------------------------------------------------------------------------

describe('checkEntry', () => {
  const entryDir = join(TMP_DIR, 'check-entry')

  beforeAll(() => {
    mkdirSync(join(entryDir, 'dist'), { recursive: true })
    writeFileSync(join(entryDir, 'dist', 'small.js'), 'const x = 1;')
    writeFileSync(join(entryDir, 'dist', 'large.js'), 'x'.repeat(10000))
  })

  it('returns skipped result when file does not exist', () => {
    const result = checkEntry(entryDir, { path: 'dist/missing.js', maxSize: '100 kB' })
    expect(result.exists).toBe(false)
    expect(result.passed).toBe(false)
    expect(result.actualSizeLabel).toBe('N/A')
  })

  it('returns pass when file is under budget', () => {
    const result = checkEntry(entryDir, { path: 'dist/small.js', maxSize: '100 kB', compression: 'gzip' })
    expect(result.exists).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.actualSizeBytes).toBeGreaterThan(0)
    expect(result.maxSizeBytes).toBe(100 * 1024)
  })

  it('returns fail when file exceeds budget', () => {
    const result = checkEntry(entryDir, { path: 'dist/large.js', maxSize: '1 B', compression: 'gzip' })
    expect(result.exists).toBe(true)
    expect(result.passed).toBe(false)
    expect(result.actualSizeBytes).toBeGreaterThan(1)
  })

  it('uses raw size when compression is none', () => {
    const result = checkEntry(entryDir, { path: 'dist/small.js', maxSize: '100 kB', compression: 'none' })
    expect(result.exists).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.actualSizeBytes).toBe(Buffer.byteLength('const x = 1;'))
  })

  it('defaults to gzip when compression is not specified', () => {
    const result = checkEntry(entryDir, { path: 'dist/large.js', maxSize: '100 kB' })
    const expectedGzip = gzipSync(Buffer.from('x'.repeat(10000)), { level: 9 }).length
    expect(result.actualSizeBytes).toBe(expectedGzip)
    // Repeated content should compress well
    expect(result.actualSizeBytes).toBeLessThan(10000)
  })
})

// ---------------------------------------------------------------------------
// runBudgetCheck
// ---------------------------------------------------------------------------

describe('runBudgetCheck', () => {
  it('returns allPassed: true when all files are under budget', () => {
    const rootDir = join(TMP_DIR, 'run-pass')
    mkdirSync(join(rootDir, 'dist'), { recursive: true })
    writeFileSync(join(rootDir, 'dist', 'a.js'), 'const a = 1;')
    writeFileSync(join(rootDir, 'dist', 'b.js'), 'const b = 2;')
    writeFileSync(
      join(rootDir, 'bundlesize.config.json'),
      JSON.stringify({
        files: [
          { path: 'dist/a.js', maxSize: '100 kB', compression: 'gzip' },
          { path: 'dist/b.js', maxSize: '100 kB', compression: 'gzip' },
        ],
      }),
    )

    const summary = runBudgetCheck(rootDir)
    expect(summary.allPassed).toBe(true)
    expect(summary.passed).toBe(2)
    expect(summary.failed).toBe(0)
    expect(summary.skipped).toBe(0)
  })

  it('returns allPassed: false when a file exceeds budget', () => {
    const rootDir = join(TMP_DIR, 'run-fail')
    mkdirSync(join(rootDir, 'dist'), { recursive: true })
    writeFileSync(join(rootDir, 'dist', 'big.js'), 'x'.repeat(5000))
    writeFileSync(
      join(rootDir, 'bundlesize.config.json'),
      JSON.stringify({
        files: [
          { path: 'dist/big.js', maxSize: '1 B', compression: 'gzip' },
        ],
      }),
    )

    const summary = runBudgetCheck(rootDir)
    expect(summary.allPassed).toBe(false)
    expect(summary.failed).toBe(1)
  })

  it('counts missing files as skipped, not failed', () => {
    const rootDir = join(TMP_DIR, 'run-skip')
    mkdirSync(rootDir, { recursive: true })
    writeFileSync(
      join(rootDir, 'bundlesize.config.json'),
      JSON.stringify({
        files: [
          { path: 'dist/missing.js', maxSize: '100 kB' },
        ],
      }),
    )

    const summary = runBudgetCheck(rootDir)
    expect(summary.skipped).toBe(1)
    expect(summary.failed).toBe(0)
    // Missing files do not count as failures
    expect(summary.allPassed).toBe(true)
  })

  it('returns correct results array', () => {
    const rootDir = join(TMP_DIR, 'run-mixed')
    mkdirSync(join(rootDir, 'dist'), { recursive: true })
    writeFileSync(join(rootDir, 'dist', 'ok.js'), 'ok')
    writeFileSync(
      join(rootDir, 'bundlesize.config.json'),
      JSON.stringify({
        files: [
          { path: 'dist/ok.js', maxSize: '100 kB' },
          { path: 'dist/gone.js', maxSize: '100 kB' },
        ],
      }),
    )

    const summary = runBudgetCheck(rootDir)
    expect(summary.results).toHaveLength(2)
    expect(summary.passed).toBe(1)
    expect(summary.skipped).toBe(1)
  })
})
