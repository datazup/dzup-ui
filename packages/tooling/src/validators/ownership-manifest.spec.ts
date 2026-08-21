import type { OwnershipEntry, OwnershipManifest } from '../ownership/ownership-manifest.types.ts'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  buildOwnershipManifest,
  OWNERSHIP_MANIFEST_PATH,
  serializeManifest,
} from '../ownership/generate-ownership-manifest.ts'
import {
  checkEntry,
  checkReferences,
  componentsWithoutAnatomy,
  partsOutsideVocabulary,
  readCeiling,
  validateOwnershipManifest,
} from './ownership-manifest.ts'

function entry(overrides: Partial<OwnershipEntry> = {}): OwnershipEntry {
  return {
    symbol: 'DzButton',
    package: '@dzup-ui/core',
    subpath: '.',
    kind: 'public-component',
    evidence: ['packages/core/src/components/buttons/DzButton.vue'],
    ...overrides,
  }
}

describe('checkEntry', () => {
  it('accepts a well-formed entry', () => {
    expect(checkEntry(entry(), 0)).toEqual([])
  })

  it('rejects an unscoped package name', () => {
    expect(checkEntry(entry({ package: 'core' }), 0)).toHaveLength(1)
  })

  it('rejects a subpath that is not an exports subpath', () => {
    expect(checkEntry(entry({ subpath: 'buttons' }), 0)).toHaveLength(1)
    expect(checkEntry(entry({ subpath: './buttons' }), 0)).toEqual([])
  })

  it('rejects an unknown kind', () => {
    expect(checkEntry(entry({ kind: 'widget' as OwnershipEntry['kind'] }), 0)).toHaveLength(1)
  })

  it('rejects an entry with no evidence — an unjustified classification is a guess', () => {
    expect(checkEntry(entry({ evidence: [] }), 0)).toHaveLength(1)
  })

  it('requires parentComponent on a compound-part', () => {
    expect(checkEntry(entry({ symbol: 'DzCardBody', kind: 'compound-part' }), 0)).toHaveLength(1)
    expect(checkEntry(entry({ symbol: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard' }), 0))
      .toEqual([])
  })

  it('requires aliasOf on a compat-alias', () => {
    expect(checkEntry(entry({ package: '@dzup-ui/compat', kind: 'compat-alias' }), 0)).toHaveLength(1)
  })

  it('rejects an unknown maturity', () => {
    expect(checkEntry(entry({ status: 'gold' as OwnershipEntry['status'] }), 0)).toHaveLength(1)
  })

  it('names the offending entry so a 1,300-line file is navigable', () => {
    expect(checkEntry(entry({ package: 'core' }), 42)[0]?.message).toContain('entries[42] (DzButton)')
  })
})

describe('checkReferences', () => {
  function manifestOf(entries: OwnershipEntry[]) {
    return { schemaVersion: '1.0.0', tier: 'core' as const, sourceCommit: 'x', generatedFrom: [], entries }
  }

  it('accepts a part pointing at a public component', () => {
    expect(checkReferences(manifestOf([
      entry({ symbol: 'DzCard' }),
      entry({ symbol: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard' }),
    ]))).toEqual([])
  })

  it('rejects a part whose parent is absent', () => {
    expect(checkReferences(manifestOf([
      entry({ symbol: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzGone' }),
    ]))).toHaveLength(1)
  })

  it('rejects a part whose parent is not itself a public component', () => {
    const violations = checkReferences(manifestOf([
      entry({ symbol: 'DzCard', kind: 'unclassified' }),
      entry({ symbol: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard' }),
    ]))
    expect(violations[0]?.message).toContain('is unclassified')
  })

  it('rejects an alias whose target is absent', () => {
    expect(checkReferences(manifestOf([
      entry({ symbol: 'DzButtonCompat', package: '@dzup-ui/compat', kind: 'compat-alias', aliasOf: 'DzGone' }),
    ]))).toHaveLength(1)
  })
})

describe('validateOwnershipManifest', () => {
  const report = validateOwnershipManifest()

  it('passes on the committed manifest', () => {
    expect(report.violations).toEqual([])
  })

  it('holds the unclassified count at or below the checked-in ceiling', () => {
    expect(report.unclassified.length).toBeLessThanOrEqual(report.ceiling)
  })

  it('reads a ceiling that ratchets down, never up', () => {
    // The number is only ever lowered by hand; a raise is the drift this gate exists to catch.
    expect(readCeiling().maxUnclassified).toBe(report.ceiling)
  })

  describe('against a tampered copy', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dzup-ownership-'))

    function write(mutate: (manifest: OwnershipManifest) => void, name: string): string {
      const manifest = JSON.parse(readFileSync(OWNERSHIP_MANIFEST_PATH, 'utf8')) as OwnershipManifest
      mutate(manifest)
      const path = join(dir, name)
      writeFileSync(path, serializeManifest(manifest), 'utf8')
      return path
    }

    it('fails freshness on a hand-edited entry', () => {
      const path = write((manifest) => {
        manifest.entries = manifest.entries.filter(entry => entry.symbol !== 'DzButton')
      }, 'removed.json')
      const violations = validateOwnershipManifest(path).violations
      expect(violations.some(v => v.rule === 'freshness')).toBe(true)
      expect(violations.find(v => v.rule === 'freshness')?.message).toContain('DzButton')
    })

    it('fails freshness when only a classification was edited', () => {
      const path = write((manifest) => {
        const entry = manifest.entries.find(e => e.symbol === 'DzButton')!
        entry.kind = 'internal'
      }, 'reclassified.json')
      expect(validateOwnershipManifest(path).violations.find(v => v.rule === 'freshness')?.message).toContain('same symbols')
    })

    it('ignores sourceCommit, which changes on every unrelated commit', () => {
      const path = write((manifest) => {
        manifest.sourceCommit = '0000000000000000000000000000000000000000'
      }, 'other-commit.json')
      expect(validateOwnershipManifest(path).violations).toEqual([])
    })

    it('reports a missing file as something to generate, not as a crash', () => {
      const violations = validateOwnershipManifest(join(dir, 'absent.json')).violations
      expect(violations).toHaveLength(1)
      expect(violations[0]?.message).toContain('generate:ownership:core')
    })

    it('reports invalid JSON without throwing', () => {
      const path = join(dir, 'broken.json')
      writeFileSync(path, '{ not json', 'utf8')
      expect(validateOwnershipManifest(path).violations[0]?.rule).toBe('freshness')
    })

    it('is written against the same builder the generator uses', () => {
      expect(serializeManifest(buildOwnershipManifest().manifest))
        .toBe(readFileSync(OWNERSHIP_MANIFEST_PATH, 'utf8'))
    })
  })
})

describe('the anatomy ratchet (TASK-OSS-P3-02, ADR-19)', () => {
  function manifestOf(entries: OwnershipEntry[]): OwnershipManifest {
    return {
      schemaVersion: '1.1.0',
      tier: 'core',
      sourceCommit: 'test',
      generatedFrom: [],
      entries,
    }
  }

  it('counts a public component with no anatomy', () => {
    expect(componentsWithoutAnatomy(manifestOf([entry()]))).toHaveLength(1)
  })

  it('does not count one that has declared an anatomy', () => {
    const declared = entry({
      anatomy: { parts: ['root'], states: [], componentTokens: [], riskTier: 'A' },
    })
    expect(componentsWithoutAnatomy(manifestOf([declared]))).toEqual([])
  })

  it('treats parts: none as a declaration, not as an absence', () => {
    // A renderless component HAS answered the question. Counting it as missing
    // would mean the ceiling could never reach zero.
    const renderless = entry({
      anatomy: { parts: 'none', states: [], componentTokens: [], riskTier: 'D' },
    })
    expect(componentsWithoutAnatomy(manifestOf([renderless]))).toEqual([])
  })

  it('does not ask compound parts for their own anatomy', () => {
    // A part's surface belongs to the component that owns it; requiring both
    // would double-count one decision and make the ceiling meaningless.
    const part = entry({ symbol: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard' })
    expect(componentsWithoutAnatomy(manifestOf([part]))).toEqual([])
  })

  it('ignores types, composables and recipes', () => {
    const others = [
      entry({ symbol: 'DzButtonProps', kind: 'type' }),
      entry({ symbol: 'useTheme', kind: 'composable' }),
      entry({ symbol: 'buttonVariants', kind: 'recipe' }),
    ]
    expect(componentsWithoutAnatomy(manifestOf(others))).toEqual([])
  })

  it('carries a ceiling that the repository currently sits exactly on', () => {
    // Exactly on, not under: the ceiling is initialised to today's count so the
    // next component to ship without an anatomy fails the gate.
    const report = validateOwnershipManifest()
    expect(report.withoutAnatomy).toHaveLength(report.anatomyCeiling)
    expect(report.violations.filter(violation => violation.rule === 'anatomy-ceiling')).toEqual([])
  })

  it('reports DzButton as the one component that has declared one', () => {
    const report = validateOwnershipManifest()
    const declared = report.total - report.withoutAnatomy.length
    expect(report.withoutAnatomy.map(component => component.symbol)).not.toContain('DzButton')
    expect(declared).toBeGreaterThan(0)
  })

  it('fails when the number of undeclared components rises above the ceiling', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dzup-anatomy-'))
    const manifest = JSON.parse(readFileSync(OWNERSHIP_MANIFEST_PATH, 'utf8')) as OwnershipManifest
    delete manifest.entries.find(candidate => candidate.symbol === 'DzButton')!.anatomy
    const path = join(dir, 'anatomy-removed.json')
    writeFileSync(path, serializeManifest(manifest), 'utf8')

    const rules = validateOwnershipManifest(path).violations.map(violation => violation.rule)
    expect(rules).toContain('anatomy-ceiling')
  })
})

describe('the vocabulary report (ADR-19 §3)', () => {
  function manifestWith(parts: string[] | 'none'): OwnershipManifest {
    return {
      schemaVersion: '1.1.0',
      tier: 'core',
      sourceCommit: 'test',
      generatedFrom: [],
      entries: [entry({
        anatomy: { parts, states: [], componentTokens: [], riskTier: 'C' },
      })],
    }
  }

  it('says nothing when every part is a vocabulary word', () => {
    expect(partsOutsideVocabulary(manifestWith(['root', 'content', 'label']))).toEqual([])
  })

  it('names a component-specific part and the component that declared it', () => {
    expect(partsOutsideVocabulary(manifestWith(['root', 'row', 'cell']))).toEqual([
      { symbol: 'DzButton', parts: ['row', 'cell'] },
    ])
  })

  it('has nothing to say about a renderless component', () => {
    expect(partsOutsideVocabulary(manifestWith('none'))).toEqual([])
  })

  it('reports, and never fails, on the real repository', () => {
    // A gate here would push authors toward a vocabulary word that fits worse,
    // which is the outcome the report exists to prevent.
    const report = validateOwnershipManifest()

    expect(report.vocabularyExtensions.length).toBeGreaterThan(0)
    expect(report.violations.map(violation => violation.rule)).not.toContain('vocabulary')
  })

  it('reports the table family, whose part names have no synonym', () => {
    const table = validateOwnershipManifest()
      .vocabularyExtensions
      .find(entry => entry.symbol === 'DzTable')

    expect(table?.parts).toEqual(['body', 'row', 'cell'])
  })
})
