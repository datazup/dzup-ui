/**
 * DzRelativeTime — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Font size is driven by the
 * `--dz-relative-time-font-size` custom property declared on
 * `.dz-relative-time` in base.css; tone maps to the shared semantic text
 * tokens (this primitive inherits the typography palette).
 *
 * @module @dzup-ui/core/components/typography/DzRelativeTime.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const relativeTimeVariants = tv({
  base: [
    'dz-relative-time',
    'text-[length:var(--dz-relative-time-font-size)]',
    'leading-[var(--dz-leading-normal)]',
  ].join(' '),

  variants: {
    tone: {
      default: 'text-[var(--dz-foreground)]',
      muted: 'text-[var(--dz-muted-foreground)]',
      success: 'text-[var(--dz-success-muted-foreground)]',
      warning: 'text-[var(--dz-warning-muted-foreground)]',
      danger: 'text-[var(--dz-danger-muted-foreground)]',
      info: 'text-[var(--dz-info-muted-foreground)]',
    },
  },

  defaultVariants: {
    tone: 'muted',
  },
})

/** Variant prop types extracted from the tv() definition */
export type RelativeTimeVariantProps = VariantProps<typeof relativeTimeVariants>
