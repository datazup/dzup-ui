<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzTabListProps, DzTabListSlots } from './DzTabs.types.ts'
import { TabsList } from 'reka-ui'
/**
 * DzTabList — Container for tab triggers using Reka UI TabsList.
 *
 * Inherits variant/size/orientation from parent DzTabs context (ADR-08).
 *
 * @example
 * ```vue
 * <DzTabList>
 *   <DzTabTrigger value="tab1">Tab 1</DzTabTrigger>
 *   <DzTabTrigger value="tab2">Tab 2</DzTabTrigger>
 * </DzTabList>
 * ```
 */
import type { Directive } from 'vue'
import { computed, inject, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TABS_KEY } from './DzTabs.types.ts'
import { tabsVariants } from './DzTabs.variants.ts'

withDefaults(defineProps<DzTabListProps>(), {
  loop: true,
})

defineSlots<DzTabListSlots>()

const attrs = useAttrs()
const tabsContext = inject(DZ_TABS_KEY, null)

if (!tabsContext && import.meta.env?.DEV) {
  console.warn('[DzTabList] must be used inside a <DzTabs> parent.')
}

// ---------------------------------------------------------------------------
// APG roving tabindex (WCAG AA, APG Tabs pattern)
//
// Reka's RovingFocusGroup only assigns tabindex="0" to a tab once that tab has
// received focus (its internal `currentTabStopId` starts undefined), so on
// initial render every trigger is tabindex="-1" and keyboard users have no
// entry point into the tablist. We own the single roving tab stop here so that
// exactly one tab is tabindex="0" at all times:
//   - the focused tab while focus is inside the list (covers manual activation,
//     where the focused tab differs from the selected/active tab), otherwise
//   - the active tab, falling back to the first enabled tab.
// Arrow-key navigation is unaffected: Reka moves focus directly via .focus(),
// independent of the tabindex used for the Tab-key sequence.
// ---------------------------------------------------------------------------

function isEnabledTab(tab: HTMLElement): boolean {
  return !tab.hasAttribute('data-disabled') && tab.getAttribute('aria-disabled') !== 'true'
}

function syncRovingEntry(list: HTMLElement, ignoreFocus = false): void {
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'))
  if (tabs.length === 0) {
    return
  }

  const focused = ignoreFocus ? undefined : tabs.find(tab => tab === document.activeElement)
  const entry
    = focused
      ?? tabs.find(tab => tab.getAttribute('data-state') === 'active' && isEnabledTab(tab))
      ?? tabs.find(isEnabledTab)
      ?? tabs[0]

  for (const tab of tabs) {
    tab.setAttribute('tabindex', tab === entry ? '0' : '-1')
  }
}

let listEl: HTMLElement | null = null

function handleFocusIn(): void {
  if (listEl) {
    syncRovingEntry(listEl)
  }
}

function handleFocusOut(event: FocusEvent): void {
  // Only react when focus leaves the tablist entirely; intra-list moves are
  // handled by the matching focusin. On exit, hand the tab stop back to the
  // active tab so Tab re-enters on the selected tab (APG).
  const next = event.relatedTarget as Node | null
  if (listEl && (next === null || !listEl.contains(next))) {
    syncRovingEntry(listEl, true)
  }
}

/** Captures the tablist element, wires focus tracking, seeds the tab stop. */
const vRovingEntry: Directive<HTMLElement> = {
  mounted(el) {
    listEl = el
    el.addEventListener('focusin', handleFocusIn)
    el.addEventListener('focusout', handleFocusOut)
    syncRovingEntry(el)
  },
  unmounted(el) {
    el.removeEventListener('focusin', handleFocusIn)
    el.removeEventListener('focusout', handleFocusOut)
    listEl = null
  },
}

// Re-seed the entry tab stop after the active tab changes (e.g. programmatic
// v-model updates, or automatic activation following focus). flush: 'post'
// ensures Reka has patched data-state before we read it.
watch(
  () => tabsContext?.modelValue.value,
  () => {
    if (listEl) {
      syncRovingEntry(listEl)
    }
  },
  { flush: 'post' },
)

const styles = computed(() =>
  tabsVariants({
    variant: tabsContext?.variant.value ?? 'line',
    size: tabsContext?.size.value ?? 'md',
    orientation: tabsContext?.orientation.value ?? 'horizontal',
  }),
)

const classes = computed(() =>
  cn(styles.value.list(), attrs.class as string | undefined),
)
</script>


<template>
  <TabsList
    v-roving-entry
    :loop="loop"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </TabsList>
</template>
