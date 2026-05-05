/**
 * DzBreadcrumb — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzBreadcrumb.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const breadcrumbVariants = tv({
  slots: {
    nav: '',
    list: 'flex flex-wrap items-center gap-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
    item: 'inline-flex items-center gap-[var(--dz-spacing-1_5)]',
    link: [
      'transition-[var(--dz-transition-fast)]',
      'hover:text-[var(--dz-foreground)]',
    ].join(' '),
    currentPage: 'font-medium text-[var(--dz-foreground)]',
    disabledLink: 'dz-disabled-control',
    separator: [
      'text-[var(--dz-muted-foreground)]',
      'select-none',
    ].join(' '),
  },
})

/** Variant prop types extracted from the tv() definition */
export type BreadcrumbVariantProps = VariantProps<typeof breadcrumbVariants>
