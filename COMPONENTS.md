# Component Contract Audit

P001 audit date: 2026-06-26

This file records the review artifact for the component docs cleanup packet. It is not a runtime contract and does not change component behavior.

## Current Docs Surface

- `packages/core/src/components`: present; current source audit found 201 `Dz*.vue` files and 141 `*.contract.spec.ts` files under the package component tree.
- `docs/contracts`: missing; no component contract markdown docs are currently available in this repo surface.
- `COMPONENTS.md`: created by P001 as the reviewable audit and decision-candidate surface because contract docs are intentionally not refreshed until the naming decision is approved.

## DzFieldset / DzPanel Decision Candidate

Status: `pending-review`

Decision candidate: document the Fieldset use case under `DzPanel`, not `DzFieldset`, unless a later source change adds a real `DzFieldset` component.

Evidence:

- No `DzFieldset*` source, type, variant, token, contract spec, unit spec, story, or export was found under `packages/core/src` or `packages/core/stories`.
- `packages/core/src/components/layout/DzPanel.vue`, `DzPanel.types.ts`, `DzPanel.variants.ts`, `DzPanel.tokens.ts`, `DzPanel.contract.spec.ts`, and `DzPanel.spec.ts` exist.
- `packages/core/src/components/layout/index.ts` exports `DzPanel`, `DzPanelProps`, `DzPanelEmits`, `DzPanelSlots`, and `panelVariants`.
- `packages/core/stories/layout/DzPanel.stories.ts` includes `LegendFieldset` with display name `Legend / Fieldset`.
- `docs/features.md` records the original naming intent: "Name it DzPanel; expose a `legend` variant to cover the Fieldset use case."

Negative-case guard: if a later audit finds a real `DzFieldset` implementation path, P002 must not keep `DzPanel` as the substitute without citing that new source path and re-opening this decision.

Out of scope: do not create `DzFieldset.vue` or any new component implementation as part of this docs cleanup. FEAT-008 is a non-goal for P001/P002.

## Missing Contract Docs

`component_contract_audit_count`: `6`

Each row is source-backed and has source, public export, tests, and Storybook evidence, but no `docs/contracts` markdown contract because the docs surface is missing.

| Component | Source evidence | Public export evidence | Test evidence | Story / visual reference for P002 | Missing doc follow-up |
| --- | --- | --- | --- | --- | --- |
| `DzTagsInput` | `packages/core/src/components/forms/DzTagsInput.vue`; `DzTagsInput.types.ts`; `DzTagsInput.variants.ts`; `DzTagsInput.tokens.ts` | `packages/core/src/components/forms/index.ts` exports `DzTagsInput`, `DzTagsInputProps`, `DzTagsInputEmits`, `DzTagsInputRejectReason`, `DzTagsInputSlots`, and `tagsInputVariants` | `packages/core/src/components/forms/DzTagsInput.contract.spec.ts`; `DzTagsInput.spec.ts` | `packages/core/stories/forms/DzTagsInput.stories.ts` (`Default`, `Email Validation`, `Max Tags`, `No Duplicates`, `In Form Field`, size/invalid/disabled/dark-mode stories) | Add contract doc with purpose, API surface, usage example, and VRT/story reference. |
| `DzKnob` | `packages/core/src/components/forms/DzKnob.vue`; `DzKnob.types.ts`; `DzKnob.variants.ts`; `DzKnob.tokens.ts` | `packages/core/src/components/forms/index.ts` exports `DzKnob`, `DzKnobProps`, `DzKnobEmits`, `DzKnobSlots`, and `knobVariants` | `packages/core/src/components/forms/DzKnob.contract.spec.ts`; `DzKnob.spec.ts` | `packages/core/stories/forms/DzKnob.stories.ts` (`Default`, `Stepped`, `Tone Gallery`, `Read Only`, `Size Matrix`, `In DzFormField`, dark-mode and interactive stories) | Add contract doc with purpose, API surface, usage example, and VRT/story reference. |
| `DzListbox` | `packages/core/src/components/forms/DzListbox.vue`; `DzListbox.types.ts`; `DzListbox.variants.ts`; `DzListbox.tokens.ts` | `packages/core/src/components/forms/index.ts` exports `DzListbox`, `DzListboxProps`, `DzListboxEmits`, `DzListboxModelValue`, `DzListboxOption`, `DzListboxValue`, and `listboxVariants` | `packages/core/src/components/forms/DzListbox.contract.spec.ts`; `DzListbox.spec.ts` | `packages/core/stories/forms/DzListbox.stories.ts` (`Single`, `Multiple`, `WithFilter`, `Grouped`, `Disabled`, `InsideFormField`, `DarkMode`) | Add contract doc with purpose, API surface, usage example, and VRT/story reference. |
| `DzMasonry` | `packages/core/src/components/layout/DzMasonry.vue`; `DzMasonry.types.ts`; `DzMasonry.variants.ts`; `DzMasonry.tokens.ts` | `packages/core/src/components/layout/index.ts` exports `DzMasonry`, `DzMasonryProps`, `DzMasonrySlots`, and `masonryVariants` | `packages/core/src/components/layout/DzMasonry.contract.spec.ts`; `DzMasonry.spec.ts` | `packages/core/stories/layout/DzMasonry.stories.ts` (`Default`, `Image Wall`, `Card Feed`, `Responsive Columns`, `With Gap`, `Dark Mode Preview`) | Add contract doc with purpose, API surface, usage example, and VRT/story reference. |
| `DzBadge` | `packages/core/src/components/feedback/DzBadge.vue`; `DzBadge.types.ts`; `DzBadge.variants.ts`; `DzBadge.tokens.ts` | `packages/core/src/components/feedback/index.ts` exports `DzBadge`, `DzBadgeProps`, `DzBadgeSlots`, and `badgeVariants` | `packages/core/src/components/feedback/DzBadge.contract.spec.ts`; `DzBadge.spec.ts` | `packages/core/stories/feedback/DzBadge.stories.ts` (`Default`, variant/size/tone galleries, matrix, slots, semantic usage, status labels, tag cloud) | Add contract doc with purpose, API surface, usage example, and VRT/story reference. |
| `DzPanel` | `packages/core/src/components/layout/DzPanel.vue`; `DzPanel.types.ts`; `DzPanel.variants.ts`; `DzPanel.tokens.ts` | `packages/core/src/components/layout/index.ts` exports `DzPanel`, `DzPanelProps`, `DzPanelEmits`, `DzPanelSlots`, and `panelVariants` | `packages/core/src/components/layout/DzPanel.contract.spec.ts`; `DzPanel.spec.ts` | `packages/core/stories/layout/DzPanel.stories.ts` (`Outlined`, `Elevated`, `Collapsible`, `Legend / Fieldset`, `With Actions`, `Dark Mode Preview`) | Add contract doc only after approving the `DzPanel` fieldset substitute decision. |

## API Surface Pointers For P002

- `DzTagsInput`: free-text chip/token input; `v-model:value`; props include `placeholder`, `max`, `allowDuplicates`, `delimiters`, `validate`, `addOnBlur`, `chipVariant`, and `chipTone`; emits `add`, `remove`, `invalid`, `focus`, and `blur`; slot `tag`.
- `DzKnob`: SVG rotary numeric form control; `v-model:value`; props include `min`, `max`, `step`, `valueTemplate`, `strokeWidth`, and `showValue`; emits contract `ChangeEvents<number>`; slot `value`.
- `DzListbox`: always-visible single/multi-select list; `v-model`; props include `options`, `multiple`, option key props, `filter`, `filterPlaceholder`, `checkmark`, and `emptyMessage`; emits `SelectEvents<DzListboxModelValue>` plus `filter`; slots `option`, `groupLabel`, and `empty`.
- `DzMasonry`: responsive cascading-column layout; props include `columns`, `gap`, `sequential`, `ordered`, and `as`; default slot accepts masonry items.
- `DzBadge`: compact status/count/category label; props include `variant`, `tone`, and `size`; default slot supplies label content.
- `DzPanel`: titled container with header actions and optional collapse; `v-model:collapsed`; props include `header`, `collapsible`, `as`, `size`, `variant`, `tone`, and accessibility props; emits `toggle`; slots `default`, `header`, and `actions`.

## Feature Mapping

- FEAT-005: contract index references are a P002 follow-up because `docs/contracts` is missing and P001 is audit/decision only.
- FEAT-006: this file records the `DzFieldset`/`DzPanel` naming decision candidate for human review.
- FEAT-008: new UI component implementation is explicitly out of scope; missing `DzFieldset` source must not trigger a component scaffold in this docs packet.

## Telemetry

- `component_contract_audit_count`: `6`
- `fieldset_panel_decision_status`: `candidate_dzpanel_substitute_pending_review`
