/**
 * DzInput — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 * Component token tier (--dz-input-*) overrides where available.
 *
 * @module @dzup-ui/core/components/inputs/DzInput.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/** Wrapper variants — the outer container holding prefix, input, suffix */
export const inputWrapperVariants = tv({
  base: [
    'flex items-center w-full',
    'font-[family-name:var(--dz-input-font-family)]',
    'transition-[var(--dz-input-transition)]',
  ].join(' '),

  variants: {
    variant: {
      outline: [
        'border border-[var(--dz-input-border)]',
        'bg-[var(--dz-input-bg)]',
        'focus-within:border-[var(--dz-input-border-focus)]',
      ].join(' '),
      filled: [
        'border-0',
        'bg-[var(--dz-muted)]',
      ].join(' '),
      underlined: [
        'border-0 border-b-2 border-[var(--dz-input-border)]',
        'rounded-none bg-transparent',
        'focus-within:border-[var(--dz-input-border-focus)] focus-within:outline-none',
      ].join(' '),
    },

    size: {
      icon: '',
      xs: [
        'h-[var(--dz-input-xs-height)] px-[var(--dz-input-xs-padding-x)]',
        'text-[length:var(--dz-input-xs-font-size)]',
        'gap-[var(--dz-spacing-1)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      sm: [
        'h-[var(--dz-input-sm-height)] px-[var(--dz-input-sm-padding-x)]',
        'text-[length:var(--dz-input-sm-font-size)]',
        'gap-[var(--dz-spacing-1_5)]',
        'rounded-[var(--dz-radius-sm)]',
      ].join(' '),
      md: [
        'h-[var(--dz-input-md-height)] px-[var(--dz-input-md-padding-x)]',
        'text-[length:var(--dz-input-md-font-size)]',
        'gap-[var(--dz-spacing-2)]',
        'rounded-[var(--dz-input-radius)]',
      ].join(' '),
      lg: [
        'h-[var(--dz-input-lg-height)] px-[var(--dz-input-lg-padding-x)]',
        'text-[length:var(--dz-input-lg-font-size)]',
        'gap-[var(--dz-spacing-2)]',
        'rounded-[var(--dz-input-radius)]',
      ].join(' '),
      xl: [
        'h-[var(--dz-input-xl-height)] px-[var(--dz-input-xl-padding-x)]',
        'text-[length:var(--dz-input-xl-font-size)]',
        'gap-[var(--dz-spacing-2_5)]',
        'rounded-[var(--dz-radius-lg)]',
      ].join(' '),
    },

    /**
     * Semantic tone — recolors the focus border while the shared semantic
     * input focus utility owns the focus ring. Actual classes are applied
     * through compoundVariants so that `invalid` always wins (see below).
     * `neutral` keeps the default.
     */
    tone: {
      neutral: '',
      primary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
    },

    invalid: {
      true: 'border-[var(--dz-danger)] focus-within:border-[var(--dz-danger)] focus-within:outline-[var(--dz-danger)]',
      false: '',
    },

    /**
     * Seamless mode — used when the input is nested inside DzInputGroup, which
     * owns the shell (border, radius, background, focus ring, disabled state).
     * The field strips its own box so segments connect flush; `false` keeps the
     * standalone ring + disabled-shell utilities. Declared last so its resets
     * win the tailwind-merge over the variant/size box classes.
     */
    seamless: {
      false: 'dz-focus-within-ring-input dz-disabled-input-shell',
      true: 'rounded-none border-0 bg-transparent shadow-none',
    },
  },

  compoundVariants: [
    // ── Tone focus border (only when not invalid; invalid forces danger) ──
    { tone: 'primary', invalid: false, class: '[--dz-input-border-focus:var(--dz-primary)]' },
    { tone: 'success', invalid: false, class: '[--dz-input-border-focus:var(--dz-success)]' },
    { tone: 'warning', invalid: false, class: '[--dz-input-border-focus:var(--dz-warning-solid)]' },
    { tone: 'danger', invalid: false, class: '[--dz-input-border-focus:var(--dz-danger)]' },
    { tone: 'info', invalid: false, class: '[--dz-input-border-focus:var(--dz-info)]' },
  ],

  defaultVariants: {
    variant: 'outline',
    size: 'md',
    tone: 'neutral',
    invalid: false,
    seamless: false,
  },
})

/** Inner <input> element styles — reset native appearance */
export const inputElementVariants = tv({
  base: [
    'dz-field-input-reset',
    // Autofill-tint neutralization + selection color, hoisted from the
    // per-component <style scoped> blocks these inputs used to carry (TASK-DS-09).
    // Defined once in styles/base.css.
    'dz-native-input',
    'flex-1 w-full bg-transparent outline-none focus:outline-none focus-visible:outline-none border-none',
    'text-[var(--dz-foreground)]',
    'placeholder:text-[var(--dz-input-placeholder)]',
    'disabled:cursor-not-allowed',
    'file:border-0 file:bg-transparent file:text-[length:var(--dz-text-sm)] file:font-[var(--dz-font-medium)]',
  ].join(' '),
})

/** Variant prop types extracted from the tv() definition */
export type InputWrapperVariantProps = VariantProps<typeof inputWrapperVariants>
export type InputElementVariantProps = VariantProps<typeof inputElementVariants>
