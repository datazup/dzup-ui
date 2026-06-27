# DzBadge Contract

## Purpose

`DzBadge` is a compact label for status, counts, categories, and short semantic
metadata. It should stay terse and inline with surrounding text or controls.

## API Surface

- Source: `packages/core/src/components/feedback/DzBadge.vue`
- Types: `DzBadgeProps`, `DzBadgeSlots`
- Public export: `packages/core/src/components/feedback/index.ts`
- Key props: `variant`, `tone`, `size`
- Variants: `solid`, `outline`, `subtle`
- Slots: `default`

## Usage

```vue
<DzBadge tone="success" variant="subtle" size="sm">
  Active
</DzBadge>
```

## Visual And Test References

- Contract tests: `packages/core/src/components/feedback/DzBadge.contract.spec.ts`
- Unit tests: `packages/core/src/components/feedback/DzBadge.spec.ts`
- Storybook/VRT reference: `packages/core/stories/feedback/DzBadge.stories.ts`
  (`Default`, variant/size/tone galleries, matrix, slots, semantic usage,
  status labels, tag cloud)
