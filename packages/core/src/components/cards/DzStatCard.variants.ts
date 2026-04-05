/**
 * DzStatCard — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/cards/DzStatCard.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const statCardVariants = tv({
  slots: {
    root: [
      'relative',
      'rounded-[var(--dz-card-radius)]',
      'text-[var(--dz-card-foreground)]',
      'p-[var(--dz-card-padding)]',
    ].join(' '),
    header: 'flex items-center justify-between',
    title: [
      'text-[length:var(--dz-text-sm)]',
      'font-[var(--dz-font-medium)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    icon: 'text-[var(--dz-muted-foreground)]',
    value: [
      'text-[length:var(--dz-text-2xl)]',
      'font-bold',
      'text-[var(--dz-foreground)]',
      'mt-[var(--dz-spacing-2)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
      'mt-[var(--dz-spacing-1)]',
    ].join(' '),
    trend: [
      'inline-flex items-center gap-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-xs)]',
      'font-[var(--dz-font-medium)]',
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
    trendDirection: {
      up: { trend: 'text-[var(--dz-success)]' },
      down: { trend: 'text-[var(--dz-danger)]' },
      neutral: { trend: 'text-[var(--dz-muted-foreground)]' },
    },
  },

  defaultVariants: {
    variant: 'elevated',
  },
})

/** Variant prop types */
export type StatCardVariantProps = VariantProps<typeof statCardVariants>
