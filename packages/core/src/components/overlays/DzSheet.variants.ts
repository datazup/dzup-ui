/**
 * DzSheet — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzSheet.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/**
 * `rtl-physical-ok`: `side="right"` names a side. Whether a sheet should
 * open from the inline-end instead in an RTL document is a product decision,
 * not a refactor — TASK-OSS-P4-05's stop condition, recorded rather than
 * taken.
 */
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
      'dz-focus-ring-button',
    ].join(' '),
  },

  variants: {
    side: {
      top: {
        content: 'inset-x-0 top-0 w-full border-b border-[var(--dz-border)]',
      },
      right: {
        content: 'inset-y-0 right-0 h-full w-3/4 border-l border-[var(--dz-border)]',
      },
      bottom: {
        content: 'inset-x-0 bottom-0 w-full border-t border-[var(--dz-border)]',
      },
      left: {
        content: 'inset-y-0 left-0 h-full w-3/4 border-r border-[var(--dz-border)]',
      },
    },
    size: {
      sm: { content: '' },
      md: { content: '' },
      lg: { content: '' },
    },
  },

  // Width applies to left/right; height applies to top/bottom.
  // Each compound row pairs a size with the axis it affects.
  compoundVariants: [
    { side: 'left', size: 'sm', class: { content: 'max-w-sm' } },
    { side: 'left', size: 'md', class: { content: 'max-w-md' } },
    { side: 'left', size: 'lg', class: { content: 'max-w-lg' } },
    { side: 'right', size: 'sm', class: { content: 'max-w-sm' } },
    { side: 'right', size: 'md', class: { content: 'max-w-md' } },
    { side: 'right', size: 'lg', class: { content: 'max-w-lg' } },
    { side: 'top', size: 'sm', class: { content: 'max-h-[25vh]' } },
    { side: 'top', size: 'md', class: { content: 'max-h-[40vh]' } },
    { side: 'top', size: 'lg', class: { content: 'max-h-[60vh]' } },
    { side: 'bottom', size: 'sm', class: { content: 'max-h-[25vh]' } },
    { side: 'bottom', size: 'md', class: { content: 'max-h-[40vh]' } },
    { side: 'bottom', size: 'lg', class: { content: 'max-h-[60vh]' } },
  ],

  defaultVariants: {
    side: 'right',
    size: 'sm',
  },
})

/** Variant prop types */
export type SheetVariantProps = VariantProps<typeof sheetVariants>
