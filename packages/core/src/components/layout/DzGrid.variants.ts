/**
 * DzGrid -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzGrid.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const gridVariants = tv({
  base: 'grid',

  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-[var(--dz-spacing-0)]',
      xs: 'gap-[var(--dz-spacing-1)]',
      sm: 'gap-[var(--dz-spacing-2)]',
      md: 'gap-[var(--dz-spacing-4)]',
      lg: 'gap-[var(--dz-spacing-6)]',
      xl: 'gap-[var(--dz-spacing-8)]',
    },
  },

  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})

/** Maps col counts to responsive Tailwind classes per breakpoint */
export const responsiveColsMap: Record<string, Record<number, string>> = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
}

/**
 * Span classes for `DzGridItem`, per breakpoint (TASK-R3-O3, decision D67).
 *
 * A literal table rather than a template string, on purpose: Tailwind's scanner
 * only emits a class it can read in source, so `\`md:col-span-${n}\`` would
 * compile to nothing and the span would collapse silently. `col-span-*` is
 * `grid-column: span N / span N` and `col-span-full` is `1 / -1`; grid lines
 * count from the inline-start edge, so every entry mirrors under `dir="rtl"`.
 */
export const gridItemSpanMap = {
  base: {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
    full: 'col-span-full',
  },
  sm: {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
    4: 'sm:col-span-4',
    5: 'sm:col-span-5',
    6: 'sm:col-span-6',
    7: 'sm:col-span-7',
    8: 'sm:col-span-8',
    9: 'sm:col-span-9',
    10: 'sm:col-span-10',
    11: 'sm:col-span-11',
    12: 'sm:col-span-12',
    full: 'sm:col-span-full',
  },
  md: {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
    full: 'md:col-span-full',
  },
  lg: {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
    full: 'lg:col-span-full',
  },
} as const

/**
 * Row-span classes for `DzGridItem`, per breakpoint (TASK-S3-O2, decision
 * `D-S3O2-1`).
 *
 * The mirror image of {@link gridItemSpanMap}, and literal for the same reason:
 * Tailwind's scanner cannot read `` `md:row-span-${n}` ``, so a template string
 * would compile to nothing and the span would collapse silently.
 *
 * `row-span-*` is `grid-row: span N / span N` and `row-span-full` is `1 / -1`.
 * Both are block-axis and therefore writing-mode relative, so — like the column
 * table — every entry is correct under `dir="rtl"` with nothing to configure.
 */
export const gridItemRowSpanMap = {
  base: {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
    7: 'row-span-7',
    8: 'row-span-8',
    9: 'row-span-9',
    10: 'row-span-10',
    11: 'row-span-11',
    12: 'row-span-12',
    full: 'row-span-full',
  },
  sm: {
    1: 'sm:row-span-1',
    2: 'sm:row-span-2',
    3: 'sm:row-span-3',
    4: 'sm:row-span-4',
    5: 'sm:row-span-5',
    6: 'sm:row-span-6',
    7: 'sm:row-span-7',
    8: 'sm:row-span-8',
    9: 'sm:row-span-9',
    10: 'sm:row-span-10',
    11: 'sm:row-span-11',
    12: 'sm:row-span-12',
    full: 'sm:row-span-full',
  },
  md: {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
    3: 'md:row-span-3',
    4: 'md:row-span-4',
    5: 'md:row-span-5',
    6: 'md:row-span-6',
    7: 'md:row-span-7',
    8: 'md:row-span-8',
    9: 'md:row-span-9',
    10: 'md:row-span-10',
    11: 'md:row-span-11',
    12: 'md:row-span-12',
    full: 'md:row-span-full',
  },
  lg: {
    1: 'lg:row-span-1',
    2: 'lg:row-span-2',
    3: 'lg:row-span-3',
    4: 'lg:row-span-4',
    5: 'lg:row-span-5',
    6: 'lg:row-span-6',
    7: 'lg:row-span-7',
    8: 'lg:row-span-8',
    9: 'lg:row-span-9',
    10: 'lg:row-span-10',
    11: 'lg:row-span-11',
    12: 'lg:row-span-12',
    full: 'lg:row-span-full',
  },
} as const

/** Variant prop types extracted from the tv() definition */
export type GridVariantProps = VariantProps<typeof gridVariants>
