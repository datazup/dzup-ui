# Form-control readiness matrix

<!-- GENERATED FILE — do not edit by hand.
     Regenerate: yarn generate:form-readiness
     Gate:       yarn validate:form-readiness
     Sources:    packages/core/manifests/component-ownership.manifest.json (roster)
                 packages/tooling/src/forms/probe.ts                       (source facts)
                 packages/tooling/src/forms/assessments.ts                 (reviewed cells)
                 packages/core/docs/quality-matrix.json                    (C8)
-->

> Every Core form control against the nine clauses of [`form-control-renderer-contract.md`](./form-control-renderer-contract.md).
> Read the contract for what a clause means; this file only says who satisfies it.
>
> A cell is **derived** — re-read from source on every run — unless the clause needs a
> judgment source cannot make, in which case it is **reviewed** and carries the citation
> the reviewer consulted. Where the two disagree, source wins.

## Summary

44 controls × 9 clauses = 396 cells.

| Verdict | Count | Meaning |
| --- | ---: | --- |
| ✅ pass | 238 | satisfies the clause today |
| ⛔ gap | 6 | fails the clause; work for TASK-FORM-OSS-02 |
| 🕓 future | 5 | the seam does not exist yet; work for TASK-FORM-OSS-03 |
| ◻ unrun | 54 | the check exists and has not been run for this control |
| – n-a | 93 | the clause does not apply to this kind of control |

| Clause | | ✅ | ⛔ | 🕓 | ◻ | – |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| C1 | value | 31 | 0 | 0 | 5 | 8 |
| C2 | identity | 38 | 6 | 0 | 0 | 0 |
| C3 | states | 44 | 0 | 0 | 0 | 0 |
| C4 | messages | 35 | 0 | 0 | 0 | 9 |
| C5 | SSR | 44 | 0 | 0 | 0 | 0 |
| C6 | RTL | 3 | 0 | 0 | 41 | 0 |
| C7 | motion | 5 | 0 | 0 | 0 | 39 |
| C8 | keyboard | 30 | 0 | 0 | 3 | 11 |
| C9 | async | 8 | 0 | 5 | 5 | 26 |

## Pro may rely on today

- `DzInput`
- `DzFileUpload`
- `DzSelect`

## Matrix

### `packages/core/src/components/inputs/`

| Control | kind | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | specs c/a/s | story states |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DzInput` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | – n-a | – n-a | – n-a | ✓/✓/✓ | Disabled, Invalid |
| `DzInputGroup` | wrapper | – n-a | ✅ pass | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/·/✓ | Disabled |
| `DzInputMask` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/·/✓ | Readonly |
| `DzNumberInput` | numeric | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | Disabled, Readonly, Invalid |
| `DzOtpInput` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/·/✓ | Disabled, Invalid |
| `DzPasswordInput` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/·/✓ | Disabled, Readonly, Invalid |
| `DzSearchInput` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/·/✓ | Disabled, Readonly, Invalid |
| `DzTextarea` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/✓/✓ | Disabled, Readonly, Loading, Invalid |

### `packages/core/src/components/forms/`

| Control | kind | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | specs c/a/s | story states |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DzCascader` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/·/✓ | Disabled, Invalid |
| `DzCheckbox` | boolean | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/✓/✓ | Disabled |
| `DzCheckboxGroup` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | 🕓 future — renders whatever children it is given rather than an option list of its own, so the seam belongs on a future group that takes options | ✓/·/✓ | Disabled |
| `DzColorPicker` | text | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | ✅ pass | ✅ pass | – n-a | ✓/·/✓ | Disabled, Invalid |
| `DzCombobox` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/✓/✓ | Disabled, Loading, Invalid |
| `DzDatePicker` | datetime | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/✓/✓ | Disabled, Invalid |
| `DzDateRangePicker` | datetime | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | Disabled, Invalid |
| `DzFieldArray` | array | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | — |
| `DzFileUpload` | file | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | – n-a | ✅ pass | ✅ pass | ✓/✓/✓ | Disabled, Invalid |
| `DzFloatLabel` | wrapper | – n-a | ⛔ gap — declares ariaDescribedby and cannot honour it — the description belongs on the control, which this wrapper cannot reach through a slot (owner decision: remove the prop, which is a breaking type change); declares ariaInvalid and cannot honour it — validity belongs to the control, not to the element that positions its label (owner decision: remove the prop, which is a breaking type change); declares ariaLabel and cannot honour it — a float-label wrapper is not a labelable element; the control it wraps takes the label (owner decision: remove the prop, which is a breaking type change); declares ariaLabelledby and cannot honour it — same — the wrapped control owns its accessible name (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | ✅ pass | – n-a | – n-a | ✓/·/✓ | — |
| `DzFormDescription` | compound-part | – n-a | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ◻ unrun — not in the quality matrix (compound parts are not assigned a tier) | – n-a | ·/·/✓ | — |
| `DzFormField` | wrapper | – n-a | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | – n-a | ✓/✓/✓ | Disabled, Invalid, Error, Required |
| `DzFormLabel` | compound-part | – n-a | ✅ pass | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ◻ unrun — not in the quality matrix (compound parts are not assigned a tier) | – n-a | ·/✓/✓ | — |
| `DzFormMessage` | compound-part | – n-a | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ◻ unrun — not in the quality matrix (compound parts are not assigned a tier) | – n-a | ·/·/✓ | — |
| `DzInplace` | wrapper | – n-a | ⛔ gap — declares ariaInvalid and cannot honour it — validity belongs to the editor in the slot, which this wrapper cannot reach (owner decision: remove the prop, which is a breaking type change); declares ariaLabelledby and cannot honour it — the editor rendered into the #edit slot owns its accessible name (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | — |
| `DzKnob` | numeric | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | Readonly |
| `DzListbox` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/·/✓ | Disabled |
| `DzMention` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | 🕓 future — has a loading prop and its own suggestion menu; wiring it to the shared seam needs the menu to render the state rows, which is a bigger change than the six selection controls took | ✓/·/✓ | Invalid |
| `DzMultiSelect` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/✓/✓ | Disabled, Invalid |
| `DzPersonaSelector` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | 🕓 future — the DzCombobox it delegates to now has the seam, but this control declares none of the props and so cannot forward them — a pass-through, not a reimplementation | ✓/·/✓ | Disabled |
| `DzRadio` | boolean | – n-a | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/✓/✓ | Disabled |
| `DzRadioGroup` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | 🕓 future — same as DzCheckboxGroup — the radios are children, not an option list this control owns | ✓/✓/✓ | Disabled |
| `DzRangeSlider` | numeric | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | Disabled |
| `DzRating` | numeric | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/·/✓ | Readonly |
| `DzSelect` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | – n-a | ✅ pass | ✅ pass | ✓/✓/✓ | Disabled, Invalid |
| `DzSlider` | numeric | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | – n-a | ✓/✓/✓ | Disabled |
| `DzSwitch` | boolean | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | ✅ pass | ✅ pass | – n-a | ✓/✓/✓ | Disabled |
| `DzTagsInput` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | 🕓 future — has no suggestion source at all today; the seam lands when one does | ✓/·/✓ | Disabled, Invalid |
| `DzTimePicker` | datetime | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | ✅ pass | ✅ pass | – n-a | ✓/·/✓ | Disabled, Invalid |
| `DzTransfer` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/·/✓ | Disabled, Invalid |
| `DzTreeSelect` | selection | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ✅ pass | ✓/·/✓ | — |

### Layouts — the primitives a renderer uses as form sections

| Control | kind | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | specs c/a/s | story states |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DzAccordion` | layout | ◻ unrun — no reviewed judgment and nothing in source decides it | ✅ pass | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | ✅ pass | ✅ pass | ◻ unrun — no reviewed judgment and nothing in source decides it | ✓/✓/✓ | Disabled |
| `DzGrid` | layout | ◻ unrun — no reviewed judgment and nothing in source decides it | ⛔ gap — declares ariaInvalid and cannot honour it — a layout box is not invalid; the fields inside it are (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | ◻ unrun — no reviewed judgment and nothing in source decides it | ✓/✓/✓ | — |
| `DzStack` | layout | ◻ unrun — no reviewed judgment and nothing in source decides it | ⛔ gap — declares ariaInvalid and cannot honour it — a layout box is not invalid; the fields inside it are (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | – n-a | ◻ unrun — no reviewed judgment and nothing in source decides it | ✓/✓/✓ | — |
| `DzStepper` | layout | ◻ unrun — no reviewed judgment and nothing in source decides it | ⛔ gap — declares ariaDescribedby and cannot honour it — the description belongs to the step content, which the stepper renders through a slot and cannot reach (owner decision: remove the prop, which is a breaking type change); declares ariaInvalid and cannot honour it — a stepper is not invalid; a field inside a step is (owner decision: remove the prop, which is a breaking type change); declares ariaLabelledby and cannot honour it — the steps name themselves; DzStepperItem carries the title (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ◻ unrun — no reviewed judgment and nothing in source decides it | ✓/✓/✓ | — |
| `DzTabs` | layout | ◻ unrun — no reviewed judgment and nothing in source decides it | ⛔ gap — declares ariaInvalid and cannot honour it — a tab set is not invalid; a field inside a panel is, and DzTabTrigger is where an invalid-panel affordance would go (owner decision: remove the prop, which is a breaking type change) | ✅ pass | – n-a | ✅ pass | ◻ unrun — declares no RTL contract; `yarn validate:rtl` has nothing to check for it | – n-a | ✅ pass | ◻ unrun — no reviewed judgment and nothing in source decides it | ✓/✓/✓ | Disabled |

## Gaps by family, for TASK-FORM-OSS-02

### Slice: inputs — 0 gaps

No open gaps.

### Slice: selection — 0 gaps

No open gaps.

### Slice: date / time / file — 0 gaps

No open gaps.

### Slice: sliders & rating — 0 gaps

No open gaps.

### Slice: compound & advanced — 2 gaps

| Control | Clause | What is wrong |
| --- | --- | --- |
| `DzFloatLabel` | C2 identity | declares ariaDescribedby and cannot honour it — the description belongs on the control, which this wrapper cannot reach through a slot (owner decision: remove the prop, which is a breaking type change); declares ariaInvalid and cannot honour it — validity belongs to the control, not to the element that positions its label (owner decision: remove the prop, which is a breaking type change); declares ariaLabel and cannot honour it — a float-label wrapper is not a labelable element; the control it wraps takes the label (owner decision: remove the prop, which is a breaking type change); declares ariaLabelledby and cannot honour it — same — the wrapped control owns its accessible name (owner decision: remove the prop, which is a breaking type change) |
| `DzInplace` | C2 identity | declares ariaInvalid and cannot honour it — validity belongs to the editor in the slot, which this wrapper cannot reach (owner decision: remove the prop, which is a breaking type change); declares ariaLabelledby and cannot honour it — the editor rendered into the #edit slot owns its accessible name (owner decision: remove the prop, which is a breaking type change) |

## Deferred to TASK-FORM-OSS-03

5 cells wait on a seam Core does not have. They are listed as `future` rather than
`gap` because no amount of work on the control alone closes them.

| Control | Clause | Missing |
| --- | --- | --- |
| `DzCheckboxGroup` | C9 | renders whatever children it is given rather than an option list of its own, so the seam belongs on a future group that takes options |
| `DzMention` | C9 | has a loading prop and its own suggestion menu; wiring it to the shared seam needs the menu to render the state rows, which is a bigger change than the six selection controls took |
| `DzPersonaSelector` | C9 | the DzCombobox it delegates to now has the seam, but this control declares none of the props and so cannot forward them — a pass-through, not a reimplementation |
| `DzRadioGroup` | C9 | same as DzCheckboxGroup — the radios are children, not an option list this control owns |
| `DzTagsInput` | C9 | has no suggestion source at all today; the seam lands when one does |

