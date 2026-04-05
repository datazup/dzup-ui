/**
 * DzTimePicker — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/forms/DzTimePicker.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const timePickerVariants = tv({
  slots: {
    root: [
      'inline-flex items-center gap-[var(--dz-spacing-1)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-within:outline-none focus-within:ring-[length:2px] focus-within:ring-[var(--dz-primary)] focus-within:ring-offset-[length:2px]',
    ].join(' '),
    input: [
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-0_5)]',
      'text-center',
      'outline-none',
      'text-[var(--dz-foreground)]',
      'focus:bg-[var(--dz-primary-muted)]',
      'data-[placeholder]:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    separator: 'text-[var(--dz-muted-foreground)]',
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
  },
  variants: {
    variant: {
      outline: { root: 'border border-[var(--dz-border)]' },
      filled: { root: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { root: 'border-b border-[var(--dz-border)] rounded-none' },
    },
    size: {
      xs: {
        root: 'h-[var(--dz-button-xs-height)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
        input: 'text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3',
      },
      sm: {
        root: 'h-[var(--dz-button-sm-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        input: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5',
      },
      md: {
        root: 'h-[var(--dz-button-md-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        input: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4',
      },
      lg: {
        root: 'h-[var(--dz-button-lg-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-base)]',
        input: 'text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5',
      },
      xl: {
        root: 'h-[var(--dz-button-xl-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
        input: 'text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5',
      },
    },
    disabled: {
      true: { root: 'cursor-not-allowed opacity-[var(--dz-button-disabled-opacity)]' },
    },
    invalid: {
      true: { root: 'border-[var(--dz-danger)] focus-within:ring-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TimePickerVariantProps = VariantProps<typeof timePickerVariants>
