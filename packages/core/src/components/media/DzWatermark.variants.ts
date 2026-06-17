/**
 * DzWatermark — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The overlay is a non-interactive, screen-reader
 * hidden layer that tiles a canvas-generated mark via a repeating background.
 *
 * @module @dzup-ui/core/components/media/DzWatermark.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const watermarkVariants = tv({
  slots: {
    /** Positioning context for the overlay; participates in normal flow. */
    root: 'dz-watermark relative',
    /**
     * The tiled mark layer. Never intercepts pointer events and is hidden from
     * assistive tech, so it can't block interaction or be read aloud.
     */
    overlay: [
      'pointer-events-none absolute inset-0',
      'bg-repeat',
      'opacity-[var(--dz-watermark-opacity)]',
    ].join(' '),
  },
})

/** Variant prop types extracted from the tv() definition */
export type WatermarkVariantProps = VariantProps<typeof watermarkVariants>
