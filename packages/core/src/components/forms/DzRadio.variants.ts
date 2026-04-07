/**
 * DzRadio — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzRadio.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const radioVariants = tv({
  slots: {
    root: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'cursor-pointer select-none',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--dz-button-disabled-opacity)]',
    ].join(' '),
    indicator: [
      'shrink-0 flex items-center justify-center',
      'rounded-full',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'data-[state=checked]:border-[var(--dz-primary)]',
    ].join(' '),
    dot: [
      'rounded-full',
      'bg-[var(--dz-primary)]',
    ].join(' '),
    label: [
      'text-[var(--dz-foreground)]',
      'leading-none',
    ].join(' '),
  },
  variants: {
    size: {
      xs: { indicator: 'h-3.5 w-3.5', dot: 'h-1.5 w-1.5', label: 'text-[length:var(--dz-text-xs)]' },
      sm: { indicator: 'h-4 w-4', dot: 'h-2 w-2', label: 'text-[length:var(--dz-text-sm)]' },
      md: { indicator: 'h-[1.125rem] w-[1.125rem]', dot: 'h-2.5 w-2.5', label: 'text-[length:var(--dz-text-sm)]' },
      lg: { indicator: 'h-5 w-5', dot: 'h-3 w-3', label: 'text-[length:var(--dz-text-base)]' },
      xl: { indicator: 'h-6 w-6', dot: 'h-3.5 w-3.5', label: 'text-[length:var(--dz-text-lg)]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type RadioVariantProps = VariantProps<typeof radioVariants>
