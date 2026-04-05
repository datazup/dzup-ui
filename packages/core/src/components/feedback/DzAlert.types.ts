/**
 * DzAlert — type definitions.
 *
 * @module @dzip-ui/core/components/feedback/DzAlert
 */

import type {
  AlertVariant,
  BaseAccessibilityProps,
  CanonicalTone,
} from '@dzip-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzAlert component */
export interface DzAlertProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: AlertVariant
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Whether the alert can be dismissed */
  closable?: boolean
  /** Optional icon component to display */
  icon?: Component
  /** Alert title text */
  title?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAlert */
export interface DzAlertEmits {
  /** Emitted when the close button is clicked */
  close: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAlert */
export interface DzAlertSlots {
  /** Message body content */
  default?: () => unknown
  /** Custom title content (overrides title prop) */
  title?: () => unknown
  /** Custom icon content (overrides icon prop) */
  icon?: () => unknown
  /** Action buttons area */
  actions?: () => unknown
}
