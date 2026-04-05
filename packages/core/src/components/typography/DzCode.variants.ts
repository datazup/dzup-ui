/**
 * DzCode — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/typography/DzCode.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const codeVariants = tv({
  base: [
    'font-[family-name:var(--dz-font-mono)]',
    'text-[var(--dz-foreground)]',
  ].join(' '),

  variants: {
    variant: {
      inline: [
        'inline-block',
        'rounded-[var(--dz-radius-sm)]',
        'bg-[var(--dz-muted)]',
        'px-[var(--dz-spacing-1_5)]',
        'py-[var(--dz-spacing-0_5)]',
        'text-[length:var(--dz-text-sm)]',
      ].join(' '),
      block: [
        'block',
        'rounded-[var(--dz-radius-md)]',
        'bg-[var(--dz-muted)]',
        'p-[var(--dz-spacing-4)]',
        'text-[length:var(--dz-text-sm)]',
        'overflow-x-auto',
        'whitespace-pre',
      ].join(' '),
    },
  },

  defaultVariants: {
    variant: 'inline',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CodeVariantProps = VariantProps<typeof codeVariants>
