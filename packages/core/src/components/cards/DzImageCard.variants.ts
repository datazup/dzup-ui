/**
 * DzImageCard — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/cards/DzImageCard.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const imageCardVariants = tv({
  slots: {
    root: [
      'relative overflow-hidden',
      'rounded-[var(--dz-card-radius)]',
      'text-[var(--dz-card-foreground)]',
    ].join(' '),
    imageWrapper: 'relative overflow-hidden',
    image: 'w-full h-full object-cover',
    overlay: 'absolute inset-0',
    body: 'p-[var(--dz-card-padding)]',
    header: [
      'px-[var(--dz-card-padding)]',
      'pt-[var(--dz-card-padding)]',
      'pb-[var(--dz-spacing-2)]',
    ].join(' '),
    footer: [
      'px-[var(--dz-card-padding)]',
      'pt-[var(--dz-spacing-2)]',
      'pb-[var(--dz-card-padding)]',
    ].join(' '),
  },

  variants: {
    variant: {
      elevated: {
        root: 'bg-[var(--dz-card)] shadow-[var(--dz-shadow-md)]',
      },
      outlined: {
        root: 'bg-[var(--dz-card)] border border-[var(--dz-card-border-color)]',
      },
    },
  },

  defaultVariants: {
    variant: 'elevated',
  },
})

/** Variant prop types */
export type ImageCardVariantProps = VariantProps<typeof imageCardVariants>
