/**
 * DzSpinner — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/feedback/DzSpinner.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const spinnerVariants = tv({
  base: 'inline-block animate-spin',

  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },

    tone: {
      neutral: 'text-[var(--dz-foreground)]',
      primary: 'text-[var(--dz-primary)]',
      success: 'text-[var(--dz-success)]',
      warning: 'text-[var(--dz-warning)]',
      danger: 'text-[var(--dz-danger)]',
      info: 'text-[var(--dz-info)]',
    },
  },

  defaultVariants: {
    size: 'md',
    tone: 'primary',
  },
})

/** Variant prop types extracted from the tv() definition */
export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>
