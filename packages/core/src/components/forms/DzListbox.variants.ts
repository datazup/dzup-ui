/**
 * DzListbox — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). `--dz-listbox-*`
 * indirections fall back to global semantic tokens.
 *
 * @module @dzup-ui/core/components/forms/DzListbox.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const listboxVariants = tv({
  slots: {
    root: [
      'flex w-full flex-col overflow-hidden',
      'rounded-[var(--dz-listbox-radius,var(--dz-radius-md))]',
      'border border-[var(--dz-listbox-border,var(--dz-border))]',
      'bg-[var(--dz-listbox-bg,var(--dz-background))]',
      'text-[var(--dz-listbox-fg,var(--dz-foreground))]',
      'transition-[var(--dz-transition-fast)]',
      'dz-disabled-input-shell',
    ].join(' '),
    filterWrapper: [
      'shrink-0 border-b border-[var(--dz-border)]',
      'p-[var(--dz-spacing-1_5)]',
    ].join(' '),
    filter: [
      'dz-field-input-reset',
      'w-full rounded-[var(--dz-radius-sm)] border border-[var(--dz-border)]',
      'bg-[var(--dz-background)] px-[var(--dz-spacing-2)]',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:border-[var(--dz-input-border-focus)]',
    ].join(' '),
    viewport: [
      'flex-1 overflow-y-auto overflow-x-hidden outline-none',
      'p-[var(--dz-spacing-1)]',
    ].join(' '),
    group: 'py-[var(--dz-spacing-0_5)]',
    groupLabel: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-xs)] font-[var(--dz-font-medium)]',
      'uppercase tracking-wide text-[var(--dz-muted-foreground)]',
    ].join(' '),
    option: [
      'relative flex cursor-pointer select-none items-center gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-foreground)]',
      'outline-none',
      'transition-[var(--dz-transition-fast)]',
      'data-[highlighted]:bg-[var(--dz-listbox-item-active-bg,var(--dz-muted))]',
      'focus-visible:ring-2 focus-visible:ring-[var(--dz-listbox-active-ring,var(--dz-ring))]',
      'data-[state=checked]:bg-[var(--dz-listbox-item-selected-bg,var(--dz-primary-muted))]',
      'data-[state=checked]:text-[var(--dz-listbox-item-selected-fg,var(--dz-primary))]',
      'dz-disabled-control',
    ].join(' '),
    optionIcon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    optionLabel: 'flex-1 truncate',
    checkIcon: 'shrink-0 text-[var(--dz-primary)]',
    empty: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-6)]',
      'text-center text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      icon: {},
      xs: {
        filter: 'h-[var(--dz-input-xs-height)] text-[length:var(--dz-input-xs-font-size)]',
        option: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        optionIcon: 'h-3.5 w-3.5',
        checkIcon: 'h-3.5 w-3.5',
      },
      sm: {
        filter: 'h-[var(--dz-input-sm-height)] text-[length:var(--dz-input-sm-font-size)]',
        option: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        optionIcon: 'h-4 w-4',
        checkIcon: 'h-4 w-4',
      },
      md: {
        filter: 'h-[var(--dz-input-md-height)] text-[length:var(--dz-input-md-font-size)]',
        option: 'px-[var(--dz-spacing-2_5)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        optionIcon: 'h-4 w-4',
        checkIcon: 'h-4 w-4',
      },
      lg: {
        filter: 'h-[var(--dz-input-lg-height)] text-[length:var(--dz-input-lg-font-size)]',
        option: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        optionIcon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
      },
      xl: {
        filter: 'h-[var(--dz-input-xl-height)] text-[length:var(--dz-input-xl-font-size)]',
        option: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-text-lg)]',
        optionIcon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
      },
    },
    invalid: {
      true: {
        root: 'border-[var(--dz-danger)]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ListboxVariantProps = VariantProps<typeof listboxVariants>
