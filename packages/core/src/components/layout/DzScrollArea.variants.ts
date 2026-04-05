/**
 * DzScrollArea — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/layout/DzScrollArea.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const scrollAreaVariants = tv({
  slots: {
    root: 'relative overflow-hidden',
    viewport: 'h-full w-full rounded-[inherit]',
    scrollbar: [
      'flex touch-none select-none',
      'transition-colors',
      'p-[1px]',
    ].join(' '),
    thumb: [
      'relative flex-1',
      'rounded-full',
      'bg-[var(--dz-border)]',
      'hover:bg-[var(--dz-muted-foreground)]',
      'transition-colors',
    ].join(' '),
    corner: 'bg-[var(--dz-muted)]',
  },

  variants: {
    scrollbarOrientation: {
      vertical: {
        scrollbar: 'h-full w-2.5 border-l border-l-transparent',
      },
      horizontal: {
        scrollbar: 'h-2.5 flex-col border-t border-t-transparent',
      },
    },
  },
})

/** Variant prop types */
export type ScrollAreaVariantProps = VariantProps<typeof scrollAreaVariants>
