/**
 * DzTimePicker — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzTimePicker.variants
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
      'dz-focus-within-ring-input dz-disabled-input-shell',
    ].join(' '),
    input: [
      'dz-field-input-reset',
      'border-none bg-transparent shadow-none appearance-none',
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-0_5)]',
      'text-center',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'text-[var(--dz-foreground)]',
      'focus:bg-[var(--dz-primary-muted)]',
      'data-[placeholder]:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    separator: 'text-[var(--dz-muted-foreground)]',
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
  },
  variants: {
    variant: {
      outline: { root: 'border border-[var(--dz-border)] focus-within:border-[var(--dz-input-border-focus)]' },
      filled: { root: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { root: 'border-b border-[var(--dz-border)] rounded-none focus-within:border-[var(--dz-input-border-focus)] focus-within:outline-none' },
    },
    size: {
      xs: {
        root: 'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] text-[length:var(--dz-input-xs-font-size)]',
        input: 'text-[length:var(--dz-input-xs-font-size)]',
        icon: 'h-3 w-3',
      },
      sm: {
        root: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        input: 'text-[length:var(--dz-input-sm-font-size)]',
        icon: 'h-3.5 w-3.5',
      },
      md: {
        root: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        input: 'text-[length:var(--dz-input-md-font-size)]',
        icon: 'h-4 w-4',
      },
      lg: {
        root: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        input: 'text-[length:var(--dz-input-lg-font-size)]',
        icon: 'h-5 w-5',
      },
      xl: {
        root: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        input: 'text-[length:var(--dz-input-xl-font-size)]',
        icon: 'h-5 w-5',
      },
    },
    invalid: {
      true: { root: 'border-[var(--dz-danger)] focus-within:border-[var(--dz-danger)] focus-within:outline-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TimePickerVariantProps = VariantProps<typeof timePickerVariants>
