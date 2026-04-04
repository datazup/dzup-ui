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
      'absolute right-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'opacity-70 transition-opacity',
      'hover:opacity-100',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:pointer-events-none',
      '@media(prefers-reduced-motion:reduce){transition:none}',
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
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type DialogVariantProps = VariantProps<typeof dialogVariants>
