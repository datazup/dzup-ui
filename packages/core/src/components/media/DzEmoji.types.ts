/**
 * DzEmoji — Type definitions for the emoji component.
 *
 * Renders an emoji glyph with consistent sizing and correct accessibility
 * semantics. Raw emoji characters are announced inconsistently by screen
 * readers; DzEmoji wraps them so they are either meaningful (`role="img"`
 * with a label) or explicitly decorative (`aria-hidden`).
 */
/** Emoji size (mirrors the canonical size scale, excluding the `icon` alias). */
export type EmojiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DzEmojiProps {
  /** The emoji character(s) to render, e.g. `'🎉'` or `'👨‍👩‍👧‍👦'` */
  emoji: string
  /** Emoji size (font-size scale) */
  size?: EmojiSize
  /**
   * Accessible label. When provided, the emoji is treated as meaningful
   * (`role="img"`, `aria-label`). When omitted, it is decorative
   * (`aria-hidden="true"`) — use this next to visible text that already
   * conveys the meaning.
   */
  label?: string
  /** Accessible identifier */
  id?: string
}

export interface DzEmojiSlots {
  // DzEmoji has no slots — it renders the emoji string directly
}
