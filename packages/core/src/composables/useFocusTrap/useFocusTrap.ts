/**
 * useFocusTrap — Composable for trapping keyboard focus within a container.
 *
 * When activated, Tab and Shift+Tab cycling is constrained to focusable
 * elements within the container. Useful for modals, dialogs, and drawers.
 * SSR-safe: no DOM access until explicitly activated.
 *
 * @module @dzup-ui/core/composables/useFocusTrap
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

/** Options for {@link useFocusTrap}. */
export interface UseFocusTrapOptions {
  /**
   * Return focus to whatever held it when the trap was activated, on release
   * (defect D7, WCAG 2.4.3 Focus Order).
   *
   * Defaults to `true`: a trap that takes focus and drops it on `<body>` leaves
   * a keyboard user at the top of the document with no way back to what they
   * were doing, and that was the shipped behaviour for every consumer that did
   * not restore focus itself.
   *
   * Pass `false` when the caller owns the restore — it knows a better target
   * than "whatever was focused when `activate()` ran", or it captured the
   * element earlier, before it moved focus into the trap itself.
   */
  restoreFocus?: boolean
}

/**
 * Returns focus-trap controls for the given container element.
 *
 * @param containerRef - Ref to the container element that will trap focus
 * @param options - see {@link UseFocusTrapOptions}
 * @returns Controls to activate, deactivate, and check trap state
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  options: UseFocusTrapOptions = {},
): UseFocusTrapReturn {
  const { restoreFocus = true } = options
  const isActive = ref(false)

  /** What held focus when the trap was activated; restored on release. */
  let previouslyFocused: HTMLElement | null = null

  /** Returns all focusable elements within the container, in document order */
  function getFocusableElements(): HTMLElement[] {
    const container = containerRef.value
    if (!container)
      return []
    const list = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    // querySelectorAll on a selector group can return selector-group order
    // rather than document order (e.g. jsdom). Sort by document position so the
    // first/last tab-wrap boundaries are robust to selector ordering.
    list.sort((a, b) => {
      const pos = a.compareDocumentPosition(b)
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING)
        return -1
      if (pos & Node.DOCUMENT_POSITION_PRECEDING)
        return 1
      return 0
    })
    return list
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
    // Remembered before anything is focused, so the restore target is the
    // element the user left, not the one the trap is about to take.
    previouslyFocused = (document.activeElement as HTMLElement | null) ?? null
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

    const target = previouslyFocused
    previouslyFocused = null

    if (!restoreFocus || !target || typeof target.focus !== 'function')
      return
    // A trigger inside a v-if'd panel can be gone by the time the trap closes.
    if (!target.isConnected)
      return

    // Restore only while focus is still inside the trap or nowhere. If
    // something outside deliberately took focus as the trap closed — a toast
    // action, a router-driven page — pulling it back is worse than not
    // restoring at all.
    const active = document.activeElement as HTMLElement | null
    const stranded = !active
      || active === document.body
      || containerRef.value?.contains(active) === true
    if (!stranded)
      return

    target.focus()
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
