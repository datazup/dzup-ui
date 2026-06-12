/**
 * DzDescriptions + DzDescriptionsItem — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). Responsive column
 * counts are driven by the `--dz-descriptions-cols-*` CSS variables set inline
 * on the root, so the grid stays SSR-safe (no JS media queries).
 *
 * @module @dzup-ui/core/components/data/DzDescriptions.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const descriptionsVariants = tv({
  slots: {
    root: [
      'grid w-full m-0',
      'font-[var(--dz-font-sans)] text-[var(--dz-foreground)]',
      '[grid-template-columns:repeat(var(--dz-descriptions-cols-base),minmax(0,1fr))]',
      'sm:[grid-template-columns:repeat(var(--dz-descriptions-cols-sm),minmax(0,1fr))]',
      'md:[grid-template-columns:repeat(var(--dz-descriptions-cols-md),minmax(0,1fr))]',
      'lg:[grid-template-columns:repeat(var(--dz-descriptions-cols-lg),minmax(0,1fr))]',
      'xl:[grid-template-columns:repeat(var(--dz-descriptions-cols-xl),minmax(0,1fr))]',
    ],
    group: 'min-w-0',
    term: [
      'min-w-0',
      'text-[var(--dz-descriptions-label-color,var(--dz-muted-foreground))]',
      'font-[var(--dz-font-medium)]',
    ],
    detail: [
      'min-w-0 m-0 break-words',
      'text-[var(--dz-descriptions-value-color,var(--dz-foreground))]',
    ],
  },

  variants: {
    layout: {
      horizontal: {
        group: 'flex flex-row items-stretch',
        term: 'shrink-0',
      },
      vertical: {
        group: 'flex flex-col',
      },
    },

    size: {
      icon: '',
      xs: {
        term: 'text-[length:var(--dz-text-xs)]',
        detail: 'text-[length:var(--dz-text-xs)]',
      },
      sm: {
        term: 'text-[length:var(--dz-text-sm)]',
        detail: 'text-[length:var(--dz-text-sm)]',
      },
      md: {
        term: 'text-[length:var(--dz-text-sm)]',
        detail: 'text-[length:var(--dz-text-sm)]',
      },
      lg: {
        term: 'text-[length:var(--dz-text-base)]',
        detail: 'text-[length:var(--dz-text-base)]',
      },
      xl: {
        term: 'text-[length:var(--dz-text-lg)]',
        detail: 'text-[length:var(--dz-text-lg)]',
      },
    },

    bordered: {
      true: {
        root: [
          'gap-px overflow-hidden',
          'bg-[var(--dz-descriptions-border-color,var(--dz-border))]',
          'border-[length:1px] border-[var(--dz-descriptions-border-color,var(--dz-border))]',
          'rounded-[var(--dz-radius-md)]',
        ],
        group: 'gap-px bg-[var(--dz-descriptions-border-color,var(--dz-border))]',
        term: 'bg-[var(--dz-descriptions-label-bg,var(--dz-muted))]',
        detail: 'flex-1 bg-[var(--dz-background)]',
      },
      false: {
        root: 'gap-x-[var(--dz-spacing-6)] gap-y-[var(--dz-spacing-3)]',
      },
    },
  },

  compoundVariants: [
    // ── Non-bordered spacing ────────────────────────────────────────────
    {
      layout: 'horizontal',
      bordered: false,
      class: {
        group: 'gap-[var(--dz-spacing-3)]',
        term: 'w-[var(--dz-descriptions-label-width,8rem)]',
      },
    },
    {
      layout: 'vertical',
      bordered: false,
      class: { group: 'gap-[var(--dz-spacing-1)]' },
    },

    // ── Bordered horizontal label column ────────────────────────────────
    {
      layout: 'horizontal',
      bordered: true,
      class: {
        term: 'flex items-center w-[var(--dz-descriptions-label-width,8rem)]',
      },
    },

    // ── Bordered cell padding per size ──────────────────────────────────
    {
      bordered: true,
      size: 'xs',
      class: {
        term: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
        detail: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)]',
      },
    },
    {
      bordered: true,
      size: 'sm',
      class: {
        term: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1)]',
        detail: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-1)]',
      },
    },
    {
      bordered: true,
      size: 'md',
      class: {
        term: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)]',
        detail: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)]',
      },
    },
    {
      bordered: true,
      size: 'lg',
      class: {
        term: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]',
        detail: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)]',
      },
    },
    {
      bordered: true,
      size: 'xl',
      class: {
        term: 'px-[var(--dz-spacing-5)] py-[var(--dz-spacing-4)]',
        detail: 'px-[var(--dz-spacing-5)] py-[var(--dz-spacing-4)]',
      },
    },
  ],

  defaultVariants: {
    layout: 'horizontal',
    size: 'md',
    bordered: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type DescriptionsVariantProps = VariantProps<typeof descriptionsVariants>
