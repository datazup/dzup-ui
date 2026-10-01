<script setup lang="ts">
import type { DzToolbarProps, DzToolbarSlots } from './DzToolbar.types.ts'
/**
 * DzToolbar -- horizontal action bar with start/center/end regions.
 *
 * A semantic "controls left, title middle, actions right" bar with consistent
 * spacing, wrap, and sticky behavior.
 *
 * **It is a roving-focus group, not pure layout.** The root is `role="toolbar"`,
 * which the APG defines as a *single tab stop* whose controls are reached with
 * the arrow keys, and `DzToolbar.anatomy.ts` has published that contract —
 * ArrowRight / ArrowLeft / Home / End, plus a `Tab` row that says in words "the
 * toolbar is one tab stop" — since TASK-R5-O5. Until RESIDUAL-13 this file
 * contained no key handling at all: `yarn validate:anatomy-keyboard` reported
 * four of its rows as backed by nothing, and RESIDUAL-12 §4 `F1` called it *"the
 * worst of them"* and a WCAG 2.1.1 gap rather than a stale table. The roving
 * focus below is the implementation of the table that was already shipped, so
 * the behaviour is new and the documented contract is not.
 *
 * @example
 * ```vue
 * <DzToolbar variant="outlined">
 *   <template #start><DzButton>Back</DzButton></template>
 *   <template #center><h2>Title</h2></template>
 *   <template #end><DzButton tone="primary">Save</DzButton></template>
 * </DzToolbar>
 * ```
 */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useSlots } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { cn } from '../../utilities/cn.ts'
import { ownsItsOwnCaret } from '../../utilities/keyboardTargets.ts'
import { toolbarRegionVariants, toolbarVariants } from './DzToolbar.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzToolbarProps>(), {
  variant: 'flat',
  size: 'md',
  wrap: false,
  sticky: false,
  orientation: 'horizontal',
  as: 'div',
})

const _slots = defineSlots<DzToolbarSlots>()

const attrs = useAttrs()
const slotApi = useSlots()

/** Whether the trailing region has content to render. */
const hasEnd = computed(() => Boolean(slotApi.end))
/** Whether the centered region has content to render. */
const hasCenter = computed(() => Boolean(slotApi.center))

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    toolbarVariants({
      variant: props.variant,
      size: props.size,
      wrap: props.wrap || undefined,
      sticky: props.sticky || undefined,
    }),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

// ---------------------------------------------------------------------------
// APG `toolbar` roving focus (RESIDUAL-13, closing RESIDUAL-12 §4 `F1`)
// ---------------------------------------------------------------------------

const dzDirection = useDzDirection()
const rootEl = ref<HTMLElement>()

/** Whether the bar navigates along the block axis rather than the inline one. */
const isVertical = computed(() => props.orientation === 'vertical')

/**
 * What the toolbar treats as one of its controls.
 *
 * Deliberately the *platform's* focusable set plus anything carrying an explicit
 * `tabindex`, and deliberately **not** a `[data-…]` opt-in: the regions are
 * `<slot />`s, so every control in a toolbar is the consumer's markup and an
 * opt-in attribute would mean the published contract only holds for authors who
 * read this file.
 */
const CONTROL_SELECTOR = 'a[href],button,input,select,textarea,summary,[contenteditable="true"],[tabindex]'

/**
 * The marker this component puts on a control whose tab stop it manages.
 *
 * It is what makes "the author took this control out of the tab order" and "we
 * took it out a moment ago" distinguishable. Without it, the first roving pass
 * writes `tabindex="-1"` onto every control but one and the second pass reads
 * those back as deliberate opt-outs, leaving a toolbar with exactly one
 * reachable control and no way back.
 */
const MANAGED_ATTR = 'data-dz-toolbar-item'

/** The toolbar's controls, in DOM order: start → center → end. */
function controls(): HTMLElement[] {
  const root = rootEl.value
  if (root === undefined)
    return []
  return Array.from(root.querySelectorAll<HTMLElement>(CONTROL_SELECTOR)).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true')
      return false
    if (el.closest('[aria-hidden="true"]') !== null)
      return false
    if (el.hasAttribute(MANAGED_ATTR))
      return true
    return el.getAttribute('tabindex') !== '-1'
  })
}

/** Put exactly `index` in the tab order and take every sibling out of it. */
function applyTabStop(items: readonly HTMLElement[], index: number): void {
  for (const [position, el] of items.entries()) {
    el.setAttribute(MANAGED_ATTR, '')
    el.setAttribute('tabindex', position === index ? '0' : '-1')
  }
}

/**
 * One tab stop, which is the `Tab` row's promise: the toolbar is entered once
 * and left once, and the arrows move inside it.
 */
function syncTabStops(): void {
  const items = controls()
  if (items.length === 0)
    return
  const active = items.findIndex(el => el.hasAttribute(MANAGED_ATTR) && el.getAttribute('tabindex') === '0')
  applyTabStop(items, active === -1 ? 0 : active)
}

/** Move focus, and move the single tab stop with it. */
function focusControl(index: number): void {
  const items = controls()
  if (items.length === 0)
    return
  const clamped = ((index % items.length) + items.length) % items.length
  applyTabStop(items, clamped)
  items[clamped]?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  // A text field inside a toolbar keeps caret movement — APG says so in as
  // many words, and taking ArrowLeft from a search box moves nothing.
  if (ownsItsOwnCaret(event.target))
    return
  const items = controls()
  if (items.length === 0)
    return

  // The inline pair mirrors in a RTL document, which is exactly what the
  // anatomy's `rtl: { keyboard: 'swap-horizontal' }` and the two
  // `rtl: 'mirrored'` rows declare. A vertical bar navigates the block axis,
  // which does not mirror.
  const forward = isVertical.value
    ? 'ArrowDown'
    : dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const backward = isVertical.value
    ? 'ArrowUp'
    : dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  const current = items.findIndex(el => el === document.activeElement)
  let next: number | null = null
  switch (event.key) {
    case forward:
      next = current + 1
      break
    case backward:
      next = current === -1 ? items.length - 1 : current - 1
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = items.length - 1
      break
    default:
      break
  }

  if (next === null)
    return
  event.preventDefault()
  focusControl(next)
}

/**
 * Whatever the user reached last becomes the tab stop — by arrow, by click or by
 * tabbing in — so leaving and re-entering the toolbar returns to where they were.
 */
function onFocusin(event: FocusEvent): void {
  const target = event.target
  if (!(target instanceof HTMLElement) || !target.hasAttribute(MANAGED_ATTR))
    return
  const items = controls()
  const index = items.indexOf(target)
  if (index !== -1)
    applyTabStop(items, index)
}

/**
 * The regions are slots, so the control list changes without this component
 * rendering. `childList` + `subtree` only: the callback writes `tabindex`, and
 * observing attributes as well would make it re-enter itself.
 */
let observer: MutationObserver | undefined

onMounted(() => {
  syncTabStops()
  const root = rootEl.value
  if (root === undefined || typeof MutationObserver === 'undefined')
    return
  observer = new MutationObserver(() => syncTabStops())
  observer.observe(root, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
})

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <component
    :is="as"
    :id="id"
    ref="rootEl"
    role="toolbar"
    :aria-orientation="orientation"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-size="size"
    :data-variant="variant"
    data-part="root"
    :class="classes"
    v-bind="{ ...dzTestId('dz-toolbar'), ...$attrs, class: undefined }"
    @keydown="onKeydown"
    @focusin="onFocusin"
  >
    <div data-part="group" :class="cn(toolbarRegionVariants({ region: 'start' }), props.ui?.group)" data-toolbar-region="start">
      <slot name="start">
        <slot />
      </slot>
    </div>

    <div
      v-if="hasCenter"
      data-part="group"
      :class="cn(toolbarRegionVariants({ region: 'center' }), props.ui?.group)"
      data-toolbar-region="center"
    >
      <slot name="center" />
    </div>
    <div v-else aria-hidden="true" class="flex-1" data-toolbar-region="spacer" />

    <div v-if="hasEnd" data-part="group" :class="cn(toolbarRegionVariants({ region: 'end' }), props.ui?.group)" data-toolbar-region="end">
      <slot name="end" />
    </div>
  </component>
</template>
