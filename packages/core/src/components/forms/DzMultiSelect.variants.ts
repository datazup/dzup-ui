/**
 * DzMultiSelect — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzMultiSelect.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const multiSelectVariants = tv({
  slots: {
    root: [
      'inline-flex items-center flex-wrap gap-[var(--dz-spacing-1)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-within-ring-input dz-disabled-input-shell',
    ].join(' '),
    input: [
      'dz-field-input-reset',
      'flex-1 min-w-[60px] border-none bg-transparent shadow-none appearance-none',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    content: [
      'overflow-hidden rounded-[var(--dz-radius-md)]',
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
    tag: [
      'inline-flex items-center gap-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-sm)]',
      'bg-[var(--dz-primary-muted)]',
      'text-[var(--dz-primary)]',
      'px-[var(--dz-spacing-1_5)]',
    ].join(' '),
    tagClose: [
      'inline-flex items-center justify-center',
      'rounded-full',
      'hover:bg-[var(--dz-primary)]/20',
      'transition-[var(--dz-transition-fast)]',
    ].join(' '),
    empty: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
      'text-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    checkIcon: 'shrink-0 text-[var(--dz-primary)]',
  },
  variants: {
    variant: {
      outline: { root: 'border border-[var(--dz-border)] focus-within:border-[var(--dz-input-border-focus)]' },
      filled: { root: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { root: 'border-b border-[var(--dz-border)] rounded-none focus-within:border-[var(--dz-input-border-focus)] focus-within:outline-none' },
    },
    size: {
      xs: {
        root: 'min-h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] py-[var(--dz-spacing-0_5)] text-[length:var(--dz-input-xs-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        tag: 'text-[length:var(--dz-text-xs)] py-0',
        icon: 'h-3 w-3',
        checkIcon: 'h-3 w-3',
      },
      sm: {
        root: 'min-h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] py-[var(--dz-spacing-0_5)] text-[length:var(--dz-input-sm-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        tag: 'text-[length:var(--dz-text-xs)] py-0.5',
        icon: 'h-3.5 w-3.5',
        checkIcon: 'h-3.5 w-3.5',
      },
      md: {
        root: 'min-h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-md-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        tag: 'text-[length:var(--dz-text-xs)] py-0.5',
        icon: 'h-4 w-4',
        checkIcon: 'h-4 w-4',
      },
      lg: {
        root: 'min-h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-lg-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        tag: 'text-[length:var(--dz-text-sm)] py-0.5',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
      },
      xl: {
        root: 'min-h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-input-xl-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
        tag: 'text-[length:var(--dz-text-sm)] py-1',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
      },
    },
    invalid: {
      true: { root: 'border-[var(--dz-danger)] focus-within:border-[var(--dz-danger)] focus-within:outline-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type MultiSelectVariantProps = VariantProps<typeof multiSelectVariants>
