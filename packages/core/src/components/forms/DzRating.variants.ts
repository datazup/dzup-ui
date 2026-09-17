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
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8. The root carries `role="slider"` and the
     * roving tabindex, so it is the pointer target; it measured `div 116x20`,
     * the height of the icons inside it. `dz-target-min` floors the block axis
     * at 24px (the inline axis is already past it) and `items-center` keeps the
     * stars where they were.
     */
    root: [
      'dz-target-min inline-flex w-fit items-center',
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
      // TASK-R5-O2: a LOGICAL inset, not a physical one. The overlay is clipped
      // by width to show a partial star, so it has to grow from the edge the
      // reader starts at — pinned to the screen's start edge instead, it fills
      // the wrong half of every star in an Arabic document. Identical output in
      // a LTR document. (The physical spelling is deliberately not written out
      // here: validate:rtl reads comments as text, F-C5.)
      'pointer-events-none absolute inset-s-0 top-0 h-full overflow-hidden',
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
