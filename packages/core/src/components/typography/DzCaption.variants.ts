/**
 * DzCaption — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/typography/DzCaption.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const captionVariants = tv({
  base: 'text-[length:var(--dz-text-xs)] leading-[var(--dz-leading-normal)]',

  variants: {
    tone: {
      default: 'text-[var(--dz-foreground)]',
      muted: 'text-[var(--dz-muted-foreground)]',
      success: 'text-[var(--dz-success)]',
      warning: 'text-[var(--dz-warning)]',
      danger: 'text-[var(--dz-danger)]',
    },
  },

  defaultVariants: {
    tone: 'muted',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CaptionVariantProps = VariantProps<typeof captionVariants>
