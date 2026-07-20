<script setup lang="ts">
import { DzButton, DzText } from '@dzup-ui/core'
import { Bell } from 'lucide-vue-next'
import { ref } from 'vue'
import { DzPresence, useReducedMotion } from '../../motion/index.ts'

/**
 * Presence exit demo (catalog `presence-exit`, Task N2) — a pure-CSS leave
 * animation that actually gets to play. `DzPresence` keeps the closing panel
 * mounted while its `data-state="closed"` animation runs, then unmounts it; the
 * whole transition is authored in CSS keyed on `data-[state]`, with no JS timing.
 *
 * Reduced motion: `DzPresence` skips the keep-alive wait under reduced motion (OS
 * or the page-level toggle), so the panel mounts/unmounts instantly. We also zero
 * the `[data-state]` animations under the page toggle so the enter is instant too.
 * Transform/opacity only.
 */
const open = ref(true)
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage" :class="{ 'stage--reduced': reduced }">
    <DzButton size="sm" variant="outline" tone="primary" :aria-expanded="open" @click="open = !open">
      {{ open ? 'Dismiss' : 'Show notification' }}
    </DzButton>

    <div class="slot">
      <DzPresence :present="open">
        <div class="panel" role="status">
          <span class="icon" aria-hidden="true"><Bell :size="16" /></span>
          <span class="copy">
            <DzText size="sm" weight="semibold" as="span">Deployment live</DzText>
            <DzText size="xs" tone="muted" as="span">CI · 2m 14s · main</DzText>
          </span>
        </div>
      </DzPresence>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: min(320px, 100%);
}

/* Reserve room so toggling the panel never shifts the button. */
.slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
}

.panel {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #ffffff);
  box-shadow: var(--dz-shadow-md, 0 4px 12px rgb(15 23 42 / 0.08));
}

.icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #0766ee);
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 12%, transparent);
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* The data-[state] convention: DzPresence stamps data-state onto the panel. Enter
   pops in (decelerate); exit drops out (accelerate) before DzPresence unmounts.
   Transform/opacity only. */
.panel[data-state='open'] {
  animation: dz-presence-in var(--dz-anim-duration-enter, 225ms)
    var(--dz-anim-ease-entrance, cubic-bezier(0, 0, 0.2, 1)) both;
}
.panel[data-state='closed'] {
  animation: dz-presence-out var(--dz-anim-duration-exit, 195ms)
    var(--dz-anim-ease-exit, cubic-bezier(0.4, 0, 1, 1)) both;
}

@keyframes dz-presence-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}
@keyframes dz-presence-out {
  to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}

/* Page-level "Reduce motion" toggle (JS) → instant in/out (OS reduced motion is
   zeroed globally; DzPresence also skips the keep-alive wait under reduced). */
.stage--reduced .panel[data-state] {
  animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .panel[data-state] {
    animation: none !important;
  }
}
</style>
