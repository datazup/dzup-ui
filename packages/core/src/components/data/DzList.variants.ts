/**
 * DzList + DzListItem — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/data/DzList.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const listVariants = tv({
  slots: {
    root: 'flex flex-col',
    item: [
      'flex items-center gap-[var(--dz-spacing-3)]',
      'transition-[var(--dz-transition-fast)]',
    ].join(' '),
  },

  variants: {
    variant: {
      plain: {
        root: '',
        item: '',
      },
      bordered: {
        root: 'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)]',
        item: 'border-b border-[var(--dz-border)] last:border-b-0',
      },
      divided: {
        root: '',
        item: 'border-b border-[var(--dz-border)] last:border-b-0',
      },
    },

    size: {
      xs: {
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        item: 'px-[var(--dz-spacing-5)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        item: 'px-[var(--dz-spacing-6)] py-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
      },
    },

    interactive: {
      true: {
        item: 'cursor-pointer hover:bg-[var(--dz-muted)] dz-focus-ring-control-inset',
      },
      false: {},
    },
  },

  defaultVariants: {
    variant: 'plain',
    size: 'md',
    interactive: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type ListVariantProps = VariantProps<typeof listVariants>
