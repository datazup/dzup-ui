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
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
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
      'leading-none',
    ].join(' '),
  },
  variants: {
    size: {
      xs: { indicator: 'h-3.5 w-3.5', label: 'text-[length:var(--dz-text-xs)]' },
      sm: { indicator: 'h-4 w-4', label: 'text-[length:var(--dz-text-sm)]' },
      md: { indicator: 'h-[1.125rem] w-[1.125rem]', label: 'text-[length:var(--dz-text-sm)]' },
      lg: { indicator: 'h-5 w-5', label: 'text-[length:var(--dz-text-base)]' },
      xl: { indicator: 'h-6 w-6', label: 'text-[length:var(--dz-text-lg)]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>
