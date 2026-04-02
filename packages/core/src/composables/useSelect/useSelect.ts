/**
 * useSelect — Generic select/listbox behavior composable.
 *
 * Encapsulates open/close state, keyboard navigation (Arrow Up/Down,
 * Home/End, Enter, Escape), type-ahead search filtering, and item
 * selection logic for select-like components.
 *
 * SSR-safe: no `window` or `document` access at module level.
 *
 * @module @dzup-ui/core/composables/useSelect
 */

import type { ComputedRef, MaybeRef, Ref } from 'vue'
import { computed, ref, toValue, watch } from 'vue'

// ---------------------------------------------------------------------------
// Options interface
// ---------------------------------------------------------------------------

/** Configuration options for the useSelect composable */
export interface UseSelectOptions<T> {
  /** The list of selectable items */
  items: MaybeRef<T[]>
  /** The currently selected value (single-select) */
  modelValue?: MaybeRef<T | undefined>
  /** Extracts a display label from an item (defaults to `String(item)`) */
  itemLabel?: (item: T) => string
  /** Extracts a comparison value from an item (defaults to the item itself) */
  itemValue?: (item: T) => unknown
  /** Whether type-ahead search filtering is enabled */
  searchable?: boolean
  /** Whether multiple items can be selected (reserved for future use) */
  multiple?: boolean
}

// ---------------------------------------------------------------------------
// Return interface
// ---------------------------------------------------------------------------

/** Return value of the useSelect composable */
export interface UseSelectReturn<T> {
  /** Whether the dropdown/listbox is open */
  isOpen: Ref<boolean>
  /** Current search/filter query string */
  searchQuery: Ref<string>
  /** Items filtered by the current search query */
  filteredItems: ComputedRef<T[]>
  /** Index of the currently highlighted item within filteredItems */
  highlightedIndex: Ref<number>
  /** The currently selected item (derived from modelValue) */
  selectedItem: ComputedRef<T | undefined>
  /** Open the dropdown */
  open: () => void
  /** Close the dropdown and reset search */
  close: () => void
  /** Select an item */
  select: (item: T) => void
  /** Move highlight to the next item */
  highlightNext: () => void
  /** Move highlight to the previous item */
  highlightPrev: () => void
  /** Move highlight to the first item */
  highlightFirst: () => void
  /** Move highlight to the last item */
  highlightLast: () => void
  /** Keyboard event handler for the select trigger/listbox */
  onKeydown: (event: KeyboardEvent) => void
}

// ---------------------------------------------------------------------------
// Default helpers
// ---------------------------------------------------------------------------

/** Default label extractor — coerces item to string */
function defaultItemLabel<T>(item: T): string {
  return String(item)
}

/** Default value extractor — returns the item itself */
function defaultItemValue<T>(item: T): unknown {
  return item
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Provides generic select/listbox behavior including open/close state,
 * keyboard navigation, search filtering, and item selection.
 *
 * @typeParam T - The type of items in the select list
 * @param options - Configuration for the select behavior
 * @param onSelect - Callback invoked when an item is selected
 * @returns Reactive state and methods for select behavior
 */
export function useSelect<T>(
  options: UseSelectOptions<T>,
  onSelect?: (item: T) => void,
): UseSelectReturn<T> {
  const getLabel = options.itemLabel ?? defaultItemLabel
  const getValue = options.itemValue ?? defaultItemValue

  // -- Reactive state -------------------------------------------------------

  const isOpen = ref(false)
  const searchQuery = ref('')
  const highlightedIndex = ref(-1)

  // -- Computed values ------------------------------------------------------

  const resolvedItems = computed(() => toValue(options.items))

  const filteredItems = computed<T[]>(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query || !options.searchable) {
      return resolvedItems.value
    }
    return resolvedItems.value.filter(item =>
      getLabel(item).toLowerCase().includes(query),
    )
  })

  const selectedItem = computed<T | undefined>(() => {
    const current = toValue(options.modelValue)
    if (current === undefined)
      return undefined
    const currentValue = getValue(current)
    return resolvedItems.value.find(
      item => getValue(item) === currentValue,
    )
  })

  // -- Watchers -------------------------------------------------------------

  // Reset highlighted index when filtered items change
  watch(filteredItems, () => {
    if (highlightedIndex.value >= filteredItems.value.length) {
      highlightedIndex.value = filteredItems.value.length > 0 ? 0 : -1
    }
  })

  // -- Methods --------------------------------------------------------------

  /** Open the dropdown and highlight the selected item (or first) */
  function open(): void {
    if (isOpen.value)
      return
    isOpen.value = true

    // Highlight selected item if present, otherwise first
    const sel = selectedItem.value
    if (sel !== undefined) {
      const idx = filteredItems.value.findIndex(
        item => getValue(item) === getValue(sel),
      )
      highlightedIndex.value = idx >= 0 ? idx : 0
    }
    else {
      highlightedIndex.value = filteredItems.value.length > 0 ? 0 : -1
    }
  }

  /** Close the dropdown, reset search query and highlight */
  function close(): void {
    if (!isOpen.value)
      return
    isOpen.value = false
    searchQuery.value = ''
    highlightedIndex.value = -1
  }

  /** Select an item, invoke callback, and close */
  function select(item: T): void {
    onSelect?.(item)
    close()
  }

  /** Move highlight down by one, wrapping to start */
  function highlightNext(): void {
    const len = filteredItems.value.length
    if (len === 0)
      return
    highlightedIndex.value = (highlightedIndex.value + 1) % len
  }

  /** Move highlight up by one, wrapping to end */
  function highlightPrev(): void {
    const len = filteredItems.value.length
    if (len === 0)
      return
    highlightedIndex.value = (highlightedIndex.value - 1 + len) % len
  }

  /** Move highlight to the first item */
  function highlightFirst(): void {
    highlightedIndex.value = filteredItems.value.length > 0 ? 0 : -1
  }

  /** Move highlight to the last item */
  function highlightLast(): void {
    const len = filteredItems.value.length
    highlightedIndex.value = len > 0 ? len - 1 : -1
  }

  /**
   * Keyboard event handler for select interactions.
   *
   * - ArrowDown: open (if closed) or highlight next
   * - ArrowUp: open (if closed) or highlight previous
   * - Home: highlight first
   * - End: highlight last
   * - Enter / Space: select highlighted item (if open)
   * - Escape: close
   */
  function onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!isOpen.value) {
          open()
        }
        else {
          highlightNext()
        }
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (!isOpen.value) {
          open()
        }
        else {
          highlightPrev()
        }
        break
      }
      case 'Home': {
        if (isOpen.value) {
          event.preventDefault()
          highlightFirst()
        }
        break
      }
      case 'End': {
        if (isOpen.value) {
          event.preventDefault()
          highlightLast()
        }
        break
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (isOpen.value) {
          const idx = highlightedIndex.value
          const item = idx >= 0 && idx < filteredItems.value.length
            ? filteredItems.value[idx]
            : undefined
          if (item !== undefined) {
            select(item)
          }
        }
        else {
          open()
        }
        break
      }
      case 'Escape': {
        if (isOpen.value) {
          event.preventDefault()
          close()
        }
        break
      }
      default: {
        // Type-ahead: append printable single characters to search query
        if (options.searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          if (!isOpen.value) {
            open()
          }
          searchQuery.value += event.key
        }
        break
      }
    }
  }

  return {
    isOpen,
    searchQuery,
    filteredItems,
    highlightedIndex,
    selectedItem,
    open,
    close,
    select,
    highlightNext,
    highlightPrev,
    highlightFirst,
    highlightLast,
    onKeydown,
  }
}
