/**
 * Tests for the swap-icon-library transform (TASK-R1-O6 decision item 1).
 *
 * Fixture-driven rather than assertion-driven: every case is a pair of real
 * files under `__fixtures__/swap-icon-library/`, so the contract is reviewable
 * as a diff and a reviewer can read the *output* rather than reconstruct it
 * from `expect(...).toContain(...)` calls. A case with no `.output.*` sibling
 * asserts the opposite property — that the transform reports no change.
 *
 * The second block asserts the measured facts the swap carries, so that the
 * numbers in `docs/program-2026-09-04/reports/icon-swap-contract-2026-09.md`
 * cannot drift away from the code that implements them.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import { extractScriptFromVue, replaceScriptInVue } from '../../utils/vue-sfc.js'
import transformer, {
  ALIASED_GLYPHS,
  CLASS_RENAMES,
  flaggedGlyphs,
  GLYPH_MAP,
  NEW_PACKAGE,
  OLD_PACKAGE,
  REDRAWN_GLYPHS,
  rewriteSpecifier,
} from '../swap-icon-library.js'

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '../__fixtures__/swap-icon-library')

/** Applies the transform the way `CodemodRunner` does, SFC extraction included. */
function applyTransform(path: string, source: string): string | null {
  const j = jscodeshift.withParser('tsx')
  const api = { jscodeshift: j, j, report: () => {}, stats: () => {} }

  if (path.endsWith('.vue')) {
    const extracted = extractScriptFromVue(source)
    if (extracted === null)
      return null
    const out = transformer({ path, source: extracted.script }, api as never, {})
    if (out === null || out === extracted.script)
      return null
    return replaceScriptInVue(source, out, extracted)
  }
  return transformer({ path, source }, api as never, {})
}

function fixtureCases(): { name: string, inputPath: string, outputPath: string | null }[] {
  const files = readdirSync(FIXTURES).sort()
  return files
    .filter(f => /\.input\.(?:ts|vue)$/.test(f))
    .map((f) => {
      const name = f.replace(/\.input\.(?:ts|vue)$/, '')
      const ext = f.endsWith('.vue') ? 'vue' : 'ts'
      const outputName = `${name}.output.${ext}`
      return {
        name,
        inputPath: resolve(FIXTURES, f),
        outputPath: files.includes(outputName) ? resolve(FIXTURES, outputName) : null,
      }
    })
}

describe('swap-icon-library fixtures', () => {
  const cases = fixtureCases()

  it('finds every fixture', () => {
    expect(cases.map(c => c.name)).toEqual([
      '01-named-import',
      '02-type-import',
      '03-deep-subpath',
      '04-dynamic-and-reexport',
      '05-idempotent',
      '06-unrelated',
      '07-sfc',
    ])
  })

  for (const testCase of cases) {
    const verb = testCase.outputPath === null ? 'leaves unchanged' : 'rewrites'
    it(`${verb}: ${testCase.name}`, () => {
      const source = readFileSync(testCase.inputPath, 'utf-8')
      const result = applyTransform(testCase.inputPath, source)

      if (testCase.outputPath === null) {
        // No output sibling: the transform must report "nothing to do". That is
        // what makes the codemod safe to re-run over a half-migrated tree.
        expect(result).toBeNull()
        return
      }

      const expected = readFileSync(testCase.outputPath, 'utf-8')
      expect(result?.replace(/\r\n/g, '\n').trimEnd()).toBe(expected.replace(/\r\n/g, '\n').trimEnd())
    })
  }

  it('is idempotent: a second pass over its own output changes nothing', () => {
    for (const testCase of cases) {
      if (testCase.outputPath === null)
        continue
      const once = readFileSync(testCase.outputPath, 'utf-8')
      expect(applyTransform(testCase.outputPath, once)).toBeNull()
    }
  })
})

describe('specifier rewriting', () => {
  it('rewrites the bare package', () => {
    expect(rewriteSpecifier(OLD_PACKAGE)).toBe(NEW_PACKAGE)
  })

  it('rewrites a deep subpath and its extension (0.x ships .js, 1.x ships .mjs)', () => {
    expect(rewriteSpecifier('lucide-vue-next/dist/esm/icons/x.js'))
      .toBe('@lucide/vue/dist/esm/icons/x.mjs')
  })

  it('leaves everything else alone', () => {
    expect(rewriteSpecifier('reka-ui')).toBeNull()
    expect(rewriteSpecifier('@lucide/vue')).toBeNull()
    expect(rewriteSpecifier('lucide-vue-next-extras')).toBeNull()
  })
})

describe('the measured swap contract', () => {
  it('maps all 18 glyphs @dzup-ui/core imports', () => {
    expect(GLYPH_MAP.size).toBe(18)
  })

  it('renames nothing — every identifier exists in @lucide/vue@1.47.0 under the same name', () => {
    for (const [from, to] of GLYPH_MAP)
      expect(to).toBe(from)
  })

  it('flags the three redrawn glyphs', () => {
    expect(REDRAWN_GLYPHS).toEqual(['CalendarIcon', 'Clock', 'Filter'])
    for (const glyph of REDRAWN_GLYPHS)
      expect(GLYPH_MAP.has(glyph)).toBe(true)
  })

  it('flags the two alias exports and their canonical modules', () => {
    expect([...ALIASED_GLYPHS.entries()]).toEqual([['Filter', 'funnel'], ['MoreHorizontal', 'ellipsis']])
  })

  it('records a class rename for every glyph — none survives the swap unchanged', () => {
    expect(CLASS_RENAMES.size).toBe(GLYPH_MAP.size)
    for (const [, rename] of CLASS_RENAMES)
      expect(rename.from).not.toBe(rename.to)
  })

  it('gives the two aliased glyphs an extra class, not a replaced one', () => {
    expect(CLASS_RENAMES.get('Filter')?.to).toBe('lucide lucide-funnel lucide-filter')
    expect(CLASS_RENAMES.get('MoreHorizontal')?.to).toBe('lucide lucide-ellipsis lucide-more-horizontal')
  })

  it('reports what a given import list carries', () => {
    expect(flaggedGlyphs(['X', 'Filter', 'Clock', 'Sparkles'])).toEqual({
      redrawn: ['Filter', 'Clock'],
      aliased: ['Filter'],
      unknown: ['Sparkles'],
    })
  })
})
