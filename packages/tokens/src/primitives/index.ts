/**
 * Primitive Token Exports
 *
 * Raw design values: colors, spacing, typography, radius, shadows, transitions, z-index, breakpoints.
 */

export {
  BREAKPOINTS,
  type BreakpointStep,
  generateBreakpointCssVars,
} from './breakpoints.js'

export {
  type ColorPalette,
  formatOklch,
  generateColorCssVars,
  type OklchColor,
  PALETTE_CONFIGS,
  type PaletteName,
  palettes,
  type Shade,
  SHADE_STEPS,
} from './colors.js'

export {
  generateRadiusCssVars,
  RADIUS_SCALE,
  type RadiusStep,
} from './radius.js'

export {
  generateShadowCssVars,
  generateShadowDarkCssVars,
  SHADOW_SCALE,
  SHADOW_SCALE_DARK,
  type ShadowStep,
} from './shadows.js'

export {
  generateSpacingCssVars,
  SPACING_SCALE,
  type SpacingStep,
} from './spacing.js'

export {
  DURATIONS,
  type DurationStep,
  EASINGS,
  type EasingStep,
  generateTransitionCssVars,
} from './transitions.js'

export {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  generateTypographyCssVars,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
} from './typography.js'

export {
  generateZIndexCssVars,
  Z_INDEX_SCALE,
  type ZIndexStep,
} from './z-index.js'
