/**
 * DzCountdown — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Layout spacing,
 * weight, and tracking come from the `--dz-countdown-*` custom properties
 * declared on `.dz-countdown` in base.css; `size` drives the figure scale and
 * `tone` drives its colour.
 *
 * @module @dzup-ui/core/components/data/DzCountdown.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const countdownVariants = tv({
  slots: {
    root: [
      'dz-countdown',
      'inline-flex items-baseline',
      'gap-[var(--dz-countdown-gap)]',
    ].join(' '),
    value: [
      'font-[var(--dz-countdown-font-weight)]',
      'tracking-[var(--dz-countdown-tracking)]',
      // Stable digit width so the figure doesn't jitter as it ticks.
      'tabular-nums',
    ].join(' '),
  },
  variants: {
    size: {
      // `icon` is part of CanonicalSize but has no distinct figure scale here.
      icon: {},
      xs: { value: 'text-[length:var(--dz-text-sm)]' },
      sm: { value: 'text-[length:var(--dz-text-base)]' },
      md: { value: 'text-[length:var(--dz-text-xl)]' },
      lg: { value: 'text-[length:var(--dz-text-2xl)]' },
      xl: { value: 'text-[length:var(--dz-text-3xl)]' },
    },
    tone: {
      neutral: { value: 'text-[var(--dz-foreground)]' },
      primary: { value: 'text-[var(--dz-primary)]' },
      success: { value: 'text-[var(--dz-success)]' },
      warning: { value: 'text-[var(--dz-warning)]' },
      danger: { value: 'text-[var(--dz-danger)]' },
      info: { value: 'text-[var(--dz-info)]' },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'neutral',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CountdownVariantProps = VariantProps<typeof countdownVariants>
