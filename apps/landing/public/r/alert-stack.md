# Alert stack

A column of inline DzAlerts spanning the variant taxonomy and tones — info, success with an actions row, a closable warning, and a dismissible filled danger alert that can be restored.

- **Category:** Feedback
- **Components:** DzAlert, DzButton, DzHeading, DzText
- **Preview:** /blocks#alert-stack

```vue
<script setup lang="ts">
/**
 * Alert stack — inline DzAlert messages across tones and variants.
 *
 * A vertical column of contextual alerts that exercises the AlertVariant
 * taxonomy (subtle / outline / filled), every relevant tone, the `#actions`
 * slot, leading icons, and the live `closable` + `@close` flow (the danger
 * alert can be dismissed and restored).
 *
 * Self-contained: local reactive state. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { ref } from 'vue'
import { CheckCircle2, Info, ShieldAlert, TriangleAlert } from 'lucide-vue-next'
import { DzAlert, DzButton, DzHeading, DzText } from '@dzup-ui/core'

const showDanger = ref(true)
</script>

<template>
  <section class="as-wrap" aria-labelledby="as-title">
    <header class="as-head">
      <DzHeading id="as-title" :level="4" size="md" weight="semibold" class="as-title">Alerts</DzHeading>
      <DzText size="sm" tone="muted" as="p" class="as-sub">
        Inline contextual feedback across every tone and variant.
      </DzText>
    </header>

    <div class="as-stack">
      <DzAlert variant="subtle" tone="info" :icon="Info" title="Heads up">
        A refreshed dashboard layout is rolling out next week. No action needed on your part.
      </DzAlert>

      <DzAlert variant="outline" tone="success" :icon="CheckCircle2" title="Payment received">
        We've emailed your receipt for invoice <strong>#DZ-4821</strong>.
        <template #actions>
          <DzButton size="sm" variant="solid" tone="success">View invoice</DzButton>
          <DzButton size="sm" variant="ghost" tone="success">Download PDF</DzButton>
        </template>
      </DzAlert>

      <DzAlert variant="subtle" tone="warning" :icon="TriangleAlert" title="Approaching your limit" closable>
        You've used 86% of this month's API quota. Upgrade your plan to avoid request throttling.
      </DzAlert>

      <DzAlert
        v-if="showDanger"
        variant="filled"
        tone="danger"
        :icon="ShieldAlert"
        title="Couldn't save changes"
        closable
        @close="showDanger = false"
      >
        The connection timed out before your edits were stored. Check your network and try again.
      </DzAlert>
      <div v-else class="as-restore">
        <DzText size="sm" tone="muted" as="span">Danger alert dismissed.</DzText>
        <DzButton size="sm" variant="outline" tone="neutral" @click="showDanger = true">Restore</DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.as-wrap {
  background: var(--dz-background, #fff);
  max-width: 40rem;
  margin: 0 auto;
}

.as-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.as-title {
  margin: 0;
}

.as-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.as-stack {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.as-restore {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-3, 0.75rem) var(--dz-space-4, 1rem);
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 0.5rem);
}
</style>
```
