/**
 * DzStepper -- Component-specific token mappings.
 *
 * Maps semantic design tokens to step indicator and connector styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzStepper.tokens
 */

export const stepperTokens = {
  /** Step indicator circle */
  indicator: {
    fontSize: 'var(--dz-text-sm)',
    fontWeight: 'var(--dz-font-medium)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Connector line between steps */
  connector: {
    transition: 'var(--dz-transition-fast)',
  },
  /** Title text */
  title: {
    fontSize: 'var(--dz-text-sm)',
    fontWeight: 'var(--dz-font-medium)',
  },
  /** Description text */
  description: {
    fontSize: 'var(--dz-text-xs)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Spacing for horizontal orientation */
  horizontal: {
    stepGap: 'var(--dz-spacing-2)',
    connectorMarginX: 'var(--dz-spacing-2)',
  },
  /** Spacing for vertical orientation */
  vertical: {
    stepGap: 'var(--dz-spacing-3)',
    connectorMinHeight: 'var(--dz-spacing-6)',
    connectorMarginY: 'var(--dz-spacing-1)',
  },
  /** Status-specific colors */
  status: {
    completed: {
      indicatorBackground: 'var(--dz-primary)',
      indicatorColor: 'var(--dz-primary-foreground)',
      connectorColor: 'var(--dz-primary)',
      titleColor: 'var(--dz-foreground)',
    },
    active: {
      indicatorBorder: 'var(--dz-primary)',
      indicatorColor: 'var(--dz-primary)',
      connectorColor: 'var(--dz-border)',
      titleColor: 'var(--dz-primary)',
    },
    upcoming: {
      indicatorBorder: 'var(--dz-border)',
      indicatorColor: 'var(--dz-muted-foreground)',
      connectorColor: 'var(--dz-border)',
      titleColor: 'var(--dz-muted-foreground)',
    },
  },
} as const
