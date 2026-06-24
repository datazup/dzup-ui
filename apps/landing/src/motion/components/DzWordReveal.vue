<script setup lang="ts">
import { computed } from 'vue'
import DzStagger from './DzStagger.vue'

/**
 * DzWordReveal — reveals a line of text word-by-word in sequence
 * (docs/animations.md §6.2, effect 9). Built on {@link DzStagger}: the line is
 * split into per-word spans that cascade in with an incremental delay.
 *
 * Accessibility: splitting by *words* (not letters) keeps the line readable —
 * real space text nodes sit between the spans, so the text stays selectable as
 * one sentence and screen readers announce it as a single, natural string
 * (per-letter spans, which break SR reading, are deliberately avoided, §6.2/§7).
 * Each word rises via transform/opacity only, so nothing shifts layout.
 *
 * Reduced motion (OS or page-level toggle) collapses the cascade to an instant,
 * opacity-only appearance — handled centrally by {@link DzStagger}.
 */
const props = withDefaults(
  defineProps<{
    /** The line to reveal, split on whitespace into words. */
    text: string
    /** Element to render as the container. */
    as?: string
    /** Per-word delay step in ms. */
    step?: number
    /** Direction each word enters from; omit for the default rise. */
    direction?: 'up' | 'down' | 'left' | 'right'
  }>(),
  { as: 'div', step: 60, direction: 'up' },
)

const words = computed(() => props.text.split(/\s+/).filter(Boolean))
</script>

<template>
  <DzStagger :as="props.as" :step="props.step" :direction="props.direction" class="dz-word-reveal">
    <template v-for="(word, i) in words" :key="`${word}-${i}`"><span class="dz-word-reveal__word">{{ word }}</span>{{ ' ' }}</template>
  </DzStagger>
</template>

<style scoped>
.dz-word-reveal__word {
  display: inline-block;
}
</style>
