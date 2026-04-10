/**
 * DzCopyButton — tailwind-variants (tv) style definitions.
 *
 * @module @dzup-ui/core/components/buttons/DzCopyButton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const copyButtonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-7 w-7 text-xs',
      md: 'h-8 w-8 text-sm',
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
