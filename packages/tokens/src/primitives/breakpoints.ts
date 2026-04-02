/**
 * Responsive Breakpoints
 *
 * Mobile-first breakpoints for responsive design.
 * These are used by Tailwind CSS 4 and exposed as tokens for programmatic access.
 */

export const BREAKPOINTS = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} as const

export type BreakpointStep = keyof typeof BREAKPOINTS

/**
 * Generate CSS custom properties for breakpoints.
 * Output format: --dz-breakpoint-{step}: value;
 */
export function generateBreakpointCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(BREAKPOINTS)) {
    vars[`--dz-breakpoint-${step}`] = value
  }
  return vars
}
