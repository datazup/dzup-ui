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
  BasePortalProps,
  BaseValidationProps,
  CanonicalSize,
  ChangeEvents,
} from '@dzup-ui/contracts'
import type { DzColorPickerUi } from './DzColorPicker.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzColorPicker component */
export interface DzColorPickerProps extends BaseAccessibilityProps, BasePortalProps, BaseValidationProps {
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
  /** Height of the color-picker canvas area in pixels (default: 120) */
  canvasHeight?: number
  /**
   * Per-part class overrides, keyed by the names in `DzColorPicker.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * the panel parts render into a portal, where `class` never reached them.
   */
  ui?: DzColorPickerUi
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
