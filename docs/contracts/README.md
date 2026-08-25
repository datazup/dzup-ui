# Component Contract Docs

This folder records source-backed component contract documentation for selected
`@dzup-ui/core` components. These docs summarize the public API, intended use,
tests, and visual references; they do not define new runtime behavior.

## Index

| Component | Family | Contract doc | Source |
| --- | --- | --- | --- |
| `DzTagsInput` | Forms | [DzTagsInput](./DzTagsInput.md) | `packages/core/src/components/forms/DzTagsInput.vue` |
| `DzKnob` | Forms | [DzKnob](./DzKnob.md) | `packages/core/src/components/forms/DzKnob.vue` |
| `DzListbox` | Forms | [DzListbox](./DzListbox.md) | `packages/core/src/components/forms/DzListbox.vue` |
| `DzMasonry` | Layout | [DzMasonry](./DzMasonry.md) | `packages/core/src/components/layout/DzMasonry.vue` |
| `DzPanel` | Layout | [DzPanel](./DzPanel.md) | `packages/core/src/components/layout/DzPanel.vue` |
| `DzBadge` | Feedback | [DzBadge](./DzBadge.md) | `packages/core/src/components/feedback/DzBadge.vue` |

## The renderer-facing control contract

Separately from the per-component docs above, every form-capable control is held
to one cross-cutting contract — nine clauses covering value semantics, identity,
states, messages, SSR, RTL, motion, keyboard and async options — so a form
renderer can bind any of them through one registry instead of a special case per
control.

| Document | What it is |
| --- | --- |
| [The renderer-facing control contract](../program-2026-08/form-control-renderer-contract.md) | The nine clauses, C1–C9, and why each exists |
| [Form-control readiness matrix](../program-2026-08/form-controls-readiness-matrix.md) | All 39 controls against all nine clauses — **generated**, `yarn generate:form-readiness` |

The matrix is gated by `yarn validate:form-readiness`, which is part of
`yarn validate:all`. It is generated from source, the ownership manifest and the
quality matrix, so a cell cannot claim a gap is closed while source still shows
it open.

## DzFieldset Naming Decision

`DzFieldset` is not a runtime component in `@dzup-ui/core`. The fieldset use
case is documented under `DzPanel` via the `legend` variant, matching
`docs/features.md` and the existing `Legend / Fieldset` Storybook story.
