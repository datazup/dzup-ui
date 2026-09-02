/**
 * DzRadio — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzRadio.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const radioVariants = tv({
  slots: {
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8. The root is a `<label>` wrapping the
     * control, so clicking anywhere in it toggles the control: the label row IS
     * a pointer target, and at `md` it was the height of its own text (21 px).
     * `dz-target-min` floors the block axis at 24 px; the inline axis is already
     * past it. Without this the target is the 24 px indicator alone and the
     * label beside it is a 21 px strip that toggles the same control -- and the
     * browser matrix sees it, because the `role="radiogroup"` container carries a roving
     * `tabindex="0"` and is therefore measured too: it reported `div 80.44x21`.
     */
    root: [
      'dz-target-min inline-flex items-center gap-[var(--dz-spacing-2)]',
      'cursor-pointer select-none',
      'dz-disabled-control',
    ].join(' '),
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum) — identical
     * treatment to DzCheckbox: this element carries `role="radio"`, so it is
     * the pointer target, and 18x18 at `md` fails on every engine. Growing it
     * would put `md` above `lg` in the size scale, so the box grows to the
     * floor and returns the growth to the layout, and the painted circle moves
     * to a pseudo-element at `--dz-control-visual-size`.
     */
    indicator: [
      'dz-target-min-tight relative shrink-0 inline-flex items-center justify-center',
      'dz-focus-ring-control',
      'before:absolute before:inset-0 before:m-auto before:-z-10',
      'before:size-[var(--dz-control-visual-size)]',
      'before:rounded-full',
      'before:border before:border-[var(--dz-border)]',
      'before:bg-[var(--dz-background)]',
      'before:transition-[var(--dz-control-transition)]',
      'data-[state=checked]:before:border-[var(--dz-primary)]',
    ].join(' '),
    dot: [
      'rounded-full',
      'bg-[var(--dz-primary)]',
    ].join(' '),
    label: [
      'text-[var(--dz-foreground)]',
      'leading-none',
    ].join(' '),
  },
  variants: {
    size: {
      icon: '',
      xs: { indicator: 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]', dot: 'h-1.5 w-1.5', label: 'text-[length:var(--dz-text-xs)]' },
      sm: { indicator: 'h-4 w-4 [--dz-control-visual-size:1rem]', dot: 'h-2 w-2', label: 'text-[length:var(--dz-text-sm)]' },
      md: { indicator: 'h-[1.125rem] w-[1.125rem] [--dz-control-visual-size:1.125rem]', dot: 'h-2.5 w-2.5', label: 'text-[length:var(--dz-text-sm)]' },
      lg: { indicator: 'h-5 w-5 [--dz-control-visual-size:1.25rem]', dot: 'h-3 w-3', label: 'text-[length:var(--dz-text-base)]' },
      xl: { indicator: 'h-6 w-6 [--dz-control-visual-size:1.5rem]', dot: 'h-3.5 w-3.5', label: 'text-[length:var(--dz-text-lg)]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type RadioVariantProps = VariantProps<typeof radioVariants>
