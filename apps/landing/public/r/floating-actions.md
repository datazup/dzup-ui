# Floating action button & speed dial

Circular elevated affordances — DzFab across tones and variants, and a DzSpeedDial that fans out related shortcuts on open, pinned inside a mock app canvas.

- **Category:** Buttons
- **Components:** DzFab, DzSpeedDial, DzText
- **Preview:** /blocks#floating-actions

```vue
<script setup lang="ts">
import { DzFab, DzSpeedDial, DzText } from '@dzup-ui/core'
import type { DzSpeedDialItem } from '@dzup-ui/core'
import {
  ArrowUp,
  Copy,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * Floating action button & speed dial — the circular, elevated affordances of
 * the Buttons family:
 *   • DzFab — a single persistent primary action, shown across tones/variants.
 *   • DzSpeedDial — a FAB that fans out related shortcuts on open (click the
 *     "＋" in the canvas). Pinned to the canvas corner rather than the viewport
 *     by keeping `position="static"` and letting the parent place it.
 *
 * Self-contained: local state only. Composed from free @dzup-ui/core components
 * and `--dz-*` tokens, so it re-themes light/dark automatically (docs §3.6).
 */

const open = ref(false)

const actions: DzSpeedDialItem[] = [
  { icon: Pencil, label: 'Edit' },
  { icon: Share2, label: 'Share' },
  { icon: Copy, label: 'Duplicate' },
  { icon: Trash2, label: 'Delete', tone: 'danger' },
]
</script>

<template>
  <section class="fa-wrap" aria-label="Floating actions">
    <!-- FAB tones / variants -->
    <div class="fa-col">
      <DzText size="xs" tone="muted" as="p" class="fa-label">Floating action button</DzText>
      <div class="fa-fabs">
        <DzFab :icon="Plus" ariaLabel="Create" tone="primary" />
        <DzFab :icon="Pencil" ariaLabel="Compose" tone="neutral" variant="outline" />
        <DzFab :icon="Sparkles" ariaLabel="Ask AI" tone="info" />
        <DzFab :icon="ArrowUp" ariaLabel="Back to top" tone="neutral" variant="ghost" size="sm" />
        <DzFab :icon="Plus" ariaLabel="Loading" tone="primary" loading />
      </div>
    </div>

    <!-- Speed dial pinned inside a mock canvas -->
    <div class="fa-col">
      <DzText size="xs" tone="muted" as="p" class="fa-label">Speed dial</DzText>
      <div class="fa-canvas">
        <DzText size="sm" tone="muted" as="p" class="fa-canvas-hint">
          Open the dial in the corner →
        </DzText>
        <div class="fa-dial">
          <DzSpeedDial
            v-model:open="open"
            ariaLabel="Quick actions"
            :items="actions"
            direction="up"
            tone="primary"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fa-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: clamp(1.5rem, 5vw, 3rem);
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.fa-col {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.fa-label {
  margin: 0;
  font-weight: var(--dz-font-semibold, 600);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fa-fabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--dz-space-4, 1rem);
}

/* A relative "app surface" so the speed dial pins to a corner like in real use. */
.fa-canvas {
  position: relative;
  width: min(20rem, 100%);
  min-height: 16rem;
  padding: var(--dz-space-4, 1rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background:
    radial-gradient(circle at 100% 100%, color-mix(in oklch, var(--dz-primary, #6366f1) 6%, transparent), transparent 45%),
    var(--dz-surface-muted, var(--dz-surface, #fff));
  overflow: hidden;
}

.fa-canvas-hint {
  margin: 0;
}

.fa-dial {
  position: absolute;
  right: var(--dz-space-4, 1rem);
  bottom: var(--dz-space-4, 1rem);
}
</style>
```
