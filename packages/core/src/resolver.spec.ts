import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPONENT_OWNERSHIP, OWNERSHIP_TIERS } from './generated/component-ownership.ts'
import { DzResolver } from './resolver.ts'

/**
 * The two packages that actually exist, stated here rather than imported from
 * the resolver. Asserting the implementation against its own constant is what
 * retired-name-ok: names the retired package to explain why this is a literal.
 * let `@dzup-ui/pro` -- a package nobody could install -- ship green.
 */
const CORE_PACKAGE = '@dzup-ui/core'
const PRO_PACKAGE = '@dzup-ui-pro/pro'
const RESOLVABLE_PACKAGES = [CORE_PACKAGE, PRO_PACKAGE]

/** Whether this checkout's generated table carries a Pro tier at all. */
const HAS_PRO_TIER = (OWNERSHIP_TIERS as readonly string[]).includes('pro')

/** A real Pro component name, or undefined when the table has no Pro tier. */
const A_PRO_COMPONENT = Object.keys(COMPONENT_OWNERSHIP)
  .find(name => COMPONENT_OWNERSHIP[name]?.from === PRO_PACKAGE)

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('core component resolution', () => {
  it('resolves a Core component to @dzup-ui/core', () => {
    expect(DzResolver().resolve('DzButton')).toEqual({ name: 'DzButton', from: CORE_PACKAGE })
  })

  it('resolves a representative component from every family', () => {
    const resolver = DzResolver()
    const names = [
      'DzButton',
      'DzInput',
      'DzCard',
      'DzAlert',
      'DzBadge',
      'DzTable',
      'DzDialog',
      'DzTooltip',
      'DzGrid',
      'DzText',
    ]

    for (const name of names)
      expect(resolver.resolve(name), name).toEqual({ name, from: CORE_PACKAGE })
  })

  it('resolves a compound part to the same package as its parent', () => {
    const resolver = DzResolver()
    expect(COMPONENT_OWNERSHIP.DzCardBody?.kind).toBe('compound-part')
    expect(resolver.resolve('DzCardBody')).toEqual({ name: 'DzCardBody', from: CORE_PACKAGE })
    expect(resolver.resolve('DzCardBody')?.from).toBe(resolver.resolve('DzCard')?.from)
  })

  it('resolves nothing for a name from another library', () => {
    const resolver = DzResolver()

    expect(resolver.resolve('VButton')).toBeUndefined()
    expect(resolver.resolve('ElInput')).toBeUndefined()
    expect(resolver.resolve('button')).toBeUndefined()
    expect(resolver.resolve('')).toBeUndefined()
  })
})

describe('unknown names', () => {
  const resolver = DzResolver({ includePro: true })

  // Every one of these resolved to @dzup-ui/core under the old prefix rule,
  // which turned a typo into an import of a component that does not exist.
  it.each([
    ['a name no tier owns', 'DzNotAComponent'],
    ['a stale name from the Nuxt module list', 'DzGanttRow'],
    ['another stale name', 'DzScheduler'],
    ['a typo of a real component', 'DzButtonn'],
    ['a truncation of a real component', 'DzButt'],
  ])('resolves nothing for %s', (_label, name) => {
    expect(resolver.resolve(name)).toBeUndefined()
  })

  it('resolves nothing for a symbol that is exported but is not a component', () => {
    // `DzButtonProps` is a type and `useTheme` a composable: both are public
    // exports, neither is mountable, and importing one as a component is a
    // build error the resolver must not author.
    expect(resolver.resolve('DzButtonProps')).toBeUndefined()
    expect(resolver.resolve('useTheme')).toBeUndefined()
    expect(resolver.resolve('buttonVariants')).toBeUndefined()
    expect(resolver.resolve('DZ_TABS_KEY')).toBeUndefined()
  })
})

describe('pro components', () => {
  it('never resolves a Pro name when includePro is false', () => {
    const resolver = DzResolver()
    for (const [name, owned] of Object.entries(COMPONENT_OWNERSHIP)) {
      if (owned.from === PRO_PACKAGE)
        expect(resolver.resolve(name), name).toBeUndefined()
    }
  })

  it.runIf(HAS_PRO_TIER)('resolves a Pro name to @dzup-ui-pro/pro when includePro is true', () => {
    const resolver = DzResolver({ includePro: true })
    expect(resolver.resolve(A_PRO_COMPONENT!)).toEqual({ name: A_PRO_COMPONENT, from: PRO_PACKAGE })
  })

  it.skipIf(HAS_PRO_TIER)('warns at construction when includePro has no Pro tier to draw on', () => {
    // The state of this checkout: Pro has not produced an ownership manifest,
    // so the generated table is Core-only. Silence would be the worst answer —
    // it is indistinguishable from "Pro resolved fine".
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver({ includePro: true })

    expect(warn).toHaveBeenCalledTimes(1)
    const message = warn.mock.calls[0]?.[0] as string
    expect(message).toContain('includePro')
    expect(message).toContain('DZUP_PRO_OWNERSHIP_MANIFEST')
  })

  it('says nothing when includePro is false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('custom prefix', () => {
  it('resolves the prefixed tag to the real export name', () => {
    const resolver = DzResolver({ prefix: 'X' })
    expect(resolver.resolve('XButton')).toEqual({ name: 'DzButton', from: CORE_PACKAGE })
  })

  it('accepts a multi-character prefix', () => {
    const resolver = DzResolver({ prefix: 'Acme' })
    expect(resolver.resolve('AcmeButton')).toEqual({ name: 'DzButton', from: CORE_PACKAGE })
  })

  it('rewrites the lookup key without changing ownership', () => {
    const plain = DzResolver().resolve('DzCardBody')
    const prefixed = DzResolver({ prefix: 'X' }).resolve('XCardBody')
    expect(prefixed).toEqual(plain)
  })

  it('stops resolving the Dz tags it replaced', () => {
    // A prefix renames the tag; it does not add an alias. Resolving both would
    // let a codebase drift into two spellings of one component.
    expect(DzResolver({ prefix: 'X' }).resolve('DzButton')).toBeUndefined()
  })

  it('resolves nothing for a prefixed name that maps to no component', () => {
    const resolver = DzResolver({ prefix: 'X' })
    expect(resolver.resolve('XNotAComponent')).toBeUndefined()
    expect(resolver.resolve('YButton')).toBeUndefined()
  })
})

describe('emitted package names', () => {
  // The defect this guards was not "the resolver returns the wrong string" —
  // it was that the spec asserted the same wrong string, so a broken
  // `includePro: true` shipped green.
  it('never emits a `from` outside the two real package names', () => {
    const resolver = DzResolver({ includePro: true })

    for (const name of Object.keys(COMPONENT_OWNERSHIP)) {
      const from = resolver.resolve(name)?.from
      if (from !== undefined)
        expect(RESOLVABLE_PACKAGES, name).toContain(from)
    }
  })

  // retired-name-ok: the test below has to name what must never be emitted.
  it('resolves nothing to the retired @dzup-ui/pro name', () => {
    const resolver = DzResolver({ includePro: true })

    for (const name of Object.keys(COMPONENT_OWNERSHIP)) {
      // retired-name-ok: asserting the retired name is never emitted.
      expect(resolver.resolve(name)?.from, name).not.toBe('@dzup-ui/pro')
    }
  })
})

describe('the generated ownership table', () => {
  it('carries only mountable kinds', () => {
    for (const [name, owned] of Object.entries(COMPONENT_OWNERSHIP))
      expect(['public-component', 'compound-part'], name).toContain(owned.kind)
  })

  it('records the Core components a prefix list used to misroute to Pro', () => {
    // The two findings from P0-02: both are Core, and Pro exports neither.
    expect(COMPONENT_OWNERSHIP.DzAppShell?.from).toBe(CORE_PACKAGE)
    expect(COMPONENT_OWNERSHIP.DzCalendar?.from).toBe(CORE_PACKAGE)
    expect(DzResolver({ includePro: true }).resolve('DzAppShell')?.from).toBe(CORE_PACKAGE)
  })
})

describe('resolver metadata', () => {
  it('has type set to component', () => {
    expect(DzResolver().type).toBe('component')
  })
})
