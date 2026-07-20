<script setup lang="ts">
import { ref, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzFlip — flips its content with a half-turn on the X axis whenever the bound
 * `value` changes (docs/animations.md §6.6, effect 26). Wrap a DzBadge / DzTag
 * (or any value) and pass the same reactive value to `value`; on each update the
 * face is remounted (a bumped `:key`) so the `.dz-flip__face` keyframe in
 * `tokens.css` re-runs. Transform/opacity only.
 *
 * Under reduced motion (OS or the page-level toggle) the value swaps instantly
 * with no turn — bound here via {@link useReducedMotion} for the live toggle; the
 * OS setting is also handled centrally in `tokens.css`.
 */
const props = defineProps<{
  /** The value to watch — when it changes, the content flips to the new state. */
  value: string | number
}>()

const reduced = useReducedMotion()

// Bumped on every value change so the face remounts and the flip keyframe replays.
const flipKey = ref(0)
watch(
  () => props.value,
  () => {
    flipKey.value += 1
  },
)
</script>

<template>
  <span class="dz-flip" :class="{ 'dz-flip--reduced': reduced }">
    <span :key="flipKey" class="dz-flip__face">
      <slot />
    </span>
  </span>
</template>
