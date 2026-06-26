<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { ref } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzStagger — cascades its direct children into view with a per-index delay
 * (docs/animations.md §6.1, effect 2). Generalises the inline `--reveal-delay`
 * stagger used in EcosystemGrid: each child is given the scroll-reveal classes
 * and an incremental `--reveal-delay`, then they settle together when the
 * container scrolls into view, producing the cascade.
 *
 * Children opt into the same fade & rise / directional / blur / scale variants
 * as {@link DzReveal}. Reduced motion (OS or the page-level toggle) collapses
 * the stagger to an instant, opacity-only appearance. Transform/opacity/filter
 * only; `will-change` is set per child on entrance and cleared after.
 */
const props = withDefaults(
  defineProps<{
    /** Element to render as the stagger container. */
    as?: string
    /** Per-child delay step in ms (mirrors `--dz-anim-stagger-step`). */
    step?: number
    /** Directional slide-in for children; omit for the default fade & rise. */
    direction?: 'up' | 'down' | 'left' | 'right'
    /** Add a blur-in to each child. */
    blur?: boolean
    /** Scale each child up instead of translating. */
    scale?: boolean
    /** Reveal once then stop observing (default `true`). */
    once?: boolean
  }>(),
  { as: 'div', step: 80, once: true },
)

const root = ref<HTMLElement | null>(null)
const isInView = useInView(root, { once: props.once })
const reduced = useReducedMotion()

function children(): HTMLElement[] {
  return root.value ? (Array.from(root.value.children) as HTMLElement[]) : []
}

function setupChildren(): void {
  children().forEach((child, i) => {
    child.classList.add('dz-reveal')
    if (props.direction) child.classList.add(`dz-reveal--${props.direction}`)
    if (props.blur) child.classList.add('dz-reveal--blur')
    if (props.scale) child.classList.add('dz-reveal--scale')
    child.style.setProperty('--reveal-delay', `${props.step * i}ms`)
  })
}

function revealChildren(): void {
  for (const child of children()) {
    child.style.willChange = 'opacity, transform, filter'
    child.classList.add('dz-reveal--in')
    const done = (): void => {
      child.style.willChange = ''
      child.removeEventListener('transitionend', done)
    }
    child.addEventListener('transitionend', done)
  }
}

function applyReduced(on: boolean): void {
  for (const child of children()) child.classList.toggle('dz-reveal--reduced', on)
}

onMounted(async () => {
  await nextTick()
  setupChildren()
  applyReduced(reduced.value)
  if (isInView.value) revealChildren()
})

watch(isInView, (inView) => {
  if (inView) revealChildren()
})

watch(reduced, (on) => applyReduced(on))
</script>

<template>
  <component :is="as" ref="root">
    <slot />
  </component>
</template>
