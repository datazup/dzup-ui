/**
 * DzWatermark — type definitions.
 *
 * A content wrapper that overlays a tiled, repeating text/image watermark over
 * its default slot. Useful for confidential previews, trial/demo states, and
 * shared exports where ownership marking should be consistent and a little
 * tamper-resistant.
 *
 * @module @dzup-ui/core/components/media/DzWatermark
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzWatermark component */
export interface DzWatermarkProps extends BaseAccessibilityProps {
  /**
   * Watermark text. A single string is one line; an array renders one line per
   * entry (stacked). Ignored when `image` is provided.
   */
  content?: string | string[]
  /**
   * URL of an image rendered as the mark (overrides `content`). Pair with
   * `width`/`height` to size the mark.
   */
  image?: string
  /** Mark width in px — primarily for `image` marks (text auto-measures). */
  width?: number
  /** Mark height in px — primarily for `image` marks (text auto-measures). */
  height?: number
  /** Rotation of each mark in degrees. */
  rotate?: number
  /**
   * Spacing between marks in px. A single number applies to both axes; a tuple
   * is `[horizontal, vertical]`.
   */
  gap?: number | [number, number]
  /** Font size in px used to render text marks. */
  fontSize?: number
  /** Font family used to render text marks. */
  fontFamily?: string
  /** Font weight used to render text marks. */
  fontWeight?: string | number
  /**
   * Mark color. Token-based by default (`var(--dz-watermark-color)`); the
   * overlay's low opacity comes from `--dz-watermark-opacity` so the mark stays
   * subtle without obscuring content.
   */
  color?: string
  /** Stacking order of the watermark overlay. */
  zIndex?: number
  /**
   * When true, observe the host for DOM mutations and re-apply the overlay if it
   * is removed or its critical styles are tampered with. Off by default — it
   * adds a `MutationObserver` and is only worth it for confidential surfaces.
   */
  observe?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzWatermark */
export interface DzWatermarkSlots {
  /** Content to overlay the watermark on top of. */
  default?: () => unknown
}
