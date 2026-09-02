/**
 * DzResizable — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzup-ui/core/components/layout/DzResizable.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const resizableVariants = tv({
  slots: {
    group: 'flex h-full w-full',
    panel: 'flex items-stretch overflow-auto',
    /**
     * TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum).
     *
     * The handle carries `role="separator"` and is the drag target. It measured
     * `div 1x72` — a one-pixel-wide pointer target — on chromium, firefox and
     * webkit. It cannot simply be grown: a 24px-wide handle is a 24px gap
     * between the panes.
     *
     * So the handle's own box grows to the 24px floor across the axis it is
     * thin in, `dz-target-min-tight-{inline,block}` gives that growth back to
     * the layout with a negative margin on the same axis, and the hairline it
     * paints moves to a pseudo-element at `--dz-control-visual-size`. The panes
     * keep their geometry to the pixel; the handle accepts a pointer 24px wide.
     *
     * The cost, recorded rather than hidden: the handle now overhangs each pane
     * by half the growth, so a pointer within ~11px of the divider hits the
     * handle rather than the pane content behind it.
     */
    handle: [
      'relative flex shrink-0 items-center justify-center',
      'transition-colors duration-150',
      'dz-focus-ring-control dz-disabled-control',
      'before:absolute before:inset-0 before:m-auto before:-z-10',
      'before:bg-[var(--dz-border)]',
      'before:transition-colors before:duration-150',
      'hover:before:bg-[var(--dz-primary)]',
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
        // The hairline is vertical: full height, `--dz-control-visual-size` wide.
        handle: 'dz-target-min-tight-inline w-px before:h-full before:w-[var(--dz-control-visual-size)]',
        handleIndicator: 'h-4 w-3 rotate-90',
      },
      vertical: {
        group: 'flex-col',
        handle: 'dz-target-min-tight-block h-px before:w-full before:h-[var(--dz-control-visual-size)]',
        handleIndicator: 'h-3 w-4',
      },
    },

    size: {
      icon: '',
      // `--dz-control-visual-size` is the hairline's thickness. The `w-*`/`h-*`
      // classes stay so the declared size is still readable at the call site;
      // the `min-*-size` floor from the utility is what actually wins.
      xs: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      sm: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      md: {
        handle: '[--dz-control-visual-size:1px] data-[direction=horizontal]:w-px data-[direction=vertical]:h-px',
      },
      lg: {
        handle: '[--dz-control-visual-size:0.125rem] data-[direction=horizontal]:w-0.5 data-[direction=vertical]:h-0.5',
      },
      xl: {
        handle: '[--dz-control-visual-size:0.25rem] data-[direction=horizontal]:w-1 data-[direction=vertical]:h-1',
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
