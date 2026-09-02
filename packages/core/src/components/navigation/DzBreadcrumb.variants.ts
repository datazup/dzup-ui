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
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum). A breadcrumb link
     * measured `a 37.53x21` — 21 CSS px tall, the height of its own text — on
     * all three engines. The criterion's Inline exception does not cover it: a
     * breadcrumb is a navigation trail, not a run of prose, and growing a link
     * in it breaks no line of text. `dz-target-min` puts the 24px floor on the
     * block axis (the inline axis is already past it), and `inline-flex` keeps
     * the label optically centred in the taller box.
     */
    link: [
      'dz-target-min inline-flex items-center',
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
