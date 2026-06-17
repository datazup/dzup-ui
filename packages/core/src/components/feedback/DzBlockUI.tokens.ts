/**
 * DzBlockUI — Component-specific token mappings.
 *
 * Maps the block-mask anatomy to semantic design tokens (ADR-04, ADR-17). The
 * concrete custom-property values live in `styles/base.css` under `.dz-block-ui`;
 * the references below fall back to global semantic tokens so the component
 * themes correctly even without that registration.
 *
 * @module @dzup-ui/core/components/feedback/DzBlockUI.tokens
 */

export const blockUiTokens = {
  /** Scrim that dims the blocked region. */
  mask: {
    /** Backdrop color/opacity (defaults to the shared overlay scrim). */
    background: 'var(--dz-blockui-mask, var(--dz-overlay-bg))',
    /** Optional backdrop blur applied to the masked content. */
    blur: 'var(--dz-blockui-blur, 0px)',
    /** Corner radius matching the masked surface. */
    radius: 'var(--dz-blockui-radius, var(--dz-radius-md))',
  },
  /** Default overlay content (spinner + message). */
  content: {
    /** Gap between spinner and message. */
    gap: 'var(--dz-blockui-gap, var(--dz-spacing-3))',
    /** Message text color. */
    messageColor: 'var(--dz-blockui-message-color, var(--dz-foreground))',
  },
  /** Stack order: scoped overlay vs. full-screen overlay. */
  z: {
    scoped: 'var(--dz-blockui-z, 30)',
    fullScreen: 'var(--dz-blockui-fullscreen-z, var(--dz-z-modal-backdrop, 1040))',
  },
} as const
