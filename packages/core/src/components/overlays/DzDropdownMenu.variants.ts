/**
 * DzDropdownMenu — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/overlays/DzDropdownMenu.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dropdownMenuVariants = tv({
  slots: {
    content: [
      'z-50 min-w-[8rem]',
      'overflow-hidden',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-md)]',
      'p-[var(--dz-spacing-1)]',
      'transition-all',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    item: [
      'relative flex cursor-pointer select-none items-center',
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
      'outline-none',
      'transition-colors',
      'focus:bg-[var(--dz-muted)] focus:text-[var(--dz-foreground)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ].join(' '),
    separator: [
      '-mx-[var(--dz-spacing-1)]',
      'my-[var(--dz-spacing-1)]',
      'h-px',
      'bg-[var(--dz-border)]',
    ].join(' '),
    label: [
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
    ].join(' '),
  },
})

/** Variant prop types */
export type DropdownMenuVariantProps = VariantProps<typeof dropdownMenuVariants>
