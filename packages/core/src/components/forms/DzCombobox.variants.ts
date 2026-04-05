/**
 * DzCombobox — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/forms/DzCombobox.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const comboboxVariants = tv({
  slots: {
    root: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-within:outline-none focus-within:ring-[length:2px] focus-within:ring-[var(--dz-primary)] focus-within:ring-offset-[length:2px]',
      'disabled:cursor-not-allowed disabled:opacity-[var(--dz-button-disabled-opacity)]',
    ].join(' '),
    input: [
      'flex-1 bg-transparent outline-none',
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
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ].join(' '),
    empty: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
      'text-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    checkIcon: 'shrink-0 text-[var(--dz-primary)]',
    clearButton: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
    ].join(' '),
  },
  variants: {
    variant: {
      outline: { root: 'border border-[var(--dz-border)]' },
      filled: { root: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { root: 'border-b border-[var(--dz-border)] rounded-none' },
    },
    size: {
      xs: {
        root: 'h-[var(--dz-button-xs-height)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3',
        checkIcon: 'h-3 w-3',
        clearButton: 'h-3 w-3',
      },
      sm: {
        root: 'h-[var(--dz-button-sm-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5',
        checkIcon: 'h-3.5 w-3.5',
        clearButton: 'h-3.5 w-3.5',
      },
      md: {
        root: 'h-[var(--dz-button-md-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4',
        checkIcon: 'h-4 w-4',
        clearButton: 'h-4 w-4',
      },
      lg: {
        root: 'h-[var(--dz-button-lg-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-base)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
        clearButton: 'h-5 w-5',
      },
      xl: {
        root: 'h-[var(--dz-button-xl-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5',
        checkIcon: 'h-5 w-5',
        clearButton: 'h-5 w-5',
      },
    },
    invalid: {
      true: { root: 'border-[var(--dz-danger)] focus-within:ring-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ComboboxVariantProps = VariantProps<typeof comboboxVariants>
