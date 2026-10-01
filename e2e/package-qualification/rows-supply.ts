import type { RowResult } from './matrix.ts'
/**
 * Row 12 — SBOM, vulnerability/licence report, provenance and artifact hash
 * (TASK-S2-O1).
 *
 * The generator already exists: `packages/tooling/src/release/evidence.ts`
 * (`yarn release:evidence`) packs every published package, walks each dependency
 * closure, emits CycloneDX 1.6 per tarball plus an aggregate, queries the npm
 * advisory endpoint, classifies licences against the single shared policy, and
 * writes sha256/sha512 per tarball and per file plus an in-toto/SLSA provenance
 * statement. Rebuilding that would be duplication and would create a second
 * licence policy, which the exceptions file explicitly forbids.
 *
 * What did **not** exist is a *gate*: the bundle was generated once, by hand,
 * outside `validate:all`, and nothing asserts it is present, current or clean.
 * This row is that assertion. It runs the generator into the release-candidate
 * directory for the commit under test and then judges the result:
 *
 * - an SBOM exists and is non-empty;
 * - no packed manifest still carries a local yarn protocol (an `EUNSUPPORTEDPROTOCOL`
 *   tarball is unusable, and only the packed manifest can say);
 * - no blocked licence;
 * - **every licence exception carries owner, expiry and reachability** — a bare
 *   allowlist entry is refused by `<requirements><exceptions>`;
 * - artifact hashes exist for every tarball;
 * - a provenance statement exists, with its *signing* half reported as
 *   `[!owner]` rather than faked: signing needs CI identity and registry
 *   authority, neither of which an agent has.
 *
 * An advisory query that could not run is reported as `not-run`, never as zero.
 *
 * @module e2e/package-qualification/rows-supply
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { ROOT } from '../../packages/tooling/src/release/binding.ts'
import { licenceExceptions } from '../../packages/tooling/src/release/evidence.ts'
import { SECOND_TIER_ABSENT } from './matrix.ts'

interface SupplyChainJson {
  totals?: {
    tarballs?: number
    distinctDependencies?: number
    blocked?: number
    unknown?: number
    excepted?: number
    advisoriesTotal?: number
    advisoryStatus?: string
    unresolvedProtocols?: number
  }
  packages?: Array<{ package: string, artifact?: { sha256?: string, sha512?: string } }>
}

export interface SupplyChainOutcome {
  outDir: string
  generated: boolean
  generatorExit: number
  generatorError?: string
}

/**
 * Run `release:evidence` into `outDir`.
 *
 * Network is attempted once; if the advisory endpoint is unreachable the
 * generator itself records `not-run` per package rather than claiming zero, so
 * there is nothing to retry and nothing to fake.
 */
export function generateEvidence(outDir: string): SupplyChainOutcome {
  try {
    execFileSync(
      process.execPath,
      [
        join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
        join(ROOT, 'packages', 'tooling', 'src', 'release', 'evidence.ts'),
        '--out',
        outDir,
      ],
      { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' },
    )
    return { outDir, generated: true, generatorExit: 0 }
  }
  catch (error) {
    const err = error as { status?: number, stdout?: string, stderr?: string, message?: string }
    return {
      outDir,
      generated: existsSync(join(outDir, 'supply-chain.json')),
      generatorExit: err.status ?? 1,
      generatorError: (err.stderr ?? err.stdout ?? err.message ?? '').split('\n').filter(Boolean).slice(-3).join(' | '),
    }
  }
}

export function rowSupplyChain(outDir: string): RowResult {
  const evidence = [
    'e2e/package-qualification/rows-supply.ts (rowSupplyChain)',
    'packages/tooling/src/release/evidence.ts (the generator, reused not rebuilt)',
  ]
  const secondTier = { secondTier: 'blocked' as const, secondTierReason: SECOND_TIER_ABSENT }

  const outcome = generateEvidence(outDir)
  const supplyPath = join(outDir, 'supply-chain.json')
  const sbomPath = join(outDir, 'sbom.cdx.json')
  const hashesPath = join(outDir, 'hashes.json')
  const provenancePath = join(outDir, 'provenance.json')

  if (!existsSync(supplyPath)) {
    return {
      n: 12,
      title: 'SBOM, vulnerability/licence report, provenance and artifact hash',
      verdict: 'red',
      reason: `the evidence generator did not produce supply-chain.json (exit ${outcome.generatorExit})${outcome.generatorError ? `: ${outcome.generatorError}` : ''}`,
      evidence: [...evidence, outDir],
      detail: outcome as unknown as Record<string, unknown>,
      cited: false,
      ...secondTier,
    }
  }

  const supply = JSON.parse(readFileSync(supplyPath, 'utf8')) as SupplyChainJson
  const totals = supply.totals ?? {}
  const problems: string[] = []

  if (!existsSync(sbomPath)) {
    problems.push('no aggregate SBOM (sbom.cdx.json) was written')
  }
  else {
    const sbom = JSON.parse(readFileSync(sbomPath, 'utf8')) as { components?: unknown[] }
    if ((sbom.components?.length ?? 0) === 0)
      problems.push('the aggregate SBOM declares zero components')
  }

  if ((totals.unresolvedProtocols ?? 0) > 0)
    problems.push(`${totals.unresolvedProtocols} packed manifest(s) still carry a local yarn protocol — those tarballs cannot be installed from a registry`)
  if ((totals.blocked ?? 0) > 0)
    problems.push(`${totals.blocked} blocked licence(s) in the dependency closure`)
  if (!existsSync(hashesPath))
    problems.push('no artifact hashes (hashes.json) were written')
  if (!existsSync(provenancePath))
    problems.push('no provenance statement (provenance.json) was written')

  // <requirements><exceptions>: owner + expiry + reachability, or refused.
  const malformed = licenceExceptions().filter(
    e => !e.owner || !e.reason || e.expires === undefined
      || (e as unknown as { reachability?: string }).reachability === undefined,
  )
  if (malformed.length > 0)
    problems.push(`${malformed.length} licence exception(s) lack owner, expiry or reachability analysis: ${malformed.map(e => e.package).join(', ')}`)

  const advisoryStatus = totals.advisoryStatus ?? 'unknown'
  const notes: string[] = []
  if (advisoryStatus !== 'ok')
    notes.push(`advisory query status "${advisoryStatus}" — a count of zero is NOT claimed for packages that were not queried`)
  if ((totals.advisoriesTotal ?? 0) > 0)
    notes.push(`${totals.advisoriesTotal} advisory row(s) present and untriaged — no severity threshold is configured (D154)`)
  notes.push('provenance is UNSIGNED — signing needs CI identity and registry authority: [!owner]')

  return {
    n: 12,
    title: 'SBOM, vulnerability/licence report, provenance and artifact hash',
    verdict: problems.length === 0 ? 'green' : 'red',
    reason: problems.length === 0
      ? `SBOM + licence + hash + provenance artifacts generated for this candidate (${totals.tarballs ?? 0} tarballs, ${totals.distinctDependencies ?? 0} distinct deps, ${totals.blocked ?? 0} blocked). ${notes.join('; ')}`
      : problems.join(' · '),
    evidence: [...evidence, outDir],
    detail: { totals, notes, generator: outcome, exceptions: licenceExceptions().length },
    cited: false,
    ...secondTier,
  }
}
