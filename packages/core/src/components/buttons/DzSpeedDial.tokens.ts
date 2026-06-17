/**
 * DzSpeedDial — Component-specific token mappings.
 *
 * The trigger reuses DzFab's tokens. The fan-out geometry (spacing between
 * actions, arc radius, stagger delay) is computed in the component from numeric
 * inputs, so only a few shared visual tokens are documented here (ADR-17).
 */

/** Token references used by DzSpeedDial */
export const speedDialTokens = {
  /** Action elevation (resting / hover) */
  actionShadow: 'var(--dz-shadow-md)',
  actionShadowHover: 'var(--dz-shadow-lg)',

  /** Reveal transition timing for the staggered fan-out */
  transitionDuration: 'var(--dz-duration-normal)',
  transitionEase: 'var(--dz-ease-out)',
} as const

/** Pixel gap inserted between fanned-out actions, by trigger size. */
export const SPEED_DIAL_ACTION_PX: Record<string, number> = {
  xs: 32,
  sm: 36,
  md: 40,
  lg: 44,
  xl: 48,
}

/** Gap (px) between adjacent actions in linear layout. */
export const SPEED_DIAL_GAP_PX = 12

/** Per-item reveal stagger (ms). */
export const SPEED_DIAL_STAGGER_MS = 40
