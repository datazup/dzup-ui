/**
 * Risk-tier assignment for every public Core component (TASK-OSS-P5-01).
 *
 * The rules live in `@dzup-ui/contracts` `quality-tiers.ts`; this file is the
 * only place that says which rule applies to which component, and
 * `generate-quality-matrix.ts` joins the two into
 * `packages/core/docs/quality-matrix.json`.
 *
 * **Why this is handwritten when the rest of the ownership pipeline is
 * generated.** Every other inventory in this repository is derived, because the
 * fact it records already exists in source and copying it by hand is how the
 * copies drift. A risk tier is not in the source: nothing in `DzSelect.vue`
 * distinguishes "listbox with a value" from "presentational badge" in the way
 * the tier means, and a heuristic that guessed — role attributes, file size,
 * Reka imports — would produce a number nobody could argue with and nobody
 * should trust. So the assignment is a review artifact with a name and a date,
 * and the *validator* is what keeps it honest: it fails when a public component
 * is missing, when a component that no longer exists is still listed, and when
 * a component's own anatomy declares a different tier from the one here.
 *
 * The four traits and the security boundary are different — they are facts
 * about source, and the validator checks them against it. See
 * `validators/quality-tiers.ts`.
 *
 * Assigned 2026-08-24 against ownership manifest `1.1.0`, 144 public
 * components.
 */

import type {
  ApgPattern,
  ComponentTrait,
  RiskTier,
  SecurityBoundary,
} from '@dzup-ui/contracts'

/** One component's assignment. Every field but `tier` and `pattern` is optional. */
export interface TierAssignment {
  readonly tier: RiskTier
  /**
   * The APG pattern the component implements, or `none` when it has no
   * interactive pattern, or `custom` when APG does not describe it.
   */
  readonly pattern: ApgPattern
  /**
   * Why this pattern. Required by the validator when `pattern` is `custom`, and
   * when `tier` is C or D.
   */
  readonly why?: string
  /**
   * Data boundaries the component crosses. Defaults to `none`.
   *
   * A single value or a set (TASK-R2-O4). The set exists because `DzQRCode`
   * crosses two — it encodes an arbitrary `value` into a machine-readable code
   * AND renders a host-supplied `icon` as an `<img src>` — and a single value
   * meant the second sink could not be declared at all (finding U3). The
   * fourteen components that cross exactly one keep the scalar: a list of one
   * is noise in a file whose job is to be read.
   */
  readonly boundary?: SecurityBoundary | readonly SecurityBoundary[]
  /** Required by the validator whenever `boundary` is set and not `none`. */
  readonly boundaryWhy?: string
  /** Behaviours that add evidence rows on their own. */
  readonly traits?: readonly ComponentTrait[]
  /** WCAG 2.2 criteria beyond the ones the tier and traits already imply. */
  readonly wcag?: readonly string[]
  /**
   * Evidence rows this component provably cannot produce, keyed by
   * `EvidenceKind`, valued by the reason.
   *
   * The row is NOT removed — the capability matrix still prints the cell, with
   * this reason where the artifact link would be. That is the difference
   * between an exception and a deletion, and it is the whole point: a deleted
   * row looks like a row nobody ever owed.
   */
  readonly exceptions?: Readonly<Record<string, string>>
}

const NO_FOCUSABLE_NODE = 'Renders no focusable node of its own; its browser evidence is the '
  + 'SSR/hydration fixture rather than a keyboard sequence.'

/**
 * `controlled-uncontrolled` — the reason a component with no bound value cannot
 * exhibit the row (TASK-S1-O2, 2026-09-22).
 *
 * The row measures one thing: does the unit spec drive the SAME value through a
 * host-owned path (`v-model` / `update:<name>`) and through a component-owned
 * one? A component that exposes no two-way binding cannot exhibit the pair —
 * there is no value for a host to take ownership of, so there is no second path
 * to compare the first against, and an `unrun` cell there reads as work nobody
 * has got to rather than work nobody owes.
 *
 * The universal half of every reason below was **measured**, not asserted: at
 * `4e4e46f`, over each component's SFC and its `.types.ts`, no `defineModel()`
 * and no `update:<name>` emit paired with a prop of the same name. The day one
 * of them gains a `defineModel`, this reason becomes false and the cell it
 * covers becomes a real gap — which is exactly what an exception with a
 * falsifiable reason is for, and why the row is still printed rather than
 * deleted.
 */
function noValueToControl(surface: string): string {
  return 'No two-way binding to exercise: no `defineModel()` and no `update:<name>` emit paired '
    + 'with a prop of the same name, so a host cannot take ownership of a value from it. '
    + `${surface} (Measured 2026-09-22 at \`4e4e46f\`; a \`defineModel\` added here invalidates `
    + 'this exception.)'
}

/**
 * `axe` — the reason a component that renders no element of its own cannot
 * exhibit the row (TASK-S1-O2, 2026-09-22).
 *
 * The row measures an axe scan of the component's OWN rendered output. A
 * renderless component contributes no node, so a scan over it audits the host's
 * markup and attributes the result to something that produced none of it — the
 * rule it would test is the host's to satisfy. This is the same argument the
 * `token-contrast` exception already recorded for these three components makes
 * about colour pairs, one level up.
 */
const RENDERS_NO_DOM = 'The axe row measures a scan of the component\'s own rendered output, and '
  + 'this component renders no element of its own — only the slot it is handed. A scan over it '
  + 'audits the HOST\'s markup and credits a component that contributed no node; the rule it '
  + 'would test is the host\'s to satisfy. (Same argument as the `token-contrast` exception '
  + 'already recorded here, one level up.)'

/**
 * Component → assignment.
 *
 * Grouped by family, alphabetical within each, so a reviewer reads it in the
 * same order as `packages/core/src/components/`.
 */
export const COMPONENT_TIERS: Readonly<Record<string, TierAssignment>> = {
  // -------------------------------------------------------------------------
  // buttons
  // -------------------------------------------------------------------------
  DzButton: {
    tier: 'B',
    pattern: 'button',
    boundary: 'url',
    boundaryWhy: 'An `href` prop renders an anchor, so a host-supplied URL becomes a navigation. '
      + '`javascript:` and `data:` are the sinks a URL policy has to close.',
    wcag: ['2.5.3', '3.2.6'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It forwards `click`, `focus` and `blur`; `disabled` and `loading` are one-way '
        + 'appearance props.',
      ),
    },
  },
  DzButtonGroup: { tier: 'A', pattern: 'none' },
  DzCopyButton: {
    tier: 'B',
    pattern: 'button',
    // The clipboard write is a host-observable side effect, but it moves data
    // outward rather than accepting it, so it is not a boundary in the sense
    // `SecurityBoundary` means.
    wcag: ['4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It emits `copied` after writing to the clipboard; no value is round-tripped.'),
    },
  },
  DzFab: {
    tier: 'B',
    pattern: 'button',
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It forwards `click`, `focus` and `blur`; every other prop is one-way appearance.'),
    },
  },
  DzIconButton: {
    tier: 'B',
    pattern: 'button',
    wcag: ['2.5.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It forwards `click`, `focus` and `blur`; every other prop is one-way appearance.'),
    },
  },
  DzSpeedDial: {
    tier: 'B',
    pattern: 'menu-button',
    // `teleports` because each fanned-out action carries a `DzTooltip`, whose
    // content leaves the DOM position it was written in.
    traits: ['dataset', 'teleports'],
    wcag: ['2.1.4'],
  },
  DzSplitButton: {
    tier: 'B',
    pattern: 'menu-button',
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It composes a button with a menu; the menu\'s open state belongs to '
        + '`DzSplitButtonMenu`.',
      ),
    },
  },
  DzToggleButton: { tier: 'B', pattern: 'button' },

  // -------------------------------------------------------------------------
  // cards
  // -------------------------------------------------------------------------
  DzCard: {
    tier: 'B',
    pattern: 'custom',
    why: 'A clickable card takes `role="button"` and a tabindex, which APG has no pattern for '
      + 'because the pattern it would resemble — button — is about a control, not a region that '
      + 'happens to activate. Tiered B for the focusable form; the static form is the same code.',
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It forwards `click`; every other prop is one-way appearance.'),
    },
  },
  DzImageCard: {
    tier: 'A',
    pattern: 'none',
    boundary: 'url',
    boundaryWhy: 'The `src` prop is a host-supplied URL that becomes a subresource load.',
  },
  DzStatCard: { tier: 'A', pattern: 'none' },

  // -------------------------------------------------------------------------
  // data
  // -------------------------------------------------------------------------
  DzAccordion: { tier: 'B', pattern: 'accordion' },
  DzAnimatedNumber: { tier: 'A', pattern: 'none', wcag: ['2.2.2', '4.1.3'] },
  DzCalendar: {
    tier: 'C',
    pattern: 'grid',
    why: 'A month grid with roving focus, range selection and locale-dependent week starts — '
      + 'the composite case APG models as a grid rather than as a set of buttons.',
    wcag: ['1.3.5', '2.1.4'],
  },
  DzChip: {
    tier: 'B',
    pattern: 'button',
    wcag: ['2.5.8'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It asks the host to remove it with `close` and never holds the removal.'),
    },
  },
  DzCodeBlock: {
    tier: 'A',
    pattern: 'none',
    // Renders `code` as text into `<pre><code>`, with no highlighter and no
    // HTML sink — checked at assignment time. If a syntax highlighter is ever
    // added this becomes `boundary: 'html'`.
    wcag: ['1.4.10'],
  },
  DzCountdown: { tier: 'A', pattern: 'none', wcag: ['2.2.1', '4.1.3'] },
  DzDataGrid: {
    tier: 'C',
    pattern: 'grid',
    why: 'Cell-level roving focus over a consumer-supplied dataset, with sort, selection and '
      + 'column state that interact.',
    traits: ['dataset', 'teleports'],
    wcag: ['1.3.2', '2.1.4', '4.1.3'],
  },
  DzDataView: {
    tier: 'C',
    pattern: 'custom',
    why: 'A layout switch over one collection: list and grid renderings of the same data with '
      + 'shared paging and selection. APG describes neither the switch nor the pair.',
    traits: ['dataset'],
    wcag: ['4.1.3'],
  },
  DzDescriptions: { tier: 'A', pattern: 'none', traits: ['dataset'] },
  DzInfiniteScroll: {
    tier: 'B',
    pattern: 'feed',
    traits: ['dataset'],
    wcag: ['2.2.2', '4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It asks the host for more rows with `loadMore`/`retry`; the collection stays the '
        + 'host\'s and is never mirrored here.',
      ),
    },
  },
  DzList: { tier: 'A', pattern: 'none', traits: ['dataset'] },
  DzListItem: { tier: 'B', pattern: 'custom', why: 'A list row that becomes focusable when the '
    + 'consumer makes it actionable; APG has a listbox option and a menu item, and this is '
    + 'neither — it stays a `listitem` and takes a tabindex.', exceptions: {
    'controlled-uncontrolled': noValueToControl(
      'It forwards `click`; selection belongs to the list that contains it.',
    ),
  } },
  DzOrderList: {
    tier: 'C',
    pattern: 'listbox',
    why: 'Reorder over a consumer-supplied collection, with three input paths (drag, control '
      + 'buttons, keyboard grab/move/drop) that must agree on one model.',
    traits: ['dataset', 'drags'],
    wcag: ['2.1.4', '4.1.3'],
  },
  DzTable: {
    tier: 'C',
    pattern: 'table',
    why: 'Several primitives share one sort and selection state, and column resize is a drag '
      + 'interaction; at realistic row counts correctness and speed stop being separable.',
    traits: ['dataset', 'drags'],
    wcag: ['1.3.2', '4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'Its emits are the `rowExpand`/`rowCollapse` notifications; sort, selection and '
        + 'expansion are the host\'s to hold, and `DzDataGrid` is the component that binds them.',
      ),
    },
  },
  DzTag: {
    tier: 'B',
    pattern: 'button',
    wcag: ['2.5.8'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It asks the host to remove it with `close` and never holds the removal.'),
    },
  },
  DzTimeline: { tier: 'A', pattern: 'none', traits: ['dataset'] },
  DzTimelineItem: { tier: 'A', pattern: 'none' },
  DzTree: {
    tier: 'C',
    pattern: 'treeview',
    why: 'Hierarchical roving focus with expand/collapse, typeahead and tri-state checkboxes '
      + 'over a consumer-supplied tree.',
    traits: ['dataset'],
    wcag: ['2.1.4'],
  },
  DzTreeItem: {
    tier: 'B',
    pattern: 'treeview',
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'Expansion and selection are `DzTree`\'s bound values (`expandedKeys`, `selectedKeys`, '
        + '`activeKey`); this renders one node of it.',
      ),
    },
  },

  // -------------------------------------------------------------------------
  // feedback
  // -------------------------------------------------------------------------
  DzAlert: { tier: 'A', pattern: 'alert', wcag: ['4.1.3'] },
  DzAsyncBoundary: {
    tier: 'A',
    pattern: 'none',
    wcag: ['4.1.3'],
    exceptions: {
      'token-contrast': 'Renders only the slot it is given; it ships no colour pair of its own.',
    },
  },
  DzBadge: { tier: 'A', pattern: 'none' },
  DzBlockUI: {
    tier: 'B',
    pattern: 'custom',
    why: 'A modal mask that blocks interaction without being a dialog: nothing inside it takes '
      + 'focus, and the point is that focus cannot reach what it covers.',
    traits: ['teleports'],
    wcag: ['4.1.3'],
  },
  DzEmpty: { tier: 'A', pattern: 'none', wcag: ['4.1.3'] },
  DzErrorBoundary: {
    tier: 'A',
    pattern: 'none',
    wcag: ['4.1.3'],
    exceptions: {
      'token-contrast': 'Renders only the slot it is given; it ships no colour pair of its own.',
    },
  },
  DzMeterGroup: { tier: 'A', pattern: 'meter', wcag: ['1.4.1'] },
  DzNotification: {
    tier: 'B',
    pattern: 'alert',
    wcag: ['2.2.1', '4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It reports `close` and `action`; whether it is on screen is the host\'s `v-if`.'),
    },
  },
  DzProgress: { tier: 'A', pattern: 'none', wcag: ['4.1.3'] },
  DzResult: { tier: 'A', pattern: 'none', wcag: ['4.1.3'] },
  DzRunStatusBadge: { tier: 'A', pattern: 'none', wcag: ['1.4.1', '4.1.3'] },
  DzScrollProgress: { tier: 'A', pattern: 'none' },
  DzSkeleton: { tier: 'A', pattern: 'none', wcag: ['2.2.2'] },
  DzSpinner: { tier: 'A', pattern: 'none', wcag: ['2.2.2', '4.1.3'] },
  DzToast: {
    tier: 'B',
    pattern: 'alertdialog',
    wcag: ['2.2.1', '4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It reports `close` and `action`; the queue is the host\'s.'),
    },
  },
  DzTokenProgressBar: { tier: 'A', pattern: 'none', wcag: ['1.4.1', '4.1.3'] },
  GovernanceBadge: { tier: 'A', pattern: 'none', wcag: ['1.4.1'] },
  TeamMemberBadge: { tier: 'A', pattern: 'none', wcag: ['1.4.1'] },

  // -------------------------------------------------------------------------
  // forms
  // -------------------------------------------------------------------------
  DzCascader: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A combobox whose popup is a column stack: each level filters the next, and the value '
      + 'is a path rather than an item.',
    traits: ['dataset', 'teleports'],
    wcag: ['1.3.5', '2.1.4', '3.3.2', '4.1.3'],
  },
  DzCheckbox: { tier: 'B', pattern: 'checkbox', wcag: ['3.3.2'] },
  DzCheckboxGroup: { tier: 'B', pattern: 'checkbox', wcag: ['3.3.1', '3.3.2'] },
  DzColorPicker: {
    tier: 'C',
    pattern: 'custom',
    why: 'A popover panel combining a saturation surface, hue and alpha sliders and a text '
      + 'field over one colour model. APG has no colour-picker pattern; the sliders inside it '
      + 'follow the slider pattern individually.',
    traits: ['teleports'],
    wcag: ['1.4.1', '3.3.2'],
  },
  DzCombobox: {
    tier: 'C',
    pattern: 'combobox',
    why: 'Filtering over a consumer-supplied collection with an autocomplete contract and a '
      + 'teleported popup — the composite the APG combobox pattern is written for.',
    traits: ['dataset', 'teleports'],
    wcag: ['1.3.5', '2.1.4', '3.3.2', '4.1.3'],
  },
  DzDatePicker: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A segmented date field plus a calendar grid, sharing one value across two very '
      + 'different keyboard contracts.',
    wcag: ['1.3.5', '3.3.1', '3.3.2', '3.3.7'],
  },
  DzDateRangePicker: {
    tier: 'C',
    pattern: 'combobox',
    why: 'As `DzDatePicker`, with a start/end pair whose ordering is itself a validation rule.',
    wcag: ['1.3.5', '3.3.1', '3.3.2', '3.3.7'],
  },
  DzFieldArray: {
    tier: 'B',
    pattern: 'custom',
    why: 'A renderless controller for add/remove/move over a repeated field group. It owns '
      + 'focus placement after a removal, which is the part that fails silently.',
    traits: ['dataset'],
    wcag: ['3.3.1', '4.1.3'],
    exceptions: {
      'axe': RENDERS_NO_DOM,
      'token-contrast': 'Renderless: it supplies scoped slot props and ships no styles.',
    },
  },
  DzFileUpload: {
    tier: 'D',
    pattern: 'button',
    why: 'The one Core component whose primary job is a data boundary: it reads files the user '
      + 'chooses, over both a picker and a drop target.',
    boundary: 'file',
    boundaryWhy: 'Reads user-chosen files. Size, type and count checks here are UX only — the '
      + 'documentation has to say that a server must revalidate and scan.',
    traits: ['drags'],
    wcag: ['2.5.1', '3.3.1', '3.3.2', '4.1.3'],
    // No exceptions. Both Tier D rows the cumulative ladder hands this
    // component were excepted until TASK-N1-O5 and are now real specs in
    // packages/core/security/. `url-policy` became the deny-all policy the
    // exception was really describing (an allowlist of zero schemes, asserted
    // against the whole corpus rather than believed); `csp-fixture` became a
    // strict-CSP conformance suite, which immediately found that the
    // exception's first clause -- "no inline style" -- was false: the template
    // root carried `style="contain: layout style"`, which `style-src-attr`
    // blocks. A tier rule whose only member is excepted from it is a rule that
    // does not exist.
  },
  DzFloatLabel: { tier: 'A', pattern: 'none', wcag: ['3.3.2'] },
  DzFormField: { tier: 'A', pattern: 'none', wcag: ['3.3.1', '3.3.2'] },
  DzInplace: {
    tier: 'B',
    pattern: 'custom',
    why: 'A display-to-edit toggle: the trigger is replaced by the editor it opens, so focus '
      + 'has to move into and back out of a node that did not exist a tick earlier. APG covers '
      + 'neither half of that.',
    wcag: ['3.3.2'],
  },
  DzKnob: {
    tier: 'B',
    pattern: 'slider',
    traits: ['drags'],
    wcag: ['3.3.2'],
  },
  DzListbox: {
    tier: 'B',
    pattern: 'listbox',
    traits: ['dataset'],
    wcag: ['2.1.4', '3.3.2'],
  },
  DzMention: {
    tier: 'C',
    pattern: 'combobox',
    why: 'An inline combobox inside free text: the trigger is a character in the value, and the '
      + 'popup position follows the caret rather than the field.',
    traits: ['dataset'],
    wcag: ['2.1.4', '3.3.2', '4.1.3'],
  },
  DzMultiSelect: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A combobox whose value is a set, with per-item removal that has to keep focus inside '
      + 'a control that is shrinking under it.',
    traits: ['dataset', 'teleports'],
    wcag: ['2.1.4', '3.3.2', '4.1.3'],
  },
  DzPersonaSelector: {
    tier: 'C',
    pattern: 'listbox',
    why: 'A searchable picker over a consumer-supplied collection, each row carrying an avatar '
      + 'image from a host URL.',
    boundary: 'url',
    boundaryWhy: 'Persona rows carry an avatar `src` supplied by the host.',
    traits: ['dataset', 'teleports'],
    wcag: ['3.3.2'],
  },
  DzRadio: {
    tier: 'B',
    pattern: 'radio-group',
    wcag: ['3.3.2'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('The bound value is `DzRadioGroup`\'s; this renders one option of it.'),
    },
  },
  DzRadioGroup: { tier: 'B', pattern: 'radio-group', wcag: ['3.3.1', '3.3.2'] },
  DzRangeSlider: {
    tier: 'B',
    pattern: 'slider-multithumb',
    traits: ['drags'],
    wcag: ['3.3.2'],
  },
  DzRating: {
    tier: 'B',
    pattern: 'custom',
    why: 'A bounded ordinal input rendered as icons. It is close to a slider and close to a '
      + 'radio group and is neither: the value is discrete like a radio group, and the arrow-key '
      + 'contract is a slider’s.',
    wcag: ['1.4.1', '3.3.2'],
  },
  DzSelect: {
    tier: 'B',
    pattern: 'combobox',
    traits: ['dataset', 'teleports'],
    wcag: ['1.3.5', '2.1.4', '3.3.2'],
  },
  DzSlider: { tier: 'B', pattern: 'slider', traits: ['drags'], wcag: ['3.3.2'] },
  DzSwitch: { tier: 'B', pattern: 'switch', wcag: ['1.4.1', '3.3.2'] },
  DzTagsInput: {
    tier: 'B',
    pattern: 'custom',
    why: 'A text field whose committed values become removable tokens in the same control. APG '
      + 'has no pattern; the keyboard contract is the one this repository documents.',
    traits: ['dataset'],
    wcag: ['3.3.2', '4.1.3'],
  },
  DzTimePicker: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A text field over a teleported list of times, where the list is generated from a step '
      + 'and a locale rather than supplied.',
    traits: ['teleports'],
    wcag: ['1.3.5', '3.3.1', '3.3.2'],
  },
  DzTransfer: {
    tier: 'C',
    pattern: 'listbox',
    why: 'Two listboxes and a move control over one partitioned collection; focus after a move '
      + 'is the behaviour that decides whether it is usable by keyboard.',
    traits: ['dataset'],
    wcag: ['2.1.4', '3.3.2', '4.1.3'],
  },
  DzTreeSelect: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A form control whose overlay panel is a full treeview, so it owes both the combobox '
      + 'and the treeview keyboard contracts at once.',
    traits: ['dataset', 'teleports'],
    wcag: ['2.1.4', '3.3.2', '4.1.3'],
  },

  // -------------------------------------------------------------------------
  // inputs
  // -------------------------------------------------------------------------
  DzInput: { tier: 'B', pattern: 'none', wcag: ['1.3.5', '3.3.1', '3.3.2'] },
  DzInputGroup: { tier: 'A', pattern: 'none', wcag: ['3.3.2'] },
  DzInputMask: {
    tier: 'B',
    pattern: 'none',
    wcag: ['1.3.5', '3.3.1', '3.3.2', '3.3.7'],
  },
  DzNumberInput: { tier: 'B', pattern: 'spinbutton', wcag: ['3.3.1', '3.3.2'] },
  DzOtpInput: {
    tier: 'B',
    pattern: 'none',
    // 3.3.8 is the reason this is not just "several inputs": an OTP field that
    // breaks paste or autofill fails Accessible Authentication outright.
    wcag: ['1.3.5', '3.3.1', '3.3.2', '3.3.7', '3.3.8'],
  },
  DzPasswordInput: {
    tier: 'B',
    pattern: 'none',
    wcag: ['1.3.5', '3.3.1', '3.3.2', '3.3.7', '3.3.8'],
  },
  DzSearchInput: { tier: 'B', pattern: 'none', wcag: ['1.3.5', '3.3.2', '4.1.3'] },
  DzTextarea: { tier: 'B', pattern: 'none', wcag: ['1.3.5', '3.3.1', '3.3.2'] },

  // -------------------------------------------------------------------------
  // layout
  // -------------------------------------------------------------------------
  DzAffix: { tier: 'A', pattern: 'none', wcag: ['1.4.10', '2.4.11'] },
  DzAppShell: { tier: 'A', pattern: 'landmarks', wcag: ['1.4.10'] },
  DzAspectRatio: { tier: 'A', pattern: 'none' },
  DzCollapse: { tier: 'B', pattern: 'disclosure', wcag: ['4.1.3'] },
  DzContainer: { tier: 'A', pattern: 'none', wcag: ['1.4.10'] },
  DzDeferredContent: { tier: 'A', pattern: 'none', wcag: ['4.1.3'] },
  DzDivider: { tier: 'A', pattern: 'none' },
  DzFlex: { tier: 'A', pattern: 'none', wcag: ['1.4.10'] },
  DzGrid: { tier: 'A', pattern: 'none', wcag: ['1.4.10'] },
  DzMasonry: { tier: 'A', pattern: 'none', wcag: ['1.3.2', '1.4.10'] },
  DzPageHero: { tier: 'A', pattern: 'none', wcag: ['1.4.10'] },
  DzPanel: { tier: 'B', pattern: 'disclosure' },
  DzResizable: {
    tier: 'B',
    pattern: 'window-splitter',
    traits: ['drags'],
    wcag: ['1.4.10'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It reports the layout it settled on with `layoutChange` and does not accept one back.'),
    },
  },
  DzScrollArea: {
    tier: 'B',
    pattern: 'none',
    wcag: ['1.4.10', '2.1.1'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('Scroll offset is the DOM element\'s; nothing is bound.'),
    },
  },
  DzSpacer: { tier: 'A', pattern: 'none' },
  DzSplitter: {
    tier: 'B',
    pattern: 'window-splitter',
    traits: ['drags'],
    wcag: ['1.4.10'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('Pane sizes are reported after a drag, never accepted as a bound prop.'),
    },
  },
  DzStack: { tier: 'A', pattern: 'none', wcag: ['1.4.10'] },
  DzToolbar: {
    tier: 'B',
    pattern: 'toolbar',
    wcag: ['1.4.10'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('A grouping container for controls that each own their own value; it binds none itself.'),
    },
  },

  // -------------------------------------------------------------------------
  // media
  // -------------------------------------------------------------------------
  DzAvatar: {
    tier: 'A',
    pattern: 'none',
    boundary: 'url',
    boundaryWhy: 'The `src` prop is a host-supplied URL that becomes a subresource load.',
  },
  DzAvatarGroup: {
    tier: 'A',
    pattern: 'none',
    boundary: 'url',
    boundaryWhy: 'Each avatar carries a host-supplied `src`.',
    traits: ['dataset'],
  },
  DzCarousel: {
    tier: 'B',
    pattern: 'carousel',
    traits: ['dataset'],
    wcag: ['2.2.2', '4.1.3'],
  },
  DzEmoji: { tier: 'A', pattern: 'none' },
  DzIcon: { tier: 'A', pattern: 'none' },
  DzImage: {
    tier: 'A',
    pattern: 'none',
    boundary: 'url',
    boundaryWhy: 'The `src` prop is a host-supplied URL that becomes a subresource load; the '
      + 'error state is what a blocked or hostile URL surfaces as.',
    wcag: ['4.1.3'],
  },
  DzImageComparison: {
    tier: 'B',
    pattern: 'slider',
    boundary: 'url',
    boundaryWhy: 'Both `src` props are host-supplied URLs that become subresource loads.',
    traits: ['drags'],
  },
  DzLightbox: {
    tier: 'B',
    pattern: 'dialog',
    boundary: 'url',
    boundaryWhy: 'Displays a host-supplied image URL at full viewport size.',
    traits: ['teleports'],
  },
  DzQRCode: {
    tier: 'A',
    pattern: 'none',
    // TWO boundaries, and the second one is the whole reason the field became a
    // set (TASK-N1-O5 finding U3 → TASK-R2-O4, owner decision O5-2). Until then
    // `securityBoundary` held one value, so declaring `payload` meant the
    // `url-policy` row was never asked for and the `icon` sink — a host-supplied
    // URL rendered as `<img src>`, word for word the property DzImage's
    // justification uses — was invisible to the matrix while being bound and
    // asserted in `packages/core/security/boundary-bindings.ts`.
    boundary: ['url', 'payload'],
    boundaryWhy: 'Encodes an arbitrary `value` into a machine-readable code. A camera will '
      + 'follow whatever URL that value turns out to be, so the payload leaves the origin '
      + 'without a browser between it and the person scanning it. Separately, the `icon` '
      + 'prop is a host-supplied URL rendered as an `<img src>` logo over the code, which '
      + 'is a subresource load and owes the url rows on its own.',
  },
  DzWatermark: { tier: 'A', pattern: 'none' },

  // -------------------------------------------------------------------------
  // navigation
  // -------------------------------------------------------------------------
  DzAnchor: {
    tier: 'B',
    pattern: 'link',
    boundary: 'url',
    boundaryWhy: 'Items carry an `href`. In-page fragments are the intended use, but the prop '
      + 'accepts any URL and renders it as a navigation.',
    traits: ['dataset'],
    wcag: ['2.4.6'],
  },
  DzBackTop: {
    tier: 'B',
    pattern: 'button',
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It reports a `click` and scrolls the window; the scroll position belongs to the '
        + 'document, not to a prop.',
      ),
    },
  },
  DzBreadcrumb: {
    tier: 'B',
    pattern: 'breadcrumb',
    boundary: 'url',
    boundaryWhy: 'Crumbs carry a host-supplied `href` that becomes a navigation.',
    traits: ['dataset'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It renders the `items` array it is handed and holds nothing a host could take over.'),
    },
  },
  DzColorModeToggle: {
    tier: 'B',
    pattern: 'button',
    wcag: ['4.1.3'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It emits `change` after the mode has been applied through the provider; the mode lives '
        + 'in the provider, not in a prop here.',
      ),
    },
  },
  DzMegaMenu: {
    tier: 'C',
    pattern: 'menubar',
    why: 'A menubar whose panels are multi-column compositions rather than item lists, so the '
      + 'menu keyboard contract has to survive content APG does not model.',
    boundary: 'url',
    boundaryWhy: 'Menu entries carry a host-supplied `href` that becomes a navigation.',
    traits: ['dataset'],
    wcag: ['2.1.4'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'Panel open/close is reported with `open`/`close` and never accepted back, and '
        + '`collapsed` is a one-way layout override.',
      ),
    },
  },
  DzMenu: {
    tier: 'B',
    pattern: 'menu',
    boundary: 'url',
    boundaryWhy: 'Menu entries carry a host-supplied `href` that becomes a navigation.',
    traits: ['dataset'],
    exceptions: {
      'controlled-uncontrolled': noValueToControl('It renders host-supplied entries and reports activation; no entry state is bound.'),
    },
  },
  DzPagination: { tier: 'B', pattern: 'none', wcag: ['2.4.6', '4.1.3'] },
  DzSegmented: { tier: 'B', pattern: 'radio-group' },
  DzSidebar: {
    tier: 'C',
    // TASK-R2-O2, closing N1-O4 §3d QA1 / owner decision #7. This said
    // `treeview` and the component has never implemented one: DzSidebar.vue
    // ships `role="navigation"` and DzSidebarItem.vue ships links carrying
    // `aria-current="page"` — no `role="tree"`, no `treeitem`, no `aria-level`.
    // APG recommends explicitly *against* the tree and menu patterns for a set
    // of page links, so the component is right and the declaration was wrong.
    // N1-O4 measured the cost of believing the declaration: writing the AT
    // script against `treeview` would have manufactured 30 guaranteed failures
    // (5 tasks × 6 pairings) for a metadata defect, and the script was written
    // against the landmark contract instead, with a capitalised warning telling
    // the tester not to file the mismatch again. That warning is now unnecessary.
    pattern: 'landmarks',
    why: 'A navigation landmark of links that also owns a collapsed rail mode and, on small '
      + 'screens, a teleported overlay — three focus contracts on one component. Tier C is '
      + 'earned by those contracts, not by the APG pattern, which is deliberately the simple one.',
    boundary: 'url',
    boundaryWhy: 'Navigation entries carry a host-supplied `href`.',
    traits: ['dataset', 'teleports'],
    wcag: ['1.4.10', '2.1.4'],
  },
  DzStepper: {
    tier: 'B',
    pattern: 'custom',
    why: 'A progress indicator whose steps can be made navigable. APG has no stepper; when the '
      + 'steps are clickable the contract this repository documents is the tabs one, minus the '
      + 'automatic activation.',
    wcag: ['1.4.1', '4.1.3'],
  },
  DzStepperItem: {
    tier: 'B',
    pattern: 'custom',
    why: 'A single step of `DzStepper`; see there.',
    exceptions: {
      'controlled-uncontrolled': noValueToControl('The active step is `DzStepper`\'s bound value; this renders one step of it.'),
    },
  },
  DzTabs: { tier: 'B', pattern: 'tabs' },

  // -------------------------------------------------------------------------
  // overlays
  // -------------------------------------------------------------------------
  DzCommandPalette: {
    tier: 'C',
    pattern: 'combobox',
    why: 'A dialog containing a combobox over a grouped, consumer-supplied action set, opened '
      + 'by a global shortcut — so it owes the dialog, the combobox and the shortcut contracts.',
    traits: ['dataset', 'teleports'],
    wcag: ['2.1.4', '4.1.3'],
  },
  DzConfirmDialog: { tier: 'B', pattern: 'alertdialog', traits: ['teleports'] },
  DzContextMenu: { tier: 'B', pattern: 'menu', traits: ['teleports'], wcag: ['2.5.1'] },
  DzDialog: { tier: 'B', pattern: 'dialog', traits: ['teleports'] },
  DzDropdownMenu: { tier: 'B', pattern: 'menu', traits: ['teleports'], wcag: ['2.1.4'] },
  DzPopconfirm: { tier: 'B', pattern: 'alertdialog', traits: ['teleports'] },
  DzPopover: { tier: 'B', pattern: 'dialog', traits: ['teleports'] },
  DzSheet: { tier: 'B', pattern: 'dialog', traits: ['teleports'], wcag: ['1.4.10'] },
  DzTooltip: { tier: 'B', pattern: 'tooltip', traits: ['teleports'], wcag: ['1.4.13'] },
  DzTour: {
    tier: 'C',
    pattern: 'dialog',
    why: 'A sequence of dialogs that spotlight elements outside themselves: focus, the overlay '
      + 'cut-out and the target’s own scroll position all have to agree, step after step.',
    traits: ['dataset', 'teleports'],
    wcag: ['1.4.13', '2.2.1', '4.1.3'],
  },

  // -------------------------------------------------------------------------
  // providers
  // -------------------------------------------------------------------------
  DzProvider: {
    tier: 'B',
    pattern: 'none',
    // NOT `teleports`: it *provides* the portal target every overlay resolves
    // against, and renders nothing outside its own position. The distinction
    // matters — declaring the trait here would have claimed portal/hydration
    // evidence for the one component that has no teleported output to check.
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It renders `<slot />` and nothing else, and publishes context — which is not a bound '
        + 'value.',
      ),
      'axe': RENDERS_NO_DOM,
      'keyboard-spec': NO_FOCUSABLE_NODE,
      'browser-play': NO_FOCUSABLE_NODE,
      'state-stories': 'Declares no states: `parts` is `none` and it renders no element.',
      'token-contrast': 'Renders no element, so it ships no colour pair of its own.',
    },
  },
  DzThemeProvider: {
    tier: 'B',
    pattern: 'none',
    exceptions: {
      'controlled-uncontrolled': noValueToControl(
        'It renders `DzProvider` around `<slot />`; `theme` is a one-way prop it resolves and '
        + 'republishes as context.',
      ),
      'axe': RENDERS_NO_DOM,
      'keyboard-spec': NO_FOCUSABLE_NODE,
      'browser-play': NO_FOCUSABLE_NODE,
      'state-stories': 'Declares no states: `parts` is `none` and it renders no element.',
      'token-contrast': 'Resolves the theme that decides every other component’s pairs; it '
        + 'ships none of its own.',
    },
  },

  // -------------------------------------------------------------------------
  // typography
  // -------------------------------------------------------------------------
  DzBlockquote: { tier: 'A', pattern: 'none' },
  DzCaption: { tier: 'A', pattern: 'none' },
  DzCode: { tier: 'A', pattern: 'none' },
  DzHeading: { tier: 'A', pattern: 'none', wcag: ['2.4.6'] },
  DzKbd: { tier: 'A', pattern: 'none' },
  DzRelativeTime: {
    tier: 'A',
    pattern: 'none',
    // The absolute timestamp is disclosed through a `DzTooltip`, so this
    // otherwise-static component renders teleported content.
    traits: ['teleports'],
    wcag: ['2.2.2'],
  },
  DzText: { tier: 'A', pattern: 'none' },
  DzVisuallyHidden: {
    tier: 'A',
    pattern: 'none',
    exceptions: {
      'token-contrast': 'Deliberately not rendered visually; there is no pair to measure.',
      'story-light-dark': 'Deliberately not rendered visually; light and dark look identical '
        + 'because nothing is visible in either.',
    },
  },
}
