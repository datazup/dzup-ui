/**
 * DzStepper — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzStepper.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const stepperVariants = tv({
  slots: {
    root: 'flex',
    step: 'flex items-center',
    indicator: [
      'flex items-center justify-center',
      'h-8 w-8 shrink-0',
      'rounded-full',
      'text-[length:var(--dz-text-sm)]',
      'font-[var(--dz-font-medium)]',
      'transition-colors',
    ].join(' '),
    connector: 'transition-colors',
    title: [
      'text-[length:var(--dz-text-sm)]',
      'font-[var(--dz-font-medium)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },

  variants: {
    orientation: {
      horizontal: {
        root: 'flex-row items-center',
        step: 'flex-col items-center gap-[var(--dz-spacing-2)]',
        connector: 'h-px flex-1 mx-[var(--dz-spacing-2)]',
      },
      vertical: {
        root: 'flex-col',
        step: 'flex-row gap-[var(--dz-spacing-3)]',
        connector: 'w-px min-h-[var(--dz-spacing-6)] ml-4 my-[var(--dz-spacing-1)]',
      },
    },
    status: {
      completed: {
        indicator: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)]',
        connector: 'bg-[var(--dz-primary)]',
        title: 'text-[var(--dz-foreground)]',
      },
      active: {
        indicator: 'border-2 border-[var(--dz-primary)] text-[var(--dz-primary)]',
        connector: 'bg-[var(--dz-border)]',
        title: 'text-[var(--dz-primary)]',
      },
      upcoming: {
        indicator: 'border-2 border-[var(--dz-border)] text-[var(--dz-muted-foreground)]',
        connector: 'bg-[var(--dz-border)]',
        title: 'text-[var(--dz-muted-foreground)]',
      },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    status: 'upcoming',
  },
})

/** Variant prop types */
export type StepperVariantProps = VariantProps<typeof stepperVariants>
