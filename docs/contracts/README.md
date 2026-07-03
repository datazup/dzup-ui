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

## DzFieldset Naming Decision

`DzFieldset` is not a runtime component in `@dzup-ui/core`. The fieldset use
case is documented under `DzPanel` via the `legend` variant, matching
`docs/features.md` and the existing `Legend / Fieldset` Storybook story.
