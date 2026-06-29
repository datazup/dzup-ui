/**
 * shadcn-vue registry guard (docs/blocks.md §3.3, Task G1).
 *
 * The generator (`scripts/build-registry.ts`) writes `public/r/*` from the real
 * `BLOCKS` using `toRegistryItem` / `buildRegistryIndex` — but it boots Vite, so
 * it does not run in CI. This suite exercises that SAME pure shaping over the
 * live catalog, so a malformed item (wrong `type`, dropped source, drifted
 * `registryDependencies`) fails the Vitest run rather than shipping a registry
 * `npx shadcn-vue add` would choke on.
 *
 * It also asserts conformance to the shadcn-vue registry-item JSON Schema's
 * required shape (`name`, `type` enum, `files[].{path,type}`) structurally —
 * an offline stand-in for fetching the schema, with the targeted version pinned
 * in `registryItem.ts` via the `$schema` URLs.
 */

import { describe, expect, it } from 'vitest'
import { BLOCK_DEPENDENCIES } from './config.ts'
import { BLOCKS } from './registry.ts'
import {
  buildRegistryIndex,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_ITEM_TYPE,
  REGISTRY_SCHEMA,
  toRegistryItem,
} from './registryItem.ts'

/** Label `it.each`/`describe.each` rows by block id. */
const labelled = BLOCKS.map((block) => ({ block, label: block.id }))

describe('shadcn-vue registry', () => {
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
      for (const file of item.files) {
        expect(file).not.toHaveProperty('content')
        expect(file.path).toMatch(/\.vue$/)
      }
    }
  })

  describe.each(labelled)('item "$label"', ({ block }) => {
    const item = toRegistryItem(block)

    it('has the shadcn-vue registry-item shape', () => {
      expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
      expect(item.name).toBe(block.id)
      expect(item.type).toBe(REGISTRY_ITEM_TYPE)
      expect(REGISTRY_ITEM_TYPE).toBe('registry:block')
      expect(item.title).toBe(block.title)
      expect(item.description).toBe(block.description)
      expect(item.dependencies).toEqual([...BLOCK_DEPENDENCIES])
    })

    it('inlines the block SFC as the single files[] entry', () => {
      expect(item.files).toHaveLength(1)
      const file = item.files[0]!
      expect(file.path).toBe(`${block.id}.vue`)
      expect(file.type).toBe(REGISTRY_ITEM_TYPE)
      expect(file.content).toBe(block.source)
      expect(file.content?.trim()).not.toBe('')
    })

    it('maps registryDependencies to components[] verbatim', () => {
      expect(item.registryDependencies).toEqual(block.components)
    })

    it('is JSON-serialisable with no functions or cycles', () => {
      const round = JSON.parse(JSON.stringify(item))
      expect(round.name).toBe(block.id)
      expect(round.files[0].content).toBe(block.source)
    })
  })
})
