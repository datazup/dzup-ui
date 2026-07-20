<script lang="ts">
// Module-scoped counter for per-instance view-transition-name uniqueness.
</script>

<script setup lang="ts">
import { DzDialog, DzDialogContent } from '@dzup-ui/core'
import { computed, nextTick, ref } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'
import { startViewTransition, supportsViewTransitions } from '../useViewTransition.ts'

/**
 * DzMorph — a collapsed card that expands into a modal dialog sharing its
 * position and size (docs/animations.md §5.7, effect 55).
 *
 * The morph is driven by the **View Transitions API** where supported: the
 * trigger card and the dialog panel carry the SAME `view-transition-name`, so
 * the browser morphs the card's box into the dialog's box (and back) across the
 * open/close DOM swap. Only one of the two ever carries the name at a time (the
 * trigger drops it while open, the panel only exists while open), so there is
 * never a duplicate-name collision in a single snapshot. Where View Transitions
 * are absent the morph runs as a **FLIP** (Web Animations API: invert the
 * panel's box back to the card's box, then play to identity). Under reduced
 * motion the dialog opens and closes instantly.
 *
 * Accessibility / motion guarantees (§5.7, §7):
 * - **No core fork.** The dialog is core's `DzDialog` driven through its public
 *   `v-model:open` API with `:animated="false"` (we own the motion). Reka's focus
 *   trap, Esc-to-close and light-dismiss all stay intact — when Reka requests a
 *   close (Esc / outside click / close button) we intercept the `update:open`
 *   and run the same morph-out before unmounting.
 * - **Reduced motion** (OS `prefers-reduced-motion` OR the page-level toggle)
 *   skips both the View Transition and the FLIP — the dialog just appears /
 *   disappears, with focus handling unchanged.
 * - **Progressive enhancement.** The un-enhanced state (instant open/close) is
 *   always correct; the custom morph only runs behind a runtime feature detect.
 *
 * No core changes — the collapsed surface is whatever the `#trigger` scoped slot
 * renders (e.g. a `DzCard`); the dialog body is the default slot.
 */

const props = withDefaults(
  defineProps<{
    /** Dialog content panel size, forwarded to `DzDialogContent`. */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    /** Accessible name for the dialog panel (forwarded to `DzDialogContent`). */
    ariaLabel?: string
    /** Force instant open/close (page-level reduced motion). Merged with the OS setting. */
    disabled?: boolean
  }>(),
  { size: 'md', ariaLabel: undefined, disabled: false },
)

const emit = defineEmits<{ 'update:open': [open: boolean] }>()

let morphUid = 0

// Stable, unique view-transition-name per instance so two morphs on a page never
// pair their snapshots with each other.
const uid = ++morphUid
const vtName = `dz-morph-${uid}`
const panelClass = `dz-morph-panel-${uid}`

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)

const osReduced = useReducedMotion()
const reduced = computed(() => props.disabled || osReduced.value)

/** View Transitions are the morph path only when motion is allowed. */
const canVt = computed(() => supportsViewTransitions() && !reduced.value)

// Only the element present in a given snapshot carries the name: the trigger
// while closed, the panel while open. So the browser always has exactly one
// `vtName` box in each of the before/after snapshots → a clean morph, no clash.
const triggerStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (canVt.value && !open.value)
    style.viewTransitionName = vtName
  return style
})
const panelStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (canVt.value)
    style.viewTransitionName = vtName
  return style
})

function findPanel(): HTMLElement | null {
  if (typeof document === 'undefined')
    return null
  return document.querySelector<HTMLElement>(`.${panelClass}`)
}

/** Invert `el` from its current box back to `from`, then play to rest (FLIP). */
function flip(el: HTMLElement, from: DOMRect, reverse = false): Promise<void> {
  const to = el.getBoundingClientRect()
  if (!to.width || !to.height)
    return Promise.resolve()
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  const sx = from.width / to.width
  const sy = from.height / to.height
  const collapsed = {
    transform: `translate(${dx}px, ${dy}px) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`,
    opacity: 0.35,
  }
  const rest = { transform: 'none', opacity: 1 }
  const anim = el.animate(reverse ? [rest, collapsed] : [collapsed, rest], {
    duration: reverse ? 280 : 340,
    easing: reverse ? 'cubic-bezier(0.4, 0, 1, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)',
  })
  return anim.finished.then(() => undefined).catch(() => undefined)
}

/** Expand the trigger card into the dialog. */
function expand(): void {
  if (open.value)
    return

  if (canVt.value) {
    void startViewTransition(async () => {
      open.value = true
      await nextTick()
    })
    emit('update:open', true)
    return
  }

  if (!reduced.value) {
    const from = triggerEl.value?.getBoundingClientRect()
    open.value = true
    emit('update:open', true)
    void nextTick(() => {
      const panel = findPanel()
      if (panel && from)
        void flip(panel, from)
    })
    return
  }

  open.value = true
  emit('update:open', true)
}

/** Collapse the dialog back to the trigger card. Runs the morph-out, then closes. */
function collapse(): void {
  if (!open.value)
    return

  if (canVt.value) {
    void startViewTransition(async () => {
      open.value = false
      await nextTick()
    })
    emit('update:open', false)
    return
  }

  if (!reduced.value) {
    const panel = findPanel()
    const to = triggerEl.value?.getBoundingClientRect()
    if (panel && to) {
      void flip(panel, to, true).then(() => {
        open.value = false
        emit('update:open', false)
      })
      return
    }
  }

  open.value = false
  emit('update:open', false)
}

// Reka drives `open` to false on Esc / outside-click / close button. Intercept so
// the morph-out plays before the panel unmounts; opening only ever happens via
// our own trigger (expand), so a true here is a no-op safeguard.
function onDialogUpdate(value: boolean): void {
  if (!value && open.value)
    collapse()
  else if (value && !open.value)
    expand()
}

defineExpose({ expand, collapse })
</script>

<template>
  <div ref="triggerEl" class="dz-morph__trigger" :style="triggerStyle">
    <slot name="trigger" :expand="expand" :expanded="open" />
  </div>

  <DzDialog :open="open" :animated="false" @update:open="onDialogUpdate">
    <DzDialogContent :size="size" :aria-label="ariaLabel" :class="panelClass" :style="panelStyle">
      <slot :collapse="collapse" :expanded="open" />
    </DzDialogContent>
  </DzDialog>
</template>

<style scoped>
/* The trigger wrapper is a layout-neutral pass-through; the slotted card owns its
   own surface. display: contents would drop the element we need to measure for
   FLIP and to carry the view-transition-name, so keep it as a real box. */
.dz-morph__trigger {
  display: inline-block;
}
</style>
