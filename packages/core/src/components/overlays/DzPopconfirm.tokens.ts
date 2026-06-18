/**
 * DzPopconfirm -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the popconfirm anatomy (ADR-04, ADR-17).
 * Popconfirm-local tokens (`--dz-popconfirm-*`) fall back to global semantic
 * tokens so the component themes correctly without extra CSS registration.
 *
 * Anatomy: an anchored panel containing an optional leading icon, a title, an
 * optional description, and a confirm/cancel action row.
 *
 * @module @dzup-ui/core/components/overlays/DzPopconfirm.tokens
 */

export const popconfirmTokens = {
  /** Anchored popover panel. */
  panel: {
    background: 'var(--dz-popconfirm-bg, var(--dz-background))',
    foreground: 'var(--dz-popconfirm-fg, var(--dz-foreground))',
    border: 'var(--dz-popconfirm-border, var(--dz-border))',
    radius: 'var(--dz-popconfirm-radius, var(--dz-radius-lg))',
    shadow: 'var(--dz-popconfirm-shadow, var(--dz-shadow-lg))',
    padding: 'var(--dz-popconfirm-padding, var(--dz-spacing-4))',
    width: 'var(--dz-popconfirm-width, 16rem)',
  },
  /** Leading icon. */
  icon: {
    color: 'var(--dz-popconfirm-icon-color, var(--dz-warning))',
    size: 'var(--dz-popconfirm-icon-size, var(--dz-spacing-5))',
  },
  /** Title heading. */
  title: {
    color: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
  },
  /** Supporting description. */
  description: {
    color: 'var(--dz-muted-foreground)',
    fontSize: 'var(--dz-text-sm)',
  },
  /** Offset distance (px) between the trigger and the panel. */
  offset: 8,
} as const
