/**
 * DzSwitch — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzSwitch.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const switchVariants = tv({
  slots: {
    root: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'cursor-pointer select-none',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--dz-button-disabled-opacity)]',
    ].join(' '),
    track: [
      'relative shrink-0 rounded-full',
      'bg-[var(--dz-muted)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'data-[state=checked]:bg-[var(--dz-primary)]',
    ].join(' '),
    thumb: [
      'block rounded-full',
      'bg-[var(--dz-background)]',
      'shadow-[var(--dz-shadow-sm)]',
      'transition-transform',
    ].join(' '),
    label: [
      'text-[var(--dz-foreground)]',
      'leading-none',
    ].join(' '),
  },
  variants: {
    size: {
      xs: {
        track: 'h-4 w-7',
        thumb: 'h-3 w-3 data-[state=checked]:translate-x-3 translate-x-0.5',
        label: 'text-[length:var(--dz-text-xs)]',
      },
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4 data-[state=checked]:translate-x-4 translate-x-0.5',
        label: 'text-[length:var(--dz-text-sm)]',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5 data-[state=checked]:translate-x-5 translate-x-0.5',
        label: 'text-[length:var(--dz-text-sm)]',
      },
      lg: {
        track: 'h-7 w-[3.25rem]',
        thumb: 'h-6 w-6 data-[state=checked]:translate-x-6 translate-x-0.5',
        label: 'text-[length:var(--dz-text-base)]',
      },
      xl: {
        track: 'h-8 w-[3.75rem]',
        thumb: 'h-7 w-7 data-[state=checked]:translate-x-7 translate-x-0.5',
        label: 'text-[length:var(--dz-text-lg)]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type SwitchVariantProps = VariantProps<typeof switchVariants>
