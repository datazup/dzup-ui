/**
 * DzInput — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 * Component token tier (--dz-input-*) overrides where available.
 *
 * @module @dzup-ui/core/components/inputs/DzInput.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/** Wrapper variants — the outer container holding prefix, input, suffix */
export const inputWrapperVariants = tv({
  base: [
    'flex items-center w-full',
    'font-[family-name:var(--dz-input-font-family)]',
    'transition-[var(--dz-input-transition)]',
    'focus-within:outline-none focus-within:ring-[length:var(--dz-input-focus-ring-width)] focus-within:ring-[var(--dz-input-focus-ring-color)]',
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-[var(--dz-input-disabled-opacity)]',
  ].join(' '),

  variants: {
    variant: {
      outline: [
        'border border-[var(--dz-input-border)]',
        'bg-[var(--dz-input-bg)]',
        'focus-within:border-[var(--dz-input-border-focus)]',
      ].join(' '),
      filled: [
        'border-0',
        'bg-[var(--dz-muted)]',
        'focus-within:ring-[length:var(--dz-input-focus-ring-width)] focus-within:ring-[var(--dz-input-focus-ring-color)]',
      ].join(' '),
      underlined: [
        'border-0 border-b-2 border-[var(--dz-input-border)]',
        'rounded-none bg-transparent',
        'focus-within:border-[var(--dz-input-border-focus)] focus-within:ring-0',
      ].join(' '),
    },

    size: {
      xs: [
        'h-7 px-[var(--dz-spacing-2)]',
        'text-[length:var(--dz-text-xs)]',
        'gap-[var(--dz-spacing-1)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      sm: [
        'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)]',
        'text-[length:var(--dz-input-sm-font-size)]',
        'gap-[var(--dz-spacing-1_5)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      md: [
        'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)]',
        'text-[length:var(--dz-input-md-font-size)]',
        'gap-[var(--dz-spacing-2)]',
        'rounded-[var(--dz-input-radius)]',
      ].join(' '),
      lg: [
        'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)]',
        'text-[length:var(--dz-input-lg-font-size)]',
        'gap-[var(--dz-spacing-2)]',
        'rounded-[var(--dz-input-radius)]',
      ].join(' '),
      xl: [
        'h-[var(--dz-spacing-12)] px-[var(--dz-spacing-4)]',
        'text-[length:var(--dz-text-lg)]',
        'gap-[var(--dz-spacing-2_5)]',
        'rounded-[var(--dz-radius-lg)]',
      ].join(' '),
    },

    invalid: {
      true: 'border-[var(--dz-danger)] focus-within:border-[var(--dz-danger)] focus-within:ring-[var(--dz-danger)]/25',
      false: '',
    },
  },

  defaultVariants: {
    variant: 'outline',
    size: 'md',
    invalid: false,
  },
})

/** Inner <input> element styles — reset native appearance */
export const inputElementVariants = tv({
  base: [
    'flex-1 w-full bg-transparent outline-none border-none',
    'text-[var(--dz-foreground)]',
    'placeholder:text-[var(--dz-input-placeholder)]',
    'disabled:cursor-not-allowed',
    'file:border-0 file:bg-transparent file:text-[length:var(--dz-text-sm)] file:font-[var(--dz-font-medium)]',
  ].join(' '),
})

/** Variant prop types extracted from the tv() definition */
export type InputWrapperVariantProps = VariantProps<typeof inputWrapperVariants>
export type InputElementVariantProps = VariantProps<typeof inputElementVariants>
