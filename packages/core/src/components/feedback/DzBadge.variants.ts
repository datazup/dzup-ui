/**
 * DzBadge — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/DzBadge.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const badgeVariants = tv({
  base: [
    'inline-flex items-center justify-center',
    'font-medium whitespace-nowrap',
    'rounded-[var(--dz-radius-full)]',
    'select-none',
  ].join(' '),

  variants: {
    variant: {
      solid: '',
      outline: 'border bg-transparent',
      subtle: '',
    },

    size: {
      icon: '',
      xs: 'px-[var(--dz-spacing-1_5)] py-0.5 text-[length:var(--dz-text-xs)]',
      sm: 'px-[var(--dz-spacing-2)] py-0.5 text-[length:var(--dz-text-xs)]',
      md: 'px-[var(--dz-spacing-2)] py-0.5 text-[length:var(--dz-text-xs)]',
      lg: 'px-[var(--dz-spacing-3)] py-1 text-[length:var(--dz-text-sm)]',
      xl: 'px-[var(--dz-spacing-3)] py-1 text-[length:var(--dz-text-sm)]',
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
    // -- Solid + tone --
    { variant: 'solid', tone: 'primary', class: 'bg-[var(--dz-primary-solid)] text-[var(--dz-primary-foreground)]' },
    { variant: 'solid', tone: 'neutral', class: 'bg-[var(--dz-foreground)] text-[var(--dz-background)]' },
    { variant: 'solid', tone: 'success', class: 'bg-[var(--dz-success-solid)] text-[var(--dz-success-foreground)]' },
    { variant: 'solid', tone: 'warning', class: 'bg-[var(--dz-warning-solid)] text-[var(--dz-warning-foreground)]' },
    { variant: 'solid', tone: 'danger', class: 'bg-[var(--dz-danger-solid)] text-[var(--dz-danger-foreground)]' },
    { variant: 'solid', tone: 'info', class: 'bg-[var(--dz-info-solid)] text-[var(--dz-info-foreground)]' },

    // -- Outline + tone --
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

    // -- Subtle + tone --
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
    variant: 'solid',
    size: 'md',
    tone: 'neutral',
  },
})

/** Variant prop types extracted from the tv() definition */
export type BadgeVariantProps = VariantProps<typeof badgeVariants>
