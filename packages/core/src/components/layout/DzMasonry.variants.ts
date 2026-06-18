/**
 * DzMasonry -- tailwind-variants (tv) style definitions.
 *
 * Two rendering paths share the `--dz-masonry-gap` custom property (ADR-04):
 *
 * - `masonryVariants` drives the **CSS multi-column fast path**: native
 *   `columns-N` utilities flow children in source order, column-major, with the
 *   browser balancing column heights. Direct children get `break-inside: avoid`
 *   and a bottom margin so items never split across columns.
 * - `masonryColumnContainer` / `masonryColumn` drive the **measured-JS path**:
 *   a flex row of equal-width columns, each a vertical stack the component packs
 *   by measured height.
 *
 * @module @dzup-ui/core/components/layout/DzMasonry.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const masonryVariants = tv({
  base: [
    '[column-gap:var(--dz-masonry-gap)]',
    '[&>*]:[break-inside:avoid]',
    '[&>*]:[margin-bottom:var(--dz-masonry-gap)]',
  ].join(' '),

  variants: {
    columns: {
      1: 'columns-1',
      2: 'columns-2',
      3: 'columns-3',
      4: 'columns-4',
      5: 'columns-5',
      6: 'columns-6',
    },
  },

  defaultVariants: {
    columns: 3,
  },
})

/** Maps a column count to responsive Tailwind `columns-N` classes per breakpoint. */
export const responsiveColumnsMap: Record<string, Record<number, string>> = {
  // `xs` is the mobile-first base -- no breakpoint prefix.
  xs: {
    1: 'columns-1',
    2: 'columns-2',
    3: 'columns-3',
    4: 'columns-4',
    5: 'columns-5',
    6: 'columns-6',
  },
  sm: {
    1: 'sm:columns-1',
    2: 'sm:columns-2',
    3: 'sm:columns-3',
    4: 'sm:columns-4',
    5: 'sm:columns-5',
    6: 'sm:columns-6',
  },
  md: {
    1: 'md:columns-1',
    2: 'md:columns-2',
    3: 'md:columns-3',
    4: 'md:columns-4',
    5: 'md:columns-5',
    6: 'md:columns-6',
  },
  lg: {
    1: 'lg:columns-1',
    2: 'lg:columns-2',
    3: 'lg:columns-3',
    4: 'lg:columns-4',
    5: 'lg:columns-5',
    6: 'lg:columns-6',
  },
  xl: {
    1: 'xl:columns-1',
    2: 'xl:columns-2',
    3: 'xl:columns-3',
    4: 'xl:columns-4',
    5: 'xl:columns-5',
    6: 'xl:columns-6',
  },
}

/** Flex row wrapping the measured-JS path columns. */
export const masonryColumnContainer = tv({
  base: 'flex [gap:var(--dz-masonry-gap)]',
})

/** A single equal-width column in the measured-JS path. */
export const masonryColumn = tv({
  base: 'dz-masonry__column flex min-w-0 flex-1 flex-col [gap:var(--dz-masonry-gap)]',
})

/** Variant prop types extracted from the tv() definition. */
export type MasonryVariantProps = VariantProps<typeof masonryVariants>
