/**
 * DzNotification — type definitions for persistent notification messages.
 *
 * Unlike DzToast (ephemeral, time-based), DzNotification is persistent
 * until explicitly dismissed by the user.
 *
 * @module @dzup-ui/core/components/feedback/DzNotification
 */

import type {
  BaseAccessibilityProps,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { Component } from 'vue'
import type { DzNotificationUi } from './DzNotification.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzNotification component */
export interface DzNotificationProps extends BaseAccessibilityProps {
  /** Notification title */
  title: string
  /** Optional description text */
  description?: string
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Whether the notification can be dismissed */
  closable?: boolean
  /** Optional icon component */
  icon?: Component
  /** Auto-dismiss duration in milliseconds (0 = persistent) */
  duration?: number
  /**
   * Per-part class overrides, keyed by the names in
   * `DzNotification.anatomy.ts` (ADR-19 §5). `class` keeps its existing target
   * (the surface); `ui` addresses the other parts by name, and a typo is a
   * type error.
   */
  ui?: DzNotificationUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzNotification */
export interface DzNotificationEmits {
  /** Emitted when the notification is closed */
  close: []
  /** Emitted when the action button is clicked */
  action: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzNotification */
export interface DzNotificationSlots {
  /** Custom body content (overrides description) */
  default?: () => unknown
  /** Custom icon content (overrides icon prop) */
  icon?: () => unknown
  /** Action buttons area */
  actions?: () => unknown
}
