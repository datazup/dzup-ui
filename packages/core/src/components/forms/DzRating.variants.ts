/**
 * DzRating — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzRating.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const ratingVariants = tv({
  slots: {
    root: [
      'inline-flex w-fit items-center',
      'rounded-[var(--dz-radius-sm)]',
      'dz-focus-ring-control',
    ].join(' '),
    item: [
      'relative inline-flex shrink-0 cursor-pointer leading-none',
    ].join(' '),
    empty: [
      'block text-[var(--dz-muted-foreground)]',
    ].join(' '),
    overlay: [
      'pointer-events-none absolute left-0 top-0 h-full overflow-hidden',
    ].join(' '),
    filled: [
      'block [&_svg]:fill-current',
    ].join(' '),
  },
  variants: {
    size: {
      icon: { root: 'gap-1' },
      xs: { root: 'gap-0.5' },
      sm: { root: 'gap-0.5' },
      md: { root: 'gap-1' },
      lg: { root: 'gap-1' },
      xl: { root: 'gap-1.5' },
    },
    tone: {
      neutral: { filled: 'text-[var(--dz-foreground)]' },
      primary: { filled: 'text-[var(--dz-primary)]' },
      success: { filled: 'text-[var(--dz-success)]' },
      warning: { filled: 'text-[var(--dz-warning)]' },
      danger: { filled: 'text-[var(--dz-danger)]' },
      info: { filled: 'text-[var(--dz-info)]' },
    },
    disabled: {
      true: { root: 'dz-disabled-control', item: 'cursor-not-allowed' },
    },
    readonly: {
      true: { item: 'cursor-default' },
    },
    invalid: {
      true: { empty: 'text-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'warning',
  },
})

/** Variant prop types extracted from the tv() definition */
export type RatingVariantProps = VariantProps<typeof ratingVariants>
