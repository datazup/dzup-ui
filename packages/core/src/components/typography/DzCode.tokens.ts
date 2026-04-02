/**
 * DzCode — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzCode variants
 * (inline and block). This file serves as the contract between
 * the token system and the component.
 */

/** Token references used by DzCode */
export const codeTokens = {
  /** Monospace font family */
  fontFamily: 'var(--dz-font-mono)',
  /** Text color */
  color: 'var(--dz-foreground)',
  /** Font size (shared by both inline and block) */
  fontSize: 'var(--dz-text-sm)',
  /** Background color for code surfaces */
  background: 'var(--dz-muted)',

  /** Inline variant */
  inline: {
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-1_5)',
    paddingY: 'var(--dz-spacing-0_5)',
  },

  /** Block variant */
  block: {
    radius: 'var(--dz-radius-md)',
    padding: 'var(--dz-spacing-4)',
  },
} as const
