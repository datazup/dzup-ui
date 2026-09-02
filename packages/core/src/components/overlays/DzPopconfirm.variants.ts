/**
 * DzPopconfirm -- tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). The `tone` variant tints the leading icon to
 * signal intent (danger by default). The panel mirrors DzPopover/DzTour so
 * overlay surfaces stay visually consistent.
 *
 * @module @dzup-ui/core/components/overlays/DzPopconfirm.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const popconfirmVariants = tv({
  slots: {
    /** Inline trigger wrapper (positioning reference). */
    trigger: 'inline-flex',
    /** Anchored popover panel. */
    panel: [
      'z-[var(--dz-z-popover,1060)]',
      'w-[var(--dz-popconfirm-width,16rem)] max-w-[calc(100vw-2rem)]',
      'rounded-[var(--dz-popconfirm-radius,var(--dz-radius-lg))]',
      'border border-[var(--dz-popconfirm-border,var(--dz-border))]',
      'bg-[var(--dz-popconfirm-bg,var(--dz-background))]',
      'text-[var(--dz-popconfirm-fg,var(--dz-foreground))]',
      'p-[var(--dz-popconfirm-padding,var(--dz-spacing-4))]',
      'shadow-[var(--dz-popconfirm-shadow,var(--dz-shadow-lg))]',
      'outline-none',
      'transition-opacity',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    /** Header row: icon + text block. */
    header: 'flex items-start gap-[var(--dz-spacing-2)]',
    /** Leading icon wrapper. */
    iconWrap: 'mt-[var(--dz-spacing-0_5,0.125rem)] flex shrink-0 items-center justify-center',
    /** Text block (title + description). */
    body: 'min-w-0 flex-1',
    /** Title heading. */
    title: [
      'text-[length:var(--dz-text-sm)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    /** Supporting description. */
    description: [
      'mt-[var(--dz-spacing-1)]',
      'text-[length:var(--dz-text-sm)]',
      'leading-relaxed',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    /** Action button row. */
    actions: 'mt-[var(--dz-spacing-4)] flex justify-end gap-[var(--dz-spacing-2)]',
  },
  variants: {
    tone: {
      neutral: { iconWrap: 'text-[var(--dz-muted-foreground)]' },
      primary: { iconWrap: 'text-[var(--dz-primary)]' },
      success: { iconWrap: 'text-[var(--dz-success)]' },
      warning: { iconWrap: 'text-[var(--dz-warning)]' },
      danger: { iconWrap: 'text-[var(--dz-danger)]' },
      info: { iconWrap: 'text-[var(--dz-info)]' },
    },
  },
  defaultVariants: {
    tone: 'danger',
  },
})

/** Variant prop types extracted from the tv() definition. */
export type PopconfirmVariantProps = VariantProps<typeof popconfirmVariants>
