/**
 * DzSheet — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/overlays/DzSheet.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const sheetVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50',
      'bg-[var(--dz-overlay-bg)]',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    content: [
      'fixed z-50',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-xl)]',
      'p-[var(--dz-spacing-6)]',
      'transition-transform',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    title: [
      'text-[length:var(--dz-text-lg)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'mt-[var(--dz-spacing-1_5)]',
    ].join(' '),
    close: [
      'absolute right-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'opacity-70 transition-opacity',
      'hover:opacity-100',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)]',
    ].join(' '),
  },

  variants: {
    side: {
      top: {
        content: 'inset-x-0 top-0 border-b border-[var(--dz-border)]',
      },
      right: {
        content: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-[var(--dz-border)]',
      },
      bottom: {
        content: 'inset-x-0 bottom-0 border-t border-[var(--dz-border)]',
      },
      left: {
        content: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-[var(--dz-border)]',
      },
    },
  },

  defaultVariants: {
    side: 'right',
  },
})

/** Variant prop types */
export type SheetVariantProps = VariantProps<typeof sheetVariants>
