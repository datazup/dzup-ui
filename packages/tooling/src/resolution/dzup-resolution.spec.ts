import type { DzupResolutionMode } from './dzup-resolution.types.ts'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDzupResolution, discoverDzupPackages, toViteAliases } from './dzup-resolution.ts'

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..')

// --- fixture -----------------------------------------------------------------

/**
 * A miniature monorepo on disk.
 *
 * The helper reads `exports` maps and checks that files exist, so a fixture has
 * to be real files — a mocked `fs` would prove the algorithm agrees with itself
 * and nothing about whether it agrees with a package.
 */
function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-resolution-'))
  const write = (relative: string, body: string): void => {
    const path = join(root, relative)
    mkdirSync(resolve(path, '..'), { recursive: true })
    writeFileSync(path, body, 'utf8')
  }

  write('packages/core/package.json', JSON.stringify({
    name: '@dzup-ui/core',
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './providers': { types: './dist/providers/index.d.ts', import: './dist/providers/index.js' },
      './styles': './dist/core.css',
    },
    peerDependencies: { 'reka-ui': '^2.0.0', 'vue': '^3.5.0' },
  }))
  write('packages/core/src/index.ts', '')
  write('packages/core/src/providers/index.ts', '')
  write('packages/core/src/styles/base.css', '')
  write('packages/core/dist/index.js', '')

  write('packages/tokens/package.json', JSON.stringify({
    name: '@dzup-ui/tokens',
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './css': './dist/tokens.css',
    },
  }))
  write('packages/tokens/src/index.ts', '')
  write('packages/tokens/dist/index.js', '')
  // Generated and committed — no `src/tokens.css` exists, in this fixture or in
  // the real repository.
  write('packages/tokens/dist/tokens.css', '')

  write('packages/tooling/package.json', JSON.stringify({
    name: '@dzup-ui/tooling',
    private: true,
    exports: { '.': { types: './src/index.ts', import: './src/index.ts' } },
  }))
  write('packages/tooling/src/index.ts', '')

  // Not a dzup package: must be ignored rather than tripping the helper.
  write('packages/unrelated/package.json', JSON.stringify({ name: 'unrelated', exports: {} }))

  return root
}

function find(mode: DzupResolutionMode, root: string, specifier: string): string | undefined {
  return createDzupResolution({ mode, root }).alias.find(a => a.find === specifier)?.replacement
}

// --- the mode is the point ---------------------------------------------------

describe('the mode is required', () => {
  it('throws when it is missing, and says what to pass', () => {
    expect(() => createDzupResolution({} as never))
      .toThrow(/requires an explicit `mode`/)
  })

  it('throws on a plausible-but-wrong mode rather than falling back', () => {
    expect(() => createDzupResolution({ mode: 'source' as never }))
      .toThrow(/merged-source.*externalized/s)
  })

  it('reports the value it was given', () => {
    expect(() => createDzupResolution({ mode: 'dev' as never })).toThrow(/"dev"/)
  })
})

// --- merged-source -----------------------------------------------------------

describe('merged-source', () => {
  const root = fixtureRoot()

  it('resolves the package entry to source', () => {
    expect(find('merged-source', root, '@dzup-ui/core'))
      .toBe(join(root, 'packages/core/src/index.ts'))
  })

  it('resolves a declared subpath export to source', () => {
    expect(find('merged-source', root, '@dzup-ui/core/providers'))
      .toBe(join(root, 'packages/core/src/providers/index.ts'))
  })

  it('resolves a generated artifact to dist, because no source exists', () => {
    const css = createDzupResolution({ mode: 'merged-source', root })
      .alias
      .find(a => a.find === '@dzup-ui/tokens/css')
    expect(css?.replacement).toBe(join(root, 'packages/tokens/dist/tokens.css'))
    expect(css?.origin).toBe('generated-artifact')
    expect(css?.reason).toMatch(/tokens:generate/)
  })

  it('applies a declared override where the rule cannot derive the source', () => {
    const styles = createDzupResolution({ mode: 'merged-source', root })
      .alias
      .find(a => a.find === '@dzup-ui/core/styles')
    expect(styles?.replacement).toBe(join(root, 'packages/core/src/styles/base.css'))
    expect(styles?.origin).toBe('override')
    expect(styles?.reason).toBeTruthy()
  })

  it('dedupes vue, reka-ui and every dzup package', () => {
    const { dedupe } = createDzupResolution({ mode: 'merged-source', root })
    expect(dedupe).toContain('vue')
    expect(dedupe).toContain('reka-ui')
    expect(dedupe).toContain('@dzup-ui/core')
  })

  it('excludes the workspace packages from pre-bundling', () => {
    expect(createDzupResolution({ mode: 'merged-source', root }).optimizeDeps.exclude)
      .toContain('@dzup-ui/core')
  })
})

// --- externalized ------------------------------------------------------------

describe('externalized', () => {
  const root = fixtureRoot()

  it('resolves to built output', () => {
    expect(find('externalized', root, '@dzup-ui/core'))
      .toBe(join(root, 'packages/core/dist/index.js'))
  })

  it('never points at src/ — the safety property, asserted over every entry', () => {
    const { alias } = createDzupResolution({
      mode: 'externalized',
      root,
      packages: ['@dzup-ui/core', '@dzup-ui/tokens'],
    })
    expect(alias.length).toBeGreaterThan(0)
    for (const entry of alias)
      expect(entry.replacement).not.toMatch(/[\\/]src[\\/]/)
  })

  it('drops private packages from the default set — they have no published form', () => {
    const { alias } = createDzupResolution({ mode: 'externalized', root })
    expect([...new Set(alias.map(a => a.package))]).not.toContain('@dzup-ui/tooling')
    expect([...new Set(alias.map(a => a.package))]).toContain('@dzup-ui/core')
  })

  it('refuses a source-only package that was asked for by name', () => {
    expect(() => createDzupResolution({
      mode: 'externalized',
      root,
      packages: ['@dzup-ui/tooling'],
    })).toThrow(/@dzup-ui\/tooling.*cannot be externalized/s)
  })

  it('does not dedupe the dzup packages — node resolution owns that', () => {
    const { dedupe } = createDzupResolution({
      mode: 'externalized',
      root,
      packages: ['@dzup-ui/core'],
    })
    expect(dedupe).toEqual(['reka-ui', 'vue'])
  })
})

// --- ordering ----------------------------------------------------------------

describe('ordering, which is load-bearing', () => {
  const root = fixtureRoot()

  it('puts every subpath before the bare package it extends', () => {
    const { alias } = createDzupResolution({ mode: 'merged-source', root })
    for (const [index, entry] of alias.entries()) {
      if (entry.subpath === '.')
        continue
      const bare = alias.findIndex(a => a.find === entry.package)
      expect(
        index,
        `${entry.find} must be declared before ${entry.package}, or Vite's prefix `
        + 'match swallows it',
      ).toBeLessThan(bare)
    }
  })

  it('is deterministic across calls', () => {
    const once = toViteAliases(createDzupResolution({ mode: 'merged-source', root }))
    const twice = toViteAliases(createDzupResolution({ mode: 'merged-source', root }))
    expect(once).toEqual(twice)
  })
})

// --- selection and errors ----------------------------------------------------

describe('package selection', () => {
  const root = fixtureRoot()

  it('covers every dzup package by default and ignores non-dzup ones', () => {
    expect(discoverDzupPackages(root).map(p => p.name))
      .toEqual(['@dzup-ui/core', '@dzup-ui/tokens', '@dzup-ui/tooling'])
  })

  it('narrows to the requested packages', () => {
    const { alias } = createDzupResolution({
      mode: 'merged-source',
      root,
      packages: ['@dzup-ui/tokens'],
    })
    expect([...new Set(alias.map(a => a.package))]).toEqual(['@dzup-ui/tokens'])
  })

  it('throws on an unknown package and lists the real ones', () => {
    expect(() => createDzupResolution({
      mode: 'merged-source',
      root,
      packages: ['@dzup-ui/graph'],
    })).toThrow(/`@dzup-ui\/graph`.*@dzup-ui\/core/s)
  })

  it('throws when root holds no packages/ directory, naming the argument to fix', () => {
    expect(() => createDzupResolution({ mode: 'merged-source', root: tmpdir() }))
      .toThrow(/Pass `root`/)
  })
})

// --- the real repository -----------------------------------------------------

describe('the real repository', () => {
  /**
   * A snapshot of the specifier list, not of the absolute paths — paths differ
   * per machine, and the drift worth catching is a package or subpath appearing
   * or disappearing without anyone noticing.
   *
   * When this fails because a legitimate new export landed, update it in the
   * same change that declared the export.
   */
  it('covers exactly the specifiers the packages declare', () => {
    const specifiers = createDzupResolution({ mode: 'merged-source', root: REPO_ROOT })
      .alias
      .map(a => a.find)
      .sort()

    expect(specifiers).toMatchInlineSnapshot(`
      [
        "@dzup-ui/codemods",
        "@dzup-ui/compat",
        "@dzup-ui/contracts",
        "@dzup-ui/core",
        "@dzup-ui/core/buttons",
        "@dzup-ui/core/cards",
        "@dzup-ui/core/data",
        "@dzup-ui/core/feedback",
        "@dzup-ui/core/forms",
        "@dzup-ui/core/inputs",
        "@dzup-ui/core/layout",
        "@dzup-ui/core/media",
        "@dzup-ui/core/navigation",
        "@dzup-ui/core/overlays",
        "@dzup-ui/core/ownership",
        "@dzup-ui/core/providers",
        "@dzup-ui/core/resolver",
        "@dzup-ui/core/styles",
        "@dzup-ui/core/typography",
        "@dzup-ui/mcp",
        "@dzup-ui/mcp/registry",
        "@dzup-ui/nuxt",
        "@dzup-ui/testing",
        "@dzup-ui/testing/security-corpus",
        "@dzup-ui/testing/vitest",
        "@dzup-ui/tokens",
        "@dzup-ui/tokens/css",
        "@dzup-ui/tokens/dtcg",
        "@dzup-ui/tokens/tailwind",
        "@dzup-ui/tokens/utils",
        "@dzup-ui/tooling",
        "@dzup-ui/tooling/playground",
        "@dzup-ui/tooling/resolution",
        "@dzup-ui/tooling/vite",
      ]
    `)
  })

  it('every merged-source replacement exists on disk', () => {
    for (const entry of createDzupResolution({ mode: 'merged-source', root: REPO_ROOT }).alias)
      expect(existsSync(entry.replacement), `${entry.find} -> ${entry.replacement}`).toBe(true)
  })

  /**
   * Equivalence with `workspaceAliases`, the helper this replaced.
   *
   * The migration must not move a single existing consumer's resolution. Every
   * one of the ten entries the old helper carried is pinned here to the same
   * **module** — `packages/core/src` and `packages/core/src/index.ts` are the
   * same module, reached differently, which is the only shape difference the
   * new derivation introduces for these ten.
   *
   * The other twenty entries are new: subpaths the packages declare and the old
   * list never mentioned. `@dzup-ui/core/providers` is the one that matters —
   * three apps and Core's own source import it, and it previously resolved only
   * because the bare `@dzup-ui/core` alias happened to point at a directory.
   */
  it('resolves every specifier the superseded workspaceAliases covered to the same module', () => {
    const alias = createDzupResolution({ mode: 'merged-source', root: REPO_ROOT }).alias
    const at = (specifier: string): string =>
      alias.find(a => a.find === specifier)?.replacement ?? '<missing>'
    const pkg = (...parts: string[]): string => join(REPO_ROOT, 'packages', ...parts)

    expect(at('@dzup-ui/tokens/css')).toBe(pkg('tokens/dist/tokens.css'))
    expect(at('@dzup-ui/tokens/tailwind')).toBe(pkg('tokens/dist/tailwind-theme.js'))
    expect(at('@dzup-ui/tokens/utils')).toBe(pkg('tokens/src/utils/index.ts'))
    expect(at('@dzup-ui/core/styles')).toBe(pkg('core/src/styles/base.css'))
    expect(at('@dzup-ui/core/ownership')).toBe(pkg('core/src/generated/component-ownership.ts'))
    expect(at('@dzup-ui/contracts')).toBe(pkg('contracts/src/index.ts'))
    expect(at('@dzup-ui/testing/vitest')).toBe(pkg('testing/src/vitest.ts'))
    expect(at('@dzup-ui/testing')).toBe(pkg('testing/src/index.ts'))
    // The old list pointed these two at the `src` directory; the entry module is
    // the same file Node and Vite would have resolved that directory to.
    expect(at('@dzup-ui/tokens')).toBe(pkg('tokens/src/index.ts'))
    expect(at('@dzup-ui/core')).toBe(pkg('core/src/index.ts'))
  })

  /**
   * The override table must not grow back into the handwritten list it
   * replaced. An override is only legitimate while the mechanical rule
   * genuinely cannot find the file: if `src/core.css` ever appears, the
   * exception has to go, and this is what says so.
   */
  it('every override is genuinely underivable', () => {
    const overrides = createDzupResolution({ mode: 'merged-source', root: REPO_ROOT })
      .alias
      .filter(a => a.origin === 'override')

    expect(overrides.length, 'keep this table small — each row is a rule that is not a rule')
      .toBeLessThanOrEqual(1)

    for (const entry of overrides) {
      expect(entry.reason, `${entry.find} must say why it is an exception`).toBeTruthy()
      // `./styles` → `dist/core.css` → the rule would look for `src/core.css`.
      const derivable = join(REPO_ROOT, 'packages/core/src/core.css')
      expect(existsSync(derivable), `${entry.find} is derivable now; delete its override`)
        .toBe(false)
    }
  })
})
