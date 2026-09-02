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
      'dz-focus-ring-control dz-disabled-control',
      '[&[data-state=open]>svg]:rotate-180',
    ].join(' '),
    content: [
      'overflow-hidden',
      'text-[var(--dz-muted-foreground)]',
      // The panel's height animation is the one thing here that moves, and it
      // is what WCAG 2.3.3 is about. Under `prefers-reduced-motion` the panel
      // still opens and closes — it just arrives (renderer contract C7).
      'data-[state=open]:animate-[accordion-down_200ms_ease-out] motion-reduce:animate-none',
      'data-[state=closed]:animate-[accordion-up_200ms_ease-out] motion-reduce:animate-none',
    ].join(' '),
    chevron: 'h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none',
  },

  variants: {
    variant: {
      // Flush list: a divider under every item except the last. No horizontal
      // inset so triggers align with surrounding content.
      default: {
        item: 'border-b border-[var(--dz-border)] last:border-b-0',
      },
      // One rounded container; items share internal dividers. Content is inset
      // from the container edge so text never touches the border.
      bordered: {
        root: 'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)] overflow-hidden',
        item: 'border-b border-[var(--dz-border)] last:border-b-0',
        trigger: 'px-[var(--dz-spacing-4)]',
        content: 'px-[var(--dz-spacing-4)]',
      },
      // Each item is its own outlined, rounded card with a gap between cards.
      separated: {
        root: 'flex flex-col gap-[var(--dz-spacing-2)]',
        item: 'border border-[var(--dz-border)] rounded-[var(--dz-radius-md)] overflow-hidden',
        trigger: 'px-[var(--dz-spacing-4)]',
        content: 'px-[var(--dz-spacing-4)]',
      },
      // Soft, borderless filled cards with a gap. Good for dense settings panels
      // where outlines add too much visual noise.
      filled: {
        root: 'flex flex-col gap-[var(--dz-spacing-2)]',
        item: 'rounded-[var(--dz-radius-md)] bg-[var(--dz-muted)] overflow-hidden',
        trigger: 'px-[var(--dz-spacing-4)] hover:no-underline text-[var(--dz-foreground)]',
        content: 'px-[var(--dz-spacing-4)]',
      },
    },

    size: {
      icon: '',
      xs: {
        trigger: 'py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]',
        content: 'pb-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]',
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
