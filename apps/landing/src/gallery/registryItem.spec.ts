/**
 * shadcn-style animation-registry guard (docs/animations.md §3.2, §5; Task N10).
 *
 * The generator (`scripts/build-animations-registry.ts`) writes
 * `public/r/animations/*` from the real `CATALOG` using `toRegistryItem` /
 * `buildRegistryIndex` — but it boots Vite, so it does not run in CI. This suite
 * exercises that SAME pure shaping over the live catalog, so a malformed item
 * (wrong `type`, dropped source, drifted `registryDependencies`) fails the Vitest
 * run rather than shipping a registry `npx shadcn-vue add` would choke on.
 *
 * It also pins the two invariants the deep-link + registry rely on: every entry
 * `id` is URL-safe (Task N10 requirement 1 — it seeds both the `#effect-<id>`
 * permalink and the registry item name), and ids are unique.
 */

import { describe, expect, it } from 'vitest'
import { CATALOG } from './catalog.ts'
import {
  ANIMATION_DEPENDENCIES,
  buildRegistryIndex,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_ITEM_TYPE,
  REGISTRY_SCHEMA,
  toRegistryItem,
} from './registryItem.ts'

/** Label `describe.each` rows by entry id. */
const labelled = CATALOG.map((entry) => ({ entry, label: entry.id }))

describe('animation catalog ids', () => {
  it('are URL-safe (lowercase kebab — safe in #effect-<id> and <id>.json)', () => {
    for (const entry of CATALOG) {
      expect(entry.id, `${entry.id} must be URL-safe`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      // Round-trips through the URL encoder untouched (no escaping needed).
      expect(encodeURIComponent(entry.id)).toBe(entry.id)
    }
  })

  it('are unique across the catalog', () => {
    const ids = CATALOG.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('shadcn-style animation registry', () => {
  it('emits exactly one index item per effect (counts match CATALOG)', () => {
    const index = buildRegistryIndex(CATALOG)
    expect(index.$schema).toBe(REGISTRY_SCHEMA)
    expect(index.items).toHaveLength(CATALOG.length)
    expect(index.items.map((item) => item.name)).toEqual(CATALOG.map((entry) => entry.id))
  })

  it('index items omit inlined source (the per-item <id>.json carries it)', () => {
    const index = buildRegistryIndex(CATALOG)
    for (const item of index.items) {
      for (const file of item.files) {
        expect(file).not.toHaveProperty('content')
        expect(file.path).toMatch(/\.(vue|ts|css)$/)
      }
    }
  })

  describe.each(labelled)('item "$label"', ({ entry }) => {
    const item = toRegistryItem(entry)

    it('has the shadcn-vue registry-item shape', () => {
      expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
      expect(item.name).toBe(entry.id)
      expect(item.type).toBe(REGISTRY_ITEM_TYPE)
      expect(REGISTRY_ITEM_TYPE).toBe('registry:block')
      expect(item.title).toBe(entry.title)
      expect(item.description).toBe(entry.blurb)
      expect(item.dependencies).toEqual([...ANIMATION_DEPENDENCIES])
    })

    it('inlines at least one non-empty file with the right kind + extension', () => {
      expect(item.files.length).toBeGreaterThanOrEqual(1)
      for (const file of item.files) {
        expect(file.path).toMatch(new RegExp(`^${entry.id}\\.(vue|ts|css)$`))
        expect(file.type).toBe(REGISTRY_ITEM_TYPE)
        expect(file.content?.trim()).not.toBe('')
      }
    })

    it('emits one file per variant when a variant matrix is present, else the code floor', () => {
      if (entry.variants) {
        const present = (['sfc', 'composable', 'css'] as const).filter((k) => entry.variants?.[k])
        expect(item.files).toHaveLength(present.length)
      } else {
        expect(item.files).toHaveLength(1)
        expect(item.files[0]!.path).toBe(`${entry.id}.vue`)
        expect(item.files[0]!.content).toBe(entry.code)
      }
    })

    it('maps registryDependencies to components[] verbatim', () => {
      expect(item.registryDependencies).toEqual(entry.components)
    })

    it('is JSON-serialisable with no functions or cycles', () => {
      const round = JSON.parse(JSON.stringify(item))
      expect(round.name).toBe(entry.id)
      expect(round.files[0].content).toBe(item.files[0]!.content)
    })
  })
})
