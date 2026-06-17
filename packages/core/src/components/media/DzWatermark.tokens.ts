/**
 * DzWatermark -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the watermark overlay (ADR-04). The mark color
 * defaults to a muted token and the overlay's low opacity is token-driven so the
 * watermark stays subtle without obscuring the content beneath it.
 *
 * @module @dzup-ui/core/components/media/DzWatermark.tokens
 */

export const watermarkTokens = {
  /** Default mark color (canvas draws at full alpha; the layer is dimmed). */
  color: 'var(--dz-watermark-color)',
  /** Overlay opacity — keeps the repeating mark legible but unobtrusive. */
  opacity: 'var(--dz-watermark-opacity)',
  /** Default stacking order of the overlay layer. */
  z: 'var(--dz-watermark-z)',
} as const
