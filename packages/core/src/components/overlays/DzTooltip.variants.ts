/**
 * DzTooltip -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzTooltip.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tooltipVariants = tv({
  slots: {
    content: [
      'z-50',
      'overflow-hidden',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-foreground)]',
      'text-[var(--dz-background)]',
      'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
      'shadow-[var(--dz-shadow-md)]',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    arrow: 'fill-[var(--dz-foreground)]',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TooltipVariantProps = VariantProps<typeof tooltipVariants>
