/**
 * Peer Dependency Validation Script
 *
 * Reads package.json from each workspace package and checks that every
 * peerDependencies entry is satisfied by:
 *   - The version installed in root node_modules/ (for external deps)
 *   - The workspace package version (for @dzup-ui/* workspace deps)
 *
 * The range logic lives in `src/validators/peer-ranges.ts` (TASK-R3-O4) so the
 * peer-compatibility fixtures in `@dzup-ui/testing` can execute against the
 * same check; this script reads the repository and prints.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-peers.ts
 *
 * Exit code 1 if any incompatible peer dependency found.
 */

import type { PeerCheckResult, PeerPackageJson } from '../src/validators/peer-ranges.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { checkPeerDeps, formatPeerCheck } from '../src/validators/peer-ranges.ts'

// --- Types ---

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
function readPackageJson(dir: string): PeerPackageJson | null {
  const pkgPath = resolve(dir, 'package.json')
  if (!existsSync(pkgPath)) {
    return null
  }
  const raw = readFileSync(pkgPath, 'utf-8')
  return JSON.parse(raw) as PeerPackageJson
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

    const checks = checkPeerDeps(pkg, workspaceVersions, getInstalledVersion)
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
      console.warn(`    ${formatPeerCheck(check)}`)

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
