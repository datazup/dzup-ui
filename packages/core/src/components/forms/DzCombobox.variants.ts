/**
 * DzCombobox — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzCombobox.variants
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
      'dz-focus-within-ring-input dz-disabled-input-shell',
    ].join(' '),
    input: [
      'dz-field-input-reset',
      'flex-1 w-full border-none bg-transparent shadow-none appearance-none',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
    ].join(' '),
    content: [
      'z-[60] overflow-hidden rounded-[var(--dz-radius-md)]',
      'w-[var(--reka-combobox-trigger-width)]',
      'max-h-[var(--reka-combobox-content-available-height)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-surface)]',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-lg)]',
    ].join(' '),
    viewport: 'p-[var(--dz-spacing-1)]',
    item: [
      'relative flex cursor-pointer items-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-foreground)]',
      'outline-none',
      'transition-[var(--dz-transition-fast)]',
      'data-[highlighted]:bg-[var(--dz-muted)]',
      'data-[state=checked]:bg-[var(--dz-primary-muted)] data-[state=checked]:text-[var(--dz-primary-muted-foreground)]',
      'dz-disabled-control',
    ].join(' '),
    empty: [
      'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-4)]',
      'text-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum).
     * The chevron and clear affordances are BUTTONS sized from the glyph they
     * hold, so at `md` the pointer target measured 16x16 on chromium, firefox
     * and webkit alike. `dz-target-min-tight` grows the button's own box to the
     * 24px floor and gives the growth straight back to the layout through a
     * negative margin, so the field's metrics do not move by a pixel; the glyph
     * is sized from `--dz-control-visual-size`, which each size sets below, so
     * the icon does not grow with its target.
     */
    icon: 'dz-target-min-tight shrink-0 inline-flex items-center justify-center text-[var(--dz-muted-foreground)]',
    checkIcon: 'shrink-0 text-[var(--dz-primary)]',
    clearButton: [
      'dz-target-min-tight inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
    ].join(' '),
  },
  variants: {
    variant: {
      outline: { root: 'border border-[var(--dz-border)] focus-within:border-[var(--dz-input-border-focus)]' },
      filled: { root: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { root: 'border-b border-[var(--dz-border)] rounded-none focus-within:border-[var(--dz-input-border-focus)] focus-within:outline-none' },
    },
    size: {
      icon: { root: '', item: '', icon: '', checkIcon: '', clearButton: '' },
      xs: {
        root: 'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] text-[length:var(--dz-input-xs-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
        icon: 'h-3 w-3 [--dz-control-visual-size:0.75rem]',
        checkIcon: 'h-3 w-3',
        clearButton: 'h-3 w-3 [--dz-control-visual-size:0.75rem]',
      },
      sm: {
        root: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]',
        checkIcon: 'h-3.5 w-3.5',
        clearButton: 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]',
      },
      md: {
        root: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
        icon: 'h-4 w-4 [--dz-control-visual-size:1rem]',
        checkIcon: 'h-4 w-4',
        clearButton: 'h-4 w-4 [--dz-control-visual-size:1rem]',
      },
      lg: {
        root: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-base)]',
        icon: 'h-5 w-5 [--dz-control-visual-size:1.25rem]',
        checkIcon: 'h-5 w-5',
        clearButton: 'h-5 w-5 [--dz-control-visual-size:1.25rem]',
      },
      xl: {
        root: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-lg)]',
        icon: 'h-5 w-5 [--dz-control-visual-size:1.25rem]',
        checkIcon: 'h-5 w-5',
        clearButton: 'h-5 w-5 [--dz-control-visual-size:1.25rem]',
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
export type ComboboxVariantProps = VariantProps<typeof comboboxVariants>
