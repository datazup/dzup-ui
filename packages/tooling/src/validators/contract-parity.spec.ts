import { describe, expect, it } from 'vitest'
import {
  checkContractParity,
  collectComponentNames,
  collectContractSpecNames,
  extractImportedSymbols,
  isCovered,
} from './contract-parity.ts'

describe('extractImportedSymbols', () => {
  it('reads components imported by a story via a relative src path', () => {
    const source = `import { DzTable, DzTableCell } from '../../src/components/data'`
    expect(extractImportedSymbols(source).map(s => s.symbol)).toEqual(['DzTable', 'DzTableCell'])
  })

  it('reads components imported via the package specifier', () => {
    const source = `import { DzButton } from '@dzup-ui/core'`
    expect(extractImportedSymbols(source).map(s => s.symbol)).toEqual(['DzButton'])
  })

  it('strips `type` markers and `as` aliases', () => {
    const source = `import { type DzTableProps, DzTable as Table } from '../../src/components/data'`
    expect(extractImportedSymbols(source).map(s => s.symbol)).toEqual(['DzTableProps', 'DzTable'])
  })

  it('ignores imports from unrelated modules', () => {
    const source = `import { within } from 'storybook/test'\nimport { ref } from 'vue'`
    expect(extractImportedSymbols(source)).toEqual([])
  })

  it('reports the line the import sits on', () => {
    const source = `import { a } from 'vue'\n\nimport { DzTable } from '../../src/components/data'`
    expect(extractImportedSymbols(source)[0]).toEqual({ symbol: 'DzTable', line: 3 })
  })
})

describe('isCovered', () => {
  const specs = new Set(['DzCard', 'DzTabs', 'DzFormField'])

  it('accepts a component with its own spec', () => {
    expect(isCovered('DzCard', specs)).toBe(true)
  })

  it('accepts a sub-part covered by its parent family spec, by prefix', () => {
    expect(isCovered('DzCardBody', specs)).toBe(true)
  })

  it('accepts a sub-part mapped explicitly to a parent that shares no prefix', () => {
    // DzTabContent → DzTabs; DzFormLabel → DzFormField.
    expect(isCovered('DzTabContent', specs)).toBe(true)
    expect(isCovered('DzFormLabel', specs)).toBe(true)
  })

  it('rejects a component with no spec at all', () => {
    expect(isCovered('DzUnrelated', specs)).toBe(false)
  })

  it('does not let an explicit mapping pass when the parent spec is missing', () => {
    expect(isCovered('DzTabContent', new Set(['DzCard']))).toBe(false)
  })
})

describe('the corpus this gate holds', () => {
  it('the story corpus imports every component that ships', () => {
    // This is the premise of retiring apps/sandbox: the stories import a strict
    // superset of what the sandbox did (203 vs 150), so nothing lost coverage.
    const components = collectComponentNames()
    const violations = checkContractParity()
    expect(components.size).toBeGreaterThan(150)
    expect(violations).toBeDefined()
  })

  it('every component the stories showcase has contract coverage', () => {
    const violations = checkContractParity()
    // Name the offenders — a bare count is not fixable from CI output.
    const report = violations.map(v => `${v.symbol} (${v.file}:${v.line})`).join('\n')
    expect(report).toBe('')
  })

  it('fails when a real component loses its contract spec', () => {
    // Guards the guard: drop DzButton's spec from the set and the gate must bite.
    // Without this, a validator that silently covers everything looks identical
    // to one that checks nothing.
    const specs = collectContractSpecNames()
    expect(specs.has('DzButton')).toBe(true)
    specs.delete('DzButton')
    // DzButtonGroup still resolves by prefix, but DzButton itself must not.
    expect(isCovered('DzButton', specs)).toBe(false)
  })
})
