/**
 * useClipboard — Composable to copy text to the system clipboard.
 *
 * Uses the modern `navigator.clipboard.writeText()` API with a fallback
 * to the legacy `document.execCommand('copy')` approach for older browsers.
 * SSR-safe: no `navigator` or `document` access at module level.
 *
 * @module @dzup-ui/core/composables/useClipboard
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, ref } from 'vue'

/** Options for the useClipboard composable. */
export interface UseClipboardOptions {
  /** Milliseconds to auto-reset the `copied` state. Defaults to 2000. */
  resetDelay?: number
}

/** Return value of the useClipboard composable. */
export interface UseClipboardReturn {
  /** Whether a copy operation recently succeeded. Auto-resets after `resetDelay` ms. */
  copied: Ref<boolean>
  /** Copy the given text to the clipboard. */
  copy: (text: string) => Promise<void>
  /** Whether the Clipboard API is available in this environment. */
  isSupported: ComputedRef<boolean>
}

/**
 * Copies text to the system clipboard with automatic `copied` state management.
 *
 * @param options - Optional configuration
 * @returns Reactive clipboard state and copy function
 *
 * @example
 * ```ts
 * const { copied, copy, isSupported } = useClipboard()
 * await copy('Hello!')
 * // copied.value === true for 2 000 ms
 * ```
 */
export function useClipboard(options?: UseClipboardOptions): UseClipboardReturn {
  const { resetDelay = 2000 } = options ?? {}

  const copied = ref(false)
  let resetTimeout: ReturnType<typeof setTimeout> | undefined

  const isSupported = computed(
    () =>
      typeof navigator !== 'undefined'
      && typeof navigator.clipboard?.writeText === 'function',
  )

  /**
   * Legacy fallback using a temporary textarea and `document.execCommand('copy')`.
   * Throws if the command fails.
   */
  function legacyCopy(text: string): void {
    const textarea = document.createElement('textarea')
    textarea.value = text
    // Position off-screen to avoid visual flash
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      const ok = document.execCommand('copy')
      if (!ok) {
        throw new Error('execCommand copy returned false')
      }
    }
    finally {
      document.body.removeChild(textarea)
    }
  }

  /**
   * Copy the given text to the clipboard.
   *
   * @param text - The string to copy
   */
  async function copy(text: string): Promise<void> {
    try {
      if (isSupported.value) {
        await navigator.clipboard.writeText(text)
      }
      else {
        legacyCopy(text)
      }

      copied.value = true

      // Clear any existing timeout before scheduling a new one
      if (resetTimeout !== undefined) {
        clearTimeout(resetTimeout)
      }
      resetTimeout = setTimeout(() => {
        copied.value = false
        resetTimeout = undefined
      }, resetDelay)
    }
    catch {
      copied.value = false
    }
  }

  onBeforeUnmount(() => {
    if (resetTimeout !== undefined) {
      clearTimeout(resetTimeout)
      resetTimeout = undefined
    }
  })

  return { copied, copy, isSupported }
}
