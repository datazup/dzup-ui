/**
 * DzTable — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/data/DzTable.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tableVariants = tv({
  slots: {
    root: 'w-full border-collapse text-[var(--dz-foreground)]',
    header: 'bg-[var(--dz-muted)]',
    body: '',
    row: 'border-b border-[var(--dz-border)] transition-[var(--dz-transition-fast)]',
    headerCell: [
      'text-left font-medium text-[var(--dz-muted-foreground)]',
    ].join(' '),
    cell: 'text-left',
  },

  variants: {
    variant: {
      default: {
        root: '',
      },
      bordered: {
        root: 'border border-[var(--dz-border)]',
        headerCell: 'border border-[var(--dz-border)]',
        cell: 'border border-[var(--dz-border)]',
      },
      striped: {
        row: 'even:bg-[var(--dz-muted)]/50',
      },
    },

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

    hoverable: {
      true: {
        row: 'hover:bg-[var(--dz-muted)]/50',
      },
      false: {},
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
    density: 'default',
    hoverable: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type TableVariantProps = VariantProps<typeof tableVariants>
