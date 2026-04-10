/**
 * DzCodeBlock — tailwind-variants (tv) style definitions.
 *
 * @module @dzup-ui/core/components/data/DzCodeBlock.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const codeBlockVariants = tv({
  slots: {
    root: 'overflow-hidden rounded-lg border font-mono text-sm',
    header: 'flex items-center justify-between border-b px-4 py-2 text-xs',
    content: 'overflow-x-auto p-4',
    line: 'flex',
    lineNumber: 'mr-4 inline-block w-8 shrink-0 select-none text-right opacity-50',
    lineContent: 'flex-1',
    filename: 'flex items-center gap-2',
    actions: 'flex items-center gap-1',
  },
})

/** Variant prop types extracted from the tv() definition */
export type CodeBlockVariantProps = VariantProps<typeof codeBlockVariants>
