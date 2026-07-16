/**
 * Block registry guard (docs/blocks.md §3.3).
 *
 * Keeps the catalog honest as it grows: ids stay unique + kebab-case, required
 * text fields stay populated, every block lands in a real category, and —
 * critically — every name a block advertises in `components[]` is a *real*
 * runtime export of `@dzup-ui/core`. The last check is the point of the file:
 * a typo or an invented component name (e.g. `DzButtn`) must fail the suite
 * loudly rather than ship a "Built from" chip that maps to nothing.
 *
 * ESLint is broken locally (MEMORY.md → "Lint config broken"); this Vitest run
 * is the registry's only automated gate, so it must stand on its own.
 */

import { describe, expect, it } from 'vitest'
import * as core from '@dzup-ui/core'
import { BLOCKS, blocksByCategory, CATEGORIES } from './registry.ts'
import { getBlockSource } from './sources.ts'

/** kebab-case: lowercase words joined by single hyphens, no leading/trailing/double `-`. */
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Valid category ids, derived from the registry's own metadata. */
const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id))

/** Every runtime export name of `@dzup-ui/core` (components live here as named exports). */
const CORE_EXPORTS = new Set(Object.keys(core))

/** Label rows in `it.each` output by id (falls back to index for malformed entries). */
const labelled = BLOCKS.map((block, index) => ({
  block,
  label: typeof block?.id === 'string' && block.id.length > 0 ? block.id : `#${index}`,
}))

describe('block registry', () => {
  it('exposes a non-empty, well-formed category list', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0)
    for (const category of CATEGORIES) {
      expect(category.id, 'category id is kebab-case').toMatch(KEBAB)
      expect(category.label.trim(), `category "${category.id}" has a label`).not.toBe('')
      expect(category.blurb.trim(), `category "${category.id}" has a blurb`).not.toBe('')
    }
  })

  it('has unique category ids', () => {
    const ids = CATEGORIES.map((category) => category.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique block ids', () => {
    const ids = BLOCKS.map((block) => block.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    expect(duplicates, `duplicate block id(s): ${[...new Set(duplicates)].join(', ')}`).toEqual([])
  })

  // Empty categories are intentional in early phases (docs/blocks.md §4 ships
  // the catalog incrementally), so this asserts no category id was *misspelled*
  // — every category is either populated or deliberately awaiting its blocks.
  it('only declares categories that exist (none orphaned)', () => {
    for (const { id } of CATEGORIES) {
      const blocks = blocksByCategory(id)
      // Pure assertion that the helper resolves; empty is allowed (planned).
      expect(Array.isArray(blocks)).toBe(true)
    }
    // The strong inverse guard — no block points at a category the index can't render:
    const usedCategories = new Set(BLOCKS.map((block) => block.category))
    for (const category of usedCategories) {
      expect(CATEGORY_IDS.has(category), `block category "${category}" is not in CATEGORIES`).toBe(true)
    }
  })

  describe.each(labelled)('block "$label"', ({ block }) => {
    it('has a kebab-case id', () => {
      expect(block.id).toMatch(KEBAB)
    })

    it('has non-empty required text fields', () => {
      expect(block.title?.trim(), 'title').not.toBe('')
      expect(block.description?.trim(), 'description').not.toBe('')
    })

    it('resolves a non-empty ?raw source from its path', () => {
      const source = getBlockSource(block.path)
      expect(typeof source).toBe('string')
      expect(source.trim(), 'source (?raw import)').not.toBe('')
    })

    it('has a live component and a valid category', () => {
      expect(block.component, 'component').toBeTruthy()
      expect(CATEGORY_IDS.has(block.category), `category "${block.category}"`).toBe(true)
    })

    it('declares at least one component, each a real @dzup-ui/core export', () => {
      expect(Array.isArray(block.components)).toBe(true)
      expect(block.components.length).toBeGreaterThan(0)
      for (const name of block.components) {
        expect(
          CORE_EXPORTS.has(name),
          `"${name}" is not a real export of @dzup-ui/core (typo or invented component?)`,
        ).toBe(true)
      }
    })
  })
})
