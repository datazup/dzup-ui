/**
 * DzAffix — Type definitions for the sticky-on-scroll wrapper.
 *
 * @module @dzup-ui/core/components/layout/DzAffix
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzAffix component */
export interface DzAffixProps extends BaseAccessibilityProps {
  /**
   * Distance (px) from the top of the scroll container at which the content
   * pins. Used when `offsetBottom` is not provided; defaults to `0`.
   */
  offsetTop?: number
  /**
   * Distance (px) from the bottom of the scroll container at which the content
   * pins. Takes precedence over `offsetTop` when both are set.
   */
  offsetBottom?: number
  /**
   * Returns the scroll container the affix is measured against. Defaults to
   * `window` when omitted.
   */
  target?: () => HTMLElement | Window | null
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAffix */
export interface DzAffixEmits {
  /** Fired whenever the pinned state changes. */
  change: [affixed: boolean]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAffix */
export interface DzAffixSlots {
  /**
   * Content to pin.
   *
   * @param props - Exposes the current `affixed` state for conditional UI.
   */
  default: (props: { affixed: boolean }) => unknown
}
