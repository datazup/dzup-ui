/**
 * Capability-matrix validator (TASK-OSS-P5-06, extended by TASK-R2-O1).
 *
 * Six gates:
 *
 *   1. **freshness** — the committed `capability-matrix.json` equals what the
 *      generator produces now, with the `sourceCommit` and per-row
 *      `componentCommit` provenance stamps excluded (TASK-N5-03: both are
 *      git hashes recorded inside an artifact that is then byte-compared,
 *      so a commit touching a component source makes the file stale in that
 *      same commit). Cell states, notes, artifacts and totals still compare
 *      byte for byte.
 *   2. **tier D** — a Tier D component may not carry an unexplained `unrun`
 *      cell. TASK-OSS-P5-06 names this one directly. Tier D is where a defect
 *      is a security defect, and "nobody has produced this evidence" is not an
 *      answer there; an `excepted` cell with a reason is.
 *   3. **stale** — a cell whose artifact predates the component's last change
 *      is reported per tier, never folded into a pass count.
 *   4. **inputs** — an absent input is reported by name. Without this, a whole
 *      column of `unrun` reads as a catalog-wide failure when it is one
 *      artifact nobody generated.
 *   5. **browser-degradation** (TASK-R2-O1) — a `{component, engine, condition}`
 *      cell the **committed** `e2e/matrix/browser-evidence.json` records as
 *      `pass` may not read `unrun` or `fail` in the working tree. `unrun` is
 *      what a lane that quietly stopped running looks like from the outside, and
 *      it is indistinguishable from one that was never wired up unless something
 *      refuses it. The message names the component, the engine and the
 *      condition, because "the browser matrix got worse" is not actionable.
 *   6. **browser-shape** (TASK-R2-O1) — the ledger's declared engines and
 *      conditions must equal what `playwright.config.ts` declares. The lane went
 *      from six conditions to eight in TASK-R2-O5 and three documents went on
 *      saying six; a ledger that claimed 18/18 projects while the config
 *      declared 24 would read as complete coverage of a lane it had not run.
 *
 * Gates 3 and 4 report; 1, 2, 5 and 6 fail. That split is the packet's own rule:
 * the page exists to make gaps visible, and a validator that failed on every
 * visible gap would be a validator people delete. A gap that *used to be
 * evidence* is the exception — that is a regression, not a gap.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/capability-matrix.ts
 *   tsx packages/tooling/src/validators/capability-matrix.ts --all
 *
 * Two escape hatches exist for driving gate 5 by hand, and both print a banner
 * so a green run under one can never be mistaken for a real one:
 * `DZUP_BROWSER_EVIDENCE_BASELINE` and `DZUP_BROWSER_EVIDENCE_CURRENT` replace
 * the two sides of the comparison with files on disk. They are how the seeded
 * regression in the TASK-R2-O1 handoff is demonstrated end-to-end without
 * touching the tracked ledger.
 *
 * Exit code 1 if a hard gate fails.
 */

import type { BrowserEvidenceLedger } from '../quality/browser-evidence.ts'
import type { CapabilityMatrix } from '../quality/capability-matrix.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  BROWSER_EVIDENCE_PATH,
  checkBrowserDegradation,
  readBrowserEvidence,
  readDeclaredMatrixProjects,
} from '../quality/browser-evidence.ts'
import { CELL_STATES } from '../quality/capability-matrix.ts'
import {
  buildCapabilityMatrix,
  CAPABILITY_MATRIX_PATH,
  serializeCapabilityMatrix,
} from '../quality/generate-capability-matrix.ts'
import { stripComponentCommits } from '../quality/git.ts'

export interface CapabilityViolation {
  rule: 'freshness' | 'tier-d' | 'stale' | 'inputs' | 'browser-degradation' | 'browser-shape'
  level: 'error' | 'report'
  message: string
}

/**
 * The ledger as `HEAD` has it, or `undefined` when HEAD has no copy yet.
 *
 * Read through `git show` rather than from a second file on disk, because the
 * question the gate asks is "what has this repository *committed* as true", and
 * the answer to that lives in git and nowhere else. A first landing has no
 * committed copy; the gate says so and passes, which is the only honest thing it
 * can do and is stated in the output rather than left to be inferred.
 */
export function readCommittedBrowserEvidence(): BrowserEvidenceLedger | undefined {
  const override = process.env.DZUP_BROWSER_EVIDENCE_BASELINE
  if (override !== undefined && override !== '')
    return JSON.parse(readFileSync(override, 'utf8')) as BrowserEvidenceLedger
  try {
    const json = execFileSync('git', ['show', 'HEAD:e2e/matrix/browser-evidence.json'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return JSON.parse(json) as BrowserEvidenceLedger
  }
  catch {
    return undefined
  }
}

/**
 * Gate 6 — the ledger's declared lane shape against `playwright.config.ts`.
 *
 * Exported so `browser-evidence.spec.ts` can drive it; the numbers it compares
 * are the ones a reader of the ledger would quote.
 */
export function checkBrowserShape(ledger: BrowserEvidenceLedger): CapabilityViolation[] {
  const declared = readDeclaredMatrixProjects()
  const out: CapabilityViolation[] = []
  const compare = (name: 'engines' | 'conditions', want: string[], got: readonly string[]) => {
    if (want.join(',') === [...got].join(','))
      return
    out.push({
      rule: 'browser-shape',
      level: 'error',
      message: `e2e/matrix/browser-evidence.json declares ${name} [${got.join(', ')}] and `
        + `playwright.config.ts declares [${want.join(', ')}]. The ledger would report coverage `
        + `of a lane that is not the lane. Re-run the projection: `
        + `\`yarn generate:browser-evidence\`.`,
    })
  }
  compare('engines', declared.engines, ledger.engines)
  compare('conditions', declared.conditions, ledger.conditions)

  const expected = declared.engines.length * declared.conditions.length
  if (ledger.totals.projects !== expected) {
    out.push({
      rule: 'browser-shape',
      level: 'error',
      message: `e2e/matrix/browser-evidence.json totals ${ledger.totals.projects} projects; `
        + `playwright.config.ts declares ${declared.engines.length} engines × `
        + `${declared.conditions.length} conditions = ${expected}.`,
    })
  }
  return out
}

/** Run the content gates. Pure — this is what the unit tests drive. */
export function checkCapabilityMatrix(matrix: CapabilityMatrix): CapabilityViolation[] {
  const violations: CapabilityViolation[] = []

  for (const row of matrix.rows) {
    if (row.tier === 'D') {
      for (const cell of row.cells) {
        // "Unexplained" is the word TASK-OSS-P5-06 uses, and it has to mean
        // something checkable. An `unrun` cell with an artifact is a gap
        // somebody has made a place for — the AT task file exists with six
        // pairs waiting for a human, which is a scheduled gap, not an absent
        // one. An `unrun` cell with nothing behind it is the case this gate is
        // for. Accepting a `note` as an explanation instead would have made the
        // gate unfailable: the generator writes a note on almost every unrun
        // cell, precisely so the page reads well.
        if (cell.state !== 'unrun' || cell.artifacts.length > 0)
          continue
        violations.push({
          rule: 'tier-d',
          level: 'error',
          message: `${row.component} is Tier D and its \`${cell.kind}\` cell is unrun with no `
            + `artifact (required by ${cell.origin}). Produce the evidence, or record an `
            + `exception in component-tiers.ts saying why this component cannot. A Tier D gap `
            + `is a security gap and does not get to be an empty cell.`,
        })
      }
    }

    for (const cell of row.cells) {
      if (cell.state !== 'stale')
        continue
      violations.push({
        rule: 'stale',
        level: 'report',
        message: `${row.component} / \`${cell.kind}\`: the artifact predates the component's `
          + `last change (${row.componentCommit.slice(0, 8)}).`,
      })
    }
  }

  for (const [name, input] of Object.entries(matrix.inputs)) {
    if (input.available)
      continue
    violations.push({
      rule: 'inputs',
      level: 'report',
      message: `input \`${name}\` is absent (${input.path}). Every cell that reads it is `
        + `\`unrun\` for that reason, not because the evidence failed.`,
    })
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const fresh = buildCapabilityMatrix()
  const violations = checkCapabilityMatrix(fresh)

  // Gates 5 and 6 — the browser ledger (TASK-R2-O1).
  const currentOverride = process.env.DZUP_BROWSER_EVIDENCE_CURRENT
  const baselineOverride = process.env.DZUP_BROWSER_EVIDENCE_BASELINE
  const overridden = (currentOverride ?? '') !== '' || (baselineOverride ?? '') !== ''
  const current = readBrowserEvidence(
    (currentOverride ?? '') === '' ? BROWSER_EVIDENCE_PATH : currentOverride!,
  )
  const committed = readCommittedBrowserEvidence()
  let degradationNote: string
  if (current === undefined) {
    degradationNote = 'no working-tree browser ledger — gate inert (run '
      + '`yarn generate:browser-evidence`)'
  }
  else {
    violations.push(...checkBrowserShape(current))
    if (committed === undefined) {
      degradationNote = 'no committed browser ledger at HEAD yet, so there is nothing to have '
        + 'degraded FROM. The gate is inert on this first landing and becomes live the moment '
        + 'the owner commits the ledger.'
    }
    else {
      const degraded = checkBrowserDegradation(committed, current)
      for (const d of degraded)
        violations.push({ rule: 'browser-degradation', level: 'error', message: d.message })
      const passesAtHead = committed.components
        .reduce((n, c) => n + Object.values(c.cells).filter(r => r === 'pass').length, 0)
      degradationNote = `${passesAtHead} committed \`pass\` cell(s) compared; `
        + `${degraded.length} degraded`
    }
  }

  if (!existsSync(CAPABILITY_MATRIX_PATH)) {
    violations.push({
      rule: 'freshness',
      level: 'error',
      message: 'packages/core/docs/capability-matrix.json does not exist. Run '
        + '`yarn generate:capability-matrix`.',
    })
  }
  else {
    const committed = readFileSync(CAPABILITY_MATRIX_PATH, 'utf8')
    // `sourceCommit` is excluded for the reason the ownership validator states:
    // it records which checkout produced the file, and gating on it would fail
    // this on every unrelated commit while proving nothing about the cells.
    // `componentCommit` is excluded for the same reason one level down: it is
    // `lastCommitFor(source)` on every row, so a commit that touches a
    // component source makes this file stale in that same commit and the gate
    // can never be green. See `stripComponentCommits`. Nothing reads the
    // committed value — the `stale` clause above runs against `fresh`, where it
    // is recomputed from git. Cell states, notes, artifacts and the per-tier
    // totals still compare byte for byte, so real staleness still fails here.
    const strip = (json: string) =>
      stripComponentCommits(json.replace(/"sourceCommit": "[^"]*"/, '"sourceCommit": "-"'))
    if (strip(committed) !== strip(serializeCapabilityMatrix(fresh))) {
      violations.push({
        rule: 'freshness',
        level: 'error',
        message: 'packages/core/docs/capability-matrix.json is stale. Run '
          + '`yarn generate:capability-matrix` and commit the result.',
      })
    }
  }

  const errors = violations.filter(v => v.level === 'error')
  const stale = violations.filter(v => v.rule === 'stale')
  const inputs = violations.filter(v => v.rule === 'inputs')

  console.warn('Capability matrix — TASK-OSS-P5-06\n')
  // Driven from CELL_STATES rather than a hand-written column list (TASK-R2-O2).
  // The list used to name five states; when `fail` was added, a hardcoded header
  // would have gone on printing five and a failing cell would have been counted
  // into a column nobody printed — a summary that hides the one state it most
  // matters to show.
  console.warn(`  tier  ${CELL_STATES.map(s => s.padStart(9)).join('')}`)
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    const t = fresh.totals[tier]
    console.warn(
      `  ${tier}    ${CELL_STATES.map(s => String(t[s] ?? 0).padStart(9)).join('')}`,
    )
  }
  console.warn('\n  Counts are per tier and per state on purpose. One percentage over cells of')
  console.warn('  different weight is the number this packet exists to stop reporting.')

  for (const v of inputs)
    console.warn(`\n  ! ${v.message}`)

  if (overridden) {
    console.warn(
      `\n  !! browser-degradation gate is running under an ENV OVERRIDE — this run proves `
      + `nothing about the tracked ledger.`,
    )
    if ((baselineOverride ?? '') !== '')
      console.warn(`     DZUP_BROWSER_EVIDENCE_BASELINE=${baselineOverride}`)
    if ((currentOverride ?? '') !== '')
      console.warn(`     DZUP_BROWSER_EVIDENCE_CURRENT=${currentOverride}`)
  }
  console.warn(`\n  browser-degradation: ${degradationNote}`)

  // Visual coverage is a per-row FIELD, not an evidence cell (N1-O6 §4.2), so it
  // is absent from the tier table above by design. It is REPORTED here — this
  // block changes no violation and no exit code — because a reader auditing the
  // visual lane through this command otherwise learns nothing from it, and
  // because `covered` on a platform CI does not run is the kind of claim that
  // must be printed next to its qualifier rather than looked up (TASK-R2-O6).
  const visual: Record<string, number> = { 'covered': 0, 'stale': 0, 'not-covered': 0 }
  for (const row of fresh.rows)
    visual[row.visual.state] = (visual[row.visual.state] ?? 0) + 1
  const ledgerNote = fresh.inputs['visual-baselines']?.available === true
    ? ''
    : '\n    no acceptance ledger — every row reads `not-covered` for want of an input'
  console.warn(
    `\n  visual coverage (a per-row field, not a cell — it is in neither total above):`
    + `\n    covered ${visual.covered} · stale ${visual.stale} · `
    + `not-covered ${visual['not-covered']} of ${fresh.rows.length}${ledgerNote}`,
  )

  if (stale.length > 0) {
    console.warn(`\n  ${stale.length} stale cell(s)`)
    if (showAll) {
      for (const v of stale)
        console.warn(`    · ${v.message}`)
    }
  }

  if (errors.length === 0) {
    console.warn(`\n✓ capability-matrix: fresh, and no Tier D cell is unexplained.`)
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${errors.length} capability-matrix violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
