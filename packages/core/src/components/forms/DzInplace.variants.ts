/**
 * DzInplace — tailwind-variants (tv) style definitions.
 *
 * Styles the display affordance (a button with a hover hint) and the editor
 * wrapper. All values reference `--dz-inplace-*` tokens (see styles/base.css);
 * no raw colors (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzInplace.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const inplaceVariants = tv({
  slots: {
    root: 'dz-inplace inline-flex max-w-full align-middle',
    display: [
      'inline-flex items-center gap-[var(--dz-inplace-gap)]',
      'max-w-full text-left',
      'rounded-[var(--dz-inplace-radius)]',
      'px-[var(--dz-inplace-padding-x)] py-[var(--dz-inplace-padding-y)]',
      'cursor-text transition-colors',
      'hover:bg-[var(--dz-inplace-hover-bg)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dz-inplace-ring)]',
    ].join(' '),
    hint: 'shrink-0 text-[var(--dz-inplace-hint-color)] opacity-0 transition-opacity group-hover:opacity-100',
    editor: 'inline-flex items-center gap-[var(--dz-inplace-gap)] max-w-full',
  },
  variants: {
    disabled: {
      true: {
        display: 'cursor-not-allowed opacity-[var(--dz-inplace-disabled-opacity)] hover:bg-transparent',
      },
    },
  },
})

/** Variant prop types extracted from the tv() definition */
export type InplaceVariantProps = VariantProps<typeof inplaceVariants>
