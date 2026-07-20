<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { supportsScrollTimeline, useReducedMotion, useScrollProgress } from '../../motion/index.ts'

/**
 * Scroll-linked transforms demo (catalog `scroll-linked`, effect 54) — a
 * modernised parallax: two layers whose transform/opacity are bound to the
 * element's progress through the viewport. Where CSS scroll-driven animations
 * exist, the binding runs on the compositor via `animation-timeline: view()` (the
 * `.dz-scroll-linked` rules in tokens.css) — the back layer drifts, the foreground
 * fades + rises as it enters. Everywhere else {@link useScrollProgress} drives the
 * same transforms inline from JS.
 *
 * The un-enhanced state is the static, fully-resolved end-state (visible, no
 * transform), so reduced motion and unsupported engines are always correct. Scroll
 * the page to see the layers move.
 */
const reduced = useReducedMotion()
const native = supportsScrollTimeline()

const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root)

/** Capped parallax travel (mirrors --dz-anim-scroll-parallax in tokens.css). */
const PARALLAX = 40

// JS floor — only applied when the native CSS path is absent and motion is
// allowed. Native path: the CSS animation owns it (return {}). Reduced motion:
// static end-state (return {}).
const backStyle = computed(() => {
  if (native || reduced.value)
    return {}
  const y = (progress.value - 0.5) * 2 * PARALLAX
  return { transform: `translate3d(0, ${y.toFixed(1)}px, 0)`, willChange: 'transform' }
})

const foreStyle = computed(() => {
  if (native || reduced.value)
    return {}
  const eased = Math.min(1, progress.value / 0.5)
  const y = (1 - eased) * 24
  return {
    opacity: eased.toFixed(3),
    transform: `translate3d(0, ${y.toFixed(1)}px, 0)`,
    willChange: 'transform, opacity',
  }
})

const rootClass = computed(() => ({
  'dz-scroll-linked': true,
  'dz-scroll-linked--native': native,
  'dz-scroll-linked--reduced': reduced.value,
}))
</script>

<template>
  <div class="wrap">
    <div ref="root" :class="rootClass" class="stage">
      <div class="dz-scroll-linked__back" :style="backStyle" aria-hidden="true" />
      <div class="dz-scroll-linked__fore fore" :style="foreStyle">
        <DzText weight="semibold" as="div">
          Scroll-linked
        </DzText>
        <DzText size="xs" tone="muted" as="div">
          Transform &amp; opacity bound to scroll.
        </DzText>
      </div>
    </div>
    <DzText size="xs" tone="muted" as="div" class="hint">
      Scroll the page — layers track your position.
    </DzText>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 150px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #ffffff);
}

/* Back layer — oversized so the capped drift never reveals an edge. */
.dz-scroll-linked__back {
  position: absolute;
  inset: -28% -10%;
  background:
    radial-gradient(circle at 28% 30%, color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 42%, transparent), transparent 56%),
    radial-gradient(circle at 74% 72%, color-mix(in oklch, var(--dz-colors-secondary-500, #7260bd) 42%, transparent), transparent 56%);
  filter: blur(6px);
}

.fore {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 16px;
}
</style>
