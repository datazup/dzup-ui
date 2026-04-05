/**
 * DzEmpty -- Component-specific token mappings.
 *
 * Maps semantic design tokens to empty-state placeholder components (ADR-04).
 * Empty is a multi-slot component (root, icon, title, description, actions).
 *
 * @module @dzip-ui/core/components/feedback/DzEmpty.tokens
 */

export const emptyTokens = {
  /** Root container spacing */
  root: {
    paddingY: 'var(--dz-spacing-12)',
    paddingX: 'var(--dz-spacing-4)',
  },

  /** Icon area */
  icon: {
    marginBottom: 'var(--dz-spacing-4)',
    color: 'var(--dz-muted-foreground)',
  },

  /** Title text */
  title: {
    fontSize: 'var(--dz-text-lg)',
    color: 'var(--dz-foreground)',
    marginBottom: 'var(--dz-spacing-1)',
  },

  /** Description text */
  description: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
  },

  /** Actions area */
  actions: {
    marginTop: 'var(--dz-spacing-6)',
    gap: 'var(--dz-spacing-2)',
  },
} as const
