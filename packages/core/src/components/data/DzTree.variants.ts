/**
 * DzTree — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzip-ui/core/components/data/DzTree.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const treeVariants = tv({
  slots: {
    root: 'flex flex-col',
    item: [
      'flex items-center gap-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-sm)]',
      'cursor-pointer select-none',
      'transition-colors duration-150',
      'hover:bg-[var(--dz-muted)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-1',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ].join(' '),
    itemSelected: 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary)]',
    expandIcon: [
      'shrink-0 transition-transform duration-200',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    expandIconOpen: 'rotate-90',
    checkbox: [
      'shrink-0 rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'data-[state=checked]:bg-[var(--dz-primary)] data-[state=checked]:border-[var(--dz-primary)]',
    ].join(' '),
    nodeContent: 'flex-1 min-w-0 truncate',
    children: '',
    empty: [
      'flex items-center justify-center',
      'text-[var(--dz-muted-foreground)]',
      'p-[var(--dz-spacing-4)]',
    ].join(' '),
  },

  variants: {
    size: {
      xs: {
        item: 'py-[var(--dz-spacing-0-5)] px-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        expandIcon: 'h-3 w-3',
        checkbox: 'h-3 w-3',
        children: 'pl-[var(--dz-spacing-3)]',
      },
      sm: {
        item: 'py-[var(--dz-spacing-1)] px-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-sm)]',
        expandIcon: 'h-3.5 w-3.5',
        checkbox: 'h-3.5 w-3.5',
        children: 'pl-[var(--dz-spacing-4)]',
      },
      md: {
        item: 'py-[var(--dz-spacing-1-5)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
        expandIcon: 'h-4 w-4',
        checkbox: 'h-4 w-4',
        children: 'pl-[var(--dz-spacing-5)]',
      },
      lg: {
        item: 'py-[var(--dz-spacing-2)] px-[var(--dz-spacing-2-5)] text-[length:var(--dz-text-base)]',
        expandIcon: 'h-5 w-5',
        checkbox: 'h-5 w-5',
        children: 'pl-[var(--dz-spacing-6)]',
      },
      xl: {
        item: 'py-[var(--dz-spacing-2-5)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-lg)]',
        expandIcon: 'h-5 w-5',
        checkbox: 'h-5 w-5',
        children: 'pl-[var(--dz-spacing-8)]',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TreeVariantProps = VariantProps<typeof treeVariants>
