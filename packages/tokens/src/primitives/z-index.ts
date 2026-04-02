/**
 * Z-Index Layer Scale
 *
 * Organized layers for predictable stacking order.
 */

export const Z_INDEX_SCALE = {
  'base': '0',
  'dropdown': '1000',
  'sticky': '1020',
  'fixed': '1030',
  'modal-backdrop': '1040',
  'modal': '1050',
  'popover': '1060',
  'tooltip': '1070',
  'toast': '1080',
} as const

export type ZIndexStep = keyof typeof Z_INDEX_SCALE

/**
 * Generate CSS custom properties for z-index layers.
 * Output format: --dz-z-{layer}: value;
 */
export function generateZIndexCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(Z_INDEX_SCALE)) {
    vars[`--dz-z-${step}`] = value
  }
  return vars
}
