/**
 * Typography Tokens
 *
 * Font families, sizes, weights, line heights, and letter spacing.
 */

/** Font families */
export const FONT_FAMILIES = {
  sans: '\'Inter\', ui-sans-serif, system-ui, -apple-system, sans-serif',
  mono: '\'JetBrains Mono\', ui-monospace, \'Cascadia Code\', monospace',
} as const

/** Font sizes */
export const FONT_SIZES = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
} as const

/** Line heights */
export const LINE_HEIGHTS = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

/** Font weights */
export const FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

/** Letter spacing */
export const LETTER_SPACINGS = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

/**
 * Generate CSS custom properties for typography.
 */
export function generateTypographyCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}

  // Font families
  for (const [name, value] of Object.entries(FONT_FAMILIES)) {
    vars[`--dz-font-${name}`] = value
  }

  // Font sizes
  for (const [name, value] of Object.entries(FONT_SIZES)) {
    vars[`--dz-text-${name}`] = value
  }

  // Line heights
  for (const [name, value] of Object.entries(LINE_HEIGHTS)) {
    vars[`--dz-leading-${name}`] = value
  }

  // Font weights
  for (const [name, value] of Object.entries(FONT_WEIGHTS)) {
    vars[`--dz-font-${name}`] = value
  }

  // Letter spacing
  for (const [name, value] of Object.entries(LETTER_SPACINGS)) {
    vars[`--dz-tracking-${name}`] = value
  }

  return vars
}
