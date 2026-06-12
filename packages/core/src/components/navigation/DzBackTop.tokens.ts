/**
 * DzBackTop — Component-specific token mappings.
 *
 * DzBackTop reuses DzFab for the button shell (circle, elevation, tone ×
 * variant) and adds its own fixed-corner placement and fade/slide transition.
 * The concrete custom-property values live in `styles/base.css` under
 * `.dz-back-top`; this file documents the tokens the component consumes
 * (ADR-17 hybrid model).
 */

/** Token references used by DzBackTop */
export const backTopTokens = {
  /** Viewport inset from the pinned corner. */
  offset: 'var(--dz-back-top-offset)',

  /** Stack order while fixed. */
  z: 'var(--dz-back-top-z)',

  /** Fade/slide transition duration. */
  transition: 'var(--dz-back-top-transition)',
} as const
