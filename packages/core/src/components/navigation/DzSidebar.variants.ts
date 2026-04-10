/**
 * DzSidebar -- tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzSidebar.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const sidebarVariants = tv({
  slots: {
    root: [
      'fixed inset-y-0 left-0 z-40',
      'flex flex-col',
      'border-r border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[width] duration-300 ease-in-out',
    ].join(' '),
    item: [
      'flex items-center gap-[var(--dz-spacing-3)]',
      'rounded-[var(--dz-radius-md)]',
      'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)] font-medium',
      'transition-[var(--dz-transition-fast)]',
      'cursor-pointer',
      'hover:bg-[var(--dz-muted)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
    ].join(' '),
    section: 'flex flex-col py-[var(--dz-spacing-2)]',
    sectionTitle: [
      'px-[var(--dz-spacing-3)]',
      'text-[length:var(--dz-text-xs)] font-semibold uppercase',
      'tracking-wider',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    header: [
      'flex items-center',
      'border-b border-[var(--dz-border)]',
      'p-[var(--dz-spacing-4)]',
    ].join(' '),
    footer: [
      'mt-auto flex items-center',
      'border-t border-[var(--dz-border)]',
      'p-[var(--dz-spacing-4)]',
    ].join(' '),
    overlay: [
      'fixed inset-0 z-30',
      'bg-black/50',
      'transition-opacity',
      'lg:hidden',
    ].join(' '),
  },

  variants: {
    collapsed: {
      true: {
        root: 'w-16',
        item: 'justify-center px-[var(--dz-spacing-2)]',
        sectionTitle: 'sr-only',
        header: 'justify-center',
        footer: 'justify-center',
      },
      false: {
        root: 'w-64',
      },
    },
    mobile: {
      true: {
        root: 'w-64',
      },
    },
  },

  defaultVariants: {
    collapsed: false,
    mobile: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type SidebarVariantProps = VariantProps<typeof sidebarVariants>
