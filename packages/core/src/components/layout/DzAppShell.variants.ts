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
    content: 'flex flex-1 flex-col min-w-0 overflow-hidden',
    header: [
      'sticky top-0 z-[var(--dz-appshell-header-z-index)]',
      'flex items-center gap-3 shrink-0',
      'h-[var(--dz-appshell-header-height)]',
      'px-[var(--dz-appshell-header-padding-x)]',
      'bg-[var(--dz-appshell-header-bg)]',
      'border-b border-[var(--dz-appshell-header-border)]',
    ].join(' '),
    main: [
      'flex-1 overflow-y-auto',
      'bg-[var(--dz-appshell-main-bg)]',
      'p-[var(--dz-appshell-main-padding)]',
    ].join(' '),
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

export type AppShellVariantProps = VariantProps<typeof appShellVariants>
