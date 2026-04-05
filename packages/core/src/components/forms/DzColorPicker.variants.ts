/**
 * DzColorPicker — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/forms/DzColorPicker.variants
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
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:cursor-not-allowed disabled:opacity-50',
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
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)]',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    input: [
      'flex-1',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-transparent',
      'px-[var(--dz-spacing-2)]',
      'py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
      'font-mono',
      'outline-none',
      'focus:border-[var(--dz-primary)]',
    ].join(' '),
  },
  variants: {
    size: {
      xs: {
        trigger: 'h-7 px-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]',
        swatch: 'h-4 w-4',
        presetSwatch: 'h-4 w-4',
      },
      sm: {
        trigger: 'h-8 px-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
        swatch: 'h-5 w-5',
        presetSwatch: 'h-5 w-5',
      },
      md: {
        trigger: 'h-10 px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
        swatch: 'h-6 w-6',
        presetSwatch: 'h-6 w-6',
      },
      lg: {
        trigger: 'h-12 px-[var(--dz-spacing-4)] text-[length:var(--dz-text-base)]',
        swatch: 'h-7 w-7',
        presetSwatch: 'h-7 w-7',
      },
      xl: {
        trigger: 'h-14 px-[var(--dz-spacing-5)] text-[length:var(--dz-text-lg)]',
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
        root: 'pointer-events-none opacity-[var(--dz-button-disabled-opacity)]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type ColorPickerVariantProps = VariantProps<typeof colorPickerVariants>
