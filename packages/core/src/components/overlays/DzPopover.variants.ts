/**
 * DzPopover -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzPopover.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const popoverVariants = tv({
  slots: {
    content: [
      'z-50',
      'overflow-hidden',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'p-[var(--dz-spacing-4)]',
      'shadow-[var(--dz-shadow-lg)]',
      'outline-none',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    arrow: 'fill-[var(--dz-background)] stroke-[var(--dz-border)]',
  },
  variants: {
    size: {
      sm: { content: 'w-48' },
      md: { content: 'w-72' },
      lg: { content: 'w-96' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type PopoverVariantProps = VariantProps<typeof popoverVariants>
