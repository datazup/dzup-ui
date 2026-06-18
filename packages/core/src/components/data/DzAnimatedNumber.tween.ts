/**
 * DzAnimatedNumber — pure tween helpers.
 *
 * Framework-free maths for the count-up animation: named easing curves (mirrors
 * the `--dz-ease-*` tokens from `@dzup-ui/tokens`), linear interpolation, a pure
 * per-frame sampler, and an `Intl.NumberFormat` wrapper. Kept side-effect free so
 * the animation logic can be unit-tested without a DOM or `requestAnimationFrame`.
 *
 * @module @dzup-ui/core/components/data/DzAnimatedNumber.tween
 */

/**
 * Named easing curves. Each (except `linear`) maps to a `cubic-bezier` whose
 * control points mirror the `EASINGS` scale in `@dzup-ui/tokens`
 * (`--dz-ease-in`, `--dz-ease-out`, `--dz-ease-in-out`, `--dz-ease-bounce`), so
 * the JS tween follows the same motion language as CSS transitions.
 */
export type AnimatedNumberEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce'

/** cubic-bezier control points per easing, mirroring `@dzup-ui/tokens` EASINGS. */
const BEZIER_POINTS: Record<Exclude<AnimatedNumberEasing, 'linear'>, readonly [number, number, number, number]> = {
  'ease-in': [0.4, 0, 1, 1],
  'ease-out': [0, 0, 0.2, 1],
  'ease-in-out': [0.4, 0, 0.2, 1],
  'bounce': [0.68, -0.55, 0.27, 1.55],
}

/** Clamp a value into the inclusive `[min, max]` range. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Build a `cubic-bezier(p1x, p1y, p2x, p2y)` easing function.
 *
 * Solves x(t) = progress via Newton-Raphson (with a bisection fallback) then
 * samples y. Control points with y outside `[0, 1]` (e.g. `bounce`) intentionally
 * overshoot.
 */
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): (t: number) => number {
  const cx = 3 * p1x
  const bx = 3 * (p2x - p1x) - cx
  const ax = 1 - cx - bx
  const cy = 3 * p1y
  const by = 3 * (p2y - p1y) - cy
  const ay = 1 - cy - by

  const sampleX = (t: number): number => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number): number => ((ay * t + by) * t + cy) * t
  const sampleDerivX = (t: number): number => (3 * ax * t + 2 * bx) * t + cx

  function solveX(x: number): number {
    // Newton-Raphson — fast convergence for monotonic-x curves.
    let t = x
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x
      if (Math.abs(dx) < 1e-6)
        return t
      const d = sampleDerivX(t)
      if (Math.abs(d) < 1e-6)
        break
      t -= dx / d
    }
    // Bisection fallback for the few non-converging cases.
    let lo = 0
    let hi = 1
    t = x
    while (lo < hi) {
      const dx = sampleX(t)
      if (Math.abs(dx - x) < 1e-6)
        return t
      if (x > dx)
        lo = t
      else
        hi = t
      t = (lo + hi) / 2
    }
    return t
  }

  return (t: number): number => {
    if (t <= 0)
      return 0
    if (t >= 1)
      return 1
    return sampleY(solveX(t))
  }
}

/** Resolve a named easing into a `(t: 0..1) => eased` function. */
export function createEasing(easing: AnimatedNumberEasing = 'ease-out'): (t: number) => number {
  if (easing === 'linear')
    return clamp
  const [p1x, p1y, p2x, p2y] = BEZIER_POINTS[easing]
  return cubicBezier(p1x, p1y, p2x, p2y)
}

/** Linear interpolation between `from` and `to` at `progress` (0..1). */
export function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

/** Result of sampling a tween at a point in time. */
export interface TweenSample {
  /** Interpolated, eased value at this frame. */
  value: number
  /** Linear (un-eased) progress, 0..1. */
  progress: number
  /** Whether the tween has reached its target. */
  done: boolean
}

/** Inputs to {@link sampleTween}. */
export interface TweenOptions {
  /** Start value. */
  from: number
  /** Target value. */
  to: number
  /** Milliseconds elapsed since the tween began. */
  elapsed: number
  /** Total tween duration in milliseconds. */
  duration: number
  /** Easing curve (defaults to `ease-out`). */
  easing?: AnimatedNumberEasing
}

/**
 * Pure per-frame sampler. Given the elapsed time, returns the eased value and
 * whether the tween is complete. A non-positive duration snaps to `to`.
 */
export function sampleTween({ from, to, elapsed, duration, easing }: TweenOptions): TweenSample {
  if (duration <= 0 || elapsed >= duration)
    return { value: to, progress: 1, done: true }
  const progress = clamp(elapsed / duration)
  const eased = createEasing(easing)(progress)
  return { value: interpolate(from, to, eased), progress, done: false }
}

/**
 * Format a number via `Intl.NumberFormat`, falling back to `String(value)` if
 * the runtime rejects the locale/options. Pure — callers that animate should
 * cache a formatter instead of calling this per frame.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string | string[],
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  }
  catch {
    return String(value)
  }
}
