/**
 * Transition / Animation Tokens
 *
 * Duration and easing curves for consistent motion.
 */

/** Duration scale */
export const DURATIONS = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const

/** Easing curves */
export const EASINGS = {
  'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
} as const

export type DurationStep = keyof typeof DURATIONS
export type EasingStep = keyof typeof EASINGS

/**
 * Generate CSS custom properties for transitions.
 */
export function generateTransitionCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [name, value] of Object.entries(DURATIONS)) {
    vars[`--dz-duration-${name}`] = value
  }

  for (const [name, value] of Object.entries(EASINGS)) {
    vars[`--dz-ease-${name}`] = value
  }

  return vars
}
