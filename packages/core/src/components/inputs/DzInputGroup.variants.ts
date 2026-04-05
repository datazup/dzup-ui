/**
 * DzInputGroup — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/inputs/DzInputGroup.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const inputGroupVariants = tv({
  slots: {
    root: 'flex items-stretch',
    addon: [
      'inline-flex items-center',
      'px-[var(--dz-spacing-3)]',
      'border border-[var(--dz-input-border)]',
      'bg-[var(--dz-muted)]',
      'text-[var(--dz-muted-foreground)]',
      'text-[length:var(--dz-text-sm)]',
    ].join(' '),
    addonPrefix: 'rounded-l-[var(--dz-input-radius)] border-r-0',
    addonSuffix: 'rounded-r-[var(--dz-input-radius)] border-l-0',
  },

  variants: {
    size: {
      xs: { addon: 'text-[length:var(--dz-text-xs)] px-[var(--dz-spacing-1_5)]' },
      sm: { addon: 'text-[length:var(--dz-text-xs)] px-[var(--dz-spacing-2)]' },
      md: {},
      lg: { addon: 'text-[length:var(--dz-text-base)] px-[var(--dz-spacing-4)]' },
      xl: { addon: 'text-[length:var(--dz-text-lg)] px-[var(--dz-spacing-4)]' },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type InputGroupVariantProps = VariantProps<typeof inputGroupVariants>
