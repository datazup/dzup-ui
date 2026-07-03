# DzPanel Contract

## Purpose

`DzPanel` is a titled container with optional header actions and collapse
behavior. It fills the gap between `DzCard` and `DzAccordion`: a single framed
section for forms, settings, or inspectors. The `legend` variant is the
documented fieldset substitute; there is no runtime `DzFieldset` component.

## API Surface

- Source: `packages/core/src/components/layout/DzPanel.vue`
- Types: `DzPanelProps`, `DzPanelEmits`, `DzPanelSlots`
- Public export: `packages/core/src/components/layout/index.ts`
- Model: `v-model:collapsed` as `boolean`
- Key props: `header`, `collapsible`, `as`, `size`, `variant`, `tone`,
  accessibility props
- Variants: `outlined`, `elevated`, `legend`
- Events: `toggle`
- Slots: `default`, `header`, `actions`

## Usage

```vue
<DzPanel header="Billing details" variant="legend" collapsible v-model:collapsed="collapsed">
  <template #actions>
    <DzButton size="sm" variant="ghost">Edit</DzButton>
  </template>
  <BillingForm />
</DzPanel>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/layout/DzPanel.contract.spec.ts`
- Unit tests: `packages/core/src/components/layout/DzPanel.spec.ts`
- Storybook/VRT reference: `packages/core/stories/layout/DzPanel.stories.ts`
  (`Outlined`, `Elevated`, `Collapsible`, `Legend / Fieldset`,
  `With Actions`, `Dark Mode Preview`)
