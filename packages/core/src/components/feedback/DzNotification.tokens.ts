/**
 * DzNotification -- Component-specific token mappings.
 *
 * Maps semantic design tokens to notification panel components (ADR-04).
 * Notifications use a left-border accent for tone indication.
 *
 * @module @dzup-ui/core/components/feedback/DzNotification.tokens
 */

export const notificationTokens = {
  /** Root container */
  root: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-md)',
    padding: 'var(--dz-spacing-4)',
    gap: 'var(--dz-spacing-3)',
  },

  /** Title text */
  title: {
    fontSize: 'var(--dz-text-sm)',
  },

  /** Description text */
  description: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
  },

  /** Close button */
  close: {
    position: {
      right: 'var(--dz-spacing-2)',
      top: 'var(--dz-spacing-2)',
    },
    radius: 'var(--dz-radius-sm)',
    focusRing: 'var(--dz-primary)',
  },

  /** Tone-specific left border accent colors */
  tones: {
    neutral: { borderAccent: 'var(--dz-border)' },
    primary: { borderAccent: 'var(--dz-primary)' },
    success: { borderAccent: 'var(--dz-success)' },
    warning: { borderAccent: 'var(--dz-warning)' },
    danger: { borderAccent: 'var(--dz-danger)' },
    info: { borderAccent: 'var(--dz-info)' },
  },

  /** Transition timing */
  transition: 'var(--dz-duration-normal)',
} as const
