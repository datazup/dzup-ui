/**
 * Changelog Validation Script
 *
 * Checks that CHANGELOG.md exists in each publishable package and validates
 * basic format:
 *   1. Has a top-level heading (# Changelog or # @dzup-ui/*)
 *   2. Has at least one version entry (## [x.y.z] or ## x.y.z)
 *   3. Version entries have date in ISO format (YYYY-MM-DD)
 *
 * Pre-release packages without a CHANGELOG.md get a WARN (not FAIL).
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-changelog.ts
 *
 * Exit code 1 if any malformed changelog found.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types ---

type Status = 'PASS' | 'WARN' | 'FAIL'

interface CheckResult {
  package: string
  status: Status
  message: string
  details: string[]
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

const PUBLISHABLE_PACKAGES: Array<{ name: string, dir: string }> = [
  { name: '@dzup-ui/core', dir: resolve(ROOT, 'packages/core') },
  { name: '@dzup-ui/pro', dir: resolve(ROOT, 'packages/pro') },
  { name: '@dzup-ui/tokens', dir: resolve(ROOT, 'packages/tokens') },
]

// --- Validation ---

/**
 * Validates the format of a CHANGELOG.md file.
 * Returns a list of issues found (empty if valid).
 */
function validateChangelogFormat(content: string, packageName: string): string[] {
  const issues: string[] = []
  const lines = content.split('\n')

  // Check 1: Top-level heading
  const hasTopHeading = lines.some(line =>
    /^#\s+(?:Changelog|@dzup-ui\/)/.test(line),
  )
  if (!hasTopHeading) {
    issues.push('Missing top-level heading (expected "# Changelog" or "# @dzup-ui/*")')
  }

  // Check 2: At least one version entry (## [x.y.z] or ## x.y.z)
  const versionLineRegex = /^##\s+\[?\d+\.\d+\.\d+/
  const versionLines = lines.filter(line => versionLineRegex.test(line))

  if (versionLines.length === 0) {
    issues.push(`No version entries found (expected "## [x.y.z]" or "## x.y.z" in ${packageName})`)
  }
  else {
    // Check 3: Each version entry should have an ISO date (YYYY-MM-DD)
    const isoDateRegex = /\d{4}-\d{2}-\d{2}/
    for (const versionLine of versionLines) {
      if (!isoDateRegex.test(versionLine)) {
        issues.push(`Version entry missing ISO date (YYYY-MM-DD): "${versionLine.trim()}"`)
      }
    }
  }

  return issues
}

/**
 * Checks a single package's CHANGELOG.md.
 */
function checkPackage(pkg: { name: string, dir: string }): CheckResult {
  const changelogPath = resolve(pkg.dir, 'CHANGELOG.md')
  const relPath = relative(ROOT, changelogPath)

  if (!existsSync(changelogPath)) {
    return {
      package: pkg.name,
      status: 'WARN',
      message: `${relPath} not found (pre-release — acceptable)`,
      details: [],
    }
  }

  const content = readFileSync(changelogPath, 'utf-8')

  if (content.trim().length === 0) {
    return {
      package: pkg.name,
      status: 'FAIL',
      message: `${relPath} exists but is empty`,
      details: [],
    }
  }

  const issues = validateChangelogFormat(content, pkg.name)

  if (issues.length === 0) {
    return {
      package: pkg.name,
      status: 'PASS',
      message: `${relPath} is valid`,
      details: [],
    }
  }

  return {
    package: pkg.name,
    status: 'FAIL',
    message: `${relPath} has format issues`,
    details: issues,
  }
}

// --- Main ---

function main(): void {
  console.warn('Changelog validation\n')

  const results: CheckResult[] = []

  for (const pkg of PUBLISHABLE_PACKAGES) {
    const result = checkPackage(pkg)
    results.push(result)

    console.warn(`  ${result.status}  ${result.package} — ${result.message}`)

    for (const detail of result.details) {
      console.warn(`         ${detail}`)
    }
  }

  const passCount = results.filter(r => r.status === 'PASS').length
  const warnCount = results.filter(r => r.status === 'WARN').length
  const failCount = results.filter(r => r.status === 'FAIL').length

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Results: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`)

  if (failCount > 0) {
    console.error(`\nChangelog validation FAILED: ${failCount} package(s) have malformed changelogs`)
    process.exit(1)
  }

  if (warnCount > 0) {
    console.warn(`\nNote: ${warnCount} package(s) missing CHANGELOG.md — acceptable for pre-release.`)
  }

  console.warn('\nChangelog validation passed.')
  process.exit(0)
}

main()
