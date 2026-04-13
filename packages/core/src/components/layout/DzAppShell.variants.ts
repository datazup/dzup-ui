/**
 * DzAppShell -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzAppShell.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const appShellVariants = tv({
  slots: {
    root: 'relative flex h-screen w-full overflow-hidden',
    header: 'sticky top-0 z-30 flex h-16 items-center border-b px-4',
    main: 'flex-1 overflow-y-auto',
    content: 'flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out ml-[var(--dz-appshell-sidebar-width,0px)]',
  },
  variants: {
    hasSidebar: {
      true: {},
      false: {},
    },
    hasHeader: {
      true: {},
      false: {
        content: 'h-screen',
      },
    },
  },
  defaultVariants: {
    hasSidebar: true,
    hasHeader: true,
  },
})

/** Variant prop types extracted from the tv() definition */
export type AppShellVariantProps = VariantProps<typeof appShellVariants>
