/**
 * DzGrid -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzGrid.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const gridVariants = tv({
  base: 'grid',

  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-[var(--dz-spacing-0)]',
      xs: 'gap-[var(--dz-spacing-1)]',
      sm: 'gap-[var(--dz-spacing-2)]',
      md: 'gap-[var(--dz-spacing-4)]',
      lg: 'gap-[var(--dz-spacing-6)]',
      xl: 'gap-[var(--dz-spacing-8)]',
    },
  },

  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})

/** Maps col counts to responsive Tailwind classes per breakpoint */
export const responsiveColsMap: Record<string, Record<number, string>> = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
}

/** Variant prop types extracted from the tv() definition */
export type GridVariantProps = VariantProps<typeof gridVariants>
