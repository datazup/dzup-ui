/**
 * DzOtpInput — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/inputs/DzOtpInput.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const otpInputVariants = tv({
  slots: {
    root: [
      'flex items-center',
      'gap-[var(--dz-spacing-2)]',
    ].join(' '),
    input: [
      'flex items-center justify-center',
      'text-center',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-sm)]',
      'transition-[var(--dz-transition-fast)]',
      'outline-none',
      'focus:border-[var(--dz-primary)] focus:ring-[length:2px] focus:ring-[var(--dz-primary)] focus:ring-offset-[length:1px]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      xs: { input: 'h-7 w-7 text-[length:var(--dz-text-xs)]' },
      sm: { input: 'h-8 w-8 text-[length:var(--dz-text-sm)]' },
      md: { input: 'h-10 w-10 text-[length:var(--dz-text-base)]' },
      lg: { input: 'h-12 w-12 text-[length:var(--dz-text-lg)]' },
      xl: { input: 'h-14 w-14 text-[length:var(--dz-text-xl)]' },
    },
    invalid: {
      true: {
        input: 'border-[var(--dz-danger)] focus:ring-[var(--dz-danger)]',
      },
    },
    disabled: {
      true: {
        root: 'pointer-events-none opacity-[var(--dz-button-disabled-opacity)]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type OtpInputVariantProps = VariantProps<typeof otpInputVariants>
