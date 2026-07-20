<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzCursor, useReducedMotion } from '../../motion/index.ts'

/**
 * Custom cursor demo (catalog `custom-cursor`, effect 49) — a soft brand blob
 * that trails the pointer inside a host region via {@link DzCursor}. The blob
 * eases toward the cursor each frame (transform only, rAF) and the native cursor
 * is hidden inside the region while it is live, restored on leave. Touch +
 * keyboard keep the native cursor (no blob); under reduced motion (OS or page
 * toggle, via `disabled`) the blob never activates. The blob is non-interactive,
 * so it never traps the pointer.
 */
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage">
    <DzCursor :disabled="reduced" :size="36" class="region">
      <DzHeading :level="4" size="lg" weight="bold">
        Move inside
      </DzHeading>
      <DzText size="sm" tone="muted">
        A blob trails the pointer; native cursor returns on leave.
      </DzText>
      <a class="region__link" href="#" @click.prevent>Links stay clickable</a>
    </DzCursor>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
}

.region {
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-2, 0.5rem);
  align-items: center;
  text-align: center;
  width: min(320px, 100%);
  min-height: 150px;
  justify-content: center;
  padding: var(--dz-spacing-6, 1.5rem);
  border-radius: var(--dz-radius-lg, 0.75rem);
  border: 1px solid var(--dz-border, #b5b7bb);
  background: var(--dz-surface-subtle, var(--dz-surface, #ffffff));
}

.region__link {
  color: var(--dz-primary, #0766ee);
  font-weight: 600;
  font-size: var(--dz-text-sm, 0.875rem);
}
.region__link:focus-visible {
  outline: var(--dz-focus-ring-width, 2px) solid var(--dz-primary, #0766ee);
  outline-offset: 2px;
}
</style>
