/**
 * DzEmpty — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/feedback/DzEmpty.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const emptyVariants = tv({
  slots: {
    root: [
      'flex flex-col items-center justify-center',
      'py-[var(--dz-spacing-12)]',
      'px-[var(--dz-spacing-4)]',
      'text-center',
    ].join(' '),
    icon: [
      'mb-[var(--dz-spacing-4)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    title: [
      'text-[length:var(--dz-text-lg)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
      'mb-[var(--dz-spacing-1)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'max-w-md',
    ].join(' '),
    actions: [
      'mt-[var(--dz-spacing-6)]',
      'flex gap-[var(--dz-spacing-2)]',
    ].join(' '),
  },
})

/** Variant prop types */
export type EmptyVariantProps = VariantProps<typeof emptyVariants>
