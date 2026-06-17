/**
 * DzFloatLabel — component-specific token mappings.
 *
 * DzFloatLabel consumes the `--dz-float-label-*` custom properties scoped to the
 * `.dz-float-label` selector in `styles/base.css` (ADR-17 hybrid model). This
 * file documents the tokens the label rest/float typography and color read.
 */

/** Token references used by DzFloatLabel */
export const floatLabelTokens = {
  /** Label color at rest (placeholder-like) */
  color: 'var(--dz-float-label-color)',

  /** Label color when floated (focused/filled) */
  activeColor: 'var(--dz-float-label-active-color)',

  /** Label font size at rest (matches the control's text) */
  restFontSize: 'var(--dz-float-label-rest-font-size)',

  /** Label font size when floated (the smaller caption size) */
  floatFontSize: 'var(--dz-float-label-float-font-size)',

  /** Horizontal inset aligning the label with the control's text padding */
  paddingX: 'var(--dz-float-label-padding-x)',

  /** Gap between the floated label and the control edge */
  gap: 'var(--dz-float-label-gap)',

  /** Background masking the border for the `on` (notched) variant */
  background: 'var(--dz-float-label-bg)',

  /** Float transition duration */
  duration: 'var(--dz-float-label-duration)',
} as const
