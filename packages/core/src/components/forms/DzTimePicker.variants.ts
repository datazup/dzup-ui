/**
 * DzTimePicker — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * Anatomy:
 *   trigger  — the input-like button showing the value + indicator/cleaner
 *   panel    — the popover body
 *   columns  — the row of unit columns (roll layout)
 *   column   — a single scrollable unit column
 *   option   — a single selectable cell in a roll column
 *   select   — a native <select> (select layout)
 *   footer   — Cancel / Confirm action bar
 *
 * @module @dzup-ui/core/components/forms/DzTimePicker.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const timePickerVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-[var(--dz-spacing-1)]',
    trigger: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'cursor-pointer text-left',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-input dz-disabled-input-shell',
      'motion-reduce:transition-none',
    ].join(' '),
    valueText: 'flex-1 truncate text-[var(--dz-foreground)]',
    placeholder: 'flex-1 truncate text-[var(--dz-muted-foreground)]',
    cleaner: [
      'shrink-0 inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'hover:text-[var(--dz-foreground)]',
      'dz-focus-ring-control',
      'transition-colors motion-reduce:transition-none',
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    // --- Popover panel ---
    panel: [
      'flex flex-col',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'shadow-[var(--dz-shadow-lg)]',
      'overflow-hidden',
    ].join(' '),
    columns: 'flex items-stretch',
    column: [
      'flex flex-col',
      'overflow-y-auto overflow-x-hidden',
      'scroll-smooth',
      'py-[var(--dz-spacing-1)]',
      'border-r border-[var(--dz-border)] last:border-r-0',
      '[scrollbar-width:thin]',
    ].join(' '),
    option: [
      'shrink-0',
      'flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'mx-[var(--dz-spacing-1)]',
      'cursor-pointer select-none',
      'text-[var(--dz-foreground)]',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control',
      'transition-colors motion-reduce:transition-none',
      'data-[selected=true]:bg-[var(--dz-primary)]',
      'data-[selected=true]:text-[var(--dz-primary-foreground)]',
      'data-[selected=true]:hover:bg-[var(--dz-primary)]',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--dz-input-disabled-opacity)]',
      'aria-disabled:hover:bg-transparent',
    ].join(' '),
    // --- Select layout ---
    selectRow: 'flex items-center gap-[var(--dz-spacing-2)] p-[var(--dz-spacing-3)]',
    select: [
      'dz-field-input-reset',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      'text-[var(--dz-foreground)]',
      'cursor-pointer',
      'dz-focus-ring-input',
      'focus:border-[var(--dz-input-border-focus)]',
    ].join(' '),
    selectSeparator: 'text-[var(--dz-muted-foreground)]',
    // --- Footer ---
    footer: [
      'flex items-center justify-end gap-[var(--dz-spacing-2)]',
      'p-[var(--dz-spacing-2)]',
      'border-t border-[var(--dz-border)]',
    ].join(' '),
    footerButton: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-md)]',
      'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)] font-[var(--dz-font-weight-medium)]',
      'dz-focus-ring-control',
      'transition-colors motion-reduce:transition-none',
    ].join(' '),
  },
  variants: {
    variant: {
      outline: { trigger: 'border border-[var(--dz-border)] focus:border-[var(--dz-input-border-focus)] hover:border-[var(--dz-primary)]' },
      filled: { trigger: 'bg-[var(--dz-muted)] border border-transparent hover:border-[var(--dz-border)]' },
      underlined: { trigger: 'border-b border-[var(--dz-border)] rounded-none focus:border-[var(--dz-input-border-focus)]' },
    },
    size: {
      icon: '',
      xs: {
        trigger: 'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] text-[length:var(--dz-input-xs-font-size)]',
        icon: 'h-3 w-3',
        cleaner: 'h-4 w-4',
        column: 'h-40 w-12 text-[length:var(--dz-input-xs-font-size)]',
        option: 'h-7 text-[length:var(--dz-input-xs-font-size)]',
        select: 'text-[length:var(--dz-input-xs-font-size)]',
      },
      sm: {
        trigger: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        icon: 'h-3.5 w-3.5',
        cleaner: 'h-4 w-4',
        column: 'h-44 w-12 text-[length:var(--dz-input-sm-font-size)]',
        option: 'h-7 text-[length:var(--dz-input-sm-font-size)]',
        select: 'text-[length:var(--dz-input-sm-font-size)]',
      },
      md: {
        trigger: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        icon: 'h-4 w-4',
        cleaner: 'h-5 w-5',
        column: 'h-48 w-14 text-[length:var(--dz-input-md-font-size)]',
        option: 'h-8 text-[length:var(--dz-input-md-font-size)]',
        select: 'text-[length:var(--dz-input-md-font-size)]',
      },
      lg: {
        trigger: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        icon: 'h-5 w-5',
        cleaner: 'h-5 w-5',
        column: 'h-52 w-16 text-[length:var(--dz-input-lg-font-size)]',
        option: 'h-9 text-[length:var(--dz-input-lg-font-size)]',
        select: 'text-[length:var(--dz-input-lg-font-size)]',
      },
      xl: {
        trigger: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        icon: 'h-5 w-5',
        cleaner: 'h-6 w-6',
        column: 'h-56 w-16 text-[length:var(--dz-input-xl-font-size)]',
        option: 'h-10 text-[length:var(--dz-input-xl-font-size)]',
        select: 'text-[length:var(--dz-input-xl-font-size)]',
      },
    },
    invalid: {
      true: { trigger: 'border-[var(--dz-danger)] focus:border-[var(--dz-danger)]' },
    },
    confirm: {
      true: { footerButton: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] hover:bg-[var(--dz-primary-hover)]' },
      false: { footerButton: 'bg-transparent text-[var(--dz-foreground)] hover:bg-[var(--dz-muted)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TimePickerVariantProps = VariantProps<typeof timePickerVariants>
