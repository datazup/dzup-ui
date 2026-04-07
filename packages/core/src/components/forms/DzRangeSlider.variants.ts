/**
 * DzRangeSlider — tailwind-variants (tv) style definitions.
 *
 * Reuses the same visual pattern as DzSlider. Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzRangeSlider.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const rangeSliderVariants = tv({
  slots: {
    root: [
      'relative flex touch-none select-none items-center',
    ].join(' '),
    track: [
      'relative grow overflow-hidden',
      'rounded-full',
      'bg-[var(--dz-muted)]',
    ].join(' '),
    range: [
      'absolute rounded-full',
    ].join(' '),
    thumb: [
      'block rounded-full',
      'border-[length:2px] border-[var(--dz-primary)]',
      'bg-[var(--dz-background)]',
      'shadow-[var(--dz-shadow-sm)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'hover:border-[var(--dz-primary-hover)]',
      'disabled:pointer-events-none disabled:opacity-50',
    ].join(' '),
  },
  variants: {
    size: {
      xs: {
        track: 'h-1',
        range: 'h-full',
        thumb: 'h-3 w-3',
      },
      sm: {
        track: 'h-1.5',
        range: 'h-full',
        thumb: 'h-3.5 w-3.5',
      },
      md: {
        track: 'h-2',
        range: 'h-full',
        thumb: 'h-4 w-4',
      },
      lg: {
        track: 'h-2.5',
        range: 'h-full',
        thumb: 'h-5 w-5',
      },
      xl: {
        track: 'h-3',
        range: 'h-full',
        thumb: 'h-6 w-6',
      },
    },
    tone: {
      neutral: { range: 'bg-[var(--dz-foreground)]' },
      primary: { range: 'bg-[var(--dz-primary)]' },
      success: { range: 'bg-[var(--dz-success)]' },
      warning: { range: 'bg-[var(--dz-warning)]' },
      danger: { range: 'bg-[var(--dz-danger)]' },
      info: { range: 'bg-[var(--dz-info)]' },
    },
    orientation: {
      horizontal: {
        root: 'w-full',
        track: 'w-full',
      },
      vertical: {
        root: 'h-full flex-col',
        track: 'h-full w-2',
        range: 'w-full',
      },
    },
    disabled: {
      true: { root: 'pointer-events-none opacity-[var(--dz-button-disabled-opacity)]' },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
    orientation: 'horizontal',
  },
})

/** Variant prop types */
export type RangeSliderVariantProps = VariantProps<typeof rangeSliderVariants>
