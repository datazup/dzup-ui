/**
 * Reusable MDX doc-block: the live list of deprecated components (TASK-FREE-14).
 *
 * Reads `DEPRECATED_ROWS` from `_data/componentStatus.ts`, i.e. from the stories
 * themselves. Deprecate a component by tagging its story `status:deprecated` and it
 * appears here — and on `ComponentStatus.mdx` — with no page to remember to edit.
 *
 * Today the list is empty and the block says so plainly. That is the point: a
 * hand-written "nothing is deprecated" line is a claim that rots the moment
 * something is, whereas this one cannot.
 */
import type { CSSProperties } from 'react'
import { createElement as h } from 'react'
import { DEPRECATED_ROWS } from '../_data/componentStatus.ts'

const cell: CSSProperties = {
  borderBottom: '1px solid var(--dz-border, #e5e7eb)',
  padding: '8px 10px',
  textAlign: 'left',
  verticalAlign: 'top',
}

export function DeprecatedComponents() {
  if (DEPRECATED_ROWS.length === 0) {
    return h(
      'div',
      {
        style: {
          border: '1px solid var(--dz-border, #e5e7eb)',
          borderRadius: 8,
          padding: '12px 14px',
          margin: '16px 0',
        },
      },
      h(
        'p',
        { style: { margin: 0 } },
        'No component is currently deprecated — nothing in the library is scheduled for removal. This list is generated from the story corpus, so it fills in by itself the moment something is tagged.',
      ),
    )
  }

  return h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      { style: { borderCollapse: 'collapse', width: '100%', margin: '16px 0' } },
      h('thead', null, h('tr', null, [
        h('th', { key: 'c', style: { ...cell, fontWeight: 600 } }, 'Component'),
        h('th', { key: 'f', style: { ...cell, fontWeight: 600 } }, 'Family'),
        h('th', { key: 'm', style: { ...cell, fontWeight: 600 } }, 'Migrate to'),
      ])),
      h(
        'tbody',
        null,
        DEPRECATED_ROWS.map(row =>
          h('tr', { key: `${row.family}-${row.component}` }, [
            h('td', { key: 'c', style: { ...cell, whiteSpace: 'nowrap' } }, h('code', null, row.component)),
            h('td', { key: 'f', style: cell }, row.family),
            h('td', { key: 'm', style: cell }, row.migration ?? '—'),
          ]),
        ),
      ),
    ),
  )
}
