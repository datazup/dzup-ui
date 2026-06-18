/**
 * DzColorModeToggle — Component-specific token mappings.
 *
 * The toggle reuses DzIconButton / DzSwitch / DzSegmented for the control shell,
 * and adds only the glyph sizing and the icon-swap transition on top. The
 * concrete custom-property values live in `styles/base.css` under
 * `.dz-color-mode-toggle`; this file documents the tokens the component
 * consumes (ADR-17 hybrid model).
 */

/** Token references used by DzColorModeToggle */
export const colorModeToggleTokens = {
  /** Glyph dimension for the inline sun/moon/monitor icons. */
  iconSize: 'var(--dz-color-mode-toggle-icon-size)',

  /** Duration of the icon-swap (rotate/fade) transition. */
  transition: 'var(--dz-color-mode-toggle-transition)',
} as const
