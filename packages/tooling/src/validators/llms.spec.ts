/**
 * Specs for `yarn validate:llms` (TASK-N2-A3).
 *
 * Every clause is driven to failure with a fabricated input, because a gate
 * that has never been observed failing is a gate whose failure mode is unknown
 * — the lesson N2-A2's finding F-4 paid for (a reachability clause that matched
 * a filename stayed green when the statement it guarded was deleted, because a
 * comment still contained the filename).
 *
 * The last block runs the REAL repository through the gate with `--no-blocks`,
 * so a green suite means the committed documents actually pass.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as curated from '../llms/llms-content.ts'
import {
  checkLlmsDocs,
  DOCUMENTS,
  exportedStrings,
  fullSectionNames,
  hardTypedCounts,
  indexComponentNames,
  indexEntriesWithoutDescription,
  ROOT,
  structuralProblems,
} from './llms.ts'

describe('structuralProblems — clause C', () => {
  it('accepts a well-formed document', () => {
    const md = ['# Title', '', '| A | B |', '| --- | --- |', '| 1 | 2 |', '', '```vue', 'x', '```'].join('\n')
    expect(structuralProblems('doc', md)).toEqual([])
  })

  it('fails on an unbalanced fence', () => {
    expect(structuralProblems('doc', '# T\n\n```vue\nx\n').join()).toMatch(/unbalanced code fences/)
  })

  it('fails on a ragged table', () => {
    const md = ['# T', '', '| A | B |', '| --- | --- |', '| 1 |'].join('\n')
    expect(structuralProblems('doc', md).join()).toMatch(/ragged columns/)
  })

  it('does NOT treat an escaped pipe as a column boundary', () => {
    const md = ['# T', '', '| A | B |', '| --- | --- |', '| `"a" \\| "b"` | x |'].join('\n')
    expect(structuralProblems('doc', md)).toEqual([])
  })

  it('ignores a table-looking line inside a fence', () => {
    const md = ['# T', '', '```md', '| A |', '```'].join('\n')
    expect(structuralProblems('doc', md)).toEqual([])
  })

  it('fails on zero or two H1s', () => {
    expect(structuralProblems('doc', 'no heading').join()).toMatch(/found 0/)
    expect(structuralProblems('doc', '# A\n# B').join()).toMatch(/found 2/)
  })
})

describe('parseability helpers — clause D', () => {
  const index = [
    '# dzup-ui components',
    '',
    '## Conventions',
    '',
    '- **Import** — everything is a named export.',
    '',
    '## Buttons',
    '',
    '- **DzButton** — Primary button component.',
    '  - props: `variant`',
    '- **GovernanceBadge** — Non-Dz public component.',
    '- **DzNoDescription**',
  ].join('\n')

  it('skips the curated Conventions section, so its bullets are not components', () => {
    expect(indexComponentNames(index)).toEqual(['DzButton', 'GovernanceBadge', 'DzNoDescription'])
  })

  it('reads a component name that carries no Dz prefix', () => {
    expect(indexComponentNames(index)).toContain('GovernanceBadge')
  })

  it('reports an entry with no description', () => {
    expect(indexEntriesWithoutDescription(index)).toEqual(['DzNoDescription'])
  })

  it('reads `### Name` section headings out of the full document', () => {
    expect(fullSectionNames('## Buttons\n\n### DzButton\n\n### TeamMemberBadge\n')).toEqual([
      'DzButton',
      'TeamMemberBadge',
    ])
  })
})

describe('hardTypedCounts — clause G', () => {
  it('flags a catalog count typed into curated prose', () => {
    expect(hardTypedCounts(['144 components across 12 families'])).toEqual([
      '144 components',
      '12 families',
    ])
  })

  it('does not flag a framework version', () => {
    expect(hardTypedCounts(['The Vue 3 component library published as @dzup-ui/core'])).toEqual([])
  })

  it('does not flag an ADR citation', () => {
    expect(hardTypedCounts(['v-model through defineModel (ADR-16)'])).toEqual([])
  })

  it('scans the real curated source and finds nothing', () => {
    expect(hardTypedCounts(exportedStrings(curated as unknown as Record<string, unknown>))).toEqual([])
  })
})

describe('exportedStrings', () => {
  it('flattens scalars, arrays and record values', () => {
    expect(exportedStrings({ a: 'x', b: ['y', 'z'], c: { d: 'w' }, e: 3 }).sort()).toEqual([
      'w',
      'x',
      'y',
      'z',
    ])
  })
})

describe('the reachability and B9 clauses read the real build script — clause E/F', () => {
  const script = readFileSync(resolve(ROOT, 'apps/storybook/scripts/build-llms.mjs'), 'utf8')

  it('matches the copy CALL, not merely the filename', () => {
    // The regression N2-A2 finding F-4 describes: deleting the statement while
    // leaving the filename in a comment must not keep the clause satisfied.
    const withoutCall = script.replace(
      /await\s+copyFile\(\s*from\s*,\s*resolve\(\s*appRoot\s*,\s*dest\s*\)\s*\)/,
      '/* copyFile(from, resolve(appRoot, dest)) removed */',
    )
    expect(withoutCall).toContain('public/llms.txt')
    expect(/await\s+copyFile\(\s*from\s*,\s*resolve\(\s*appRoot\s*,\s*dest\s*\)\s*\)/.test(withoutCall)).toBe(false)
    expect(/await\s+copyFile\(\s*from\s*,\s*resolve\(\s*appRoot\s*,\s*dest\s*\)\s*\)/.test(script)).toBe(true)
  })

  it('confirms the script no longer imports a TypeScript parser (constraint B9)', () => {
    expect(/from\s+'typescript'/.test(script)).toBe(false)
  })

  it('declares both source → destination pairs', () => {
    expect(/'packages\/core\/docs\/llms\.txt'\s*,\s*'public\/llms\.txt'/.test(script)).toBe(true)
    expect(/'packages\/core\/docs\/llms-full\.txt'\s*,\s*'public\/llms-full\.txt'/.test(script)).toBe(true)
  })
})

describe('the four governed documents', () => {
  it('names two component documents and two blocks documents', () => {
    expect(DOCUMENTS.map(d => d[1])).toEqual([
      'packages/core/docs/llms.txt',
      'packages/core/docs/llms-full.txt',
      'apps/landing/public/llms.txt',
      'apps/landing/public/llms-full.txt',
    ])
  })

  it('the two subjects are different documents, not two copies — the stop condition', () => {
    const components = readFileSync(resolve(ROOT, 'packages/core/docs/llms.txt'), 'utf8')
    const blocks = readFileSync(resolve(ROOT, 'apps/landing/public/llms.txt'), 'utf8')
    expect(components.split('\n')[0]).toBe('# dzup-ui components')
    expect(blocks.split('\n')[0]).toBe('# dzup-ui blocks')
    // …and each points a reader at the other.
    expect(components).toContain('/llms.txt')
    expect(blocks).toContain('/storybook/llms.txt')
  })
})

describe('the real repository passes the gate', () => {
  // Blocks freshness is skipped here: it loads the whole landing catalog
  // through Vite (~20 s), which belongs in the gate, not in a unit suite.
  const result = checkLlmsDocs({ skipBlocks: true })

  it('reports no errors', () => {
    expect(result.errors).toEqual([])
  })

  it('finds every public component discoverable', () => {
    expect(result.stats.publicComponentsUnreachable).toBe(0)
    expect(result.stats.indexEntries).toBeGreaterThanOrEqual(result.stats.publicComponents!)
  })

  it('states the skip rather than passing silently', () => {
    expect(result.notes.join('\n')).toMatch(/blocks freshness SKIPPED/)
  })
}, 120_000)
