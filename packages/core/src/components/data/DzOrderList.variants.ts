/**
 * DzOrderList — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Per-row state
 * (selected / grabbed / drop-target) is applied in the component via `cn()`
 * using the `itemSelected` / `itemGrabbed` slots, mirroring DzTransfer.
 *
 * @module @dzup-ui/core/components/data/DzOrderList.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const orderListVariants = tv({
  slots: {
    root: 'dz-order-list flex items-start gap-[var(--dz-order-list-gap)]',
    controls: 'flex shrink-0 flex-col gap-[var(--dz-order-list-control-gap)]',
    list: 'dz-order-list-items flex min-w-0 flex-1 flex-col rounded-[var(--dz-order-list-radius)] outline-none',
    item: [
      'group/item relative flex items-center gap-[var(--dz-order-list-item-gap)]',
      'bg-[var(--dz-order-list-item-bg)]',
      'outline-none transition-[background-color,box-shadow]',
      'dz-focus-ring-control-inset',
    ].join(' '),
    handle: [
      'inline-flex shrink-0 cursor-grab items-center justify-center',
      'text-[var(--dz-order-list-handle-color)] hover:text-[var(--dz-order-list-handle-hover)]',
      'active:cursor-grabbing',
    ].join(' '),
    content: 'min-w-0 flex-1',
    itemSelected: 'bg-[var(--dz-order-list-item-selected-bg)] text-[var(--dz-order-list-item-selected-fg)]',
    itemGrabbed: 'z-[1] bg-[var(--dz-order-list-item-grab-bg)] shadow-[var(--dz-order-list-grab-shadow)]',
    dropBefore: 'shadow-[inset_0_var(--dz-order-list-drop-indicator-size)_0_0_var(--dz-order-list-drop-indicator-color)]',
    dropAfter: 'shadow-[inset_0_calc(-1*var(--dz-order-list-drop-indicator-size))_0_0_var(--dz-order-list-drop-indicator-color)]',
    empty: 'px-[var(--dz-order-list-item-padding-x)] py-[var(--dz-order-list-item-padding-y)] text-center text-[var(--dz-muted-foreground)]',
  },

  variants: {
    variant: {
      plain: {
        list: '',
        item: '',
      },
      bordered: {
        list: 'border border-[var(--dz-order-list-border)]',
        item: 'border-b border-[var(--dz-order-list-border)] last:border-b-0',
      },
      divided: {
        list: '',
        item: 'border-b border-[var(--dz-order-list-border)] last:border-b-0',
      },
    },

    size: {
      icon: '',
      xs: {
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        item: 'px-[var(--dz-spacing-5)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        item: 'px-[var(--dz-spacing-6)] py-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
      },
    },

    interactive: {
      true: {
        item: 'cursor-pointer hover:bg-[var(--dz-order-list-item-hover-bg)]',
      },
      false: {},
    },

    disabled: {
      true: {
        root: 'pointer-events-none opacity-[var(--dz-order-list-disabled-opacity)]',
      },
      false: {},
    },
  },

  defaultVariants: {
    variant: 'bordered',
    size: 'md',
    interactive: false,
    disabled: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type OrderListVariantProps = VariantProps<typeof orderListVariants>
