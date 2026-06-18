/**
 * DzAnimatedNumber — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Weight, tracking, and
 * the affix gap come from the `--dz-animated-number-*` custom properties declared
 * on `.dz-animated-number` in base.css; `size` drives the figure scale and `tone`
 * drives its colour. `tabular-nums` keeps the digit width stable so the figure
 * doesn't jitter as it counts.
 *
 * @module @dzup-ui/core/components/data/DzAnimatedNumber.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const animatedNumberVariants = tv({
  slots: {
    // Token host — `--dz-animated-number-*` vars are declared on this class.
    root: 'dz-animated-number inline-block',
    // The visible (aria-hidden) figure: prefix · number · suffix on a baseline.
    figure: [
      'inline-flex items-baseline',
      'gap-[var(--dz-animated-number-gap)]',
    ].join(' '),
    value: [
      'font-[var(--dz-animated-number-font-weight)]',
      'tracking-[var(--dz-animated-number-tracking)]',
      // Stable digit width so the figure doesn't jitter as it counts.
      'tabular-nums',
    ].join(' '),
    // Prefix / suffix affixes read as secondary to the figure.
    affix: 'text-[var(--dz-muted-foreground)]',
  },
  variants: {
    size: {
      // `icon` is part of CanonicalSize but has no figure scale of its own;
      // it falls back to the `md` token sizing.
      icon: {},
      xs: { value: 'text-[length:var(--dz-text-base)]' },
      sm: { value: 'text-[length:var(--dz-text-lg)]' },
      md: { value: 'text-[length:var(--dz-text-2xl)]' },
      lg: { value: 'text-[length:var(--dz-text-3xl)]' },
      xl: { value: 'text-[length:var(--dz-text-4xl)]' },
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
export type AnimatedNumberVariantProps = VariantProps<typeof animatedNumberVariants>
