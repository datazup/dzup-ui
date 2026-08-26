/**
 * The showcase "rise" mapping (docs/landing-v2.md TASK-LV2-04), kept as a pure
 * function so the interpolation is unit-testable without layout: scroll
 * progress in → CSS transform out.
 *
 * The section starts tilted back in 3D (`rotateX`), slightly sunk and scaled
 * down, and reaches **exact identity** over the first `RISE_COMPLETE_AT` of its
 * viewport entry — by the time the dashboard is fully in view the wrapper
 * reports `'none'`, so every interaction with the live components below happens
 * against an untransformed plane (hit-testing, focus rings and text rendering
 * are all at rest). Reduced motion is identity always.
 */

/** Backward tilt at progress 0, in degrees. */
export const RISE_ROTATE_X = 10
/** Sink at progress 0, in px. */
export const RISE_TRANSLATE_Y = 24
/** Scale at progress 0. */
export const RISE_SCALE_FROM = 0.96
/** Fraction of the element's viewport entry over which the rise completes. */
export const RISE_COMPLETE_AT = 0.6

/**
 * Map `useScrollProgress` output (0→1 across the element's whole viewport
 * transit) to the rise transform. Returns the literal `'none'` at rest so
 * callers can also drop `will-change` when the stage is done.
 */
export function riseTransform(progress: number, reduced: boolean): string {
  if (reduced)
    return 'none'
  const clamped = Math.min(1, Math.max(0, progress))
  const t = Math.min(1, clamped / RISE_COMPLETE_AT)
  if (t >= 1)
    return 'none'
  const ease = 1 - (1 - t) ** 3 // cubic ease-out — fast start, gentle landing
  const rotate = RISE_ROTATE_X * (1 - ease)
  const translate = RISE_TRANSLATE_Y * (1 - ease)
  const scale = RISE_SCALE_FROM + (1 - RISE_SCALE_FROM) * ease
  return `rotateX(${rotate.toFixed(2)}deg) translateY(${translate.toFixed(1)}px) scale(${scale.toFixed(3)})`
}
