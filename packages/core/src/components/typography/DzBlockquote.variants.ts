/**
 * DzBlockquote — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04).
 *
 * @module @dzip-ui/core/components/typography/DzBlockquote.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const blockquoteVariants = tv({
  base: [
    'border-l-4',
    'border-[var(--dz-border)]',
    'pl-[var(--dz-spacing-4)]',
    'py-[var(--dz-spacing-2)]',
    'text-[var(--dz-muted-foreground)]',
    'italic',
  ].join(' '),
})

/** Variant prop types extracted from the tv() definition */
export type BlockquoteVariantProps = VariantProps<typeof blockquoteVariants>
