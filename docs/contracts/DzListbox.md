# DzListbox Contract

## Purpose

`DzListbox` is an always-visible single or multi-select list built on Reka UI
listbox primitives. It is suited to settings panels and forms where available
choices should remain visible.

## API Surface

- Source: `packages/core/src/components/forms/DzListbox.vue`
- Types: `DzListboxProps`, `DzListboxEmits`, `DzListboxSlots`,
  `DzListboxModelValue`, `DzListboxOption`, `DzListboxValue`
- Public export: `packages/core/src/components/forms/index.ts`
- Model: `v-model` as a single value, array, or `null`
- Key props: `options`, `multiple`, `optionLabel`, `optionValue`,
  `optionDisabled`, `optionGroup`, `filter`, `filterPlaceholder`,
  `checkmark`, `emptyMessage`
- Events: `SelectEvents<DzListboxModelValue>`, `filter`
- Slots: `option`, `groupLabel`, `empty`

## Usage

```vue
<DzListbox
  v-model="selected"
  :options="teams"
  option-label="name"
  option-value="id"
  filter
/>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/forms/DzListbox.contract.spec.ts`
- Unit tests: `packages/core/src/components/forms/DzListbox.spec.ts`
- Storybook/VRT reference: `packages/core/stories/forms/DzListbox.stories.ts`
  (`Single`, `Multiple`, `WithFilter`, `Grouped`, `Disabled`,
  `InsideFormField`, `DarkMode`)
