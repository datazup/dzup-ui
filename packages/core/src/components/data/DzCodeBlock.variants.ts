/**
 * DzCodeBlock — tailwind-variants (tv) style definitions.
 *
 * Every surface value resolves through the `--dz-codeblock-*` set
 * (UI-DZUP-UI-DESIGN-L-01): the colours from the semantic tier, the layout
 * from `CODEBLOCK_TOKENS` in the component tier of `@dzup-ui/tokens`.
 *
 * @module @dzup-ui/core/components/data/DzCodeBlock.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/**
 * `rtl-physical-ok`: source code reads left-to-right in every locale, so the
 * line-number gutter stays on the left and the numbers stay right-aligned
 * against it. Mirroring them would put the gutter on the right of code that
 * still runs left-to-right (TASK-OSS-P4-05).
 */
export const codeBlockVariants = tv({
  slots: {
    root: [
      'overflow-hidden rounded-[var(--dz-codeblock-radius)] border',
      'border-[var(--dz-codeblock-border)] bg-[var(--dz-codeblock-bg)] text-[var(--dz-codeblock-text)]',
      'font-[family-name:var(--dz-codeblock-font-family)]',
      'text-[length:var(--dz-codeblock-font-size)] leading-[var(--dz-codeblock-line-height)]',
    ].join(' '),
    header: [
      'flex items-center justify-between border-b',
      'border-[var(--dz-codeblock-border)] bg-[var(--dz-codeblock-header-bg)] text-[var(--dz-codeblock-header-text)]',
      'px-[var(--dz-codeblock-header-padding-x)] py-[var(--dz-codeblock-header-padding-y)]',
      'text-[length:var(--dz-codeblock-header-font-size)] leading-4',
    ].join(' '),
    content: 'overflow-x-auto p-[var(--dz-codeblock-padding)]',
    line: 'flex',
    lineNumber: 'mr-4 inline-block w-[var(--dz-codeblock-line-number-width)] shrink-0 select-none text-right text-[var(--dz-codeblock-line-number)]',
    lineContent: 'flex-1',
    filename: 'flex items-center gap-2',
    actions: 'flex items-center gap-1',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CodeBlockVariantProps = VariantProps<typeof codeBlockVariants>
