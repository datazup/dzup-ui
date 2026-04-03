/**
 * Peer Dependency Validation Script
 *
 * Reads package.json from each workspace package and checks that every
 * peerDependencies entry is satisfied by:
 *   - The version installed in root node_modules/ (for external deps)
 *   - The workspace package version (for @dzup-ui/* workspace deps)
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-peers.ts
 *
 * Exit code 1 if any incompatible peer dependency found.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types ---

interface PackageJson {
  name: string
  version: string
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

type Status = 'PASS' | 'WARN' | 'FAIL'

interface PeerCheckResult {
  dep: string
  range: string
  resolved: string
  status: Status
  message: string
}

interface PackageResult {
  name: string
  checks: PeerCheckResult[]
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')
const PACKAGES_DIR = resolve(ROOT, 'packages')
const NODE_MODULES = resolve(ROOT, 'node_modules')

// --- Helpers ---

/**
 * Reads and parses a package.json file.
 * Returns null if the file does not exist.
 */
function readPackageJson(dir: string): PackageJson | null {
  const pkgPath = resolve(dir, 'package.json')
  if (!existsSync(pkgPath)) {
    return null
  }
  const raw = readFileSync(pkgPath, 'utf-8')
  return JSON.parse(raw) as PackageJson
}

/**
 * Builds a map of workspace package names to their versions.
 */
function buildWorkspaceVersionMap(): Map<string, string> {
  const map = new Map<string, string>()
  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => resolve(PACKAGES_DIR, d.name))

  for (const dir of packageDirs) {
    const pkg = readPackageJson(dir)
    if (pkg !== null) {
      map.set(pkg.name, pkg.version)
    }
  }

  return map
}

/**
 * Gets the installed version of a package from node_modules.
 * Returns null if not found.
 */
function getInstalledVersion(depName: string): string | null {
  // Handle scoped packages (@scope/name)
  const depDir = resolve(NODE_MODULES, depName)
  const pkg = readPackageJson(depDir)
  return pkg !== null ? pkg.version : null
}

/**
 * Checks if a concrete version satisfies a semver range.
 * Implements basic semver range checking without external dependencies:
 *   - ^x.y.z (caret ranges)
 *   - ~x.y.z (tilde ranges)
 *   - >=x.y.z
 *   - x.y.z (exact)
 *   - workspace:* (always satisfied for workspace deps)
 */
function satisfiesRange(version: string, range: string): boolean {
  // workspace protocol — always satisfied within monorepo
  if (range.startsWith('workspace:')) {
    return true
  }

  const parseSemver = (v: string): [number, number, number, string] | null => {
    // Strip leading = or v
    const cleaned = v.replace(/^[=v]+/, '')
    const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(cleaned)
    if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
      return null
    }
    return [
      Number.parseInt(match[1], 10),
      Number.parseInt(match[2], 10),
      Number.parseInt(match[3], 10),
      match[4] ?? '',
    ]
  }

  const compareVersions = (a: [number, number, number, string], b: [number, number, number, string]): number => {
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) {
        return (a[i] as number) - (b[i] as number)
      }
    }
    // Pre-release versions sort before release
    if (a[3] !== '' && b[3] === '')
      return -1
    if (a[3] === '' && b[3] !== '')
      return 1
    return a[3].localeCompare(b[3])
  }

  const ver = parseSemver(version)
  if (ver === null)
    return false

  // Handle caret range: ^x.y.z
  if (range.startsWith('^')) {
    const rangeVer = parseSemver(range.slice(1))
    if (rangeVer === null)
      return false

    // Version must be >= range version
    if (compareVersions(ver, rangeVer) < 0)
      return false

    // Major must match (for major > 0)
    if (rangeVer[0] > 0) {
      return ver[0] === rangeVer[0]
    }
    // For ^0.y.z, minor must match
    if (rangeVer[1] > 0) {
      return ver[0] === 0 && ver[1] === rangeVer[1]
    }
    // For ^0.0.z, patch must match
    return ver[0] === 0 && ver[1] === 0 && ver[2] === rangeVer[2]
  }

  // Handle tilde range: ~x.y.z
  if (range.startsWith('~')) {
    const rangeVer = parseSemver(range.slice(1))
    if (rangeVer === null)
      return false

    if (compareVersions(ver, rangeVer) < 0)
      return false

    return ver[0] === rangeVer[0] && ver[1] === rangeVer[1]
  }

  // Handle >= range
  if (range.startsWith('>=')) {
    const rangeVer = parseSemver(range.slice(2).trim())
    if (rangeVer === null)
      return false
    return compareVersions(ver, rangeVer) >= 0
  }

  // Exact version
  const rangeVer = parseSemver(range)
  if (rangeVer === null)
    return false
  return compareVersions(ver, rangeVer) === 0
}

/**
 * Checks all peer dependencies for a single package.
 */
function checkPeerDeps(
  pkg: PackageJson,
  workspaceVersions: Map<string, string>,
): PeerCheckResult[] {
  const results: PeerCheckResult[] = []
  const peers = pkg.peerDependencies ?? {}
  const meta = pkg.peerDependenciesMeta ?? {}

  for (const [dep, range] of Object.entries(peers)) {
    const isOptional = meta[dep]?.optional === true

    // Check if it's a workspace package
    const workspaceVersion = workspaceVersions.get(dep)
    if (workspaceVersion !== undefined) {
      const satisfied = satisfiesRange(workspaceVersion, range)
      results.push({
        dep,
        range,
        resolved: workspaceVersion,
        status: satisfied ? 'PASS' : 'FAIL',
        message: satisfied
          ? `workspace ${workspaceVersion} satisfies ${range}`
          : `workspace ${workspaceVersion} does NOT satisfy ${range}`,
      })
      continue
    }

    // Check installed version in node_modules
    const installedVersion = getInstalledVersion(dep)

    if (installedVersion === null) {
      results.push({
        dep,
        range,
        resolved: 'not installed',
        status: isOptional ? 'WARN' : 'FAIL',
        message: isOptional
          ? `not installed (optional peer — acceptable)`
          : `not installed but required`,
      })
      continue
    }

    const satisfied = satisfiesRange(installedVersion, range)
    results.push({
      dep,
      range,
      resolved: installedVersion,
      status: satisfied ? 'PASS' : 'FAIL',
      message: satisfied
        ? `${installedVersion} satisfies ${range}`
        : `${installedVersion} does NOT satisfy ${range}`,
    })
  }

  return results
}

// --- Main ---

function main(): void {
  console.warn('Peer dependency validation\n')

  const workspaceVersions = buildWorkspaceVersionMap()
  const packageResults: PackageResult[] = []

  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => resolve(PACKAGES_DIR, d.name))

  for (const dir of packageDirs) {
    const pkg = readPackageJson(dir)
    if (pkg === null)
      continue

    const peers = pkg.peerDependencies ?? {}
    if (Object.keys(peers).length === 0)
      continue

    const checks = checkPeerDeps(pkg, workspaceVersions)
    packageResults.push({ name: pkg.name, checks })
  }

  if (packageResults.length === 0) {
    console.warn('  No packages with peer dependencies found.')
    console.warn('\nPeer dependency validation passed.')
    process.exit(0)
  }

  let totalPass = 0
  let totalWarn = 0
  let totalFail = 0

  for (const result of packageResults) {
    console.warn(`\n  ${result.name}`)

    for (const check of result.checks) {
      const label = `${check.dep} ${check.range}`
      console.warn(`    ${check.status}  ${label} — ${check.message}`)

      if (check.status === 'PASS')
        totalPass++
      else if (check.status === 'WARN')
        totalWarn++
      else totalFail++
    }
  }

  console.warn(`\n${'='.repeat(60)}`)
  console.warn(`Results: ${totalPass} compatible, ${totalWarn} warnings, ${totalFail} incompatible`)

  if (totalFail > 0) {
    console.error(`\nPeer dependency validation FAILED: ${totalFail} incompatible peer(s)`)
    process.exit(1)
  }

  if (totalWarn > 0) {
    console.warn(`\nNote: ${totalWarn} optional peer(s) not installed.`)
  }

  console.warn('\nPeer dependency validation passed.')
  process.exit(0)
}

main()
