/**
 * Capability-matrix validator (TASK-OSS-P5-06, extended by TASK-R2-O1,
 * TASK-S1-O2 and RESIDUAL-17).
 *
 * Eight gates:
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
 *   7. **stale-ratchet** (TASK-S1-O2) — the stale COUNT is held at the ceiling
 *      in `capability-matrix-ceilings.json`, and the set of stale KINDS is held
 *      too. Gate 3 says which cells are stale; this one says the number may not
 *      grow, may not shrink without the ceiling being lowered in the same
 *      change, and may not be satisfied by trading one stale kind for another.
 *      At `4e4e46f` all 22 are `perf-baseline` and are blocked on an owner
 *      action (a ≥5-run recapture, TASK-S1-O4) — so the blockage is now
 *      machine-checkable instead of a sentence in a report nobody re-reads.
 *   8. **evidence-ratchet** (RESIDUAL-17, closing `D-RES16-3`) — the `pass` and
 *      `present` counts are held **per kind** and in **both directions**. Until
 *      this gate existed the repository's most-quoted numbers had no baseline at
 *      all: RESIDUAL-16 removed 42 false cells — 27 of them published `pass` —
 *      and `yarn validate:all` exited 0 with 53 green links and no red one. A
 *      rise is a loosened predicate until something shows otherwise; a fall is a
 *      regression until something declares otherwise. Both are declared by one
 *      edit to `evidenceCells.kinds`, and the gate prints the corrected block.
 *
 * Gates 3 and 4 report; 1, 2, 5, 6, 7 and 8 fail. That split is the packet's own
 * rule: the page exists to make gaps visible, and a validator that failed on
 * every visible gap would be a validator people delete. A gap that *used to be
 * evidence* is the exception — that is a regression, not a gap — which is
 * exactly why gate 7 holds the number gate 3 only prints, and why gate 8 holds
 * the two numbers nothing held before.
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
  rule: 'freshness' | 'tier-d' | 'stale' | 'stale-ratchet' | 'inputs' | 'browser-degradation'
    | 'browser-shape' | 'evidence-ratchet'
  level: 'error' | 'report'
  message: string
}

/** One kind's recorded credit. Both states, because they mean different things. */
export interface EvidenceKindRecord {
  pass: number
  present: number
}

/** The ratchet file's shape. Comment keys (`//`) are ignored by every reader. */
export interface CapabilityCeilings {
  staleCells: { ceiling: number, blockedOn?: string, components?: string[] }
  staleCellKinds: { kinds: string[] }
  evidenceCells: {
    totals: { pass: number, present: number }
    kinds: Record<string, EvidenceKindRecord>
  }
  unrunCells: { baseline: number, perTier: Record<string, number> }
}

export const CAPABILITY_CEILINGS_PATH = resolve(
  ROOT,
  'packages/tooling/src/validators/capability-matrix-ceilings.json',
)

/**
 * Read the ratchet file. Exported so the specs can drive it with a fabricated
 * one.
 *
 * `DZUP_CAPABILITY_CEILINGS` replaces the tracked file, exactly as
 * `DZUP_BROWSER_EVIDENCE_BASELINE` replaces the tracked ledger for gate 5 and
 * for the same reason: the seeded-increase proof a handoff owes has to be
 * runnable end-to-end at the CLI without mutating a tracked artifact. The CLI
 * prints a banner when it is set, so a run under one can never be mistaken for
 * a real one.
 */
export function readCapabilityCeilings(path?: string): CapabilityCeilings {
  const override = process.env.DZUP_CAPABILITY_CEILINGS
  const from = path ?? ((override ?? '') === '' ? CAPABILITY_CEILINGS_PATH : override!)
  return JSON.parse(readFileSync(from, 'utf8')) as CapabilityCeilings
}

/**
 * Gate 7 — the staleness ratchet (TASK-S1-O2).
 *
 * Gate 3 reports stale cells and does not fail, which is the packet's own rule:
 * the page exists to make gaps visible and a validator that failed on every
 * visible gap is a validator people delete. But a stale cell is not an ordinary
 * gap — it is a result measured against source that has since changed, and the
 * matrix prints it in the same table as a pass. So the *number* is held: a gap
 * that used to be evidence may shrink and may not grow.
 *
 * Two clauses, because a count alone is a gate that can be walked around:
 *
 *  - **count** — `staleCells` may not exceed the ceiling, and may not fall
 *    below it without the ceiling being lowered in the same change. The second
 *    half is the repo's existing ratchet handshake (`component-meta-ceilings`)
 *    and is what stops a hard-won drop from being silently re-spent.
 *  - **kind** — a stale cell whose `kind` is not in `staleCellKinds` is an
 *    error *whatever the count says*. Clear one `perf-baseline` cell, let one
 *    `browser-matrix` cell go stale, and a count-only gate sees 22 = 22 while
 *    the matrix has quietly swapped a blocked-on-the-owner gap for a lane that
 *    stopped running. The message names the component and the kind, because
 *    "the matrix got staler" is not actionable.
 *
 * Pure, and exported: the seeded-increase proof in the TASK-S1-O2 handoff drives
 * this function directly rather than mutating the tracked artifact.
 */
export function checkStaleRatchet(
  matrix: CapabilityMatrix,
  ceilings: CapabilityCeilings,
): CapabilityViolation[] {
  const out: CapabilityViolation[] = []
  const allowed = new Set(ceilings.staleCellKinds.kinds)
  const stale = matrix.rows.flatMap(r =>
    r.cells.filter(c => c.state === 'stale').map(c => ({ component: r.component, kind: c.kind })))

  for (const s of stale) {
    if (allowed.has(s.kind))
      continue
    out.push({
      rule: 'stale-ratchet',
      level: 'error',
      message: `${s.component} / \`${s.kind}\` is stale, and \`${s.kind}\` is not a kind this `
        + `repository has accepted as un-re-runnable. Allowed: `
        + `${[...allowed].map(k => `\`${k}\``).join(', ')}. Re-run the owning lane and `
        + `regenerate. If the lane genuinely cannot run, add the kind to \`staleCellKinds\` in `
        + `packages/tooling/src/validators/capability-matrix-ceilings.json WITH the reason — `
        + `never to make a red run green.`,
    })
  }

  const { ceiling } = ceilings.staleCells
  if (stale.length > ceiling) {
    out.push({
      rule: 'stale-ratchet',
      level: 'error',
      message: `${stale.length} stale cell(s), above the ceiling of ${ceiling}. Ratchets move one `
        + `way only. A stale cell is worse than an unrun one: it reports a result measured `
        + `against source that has since changed, and the table prints it beside a pass. `
        + `Re-run the owning lane; do not raise the ceiling.`,
    })
  }
  else if (stale.length < ceiling) {
    out.push({
      rule: 'stale-ratchet',
      level: 'error',
      message: `stale cells fell to ${stale.length} (ceiling ${ceiling}). Lower `
        + `\`staleCells.ceiling\` in packages/tooling/src/validators/capability-matrix-ceilings.json `
        + `to ${stale.length} in the same change, so the ground gained is recorded and cannot be `
        + `silently re-spent.`,
    })
  }
  return out
}

/**
 * Every evidence kind the matrix publishes a cell of, in any state.
 *
 * Distinct from "a kind with credit": `at-manual` publishes 89 cells and holds
 * zero `pass` and zero `present`, and a record entry of `{0, 0}` is how the gate
 * notices the day it earns some. What must not pass unnoticed is the kind
 * vanishing from the model altogether, and only this set can see that.
 */
export function publishedKinds(matrix: CapabilityMatrix): Set<string> {
  const out = new Set<string>()
  for (const row of matrix.rows) {
    for (const cell of row.cells)
      out.add(cell.kind)
  }
  return out
}

/** Every kind's `pass`/`present` count in this matrix, kinds with none included. */
export function tallyEvidenceCells(
  matrix: CapabilityMatrix,
  known: readonly string[] = [],
): Map<string, EvidenceKindRecord> {
  const out = new Map<string, EvidenceKindRecord>()
  for (const kind of known)
    out.set(kind, { pass: 0, present: 0 })
  for (const row of matrix.rows) {
    for (const cell of row.cells) {
      const rec = out.get(cell.kind) ?? { pass: 0, present: 0 }
      if (cell.state === 'pass')
        rec.pass++
      else if (cell.state === 'present')
        rec.present++
      out.set(cell.kind, rec)
    }
  }
  return out
}

/**
 * The corrected `evidenceCells` block, ready to paste.
 *
 * Exported and printed by the CLI on any violation, because the whole objection
 * to a ratchet on `pass` is that it makes an honest correction expensive. It is
 * not expensive if the gate hands you the replacement: RESIDUAL-16 legitimately
 * removed 27 false `pass` cells, and the cost of declaring that must be one
 * paste plus one line in `//moves`, not an afternoon of arithmetic.
 */
export function evidenceBlockFor(tally: Map<string, EvidenceKindRecord>): string {
  const names = [...tally.keys()].sort()
  const pass = names.reduce((n, k) => n + tally.get(k)!.pass, 0)
  const present = names.reduce((n, k) => n + tally.get(k)!.present, 0)
  const lines = names.map(k =>
    `      "${k}": { "pass": ${tally.get(k)!.pass}, "present": ${tally.get(k)!.present} }`)
  return `    "totals": { "pass": ${pass}, "present": ${present} },\n`
    + `    "kinds": {\n${lines.join(',\n')}\n    }`
}

/**
 * Gate 8 — the evidence ratchet on `pass` and `present`, per kind (RESIDUAL-17,
 * closing `D-RES16-3` option (a)).
 *
 * Gate 7 holds `stale` with a ceiling. A ceiling is one-way by nature: a fall is
 * good news and only has to be *recorded*. `pass` and `present` are not like
 * that, and this is the whole reason the gate exists:
 *
 *  - a **rise** can be a loosened predicate crediting cells nothing exercised.
 *    Measured, not hypothesised: RESIDUAL-16 found `storyCheck` reading "absent
 *    from the failing set" as "passed", so **27** `state-stories` cells published
 *    `pass` for a check that had never been asked of them, each with a story file
 *    printed beside it as the evidence.
 *  - a **fall** can be a regression quietly dropping real evidence — an a11y spec
 *    losing its `axe(` call, a story losing an export, a lane that stopped running.
 *
 * So neither direction is free, and a move of either kind must be **declared** by
 * editing that kind's entry in `capability-matrix-ceilings.json` in the same
 * change. That is the existing `staleCells.ceiling` handshake; what is new is that
 * it points both ways.
 *
 * Three clauses:
 *
 *  1. **per kind, per state, both directions** — the message names the kind, the
 *     state, the direction and the delta, because "`pass` moved" is not
 *     actionable. Per kind for the reason `staleCellKinds` is per kind: a single
 *     total of 558 is equally satisfied by trading 27 real passes in one column
 *     for 27 invented ones in another.
 *  2. **the kind set is pinned** — a kind the matrix publishes that the record
 *     does not know is an error, and so is a recorded kind the matrix no longer
 *     publishes. A new evidence column arriving with credit already in it is the
 *     one shape clause 1 cannot see.
 *  3. **`totals` must equal the sum of `kinds`** — so the headline a report
 *     quotes cannot drift from the table underneath it. `runtime-floor-ceilings`
 *     uses the same device for the same reason.
 *
 * Pure and exported: the seeded proofs in the RESIDUAL-17 handoff drive it
 * directly, and the CLI additionally seeds them end to end through
 * `DZUP_CAPABILITY_CEILINGS`.
 */
export function checkEvidenceRatchet(
  matrix: CapabilityMatrix,
  ceilings: CapabilityCeilings,
): CapabilityViolation[] {
  const out: CapabilityViolation[] = []
  const record = ceilings.evidenceCells
  const recorded = Object.entries(record.kinds).filter(([k]) => !k.startsWith('//'))
  const tally = tallyEvidenceCells(matrix, recorded.map(([k]) => k))
  const published = publishedKinds(matrix)
  const where = 'packages/tooling/src/validators/capability-matrix-ceilings.json'

  // Clause 2 — the kind set, in both directions. Reported first: an unrecorded
  // kind makes every count below it meaningless, and the remedy is different.
  for (const kind of published) {
    if (record.kinds[kind] !== undefined)
      continue
    const got = tally.get(kind)!
    out.push({
      rule: 'evidence-ratchet',
      level: 'error',
      message: `\`${kind}\` is an evidence kind the matrix publishes and \`evidenceCells.kinds\` `
        + `does not record — it holds ${got.pass} \`pass\` and ${got.present} \`present\` cell(s) `
        + `that nothing has ever accepted. A new column arriving with credit already in it is `
        + `exactly the shape a per-kind count cannot see. Add `
        + `"${kind}": { "pass": ${got.pass}, "present": ${got.present} } to ${where} in the same `
        + `change that introduces the kind, WITH a line in \`//moves\` saying what evidences it.`,
    })
  }
  for (const [kind] of recorded) {
    if (published.has(kind))
      continue
    out.push({
      rule: 'evidence-ratchet',
      level: 'error',
      message: `\`${kind}\` is recorded in \`evidenceCells.kinds\` and the matrix no longer `
        + `publishes a cell of it in ANY state. A column that disappears takes its evidence with `
        + `it, and a zero count cannot tell "nobody has produced this yet" from "the row is gone". `
        + `Remove the entry from ${where} in the same change that removes the kind, with the `
        + `reason.`,
    })
  }

  // Clause 1 — per kind, per state, both directions. Skipped for a kind the
  // matrix has stopped publishing: it has already been reported above, and
  // printing `FELL 2 → 0` beside it would send a reader to fix the count.
  for (const [kind, want] of recorded) {
    const got = tally.get(kind)
    if (got === undefined || !published.has(kind))
      continue
    for (const state of ['pass', 'present'] as const) {
      const delta = got[state] - want[state]
      if (delta === 0)
        continue
      const dir = delta > 0 ? 'ROSE' : 'FELL'
      const rose = `A rise is not automatically good news: the last time \`${state}\` rose in `
        + `this repository without anybody looking, 27 cells were crediting a check that had `
        + `never been asked of them (RESIDUAL-16). Show what exercises the new cell(s), then `
        + `record the rise.`
      const fell = `A fall is not automatically bad news — RESIDUAL-16's audit rightly removed `
        + `27 false \`pass\` cells — but it must be DECLARED rather than absorbed, so a reader `
        + `can tell a correction from a regression.`
      const why = delta > 0 ? rose : fell
      out.push({
        rule: 'evidence-ratchet',
        level: 'error',
        message: `\`${kind}\` / ${state} ${dir} ${want[state]} → ${got[state]} `
          + `(${delta > 0 ? '+' : ''}${delta}). ${why} Set `
          + `"${kind}": { "pass": ${got.pass}, "present": ${got.present} } in ${where} in the `
          + `SAME change, and add one line to \`//moves\`. Never edit it to make a red run green.`,
      })
    }
  }

  // Clause 3 — the recorded headline against the recorded table.
  const sum = recorded.reduce(
    (a, [, v]) => ({ pass: a.pass + v.pass, present: a.present + v.present }),
    { pass: 0, present: 0 },
  )
  for (const state of ['pass', 'present'] as const) {
    if (record.totals[state] === sum[state])
      continue
    out.push({
      rule: 'evidence-ratchet',
      level: 'error',
      message: `\`evidenceCells.totals.${state}\` records ${record.totals[state]} and the `
        + `per-kind entries sum to ${sum[state]}. The total is the number reports quote and the `
        + `table is what holds it; they may not disagree. Set it to ${sum[state]} in ${where}.`,
    })
  }
  return out
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

  // Gate 7 — the staleness ratchet (TASK-S1-O2).
  const ceilings = readCapabilityCeilings()
  const ceilingsOverride = process.env.DZUP_CAPABILITY_CEILINGS
  if ((ceilingsOverride ?? '') !== '') {
    console.warn(
      `!! stale-ratchet gate is running under an ENV OVERRIDE — this run proves nothing about `
      + `the tracked ceilings.\n   DZUP_CAPABILITY_CEILINGS=${ceilingsOverride}\n`,
    )
  }
  violations.push(...checkStaleRatchet(fresh, ceilings))

  // Gate 8 — the evidence ratchet on `pass` and `present` (RESIDUAL-17).
  const evidence = checkEvidenceRatchet(fresh, ceilings)
  violations.push(...evidence)

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
    console.warn(`\n  ${stale.length} stale cell(s) — ceiling ${ceilings.staleCells.ceiling}`
      + `${ceilings.staleCells.blockedOn === undefined
        ? ''
        : `, blocked on ${ceilings.staleCells.blockedOn}`}`)
    if (showAll) {
      for (const v of stale)
        console.warn(`    · ${v.message}`)
    }
  }

  // The unrun baseline is REPORTED, never gated (TASK-S1-O2). An unrun cell is
  // the gap this page exists to show; the number is printed next to its
  // recorded baseline so a rise is visible in the same breath as the stale gate
  // rather than discovered a programme later.
  const unrun = { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>
  for (const tier of ['A', 'B', 'C', 'D'] as const)
    unrun[tier] = fresh.totals[tier].unrun
  const unrunTotal = Object.values(unrun).reduce((a, b) => a + b, 0)
  const drift = unrunTotal - ceilings.unrunCells.baseline
  console.warn(
    `\n  unrun ${unrunTotal} (baseline ${ceilings.unrunCells.baseline}`
    + `${drift === 0 ? '' : `, ${drift > 0 ? '+' : ''}${drift}`}) · `
    + `${(['A', 'B', 'C', 'D'] as const).map(t => `${t} ${unrun[t]}`).join(' · ')}`
    + `\n    Reported, not gated: the three-bucket triage is in`
    + `\n    docs/program-2026-09-22-architecture/reports/TASK-S1-O2-matrix-state.md`,
  )

  // Gate 8's record, printed whether or not it fired (RESIDUAL-17). `pass` and
  // `present` are the numbers every report in this programme quotes, and until
  // this gate existed they had no baseline at all — so a change that removed 27
  // false `pass` cells and 15 false `present` cells passed 53 green links.
  const evTally = tallyEvidenceCells(fresh, Object.keys(ceilings.evidenceCells.kinds))
  const evPass = [...evTally.values()].reduce((n, r) => n + r.pass, 0)
  const evPresent = [...evTally.values()].reduce((n, r) => n + r.present, 0)
  console.warn(
    `\n  evidence ratchet (two-way, per kind): pass ${evPass} `
    + `(recorded ${ceilings.evidenceCells.totals.pass}) · present ${evPresent} `
    + `(recorded ${ceilings.evidenceCells.totals.present}) over `
    + `${evTally.size} kind(s)`,
  )

  if (errors.length === 0) {
    console.warn(`\n✓ capability-matrix: fresh, and no Tier D cell is unexplained.`)
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ [${v.rule}] ${v.message}`)
  // The corrected block, ready to paste. Printed only when gate 8 fired, and it
  // is the answer to the only real objection to ratcheting `pass`: that it makes
  // an honest audit expensive. One paste plus one line in `//moves` is the cost.
  if (evidence.length > 0) {
    console.error(
      `\nThe measured \`evidenceCells\` block, if every move above is one you MEANT `
      + `(replace \`totals\` and \`kinds\` in\n`
      + `packages/tooling/src/validators/capability-matrix-ceilings.json, and say why in `
      + `\`//moves\`):\n\n${evidenceBlockFor(evTally)}\n`,
    )
  }
  console.error(`\n${errors.length} capability-matrix violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
