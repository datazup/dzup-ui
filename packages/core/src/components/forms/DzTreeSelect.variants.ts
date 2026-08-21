/**
 * DzTreeSelect — tailwind-variants (tv) style definitions.
 *
 * The `trigger` slot mirrors DzSelect's trigger 1:1 (same `--dz-input-*`
 * token family) so a DzTreeSelect is visually indistinguishable from a
 * DzSelect. Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzTreeSelect.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const treeSelectVariants = tv({
  slots: {
    trigger: [
      'inline-flex items-center justify-between gap-[var(--dz-spacing-2)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-input dz-disabled-input-shell',
      'cursor-pointer',
    ].join(' '),
    value: 'flex flex-1 min-w-0 flex-wrap items-center gap-[var(--dz-spacing-1)] text-start',
    placeholder: 'truncate text-[var(--dz-muted-foreground)]',
    singleValue: 'truncate',
    chip: [
      'inline-flex items-center gap-[var(--dz-spacing-1)]',
      'rounded-[var(--dz-radius-sm)]',
      'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]',
      'px-[var(--dz-spacing-1_5)] py-[var(--dz-spacing-0-5)]',
      'text-[length:var(--dz-text-xs)]',
      'max-w-full',
    ].join(' '),
    chipLabel: 'truncate',
    chipClose: [
      'inline-flex shrink-0 items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-primary)]',
      'hover:bg-[var(--dz-primary)]/10',
      'dz-focus-ring-control',
    ].join(' '),
    icon: 'shrink-0 text-[var(--dz-muted-foreground)]',
    panel: [
      'z-[60] overflow-y-auto',
      'rounded-[var(--dz-radius-md)]',
      'min-w-[var(--reka-popover-trigger-width)]',
      'max-h-[min(var(--reka-popover-content-available-height),20rem)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-lg)]',
      'p-[var(--dz-spacing-1)]',
    ].join(' '),
    searchWrapper: 'sticky top-0 z-10 mb-[var(--dz-spacing-1)] bg-[var(--dz-surface)] p-[var(--dz-spacing-1)]',
    searchInput: [
      'dz-field-input-reset',
      'w-full',
      'appearance-none border-none shadow-none',
      'bg-transparent',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'border-b border-[var(--dz-border)]',
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)]',
      'text-[length:var(--dz-text-sm)]',
    ].join(' '),
    checkbox: [
      'inline-flex shrink-0 items-center justify-center',
      'h-4 w-4',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'text-[var(--dz-primary-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'data-[state=checked]:bg-[var(--dz-primary)] data-[state=checked]:border-[var(--dz-primary)]',
      'data-[state=indeterminate]:bg-[var(--dz-primary)] data-[state=indeterminate]:border-[var(--dz-primary)]',
    ].join(' '),
    checkIcon: 'h-3 w-3',
    nodeLabel: 'truncate',
    empty: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)] text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
  },
  variants: {
    variant: {
      outline: { trigger: 'border border-[var(--dz-border)] focus-visible:border-[var(--dz-input-border-focus)]' },
      filled: { trigger: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { trigger: 'border-b border-[var(--dz-border)] rounded-none focus-visible:border-[var(--dz-input-border-focus)] focus-visible:outline-none' },
    },
    size: {
      icon: { trigger: '', icon: '' },
      xs: {
        trigger: 'min-h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] py-[var(--dz-spacing-0-5)] text-[length:var(--dz-input-xs-font-size)]',
        icon: 'h-3 w-3',
      },
      sm: {
        trigger: 'min-h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] py-[var(--dz-spacing-0-5)] text-[length:var(--dz-input-sm-font-size)]',
        icon: 'h-3.5 w-3.5',
      },
      md: {
        trigger: 'min-h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-md-font-size)]',
        icon: 'h-4 w-4',
      },
      lg: {
        trigger: 'min-h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-lg-font-size)]',
        icon: 'h-5 w-5',
      },
      xl: {
        trigger: 'min-h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-input-xl-font-size)]',
        icon: 'h-5 w-5',
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
export type TreeSelectVariantProps = VariantProps<typeof treeSelectVariants>
