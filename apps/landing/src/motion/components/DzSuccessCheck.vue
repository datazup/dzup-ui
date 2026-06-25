<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzSuccessCheck — draws an SVG ring then a tick (stroke-dashoffset) with a small
 * scale pop to confirm a completed action (docs/animations.md §6.9, effect 33).
 * Flip `active` to `true` once the action resolves (e.g. after a form submit) and
 * the mark draws itself in; the `.dz-check` class system in `tokens.css` owns the
 * motion, so this component only renders the geometry and toggles `--in`.
 *
 * Tone defaults to `success`; any canonical tone token works. Under reduced motion
 * (OS or the page-level toggle) the mark appears fully drawn instantly with no
 * sweep or pop — bound here via {@link useReducedMotion} for the live toggle; the
 * OS setting is also handled centrally in `tokens.css`.
 */
const props = withDefaults(
  defineProps<{
    /** When `true`, the mark draws in; while `false` it stays hidden. */
    active?: boolean
    /** Diameter of the mark in pixels. */
    size?: number
    /** Semantic tone token used for the stroke (default `success`). */
    tone?: 'success' | 'primary' | 'info' | 'warning' | 'danger'
    /** Accessible label announced for the mark. */
    label?: string
  }>(),
  { active: false, size: 64, tone: 'success', label: 'Done' },
)

const reduced = useReducedMotion()

const rootStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  color: `var(--dz-${props.tone}, #16a34a)`,
}))
</script>

<template>
  <span
    class="dz-check"
    :class="{ 'dz-check--in': active, 'dz-check--reduced': reduced }"
    :style="rootStyle"
    :role="active ? 'img' : undefined"
    :aria-label="active ? label : undefined"
    :aria-hidden="active ? undefined : 'true'"
  >
    <svg viewBox="0 0 52 52" width="100%" height="100%" aria-hidden="true">
      <g class="dz-check__ring">
        <circle class="dz-check__circle" cx="26" cy="26" r="24" stroke-width="2.5" />
        <path class="dz-check__tick" d="M16 27 l7.5 7.5 L38 18" stroke-width="3.2" />
      </g>
    </svg>
  </span>
</template>
