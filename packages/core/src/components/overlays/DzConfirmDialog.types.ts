/**
 * DzConfirmDialog -- Type definitions for the confirm dialog component.
 *
 * A pre-composed dialog that wraps DzDialog compound components
 * to provide a simple confirm/cancel interaction pattern.
 *
 * @module @dzup-ui/core/components/overlays/DzConfirmDialog
 */

import type { CanonicalSize } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzConfirmDialog component */
export interface DzConfirmDialogProps {
  /** Optional id attribute for the dialog content */
  id?: string
  /** Whether the dialog is open (v-model:open) */
  open?: boolean
  /** Title text displayed in the dialog header */
  title: string
  /** Message text displayed below the title */
  message?: string
  /** Label for the confirm action button */
  confirmLabel?: string
  /** Label for the cancel action button */
  cancelLabel?: string
  /** Visual variant controlling icon and confirm button styling */
  variant?: 'default' | 'danger'
  /** Whether the confirm action is in progress */
  loading?: boolean
  /** Size of the underlying dialog content panel */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzConfirmDialog */
export interface DzConfirmDialogEmits {
  /** Dialog open state changed */
  'update:open': [value: boolean]
  /** User confirmed the action */
  'confirm': []
  /** User cancelled the action */
  'cancel': []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzConfirmDialog */
export interface DzConfirmDialogSlots {
  /** Custom body content, replaces the default message text */
  default?: () => unknown
  /** Custom icon content, replaces the default variant icon */
  icon?: () => unknown
}
