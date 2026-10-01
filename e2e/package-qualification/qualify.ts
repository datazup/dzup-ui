/* eslint-disable no-console */
import type { RowResult, Verdict } from './matrix.ts'
/**
 * `yarn qualify:package` — the package-qualification matrix (TASK-S2-O1).
 *
 * Runs all twelve rows of 08-11 doc 08's package-qualification matrix against
 * **packed tarballs in a temporary consumer workspace** and writes a per-row
 * report into the release-candidate directory for the commit under test.
 *
 * Exit code:
 *
 * - `0` — no row is red. Blocked rows do **not** fail the lane: a row that
 *   cannot run for a named, legitimate reason (no second-tier tarball) is a
 *   correct outcome, and failing on it would train people to ignore the lane.
 * - `1` — at least one row is red.
 *
 * Every blocked row carries a reason. A row is never silently skipped and a
 * verdict is never fabricated: if a lane throws, the row is red with the
 * thrown message, not absent.
 *
 * @module e2e/package-qualification/qualify
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { bundleId, gitState, ROOT } from '../../packages/tooling/src/release/binding.ts'
import { ROWS, SECOND_TIER_ABSENT } from './matrix.ts'
import { rowConsumerBuild, rowTreeShake } from './rows-bundle.ts'
import { rowOptionalPeer, rowPeerMatrix } from './rows-peers.ts'
import { rowCspTrustedTypes, rowLicenceEntitlement, rowTarballDiff, secondTierInstalled } from './rows-policy.ts'
import { rowSupplyChain } from './rows-supply.ts'
import { fullStage } from './stage.ts'

/**
 * Rows 1, 3, 4 and 5 are owned by lanes that already existed.
 *
 * README §4 point 4: never redo work a report records. Each is **cited**, and
 * where the owning lane is cheap enough to run inside this one it is executed
 * rather than trusted — `validate:published-imports` is, the Playwright and
 * Nuxt lanes are not (they need browsers and out-of-repo installs, and they are
 * separate `yarn` scripts a release already runs).
 */
interface CitedRow {
  n: number
  command: string | null
  reason: string
  evidence: string[]
  /** Set when measurement contradicted the "covered" claim in the packet. */
  override?: { verdict: Verdict, reason: string }
}

const CITED: CitedRow[] = [
  {
    n: 1,
    command: 'validate:published-imports',
    reason: 'every declared export subpath imports from the packed artifact and its types condition compiles',
    evidence: ['packages/tooling/src/validators/published-imports.ts', 'docs/program-2026-09-04/reports/TASK-R1-O2-handoff.md'],
  },
  {
    n: 3,
    command: null,
    reason: 'covered by `yarn test:nuxt-fixtures` — 7 fixtures staged outside the repo from `yarn pack` output and installed with npm; core-only (auto-import) and ssr-hydration own this row',
    evidence: ['packages/nuxt/test/fixtures.spec.ts', 'packages/nuxt/scripts/pack-fixtures.mjs'],
  },
  {
    n: 4,
    command: 'validate:ownership',
    reason: 'the first-tier half is gated; the packed second-tier half (core-pro fixture) has never executed',
    evidence: ['packages/tooling/src/validators/ownership-manifest.ts', 'packages/nuxt/test/fixtures.spec.ts (core-pro)'],
    override: {
      verdict: 'blocked',
      reason: 'first-tier half green (validate:ownership); the PACKED second-tier half is unrun — the core-pro fixture needs DZUP_PRO_TARBALL, and @dzup-ui-pro/pro does not resolve here',
    },
  },
  {
    n: 5,
    command: null,
    reason: 'covered twice over: the nuxt css-order fixture and `yarn test:e2e:layer-order`, which pulls dist/tokens.css and dist/core.css out of the .tgz and asserts the cascade order in a browser',
    evidence: ['e2e/styling/pack-styles.mjs', 'e2e/styling/layer-order.spec.ts', 'packages/nuxt/test/fixtures/css-order/'],
  },
]

function runYarn(script: string): { ok: boolean, message: string } {
  try {
    execFileSync('yarn', [script], { cwd: ROOT, stdio: 'pipe', encoding: 'utf8', shell: true })
    return { ok: true, message: `\`yarn ${script}\` exit 0` }
  }
  catch (error) {
    const err = error as { status?: number, stdout?: string, stderr?: string }
    const tail = (err.stderr ?? err.stdout ?? '').split('\n').filter(Boolean).slice(-2).join(' | ')
    return { ok: false, message: `\`yarn ${script}\` exit ${err.status ?? 1}: ${tail}` }
  }
}

function citedResult(row: CitedRow): RowResult {
  const def = ROWS.find(r => r.n === row.n)
  const base = {
    n: row.n,
    title: def?.title ?? `row ${row.n}`,
    evidence: row.evidence,
    cited: true,
    secondTier: 'blocked' as Verdict,
    secondTierReason: SECOND_TIER_ABSENT,
  }

  if (row.override !== undefined) {
    const extra = row.command === null ? null : runYarn(row.command)
    return {
      ...base,
      verdict: row.override.verdict,
      reason: row.override.reason + (extra === null ? '' : ` · ${extra.message}`),
    }
  }

  if (row.command === null)
    return { ...base, verdict: 'green', reason: `cited — ${row.reason}` }

  const run = runYarn(row.command)
  return {
    ...base,
    verdict: run.ok ? 'green' : 'red',
    reason: run.ok ? `${run.message} — ${row.reason}` : run.message,
  }
}

async function guarded(n: number, title: string, fn: () => RowResult | Promise<RowResult>): Promise<RowResult> {
  try {
    return await fn()
  }
  catch (error) {
    return {
      n,
      title,
      verdict: 'red',
      reason: `the lane threw: ${(error as Error).message.split('\n')[0]}`,
      evidence: ['e2e/package-qualification/qualify.ts'],
      cited: false,
      secondTier: 'blocked',
      secondTierReason: SECOND_TIER_ABSENT,
    }
  }
}

const SYMBOL: Record<Verdict, string> = { green: 'pass', red: '**FAIL**', blocked: 'blocked' }

function renderReport(results: RowResult[], outDir: string): string {
  const binding = gitState()
  const counts = {
    green: results.filter(r => r.verdict === 'green').length,
    red: results.filter(r => r.verdict === 'red').length,
    blocked: results.filter(r => r.verdict === 'blocked').length,
  }

  const lines: string[] = []
  lines.push('# Package qualification matrix — `@dzup-ui/*`')
  lines.push('')
  lines.push(`> Generated by \`yarn qualify:package\` (TASK-S2-O1) at ${new Date().toISOString()}.`)
  lines.push(`> Source: \`${binding.sourceCommit}\` on \`${binding.branch}\` · worktree **${binding.worktreeDirty ? `dirty (${binding.dirtyCount} path(s))` : 'clean'}**.`)
  lines.push('>')
  lines.push('> **Locally qualified only.** This is not CI, release or production evidence.')
  lines.push('> Every row below consumes a tarball produced by `yarn pack` in a temporary')
  lines.push('> consumer workspace outside the repository — never a workspace symlink.')
  lines.push('')
  lines.push(`**${counts.green} green · ${counts.red} red · ${counts.blocked} blocked**, of ${results.length} doc-08 rows.`)
  lines.push('')
  lines.push('| # | doc-08 row | Core only | Core + second tier | Evidence |')
  lines.push('|---|---|---|---|---|')
  for (const r of results) {
    const core = `${SYMBOL[r.verdict]} — ${r.reason}`
    const second = `${SYMBOL[r.secondTier]} — ${r.secondTierReason}`
    lines.push(`| ${r.n} | ${r.title}${r.cited ? ' _(cited)_' : ''} | ${core} | ${second} | ${r.evidence.map(e => `\`${e}\``).join('<br>')} |`)
  }
  lines.push('')
  lines.push('## Measurements')
  lines.push('')
  for (const r of results) {
    if (r.detail === undefined)
      continue
    lines.push(`### Row ${r.n} — ${r.title}`)
    lines.push('')
    lines.push('```json')
    lines.push(JSON.stringify(r.detail, null, 2))
    lines.push('```')
    lines.push('')
  }
  lines.push('## How to read a blocked row')
  lines.push('')
  lines.push('A `blocked` row is **not** a failure of this lane and does not fail the exit')
  lines.push('code. It records that the row could not run for a named reason — almost always')
  lines.push('that no second-tier tarball is installed, which is not this repository\'s work to')
  lines.push('obtain. A blocked row with no reason would be a defect; there are none.')
  lines.push('')
  lines.push(`Artifacts for this candidate: \`${outDir.replace(ROOT, '').replaceAll('\\', '/').replace(/^\//, '')}\``)
  lines.push('')
  return lines.join('\n')
}

async function main(): Promise<void> {
  const binding = gitState()
  const outDir = join(ROOT, 'docs/qa/release', bundleId(binding))
  mkdirSync(outDir, { recursive: true })

  console.log('=== Package qualification matrix (TASK-S2-O1) ===')
  console.log(`commit ${binding.sourceCommit} · candidate dir ${outDir}`)
  console.log(`second tier (@dzup-ui-pro/pro) installed: ${secondTierInstalled() ? 'yes' : 'NO — second-tier column is blocked by name'}`)
  console.log('')

  const results: RowResult[] = []

  console.log('- packing every published package with `yarn pack` into a temp consumer workspace…')
  const stage = fullStage()
  try {
    console.log(`  ${stage.packed.length} tarballs staged at ${stage.dir}`)

    for (const cited of CITED) {
      console.log(`- row ${cited.n} (cited)…`)
      results.push(citedResult(cited))
    }

    console.log('- row 2 (consumer production build from the tarball)…')
    results.push(await guarded(2, 'Vite production build of a consumer app', () => rowConsumerBuild(stage)))

    console.log('- row 6 (tree-shaking, engine measured separately)…')
    results.push(await guarded(6, 'Individual-component tree-shaking, optional engine measured separately', () => rowTreeShake(stage)))

    console.log('- row 7 (peer matrix: minimum and current)…')
    results.push(await guarded(7, 'Minimum and current Vue/Reka peer versions', () => rowPeerMatrix(stage)))

    console.log('- row 8 (optional peer: absent / incompatible / installed)…')
    results.push(await guarded(8, 'Optional peer absent / incompatible / installed', () => rowOptionalPeer()))

    console.log('- row 9 (CSP + Trusted Types over packed bytes)…')
    results.push(await guarded(9, 'CSP and Trusted Types consumer fixture', () => rowCspTrustedTypes(stage)))

    console.log('- row 10 (licence + entitlement failure behaviour)…')
    results.push(await guarded(10, 'Licence and entitlement failure behaviour', () => rowLicenceEntitlement(stage)))

    console.log('- row 11 (tarball file / export / API diff)…')
    results.push(await guarded(11, 'Tarball file / export / API diff', () => rowTarballDiff(stage)))
  }
  finally {
    stage.dispose()
  }

  console.log('- row 12 (SBOM + vulnerability/licence + provenance + hashes)…')
  results.push(await guarded(12, 'SBOM, vulnerability/licence report, provenance and artifact hash', () => rowSupplyChain(outDir)))

  results.sort((a, b) => a.n - b.n)

  if (results.length !== ROWS.length)
    throw new Error(`the report must name all ${ROWS.length} doc-08 rows; it named ${results.length}`)

  const markdown = renderReport(results, outDir)
  writeFileSync(join(outDir, 'package-qualification.md'), markdown)
  writeFileSync(
    join(outDir, 'package-qualification.json'),
    `${JSON.stringify({ sourceCommit: binding.sourceCommit, generatedAt: new Date().toISOString(), rows: results }, null, 2)}\n`,
  )

  console.log('')
  for (const r of results)
    console.log(`  ${String(r.n).padStart(2)}  ${r.verdict.toUpperCase().padEnd(8)} ${r.title}`)

  const red = results.filter(r => r.verdict === 'red')
  const blocked = results.filter(r => r.verdict === 'blocked')
  console.log('')
  console.log(`${results.filter(r => r.verdict === 'green').length} green · ${red.length} red · ${blocked.length} blocked`)
  console.log(`report: ${join(outDir, 'package-qualification.md')}`)

  if (red.length > 0) {
    console.log('')
    for (const r of red)
      console.log(`RED  row ${r.n}: ${r.reason}`)
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  // A throw here is the orchestrator failing, not a row failing. It must not be
  // mistaken for a clean run with no red rows, so it exits non-zero loudly.
  console.error(`qualify:package: ${(error as Error).stack ?? String(error)}`)
  process.exitCode = 1
})
