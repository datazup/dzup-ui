/**
 * GovernanceBadge — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 * Color comes from inline style per pattern (via GOVERNANCE_PATTERN_TOKENS),
 * so compound variants here use --dz-primary / --dz-primary-foreground as the
 * tonal baseline — the inline style overrides the actual color at render time.
 *
 * @module @dzup-ui/core/components/feedback/GovernanceBadge.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const governanceBadgeVariants = tv({
  base: [
    'inline-flex items-center justify-center',
    'font-medium whitespace-nowrap',
    'rounded-[var(--dz-radius-full)]',
    'select-none',
  ].join(' '),

  variants: {
    variant: {
      solid: '',
      outline: 'border bg-transparent',
      subtle: '',
    },

    size: {
      icon: 'p-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      xs: 'px-[var(--dz-spacing-1_5)] py-0.5 text-[length:var(--dz-text-xs)]',
      sm: 'px-[var(--dz-spacing-2)] py-0.5 text-[length:var(--dz-text-xs)]',
      md: 'px-[var(--dz-spacing-2)] py-0.5 text-[length:var(--dz-text-xs)]',
      lg: 'px-[var(--dz-spacing-3)] py-1 text-[length:var(--dz-text-sm)]',
      xl: 'px-[var(--dz-spacing-3)] py-1 text-[length:var(--dz-text-sm)]',
    },
  },

  compoundVariants: [
    {
      variant: 'solid',
      class: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]',
    },
    {
      variant: 'outline',
      class: 'border-[var(--dz-primary)] text-[var(--dz-primary-muted-foreground)]',
    },
    {
      variant: 'subtle',
      class: 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]',
    },
  ],

  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type GovernanceBadgeVariantProps = VariantProps<typeof governanceBadgeVariants>
