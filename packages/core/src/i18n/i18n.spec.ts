import type { DzMessages } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import DzProvider from '../providers/DzProvider.vue'
import {
  cachedDateTimeFormat,
  cachedNumberFormat,
  clearFormatterCache,
  formatterCacheSize,
} from './intl-cache.ts'
import { enMessages } from './messages.ts'
import { useComponentMessages } from './useComponentMessages.ts'

/**
 * The message catalog and the formatter cache (TASK-OSS-P4-03, ADR-20).
 *
 * Two claims the packet makes that would otherwise be prose:
 *
 *   1. **Every catalog value is byte-identical to the literal it replaced**, so
 *      51 components behave exactly as they did until a host supplies a
 *      catalog. Spot-checked below across all three groups of string this
 *      packet touched.
 *   2. **Formatting a thousand rows constructs at most one formatter per
 *      (locale, options) pair.** The reason the cache exists, and previously
 *      false in the sharpest place: a tween built one inside the function it
 *      called every frame.
 */

beforeEach(() => {
  clearFormatterCache()
})

/** Mount a provider around a child that reads one component's messages. */
function read<K extends Parameters<typeof useComponentMessages>[0]>(
  component: K,
  messages?: DzMessages,
) {
  let captured!: ReturnType<typeof useComponentMessages<K>>
  const Child = defineComponent({
    setup() {
      captured = useComponentMessages(component)
      return () => h('div')
    },
  })
  mount(DzProvider, {
    props: messages === undefined ? {} : { messages },
    slots: { default: () => h(Child) },
  })
  return captured
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

describe('the catalog preserves what it replaced', () => {
  it('keeps the exact strings the templates used to hard-code', () => {
    // Group 1: static `aria-label` values no application could change at all.
    expect(enMessages.DzInput.clear).toBe('Clear input')
    expect(enMessages.DzLightbox.close).toBe('Close lightbox')
    expect(enMessages.DzPagination.firstPage).toBe('Go to first page')
    expect(enMessages.DzTimePicker.dayPeriod).toBe('AM/PM')
  })

  it('keeps the exact prop defaults it absorbed', () => {
    // Group 2: literal defaults that only a per-instance prop could change.
    expect(enMessages.DzSelect.noResults).toBe('No results found')
    expect(enMessages.DzCombobox.loading).toBe('Loading options…')
    expect(enMessages.DzConfirmDialog.cancel).toBe('Cancel')
    expect(enMessages.DzBreadcrumb.ariaLabel).toBe('Breadcrumb')
  })

  it('preserves an inconsistency rather than tidying it silently', () => {
    // `DzCascader` shipped U+2026; `DzSelect` and `DzListbox` shipped three
    // periods. Normalising them here would have been a visible change to three
    // components smuggled in under a refactor.
    expect(enMessages.DzCascader.searchPlaceholder).toBe('Search…')
    expect(enMessages.DzSelect.searchPlaceholder).toBe('Search...')
    expect(enMessages.DzListbox.filterPlaceholder).toBe('Search...')
  })
})

describe('useComponentMessages', () => {
  it('returns the English defaults with no provider catalog', () => {
    expect(read('DzInput').value).toEqual({ clear: 'Clear input', loading: 'Loading' })
  })

  it('applies an override per key, keeping the rest', () => {
    // The load-bearing one. A host translating `confirm` must not lose the ten
    // other strings `DzTimePicker` renders.
    const messages = read('DzTimePicker', { DzTimePicker: { confirm: 'حسنا' } }).value
    expect(messages.confirm).toBe('حسنا')
    expect(messages.cancel).toBe('Cancel')
    expect(messages.hours).toBe('Hours')
    expect(messages.selectDayPeriod).toBe('Select AM/PM')
  })

  it('ignores a non-string override instead of rendering [object Object]', () => {
    // The usual shape of a mistyped catalog — a nested object where a string
    // belongs. Falling back is visibly correct; stringifying is visibly wrong
    // and only in the locale nobody on the team reads.
    const messages = read('DzAlert', { DzAlert: { close: { nested: 'oops' } } }).value
    expect(messages.close).toBe('Close')
  })

  it('leaves a component the catalog does not mention alone', () => {
    expect(read('DzAlert', { DzSelect: { noResults: 'x' } }).value.close).toBe('Close')
  })
})

describe('the formatter cache', () => {
  it('constructs at most one formatter per locale and option set across 1,000 rows', () => {
    // The packet's own acceptance criterion. 1,000 rows, two option sets, one
    // locale — four constructions would be the uncached count times 250.
    for (let row = 0; row < 1000; row += 1) {
      cachedNumberFormat('en-US', { style: 'percent' }).format(row / 1000)
      cachedNumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(row)
      cachedDateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date(0))
    }
    expect(formatterCacheSize()).toBe(3)
  })

  it('treats the same options in a different key order as one formatter', () => {
    cachedNumberFormat('en-US', { style: 'currency', currency: 'EUR' })
    cachedNumberFormat('en-US', { currency: 'EUR', style: 'currency' })
    expect(formatterCacheSize()).toBe(1)
  })

  it('keeps locales apart', () => {
    cachedNumberFormat('en-US')
    cachedNumberFormat('de-DE')
    expect(formatterCacheSize()).toBe(2)
  })

  it('caches the undefined locale too, without conflating it with a named one', () => {
    // `undefined` means "the runtime's own locale" and is a documented part of
    // the public `formatNumber` / `formatRelativeTime` signatures, so it has to
    // be a cache key like any other rather than a hole in the cache.
    cachedNumberFormat(undefined)
    cachedNumberFormat('en-US')
    expect(formatterCacheSize()).toBe(2)
  })

  it('accepts a locale priority list', () => {
    cachedNumberFormat(['de-DE', 'en-US'])
    cachedNumberFormat(['de-DE', 'en-US'])
    expect(formatterCacheSize()).toBe(1)
  })
})
