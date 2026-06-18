/**
 * DzDeferredContent — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). The reserved
 * pre-load height is driven by the `--dz-deferred-content-*` custom properties
 * declared on `.dz-deferred-content` in base.css.
 *
 * @module @dzup-ui/core/components/layout/DzDeferredContent.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const deferredContentVariants = tv({
  slots: {
    // The observed wrapper. While unloaded it reserves a minimum height so the
    // observation box has substance and below-the-fold content does not jump.
    root: 'dz-deferred-content block',
    // Default placeholder fills the reserved space.
    placeholder: 'dz-deferred-content-placeholder block w-full',
  },
  variants: {
    loaded: {
      true: { root: '' },
      false: { root: 'min-h-[var(--dz-deferred-content-min-height)]' },
    },
  },
  defaultVariants: {
    loaded: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type DeferredContentVariantProps = VariantProps<typeof deferredContentVariants>
