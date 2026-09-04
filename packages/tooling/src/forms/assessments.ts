/**
 * Reviewed judgments for the form-control readiness matrix (TASK-FORM-OSS-01).
 *
 * The matrix is mostly *derived*: `probe.ts` re-reads source on every run, so a
 * cell about a model name, an ignored prop, or a `data-state` value cannot go
 * stale. This file holds the rest — the two things a probe cannot decide.
 *
 *   1. **What kind of control this is.** Nothing in `DzSwitch.vue` says "this
 *      is a boolean control and C9 does not apply to it". The kind decides
 *      which clauses are `n-a`, and getting it wrong either excuses a real gap
 *      or invents one.
 *   2. **Behaviour that only running the thing reveals.** Does clearing emit
 *      the documented empty value? Does the hydrated DOM equal the server's?
 *      Those were checked by reading the handler and, where the reading was
 *      ambiguous, by running the focused spec. Each carries the citation that
 *      was actually consulted.
 *
 * **The reason a reviewed cell is not just a comment.** `validators/form-readiness.ts`
 * fails when this file names a control that no longer exists, when a control
 * exists with no kind, and — the part that matters — when a reviewed `pass`
 * carries no evidence string. A review that cannot be checked decays into a
 * list of opinions with a date on it; this one at least cannot go missing.
 *
 * Reviewed 2026-08-24 against `main` @ `8d80bc3`, 39 controls from
 * `packages/core/manifests/component-ownership.manifest.json`.
 *
 * @module @dzup-ui/tooling/forms/assessments
 */

/** Clause ids from `docs/program-2026-08/form-control-renderer-contract.md`. */
export const CLAUSES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] as const
export type Clause = (typeof CLAUSES)[number]

export const CLAUSE_TITLES: Record<Clause, string> = {
  C1: 'value',
  C2: 'identity',
  C3: 'states',
  C4: 'messages',
  C5: 'SSR',
  C6: 'RTL',
  C7: 'motion',
  C8: 'keyboard',
  C9: 'async',
}

/** Cell verdicts. `future` is reserved for a seam that does not exist yet. */
export type Verdict = 'pass' | 'gap' | 'n-a' | 'future'

/**
 * What a control is, for the purpose of deciding which clauses apply.
 *
 * Taken from the contract's "What a control owes, by kind" table.
 */
export type ControlKind
  = | 'text' // string-valued input
    | 'boolean' // checkbox, switch
    | 'selection' // anything choosing from a set of options
    | 'numeric' // slider, knob, rating, spinbutton
    | 'datetime'
    | 'file'
    | 'array' // a repeater over other controls
    | 'compound-part' // DzFormLabel and friends: no value of its own
    | 'wrapper' // wraps another control; must not swallow its context
    | 'layout' // a section a renderer puts fields into, not a control

/** Clauses that do not apply to a kind, and the one-line reason each time. */
export const NOT_APPLICABLE: Partial<Record<ControlKind, Partial<Record<Clause, string>>>> = {
  'text': { C9: 'options are not part of a text control' },
  'boolean': { C9: 'no options' },
  'numeric': { C9: 'no options' },
  'datetime': { C9: 'the calendar is generated, not fetched' },
  'array': { C9: 'the items are controls, and each answers C9 itself' },
  'compound-part': {
    C1: 'has no value of its own',
    C9: 'no options',
  },
  'wrapper': {
    C1: 'has no value of its own — it wraps a control that has one',
    C9: 'no options',
  },
}

export interface ReviewedCell {
  readonly verdict: Verdict
  /** One line. Says what is wrong, or what proves it right. */
  readonly note: string
  /** `file:line`, a spec name, or an observation. Required for `pass`. */
  readonly evidence: string
}

export interface Assessment {
  readonly kind: ControlKind
  /** Clause verdicts a person decided. Everything else is derived. */
  readonly reviewed?: Partial<Record<Clause, ReviewedCell>>
  /** Recorded when the control is the reference implementation of a clause. */
  readonly reference?: readonly Clause[]
  /**
   * The Core control this one renders and hands its entire identity, state and
   * message surface to.
   *
   * `DzPersonaSelector` renders a `DzCombobox`. Injection walks the component
   * tree, so that `DzCombobox` receives the `DzFormField` context directly —
   * the wrapper injecting it too would be a second, redundant read. A probe
   * looking only at `DzPersonaSelector.vue` sees a control that ignores the
   * field context entirely and reports three gaps that do not exist.
   *
   * Naming the delegate says *why* those clauses are answered elsewhere, and
   * the gate checks the delegate is a control it knows — so this cannot become
   * a way to wave a clause away.
   */
  readonly delegatesTo?: string
  /**
   * Props this control declares, cannot honour, and must not pretend to.
   *
   * `DzFloatLabel` inherits `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`
   * and `ariaInvalid` from `BaseAccessibilityProps` and reads none of them. The
   * probe is right that they are inert — but the fix is not to bind them to a
   * wrapper `<div>`, where they would be equally meaningless and merely
   * harder to notice. It is to stop declaring them, and **that is a breaking
   * type change** a consumer passing one today would feel, so it is an owner
   * decision and not this program's to make.
   *
   * Listing them here keeps the cell a `gap` with a stated reason rather than
   * quietly passing, and the count appears in the matrix summary so the parked
   * decision stays countable instead of becoming a footnote.
   *
   * **The register is empty as of TASK-N5-02.** The owner decision the six
   * entries were waiting on was made: nine props were removed and three were
   * implemented (`docs/program-2026-09/reports/N5-02-aria-prop-gaps-handoff.md`).
   * The field stays because the mechanism is the point — the gate in
   * `form-readiness.ts` still fails on an entry naming a prop the source no
   * longer leaves unread, so a parked decision cannot outlive the decision.
   */
  readonly inertProps?: Readonly<Record<string, string>>
}

const FIELD_CTX_DESCRIBEDBY_BUG
  = 'packages/core/src/composables/useFormField/useFormField.ts:96-103 — '
    + 'ariaDescribedby always includes descriptionId, so a field with no DzFormDescription '
    + 'points aria-describedby at an element that does not exist'

/**
 * Every control, keyed by symbol.
 *
 * The order is the order of the matrix: inputs first (they are the smallest and
 * they calibrated the format), then forms alphabetically.
 */
export const ASSESSMENTS: Record<string, Assessment> = {
  // -------------------------------------------------------------------------
  // inputs/
  // -------------------------------------------------------------------------
  DzInput: {
    kind: 'text',
    reference: ['C2', 'C3'],
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'default model, string, empty value \'\'; clear() writes \'\' and the change event carries the same \'\'',
        evidence: 'DzInput.vue:171-176',
      },
      C4: {
        verdict: 'pass',
        note: 'merges its own error id, the ariaDescribedby prop and the field context, in that order — the defect that makes the context half unreliable is DzFormField\'s row, not this one',
        evidence: `DzInput.vue:147-156; see DzFormField C4 for ${FIELD_CTX_DESCRIBEDBY_BUG.split(' — ')[0]}`,
      },
    },
  },
  DzInputGroup: {
    kind: 'wrapper',
    reviewed: {
      C4: { verdict: 'n-a', note: 'renders no message of its own', evidence: 'DzInputGroup.vue template' },
    },
  },
  DzInputMask: {
    kind: 'text',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'string, empty value \'\'; `model-mode="unmasked"` binds the stripped value so a renderer need not persist presentation, and the default stays masked',
        evidence: 'DzInputMask.types.ts modelMode + DzInputMask.contract.spec.ts "renderer contract C1 value (modelMode)"',
      },
    },
  },
  DzNumberInput: {
    kind: 'numeric',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'number | undefined, undefined is the documented empty, never NaN, and the change event now carries what the model holds',
        evidence: 'DzNumberInput.vue:134-139 + DzNumberInput.contract.spec.ts "renderer contract C1 value"',
      },
    },
  },
  DzOtpInput: {
    kind: 'text',
    reviewed: {
      C1: { verdict: 'pass', note: 'string of digits, empty value \'\'', evidence: 'DzOtpInput.vue defineModel<string>({ default: \'\' })' },
    },
  },
  DzPasswordInput: {
    kind: 'text',
    reviewed: {
      C1: { verdict: 'pass', note: 'string, empty value \'\'', evidence: 'DzPasswordInput.vue defineModel<string>({ default: \'\' })' },
    },
  },
  DzSearchInput: {
    kind: 'text',
    reviewed: {
      C1: { verdict: 'pass', note: 'string, empty value \'\'', evidence: 'DzSearchInput.vue defineModel<string>({ default: \'\' })' },
    },
  },
  DzTextarea: {
    kind: 'text',
    reviewed: {
      C1: { verdict: 'pass', note: 'string, empty value \'\'', evidence: 'DzTextarea.vue defineModel<string>({ default: \'\' })' },
    },
  },

  // -------------------------------------------------------------------------
  // forms/
  // -------------------------------------------------------------------------
  DzCascader: {
    kind: 'selection',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; the array of keys is JSON, and [] is the documented empty',
        evidence: 'DzCascader.vue useDualModel + DzCascader.contract.spec.ts "renderer contract C1 value"',
      },
    },
  },
  DzCheckbox: {
    kind: 'boolean',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'boolean with default false, so false is a value and never absent; indeterminate is a prop and never reaches the model',
        evidence: 'DzCheckbox.vue:27 + :63-69',
      },
    },
  },
  DzCheckboxGroup: {
    kind: 'selection',
    reviewed: {
      C9: {
        verdict: 'future',
        note: 'renders whatever children it is given rather than an option list of its own, so the seam belongs on a future group that takes options',
        evidence: 'DzCheckboxGroup.vue — a slot, not an options prop',
      },
      C1: { verdict: 'pass', note: 'string[] with [] as the empty value', evidence: 'DzCheckboxGroup.vue defineModel<string[]>' },
    },
  },
  DzColorPicker: {
    kind: 'text',
    reviewed: {
      C1: { verdict: 'pass', note: 'hex/rgb string, empty value \'\'', evidence: 'DzColorPicker.vue:115-129' },
    },
  },
  DzCombobox: {
    kind: 'selection',
    reviewed: {
      C1: { verdict: 'pass', note: 'string, and clearing writes \'\'', evidence: 'DzCombobox.vue:279' },
    },
  },
  DzDatePicker: {
    kind: 'datetime',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'RFC 3339 full-date YYYY-MM-DD, empty value \'\'',
        evidence: 'packages/core/src/composables/useDatePicker/useDatePicker.ts:89-93',
      },
    },
  },
  DzDateRangePicker: {
    kind: 'datetime',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: '{ start, end } of full-date strings — an object, which spec 04 leaves to the schema',
        evidence: 'DzDateRangePicker.types.ts:24-29',
      },
    },
  },
  DzFieldArray: {
    kind: 'array',
    reviewed: {
      C1: { verdict: 'pass', note: 'T[] with [] as the empty value', evidence: 'DzFieldArray.vue defineModel<T[]>' },
      C2: {
        verdict: 'pass',
        note: 'derives a per-row id base from its own prop, then the field context, then a generated id, and hands each row fieldId/descriptionId/messageId',
        evidence: 'DzFieldArray.vue idsFor() + tests/ssr/form-controls-ssr.spec.ts',
      },
      C4: {
        verdict: 'pass',
        note: 'hands each row its own descriptionId and messageId, so a renderer can wire per-item messages that do not collide; the array is renderless and renders no message itself',
        evidence: 'DzFieldArray.types.ts DzFieldArraySlotProps + tests/ssr/form-controls-ssr.spec.ts "gives each row an id of its own"',
      },
    },
  },
  DzFileUpload: {
    kind: 'file',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'model-mode="ref" binds DzFileRef[] — JSON-serializable, no binary — and the default File[] mode is unchanged',
        evidence: 'DzFileUpload.contract.spec.ts "puts a JSON-serializable reference in the model, never the binary"',
      },
      C9: {
        verdict: 'pass',
        note: 'model-mode="ref" emits upload-request with the binary and an abort signal; the model holds only DzFileRefs',
        evidence: 'DzFileUpload.contract.spec.ts "hands the binary to the host through an event instead"',
      },
    },
  },
  DzFloatLabel: {
    kind: 'wrapper',
    reviewed: {
      C4: { verdict: 'n-a', note: 'renders no message', evidence: 'DzFloatLabel.vue template' },
    },
  },
  DzFormDescription: {
    kind: 'compound-part',
    reviewed: {
      C2: { verdict: 'pass', note: 'takes its id from the context so the control can reference it', evidence: 'DzFormDescription.vue template :id="context?.descriptionId"' },
      C4: { verdict: 'pass', note: 'is the description half of the describedby pair', evidence: 'DzFormDescription.vue template' },
    },
  },
  DzFormField: {
    kind: 'wrapper',
    reference: ['C2'],
    reviewed: {
      C2: {
        verdict: 'pass',
        note: 'provides fieldId/labelId/descriptionId/messageId plus invalid, required and disabled — the identity every other control resolves against',
        evidence: 'packages/core/src/composables/useFormField/useFormField.ts:78-110',
      },
      C4: {
        verdict: 'pass',
        note: 'names only the sub-parts actually present — decided by walking the slot before children render, so the server and the client agree — and the description precedes the message',
        evidence: 'useFormField.ts describedByDescription/describedByMessage + useFormField.spec.ts ordering assertion',
      },
    },
  },
  DzFormLabel: {
    kind: 'compound-part',
    reviewed: {
      C2: { verdict: 'pass', note: 'for= is wired to the context fieldId', evidence: 'DzFormLabel.vue template :for="context?.fieldId"' },
      C4: { verdict: 'n-a', note: 'a label is not a message', evidence: 'DzFormLabel.vue template' },
    },
  },
  DzFormMessage: {
    kind: 'compound-part',
    reviewed: {
      C2: { verdict: 'pass', note: 'takes the message id from the context', evidence: 'DzFormMessage.vue template :id="context?.messageId"' },
      C4: {
        verdict: 'pass',
        note: 'announces with aria-live="polite" and no role="alert" — the pair was contradictory, and a standing field error should not interrupt',
        evidence: 'DzFormMessage.vue template + DzFormField.spec.ts "announces an error politely"',
      },
    },
  },
  DzInplace: {
    kind: 'wrapper',
    reviewed: {
      C2: {
        verdict: 'gap',
        note: 'does not consume the field context, so an inplace editor inside a DzFormField is unlabelled',
        evidence: 'probe: consumesFieldContext false',
      },
      C4: { verdict: 'n-a', note: 'renders no message', evidence: 'DzInplace.vue template' },
    },
  },
  DzKnob: {
    kind: 'numeric',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; number, and 0 is the documented default rather than an absent value — a knob with a range always has a position',
        evidence: 'DzKnob.vue useDualModel + DzKnob.contract.spec.ts "renderer contract C1 value"',
      },
    },
  },
  DzListbox: {
    kind: 'selection',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'default model, null as the documented empty, array in multiple mode',
        evidence: 'DzListbox.vue:46',
      },
    },
  },
  DzMention: {
    kind: 'selection',
    reviewed: {
      C9: {
        verdict: 'future',
        note: 'has a loading prop and its own suggestion menu; wiring it to the shared seam needs the menu to render the state rows, which is a bigger change than the six selection controls took',
        evidence: 'DzMention.types.ts — loading present, AsyncOptionsProps absent',
      },
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; the value is the raw text including the @ markers, which is what a mention field means by its value',
        evidence: 'DzMention.vue useDualModel + tests/ssr/form-controls-ssr.spec.ts',
      },
    },
  },
  DzMultiSelect: {
    kind: 'selection',
    reviewed: {
      C1: { verdict: 'pass', note: 'string[], [] as the empty value, clear writes []', evidence: 'DzMultiSelect.vue:188' },
    },
  },
  DzPersonaSelector: {
    kind: 'selection',
    delegatesTo: 'DzCombobox',
    reviewed: {
      C9: {
        verdict: 'future',
        note: 'the DzCombobox it delegates to now has the seam, but this control declares none of the props and so cannot forward them — a pass-through, not a reimplementation',
        evidence: 'DzPersonaSelector.types.ts + DzCombobox.types.ts AsyncOptionsProps',
      },
      C1: { verdict: 'pass', note: 'string id, empty value \'\'', evidence: 'DzPersonaSelector.vue defineModel<string>({ default: \'\' })' },
      C2: {
        verdict: 'pass',
        note: 'the DzCombobox it renders is a descendant of the DzFormField, so injection reaches it; this control adds no identity props of its own to drop',
        evidence: 'DzPersonaSelector.vue template <DzCombobox> + DzCombobox.vue useFormFieldContext',
      },
      C4: {
        verdict: 'pass',
        note: 'the delegate owns the describedby merge and the message surface',
        evidence: 'DzCombobox.vue resolvedAriaDescribedby',
      },
    },
  },
  DzRadio: {
    kind: 'boolean',
    reviewed: {
      C1: {
        verdict: 'n-a',
        note: 'a single radio has no model of its own; the group owns the value',
        evidence: 'DzRadio.vue — no defineModel, value is a prop',
      },

    },
  },
  DzRadioGroup: {
    kind: 'selection',
    reviewed: {
      C9: {
        verdict: 'future',
        note: 'same as DzCheckboxGroup — the radios are children, not an option list this control owns',
        evidence: 'DzRadioGroup.vue — a slot, not an options prop',
      },
      C1: { verdict: 'pass', note: 'string, empty value \'\'', evidence: 'DzRadioGroup.vue defineModel<string>({ default: \'\' })' },
    },
  },
  DzRangeSlider: {
    kind: 'numeric',
    reviewed: {
      C1: { verdict: 'pass', note: '[number, number] tuple, JSON-serializable', evidence: 'DzRangeSlider.vue defineModel<[number, number]>' },
    },
  },
  DzRating: {
    kind: 'numeric',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; number, and 0 is the documented empty — it is what "not rated" means for a rating that starts at 1',
        evidence: 'DzRating.vue useDualModel + DzRating.contract.spec.ts "renderer contract C1 value"',
      },
    },
  },
  DzSelect: {
    kind: 'selection',
    reviewed: {
      C1: { verdict: 'pass', note: 'string, empty value \'\'', evidence: 'DzSelect.vue:192 with defineModel<string>({ default: \'\' })' },
    },
  },
  DzSlider: {
    kind: 'numeric',
    reviewed: {
      C1: { verdict: 'pass', note: 'number with a documented default', evidence: 'DzSlider.vue defineModel<number>({ default: 0 })' },
    },
  },
  DzSwitch: {
    kind: 'boolean',
    reviewed: {
      C1: { verdict: 'pass', note: 'boolean with default false; false is a value', evidence: 'DzSwitch.vue defineModel<boolean>({ default: false })' },
    },
  },
  DzTagsInput: {
    kind: 'selection',
    reviewed: {
      C9: {
        verdict: 'future',
        note: 'has no suggestion source at all today; the seam lands when one does',
        evidence: 'DzTagsInput.types.ts',
      },
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; string[] with [] as the documented empty',
        evidence: 'DzTagsInput.vue useDualModel + tests/ssr/form-controls-ssr.spec.ts',
      },
    },
  },
  DzTimePicker: {
    kind: 'datetime',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'HH:MM or HH:MM:SS local wall-clock, empty value \'\' — the profile named in C1.5, which is deliberately not JSON Schema format: time',
        evidence: 'DzTimePicker.vue:150-155 and :366',
      },
    },
  },
  DzTransfer: {
    kind: 'selection',
    reviewed: {
      C1: { verdict: 'pass', note: 'string[] of the selected keys', evidence: 'DzTransfer.vue:131-137' },
    },
  },
  DzTreeSelect: {
    kind: 'selection',
    reviewed: {
      C1: {
        verdict: 'pass',
        note: 'takes both v-model and v-model:value; the value is a key or an array of keys, and undefined is the documented empty for an unselected tree',
        evidence: 'DzTreeSelect.vue useDualModel + DzTreeSelect.contract.spec.ts "renderer contract C1 value"',
      },
    },
  },
  // -------------------------------------------------------------------------
  // Layouts — the primitives a renderer uses as form sections (FORM-OSS-04)
  // -------------------------------------------------------------------------
  DzStack: {
    kind: 'layout',
    reviewed: {
      C2: {
        verdict: 'n-a',
        note: 'a stack is a box around fields; the fields inside it carry the identity',
        evidence: 'DzStack.vue — no field context, no ids of its own',
      },
      C4: { verdict: 'n-a', note: 'renders no message', evidence: 'DzStack.vue template' },
      C6: {
        verdict: 'pass',
        note: 'flex-direction and gap are writing-mode relative, so `dir` orders the children with nothing to configure — its vocabulary is horizontal/vertical where a renderer says row/column, which a registry entry must translate',
        evidence: 'DzGrid.formLayout.spec.ts "uses flex-row, which follows dir rather than fighting it"',
      },
    },
  },
  DzGrid: {
    kind: 'layout',
    reviewed: {
      C2: { verdict: 'n-a', note: 'a grid is a box around fields', evidence: 'DzGrid.vue' },
      C4: { verdict: 'n-a', note: 'renders no message', evidence: 'DzGrid.vue template' },
      C6: {
        verdict: 'pass',
        note: 'CSS grid follows the writing mode and the component adds no physical property, so columns fill right-to-left under dir="rtl" unaided',
        evidence: 'DzGrid.formLayout.spec.ts "has no direction of its own"',
      },
      C7: { verdict: 'n-a', note: 'nothing moves', evidence: 'DzGrid.variants.ts' },
    },
  },
  DzTabs: {
    kind: 'layout',
    reviewed: {
      C2: {
        verdict: 'n-a',
        note: 'the fields inside a panel carry the identity; the tab set carries the reveal',
        evidence: 'DzTabs.vue',
      },
      C4: { verdict: 'n-a', note: 'renders no message of its own', evidence: 'DzTabs.vue template' },
    },
  },
  DzAccordion: {
    kind: 'layout',
    reviewed: {
      C2: { verdict: 'n-a', note: 'the fields inside a panel carry the identity', evidence: 'DzAccordion.vue' },
      C4: { verdict: 'n-a', note: 'renders no message of its own', evidence: 'DzAccordion.vue template' },
    },
  },
  DzStepper: {
    kind: 'layout',
    reviewed: {
      C2: { verdict: 'n-a', note: 'the fields inside a step carry the identity', evidence: 'DzStepper.vue' },
      C4: { verdict: 'n-a', note: 'renders no message of its own', evidence: 'DzStepper.vue template' },
    },
  },

}
