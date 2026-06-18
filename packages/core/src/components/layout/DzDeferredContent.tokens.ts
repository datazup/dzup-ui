/**
 * DzDeferredContent -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-deferred-content-*` custom properties are declared on the
 * `.dz-deferred-content` root in `styles/base.css` (mapped to semantic tokens)
 * and consumed by `DzDeferredContent.variants.ts` and the default placeholder.
 * This file documents that anatomy mapping.
 */
export const deferredContentTokens = {
  /** Reserved height before the content loads — keeps the observer box stable */
  minHeight: 'var(--dz-deferred-content-min-height)',
} as const
