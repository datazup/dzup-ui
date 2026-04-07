/**
 * DzContainer -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzContainer.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const containerVariants = tv({
  base: 'w-full',

  variants: {
    maxWidth: {
      'sm': 'max-w-screen-sm',
      'md': 'max-w-screen-md',
      'lg': 'max-w-screen-lg',
      'xl': 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      'full': 'max-w-full',
    },
    padding: {
      true: 'px-[var(--dz-spacing-4)] sm:px-[var(--dz-spacing-6)] lg:px-[var(--dz-spacing-8)]',
    },
    centered: {
      true: 'mx-auto',
    },
  },

  defaultVariants: {
    maxWidth: 'xl',
    padding: true,
    centered: true,
  },
})

/** Variant prop types extracted from the tv() definition */
export type ContainerVariantProps = VariantProps<typeof containerVariants>
