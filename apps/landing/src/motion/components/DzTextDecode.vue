<script setup lang="ts">
import { ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'
import { useTextDecode } from '../useTextDecode.ts'

/**
 * DzTextDecode — scrambles then resolves its text when it scrolls into view
 * (docs/animations.md §6.2, effect 10). Pairs with eyebrows/labels.
 *
 * Built on {@link useTextDecode} + {@link useInView}. The scrambling glyphs are
 * decorative gibberish, so they are `aria-hidden`; the real label is kept in the
 * DOM once via a visually-hidden `.dz-sr-only` string and stays selectable. A
 * hidden sizer reserves the resolved text's box so the scramble never shifts
 * layout (§7).
 *
 * Reduced motion (OS or page-level toggle) skips the scramble entirely and shows
 * the plain text — its accessible fallback.
 */
const props = withDefaults(
  defineProps<{
    /** The final text to resolve to. */
    text: string
    /** Element to render as the root. */
    as?: string
  }>(),
  { as: 'span' },
)

const root = ref<HTMLElement | null>(null)
const isInView = useInView(root, { once: false })
const reduced = useReducedMotion()
const { display, run, resolve } = useTextDecode(() => props.text)

function trigger(): void {
  if (reduced.value) resolve()
  else run()
}

// Decode each time the label enters view (so Replay re-triggers it); under
// reduced motion just snap to the resolved text.
watch([isInView, reduced], ([inView]) => {
  if (inView) trigger()
}, { immediate: true })
</script>

<template>
  <component :is="props.as" ref="root" class="dz-text-decode">
    <span class="dz-sr-only">{{ props.text }}</span>
    <span aria-hidden="true" class="dz-text-decode__sizer">{{ props.text }}</span>
    <span aria-hidden="true" class="dz-text-decode__live">{{ display }}</span>
  </component>
</template>

<style scoped>
.dz-text-decode {
  position: relative;
  display: inline-block;
}

.dz-text-decode__sizer {
  visibility: hidden;
  white-space: pre;
}

.dz-text-decode__live {
  position: absolute;
  inset: 0;
  white-space: pre;
}
</style>
