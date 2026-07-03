/**
 * DzEmoji — Variant definitions using tailwind-variants (tv).
 *
 * Token-only styling: sizes map to the type scale (matching DzIcon's use of
 * the spacing scale). `leading-none` keeps the glyph tightly boxed and the
 * negative baseline alignment keeps it optically centered next to text.
 */
import { tv } from 'tailwind-variants'

export const emojiVariants = tv({
  base: 'inline-block leading-none align-[-0.125em] select-none not-italic antialiased',
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
      xl: 'text-5xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type EmojiVariantProps = Parameters<typeof emojiVariants>[0]
