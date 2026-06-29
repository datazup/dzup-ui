# Loading states

A content card that flips between loading and loaded — an indeterminate DzProgress bar and a DzSpinner status row over a DzSkeleton scaffold (circular, text and rectangular) that mirrors the real layout. "Reload" replays it.

- **Category:** Feedback
- **Components:** DzSkeleton, DzSpinner, DzProgress, DzCard, DzAvatar, DzButton, DzHeading, DzText
- **Preview:** /blocks#loading-states

```vue
<script setup lang="ts">
/**
 * Loading states — skeleton placeholders, spinner and indeterminate progress.
 *
 * A content card that flips between a loading and a loaded view. While loading
 * it shows a DzProgress indeterminate bar, a DzSpinner status row, and a
 * skeleton scaffold (circular avatar + text lines + a rectangular media block)
 * that mirrors the real layout to avoid content shift. "Reload" replays the
 * load with a short timer.
 *
 * Self-contained: local reactive state + a timeout. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DzAvatar, DzButton, DzCard, DzHeading, DzProgress, DzSkeleton, DzSpinner, DzText } from '@dzup-ui/core'

const loading = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

function reload() {
  loading.value = true
  if (timer)
    clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
  }, 2200)
}

onMounted(reload)
onBeforeUnmount(() => {
  if (timer)
    clearTimeout(timer)
})
</script>

<template>
  <section class="ls-wrap" aria-labelledby="ls-title">
    <DzCard variant="outlined" padding="lg">
      <header class="ls-head">
        <div>
          <DzHeading id="ls-title" :level="4" size="md" weight="semibold" class="ls-title">Latest report</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="ls-sub">Generated from your most recent run.</DzText>
        </div>
        <DzButton size="sm" variant="outline" tone="neutral" :disabled="loading" @click="reload">
          {{ loading ? 'Loading…' : 'Reload' }}
        </DzButton>
      </header>

      <!-- Live status while loading: indeterminate bar + spinner -->
      <div v-if="loading" class="ls-status" aria-live="polite">
        <DzProgress indeterminate tone="primary" size="sm" aria-label="Loading report" />
        <div class="ls-spin-row">
          <DzSpinner size="sm" tone="primary" label="Loading report" />
          <DzText size="sm" tone="muted" as="span">Crunching the numbers…</DzText>
        </div>
      </div>

      <!-- Skeleton scaffold mirrors the loaded layout -->
      <div v-if="loading" class="ls-media">
        <div class="ls-person">
          <DzSkeleton variant="circular" width="2.5rem" height="2.5rem" />
          <div class="ls-person-lines">
            <DzSkeleton variant="text" width="40%" />
            <DzSkeleton variant="text" width="24%" />
          </div>
        </div>
        <DzSkeleton variant="rectangular" width="100%" height="7rem" />
        <DzSkeleton variant="text" :lines="3" />
      </div>

      <!-- Loaded content -->
      <div v-else class="ls-media">
        <div class="ls-person">
          <DzAvatar fallback="AR" alt="Ava Restić" size="md" />
          <div class="ls-person-lines">
            <DzText weight="medium" as="p" class="ls-line">Ava Restić</DzText>
            <DzText size="sm" tone="muted" as="p" class="ls-line">Updated just now</DzText>
          </div>
        </div>
        <div class="ls-chart" aria-hidden="true">
          <span v-for="(h, i) in [54, 72, 40, 88, 63, 78, 50]" :key="i" class="ls-bar" :style="{ height: `${h}%` }" />
        </div>
        <DzText size="sm" tone="muted" as="p" class="ls-body">
          Conversion held steady at 4.8% week over week, with mobile sessions up 12%. Checkout
          drop-off fell after the new payment sheet shipped on Tuesday.
        </DzText>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.ls-wrap {
  background: var(--dz-background, #fff);
  max-width: 30rem;
  margin: 0 auto;
}

.ls-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.ls-title {
  margin: 0;
}

.ls-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.ls-status {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: var(--dz-space-4, 1rem);
}

.ls-spin-row {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.ls-media {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-4, 1rem);
}

.ls-person {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.ls-person-lines {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  flex: 1;
}

.ls-line {
  margin: 0;
}

.ls-chart {
  display: flex;
  align-items: flex-end;
  gap: var(--dz-space-2, 0.5rem);
  height: 7rem;
  padding: var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-md, 0.5rem);
  background: color-mix(in oklch, var(--dz-primary) 6%, var(--dz-background, #fff));
}

.ls-bar {
  flex: 1;
  border-radius: var(--dz-radius-sm, 0.25rem);
  background: var(--dz-primary, #6366f1);
  opacity: 0.85;
}

.ls-body {
  margin: 0;
  line-height: 1.6;
}
</style>
```
