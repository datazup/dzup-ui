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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzMotion } from '../../composables/provider/useDzMotion.ts'
import { useDzUrlGuard } from '../../composables/provider/useDzUrlPolicy.ts'
import { useScrollSpy } from '../../composables/useScrollSpy/index.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
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
  ariaLabel: undefined,
  id: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzAnchorEmits>()
const slots = defineSlots<DzAnchorSlots>()

// Smooth scroll, or not (ADR-20 §7, TASK-R5-O3). Replaces a local
// `matchMedia` read inside `scrollToTarget`.
const dzMotion = useDzMotion()
// User-visible strings, resolved against the application's catalog (ADR-20).
// An explicit prop still wins; these are the defaults that used to be literals.
const dzMessages = useComponentMessages('DzAnchor')
const resolvedAriaLabel = computed(() => props.ariaLabel ?? dzMessages.value.ariaLabel)

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

  const top = el.getBoundingClientRect().top + window.scrollY - props.offsetTop
  window.scrollTo({ top, behavior: dzMotion.reduced.value ? 'auto' : 'smooth' })

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
  cn(anchorVariants({ affix: props.affix }).root(), attrs.class as string | undefined, props.ui?.root),
)

const rootStyle = computed<Record<string, string>>(() => ({
  contain: 'layout style',
  ...(props.affix ? { top: `${props.offsetTop}px` } : {}),
}))

/**
 * The URL policy (ADR-20 §12, TASK-R2-O4).
 *
 * `items[].href` is a host-supplied URL rendered into an `<a>` by the recursive
 * renderer below — the sink TASK-N1-O5 measured as unguarded (`S3`/`S4`).
 * In-page fragments are the intended use and carry no scheme, so every
 * legitimate `DzAnchor` item is admitted unchanged.
 */
const guardUrl = useDzUrlGuard('DzAnchor')

/**
 * Recursive list renderer. A hoisted function declaration so it can reference
 * itself for nested `children`, closing over the active state, styles, slots and
 * click handler. Returns a VNode tree consumed by the `AnchorTree` functional
 * component below.
 */
function renderList(list: DzAnchorItem[], level: number): VNode {
  return h(
    'ul',
    { 'class': cn(anchorVariants().list(), props.ui?.list), 'data-part': 'list', 'data-level': level },
    list.map((item) => {
      const isActive = activeHref.value === item.href
      const url = guardUrl(item.href, 'items[].href')
      const linkClass = anchorVariants({ active: isActive, disabled: item.disabled }).link()
      const linkChildren: VNodeArrayChildren | string = slots.item
        ? (slots.item({ item, active: isActive, level }) as VNodeArrayChildren)
        : item.label
      return h('li', { key: item.href, class: anchorVariants().item() }, [
        h(
          'a',
          {
            // A refused URL renders the SAME element with no `href`. This is
            // the one of the six components with no non-link branch to fall
            // into: the tree is `<li><a>`, and an `<a>` without an `href` is
            // already not a link — no implicit `link` role, not in the tab
            // order, not activatable — so the outline keeps its shape and the
            // entry stops navigating. Swapping the tag to `button` would put a
            // button inside a table of contents and change the APG `link`
            // pattern this component is measured against.
            'href': url.href,
            'class': cn(linkClass, props.ui?.item),
            'data-part': 'item',
            'style': {
              paddingInlineStart: `calc(var(--dz-anchor-indent) * ${level} + var(--dz-spacing-3))`,
            },
            'aria-current': isActive ? 'location' : undefined,
            'aria-disabled': item.disabled || undefined,
            'tabindex': item.disabled ? -1 : undefined,
            'data-active': isActive ? '' : undefined,
            'data-state': url.rejected ? 'url-rejected' : undefined,
            'onClick': url.rejected
              ? (event: MouseEvent) => { event.preventDefault() }
              : (event: MouseEvent) => handleClick(event, item),
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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <nav
    :id="id"
    data-part="root"
    :class="rootClasses"
    :style="rootStyle"
    :aria-label="resolvedAriaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    data-state="ready"
    v-bind="{ ...dzTestId('dz-anchor'), ...$attrs, class: undefined }"
  >
    <AnchorTree />
  </nav>
</template>
