/**
 * TeamMemberBadge — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/TeamMemberBadge.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const teamMemberBadgeVariants = tv({
  base: [
    'inline-flex items-center',
    'gap-[var(--dz-spacing-1)]',
    'font-medium whitespace-nowrap',
    'text-[var(--dz-foreground)]',
  ].join(' '),

  variants: {
    size: {
      xs: 'text-[length:var(--dz-text-xs)]',
      sm: 'text-[length:var(--dz-text-xs)]',
      md: 'text-[length:var(--dz-text-xs)]',
      lg: 'text-[length:var(--dz-text-sm)]',
      xl: 'text-[length:var(--dz-text-sm)]',
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TeamMemberBadgeVariantProps = VariantProps<typeof teamMemberBadgeVariants>
