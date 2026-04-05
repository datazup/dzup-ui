/**
 * useFocusTrap — Composable for trapping keyboard focus within a container.
 *
 * When activated, Tab and Shift+Tab cycling is constrained to focusable
 * elements within the container. Useful for modals, dialogs, and drawers.
 * SSR-safe: no DOM access until explicitly activated.
 *
 * @module @dzip-ui/core/composables/useFocusTrap
 */

import type { Ref } from 'vue'
import { onBeforeUnmount, ref } from 'vue'

/** Selector for all natively focusable elements */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** Return value of the useFocusTrap composable */
export interface UseFocusTrapReturn {
  /** Activate the focus trap within the container */
  activate: () => void
  /** Deactivate the focus trap */
  deactivate: () => void
  /** Whether the focus trap is currently active */
  isActive: Ref<boolean>
}

/**
 * Returns focus-trap controls for the given container element.
 *
 * @param containerRef - Ref to the container element that will trap focus
 * @returns Controls to activate, deactivate, and check trap state
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
): UseFocusTrapReturn {
  const isActive = ref(false)

  /** Returns all focusable elements within the container */
  function getFocusableElements(): HTMLElement[] {
    const container = containerRef.value
    if (!container)
      return []
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  }

  /** Keydown handler that intercepts Tab/Shift+Tab */
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab')
      return

    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey) {
      // Shift+Tab: if focus is on the first element, wrap to last
      if (active === first || !containerRef.value?.contains(active)) {
        event.preventDefault()
        last?.focus()
      }
    }
    else {
      // Tab: if focus is on the last element, wrap to first
      if (active === last || !containerRef.value?.contains(active)) {
        event.preventDefault()
        first?.focus()
      }
    }
  }

  /** Activate the focus trap */
  function activate(): void {
    if (isActive.value)
      return

    isActive.value = true
    document.addEventListener('keydown', handleKeyDown)

    // Focus the first focusable element in the container
    const focusable = getFocusableElements()
    if (focusable.length > 0) {
      focusable[0]?.focus()
    }
  }

  /** Deactivate the focus trap */
  function deactivate(): void {
    if (!isActive.value)
      return

    isActive.value = false
    document.removeEventListener('keydown', handleKeyDown)
  }

  onBeforeUnmount(() => {
    deactivate()
  })

  return {
    activate,
    deactivate,
    isActive,
  }
}
