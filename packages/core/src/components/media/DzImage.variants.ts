/**
 * DzImage — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/media/DzImage.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const imageVariants = tv({
  slots: {
    root: [
      'relative overflow-hidden',
      'bg-[var(--dz-muted)]',
    ].join(' '),
    img: 'h-full w-full',
    placeholder: [
      'absolute inset-0',
      'flex items-center justify-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },

  variants: {
    fit: {
      cover: { img: 'object-cover' },
      contain: { img: 'object-contain' },
      fill: { img: 'object-fill' },
      none: { img: 'object-none' },
    },
  },

  defaultVariants: {
    fit: 'cover',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ImageVariantProps = VariantProps<typeof imageVariants>
