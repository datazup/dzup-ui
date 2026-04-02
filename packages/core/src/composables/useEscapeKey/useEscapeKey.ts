/**
 * useEscapeKey — Composable to handle Escape key presses.
 *
 * Registers a keydown listener on `document` and invokes the handler
 * when the Escape key is pressed and the composable is active.
 * SSR-safe: no `document` access at module level.
 *
 * @module @dzup-ui/core/composables/useEscapeKey
 */

import type { MaybeRef } from 'vue'
import { onBeforeUnmount, onMounted, unref } from 'vue'

/**
 * Calls `handler` when the Escape key is pressed while the composable is active.
 *
 * @param handler - Callback invoked when Escape is pressed
 * @param active - Whether the listener should respond. Defaults to true.
 */
export function useEscapeKey(
  handler: () => void,
  active?: MaybeRef<boolean>,
): void {
  const listener = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape')
      return

    const isActive = active !== undefined ? unref(active) : true
    if (!isActive)
      return

    handler()
  }

  onMounted(() => {
    document.addEventListener('keydown', listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', listener)
  })
}
