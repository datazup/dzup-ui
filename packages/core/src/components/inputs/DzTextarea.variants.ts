/**
 * DzTextarea — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/inputs/DzTextarea.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const textareaVariants = tv({
  base: [
    'flex w-full min-h-[5rem]',
    'font-[family-name:var(--dz-input-font-family)]',
    'text-[var(--dz-foreground)]',
    'placeholder:text-[var(--dz-input-placeholder)]',
    'transition-[var(--dz-input-transition)]',
    'focus-visible:outline-none focus-visible:ring-[length:var(--dz-input-focus-ring-width)] focus-visible:ring-[var(--dz-input-focus-ring-color)]',
    'disabled:cursor-not-allowed disabled:opacity-[var(--dz-input-disabled-opacity)]',
    'resize-y',
  ].join(' '),

  variants: {
    variant: {
      outline: [
        'border border-[var(--dz-input-border)]',
        'bg-[var(--dz-input-bg)]',
        'focus-visible:border-[var(--dz-input-border-focus)]',
      ].join(' '),
      filled: [
        'border-0',
        'bg-[var(--dz-muted)]',
      ].join(' '),
      underlined: [
        'border-0 border-b-2 border-[var(--dz-input-border)]',
        'rounded-none bg-transparent',
        'focus-visible:border-[var(--dz-input-border-focus)] focus-visible:ring-0',
      ].join(' '),
    },

    size: {
      xs: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] rounded-[var(--dz-radius-sm)]',
      sm: 'px-[var(--dz-input-sm-padding-x)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-input-sm-font-size)] rounded-[var(--dz-radius-sm)]',
      md: 'px-[var(--dz-input-md-padding-x)] py-[var(--dz-spacing-2)] text-[length:var(--dz-input-md-font-size)] rounded-[var(--dz-input-radius)]',
      lg: 'px-[var(--dz-input-lg-padding-x)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-input-lg-font-size)] rounded-[var(--dz-input-radius)]',
      xl: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-lg)] rounded-[var(--dz-radius-lg)]',
    },

    invalid: {
      true: 'border-[var(--dz-danger)] focus-visible:border-[var(--dz-danger)] focus-visible:ring-[var(--dz-danger)]/25',
      false: '',
    },
  },

  defaultVariants: {
    variant: 'outline',
    size: 'md',
    invalid: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type TextareaVariantProps = VariantProps<typeof textareaVariants>
