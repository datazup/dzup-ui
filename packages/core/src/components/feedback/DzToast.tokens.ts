/**
 * DzToast -- Component-specific token mappings.
 *
 * Maps semantic design tokens to toast notification components (ADR-04).
 * Toast is a multi-slot component (viewport, root, title, description, actions, close).
 *
 * @module @dzip-ui/core/components/feedback/DzToast.tokens
 */

export const toastTokens = {
  /** Viewport container */
  viewport: {
    padding: 'var(--dz-spacing-4)',
    gap: 'var(--dz-spacing-2)',
    width: '390px',
  },

  /** Root toast card */
  root: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-lg)',
    padding: 'var(--dz-spacing-4)',
    gap: 'var(--dz-spacing-3)',
  },

  /** Title text */
  title: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-foreground)',
  },

  /** Description text */
  description: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
    marginTop: 'var(--dz-spacing-1)',
  },

  /** Action button */
  actionButton: {
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-2)',
    fontSize: 'var(--dz-text-xs)',
    focusRing: 'var(--dz-primary)',
  },

  /** Close button */
  closeButton: {
    position: {
      right: 'var(--dz-spacing-1)',
      top: 'var(--dz-spacing-1)',
    },
    radius: 'var(--dz-radius-sm)',
    color: 'var(--dz-muted-foreground)',
    hoverColor: 'var(--dz-foreground)',
    focusRing: 'var(--dz-primary)',
  },

  /** Tone indicator (left accent bar) */
  toneIndicator: {
    width: '0.25rem',
  },

  /** Tone-specific border and action button colors */
  tones: {
    neutral: {
      border: 'var(--dz-border)',
      indicator: 'var(--dz-foreground)',
      actionBackground: 'var(--dz-foreground)',
      actionForeground: 'var(--dz-background)',
    },
    primary: {
      border: 'var(--dz-primary)',
      indicator: 'var(--dz-primary)',
      actionBackground: 'var(--dz-primary)',
      actionForeground: 'var(--dz-primary-foreground)',
      actionHover: 'var(--dz-primary-hover)',
    },
    success: {
      border: 'var(--dz-success)',
      indicator: 'var(--dz-success)',
      actionBackground: 'var(--dz-success)',
      actionForeground: 'var(--dz-success-foreground)',
    },
    warning: {
      border: 'var(--dz-warning)',
      indicator: 'var(--dz-warning)',
      actionBackground: 'var(--dz-warning)',
      actionForeground: 'var(--dz-warning-foreground)',
    },
    danger: {
      border: 'var(--dz-danger)',
      indicator: 'var(--dz-danger)',
      actionBackground: 'var(--dz-danger)',
      actionForeground: 'var(--dz-danger-foreground)',
    },
    info: {
      border: 'var(--dz-info)',
      indicator: 'var(--dz-info)',
      actionBackground: 'var(--dz-info)',
      actionForeground: 'var(--dz-info-foreground)',
    },
  },

  /** Transition timing */
  transition: 'var(--dz-duration-fast)',
} as const
