<script setup lang="ts">
import { DzText } from '@dzup-ui/core'

/**
 * Progressive blur demo (catalog `progressive-blur`, effect 44) — the
 * `.dz-progressive-blur` utility stacks three masked `backdrop-filter` stops over
 * the bottom edge of a scrolling list, so the rows blur progressively as they
 * approach the edge (a graduated scroll fade). It is static (no motion). Under
 * `prefers-reduced-transparency` the blur is swapped for an opaque surface fade
 * so the rows stay legible.
 */
const rows = [
  'Design tokens · semantic scale',
  'Accessible motion · reduced-motion safe',
  'Backdrop filters · progressive blur',
  'Forced colors · high-contrast ready',
  'Glass surfaces · raised fallback',
  'Particle fields · capped + self-pausing',
  'Meteors · offset diagonal loops',
  'Copy-paste demos · token-only',
]
</script>

<template>
  <div class="stage">
    <div class="scroller">
      <div v-for="row in rows" :key="row" class="row">
        <DzText size="sm">
          {{ row }}
        </DzText>
      </div>
    </div>
    <!-- Pinned to the host's bottom edge; the host clips it. -->
    <div class="dz-progressive-blur" aria-hidden="true" />
    <div class="label">
      <DzText size="xs" tone="muted" as="div">
        Scroll edge fades through layered blur
      </DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: min(280px, 100%);
  height: 188px;
  overflow: hidden;
  border: 1px solid var(--lp-hairline, var(--dz-border, #e2e8f0));
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.scroller {
  height: 100%;
  overflow-y: auto;
  padding: 14px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  padding: 10px 12px;
  border-radius: var(--dz-radius-md, 6px);
  background: color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 10%, var(--dz-muted, #f8fafc));
}

.label {
  position: absolute;
  inset: auto 0 8px 0;
  z-index: 2;
  text-align: center;
  pointer-events: none;
}
</style>
