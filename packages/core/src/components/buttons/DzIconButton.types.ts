/**
 * DzIconButton — type definitions.
 *
 * Extends DzButton API for icon-only buttons.
 * Requires `ariaLabel` for accessibility since there is no visible text.
 *
 * @module @dzup-ui/core/components/buttons/DzIconButton
 */

import type {
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzIconButton component */
export interface DzIconButtonProps {
  /** Icon component to render (from lucide-vue-next or similar) */
  icon: Component
  /** Accessible label -- REQUIRED since there is no visible text */
  ariaLabel: string
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Loading state -- shows spinner and sets aria-busy */
  loading?: boolean
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzIconButton */
export interface DzIconButtonEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}
