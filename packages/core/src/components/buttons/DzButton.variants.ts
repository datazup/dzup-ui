/**
 * DzButton — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 * Component token tier (--dz-button-*) overrides where available.
 *
 * @module @dzup-ui/core/components/buttons/DzButton.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-[var(--dz-button-font-weight)]',
    'font-[family-name:var(--dz-button-font-family)]',
    'transition-[var(--dz-button-transition)]',
    'focus-visible:outline-none focus-visible:ring-[length:var(--dz-button-focus-ring-width)] focus-visible:ring-[var(--dz-button-focus-ring-color)] focus-visible:ring-offset-[length:var(--dz-button-focus-ring-offset)]',
    'disabled:pointer-events-none disabled:opacity-[var(--dz-button-disabled-opacity)]',
    'select-none',
  ].join(' '),

  variants: {
    variant: {
      solid: 'shadow-[var(--dz-shadow-xs)]',
      outline: 'border bg-transparent',
      ghost: 'bg-transparent',
      text: 'bg-transparent underline-offset-4 hover:underline',
      link: 'bg-transparent underline underline-offset-4',
    },

    size: {
      xs: [
        'h-[var(--dz-button-xs-height)]',
        'px-[var(--dz-button-xs-padding-x)]',
        'text-[length:var(--dz-button-xs-font-size)]',
        'gap-[var(--dz-button-xs-gap)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      sm: [
        'h-[var(--dz-button-sm-height)]',
        'px-[var(--dz-button-sm-padding-x)]',
        'text-[length:var(--dz-button-sm-font-size)]',
        'gap-[var(--dz-button-sm-gap)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      md: [
        'h-[var(--dz-button-md-height)]',
        'px-[var(--dz-button-md-padding-x)]',
        'text-[length:var(--dz-button-md-font-size)]',
        'gap-[var(--dz-button-md-gap)]',
        'rounded-[var(--dz-button-radius)]',
      ].join(' '),
      lg: [
        'h-[var(--dz-button-lg-height)]',
        'px-[var(--dz-button-lg-padding-x)]',
        'text-[length:var(--dz-button-lg-font-size)]',
        'gap-[var(--dz-button-lg-gap)]',
        'rounded-[var(--dz-button-radius)]',
      ].join(' '),
      xl: [
        'h-[var(--dz-button-xl-height)]',
        'px-[var(--dz-button-xl-padding-x)]',
        'text-[length:var(--dz-button-xl-font-size)]',
        'gap-[var(--dz-button-xl-gap)]',
        'rounded-[var(--dz-radius-lg)]',
      ].join(' '),
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
    { variant: 'solid', tone: 'primary', class: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] hover:bg-[var(--dz-primary-hover)]' },
    { variant: 'solid', tone: 'neutral', class: 'bg-[var(--dz-foreground)] text-[var(--dz-background)] hover:bg-[var(--dz-foreground)]/90' },
    { variant: 'solid', tone: 'success', class: 'bg-[var(--dz-success)] text-[var(--dz-success-foreground)] hover:bg-[var(--dz-success)]/90' },
    { variant: 'solid', tone: 'warning', class: 'bg-[var(--dz-warning)] text-[var(--dz-warning-foreground)] hover:bg-[var(--dz-warning)]/90' },
    { variant: 'solid', tone: 'danger', class: 'bg-[var(--dz-danger)] text-[var(--dz-danger-foreground)] hover:bg-[var(--dz-danger)]/90' },
    { variant: 'solid', tone: 'info', class: 'bg-[var(--dz-info)] text-[var(--dz-info-foreground)] hover:bg-[var(--dz-info)]/90' },

    // ── Outline + tone ──
    { variant: 'outline', tone: 'primary', class: 'border-[var(--dz-primary)] text-[var(--dz-primary)] hover:bg-[var(--dz-primary-muted)]' },
    { variant: 'outline', tone: 'neutral', class: 'border-[var(--dz-border)] text-[var(--dz-foreground)] hover:bg-[var(--dz-muted)]' },
    { variant: 'outline', tone: 'success', class: 'border-[var(--dz-success)] text-[var(--dz-success)] hover:bg-[var(--dz-success-muted)]' },
    { variant: 'outline', tone: 'warning', class: 'border-[var(--dz-warning)] text-[var(--dz-warning)] hover:bg-[var(--dz-warning-muted)]' },
    { variant: 'outline', tone: 'danger', class: 'border-[var(--dz-danger)] text-[var(--dz-danger)] hover:bg-[var(--dz-danger-muted)]' },
    { variant: 'outline', tone: 'info', class: 'border-[var(--dz-info)] text-[var(--dz-info)] hover:bg-[var(--dz-info-muted)]' },

    // ── Ghost + tone ──
    { variant: 'ghost', tone: 'primary', class: 'text-[var(--dz-primary)] hover:bg-[var(--dz-primary-muted)]' },
    { variant: 'ghost', tone: 'neutral', class: 'text-[var(--dz-foreground)] hover:bg-[var(--dz-muted)]' },
    { variant: 'ghost', tone: 'success', class: 'text-[var(--dz-success)] hover:bg-[var(--dz-success-muted)]' },
    { variant: 'ghost', tone: 'warning', class: 'text-[var(--dz-warning)] hover:bg-[var(--dz-warning-muted)]' },
    { variant: 'ghost', tone: 'danger', class: 'text-[var(--dz-danger)] hover:bg-[var(--dz-danger-muted)]' },
    { variant: 'ghost', tone: 'info', class: 'text-[var(--dz-info)] hover:bg-[var(--dz-info-muted)]' },

    // ── Text + tone ──
    { variant: 'text', tone: 'primary', class: 'text-[var(--dz-primary)]' },
    { variant: 'text', tone: 'neutral', class: 'text-[var(--dz-foreground)]' },
    { variant: 'text', tone: 'success', class: 'text-[var(--dz-success)]' },
    { variant: 'text', tone: 'warning', class: 'text-[var(--dz-warning)]' },
    { variant: 'text', tone: 'danger', class: 'text-[var(--dz-danger)]' },
    { variant: 'text', tone: 'info', class: 'text-[var(--dz-info)]' },

    // ── Link + tone ──
    { variant: 'link', tone: 'primary', class: 'text-[var(--dz-primary)]' },
    { variant: 'link', tone: 'neutral', class: 'text-[var(--dz-foreground)]' },
    { variant: 'link', tone: 'success', class: 'text-[var(--dz-success)]' },
    { variant: 'link', tone: 'warning', class: 'text-[var(--dz-warning)]' },
    { variant: 'link', tone: 'danger', class: 'text-[var(--dz-danger)]' },
    { variant: 'link', tone: 'info', class: 'text-[var(--dz-info)]' },
  ],

  defaultVariants: {
    variant: 'solid',
    size: 'md',
    tone: 'primary',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ButtonVariantProps = VariantProps<typeof buttonVariants>
