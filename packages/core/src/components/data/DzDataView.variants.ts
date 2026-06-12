/**
 * DzDataView — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Container gap, list
 * dividers, and cell padding are driven by the `--dz-data-view-*` custom
 * properties declared on `.dz-data-view` in base.css.
 *
 * @module @dzup-ui/core/components/data/DzDataView.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dataViewVariants = tv({
  slots: {
    root: [
      'dz-data-view',
      'flex flex-col',
      'gap-[var(--dz-data-view-gap)]',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    toolbar: [
      'flex flex-wrap items-center justify-between',
      'gap-[var(--dz-data-view-toolbar-gap)]',
    ].join(' '),
    toolbarStart: 'flex items-center gap-[var(--dz-data-view-toolbar-gap)] min-w-0',
    toolbarEnd: 'flex items-center gap-[var(--dz-data-view-toolbar-gap)]',
    sortSelect: [
      'h-9 px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)] text-[var(--dz-foreground)]',
      'text-[length:var(--dz-text-sm)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-control dz-disabled-control',
    ].join(' '),
    // List layout
    list: [
      'flex flex-col',
      'divide-y divide-[var(--dz-data-view-list-divider)]',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)]',
      'overflow-hidden',
    ].join(' '),
    listItem: [
      'px-[var(--dz-data-view-list-item-padding-x)]',
      'py-[var(--dz-data-view-list-item-padding-y)]',
    ].join(' '),
    // Grid layout
    gridCell: 'min-w-0',
    // Skeleton card used in loading state
    skeleton: 'rounded-[var(--dz-radius-md)]',
    // Footer / paginator row
    footer: 'flex flex-wrap items-center justify-between gap-[var(--dz-data-view-toolbar-gap)]',
  },
  variants: {
    size: {
      icon: { root: '' },
      xs: { root: 'text-[length:var(--dz-text-xs)]' },
      sm: { root: 'text-[length:var(--dz-text-sm)]' },
      md: { root: 'text-[length:var(--dz-text-sm)]' },
      lg: { root: 'text-[length:var(--dz-text-base)]' },
      xl: { root: 'text-[length:var(--dz-text-lg)]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type DataViewVariantProps = VariantProps<typeof dataViewVariants>
