/**
 * DzInfiniteScroll — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Sentinel height and
 * the status-row spacing are driven by the `--dz-infinite-scroll-*` custom
 * properties declared on `.dz-infinite-scroll` in base.css.
 *
 * @module @dzup-ui/core/components/data/DzInfiniteScroll.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const infiniteScrollVariants = tv({
  slots: {
    root: [
      'dz-infinite-scroll',
      'flex flex-col',
    ].join(' '),
    // Items wrapper — keeps the default slot a single flex child so that
    // `flex-col-reverse` (direction: up) only swaps items ↔ status, not the
    // items among themselves.
    content: 'min-w-0',
    // Zero-height observation target; height comes from the distance trigger.
    sentinel: [
      'dz-infinite-scroll-sentinel',
      'h-[var(--dz-infinite-scroll-sentinel-size)]',
      'shrink-0',
    ].join(' '),
    // Loading / end / error status row.
    status: [
      'flex items-center justify-center',
      'gap-[var(--dz-infinite-scroll-status-gap)]',
      'py-[var(--dz-infinite-scroll-status-padding-y)]',
      'text-[var(--dz-muted-foreground)]',
      'text-[length:var(--dz-text-sm)]',
    ].join(' '),
    // Error status row — tinted to read as a failure.
    error: 'text-[var(--dz-danger)]',
  },
  variants: {
    size: {
      icon: {},
      xs: { status: 'text-[length:var(--dz-text-xs)]' },
      sm: { status: 'text-[length:var(--dz-text-xs)]' },
      md: { status: 'text-[length:var(--dz-text-sm)]' },
      lg: { status: 'text-[length:var(--dz-text-base)]' },
      xl: { status: 'text-[length:var(--dz-text-base)]' },
    },
    direction: {
      down: { root: 'flex-col' },
      up: { root: 'flex-col-reverse' },
    },
  },
  defaultVariants: {
    size: 'md',
    direction: 'down',
  },
})

/** Variant prop types extracted from the tv() definition */
export type InfiniteScrollVariantProps = VariantProps<typeof infiniteScrollVariants>
