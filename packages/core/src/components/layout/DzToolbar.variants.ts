/**
 * DzToolbar -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Pure layout —
 * no interaction state, no raw colors.
 *
 * @module @dzup-ui/core/components/layout/DzToolbar.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const toolbarVariants = tv({
  base: [
    'dz-toolbar',
    'flex w-full items-center',
    'gap-[var(--dz-toolbar-gap)]',
    'px-[var(--dz-toolbar-padding-x)]',
    'py-[var(--dz-toolbar-padding-y)]',
    'rounded-[var(--dz-toolbar-radius)]',
    'bg-[var(--dz-toolbar-bg)]',
  ].join(' '),

  variants: {
    variant: {
      flat: '',
      outlined: 'border border-[var(--dz-toolbar-border)]',
      elevated: 'shadow-[var(--dz-toolbar-shadow)]',
    },
    // `size` drives control density via the data-size token hook in base.css;
    // no per-size classes are needed here. `icon` falls back to default density.
    size: {
      icon: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    wrap: {
      true: 'flex-wrap',
    },
    sticky: {
      true: 'sticky top-0 z-[var(--dz-toolbar-sticky-z)]',
    },
  },

  defaultVariants: {
    variant: 'flat',
    size: 'md',
  },
})

/**
 * Region (start / center / end) layout. Each region is a flex row that keeps
 * its own items grouped; `center` grows to absorb free space so the start and
 * end regions hug their respective edges.
 */
export const toolbarRegionVariants = tv({
  base: 'flex items-center gap-[var(--dz-toolbar-gap)] min-w-0',
  variants: {
    region: {
      start: 'justify-start',
      center: 'flex-1 justify-center',
      end: 'justify-end',
    },
  },
})

/** Variant prop types extracted from the tv() definition */
export type ToolbarVariantProps = VariantProps<typeof toolbarVariants>
