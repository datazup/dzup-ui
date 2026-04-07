/**
 * DzAccordion — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/data/DzAccordion.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const accordionVariants = tv({
  slots: {
    root: '',
    item: '',
    trigger: [
      'flex flex-1 items-center justify-between',
      'font-medium',
      'transition-[var(--dz-transition-fast)]',
      'cursor-pointer',
      'hover:underline',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:pointer-events-none disabled:opacity-50',
      '[&[data-state=open]>svg]:rotate-180',
    ].join(' '),
    content: [
      'overflow-hidden',
      'text-[var(--dz-muted-foreground)]',
      'data-[state=open]:animate-[accordion-down_200ms_ease-out]',
      'data-[state=closed]:animate-[accordion-up_200ms_ease-out]',
    ].join(' '),
    chevron: 'h-4 w-4 shrink-0 transition-transform duration-200',
  },

  variants: {
    variant: {
      default: {
        item: 'border-b border-[var(--dz-border)]',
      },
      bordered: {
        root: 'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)]',
        item: 'border-b border-[var(--dz-border)] last:border-b-0',
      },
      separated: {
        item: 'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)] mb-[var(--dz-spacing-2)] last:mb-0',
      },
    },

    size: {
      xs: {
        trigger: 'py-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-xs)]',
        content: 'pb-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'py-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
        content: 'pb-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'py-[var(--dz-spacing-4)] text-[length:var(--dz-text-sm)]',
        content: 'pb-[var(--dz-spacing-4)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'py-[var(--dz-spacing-5)] text-[length:var(--dz-text-base)]',
        content: 'pb-[var(--dz-spacing-5)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'py-[var(--dz-spacing-6)] text-[length:var(--dz-text-lg)]',
        content: 'pb-[var(--dz-spacing-6)] text-[length:var(--dz-text-lg)]',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type AccordionVariantProps = VariantProps<typeof accordionVariants>
