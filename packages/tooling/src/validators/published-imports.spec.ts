/**
 * Unit cover for the planning half of `validate:published-imports`.
 *
 * The gate's end-to-end proof is a seeded run (four of them, recorded in
 * docs/program-2026-09-04/reports/TASK-R1-O2-handoff.md): packing six tarballs
 * takes ~16 s and is not something a unit suite should do on every save. What
 * IS worth pinning here is the part that decides *what gets probed* — because
 * a planner that quietly drops a subpath produces a green gate over an
 * unprobed export, which is the failure mode the whole task exists to remove.
 */

import { describe, expect, it } from 'vitest'
import {
  classifyTarget,
  entryKey,
  formatReport,
  leavesBySubpath,
  planRuntimeProbes,
  planTypeProbes,
  publishedPackages,
  renderCatalogProbe,
  renderTypesProbe,
  runtimeLeafFor,
  sideEffectOnlyEntries,
  specifierFor,
} from './published-imports.ts'

describe('classifyTarget', () => {
  it('reads the extension, except that a `types` condition always wins', () => {
    expect(classifyTarget('./dist/index.js', ['import'])).toBe('esm')
    expect(classifyTarget('./dist/tokens.dtcg.json', [])).toBe('json')
    expect(classifyTarget('./dist/core.css', [])).toBe('asset')
    expect(classifyTarget('./dist/index.d.ts', ['types'])).toBe('types')
  })

  it('does not call a .d.ts reached through `import` a types target', () => {
    // Node would try to LOAD that file as a module. Classifying it as `types`
    // would file a real defect under "not applicable".
    expect(classifyTarget('./dist/index.d.ts', ['import'])).toBe('esm')
  })
})

describe('specifierFor', () => {
  it('writes what a consumer writes', () => {
    expect(specifierFor('@dzup-ui/core', '.')).toBe('@dzup-ui/core')
    expect(specifierFor('@dzup-ui/core', './i18n')).toBe('@dzup-ui/core/i18n')
    expect(specifierFor('@dzup-ui/core', './i18n/locales/en.json')).toBe('@dzup-ui/core/i18n/locales/en.json')
  })
})

describe('runtimeLeafFor', () => {
  const leaf = (conditions: string[], target: string) => ({ subpath: '.', conditions, target })

  it('prefers `import` over `default`, and never picks the `types` leaf', () => {
    expect(runtimeLeafFor([
      leaf(['types'], './dist/index.d.ts'),
      leaf(['import'], './dist/index.js'),
      leaf(['default'], './dist/fallback.js'),
    ])).toEqual(leaf(['import'], './dist/index.js'))
  })

  it('takes a plain string target before any condition', () => {
    expect(runtimeLeafFor([leaf([], './dist/core.css')])).toEqual(leaf([], './dist/core.css'))
  })

  it('returns undefined for a types-only subpath — which is not importable', () => {
    expect(runtimeLeafFor([leaf(['types'], './dist/index.d.ts')])).toBeUndefined()
  })
})

describe('planRuntimeProbes', () => {
  const exportsMap = {
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
    './i18n': { types: './dist/i18n/index.d.ts', import: './dist/i18n/index.js' },
    './i18n/locales/en.json': './dist/i18n/locales/en.json',
    './styles': './dist/core.css',
  }

  it('plans exactly one probe per subpath, with the right kind', () => {
    const { probes } = planRuntimeProbes('@dzup-ui/core', exportsMap)
    expect(probes.map(p => [p.specifier, p.kind])).toEqual([
      ['@dzup-ui/core', 'esm'],
      ['@dzup-ui/core/i18n', 'esm'],
      ['@dzup-ui/core/i18n/locales/en.json', 'json'],
      ['@dzup-ui/core/styles', 'asset'],
    ])
  })

  it('reports wildcard subpaths as uncovered rather than dropping them', () => {
    const { probes, skippedWildcards } = planRuntimeProbes('@dzup-ui/core', { './parts/*': './dist/parts/*.js' })
    expect(probes).toEqual([])
    expect(skippedWildcards).toEqual(['./parts/*'])
  })

  it('covers 100 % of non-wildcard subpaths — the success criterion, as an assertion', () => {
    const subpaths = [...leavesBySubpath(exportsMap).keys()]
    const { probes } = planRuntimeProbes('@dzup-ui/core', exportsMap)
    expect(probes.map(p => p.subpath).sort()).toEqual([...subpaths].sort())
  })
})

describe('planTypeProbes', () => {
  it('takes every subpath that declares a `types` condition, and only those', () => {
    const probes = planTypeProbes('@dzup-ui/core', {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './styles': './dist/core.css',
    })
    expect(probes.map(p => p.specifier)).toEqual(['@dzup-ui/core'])
  })
})

describe('renderTypesProbe / renderCatalogProbe', () => {
  it('emits one resolvable re-export per types subpath', () => {
    const probes = planTypeProbes('@dzup-ui/core', { './i18n': { types: './dist/i18n/index.d.ts' } })
    expect(renderTypesProbe(probes)).toContain('export * as ns0 from \'@dzup-ui/core/i18n\'')
  })

  it('keeps the catalog assertion in a program that imports ONLY the package root', () => {
    // Measured 2026-09-21: with the assertion in types-probe.ts, deleting the
    // augmentation's reference from dist/index.d.ts still passed, because the
    // sibling `@dzup-ui/core/i18n` import had already loaded messages.d.ts.
    const source = renderCatalogProbe()
    expect(source).toContain('import \'@dzup-ui/core\'')
    expect(source).not.toContain('@dzup-ui/core/i18n')
    expect(source).toContain('DZUP_ERROR')
  })
})

describe('formatReport', () => {
  it('names package, version, subpath, condition and the raw error on one line', () => {
    const report = formatReport([
      {
        packageName: '@dzup-ui/core',
        version: '0.2.0',
        subpath: './i18n',
        conditions: ['import'],
        kind: 'esm',
        ok: false,
        error: 'ERR_PACKAGE_PATH_NOT_EXPORTED (exports has no "./i18n")',
      },
      { packageName: '@dzup-ui/tokens', version: '0.2.0', subpath: '.', conditions: ['import'], kind: 'esm', ok: true },
    ], '/tmp/dzup-pack-xxxx')

    expect(report).toContain('validate:published-imports FAILED')
    expect(report).toContain('@dzup-ui/core@0.2.0  ./i18n  import  → ERR_PACKAGE_PATH_NOT_EXPORTED')
    expect(report).toContain('1 of 2 entries failed · tarballs: /tmp/dzup-pack-xxxx')
  })
})

describe('the gate inventory is release-policy.json, not a hand-kept list', () => {
  it('resolves every `published` package to a workspace directory', () => {
    const packages = publishedPackages()
    expect(packages.map(p => p.name)).toEqual([
      '@dzup-ui/codemods',
      '@dzup-ui/contracts',
      '@dzup-ui/core',
      '@dzup-ui/mcp',
      '@dzup-ui/nuxt',
      '@dzup-ui/testing',
      '@dzup-ui/tokens',
    ])
  })
})

describe('side-effect-only policy', () => {
  it('is an allowlist with reasons, not a relaxed rule', () => {
    const allowed = sideEffectOnlyEntries()
    expect(allowed.has(entryKey('@dzup-ui/testing', './vitest'))).toBe(true)
    // A component family barrel must never be in it: `export * from './missing.ts'`
    // yields an EMPTY namespace rather than throwing, so "it imported" would be a
    // pass for a package that exports nothing at all.
    expect(allowed.has(entryKey('@dzup-ui/core', './buttons'))).toBe(false)
    expect(allowed.has(entryKey('@dzup-ui/core', '.'))).toBe(false)
  })
})
