/**
 * DzColorModeToggle — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The wrapper applies the icon-swap transition to
 * descendant glyphs (gated on `prefers-reduced-motion`); the control appearance
 * itself is delegated to DzIconButton / DzSwitch / DzSegmented.
 *
 * @module @dzup-ui/core/components/navigation/DzColorModeToggle.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const colorModeToggleVariants = tv({
  slots: {
    root: [
      'dz-color-mode-toggle inline-flex items-center',
      // Animate the glyph swap on the composed control's SVG.
      '[&_svg]:transition-transform [&_svg]:duration-[var(--dz-color-mode-toggle-transition)]',
      'motion-reduce:[&_svg]:transition-none',
    ].join(' '),
    glyph: [
      'h-[var(--dz-color-mode-toggle-icon-size)] w-[var(--dz-color-mode-toggle-icon-size)]',
      'shrink-0',
    ].join(' '),
  },

  variants: {
    variant: {
      icon: '',
      switch: '',
      segmented: '',
    },
  },

  defaultVariants: {
    variant: 'icon',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ColorModeToggleVariantProps = VariantProps<typeof colorModeToggleVariants>
