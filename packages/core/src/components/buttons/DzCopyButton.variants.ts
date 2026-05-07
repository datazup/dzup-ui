/**
 * DzCopyButton — tailwind-variants (tv) style definitions.
 *
 * @module @dzup-ui/core/components/buttons/DzCopyButton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const copyButtonVariants = tv({
  base: [
    'inline-flex items-center justify-center rounded-md transition-colors',
    'dz-focus-ring-button',
    'dz-disabled-button',
  ].join(' '),
  variants: {
    size: {
      icon: '',
      xs: [
        'h-[var(--dz-button-xs-height)]',
        'w-[var(--dz-button-xs-height)]',
        'text-[length:var(--dz-button-xs-font-size)]',
      ].join(' '),
      sm: [
        'h-[var(--dz-button-sm-height)]',
        'w-[var(--dz-button-sm-height)]',
        'text-[length:var(--dz-button-sm-font-size)]',
      ].join(' '),
      md: [
        'h-[var(--dz-button-md-height)]',
        'w-[var(--dz-button-md-height)]',
        'text-[length:var(--dz-button-md-font-size)]',
      ].join(' '),
      lg: [
        'h-[var(--dz-button-lg-height)]',
        'w-[var(--dz-button-lg-height)]',
        'text-[length:var(--dz-button-lg-font-size)]',
      ].join(' '),
      xl: [
        'h-[var(--dz-button-xl-height)]',
        'w-[var(--dz-button-xl-height)]',
        'text-[length:var(--dz-button-xl-font-size)]',
      ].join(' '),
    },
    copied: {
      true: 'text-green-500',
      false: 'text-current opacity-70 hover:opacity-100',
    },
  },
  defaultVariants: {
    size: 'sm',
    copied: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type CopyButtonVariantProps = VariantProps<typeof copyButtonVariants>
