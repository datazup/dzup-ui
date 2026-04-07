/**
 * DzResult — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/DzResult.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const resultVariants = tv({
  slots: {
    root: [
      'flex flex-col items-center justify-center',
      'py-[var(--dz-spacing-12)]',
      'px-[var(--dz-spacing-4)]',
      'text-center',
    ].join(' '),
    icon: 'mb-[var(--dz-spacing-4)]',
    title: [
      'text-[length:var(--dz-text-xl)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
      'mb-[var(--dz-spacing-2)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-base)]',
      'text-[var(--dz-muted-foreground)]',
      'max-w-md',
    ].join(' '),
    actions: [
      'mt-[var(--dz-spacing-8)]',
      'flex gap-[var(--dz-spacing-3)]',
    ].join(' '),
  },

  variants: {
    status: {
      success: { icon: 'text-[var(--dz-success)]' },
      error: { icon: 'text-[var(--dz-danger)]' },
      warning: { icon: 'text-[var(--dz-warning)]' },
      info: { icon: 'text-[var(--dz-info)]' },
    },
  },

  defaultVariants: {
    status: 'info',
  },
})

/** Variant prop types */
export type ResultVariantProps = VariantProps<typeof resultVariants>
