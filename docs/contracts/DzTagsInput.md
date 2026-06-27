# DzTagsInput Contract

## Purpose

`DzTagsInput` is a free-text token input for arbitrary chips such as recipient
emails, keywords, or labels. It differs from `DzCombobox` and `DzMultiSelect`
because users create values instead of selecting from a fixed option list.

## API Surface

- Source: `packages/core/src/components/forms/DzTagsInput.vue`
- Types: `DzTagsInputProps`, `DzTagsInputEmits`, `DzTagsInputSlots`,
  `DzTagsInputRejectReason`
- Public export: `packages/core/src/components/forms/index.ts`
- Model: `v-model:value` as `string[]`
- Key props: `placeholder`, `max`, `allowDuplicates`, `delimiters`,
  `validate`, `addOnBlur`, `chipVariant`, `chipTone`
- Events: `add`, `remove`, `invalid`, `focus`, `blur`
- Slots: `tag`

## Usage

```vue
<DzTagsInput
  v-model:value="emails"
  placeholder="Add recipient"
  :validate="isEmail"
  :max="10"
  chip-tone="primary"
/>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/forms/DzTagsInput.contract.spec.ts`
- Unit tests: `packages/core/src/components/forms/DzTagsInput.spec.ts`
- Storybook/VRT reference: `packages/core/stories/forms/DzTagsInput.stories.ts`
  (`Default`, `Email Validation`, `Max Tags`, `No Duplicates`,
  `In Form Field`, size/invalid/disabled/dark-mode stories)
