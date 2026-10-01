#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * The release stop-condition gate (TASK-S2-O2).
 *
 * 08-11 doc 08 §"Release stop conditions" says: *"Stop qualification and retain
 * redacted evidence when any of these occurs"*, and lists them. Until now they
 * existed only as prose — nothing in this repository refused a release when,
 * say, a threshold had been raised or evidence was bound to a different commit.
 * This is the gate that says no.
 *
 * ## Nine bullets, eleven conditions
 *
 * doc 08 prints **nine** bullets. The first is compound — *"dirty/unidentified
 * source, generated drift, or evidence bound to a different commit/
 * configuration"* — and names three independent failures with three different
 * remedies, so it is evaluated as three. 3 + 8 = **11**, which is the
 * enumeration this file and the programme's task brief use. The split is
 * recorded in `stop-conditions.json` so that a reader who counts bullets in
 * doc 08 and finds nine does not conclude that two were invented.
 *
 * ## It fails closed
 *
 * Three verdicts are red, and they are distinguished because they have
 * different remedies:
 *
 * - `fired` — the condition is met. The release stops.
 * - `unevaluable` — the condition could not be decided, with a named reason
 *   and the command that would make it decidable. **This is a red.** A gate
 *   that cannot see a condition and reports nothing is worse than no gate: it
 *   converts an unknown into a pass, which is the "green over a stale artifact"
 *   failure `<repo_conventions>` warns about.
 * - `unattested` — a condition no tool can decide, awaiting an owner's
 *   signature. Also red, and an agent may never clear it.
 *
 * Only `clear` is green.
 *
 * ## What changed under it
 *
 * Two conditions became mechanically detectable for the first time at
 * `4e4e46f`, because TASK-S2-O1 built the twelve-row package-qualification
 * matrix: *"sanitizer/decoder/optional-peer path fails open"* (rows 8 and 9)
 * and *"tarball differs from the reviewed build or has undeclared files/entry
 * points"* (row 11). Before that bundle existed they could only be described.
 * This gate reads the row verdicts rather than restating them.
 *
 * Usage:
 *   node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/stop-conditions.ts
 *   … --candidate docs/qa/release/<bundle>   evaluate against that bundle
 *   … --only 3,10                            evaluate a subset (diagnostic; NOT a release verdict)
 *   … --json                                 machine-readable report on stdout
 *   … --write-ratchets                       record this run's ceilings into the candidate, for the NEXT run's SC-7
 *
 * Exit code 1 unless every evaluated condition is `clear`.
 *
 * @module @dzup-ui/tooling/validators/stop-conditions
 */

import type { SourceBinding } from '../release/binding.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { bundleId, gitState, ROOT } from '../release/binding.ts'
import { checkEvidenceBinding, readConfig as readBindingConfig } from './evidence-binding.ts'

export const CONFIG_PATH = resolve(ROOT, 'packages/tooling/src/validators/stop-conditions.json')
export const EVIDENCE_DIR = resolve(ROOT, 'docs/qa/release')

export type Verdict = 'clear' | 'fired' | 'unevaluable' | 'unattested'
export type Mode = 'machine' | 'attested'

export interface ConditionResult {
  n: number
  id: string
  /** doc 08's own wording, verbatim. */
  wording: string
  mode: Mode
  verdict: Verdict
  detail: string
  /** The artifact or command that revealed it. */
  revealedBy: string[]
}

export interface StopConditionReport {
  head: string
  candidate: string
  candidateDir: string
  scoped: number[] | null
  results: ConditionResult[]
  totals: { clear: number, fired: number, unevaluable: number, unattested: number }
}

export interface StopConditionConfig {
  attested: Array<{ condition: number, statement: string, whyNotMachineCheckable: string }>
  attestationFile: string
  attestationTemplate: string
  ceilingFiles: string[]
  allowlistFiles: Array<{ path: string, pointer: string | null }>
  highRiskTiers: string[]
  qualificationRows: { failOpen: number[], tarball: number[] }
}

export function readStopConfig(path: string = CONFIG_PATH): StopConditionConfig {
  return JSON.parse(readFileSync(path, 'utf8')) as StopConditionConfig
}

function readJson<T>(path: string): T | null {
  try {
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as T : null
  }
  catch {
    return null
  }
}

function git(args: string[], root: string = ROOT): string {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim()
  }
  catch {
    return ''
  }
}

// --- Ceilings ---------------------------------------------------------------

/** Direction a value may not move without a justification. */
export type CeilingDirection = 'max' | 'min'

export interface Ceiling { key: string, value: number, direction: CeilingDirection }

/**
 * Collect every threshold-shaped numeric leaf from a declared file.
 *
 * Generic on purpose: a per-file schema would have to be updated every time a
 * validator gained a ceiling, and the ceiling that nobody remembered to
 * register is exactly the one that gets raised quietly. Keys beginning
 * `max/ceiling/limit/budget/threshold/allow` are maxima; `min` is a minimum.
 */
export function collectCeilings(root: string, files: string[]): Ceiling[] {
  const out: Ceiling[] = []
  const wanted = /^(?:max|ceiling|limit|budget|threshold|allow|min)/i

  const walk = (node: unknown, path: string[]): void => {
    if (node === null || typeof node !== 'object')
      return
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, [...path, String(i)]))
      return
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      // `$`-prefixed keys are schema prose. `history` holds values that WERE
      // ceilings and are not any more — collecting them would compare a live
      // ceiling against an archived one and report a raise that never happened.
      if (k.startsWith('$') || k === 'history')
        continue
      if (typeof v === 'number' && wanted.test(k)) {
        out.push({
          key: [...path, k].join('.'),
          value: v,
          direction: /^min/i.test(k) ? 'min' : 'max',
        })
      }
      else {
        walk(v, [...path, k])
      }
    }
  }

  for (const file of files) {
    const data = readJson<unknown>(resolve(root, file))
    if (data === null)
      continue
    walk(data, [file])
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

/** An allowlist that grew is a threshold that was raised, with no number changed. */
export function collectAllowlistSizes(root: string, entries: Array<{ path: string, pointer: string | null }>): Ceiling[] {
  const out: Ceiling[] = []
  for (const entry of entries) {
    const data = readJson<unknown>(resolve(root, entry.path))
    if (data === null)
      continue
    const target = entry.pointer === null
      ? data
      : (data as Record<string, unknown>)[entry.pointer]
    let size: number | null = null
    if (Array.isArray(target))
      size = target.length
    else if (target !== null && typeof target === 'object')
      size = Object.keys(target as object).filter(k => !k.startsWith('$')).length
    if (size !== null)
      out.push({ key: `${entry.path}#length`, value: size, direction: 'max' })
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

export interface RatchetSnapshot {
  candidate: string
  sourceCommit: string
  recordedAt: string
  ceilings: Ceiling[]
  justifications: Array<{ key: string, from: number, to: number, owner: string, reason: string }>
}

/**
 * Artifacts a candidate directory must hold before the conditions can read it.
 *
 * A directory containing only `report.md` / `ledger.md` is a *rendering* of a
 * candidate, not its evidence.
 */
const EVIDENCE_ARTIFACTS = [
  'package-qualification.json',
  'provenance.json',
  'api-diff.json',
  'hashes.json',
  'ratchets.json',
] as const

/**
 * The candidate directory for a **commit**, not for a date.
 *
 * `bundleId()` is `<YYYY-MM-DD>-<shortCommit>`, so a candidate's directory name
 * changes at midnight even though the tree it describes did not. Measured on
 * this gate's first cross-midnight run: every evidence artifact for `4e4e46f`
 * sat in `2026-09-22-4e4e46f`, the gate looked in `2026-09-23-4e4e46f`, and
 * four conditions went `unevaluable` for a reason that had nothing to do with
 * the release.
 *
 * Evidence is bound to a **commit** — that is this programme's own rule, and
 * the date in the name is a label, not part of the identity. So: prefer an
 * exact `bundleId` match that actually holds evidence, else the newest
 * directory for the same short commit that does, else the exact name (so a
 * genuinely missing candidate still reports as missing rather than silently
 * borrowing another commit's evidence).
 *
 * It will never cross commits: only names ending in `-<shortCommit>` are
 * considered.
 */
export function candidateForCommit(
  shortCommit: string,
  preferred: string,
  dir: string = EVIDENCE_DIR,
): string {
  const holdsEvidence = (name: string): boolean =>
    EVIDENCE_ARTIFACTS.some(a => existsSync(join(dir, name, a)))

  if (existsSync(join(dir, preferred)) && holdsEvidence(preferred))
    return preferred
  if (!existsSync(dir))
    return preferred

  const sameCommit = readdirSync(dir)
    .filter(d => new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${shortCommit}$`).test(d))
    .filter(holdsEvidence)
    .sort()

  return sameCommit[sameCommit.length - 1] ?? preferred
}

/** The newest candidate directory strictly older than `current`, if any. */
export function previousCandidate(current: string, dir: string = EVIDENCE_DIR): string | null {
  if (!existsSync(dir))
    return null
  const dirs = readdirSync(dir)
    .filter(d => /^\d{4}-\d{2}-\d{2}-[0-9a-f]{7,}$/.test(d))
    .sort()
  const earlier = dirs.filter(d => d < current)
  return earlier[earlier.length - 1] ?? null
}

// --- The eleven conditions --------------------------------------------------

interface Ctx {
  root: string
  head: string
  binding: SourceBinding
  candidate: string
  candidateDir: string
  /**
   * The directory candidates live in — `dirname(candidateDir)`, not the module
   * constant. SC-7 has to find the *previous* candidate, and deriving that from
   * the candidate actually being evaluated is both more correct and the only
   * way a test can seed a two-candidate history without writing into
   * `docs/qa/release/`.
   */
  evidenceDir: string
  config: StopConditionConfig
}

type Evaluator = (ctx: Ctx) => Pick<ConditionResult, 'verdict' | 'detail' | 'revealedBy'>

interface ConditionSpec { n: number, id: string, wording: string, mode: Mode, evaluate: Evaluator }

/** SC-1 — dirty or unidentified source. */
const sc1: Evaluator = (ctx) => {
  if (ctx.head === '') {
    return { verdict: 'fired', detail: 'HEAD does not resolve — the source is unidentified', revealedBy: ['git rev-parse HEAD'] }
  }
  if (ctx.binding.dirtyCount > 0) {
    const sample = ctx.binding.dirtyFiles.slice(0, 5).map(f => f.path)
    return {
      verdict: 'fired',
      detail: `${ctx.binding.dirtyCount} uncommitted path(s); the candidate is ${ctx.binding.shortCommit}+${ctx.binding.dirtyCount}, which is not a commit anyone can check out`,
      revealedBy: ['git status --porcelain', ...sample],
    }
  }
  return { verdict: 'clear', detail: `clean tree at ${ctx.binding.shortCommit}`, revealedBy: ['git status --porcelain'] }
}

/** SC-2 — generated drift. */
const sc2: Evaluator = (ctx) => {
  const report = checkEvidenceBinding(readBindingConfig(), ctx.head, ctx.root)
  if (report.violations.length > 0) {
    return {
      verdict: 'fired',
      detail: `${report.violations.length} generated artifact(s) no longer describe the tree they were generated from`,
      revealedBy: ['yarn validate:evidence-binding', ...report.violations.map(v => `${v.artifact}: ${v.rule}`)],
    }
  }
  const dirty = report.advisories.flatMap(a => a.paths)
  return {
    verdict: 'clear',
    detail: `${report.checked} governed artifact(s) bound${
      dirty.length > 0 ? ` (${dirty.length} declared input(s) modified in the working tree — SC-1's question, not this one)` : ''}`,
    revealedBy: ['yarn validate:evidence-binding'],
  }
}

/** SC-3 — evidence bound to a different commit or configuration. */
const sc3: Evaluator = (ctx) => {
  if (!existsSync(ctx.candidateDir)) {
    return {
      verdict: 'unevaluable',
      detail: `no candidate bundle at ${ctx.candidate} — there is no evidence whose binding could be checked`,
      revealedBy: [`yarn release:bundle  (writes docs/qa/release/${ctx.candidate}/)`],
    }
  }
  const offenders: string[] = []
  for (const file of readdirSync(ctx.candidateDir).filter(f => f.endsWith('.json'))) {
    const data = readJson<{ sourceCommit?: string, provenance?: { sourceCommit?: string, admissible?: boolean } }>(join(ctx.candidateDir, file))
    if (data === null)
      continue
    const stamped = data.sourceCommit ?? data.provenance?.sourceCommit
    if (stamped !== undefined && stamped !== ctx.head)
      offenders.push(`${file}: stamped ${stamped.slice(0, 7)}, HEAD is ${ctx.head.slice(0, 7)}`)
    if (data.provenance?.admissible === false)
      offenders.push(`${file}: provenance.admissible = false`)
  }
  if (offenders.length > 0) {
    return {
      verdict: 'fired',
      detail: `${offenders.length} artifact(s) in the candidate are bound to something other than this commit/configuration`,
      revealedBy: [`docs/qa/release/${ctx.candidate}/`, ...offenders.slice(0, 6)],
    }
  }
  return { verdict: 'clear', detail: `every stamped artifact in ${ctx.candidate} names ${ctx.head.slice(0, 7)}`, revealedBy: [`docs/qa/release/${ctx.candidate}/`] }
}

/** SC-4 — wrong or unresolved Core/Pro package ownership. */
const sc4: Evaluator = (ctx) => {
  const path = resolve(ctx.root, 'packages/core/manifests/component-ownership.manifest.json')
  const manifest = readJson<{ entries?: Array<{ symbol: string, package?: string, kind?: string }> }>(path)
  if (manifest?.entries === undefined) {
    return { verdict: 'unevaluable', detail: 'component-ownership.manifest.json is missing or unreadable', revealedBy: ['yarn generate:ownership'] }
  }
  const workspace = new Set(
    readdirSync(resolve(ctx.root, 'packages'))
      .map(d => readJson<{ name?: string }>(resolve(ctx.root, 'packages', d, 'package.json'))?.name)
      .filter((n): n is string => typeof n === 'string'),
  )
  const unowned = manifest.entries.filter(e => e.package === undefined || e.package === '')
  const foreign = manifest.entries.filter(e => e.package !== undefined && e.package !== '' && !workspace.has(e.package))
  if (unowned.length > 0 || foreign.length > 0) {
    return {
      verdict: 'fired',
      detail: `${unowned.length} symbol(s) with no owning package, ${foreign.length} naming a package this workspace does not contain`,
      revealedBy: ['packages/core/manifests/component-ownership.manifest.json', ...[...unowned, ...foreign].slice(0, 5).map(e => e.symbol)],
    }
  }
  const unclassified = manifest.entries.filter(e => e.kind === 'unclassified').length
  return {
    verdict: 'clear',
    detail: `${manifest.entries.length} symbol(s), every one owned by a workspace package`
      + ` (${unclassified} carry kind \`unclassified\`, which is a stability CLASS, not an ownership question — ceiling-held by validate:ownership)`
      + '; no second-tier manifest is installed, so nothing claims second-tier ownership',
    revealedBy: ['packages/core/manifests/component-ownership.manifest.json', 'yarn validate:ownership'],
  }
}

/** SC-5 — unexplained public API diff or manifest omissions. */
const sc5: Evaluator = (ctx) => {
  const path = join(ctx.candidateDir, 'api-diff.json')
  const diff = readJson<{
    summary?: Record<string, { added: number, removed: number, changed: number, fidelity: string, requiredLevel: string, declaredLevel: string }>
    reconciliations?: Array<{ package: string, undocumented: string[], undelivered: string[] }>
    stopConditions?: Array<{ code: string, detail: string }>
  }>(path)
  if (diff === null) {
    return {
      verdict: 'unevaluable',
      detail: `no api-diff.json in ${ctx.candidate} — the public surface of this candidate has not been diffed, so "unexplained" cannot be decided either way`,
      revealedBy: [`yarn release:api-diff --out docs/qa/release/${ctx.candidate}`],
    }
  }
  const problems: string[] = []
  for (const [name, s] of Object.entries(diff.summary ?? {})) {
    if (s.fidelity === 'none')
      problems.push(`${name}: no baseline — every symbol is unbaselined, so no change is explained`)
    if ((s.removed > 0 || s.changed > 0) && s.declaredLevel !== s.requiredLevel)
      problems.push(`${name}: ${s.removed} removed / ${s.changed} changed require \`${s.requiredLevel}\`, changesets declare \`${s.declaredLevel}\``)
  }
  for (const rec of diff.reconciliations ?? []) {
    if (rec.undelivered.length > 0)
      problems.push(`${rec.package}: ${rec.undelivered.length} manifest omission(s) — promised and not delivered`)
  }
  for (const stop of diff.stopConditions ?? [])
    problems.push(`${stop.code}: ${stop.detail}`)

  if (problems.length > 0)
    return { verdict: 'fired', detail: `${problems.length} unexplained API finding(s)`, revealedBy: [`docs/qa/release/${ctx.candidate}/api-diff.json`, ...problems.slice(0, 6)] }
  return { verdict: 'clear', detail: 'every public-surface change is baselined and matches its declared changeset level', revealedBy: [`docs/qa/release/${ctx.candidate}/api-diff.json`] }
}

/** SC-6 — a required validator cannot start on the declared runtime. */
const sc6: Evaluator = (ctx) => {
  const rootPkg = readJson<{ engines?: { node?: string }, scripts?: Record<string, string> }>(resolve(ctx.root, 'package.json'))
  if (rootPkg === null)
    return { verdict: 'unevaluable', detail: 'root package.json unreadable', revealedBy: ['package.json'] }

  const problems: string[] = []
  const declared = rootPkg.engines?.node
  const running = process.versions.node
  if (declared === undefined) {
    problems.push('no `engines.node` is declared, so there is no runtime floor to check against (ADR-18)')
  }
  else {
    // Only the major is read; the minor and patch are matched so a range like
    // `^2.9.2` consumes them, but deliberately not captured.
    const floor = /(\d+)(?:\.\d+)?(?:\.\d+)?/.exec(declared)
    const major = Number.parseInt(floor?.[1] ?? '0', 10)
    if (Number.parseInt(running.split('.')[0] ?? '0', 10) < major)
      problems.push(`running Node ${running} is below the declared floor \`${declared}\``)
  }

  // Every validate:* lane must name a file that exists.
  const scripts = rootPkg.scripts ?? {}
  for (const [name, command] of Object.entries(scripts)) {
    if (!name.startsWith('validate:') || name === 'validate:all')
      continue
    for (const token of command.split(/\s+/)) {
      if (/\.(?:ts|mjs|js|sh)$/.test(token) && !token.startsWith('-') && !existsSync(resolve(ctx.root, token)))
        problems.push(`${name}: \`${token}\` does not exist`)
    }
  }

  if (problems.length > 0)
    return { verdict: 'fired', detail: `${problems.length} validator(s) cannot start`, revealedBy: ['package.json#engines', ...problems.slice(0, 6)] }
  return {
    verdict: 'clear',
    detail: `Node ${running} satisfies \`${declared}\`; every validate:* lane resolves to a file that exists`,
    revealedBy: ['package.json#engines', 'yarn validate:engines'],
  }
}

/** SC-7 — a threshold or budget was raised without a reviewed justification. */
const sc7: Evaluator = (ctx) => {
  const current = [
    ...collectCeilings(ctx.root, ctx.config.ceilingFiles),
    ...collectAllowlistSizes(ctx.root, ctx.config.allowlistFiles),
  ]
  const prevName = previousCandidate(ctx.candidate, ctx.evidenceDir)
  if (prevName === null) {
    return {
      verdict: 'unevaluable',
      detail: `no earlier release candidate exists, so there is no recorded value any of these ${current.length} ceilings could be compared against. "Nothing was raised" cannot be asserted without a baseline; this run writes one (--write-ratchets) so the NEXT candidate can decide it.`,
      revealedBy: ['docs/qa/release/', `${current.length} ceilings collected from ${ctx.config.ceilingFiles.length + ctx.config.allowlistFiles.length} file(s)`],
    }
  }
  const snapshot = readJson<RatchetSnapshot>(join(ctx.evidenceDir, prevName, 'ratchets.json'))
  if (snapshot === null) {
    return {
      verdict: 'unevaluable',
      detail: `the previous candidate \`${prevName}\` records no ratchets.json, so its ceiling values are unknown and no comparison is possible`,
      revealedBy: [`${prevName}/`, 'run this gate with --write-ratchets on each candidate'],
    }
  }
  const before = new Map(snapshot.ceilings.map(c => [c.key, c]))
  const justified = new Set((snapshot.justifications ?? []).map(j => j.key))
  const currentJust = readJson<RatchetSnapshot>(join(ctx.candidateDir, 'ratchets.json'))?.justifications ?? []
  for (const j of currentJust) {
    if (j.owner && j.reason)
      justified.add(j.key)
  }

  const raised: string[] = []
  for (const c of current) {
    const was = before.get(c.key)
    if (was === undefined)
      continue
    const moved = c.direction === 'max' ? c.value > was.value : c.value < was.value
    if (moved && !justified.has(c.key))
      raised.push(`${c.key}: ${was.value} → ${c.value} (${c.direction}) with no justification line`)
  }
  if (raised.length > 0)
    return { verdict: 'fired', detail: `${raised.length} threshold(s) raised without a reviewed justification naming an owner`, revealedBy: [`docs/qa/release/${prevName}/ratchets.json`, ...raised.slice(0, 6)] }
  return { verdict: 'clear', detail: `${current.length} ceiling(s) compared against \`${prevName}\`; none moved in the forbidden direction without an owned justification`, revealedBy: [`${prevName}/ratchets.json`] }
}

/** SC-8 — a sanitizer, decoder or optional-peer path fails open. */
const sc8: Evaluator = (ctx) => {
  const path = join(ctx.candidateDir, 'package-qualification.json')
  const qual = readJson<{ rows?: Array<{ n: number, title: string, verdict: string, reason: string }> }>(path)
  if (qual?.rows === undefined) {
    return {
      verdict: 'unevaluable',
      detail: `no package-qualification.json in ${ctx.candidate} — the optional-peer and sanitizer rows have not been measured for this candidate`,
      revealedBy: ['yarn qualify:package'],
    }
  }
  const watched = ctx.config.qualificationRows.failOpen
  const rows = qual.rows.filter(r => watched.includes(r.n))
  const missing = watched.filter(n => !rows.some(r => r.n === n))
  if (missing.length > 0)
    return { verdict: 'unevaluable', detail: `row(s) ${missing.join(', ')} absent from the qualification report`, revealedBy: [path] }
  const bad = rows.filter(r => r.verdict !== 'green')
  if (bad.length > 0) {
    return {
      verdict: 'fired',
      detail: `${bad.length} governed fail-closed row(s) are not green`,
      revealedBy: [`docs/qa/release/${ctx.candidate}/package-qualification.md`, ...bad.map(r => `row ${r.n} (${r.title}): ${r.verdict} — ${r.reason}`)],
    }
  }
  return { verdict: 'clear', detail: `rows ${watched.join(', ')} green — every optional-peer and sanitizer path fails closed as documented`, revealedBy: [path] }
}

/** SC-9 — browser/AT/RTL/SSR evidence missing for a CHANGED high-risk component. */
const sc9: Evaluator = (ctx) => {
  const changed = git(['status', '--porcelain', '--', 'packages/core/src/components'], ctx.root)
  const changedComponents = new Set(
    changed === ''
      ? []
      : changed.split(/\r?\n/)
          .map(l => /([A-Z]\w+)\.(?:vue|types\.ts|variants\.ts)$/.exec(l)?.[1])
          .filter((n): n is string => typeof n === 'string'),
  )
  if (changedComponents.size === 0)
    return { verdict: 'clear', detail: 'no component under packages/core/src/components changed in this candidate, so no component owes new browser/AT/RTL/SSR evidence', revealedBy: ['git status --porcelain -- packages/core/src/components'] }

  const quality = readJson<{ components?: Array<{ name?: string, component?: string, tier: string }> }>(resolve(ctx.root, 'packages/core/docs/quality-matrix.json'))
  if (quality?.components === undefined)
    return { verdict: 'unevaluable', detail: `${changedComponents.size} component(s) changed and quality-matrix.json is unreadable, so their risk tier is unknown`, revealedBy: ['yarn generate:quality'] }

  const tierOf = new Map(quality.components.map(c => [c.name ?? c.component ?? '', c.tier]))
  const highRisk = [...changedComponents].filter(n => ctx.config.highRiskTiers.includes(tierOf.get(n) ?? ''))
  if (highRisk.length === 0)
    return { verdict: 'clear', detail: `${changedComponents.size} component(s) changed, none at tier ${ctx.config.highRiskTiers.join('/')}`, revealedBy: ['packages/core/docs/quality-matrix.json'] }

  const browser = readJson<{ totals?: Record<string, number> }>(resolve(ctx.root, 'e2e/matrix/browser-evidence.json'))
  const at = readJson<{ entries?: Array<{ component: string, rows: Array<{ result: string }> }> }>(resolve(ctx.root, 'e2e/at-matrix/index.json'))
  const withoutAt = highRisk.filter((name) => {
    const entry = at?.entries?.find(e => e.component === name)
    return entry === undefined || entry.rows.every(r => r.result === 'unrun')
  })
  const browserRun = browser?.totals?.projectsRun ?? 0

  if (withoutAt.length > 0 || browserRun === 0) {
    return {
      verdict: 'fired',
      detail: `${highRisk.length} changed high-risk component(s); ${withoutAt.length} with no executed AT row, browser projects run = ${browserRun}`,
      revealedBy: ['e2e/at-matrix/index.json', 'e2e/matrix/browser-evidence.json', ...highRisk.slice(0, 6)],
    }
  }
  return { verdict: 'clear', detail: `${highRisk.length} changed high-risk component(s), all with executed browser and AT evidence`, revealedBy: ['e2e/at-matrix/index.json'] }
}

/** SC-10 — the tarball differs from the reviewed build or has undeclared files/entry points. */
const sc10: Evaluator = (ctx) => {
  const qual = readJson<{ rows?: Array<{ n: number, title: string, verdict: string, reason: string }> }>(join(ctx.candidateDir, 'package-qualification.json'))
  const hashes = readJson<{ packages?: Record<string, unknown> }>(join(ctx.candidateDir, 'hashes.json'))
  const policy = readJson<{ published?: string[] }>(resolve(ctx.root, 'packages/tooling/scripts/release-policy.json'))

  if (qual?.rows === undefined)
    return { verdict: 'unevaluable', detail: `no package-qualification.json in ${ctx.candidate} — the tarball file/export/API diff has not been run for this candidate`, revealedBy: ['yarn qualify:package'] }
  if (hashes?.packages === undefined)
    return { verdict: 'unevaluable', detail: `no hashes.json in ${ctx.candidate} — there is no recorded digest for any tarball, so "differs from the reviewed build" has no referent`, revealedBy: [`yarn release:evidence --out docs/qa/release/${ctx.candidate}`] }

  const problems: string[] = []
  for (const n of ctx.config.qualificationRows.tarball) {
    const row = qual.rows.find(r => r.n === n)
    if (row === undefined)
      problems.push(`row ${n} absent from the qualification report`)
    else if (row.verdict !== 'green')
      problems.push(`row ${n} (${row.title}): ${row.verdict} — ${row.reason}`)
  }
  for (const name of policy?.published ?? []) {
    if (!(name in hashes.packages))
      problems.push(`${name} is classified \`published\` and has no recorded tarball digest`)
  }
  if (problems.length > 0)
    return { verdict: 'fired', detail: `${problems.length} tarball finding(s)`, revealedBy: [`docs/qa/release/${ctx.candidate}/`, ...problems.slice(0, 6)] }
  return {
    verdict: 'clear',
    detail: `${Object.keys(hashes.packages).length} tarball(s) digested; row ${ctx.config.qualificationRows.tarball.join(', ')} green — no undeclared file or entry point`,
    revealedBy: [`docs/qa/release/${ctx.candidate}/hashes.json`, `docs/qa/release/${ctx.candidate}/package-qualification.json`],
  }
}

/** SC-11 — an action lacking explicit authority. Attested; never machine-cleared. */
const sc11: Evaluator = (ctx) => {
  const spec = ctx.config.attested.find(a => a.condition === 11)
  const file = join(ctx.candidateDir, ctx.config.attestationFile)
  const attestation = readJson<{ rows?: Array<{ condition: number, attestedBy?: string, date?: string, decision?: string }> }>(file)
  const row = attestation?.rows?.find(r => r.condition === 11)
  if (row === undefined || !row.attestedBy || !row.date || row.decision !== 'clear') {
    return {
      verdict: 'unattested',
      detail: `awaiting an owner signature. ${spec?.whyNotMachineCheckable ?? ''}`,
      revealedBy: [
        `docs/qa/release/${ctx.candidate}/${ctx.config.attestationFile} — ${attestation === null ? 'absent' : 'present, row 11 unsigned'}`,
        `template: ${ctx.config.attestationTemplate}`,
        'an agent may never sign this row',
      ],
    }
  }
  return { verdict: 'clear', detail: `attested by ${row.attestedBy} on ${row.date}`, revealedBy: [file] }
}

export const CONDITIONS: ConditionSpec[] = [
  { n: 1, id: 'dirty-source', wording: 'dirty/unidentified source', mode: 'machine', evaluate: sc1 },
  { n: 2, id: 'generated-drift', wording: 'generated drift', mode: 'machine', evaluate: sc2 },
  { n: 3, id: 'evidence-misbound', wording: 'evidence bound to a different commit/configuration', mode: 'machine', evaluate: sc3 },
  { n: 4, id: 'ownership-unresolved', wording: 'wrong or unresolved Core/Pro package ownership', mode: 'machine', evaluate: sc4 },
  { n: 5, id: 'api-diff-unexplained', wording: 'unexplained public API diff or manifest omissions', mode: 'machine', evaluate: sc5 },
  { n: 6, id: 'validator-cannot-start', wording: 'required validator cannot start on the declared runtime', mode: 'machine', evaluate: sc6 },
  { n: 7, id: 'threshold-raised', wording: 'threshold/budget is raised without a reviewed product justification', mode: 'machine', evaluate: sc7 },
  { n: 8, id: 'fails-open', wording: 'sanitizer/decoder/optional-peer path fails open', mode: 'machine', evaluate: sc8 },
  { n: 9, id: 'experience-evidence-missing', wording: 'browser/AT/RTL/SSR evidence is missing for a changed high-risk component', mode: 'machine', evaluate: sc9 },
  { n: 10, id: 'tarball-differs', wording: 'tarball differs from the reviewed build or has undeclared files/entry points', mode: 'machine', evaluate: sc10 },
  { n: 11, id: 'authority-missing', wording: 'credentials, registry mutation, publication, signing, deployment, entitlement, or production action lacks explicit authority', mode: 'attested', evaluate: sc11 },
]

export interface RunOptions {
  root?: string
  candidate?: string
  only?: number[] | null
  binding?: SourceBinding
  config?: StopConditionConfig
}

export function runStopConditions(options: RunOptions = {}): StopConditionReport {
  const root = options.root ?? ROOT
  const binding = options.binding ?? gitState()
  const config = options.config ?? readStopConfig()
  // Resolve by commit, not by date — see candidateForCommit(). An explicit
  // --candidate is always honoured verbatim, so a caller can still point the
  // gate at one directory and get an answer about exactly that directory.
  const candidate = options.candidate ?? candidateForCommit(binding.shortCommit, bundleId(binding))
  const candidateDir = candidate.includes('/') || candidate.includes('\\')
    ? resolve(root, candidate)
    : join(EVIDENCE_DIR, candidate)
  const candidateName = candidateDir.split(/[\\/]/).pop() ?? candidate
  const evidenceDir = dirname(candidateDir)
  const ctx: Ctx = { root, head: binding.sourceCommit, binding, candidate: candidateName, candidateDir, evidenceDir, config }

  const selected = options.only === null || options.only === undefined
    ? CONDITIONS
    : CONDITIONS.filter(c => (options.only as number[]).includes(c.n))

  const results: ConditionResult[] = selected.map((spec) => {
    let outcome: ReturnType<Evaluator>
    try {
      outcome = spec.evaluate(ctx)
    }
    catch (error) {
      // Fail closed: an evaluator that throws has NOT cleared its condition.
      outcome = {
        verdict: 'unevaluable',
        detail: `the check threw: ${error instanceof Error ? error.message : String(error)}`,
        revealedBy: [`packages/tooling/src/validators/stop-conditions.ts (${spec.id})`],
      }
    }
    return { n: spec.n, id: spec.id, wording: spec.wording, mode: spec.mode, ...outcome }
  })

  const totals = { clear: 0, fired: 0, unevaluable: 0, unattested: 0 }
  for (const r of results)
    totals[r.verdict]++

  return { head: binding.sourceCommit, candidate: candidateName, candidateDir, scoped: options.only ?? null, results, totals }
}

/** Record this candidate's ceiling values, so the NEXT candidate's SC-7 has a baseline. */
export function writeRatchets(report: StopConditionReport, config: StopConditionConfig, root: string = ROOT): string {
  mkdirSync(report.candidateDir, { recursive: true })
  const existing = readJson<RatchetSnapshot>(join(report.candidateDir, 'ratchets.json'))
  const snapshot: RatchetSnapshot = {
    candidate: report.candidate,
    sourceCommit: report.head,
    recordedAt: new Date().toISOString(),
    ceilings: [...collectCeilings(root, config.ceilingFiles), ...collectAllowlistSizes(root, config.allowlistFiles)],
    // Justifications are written by the OWNER, never by this gate. Preserved verbatim.
    justifications: existing?.justifications ?? [],
  }
  const out = join(report.candidateDir, 'ratchets.json')
  writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  return out
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]).replaceAll('\\', '/').endsWith('/stop-conditions.ts')

if (isMain) {
  const argv = process.argv.slice(2)
  const valueOf = (flag: string): string | null => {
    const i = argv.indexOf(flag)
    return i === -1 ? null : (argv[i + 1] ?? null)
  }
  const onlyRaw = valueOf('--only')
  const only = onlyRaw === null
    ? null
    : onlyRaw.split(',').map(s => Number.parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))

  const config = readStopConfig()
  const report = runStopConditions({ candidate: valueOf('--candidate') ?? undefined, only, config })

  if (argv.includes('--write-ratchets')) {
    const out = writeRatchets(report, config)
    console.warn(`  · ratchet baseline recorded → ${out.slice(ROOT.length + 1).replaceAll('\\', '/')}`)
  }

  if (argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2))
    process.exit(report.totals.clear === report.results.length ? 0 : 1)
  }

  console.warn(`release stop conditions — candidate \`${report.candidate}\` at ${report.head.slice(0, 7)}`)
  if (report.scoped !== null)
    console.warn(`  ⚠ SCOPED RUN (--only ${report.scoped.join(',')}) — a diagnostic, NOT a release verdict`)
  console.warn('')

  const mark: Record<Verdict, string> = { clear: '✓', fired: '✗', unevaluable: '?', unattested: '⊘' }
  for (const r of report.results) {
    console.warn(`${mark[r.verdict]} SC-${String(r.n).padStart(2, '0')} [${r.verdict}] ${r.wording}`)
    console.warn(`    ${r.detail}`)
    for (const line of r.revealedBy.slice(0, 7))
      console.warn(`      · ${line}`)
  }
  console.warn('')

  const { clear, fired, unevaluable, unattested } = report.totals
  console.warn(
    `${report.results.length} condition(s): ${clear} clear · ${fired} FIRED · ${unevaluable} unevaluable · ${unattested} unattested`,
  )

  if (clear === report.results.length) {
    console.warn('✓ no release stop condition is met')
    process.exit(0)
  }
  console.error('')
  console.error('✗ RELEASE STOPPED. doc 08: "Stop qualification and retain redacted evidence when any of these occurs."')
  for (const r of report.results.filter(x => x.verdict !== 'clear'))
    console.error(`    SC-${r.n} (${r.verdict}) — ${r.wording}`)
  console.error('  An `unevaluable` condition is a red, not a pass: a gate that cannot see a condition must not report one.')
  process.exit(1)
}
/* c8 ignore stop */
