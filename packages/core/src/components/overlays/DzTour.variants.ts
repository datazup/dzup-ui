/**
 * DzTour -- tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The spotlight uses the box-shadow cutout
 * technique: a transparent element sized to the target casts a viewport-filling
 * shadow in the mask color, dimming everything except the target.
 *
 * @module @dzup-ui/core/components/overlays/DzTour.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tourVariants = tv({
  slots: {
    /** Full-viewport spotlight cutout (box-shadow fills the rest of the screen). */
    mask: [
      'fixed z-[var(--dz-z-modal-backdrop,1040)]',
      'pointer-events-none',
      'rounded-[var(--dz-tour-radius,var(--dz-radius-md))]',
      'shadow-[0_0_0_9999px_var(--dz-tour-mask,var(--dz-overlay-bg))]',
      'transition-all duration-200',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    /** Anchored popover panel. */
    panel: [
      'fixed z-[var(--dz-z-modal,1050)]',
      'w-80 max-w-[calc(100vw-2rem)]',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'p-[var(--dz-spacing-4)]',
      'shadow-[var(--dz-shadow-lg)]',
      'outline-none',
    ].join(' '),
    /** Header row (title + skip affordance). */
    header: 'flex items-start justify-between gap-[var(--dz-spacing-2)]',
    /** Step title. */
    title: [
      'text-[length:var(--dz-text-base)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    /** Step description body. */
    description: [
      'mt-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)]',
      'leading-relaxed',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    /** Footer row container. */
    footer: [
      'mt-[var(--dz-spacing-4)]',
      'flex items-center justify-between gap-[var(--dz-spacing-3)]',
    ].join(' '),
    /** Control buttons cluster. */
    controls: 'flex items-center gap-[var(--dz-spacing-2)]',
    /** Step indicator dots container. */
    indicators: 'flex items-center gap-[var(--dz-spacing-1-5)]',
    /** A single indicator dot. */
    dot: [
      'h-[var(--dz-spacing-1-5,0.375rem)] w-[var(--dz-spacing-1-5,0.375rem)]',
      'rounded-full',
      'transition-colors',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    /** Visually-hidden live region for step-change announcements. */
    liveRegion: 'sr-only',
  },
  variants: {
    active: {
      true: { dot: 'bg-[var(--dz-primary)]' },
      false: { dot: 'bg-[var(--dz-muted)]' },
    },
  },
})

/** Variant prop types extracted from the tv() definition. */
export type TourVariantProps = VariantProps<typeof tourVariants>
