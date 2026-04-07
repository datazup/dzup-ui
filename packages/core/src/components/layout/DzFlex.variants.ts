/**
 * DzFlex -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzFlex.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const flexVariants = tv({
  base: '',

  variants: {
    inline: {
      true: 'inline-flex',
      false: 'flex',
    },
    direction: {
      'row': 'flex-row',
      'column': 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    gap: {
      none: 'gap-[var(--dz-spacing-0)]',
      xs: 'gap-[var(--dz-spacing-1)]',
      sm: 'gap-[var(--dz-spacing-2)]',
      md: 'gap-[var(--dz-spacing-4)]',
      lg: 'gap-[var(--dz-spacing-6)]',
      xl: 'gap-[var(--dz-spacing-8)]',
    },
    wrap: {
      true: 'flex-wrap',
    },
  },

  defaultVariants: {
    inline: false,
    direction: 'row',
    gap: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type FlexVariantProps = VariantProps<typeof flexVariants>
