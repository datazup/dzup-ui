# Result screens

Full-page outcome screens from DzResult — a segmented switch across the success / error / warning / info statuses, each with its own icon, copy and contextual action buttons.

- **Category:** Feedback
- **Components:** DzResult, DzCard, DzButton
- **Preview:** /blocks/result-states

```vue
<script setup lang="ts">
import type { ResultStatus } from '@dzup-ui/core'
import { DzButton, DzCard, DzResult } from '@dzup-ui/core'
/**
 * Result states — full-page outcome screens from DzResult.
 *
 * A framed result panel with a segmented switch across the DzResult status
 * set (success / error / warning / info). Each status drives its own icon,
 * title and description, plus contextual `#actions` buttons — the pattern for
 * post-checkout, failed-payment, access-denied and maintenance screens.
 *
 * Self-contained: local reactive state. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { computed, ref } from 'vue'

interface ResultContent {
  status: ResultStatus
  label: string
  title: string
  description: string
}

const RESULTS: ResultContent[] = [
  { status: 'success', label: 'Success', title: 'Payment complete', description: 'Order #DZ-4821 is confirmed — a receipt is on its way to your inbox.' },
  { status: 'error', label: 'Error', title: 'Payment failed', description: 'Your card was declined. No charge was made; try another payment method.' },
  { status: 'warning', label: 'Warning', title: 'Session expiring', description: 'You have unsaved changes and will be signed out in 2 minutes.' },
  { status: 'info', label: 'Info', title: 'Under maintenance', description: 'Reports are read-only while we run a scheduled upgrade until 14:00 UTC.' },
]

const [fallback] = RESULTS as [ResultContent, ...ResultContent[]]
const active = ref<ResultStatus>('success')
const current = computed<ResultContent>(
  () => RESULTS.find(result => result.status === active.value) ?? fallback,
)
</script>

<template>
  <section class="rs-wrap" aria-labelledby="rs-title">
    <div class="rs-switch" role="tablist" aria-label="Result status">
      <DzButton
        v-for="result in RESULTS"
        :key="result.status"
        role="tab"
        :aria-selected="active === result.status"
        size="sm"
        :variant="active === result.status ? 'solid' : 'outline'"
        tone="neutral"
        @click="active = result.status"
      >
        {{ result.label }}
      </DzButton>
    </div>

    <DzCard variant="outlined" padding="lg" class="rs-panel">
      <DzResult
        id="rs-title"
        :status="current.status"
        :title="current.title"
        :description="current.description"
      >
        <template #actions>
          <DzButton v-if="current.status === 'success'" tone="primary">
            View order
          </DzButton>
          <DzButton v-else-if="current.status === 'error'" tone="primary">
            Try again
          </DzButton>
          <DzButton v-else-if="current.status === 'warning'" tone="primary">
            Stay signed in
          </DzButton>
          <DzButton v-else tone="primary">
            View status page
          </DzButton>
          <DzButton variant="outline" tone="neutral">
            Back to home
          </DzButton>
        </template>
      </DzResult>
    </DzCard>
  </section>
</template>

<style scoped>
.rs-wrap {
  background: var(--dz-background, #fff);
  max-width: 36rem;
  margin: 0 auto;
}

.rs-switch {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.rs-panel {
  display: flex;
  justify-content: center;
}
</style>
```
