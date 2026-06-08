/**
 * DzCopyButton — tailwind-variants (tv) style definitions.
 *
 * Visual treatment (fill / border / tone) is shared with DzButton via
 * `buttonVariants` (ADR-02 frozen variant taxonomy). This layer only
 * enforces the square icon-only footprint per canonical size; the label
 * presentation falls back to the standard button padding.
 *
 * @module @dzup-ui/core/components/buttons/DzCopyButton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const copyButtonVariants = tv({
  base: 'p-0',
  variants: {
    size: {
      icon: 'h-[var(--dz-button-icon-height)] w-[var(--dz-button-icon-width)]',
      xs: 'h-[var(--dz-button-xs-height)] w-[var(--dz-button-xs-height)]',
      sm: 'h-[var(--dz-button-sm-height)] w-[var(--dz-button-sm-height)]',
      md: 'h-[var(--dz-button-md-height)] w-[var(--dz-button-md-height)]',
      lg: 'h-[var(--dz-button-lg-height)] w-[var(--dz-button-lg-height)]',
      xl: 'h-[var(--dz-button-xl-height)] w-[var(--dz-button-xl-height)]',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CopyButtonVariantProps = VariantProps<typeof copyButtonVariants>
