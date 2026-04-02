/**
 * useClickOutside — Composable to detect clicks outside a target element.
 *
 * Registers a mousedown listener on `document` and invokes the handler
 * when the click target is not contained within the referenced element.
 * SSR-safe: no `document` access at module level.
 *
 * @module @dzup-ui/core/composables/useClickOutside
 */

import type { MaybeRef, Ref } from 'vue'
import { onBeforeUnmount, onMounted, unref, watch } from 'vue'

/** Options for the useClickOutside composable */
export interface UseClickOutsideOptions {
  /** Whether the listener is active. Defaults to true. */
  enabled?: MaybeRef<boolean>
}

/**
 * Calls `handler` when a mousedown event occurs outside the `target` element.
 *
 * @param target - Ref to the element to detect outside clicks for
 * @param handler - Callback invoked with the MouseEvent when an outside click is detected
 * @param options - Optional configuration
 */
export function useClickOutside(
  target: Ref<HTMLElement | null>,
  handler: (event: MouseEvent) => void,
  options?: UseClickOutsideOptions,
): void {
  const enabled = options?.enabled ?? true

  const listener = (event: MouseEvent): void => {
    const el = target.value
    if (!el)
      return
    if (!unref(enabled))
      return

    // Ignore clicks inside the target element
    if (el === event.target || el.contains(event.target as Node)) {
      return
    }

    handler(event)
  }

  onMounted(() => {
    document.addEventListener('mousedown', listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', listener)
  })

  // If enabled is a ref, watch for changes — but listener always checks enabled,
  // so we don't need to add/remove the listener dynamically.
  // The check inside the listener is sufficient and avoids race conditions.
  if (typeof enabled === 'object' && 'value' in enabled) {
    watch(enabled, () => {
      // No-op: the listener checks `enabled` on each event.
      // This watch exists only to ensure Vue tracks the ref reactivity.
    })
  }
}
