/**
 * DzCheckbox — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzCheckbox.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const checkboxVariants = tv({
  slots: {
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8. The root is a `<label>` wrapping the
     * control, so clicking anywhere in it toggles the control: the label row IS
     * a pointer target, and at `md` it was the height of its own text (21 px).
     * `dz-target-min` floors the block axis at 24 px; the inline axis is already
     * past it. Without this the target is the 24 px indicator alone and the
     * label beside it is a 21 px strip that toggles the same control -- and the
     * browser matrix sees it, because a checkbox group is measured the same way.
     * Applied to both controls together rather than only to the one the lane
     * happened to catch, because the defect is the same in both.
     */
    root: [
      // `items-start` keeps the box aligned to the FIRST line of a wrapping
      // label; per-size `leading-*` on the label (below) matches the indicator
      // height so single-line labels still read as vertically centered.
      'dz-target-min inline-flex items-start gap-[var(--dz-spacing-2)]',
      'cursor-pointer select-none',
      'dz-disabled-control',
    ].join(' '),
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum).
     *
     * The indicator is the element that carries `role="checkbox"`, so it IS the
     * pointer target, and at `md` it measured 18x18 on chromium, firefox and
     * webkit. It cannot simply be grown: `md` would then be 24px against `lg`'s
     * 20px and `xl`'s 24px, i.e. the size scale would stop being a scale.
     *
     * So the BOX grows to the 24px floor (`dz-target-min-tight`) and gives the
     * growth straight back to the layout through a negative margin, while what
     * the control PAINTS moves to a pseudo-element sized from
     * `--dz-control-visual-size` — which every size below still sets to exactly
     * what it painted before. Nothing moves, nothing changes size, and the
     * target is 24x24. `isolation` (in the utility) keeps `before:-z-10` inside
     * this element's stacking context so the check glyph still paints on top.
     */
    indicator: [
      'dz-target-min-tight relative shrink-0 inline-flex items-center justify-center',
      'dz-focus-ring-control',
      'before:absolute before:inset-0 before:m-auto before:-z-10',
      'before:size-[var(--dz-control-visual-size)]',
      'before:rounded-[var(--dz-radius-sm)]',
      'before:border before:border-[var(--dz-border)]',
      'before:bg-[var(--dz-background)]',
      'before:transition-[var(--dz-control-transition)]',
      'data-[state=checked]:before:bg-[var(--dz-primary)] data-[state=checked]:before:border-[var(--dz-primary)] data-[state=checked]:text-[var(--dz-primary-foreground)]',
      'data-[state=indeterminate]:before:bg-[var(--dz-primary)] data-[state=indeterminate]:before:border-[var(--dz-primary)] data-[state=indeterminate]:text-[var(--dz-primary-foreground)]',
    ].join(' '),
    label: [
      'text-[var(--dz-foreground)]',
    ].join(' '),
  },
  variants: {
    size: {
      // Each size's label `leading-*` matches the indicator height so the box
      // optically centers against the first line of text (works for single-
      // and multi-line labels with `items-start` on the root).
      icon: '',
      xs: { indicator: 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]', label: 'text-[length:var(--dz-text-xs)] leading-[0.875rem]' },
      sm: { indicator: 'h-4 w-4 [--dz-control-visual-size:1rem]', label: 'text-[length:var(--dz-text-sm)] leading-[1rem]' },
      md: { indicator: 'h-[1.125rem] w-[1.125rem] [--dz-control-visual-size:1.125rem]', label: 'text-[length:var(--dz-text-sm)] leading-[1.125rem]' },
      lg: { indicator: 'h-5 w-5 [--dz-control-visual-size:1.25rem]', label: 'text-[length:var(--dz-text-base)] leading-[1.25rem]' },
      xl: { indicator: 'h-6 w-6 [--dz-control-visual-size:1.5rem]', label: 'text-[length:var(--dz-text-lg)] leading-[1.5rem]' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>
