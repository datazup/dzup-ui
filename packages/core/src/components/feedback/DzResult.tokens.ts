/**
 * DzResult -- Component-specific token mappings.
 *
 * Maps semantic design tokens to result/outcome display components (ADR-04).
 * Result is a multi-slot component (root, icon, title, description, actions).
 *
 * @module @dzip-ui/core/components/feedback/DzResult.tokens
 */

export const resultTokens = {
  /** Root container spacing */
  root: {
    paddingY: 'var(--dz-spacing-12)',
    paddingX: 'var(--dz-spacing-4)',
  },

  /** Icon area */
  icon: {
    marginBottom: 'var(--dz-spacing-4)',
  },

  /** Title text */
  title: {
    fontSize: 'var(--dz-text-xl)',
    color: 'var(--dz-foreground)',
    marginBottom: 'var(--dz-spacing-2)',
  },

  /** Description text */
  description: {
    fontSize: 'var(--dz-text-base)',
    color: 'var(--dz-muted-foreground)',
  },

  /** Actions area */
  actions: {
    marginTop: 'var(--dz-spacing-8)',
    gap: 'var(--dz-spacing-3)',
  },

  /** Status-specific icon colors */
  status: {
    success: 'var(--dz-success)',
    error: 'var(--dz-danger)',
    warning: 'var(--dz-warning)',
    info: 'var(--dz-info)',
  },
} as const
