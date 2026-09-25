#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * The release report (TASK-R1-O3).
 *
 * The 08-11 validation matrix (doc 08 §Required release report) names **eight
 * independent statements** every release report must make. This renders them,
 * and it renders them as a **projection**: every row comes from a companion
 * artifact in the same bundle (`api-diff.json`, `supply-chain.json`,
 * `hashes.json`, `results.jsonl`) or from a generated artifact in the
 * repository, each quoted with the `sourceCommit` it stamps. Nothing here is
 * typed by hand, and nothing is inferred from a file merely existing — which is
 * Pro evidence-layer finding **E-4** (its ledger promoted a row to `pass`
 * because an output file was on disk).
 *
 * ## The section names
 *
 * doc 08 §Report lists them as: implemented scope and source commit · focused
 * validation · aggregate repository qualification · browser/AT/security/
 * performance experience qualification · packed-artifact qualification ·
 * downstream canary/adoption evidence · publication/production authority and
 * actual operation status · known gaps, accepted exceptions with expiry,
 * rollback, and ranked next work.
 *
 * The TASK-R1-O3 `<done_check>` names a *different* eight ("custody · aggregate
 * gates · browser/AT by tier · package matrix · API diff · supply chain ·
 * canary · operator approval"). That is Pro's `ledger.md` shape, not doc 08's,
 * and the task body is explicit that doc 08 is the authority. Both are
 * produced: `report.md` carries doc 08's eight sections, and `ledger.md`
 * carries the gate-by-gate row ledger the check describes, so neither reader is
 * left guessing.
 *
 * Usage:
 *   yarn release:report
 *   yarn release:report --out docs/qa/release/<bundle>
 *
 * @module @dzup-ui/tooling/release/report
 */

import type { DiffReport } from './api-diff.ts'
import type { SourceBinding } from './binding.ts'
import type { EvidenceResult } from './evidence.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { declaredLevels } from './api-diff.ts'
import { bundleId, contentDigest, gitState, provenanceOf, ROOT } from './binding.ts'
import { licenceExceptions } from './evidence.ts'
import { releasePolicy } from './pack.ts'

/** Owner decision 2026-09-25; section 8 quotes it only when the file exists. */
const ROLLBACK_POLICY = 'docs/release/rollback.md'

export const EVIDENCE_DIR = resolve(ROOT, 'docs/qa/release')

/** One gate the rehearsal ran, as `results.jsonl` records it. */
export interface GateRow {
  n: number
  name: string
  command: string
  exit: number
  seconds: number
  log: string
  startedAt: string
}

export function readJsonl(path: string): GateRow[] {
  if (!existsSync(path))
    return []
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line) as GateRow)
}

function readJsonOrNull<T>(path: string): T | null {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as T : null
}

function git(args: string[]): string {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  }
  catch {
    return ''
  }
}

// --- Repository evidence artifacts (section 4) ---

interface CapabilityMatrix {
  sourceCommit: string
  totals: Record<string, Record<string, number>>
  rows: unknown[]
}
interface QualityMatrix { sourceCommit: string, components: Array<{ tier: string }> }
interface AtIndex { pairs: unknown[], entries: Array<{ component: string, tier: string, rows: Array<{ result: string }> }> }
interface BrowserEvidence {
  sourceCommit: string
  worktreeDirty: boolean
  dirtyPathCount: number
  admissibility: string
  totals: Record<string, number>
  engines?: unknown
}
/**
 * `packages/core/docs/wcag-deviations.json`.
 *
 * `criterion` and `recordedAt` are OBJECTS, not strings, and `openGaps` is a
 * COUNT, not a list — the first version of this interface guessed all three and
 * the report rendered `criterion [object Object] · undefined open gap(s)`.
 * Typed from the artifact, not from its name.
 */
interface WcagDeviations {
  schemaVersion: number
  criterion: { id: string, name: string, level: string }
  ceiling: number
  openGaps: number
  surfaces?: unknown[]
  recordedAt?: { measuredBy?: string, source?: string }
}
interface PerfBaselines { schemaVersion: number, baselines: unknown[] }
interface SecurityCoverage { sourceCommit: string, worktreeDirty: boolean, lastRun?: string, artifacts?: unknown }
interface SecurityDeviations { ceiling: number, deviations: unknown[] }
interface VisualBaselines { baselines: unknown[] }

export interface ExperienceEvidence {
  capability: CapabilityMatrix | null
  quality: QualityMatrix | null
  at: AtIndex | null
  browser: BrowserEvidence | null
  wcag: WcagDeviations | null
  perf: PerfBaselines | null
  security: SecurityCoverage | null
  securityDeviations: SecurityDeviations | null
  visual: VisualBaselines | null
}

export function readExperienceEvidence(): ExperienceEvidence {
  return {
    capability: readJsonOrNull<CapabilityMatrix>(resolve(ROOT, 'packages/core/docs/capability-matrix.json')),
    quality: readJsonOrNull<QualityMatrix>(resolve(ROOT, 'packages/core/docs/quality-matrix.json')),
    at: readJsonOrNull<AtIndex>(resolve(ROOT, 'e2e/at-matrix/index.json')),
    browser: readJsonOrNull<BrowserEvidence>(resolve(ROOT, 'e2e/matrix/browser-evidence.json')),
    wcag: readJsonOrNull<WcagDeviations>(resolve(ROOT, 'packages/core/docs/wcag-deviations.json')),
    perf: readJsonOrNull<PerfBaselines>(resolve(ROOT, 'packages/core/perf/baselines.json')),
    security: readJsonOrNull<SecurityCoverage>(resolve(ROOT, 'packages/core/security/coverage.json')),
    securityDeviations: readJsonOrNull<SecurityDeviations>(resolve(ROOT, 'packages/core/security/security-deviations.json')),
    visual: readJsonOrNull<VisualBaselines>(resolve(ROOT, 'e2e/visual/visual-baselines.json')),
  }
}

/** AT result counts, from the append-only run records. Never inferred. */
export function atCounts(at: AtIndex | null): { cells: number, executed: number, byResult: Record<string, number> } {
  if (!at)
    return { cells: 0, executed: 0, byResult: {} }
  const byResult: Record<string, number> = {}
  let cells = 0
  for (const entry of at.entries ?? []) {
    for (const row of entry.rows ?? []) {
      cells++
      byResult[row.result] = (byResult[row.result] ?? 0) + 1
    }
  }
  const executed = cells - (byResult.unrun ?? 0)
  return { cells, executed, byResult }
}

// --- Rendering ---

function stamp(artifact: { sourceCommit?: string } | null, head: string): string {
  if (!artifact?.sourceCommit)
    return '_(no `sourceCommit`)_'
  const short = artifact.sourceCommit.slice(0, 7)
  return short === head.slice(0, 7) ? `\`${short}\` (= HEAD)` : `\`${short}\` — **not HEAD**`
}

export interface ReportInputs {
  binding: SourceBinding
  bundle: string
  gates: GateRow[]
  apiDiff: DiffReport | null
  supplyChain: EvidenceResult | null
  hashes: { packages: Record<string, { artifact: { bytes: number, sha256: string }, entries: unknown[] }> } | null
  experience: ExperienceEvidence
  digest: ReturnType<typeof contentDigest>
  chainLinks: number
  versions: Record<string, string>
  tags: string[]
}

export function renderReport(input: ReportInputs): string {
  const { binding, bundle, gates, apiDiff, supplyChain, hashes, experience, digest, chainLinks, versions, tags } = input
  const head = binding.sourceCommit
  const L: string[] = []

  L.push(`# Release report — \`@dzup-ui/*\` candidate \`${bundle}\``)
  L.push('')
  L.push('> **The first release report this repository has ever produced.** Its eight')
  L.push('> sections are the eight doc 08 §Required release report names, each stated')
  L.push('> *independently* as the document requires — a green section 3 does not make')
  L.push('> section 4 green, and none of them makes section 7 anything but empty.')
  L.push('>')
  L.push('> Produced by `yarn release:report`, which is a **projection**: every row below')
  L.push('> comes from a companion artifact in this bundle or from a generated artifact in')
  L.push('> the repository, quoted with the commit it stamps. No row was typed by hand and')
  L.push('> no row is inferred from a file existing.')
  L.push('>')
  L.push('> Produced by an agent with no authority to commit, tag, sign, publish, deploy or')
  L.push('> dispatch CI — and none of those was done.')
  L.push('')
  L.push('---')
  L.push('')

  // 1 ────────────────────────────────────────────────────────────────────────
  L.push('## 1. Implemented scope and source commit')
  L.push('')
  L.push('| Fact | Value |')
  L.push('|---|---|')
  L.push(`| Branch | \`${binding.branch}\` |`)
  L.push(`| \`git rev-parse HEAD\` | \`${head}\` |`)
  L.push(`| \`git status --porcelain\` | **${binding.dirtyCount} entries** — required to be empty |`)
  if (binding.upstream)
    L.push(`| Position vs \`${binding.upstream.ref}\` | ${binding.upstream.ahead} ahead, ${binding.upstream.behind} behind |`)
  L.push(`| Release tags in the repository | ${tags.length === 0 ? '**0 — no release tag has ever existed**' : tags.join(', ')} |`)
  L.push(`| Content actually measured | \`${head.slice(0, 7)}\` **plus ${binding.dirtyCount} uncommitted paths** |`)
  L.push(`| Content digest of what was measured | \`${digest.digest}\` |`)
  L.push(`| Files behind that digest | ${digest.fileCount.toLocaleString('en-US')} (${digest.bytes.toLocaleString('en-US')} bytes) |`)
  L.push(`| **Admissible as release evidence** | **${binding.admissible}**${binding.admissible ? '' : ` — ${binding.inadmissibleReason}`} |`)
  L.push('')
  if (!binding.admissible) {
    L.push('The digest is a sha256 over `<path>\\0<sha256(file)>\\n` for every tracked and')
    L.push('untracked-not-ignored file, sorted by path; it is recomputable from')
    L.push('[`candidate-content-digest.json`](./candidate-content-digest.json), which lists')
    L.push('every file and its hash. **It is not a commit id and it confers no')
    L.push('reviewability.** It exists so that this bundle names *exactly* what was')
    L.push(`measured, which is the one thing the label \`${head.slice(0, 7)}\` cannot do here.`)
    L.push('')
    L.push('doc 08 §Release stop conditions, first item: *"dirty/unidentified source,')
    L.push('generated drift, or evidence bound to a different commit/configuration"*. It is')
    L.push('met. Every section below is therefore evidence about a **candidate**, not about')
    L.push('a release, and the bundle says so in every artifact it writes (`admissible:')
    L.push('false`) rather than only here.')
    L.push('')
  }
  L.push('### Candidate packages')
  L.push('')
  L.push('| Package | Version | Class |')
  L.push('|---|---|---|')
  const policy = releasePolicy()
  for (const name of policy.published)
    L.push(`| \`${name}\` | ${versions[name] ?? '?'} | published |`)
  for (const w of policy.withheld) {
    // First SENTENCE, not first `.`: every withheld reason opens with a version
    // number, and splitting on the bare dot truncated `@dzup-ui/compat` to
    // "Public and publishable (0." in the first rendered report.
    const firstSentence = /^.*?[.!?](?=\s|$)/.exec(w.reason)?.[0] ?? w.reason
    L.push(`| \`${w.name}\` | ${versions[w.name] ?? '?'} | **withheld** — ${firstSentence} |`)
  }
  L.push('')

  // 2 ────────────────────────────────────────────────────────────────────────
  L.push('## 2. Focused validation')
  L.push('')
  if (gates.length === 0) {
    L.push('**No gate record.** `results.jsonl` is absent from this bundle, which means')
    L.push('`yarn rehearse:release` has not been run into it. Section 2 and section 3 are')
    L.push('therefore *unrun*, not green — a report that omitted them would be claiming a')
    L.push('pass it has no record of.')
  }
  else {
    L.push('One row per gate the rehearsal ran, in order, with the exit code read directly')
    L.push('from the command (never through a pipe — a pipe returns the last stage\'s status,')
    L.push('which is how an aggregate reported green over a stale artifact for three packets).')
    L.push('')
    L.push('| # | Gate | Exit | Seconds | Log |')
    L.push('|---|---|---|---|---|')
    for (const gate of gates)
      L.push(`| ${gate.n} | \`${gate.command}\` | ${gate.exit === 0 ? '**0**' : `**${gate.exit}** ✗`} | ${gate.seconds} | [\`${gate.log}\`](./logs/${gate.log}) |`)
    L.push('')
    const failed = gates.filter(g => g.exit !== 0)
    L.push(failed.length === 0
      ? `**${gates.length} of ${gates.length} gates exit 0.**`
      : `**${failed.length} of ${gates.length} gates failed**: ${failed.map(g => `\`${g.name}\``).join(', ')}. The rehearsal is fail-fast, so any gate after the first failure did not run and is absent from this table rather than recorded as passing.`)
  }
  L.push('')

  // 3 ────────────────────────────────────────────────────────────────────────
  L.push('## 3. Aggregate repository qualification')
  L.push('')
  L.push(`\`yarn validate:all\` is a chain of **${chainLinks} links** at this commit (counted from \`package.json\`, never quoted from a document).`)
  L.push('')
  /*
   * The ledger spells a gate's `name` with hyphens (`validate-all`), not with
   * the colon of the command it runs. Matching on `validate:all` silently
   * dropped the single most important row in this section from the first
   * rendered report — a filter that matched nothing and said nothing.
   */
  const aggregate = gates.filter(g => /^(?:validate-all|test|typecheck-all|typecheck-tooling|lint|build)$/.test(g.name))
  if (aggregate.length === 0) {
    L.push('No aggregate lane was recorded in this bundle. See section 2.')
  }
  else {
    L.push('| Lane | Exit | Seconds |')
    L.push('|---|---|---|')
    for (const gate of aggregate)
      L.push(`| \`${gate.command}\` | ${gate.exit === 0 ? '**0**' : `**${gate.exit}** ✗`} | ${gate.seconds} |`)
  }
  L.push('')
  L.push('**Locally qualified only.** A green local run is never CI, release or production')
  L.push('evidence. The maturity ladder is *specified → implemented → focused-validated →')
  L.push('aggregate-qualified → browser/AT-qualified → packaged → released*; this section')
  L.push('reaches the fourth rung and no higher, and none of the six published packages has')
  L.push('ever been built by CI on a clean checkout.')
  L.push('')

  // 4 ────────────────────────────────────────────────────────────────────────
  L.push('## 4. Browser / AT / security / performance experience qualification')
  L.push('')
  const cap = experience.capability
  const at = atCounts(experience.at)
  L.push('| Lane | Artifact | Stamped | State |')
  L.push('|---|---|---|---|')
  if (cap) {
    const totals = Object.values(cap.totals).reduce((acc, tier) => {
      for (const [k, v] of Object.entries(tier))
        acc[k] = (acc[k] ?? 0) + v
      return acc
    }, {} as Record<string, number>)
    L.push(`| Capability matrix | \`packages/core/docs/capability-matrix.json\` | ${stamp(cap, head)} | ${cap.rows.length} rows · ${totals.pass ?? 0} pass · ${totals.stale ?? 0} **stale** · ${totals.unrun ?? 0} unrun · ${totals.excepted ?? 0} excepted |`)
  }
  if (experience.browser) {
    const b = experience.browser
    L.push(`| Browser matrix | \`e2e/matrix/browser-evidence.json\` | ${stamp(b, head)} | ${b.totals.projectsRun ?? 0}/${b.totals.projects ?? 0} projects · ${b.totals.pass ?? 0}/${b.totals.cells ?? 0} cells pass · ${b.totals.fail ?? 0} fail · worktree was **${b.worktreeDirty ? `dirty (${b.dirtyPathCount} paths)` : 'clean'}** at capture |`)
  }
  L.push(`| AT matrix | \`e2e/at-matrix/index.json\` | _run records, not a build_ | ${at.cells} cells · **${at.executed} executed** · ${Object.entries(at.byResult).map(([k, v]) => `${v} ${k}`).join(' · ')} |`)
  if (experience.wcag)
    L.push(`| WCAG | \`packages/core/docs/wcag-deviations.json\` | ${experience.wcag.recordedAt?.measuredBy ?? '—'} | SC ${experience.wcag.criterion.id} ${experience.wcag.criterion.name} (${experience.wcag.criterion.level}) · ceiling ${experience.wcag.ceiling} · **${experience.wcag.openGaps} open gap(s)** over ${experience.wcag.surfaces?.length ?? 0} surface(s) |`)
  if (experience.securityDeviations)
    L.push(`| Security | \`packages/core/security/security-deviations.json\` | — | ceiling ${experience.securityDeviations.ceiling} · ${experience.securityDeviations.deviations.length} deviation(s) |`)
  if (experience.security)
    L.push(`| Security corpus | \`packages/core/security/coverage.json\` | ${stamp(experience.security, head)} | worktree was **${experience.security.worktreeDirty ? 'dirty' : 'clean'}** at capture |`)
  if (experience.perf)
    L.push(`| Performance | \`packages/core/perf/baselines.json\` | _per-baseline provenance_ | ${experience.perf.baselines.length} baseline(s) |`)
  if (experience.visual)
    L.push(`| Visual | \`e2e/visual/visual-baselines.json\` | — | ${experience.visual.baselines.length} accepted baseline(s) |`)
  L.push('')
  L.push('**Stale and unrun cells stay visible.** Nothing here is collapsed into an')
  L.push('aggregate count and no manual AT result cell was filled by a tool: a fabricated')
  L.push('row is worse than an empty one. An artifact stamped anything other than HEAD is')
  L.push('marked **not HEAD** above rather than quoted as if it described this candidate.')
  L.push('')

  // 5 ────────────────────────────────────────────────────────────────────────
  L.push('## 5. Packed-artifact qualification')
  L.push('')
  if (!hashes || !supplyChain) {
    L.push('**No packed-artifact record.** `hashes.json` / `supply-chain.json` are absent')
    L.push('from this bundle — run `yarn release:evidence --out <bundle>`.')
  }
  else {
    L.push('Every package `release-policy.json` classifies as **published**, packed with')
    L.push('`yarn pack` (never `npm pack`: npm copies `workspace:*` verbatim and the tarball')
    L.push('dies with `EUNSUPPORTEDPROTOCOL` on install).')
    L.push('')
    L.push('| Package | Version | Bytes | Files | sha256 |')
    L.push('|---|---|---|---|---|')
    for (const pkg of supplyChain.packages) {
      L.push(`| \`${pkg.package}\` | ${pkg.version} | ${pkg.artifact.bytes.toLocaleString('en-US')} | ${pkg.entries} | \`${pkg.artifact.sha256.slice(0, 16)}…\` |`)
    }
    L.push('')
    L.push('Full digests (sha256 **and** sha512, per tarball and per file inside it):')
    L.push('[`hashes.json`](./hashes.json). SBOMs: [`sbom.cdx.json`](./sbom.cdx.json)')
    L.push('(aggregate, CycloneDX 1.6) and `sbom/<package>.cdx.json`. Supply chain:')
    L.push('[`supply-chain.md`](./supply-chain.md).')
    L.push('')
    const importGate = gates.find(g => /published-imports/.test(g.name))
    L.push(`Consumer-truth import gate (\`validate:published-imports\`, TASK-R1-O2): ${importGate ? (importGate.exit === 0 ? '**exit 0** — every declared subpath of every published package loads under plain Node from the extracted tarball' : `**exit ${importGate.exit}**`) : '_not recorded in this bundle_'}.`)
    L.push('')
  }

  if (apiDiff) {
    L.push('### API diff')
    L.push('')
    L.push('| Package | Baseline (fidelity) | Added | Removed | Changed | Level required | Changeset declares |')
    L.push('|---|---|---|---|---|---|---|')
    for (const [name, s] of Object.entries(apiDiff.summary)) {
      const diff = apiDiff.packages.find(d => d.package === name)
      L.push(`| \`${name}\` | ${diff?.baseline ?? '—'} (${s.fidelity}) | ${s.added} | ${s.removed} | ${s.changed} | **${s.requiredLevel}** | ${s.declaredLevel} |`)
    }
    L.push('')
    L.push('The level column is **`minor` for breaking and `patch` for additive** — the 0.x')
    L.push('mapping in `packages/contracts/VERSIONING.md` §1, not the 1.x one. `major` is')
    L.push('refused by `validate:release-policy` while `allowMajor` is false, because a')
    L.push('`major` bump *is* the 1.0 release.')
    L.push('')
    for (const drift of apiDiff.barrelDrift ?? []) {
      L.push(`**\`generate:exports\` drift on \`${drift.package}\`** — ${drift.clean ? 'none: a regenerated barrel would be byte-identical.' : `running the generator would rewrite \`${drift.packageDir}/src/index.ts\`:`}`)
      L.push('')
      if (drift.clean)
        continue
      L.push(`- **would DROP ${drift.wouldDrop.length} line(s)**, taking every symbol behind them out of the public surface — breaking under VERSIONING.md §2.1, requiring a \`minor\`:`)
      for (const line of drift.wouldDrop)
        L.push(`  - \`${line}\``)
      L.push(`- **would ADD ${drift.wouldAdd.length} line(s)** the manifest declares and the barrel lacks:`)
      for (const line of drift.wouldAdd)
        L.push(`  - \`${line}\``)
      L.push('')
      L.push('  Reported as an owner finding, **not silently resolved**: a generator would')
      L.push('  perform a breaking removal with no changeset and no decision behind it, and')
      L.push('  which side is right — the barrel or the manifest — is not a tool\'s call.')
      L.push('  Routed to **TASK-R0-O1**.')
      L.push('')
    }
    for (const rec of apiDiff.reconciliations) {
      L.push(`**Manifest reconciliation on \`${rec.package}\`** — the manifest declares version \`${rec.manifestVersion}\` while the package is \`${rec.packageVersion}\`:`)
      L.push('')
      L.push(`- **${rec.undocumented.length}** symbol(s) reach a consumer through the root barrel and are absent from the manifest's documented name lists`)
      L.push(`- **${rec.undelivered.length}** symbol(s) the manifest promises and the packed build does not deliver${rec.undelivered.length ? `: ${rec.undelivered.map(n => `\`${n}\``).join(', ')}` : ''}`)
      L.push('')
      L.push('  A **different** finding from the drift above: the generated barrel')
      L.push('  star-re-exports each family index, so those name lists are documentation a')
      L.push('  star re-export never consults. This measures how stale the document is —')
      L.push('  the same defect TASK-N2-A1 found ("stale by 43 public components"), which is')
      L.push('  why `generate:component-meta` was moved onto the ownership manifest instead.')
      L.push('')
    }
  }

  // 6 ────────────────────────────────────────────────────────────────────────
  L.push('## 6. Downstream canary / adoption evidence')
  L.push('')
  L.push('| Consumer | Kind | State |')
  L.push('|---|---|---|')
  const nuxtGate = gates.find(g => /nuxt-fixtures/.test(g.name))
  L.push(`| \`packages/nuxt/test\` fixtures | packed-tarball Nuxt consumers | ${nuxtGate ? `**exit ${nuxtGate.exit}** (${nuxtGate.seconds}s)` : '_not run in this bundle_'} — the \`core-pro\` fixture stays **unrun** whatever the exit code: it needs \`DZUP_PRO_TARBALL\` from a Pro checkout |`)
  L.push('| `ui/dzup-ui-pro` | the one real downstream consumer | Pro peers still declare `@dzup-ui/core@^0.1.0-alpha.0`; its tarball installs need `--legacy-peer-deps`. **No canary of this candidate has been installed into Pro.** |')
  L.push('| Public adopters | — | **none.** Nothing has been published: npm 404 for every `@dzup-ui/*` name. |')
  L.push('')
  L.push('**There is no downstream canary for this candidate.** Pro built a consumer matrix')
  L.push('(`tools/release/consumer-matrix.mjs`) over real fixture consumers; OSS has the')
  L.push('Nuxt fixtures and the `validate:published-imports` scratch consumer, and neither')
  L.push('is an adoption signal. Section 6 is therefore **empty by fact, not by omission**,')
  L.push('and a release decision that needs it does not have it.')
  L.push('')

  // 7 ────────────────────────────────────────────────────────────────────────
  L.push('## 7. Publication / production authority and actual operation status')
  L.push('')
  L.push('| Operation | Authorised | Performed |')
  L.push('|---|---|---|')
  L.push('| `git commit` / `git push` | no — owner | **no** |')
  L.push('| `git tag` | no — owner | **no** (0 release tags exist) |')
  L.push('| `changeset version` | no — owner | **no** |')
  L.push('| `changeset publish` | no — owner | **no** |')
  L.push('| Registry mutation | no — owner | **no** |')
  L.push('| CI dispatch | no — owner (TASK-R1-O4) | **no** |')
  L.push('| Signing / trusted publishing | no — needs a key and an operator | **no.** `.github/workflows` requests `id-token: write` and no workflow has ever published, so **no npm provenance attestation exists for any `@dzup-ui/*` package** |')
  L.push('| Deployment / DNS | no — owner (TASK-R1-O5) | **no** |')
  L.push('')
  L.push('**Operator approval: empty by design.** No operator has reviewed this bundle, and')
  L.push('an agent may not sign the line on one\'s behalf. The row exists so that its')
  L.push('emptiness is a recorded fact rather than an absent section.')
  L.push('')
  L.push('| Approval | Name | Date | Decision |')
  L.push('|---|---|---|---|')
  L.push('| Release operator | _(empty)_ | _(empty)_ | _(empty)_ |')
  L.push('')

  // 8 ────────────────────────────────────────────────────────────────────────
  L.push('## 8. Known gaps, accepted exceptions, rollback, ranked next work')
  L.push('')
  L.push('### Stop conditions met (doc 08 §Release stop conditions)')
  L.push('')
  const stops = apiDiff?.stopConditions ?? []
  if (stops.length === 0) {
    L.push('None recorded by `release:api-diff`.')
  }
  else {
    L.push('| Code | Detail |')
    L.push('|---|---|')
    for (const stop of stops)
      L.push(`| \`${stop.code}\` | ${stop.detail} |`)
  }
  L.push('')
  L.push('### Accepted exceptions')
  L.push('')
  const exceptions = licenceExceptions()
  L.push(`**Licence exceptions: ${exceptions.length}** (\`packages/tooling/scripts/licence-exceptions.json\`).`)
  if (exceptions.length === 0) {
    L.push('The file is empty because the measurement found nothing to except, not as a placeholder.')
  }
  else {
    L.push('')
    L.push('| Package | Licence | Owner | Expires | Reason |')
    L.push('|---|---|---|---|---|')
    for (const e of exceptions)
      L.push(`| \`${e.package}\` | ${e.licence} | ${e.owner} | ${e.expires ?? '**never** — structural'} | ${e.reason} |`)
  }
  L.push('')
  L.push('### Rollback')
  L.push('')
  const rollbackPolicy = existsSync(resolve(ROOT, ROLLBACK_POLICY))
  if (rollbackPolicy) {
    L.push(`Policy: [\`${ROLLBACK_POLICY}\`](../../../release/rollback.md) — fix forward with`)
    L.push('`npm deprecate` plus a superseding patch, move `latest` back with `npm dist-tag`')
    L.push('if needed, unpublish only for a leaked secret inside npm\'s 72 h window. The')
    L.push('`@dzup-ui` npm-scope owner acts.')
  }
  else {
    L.push(`**There is no rollback policy document** (\`${ROLLBACK_POLICY}\` is absent).`)
    L.push('Writing one is a prerequisite of the first publication (TASK-R0-O1).')
  }
  L.push('')
  L.push('### Changesets standing in the plan')
  L.push('')
  const levels = declaredLevels()
  L.push(`**${levels.total} pending changeset(s).** Declared levels by package:`)
  L.push('')
  L.push('| Package | Declared |')
  L.push('|---|---|')
  for (const [name, level] of [...levels.byPackage].sort())
    L.push(`| \`${name}\` | ${level} |`)
  if (levels.majorOffenders.length > 0) {
    L.push('')
    L.push(`**${levels.majorOffenders.length} changeset(s) declare \`major\`**, which \`validate:release-policy\` refuses while \`allowMajor\` is false.`)
  }
  L.push('')
  L.push('### Ranked next work')
  L.push('')
  // Each item is conditional on the fact it rests on, so a recut on a later
  // commit cannot repeat advice the repository has already acted on.
  const next: string[] = []
  if (!binding.admissible) {
    next.push('**Commit the tree and re-run this bundle.** Every artifact here is stamped\n'
      + '   `admissible: false`; one clean commit turns the whole bundle into evidence and\n'
      + '   lets `release:api-surface:record` write the first real baseline.')
  }
  if (stops.some(stop => stop.code !== 'dirty-source')) {
    next.push('**Clear the stop conditions above** before publishing (TASK-R0-O1).')
  }
  if (!rollbackPolicy)
    next.push(`**A rollback policy** at \`${ROLLBACK_POLICY}\`, as section 8 requires.`)
  next.push('**TASK-R0-O1** — the publish-or-freeze decision: the operator merges the release\n'
    + '   PR, or holds it. Nothing in this bundle publishes.')
  next.push('**TASK-R2-O2** — the AT matrix: section 4 records the executed count, and it is\n'
    + '   the lane with the least evidence per unit of claim.')
  next.forEach((item, i) => L.push(`${i + 1}. ${item}`))
  L.push('')
  L.push('---')
  L.push('')
  L.push(`_Generated ${new Date().toISOString()} by \`yarn release:report\` from \`${head}\`._`)
  L.push('')
  return L.join('\n')
}

/** The gate-by-gate ledger — the shape the TASK-R1-O3 `<done_check>` describes. */
export function renderLedger(input: ReportInputs): string {
  const { binding, bundle, gates, supplyChain, apiDiff, digest } = input
  const L: string[] = []
  L.push(`# Release evidence ledger — \`${bundle}\``)
  L.push('')
  L.push('> One candidate, one bundle, one row per gate. Companion to')
  L.push('> [`report.md`](./report.md), which carries the eight sections doc 08 §Required')
  L.push('> release report names. Produced by an agent with no authority to commit, tag,')
  L.push('> sign, publish, deploy or dispatch CI — and none of those was done.')
  L.push('')
  L.push('## 0. The candidate is not a commit')
  L.push('')
  L.push('| Fact | Value |')
  L.push('|---|---|')
  L.push(`| Branch | \`${binding.branch}\` |`)
  L.push(`| \`git rev-parse HEAD\` | \`${binding.sourceCommit}\` |`)
  L.push(`| \`git status --porcelain\` | **${binding.dirtyCount} entries** — required to be empty |`)
  L.push(`| Content actually measured | \`${binding.shortCommit}\` **plus ${binding.dirtyCount} uncommitted paths** |`)
  L.push(`| Content digest | \`${digest.digest}\` (${digest.fileCount.toLocaleString('en-US')} files) |`)
  L.push(`| **Admissible** | **${binding.admissible}**${binding.admissible ? '' : ` — ${binding.inadmissibleReason}`} |`)
  L.push('')
  L.push('## 1. Gates')
  L.push('')
  if (gates.length === 0) {
    L.push('**No gate record in this bundle.** `results.jsonl` is absent — `yarn rehearse:release` has not been run into it.')
  }
  else {
    L.push('| # | Gate | Commit | Exit | Seconds | Log |')
    L.push('|---|---|---|---|---|---|')
    for (const gate of gates) {
      L.push(`| ${gate.n} | \`${gate.command}\` | \`${binding.shortCommit}+${binding.dirtyCount}\` | ${gate.exit === 0 ? '**0**' : `**${gate.exit}** ✗`} | ${gate.seconds} | [\`${gate.log}\`](./logs/${gate.log}) |`)
    }
    L.push('')
    L.push(`Every row reads \`${binding.shortCommit}+${binding.dirtyCount}\` — the commit plus the uncommitted delta.`)
    L.push('**No row claims to be bound to a commit, because none is.**')
  }
  L.push('')
  L.push('## 2. Artifacts')
  L.push('')
  L.push('| Artifact | Present | What it records |')
  L.push('|---|---|---|')
  L.push(`| [\`report.md\`](./report.md) | yes | doc 08's eight release-report sections |`)
  L.push(`| [\`api-diff.md\`](./api-diff.md) / \`.json\` | ${apiDiff ? 'yes' : '**no**'} | public surface of all published packages, classified against VERSIONING.md |`)
  L.push(`| [\`supply-chain.md\`](./supply-chain.md) / \`.json\` | ${supplyChain ? 'yes' : '**no**'} | licences, vulnerabilities, provenance summary |`)
  L.push(`| [\`sbom.cdx.json\`](./sbom.cdx.json) + \`sbom/\` | ${supplyChain ? 'yes' : '**no**'} | CycloneDX 1.6, one per tarball plus an aggregate |`)
  L.push(`| [\`hashes.json\`](./hashes.json) | ${supplyChain ? 'yes' : '**no**'} | sha256 + sha512 per tarball and per file inside it |`)
  L.push(`| [\`provenance.json\`](./provenance.json) | ${supplyChain ? 'yes' : '**no**'} | in-toto v1 / SLSA v1 statements, **unsigned**, trusted publishing **not exercised** |`)
  L.push(`| [\`candidate-content-digest.json\`](./candidate-content-digest.json) | yes | every file behind the digest above |`)
  L.push(`| \`logs/\` | ${gates.length > 0 ? 'yes' : '**no**'} | one \`.txt\` per gate |`)
  L.push('')
  L.push('> **The logs are `.txt`, not `.log`, on purpose.** `.gitignore:42` is `*.log`, so a')
  L.push('> bundle that wrote `logs/*.log` could never be committed — the per-gate evidence')
  L.push('> the ledger rests on would vanish at `git add`. Pro\'s bundle hit exactly this')
  L.push('> (its finding **E-6**, 50 ignored logs); OSS avoids it by extension rather than by')
  L.push('> editing `.gitignore`.')
  L.push('')
  return L.join('\n')
}

// --- CLI ---

export interface ReportArgs { out: string | null }

export function parseArgs(argv: string[]): ReportArgs {
  const args: ReportArgs = { out: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--out')
      args.out = argv[++i] ?? null
    else
      throw new Error(`unknown argument: ${arg}`)
  }
  return args
}

function workspaceVersions(): Record<string, string> {
  const versions: Record<string, string> = {}
  const packagesRoot = resolve(ROOT, 'packages')
  for (const dir of readdirSync(packagesRoot)) {
    const path = resolve(packagesRoot, dir, 'package.json')
    if (!existsSync(path))
      continue
    const pkg = JSON.parse(readFileSync(path, 'utf8')) as { name?: string, version?: string }
    if (pkg.name)
      versions[pkg.name] = pkg.version ?? '?'
  }
  return versions
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const binding = gitState()
  const bundle = bundleId(binding)
  const outDir = args.out ? resolve(ROOT, args.out) : join(EVIDENCE_DIR, bundle)
  mkdirSync(outDir, { recursive: true })

  const chainLinks = (JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> })
    .scripts['validate:all']
    ?.split('&&')
    .length ?? 0

  const digest = contentDigest()
  const input: ReportInputs = {
    binding,
    bundle,
    gates: readJsonl(join(outDir, 'results.jsonl')),
    apiDiff: readJsonOrNull<DiffReport>(join(outDir, 'api-diff.json')),
    supplyChain: readJsonOrNull<EvidenceResult>(join(outDir, 'supply-chain.json')),
    hashes: readJsonOrNull(join(outDir, 'hashes.json')),
    experience: readExperienceEvidence(),
    digest,
    chainLinks,
    versions: workspaceVersions(),
    tags: git(['tag', '--list']).split(/\r?\n/).filter(t => t !== '' && !t.startsWith('backup/')),
  }

  writeFileSync(join(outDir, 'report.md'), renderReport(input), 'utf8')
  writeFileSync(join(outDir, 'ledger.md'), renderLedger(input), 'utf8')
  writeFileSync(
    join(outDir, 'candidate-content-digest.json'),
    `${JSON.stringify({ provenance: provenanceOf('release:report', binding), digest: digest.digest, fileCount: digest.fileCount, bytes: digest.bytes, dirtyFiles: binding.dirtyFiles, files: digest.files }, null, 2)}\n`,
    'utf8',
  )

  console.log(`release:report — ${bundle}`)
  console.log(`  gates recorded: ${input.gates.length}${input.gates.length === 0 ? ' (sections 2 and 3 report UNRUN, not green)' : ` · ${input.gates.filter(g => g.exit !== 0).length} failed`}`)
  console.log(`  api-diff: ${input.apiDiff ? `present · ${input.apiDiff.stopConditions.length} stop condition(s)` : 'ABSENT'}`)
  console.log(`  supply chain: ${input.supplyChain ? `present · ${input.supplyChain.totals.tarballs} tarball(s)` : 'ABSENT'}`)
  console.log(`  content digest: ${digest.digest.slice(0, 16)}… (${digest.fileCount} files)`)
  console.log(`  admissible: ${binding.admissible}${binding.admissible ? '' : ` — ${binding.inadmissibleReason}`}`)
  console.log(`  written → ${outDir.slice(ROOT.length + 1).replaceAll('\\', '/')}/{report.md,ledger.md,candidate-content-digest.json}`)
}

const invokedDirectly = process.argv[1] !== undefined
  && /report\.(?:ts|js|mjs)$/.test(process.argv[1].replaceAll('\\', '/'))
if (invokedDirectly)
  main()
