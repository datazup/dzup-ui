/**
 * DzInplace — component-specific token mappings.
 *
 * DzInplace consumes the `--dz-inplace-*` custom properties scoped to the
 * `.dz-inplace` selector in `styles/base.css` (ADR-17 hybrid model). This file
 * documents the tokens the display affordance and editor wrapper read.
 */

/** Token references used by DzInplace */
export const inplaceTokens = {
  /** Gap between display content and the optional hover hint glyph */
  gap: 'var(--dz-inplace-gap)',

  /** Display trigger padding */
  paddingX: 'var(--dz-inplace-padding-x)',
  paddingY: 'var(--dz-inplace-padding-y)',

  /** Display trigger corner radius */
  radius: 'var(--dz-inplace-radius)',

  /** Hover affordance background hint on the display trigger */
  hoverBg: 'var(--dz-inplace-hover-bg)',

  /** Focus ring color */
  ring: 'var(--dz-inplace-ring)',

  /** Muted color for the "click to edit" hint glyph */
  hintColor: 'var(--dz-inplace-hint-color)',

  /** Opacity applied when disabled */
  disabledOpacity: 'var(--dz-inplace-disabled-opacity)',
} as const
