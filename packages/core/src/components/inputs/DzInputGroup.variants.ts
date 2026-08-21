/**
 * DzInputGroup — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzup-ui/core/components/inputs/DzInputGroup.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const inputGroupVariants = tv({
  slots: {
    /**
     * The group root is the single visual shell: it owns the border, radius,
     * background, focus ring and disabled state. `overflow-hidden` clips the
     * square-cornered addons and the seamless field to the rounded outer
     * corners, so every segment connects flush with no rounding mismatch.
     */
    root: [
      'flex items-stretch w-full overflow-hidden',
      'rounded-[var(--dz-input-radius)]',
      'border border-[var(--dz-input-border)]',
      'bg-[var(--dz-input-bg)]',
      'transition-[var(--dz-input-transition)]',
      'focus-within:border-[var(--dz-input-border-focus)]',
      'dz-focus-within-ring-input',
      'dz-disabled-input-shell',
    ].join(' '),
    /** Prefix/suffix addon — a divider border separates it from the field. */
    addon: [
      'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
      'px-[var(--dz-spacing-3)]',
      'bg-[var(--dz-muted)]',
      'text-[var(--dz-muted-foreground)]',
      'text-[length:var(--dz-text-sm)]',
    ].join(' '),
    addonPrefix: 'border-e border-[var(--dz-input-border)]',
    addonSuffix: 'border-s border-[var(--dz-input-border)]',
    /** Wrapper around the default slot (the field) — grows to fill the row. */
    field: 'min-w-0 flex-1',
  },

  variants: {
    // Row height comes from the grouped field's own size; addons stretch to it
    // via `items-stretch`. Size here keeps the outer radius and addon
    // padding/font-size in step with the matching DzInput size.
    size: {
      icon: {},
      xs: {
        root: 'rounded-[var(--dz-radius-sm)]',
        addon: 'px-[var(--dz-spacing-1_5)] text-[length:var(--dz-text-xs)]',
      },
      sm: {
        root: 'rounded-[var(--dz-radius-sm)]',
        addon: 'px-[var(--dz-spacing-2)] text-[length:var(--dz-text-xs)]',
      },
      md: {},
      lg: {
        addon: 'px-[var(--dz-spacing-4)] text-[length:var(--dz-text-base)]',
      },
      xl: {
        root: 'rounded-[var(--dz-radius-lg)]',
        addon: 'px-[var(--dz-spacing-4)] text-[length:var(--dz-text-lg)]',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

/** Variant prop types */
export type InputGroupVariantProps = VariantProps<typeof inputGroupVariants>
