/**
 * DzSkeleton — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/feedback/DzSkeleton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const skeletonVariants = tv({
  base: 'bg-[var(--dz-muted)]',

  variants: {
    variant: {
      text: 'rounded-[var(--dz-radius-sm)] h-4 w-full',
      circular: 'rounded-[var(--dz-radius-full)]',
      rectangular: 'rounded-[var(--dz-radius-md)]',
    },

    animate: {
      true: 'animate-pulse',
      false: '',
    },
  },

  defaultVariants: {
    variant: 'text',
    animate: true,
  },
})

/** Variant prop types extracted from the tv() definition */
export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>
