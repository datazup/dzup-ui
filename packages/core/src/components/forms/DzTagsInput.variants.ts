/**
 * DzTagsInput — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * Anatomy:
 *   root   — outer wrapper (flex column: field + error)
 *   field  — input-like shell holding the chips and the text input (flex-wrap)
 *   input  — the inner native text field (transparent, borderless)
 *   error  — validation message
 *
 * Committed tokens are rendered with DzChip, so their styling lives in the
 * `--dz-chip-*` / tone families rather than here.
 *
 * @module @dzup-ui/core/components/forms/DzTagsInput.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const tagsInputVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-[var(--dz-spacing-1)] w-full',
    field: [
      'inline-flex items-center flex-wrap gap-[var(--dz-spacing-1)]',
      'w-full',
      'rounded-[var(--dz-radius-md)]',
      'bg-[var(--dz-background)]',
      'text-[var(--dz-foreground)]',
      'cursor-text',
      'transition-[var(--dz-transition-fast)]',
      'dz-focus-within-ring-input dz-disabled-input-shell',
      'motion-reduce:transition-none',
    ].join(' '),
    input: [
      'dz-field-input-reset',
      'flex-1 min-w-[60px] border-none bg-transparent shadow-none appearance-none',
      'outline-none focus:outline-none focus-visible:outline-none',
      'focus:ring-0 focus-visible:ring-0',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-muted-foreground)]',
      'disabled:cursor-not-allowed',
    ].join(' '),
    error: 'text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]',
  },
  variants: {
    variant: {
      outline: { field: 'border border-[var(--dz-border)] focus-within:border-[var(--dz-input-border-focus)]' },
      filled: { field: 'bg-[var(--dz-muted)] border border-transparent' },
      underlined: { field: 'border-b border-[var(--dz-border)] rounded-none focus-within:border-[var(--dz-input-border-focus)] focus-within:outline-none' },
    },
    size: {
      icon: { field: '', input: '' },
      xs: {
        field: 'min-h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)] py-[var(--dz-spacing-0_5)] text-[length:var(--dz-input-xs-font-size)]',
        input: 'text-[length:var(--dz-input-xs-font-size)]',
      },
      sm: {
        field: 'min-h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)] py-[var(--dz-spacing-0_5)] text-[length:var(--dz-input-sm-font-size)]',
        input: 'text-[length:var(--dz-input-sm-font-size)]',
      },
      md: {
        field: 'min-h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-md-font-size)]',
        input: 'text-[length:var(--dz-input-md-font-size)]',
      },
      lg: {
        field: 'min-h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)] py-[var(--dz-spacing-1)] text-[length:var(--dz-input-lg-font-size)]',
        input: 'text-[length:var(--dz-input-lg-font-size)]',
      },
      xl: {
        field: 'min-h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-input-xl-font-size)]',
        input: 'text-[length:var(--dz-input-xl-font-size)]',
      },
    },
    invalid: {
      true: { field: 'border-[var(--dz-danger)] focus-within:border-[var(--dz-danger)] focus-within:outline-[var(--dz-danger)]' },
    },
    /** Transient danger flash applied when a token is rejected. */
    flash: {
      true: { field: 'border-[var(--dz-danger)] outline outline-2 outline-[var(--dz-danger)] outline-offset-0' },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TagsInputVariantProps = VariantProps<typeof tagsInputVariants>
