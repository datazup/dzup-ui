/**
 * enterStyle — typed builder for the parametric enter/leave custom properties
 * (docs/animations.md §3.2 — Task N0).
 *
 * Returns an inline-style object that sets the `--dz-enter-*` custom props read
 * by the `dz-enter` / `dz-leave` keyframes in `tokens.css`, so a demo can drive
 * an entrance without hardcoding raw transform/opacity values:
 *
 * ```vue
 * <div :style="enterStyle({ y: 12, opacity: 0 })" class="dz-animate-in dz-fade-in" />
 * ```
 *
 * Only the props you pass are emitted, so partial vectors compose with the
 * orthogonal `.dz-fade-in` / `.dz-slide-in-from-*` utilities (each just sets one
 * of the same custom props). Numeric `x`/`y` are treated as pixels and `rotate`
 * as degrees; pass a string (e.g. `'2rem'`, `'0.25turn'`) to use another unit.
 * `scale` and `opacity` are unitless.
 */

/** The `--dz-enter-*` custom properties the keyframes interpolate. */
export type EnterCustomProperty
  = | '--dz-enter-opacity'
    | '--dz-enter-scale'
    | '--dz-enter-x'
    | '--dz-enter-y'
    | '--dz-enter-rotate'

/** A partial map of the enter custom props to their CSS string values. */
export type EnterStyle = Partial<Record<EnterCustomProperty, string>>

/** Options for {@link enterStyle}; every field is optional and independent. */
export interface EnterStyleOptions {
  /** Start opacity (unitless, 0–1). `0` for a fade-in. */
  opacity?: number
  /** Start scale (unitless). `0.95` for a subtle zoom-in. */
  scale?: number
  /** Start X translate. Number → px; string → used verbatim. */
  x?: number | string
  /** Start Y translate. Number → px; string → used verbatim. */
  y?: number | string
  /** Start rotation. Number → deg; string → used verbatim. */
  rotate?: number | string
}

/** Number → `${n}${unit}`; string → passed through unchanged. */
function withUnit(value: number | string, unit: string): string {
  return typeof value === 'number' ? `${value}${unit}` : value
}

/**
 * Build the inline-style object of `--dz-enter-*` custom props from a start
 * vector. e.g. `enterStyle({ y: 12, opacity: 0 })` →
 * `{ '--dz-enter-y': '12px', '--dz-enter-opacity': '0' }`.
 */
export function enterStyle(opts: EnterStyleOptions = {}): EnterStyle {
  const style: EnterStyle = {}

  if (opts.opacity !== undefined)
    style['--dz-enter-opacity'] = String(opts.opacity)
  if (opts.scale !== undefined)
    style['--dz-enter-scale'] = String(opts.scale)
  if (opts.x !== undefined)
    style['--dz-enter-x'] = withUnit(opts.x, 'px')
  if (opts.y !== undefined)
    style['--dz-enter-y'] = withUnit(opts.y, 'px')
  if (opts.rotate !== undefined)
    style['--dz-enter-rotate'] = withUnit(opts.rotate, 'deg')

  return style
}
