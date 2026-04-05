/**
 * useSelectKeyboard — Keyboard navigation logic extracted from useSelect.
 *
 * Handles Arrow Up/Down, Home/End, Enter/Space, Escape, and type-ahead
 * search for select/listbox components.
 *
 * @module @dzip-ui/core/composables/useSelect
 */

import type { ComputedRef, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useSelectKeyboard composable */
export interface UseSelectKeyboardOptions<T> {
  /** Whether the dropdown is currently open */
  isOpen: Ref<boolean>
  /** Filtered items list */
  filteredItems: ComputedRef<T[]>
  /** Currently highlighted index */
  highlightedIndex: Ref<number>
  /** Search query (for type-ahead) */
  searchQuery: Ref<string>
  /** Whether type-ahead search is enabled */
  searchable: boolean
  /** Open the dropdown */
  open: () => void
  /** Close the dropdown */
  close: () => void
  /** Select an item by reference */
  select: (item: T) => void
  /** Move highlight to next item */
  highlightNext: () => void
  /** Move highlight to previous item */
  highlightPrev: () => void
  /** Move highlight to first item */
  highlightFirst: () => void
  /** Move highlight to last item */
  highlightLast: () => void
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return type for the useSelectKeyboard composable */
export interface UseSelectKeyboardReturn {
  /** Keyboard event handler for the select trigger/listbox */
  onKeydown: (event: KeyboardEvent) => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Provides keyboard event handling for select/listbox components.
 *
 * Key bindings:
 * - ArrowDown: open (if closed) or highlight next
 * - ArrowUp: open (if closed) or highlight previous
 * - Home: highlight first (when open)
 * - End: highlight last (when open)
 * - Enter / Space: select highlighted item (if open), or open
 * - Escape: close
 * - Printable characters: type-ahead search (if searchable)
 *
 * @typeParam T - The type of items in the select list
 */
export function useSelectKeyboard<T>(
  options: UseSelectKeyboardOptions<T>,
): UseSelectKeyboardReturn {
  const {
    isOpen,
    filteredItems,
    highlightedIndex,
    searchQuery,
    searchable,
    open,
    close,
    select,
    highlightNext,
    highlightPrev,
    highlightFirst,
    highlightLast,
  } = options

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
        if (searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          if (!isOpen.value) {
            open()
          }
          searchQuery.value += event.key
        }
        break
      }
    }
  }

  return { onKeydown }
}
