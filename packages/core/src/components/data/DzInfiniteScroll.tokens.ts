/**
 * DzInfiniteScroll -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-infinite-scroll-*` custom properties are declared on the
 * `.dz-infinite-scroll` root in `styles/base.css` (mapped to semantic tokens)
 * and consumed by `DzInfiniteScroll.variants.ts`. This file documents that
 * anatomy mapping.
 */
export const infiniteScrollTokens = {
  /** Sentinel — the zero-content observation target */
  sentinel: {
    /** Reserved height so the trigger box has substance to observe */
    size: 'var(--dz-infinite-scroll-sentinel-size)',
  },
  /** Status row — loading / end / error messaging */
  status: {
    gap: 'var(--dz-infinite-scroll-status-gap)',
    paddingY: 'var(--dz-infinite-scroll-status-padding-y)',
    foreground: 'var(--dz-muted-foreground)',
    errorForeground: 'var(--dz-danger)',
  },
} as const
