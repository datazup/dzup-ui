# DzMasonry Contract

## Purpose

`DzMasonry` renders responsive cascading-column layouts for variable-height
content such as galleries, cards, or feeds. It supports a source-order-preserving
CSS column mode and a measured balancing mode.

## API Surface

- Source: `packages/core/src/components/layout/DzMasonry.vue`
- Types: `DzMasonryProps`, `DzMasonrySlots`, `MasonryColumns`,
  `MasonryGap`, `ResponsiveColumns`
- Public export: `packages/core/src/components/layout/index.ts`
- Key props: `columns`, `gap`, `sequential`, `ordered`, `as`
- Slots: `default`

## Usage

```vue
<DzMasonry :columns="{ xs: 1, md: 3, xl: 4 }" gap="md" aria-label="Gallery">
  <GalleryCard v-for="item in items" :key="item.id" :item="item" />
</DzMasonry>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/layout/DzMasonry.contract.spec.ts`
- Unit tests: `packages/core/src/components/layout/DzMasonry.spec.ts`
- Storybook/VRT reference: `packages/core/stories/layout/DzMasonry.stories.ts`
  (`Default`, `Image Wall`, `Card Feed`, `Responsive Columns`, `With Gap`,
  `Dark Mode Preview`)
