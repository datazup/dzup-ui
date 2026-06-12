/**
 * DzBackTop — tailwind-variants (tv) style definitions.
 *
 * Handles the *placement and entrance* of the affordance: fixed bottom-right
 * positioning (token-driven inset) plus a fade/slide transition gated on the
 * `visible` state. The button appearance itself (circle, elevation, color) is
 * delegated to `DzFab`. While hidden the element is non-interactive
 * (`pointer-events-none`); the component also drops it from the tab order.
 *
 * @module @dzup-ui/core/components/navigation/DzBackTop.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const backTopVariants = tv({
  base: [
    'dz-back-top',
    'fixed bottom-[var(--dz-back-top-offset)] right-[var(--dz-back-top-offset)]',
    'z-[var(--dz-back-top-z)]',
    'transition-[opacity,transform] duration-[var(--dz-back-top-transition)]',
    'motion-reduce:transition-none',
  ].join(' '),

  variants: {
    visible: {
      true: 'opacity-100 translate-y-0 pointer-events-auto',
      false: 'opacity-0 translate-y-2 pointer-events-none',
    },
  },

  defaultVariants: {
    visible: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type BackTopVariantProps = VariantProps<typeof backTopVariants>
