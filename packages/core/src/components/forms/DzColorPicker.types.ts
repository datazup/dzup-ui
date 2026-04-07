/**
 * DzColorPicker — Type definitions for the color picker component.
 *
 * Built from scratch with Popover for the panel.
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzColorPicker
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  ChangeEvents,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzColorPicker component */
export interface DzColorPickerProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Preset color swatches to display */
  presets?: string[]
  /** Show hex/rgb text input */
  showInput?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzColorPicker */
export interface DzColorPickerEmits extends ChangeEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzColorPicker */
export interface DzColorPickerSlots {
  /** Custom trigger content */
  default?: () => unknown
  /** Custom label slot */
  label?: () => unknown
}
