/**
 * DzTag — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/data/DzTag.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tagVariants = tv({
  base: [
    'inline-flex items-center gap-[var(--dz-spacing-1)]',
    'font-medium',
    'rounded-[var(--dz-radius-md)]',
    'transition-[var(--dz-transition-fast)]',
    'dz-focus-ring-control dz-disabled-control',
  ].join(' '),

  variants: {
    variant: {
      solid: '',
      outline: 'border bg-transparent',
      subtle: '',
    },

    size: {
      icon: '',
      xs: 'h-[var(--dz-spacing-5)] px-[var(--dz-spacing-1-5)] text-[length:var(--dz-text-xs)]',
      sm: 'h-[var(--dz-spacing-5)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
      md: 'h-[var(--dz-spacing-6)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
      lg: 'h-[var(--dz-spacing-7)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
      xl: 'h-[var(--dz-spacing-7)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
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
    // ── Solid + tone ──
    { variant: 'solid', tone: 'primary', class: 'bg-[var(--dz-primary-solid)] text-[var(--dz-primary-foreground)]' },
    { variant: 'solid', tone: 'neutral', class: 'bg-[var(--dz-foreground)] text-[var(--dz-background)]' },
    { variant: 'solid', tone: 'success', class: 'bg-[var(--dz-success-solid)] text-[var(--dz-success-foreground)]' },
    { variant: 'solid', tone: 'warning', class: 'bg-[var(--dz-warning-solid)] text-[var(--dz-warning-foreground)]' },
    { variant: 'solid', tone: 'danger', class: 'bg-[var(--dz-danger-solid)] text-[var(--dz-danger-foreground)]' },
    { variant: 'solid', tone: 'info', class: 'bg-[var(--dz-info-solid)] text-[var(--dz-info-foreground)]' },

    // ── Outline + tone ──
    {
      variant: 'outline',
      tone: 'primary',
      class: 'border-[var(--dz-primary-solid)] text-[var(--dz-primary-muted-foreground)]',
    },
    {
      variant: 'outline',
      tone: 'neutral',
      class: 'border-[var(--dz-border)] text-[var(--dz-foreground)]',
    },
    {
      variant: 'outline',
      tone: 'success',
      class: 'border-[var(--dz-success-solid)] text-[var(--dz-success-muted-foreground)]',
    },
    {
      variant: 'outline',
      tone: 'warning',
      class: 'border-[var(--dz-warning)] text-[var(--dz-warning-muted-foreground)]',
    },
    {
      variant: 'outline',
      tone: 'danger',
      class: 'border-[var(--dz-danger-solid)] text-[var(--dz-danger-muted-foreground)]',
    },
    { variant: 'outline', tone: 'info', class: 'border-[var(--dz-info-solid)] text-[var(--dz-info-muted-foreground)]' },

    // ── Subtle + tone ──
    {
      variant: 'subtle',
      tone: 'primary',
      class: 'bg-[var(--dz-primary-muted)] text-[var(--dz-primary-muted-foreground)]',
    },
    {
      variant: 'subtle',
      tone: 'neutral',
      class: 'bg-[var(--dz-muted)] text-[var(--dz-foreground)]',
    },
    {
      variant: 'subtle',
      tone: 'success',
      class: 'bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]',
    },
    {
      variant: 'subtle',
      tone: 'warning',
      class: 'bg-[var(--dz-warning-muted)] text-[var(--dz-warning-muted-foreground)]',
    },
    {
      variant: 'subtle',
      tone: 'danger',
      class: 'bg-[var(--dz-danger-muted)] text-[var(--dz-danger-muted-foreground)]',
    },
    { variant: 'subtle', tone: 'info', class: 'bg-[var(--dz-info-muted)] text-[var(--dz-info-muted-foreground)]' },
  ],

  defaultVariants: {
    variant: 'subtle',
    size: 'md',
    tone: 'neutral',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TagVariantProps = VariantProps<typeof tagVariants>
