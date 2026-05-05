/**
 * DzConfirmDialog -- tailwind-variants (tv) style definitions.
 *
 * Slot-based compound variant pattern for confirm dialog layout.
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzConfirmDialog.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const confirmDialogVariants = tv({
  slots: {
    root: '',
    icon: 'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
    title: 'text-center text-[length:var(--dz-text-lg)] font-semibold text-[var(--dz-foreground)]',
    message: 'text-center text-[length:var(--dz-text-sm)] text-[var(--dz-muted-foreground)]',
    actions: 'flex justify-end gap-[var(--dz-spacing-3)] pt-[var(--dz-spacing-4)]',
  },
  variants: {
    variant: {
      default: {
        icon: 'bg-[var(--dz-colors-primary-100,theme(colors.blue.100))] text-[var(--dz-colors-primary-600,theme(colors.blue.600))]',
      },
      danger: {
        icon: 'bg-[var(--dz-colors-destructive-100,theme(colors.red.100))] text-[var(--dz-colors-destructive-600,theme(colors.red.600))]',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ConfirmDialogVariantProps = VariantProps<typeof confirmDialogVariants>
