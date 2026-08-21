import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseNamedClause, scanModuleExports } from './module-exports.ts'

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '__fixtures__/barrel')

describe('parseNamedClause', () => {
  it('reports the exported name, not the local one', () => {
    expect(parseNamedClause('a, b as c')).toEqual([
      { symbol: 'a', typeOnly: false },
      { symbol: 'c', typeOnly: false },
    ])
  })

  it('marks inline type specifiers', () => {
    expect(parseNamedClause('type ButtonVariantProps, buttonVariants')).toEqual([
      { symbol: 'ButtonVariantProps', typeOnly: true },
      { symbol: 'buttonVariants', typeOnly: false },
    ])
  })

  it('keeps `default as X` under its public name and drops a bare default', () => {
    expect(parseNamedClause('default as DzButton')).toEqual([{ symbol: 'DzButton', typeOnly: false }])
    expect(parseNamedClause('default')).toEqual([])
  })

  it('tolerates the multi-line, trailing-comma form the barrels are written in', () => {
    expect(parseNamedClause('\n  DzButtonProps,\n  DzButtonSlots,\n')).toEqual([
      { symbol: 'DzButtonProps', typeOnly: false },
      { symbol: 'DzButtonSlots', typeOnly: false },
    ])
  })
})

describe('scanModuleExports', () => {
  const scan = scanModuleExports(resolve(FIXTURES, 'index.ts'))

  it('follows `export *` transitively', () => {
    expect([...scan.exports.keys()].sort()).toEqual([
      'DzFixture',
      'DzFixtureProps',
      'LeafInterface',
      'Orientation',
      'leafValue',
    ])
  })

  it('attributes a component to the .vue file the barrel re-exports', () => {
    expect(scan.exports.get('DzFixture')?.declaredIn.replaceAll('\\', '/')).toContain('DzFixture.vue')
  })

  it('attributes an external re-export to the package it came from', () => {
    expect(scan.exports.get('Orientation')?.declaredIn).toBe('@dzup-ui/contracts')
  })

  it('marks type-only exports', () => {
    expect(scan.exports.get('LeafInterface')?.typeOnly).toBe(true)
    expect(scan.exports.get('leafValue')?.typeOnly).toBe(false)
  })

  it('reports a module it could not resolve instead of silently exporting nothing', () => {
    expect(scan.unreadable.join(' ')).toContain('missing.ts')
  })

  it('does not widen a named re-export into everything the target declares', () => {
    // family.ts re-exports only `leafValue` from leaf.ts. A scanner that visited
    // leaf.ts anyway would invent two public exports the package does not have.
    expect(scan.exports.has('leafFn')).toBe(false)
    expect(scan.exports.has('LeafType')).toBe(false)
  })
})
