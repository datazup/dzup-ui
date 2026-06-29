# Detail descriptions panel

A read-only label/value record view built from DzDescriptions — a responsive, bordered term/definition grid with slot-rich values (status badge, plan and label tags, monospaced payment) and a full-width spanning row.

- **Category:** Data display
- **Components:** DzDescriptions, DzDescriptionsItem, DzBadge, DzTag, DzButton, DzText, DzCard
- **Preview:** /blocks#detail-descriptions

```vue
<script setup lang="ts">
/**
 * Detail / descriptions panel — a read-only label/value record view.
 *
 * DzDescriptions renders a responsive, bordered term/definition grid; each
 * DzDescriptionsItem owns one label/value pair and can hold slot-rich values —
 * a DzBadge for status, DzTag chips for plan/labels, monospaced payment text —
 * so a record reads cleanly without a bespoke layout. Spans let the notes row
 * stretch the full width.
 *
 * Self-contained: local static data. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDescriptions,
  DzDescriptionsItem,
  DzHeading,
  DzTag,
  DzText,
} from '@dzup-ui/core'
</script>

<template>
  <section class="dd-wrap" aria-labelledby="dd-title">
    <DzCard variant="outlined" padding="lg">
      <header class="dd-head">
        <div>
          <DzHeading id="dd-title" :level="4" size="md" weight="semibold" class="dd-title">Subscription #DZ-4821</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="dd-sub">Created 14 Mar 2026 · Acme Inc.</DzText>
        </div>
        <DzButton variant="outline" tone="neutral" size="sm">Edit</DzButton>
      </header>

      <DzDescriptions :columns="{ base: 1, sm: 2 }" layout="horizontal" bordered size="md">
        <DzDescriptionsItem label="Status">
          <DzBadge variant="subtle" tone="success" size="sm">Active</DzBadge>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Plan">
          <DzTag variant="subtle" tone="primary" size="sm">Scale · annual</DzTag>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Customer">
          <DzText size="sm" as="span">Ava Restić</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Seats">
          <DzText size="sm" as="span">42 of 50</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Amount">
          <DzText size="sm" weight="medium" as="span">$1,290.00 / yr</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Payment">
          <DzText size="sm" as="span" class="dd-mono">Visa •••• 4242</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Renews">
          <DzText size="sm" as="span">14 Mar 2027</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Owner">
          <DzText size="sm" as="span">platform-team</DzText>
        </DzDescriptionsItem>

        <DzDescriptionsItem label="Labels" :span="2">
          <span class="dd-tags">
            <DzTag variant="outline" tone="neutral" size="sm">enterprise</DzTag>
            <DzTag variant="outline" tone="neutral" size="sm">priority-support</DzTag>
            <DzTag variant="outline" tone="neutral" size="sm">net-30</DzTag>
          </span>
        </DzDescriptionsItem>
      </DzDescriptions>
    </DzCard>
  </section>
</template>

<style scoped>
.dd-wrap {
  background: var(--dz-background, #fff);
  max-width: 44rem;
  margin: 0 auto;
}

.dd-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
  flex-wrap: wrap;
}

.dd-title {
  margin: 0;
}

.dd-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.dd-mono {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
}

.dd-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
}
</style>
```
