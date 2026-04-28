/**
 * DzSelect — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzSelect.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const selectVariants = tv({
  slots: {
    trigger: [
      'inline-flex items-center justify-between gap-[var(--dz-spacing-2)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-input dz-disabled-input-shell',
      'data-[placeholder]:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    content: [
      'z-[51] overflow-hidden rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-md)]',
    ].join(' '),
    viewport: 'p-[var(--dz-spacing-1)]',
    item: [
      'relative flex cursor-pointer items-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-foreground)]',
      'outline-none',
      'transition-[var(--dz-transition-fast)]',
      'data-[highlighted]:bg-[var(--dz-muted)]',
      'data-[state=checked]:bg-[var(--dz-primary-muted)] data-[state=checked]:text-[var(--dz-primary)]',
      'dz-disabled-control',
    ].join(' '),
    itemText: '',
    searchInput: [
      'dz-field-input-reset',
      'w-full',
      'border-none shadow-none appearance-none',
      'bg-transparent',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'border-b border-[var(--dz-border)]',
    ].join(' '),
    searchWrapper: 'sticky top-0 z-10 bg-[var(--dz-background)] p-[var(--dz-spacing-1)]',
    noResults: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)] text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    checkIcon: 'shrink-0 text-[var(--dz-primary)]',
  },
  variants: {
    variant: {
      outline: { trigger: 'border border-[var(--dz-border)] focus-visible:border-[var(--dz-input-border-focus)]' },
      filled: { trigger: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { trigger: 'border-b border-[var(--dz-border)] rounded-none focus-visible:border-[var(--dz-input-border-focus)] focus-visible:outline-none' },
    },
    size: {
      xs: {
        trigger: 'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] text-[length:var(--dz-input-xs-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3',
        checkIcon: 'h-3 w-3',
        searchInput: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5',
        checkIcon: 'h-3.5 w-3.5',
        searchInput: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4',
        checkIcon: 'h-4 w-4',
        searchInput: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
        searchInput: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
        searchInput: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
      },
    },
    invalid: {
      true: { trigger: 'border-[var(--dz-danger)] focus-visible:border-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type SelectVariantProps = VariantProps<typeof selectVariants>
