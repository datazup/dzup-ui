/**
 * DzDivider -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzDivider.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dividerVariants = tv({
  base: 'shrink-0 bg-[var(--dz-border)]',

  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
  },
})

/** Variant prop types extracted from the tv() definition */
export type DividerVariantProps = VariantProps<typeof dividerVariants>
