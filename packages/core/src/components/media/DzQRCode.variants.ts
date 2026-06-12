/**
 * DzQRCode — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/media/DzQRCode.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const qrCodeVariants = tv({
  slots: {
    root: [
      'relative inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'p-[var(--dz-qrcode-padding,0.5rem)]',
    ].join(' '),
    svg: 'block h-full w-full',
    logo: [
      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      'flex items-center justify-center overflow-hidden',
      'rounded-[var(--dz-radius-sm)]',
      'bg-[var(--dz-background)] p-1',
    ].join(' '),
    logoImg: 'h-full w-full object-contain',
    overlay: [
      'absolute inset-0 z-10',
      'flex flex-col items-center justify-center gap-2',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]/80 backdrop-blur-[1px]',
      'text-[var(--dz-muted-foreground)] text-sm',
    ].join(' '),
    spinner: 'h-6 w-6 animate-spin text-[var(--dz-muted-foreground)]',
    refresh: [
      'inline-flex items-center gap-1.5 rounded-[var(--dz-radius-sm)]',
      'border border-[var(--dz-border)] px-3 py-1 text-sm font-medium',
      'text-[var(--dz-foreground)]',
      'transition-colors hover:bg-[var(--dz-muted)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dz-primary)]',
    ].join(' '),
  },

  variants: {
    status: {
      active: {},
      loading: {},
      expired: {},
    },
  },

  defaultVariants: {
    status: 'active',
  },
})

/** Variant prop types extracted from the tv() definition */
export type QRCodeVariantProps = VariantProps<typeof qrCodeVariants>
