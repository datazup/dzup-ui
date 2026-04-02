/**
 * useToast — Imperative toast notification API.
 *
 * Provides `toast()`, `dismiss()`, and `clear()` functions to manage
 * toast notifications from any component. Requires a DzToastProvider
 * ancestor in the component tree.
 *
 * @module @dzup-ui/core/composables/useToast
 */

import type { DzToastContext, ToastItem } from '../../components/feedback/DzToast.types.ts'
import { inject } from 'vue'
import {
  DZ_TOAST_KEY,

} from '../../components/feedback/DzToast.types.ts'

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useToast composable */
export interface UseToastReturn {
  /** Show a toast notification. Returns the toast ID for programmatic dismissal. */
  toast: (options: ToastOptions) => string
  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void
  /** Dismiss all active toasts */
  clear: () => void
}

/** Options for creating a toast notification */
export type ToastOptions = Omit<ToastItem, 'id'>

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Imperative toast notification API.
 *
 * @throws Error in development if used outside DzToastProvider
 *
 * @example
 * ```ts
 * const { toast, dismiss } = useToast()
 * const id = toast({ title: 'Saved', tone: 'success', duration: 3000 })
 * dismiss(id)
 * ```
 */
export function useToast(): UseToastReturn {
  const context = inject<DzToastContext | null>(DZ_TOAST_KEY, null)

  if (!context && import.meta.env?.DEV) {
    console.warn(
      '[dzip-ui] useToast() must be used within a <DzToastProvider>. '
      + 'Toast calls will be silently ignored.',
    )
  }

  function toast(options: ToastOptions): string {
    if (!context)
      return ''
    return context.add(options)
  }

  function dismiss(id: string): void {
    context?.remove(id)
  }

  function clear(): void {
    context?.clear()
  }

  return { toast, dismiss, clear }
}
