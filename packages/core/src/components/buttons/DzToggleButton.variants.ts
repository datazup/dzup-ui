/**
 * DzToggleButton — tailwind-variants (tv) style definitions.
 *
 * Extends button variants with pressed state styling.
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/buttons/DzToggleButton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const toggleButtonVariants = tv({
  base: [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-[var(--dz-button-font-weight)]',
    'font-[family-name:var(--dz-button-font-family)]',
    'transition-[var(--dz-button-transition)]',
    'focus-visible:outline-none focus-visible:ring-[length:var(--dz-button-focus-ring-width)] focus-visible:ring-[var(--dz-button-focus-ring-color)] focus-visible:ring-offset-[length:var(--dz-button-focus-ring-offset)]',
    'disabled:pointer-events-none disabled:opacity-[var(--dz-button-disabled-opacity)]',
    'select-none',
  ].join(' '),

  variants: {
    variant: {
      solid: 'shadow-[var(--dz-shadow-xs)]',
      outline: 'border bg-transparent',
      ghost: 'bg-transparent',
      text: 'bg-transparent',
      link: 'bg-transparent',
    },
    size: {
      xs: 'h-[var(--dz-button-xs-height)] px-[var(--dz-button-xs-padding-x)] text-[length:var(--dz-button-xs-font-size)] gap-[var(--dz-button-xs-gap)] rounded-[var(--dz-radius-sm)]',
      sm: 'h-[var(--dz-button-sm-height)] px-[var(--dz-button-sm-padding-x)] text-[length:var(--dz-button-sm-font-size)] gap-[var(--dz-button-sm-gap)] rounded-[var(--dz-radius-sm)]',
      md: 'h-[var(--dz-button-md-height)] px-[var(--dz-button-md-padding-x)] text-[length:var(--dz-button-md-font-size)] gap-[var(--dz-button-md-gap)] rounded-[var(--dz-button-radius)]',
      lg: 'h-[var(--dz-button-lg-height)] px-[var(--dz-button-lg-padding-x)] text-[length:var(--dz-button-lg-font-size)] gap-[var(--dz-button-lg-gap)] rounded-[var(--dz-button-radius)]',
      xl: 'h-[var(--dz-button-xl-height)] px-[var(--dz-button-xl-padding-x)] text-[length:var(--dz-button-xl-font-size)] gap-[var(--dz-button-xl-gap)] rounded-[var(--dz-radius-lg)]',
    },
    pressed: {
      true: '',
      false: '',
    },
  },

  compoundVariants: [
    // Pressed state: outline becomes filled
    { variant: 'outline', pressed: true, class: 'bg-[var(--dz-muted)] border-[var(--dz-primary)]' },
    { variant: 'ghost', pressed: true, class: 'bg-[var(--dz-muted)]' },
    { variant: 'solid', pressed: true, class: 'ring-2 ring-[var(--dz-primary)] ring-offset-1' },
  ],

  defaultVariants: {
    variant: 'outline',
    size: 'md',
    pressed: false,
  },
})

/** Variant prop types */
export type ToggleButtonVariantProps = VariantProps<typeof toggleButtonVariants>
