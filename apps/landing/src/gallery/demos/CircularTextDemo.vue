<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzCircularText } from '../../motion/index.ts'

/**
 * Circular text demo (catalog `circular-text`, effect 39) — a rotating seal:
 * {@link DzCircularText} lays the label around the rim while a static badge sits
 * at the centre.
 *
 * The curved glyphs are decorative (aria-hidden) with a stable screen-reader copy
 * of the full string, and the ring is a fixed-size box so the spin never shifts
 * layout. Under reduced motion (OS or the page toggle) the ring freezes to static
 * curved text. Replay (harness remount) restarts the rotation.
 */
</script>

<template>
  <div class="stage">
    <div class="seal">
      <DzCircularText
        text="· DESIGN TOKENS · ACCESSIBLE MOTION "
        :radius="74"
        class="ring"
      />
      <div class="hub" aria-hidden="true">
        <DzText size="sm" weight="semibold" class="hub-label">dzup</DzText>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
}

.seal {
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
}

.ring {
  color: var(--dz-colors-primary-600, #4f46e5);
  font-size: var(--dz-font-size-sm, 0.875rem);
  font-weight: var(--dz-font-weight-semibold, 600);
  letter-spacing: 0.04em;
}

/* Static centre badge layered over the rotating ring. */
.hub {
  position: absolute;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--dz-surface, #fff);
  box-shadow: var(--dz-shadow-sm);
  border: 1px solid color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 18%, transparent);
}

.hub-label {
  color: var(--dz-colors-primary-600, #4f46e5);
}
</style>
