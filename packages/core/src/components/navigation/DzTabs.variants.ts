/**
 * DzTabs — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzTabs.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tabsVariants = tv({
  slots: {
    root: 'flex',
    list: [
      'inline-flex items-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    trigger: [
      'inline-flex items-center justify-center whitespace-nowrap',
      'font-medium',
      'transition-[var(--dz-transition-fast)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-[var(--dz-foreground)]',
    ].join(' '),
    content: [
      'mt-[var(--dz-spacing-2)]',
      'focus-visible:outline-none focus-visible:ring-[length:2px] focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-[length:2px]',
    ].join(' '),
  },

  variants: {
    variant: {
      line: {
        list: 'border-b border-[var(--dz-border)]',
        trigger: [
          'border-b-2 border-transparent',
          '-mb-px',
          'data-[state=active]:border-[var(--dz-primary)]',
          'hover:text-[var(--dz-foreground)]',
        ].join(' '),
      },
      enclosed: {
        list: 'border-b border-[var(--dz-border)]',
        trigger: [
          'rounded-t-[var(--dz-radius-md)]',
          'border border-transparent',
          '-mb-px',
          'data-[state=active]:border-[var(--dz-border)]',
          'data-[state=active]:border-b-[var(--dz-background)]',
          'data-[state=active]:bg-[var(--dz-background)]',
          'hover:text-[var(--dz-foreground)]',
        ].join(' '),
      },
      pills: {
        list: 'gap-[var(--dz-spacing-1)]',
        trigger: [
          'rounded-[var(--dz-radius-md)]',
          'data-[state=active]:bg-[var(--dz-primary)]',
          'data-[state=active]:text-[var(--dz-primary-foreground)]',
          'hover:bg-[var(--dz-muted)]',
          'data-[state=active]:hover:bg-[var(--dz-primary-hover)]',
        ].join(' '),
      },
    },

    size: {
      xs: {
        trigger: 'h-[var(--dz-button-xs-height)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'h-[var(--dz-button-sm-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'h-[var(--dz-button-md-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'h-[var(--dz-button-lg-height)] px-[var(--dz-spacing-6)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'h-[var(--dz-button-xl-height)] px-[var(--dz-spacing-8)] text-[length:var(--dz-text-lg)]',
      },
    },

    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'flex-row',
      },
      vertical: {
        root: 'flex-row',
        list: 'flex-col',
        content: 'mt-0 ml-[var(--dz-spacing-2)]',
      },
    },
  },

  compoundVariants: [
    // Vertical line variant uses left border instead of bottom
    {
      variant: 'line',
      orientation: 'vertical',
      class: {
        list: 'border-b-0 border-r border-[var(--dz-border)]',
        trigger: 'border-b-0 border-r-2 border-transparent -mr-px mb-0 data-[state=active]:border-[var(--dz-primary)]',
      },
    },
    // Vertical enclosed variant uses left border
    {
      variant: 'enclosed',
      orientation: 'vertical',
      class: {
        list: 'border-b-0 border-r border-[var(--dz-border)]',
        trigger: 'rounded-t-none rounded-l-[var(--dz-radius-md)] border-b-transparent -mr-px mb-0 data-[state=active]:border-r-[var(--dz-background)]',
      },
    },
  ],

  defaultVariants: {
    variant: 'line',
    size: 'md',
    orientation: 'horizontal',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TabsVariantProps = VariantProps<typeof tabsVariants>
