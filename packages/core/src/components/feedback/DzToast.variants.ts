/**
 * DzToast — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzup-ui/core/components/feedback/DzToast.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const toastVariants = tv({
  slots: {
    viewport: [
      'fixed z-[100]',
      'flex flex-col gap-[var(--dz-spacing-2)]',
      'p-[var(--dz-spacing-4)]',
      'max-h-screen',
      'w-[390px] max-w-[100vw]',
      'outline-none',
    ].join(' '),
    root: [
      'group pointer-events-auto relative',
      'flex items-start gap-[var(--dz-spacing-3)]',
      'w-full',
      'overflow-hidden rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'p-[var(--dz-spacing-4)]',
      'shadow-[var(--dz-shadow-lg)]',
      'transition-all',
      'data-[swipe=cancel]:translate-x-0',
      'data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)]',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-80',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-full',
    ].join(' '),
    title: [
      'text-[length:var(--dz-text-sm)]',
      'font-semibold',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    description: [
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'mt-[var(--dz-spacing-1)]',
    ].join(' '),
    actionButton: [
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'h-7 px-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-xs)]',
      'font-medium',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-ring-button',
    ].join(' '),
    closeButton: [
      'absolute right-[var(--dz-spacing-1)] top-[var(--dz-spacing-1)]',
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'h-5 w-5',
      'text-[var(--dz-muted-foreground)]',
      'opacity-0 group-hover:opacity-100',
      'hover:text-[var(--dz-foreground)]',
      'transition-[var(--dz-transition-fast)]',
      'focus-visible:opacity-100 dz-focus-ring-button',
    ].join(' '),
    toneIndicator: [
      'absolute left-0 top-0 bottom-0 w-1',
    ].join(' '),
  },
  variants: {
    tone: {
      neutral: {
        root: 'border-[var(--dz-border)]',
        actionButton: 'bg-[var(--dz-foreground)] text-[var(--dz-background)] hover:bg-[var(--dz-foreground)]/90',
        toneIndicator: 'bg-[var(--dz-foreground)]',
      },
      primary: {
        root: 'border-[var(--dz-primary)]/30',
        actionButton: 'bg-[var(--dz-primary)] text-[var(--dz-primary-foreground)] hover:bg-[var(--dz-primary-hover)]',
        toneIndicator: 'bg-[var(--dz-primary)]',
      },
      success: {
        root: 'border-[var(--dz-success)]/30',
        actionButton: 'bg-[var(--dz-success)] text-[var(--dz-success-foreground)] hover:bg-[var(--dz-success)]/90',
        toneIndicator: 'bg-[var(--dz-success)]',
      },
      warning: {
        root: 'border-[var(--dz-warning)]/30',
        actionButton: 'bg-[var(--dz-warning)] text-[var(--dz-warning-foreground)] hover:bg-[var(--dz-warning)]/90',
        toneIndicator: 'bg-[var(--dz-warning)]',
      },
      danger: {
        root: 'border-[var(--dz-danger)]/30',
        actionButton: 'bg-[var(--dz-danger)] text-[var(--dz-danger-foreground)] hover:bg-[var(--dz-danger)]/90',
        toneIndicator: 'bg-[var(--dz-danger)]',
      },
      info: {
        root: 'border-[var(--dz-info)]/30',
        actionButton: 'bg-[var(--dz-info)] text-[var(--dz-info-foreground)] hover:bg-[var(--dz-info)]/90',
        toneIndicator: 'bg-[var(--dz-info)]',
      },
    },
    position: {
      'top-right': { viewport: 'top-0 right-0' },
      'top-left': { viewport: 'top-0 left-0' },
      'bottom-right': { viewport: 'bottom-0 right-0' },
      'bottom-left': { viewport: 'bottom-0 left-0' },
      'top-center': { viewport: 'top-0 left-1/2 -translate-x-1/2' },
      'bottom-center': { viewport: 'bottom-0 left-1/2 -translate-x-1/2' },
    },
  },
  defaultVariants: {
    tone: 'neutral',
    position: 'bottom-right',
  },
})

/** Variant prop types extracted from the tv() definition */
export type ToastVariantProps = VariantProps<typeof toastVariants>
