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
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum).
     *
     * The thumb carries `role="slider"` and is the pointer target; at `md` it
     * measured 16x16 on chromium, firefox and webkit. `dz-target-min` grows the
     * thumb's own box to the 24px floor, and what the thumb PAINTS moves to a
     * pseudo-element sized from `--dz-control-visual-size`, so the visible dot
     * keeps the size its variant asks for.
     *
     * No negative margin here, unlike DzCheckbox: the thumb is positioned by
     * Reka with `translateX(-50%)` of its own box, and the pseudo is centred in
     * that box, so a symmetrically grown box still puts the dot's centre on the
     * value. A margin would move it off by half the growth.
     */
    thumb: [
      'dz-target-min relative block',
      'transition-[var(--dz-control-transition)]',
      'dz-focus-ring-control dz-disabled-control',
      'before:absolute before:inset-0 before:m-auto before:-z-10',
      'before:size-[var(--dz-control-visual-size)]',
      'before:rounded-full',
      'before:border-[length:2px] before:border-[var(--dz-primary-solid)]',
      'before:bg-[var(--dz-background)]',
      'before:shadow-[var(--dz-shadow-sm)]',
      'before:transition-[var(--dz-control-transition)]',
      'hover:before:border-[var(--dz-primary-hover)]',
    ].join(' '),
    label: [
      'shrink-0 text-sm font-medium text-[var(--dz-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      icon: '',
      xs: {
        track: 'h-1',
        range: 'h-full',
        thumb: 'h-3 w-3 [--dz-control-visual-size:0.75rem]',
      },
      sm: {
        track: 'h-1.5',
        range: 'h-full',
        thumb: 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]',
      },
      md: {
        track: 'h-2',
        range: 'h-full',
        thumb: 'h-4 w-4 [--dz-control-visual-size:1rem]',
      },
      lg: {
        track: 'h-2.5',
        range: 'h-full',
        thumb: 'h-5 w-5 [--dz-control-visual-size:1.25rem]',
      },
      xl: {
        track: 'h-3',
        range: 'h-full',
        thumb: 'h-6 w-6 [--dz-control-visual-size:1.5rem]',
      },
    },
    tone: {
      neutral: { range: 'bg-[var(--dz-foreground)]' },
      primary: { range: 'bg-[var(--dz-primary-solid)]' },
      success: { range: 'bg-[var(--dz-success-solid)]' },
      warning: { range: 'bg-[var(--dz-warning-solid)]' },
      danger: { range: 'bg-[var(--dz-danger-solid)]' },
      info: { range: 'bg-[var(--dz-info-solid)]' },
    },
    orientation: {
      horizontal: {
        root: 'w-full',
        track: 'w-full',
        label: 'me-3',
      },
      vertical: {
        root: 'h-full flex-col',
        track: 'h-full w-2',
        range: 'w-full',
        label: 'mb-2',
      },
    },
    disabled: {
      true: { root: 'dz-disabled-control' },
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
