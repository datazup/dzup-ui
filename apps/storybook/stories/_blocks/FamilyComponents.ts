/**
 * Reusable MDX doc-block: the component table on a family Overview page
 * (TASK-FREE-14).
 *
 * Renders every component in a family — name (linked to its docs page), status
 * badge and blurb — from `_data/familyComponents.ts`, which reads them out of the
 * story corpus. Replaces the hand-typed table each Overview used to carry, under
 * which 45 shipped components had gone unlisted.
 *
 * ```mdx
 * import { FamilyComponents } from './_blocks/FamilyComponents.ts'
 *
 * <FamilyComponents family="Buttons" />
 * ```
 */
import type { CSSProperties } from 'react'
import { createElement as h } from 'react'
import { componentsIn } from '../_data/familyComponents.ts'
import { StatusBadge } from './StatusBadge.ts'

const cell: CSSProperties = {
  borderBottom: '1px solid var(--dz-border, #e5e7eb)',
  padding: '8px 10px',
  verticalAlign: 'top',
  textAlign: 'left',
}

const headCell: CSSProperties = {
  ...cell,
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

export function FamilyComponents({ family }: { family: string }) {
  const rows = componentsIn(family)

  if (rows.length === 0) {
    return h(
      'p',
      null,
      `No components found for the "${family}" family. If that is unexpected, check the story titles are "Core/${family}/<Component>".`,
    )
  }

  return h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      { style: { borderCollapse: 'collapse', width: '100%', margin: '16px 0' } },
      h(
        'thead',
        null,
        h('tr', null, [
          h('th', { key: 'c', style: headCell }, 'Component'),
          h('th', { key: 's', style: headCell }, 'Status'),
          h('th', { key: 'd', style: headCell }, 'What it is'),
        ]),
      ),
      h(
        'tbody',
        null,
        rows.map(row =>
          h('tr', { key: row.name }, [
            h(
              'td',
              { key: 'c', style: { ...cell, whiteSpace: 'nowrap' } },
              h('a', { href: `?path=/docs/${row.docsId}` }, row.name),
            ),
            h(
              'td',
              { key: 's', style: cell },
              row.status
                ? h(StatusBadge, { status: row.status })
                : h('span', { style: { opacity: 0.6 } }, '—'),
            ),
            h('td', { key: 'd', style: cell }, row.summary || '—'),
          ]),
        ),
      ),
    ),
  )
}
