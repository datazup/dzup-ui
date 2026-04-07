/* eslint-disable no-console */
/**
 * Dependency License Audit
 *
 * Scans all production dependencies of core (MIT) and pro (commercial) packages
 * for incompatible licenses. Flags GPL, AGPL, and other copyleft licenses that
 * could create legal issues.
 *
 * Usage:
 *   npx tsx packages/tooling/src/license-audit.ts
 *   npx tsx packages/tooling/src/license-audit.ts --ci
 *
 * @module @dzup-ui/tooling/license-audit
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LicenseEntry {
  package: string
  version: string
  license: string
  allowed: boolean
  reason?: string
}

export interface LicenseAuditResult {
  entries: LicenseEntry[]
  passed: number
  flagged: number
  unknown: number
  allPassed: boolean
}

// ---------------------------------------------------------------------------
// License Classification
// ---------------------------------------------------------------------------

/**
 * Licenses that are compatible with both MIT and commercial distribution.
 */
const ALLOWED_LICENSES = new Set([
  'MIT',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  '0BSD',
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-3.0',
  'Unlicense',
  'BlueOak-1.0.0',
  'Python-2.0',
  'Zlib',
  'Artistic-2.0',
  'W3C',
])

/**
 * Licenses that are definitely incompatible with commercial distribution.
 */
const BLOCKED_LICENSES = new Set([
  'GPL-2.0',
  'GPL-2.0-only',
  'GPL-2.0-or-later',
  'GPL-3.0',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'AGPL-3.0',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'LGPL-2.0',
  'LGPL-2.1',
  'LGPL-3.0',
  'SSPL-1.0',
  'EUPL-1.1',
  'EUPL-1.2',
  'OSL-3.0',
  'CPAL-1.0',
  'CPOL-1.02',
])

function classifyLicense(license: string): { allowed: boolean, reason?: string } {
  const normalized = license.trim()

  if (ALLOWED_LICENSES.has(normalized)) {
    return { allowed: true }
  }

  if (BLOCKED_LICENSES.has(normalized)) {
    return { allowed: false, reason: `Copyleft license: ${normalized}` }
  }

  // Handle SPDX expressions like "(MIT OR Apache-2.0)"
  if (normalized.startsWith('(') && normalized.endsWith(')')) {
    const inner = normalized.slice(1, -1)
    const parts = inner.split(/\s+OR\s+/i)
    const anyAllowed = parts.some(p => ALLOWED_LICENSES.has(p.trim()))
    if (anyAllowed) {
      return { allowed: true }
    }
  }

  return { allowed: false, reason: `Unknown license: ${normalized}` }
}

// ---------------------------------------------------------------------------
// Dependency Discovery
// ---------------------------------------------------------------------------

function getProductionDeps(packageJsonPath: string): Map<string, string> {
  if (!existsSync(packageJsonPath))
    return new Map()

  const raw = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const deps = new Map<string, string>()

  for (const [name, version] of Object.entries(raw.dependencies ?? {})) {
    deps.set(name, version as string)
  }
  for (const [name, version] of Object.entries(raw.peerDependencies ?? {})) {
    deps.set(name, version as string)
  }

  return deps
}

function getPackageLicense(rootDir: string, pkgName: string): { version: string, license: string } {
  const pkgJsonPath = join(rootDir, 'node_modules', pkgName, 'package.json')

  if (!existsSync(pkgJsonPath)) {
    return { version: 'unknown', license: 'UNKNOWN' }
  }

  const raw = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
  return {
    version: raw.version ?? 'unknown',
    license: raw.license ?? 'UNKNOWN',
  }
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function runLicenseAudit(rootDir: string): LicenseAuditResult {
  const packages = ['packages/core', 'packages/tokens']
  const allDeps = new Map<string, string>()

  for (const pkg of packages) {
    const deps = getProductionDeps(join(rootDir, pkg, 'package.json'))
    for (const [name, version] of deps) {
      // Skip workspace and internal dependencies
      if (version === 'workspace:*' || name.startsWith('@dzup-ui/'))
        continue
      allDeps.set(name, version)
    }
  }

  const entries: LicenseEntry[] = []

  for (const [name] of allDeps) {
    const { version, license } = getPackageLicense(rootDir, name)
    const { allowed, reason } = classifyLicense(license)

    entries.push({
      package: name,
      version,
      license,
      allowed,
      reason,
    })
  }

  entries.sort((a, b) => {
    if (a.allowed !== b.allowed)
      return a.allowed ? 1 : -1
    return a.package.localeCompare(b.package)
  })

  const passed = entries.filter(e => e.allowed).length
  const flagged = entries.filter(e => !e.allowed && e.license !== 'UNKNOWN').length
  const unknown = entries.filter(e => e.license === 'UNKNOWN').length

  return {
    entries,
    passed,
    flagged,
    unknown,
    allPassed: flagged === 0,
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printHumanReport(result: LicenseAuditResult): void {
  console.log('\n=== Dependency License Audit ===\n')

  const maxNameLen = Math.max(...result.entries.map(e => e.package.length), 20)

  for (const entry of result.entries) {
    const status = entry.allowed ? 'OK  ' : entry.license === 'UNKNOWN' ? 'WARN' : 'FAIL'
    const name = entry.package.padEnd(maxNameLen + 2)
    const reason = entry.reason ? ` — ${entry.reason}` : ''
    console.log(`  ${status}  ${name}${entry.license.padEnd(15)} v${entry.version}${reason}`)
  }

  console.log(`\nResults: ${result.passed} allowed, ${result.flagged} blocked, ${result.unknown} unknown`)

  if (result.flagged > 0) {
    console.error(`\nLicense audit FAILED: ${result.flagged} dependencies have incompatible licenses`)
  }
  else if (result.unknown > 0) {
    console.log(`\nWarning: ${result.unknown} dependencies have unknown licenses — review manually`)
  }
  else {
    console.log('\nAll dependency licenses are compatible.')
  }
}

function printCiReport(result: LicenseAuditResult): void {
  console.log(JSON.stringify({
    status: result.allPassed ? 'pass' : 'fail',
    summary: { passed: result.passed, flagged: result.flagged, unknown: result.unknown },
    entries: result.entries,
  }, null, 2))
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2)
  const ciMode = args.includes('--ci')
  const rootDir = resolve(import.meta.dirname, '..', '..', '..')

  const result = runLicenseAudit(rootDir)

  if (ciMode) {
    printCiReport(result)
  }
  else {
    printHumanReport(result)
  }

  process.exit(result.flagged > 0 ? 1 : 0)
}

const isDirectRun = process.argv[1]?.includes('license-audit')
if (isDirectRun) {
  main()
}
