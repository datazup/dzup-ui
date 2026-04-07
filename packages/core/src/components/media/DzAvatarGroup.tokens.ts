/**
 * DzAvatarGroup -- Component-specific token mappings.
 *
 * Maps semantic design tokens to avatar group layout (ADR-04).
 * Avatars overlap via negative spacing; overflow counter shares avatar styling.
 *
 * @module @dzup-ui/core/components/media/DzAvatarGroup.tokens
 */

export const avatarGroupTokens = {
  /** Negative horizontal overlap between avatars */
  overlapSpacing: '-0.5rem',

  /** Ring around each avatar to separate overlapping items */
  ring: {
    color: 'var(--dz-background)',
    width: '2px',
  },

  /** Overflow counter ("+N" badge) */
  overflow: {
    background: 'var(--dz-muted)',
    foreground: 'var(--dz-muted-foreground)',
    fontWeight: 'var(--dz-font-medium)',
  },

  /** Overflow counter sizes (mirrors avatar sizes) */
  sizes: {
    xs: { dimension: '1.5rem', fontSize: 'var(--dz-text-xs)' },
    sm: { dimension: '2rem', fontSize: 'var(--dz-text-xs)' },
    md: { dimension: '2.5rem', fontSize: 'var(--dz-text-sm)' },
    lg: { dimension: '3rem', fontSize: 'var(--dz-text-base)' },
    xl: { dimension: '4rem', fontSize: 'var(--dz-text-lg)' },
  },
} as const
