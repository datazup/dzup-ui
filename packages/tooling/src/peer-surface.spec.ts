import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { collectEntrySurfaces, collectIconSurface, entryTargets, packageOf, resolveRelative, walkFrom } from './peer-surface.ts'

/**
 * A throwaway package with a `dist/` shaped like the one Rollup emits under
 * `preserveModules`: a barrel that re-exports leaf modules, one of which
 * reaches an external the barrel's other leaves do not.
 *
 * Built rather than mocked because the property under test IS the file layout —
 * a fake in-memory graph would agree with whatever the walker did.
 */
function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'dzup-peer-surface-'))
  mkdirSync(join(dir, 'dist', 'components'), { recursive: true })

  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({
      exports: {
        '.': { import: './dist/index.js' },
        './leaf': { import: './dist/components/leaf.js' },
        './missing': { import: './dist/components/absent.js' },
        './styles': './dist/styles.css',
      },
      name: '@fixture/pkg',
    }),
  )

  writeFileSync(join(dir, 'dist', 'index.js'), [
    `import { Leaf } from './components/leaf.js'`,
    `import { Heavy } from './components/heavy.js'`,
    `export { Heavy, Leaf }`,
  ].join('\n'))

  // Extensionless and directory-form specifiers both appear in real dist trees.
  writeFileSync(join(dir, 'dist', 'components', 'leaf.js'), [
    `import { ref } from 'vue'`,
    `import { helper } from '../shared'`,
    `export const Leaf = ref(helper)`,
  ].join('\n'))

  writeFileSync(join(dir, 'dist', 'shared.js'), `export const helper = 1`)

  writeFileSync(join(dir, 'dist', 'components', 'heavy.js'), [
    `import { Primitive } from 'reka-ui'`,
    `import { Check, ChevronDown as Down } from 'lucide-vue-next'`,
    `import { Sub } from '@scope/pkg/sub'`,
    `import fs from 'node:fs'`,
    `export const Heavy = [Primitive, Check, Down, Sub, fs]`,
  ].join('\n'))

  return dir
}

const dir = fixture()

afterAll(() => {
  rmSync(dir, { force: true, recursive: true })
})

describe('packageOf', () => {
  it('keeps the scope for a scoped specifier and drops the deep path', () => {
    expect(packageOf('@scope/pkg/sub/deep')).toBe('@scope/pkg')
    expect(packageOf('lucide-vue-next/icons/check')).toBe('lucide-vue-next')
    expect(packageOf('vue')).toBe('vue')
  })
})

describe('resolveRelative', () => {
  it('resolves the extensionless form a dist tree also contains', () => {
    const from = join(dir, 'dist', 'components', 'leaf.js')
    expect(resolveRelative(from, '../shared')).toBe(join(dir, 'dist', 'shared.js'))
  })

  it('returns null rather than guessing when nothing exists', () => {
    const from = join(dir, 'dist', 'index.js')
    expect(resolveRelative(from, './nope')).toBeNull()
  })
})

describe('walkFrom', () => {
  it('attributes an external to the module that imports it, not to the entry', () => {
    const { externals, modules } = walkFrom(join(dir, 'dist', 'index.js'))

    expect(modules.size).toBe(4)
    expect([...externals.keys()].sort()).toEqual(['@scope/pkg', 'lucide-vue-next', 'reka-ui', 'vue'])
    expect([...(externals.get('reka-ui') ?? [])].join()).toContain('heavy.js')
  })

  it('does not report node: builtins as external packages', () => {
    const { externals } = walkFrom(join(dir, 'dist', 'components', 'heavy.js'))
    expect([...externals.keys()]).not.toContain('node')
    expect([...externals.keys()]).not.toContain('node:fs')
  })

  it('separates a leaf that cannot reach the external from the barrel that can', () => {
    // The distinction the whole report exists for: an entry point's peer
    // requirement is a property of its reachable graph, not of the package.
    const leaf = walkFrom(join(dir, 'dist', 'components', 'leaf.js'))
    expect([...leaf.externals.keys()]).toEqual(['vue'])
  })
})

describe('entryTargets', () => {
  it('skips a non-.js export target and a target that is not on disk', () => {
    const targets = entryTargets(dir).map(target => target.subpath)
    expect(targets).toEqual(['.', './leaf'])
  })
})

describe('collectEntrySurfaces', () => {
  it('records module counts and sorted externals per subpath', () => {
    const surfaces = collectEntrySurfaces(dir)
    const barrel = surfaces.find(surface => surface.subpath === '.')
    const leaf = surfaces.find(surface => surface.subpath === './leaf')

    expect(Object.keys(barrel?.externals ?? {})).toEqual(['@scope/pkg', 'lucide-vue-next', 'reka-ui', 'vue'])
    expect(Object.keys(leaf?.externals ?? {})).toEqual(['vue'])
    expect(leaf?.modules).toBe(2)
  })
})

describe('collectIconSurface', () => {
  it('reads renamed imports under their SOURCE name', () => {
    // `ChevronDown as Down` is one glyph in the bundle and two identifiers in
    // the source. Counting the local alias would inflate the inventory that
    // sizes the icon-indirection contract.
    const { files, glyphs } = collectIconSurface([
      join(dir, 'dist', 'components', 'heavy.js'),
      join(dir, 'dist', 'components', 'leaf.js'),
    ])

    expect(Object.keys(glyphs)).toEqual(['Check', 'ChevronDown'])
    expect(files).toHaveLength(1)
  })

  it('reports nothing for a tree with no icon imports', () => {
    const { files, glyphs } = collectIconSurface([join(dir, 'dist', 'components', 'leaf.js')])
    expect(files).toEqual([])
    expect(Object.keys(glyphs)).toEqual([])
  })
})
