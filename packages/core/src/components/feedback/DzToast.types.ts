/**
 * DzToast — Compound toast notification type definitions.
 *
 * Uses Reka UI Toast primitives (ADR-07).
 * Typed injection key for compound context (ADR-08).
 *
 * @module @dzip-ui/core/components/feedback/DzToast
 */

import type { BaseAccessibilityProps, CanonicalTone } from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Toast item (for imperative API)
// ---------------------------------------------------------------------------

/** A single toast notification item */
export interface ToastItem {
  /** Unique identifier */
  id: string
  /** Toast heading text */
  title: string
  /** Optional description text */
  description?: string
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Auto-dismiss duration in milliseconds (0 = persistent) */
  duration?: number
  /** Optional action label */
  actionLabel?: string
  /** Optional action callback */
  onAction?: () => void
}

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided by DzToastProvider to child components via inject */
export interface DzToastContext {
  /** Current list of active toasts */
  toasts: Ref<ToastItem[]>
  /** Add a new toast */
  add: (toast: Omit<ToastItem, 'id'>) => string
  /** Remove a toast by id */
  remove: (id: string) => void
  /** Remove all toasts */
  clear: () => void
}

/** Typed injection key for DzToast compound context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TOAST_KEY: InjectionKey<DzToastContext> = Symbol('dz-toast')

// ---------------------------------------------------------------------------
// DzToastProvider Props
// ---------------------------------------------------------------------------

/** Props for the DzToastProvider component */
export interface DzToastProviderProps {
  /** Default auto-dismiss duration in milliseconds (default: 5000) */
  duration?: number
  /** Maximum number of visible toasts (default: 5) */
  maxToasts?: number
  /** Swipe direction for dismissal */
  swipeDirection?: 'right' | 'left' | 'up' | 'down'
}

// ---------------------------------------------------------------------------
// DzToast Props
// ---------------------------------------------------------------------------

/** Props for the DzToast component */
export interface DzToastProps extends BaseAccessibilityProps {
  /** Toast data item */
  toast: ToastItem
}

// ---------------------------------------------------------------------------
// DzToast Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzToast */
export interface DzToastEmits {
  /** Toast was closed (by user or timeout) */
  close: [id: string]
  /** Action button was clicked */
  action: [id: string]
}

// ---------------------------------------------------------------------------
// DzToastViewport Props
// ---------------------------------------------------------------------------

/** Props for the DzToastViewport component */
export interface DzToastViewportProps {
  /** Viewport position on screen */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzToastProvider */
export interface DzToastProviderSlots {
  /** Application content + DzToastViewport */
  default: () => unknown
}

/** Slot definitions for DzToast */
export interface DzToastSlots {
  /** Custom toast content */
  default?: (props: { toast: ToastItem }) => unknown
  /** Custom action button */
  action?: (props: { toast: ToastItem }) => unknown
}

/** Slot definitions for DzToastViewport */
export interface DzToastViewportSlots {
  /** Custom viewport wrapper content */
  default?: () => unknown
}
