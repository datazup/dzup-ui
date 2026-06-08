import { createElement } from 'react'
import { addons } from 'storybook/manager-api'
import { STATUS_BADGES, statusFromTags } from '../../../packages/core/stories/_shared/status.ts'

// TASK-0.13 — render a component-status badge next to each entry in the sidebar.
// The taxonomy/labels come from the single source (`_shared/status.ts`); colors
// here are literal hex (the manager UI runs outside the preview iframe and has
// no access to the `--dz-*` token CSS).
const BADGE_HEX: Record<string, string> = {
  experimental: '#b45309', // amber-700
  beta: '#1d4ed8', // blue-700
  stable: '#15803d', // green-700
  deprecated: '#b91c1c', // red-700
}

addons.setConfig({
  sidebar: {
    showRoots: true,
    renderLabel: (item) => {
      const status = statusFromTags((item as { tags?: string[] }).tags)
      if (!status || item.type !== 'component') {
        return item.name
      }
      const meta = STATUS_BADGES[status]
      return createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, [
        createElement('span', { key: 'name' }, item.name),
        createElement(
          'span',
          {
            key: 'badge',
            title: meta.description,
            style: {
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: BADGE_HEX[status],
              border: `1px solid ${BADGE_HEX[status]}`,
              borderRadius: 4,
              padding: '0 4px',
              lineHeight: '14px',
            },
          },
          meta.label,
        ),
      ])
    },
  },
  enableShortcuts: true,
})
