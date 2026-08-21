/**
 * DzCascader — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * Anatomy:
 *   root       — outer wrapper (flex column: trigger + error)
 *   trigger    — the input-like button showing the selected path
 *   valueText  — selected-path text
 *   placeholder— empty-state text
 *   cleaner    — clear button
 *   icon       — chevron-down indicator
 *   panel      — popover body
 *   search     — filter input wrapper
 *   searchInput— filter <input>
 *   columns    — the row of sliding option columns
 *   column     — a single scrollable level column
 *   option     — a single selectable cell
 *   optionArrow— chevron shown on nodes that have children
 *   flatList   — flat search-result list (filter mode)
 *   flatItem   — a single full-path result
 *   empty      — "no results" copy
 *
 * @module @dzup-ui/core/components/forms/DzCascader.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const cascaderVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-[var(--dz-spacing-1)] w-full',
    trigger: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'cursor-pointer text-start',
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
    search: 'p-[var(--dz-spacing-2)] border-b border-[var(--dz-border)]',
    searchInput: [
      'dz-field-input-reset',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)] text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'dz-focus-ring-input focus:border-[var(--dz-input-border-focus)]',
    ].join(' '),
    columns: 'flex items-stretch outline-none',
    column: [
      'flex flex-col shrink-0',
      'overflow-y-auto overflow-x-hidden',
      'py-[var(--dz-spacing-1)]',
      'border-e border-[var(--dz-border)] last:border-e-0',
      '[scrollbar-width:thin]',
      'list-none m-0',
    ].join(' '),
    option: [
      'w-full',
      'inline-flex items-center justify-between gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-sm)]',
      'mx-[var(--dz-spacing-1)]',
      'cursor-pointer select-none text-start',
      'text-[var(--dz-foreground)]',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control',
      'transition-colors motion-reduce:transition-none',
      'data-[selected=true]:bg-[var(--dz-primary-muted)]',
      'data-[selected=true]:text-[var(--dz-primary)]',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--dz-input-disabled-opacity)]',
      'aria-disabled:hover:bg-transparent',
    ].join(' '),
    optionLabel: 'flex-1 truncate',
    optionArrow: 'shrink-0 text-[var(--dz-muted-foreground)]',
    // --- Flat filter results ---
    flatList: 'flex flex-col overflow-y-auto py-[var(--dz-spacing-1)] [scrollbar-width:thin] list-none m-0',
    flatItem: [
      'w-full text-start',
      'rounded-[var(--dz-radius-sm)]',
      'mx-[var(--dz-spacing-1)]',
      'cursor-pointer select-none',
      'text-[var(--dz-foreground)]',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-control',
      'transition-colors motion-reduce:transition-none',
      'disabled:cursor-not-allowed disabled:opacity-[var(--dz-input-disabled-opacity)]',
      'disabled:hover:bg-transparent',
    ].join(' '),
    empty: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
      'text-center text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
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
        column: 'h-48 w-36 text-[length:var(--dz-input-xs-font-size)]',
        option: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-xs-font-size)]',
        optionArrow: 'h-3 w-3',
        flatItem: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        icon: 'h-3.5 w-3.5',
        cleaner: 'h-4 w-4',
        column: 'h-52 w-40 text-[length:var(--dz-input-sm-font-size)]',
        option: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        optionArrow: 'h-3.5 w-3.5',
        flatItem: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        icon: 'h-4 w-4',
        cleaner: 'h-5 w-5',
        column: 'h-56 w-44 text-[length:var(--dz-input-md-font-size)]',
        option: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        optionArrow: 'h-4 w-4',
        flatItem: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        icon: 'h-5 w-5',
        cleaner: 'h-5 w-5',
        column: 'h-60 w-48 text-[length:var(--dz-input-lg-font-size)]',
        option: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        optionArrow: 'h-5 w-5',
        flatItem: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        icon: 'h-5 w-5',
        cleaner: 'h-6 w-6',
        column: 'h-64 w-52 text-[length:var(--dz-input-xl-font-size)]',
        option: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
        optionArrow: 'h-5 w-5',
        flatItem: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
      },
    },
    invalid: {
      true: { trigger: 'border-[var(--dz-danger)] focus:border-[var(--dz-danger)]' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CascaderVariantProps = VariantProps<typeof cascaderVariants>
