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
import type { ComponentStatus } from '../../../../packages/core/stories/_shared/status.ts'
import { createElement as h } from 'react'
import {

  STATUS_BADGES,
} from '../../../../packages/core/stories/_shared/status.ts'
import { STATUS_BADGE_COLORS } from '../../.storybook/brandPalette.ts'

// Same ink as the sidebar badge, from the one token-backed source — this file
// used to keep its own copy of Tailwind's amber/blue/green/red-700, a third
// independent palette that agreed with neither the manager nor the token ramp
// (TASK-FREE-17).
const HEX: Record<ComponentStatus, string> = {
  experimental: STATUS_BADGE_COLORS.experimental.hex,
  beta: STATUS_BADGE_COLORS.beta.hex,
  stable: STATUS_BADGE_COLORS.stable.hex,
  deprecated: STATUS_BADGE_COLORS.deprecated.hex,
}

export function StatusBadge({ status }: { status: ComponentStatus }) {
  const meta = STATUS_BADGES[status]
  if (!meta)
    return null
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
