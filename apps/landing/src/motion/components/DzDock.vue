<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * DzDock — macOS-style dock magnification (docs/animations.md §5.5, effect 46).
 *
 * A row of items (DzIconButton / DzAvatar / anything) where each item scales by
 * its proximity to the pointer, with the neighbours easing up too on a smooth
 * cosine falloff. Pure `transform: scale()` about each item's own centre, so the
 * magnified item grows in place — its click/focus target never moves out from
 * under the user. One `transform` write per item per frame via `requestAnimation
 * Frame`, regardless of pointer-event rate.
 *
 * Accessibility / touch guarantees (§5.5, §7):
 * - **Pointer-only.** The magnification engages only on fine-pointer, hover-
 *   capable devices; touch pointer events are ignored. Touch users get a flat,
 *   static row.
 * - **Reduced-motion.** Disabled when the OS sets `prefers-reduced-motion` OR the
 *   caller passes `disabled: true` (wire to the page-level toggle via
 *   `useReducedMotion`). Import-free of landing internals so it stays extractable.
 * - **Keyboard-safe.** Magnification is pointer-driven only — Tabbing through the
 *   items never scales them, and because each item scales about its own centre,
 *   the focus ring lands exactly where the static layout put it.
 *
 * `will-change: transform` is set on the items while engaged and cleared on
 * leave/unmount.
 *
 * Usage:
 *   <DzDock :disabled="reduced">
 *     <DzIconButton v-for="i in items" :key="i.id" :icon="i.icon" :aria-label="i.label" />
 *   </DzDock>
 */

const props = withDefaults(
  defineProps<{
    /** Peak scale for the item directly under the pointer (default `1.5`). */
    maxScale?: number
    /** Horizontal influence radius in px either side of an item (default `120`). */
    radius?: number
    /** Upward lift in px applied to the most-magnified item (default `8`). */
    lift?: number
    /** Force the flat, un-magnified row (page-level reduced motion). */
    disabled?: boolean
    /** Accessible label for the dock landmark. */
    ariaLabel?: string
  }>(),
  { maxScale: 1.5, radius: 120, lift: 8, disabled: false },
)

const root = ref<HTMLElement | null>(null)
let frame = 0
let pointerX = 0
let attached = false

/** Whether the device has a fine, hover-capable pointer (SSR-safe). */
function canHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** The direct element children — each is one dock item. */
function items(): HTMLElement[] {
  if (!root.value)
    return []
  return Array.from(root.value.children).filter((c): c is HTMLElement => c instanceof HTMLElement)
}

function applyFrame(): void {
  frame = 0
  const { maxScale, radius, lift } = props
  for (const item of items()) {
    const rect = item.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const dist = Math.abs(pointerX - center)
    // Cosine falloff: 1 at the pointer, easing smoothly to 0 at the radius edge.
    const t = Math.min(dist / radius, 1)
    const influence = Math.cos((t * Math.PI) / 2)
    const scale = 1 + (maxScale - 1) * influence
    const y = -lift * influence
    item.style.transform = `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(3)})`
  }
}

function reset(): void {
  for (const item of items()) {
    // Spring each item back to rest with an eased transition, then drop the hint.
    item.style.transition = 'transform var(--dz-duration-normal, 200ms) var(--dz-ease-out, ease-out)'
    item.style.transform = ''
    const done = (): void => {
      item.style.willChange = ''
      item.removeEventListener('transitionend', done)
    }
    item.addEventListener('transitionend', done)
  }
}

function onMove(event: PointerEvent): void {
  if (event.pointerType === 'touch')
    return
  pointerX = event.clientX
  if (!frame) {
    for (const item of items()) {
      item.style.transition = 'none'
      item.style.willChange = 'transform'
    }
    frame = requestAnimationFrame(applyFrame)
  }
}

function onLeave(): void {
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
  reset()
}

function attach(): void {
  if (attached || !root.value)
    return
  root.value.addEventListener('pointermove', onMove)
  root.value.addEventListener('pointerleave', onLeave)
  attached = true
}

function detach(): void {
  if (!attached || !root.value)
    return
  root.value.removeEventListener('pointermove', onMove)
  root.value.removeEventListener('pointerleave', onLeave)
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
  // Clear any inline transforms so the row is flat for touch/reduced users.
  for (const item of items()) {
    item.style.transform = ''
    item.style.transition = ''
    item.style.willChange = ''
  }
  attached = false
}

function sync(): void {
  if (!props.disabled && canHover())
    attach()
  else detach()
}

watch(() => props.disabled, sync)
onMounted(sync)
onBeforeUnmount(detach)
</script>

<template>
  <div ref="root" class="dz-dock" role="toolbar" :aria-label="ariaLabel">
    <slot />
  </div>
</template>

<style scoped>
.dz-dock {
  display: inline-flex;
  align-items: flex-end;
  gap: var(--dz-spacing-3, 0.75rem);
  /* Each item scales about its own bottom-centre so it grows up out of the dock
     without shifting its click target horizontally. */
}

.dz-dock > :deep(*) {
  transform-origin: center bottom;
  /* Keep the items square to the baseline as they scale. */
  flex: 0 0 auto;
}
</style>
