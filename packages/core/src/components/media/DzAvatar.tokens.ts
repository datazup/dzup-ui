/**
 * DzAvatar -- Component-specific token mappings.
 *
 * Maps semantic design tokens to avatar components (ADR-04).
 * Supports five sizes and two shapes (circle, square).
 *
 * @module @dzip-ui/core/components/media/DzAvatar.tokens
 */

export const avatarTokens = {
  /** Fallback background (shown when no image loads) */
  fallback: {
    background: 'var(--dz-muted)',
    foreground: 'var(--dz-muted-foreground)',
  },

  /** Font weight for initials */
  fontWeight: 'var(--dz-font-medium)',

  /** Size-specific dimensions and typography */
  sizes: {
    xs: { dimension: '1.5rem', fontSize: 'var(--dz-text-xs)' },
    sm: { dimension: '2rem', fontSize: 'var(--dz-text-xs)' },
    md: { dimension: '2.5rem', fontSize: 'var(--dz-text-sm)' },
    lg: { dimension: '3rem', fontSize: 'var(--dz-text-base)' },
    xl: { dimension: '4rem', fontSize: 'var(--dz-text-lg)' },
  },

  /** Shape-specific border radius */
  shape: {
    circle: 'var(--dz-radius-full)',
    square: 'var(--dz-radius-md)',
  },

  /** Optional ring/border (used by avatar groups) */
  ring: {
    color: 'var(--dz-background)',
    width: '2px',
  },
} as const
