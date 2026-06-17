/**
 * DzTour -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the tour anatomy (ADR-04, ADR-17).
 * Tour-local tokens (`--dz-tour-*`) fall back to global semantic tokens so the
 * component themes correctly without requiring extra CSS registration.
 *
 * Anatomy: a full-viewport spotlight mask with a rounded cutout over the active
 * target, plus an anchored popover panel with header/body/footer and step dots.
 *
 * @module @dzup-ui/core/components/overlays/DzTour.tokens
 */

export const tourTokens = {
  /** Spotlight mask backdrop (dims everything except the cutout). */
  mask: {
    background: 'var(--dz-tour-mask, var(--dz-overlay-bg))',
    radius: 'var(--dz-tour-radius, var(--dz-radius-md))',
    /** Cutout padding around the target rect, in px. */
    padding: 8,
  },
  /** Popover panel. */
  panel: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-lg)',
    padding: 'var(--dz-spacing-4)',
  },
  /** Step title. */
  title: {
    color: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-base)',
  },
  /** Step description. */
  description: {
    color: 'var(--dz-muted-foreground)',
    fontSize: 'var(--dz-text-sm)',
  },
  /** Step indicator dots. */
  indicator: {
    active: 'var(--dz-primary)',
    inactive: 'var(--dz-muted)',
  },
} as const
