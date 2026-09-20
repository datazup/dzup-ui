/**
 * Manual assistive-technology task matrix (TASK-OSS-P5-04).
 *
 * axe covers roughly half of WCAG, and none of the half that asks "does a
 * screen-reader user know what just happened". Neither this repository nor the
 * Pro one has ever carried a durable record of a human driving a component with
 * a screen reader, so "accessible" has meant "axe found nothing" — which is a
 * true statement about axe.
 *
 * This module owns the format. Each Tier B–D component gets one file under
 * `e2e/at-matrix/`, holding:
 *
 *   - a **generated header**: the AT/browser pairs, and the tasks its APG
 *     pattern implies, with the announcement each task expects;
 *   - an **append-only results table** a human edits, one row per run, carrying
 *     the AT version, the tester, the date, the result and the `sourceCommit`
 *     the run observed.
 *
 * Append-only matters more than it looks. A results table people overwrite
 * records the last opinion; one they append to records the history, and the
 * history is what says whether a regression is new. The validator enforces it
 * by treating rows as immutable once written: it only ever checks that the
 * newest row's commit is still current.
 *
 * **Nothing in here can mark a row passed.** The generator writes `unrun`, and
 * the only way a row says anything else is a human editing it after a run. A
 * tool that could write `pass` would be a tool that eventually does.
 */

import type { ApgPattern, RiskTier } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// The pairs
// ---------------------------------------------------------------------------

export interface AtPair {
  readonly id: string
  readonly at: string
  readonly browser: string
  readonly platform: string
  /** What this pairing is uniquely able to expose. */
  readonly purpose: string
}

/**
 * The six AT/browser pairings, from the reassessment's
 * `06-quality-accessibility-i18n-security-spec.md` §"Automation versus manual
 * evidence".
 *
 * Six rather than "a screen reader" because the pairings disagree: NVDA in
 * browse mode and NVDA in forms mode read the same DOM differently, JAWS
 * applies its own heuristics over ARIA, and VoiceOver on iOS reaches a control
 * by gesture rather than by tab. A component can be correct under one and
 * unusable under another, and a single-pair matrix cannot tell you which.
 */
export const AT_PAIRS: readonly AtPair[] = [
  {
    id: 'nvda-firefox',
    at: 'NVDA',
    browser: 'Firefox',
    platform: 'Windows',
    purpose: 'Browse/forms mode switching and the Gecko accessibility tree.',
  },
  {
    id: 'nvda-chrome',
    at: 'NVDA',
    browser: 'Chrome',
    platform: 'Windows',
    purpose: 'The same AT over Blink, where virtualized and composite widgets differ.',
  },
  {
    id: 'jaws-chrome',
    at: 'JAWS',
    browser: 'Chrome',
    platform: 'Windows',
    purpose: 'JAWS heuristics over ARIA, which override author intent more often.',
  },
  {
    id: 'voiceover-safari',
    at: 'VoiceOver',
    browser: 'Safari',
    platform: 'macOS',
    purpose: 'WebKit behaviour and rotor navigation.',
  },
  {
    id: 'voiceover-ios',
    at: 'VoiceOver',
    browser: 'Safari',
    platform: 'iOS',
    purpose: 'Touch exploration; a control reached by gesture, not by Tab.',
  },
  {
    id: 'talkback-android',
    at: 'TalkBack',
    browser: 'Chrome',
    platform: 'Android',
    purpose: 'Touch exploration, gestures and drag alternatives.',
  },
]

// ---------------------------------------------------------------------------
// The tasks
// ---------------------------------------------------------------------------

export interface AtTask {
  readonly id: string
  /** What the tester does. */
  readonly task: string
  /** What the AT must say for the task to pass. */
  readonly expect: string
}

const REACH: AtTask = {
  id: 'reach',
  task: 'Reach the component by the platform\'s own navigation (Tab, or swipe on touch).',
  expect: 'Name, role and current state are announced together, and the name is the visible label.',
}

const ACTIVATE: AtTask = {
  id: 'activate',
  task: 'Activate the control the way the AT recommends for its role.',
  expect: 'The action happens once, and any resulting state change is announced.',
}

const OPEN: AtTask = {
  id: 'open',
  task: 'Open the popup or panel from its trigger.',
  expect: 'The expanded state is announced and the AT moves into the new content.',
}

const NAVIGATE: AtTask = {
  id: 'navigate',
  task: 'Move through the collection with the pattern\'s own keys or gestures.',
  expect: 'Each item is announced with its position and set size, and nothing is skipped.',
}

const SELECT: AtTask = {
  id: 'select',
  task: 'Select an item and confirm the selection.',
  expect: 'The selected state is announced, and the control\'s value reflects it afterwards.',
}

const DISMISS: AtTask = {
  id: 'dismiss',
  task: 'Dismiss with Escape, and again by activating the close affordance.',
  expect: 'Focus returns to the trigger and the AT announces where it landed.',
}

const ERROR: AtTask = {
  id: 'error',
  task: 'Put the control into an invalid state and move away from it.',
  expect: 'The error text is announced and is programmatically associated with the control.',
}

const TYPEAHEAD: AtTask = {
  id: 'typeahead',
  task: 'Type the first characters of an item while the collection has focus.',
  expect: 'Focus moves to the matching item and it is announced.',
}

const NON_DRAG: AtTask = {
  id: 'non-drag',
  task: 'Perform the drag interaction without a pointer drag.',
  expect: 'A keyboard or single-pointer path exists, is discoverable, and narrates each step.',
}

const LIVE: AtTask = {
  id: 'live',
  task: 'Trigger the loading, empty and error states while focus is elsewhere.',
  expect: 'Each is announced without moving focus, exactly once.',
}

/**
 * The tasks each APG pattern implies.
 *
 * Derived from the pattern rather than from the component, so two comboboxes
 * cannot end up with two different definitions of "tested". A component adds
 * tasks through its traits (see {@link tasksFor}) and never through prose.
 */
const PATTERN_TASKS: Partial<Record<ApgPattern, readonly AtTask[]>> = {
  'accordion': [REACH, ACTIVATE, NAVIGATE],
  'alert': [LIVE],
  'alertdialog': [OPEN, REACH, ACTIVATE, DISMISS],
  'breadcrumb': [REACH, NAVIGATE],
  'button': [REACH, ACTIVATE],
  'carousel': [REACH, NAVIGATE, ACTIVATE, LIVE],
  'checkbox': [REACH, ACTIVATE],
  'combobox': [REACH, OPEN, NAVIGATE, TYPEAHEAD, SELECT, DISMISS, ERROR],
  'dialog': [OPEN, REACH, DISMISS],
  'disclosure': [REACH, ACTIVATE],
  'feed': [NAVIGATE, LIVE],
  'grid': [REACH, NAVIGATE, SELECT, LIVE],
  // REACH and ACTIVATE as well as NAVIGATE (TASK-R2-O2). A landmark's whole
  // purpose is to be *found* — by the AT's own landmark command (NVDA/JAWS `d`,
  // VoiceOver rotor), not by tabbing to it — and whether it is announced with
  // its accessible name when reached is the first thing a screen-reader user
  // discovers about it. What a navigation landmark then contains is links, and a
  // link is activated: the `aria-current="page"` contract, which is the one
  // stateful thing a set of page links owes, is only observable by following one
  // and listening to what the next page announces. The one-task version could
  // express neither, which is part of why `DzSidebar` was mis-declared
  // `treeview` — the honest pattern looked too thin to describe the component.
  'landmarks': [REACH, NAVIGATE, ACTIVATE],
  'link': [REACH, ACTIVATE],
  'listbox': [REACH, NAVIGATE, TYPEAHEAD, SELECT],
  'menu': [OPEN, NAVIGATE, TYPEAHEAD, ACTIVATE, DISMISS],
  'menubar': [REACH, NAVIGATE, OPEN, ACTIVATE, DISMISS],
  'menu-button': [REACH, OPEN, NAVIGATE, ACTIVATE, DISMISS],
  'meter': [REACH],
  'radio-group': [REACH, NAVIGATE, SELECT],
  'slider': [REACH, NAVIGATE, ERROR],
  'slider-multithumb': [REACH, NAVIGATE, ERROR],
  'spinbutton': [REACH, NAVIGATE, ERROR],
  'switch': [REACH, ACTIVATE],
  'table': [REACH, NAVIGATE],
  'tabs': [REACH, NAVIGATE, ACTIVATE],
  'toolbar': [REACH, NAVIGATE, ACTIVATE],
  'tooltip': [REACH, DISMISS],
  'treegrid': [REACH, NAVIGATE, SELECT, TYPEAHEAD],
  'treeview': [REACH, NAVIGATE, SELECT, TYPEAHEAD],
  'window-splitter': [REACH, NAVIGATE],
}

/** The default when a component declares `custom` or `none`. */
const BASELINE_TASKS: readonly AtTask[] = [REACH, ACTIVATE]

/**
 * A pattern-derived task one named component provably has no surface for.
 *
 * **Why an opt-out exists at all (TASK-R2-O2, closing N1-O4 §3d QA2).** Tasks
 * are derived from the APG pattern rather than from the component, on purpose —
 * two comboboxes must not end up with two definitions of "tested". But a pattern
 * is a generalisation, and a generalisation occasionally names an obligation one
 * member cannot hold: `DzCommandPalette` is a `combobox`, and `combobox` implies
 * an `error` task, and the command palette has no invalid state, no error
 * message and no required semantics. There is nothing for a tester to drive.
 *
 * Before this, the only outlets were both lies. `unrun` means *the AT or the
 * device was not available* — a different fact, and one that would sit in the
 * denominator for ever. `fail` means *a human drove it and it did not work*,
 * which is worse. N1-O4 routed around it with prose in the generated script
 * ("write `not applicable` in the notes"), the only such step in all 126: a
 * human instruction, invisible to every gate, that no artifact could count.
 *
 * So the waiver is declared here, machine-readably, with a reason that travels
 * with it. Three properties make it a contract rather than an escape hatch:
 *
 * 1. **It is per-component *and* per-task.** It cannot silence a whole pattern.
 * 2. **It is printed.** {@link optedOutTasksFor} feeds the generated header, so
 *    a reader of the scaffold sees what was excluded and why. A dropped
 *    obligation nobody can see is how a matrix stops meaning anything.
 * 3. **It narrows nothing else.** The component still owes every other task its
 *    pattern implies, on every pairing its tier requires.
 *
 * Adding an entry is a claim about a component's *surface*, checkable by
 * opening it. It is not a place to record that a task is hard, or unimplemented,
 * or failing — those are `fail`, and they belong in a run record.
 */
export interface AtTaskOptOut {
  readonly task: string
  readonly why: string
}

/**
 * The per-component task waivers. See {@link AtTaskOptOut} for the rules.
 *
 * Deliberately tiny, and deliberately reviewed as a whole: if this table grows
 * past a handful of entries, the patterns are wrong, not the components.
 */
export const AT_TASK_OPT_OUTS: Readonly<Record<string, readonly AtTaskOptOut[]>> = {
  DzCommandPalette: [
    {
      task: 'error',
      why: 'The `combobox` pattern implies an `error` task. A command palette has no validation '
        + 'surface of any kind — no invalid state, no error message, no required semantics — so '
        + 'there is no interaction for a tester to drive and nothing for an AT to announce. '
        + 'Verified against DzCommandPalette.types.ts, which declares no validation prop, and the '
        + 'component\'s stories, none of which can reach an invalid state. N1-O4 §3d QA2.',
    },
  ],
}

/** The waivers declared for one component, or none. */
export function optedOutTasksFor(component: string | undefined): readonly AtTaskOptOut[] {
  return component === undefined ? [] : AT_TASK_OPT_OUTS[component] ?? []
}

/**
 * The tasks one component owes: its pattern's, plus the ones its traits and
 * its form semantics add, minus any {@link AT_TASK_OPT_OUTS} waiver.
 *
 * `component` is optional so that callers reasoning about a *pattern* rather
 * than a component (the docs, the pairing packet) get the unwaived set. Every
 * caller that writes or validates a scaffold file passes it.
 */
export function tasksFor(input: {
  pattern: ApgPattern
  traits: readonly string[]
  wcag: readonly string[]
  component?: string
}): readonly AtTask[] {
  const tasks = new Map<string, AtTask>()
  for (const task of PATTERN_TASKS[input.pattern] ?? BASELINE_TASKS)
    tasks.set(task.id, task)
  if (input.traits.includes('drags'))
    tasks.set(NON_DRAG.id, NON_DRAG)
  if (input.traits.includes('dataset'))
    tasks.set(LIVE.id, LIVE)
  // A component that owes 3.3.1 Error Identification owes the announcement of
  // it, whatever its pattern is. A 3.3.1 obligation is a real validation
  // surface, so it outranks a waiver rather than being silenced by one.
  if (input.wcag.includes('3.3.1')) {
    tasks.set(ERROR.id, ERROR)
  }
  else {
    for (const optOut of optedOutTasksFor(input.component))
      tasks.delete(optOut.task)
  }
  return [...tasks.values()]
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * What a results row can say.
 *
 * `unrun` is the generated default and is a first-class outcome, not a
 * placeholder: it means the AT or the device was not available, which is a
 * different fact from `fail` and must not be laundered into one. `blocked`
 * means the run started and could not finish.
 */
export type AtResult = 'unrun' | 'pass' | 'fail' | 'partial' | 'blocked'

export const AT_RESULTS: readonly AtResult[] = ['unrun', 'pass', 'fail', 'partial', 'blocked']

/**
 * A row covering every task at once, rather than one named task.
 *
 * This is the value the generator writes into the scaffold's `task` column, and
 * the only value a row may carry while its `result` is `unrun`. It exists so
 * that "nobody has run this pairing" stays one row rather than expanding into
 * one row per task, which would inflate an all-unrun matrix from 534 cells to
 * several thousand and bury the first real record in it.
 */
export const ALL_TASKS = '*'

export interface AtResultRow {
  readonly pair: string
  /**
   * The task id this run covers, or {@link ALL_TASKS}.
   *
   * **Added by TASK-R2-O2, closing N1-O4 finding A1.** The generated header has
   * always instructed testers to *"append one row per `{task, pair}` you
   * actually drove"*, and the row had no task column to put one in. A per-task
   * record was therefore unrepresentable: two rows for the same pairing parsed
   * as two runs of the whole component, and `index.json` counted them as two
   * executed cells. The scripts papered over it by redefining the unit as one
   * row per `{component, pair}` with the failing step named in prose — which
   * meant a component with eight tasks and one broken one produced a single
   * `fail` no artifact could attribute, and a re-test of that one task could not
   * be recorded without restating the other seven.
   *
   * With the column, a run record says which of the 126 scripted steps it is
   * evidence about, `validate:at-matrix` checks the id against the tasks the
   * component actually owes, and {@link resolveAtManual} can require that every
   * task passed before it calls a pairing passed.
   */
  readonly task: string
  readonly result: AtResult
  /** AT and browser versions, or `-` when unrun. */
  readonly versions: string
  readonly tester: string
  /** ISO date, or `-` when unrun. */
  readonly date: string
  /** Repository HEAD the run observed, or `-` when unrun. */
  readonly sourceCommit: string
  readonly notes: string
}

export interface AtMatrixEntry {
  readonly component: string
  readonly tier: RiskTier
  readonly pattern: ApgPattern
  readonly file: string
  readonly tasks: readonly string[]
  /**
   * The pairings this component's tier requires before its `at-manual` cell can
   * read `pass` — `requiredAtPairs(tier)` from `@dzup-ui/contracts`.
   *
   * Every component still carries a row for all six pairings; this says which of
   * them hold its evidence state hostage. See `TIER_AT_PAIR_INCREMENT`.
   */
  readonly requiredPairs: readonly string[]
  readonly rows: readonly AtResultRow[]
  /**
   * The commit that last touched the component's source, from git. Compared
   * against each row's `sourceCommit` to decide staleness.
   */
  readonly componentCommit: string
}

export interface AtMatrixIndex {
  readonly schemaVersion: string
  readonly generatedFrom: readonly string[]
  readonly pairs: readonly AtPair[]
  readonly entries: readonly AtMatrixEntry[]
}

/**
 * `1.1.0` — TASK-R2-O2 added the per-row `task` column and the per-entry
 * `requiredPairs`. Additive: every 1.0.0 reader still finds every field it knew
 * about, and a 1.0.0 row is read as {@link ALL_TASKS}.
 */
export const AT_MATRIX_SCHEMA_VERSION = '1.1.0'

// ---------------------------------------------------------------------------
// Cell resolution — the one place a run record becomes an evidence state
// ---------------------------------------------------------------------------

/** What {@link resolveAtManual} concluded, and why. */
export interface AtCellResolution {
  readonly state: 'pass' | 'fail' | 'present' | 'stale' | 'unrun'
  readonly note: string
}

/**
 * Resolve one component's append-only AT run records into the single evidence
 * state the capability matrix publishes for its `at-manual` row.
 *
 * **This function is the fix for TASK-N1-O4 §6.2.** The logic it replaces lived
 * inline in `generate-capability-matrix.ts` and read, in full:
 *
 * ```ts
 * const executed = entry.rows.filter(r => r.result !== 'unrun')
 * const stale = executed.some(r => !isCurrent(r.sourceCommit, entry.componentCommit))
 * return { state: stale ? 'stale' : 'pass' }
 * ```
 *
 * `executed` counted rows; nothing ever read `result`. A component whose every
 * pairing a human had recorded as `fail` therefore published `pass` — measured,
 * not theorised, in N1-O4 §6.2's proof table, which also showed all-`blocked`
 * resolving to `pass` and one `pass` out of six pairings resolving to `pass`
 * with the `1/6` surviving only in a note string no totals table reads.
 *
 * It is a pure function taking data rather than a branch inside a generator so
 * that the seeded regression (`at-matrix.spec.ts`, "an all-fail run resolves to
 * fail, never pass") drives the same code path the generator does. The defect
 * was latent for a year because the only way to exercise it was to build a whole
 * capability matrix around a synthetic index.
 *
 * The resolution order, strongest claim last, and never resolving upward:
 *
 * 1. **No entry, or no executed row** → `unrun`. Nothing was driven.
 * 2. **Any `fail` or `partial`** → `fail`. A `partial` is a run in which at
 *    least one expectation was not met; the tester chose it over `fail` to say
 *    how much* broke, not *whether* something did, and `pass requires every
 *    step passed` admits neither.
 * 3. **Any `blocked`, nothing failed** → `present`. The run started and could
 *    not finish, so an artifact exists and nothing in it proves green — which is
 *    exactly what `present` has always meant.
 * 4. **Everything passed, but not everything was driven** → `present`. A
 *    component qualifies when every pairing its *tier* requires has a pass for
 *    every task it owes. One pairing out of three is real evidence and is not
 *    qualification, and this is the half of the defect that survives even after
 *    `fail` exists.
 * 5. **Complete, and some evidence predates the component's last change** →
 *    `stale`. A pass about different code.
 * 6. **Complete and current** → `pass`.
 *
 * Note that `fail` outranks `stale`. A failure recorded against older code is
 * still the last thing anybody observed; demoting it to the neutral-reading
 * `stale` would launder it exactly as `pass` did. The note carries the staleness
 * so the reader can see both.
 *
 * @param entry The component's scaffold entry, with its append-only rows.
 * @param requiredPairs The pairings this component's tier requires, from
 *   `requiredAtPairs(tier)` in `@dzup-ui/contracts`.
 * @param isCurrent Staleness predicate — `(rowCommit, componentCommit) => bool`.
 *   Injected rather than imported so this module stays free of git.
 */
export function resolveAtManual(
  entry: AtMatrixEntry,
  requiredPairs: readonly string[],
  isCurrent: (rowCommit: string, componentCommit: string) => boolean,
): AtCellResolution {
  const total = entry.rows.length
  const executed = entry.rows.filter(r => r.result !== 'unrun')

  if (executed.length === 0)
    return { state: 'unrun', note: `${total} AT/browser pairs, none executed.` }

  const failed = executed.filter(r => r.result === 'fail' || r.result === 'partial')
  const staleRows = executed.filter(r => !isCurrent(r.sourceCommit, entry.componentCommit))
  const staleNote = staleRows.length === 0
    ? ''
    : ` ${staleRows.length} of them predate the component's last change.`

  if (failed.length > 0) {
    const where = [...new Set(failed.map(r => `${r.pair}/${r.task}`))].sort().join(', ')
    return {
      state: 'fail',
      note: `${failed.length} of ${executed.length} executed run(s) did not pass: ${where}.${
        staleNote}`,
    }
  }

  const blocked = executed.filter(r => r.result === 'blocked')
  if (blocked.length > 0) {
    return {
      state: 'present',
      note: `${executed.length}/${total} run(s) recorded; ${blocked.length} blocked before `
        + `finishing, so nothing here proves the component green.${staleNote}`,
    }
  }

  // Everything recorded passed. Qualification is a coverage question now: every
  // task the component owes, on every pairing its tier requires.
  const passedBy = new Map<string, Set<string>>()
  for (const row of executed) {
    if (row.result !== 'pass')
      continue
    const tasks = passedBy.get(row.pair) ?? new Set<string>()
    tasks.add(row.task)
    passedBy.set(row.pair, tasks)
  }

  const gaps: string[] = []
  for (const pair of requiredPairs) {
    const covered = passedBy.get(pair)
    if (covered === undefined) {
      gaps.push(`${pair} (not run)`)
      continue
    }
    if (covered.has(ALL_TASKS))
      continue
    const missing = entry.tasks.filter(t => !covered.has(t))
    if (missing.length > 0)
      gaps.push(`${pair} (${missing.join(', ')})`)
  }

  if (gaps.length > 0) {
    return {
      state: 'present',
      note: `${executed.length}/${total} run(s) recorded and all passed, but this `
        + `Tier ${entry.tier} component requires ${requiredPairs.join(', ')} and these are `
        + `incomplete: ${gaps.join('; ')}.${staleNote}`,
    }
  }

  if (staleRows.length > 0) {
    return {
      state: 'stale',
      note: `${executed.length}/${total} run(s) passed across every required pairing, but `
        + `${staleRows.length} predate the component's last change (${entry.componentCommit.slice(0, 8)}). `
        + `A pass about different code.`,
    }
  }

  return {
    state: 'pass',
    note: `${executed.length}/${total} run(s) passed, covering every task on every pairing `
      + `Tier ${entry.tier} requires (${requiredPairs.join(', ')}).`,
  }
}
