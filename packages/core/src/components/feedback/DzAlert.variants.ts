/**
 * DzAlert — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/DzAlert.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const alertVariants = tv({
  base: [
    'relative flex gap-[var(--dz-spacing-3)] p-[var(--dz-spacing-4)]',
    'rounded-[var(--dz-radius-md)]',
    'text-[length:var(--dz-text-sm)]',
    'transition-all',
    '[&>svg]:shrink-0 [&>svg]:mt-0.5',
  ].join(' '),

  variants: {
    variant: {
      filled: '',
      outline: 'border bg-transparent',
      subtle: '',
      ghost: 'bg-transparent',
    },

    tone: {
      neutral: '',
      primary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
    },
  },

  compoundVariants: [
    // -- Filled + tone --
    { variant: 'filled', tone: 'primary', class: 'bg-[var(--dz-primary-solid)] text-[var(--dz-primary-foreground)]' },
    { variant: 'filled', tone: 'neutral', class: 'bg-[var(--dz-foreground)] text-[var(--dz-background)]' },
    { variant: 'filled', tone: 'success', class: 'bg-[var(--dz-success-solid)] text-[var(--dz-success-foreground)]' },
    { variant: 'filled', tone: 'warning', class: 'bg-[var(--dz-warning-solid)] text-[var(--dz-warning-foreground)]' },
    { variant: 'filled', tone: 'danger', class: 'bg-[var(--dz-danger-solid)] text-[var(--dz-danger-foreground)]' },
    { variant: 'filled', tone: 'info', class: 'bg-[var(--dz-info-solid)] text-[var(--dz-info-foreground)]' },

    // -- Outline + tone --
    { variant: 'outline', tone: 'primary', class: 'border-[var(--dz-primary-solid)] text-[var(--dz-primary-muted-foreground)]' },
    { variant: 'outline', tone: 'neutral', class: 'border-[var(--dz-border)] text-[var(--dz-foreground)]' },
    { variant: 'outline', tone: 'success', class: 'border-[var(--dz-success-solid)] text-[var(--dz-success-muted-foreground)]' },
    { variant: 'outline', tone: 'warning', class: 'border-[var(--dz-warning)] text-[var(--dz-warning-muted-foreground)]' },
    { variant: 'outline', tone: 'danger', class: 'border-[var(--dz-danger-solid)] text-[var(--dz-danger-muted-foreground)]' },
    { variant: 'outline', tone: 'info', class: 'border-[var(--dz-info-solid)] text-[var(--dz-info-muted-foreground)]' },

    // -- Subtle + tone --
    { variant: 'subtle', tone: 'primary', class: 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]' },
    { variant: 'subtle', tone: 'neutral', class: 'bg-[var(--dz-muted)] text-[var(--dz-foreground)]' },
    { variant: 'subtle', tone: 'success', class: 'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]' },
    { variant: 'subtle', tone: 'warning', class: 'bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)]' },
    { variant: 'subtle', tone: 'danger', class: 'bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)]' },
    { variant: 'subtle', tone: 'info', class: 'bg-[var(--dz-info-muted)] text-[var(--dz-info-muted-foreground)]' },

    // -- Ghost + tone --
    { variant: 'ghost', tone: 'primary', class: 'text-[var(--dz-primary-muted-foreground)]' },
    { variant: 'ghost', tone: 'neutral', class: 'text-[var(--dz-foreground)]' },
    { variant: 'ghost', tone: 'success', class: 'text-[var(--dz-success-muted-foreground)]' },
    { variant: 'ghost', tone: 'warning', class: 'text-[var(--dz-warning-muted-foreground)]' },
    { variant: 'ghost', tone: 'danger', class: 'text-[var(--dz-danger-muted-foreground)]' },
    { variant: 'ghost', tone: 'info', class: 'text-[var(--dz-info-muted-foreground)]' },
  ],

  defaultVariants: {
    variant: 'subtle',
    tone: 'info',
  },
})

/** Variant prop types extracted from the tv() definition */
export type AlertVariantProps = VariantProps<typeof alertVariants>
