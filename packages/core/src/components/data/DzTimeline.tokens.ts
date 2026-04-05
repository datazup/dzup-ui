/**
 * DzTimeline -- Component-specific token mappings.
 *
 * Maps semantic design tokens to timeline components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/data/DzTimeline.tokens
 */

export const timelineTokens = {
  /** Indicator dot */
  indicator: {
    background: 'var(--dz-muted)',
    borderColor: 'var(--dz-background)',
    borderWidth: '2px',
  },
  /** Connector line */
  connector: {
    color: 'var(--dz-border)',
    width: '2px',
  },
  /** Status/timestamp text */
  status: {
    color: 'var(--dz-muted-foreground)',
  },
  /** Orientation spacing */
  orientation: {
    vertical: {
      itemGap: 'var(--dz-spacing-3)',
      itemPaddingBottom: 'var(--dz-spacing-6)',
    },
    horizontal: {
      itemGap: 'var(--dz-spacing-2)',
    },
  },
  /** Indicator size scale */
  size: {
    xs: {
      indicator: 'var(--dz-spacing-4)',
      contentFontSize: 'var(--dz-text-xs)',
      statusFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      indicator: 'var(--dz-spacing-5)',
      contentFontSize: 'var(--dz-text-sm)',
      statusFontSize: 'var(--dz-text-xs)',
    },
    md: {
      indicator: 'var(--dz-spacing-6)',
      contentFontSize: 'var(--dz-text-sm)',
      statusFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      indicator: 'var(--dz-spacing-7)',
      contentFontSize: 'var(--dz-text-base)',
      statusFontSize: 'var(--dz-text-sm)',
    },
    xl: {
      indicator: 'var(--dz-spacing-8)',
      contentFontSize: 'var(--dz-text-lg)',
      statusFontSize: 'var(--dz-text-sm)',
    },
  },
} as const
