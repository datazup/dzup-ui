import type { RowResult } from './matrix.ts'
import type { PackedPackage, Stage } from './stage.ts'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
/**
 * Rows 9, 10 and 11 — CSP + Trusted Types, licence/entitlement failure
 * behaviour, and the tarball file/export/API diff (TASK-S2-O1).
 *
 * Every assertion here reads the **packed** artifact. That is the whole point of
 * row 11: a check that reads a package's own `dist` directory is checking the
 * build, and the 08-11 stop condition is about the difference between the build
 * and what is actually shipped.
 *
 * @module e2e/package-qualification/rows-policy
 */
import { createRequire } from 'node:module'
import { join, posix, relative } from 'node:path'
import { ROOT } from '../../packages/tooling/src/release/binding.ts'
import { releasePolicy } from '../../packages/tooling/src/release/pack.ts'
import { SECOND_TIER_ABSENT } from './matrix.ts'

/** Withheld packages and their directory, from `release-policy.json`. */
function withheldPackages(): Array<{ name: string, dir: string }> {
  return releasePolicy().withheld.map(w => ({ name: w.name, dir: w.name.split('/')[1] ?? w.name }))
}

function secondTier(): Pick<RowResult, 'secondTier' | 'secondTierReason'> {
  return { secondTier: 'blocked', secondTierReason: SECOND_TIER_ABSENT }
}

/** Files a tarball may contain without being reachable from `exports`. */
const ALWAYS_ALLOWED = new Set(['package.json', 'README.md', 'LICENSE', 'LICENCE', 'CHANGELOG.md', 'VERSIONING.md'])

function walk(root: string, base = ''): string[] {
  const out: string[] = []
  for (const entry of readdirSync(join(root, base))) {
    const rel = base === '' ? entry : posix.join(base, entry)
    if (statSync(join(root, rel)).isDirectory())
      out.push(...walk(root, rel))
    else out.push(rel)
  }
  return out
}

/* ------------------------------------------------------------------ row 9 */

/**
 * DOM sinks that a Trusted-Types policy governs. A packed bundle that touches
 * one of these under `require-trusted-types-for 'script'` throws unless a policy
 * is installed, so enumerating them from the shipped bytes is the measurement
 * that decides whether the row can ever be green.
 */
const TRUSTED_TYPES_SINKS = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'document.write',
  'srcdoc',
] as const

/** Constructs a strict `script-src` without `'unsafe-eval'` forbids outright. */
const CSP_HOSTILE = [
  { pattern: /\beval\s*\(/g, name: 'eval()' },
  { pattern: /new\s+Function\s*\(/g, name: 'new Function()' },
] as const

export interface SinkHit {
  pkg: string
  file: string
  sink: string
  count: number
}

/**
 * Row 9 — CSP and Trusted Types, measured on the packed artifacts.
 *
 * The CSP half is **cited**: `e2e/csp/` already builds a consumer app, serves it
 * twice from one Node server with a per-request nonce, and asserts zero
 * violations, equal mounts and rejected `javascript:` URLs. Rebuilding that
 * would be duplication.
 *
 * The Trusted-Types half did not exist in any form — the only occurrence of the
 * phrase in the repository is a `trustedTypes?: boolean` field on the provider
 * contract, which nothing reads. This lane supplies the missing measurement: it
 * scans every shipped `.js` byte for the sinks a policy governs and for
 * constructs a strict `script-src` forbids, and reports them. A row cannot be
 * called green on a capability nothing implements, so the verdict here is driven
 * by what the scan finds, and the *enforcement* half is raised as a decision.
 */
export function rowCspTrustedTypes(stage: Stage): RowResult {
  const evidence = [
    'e2e/package-qualification/rows-policy.ts (rowCspTrustedTypes)',
    'e2e/csp/csp.spec.ts (cited — strict CSP with a per-request nonce, already green)',
  ]

  const sinkHits: SinkHit[] = []
  const hostileHits: SinkHit[] = []

  for (const pkg of stage.packed) {
    for (const file of walk(pkg.root)) {
      if (!file.endsWith('.js') && !file.endsWith('.mjs'))
        continue
      const source = readFileSync(join(pkg.root, file), 'utf8')
      for (const sink of TRUSTED_TYPES_SINKS) {
        const count = source.split(sink).length - 1
        if (count > 0)
          sinkHits.push({ pkg: pkg.name, file, sink, count })
      }
      for (const { pattern, name } of CSP_HOSTILE) {
        const count = source.match(pattern)?.length ?? 0
        if (count > 0)
          hostileHits.push({ pkg: pkg.name, file, sink: name, count })
      }
    }
  }

  // A strict `script-src` without 'unsafe-eval' is non-negotiable, so any
  // eval()/new Function() in shipped bytes is red on its own.
  if (hostileHits.length > 0) {
    return {
      n: 9,
      title: 'CSP and Trusted Types consumer fixture',
      verdict: 'red',
      reason: `${hostileHits.length} CSP-hostile construct(s) in packed bytes: ${hostileHits.slice(0, 3).map(h => `${h.pkg}/${h.file} → ${h.sink}`).join('; ')}`,
      evidence,
      detail: { hostileHits, sinkHits },
      cited: false,
      ...secondTier(),
    }
  }

  if (sinkHits.length > 0) {
    return {
      n: 9,
      title: 'CSP and Trusted Types consumer fixture',
      verdict: 'red',
      reason: `CSP half green (cited: e2e/csp); Trusted-Types half RED — ${sinkHits.length} governed sink(s) in packed bytes and no policy is created anywhere, so a consumer setting require-trusted-types-for 'script' would throw`,
      evidence,
      detail: { sinkHits, hostileHits, policyCreated: false },
      cited: false,
      ...secondTier(),
    }
  }

  return {
    n: 9,
    title: 'CSP and Trusted Types consumer fixture',
    verdict: 'green',
    reason: 'CSP half green (cited: e2e/csp, strict policy + per-request nonce); Trusted-Types half green — zero governed sinks and zero eval()/new Function() in any packed byte',
    evidence,
    detail: { sinkHits, hostileHits, sinksScanned: TRUSTED_TYPES_SINKS },
    cited: false,
    ...secondTier(),
  }
}

/* ----------------------------------------------------------------- row 10 */

const ALLOWED_LICENCES = new Set(['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD'])

/** The second-tier package name, probed rather than assumed. */
const SECOND_TIER_PACKAGE = '@dzup-ui-pro/pro'

export function secondTierInstalled(): boolean {
  try {
    createRequire(join(ROOT, 'package.json')).resolve(`${SECOND_TIER_PACKAGE}/package.json`)
    return true
  }
  catch {
    return false
  }
}

/**
 * Row 10 — licence metadata and entitlement failure behaviour.
 *
 * Two halves, reported separately because they fail for different reasons.
 *
 * **Licence**, fully runnable here: every packed tarball must declare an
 * allowed SPDX licence *and actually contain the LICENSE file it promises*. The
 * second clause is the one a workspace check cannot make — `files` can list
 * `LICENSE` while the file is absent, and only the tarball knows.
 *
 * **Entitlement**: this repository has no entitlement concept at all (no licence
 * key, no `DZUP_LICENSE`, nothing gated). The nearest real behaviour is the
 * documented build-time diagnostic when the second-tier package is missing,
 * which `packages/nuxt/test/fixtures/pro-missing/` already asserts and which is
 * cited. Proving the *installed* side needs a second-tier tarball this
 * repository cannot obtain, so that half is blocked by name.
 */
export function rowLicenceEntitlement(stage: Stage): RowResult {
  const evidence = [
    'e2e/package-qualification/rows-policy.ts (rowLicenceEntitlement)',
    'packages/nuxt/test/fixtures/pro-missing/ (cited — documented build-time diagnostic when the second tier is absent)',
    'packages/tooling/src/license-audit.ts (cited — dependency licence policy)',
  ]

  const problems: string[] = []
  const rows = stage.packed.map((pkg) => {
    const licence = typeof pkg.manifest.license === 'string' ? pkg.manifest.license : null
    const files = walk(pkg.root)
    const licenceFile = files.find(f => /^licen[cs]e(?:\.[a-z]+)?$/i.test(f)) ?? null
    if (licence === null)
      problems.push(`${pkg.name} declares no license field`)
    else if (!ALLOWED_LICENCES.has(licence))
      problems.push(`${pkg.name} declares a non-allowed licence "${licence}"`)
    if (licenceFile === null)
      problems.push(`${pkg.name} ships no LICENSE file in its tarball`)
    return { pkg: pkg.name, licence, licenceFile }
  })

  const proInstalled = secondTierInstalled()
  return {
    n: 10,
    title: 'Licence and entitlement failure behaviour',
    verdict: problems.length === 0 ? 'green' : 'red',
    reason: problems.length === 0
      ? `${rows.length}/${rows.length} packed tarballs declare an allowed licence and ship the LICENSE file; second-tier-absent diagnostic cited (pro-missing fixture). Entitlement-present half is ${proInstalled ? 'runnable' : 'blocked — @dzup-ui-pro/pro does not resolve'}`
      : problems.join(' · '),
    evidence,
    detail: { licences: rows, secondTierInstalled: proInstalled, entitlementConceptExists: false },
    cited: false,
    ...secondTier(),
  }
}

/* ----------------------------------------------------------------- row 11 */

export interface TarballDiff {
  pkg: string
  /** In the tarball but not produced by the reviewed build. */
  notInBuild: string[]
  /** Produced by the reviewed build but missing from the tarball. */
  missingFromTarball: string[]
  /**
   * Shipped but unreachable from `exports` and not an allowed metadata file.
   *
   * **Inventory, not a failure.** `files` legitimately ships payload that no
   * `exports` condition names — `@dzup-ui/mcp`'s `server.json`, which *is* the
   * MCP contract, and `@dzup-ui/testing`'s shared security corpus. Gating on
   * this would have failed three packages for shipping exactly what they are
   * supposed to ship. It is reported so a reviewer sees the shipped surface.
   */
  unreferenced: string[]
  /**
   * Compiled tests, fixtures or specs found in a tarball. This one **is** a
   * failure: it is review surface nobody reviewed, and it is the concrete class
   * this row was asked to catch.
   */
  testLeakage: string[]
  /** `exports` targets that do not exist inside the tarball. */
  brokenEntryPoints: string[]
  fileCount: number
  bytes: number
}

/** Paths that should never appear in a published tarball. */
const LEAKAGE = [/(^|\/)__tests__\//, /(^|\/)__fixtures__\//, /\.spec\.[cm]?[jt]s$/, /\.test\.[cm]?[jt]s$/]

function exportTargets(manifest: Record<string, unknown>): string[] {
  const out: string[] = []
  const walkExports = (node: unknown): void => {
    if (typeof node === 'string') {
      out.push(node.replace(/^\.\//, ''))
      return
    }
    if (node !== null && typeof node === 'object') {
      for (const value of Object.values(node as Record<string, unknown>)) walkExports(value)
    }
  }
  walkExports(manifest.exports)
  return out
}

/**
 * Row 11 — the tarball file / export / API diff.
 *
 * Three questions, and the 08-11 stop condition ("tarball differs from the
 * reviewed build or has undeclared files or entry points") needs all three:
 *
 * 1. **file diff** — does the tarball's payload match what `yarn build`
 *    produced? A file present in one and not the other is reported by name.
 * 2. **undeclared files** — is every shipped file reachable from `exports`, or
 *    an allowed metadata file? A package that ships compiled tests is shipping
 *    surface nobody reviewed.
 * 3. **broken entry points** — does every `exports` target actually exist inside
 *    the tarball? This is the class that produced the `tokens.css` defect P1-03
 *    found, which no workspace test could see.
 *
 * The API half is owned by `release:api-diff` and is cited rather than rebuilt —
 * with its stated limitation carried into the report: its baseline is
 * `admissible: false`, so it runs in degraded `manifest-only` mode and signature
 * changes are invisible.
 */
export function rowTarballDiff(stage: Stage): RowResult {
  const evidence = [
    'e2e/package-qualification/rows-policy.ts (rowTarballDiff)',
    'packages/tooling/src/release/api-diff.ts (cited for the API half — currently degraded, see detail.apiHalf)',
  ]

  const diffs: TarballDiff[] = []
  for (const pkg of stage.packed) {
    const shipped = walk(pkg.root)
    const targets = exportTargets(pkg.manifest)

    const reachable = (file: string): boolean => {
      if (ALWAYS_ALLOWED.has(file))
        return true
      for (const target of targets) {
        if (file === target)
          return true
        // A directory-shaped target (`dist/index.js`) makes its sibling chunks
        // and declarations reachable: they are what it imports at runtime.
        const dir = posix.dirname(target)
        if (dir !== '.' && file.startsWith(`${dir}/`))
          return true
      }
      return false
    }

    const buildDir = join(ROOT, relativePackageDir(pkg), 'dist')
    const built = existsSync(buildDir) ? walk(buildDir).map(f => `dist/${f}`) : []
    const shippedSet = new Set(shipped)
    const builtSet = new Set(built)

    diffs.push({
      pkg: pkg.name,
      fileCount: shipped.length,
      bytes: shipped.reduce((sum, f) => sum + statSync(join(pkg.root, f)).size, 0),
      notInBuild: built.length === 0 ? [] : shipped.filter(f => f.startsWith('dist/') && !builtSet.has(f)),
      missingFromTarball: built.filter(f => !shippedSet.has(f)),
      unreferenced: shipped.filter(f => !reachable(f)),
      testLeakage: shipped.filter(f => LEAKAGE.some(re => re.test(f))),
      brokenEntryPoints: targets.filter(t => !shippedSet.has(t)),
    })
  }

  const problems: string[] = []
  for (const d of diffs) {
    if (d.brokenEntryPoints.length > 0)
      problems.push(`${d.pkg}: ${d.brokenEntryPoints.length} exports target(s) missing from the tarball (${d.brokenEntryPoints.slice(0, 3).join(', ')})`)
    if (d.testLeakage.length > 0)
      problems.push(`${d.pkg}: ${d.testLeakage.length} test/fixture file(s) shipped (${d.testLeakage.slice(0, 3).join(', ')})`)
    if (d.notInBuild.length > 0)
      problems.push(`${d.pkg}: ${d.notInBuild.length} file(s) in the tarball that the reviewed build did not produce (${d.notInBuild.slice(0, 3).join(', ')})`)
    if (d.missingFromTarball.length > 0)
      problems.push(`${d.pkg}: ${d.missingFromTarball.length} built file(s) missing from the tarball (${d.missingFromTarball.slice(0, 3).join(', ')})`)
  }

  const unreferencedTotal = diffs.reduce((n, d) => n + d.unreferenced.length, 0)

  /*
   * Withheld packages are reported, never gated.
   *
   * `release-policy.json` withholds `compat` and `codemods`, so they are not in
   * the packed set above and a defect in them cannot fail a release. They are
   * still scanned, because "withheld today" is not "withheld forever" and the
   * cost of noticing is one directory walk. This is where the compiled specs in
   * `packages/codemods/dist/transforms/__tests__/` surface — TASK-S2-O1
   * deliberately did not hide them behind a tsconfig exclude so that this row
   * would have something real to find on its first run.
   */
  const withheld: Array<{ pkg: string, testLeakage: string[] }> = []
  for (const entry of withheldPackages()) {
    const dist = join(ROOT, 'packages', entry.dir, 'dist')
    if (!existsSync(dist))
      continue
    const leaked = walk(dist).map(f => `dist/${f}`).filter(f => LEAKAGE.some(re => re.test(f)))
    if (leaked.length > 0)
      withheld.push({ pkg: entry.name, testLeakage: leaked })
  }
  return {
    n: 11,
    title: 'Tarball file / export / API diff',
    verdict: problems.length === 0 ? 'green' : 'red',
    reason: problems.length === 0
      ? `${diffs.length} tarballs diffed against the reviewed build: no missing entry point, no test/fixture leakage, no divergence from the build. ${unreferencedTotal} shipped file(s) are not named by any exports condition — reported as inventory, see detail.diffs[].unreferenced`
      : problems.join(' · '),
    evidence,
    detail: {
      diffs,
      withheldPackagesReportedNotGated: withheld,
      apiHalf: 'cited: release:api-diff — DEGRADED, its recorded baseline is admissible:false so it runs manifest-only and signature changes are invisible (D156)',
    },
    cited: false,
    ...secondTier(),
  }
}

function relativePackageDir(pkg: PackedPackage): string {
  const dir = pkg.name.split('/')[1] ?? pkg.name
  return relative(ROOT, join(ROOT, 'packages', dir)).replaceAll('\\', '/')
}
