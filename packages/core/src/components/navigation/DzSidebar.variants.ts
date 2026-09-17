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
      'border-e border-[var(--dz-sidebar-border)]',
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
    section: 'flex flex-col py-[var(--dz-spacing-2)] px-[var(--dz-sidebar-item-padding-x)]',
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
      // A LOGICAL inline-start inset, not a physical one: a navigation rail
      // sits on the edge the content reads FROM, which is the inline start.
      // `inset-s-` is the spelling Tailwind 4 generates and is byte-identical
      // in a LTR document (TASK-R5-O2).
      fixed: { root: 'fixed inset-y-0 inset-s-0 z-[var(--dz-sidebar-z-index)]' },
    },
    collapsed: {
      true: {
        root: 'w-[var(--dz-sidebar-collapsed-width)]',
        item: 'justify-center px-[var(--dz-spacing-2)]',
        section: 'px-0',
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
        root: 'fixed inset-y-0 inset-s-0 z-[var(--dz-sidebar-z-index)] w-[var(--dz-sidebar-width)] translate-x-0',
      },
    },
    mobileHidden: {
      true: {
        // The drawer hides by sliding off the edge it is pinned to. That edge is
        // now logical (`inset-s-0`), so the transform has to follow: in an RTL
        // document `-translate-x-full` would slide the rail INTO the page. The
        // `rtl:` variant rule is emitted after the base one, so it wins where it
        // applies and changes nothing in LTR (TASK-R5-O2).
        root: '-translate-x-full rtl:translate-x-full',
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
        item: 'bg-[var(--dz-sidebar-item-hover-bg)] text-[var(--dz-sidebar-foreground-hover)] border-s-[3px] border-s-[var(--dz-sidebar-item-active-bg)] !ps-[calc(var(--dz-sidebar-item-padding-x)-3px)]',
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
