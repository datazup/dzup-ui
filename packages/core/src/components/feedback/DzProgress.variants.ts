/**
 * DzProgress — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/feedback/DzProgress.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const progressTrackVariants = tv({
  base: [
    'relative overflow-hidden',
    'rounded-[var(--dz-radius-full)]',
    'bg-[var(--dz-muted)]',
  ].join(' '),

  variants: {
    size: {
      xs: 'h-1',
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

export const progressBarVariants = tv({
  base: [
    'h-full rounded-[var(--dz-radius-full)]',
    'transition-[width] duration-300 ease-in-out',
  ].join(' '),

  variants: {
    tone: {
      neutral: 'bg-[var(--dz-foreground)]',
      primary: 'bg-[var(--dz-primary)]',
      success: 'bg-[var(--dz-success)]',
      warning: 'bg-[var(--dz-warning)]',
      danger: 'bg-[var(--dz-danger)]',
      info: 'bg-[var(--dz-info)]',
    },

    indeterminate: {
      true: 'animate-progress-indeterminate',
      false: '',
    },
  },

  defaultVariants: {
    tone: 'primary',
    indeterminate: false,
  },
})

/** SVG circular progress sizes mapped to pixel dimensions */
export const circularSizeMap: Record<string, { size: number, strokeWidth: number }> = {
  xs: { size: 16, strokeWidth: 2 },
  sm: { size: 24, strokeWidth: 3 },
  md: { size: 32, strokeWidth: 3 },
  lg: { size: 48, strokeWidth: 4 },
  xl: { size: 64, strokeWidth: 5 },
}

/** Variant prop types extracted from the tv() definitions */
export type ProgressTrackVariantProps = VariantProps<typeof progressTrackVariants>
export type ProgressBarVariantProps = VariantProps<typeof progressBarVariants>
