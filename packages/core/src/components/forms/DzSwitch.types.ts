/**
 * DzSwitch — type definitions.
 *
 * Uses Reka UI SwitchRoot + SwitchThumb (ADR-07).
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzSwitch
 */

import type {
  BaseAccessibilityProps,
  BaseEvents,
  CanonicalSize,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSwitch component */
export interface DzSwitchProps extends BaseAccessibilityProps {
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
  /** Whether the switch is required */
  required?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSwitch */
export interface DzSwitchEmits extends BaseEvents {
  /** Value changed after user interaction */
  change: [checked: boolean]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSwitch */
export interface DzSwitchSlots {
  /** Label text for the switch */
  default?: () => unknown
}
