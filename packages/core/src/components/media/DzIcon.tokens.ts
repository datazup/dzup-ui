/**
 * DzIcon — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzIcon variants.
 * Icon sizes use Tailwind utility classes (h-N w-N) which map to the
 * spacing scale; no custom CSS variables are needed beyond those.
 */

/** Token references used by DzIcon */
export const iconTokens = {
  /** Icon dimensions per size variant (Tailwind spacing scale) */
  dimensions: {
    xs: { height: '0.75rem', width: '0.75rem' },
    sm: { height: '1rem', width: '1rem' },
    md: { height: '1.25rem', width: '1.25rem' },
    lg: { height: '1.5rem', width: '1.5rem' },
    xl: { height: '2rem', width: '2rem' },
  },
} as const
