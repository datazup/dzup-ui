/**
 * DzCountdown -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-countdown-*` custom properties are declared on the `.dz-countdown`
 * root in `styles/base.css` (mapped to semantic tokens) and consumed by
 * `DzCountdown.variants.ts`. This file documents that anatomy mapping. Per-size
 * font sizing and per-tone colour live in the tv() variants.
 */
export const countdownTokens = {
  /** Root layout — gap between value segments / slotted children */
  root: {
    gap: 'var(--dz-countdown-gap)',
  },
  /** Value — the ticking figure */
  value: {
    fontWeight: 'var(--dz-countdown-font-weight)',
    /** Letter spacing; tabular-nums keeps digit width stable as it ticks */
    tracking: 'var(--dz-countdown-tracking)',
    foreground: 'var(--dz-foreground)',
  },
} as const
