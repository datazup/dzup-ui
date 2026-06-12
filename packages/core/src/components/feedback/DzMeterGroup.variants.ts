/**
 * DzMeterGroup — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/DzMeterGroup.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/** Outer wrapper (label + track + legend stack) */
export const meterGroupRootVariants = tv({
  base: 'flex flex-col gap-[var(--dz-space-2)]',
})

/** Track (background rail holding the segments) */
export const meterGroupTrackVariants = tv({
  base: [
    'relative flex overflow-hidden',
    'rounded-[var(--dz-radius-full)]',
    'bg-[var(--dz-muted)]',
  ].join(' '),

  variants: {
    orientation: {
      horizontal: 'flex-row w-full',
      vertical: 'flex-col-reverse h-40',
    },
    size: {
      icon: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
  },

  compoundVariants: [
    { orientation: 'horizontal', size: 'xs', class: 'h-1' },
    { orientation: 'horizontal', size: 'sm', class: 'h-1.5' },
    { orientation: 'horizontal', size: 'md', class: 'h-2' },
    { orientation: 'horizontal', size: 'lg', class: 'h-3' },
    { orientation: 'horizontal', size: 'xl', class: 'h-4' },
    { orientation: 'vertical', size: 'xs', class: 'w-1' },
    { orientation: 'vertical', size: 'sm', class: 'w-1.5' },
    { orientation: 'vertical', size: 'md', class: 'w-2' },
    { orientation: 'vertical', size: 'lg', class: 'w-3' },
    { orientation: 'vertical', size: 'xl', class: 'w-4' },
  ],

  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
})

/** Individual proportional segment fill */
export const meterGroupSegmentVariants = tv({
  base: [
    'transition-[width,height] duration-300 ease-in-out',
    'first:rounded-s-[var(--dz-radius-full)] last:rounded-e-[var(--dz-radius-full)]',
  ].join(' '),
})

/** Legend list */
export const meterGroupLegendVariants = tv({
  base: 'flex flex-wrap items-center gap-x-[var(--dz-space-4)] gap-y-[var(--dz-space-1)]',
})

/** A single legend item (color swatch + label + value) */
export const meterGroupLegendItemVariants = tv({
  base: 'inline-flex items-center gap-[var(--dz-space-2)] text-[length:var(--dz-font-size-sm)] text-[var(--dz-foreground)]',
})

/** Legend color swatch */
export const meterGroupLegendSwatchVariants = tv({
  base: 'inline-block h-2.5 w-2.5 shrink-0 rounded-[var(--dz-radius-full)]',
})

/** Variant prop types extracted from the tv() definitions */
export type MeterGroupTrackVariantProps = VariantProps<typeof meterGroupTrackVariants>
export type MeterGroupSegmentVariantProps = VariantProps<typeof meterGroupSegmentVariants>
