/**
 * DzCheckbox — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzCheckbox.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const checkboxVariants = tv({
  slots: {
    root: [
      // `items-start` keeps the box aligned to the FIRST line of a wrapping
      // label; per-size `leading-*` on the label (below) matches the indicator
      // height so single-line labels still read as vertically centered.
      'inline-flex items-start gap-[var(--dz-spacing-2)]',
      'cursor-pointer select-none',
      'dz-disabled-control',
    ].join(' '),
    indicator: [
      'shrink-0 flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'transition-[var(--dz-control-transition)]',
      'dz-focus-ring-control',
      'data-[state=checked]:bg-[var(--dz-primary)] data-[state=checked]:border-[var(--dz-primary)] data-[state=checked]:text-[var(--dz-primary-foreground)]',
      'data-[state=indeterminate]:bg-[var(--dz-primary)] data-[state=indeterminate]:border-[var(--dz-primary)] data-[state=indeterminate]:text-[var(--dz-primary-foreground)]',
    ].join(' '),
    label: [
      'text-[var(--dz-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      // Each size's label `leading-*` matches the indicator height so the box
      // optically centers against the first line of text (works for single-
      // and multi-line labels with `items-start` on the root).
      icon: '',
      xs: { indicator: 'h-3.5 w-3.5', label: 'text-[length:var(--dz-text-xs)] leading-[0.875rem]' },
      sm: { indicator: 'h-4 w-4', label: 'text-[length:var(--dz-text-sm)] leading-[1rem]' },
      md: { indicator: 'h-[1.125rem] w-[1.125rem]', label: 'text-[length:var(--dz-text-sm)] leading-[1.125rem]' },
      lg: { indicator: 'h-5 w-5', label: 'text-[length:var(--dz-text-base)] leading-[1.25rem]' },
      xl: { indicator: 'h-6 w-6', label: 'text-[length:var(--dz-text-lg)] leading-[1.5rem]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>
