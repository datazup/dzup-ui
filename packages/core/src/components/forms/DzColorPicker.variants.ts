/**
 * DzColorPicker — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzColorPicker.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const colorPickerVariants = tv({
  slots: {
    root: [
      'inline-flex flex-col',
      'gap-[var(--dz-spacing-1)]',
    ].join(' '),
    trigger: [
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'cursor-pointer',
      'transition-colors',
      'hover:border-[var(--dz-primary)]',
      'dz-focus-ring-input dz-disabled-input-shell',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    swatch: [
      'shrink-0 rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
    ].join(' '),
    valueText: [
      'text-[var(--dz-foreground)]',
      'font-mono',
    ].join(' '),
    panel: [
      'flex flex-col',
      'gap-[var(--dz-spacing-3)]',
      'p-[var(--dz-spacing-3)]',
    ].join(' '),
    colorArea: [
      'relative w-full',
      'rounded-[var(--dz-radius-md)]',
      'cursor-crosshair',
      'overflow-hidden',
    ].join(' '),
    hueSlider: [
      'w-full',
      'rounded-full',
      'cursor-pointer',
      'appearance-none',
    ].join(' '),
    presetGrid: [
      'flex flex-wrap',
      'gap-[var(--dz-spacing-1)]',
    ].join(' '),
    presetSwatch: [
      'cursor-pointer',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'transition-transform',
      'hover:scale-110',
      'dz-focus-ring-control',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    input: [
      'dz-field-input-reset',
      'flex-1',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-transparent',
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'font-mono',
      'dz-focus-ring-input dz-disabled-input',
      'focus:border-[var(--dz-input-border-focus)]',
    ].join(' '),
  },
  variants: {
    size: {
      xs: {
        trigger: 'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] text-[length:var(--dz-input-xs-font-size)]',
        swatch: 'h-4 w-4',
        presetSwatch: 'h-4 w-4',
      },
      sm: {
        trigger: 'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] text-[length:var(--dz-input-sm-font-size)]',
        swatch: 'h-5 w-5',
        presetSwatch: 'h-5 w-5',
      },
      md: {
        trigger: 'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] text-[length:var(--dz-input-md-font-size)]',
        swatch: 'h-6 w-6',
        presetSwatch: 'h-6 w-6',
      },
      lg: {
        trigger: 'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] text-[length:var(--dz-input-lg-font-size)]',
        swatch: 'h-7 w-7',
        presetSwatch: 'h-7 w-7',
      },
      xl: {
        trigger: 'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] text-[length:var(--dz-input-xl-font-size)]',
        swatch: 'h-8 w-8',
        presetSwatch: 'h-8 w-8',
      },
    },
    invalid: {
      true: {
        trigger: 'border-[var(--dz-danger)]',
      },
    },
    disabled: {
      true: {
        root: 'dz-disabled-input-shell',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type ColorPickerVariantProps = VariantProps<typeof colorPickerVariants>
