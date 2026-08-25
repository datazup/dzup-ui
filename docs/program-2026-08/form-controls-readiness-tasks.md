# dzup-ui — Core form-control readiness for the Pro Form renderer (task prompts)

> Part of the [System Program 2026-08](./README.md). Source: the Form system
> specification (`workspace-docs/repos/ui/docs/architecture/dzup-form-system-2026-08-08/`,
> packets F3/F4 "reuse core inputs, form field/label/description/message,
> selection controls, date/file/array controls, stepper/tabs/accordion") and its
> rule: *"If a core component cannot satisfy the renderer contract or
> accessibility gate, fix that primitive in `dzup-ui` first. Do not fork a
> near-copy in Pro."* The 2026-08-11 reassessment places the Form program in Pro
> (P6) and makes OSS responsible for the controls and provider contracts only.
>
> These tasks can start **before** Pro's FORM-00 admission decides the
> migration path: they make Core better regardless, and they never touch the
> beta Pro exports. Every prompt assumes `<repo_conventions>` from
> [README.md §3](./README.md#3-how-these-tasks-are-written).

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🟠 P1 (all four — they gate Pro P6 but not each other except 01 → 02)

## Deliverables produced by this file

| Document | Task | Kind |
| --- | --- | --- |
| [`form-control-renderer-contract.md`](./form-control-renderer-contract.md) | FORM-OSS-01 | Written contract, clauses C1–C9 |
| [`form-controls-readiness-matrix.md`](./form-controls-readiness-matrix.md) | FORM-OSS-01 | **Generated** — `yarn generate:form-readiness`, gated by `yarn validate:form-readiness` |
| [`EXECUTION-STATUS-FORM.md`](./EXECUTION-STATUS-FORM.md) | all four | Live ledger of this run |

## Ordering

```text
TASK-FORM-OSS-01 (audit → matrix)
   ├─> TASK-FORM-OSS-02 (close gaps per family)
   ├─> TASK-FORM-OSS-03 (value codec + async-state primitives)
   └─> TASK-FORM-OSS-04 (layout primitives as form layouts)
```

Current Core inventory the audit must cover (verified 2026-08-20):

- `packages/core/src/components/inputs/`: DzInput, DzInputGroup, DzInputMask, DzNumberInput, DzOtpInput, DzPasswordInput, DzSearchInput, DzTextarea
- `packages/core/src/components/forms/`: DzCascader, DzCheckbox, DzCheckboxGroup, DzColorPicker, DzCombobox, DzDatePicker, DzDateRangePicker, DzFieldArray, DzFileUpload, DzFloatLabel, DzFormDescription, DzFormField, DzFormLabel, DzFormMessage, DzInplace, DzKnob, DzListbox, DzMention, DzMultiSelect, DzPersonaSelector, DzRadio, DzRadioGroup, DzRangeSlider, DzRating, DzSelect, DzSlider, DzSwitch, DzTagsInput, DzTimePicker, DzTransfer, DzTreeSelect
- Layout/navigation used as form layouts: DzStack, DzGrid, DzTabs, DzAccordion (+Item/Trigger/Content), DzStepper (+Item)

---

### [x] TASK-FORM-OSS-01 — Renderer-contract audit of every Core form control (produce the readiness matrix)

_Gap: the Form spec's renderer registry (document 04) dispatches JSON-Schema
data types to Core controls and expects uniform value semantics, ARIA wiring
through `DzFormField`, and identical state vocabulary. Nobody has checked the
31 form + 8 input controls against one written contract; Pro's current
`DzSchemaFormField` works around differences ad hoc._

```xml
<role>You are a forms accessibility and API-contract auditor for ui/dzup-ui. Follow <repo_conventions>. This task is read-only on component source; its deliverable is a matrix and a contract document.</role>

<task>Write the Core "renderer-facing control contract" and audit every form-capable Core control against it, producing a pass/gap matrix committed to docs/program-2026-08/form-controls-readiness-matrix.md. Do not edit components or Pro.</task>

<motivation>Pro's DzFormRenderer (P6) will bind JSON values to Core controls through a registry. If value semantics, state attributes, or ARIA wiring differ per control, the renderer grows per-control special cases — the exact "manual validation architecture under new names" the spec warns against. One contract plus an honest matrix tells Pro what it can rely on today and tells Core what to fix (TASK-FORM-OSS-02/03).</motivation>

<discovery>
  1. Read packages/core/src/components/forms/DzFormField.vue, DzFormLabel.vue, DzFormDescription.vue, DzFormMessage.vue and their .types.ts — record how ids, aria-describedby, aria-invalid, required, and the field context are provided/injected.
  2. Read docs/contracts/README.md and the existing contract specs (DzBadge, DzKnob, DzListbox, DzTagsInput, …) to reuse the Contract Spec v1 vocabulary for states (data-state, data-disabled, data-invalid, aria-*).
  3. Read workspace-docs/repos/ui/docs/architecture/dzup-form-system-2026-08-08/04-runtime-components-and-extension-contracts.md §renderer contract and 03-…v1alpha1.md for the value/codec expectations (JSON-only values, DzFileRef, false-vs-absent).
  4. For each control, read its .types.ts, .vue, .contract.spec.ts, .a11y.spec.ts (if any), SSR spec, and story.
</discovery>

<requirements>
  <contract_document>
    Write docs/program-2026-08/form-control-renderer-contract.md with numbered clauses:
    C1 value: v-model value is JSON-serializable; documented empty value; checkbox false vs absent; number controls emit number|null (never NaN/string); date/time emit ISO strings (document which profile); file controls emit a reference object, never a File/Blob in the model.
    C2 identity: accepts `id`; when inside DzFormField it consumes the injected id/describedby/invalid/required without props; standalone it accepts aria-describedby/aria-invalid props.
    C3 states: disabled, readonly, invalid, loading/pending, required — each reflected as a data-* or aria-* attribute listed in Contract Spec v1 and styled only via tokens.
    C4 messages: error/description are announced (aria-describedby order: description then message; live region policy for async errors).
    C5 SSR: renders on server with the same initial DOM; no hydration mismatch with a provided value.
    C6 RTL: logical properties only; caret/slider/knob/stepper direction follows dir.
    C7 motion: honours prefers-reduced-motion.
    C8 keyboard: APG pattern named per control (combobox, listbox, slider, radio group, switch, …).
    C9 options: async option sources expose loading/empty/error states and an abort path (needed by FORM-OSS-03; mark as "future" if absent today).
  </contract_document>
  <matrix>
    One row per control, one column per clause C1–C9, cells = pass / gap (with one-line reason and file:line) / n-a. Add columns: has .contract.spec · has .a11y.spec · has SSR spec · story states covered. Put a summary count at the top and a "Pro may rely on today" list at the bottom.
  </matrix>
  <evidence>Where a cell is "pass", cite the test or the exact template attribute that proves it. Where uncertain, run the focused spec (`vitest run packages/core/src/components/forms/Dz<Name>.*spec.ts`) or mount the story in `yarn storybook` and record what you observed. Do not mark pass from memory.</evidence>
</requirements>

<steps>
  1. Discovery; draft the contract document; check it against the three spec documents so clause wording matches Pro's vocabulary.
  2. Audit inputs/ (8 controls) first — smallest — and calibrate the matrix format.
  3. Audit forms/ (31 controls); run focused specs where needed.
  4. Write summary counts and the "rely on today" list; list gaps grouped by family for TASK-FORM-OSS-02.
  5. Link the matrix from this file's header and from docs/contracts/README.md.
</steps>

<example>
| Control | C1 value | C2 identity | C3 states | C4 messages | C5 SSR | C6 RTL | C7 motion | C8 keyboard | C9 async | specs (contract/a11y/ssr) |
|---|---|---|---|---|---|---|---|---|---|---|
| DzCheckbox | gap — emits `false` on uncheck but `undefined` when indeterminate cleared (DzCheckbox.vue:118) | pass (inject from DzFormField.vue:42) | pass | pass | pass (ssr/forms.spec.ts) | pass | n-a | pass (APG checkbox) | n-a | ✓/✓/✓ |
</example>

<validation>Focused `vitest run` on specs you consulted · yarn lint (docs only) · no component diff (`git diff --stat packages/` empty).</validation>

<success_criteria>Contract document with clauses C1–C9; matrix covers all 39 controls with cited evidence; gaps grouped per family; zero edits to component source or Pro.</success_criteria>

<stop_conditions>A clause cannot be stated without deciding a Pro-owned policy (e.g. date profile) — record both options and flag for the FORM-00 owner · request to "fix while auditing" (that is TASK-FORM-OSS-02) · do not remove or rename beta Pro Form exports · do not add Ajv or any form library to Core.</stop_conditions>
```

---

### [x] TASK-FORM-OSS-02 — Close the audited gaps in Core, one family slice at a time, additive API only

_Gap: whatever TASK-FORM-OSS-01's matrix reports as "gap". Expected classes
from the spec: inconsistent empty/false value semantics, controls that ignore
the DzFormField injection when rendered as compound parts, missing
`loading`/`readonly` states on selection controls, missing SSR specs for
date/file controls, and physical (`left/right`) CSS in sliders/knobs._

```xml
<role>You are a Core component engineer for ui/dzup-ui. Follow <repo_conventions>. Prerequisite: the readiness matrix from TASK-FORM-OSS-01 exists.</role>

<task>Close every "gap" cell in docs/program-2026-08/form-controls-readiness-matrix.md by fixing the Core primitive, in PR-sized slices per family (inputs/ → selection controls → date/time/file → sliders/knob/rating → compound/advanced), keeping the public API additive and re-running the matrix row after each fix.</task>

<motivation>The spec forbids near-copies in Pro; every gap left in Core becomes a Pro workaround that the renderer, builder, and every consumer app then inherit. Fixing at the primitive fixes it for the landing, sandbox, Storybook, and all external apps at once, and each fix is independently shippable under the existing Contract Spec v1 gates.</motivation>

<requirements>
  <additive>Add props/attributes/emit payload shapes; never change an existing emitted value type without a compat path (document in .changeset as minor; a breaking change needs an owner decision — stop and report).</additive>
  <per_fix>For each gap: code change → update or add .contract.spec.ts assertion for the clause → .a11y.spec.ts if C2/C4/C8 → SSR spec if C5 → story state if C3 → flip the matrix cell with the new evidence citation.</per_fix>
  <tokens>Any visual state added (loading, readonly) is styled via Dz{Name}.tokens.ts + .variants.ts only; no raw colours, no scoped styles.</tokens>
  <rtl>Replace physical properties with logical ones; add the control to the RTL matrix (TASK-OSS-P4-05 / TASK-AR-2) rather than duplicating RTL tests here.</rtl>
  <slices>One slice = one family group, its own changeset, its own validation run. Do not batch all families into one diff.</slices>
</requirements>

<steps>
  1. Sort the gaps by family; start with inputs/ (DzInput, DzNumberInput, DzTextarea, DzInputMask, DzOtpInput, DzPasswordInput, DzSearchInput, DzInputGroup).
  2. Fix → spec → story → matrix, per gap.
  3. Run the slice validation; record counts.
  4. Repeat for selection (DzSelect, DzMultiSelect, DzCombobox, DzListbox, DzCascader, DzTreeSelect, DzTransfer, DzRadioGroup, DzCheckboxGroup, DzSwitch, DzCheckbox, DzRadio), then date/time/file (DzDatePicker, DzDateRangePicker, DzTimePicker, DzFileUpload), then sliders (DzSlider, DzRangeSlider, DzKnob, DzRating, DzColorPicker), then advanced (DzTagsInput, DzMention, DzPersonaSelector, DzFieldArray, DzInplace, DzFloatLabel).
  5. Final: re-run the whole matrix; update the "Pro may rely on today" list.
</steps>

<validation>Per slice: focused `vitest run packages/core/src/components/{family}/…` · yarn test:contracts · yarn test:a11y · yarn test:ssr · yarn typecheck · yarn lint · yarn validate:contract-parity · yarn validate:tokens · yarn validate:story-dod · yarn storybook:build. Final: yarn test · yarn build · yarn validate:exports · yarn validate:dts.</validation>

<success_criteria>Every former gap cell is "pass" with cited evidence or is explicitly parked with an owner decision; all slices have changesets; aggregate gates green; no Pro edits; no breaking value-type changes.</success_criteria>

<stop_conditions>A fix requires a breaking emitted-value change · a fix requires knowledge of Pro's document model (it belongs in the Pro adapter) · do not remove or rename beta Pro Form exports · do not add Ajv or any form library to Core.</stop_conditions>
```

---

### [x] TASK-FORM-OSS-03 — Value codec and async-state primitives the renderer needs (additive Core props/slots)

_Gap: the spec's F5 packet (remote data sources, validators, files) needs
controls that can show pending/loading/error for async options with accessible
announcements, accept an abortable option loader, and a file input that emits a
`DzFileRef`-shaped reference while never holding binary in the model. Core's
selection controls take static option arrays; `DzFileUpload` exposes `File`
objects._

```xml
<role>You are a Core component engineer focused on async UX and accessibility. Follow <repo_conventions>. Coordinate clause C9 of the renderer contract; Pro owns the operation controller, Core owns the control surface.</role>

<task>Design and implement, additively, the control-side primitives for async options and file references: (a) a uniform async-options contract for DzSelect, DzMultiSelect, DzCombobox, DzListbox, DzCascader, DzTreeSelect, DzTransfer; (b) a reference-emitting mode for DzFileUpload; (c) shared value codec helpers in @dzup-ui/contracts or core utilities for empty/false/number/date/file values — all documented in docs/contracts.</task>

<motivation>The renderer's data-source controller (Pro) handles cascades, cancellation, sequence fencing, and caching; it must hand a control "here are options / loading / error / retry" and get back "user chose X / user typed Y / please load more" without the control knowing about operations. If Core defines that seam once, Pro's registry uses one adapter for all seven selection controls and the file control never leaks a Blob into a persisted form document.</motivation>

<discovery>
  1. Read the seven selection controls' .types.ts for current `options`, `loading`, `filter`, `search` props and `update:search`/`open` emits; tabulate differences.
  2. Read DzFileUpload.types.ts and its model shape; read the spec's DzFileRef codec (document 03/05).
  3. Check @dzup-ui/contracts for existing Option/Item types to extend rather than duplicate.
</discovery>

<requirements>
  <async_options>
    Add to @dzup-ui/contracts: `AsyncOptionsState = 'idle' | 'loading' | 'error' | 'empty' | 'ready'`, `AsyncOptionsProps { optionsState?, optionsError?: string, onRetry? }` and an emit `'load-options': { query: string; reason: 'open' | 'search' | 'more'; signal: AbortSignal }`.
    Each selection control: renders a token-styled loading row / empty row / error row with a retry button (DzButton), announces state changes in a polite live region using the existing message props pattern, keeps keyboard focus on the trigger while loading, and aborts the previous signal when emitting a new request.
  </async_options>
  <file_ref>
    DzFileUpload gains `model="ref"` (default stays current behaviour): v-model becomes `DzFileRef[]` (`{ id, name, size, type, status: 'pending'|'uploaded'|'failed', error? }`) and the control emits `'upload-request': { file: File; ref: DzFileRef; signal: AbortSignal }` for the host to perform the upload; success/failure/removal reflected via props. The File object never appears in v-model.
  </file_ref>
  <codecs>Export pure helpers (no Vue): `emptyValueFor(kind)`, `isEmptyValue`, `toNumberValue(input): number|null`, `toIsoDate/FromIsoDate` for the profile chosen in TASK-FORM-OSS-01, `toFileRef`. 100% unit-tested; JSON round-trip property test.</codecs>
  <stories>One "Async options" story per selection control showing loading → ready → error → retry via play(); one DzFileUpload "Reference mode" story with a fake host upload.</stories>
</requirements>

<steps>
  1. Contracts first (types + codecs + tests) in @dzup-ui/contracts; run contracts typecheck.
  2. Implement async options in DzSelect; write contract/a11y/SSR specs; copy the pattern to the other six.
  3. Implement DzFileUpload ref mode.
  4. Stories + docs/contracts pages; changesets (minor).
</steps>

<validation>yarn typecheck:all · yarn lint · yarn test:contracts · yarn test:a11y · yarn test:ssr · focused vitest · yarn validate:contract-parity · yarn validate:exports · yarn validate:dts · yarn storybook:build · yarn storybook:test</validation>

<success_criteria>All seven selection controls implement the same async-options contract with announced states and abort; DzFileUpload ref mode emits no binary into the model; codec helpers are pure and tested; all additive; C9 cells in the matrix flip to pass.</success_criteria>

<stop_conditions>A control cannot implement the seam without a breaking change (report options) · any pressure to put operation execution, URLs, or credentials into Core · do not remove or rename beta Pro Form exports · do not add Ajv or any form library to Core.</stop_conditions>
```

---

### [x] TASK-FORM-OSS-04 — Layout primitives readiness: Stack/Grid/Tabs/Accordion/Stepper as form layouts

_Gap: the spec's F4 layouts (Stack, Grid, Group, Tabs, Accordion, Wizard/Step)
must support wizard gating, error focus, and responsive spans. Core's DzTabs,
DzAccordion, and DzStepper are navigation/disclosure components; none has been
tested as a container for validated fields (focus the first invalid control in
a collapsed panel, block step advance on invalid, hydrate with a selected step)._

```xml
<role>You are a Core layout and focus-management engineer. Follow <repo_conventions>. Keep changes additive; the renderer's layout nodes (Pro) will map 1:1 onto these primitives.</role>

<task>Verify and, where needed, extend DzStack, DzGrid, DzTabs, DzAccordion, and DzStepper so they can host validated form sections: programmatic reveal-and-focus of a descendant, step/tab gating hooks, responsive span semantics, and SSR/hydration with a preselected panel. Record results in the readiness matrix under a "Layouts" section.</task>

<motivation>Wizard and tabbed forms fail accessibility when the first invalid field sits in a hidden panel: the renderer calls focus(), nothing happens, and the user is told "fix errors" with nowhere to go. Solving reveal-then-focus and gating once in the primitives keeps Pro's layout renderers declarative and keeps the behaviour identical in every app that builds a stepper by hand.</motivation>

<discovery>
  1. Read DzTabs/DzAccordion/DzStepper .types.ts and composables for current imperative API (expose()), v-model for active item, and keyboard handling.
  2. Check DzGrid for span/responsive props and DzStack for gap/direction and RTL behaviour.
  3. Review existing SSR specs under packages/core/src/ssr/ (or equivalent) for these components.
</discovery>

<requirements>
  <reveal_focus>Expose on DzTabs, DzAccordion, DzStepper: `revealItem(id)` (activates/opens the containing item) and emit `'revealed'` after the panel is rendered so a caller can focus a descendant; provide a tiny composable `useRevealAndFocus(containerRef, targetSelector)` in core utilities that waits for render (nextTick + transition end respecting reduced motion).</reveal_focus>
  <gating>DzStepper: `beforeChange?: (from, to) => boolean | Promise&lt;boolean&gt;` prop (or equivalent guarded emit) so a host can block advance; visually reflect blocked state via tokens; keyboard Enter/ArrowRight respects the guard; `linear` mode prevents skipping ahead.</gating>
  <spans>DzGrid: document and test `span` / responsive span props per breakpoint; confirm RTL column order; DzStack: `direction` with RTL-correct `row` semantics.</spans>
  <ssr>Each primitive renders with a preselected item on the server and hydrates without mismatch; add SSR specs where missing.</ssr>
  <a11y>Tabs/Accordion/Stepper keep their APG patterns; revealed panels are announced; focus never lands on a hidden element.</a11y>
</requirements>

<steps>
  1. Discovery; write the "Layouts" rows of the matrix with current status.
  2. Implement reveal/focus + composable; specs + story "Form sections with error focus".
  3. Implement Stepper gating; specs + story "Wizard with validation".
  4. Grid/Stack span + RTL tests; SSR specs.
  5. Update matrix, docs/contracts, changesets (minor).
</steps>

<validation>yarn typecheck · yarn lint · focused vitest · yarn test:contracts · yarn test:a11y · yarn test:ssr · yarn validate:contract-parity · yarn storybook:build · yarn storybook:test · yarn test:e2e (keyboard tab/stepper specs)</validation>

<success_criteria>Hidden-panel error focus works via a documented API in all three disclosure primitives; Stepper can block advance; Grid/Stack spans and RTL are tested; SSR specs exist; all additive with changesets.</success_criteria>

<stop_conditions>Gating would require the primitive to know validation semantics (keep it a boolean guard) · a change breaks an existing APG pattern · do not remove or rename beta Pro Form exports · do not add Ajv or any form library to Core.</stop_conditions>
```
