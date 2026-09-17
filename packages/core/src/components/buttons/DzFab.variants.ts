/**
 * DzFab — tailwind-variants (tv) style definitions.
 *
 * Handles the FAB *shell*: circular shape, elevation, and optional fixed
 * positioning. Color (tone × variant) is delegated to `buttonVariants` and
 * merged in the component via `cn()`, so the FAB stays consistent with the
 * button family. Sizing is driven by the `--dz-fab-*` tokens scoped to the
 * `.dz-fab[data-size]` selector (see styles/base.css), mirroring DzCalendar.
 *
 * @module @dzup-ui/core/components/buttons/DzFab.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const fabVariants = tv({
  base: [
    'dz-fab',
    'inline-flex items-center justify-center',
    'rounded-full p-0',
    'h-[var(--dz-fab-size)] w-[var(--dz-fab-size)]',
    'shadow-[var(--dz-fab-shadow)]',
    'hover:shadow-[var(--dz-fab-shadow-hover)]',
  ].join(' '),

  variants: {
    /**
     * rtl-physical-ok — the four corner values are author-named, deliberate
     * physical positions (TASK-R5-O2, closing S1-D3).
     *
     * `position="bottom-right"` is a promise about the screen, not about the
     * reading direction: an app that pins a FAB to the bottom-right corner
     * wants it there in Arabic too, and an app that wants it to follow the
     * text picks the opposite value per locale. Mirroring these would make the
     * prop name a lie. The marker is file-wide by design, and this file's ONLY
     * physical utilities are these four `position` values.
     */
    position: {
      'static': '',
      'bottom-right': 'fixed bottom-[var(--dz-fab-offset)] right-[var(--dz-fab-offset)] z-[var(--dz-fab-z)]',
      'bottom-left': 'fixed bottom-[var(--dz-fab-offset)] left-[var(--dz-fab-offset)] z-[var(--dz-fab-z)]',
      'top-right': 'fixed top-[var(--dz-fab-offset)] right-[var(--dz-fab-offset)] z-[var(--dz-fab-z)]',
      'top-left': 'fixed top-[var(--dz-fab-offset)] left-[var(--dz-fab-offset)] z-[var(--dz-fab-z)]',
    },
  },

  defaultVariants: {
    position: 'static',
  },
})

/** Variant prop types extracted from the tv() definition */
export type FabVariantProps = VariantProps<typeof fabVariants>
