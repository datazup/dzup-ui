/**
 * Templates registry-item guard. `toTemplateItem` is pure over a `TemplateMeta`
 * plus its already-resolved source files, so we drive it with a fabricated meta +
 * a two-file (SFC + data.ts) set and assert the canonical shadcn shape, the
 * per-file targets, and the empty `registryDependencies` (components ship via npm,
 * same as blocks).
 */

import { describe, expect, it } from 'vitest'
import type { TemplateMeta } from '../templates/registry.ts'
import {
  buildTemplatesIndex,
  TEMPLATE_TARGET_DIR,
  toTemplateItem,
  type ResolvedTemplateFile,
} from './templatesItem.ts'
import { REGISTRY_ITEM_SCHEMA, REGISTRY_SCHEMA } from './registryItem.ts'

const META = {
  slug: 'analytics-dashboard',
  name: 'Analytics Dashboard',
  blurb: 'A KPI dashboard built from dzup-ui.',
  category: 'dashboards',
  stack: ['DzStatCard', 'DzCard'],
  icon: 'chart',
  load: () => Promise.resolve({ default: {} as never }),
  source: 'apps/landing/src/templates/analytics-dashboard/AnalyticsDashboard.vue',
  tier: 'free',
} satisfies TemplateMeta

const FILES: ResolvedTemplateFile[] = [
  { filename: 'AnalyticsDashboard.vue', content: '<template><div /></template>' },
  { filename: 'data.ts', content: 'export const rows = []' },
]

describe('toTemplateItem', () => {
  const item = toTemplateItem(META, FILES)

  it('has the canonical shadcn item shape', () => {
    expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
    expect(item.name).toBe('analytics-dashboard')
    expect(item.type).toBe('registry:block')
    expect(item.title).toBe(META.name)
    expect(item.description).toBe(META.blurb)
    expect(item.categories).toEqual(['dashboards'])
    expect(item.dependencies).toEqual(['@dzup-ui/core', '@dzup-ui/tokens'])
    expect(item.registryDependencies).toEqual([])
    expect(item.meta.components).toEqual(['DzStatCard', 'DzCard'])
    expect(item.meta.tier).toBe('free')
  })

  it('inlines every resolved file with a per-slug target', () => {
    expect(item.files).toHaveLength(2)
    expect(item.files[0]!.target).toBe(`${TEMPLATE_TARGET_DIR}/analytics-dashboard/AnalyticsDashboard.vue`)
    expect(item.files[0]!.content).toContain('<template>')
    expect(item.files[1]!.target).toBe(`${TEMPLATE_TARGET_DIR}/analytics-dashboard/data.ts`)
    expect(item.files.every((f) => f.type === 'registry:file')).toBe(true)
  })

  it('throws when no source files resolved', () => {
    expect(() => toTemplateItem(META, [])).toThrow(/zero source files/)
  })
})

describe('buildTemplatesIndex', () => {
  it('lists items and drops inlined content', () => {
    const index = buildTemplatesIndex([toTemplateItem(META, FILES)])
    expect(index.$schema).toBe(REGISTRY_SCHEMA)
    expect(index.items).toHaveLength(1)
    for (const file of index.items[0]!.files) {
      expect(file).not.toHaveProperty('content')
      expect(file.target).toContain('analytics-dashboard')
    }
  })
})
