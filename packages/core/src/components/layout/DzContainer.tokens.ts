/**
 * DzContainer -- Component-specific token mappings.
 *
 * Maps semantic design tokens to container layout properties (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/layout/DzContainer.tokens
 */

export const containerTokens = {
  /** Responsive horizontal padding scale */
  padding: {
    base: 'var(--dz-spacing-4)',
    sm: 'var(--dz-spacing-6)',
    lg: 'var(--dz-spacing-8)',
  },
  /** Max-width breakpoints (mapped to Tailwind screen values) */
  maxWidth: {
    'sm': 'var(--dz-breakpoint-sm)',
    'md': 'var(--dz-breakpoint-md)',
    'lg': 'var(--dz-breakpoint-lg)',
    'xl': 'var(--dz-breakpoint-xl)',
    '2xl': 'var(--dz-breakpoint-2xl)',
  },
} as const
