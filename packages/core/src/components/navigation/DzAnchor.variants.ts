/**
 * DzAnchor — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). The active link is
 * marked by a colored left rail segment + emphasized text; nesting depth is
 * applied as inline indentation in the component (driven by `--dz-anchor-indent`).
 *
 * @module @dzup-ui/core/components/navigation/DzAnchor.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const anchorVariants = tv({
  slots: {
    root: 'dz-anchor text-[length:var(--dz-anchor-font-size)]',
    list: 'flex flex-col',
    item: 'relative',
    link: [
      'block pr-[var(--dz-spacing-2)] py-[var(--dz-anchor-item-gap)]',
      'border-l-2 border-[var(--dz-anchor-rail-color)]',
      'text-[var(--dz-anchor-color)]',
      'transition-colors',
      'hover:text-[var(--dz-anchor-hover-color)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dz-ring)]',
    ].join(' '),
  },
  variants: {
    affix: {
      true: { root: 'sticky' },
      false: {},
    },
    active: {
      true: {
        link: 'border-[var(--dz-anchor-active-color)] font-medium text-[var(--dz-anchor-active-color)]',
      },
      false: {},
    },
    disabled: {
      true: { link: 'dz-disabled-control pointer-events-none' },
      false: {},
    },
  },
  defaultVariants: {
    affix: false,
    active: false,
    disabled: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type AnchorVariantProps = VariantProps<typeof anchorVariants>
