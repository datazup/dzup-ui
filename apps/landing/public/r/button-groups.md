# Button groups & segmented controls

DzButtonGroup wiring child buttons into connected controls — a live view switcher, a time-range segmented control, and a vertical action group.

- **Category:** Buttons
- **Components:** DzButtonGroup, DzButton, DzText
- **Preview:** /blocks#button-groups

```vue
<script setup lang="ts">
import { DzButton, DzButtonGroup, DzText } from '@dzup-ui/core'
import {
  Archive,
  Calendar,
  Copy,
  Files,
  LayoutGrid,
  LayoutList,
} from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Button groups & segmented controls — DzButtonGroup wiring child DzButtons into
 * a single connected control (shared `size` / `variant` / `tone` via injection,
 * with the inner corners and borders merged).
 *
 * Shows the three everyday shapes:
 *   • a live segmented "view switcher" (the selected segment overrides the
 *     group's variant/tone to read as active),
 *   • a live time-range segmented control,
 *   • a vertical action group.
 *
 * Self-contained: local state only. Composed from free @dzup-ui/core components
 * and `--dz-*` tokens, so it re-themes light/dark automatically (docs §3.6).
 */

const view = ref<'list' | 'board' | 'calendar'>('board')
const range = ref<'day' | 'week' | 'month' | 'year'>('week')
</script>

<template>
  <section class="bgr-wrap" aria-label="Button groups">
    <!-- View switcher -->
    <div class="bgr-group">
      <DzText size="xs" tone="muted" as="p" class="bgr-label">View switcher</DzText>
      <DzButtonGroup size="sm" variant="outline" tone="neutral" aria-label="Select view">
        <DzButton
          :variant="view === 'list' ? 'solid' : undefined"
          :tone="view === 'list' ? 'primary' : undefined"
          @click="view = 'list'"
        >
          <template #prefix><LayoutList :size="15" aria-hidden="true" /></template>
          List
        </DzButton>
        <DzButton
          :variant="view === 'board' ? 'solid' : undefined"
          :tone="view === 'board' ? 'primary' : undefined"
          @click="view = 'board'"
        >
          <template #prefix><LayoutGrid :size="15" aria-hidden="true" /></template>
          Board
        </DzButton>
        <DzButton
          :variant="view === 'calendar' ? 'solid' : undefined"
          :tone="view === 'calendar' ? 'primary' : undefined"
          @click="view = 'calendar'"
        >
          <template #prefix><Calendar :size="15" aria-hidden="true" /></template>
          Calendar
        </DzButton>
      </DzButtonGroup>
    </div>

    <!-- Time range -->
    <div class="bgr-group">
      <DzText size="xs" tone="muted" as="p" class="bgr-label">Time range</DzText>
      <DzButtonGroup size="sm" variant="outline" tone="neutral" aria-label="Select time range">
        <DzButton
          v-for="r in (['day', 'week', 'month', 'year'] as const)"
          :key="r"
          :variant="range === r ? 'solid' : undefined"
          :tone="range === r ? 'primary' : undefined"
          @click="range = r"
        >
          {{ r.charAt(0).toUpperCase() + r.slice(1) }}
        </DzButton>
      </DzButtonGroup>
    </div>

    <!-- Vertical action group -->
    <div class="bgr-group">
      <DzText size="xs" tone="muted" as="p" class="bgr-label">Vertical group</DzText>
      <DzButtonGroup orientation="vertical" size="sm" variant="outline" tone="neutral" aria-label="Row actions">
        <DzButton>
          <template #prefix><Copy :size="15" aria-hidden="true" /></template>
          Copy
        </DzButton>
        <DzButton>
          <template #prefix><Files :size="15" aria-hidden="true" /></template>
          Duplicate
        </DzButton>
        <DzButton>
          <template #prefix><Archive :size="15" aria-hidden="true" /></template>
          Archive
        </DzButton>
      </DzButtonGroup>
    </div>
  </section>
</template>

<style scoped>
.bgr-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: clamp(1.5rem, 5vw, 3rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.bgr-group {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.bgr-label {
  margin: 0;
  font-weight: var(--dz-font-semibold, 600);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
```
