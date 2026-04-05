/**
 * DzSegmented — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/navigation/DzSegmented.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const segmentedVariants = tv({
  slots: {
    root: [
      'inline-flex items-center',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-muted)]',
      'p-[var(--dz-spacing-1)]',
    ].join(' '),
    item: [
      'inline-flex items-center justify-center',
      'whitespace-nowrap',
      'rounded-[var(--dz-radius-sm)]',
      'font-[var(--dz-font-medium)]',
      'transition-all',
      'outline-none',
      'select-none',
      'text-[var(--dz-muted-foreground)]',
      'focus-visible:ring-2 focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=on]:bg-[var(--dz-background)] data-[state=on]:text-[var(--dz-foreground)] data-[state=on]:shadow-[var(--dz-shadow-sm)]',
    ].join(' '),
  },

  variants: {
    size: {
      xs: { item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-0_5)] text-[length:var(--dz-text-xs)]' },
      sm: { item: 'px-[var(--dz-spacing-2_5)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]' },
      md: { item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]' },
      lg: { item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]' },
      xl: { item: 'px-[var(--dz-spacing-5)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-text-lg)]' },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type SegmentedVariantProps = VariantProps<typeof segmentedVariants>
