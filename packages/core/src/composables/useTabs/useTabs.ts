/**
 * useTabs — Composable for managing tabbed interface state and keyboard navigation.
 *
 * Handles tab registration, active tab tracking, and keyboard navigation
 * following WAI-ARIA Tabs pattern (Arrow keys, Home, End).
 *
 * @module @dzip-ui/core/composables/useTabs
 */

import type { MaybeRef, Ref } from 'vue'
import { computed, ref, toValue } from 'vue'

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Represents a single tab item registered with the useTabs composable */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string
  /** Display label for the tab */
  label: string
  /** Whether this tab is disabled and cannot be activated */
  disabled?: boolean
}

/** Options for configuring the useTabs composable */
export interface UseTabsOptions {
  /** The currently active tab ID (reactive) */
  modelValue?: MaybeRef<string>
  /** Orientation of the tab list — determines keyboard navigation axis */
  orientation?: 'horizontal' | 'vertical'
}

/** Return value of the useTabs composable */
export interface UseTabsReturn {
  /** The currently active tab ID */
  activeTab: Ref<string>
  /** Set the active tab by ID (no-op if tab is disabled or not registered) */
  setTab: (id: string) => void
  /** Registered tab items */
  tabs: Ref<TabItem[]>
  /** Register a new tab item (idempotent — re-registering updates the entry) */
  registerTab: (tab: TabItem) => void
  /** Remove a tab from the registry by ID */
  unregisterTab: (id: string) => void
  /** Keyboard event handler for WAI-ARIA tab navigation */
  onKeydown: (event: KeyboardEvent) => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages tabbed interface state with full keyboard navigation support.
 *
 * Supports horizontal (Arrow Left/Right) and vertical (Arrow Up/Down)
 * orientations, plus Home/End navigation. Disabled tabs are skipped
 * during keyboard navigation.
 *
 * @param options - Configuration for the tabs composable
 * @returns Tab state, registration functions, and keyboard handler
 *
 * @example
 * ```ts
 * const { activeTab, setTab, registerTab, onKeydown } = useTabs({
 *   modelValue: 'tab-1',
 *   orientation: 'horizontal',
 * })
 * ```
 */
export function useTabs(options: UseTabsOptions = {}): UseTabsReturn {
  const { orientation = 'horizontal' } = options

  const tabs = ref<TabItem[]>([])
  const activeTab = ref<string>(toValue(options.modelValue) ?? '')

  /** Set the active tab by ID. Ignores disabled or unregistered tabs. */
  function setTab(id: string): void {
    const tab = tabs.value.find(t => t.id === id)
    if (!tab || tab.disabled) {
      return
    }
    activeTab.value = id
  }

  /** Register a tab item. If a tab with the same ID exists, it is updated. */
  function registerTab(tab: TabItem): void {
    const index = tabs.value.findIndex(t => t.id === tab.id)
    if (index >= 0) {
      tabs.value[index] = tab
    }
    else {
      tabs.value = [...tabs.value, tab]
    }

    // Auto-activate first enabled tab if no active tab is set
    if (!activeTab.value) {
      const firstEnabled = tabs.value.find(t => !t.disabled)
      if (firstEnabled) {
        activeTab.value = firstEnabled.id
      }
    }
  }

  /** Remove a tab from the registry by ID */
  function unregisterTab(id: string): void {
    tabs.value = tabs.value.filter(t => t.id !== id)

    // If the removed tab was active, activate the first enabled tab
    if (activeTab.value === id) {
      const firstEnabled = tabs.value.find(t => !t.disabled)
      activeTab.value = firstEnabled?.id ?? ''
    }
  }

  /** Get enabled tabs only */
  const enabledTabs = computed(() => tabs.value.filter(t => !t.disabled))

  /**
   * Navigate to the next or previous enabled tab.
   * Wraps around at the boundaries.
   */
  function navigateTab(direction: 1 | -1): void {
    const enabled = enabledTabs.value
    if (enabled.length === 0)
      return

    const currentIndex = enabled.findIndex(t => t.id === activeTab.value)
    const nextIndex = currentIndex === -1
      ? 0
      : (currentIndex + direction + enabled.length) % enabled.length
    const target = enabled[nextIndex]
    if (target) {
      activeTab.value = target.id
    }
  }

  /** Navigate to the first enabled tab */
  function navigateFirst(): void {
    const first = enabledTabs.value[0]
    if (first) {
      activeTab.value = first.id
    }
  }

  /** Navigate to the last enabled tab */
  function navigateLast(): void {
    const enabled = enabledTabs.value
    const last = enabled[enabled.length - 1]
    if (last) {
      activeTab.value = last.id
    }
  }

  /**
   * Keyboard event handler implementing WAI-ARIA Tabs pattern.
   *
   * Horizontal: ArrowLeft (prev), ArrowRight (next)
   * Vertical: ArrowUp (prev), ArrowDown (next)
   * Both: Home (first), End (last)
   */
  function onKeydown(event: KeyboardEvent): void {
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

    switch (event.key) {
      case prevKey:
        event.preventDefault()
        navigateTab(-1)
        break
      case nextKey:
        event.preventDefault()
        navigateTab(1)
        break
      case 'Home':
        event.preventDefault()
        navigateFirst()
        break
      case 'End':
        event.preventDefault()
        navigateLast()
        break
    }
  }

  return {
    activeTab,
    setTab,
    tabs,
    registerTab,
    unregisterTab,
    onKeydown,
  }
}
