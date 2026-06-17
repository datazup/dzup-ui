/**
 * DzCalendar — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Cell sizing, today
 * ring, selected fill, range fill, and outside-month muting are driven by the
 * `--dz-calendar-*` custom properties declared on `.dz-calendar` in base.css.
 *
 * @module @dzup-ui/core/components/data/DzCalendar.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const calendarVariants = tv({
  slots: {
    root: [
      'dz-calendar',
      'inline-flex flex-col',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)]',
      'text-[var(--dz-foreground)]',
      'p-[var(--dz-spacing-3)]',
      'select-none',
    ].join(' '),
    header: 'flex items-center justify-between gap-[var(--dz-spacing-2)] pb-[var(--dz-spacing-2)]',
    heading: 'font-medium text-[var(--dz-calendar-header-foreground)]',
    nav: 'flex items-center gap-[var(--dz-spacing-1)]',
    navButton: [
      'inline-flex items-center justify-center',
      'h-7 w-7 shrink-0',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'hover:bg-[var(--dz-muted)] hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-button dz-disabled-button',
    ].join(' '),
    todayButton: [
      'inline-flex items-center justify-center',
      'h-7 px-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-sm)]',
      'text-[length:var(--dz-text-xs)] font-medium',
      'text-[var(--dz-muted-foreground)]',
      'hover:bg-[var(--dz-muted)] hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-button dz-disabled-button',
    ].join(' '),
    grid: 'flex flex-col',
    weekdayRow: 'grid grid-cols-7',
    weekday: [
      'inline-flex items-center justify-center',
      'h-7',
      'text-[length:var(--dz-text-xs)] font-medium',
      'text-[var(--dz-calendar-weekday-foreground)]',
    ].join(' '),
    week: 'grid grid-cols-7',
    cell: 'inline-flex items-center justify-center p-[1px]',
    dayButton: [
      'inline-flex flex-col items-center justify-center',
      'h-[var(--dz-calendar-cell-size)] w-[var(--dz-calendar-cell-size)]',
      'rounded-[var(--dz-calendar-cell-radius)]',
      'text-[var(--dz-calendar-cell-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'hover:bg-[var(--dz-calendar-cell-hover-bg)]',
      'dz-focus-ring-control',
      'data-[in-range]:bg-[var(--dz-calendar-range-bg)] data-[in-range]:rounded-none',
      'data-[today]:ring-2 data-[today]:ring-inset data-[today]:ring-[var(--dz-calendar-today-ring)]',
      'data-[selected]:bg-[var(--dz-calendar-selected-bg)] data-[selected]:text-[var(--dz-calendar-selected-foreground)] data-[selected]:hover:bg-[var(--dz-calendar-selected-bg)]',
      'data-[outside-month]:text-[var(--dz-calendar-outside-foreground)] data-[outside-month]:opacity-[var(--dz-calendar-outside-opacity)]',
      'data-[disabled]:opacity-[var(--dz-calendar-disabled-opacity)] data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
    ].join(' '),
  },
  variants: {
    size: {
      icon: { dayButton: '', heading: '' },
      xs: { dayButton: 'text-[length:var(--dz-text-xs)]', heading: 'text-[length:var(--dz-text-xs)]' },
      sm: { dayButton: 'text-[length:var(--dz-text-xs)]', heading: 'text-[length:var(--dz-text-sm)]' },
      md: { dayButton: 'text-[length:var(--dz-text-sm)]', heading: 'text-[length:var(--dz-text-sm)]' },
      lg: { dayButton: 'text-[length:var(--dz-text-base)]', heading: 'text-[length:var(--dz-text-base)]' },
      xl: { dayButton: 'text-[length:var(--dz-text-lg)]', heading: 'text-[length:var(--dz-text-lg)]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CalendarVariantProps = VariantProps<typeof calendarVariants>
