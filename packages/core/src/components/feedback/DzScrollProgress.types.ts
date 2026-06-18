/**
 * DzScrollProgress — type definitions.
 *
 * A scroll-position progress indicator: a thin bar (or compact ring) pinned to
 * the top or bottom of the viewport that reflects how far the reader has
 * scrolled through a page or scroll container. Decorative-supplementary — it
 * never steals focus.
 *
 * @module @dzup-ui/core/components/feedback/DzScrollProgress
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
  ProgressVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzScrollProgress component */
export interface DzScrollProgressProps extends BaseAccessibilityProps {
  /**
   * Scroll container to track. Defaults to `window`. Accepts an element, the
   * `window`, or a CSS selector string resolved against the document.
   */
  target?: HTMLElement | Window | string | null
  /** Edge the bar is pinned to. Defaults to `'top'`. */
  position?: 'top' | 'bottom'
  /** Visual display variant. Defaults to `'bar'`. */
  variant?: ProgressVariant
  /**
   * Bar thickness (or circular stroke width) in pixels. Overrides the
   * token-driven default when provided.
   */
  thickness?: number
  /** Diameter preset for the `circular` variant. Defaults to `'md'`. */
  size?: CanonicalSize
  /** Semantic color tone. Defaults to `'primary'`. */
  tone?: CanonicalTone
  /**
   * Accessible label for the progress indicator. Defaults to
   * `'Page scroll progress'`.
   */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzScrollProgress */
export interface DzScrollProgressEmits {
  /** Fired with the clamped 0–100 progress value whenever it changes. */
  change: [value: number]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzScrollProgress */
export interface DzScrollProgressSlots {
  /**
   * Replaces the default bar/ring with custom UI. Receives the clamped 0–100
   * progress value.
   */
  default?: (props: { value: number }) => unknown
}
