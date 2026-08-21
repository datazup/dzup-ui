/**
 * DzTabs — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/navigation/DzTabs.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tabsVariants = tv({
  slots: {
    root: 'flex',
    list: [
      'inline-flex items-center',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    trigger: [
      'inline-flex items-center justify-center whitespace-nowrap',
      'font-medium',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-control dz-disabled-control',
      'data-[state=active]:text-[var(--dz-foreground)]',
    ].join(' '),
    content: [
      'mt-[var(--dz-spacing-2)]',
      'dz-focus-ring-control',
    ].join(' '),
  },

  variants: {
    variant: {
      line: {
        list: 'border-b border-[var(--dz-border)]',
        trigger: [
          'border-b-2 border-transparent',
          '-mb-px',
          'hover:text-[var(--dz-foreground)]',
        ].join(' '),
      },
      enclosed: {
        list: 'border-b border-[var(--dz-border)]',
        trigger: [
          'rounded-t-[var(--dz-radius-md)]',
          'border border-transparent',
          '-mb-px',
          'data-[state=active]:border-[var(--dz-border)]',
          'data-[state=active]:border-b-[var(--dz-background)]',
          'data-[state=active]:bg-[var(--dz-background)]',
          'hover:text-[var(--dz-foreground)]',
        ].join(' '),
      },
      pills: {
        list: 'gap-[var(--dz-spacing-1)]',
        trigger: [
          'rounded-[var(--dz-radius-md)]',
          'hover:bg-[var(--dz-muted)]',
        ].join(' '),
      },
    },

    tone: {
      neutral: '',
      primary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
    },

    size: {
      icon: '',
      xs: {
        trigger: 'h-[var(--dz-button-xs-height)] px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        trigger: 'h-[var(--dz-button-sm-height)] px-[var(--dz-spacing-3)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        trigger: 'h-[var(--dz-button-md-height)] px-[var(--dz-spacing-4)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        trigger: 'h-[var(--dz-button-lg-height)] px-[var(--dz-spacing-6)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        trigger: 'h-[var(--dz-button-xl-height)] px-[var(--dz-spacing-8)] text-[length:var(--dz-text-lg)]',
      },
    },

    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'flex-row',
      },
      vertical: {
        root: 'flex-row',
        list: 'flex-col',
        content: 'mt-0 ms-[var(--dz-spacing-2)]',
      },
    },
  },

  compoundVariants: [
    // ── line variant + tone (active underline + active text color) ──
    { variant: 'line', tone: 'primary', class: { trigger: 'data-[state=active]:border-[var(--dz-primary-solid)] data-[state=active]:text-[var(--dz-primary)]' } },
    { variant: 'line', tone: 'neutral', class: { trigger: 'data-[state=active]:border-[var(--dz-foreground)] data-[state=active]:text-[var(--dz-foreground)]' } },
    { variant: 'line', tone: 'success', class: { trigger: 'data-[state=active]:border-[var(--dz-success-solid)] data-[state=active]:text-[var(--dz-success)]' } },
    { variant: 'line', tone: 'warning', class: { trigger: 'data-[state=active]:border-[var(--dz-warning)] data-[state=active]:text-[var(--dz-warning)]' } },
    { variant: 'line', tone: 'danger', class: { trigger: 'data-[state=active]:border-[var(--dz-danger-solid)] data-[state=active]:text-[var(--dz-danger)]' } },
    { variant: 'line', tone: 'info', class: { trigger: 'data-[state=active]:border-[var(--dz-info-solid)] data-[state=active]:text-[var(--dz-info)]' } },

    // ── enclosed variant + tone (active text color; border stays neutral so the tab joins the panel cleanly) ──
    { variant: 'enclosed', tone: 'primary', class: { trigger: 'data-[state=active]:text-[var(--dz-primary)]' } },
    { variant: 'enclosed', tone: 'neutral', class: { trigger: 'data-[state=active]:text-[var(--dz-foreground)]' } },
    { variant: 'enclosed', tone: 'success', class: { trigger: 'data-[state=active]:text-[var(--dz-success)]' } },
    { variant: 'enclosed', tone: 'warning', class: { trigger: 'data-[state=active]:text-[var(--dz-warning)]' } },
    { variant: 'enclosed', tone: 'danger', class: { trigger: 'data-[state=active]:text-[var(--dz-danger)]' } },
    { variant: 'enclosed', tone: 'info', class: { trigger: 'data-[state=active]:text-[var(--dz-info)]' } },

    // ── pills variant + tone (active background + foreground) ──
    { variant: 'pills', tone: 'primary', class: { trigger: 'data-[state=active]:bg-[var(--dz-primary-solid)] data-[state=active]:text-[var(--dz-primary-foreground)] data-[state=active]:hover:bg-[var(--dz-primary-solid-hover)]' } },
    { variant: 'pills', tone: 'neutral', class: { trigger: 'data-[state=active]:bg-[var(--dz-foreground)] data-[state=active]:text-[var(--dz-background)]' } },
    { variant: 'pills', tone: 'success', class: { trigger: 'data-[state=active]:bg-[var(--dz-success-solid)] data-[state=active]:text-[var(--dz-success-foreground)]' } },
    { variant: 'pills', tone: 'warning', class: { trigger: 'data-[state=active]:bg-[var(--dz-warning-solid)] data-[state=active]:text-[var(--dz-warning-foreground)] data-[state=active]:hover:bg-[var(--dz-warning-solid-hover)]' } },
    { variant: 'pills', tone: 'danger', class: { trigger: 'data-[state=active]:bg-[var(--dz-danger-solid)] data-[state=active]:text-[var(--dz-danger-foreground)]' } },
    { variant: 'pills', tone: 'info', class: { trigger: 'data-[state=active]:bg-[var(--dz-info-solid)] data-[state=active]:text-[var(--dz-info-foreground)]' } },

    // ── Vertical orientation re-layout (tone-agnostic) ──
    {
      variant: 'line',
      orientation: 'vertical',
      class: {
        list: 'border-b-0 border-e border-[var(--dz-border)]',
        trigger: 'border-b-0 border-e-2 border-transparent -me-px mb-0',
      },
    },
    {
      variant: 'enclosed',
      orientation: 'vertical',
      class: {
        list: 'border-b-0 border-e border-[var(--dz-border)]',
        trigger: 'rounded-t-none rounded-s-[var(--dz-radius-md)] border-b-transparent -me-px mb-0 data-[state=active]:border-e-[var(--dz-background)]',
      },
    },
  ],

  defaultVariants: {
    variant: 'line',
    size: 'md',
    tone: 'primary',
    orientation: 'horizontal',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TabsVariantProps = VariantProps<typeof tabsVariants>
