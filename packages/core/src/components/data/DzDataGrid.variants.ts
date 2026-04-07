/**
 * DzDataGrid — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/data/DzDataGrid.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dataGridVariants = tv({
  slots: {
    root: [
      'w-full overflow-auto',
      'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)]',
    ].join(' '),
    table: 'w-full border-collapse',
    header: 'bg-[var(--dz-muted)]',
    headerRow: '',
    headerCell: [
      'text-left font-medium text-[var(--dz-muted-foreground)]',
      'select-none',
    ].join(' '),
    body: '',
    row: [
      'border-b border-[var(--dz-border)] last:border-b-0',
      'transition-[var(--dz-transition-fast)]',
      'hover:bg-[var(--dz-muted)]/50',
    ].join(' '),
    cell: 'text-left',
    sortIcon: 'inline-flex ml-[var(--dz-spacing-1)]',
    filterIcon: [
      'inline-flex items-center justify-center',
      'h-5 w-5 ml-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-sm)]',
      'hover:bg-[var(--dz-muted)]',
      'transition-[var(--dz-transition-fast)]',
    ].join(' '),
    checkbox: [
      'h-4 w-4 rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'accent-[var(--dz-primary)]',
    ].join(' '),
    pagination: [
      'flex items-center justify-between',
      'border-t border-[var(--dz-border)]',
      'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    paginationButton: [
      'inline-flex items-center justify-center',
      'h-8 w-8',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'transition-[var(--dz-transition-fast)]',
      'hover:bg-[var(--dz-muted)]',
      'disabled:pointer-events-none disabled:opacity-50',
    ].join(' '),
    empty: [
      'flex items-center justify-center',
      'py-[var(--dz-spacing-12)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    loading: [
      'flex items-center justify-center',
      'py-[var(--dz-spacing-12)]',
    ].join(' '),
  },

  variants: {
    size: {
      xs: {
        headerCell: 'text-[length:var(--dz-text-xs)]',
        cell: 'text-[length:var(--dz-text-xs)]',
      },
      sm: {
        headerCell: 'text-[length:var(--dz-text-sm)]',
        cell: 'text-[length:var(--dz-text-sm)]',
      },
      md: {
        headerCell: 'text-[length:var(--dz-text-sm)]',
        cell: 'text-[length:var(--dz-text-sm)]',
      },
      lg: {
        headerCell: 'text-[length:var(--dz-text-base)]',
        cell: 'text-[length:var(--dz-text-base)]',
      },
      xl: {
        headerCell: 'text-[length:var(--dz-text-lg)]',
        cell: 'text-[length:var(--dz-text-lg)]',
      },
    },

    density: {
      compact: {
        headerCell: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
        cell: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      },
      default: {
        headerCell: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]',
        cell: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]',
      },
      comfortable: {
        headerCell: 'px-[var(--dz-spacing-6)] py-[var(--dz-spacing-4)]',
        cell: 'px-[var(--dz-spacing-6)] py-[var(--dz-spacing-4)]',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    density: 'default',
  },
})

/** Variant prop types extracted from the tv() definition */
export type DataGridVariantProps = VariantProps<typeof dataGridVariants>
