/**
 * DzBlockUI — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The overlay is a flex-centered scrim that covers
 * either the relatively-positioned root (scoped) or the viewport (`fullScreen`).
 * Pointer events are captured by the overlay so the masked content beneath
 * never receives clicks; the fade respects `prefers-reduced-motion`.
 *
 * @module @dzup-ui/core/components/feedback/DzBlockUI.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const blockUiVariants = tv({
  slots: {
    /** Positioning context for the scoped overlay. */
    root: 'dz-block-ui relative',
    /** Wrapper around the masked content (receives `inert` while blocked). */
    content: 'h-full w-full',
    /** Scrim overlay covering the region. */
    overlay: [
      'absolute inset-0 z-[var(--dz-blockui-z,30)]',
      'flex flex-col items-center justify-center',
      'gap-[var(--dz-blockui-gap,var(--dz-spacing-3))]',
      'rounded-[var(--dz-blockui-radius,var(--dz-radius-md))]',
      'bg-[var(--dz-blockui-mask,var(--dz-overlay-bg))]',
      'backdrop-blur-[var(--dz-blockui-blur,0px)]',
      'pointer-events-auto cursor-progress outline-none',
      'transition-opacity duration-200',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    /** Message rendered beneath the default spinner. */
    message: [
      'text-[length:var(--dz-text-sm)]',
      'font-medium',
      'text-[var(--dz-blockui-message-color,var(--dz-foreground))]',
    ].join(' '),
  },
  variants: {
    fullScreen: {
      true: {
        overlay: 'fixed inset-0 z-[var(--dz-blockui-fullscreen-z,var(--dz-z-modal-backdrop,1040))] rounded-none',
      },
      false: {},
    },
  },
  defaultVariants: {
    fullScreen: false,
  },
})

/** Variant prop types extracted from the tv() definition. */
export type BlockUiVariantProps = VariantProps<typeof blockUiVariants>
