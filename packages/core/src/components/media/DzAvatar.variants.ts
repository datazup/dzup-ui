/**
 * DzAvatar — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/media/DzAvatar.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const avatarVariants = tv({
  base: [
    'relative inline-flex items-center justify-center',
    'overflow-hidden',
    'bg-[var(--dz-muted)]',
    'text-[var(--dz-muted-foreground)]',
    'font-[var(--dz-font-medium)]',
    'select-none',
    'shrink-0',
  ].join(' '),

  variants: {
    size: {
      xs: 'h-6 w-6 text-[length:var(--dz-text-xs)]',
      sm: 'h-8 w-8 text-[length:var(--dz-text-xs)]',
      md: 'h-10 w-10 text-[length:var(--dz-text-sm)]',
      lg: 'h-12 w-12 text-[length:var(--dz-text-base)]',
      xl: 'h-16 w-16 text-[length:var(--dz-text-lg)]',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-[var(--dz-radius-md)]',
    },
  },

  defaultVariants: {
    size: 'md',
    shape: 'circle',
  },
})

/** Variant prop types extracted from the tv() definition */
export type AvatarVariantProps = VariantProps<typeof avatarVariants>
