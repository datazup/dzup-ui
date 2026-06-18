/**
 * DzAnimatedNumber -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-animated-number-*` custom properties are declared on the
 * `.dz-animated-number` root in `styles/base.css` (mapped to semantic tokens)
 * and consumed by `DzAnimatedNumber.variants.ts`. This file documents that
 * anatomy mapping. Per-size font sizing and per-tone colour live in the tv()
 * variants; the default tween easing mirrors the `--dz-ease-out` token (see
 * `DzAnimatedNumber.tween.ts`).
 */
export const animatedNumberTokens = {
  /** Root layout — gap between the figure and its prefix/suffix affixes */
  root: {
    gap: 'var(--dz-animated-number-gap)',
  },
  /** Value — the counting figure */
  value: {
    fontWeight: 'var(--dz-animated-number-font-weight)',
    /** Letter spacing; tabular-nums keeps digit width stable as it counts */
    tracking: 'var(--dz-animated-number-tracking)',
    foreground: 'var(--dz-foreground)',
  },
  /** Prefix / suffix affixes — secondary to the figure */
  affix: {
    foreground: 'var(--dz-muted-foreground)',
  },
} as const
