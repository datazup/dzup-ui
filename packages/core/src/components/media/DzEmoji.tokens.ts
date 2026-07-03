/**
 * DzEmoji — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzEmoji variants. Emoji sizes
 * use Tailwind type-scale utilities (text-*) which map to the font-size scale;
 * no custom CSS variables are needed beyond those.
 */

/** Token references used by DzEmoji */
export const emojiTokens = {
  /** Emoji font-size per size variant (Tailwind type scale) */
  fontSize: {
    xs: '0.875rem',
    sm: '1.125rem',
    md: '1.5rem',
    lg: '2.25rem',
    xl: '3rem',
  },
} as const
