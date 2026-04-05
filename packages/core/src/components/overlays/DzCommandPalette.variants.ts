/**
 * DzCommandPalette — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/overlays/DzCommandPalette.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const commandPaletteVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50',
      'bg-[var(--dz-overlay-bg)]',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    content: [
      'fixed left-1/2 top-[20%] z-50',
      '-translate-x-1/2',
      'w-full max-w-lg',
      'overflow-hidden',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-xl)]',
      'transition-all',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    input: [
      'flex w-full',
      'border-b border-[var(--dz-border)]',
      'bg-transparent',
      'px-[var(--dz-spacing-4)]',
      'py-[var(--dz-spacing-3)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'outline-none',
    ].join(' '),
    inputWrapper: [
      'flex items-center gap-[var(--dz-spacing-2)]',
      'border-b border-[var(--dz-border)]',
      'px-[var(--dz-spacing-3)]',
    ].join(' '),
    inputIcon: [
      'shrink-0',
      'text-[var(--dz-muted-foreground)]',
      'h-4 w-4',
    ].join(' '),
    list: [
      'max-h-[300px] overflow-y-auto',
      'p-[var(--dz-spacing-1)]',
    ].join(' '),
    item: [
      'relative flex cursor-pointer select-none items-center',
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)]',
      'outline-none',
      'transition-colors',
      'data-[highlighted]:bg-[var(--dz-muted)] data-[highlighted]:text-[var(--dz-foreground)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ].join(' '),
    itemIcon: [
      'mr-[var(--dz-spacing-2)]',
      'h-4 w-4',
      'shrink-0',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    itemLabel: [
      'flex-1',
    ].join(' '),
    itemShortcut: [
      'ml-auto',
      'text-[length:var(--dz-text-xs)]',
      'tracking-widest',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    group: [],
    groupHeading: [
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-xs)]',
      'font-medium',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    empty: [
      'py-[var(--dz-spacing-6)]',
      'text-center',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    separator: [
      '-mx-[var(--dz-spacing-1)]',
      'my-[var(--dz-spacing-1)]',
      'h-px',
      'bg-[var(--dz-border)]',
    ].join(' '),
  },
})

/** Variant prop types */
export type CommandPaletteVariantProps = VariantProps<typeof commandPaletteVariants>
