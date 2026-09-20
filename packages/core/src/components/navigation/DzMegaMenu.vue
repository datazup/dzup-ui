<script setup lang="ts">
import type {
  DzMegaMenuEmits,
  DzMegaMenuGroup,
  DzMegaMenuItem,
  DzMegaMenuLink,
  DzMegaMenuProps,
  DzMegaMenuSlots,
} from './DzMegaMenu.types.ts'
import { ChevronDown } from 'lucide-vue-next'
/**
 * DzMegaMenu — horizontal (or vertical) navigation menubar whose top-level
 * items open wide, multi-column dropdown panels.
 *
 * Model-driven: each item may own `items` (column groups), each group owns
 * `items` (links). Follows the WAI-ARIA menubar pattern — role="menubar" with
 * roving tabindex, arrow-key traversal across triggers and into panels, Esc to
 * close (focus returns to the trigger). Hover and keyboard both open. Below
 * `breakpoint` it collapses into a stacked disclosure/accordion menu.
 *
 * @example
 * ```vue
 * <DzMegaMenu
 *   :items="[
 *     { label: 'Products', items: [
 *       { label: 'Analytics', items: [{ label: 'Dashboards', href: '/dash' }] },
 *       { label: 'Data', items: [{ label: 'Pipelines', href: '/pipe' }] },
 *     ] },
 *     { label: 'Docs', href: '/docs' },
 *   ]"
 * />
 * ```
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useDzUrlGuard } from '../../composables/provider/useDzUrlPolicy.ts'
import { useClickOutside } from '../../composables/useClickOutside/index.ts'
import { useEscapeKey } from '../../composables/useEscapeKey/index.ts'
import { cn } from '../../utilities/cn.ts'
import { megaMenuVariants } from './DzMegaMenu.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzMegaMenuProps>(), {
  orientation: 'horizontal',
  size: 'md',
  openOnHover: true,
  breakpoint: 768,
  collapsed: undefined,
  disabled: false,
})

const emit = defineEmits<DzMegaMenuEmits>()

defineSlots<DzMegaMenuSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()
const rootRef = ref<HTMLElement | null>(null)

// ---------------------------------------------------------------------------
// Open / focus state
// ---------------------------------------------------------------------------

/** Index of the top-level item whose panel is open, or null when closed. */
const openIndex = ref<number | null>(null)
/** Index carrying the roving tabindex=0 among top-level triggers. */
const focusedIndex = ref(0)

const styles = computed(() => megaMenuVariants({ orientation: props.orientation, size: props.size }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

/** Stable key for an item (used for :key + slot identity). */
function itemKey(item: DzMegaMenuItem, index: number): string {
  return item.key ?? item.label ?? String(index)
}

function groupKey(group: DzMegaMenuGroup, index: number): string {
  return group.key ?? group.label ?? String(index)
}

function linkKey(link: DzMegaMenuLink, index: number): string {
  return link.key ?? link.label ?? String(index)
}

/** Whether an item has a panel (column groups) to open. */
function hasPanel(item: DzMegaMenuItem): boolean {
  return Array.isArray(item.items) && item.items.length > 0
}

// ---------------------------------------------------------------------------
// URL policy (ADR-20 §12, TASK-R2-O4)
// ---------------------------------------------------------------------------

/**
 * `items[].href` and `groups[].items[].href` are host-supplied URLs bound at
 * **four** sites in this template — the collapsed stack and the menubar, each
 * with a top-level trigger and a panel link. TASK-N1-O5 bound only the
 * top-level site and asserted the other three by inspection (`S11`/`S12`); all
 * four go through these two helpers now, so there is one policy and not four
 * chances to forget it.
 *
 * Both return the value to bind, or `undefined` for "render the non-link
 * branch" — which this component already has at every one of the four sites.
 */
const guardUrl = useDzUrlGuard('DzMegaMenu')

function safeHref(raw: string | undefined): string | undefined {
  return guardUrl(raw, 'items[].href').href
}

/** True only when a value was supplied and refused — never for an unset prop. */
function urlRejected(raw: string | undefined): boolean {
  return guardUrl(raw, 'items[].href').rejected
}

// ---------------------------------------------------------------------------
// Responsive collapse (matchMedia; `collapsed` prop wins)
// ---------------------------------------------------------------------------

const internalCollapsed = ref(false)
const canUseMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
let mql: MediaQueryList | null = null

function onMqlChange(e: MediaQueryListEvent | MediaQueryList): void {
  internalCollapsed.value = e.matches
}

function setupMql(breakpoint: number): void {
  if (!canUseMatchMedia)
    return
  if (mql)
    mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
  mql = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`)
  internalCollapsed.value = mql.matches
  mql.addEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
}

onMounted(() => {
  if (props.collapsed === undefined)
    setupMql(props.breakpoint)
})

watch(
  () => props.breakpoint,
  (next) => {
    if (props.collapsed === undefined)
      setupMql(next)
  },
)

onBeforeUnmount(() => {
  if (mql)
    mql.removeEventListener('change', onMqlChange as (e: MediaQueryListEvent) => void)
})

const isCollapsed = computed(() =>
  props.collapsed !== undefined ? props.collapsed : internalCollapsed.value,
)

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

function openPanel(index: number): void {
  if (props.disabled)
    return
  const item = props.items[index]
  if (!item || item.disabled || !hasPanel(item))
    return
  if (openIndex.value === index)
    return
  openIndex.value = index
  emit('open', index)
}

function closePanel(returnFocus = false): void {
  const wasOpen = openIndex.value
  if (wasOpen === null)
    return
  openIndex.value = null
  emit('close', wasOpen)
  if (returnFocus)
    focusTrigger(wasOpen)
}

function togglePanel(index: number): void {
  if (openIndex.value === index)
    closePanel()
  else
    openPanel(index)
}

// Close on Esc (returning focus to the trigger) and on outside click.
useEscapeKey(() => closePanel(true), computed(() => openIndex.value !== null))
useClickOutside(rootRef, () => closePanel(), { enabled: computed(() => openIndex.value !== null) })

// ---------------------------------------------------------------------------
// Focus helpers (DOM queries scoped to the root)
// ---------------------------------------------------------------------------

function focusTrigger(index: number): void {
  focusedIndex.value = index
  nextTick(() => {
    rootRef.value
      ?.querySelector<HTMLElement>(`[data-mega-trigger="${index}"]`)
      ?.focus()
  })
}

function panelLinks(index: number): HTMLElement[] {
  const panel = rootRef.value?.querySelector(`[data-mega-panel="${index}"]`)
  if (!panel)
    return []
  return Array.from(panel.querySelectorAll<HTMLElement>('[data-mega-link]'))
}

function focusLinkAt(index: number, position: 'first' | 'last'): void {
  nextTick(() => {
    const links = panelLinks(index)
    const target = position === 'first' ? links[0] : links[links.length - 1]
    target?.focus()
  })
}

// ---------------------------------------------------------------------------
// Trigger interaction
// ---------------------------------------------------------------------------

function onTriggerClick(index: number, item: DzMegaMenuItem, event: MouseEvent): void {
  if (props.disabled || item.disabled)
    return
  if (!hasPanel(item)) {
    // Direct link / leaf — anchors navigate natively; emit for buttons. A
    // refused URL took the button branch and must not be treated as a link
    // that will navigate by itself (TASK-R2-O4).
    if (safeHref(item.href) === undefined)
      event.preventDefault()
    return
  }
  event.preventDefault()
  togglePanel(index)
}

function onTriggerEnter(index: number, item: DzMegaMenuItem): void {
  if (!props.openOnHover || props.disabled || isCollapsed.value)
    return
  if (hasPanel(item))
    openPanel(index)
}

function onWrapperLeave(): void {
  if (props.openOnHover && !isCollapsed.value)
    closePanel()
}

/** Move roving focus across top-level triggers by `delta`, wrapping. */
function moveTrigger(delta: number): void {
  const count = props.items.length
  if (count === 0)
    return
  let next = (focusedIndex.value + delta + count) % count
  // Skip disabled items.
  let guard = 0
  while (props.items[next]?.disabled && guard < count) {
    next = (next + delta + count) % count
    guard += 1
  }
  focusTrigger(next)
}

function onTriggerKeydown(event: KeyboardEvent, index: number, item: DzMegaMenuItem): void {
  if (props.disabled)
    return

  const horizontal = props.orientation === 'horizontal'
  // The inline axis, resolved once: forward is ArrowRight in LTR and ArrowLeft
  // in RTL, and every horizontal decision below is stated in those terms rather
  // than in physical keys.
  const inlineForward = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const inlineBack = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  const nextKey = horizontal ? inlineForward : 'ArrowDown'
  const prevKey = horizontal ? inlineBack : 'ArrowUp'
  const intoKey = horizontal ? 'ArrowDown' : inlineForward

  switch (event.key) {
    case nextKey:
      event.preventDefault()
      moveTrigger(1)
      break
    case prevKey:
      event.preventDefault()
      moveTrigger(-1)
      break
    case 'Home':
      event.preventDefault()
      focusTrigger(0)
      break
    case 'End':
      event.preventDefault()
      focusTrigger(props.items.length - 1)
      break
    case intoKey:
      if (hasPanel(item)) {
        event.preventDefault()
        openPanel(index)
        focusLinkAt(index, 'first')
      }
      break
    case 'Enter':
    case ' ':
      if (hasPanel(item)) {
        event.preventDefault()
        togglePanel(index)
        if (openIndex.value === index)
          focusLinkAt(index, 'first')
      }
      break
    case 'Escape':
      closePanel(true)
      break
  }
}

// ---------------------------------------------------------------------------
// Panel link interaction
// ---------------------------------------------------------------------------

function onLinkClick(link: DzMegaMenuLink, item: DzMegaMenuItem, event: MouseEvent): void {
  if (link.disabled) {
    event.preventDefault()
    return
  }
  emit('select', link, item)
  closePanel()
}

function onLinkKeydown(event: KeyboardEvent, index: number): void {
  const links = panelLinks(index)
  const current = links.indexOf(event.target as HTMLElement)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      links[(current + 1) % links.length]?.focus()
      break
    case 'ArrowUp':
      event.preventDefault()
      links[(current - 1 + links.length) % links.length]?.focus()
      break
    case 'Home':
      event.preventDefault()
      links[0]?.focus()
      break
    case 'End':
      event.preventDefault()
      links[links.length - 1]?.focus()
      break
    case 'Escape':
      event.preventDefault()
      closePanel(true)
      break
    case 'Tab':
      // Leaving the panel via Tab closes it without stealing focus.
      closePanel()
      break
  }
}

// ---------------------------------------------------------------------------
// Collapsed (accordion) interaction
// ---------------------------------------------------------------------------

function toggleStack(index: number, item: DzMegaMenuItem): void {
  if (props.disabled || item.disabled || !hasPanel(item))
    return
  openIndex.value = openIndex.value === index ? null : index
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <nav
    :id="id"
    ref="rootRef"
    data-part="root"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :data-orientation="orientation"
    :data-collapsed="isCollapsed ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-mega-menu'), ...$attrs, class: undefined }"
  >
    <!-- ── Collapsed: stacked disclosure / accordion ── -->
    <ul v-if="isCollapsed" data-part="list" :class="cn(styles.stack(), ui?.list)">
      <li
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
      >
        <a
          v-if="safeHref(item.href) && !hasPanel(item)"
          :href="safeHref(item.href)"
          data-part="trigger"
          :class="cn(styles.trigger(), ui?.trigger)"
          :aria-disabled="item.disabled || undefined"
          :data-disabled="item.disabled ? '' : undefined"
        >
          <slot name="item" :item="item" :index="index" :open="false">{{ item.label }}</slot>
        </a>
        <button
          v-else
          type="button"
          data-part="trigger"
          :class="cn(styles.trigger(), ui?.trigger)"
          :disabled="disabled || item.disabled || undefined"
          :aria-expanded="hasPanel(item) ? openIndex === index : undefined"
          :data-state="urlRejected(item.href) ? 'url-rejected' : undefined"
          :data-open="openIndex === index ? '' : undefined"
          @click="toggleStack(index, item)"
        >
          <slot name="item" :item="item" :index="index" :open="openIndex === index">
            {{ item.label }}
          </slot>
          <ChevronDown
            v-if="hasPanel(item)"
            data-part="indicator"
            :class="cn(styles.caret(), ui?.indicator)"
            :data-open="openIndex === index ? '' : undefined"
            class="h-4 w-4"
            aria-hidden="true"
          />
        </button>

        <div
          v-if="hasPanel(item) && openIndex === index"
          :data-mega-panel="index"
          data-part="panel"
          :class="cn(styles.disclosure(), ui?.panel)"
        >
          <div
            v-for="(group, gIndex) in item.items"
            :key="groupKey(group, gIndex)"
            data-part="group"
            :class="cn(styles.column(), ui?.group)"
          >
            <slot name="group" :group="group" :item="item" :index="gIndex">
              <span v-if="group.label" data-part="group-label" :class="cn(styles.columnHeading(), ui?.['group-label'])">{{ group.label }}</span>
              <component
                :is="safeHref(link.href) ? 'a' : 'button'"
                v-for="(link, lIndex) in group.items"
                :key="linkKey(link, lIndex)"
                data-mega-link
                :type="safeHref(link.href) ? undefined : 'button'"
                :href="safeHref(link.href)"
                :data-state="urlRejected(link.href) ? 'url-rejected' : undefined"
                data-part="item"
                :class="cn(styles.link(), ui?.item)"
                :aria-disabled="link.disabled || undefined"
                :data-disabled="link.disabled ? '' : undefined"
                @click="onLinkClick(link, item, $event)"
              >
                <slot name="link" :link="link" :group="group">
                  <span>{{ link.label }}</span>
                  <span v-if="link.description" :class="styles.linkDescription()">{{ link.description }}</span>
                </slot>
              </component>
            </slot>
          </div>
        </div>
      </li>
    </ul>

    <!-- ── Expanded: menubar with multi-column panels ── -->
    <ul
      v-else
      role="menubar"
      :aria-orientation="orientation === 'vertical' ? 'vertical' : 'horizontal'"
      :aria-label="ariaLabel"
      data-part="list"
      :class="cn(styles.menubar(), ui?.list)"
    >
      <li
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
        :class="styles.itemWrapper()"
        @mouseenter="onTriggerEnter(index, item)"
        @mouseleave="onWrapperLeave"
      >
        <a
          v-if="safeHref(item.href) && !hasPanel(item)"
          :href="safeHref(item.href)"
          role="menuitem"
          :data-mega-trigger="index"
          data-part="trigger"
          :class="cn(styles.trigger(), ui?.trigger)"
          :tabindex="index === focusedIndex ? 0 : -1"
          :aria-disabled="item.disabled || undefined"
          :data-disabled="item.disabled ? '' : undefined"
          @focus="focusedIndex = index"
          @keydown="onTriggerKeydown($event, index, item)"
          @click="onTriggerClick(index, item, $event)"
        >
          <slot name="item" :item="item" :index="index" :open="false">{{ item.label }}</slot>
        </a>
        <button
          v-else
          type="button"
          role="menuitem"
          :data-mega-trigger="index"
          data-part="trigger"
          :class="cn(styles.trigger(), ui?.trigger)"
          :tabindex="index === focusedIndex ? 0 : -1"
          :disabled="disabled || item.disabled || undefined"
          :aria-haspopup="hasPanel(item) ? 'true' : undefined"
          :aria-expanded="hasPanel(item) ? openIndex === index : undefined"
          :data-state="urlRejected(item.href) ? 'url-rejected' : undefined"
          :data-open="openIndex === index ? '' : undefined"
          @focus="focusedIndex = index"
          @keydown="onTriggerKeydown($event, index, item)"
          @click="onTriggerClick(index, item, $event)"
        >
          <slot name="item" :item="item" :index="index" :open="openIndex === index">
            {{ item.label }}
          </slot>
          <ChevronDown
            v-if="hasPanel(item)"
            data-part="indicator"
            :class="cn(styles.caret(), ui?.indicator)"
            :data-open="openIndex === index ? '' : undefined"
            class="h-4 w-4"
            aria-hidden="true"
          />
        </button>

        <!-- Dropdown panel -->
        <div
          v-if="hasPanel(item) && openIndex === index"
          role="menu"
          :data-mega-panel="index"
          :aria-label="item.label"
          data-part="panel"
          :class="cn(styles.panel(), ui?.panel)"
          @keydown="onLinkKeydown($event, index)"
        >
          <div
            :class="styles.columns()"
            :style="{ gridTemplateColumns: `repeat(${item.items!.length}, minmax(0, 1fr))` }"
          >
            <div
              v-for="(group, gIndex) in item.items"
              :key="groupKey(group, gIndex)"
              data-part="group"
              :class="cn(styles.column(), ui?.group)"
              :data-featured="group.featured ? '' : undefined"
            >
              <slot name="group" :group="group" :item="item" :index="gIndex">
                <span v-if="group.label" data-part="group-label" :class="cn(styles.columnHeading(), ui?.['group-label'])">{{ group.label }}</span>
                <component
                  :is="safeHref(link.href) ? 'a' : 'button'"
                  v-for="(link, lIndex) in group.items"
                  :key="linkKey(link, lIndex)"
                  data-mega-link
                  role="menuitem"
                  tabindex="-1"
                  :type="safeHref(link.href) ? undefined : 'button'"
                  :href="safeHref(link.href)"
                  :data-state="urlRejected(link.href) ? 'url-rejected' : undefined"
                  data-part="item"
                  :class="cn(styles.link(), ui?.item)"
                  :aria-disabled="link.disabled || undefined"
                  :data-disabled="link.disabled ? '' : undefined"
                  @click="onLinkClick(link, item, $event)"
                >
                  <slot name="link" :link="link" :group="group">
                    <span>{{ link.label }}</span>
                    <span v-if="link.description" :class="styles.linkDescription()">{{ link.description }}</span>
                  </slot>
                </component>
              </slot>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>
