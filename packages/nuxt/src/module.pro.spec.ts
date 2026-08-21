import type { DzupUiModuleOptions } from './module.ts'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The `includePro: true` **success** path (TASK-OSS-P2-03).
 *
 * It needs two things this repository cannot supply: a resolvable
 * `@dzup-ui-pro/pro`, and an ownership table that has a `pro` tier in it. The
 * shipped table has neither — Pro has never published an ownership manifest —
 * so `module.spec.ts` can only ever reach the two failure branches. This is the
 * path that runs first the day Pro ships, so it is tested here rather than left
 * for a consumer to discover.
 *
 * The ownership table is mocked; **resolution is not**. A real package
 * directory is written under a temp root and `nuxt.options.rootDir` points at
 * it, because the thing most likely to break here is Node's resolution base,
 * not this module's branching — and it did break: resolving from the bare root
 * searched the root's *parent*. A mocked `createRequire` would have agreed with
 * the bug.
 *
 * A separate file from `module.spec.ts` on purpose: a per-test mock of a module
 * imported at load time would make the real-table assertions depend on test
 * order.
 */

const mocks = vi.hoisted(() => ({
  addComponent: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: mocks.addComponent,
  useLogger: () => ({ error: mocks.error, warn: vi.fn(), info: vi.fn(), debug: vi.fn() }),
}))

vi.mock('@dzup-ui/core/ownership', () => ({
  OWNERSHIP_TIERS: ['core', 'pro'] as const,
  COMPONENT_OWNERSHIP: {
    DzButton: { from: '@dzup-ui/core', kind: 'public-component' },
    DzCardBody: { from: '@dzup-ui/core', kind: 'compound-part' },
    DzEventCalendar: { from: '@dzup-ui-pro/pro', kind: 'public-component' },
    ProOnlyBadge: { from: '@dzup-ui-pro/pro', kind: 'public-component' },
  },
}))

const { canResolvePro, componentsToRegister, proAvailability } = await import('./module.ts')
const moduleDefinition = (await import('./module.ts')).default as unknown as {
  defaults: DzupUiModuleOptions
  setup: (options: DzupUiModuleOptions, nuxt: FakeNuxt) => void
}

interface FakeNuxt {
  options: {
    rootDir: string
    css: string[]
    build: { transpile: string[] }
    app: { head: { script?: { innerHTML: string, type: string }[] } }
  }
}

/** A project root with `@dzup-ui-pro/pro` genuinely installed under it. */
function projectWithPro(): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-nuxt-pro-'))
  const pkg = join(root, 'node_modules', '@dzup-ui-pro', 'pro')
  mkdirSync(pkg, { recursive: true })
  writeFileSync(
    join(pkg, 'package.json'),
    JSON.stringify({ name: '@dzup-ui-pro/pro', version: '0.0.0-fixture', main: 'index.js' }),
  )
  writeFileSync(join(pkg, 'index.js'), 'export default {}\n')
  return root
}

const withPro = projectWithPro()
const withoutPro = mkdtempSync(join(tmpdir(), 'dzup-nuxt-bare-'))

afterAll(() => {
  rmSync(withPro, { recursive: true, force: true })
  rmSync(withoutPro, { recursive: true, force: true })
})

function runSetup(options: DzupUiModuleOptions = {}, rootDir: string = withPro): FakeNuxt {
  const nuxt: FakeNuxt = {
    options: {
      rootDir,
      css: [],
      build: { transpile: [] },
      app: { head: {} },
    },
  }
  moduleDefinition.setup({ ...moduleDefinition.defaults, ...options }, nuxt)
  return nuxt
}

function registeredExports(): string[] {
  return mocks.addComponent.mock.calls.map(call => (call[0] as { export: string }).export)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('canResolvePro', () => {
  it('finds a package installed in the project root itself', () => {
    // The defect this pins: `createRequire(root)` resolves from the directory
    // *containing* `root`, so a consumer who had installed Pro at their project
    // root was told it was not installed.
    expect(canResolvePro(withPro)).toBe(true)
  })

  it('reports false for a project that has not installed it', () => {
    expect(canResolvePro(withoutPro)).toBe(false)
  })

  it('answers about the given project, not about this workspace', () => {
    // Two roots, two answers, from one unchanged workspace — only possible if
    // the argument really is the resolution base.
    expect(canResolvePro(withPro)).not.toBe(canResolvePro(withoutPro))
  })

  it('falls back to this module when no project root is given', () => {
    // `setup` always has a root; the default arm serves direct callers. This
    // workspace declares no dependency on Pro, so `false` is the honest answer
    // here — what is pinned is that the arm runs at all instead of handing
    // `createRequire` an undefined base.
    expect(canResolvePro()).toBe(false)
  })
})

describe('includePro when Pro is installed and the table has a pro tier', () => {
  it('reports availability rather than an error', () => {
    expect(proAvailability(canResolvePro(withPro))).toBe('available')
  })

  it('registers the Pro components as well as the Core ones', () => {
    runSetup({ includePro: true })
    expect(registeredExports().sort()).toEqual([
      'DzButton',
      'DzCardBody',
      'DzEventCalendar',
      'ProOnlyBadge',
    ])
  })

  it('transpiles Pro alongside Core and tokens', () => {
    // Pro ships untranspiled SFCs as Core does; omitting it is a build failure
    // in the consumer's app, not a missing component.
    expect(runSetup({ includePro: true }).options.build.transpile).toEqual([
      '@dzup-ui/core',
      '@dzup-ui/tokens',
      '@dzup-ui-pro/pro',
    ])
  })

  it('imports each Pro name from the Pro package', () => {
    runSetup({ includePro: true })
    const pro = mocks.addComponent.mock.calls
      .map(call => call[0] as { export: string, filePath: string })
      .filter(entry => entry.export === 'DzEventCalendar' || entry.export === 'ProOnlyBadge')

    expect(pro).toHaveLength(2)
    for (const entry of pro)
      expect(entry.filePath).toBe('@dzup-ui-pro/pro')
  })

  it('says nothing on the logger when everything resolves', () => {
    runSetup({ includePro: true })
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('applies the prefix to Pro names too', () => {
    runSetup({ includePro: true, prefix: 'Acme' })
    const names = mocks.addComponent.mock.calls.map(call => (call[0] as { name: string }).name)
    expect(names).toContain('AcmeEventCalendar')
    // Not Dz-prefixed, so not renamed — the same rule Core names get.
    expect(names).toContain('ProOnlyBadge')
  })

  it('still withholds Pro when the option is off', () => {
    const nuxt = runSetup()
    expect(registeredExports().sort()).toEqual(['DzButton', 'DzCardBody'])
    expect(nuxt.options.build.transpile).not.toContain('@dzup-ui-pro/pro')
  })
})

describe('includePro when the table has a pro tier but the project has not installed Pro', () => {
  it('reports the missing package and registers Core anyway', () => {
    const nuxt = runSetup({ includePro: true }, withoutPro)

    expect(mocks.error).toHaveBeenCalledTimes(1)
    expect(mocks.error.mock.calls[0]?.[0]).toContain('cannot be resolved')
    expect(registeredExports().sort()).toEqual(['DzButton', 'DzCardBody'])
    expect(nuxt.options.build.transpile).not.toContain('@dzup-ui-pro/pro')
  })
})

describe('componentsToRegister with a pro tier present', () => {
  it('includes Pro names only when asked', () => {
    expect(componentsToRegister(true).map(entry => entry.name)).toContain('DzEventCalendar')
    expect(componentsToRegister(false).map(entry => entry.name)).not.toContain('DzEventCalendar')
  })

  it('stays sorted across both tiers', () => {
    const names = componentsToRegister(true).map(entry => entry.name)
    expect(names).toEqual([...names].sort())
  })
})
