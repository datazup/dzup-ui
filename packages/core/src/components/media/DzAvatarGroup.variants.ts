/**
 * DzAvatarGroup — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/media/DzAvatarGroup.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const avatarGroupVariants = tv({
  base: [
    'flex items-center',
    '-space-x-2',
  ].join(' '),
})

export const avatarGroupOverflowVariants = tv({
  base: [
    'relative inline-flex items-center justify-center',
    'rounded-full',
    'bg-[var(--dz-muted)]',
    'text-[var(--dz-muted-foreground)]',
    'font-[var(--dz-font-medium)]',
    'ring-2 ring-[var(--dz-background)]',
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
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type AvatarGroupVariantProps = VariantProps<typeof avatarGroupVariants>
export type AvatarGroupOverflowVariantProps = VariantProps<typeof avatarGroupOverflowVariants>
