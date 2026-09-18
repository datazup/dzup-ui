/**
 * The peer-range logic behind `yarn validate:peers`, importable (TASK-R3-O4).
 *
 * Moved verbatim out of `packages/tooling/scripts/validate-peers.ts`, which
 * called `main()` — and `process.exit` — at import, so nothing could reuse or
 * test the one piece of this repository that already knows what an
 * incompatible peer is. Two changes, both additive: the installed-version
 * lookup is a parameter (the script passes the `node_modules` reader it always
 * used), and the line the script prints is a function, so a fixture can assert
 * the diagnostic a consumer actually reads.
 *
 * The consumer is `validate:security-corpus`, which executes the
 * peer-compatibility fixtures in `@dzup-ui/testing` against this check — the
 * "incompatible optional peer" case 08-11 doc 06 asked for (R-058d) —
 * rather than against a second copy of semver range logic.
 *
 * @module @dzup-ui/tooling/validators/peer-ranges
 */

export interface PeerPackageJson {
  name: string
  version: string
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
}

export type PeerStatus = 'PASS' | 'WARN' | 'FAIL'

export interface PeerCheckResult {
  dep: string
  range: string
  resolved: string
  status: PeerStatus
  message: string
}

/** Where a peer's installed version comes from; `null` means not installed. */
export type InstalledVersionLookup = (dep: string) => string | null

/**
 * Checks if a concrete version satisfies a semver range.
 * Implements basic semver range checking without external dependencies:
 *   - ^x.y.z (caret ranges)
 *   - ~x.y.z (tilde ranges)
 *   - >=x.y.z
 *   - x.y.z (exact)
 *   - workspace:* (always satisfied for workspace deps)
 */
export function satisfiesRange(version: string, range: string): boolean {
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
export function checkPeerDeps(
  pkg: PeerPackageJson,
  workspaceVersions: ReadonlyMap<string, string>,
  installedVersionOf: InstalledVersionLookup,
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
    const installedVersion = installedVersionOf(dep)

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

/** The line `validate:peers` prints for one check, without its indent. */
export function formatPeerCheck(check: PeerCheckResult): string {
  return `${check.status}  ${check.dep} ${check.range} — ${check.message}`
}
