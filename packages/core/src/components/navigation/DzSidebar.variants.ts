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
      'flex flex-col overflow-hidden shrink-0',
      'border-r border-[var(--dz-sidebar-border)]',
      'bg-[var(--dz-sidebar-bg)]',
      'text-[var(--dz-sidebar-foreground)]',
      'transition-[width,transform] duration-300 ease-in-out',
    ].join(' '),
    body: 'flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0',
    item: [
      'flex items-center gap-[var(--dz-spacing-3)]',
      'rounded-[var(--dz-sidebar-item-radius)]',
      'px-[var(--dz-sidebar-item-padding-x)] py-[var(--dz-sidebar-item-padding-y)]',
      'text-[length:var(--dz-text-sm)] font-medium',
      'transition-colors duration-150',
      'cursor-pointer',
      'text-[var(--dz-sidebar-foreground)]',
      'hover:bg-[var(--dz-sidebar-item-hover-bg)] hover:text-[var(--dz-sidebar-item-hover-text)]',
      'dz-focus-ring-control',
    ].join(' '),
    section: 'flex flex-col py-[var(--dz-spacing-2)]',
    sectionTitle: [
      'px-[var(--dz-sidebar-item-padding-x)]',
      'text-[length:var(--dz-text-xs)] font-semibold uppercase tracking-wider',
      'text-[var(--dz-sidebar-heading)]',
    ].join(' '),
    header: [
      'flex items-center',
      'border-b border-[var(--dz-sidebar-border)]',
      'bg-[var(--dz-sidebar-header-bg)]',
      'p-[var(--dz-spacing-4)]',
    ].join(' '),
    footer: [
      'mt-auto flex items-center',
      'border-t border-[var(--dz-sidebar-border)]',
      'bg-[var(--dz-sidebar-footer-bg)]',
      'p-[var(--dz-spacing-3)]',
    ].join(' '),
    overlay: [
      'fixed inset-0 z-30',
      'bg-[var(--dz-sidebar-overlay-bg)]',
      'transition-opacity',
      'lg:hidden',
    ].join(' '),
  },

  variants: {
    position: {
      static: { root: 'relative' },
      fixed: { root: 'fixed inset-y-0 left-0 z-[var(--dz-sidebar-z-index)]' },
    },
    collapsed: {
      true: {
        root: 'w-[var(--dz-sidebar-collapsed-width)]',
        item: 'justify-center px-[var(--dz-spacing-2)]',
        sectionTitle: 'sr-only',
        header: 'justify-center',
        footer: 'justify-center',
      },
      false: {
        root: 'w-[var(--dz-sidebar-width)]',
      },
    },
    mobile: {
      true: {
        root: 'fixed inset-y-0 left-0 z-[var(--dz-sidebar-z-index)] w-[var(--dz-sidebar-width)] translate-x-0',
      },
    },
    mobileHidden: {
      true: {
        root: '-translate-x-full',
      },
    },
    active: {
      true: {},
      false: {},
    },
    activeStyle: {
      filled: {},
      rail: {},
    },
  },

  compoundVariants: [
    {
      active: true,
      activeStyle: 'filled',
      class: {
        item: 'bg-[var(--dz-sidebar-item-active-bg)] text-[var(--dz-sidebar-item-active-text)] hover:bg-[var(--dz-sidebar-item-active-bg)] hover:text-[var(--dz-sidebar-item-active-text)]',
      },
    },
    {
      active: true,
      activeStyle: 'rail',
      class: {
        item: 'bg-[var(--dz-sidebar-item-hover-bg)] text-[var(--dz-sidebar-foreground-hover)] border-l-[3px] border-l-[var(--dz-sidebar-item-active-bg)] !pl-[calc(var(--dz-sidebar-item-padding-x)-3px)]',
      },
    },
  ],

  defaultVariants: {
    position: 'static',
    collapsed: false,
    mobile: false,
    active: false,
    activeStyle: 'filled',
  },
})

/** Variant prop types extracted from the tv() definition */
export type SidebarVariantProps = VariantProps<typeof sidebarVariants>
