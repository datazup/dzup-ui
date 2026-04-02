/**
 * DzIconButton — Component-specific token mappings.
 *
 * DzIconButton reuses DzButton's token tier for most styling.
 * This file documents the subset it consumes plus icon-button-specific values.
 */

/** Token references used by DzIconButton */
export const iconButtonTokens = {
  /** Inherits all base button tokens */
  fontWeight: 'var(--dz-button-font-weight)',
  fontFamily: 'var(--dz-button-font-family)',
  transition: 'var(--dz-button-transition)',

  /** Focus ring configuration (shared with DzButton) */
  focus: {
    ringWidth: 'var(--dz-button-focus-ring-width)',
    ringColor: 'var(--dz-button-focus-ring-color)',
    ringOffset: 'var(--dz-button-focus-ring-offset)',
  },

  /** Opacity applied to the disabled state */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',

  /** Shadow applied to the solid variant */
  shadow: 'var(--dz-shadow-xs)',

  /** Square dimensions per size (width === height, no horizontal padding) */
  size: {
    xs: { dimension: 'var(--dz-button-xs-height)' },
    sm: { dimension: 'var(--dz-button-sm-height)' },
    md: { dimension: 'var(--dz-button-md-height)' },
    lg: { dimension: 'var(--dz-button-lg-height)' },
    xl: { dimension: 'var(--dz-button-xl-height)' },
  },

  /** Border radius per size range (shared with DzButton) */
  radius: {
    sm: 'var(--dz-radius-sm)',
    md: 'var(--dz-button-radius)',
    lg: 'var(--dz-radius-lg)',
  },
} as const
