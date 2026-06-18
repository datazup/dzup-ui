/**
 * DzImageComparison — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The divider, handle, and label colors are
 * driven by local `--dz-image-comparison-*` custom properties (see the
 * accompanying *.tokens.ts) with semantic-token fallbacks, so consumers can
 * theme them without touching the component.
 *
 * @module @dzup-ui/core/components/media/DzImageComparison.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const imageComparisonVariants = tv({
  slots: {
    root: [
      'relative isolate select-none overflow-hidden',
      'bg-[var(--dz-muted)]',
      'touch-none',
      'rounded-[var(--dz-radius-md)]',
    ].join(' '),
    // Base layer: stays in normal flow so it establishes the component height.
    before: 'block h-full w-full',
    // Revealed layer: stacked over the base and clipped to the divider position.
    after: 'absolute inset-0 h-full w-full',
    // The divider line; positioned via inline style at the current position.
    divider: [
      'pointer-events-none absolute z-10',
      'bg-[var(--dz-image-comparison-divider-color,var(--dz-background))]',
    ].join(' '),
    // Grip wrapper, centered on the divider line.
    handle: [
      'pointer-events-auto absolute left-1/2 top-1/2 z-20',
      '-translate-x-1/2 -translate-y-1/2',
      'flex items-center justify-center rounded-full outline-none',
      'h-[var(--dz-image-comparison-handle-size,2.25rem)]',
      'w-[var(--dz-image-comparison-handle-size,2.25rem)]',
      'bg-[var(--dz-image-comparison-handle-bg,var(--dz-background))]',
      'text-[var(--dz-image-comparison-handle-color,var(--dz-foreground))]',
      'shadow-[var(--dz-shadow-sm)]',
      'dz-focus-ring-control',
    ].join(' '),
    // Caption chip overlaid on an image.
    label: [
      'pointer-events-none absolute z-10',
      'rounded-[var(--dz-radius-sm)] px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-xs)] font-medium',
      'bg-[var(--dz-image-comparison-label-bg,color-mix(in_oklab,var(--dz-foreground)_70%,transparent))]',
      'text-[var(--dz-image-comparison-label-color,var(--dz-background))]',
    ].join(' '),
  },

  variants: {
    orientation: {
      horizontal: {
        // Full-height hairline; width set via the divider-width token.
        divider: 'inset-y-0 -translate-x-1/2 w-[var(--dz-image-comparison-divider-width,2px)]',
        root: 'cursor-ew-resize',
      },
      vertical: {
        // Full-width hairline; height set via the divider-width token.
        divider: 'inset-x-0 -translate-y-1/2 h-[var(--dz-image-comparison-divider-width,2px)]',
        root: 'cursor-ns-resize',
      },
    },
    disabled: {
      true: {
        root: 'cursor-not-allowed opacity-[var(--dz-control-disabled-opacity)]',
        handle: 'cursor-not-allowed',
      },
    },
  },

  defaultVariants: {
    orientation: 'horizontal',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ImageComparisonVariantProps = VariantProps<typeof imageComparisonVariants>
