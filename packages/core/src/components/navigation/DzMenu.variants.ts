/**
 * DzMenu — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzMenu.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const menuVariants = tv({
  slots: {
    root: [
      'flex flex-col',
      'gap-[var(--dz-spacing-1)]',
    ].join(' '),
    item: [
      'flex items-center',
      'gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-md)]',
      'px-[var(--dz-spacing-3)]',
      'py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'transition-colors',
      'cursor-pointer',
      'outline-none',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control dz-disabled-control',
    ].join(' '),
    separator: [
      'my-[var(--dz-spacing-1)]',
      'h-px',
      'bg-[var(--dz-border)]',
    ].join(' '),
  },

  variants: {
    size: {
      xs: { item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]' },
      sm: { item: 'px-[var(--dz-spacing-2_5)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]' },
      md: {},
      lg: { item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-text-base)]' },
      xl: { item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-lg)]' },
    },
    active: {
      true: { item: 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary)] font-[var(--dz-font-medium)]' },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type MenuVariantProps = VariantProps<typeof menuVariants>
