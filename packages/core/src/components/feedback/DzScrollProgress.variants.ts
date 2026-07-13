/**
 * DzScrollProgress — tailwind-variants (tv) style definitions.
 *
 * Handles the *placement* of the indicator: a fixed, full-width thin bar pinned
 * to the top or bottom edge (`bar` variant), or a fixed corner ring (`circular`
 * variant). Thickness, fill color, and size are driven by `--dz-scroll-progress-*`
 * tokens (ADR-04). The bar fill itself uses an inline width/transform so the
 * value updates without re-running `tv()`.
 *
 * @module @dzup-ui/core/components/feedback/DzScrollProgress.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const scrollProgressRootVariants = tv({
  base: [
    'dz-scroll-progress',
    'fixed inset-x-0',
    'z-[var(--dz-scroll-progress-z)]',
    'pointer-events-none',
  ].join(' '),

  variants: {
    variant: {
      bar: 'h-[var(--dz-scroll-progress-height)] overflow-hidden bg-[var(--dz-scroll-progress-track)]',
      circular: 'inset-x-auto p-[var(--dz-scroll-progress-inset)]',
    },
    position: {
      top: 'top-0',
      bottom: 'bottom-0',
    },
  },

  compoundVariants: [
    // Circular sits in a corner rather than spanning the edge.
    { variant: 'circular', position: 'top', class: 'right-0' },
    { variant: 'circular', position: 'bottom', class: 'right-0' },
  ],

  defaultVariants: {
    variant: 'bar',
    position: 'top',
  },
})

export const scrollProgressBarVariants = tv({
  base: [
    'h-full origin-left',
    'transition-[width] duration-150 ease-out',
    'motion-reduce:transition-none',
  ].join(' '),

  variants: {
    tone: {
      neutral: 'bg-[var(--dz-foreground)]',
      primary: 'bg-[var(--dz-primary-solid)]',
      success: 'bg-[var(--dz-success-solid)]',
      warning: 'bg-[var(--dz-warning-solid)]',
      danger: 'bg-[var(--dz-danger-solid)]',
      info: 'bg-[var(--dz-info-solid)]',
    },
  },

  defaultVariants: {
    tone: 'primary',
  },
})

/** Tone → CSS custom property used for the circular SVG stroke. */
export const scrollProgressToneVar: Record<string, string> = {
  neutral: 'var(--dz-foreground)',
  primary: 'var(--dz-primary-solid)',
  success: 'var(--dz-success-solid)',
  warning: 'var(--dz-warning-solid)',
  danger: 'var(--dz-danger-solid)',
  info: 'var(--dz-info-solid)',
}

/** Circular indicator diameters (px) per canonical size. */
export const scrollProgressCircularSize: Record<string, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
}

/** Variant prop types extracted from the tv() definitions */
export type ScrollProgressRootVariantProps = VariantProps<typeof scrollProgressRootVariants>
export type ScrollProgressBarVariantProps = VariantProps<typeof scrollProgressBarVariants>
