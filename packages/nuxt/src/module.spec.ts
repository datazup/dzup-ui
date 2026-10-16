import type { DzupUiModuleOptions } from './module.ts'
import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Unit tests for the Nuxt module (TASK-OSS-P2-03).
 *
 * The fixtures in `packages/nuxt/test/` prove end-to-end behaviour against real
 * packed tarballs, but each one costs an install and a full build. These tests
 * localise regressions in the registration logic — which is the exact place the
 * module drifted: it carried a handwritten Pro component list that named Core
 * components as Pro and Pro components that do not exist, and nothing checked
 * it against anything.
 *
 * `@nuxt/kit` is mocked so `setup()` can be called directly. Whether
 * `@dzup-ui-pro/pro` resolves, though, is filesystem state a test cannot
 * arrange — the package is not published — so that decision lives in the pure
 * `proAvailability`, which is tested on its own.
 */

const mocks = vi.hoisted(() => ({
  addComponent: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}))

vi.mock('@nuxt/kit', () => ({
  // The real `defineNuxtModule` wraps the definition; returning it unchanged is
  // what lets a test call `setup` with a nuxt of its own making.
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: mocks.addComponent,
  useLogger: () => ({ error: mocks.error, warn: mocks.warn, info: vi.fn(), debug: vi.fn() }),
}))

const { COMPONENT_OWNERSHIP } = await import('@dzup-ui/core/ownership')
const { getThemeScript } = await import('@dzup-ui/core/theme-script')
const {
  applyPrefix,
  componentsToRegister,
  proAvailability,
  proMissingMessage,
  proTierMissingMessage,
  themeScriptCspHash,
} = await import('./module.ts')
const moduleDefinition = (await import('./module.ts')).default as unknown as {
  meta: { name: string, configKey: string }
  defaults: DzupUiModuleOptions
  setup: (options: DzupUiModuleOptions, nuxt: FakeNuxt) => void
}

interface FakeNuxt {
  options: {
    rootDir: string
    css: string[]
    build: { transpile: string[] }
    app: { head: { script?: { innerHTML: string, type: string, nonce?: string }[] } }
  }
}

function fakeNuxt(): FakeNuxt {
  return {
    options: {
      rootDir: '/tmp/consumer-app',
      css: [],
      build: { transpile: [] },
      app: { head: {} },
    },
  }
}

/** Run `setup` the way Nuxt would: defaults merged under the caller's options. */
function runSetup(options: DzupUiModuleOptions = {}): FakeNuxt {
  const nuxt = fakeNuxt()
  moduleDefinition.setup({ ...moduleDefinition.defaults, ...options }, nuxt)
  return nuxt
}

/** Every `{ name, export, filePath }` passed to `addComponent`. */
function registrations(): { name: string, export: string, filePath: string }[] {
  return mocks.addComponent.mock.calls.map(call => call[0] as {
    name: string
    export: string
    filePath: string
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('module metadata', () => {
  it('declares its name and config key', () => {
    expect(moduleDefinition.meta.name).toBe('@dzup-ui/nuxt')
    expect(moduleDefinition.meta.configKey).toBe('dzupUi')
  })

  it('defaults to Core only and no prefix', () => {
    expect(moduleDefinition.defaults).toEqual({ includePro: false, prefix: '' })
  })
})

describe('component registration', () => {
  it('registers every Core component in the generated ownership table', () => {
    runSetup()

    const core = Object.entries(COMPONENT_OWNERSHIP)
      .filter(([, owned]) => owned.from === '@dzup-ui/core')
      .map(([name]) => name)

    expect(registrations()).toHaveLength(core.length)
    expect(registrations().map(r => r.export).sort()).toEqual([...core].sort())
  })

  it('registers no name the ownership table does not contain', () => {
    // The defect this replaces: the old list named `DzScheduler`, `DzComment`
    // and `DzVirtualTable`, which no package exports under those names.
    runSetup({ includePro: true })

    for (const registration of registrations())
      expect(COMPONENT_OWNERSHIP, registration.export).toHaveProperty(registration.export)
  })

  it('imports each component from the package that owns it', () => {
    runSetup()

    for (const registration of registrations())
      expect(registration.filePath).toBe(COMPONENT_OWNERSHIP[registration.export]?.from)
  })

  it('registers the Core components a prefix list used to misroute to Pro', () => {
    runSetup()

    const exports = registrations().map(r => r.export)
    expect(exports).toContain('DzAppShell')
    expect(exports).toContain('DzCalendar')
  })

  it('registers compound parts, not only their parents', () => {
    runSetup()
    expect(registrations().map(r => r.export)).toContain('DzCardBody')
  })
})

describe('prefix', () => {
  it('renames every registered tag', () => {
    runSetup({ prefix: 'Acme' })

    const button = registrations().find(r => r.export === 'DzButton')
    expect(button?.name).toBe('AcmeButton')
    // The tag is renamed; the import still names the real export.
    expect(button?.export).toBe('DzButton')
  })

  it('renames every Dz-prefixed name, not just the first', () => {
    runSetup({ prefix: 'X' })

    const prefixed = registrations().filter(r => r.export.startsWith('Dz'))
    for (const registration of prefixed)
      expect(registration.name).toBe(`X${registration.export.slice(2)}`)
  })

  it('leaves an un-prefixed export alone rather than mangling it', () => {
    // The old rule was `name.slice(2)` unconditionally, which turned
    // `TeamMemberBadge` into `AcmeamMemberBadge`.
    runSetup({ prefix: 'Acme' })

    const unprefixed = registrations().filter(r => !r.export.startsWith('Dz'))
    expect(unprefixed.length).toBeGreaterThan(0)
    for (const registration of unprefixed)
      expect(registration.name).toBe(registration.export)
  })

  it('changes nothing when no prefix is given', () => {
    runSetup()
    for (const registration of registrations())
      expect(registration.name).toBe(registration.export)
  })
})

describe('stylesheets and transpilation', () => {
  it('loads the token layer before the component layer', () => {
    const nuxt = runSetup()

    // Not cosmetic: the component sheet reads `var(--dz-*)`, so the reverse
    // order paints the first frame with unresolved custom properties.
    expect(nuxt.options.css).toEqual(['@dzup-ui/tokens/css', '@dzup-ui/core/styles'])
  })

  it('uses declared package subpaths, never a deep path into dist', () => {
    // `@dzup-ui/tokens/dist/tokens.css` is not an exported specifier, and every
    // real consumer install failed on it until 2026-08-20.
    const nuxt = runSetup()
    for (const entry of nuxt.options.css)
      expect(entry, entry).not.toContain('/dist/')
  })

  it('transpiles exactly Core and tokens when Pro is off', () => {
    expect(runSetup().options.build.transpile).toEqual(['@dzup-ui/core', '@dzup-ui/tokens'])
  })

  it('does not transpile Pro when it cannot be resolved', () => {
    const nuxt = runSetup({ includePro: true })
    expect(nuxt.options.build.transpile).not.toContain('@dzup-ui-pro/pro')
  })

  it('injects the FOUC-prevention theme script (ADR-15)', () => {
    const script = runSetup().options.app.head.script
    expect(script).toHaveLength(1)
    expect(script?.[0]?.innerHTML).toContain('data-theme')
  })
})

describe('the theme script (UI-DZUP-UI-ARCH-M-05, SEC-M-04, DESIGN-M-08)', () => {
  it('is Core\'s getThemeScript output for the default options, not a copy', () => {
    const [script] = runSetup().options.app.head.script ?? []
    expect(script?.innerHTML).toBe(getThemeScript())
    expect(script).not.toHaveProperty('nonce')
  })

  it('carries the provider options through: storageKey, attribute, defaultTheme, persist and direction', () => {
    const themeScript = { storageKey: 'acme-theme', attribute: 'data-mode', defaultTheme: 'dark', persist: true, locale: 'ar-EG' } as const
    const [script] = runSetup({ themeScript }).options.app.head.script ?? []
    expect(script?.innerHTML).toBe(getThemeScript(themeScript))
    expect(script?.innerHTML).toContain('"acme-theme"')
    expect(script?.innerHTML).toContain('"data-mode"')
    expect(script?.innerHTML).toContain(`setAttribute('dir',"rtl")`)
    expect(runSetup({ themeScript: { direction: 'rtl' } }).options.app.head.script?.[0]?.innerHTML)
      .toBe(getThemeScript({ direction: 'rtl' }))
  })

  it('writes a supplied nonce on the script element, and keeps it out of the script body', () => {
    const [script] = runSetup({ themeScript: { nonce: 'r4nd0m', storageKey: 'k' } }).options.app.head.script ?? []
    expect(script).toMatchObject({ nonce: 'r4nd0m', innerHTML: getThemeScript({ storageKey: 'k' }) })
    expect(script?.innerHTML).not.toContain('r4nd0m')
  })

  it('injects nothing when disabled', () => {
    expect(runSetup({ themeScript: false }).options.app.head.script ?? []).toEqual([])
  })

  it('publishes the CSP hash of exactly the script it injects', () => {
    const options = { storageKey: 'acme-theme', nonce: 'ignored-by-the-hash' }
    const [script] = runSetup({ themeScript: options }).options.app.head.script ?? []
    const expected = `'sha256-${createHash('sha256').update(script!.innerHTML, 'utf8').digest('base64')}'`
    expect(themeScriptCspHash(options)).toBe(expected)
    expect(themeScriptCspHash()).not.toBe(expected)
  })
})

describe('includePro', () => {
  it('registers no Pro component when the option is off', () => {
    runSetup()
    for (const registration of registrations())
      expect(registration.filePath).not.toBe('@dzup-ui-pro/pro')
  })

  it('reports once when Pro is asked for and cannot be resolved', () => {
    runSetup({ includePro: true })

    expect(mocks.error).toHaveBeenCalledTimes(1)
    const message = mocks.error.mock.calls[0]?.[0] as string
    // Actionable means all three: which package, which option, and the command.
    expect(message).toContain('@dzup-ui-pro/pro')
    expect(message).toContain('dzupUi.includePro')
    expect(message).toContain('yarn add')
  })

  it('continues registering Core after the diagnostic', () => {
    runSetup({ includePro: true })
    // A half-configured option should not cost a consumer their application.
    expect(registrations().map(r => r.export)).toContain('DzButton')
  })

  it('says nothing when Pro was never asked for', () => {
    runSetup()
    expect(mocks.error).not.toHaveBeenCalled()
  })
})

describe('proAvailability', () => {
  it('reports a missing package before anything else', () => {
    expect(proAvailability(false, ['core', 'pro'])).toBe('not-installed')
  })

  it('separates "Pro is here but we cannot place it" from "Pro is absent"', () => {
    // Two different failures with two different owners: one a consumer fixes by
    // installing a package, one only this library can fix.
    expect(proAvailability(true, ['core'])).toBe('no-ownership-tier')
    expect(proAvailability(false, ['core'])).toBe('not-installed')
  })

  it('is available only when the package resolves and the table knows Pro', () => {
    expect(proAvailability(true, ['core', 'pro'])).toBe('available')
  })

  it('defaults to the tiers the shipped ownership table declares', () => {
    // Today that is Core only, so Pro cannot register even where it installs.
    expect(proAvailability(true)).toBe('no-ownership-tier')
  })
})

describe('componentsToRegister', () => {
  it('is sorted, so registration order cannot vary between runs', () => {
    const names = componentsToRegister(false).map(entry => entry.name)
    expect(names).toEqual([...names].sort())
  })

  it('withholds every Pro-owned name when Pro is off', () => {
    for (const entry of componentsToRegister(false))
      expect(entry.from).not.toBe('@dzup-ui-pro/pro')
  })

  it('offers at least as many names when Pro is on', () => {
    // Equal today, because the shipped ownership table has no Pro tier. The
    // assertion is the invariant, not today's number.
    expect(componentsToRegister(true).length)
      .toBeGreaterThanOrEqual(componentsToRegister(false).length)
  })
})

describe('applyPrefix', () => {
  it('replaces the Dz prefix rather than prepending to it', () => {
    expect(applyPrefix('DzButton', 'X')).toBe('XButton')
    expect(applyPrefix('DzButton', 'Acme')).toBe('AcmeButton')
  })

  it('returns the name unchanged when no prefix is configured', () => {
    expect(applyPrefix('DzButton', '')).toBe('DzButton')
  })

  it('leaves a name that does not start with Dz alone', () => {
    expect(applyPrefix('TeamMemberBadge', 'Acme')).toBe('TeamMemberBadge')
    expect(applyPrefix('GovernanceBadge', 'X')).toBe('GovernanceBadge')
  })
})

describe('diagnostics', () => {
  it('tells a consumer which package, which option, and the command', () => {
    const message = proMissingMessage()
    expect(message).toContain('@dzup-ui-pro/pro')
    expect(message).toContain('dzupUi.includePro')
    expect(message).toContain('yarn add')
  })

  it('names the ownership gap as ours rather than the consumer\'s', () => {
    const message = proTierMissingMessage()
    expect(message).toContain('ownership')
    expect(message).toContain('not a problem with your project')
  })
})
