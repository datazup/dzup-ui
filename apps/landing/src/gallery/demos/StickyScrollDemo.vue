<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { supportsScrollTimeline, useReducedMotion, useSticky } from '../../motion/index.ts'

/**
 * Sticky / pinned scroll demo (catalog `sticky-scroll`, effect 53) — a panel that
 * pins (`position: sticky`) inside a self-contained scroll region while its
 * content advances through steps. The progress bar is the continuous scroll-linked
 * motion: where supported it runs on the compositor via `animation-timeline:
 * scroll()` (the `.dz-sticky--native` rule in tokens.css), bound to this demo's
 * own scroller; everywhere else {@link useSticky} fills it from JS. The discrete
 * active-step index is derived from the same progress in both paths.
 *
 * Reduced motion → normal stacked flow: the steps render as a plain list with no
 * pin, no scroll-linked bar (docs/animations.md §5.6).
 */
const reduced = useReducedMotion()
const native = supportsScrollTimeline()

const scroller = ref<HTMLElement | null>(null)
const progress = useSticky(scroller)

const steps = [
  { n: '01', title: 'Connect', body: 'Point dzup at your source — tokens load instantly.' },
  { n: '02', title: 'Compose', body: 'Drop in token-driven blocks; motion is built in.' },
  { n: '03', title: 'Ship', body: 'Accessible, themeable UI — light and dark, day one.' },
]

const active = computed(() => {
  const i = Math.floor(progress.value * steps.length)
  return Math.min(steps.length - 1, Math.max(0, i))
})

// The active step, guaranteed present (active is clamped to a valid index).
const current = computed(() => steps[active.value]!)

// JS floor: the bar reads --sticky-progress (scaleX). The native path overrides
// it with a scroll()-driven animation, so this is harmless where that applies.
const barStyle = computed(() => ({ '--sticky-progress': progress.value.toFixed(3) }))

const stickyClass = computed(() => ({
  'sticky': true,
  'dz-sticky--native': native,
  'dz-sticky--reduced': reduced.value,
}))
</script>

<template>
  <!-- Reduced motion → normal stacked flow, no pin, no scroll-linked motion. -->
  <div v-if="reduced" class="stacked">
    <div v-for="step in steps" :key="step.n" class="stacked-step">
      <span class="num">{{ step.n }}</span>
      <div>
        <DzText weight="semibold" size="sm" as="div">
          {{ step.title }}
        </DzText>
        <DzText size="xs" tone="muted" as="div">
          {{ step.body }}
        </DzText>
      </div>
    </div>
  </div>

  <!-- Pinned scroll: scroll inside the region to advance the steps. -->
  <div v-else :class="stickyClass">
    <div ref="scroller" class="scroller">
      <div class="track">
        <div class="pinned">
          <DzText size="xs" tone="muted" as="div" class="eyebrow">
            Step {{ active + 1 }} / {{ steps.length }}
          </DzText>
          <div class="num num--lg">
            {{ current.n }}
          </div>
          <DzText weight="semibold" as="div">
            {{ current.title }}
          </DzText>
          <DzText size="xs" tone="muted" as="p" class="body">
            {{ current.body }}
          </DzText>

          <div class="bar-track" aria-hidden="true">
            <div class="dz-sticky__bar bar" :style="barStyle" />
          </div>

          <div class="dots" aria-hidden="true">
            <span
              v-for="(step, i) in steps"
              :key="step.n"
              class="dot"
              :class="{ 'dot--on': i <= active }"
            />
          </div>
        </div>
      </div>
    </div>
    <DzText size="xs" tone="muted" as="div" class="hint">
      Scroll inside the panel ↑↓
    </DzText>
  </div>
</template>

<style scoped>
.sticky {
  --stick-h: 188px;
  width: 100%;
}

.scroller {
  height: var(--stick-h);
  overflow-y: auto;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline, var(--dz-border, #b5b7bb));
  background: var(--dz-surface, #ffffff);
}

/* Tall track creates the scroll distance the pinned panel advances through. */
.track {
  position: relative;
  height: calc(var(--stick-h) * 3);
}

.pinned {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: var(--stick-h);
  padding: 16px 18px;
  box-sizing: border-box;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6em;
  height: 1.6em;
  border-radius: var(--dz-radius-sm, 0.25rem);
  background: color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 14%, transparent);
  color: var(--dz-colors-primary-600, #004ecb);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: var(--dz-text-xs, 0.75rem);
}

.num--lg {
  font-size: var(--dz-text-2xl, 1.5rem);
  min-width: auto;
  height: auto;
  padding: 0;
  background: none;
  color: var(--dz-colors-primary-500, #0766ee);
}

.body {
  margin: 0;
  line-height: 1.55;
}

.bar-track {
  margin-top: auto;
  height: 4px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 16%, transparent);
  overflow: hidden;
}

/* `.dz-sticky__bar` (tokens.css) owns the scaleX transform — JS-driven by default,
 * scroll()-driven on the native path. This rule only adds the paint. */
.bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    var(--dz-colors-primary-500, #0766ee),
    var(--dz-colors-secondary-500, #7260bd)
  );
}

.dots {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: var(--dz-radius-full, 9999px);
  background: color-mix(in oklch, var(--dz-colors-primary-500, #0766ee) 22%, transparent);
  transition: background-color var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out);
}

.dot--on {
  background: var(--dz-colors-primary-500, #0766ee);
}

.hint {
  margin-top: 8px;
  text-align: center;
}

/* Reduced-motion stacked flow. */
.stacked {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.stacked-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline, var(--dz-border, #b5b7bb));
  background: var(--dz-surface, #ffffff);
}
</style>
