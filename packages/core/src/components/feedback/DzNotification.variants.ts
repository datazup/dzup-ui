/**
 * DzNotification — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Uses --dz-* CSS variables exclusively.
 *
 * @module @dzup-ui/core/components/feedback/DzNotification.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const notificationVariants = tv({
  base: [
    'relative flex gap-[var(--dz-spacing-3)] p-[var(--dz-spacing-4)]',
    'rounded-[var(--dz-radius-lg)]',
    'border border-[var(--dz-border)]',
    'bg-[var(--dz-background)]',
    'shadow-[var(--dz-shadow-md)]',
    'text-[var(--dz-foreground)]',
    'transition-all duration-200',
    'data-[state=closed]:opacity-0 data-[state=closed]:translate-x-full',
    '[&>svg]:shrink-0 [&>svg]:mt-0.5',
  ].join(' '),

  variants: {
    tone: {
      neutral: 'border-[var(--dz-border)]',
      primary: 'border-l-4 border-l-[var(--dz-primary)]',
      success: 'border-l-4 border-l-[var(--dz-success)]',
      warning: 'border-l-4 border-l-[var(--dz-warning)]',
      danger: 'border-l-4 border-l-[var(--dz-danger)]',
      info: 'border-l-4 border-l-[var(--dz-info)]',
    },
  },

  defaultVariants: {
    tone: 'neutral',
  },
})

export const notificationTitleVariants = tv({
  base: 'font-medium text-[length:var(--dz-text-sm)]',
})

export const notificationDescriptionVariants = tv({
  base: 'text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
})

export const notificationCloseVariants = tv({
  base: [
    'absolute right-[var(--dz-spacing-2)] top-[var(--dz-spacing-2)]',
    'inline-flex items-center justify-center',
    'h-6 w-6 rounded-[var(--dz-radius-sm)]',
    'opacity-70 transition-opacity',
    'hover:opacity-100',
    'dz-focus-ring-button',
  ].join(' '),
})

/** Variant prop types */
export type NotificationVariantProps = VariantProps<typeof notificationVariants>
