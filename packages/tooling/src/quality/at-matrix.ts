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
  'landmarks': [NAVIGATE],
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
 * The tasks one component owes: its pattern's, plus the ones its traits and
 * its form semantics add.
 */
export function tasksFor(input: {
  pattern: ApgPattern
  traits: readonly string[]
  wcag: readonly string[]
}): readonly AtTask[] {
  const tasks = new Map<string, AtTask>()
  for (const task of PATTERN_TASKS[input.pattern] ?? BASELINE_TASKS)
    tasks.set(task.id, task)
  if (input.traits.includes('drags'))
    tasks.set(NON_DRAG.id, NON_DRAG)
  if (input.traits.includes('dataset'))
    tasks.set(LIVE.id, LIVE)
  // A component that owes 3.3.1 Error Identification owes the announcement of
  // it, whatever its pattern is.
  if (input.wcag.includes('3.3.1'))
    tasks.set(ERROR.id, ERROR)
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

export interface AtResultRow {
  readonly pair: string
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

export const AT_MATRIX_SCHEMA_VERSION = '1.0.0'
