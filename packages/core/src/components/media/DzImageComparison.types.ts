/**
 * DzImageComparison — Type definitions for the before/after reveal slider.
 *
 * A draggable divider reveals an "after" image over a base "before" image.
 * v-model:position via defineModel (ADR-16); 0–100, where the value is the
 * percentage of the after image revealed.
 *
 * @module @dzup-ui/core/components/media/DzImageComparison
 */

import type { BaseAccessibilityProps, Orientation } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Orientation
// ---------------------------------------------------------------------------

/** Axis the divider travels along. */
export type ImageComparisonOrientation = Orientation

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzImageComparison component */
export interface DzImageComparisonProps extends BaseAccessibilityProps {
  /** Convenience source for the base ("before") image. Ignored if the `before` slot is used. */
  beforeSrc?: string
  /** Convenience source for the revealed ("after") image. Ignored if the `after` slot is used. */
  afterSrc?: string
  /** Alt text for the base image (required for accessibility when `beforeSrc` is used). */
  beforeAlt?: string
  /** Alt text for the revealed image (required for accessibility when `afterSrc` is used). */
  afterAlt?: string
  /** Axis the divider travels along (default 'horizontal'). */
  orientation?: ImageComparisonOrientation
  /** Optional caption chip rendered over the before image. */
  beforeLabel?: string
  /** Optional caption chip rendered over the after image. */
  afterLabel?: string
  /** Keyboard nudge increment for Arrow keys (default 1). Shift+Arrow jumps by 10. */
  step?: number
  /** Disables pointer and keyboard interaction. */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzImageComparison */
export interface DzImageComparisonEmits {
  /** Divider position changed (0–100). */
  change: [position: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzImageComparison */
export interface DzImageComparisonSlots {
  /** Base layer, fully visible. Typically a DzImage. */
  before?: () => unknown
  /** Revealed layer, clipped to the divider position. Typically a DzImage. */
  after?: () => unknown
  /** Custom divider grip. Receives the current position and orientation. */
  handle?: (props: { position: number; orientation: ImageComparisonOrientation }) => unknown
}
