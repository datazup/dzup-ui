import type { DzDefaults, DzMessages } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import {
  useDzDefaults,
  useDzDirection,
  useDzFormats,
  useDzLocale,
  useDzMessages,
  useDzMotion,
  useDzNonce,
  useDzPortalTarget,
  useDzTestIds,
} from './index.ts'
// The write half is intentionally absent from the barrel (see index.ts); it is
// imported the way `DzProvider` will import it, so these tests exercise the
// real wiring rather than an ad-hoc `provide()` that could drift from it.
import {
  provideDzDefaults,
  provideDzPortalTarget,
  provideDzTestIds,
} from './useDzEnvironment.ts'
import { clearFormatterCache, formatterCacheSize } from './useDzFormats.ts'
import { directionForLocale, provideDzLocale } from './useDzLocale.ts'
import { mergeMessages, provideDzMessages } from './useDzMessages.ts'

/**
 * Provider composables (TASK-OSS-P4-01, ADR-20).
 *
 * Three properties are load-bearing and each is tested in both directions:
 *
 *   1. **Every concern works with no provider mounted.** This is what lets a
 *      consumer adopt one component without adopting an architecture, and it is
 *      the reason none of these composables throws when uninjected.
 *   2. **A nested provider overrides its ancestor** — except messages, which
 *      deep-merge, because a host changing one string must not have to restate
 *      the rest.
 *   3. **Nothing touches a browser API without a guard.** These run under SSR.
 */

/** Mount a component that just returns what a composable gave it. */
function probe<T>(use: () => T, wrap?: (child: unknown) => unknown): T {
  let captured!: T
  const Child = defineComponent({
    setup() {
      captured = use()
      return () => h('div')
    },
  })
  mount(defineComponent({ setup: () => () => (wrap ? wrap(Child) : h(Child)) }))
  return captured
}

describe('working with no provider mounted', () => {
  it('gives every concern a usable default', () => {
    expect(probe(() => useDzLocale()).value).toBe('en-US')
    expect(probe(() => useDzDirection()).value).toBe('ltr')
    expect(probe(() => useDzPortalTarget()).value).toBeUndefined()
    expect(probe(() => useDzNonce()).value).toBeUndefined()
    expect(probe(() => useDzMessages()).messages.value).toEqual({})
    expect(probe(() => useDzDefaults()).defaults.value).toEqual({})
    expect(probe(() => useDzTestIds()).testIds.value)
      .toEqual({ enabled: false, attribute: 'data-testid' })
  })

  it('never throws when uninjected', () => {
    // `useTheme` warns and can throw without a provider; these deliberately do
    // not, because a component reading the locale must not require an
    // application to have opted in.
    expect(() => probe(() => useDzLocale())).not.toThrow()
    expect(() => probe(() => useDzMotion())).not.toThrow()
  })

  it('falls back to the string a component hard-codes today', () => {
    // The property that makes the P4-03 migration non-breaking: a component
    // that swaps `'No results found'` for a `read()` call behaves identically
    // until an application supplies a catalog.
    const { read } = probe(() => useDzMessages())
    expect(read('select.noResults', 'No results found')).toBe('No results found')
  })
})

describe('locale and direction', () => {
  it('takes the locale from a provider', () => {
    const locale = probe(
      () => useDzLocale(),
      child => h(defineComponent({
        setup(_, { slots }) {
          provideDzLocale(ref('bs-BA'))
          return () => slots.default?.()
        },
      }), () => h(child as never)),
    )

    expect(locale.value).toBe('bs-BA')
  })

  it('resolves direction from the locale when the host says auto', () => {
    expect(directionForLocale('ar-EG')).toBe('rtl')
    expect(directionForLocale('he')).toBe('rtl')
    expect(directionForLocale('en-US')).toBe('ltr')
    expect(directionForLocale('bs-BA')).toBe('ltr')
  })

  it('matches on the language subtag, not the whole tag', () => {
    // A host passing `ar-EG` or `fa-IR` must not have to enumerate regions.
    expect(directionForLocale('fa-IR')).toBe('rtl')
    expect(directionForLocale('ur-PK')).toBe('rtl')
  })

  it('never answers auto — a component asking direction wants yes or no', () => {
    const direction = probe(
      () => useDzDirection(),
      child => h(defineComponent({
        setup(_, { slots }) {
          provideDzLocale(ref('ar-EG'), ref('auto'))
          return () => slots.default?.()
        },
      }), () => h(child as never)),
    )

    expect(direction.value).toBe('rtl')
  })

  it('lets an explicit direction beat the locale', () => {
    // A host rendering Arabic content inside an LTR chrome is a real case.
    const direction = probe(
      () => useDzDirection(),
      child => h(defineComponent({
        setup(_, { slots }) {
          provideDzLocale(ref('ar-EG'), ref('ltr'))
          return () => slots.default?.()
        },
      }), () => h(child as never)),
    )

    expect(direction.value).toBe('ltr')
  })

  it('returns a readonly ref, so no component can set the app locale', () => {
    const locale = probe(() => useDzLocale())
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // @ts-expect-error assigning to a readonly ref is the mistake being pinned.
    locale.value = 'de-DE'

    expect(locale.value).toBe('en-US')
    warn.mockRestore()
  })
})

describe('messages merge rather than replace', () => {
  it('deep-merges a nested override', () => {
    const base: DzMessages = {
      select: { noResults: 'No results found', empty: 'No options available' },
      input: { clear: 'Clear input' },
    }
    const merged = mergeMessages(base, { select: { noResults: 'Nothing matched' } })

    expect(merged).toEqual({
      select: { noResults: 'Nothing matched', empty: 'No options available' },
      input: { clear: 'Clear input' },
    })
  })

  it('keeps the sibling a shallow merge would have dropped', () => {
    // The whole reason the rule is deep: `select.empty` survives an override of
    // `select.noResults`.
    const merged = mergeMessages(
      { select: { noResults: 'a', empty: 'b' } },
      { select: { noResults: 'c' } },
    )

    expect((merged.select as DzMessages).empty).toBe('b')
  })

  it('lets a string replace a group, and a group replace a string', () => {
    expect(mergeMessages({ a: { b: 'x' } }, { a: 'flat' })).toEqual({ a: 'flat' })
    expect(mergeMessages({ a: 'flat' }, { a: { b: 'x' } })).toEqual({ a: { b: 'x' } })
  })

  it('merges a nested provider with its ancestor', () => {
    const Inner = defineComponent({
      setup() {
        const { read } = useDzMessages()
        return () => h('div', [
          read('select.noResults', 'fallback'),
          '|',
          read('input.clear', 'fallback'),
        ])
      },
    })
    const Middle = defineComponent({
      setup() {
        provideDzMessages(ref({ select: { noResults: 'Nothing matched' } }))
        return () => h(Inner)
      },
    })
    const Outer = defineComponent({
      setup() {
        provideDzMessages(ref({
          select: { noResults: 'No results found' },
          input: { clear: 'Clear input' },
        }))
        return () => h(Middle)
      },
    })

    // The inner provider changed one string; the outer one's other string
    // survives, which is the merge rule doing its job across a boundary.
    expect(mount(Outer).text()).toBe('Nothing matched|Clear input')
  })

  it('reads a missing path as the fallback rather than an empty string', () => {
    const { read } = probe(() => useDzMessages())
    expect(read('nothing.here.at.all', 'Fallback')).toBe('Fallback')
  })

  it('does not return a group where a string was asked for', () => {
    const Probe = defineComponent({
      setup() {
        provideDzMessages(ref({ select: { noResults: 'x' } }))
        const { read } = useDzMessages()
        return () => h('div', read('select', 'Fallback'))
      },
    })

    expect(mount(Probe).text()).toBe('Fallback')
  })
})

describe('formats are cached', () => {
  beforeEach(() => {
    clearFormatterCache()
  })

  it('returns the same instance for the same request', () => {
    const formats = probe(() => useDzFormats())

    expect(formats.number({ style: 'percent' })).toBe(formats.number({ style: 'percent' }))
    expect(formatterCacheSize()).toBe(1)
  })

  it('ignores option key order, because two callers mean the same thing', () => {
    const formats = probe(() => useDzFormats())

    formats.date({ year: 'numeric', month: 'long' })
    formats.date({ month: 'long', year: 'numeric' })

    expect(formatterCacheSize()).toBe(1)
  })

  it('keeps different options apart', () => {
    const formats = probe(() => useDzFormats())

    formats.number({ style: 'percent' })
    formats.number({ style: 'currency', currency: 'EUR' })

    expect(formatterCacheSize()).toBe(2)
  })

  it('keeps different locales apart', () => {
    // Provider and consumer must be different components: Vue resolves
    // `inject` against the PARENT chain, so a component never sees its own
    // `provide`. (That is also what makes `provideDzMessages` able to read its
    // ancestor's catalog while providing its own.)
    const Child = defineComponent({
      setup: () => () => h('div', useDzFormats().number().format(1234.5)),
    })
    const German = defineComponent({
      setup() {
        provideDzLocale(ref('de-DE'))
        return () => h(Child)
      },
    })

    expect(mount(German).text()).toBe('1.234,5')
    expect(probe(() => useDzFormats()).number().format(1234.5)).toBe('1,234.5')
    expect(formatterCacheSize()).toBe(2)
  })

  it('offers the four Intl kinds the components actually construct', () => {
    const formats = probe(() => useDzFormats())

    expect(formats.number()).toBeInstanceOf(Intl.NumberFormat)
    expect(formats.date()).toBeInstanceOf(Intl.DateTimeFormat)
    expect(formats.relativeTime()).toBeInstanceOf(Intl.RelativeTimeFormat)
    expect(formats.list()).toBeInstanceOf(Intl.ListFormat)
  })
})

describe('component defaults', () => {
  function withDefaults(defaults: DzDefaults) {
    let resolve!: ReturnType<typeof useDzDefaults>['resolve']
    const Child = defineComponent({
      setup() {
        resolve = useDzDefaults().resolve
        return () => h('div')
      },
    })
    mount(defineComponent({
      setup() {
        provideDzDefaults(ref(defaults))
        return () => h(Child)
      },
    }))
    return resolve
  }

  it('lets an explicit prop win over everything', () => {
    const resolve = withDefaults({ size: 'lg', components: { DzButton: { size: 'xl' } } })
    expect(resolve('DzButton', 'size', ['sm'])).toBe('sm')
  })

  it('lets compound context win over the provider', () => {
    // A DzButtonGroup is nearer and more specific than an app-wide setting.
    const resolve = withDefaults({ components: { DzButton: { size: 'xl' } } })
    expect(resolve('DzButton', 'size', [undefined, 'md'])).toBe('md')
  })

  it('uses a per-component default before a shared axis', () => {
    const resolve = withDefaults({ size: 'lg', components: { DzButton: { size: 'xs' } } })
    expect(resolve('DzButton', 'size', [undefined])).toBe('xs')
  })

  it('applies a shared axis to a component with no entry of its own', () => {
    const resolve = withDefaults({ size: 'lg', components: { DzButton: { size: 'xs' } } })
    expect(resolve('DzInput', 'size', [undefined])).toBe('lg')
  })

  it('answers undefined when nothing applies, leaving the component its own default', () => {
    const resolve = withDefaults({})
    expect(resolve('DzButton', 'size', [undefined])).toBeUndefined()
  })
})

describe('portal target, nonce and test ids', () => {
  it('takes a portal target from a provider', () => {
    const Child = defineComponent({
      setup: () => () => h('div', useDzPortalTarget().value ?? 'default'),
    })
    const Shell = defineComponent({
      setup() {
        provideDzPortalTarget(ref('#app-shell'))
        return () => h(Child)
      },
    })

    expect(mount(Shell).text()).toBe('#app-shell')
  })

  it('emits no attribute at all when test ids are off', () => {
    // An attribute nobody asked for is payload on every node.
    expect(probe(() => useDzTestIds()).testId('submit')).toBeUndefined()
  })

  it('names the attribute the host chose, not a hard-coded one', () => {
    let testId!: ReturnType<typeof useDzTestIds>['testId']
    const Child = defineComponent({
      setup() {
        testId = useDzTestIds().testId
        return () => h('div')
      },
    })
    mount(defineComponent({
      setup() {
        provideDzTestIds(ref({ enabled: true, attribute: 'data-qa' }))
        return () => h(Child)
      },
    }))

    expect(testId('submit')).toEqual({ 'data-qa': 'submit' })
  })
})

describe('motion', () => {
  it('follows the system when the preference is system', () => {
    const motion = probe(() => useDzMotion())

    // jsdom reports no reduced-motion preference, so the honest answer is false.
    expect(motion.preference.value).toBe('system')
    expect(motion.reduced.value).toBe(false)
  })

  it('reads matchMedia when one exists', () => {
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('matchMedia', matchMedia)

    expect(probe(() => useDzMotion()).reduced.value).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')

    vi.unstubAllGlobals()
  })

  it('unsubscribes when the scope is disposed', () => {
    const removeEventListener = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener,
    }))

    const Child = defineComponent({
      setup() {
        useDzMotion()
        return () => h('div')
      },
    })
    mount(Child).unmount()

    expect(removeEventListener).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
