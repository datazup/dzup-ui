/**
 * @dzip-ui/tokens
 *
 * Single source of truth for all design tokens in the dzip-ui component library.
 *
 * Tokens are consumed via CSS custom properties using `var()`.
 * No `getToken()` or `getCssVar()` API exists — use CSS `var()` directly (ADR-09).
 *
 * ## Usage
 *
 * ```ts
 * // Import the generated CSS (typically in your app entry or Tailwind config)
 * import '@dzip-ui/tokens/css'
 *
 * // Import Tailwind theme extension
 * import { dzTokens } from '@dzip-ui/tokens/tailwind'
 *
 * // Import the FOUC-prevention script for SSR
 * import { themeScript } from '@dzip-ui/tokens/utils'
 *
 * // Import token type definitions
 * import type { DesignToken, ThemeMode } from '@dzip-ui/tokens'
 * ```
 */

// Re-export component tokens
export { BUTTON_TOKENS } from './component/index.js'

export { INPUT_TOKENS } from './component/index.js'

export { CARD_TOKENS } from './component/index.js'

export { BADGE_TOKENS } from './component/index.js'

export { DIALOG_TOKENS } from './component/index.js'

// Re-export primitives
export {
  type ColorPalette,
  formatOklch,
  type OklchColor,
  PALETTE_CONFIGS,
  type PaletteName,
  palettes,
  type Shade,
  SHADE_STEPS,
} from './primitives/index.js'

export {
  SPACING_SCALE,
  type SpacingStep,
} from './primitives/index.js'

export {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
} from './primitives/index.js'

export {
  RADIUS_SCALE,
  type RadiusStep,
} from './primitives/index.js'
export {
  SHADOW_SCALE,
  SHADOW_SCALE_DARK,
  type ShadowStep,
} from './primitives/index.js'

export {
  DURATIONS,
  type DurationStep,
  EASINGS,
  type EasingStep,
} from './primitives/index.js'
export {
  Z_INDEX_SCALE,
  type ZIndexStep,
} from './primitives/index.js'
export {
  BREAKPOINTS,
  type BreakpointStep,
} from './primitives/index.js'
// Re-export semantic
export { LIGHT_SEMANTIC_TOKENS } from './semantic/index.js'
export { DARK_SEMANTIC_TOKENS } from './semantic/index.js'

// Token type definitions (will also be available from dist/tokens.d.ts once generated)
/** Theme mode preference */
export type ThemeMode = 'light' | 'dark' | 'system'

/** Resolved theme (no 'system') */
export type ResolvedTheme = 'light' | 'dark'
