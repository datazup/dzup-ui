import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { collectExportTargets, validatePackageExportMap } from './export-map.ts'

describe('collectExportTargets', () => {
  it('collects a plain STRING target — the shape that shipped broken', () => {
    // `"./styles": "./dist/core.css"` is not a { types, import } object, so the
    // original validator walked straight past it.
    expect(collectExportTargets({ './styles': './dist/core.css' })).toEqual([
      { subpath: './styles', conditions: [], target: './dist/core.css' },
    ])
  })

  it('collects condition-object targets with their condition chain', () => {
    expect(collectExportTargets({
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
    })).toEqual([
      { subpath: '.', conditions: ['types'], target: './dist/index.d.ts' },
      { subpath: '.', conditions: ['import'], target: './dist/index.js' },
    ])
  })

  it('handles the exports sugar string, nested conditions, arrays and null', () => {
    expect(collectExportTargets('./dist/index.js')).toEqual([
      { subpath: '.', conditions: [], target: './dist/index.js' },
    ])

    expect(collectExportTargets({ '.': { node: { import: './dist/node.js' } } })).toEqual([
      { subpath: '.', conditions: ['node', 'import'], target: './dist/node.js' },
    ])

    expect(collectExportTargets({ '.': { import: ['./dist/a.js', './dist/b.js'] } })).toEqual([
      { subpath: '.', conditions: ['import'], target: './dist/a.js' },
      { subpath: '.', conditions: ['import'], target: './dist/b.js' },
    ])

    // `null` deliberately blocks a subpath — nothing to check.
    expect(collectExportTargets({ './internal': null })).toEqual([])
  })
})

describe('validatePackageExportMap', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'dzup-exports-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  function write(relPath: string, content = '/* x */'): void {
    const abs = resolve(dir, relPath)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, content, 'utf-8')
  }

  it('fails on a string target whose file the build never emitted (the core.css bug)', () => {
    write('dist/index.js')
    // dist/ exists, but no core.css in it — exactly the pre-fix tree.
    const { errors } = validatePackageExportMap(dir, {
      name: '@dzup-ui/core',
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
        './styles': './dist/core.css',
      },
    })

    const styles = errors.filter(e => e.subpath === './styles')
    expect(styles).toHaveLength(1)
    expect(styles[0]?.target).toBe('./dist/core.css')
    expect(styles[0]?.message).toContain('does not exist')
  })

  it('passes once the build emits the CSS', () => {
    write('dist/index.js')
    write('dist/index.d.ts')
    write('dist/core.css', 'body{margin:0}')

    const { errors, checked } = validatePackageExportMap(dir, {
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
        './styles': './dist/core.css',
      },
    })

    expect(errors).toEqual([])
    expect(checked).toBe(3)
  })

  it('catches a subpath whose .d.ts exists but whose .js chunk was never emitted', () => {
    // The family-barrel bug: vite-plugin-dts walks types, Rollup inlined the
    // re-export-only barrel, so the .d.ts shipped without any .js beside it.
    write('dist/components/buttons/index.d.ts')

    const { errors } = validatePackageExportMap(dir, {
      exports: {
        './buttons': {
          types: './dist/components/buttons/index.d.ts',
          import: './dist/components/buttons/index.js',
        },
      },
    })

    expect(errors).toHaveLength(1)
    expect(errors[0]?.target).toBe('./dist/components/buttons/index.js')
    expect(errors[0]?.conditions).toEqual(['import'])
  })

  it('validates non-JS targets other than CSS (e.g. .json)', () => {
    write('dist/index.js')
    const { errors } = validatePackageExportMap(dir, {
      exports: { './tokens.json': './dist/tokens.json' },
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]?.target).toBe('./dist/tokens.json')
  })

  it('checks the legacy main/module/types fields too', () => {
    write('dist/index.js')
    const { errors } = validatePackageExportMap(dir, {
      main: './dist/index.js',
      module: './dist/index.js',
      types: './dist/index.d.ts', // missing
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]?.subpath).toBe('types')
  })

  it('rejects a target that is not a relative "./" specifier', () => {
    write('dist/index.js')
    const { errors } = validatePackageExportMap(dir, {
      exports: { './bad': 'dist/index.js' },
    })
    expect(errors[0]?.message).toContain('must start with "./"')
  })

  it('resolves wildcard targets, failing only when nothing matches', () => {
    write('dist/components/buttons/index.js')

    expect(validatePackageExportMap(dir, {
      exports: { './*': './dist/components/*/index.js' },
    }).errors).toEqual([])

    expect(validatePackageExportMap(dir, {
      exports: { './*': './dist/missing/*/index.js' },
    }).errors).toHaveLength(1)
  })

  it('skips dist targets on an unbuilt tree, but not when requireBuilt is set', () => {
    // No dist/ at all — a pre-build checkout. Skipping keeps `yarn validate:exports`
    // usable before a build…
    const unbuilt = validatePackageExportMap(dir, { exports: { './styles': './dist/core.css' } })
    expect(unbuilt.skippedUnbuilt).toBe(true)
    expect(unbuilt.errors).toEqual([])

    // …but the post-build CI run must not silently pass on a missing dist.
    const built = validatePackageExportMap(
      dir,
      { exports: { './styles': './dist/core.css' } },
      { requireBuilt: true },
    )
    expect(built.skippedUnbuilt).toBe(false)
    expect(built.errors).toHaveLength(1)
  })
})
