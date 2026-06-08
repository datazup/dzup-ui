/**
 * Reusable MDX doc-block: a component-status badge for a docs header (TASK-0.13/0.14).
 *
 * Mirrors the sidebar badge (`.storybook/manager.ts`) but for the docs page. Pulls
 * label/description from the single source (`_shared/status.ts`). Usage:
 *
 * ```mdx
 * import { StatusBadge } from '../_blocks/StatusBadge.ts'
 *
 * # DzButton <StatusBadge status="stable" />
 * ```
 */
import { createElement as h } from 'react'
import {
  STATUS_BADGES,
  type ComponentStatus,
} from '../../../../packages/core/stories/_shared/status.ts'

const HEX: Record<ComponentStatus, string> = {
  experimental: '#b45309',
  beta: '#1d4ed8',
  stable: '#15803d',
  deprecated: '#b91c1c',
}

export function StatusBadge({ status }: { status: ComponentStatus }) {
  const meta = STATUS_BADGES[status]
  if (!meta) return null
  return h(
    'span',
    {
      title: meta.description,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        marginLeft: 8,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        color: HEX[status],
        border: `1px solid ${HEX[status]}`,
        borderRadius: 5,
        padding: '1px 6px',
      },
    },
    meta.label,
  )
}
