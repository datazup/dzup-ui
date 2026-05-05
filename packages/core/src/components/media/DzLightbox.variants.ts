/**
 * DzLightbox — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzup-ui/core/components/media/DzLightbox.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const lightboxVariants = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50',
      'bg-[var(--dz-foreground)]/90 backdrop-blur-sm',
      'flex items-center justify-center',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
    ].join(' '),
    content: [
      'relative flex flex-col items-center justify-center',
      'max-h-[90vh] max-w-[90vw]',
      'outline-none',
    ].join(' '),
    image: [
      'max-h-[80vh] max-w-[85vw]',
      'object-contain',
      'rounded-[var(--dz-radius-md)]',
      'select-none',
    ].join(' '),
    caption: [
      'mt-[var(--dz-spacing-3)]',
      'text-center text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-background)]',
    ].join(' '),
    navButton: [
      'absolute z-10',
      'inline-flex items-center justify-center',
      'h-10 w-10 rounded-full',
      'bg-[var(--dz-background)]/20',
      'text-[var(--dz-background)]',
      'backdrop-blur-sm',
      'transition-all duration-150',
      'hover:bg-[var(--dz-background)]/40',
      'dz-focus-ring-button dz-disabled-button',
    ].join(' '),
    prevButton: 'left-[var(--dz-spacing-4)] top-1/2 -translate-y-1/2',
    nextButton: 'right-[var(--dz-spacing-4)] top-1/2 -translate-y-1/2',
    closeButton: [
      'absolute right-[var(--dz-spacing-4)] top-[var(--dz-spacing-4)]',
      'inline-flex items-center justify-center',
      'h-8 w-8 rounded-full',
      'bg-[var(--dz-background)]/20 text-[var(--dz-background)]',
      'backdrop-blur-sm',
      'transition-colors duration-150',
      'hover:bg-[var(--dz-background)]/40',
      'dz-focus-ring-button',
    ].join(' '),
    counter: [
      'absolute top-[var(--dz-spacing-4)] left-[var(--dz-spacing-4)]',
      'text-[length:var(--dz-text-sm)] text-[var(--dz-background)]',
    ].join(' '),
  },
})

/** Variant prop types */
export type LightboxVariantProps = VariantProps<typeof lightboxVariants>
