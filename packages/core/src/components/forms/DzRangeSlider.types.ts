/**
 * DzRangeSlider — Type definitions for the dual-thumb range slider.
 *
 * Uses Reka UI Slider with two thumbs (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzRangeSlider
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  CanonicalTone,
  ChangeEvents,
  Orientation,
} from '@dzup-ui/contracts'
import type { DzRangeSliderUi } from './DzRangeSlider.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRangeSlider component */
export interface DzRangeSliderProps extends BaseAccessibilityProps, BaseValidationProps {
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
   * Per-part class overrides, keyed by the names in `DzRangeSlider.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing target — the Reka `SliderRoot`,
   * declared here as `control`; `ui.indicator` reaches **both** thumbs.
   */
  ui?: DzRangeSliderUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzRangeSlider */
export interface DzRangeSliderEmits extends ChangeEvents<[number, number]> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRangeSlider */
export interface DzRangeSliderSlots {
  /** Default slot for label */
  default?: () => unknown
}
