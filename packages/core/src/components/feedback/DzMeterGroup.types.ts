/**
 * DzMeterGroup — type definitions.
 *
 * @module @dzup-ui/core/components/feedback/DzMeterGroup
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Segment model
// ---------------------------------------------------------------------------

/** A single proportional segment within a meter group */
export interface DzMeterGroupSegment {
  /** Human-readable label (used in legend and a11y) */
  label: string
  /** Numeric value contributing to the whole */
  value: number
  /** Semantic color tone; falls back to a cycling palette when omitted */
  tone?: CanonicalTone
  /**
   * Explicit color as a design-token reference, e.g. `var(--dz-chart-1)`.
   * Takes precedence over `tone`. Raw color literals are not permitted (ADR-04).
   */
  color?: string
  /** Optional icon name/key surfaced to the legend slot */
  icon?: string
}

/** Orientation of the meter track */
export type DzMeterGroupOrientation = 'horizontal' | 'vertical'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzMeterGroup component */
export interface DzMeterGroupProps extends BaseAccessibilityProps {
  /** Ordered list of segments to render */
  values?: DzMeterGroupSegment[]
  /** Maximum value of the whole. Defaults to the sum of all segment values. */
  max?: number
  /** Track orientation */
  orientation?: DzMeterGroupOrientation
  /** Component size (controls track thickness) */
  size?: CanonicalSize
  /** Whether to render the legend */
  showLegend?: boolean
}

// ---------------------------------------------------------------------------
// Slot prop shapes
// ---------------------------------------------------------------------------

/** A segment enriched with its computed proportion and resolved color */
export interface DzMeterGroupComputedSegment extends DzMeterGroupSegment {
  /** Percentage (0–100) of `max` this segment occupies */
  percentage: number
  /** Resolved CSS color value (token reference) used for the fill */
  resolvedColor: string
}

/** Slot props shared by label/start/end/legend slots */
export interface DzMeterGroupSlotProps {
  /** Computed segments with proportions + resolved colors */
  segments: DzMeterGroupComputedSegment[]
  /** Sum of all segment values */
  total: number
  /** Effective maximum */
  max: number
  /** Percentage of `max` filled by all segments combined */
  percentage: number
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzMeterGroup */
export interface DzMeterGroupSlots {
  /** Heading/label content rendered above the meter */
  label?: (props: DzMeterGroupSlotProps) => unknown
  /** Content rendered before the meter track */
  start?: (props: DzMeterGroupSlotProps) => unknown
  /** Content rendered after the meter track */
  end?: (props: DzMeterGroupSlotProps) => unknown
  /** Custom legend; defaults to chips with label + value */
  legend?: (props: DzMeterGroupSlotProps) => unknown
}
