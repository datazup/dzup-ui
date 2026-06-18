/**
 * DzKbd — tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04). Sizing is driven by `--dz-kbd-*` custom
 * properties assigned per `data-size` in `styles/base.css`.
 *
 * @module @dzup-ui/core/components/typography/DzKbd.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const kbdVariants = tv({
  slots: {
    /** Outer container — also carries the `dz-kbd` token scope class */
    root: [
      'dz-kbd',
      'inline-flex items-center align-middle',
      'gap-[var(--dz-kbd-gap)]',
      'font-[family-name:var(--dz-font-mono)]',
    ].join(' '),
    /** Individual key chip */
    key: [
      'inline-flex items-center justify-center',
      'min-w-[var(--dz-kbd-min-size)] h-[var(--dz-kbd-min-size)]',
      'px-[var(--dz-kbd-padding-x)]',
      'rounded-[var(--dz-kbd-radius)]',
      'border border-[var(--dz-kbd-border)]',
      'bg-[var(--dz-kbd-bg)] text-[var(--dz-kbd-fg)]',
      'text-[length:var(--dz-kbd-font-size)]',
      'font-[var(--dz-font-medium)] leading-none',
      'shadow-[var(--dz-kbd-shadow)]',
      'select-none whitespace-nowrap',
    ].join(' '),
    /** Separator glyph between chips */
    separator: [
      'select-none',
      'text-[var(--dz-muted-foreground)]',
      'text-[length:var(--dz-kbd-font-size)]',
    ].join(' '),
  },
})

/** Variant prop types extracted from the tv() definition */
export type KbdVariantProps = VariantProps<typeof kbdVariants>
