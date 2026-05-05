/**
 * DzFileUpload — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/forms/DzFileUpload.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const fileUploadVariants = tv({
  slots: {
    root: [
      'flex flex-col',
      'gap-[var(--dz-spacing-2)]',
    ].join(' '),
    dropzone: [
      'relative flex flex-col items-center justify-center',
      'rounded-[var(--dz-radius-lg)]',
      'border-2 border-dashed border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-muted-foreground)]',
      'cursor-pointer',
      'transition-colors',
      'hover:border-[var(--dz-primary)] hover:bg-[var(--dz-muted)]',
      'dz-focus-ring-input',
      '@media(prefers-reduced-motion:reduce){transition:none}',
    ].join(' '),
    dropzoneDragOver: [
      'border-[var(--dz-primary)]',
      'bg-[var(--dz-muted)]',
    ].join(' '),
    icon: [
      'mb-[var(--dz-spacing-2)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    label: [
      'text-[length:var(--dz-text-sm)]',
      'font-medium',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    hint: [
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
    fileList: [
      'flex flex-col',
      'gap-[var(--dz-spacing-1)]',
    ].join(' '),
    fileItem: [
      'flex items-center justify-between',
      'rounded-[var(--dz-radius-md)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'px-[var(--dz-spacing-3)]',
      'py-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-foreground)]',
    ].join(' '),
    fileName: [
      'flex-1 truncate',
    ].join(' '),
    fileSize: [
      'ml-[var(--dz-spacing-2)]',
      'text-[length:var(--dz-text-xs)]',
      'text-[var(--dz-muted-foreground)]',
      'shrink-0',
    ].join(' '),
    removeButton: [
      'ml-[var(--dz-spacing-2)]',
      'shrink-0',
      'inline-flex items-center justify-center',
      'rounded-[var(--dz-radius-sm)]',
      'text-[var(--dz-muted-foreground)]',
      'hover:text-[var(--dz-danger)]',
      'transition-colors',
      'dz-focus-ring-button dz-disabled-button',
    ].join(' '),
  },
  variants: {
    size: {
      xs: { dropzone: 'p-[var(--dz-spacing-3)]' },
      sm: { dropzone: 'p-[var(--dz-spacing-4)]' },
      md: { dropzone: 'p-[var(--dz-spacing-6)]' },
      lg: { dropzone: 'p-[var(--dz-spacing-8)]' },
      xl: { dropzone: 'p-[var(--dz-spacing-10)]' },
    },
    invalid: {
      true: {
        dropzone: 'border-[var(--dz-danger)]',
      },
    },
    disabled: {
      true: {
        root: 'dz-disabled-input-shell',
        dropzone: 'cursor-not-allowed',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type FileUploadVariantProps = VariantProps<typeof fileUploadVariants>
