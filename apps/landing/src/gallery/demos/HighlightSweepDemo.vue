<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { useInView, useReducedMotion } from '../../motion/index.ts'

/**
 * Highlight sweep demo (catalog `highlight-sweep`, effect 11) — a marker grows
 * behind an emphasised word when the line scrolls into view, using the
 * `.dz-highlight-sweep` CSS utility (tokens.css).
 *
 * The marker is a transform:scaleX pseudo-element (GPU-cheap, no layout thrash)
 * sitting behind the text via z-index; the text itself is untouched, so it stays
 * fully readable and selectable. The `--in` class (added on view) plays the
 * grow; reduced motion (OS or the page-level toggle) shows a static, full marker
 * via `--reduced` / the @media block. Replay (remount) re-runs the sweep.
 */
const root = ref<HTMLElement | null>(null)
const isInView = useInView(root, { once: false })
const reduced = useReducedMotion()

const markClasses = computed(() => ({
  'dz-highlight-sweep': true,
  'dz-highlight-sweep--in': isInView.value,
  'dz-highlight-sweep--reduced': reduced.value,
}))
</script>

<template>
  <div ref="root" class="stage">
    <DzText size="lg" weight="medium" as="p" class="line">
      Motion that feels
      <strong :class="markClasses">effortless</strong>
    </DzText>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 64px;
}

.line {
  margin: 0;
  text-align: center;
}

.line strong {
  font-weight: var(--dz-font-weight-semibold, 600);
}
</style>
