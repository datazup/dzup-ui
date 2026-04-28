/**
 * DzCarousel — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzup-ui/core/components/media/DzCarousel.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const carouselVariants = tv({
  slots: {
    root: 'relative overflow-hidden',
    viewport: 'overflow-hidden',
    container: 'flex transition-transform',
    slide: 'min-w-0 shrink-0 grow-0 basis-full',
    navButton: [
      'absolute z-10',
      'inline-flex items-center justify-center',
      'rounded-full',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]/80 backdrop-blur-sm',
      'text-[var(--dz-foreground)]',
      'shadow-[var(--dz-shadow-sm)]',
      'transition-all duration-150',
      'hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-button dz-disabled-button',
    ].join(' '),
    navPrev: '',
    navNext: '',
    dots: 'flex items-center justify-center gap-[var(--dz-spacing-1-5)]',
    dot: [
      'rounded-full',
      'bg-[var(--dz-muted-foreground)]/30',
      'transition-all duration-200',
      'cursor-pointer',
      'hover:bg-[var(--dz-muted-foreground)]/50',
    ].join(' '),
    dotActive: 'bg-[var(--dz-primary)] hover:bg-[var(--dz-primary)]',
  },

  variants: {
    orientation: {
      horizontal: {
        container: 'flex-row',
        navPrev: 'left-[var(--dz-spacing-2)] top-1/2 -translate-y-1/2',
        navNext: 'right-[var(--dz-spacing-2)] top-1/2 -translate-y-1/2',
        dots: 'mt-[var(--dz-spacing-3)]',
      },
      vertical: {
        container: 'flex-col',
        slide: 'basis-full',
        navPrev: 'top-[var(--dz-spacing-2)] left-1/2 -translate-x-1/2',
        navNext: 'bottom-[var(--dz-spacing-2)] left-1/2 -translate-x-1/2',
        dots: 'ml-[var(--dz-spacing-3)] flex-col',
      },
    },

    size: {
      xs: {
        navButton: 'h-6 w-6 [&>svg]:h-3 [&>svg]:w-3',
        dot: 'h-1 w-1',
        dotActive: 'w-3',
      },
      sm: {
        navButton: 'h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5',
        dot: 'h-1.5 w-1.5',
        dotActive: 'w-4',
      },
      md: {
        navButton: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
        dot: 'h-2 w-2',
        dotActive: 'w-5',
      },
      lg: {
        navButton: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
        dot: 'h-2.5 w-2.5',
        dotActive: 'w-6',
      },
      xl: {
        navButton: 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6',
        dot: 'h-3 w-3',
        dotActive: 'w-8',
      },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CarouselVariantProps = VariantProps<typeof carouselVariants>
