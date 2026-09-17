/**
 * DzDialog -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 * Slot-based compound variant pattern for overlay + content.
 *
 * @module @dzup-ui/core/components/overlays/DzDialog.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dialogVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50',
      'bg-[var(--dz-overlay-bg)]',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    content: [
      'fixed left-1/2 top-1/2 z-50',
      '-translate-x-1/2 -translate-y-1/2',
      'w-full',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-xl)]',
      'p-[var(--dz-spacing-6)]',
      'transition-all',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    title: [
      'text-[length:var(--dz-text-lg)]',
      'font-semibold',
      'leading-none',
      'tracking-tight',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'mt-[var(--dz-spacing-1_5)]',
    ].join(' '),
    close: [
      // A logical inline-end inset, not a physical one: the dialog's anatomy declares
      // `mirrors: 'layout'`, so the close control has to sit on the inline-END
      // edge and follow the document direction. It was pinned physically right,
      // which put it on the wrong side of every RTL dialog — the real defect in
      // the 14 sites TASK-N2-S1 measured (S1-D3), fixed in TASK-R5-O2.
      // `inset-e-` is the spelling Tailwind 4 actually generates; `end-` does
      // not exist and would silently unpin the button (S1-F4c).
      'absolute inset-e-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'opacity-70 transition-opacity',
      'hover:opacity-100',
      'dz-focus-ring-button dz-disabled-button',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    header: [
      'sticky top-0 z-10',
      'px-[var(--dz-spacing-6)] pt-[var(--dz-spacing-5)] pb-[var(--dz-spacing-3)]',
      'bg-[var(--dz-background)]',
      'border-b border-[var(--dz-border)]',
      'rounded-t-[var(--dz-radius-lg)]',
    ].join(' '),
    body: [
      'flex-1 overflow-y-auto',
      'px-[var(--dz-spacing-6)] py-[var(--dz-spacing-4)]',
    ].join(' '),
    footer: [
      'sticky bottom-0 z-10',
      'flex items-center justify-end gap-[var(--dz-spacing-2)]',
      'px-[var(--dz-spacing-6)] pt-[var(--dz-spacing-3)] pb-[var(--dz-spacing-5)]',
      'bg-[var(--dz-background)]',
      'border-t border-[var(--dz-border)]',
      'rounded-b-[var(--dz-radius-lg)]',
    ].join(' '),
  },
  variants: {
    size: {
      sm: { content: 'max-w-sm' },
      md: { content: 'max-w-md' },
      lg: { content: 'max-w-lg' },
      xl: { content: 'max-w-xl' },
      full: { content: 'max-w-[calc(100vw-var(--dz-spacing-8))]' },
    },
    scrollable: {
      true: {
        content: 'flex flex-col p-0 max-h-[80vh] overflow-hidden',
      },
      false: { content: '' },
    },
  },
  defaultVariants: {
    size: 'md',
    scrollable: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type DialogVariantProps = VariantProps<typeof dialogVariants>
