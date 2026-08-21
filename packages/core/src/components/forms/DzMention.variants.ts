/**
 * DzMention — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * Anatomy:
 *   root      — outer wrapper (column: control + error)
 *   field     — position:relative anchor wrapping the control + menu
 *   control   — the <textarea> / <input> (shared --dz-input-* family)
 *   menu      — the anchored suggestion surface (shared menu family)
 *   list      — the role="listbox" scroll viewport
 *   item      — a single role="option" cell
 *   optionLabel — default option text
 *   helper    — empty / loading copy
 *
 * @module @dzup-ui/core/components/forms/DzMention.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const mentionVariants = tv({
  slots: {
    root: 'inline-flex flex-col gap-[var(--dz-spacing-1)] w-full',
    field: 'relative w-full',
    control: [
      'flex w-full',
      'font-[family-name:var(--dz-input-font-family)]',
      'text-[var(--dz-foreground)]',
      'placeholder:text-[var(--dz-input-placeholder)]',
      'transition-[var(--dz-input-transition)]',
      'dz-focus-ring-input dz-disabled-input',
    ].join(' '),
    // --- Suggestion menu (shared menu surface) ---
    menu: [
      'absolute z-50 min-w-[12rem] max-w-[20rem]',
      'flex flex-col',
      'rounded-[var(--dz-radius-lg)]',
      'border border-[var(--dz-border)]',
      'bg-[var(--dz-background)]',
      'shadow-[var(--dz-shadow-lg)]',
      'overflow-hidden',
    ].join(' '),
    list: [
      'flex flex-col',
      'max-h-60 overflow-y-auto',
      'py-[var(--dz-spacing-1)]',
      '[scrollbar-width:thin]',
      'list-none m-0',
    ].join(' '),
    item: [
      'w-full text-start',
      'inline-flex items-center gap-[var(--dz-spacing-2)]',
      'rounded-[var(--dz-radius-sm)]',
      'mx-[var(--dz-spacing-1)]',
      'cursor-pointer select-none',
      'text-[var(--dz-foreground)]',
      'transition-colors motion-reduce:transition-none',
      'hover:bg-[var(--dz-muted)]',
      'data-[active=true]:bg-[var(--dz-primary-muted)]',
      'data-[active=true]:text-[var(--dz-primary)]',
      'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--dz-input-disabled-opacity)]',
      'aria-disabled:hover:bg-transparent',
    ].join(' '),
    optionLabel: 'flex-1 truncate',
    helper: [
      'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-3)]',
      'text-center text-[length:var(--dz-text-sm)]',
      'text-[var(--dz-muted-foreground)]',
    ].join(' '),
  },

  variants: {
    variant: {
      outline: {
        control: [
          'border border-[var(--dz-input-border)]',
          'bg-[var(--dz-input-bg)]',
          'focus-visible:border-[var(--dz-input-border-focus)]',
        ].join(' '),
      },
      filled: {
        control: 'border-0 bg-[var(--dz-muted)]',
      },
      underlined: {
        control: [
          'border-0 border-b-2 border-[var(--dz-input-border)]',
          'rounded-none bg-transparent',
          'focus-visible:border-[var(--dz-input-border-focus)] focus-visible:outline-none',
        ].join(' '),
      },
    },

    size: {
      icon: '',
      xs: {
        control: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] rounded-[var(--dz-radius-sm)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        control: 'px-[var(--dz-input-sm-padding-x)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-input-sm-font-size)] rounded-[var(--dz-radius-sm)]',
        item: 'px-[var(--dz-spacing-2)] py-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-sm)]',
      },
      md: {
        control: 'px-[var(--dz-input-md-padding-x)] py-[var(--dz-spacing-2)] text-[length:var(--dz-input-md-font-size)] rounded-[var(--dz-input-radius)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2)] text-[length:var(--dz-text-sm)]',
      },
      lg: {
        control: 'px-[var(--dz-input-lg-padding-x)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-input-lg-font-size)] rounded-[var(--dz-input-radius)]',
        item: 'px-[var(--dz-spacing-3)] py-[var(--dz-spacing-2_5)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        control: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-lg)] rounded-[var(--dz-radius-lg)]',
        item: 'px-[var(--dz-spacing-4)] py-[var(--dz-spacing-3)] text-[length:var(--dz-text-base)]',
      },
    },

    invalid: {
      true: { control: 'border-[var(--dz-danger)] focus-visible:border-[var(--dz-danger)]' },
      false: {},
    },
  },

  defaultVariants: {
    variant: 'outline',
    size: 'md',
    invalid: false,
  },
})

/** Variant prop types extracted from the tv() definition */
export type MentionVariantProps = VariantProps<typeof mentionVariants>
