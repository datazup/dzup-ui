/**
 * DzScrollProgress — Component-specific token mappings.
 *
 * The indicator's thickness, track color, stacking order, and circular sizing
 * are driven by `--dz-scroll-progress-*` custom properties. Concrete values live
 * in `styles/base.css` under `.dz-scroll-progress`; this file documents the
 * tokens the component consumes (ADR-17 hybrid model). Tone fill colors map to
 * the shared semantic palette and are applied in `.variants.ts`.
 */

/** Token references used by DzScrollProgress */
export const scrollProgressTokens = {
  /** Bar thickness (height). Overridable per-instance via the `thickness` prop. */
  height: 'var(--dz-scroll-progress-height)',

  /** Rail color behind the fill (transparent by default). */
  track: 'var(--dz-scroll-progress-track)',

  /** Stack order while fixed to the viewport edge. */
  z: 'var(--dz-scroll-progress-z)',

  /** Diameter of the circular variant's ring. */
  circularSize: 'var(--dz-scroll-progress-size)',

  /** Viewport inset for the circular variant's corner placement. */
  inset: 'var(--dz-scroll-progress-inset)',
} as const
