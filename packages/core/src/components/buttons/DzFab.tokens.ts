/**
 * DzFab — Component-specific token mappings.
 *
 * DzFab reuses DzButton's color tier (tone × variant) for fills/borders and
 * adds FAB-specific sizing and elevation. The concrete custom-property values
 * live in `styles/base.css` under `.dz-fab[data-size]`; this file documents the
 * tokens the component consumes (ADR-17 hybrid model).
 */

/** Token references used by DzFab */
export const fabTokens = {
  /** Circular dimension (width === height) — overridden per data-size */
  size: 'var(--dz-fab-size)',

  /** Icon glyph dimension */
  iconSize: 'var(--dz-fab-icon-size)',

  /** Resting / hover elevation */
  shadow: 'var(--dz-fab-shadow)',
  shadowHover: 'var(--dz-fab-shadow-hover)',

  /** Viewport inset when pinned to a corner (position !== 'static') */
  offset: 'var(--dz-fab-offset)',

  /** Stack order when fixed */
  z: 'var(--dz-fab-z)',

  /** Shared with DzButton */
  transition: 'var(--dz-button-transition)',
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
} as const
