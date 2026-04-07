/**
 * DzButtonGroup — tailwind-variants (tv) style definitions.
 *
 * @module @dzup-ui/core/components/buttons/DzButtonGroup.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const buttonGroupVariants = tv({
  base: 'inline-flex',

  variants: {
    orientation: {
      horizontal: [
        'flex-row',
        '[&>*:not(:first-child):not(:last-child)]:rounded-none',
        '[&>*:first-child]:rounded-r-none',
        '[&>*:last-child]:rounded-l-none',
        '[&>*+*]:border-l-0',
      ].join(' '),
      vertical: [
        'flex-col',
        '[&>*:not(:first-child):not(:last-child)]:rounded-none',
        '[&>*:first-child]:rounded-b-none',
        '[&>*:last-child]:rounded-t-none',
        '[&>*+*]:border-t-0',
      ].join(' '),
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ButtonGroupVariantProps = VariantProps<typeof buttonGroupVariants>
