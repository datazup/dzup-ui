/**
 * Reusable MDX doc-block: a design-token-styled data table (TASK-0.14).
 *
 * Storybook's default MDX renders raw GFM `| … |` tables, which overflow and wrap
 * badly in the docs canvas and ignore the `--dz-*` theme tokens (so they don't
 * adapt to dark mode). `DocTable` renders the same data with a responsive,
 * horizontally-scrollable wrapper, zebra/hover rows, and token-driven colors.
 *
 * Authored with `createElement` (no JSX) so it compiles without a React-JSX
 * transform in the Storybook Vite pipeline — same approach as `DoDont`/`StatusBadge`.
 *
 * String cells support lightweight inline markdown: `` `code` `` and `**bold**`.
 * Cells may also be arbitrary React nodes (e.g. `<StatusBadge … />`), which are
 * rendered as-is.
 *
 * ```mdx
 * import { DocTable } from './_blocks/DocTable.ts'
 *
 * <DocTable
 *   head={['Concept', 'Values']}
 *   align={['left', 'left']}
 *   rows={[
 *     ['`size`', '`xs` · `sm` · `md` · `lg` · `xl`'],
 *   ]}
 * />
 * ```
 */
import { createElement as h, Fragment, type ReactNode } from 'react'

type Align = 'left' | 'center' | 'right'

const CSS = `
.dz-doctable { margin: 16px 0; overflow-x: auto; border: 1px solid var(--dz-border); border-radius: 8px; }
.dz-doctable table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.5; color: var(--dz-foreground); }
.dz-doctable th { background: var(--dz-muted); color: var(--dz-foreground); font-weight: 600; padding: 10px 14px; border-bottom: 1px solid var(--dz-border); white-space: nowrap; }
.dz-doctable td { padding: 10px 14px; border-top: 1px solid var(--dz-border); vertical-align: top; }
.dz-doctable tbody tr:first-child td { border-top: none; }
.dz-doctable tbody tr:nth-child(even) td { background: color-mix(in oklch, var(--dz-muted) 45%, transparent); }
.dz-doctable tbody tr:hover td { background: var(--dz-muted); }
.dz-doctable code { font-family: var(--dz-font-mono, ui-monospace, monospace); font-size: 0.85em; background: var(--dz-muted); padding: 1px 5px; border-radius: 4px; }
.dz-doctable th code { background: transparent; padding: 0; }
`

/** Split a string into nodes, rendering `code` and **bold** inline markdown. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return h(
    Fragment,
    null,
    parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return h('code', { key: i }, part.slice(1, -1))
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return h('strong', { key: i }, part.slice(2, -2))
      }
      return h(Fragment, { key: i }, part)
    }),
  )
}

function cellNode(cell: unknown): ReactNode {
  return typeof cell === 'string' ? renderInline(cell) : (cell as ReactNode)
}

export function DocTable({
  head,
  rows,
  align,
}: {
  head: string[]
  rows: unknown[][]
  align?: Align[]
}) {
  const alignOf = (i: number): Align => align?.[i] ?? 'left'
  return h('div', { className: 'dz-doctable' }, [
    h('style', { key: 'css' }, CSS),
    h('table', { key: 'table' }, [
      h(
        'thead',
        { key: 'head' },
        h(
          'tr',
          null,
          head.map((cell, i) => h('th', { key: i, style: { textAlign: alignOf(i) } }, renderInline(cell))),
        ),
      ),
      h(
        'tbody',
        { key: 'body' },
        rows.map((row, r) =>
          h(
            'tr',
            { key: r },
            row.map((cell, i) => h('td', { key: i, style: { textAlign: alignOf(i) } }, cellNode(cell))),
          ),
        ),
      ),
    ]),
  ])
}
