/**
 * DzPagination — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/navigation/DzPagination.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const paginationVariants = tv({
  slots: {
    root: '',
    list: 'flex flex-row items-center gap-[var(--dz-spacing-1)]',
    item: '',
    button: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-md)]',
      'font-medium',
      'transition-[var(--dz-transition-fast)]',
      'text-[var(--dz-foreground)]',
      'hover:bg-[var(--dz-muted)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:pointer-events-none disabled:opacity-50',
    ].join(' '),
    activeButton: [
      'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]',
      'hover:bg-[var(--dz-primary-hover)]',
    ].join(' '),
    ellipsis: [
      'inline-flex items-center justify-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },

  variants: {
    size: {
      xs: {
        button: 'h-[var(--dz-button-xs-height)] min-w-[var(--dz-button-xs-height)] text-[length:var(--dz-text-xs)]',
        ellipsis: 'h-[var(--dz-button-xs-height)] min-w-[var(--dz-button-xs-height)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        button: 'h-[var(--dz-button-sm-height)] min-w-[var(--dz-button-sm-height)] text-[length:var(--dz-text-sm)]',
        ellipsis: 'h-[var(--dz-button-sm-height)] min-w-[var(--dz-button-sm-height)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        button: 'h-[var(--dz-button-md-height)] min-w-[var(--dz-button-md-height)] text-[length:var(--dz-text-sm)]',
        ellipsis: 'h-[var(--dz-button-md-height)] min-w-[var(--dz-button-md-height)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        button: 'h-[var(--dz-button-lg-height)] min-w-[var(--dz-button-lg-height)] text-[length:var(--dz-text-base)]',
        ellipsis: 'h-[var(--dz-button-lg-height)] min-w-[var(--dz-button-lg-height)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        button: 'h-[var(--dz-button-xl-height)] min-w-[var(--dz-button-xl-height)] text-[length:var(--dz-text-lg)]',
        ellipsis: 'h-[var(--dz-button-xl-height)] min-w-[var(--dz-button-xl-height)] text-[length:var(--dz-text-lg)]',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type PaginationVariantProps = VariantProps<typeof paginationVariants>
