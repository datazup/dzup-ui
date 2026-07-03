/**
 * shadcn registry guard (docs/blocks.md §3.3, Task G1).
 *
 * The generator (`scripts/build-registry.ts`) writes `public/r/*` from the real
 * `BLOCKS` using `toRegistryItem` / `buildRegistryIndex` — but it boots Vite, so
 * it does not run in CI. This suite exercises that SAME pure shaping over the
 * live catalog, so a malformed item (wrong `type`, dropped source, a Dz*
 * component wrongly left in `registryDependencies`) fails the Vitest run rather
 * than shipping a registry a plain `npx shadcn add` would choke on.
 *
 * It also asserts conformance to the CANONICAL shadcn registry-item JSON Schema's
 * required shape (`name`, `type` enum, `files[].{path,type,target}`) structurally
 * — an offline stand-in for fetching the schema, with the targeted version pinned
 * in `registryItem.ts` via the `$schema` URLs.
 */

import { describe, expect, it } from 'vitest'
import { BLOCK_DEPENDENCIES, sourceDependencies } from './config.ts'
import { BLOCKS } from './registry.ts'
import {
  BLOCK_TARGET_DIR,
  buildRegistryIndex,
  REGISTRY_FILE_TYPE,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_ITEM_TYPE,
  REGISTRY_SCHEMA,
  toRegistryItem,
} from './registryItem.ts'

/** Label `it.each`/`describe.each` rows by block id. */
const labelled = BLOCKS.map((block) => ({ block, label: block.id }))

describe('shadcn registry', () => {
  it('pins the canonical (ui.shadcn.com) schema URLs, not the shadcn-vue fork', () => {
    expect(REGISTRY_ITEM_SCHEMA).toBe('https://ui.shadcn.com/schema/registry-item.json')
    expect(REGISTRY_SCHEMA).toBe('https://ui.shadcn.com/schema/registry.json')
  })

  it('emits exactly one index item per block (counts match BLOCKS)', () => {
    const index = buildRegistryIndex(BLOCKS)
    expect(index.$schema).toBe(REGISTRY_SCHEMA)
    expect(index.items).toHaveLength(BLOCKS.length)
    // ids line up 1:1 and in order with the catalog.
    expect(index.items.map((item) => item.name)).toEqual(BLOCKS.map((block) => block.id))
  })

  it('index items omit inlined source (the per-item <id>.json carries it)', () => {
    const index = buildRegistryIndex(BLOCKS)
    for (const item of index.items) {
      for (const file of 'files' in item ? item.files : []) {
        expect(file).not.toHaveProperty('content')
        expect(file.path).toMatch(/\.vue$/)
      }
    }
  })

  describe.each(labelled)('item "$label"', ({ block }) => {
    const item = toRegistryItem(block)

    it('has the canonical shadcn registry-item shape', () => {
      expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
      expect(item.name).toBe(block.id)
      expect(item.type).toBe(REGISTRY_ITEM_TYPE)
      expect(REGISTRY_ITEM_TYPE).toBe('registry:block')
      expect(item.title).toBe(block.title)
      expect(item.description).toBe(block.description)
      expect(item.categories).toEqual([block.category])
      // Base packages always lead; optional imports (lucide, …) are appended when
      // the SFC actually uses them, so a copied block builds in a fresh project.
      expect(item.dependencies.slice(0, 2)).toEqual([...BLOCK_DEPENDENCIES])
      expect(item.dependencies).toEqual(sourceDependencies(block.source))
    })

    it('inlines the block SFC as a targeted registry:file entry', () => {
      expect(item.files).toHaveLength(1)
      const file = item.files[0]!
      expect(file.path).toBe(`${block.id}.vue`)
      expect(file.type).toBe(REGISTRY_FILE_TYPE)
      expect(file.type).toBe('registry:file')
      // `registry:file` requires an explicit destination.
      expect(file.target).toBe(`${BLOCK_TARGET_DIR}/${block.id}.vue`)
      expect(file.content).toBe(block.source)
      expect(file.content?.trim()).not.toBe('')
    })

    it('leaves registryDependencies empty — Dz* components ship via npm, not as items', () => {
      // The critical `npx shadcn add` fix: a bare `DzButton` here would make the
      // CLI try to resolve a non-existent registry item and 404.
      expect(item.registryDependencies).toEqual([])
    })

    it('preserves the composed components in meta (not registryDependencies)', () => {
      expect(item.meta.components).toEqual(block.components)
    })

    it('is JSON-serialisable with no functions or cycles', () => {
      const round = JSON.parse(JSON.stringify(item))
      expect(round.name).toBe(block.id)
      expect(round.files[0].content).toBe(block.source)
    })
  })
})
