/**
 * DzIcon — Variant definitions using tailwind-variants (tv).
 *
 * Token-only styling: sizes use spacing tokens for consistent dimensions.
 */
import { tv } from 'tailwind-variants'

export const iconVariants = tv({
  base: 'shrink-0 inline-block',
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Default stroke widths per size for optimal visual weight */
export const defaultStrokeWidth: Record<string, number> = {
  xs: 2,
  sm: 2,
  md: 2,
  lg: 1.75,
  xl: 1.5,
}
