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
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:cursor-not-allowed disabled:opacity-[var(--dz-button-disabled-opacity)]',
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
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)]',
      'data-[selected]:bg-[var(--dz-primary)] data-[selected]:text-[var(--dz-primary-foreground)]',
      'data-[highlighted]:bg-[var(--dz-primary-muted)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
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
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    field: [
      'inline-flex items-center gap-[var(--dz-spacing-0.5)]',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    fieldInput: [
      'rounded-[var(--dz-radius-sm)]',
      'px-[var(--dz-spacing-0.5)]',
      'text-center',
      'outline-none',
      'focus:bg-[var(--dz-primary-muted)]',
      'data-[placeholder]:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    separator: 'text-[var(--dz-muted-foreground)] mx-[var(--dz-spacing-2)]',
  },
  variants: {
    variant: {
      outline: { trigger: 'border border-[var(--dz-border)]' },
      filled: { trigger: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { trigger: 'border-b border-[var(--dz-border)] rounded-none' },
    },
    size: {
      xs: {
        trigger: 'h-[var(--dz-button-xs-height)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
        cellTrigger: 'h-6 w-6 text-[length:var(--dz-text-xs)]',
        heading: 'text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3',
        fieldInput: 'text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'h-[var(--dz-button-sm-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        cellTrigger: 'h-7 w-7 text-[length:var(--dz-text-xs)]',
        heading: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5',
        fieldInput: 'text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'h-[var(--dz-button-md-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        cellTrigger: 'h-8 w-8 text-[length:var(--dz-text-sm)]',
        heading: 'text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4',
        fieldInput: 'text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'h-[var(--dz-button-lg-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-base)]',
        cellTrigger: 'h-9 w-9 text-[length:var(--dz-text-base)]',
        heading: 'text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5',
        fieldInput: 'text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'h-[var(--dz-button-xl-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
        cellTrigger: 'h-10 w-10 text-[length:var(--dz-text-lg)]',
        heading: 'text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5',
        fieldInput: 'text-[length:var(--dz-text-lg)]',
      },
    },
    invalid: {
      true: { trigger: 'border-[var(--dz-danger)] focus-visible:ring-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type DateRangePickerVariantProps = VariantProps<typeof dateRangePickerVariants>
