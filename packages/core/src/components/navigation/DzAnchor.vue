<script setup lang="ts">
import type { VNode, VNodeArrayChildren } from 'vue'
import type { DzAnchorEmits, DzAnchorItem, DzAnchorProps, DzAnchorSlots } from './DzAnchor.types.ts'
/**
 * DzAnchor — Scrollspy section navigation (in-page table of contents).
 *
 * Renders a `<nav>` landmark with a nested list of hash links. As the page
 * scrolls, an IntersectionObserver (via `useScrollSpy`) highlights the link for
 * the section currently in view. Clicking a link smooth-scrolls to the target
 * (respecting `prefers-reduced-motion`); activating via keyboard additionally
 * moves focus to the target heading for accessibility.
 *
 * The active link carries `aria-current="location"`. Active state is exposed via
 * `v-model:active` (the item `href`) for controlled usage.
 *
 * @example
 * ```vue
 * <DzAnchor
 *   :items="[
 *     { href: '#intro', label: 'Introduction' },
 *     { href: '#usage', label: 'Usage', children: [
 *       { href: '#install', label: 'Install' },
 *     ] },
 *   ]"
 *   :offset-top="64"
 *   affix
 * />
 * ```
 */
import { computed, h, toRef, useAttrs } from 'vue'
import { useScrollSpy } from '../../composables/useScrollSpy/index.ts'
import { cn } from '../../utilities/cn.ts'
import { anchorVariants } from './DzAnchor.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Active link href (e.g. `#section`). Controllable via `v-model:active`. */
const activeHref = defineModel<string>('active', { default: '' })

const props = withDefaults(defineProps<DzAnchorProps>(), {
  offsetTop: 0,
  affix: false,
  ariaLabel: 'Page navigation',
  id: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzAnchorEmits>()
const slots = defineSlots<DzAnchorSlots>()

const attrs = useAttrs()

/** Strip a leading `#` to get the raw element id. */
function toId(href: string): string {
  return href.replace(/^#/, '')
}

/** Flatten the (possibly nested) items into the list of observed element ids. */
const targetIds = computed<string[]>(() => {
  const ids: string[] = []
  const walk = (items: DzAnchorItem[]): void => {
    for (const item of items) {
      ids.push(toId(item.href))
      if (item.children?.length)
        walk(item.children)
    }
  }
  walk(props.items)
  return ids
})

// Scrollspy: highlight the section in view. Scroll-driven changes update the
// model (and emit `change`) so controlled and uncontrolled usage agree.
useScrollSpy({
  targetIds,
  offsetTop: toRef(() => props.offsetTop),
  onActiveChange: (id) => {
    if (id === null)
      return
    const href = `#${id}`
    if (href !== activeHref.value) {
      activeHref.value = href
      emit('change', href)
    }
  },
})

/** Smooth-scroll to `href`'s target, optionally moving focus to it. */
function scrollToTarget(href: string, moveFocus: boolean): void {
  if (typeof document === 'undefined')
    return
  const el = document.getElementById(toId(href))
  if (!el)
    return

  const prefersReduced
    = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const top = el.getBoundingClientRect().top + window.scrollY - props.offsetTop
  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })

  if (moveFocus) {
    // Make the heading programmatically focusable, then move focus to it so
    // keyboard users land on the section they navigated to.
    if (el.tabIndex < 0)
      el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
}

function handleClick(event: MouseEvent, item: DzAnchorItem): void {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  event.preventDefault()

  // A click synthesized from Enter/Space has `detail === 0`; in that case move
  // focus to the heading (keyboard activation), per the a11y requirement.
  const viaKeyboard = event.detail === 0

  if (item.href !== activeHref.value) {
    activeHref.value = item.href
    emit('change', item.href)
  }
  emit('click', event, item)
  scrollToTarget(item.href, viaKeyboard)
}

const rootClasses = computed(() =>
  cn(anchorVariants({ affix: props.affix }).root(), attrs.class as string | undefined),
)

const rootStyle = computed<Record<string, string>>(() => ({
  contain: 'layout style',
  ...(props.affix ? { top: `${props.offsetTop}px` } : {}),
}))

/**
 * Recursive list renderer. A hoisted function declaration so it can reference
 * itself for nested `children`, closing over the active state, styles, slots and
 * click handler. Returns a VNode tree consumed by the `AnchorTree` functional
 * component below.
 */
function renderList(list: DzAnchorItem[], level: number): VNode {
  return h(
    'ul',
    { 'class': anchorVariants().list(), 'data-level': level },
    list.map((item) => {
      const isActive = activeHref.value === item.href
      const linkClass = anchorVariants({ active: isActive, disabled: item.disabled }).link()
      const linkChildren: VNodeArrayChildren | string = slots.item
        ? (slots.item({ item, active: isActive, level }) as VNodeArrayChildren)
        : item.label
      return h('li', { key: item.href, class: anchorVariants().item() }, [
        h(
          'a',
          {
            'href': item.href,
            'class': linkClass,
            'style': {
              paddingInlineStart: `calc(var(--dz-anchor-indent) * ${level} + var(--dz-spacing-3))`,
            },
            'aria-current': isActive ? 'location' : undefined,
            'aria-disabled': item.disabled || undefined,
            'tabindex': item.disabled ? -1 : undefined,
            'data-active': isActive ? '' : undefined,
            'onClick': (event: MouseEvent) => handleClick(event, item),
          },
          linkChildren,
        ),
        item.children?.length ? renderList(item.children, level + 1) : null,
      ])
    }),
  )
}

/** Functional component wrapper so the recursive tree is usable in `<template>`. */
function AnchorTree(): VNode {
  return renderList(props.items, 0)
}
</script>

<template>
  <nav
    :id="id"
    :class="rootClasses"
    :style="rootStyle"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    data-state="ready"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <AnchorTree />
  </nav>
</template>
