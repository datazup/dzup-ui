<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzReveal — component wrapper around the scroll-reveal class system
 * (docs/animations.md §6.1). Reveals its slotted content (fade & rise by
 * default) when it scrolls into view, with the same directional / blur / scale
 * options as the `v-reveal` directive.
 *
 * Prefer this over the directive when you need reactive reduced-motion handling
 * (it reads the page-level "Reduce motion" override via {@link useReducedMotion},
 * which the directive — being import-free — cannot). Transform/opacity/filter
 * only; `will-change` is set on entrance and cleared once the reveal settles.
 */
const props = withDefaults(
  defineProps<{
    /** Element/component to render as the reveal root. */
    as?: string
    /** Directional slide-in; omit for the default fade & rise. */
    direction?: 'up' | 'down' | 'left' | 'right'
    /** Add a blur-in on top of the fade. */
    blur?: boolean
    /** Scale up from {@link --dz-anim-scale-from} instead of translating. */
    scale?: boolean
    /** Stagger delay in ms, exposed to CSS as `--reveal-delay`. */
    delay?: number
    /** Reveal once then stop observing (default `true`). */
    once?: boolean
  }>(),
  { as: 'div', once: true },
)

const root = ref<HTMLElement | null>(null)
const isInView = useInView(root, { once: props.once })
const reduced = useReducedMotion()

// will-change while the reveal plays; cleared after to avoid GPU-layer bloat.
const animating = ref(false)
watch(isInView, (inView) => {
  if (!inView)
    return
  animating.value = true
  const el = root.value
  if (!el)
    return
  const done = (): void => {
    animating.value = false
    el.removeEventListener('transitionend', done)
  }
  el.addEventListener('transitionend', done)
})

const classes = computed(() => ({
  'dz-reveal': true,
  'dz-reveal--in': isInView.value,
  'dz-reveal--reduced': reduced.value,
  [`dz-reveal--${props.direction}`]: !!props.direction,
  'dz-reveal--blur': props.blur,
  'dz-reveal--scale': props.scale,
}))

const style = computed(() => ({
  ...(props.delay ? { '--reveal-delay': `${props.delay}ms` } : {}),
  ...(animating.value ? { willChange: 'opacity, transform, filter' } : {}),
}))
</script>

<template>
  <component :is="as" ref="root" :class="classes" :style="style">
    <slot />
  </component>
</template>
