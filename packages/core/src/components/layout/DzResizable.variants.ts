/**
 * DzResizable — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzip-ui/core/components/layout/DzResizable.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const resizableVariants = tv({
  slots: {
    group: 'flex h-full w-full',
    panel: 'flex items-stretch overflow-auto',
    handle: [
      'relative flex shrink-0 items-center justify-center',
      'bg-[var(--dz-border)]',
      'transition-colors duration-150',
      'hover:bg-[var(--dz-primary)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dz-primary)] focus-visible:ring-offset-1',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'after:absolute after:inset-0',
    ].join(' '),
    handleIndicator: [
      'z-10 flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
    ].join(' '),
  },

  variants: {
    direction: {
      horizontal: {
        group: 'flex-row',
        handle: 'w-px',
        handleIndicator: 'h-4 w-3 rotate-90',
      },
      vertical: {
        group: 'flex-col',
        handle: 'h-px',
        handleIndicator: 'h-3 w-4',
      },
    },

    size: {
      xs: {
        handle: 'data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      sm: {
        handle: 'data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      md: {
        handle: 'data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      lg: {
        handle: 'data-[direction=horizontal]:w-0.5 data-[direction=vertical]:h-0.5',
      },
      xl: {
        handle: 'data-[direction=horizontal]:w-1 data-[direction=vertical]:h-1',
      },
    },
  },

  defaultVariants: {
    direction: 'horizontal',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ResizableVariantProps = VariantProps<typeof resizableVariants>
