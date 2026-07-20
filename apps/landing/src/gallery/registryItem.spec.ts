/**
 * shadcn animation-registry guard (docs/animations.md §3.2, §5; Task N10,
 * TASK-FREE3-02).
 *
 * The generator (`scripts/build-animations-registry.ts`) writes
 * `public/r/animations/*` from the real `CATALOG` using `toRegistryItem` /
 * `buildRegistryIndex` — but it boots Vite, so it does not run in CI. This suite
 * exercises that SAME pure shaping over the live catalog, so a malformed item
 * (wrong `type`, dropped source, a `Dz*` name wrongly left in
 * `registryDependencies`) fails the Vitest run rather than shipping a registry a
 * plain `npx shadcn add` would choke on.
 *
 * It deliberately mirrors `src/blocks/registryItem.spec.ts` assertion-for-
 * assertion — canonical schema host, empty `registryDependencies`,
 * `registry:file` entries with explicit targets, composition preserved in `meta`
 * — so the two registries are held to ONE standard. This file previously
 * asserted the opposite (`registryDependencies` equal to `components[]`
 * verbatim), which cemented the bug it was supposed to catch.
 *
 * On top of the blocks contract it pins the animations-specific invariants: every
 * entry `id` is URL-safe (Task N10 requirement 1 — it seeds both the
 * `#effect-<id>` permalink and the registry item name), ids are unique, and every
 * motion primitive a snippet imports is BUNDLED rather than merely named (the
 * policy in `registryItem.ts`'s docstring).
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CATALOG } from './catalog.ts'
import { getMotionSource, MOTION_SOURCES } from './motionSources.ts'
import {
  ANIMATION_DEPENDENCIES,
  ANIMATION_TARGET_DIR,
  ANIMATIONS_REGISTRY_PATH,
  barrelExports,
  buildRegistryIndex,
  MOTION_BARREL_SOURCE,
  MOTION_STYLESHEET_FILE,
  MOTION_STYLESHEET_SOURCE,
  MOTION_TARGET_DIR,
  motionImportedNames,
  OPTIONAL_DEPENDENCIES,
  REGISTRY_FILE_TYPE,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_ITEM_TYPE,
  REGISTRY_SCHEMA,
  toRegistryItem,
} from './registryItem.ts'

/** Label `describe.each` rows by entry id. */
const labelled = CATALOG.map(entry => ({ entry, label: entry.id }))

describe('animation catalog ids', () => {
  it('are URL-safe (lowercase kebab — safe in #effect-<id> and <id>.json)', () => {
    for (const entry of CATALOG) {
      expect(entry.id, `${entry.id} must be URL-safe`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      // Round-trips through the URL encoder untouched (no escaping needed).
      expect(encodeURIComponent(entry.id)).toBe(entry.id)
    }
  })

  it('are unique across the catalog', () => {
    const ids = CATALOG.map(entry => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('shadcn animation registry', () => {
  it('pins the canonical (ui.shadcn.com) schema URLs, not the shadcn-vue fork', () => {
    expect(REGISTRY_ITEM_SCHEMA).toBe('https://ui.shadcn.com/schema/registry-item.json')
    expect(REGISTRY_SCHEMA).toBe('https://ui.shadcn.com/schema/registry.json')
  })

  it('emits exactly one index item per effect (counts match CATALOG)', () => {
    const index = buildRegistryIndex(CATALOG, getMotionSource)
    expect(index.$schema).toBe(REGISTRY_SCHEMA)
    expect(index.items).toHaveLength(CATALOG.length)
    // ids line up 1:1 and in order with the catalog.
    expect(index.items.map(item => item.name)).toEqual(CATALOG.map(entry => entry.id))
  })

  it('index items omit inlined source (the per-item <id>.json carries it)', () => {
    const index = buildRegistryIndex(CATALOG, getMotionSource)
    for (const item of index.items) {
      for (const file of item.files) {
        expect(file).not.toHaveProperty('content')
        expect(file.path).toMatch(/\.(?:vue|ts|css)$/)
        expect(file.type).toBe(REGISTRY_FILE_TYPE)
        expect(file.target).toBeTruthy()
      }
    }
  })

  it('ships the shared motion stylesheet the items point at', () => {
    // `meta.stylesheet` is a published URL; the source the generator copies it
    // from must exist on disk or every item pointing there links to nothing.
    // Read via fs, not the `?raw` glob — Vite resolves `?raw` on a stylesheet to
    // an empty string under Vitest, which would make this assertion a false green.
    const source = readFileSync(
      new URL(`../motion/${MOTION_STYLESHEET_SOURCE}`, import.meta.url),
      'utf8',
    )
    expect(source.trim()).not.toBe('')
    expect(MOTION_STYLESHEET_FILE).toMatch(/\.css$/)
  })

  describe.each(labelled)('item "$label"', ({ entry }) => {
    const item = toRegistryItem(entry, getMotionSource, 'https://example.test')

    it('has the canonical shadcn registry-item shape', () => {
      expect(item.$schema).toBe(REGISTRY_ITEM_SCHEMA)
      expect(item.name).toBe(entry.id)
      expect(item.type).toBe(REGISTRY_ITEM_TYPE)
      expect(REGISTRY_ITEM_TYPE).toBe('registry:block')
      expect(item.title).toBe(entry.title)
      expect(item.description).toBe(entry.blurb)
      expect(item.categories).toEqual([entry.category])
      // Base packages always lead; optional imports (auto-animate, …) are appended
      // when a snippet or a bundled primitive actually uses them, so a copied
      // effect builds in a fresh project.
      expect(item.dependencies.slice(0, 2)).toEqual([...ANIMATION_DEPENDENCIES])
      const extras = item.dependencies.slice(2)
      const emitted = item.files.map(file => file.content!).join('\n')
      for (const pkg of extras) {
        expect(OPTIONAL_DEPENDENCIES).toContain(pkg)
        // Every extra is earned: something actually imports it.
        expect(emitted.includes(`'${pkg}'`) || emitted.includes(`'${pkg}/`)).toBe(true)
      }
      // …and nothing imported is missing from the list.
      for (const pkg of OPTIONAL_DEPENDENCIES) {
        if (emitted.includes(`'${pkg}'`) || emitted.includes(`'${pkg}/`))
          expect(extras).toContain(pkg)
      }
    })

    it('leaves registryDependencies empty — Dz* components ship via npm, not as items', () => {
      // The critical `npx shadcn add` fix: a bare `DzCard` here would make the CLI
      // try to resolve a non-existent registry item and 404. `DzAurora` was worse
      // — a landing-local primitive resolvable by no means at all.
      expect(item.registryDependencies).toEqual([])
    })

    it('preserves the composed components in meta (not registryDependencies)', () => {
      expect(item.meta.components).toEqual(entry.components)
    })

    it('inlines every file as a targeted registry:file entry', () => {
      expect(item.files.length).toBeGreaterThanOrEqual(1)
      for (const file of item.files) {
        expect(file.type).toBe(REGISTRY_FILE_TYPE)
        expect(file.type).toBe('registry:file')
        // `registry:file` requires an explicit destination.
        expect(file.target).toBeTruthy()
        expect(file.target.endsWith(file.path)).toBe(true)
        expect(file.content?.trim()).not.toBe('')
      }
    })

    it('emits one snippet file per variant when a variant matrix is present, else the code floor', () => {
      const snippets = item.files.filter(file => file.target.startsWith(`${ANIMATION_TARGET_DIR}/`))
      for (const file of snippets) {
        expect(file.path).toMatch(new RegExp(`^${entry.id}\\.(?:vue|ts|css)$`))
        expect(file.target).toBe(`${ANIMATION_TARGET_DIR}/${file.path}`)
      }
      if (entry.variants) {
        const present = (['sfc', 'composable', 'css'] as const).filter(k => entry.variants?.[k])
        expect(snippets).toHaveLength(present.length)
      }
      else {
        expect(snippets).toHaveLength(1)
        expect(snippets[0]!.path).toBe(`${entry.id}.vue`)
        expect(snippets[0]!.content).toBe(entry.code)
      }
    })

    it('bundles every motion primitive its snippets import (no unresolvable names)', () => {
      const snippets = item.files.filter(file => file.target.startsWith(`${ANIMATION_TARGET_DIR}/`))
      const imported = [...new Set(snippets.flatMap(file => motionImportedNames(file.content!)))]
      expect(item.meta.motionPrimitives).toEqual([...imported].sort())

      if (imported.length === 0) {
        // Nothing imported from '../motion' → nothing bundled.
        expect(item.files).toEqual(snippets)
        return
      }

      // A pruned barrel is emitted so the authored `from '../motion'` resolves…
      const barrel = item.files.find(
        file => file.target === `${MOTION_TARGET_DIR}/${MOTION_BARREL_SOURCE}`,
      )
      expect(barrel, `${entry.id} must ship a pruned motion barrel`).toBeDefined()

      // …re-exporting exactly the names imported, no more.
      expect([...barrelExports(barrel!.content!).keys()].sort()).toEqual([...imported].sort())

      // Every local module the barrel re-exports from is present in files[], and
      // every bundled file is real motion source, verbatim.
      const bundled = item.files.filter(file => file.target.startsWith(`${MOTION_TARGET_DIR}/`))
      for (const file of bundled) {
        if (file === barrel)
          continue
        const motionPath = file.target.slice(`${MOTION_TARGET_DIR}/`.length)
        expect(MOTION_SOURCES[motionPath], `${motionPath} must exist in src/motion`).toBeDefined()
        expect(file.content).toBe(MOTION_SOURCES[motionPath])
      }
    })

    it('closes the bundle transitively — a bundled file never imports a missing one', () => {
      const bundled = item.files.filter(file => file.target.startsWith(`${MOTION_TARGET_DIR}/`))
      const targets = new Set(bundled.map(file => file.target))
      for (const file of bundled) {
        for (const [, specifier] of file.content!.matchAll(/from\s+'(\.[^']*)'/g)) {
          // Resolve the specifier against the file's own target directory.
          const segments = file.target.split('/').slice(0, -1)
          for (const part of specifier!.split('/')) {
            if (part === '' || part === '.')
              continue
            if (part === '..')
              segments.pop()
            else segments.push(part)
          }
          expect(
            targets.has(segments.join('/')),
            `${file.path} imports "${specifier}" which is not bundled`,
          ).toBe(true)
        }
      }
    })

    it('points at the published stylesheet URL when its sources read --dz-anim tokens', () => {
      const usesTokens = item.files.some(file => /--dz-anim|dz-anim-|dz-animate-in|dz-scroll-linked/.test(file.content!))
      if (usesTokens) {
        expect(item.meta.stylesheet).toBe(
          `https://example.test${ANIMATIONS_REGISTRY_PATH}/${MOTION_STYLESHEET_FILE}`,
        )
      }
      else {
        expect(item.meta.stylesheet).toBeUndefined()
      }
    })

    it('is JSON-serialisable with no functions or cycles', () => {
      const round = JSON.parse(JSON.stringify(item))
      expect(round.name).toBe(entry.id)
      expect(round.files[0].content).toBe(item.files[0]!.content)
    })
  })
})
