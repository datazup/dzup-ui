/**
 * DzTransfer — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzTransfer.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const transferVariants = tv({
  slots: {
    root: [
      'flex items-stretch',
      'gap-[var(--dz-spacing-3)]',
    ].join(' '),
    list: [
      'flex flex-col',
      'flex-1',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'overflow-hidden',
    ].join(' '),
    listHeader: [
      'flex items-center justify-between',
      'border-b border-[var(--dz-border)]',
      'px-[var(--dz-spacing-3)]',
      'py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)]',
      'font-medium',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    listCount: [
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    searchInput: [
      'w-full',
      'border-b border-[var(--dz-border)]',
      'bg-transparent',
      'px-[var(--dz-spacing-3)]',
      'py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'outline-none',
    ].join(' '),
    listBody: [
      'flex-1 overflow-y-auto',
      'p-[var(--dz-spacing-1)]',
    ].join(' '),
    item: [
      'flex items-center',
      'gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'cursor-pointer',
      'transition-colors',
      'hover:bg-[var(--dz-muted)]',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    ].join(' '),
    itemSelected: [
      'bg-[var(--dz-muted)]',
    ].join(' '),
    itemCheckbox: [
      'h-4 w-4',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'accent-[var(--dz-primary)]',
    ].join(' '),
    actions: [
      'flex flex-col items-center justify-center',
      'gap-[var(--dz-spacing-2)]',
    ].join(' '),
    actionButton: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-colors',
      'hover:bg-[var(--dz-muted)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    empty: [
      'flex items-center justify-center',
      'py-[var(--dz-spacing-4)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      xs: {
        list: 'min-h-[120px]',
        listBody: 'max-h-[120px]',
        actionButton: 'h-6 w-6 text-[length:var(--dz-text-xs)]',
      },
      sm: {
        list: 'min-h-[160px]',
        listBody: 'max-h-[160px]',
        actionButton: 'h-7 w-7 text-[length:var(--dz-text-sm)]',
      },
      md: {
        list: 'min-h-[200px]',
        listBody: 'max-h-[200px]',
        actionButton: 'h-8 w-8 text-[length:var(--dz-text-sm)]',
      },
      lg: {
        list: 'min-h-[260px]',
        listBody: 'max-h-[260px]',
        actionButton: 'h-9 w-9',
      },
      xl: {
        list: 'min-h-[320px]',
        listBody: 'max-h-[320px]',
        actionButton: 'h-10 w-10',
      },
    },
    disabled: {
      true: {
        root: 'pointer-events-none opacity-[var(--dz-button-disabled-opacity)]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type TransferVariantProps = VariantProps<typeof transferVariants>
