/**
 * DzMegaMenu — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Panel + column spacing is driven by the
 * `--dz-menu-*` custom properties declared on `.dz-mega-menu` in base.css.
 *
 * @module @dzup-ui/core/components/navigation/DzMegaMenu.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const megaMenuVariants = tv({
  slots: {
    root: [
      'dz-mega-menu',
      'relative',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    /** Menubar list of top-level triggers */
    menubar: [
      'flex items-center',
      'gap-[var(--dz-menu-bar-gap)]',
      'list-none m-0 p-0',
    ].join(' '),
    /** Wrapper around a trigger + its panel (positioning context) */
    itemWrapper: 'relative',
    /** Top-level trigger (button or anchor) */
    trigger: [
      'inline-flex items-center',
      'gap-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-md)]',
      'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)] font-[var(--dz-font-medium)]',
      'text-[var(--dz-foreground)]',
      'cursor-pointer select-none',
      'transition-colors',
      'outline-none',
      'hover:bg-[var(--dz-muted)]',
      'data-[open]:bg-[var(--dz-muted)]',
      'dz-focus-ring-control dz-disabled-control',
    ].join(' '),
    /** Caret icon inside a trigger */
    caret: 'transition-transform data-[open]:rotate-180',
    /** Dropdown panel surface */
    panel: [
      'absolute z-[var(--dz-z-dropdown)]',
      'mt-[var(--dz-menu-panel-offset)]',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)]',
      'shadow-[var(--dz-shadow-lg)]',
      'p-[var(--dz-menu-panel-padding)]',
    ].join(' '),
    /** Grid of columns inside a panel */
    columns: [
      'grid',
      'gap-[var(--dz-menu-column-gap)]',
    ].join(' '),
    /** A single column / group */
    column: [
      'flex flex-col',
      'gap-[var(--dz-spacing-1)]',
      'min-w-[var(--dz-menu-column-min-width)]',
    ].join(' '),
    /** Column heading */
    columnHeading: [
      'px-[var(--dz-spacing-2)] pb-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-xs)] font-[var(--dz-font-semibold)]',
      'uppercase tracking-wide',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    /** A panel link */
    link: [
      'flex flex-col',
      'rounded-[var(--dz-radius-md)]',
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'no-underline cursor-pointer',
      'transition-colors',
      'outline-none',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control dz-disabled-control',
    ].join(' '),
    /** Secondary description line inside a link */
    linkDescription: [
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    // ── Collapsed (stacked accordion) layout ──
    /** Stacked list of disclosure rows */
    stack: 'flex flex-col gap-[var(--dz-spacing-1)] list-none m-0 p-0',
    /** Disclosure region holding the columns of a collapsed item */
    disclosure: [
      'flex flex-col gap-[var(--dz-spacing-3)]',
      'pl-[var(--dz-spacing-3)] pt-[var(--dz-spacing-2)]',
    ].join(' '),
  },

  variants: {
    orientation: {
      horizontal: { menubar: 'flex-row' },
      vertical: { menubar: 'flex-col items-stretch' },
    },
    size: {
      icon: {},
      xs: { trigger: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]' },
      sm: { trigger: 'px-[var(--dz-spacing-2_5)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]' },
      md: {},
      lg: { trigger: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-text-base)]' },
      xl: { trigger: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-lg)]' },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type MegaMenuVariantProps = VariantProps<typeof megaMenuVariants>
