/**
 * DzDateRangePicker — tailwind-variants (tv) style definitions.
 *
 * Reuses the same slot structure as DzDatePicker with range-specific additions.
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzDateRangePicker.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const dateRangePickerVariants = tv({
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
      'overflow-hidden rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-md)]',
      'p-[var(--dz-spacing-3)]',
    ].join(' '),
    calendar: 'w-full',
    grid: 'w-full border-collapse',
    headCell: [
      'text-[var(--dz-muted-foreground)]',
      'text-[length:var(--dz-text-xs)]',
      'font-medium',
      'pb-[var(--dz-spacing-1)]',
    ].join(' '),
    cell: 'text-center p-0',
    cellTrigger: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control dz-disabled-control',
      'data-[selected]:bg-[var(--dz-primary)] data-[selected]:text-[var(--dz-primary-foreground)]',
      'data-[highlighted]:bg-[var(--dz-primary-muted)]',
      'data-[today]:font-bold',
      'data-[outside-month]:text-[var(--dz-muted-foreground)] data-[outside-month]:opacity-50',
    ].join(' '),
    header: 'flex items-center justify-between pb-[var(--dz-spacing-2)]',
    heading: 'text-[var(--dz-foreground)] font-medium',
    navButton: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'h-7 w-7',
      'text-[var(--dz-muted-foreground)]',
      'hover:bg-[var(--dz-muted)] hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-button',
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    field: [
      'inline-flex items-center gap-[var(--dz-spacing-0_5)]',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    fieldInput: [
      'dz-field-input-reset',
      'rounded-[var(--dz-radius-sm)]',
      'border-none bg-transparent shadow-none appearance-none',
      'px-[var(--dz-spacing-0_5)]',
      'text-center',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'focus:bg-[var(--dz-primary-muted)]',
      'data-[placeholder]:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    separator: 'text-[var(--dz-muted-foreground)] mx-[var(--dz-spacing-2)]',
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
        cellTrigger: 'h-6 w-6 text-[length:var(--dz-text-xs)]',
        heading: 'text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3',
        fieldInput: 'text-[length:var(--dz-input-xs-font-size)]',
      },
      sm: {
        trigger: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        cellTrigger: 'h-7 w-7 text-[length:var(--dz-text-xs)]',
        heading: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5',
        fieldInput: 'text-[length:var(--dz-input-sm-font-size)]',
      },
      md: {
        trigger: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        cellTrigger: 'h-8 w-8 text-[length:var(--dz-text-sm)]',
        heading: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4',
        fieldInput: 'text-[length:var(--dz-input-md-font-size)]',
      },
      lg: {
        trigger: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        cellTrigger: 'h-9 w-9 text-[length:var(--dz-text-base)]',
        heading: 'text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5',
        fieldInput: 'text-[length:var(--dz-input-lg-font-size)]',
      },
      xl: {
        trigger: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        cellTrigger: 'h-10 w-10 text-[length:var(--dz-text-lg)]',
        heading: 'text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5',
        fieldInput: 'text-[length:var(--dz-input-xl-font-size)]',
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
export type DateRangePickerVariantProps = VariantProps<typeof dateRangePickerVariants>
