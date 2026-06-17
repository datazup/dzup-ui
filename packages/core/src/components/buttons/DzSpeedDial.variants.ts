/**
 * DzSpeedDial — tailwind-variants (tv) style definitions.
 *
 * Layout/geometry (per-item transforms, stagger) is computed in the component
 * and applied via inline style; these slots cover the static chrome. The
 * staggered reveal is a pure CSS transition (`transition-[transform,opacity]`).
 *
 * @module @dzup-ui/core/components/buttons/DzSpeedDial.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const speedDialVariants = tv({
  slots: {
    /** Positioning context for the trigger + fan-out menu */
    root: 'dz-speed-dial relative inline-flex items-center justify-center',
    /** Overlay box matching the trigger; children are absolutely placed */
    menu: 'pointer-events-none absolute inset-0',
    /** Per-action wrapper — centered on the trigger, transform set inline */
    item: [
      'absolute left-1/2 top-1/2',
      'transition-[transform,opacity]',
      'duration-[var(--dz-duration-normal)]',
      'ease-[var(--dz-ease-out)]',
      'will-change-[transform,opacity]',
    ].join(' '),
    /** The circular action button (DzIconButton receives this via class) */
    action: 'rounded-full shadow-[var(--dz-shadow-md)] hover:shadow-[var(--dz-shadow-lg)]',
  },
})

/** Variant prop types extracted from the tv() definition */
export type SpeedDialVariantProps = VariantProps<typeof speedDialVariants>
