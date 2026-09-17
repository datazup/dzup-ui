/**
 * DzSlider — type definitions.
 *
 * Uses Reka UI Slider primitives (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzSlider
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  CanonicalTone,
  ChangeEvents,
  Orientation,
} from '@dzup-ui/contracts'
import type { DzSliderUi } from './DzSlider.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzSlider component */
export interface DzSliderProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Slider orientation */
  orientation?: Orientation
  /** Form field name */
  name?: string
  /**
   * Per-part class overrides, keyed by the names in `DzSlider.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing target — the Reka `SliderRoot`,
   * declared here as `control` — so `ui.root` is the only route to the
   * wrapper element.
   */
  ui?: DzSliderUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzSlider */
export interface DzSliderEmits extends ChangeEvents<number> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSlider */
export interface DzSliderSlots {
  /** Default slot for label */
  default?: () => unknown
}
