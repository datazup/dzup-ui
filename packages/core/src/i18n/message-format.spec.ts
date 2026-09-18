import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { escapeHtml } from '../security/sanitize.ts'
import { clearFormatterCache, formatterCacheSize } from './intl-cache.ts'
import {
  formatMessage,
  mapMessageText,
  MessageArgumentError,
  messageArguments,
  MessageSyntaxError,
  parseMessage,
  serialiseMessage,
} from './message-format.ts'

/**
 * The message formatter (TASK-R5-O4).
 *
 * Three claims the task makes that would otherwise be prose: plurals follow
 * `Intl.PluralRules` for the locale rather than English's two forms; argument
 * values cannot become syntax or markup; and plural rules are cached per locale
 * through `intl-cache`.
 */

const ITEMS = '{count, plural, one {# item} other {# items}}'

beforeEach(() => {
  clearFormatterCache()
})

describe('plural', () => {
  it('picks English one/other and formats the number for the locale', () => {
    expect(formatMessage(ITEMS, { count: 1 }, 'en-US')).toBe('1 item')
    expect(formatMessage(ITEMS, { count: 0 }, 'en-US')).toBe('0 items')
    expect(formatMessage(ITEMS, { count: 1234 }, 'en-US')).toBe('1,234 items')
    expect(formatMessage(ITEMS, { count: 1234 }, 'de-DE')).toBe('1.234 items')
  })

  it('uses the locale\'s categories, not English\'s two — Bosnian has `few`', () => {
    const bs = '{count, plural, one {# stavka} few {# stavke} other {# stavki}}'
    expect(formatMessage(bs, { count: 1 }, 'bs')).toBe('1 stavka')
    expect(formatMessage(bs, { count: 3 }, 'bs')).toBe('3 stavke')
    expect(formatMessage(bs, { count: 5 }, 'bs')).toBe('5 stavki')
    expect(formatMessage(bs, { count: 21 }, 'bs')).toBe('21 stavka')
    expect(formatMessage(bs, { count: 22 }, 'bs')).toBe('22 stavke')
  })

  it('puts zero in the singular for French, where concatenation says plural', () => {
    const fr = '{count, plural, one {# élément} other {# éléments}}'
    expect(formatMessage(fr, { count: 0 }, 'fr')).toBe('0 élément')
  })

  it('reaches Arabic\'s six categories, falling back to other only when a branch is absent', () => {
    const ar = '{count, plural, zero {لا عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصرًا} other {# عنصر}}'
    expect(formatMessage(ar, { count: 0 }, 'ar')).toBe('لا عناصر')
    expect(formatMessage(ar, { count: 2 }, 'ar')).toBe('عنصران')
    expect(formatMessage(ar, { count: 11 }, 'ar')).toContain('عنصرًا')
    // `two` is absent here, so `other` renders. The digit is the ICU build's
    // default numbering system for `ar` (Latin since CLDR 42, Arabic-Indic
    // before) — asserted as either, because the branch is what is under test.
    expect(formatMessage('{count, plural, other {# x}}', { count: 2 }, 'ar')).toMatch(/^[2٢] x$/)
  })

  it('prefers an exact =N match over the category', () => {
    const message = '{count, plural, =0 {No items} one {# item} other {# items}}'
    expect(formatMessage(message, { count: 0 }, 'en-US')).toBe('No items')
    expect(formatMessage(message, { count: 1 }, 'en-US')).toBe('1 item')
  })

  it('supports ordinals', () => {
    const message = '{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    expect([1, 2, 3, 4, 11, 22].map(place => formatMessage(message, { place }, 'en-US')))
      .toEqual(['1st', '2nd', '3rd', '4th', '11th', '22nd'])
  })

  it('lets English branches be chosen by English rules inside another locale', () => {
    // An untranslated key in a French app: the branches are English, so `0`
    // must not land in "one" just because French puts it there.
    expect(formatMessage(ITEMS, { count: 0 }, 'fr', { pluralLocale: 'en' })).toBe('0 items')
  })

  it('caches plural rules per locale and type rather than per call', () => {
    for (let row = 0; row < 500; row += 1)
      formatMessage(ITEMS, { count: row }, 'en-US')
    // one PluralRules + one NumberFormat
    expect(formatterCacheSize()).toBe(2)
  })
})

describe('select and arguments', () => {
  it('selects by exact value with other as the fallback', () => {
    const message = '{kind, select, file {File {name}} folder {Folder {name}} other {Item {name}}}'
    expect(formatMessage(message, { kind: 'file', name: 'a.txt' }, 'en')).toBe('File a.txt')
    expect(formatMessage(message, { kind: 'link', name: 'x' }, 'en')).toBe('Item x')
  })

  it('reads # inside a select nested in a plural as the plural\'s number', () => {
    const message = '{count, plural, one {{kind, select, file {# file} other {# item}}} other {# things}}'
    expect(formatMessage(message, { count: 1, kind: 'file' }, 'en')).toBe('1 file')
  })

  it('throws a typed error for a missing or non-numeric value', () => {
    expect(() => formatMessage('Hi {name}', {}, 'en')).toThrow(MessageArgumentError)
    expect(() => formatMessage(ITEMS, { count: 'three' }, 'en')).toThrow(MessageArgumentError)
    // NaN is a number: `other`, rendered — what the concatenation it replaced did.
    expect(formatMessage(ITEMS, { count: Number.NaN }, 'en')).toBe('NaN items')
  })

  it('reports every argument and what it is used as', () => {
    expect(Object.fromEntries(messageArguments('{a} {n, plural, other {{b}}} {s, select, other {x}}')))
      .toEqual({ a: 'simple', n: 'plural', b: 'simple', s: 'select' })
  })
})

describe('syntax', () => {
  it.each([
    ['{count, plural, one {# item}}', 'no other'],
    ['{count, plural, lots {x} other {y}}', 'not a plural category'],
    ['{count, number}', 'unsupported type'],
    ['{count, plural, offset:1 other {#}}', 'offset'],
    ['{kind, select, =1 {x} other {y}}', 'exact selector in select'],
    ['{count, plural, one {a} one {b} other {c}}', 'duplicate selector'],
    ['Hello {name', 'unclosed'],
    ['Hello }', 'unmatched close'],
    ['\'{unterminated', 'unterminated quote'],
  ])('rejects %s (%s)', (message) => {
    expect(() => parseMessage(message)).toThrow(MessageSyntaxError)
  })

  it('follows ICU apostrophe quoting, so ordinary apostrophes need no escaping', () => {
    expect(formatMessage('Don\'t panic', {}, 'en')).toBe('Don\'t panic')
    expect(formatMessage('It\'\'s', {}, 'en')).toBe('It\'s')
    expect(formatMessage('Use \'{braces}\' literally', {}, 'en')).toBe('Use {braces} literally')
    expect(formatMessage('{n, plural, other {\'#\' is # }}', { n: 2 }, 'en')).toBe('# is 2 ')
  })

  it('round-trips through the serialiser', () => {
    const sources = [
      ITEMS,
      'Use \'{braces}\' and it\'\'s {name}',
      '{count, plural, =0 {none} one {\'#\' # {kind, select, a {A} other {B}}} other {#}}',
    ]
    for (const source of sources)
      expect(parseMessage(serialiseMessage(parseMessage(source)))).toEqual(parseMessage(source))
  })

  it('rewrites translatable text only, leaving names, selectors and # intact', () => {
    const upper = mapMessageText(ITEMS, text => text.toUpperCase())
    expect(upper).toBe('{count, plural, one {# ITEM} other {# ITEMS}}')
    expect(formatMessage(upper, { count: 2 }, 'en')).toBe('2 ITEMS')
  })
})

describe('escaping — values are data, never syntax and never markup', () => {
  const hostile = '<img src=x onerror="alert(1)"> & {count, plural, other {#}} \'#\''

  it('does not parse syntax inside a value', () => {
    expect(formatMessage('Remove {name}', { name: hostile }, 'en')).toBe(`Remove ${hostile}`)
    expect(formatMessage('{count, plural, other {# for {name}}}', { count: 2, name: '{count}' }, 'en'))
      .toBe('2 for {count}')
  })

  it('renders < and & in a value as text in both a text node and an attribute', () => {
    const Probe = defineComponent({
      setup() {
        const label = formatMessage('Remove {name}', { name: hostile }, 'en-US')
        return () => h('button', { 'aria-label': label }, label)
      },
    })
    const wrapper = mount(Probe)
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.element.textContent).toBe(`Remove ${hostile}`)
    expect(wrapper.attributes('aria-label')).toBe(`Remove ${hostile}`)
    // The serialised DOM carries the entities — the characters never became tags.
    expect(wrapper.html()).toContain('&lt;img')
    expect(wrapper.html()).toContain('&amp;')
  })

  it('stays inert through the sanitizer seam\'s escaping default for an HTML sink', () => {
    const html = escapeHtml(formatMessage('Remove {name}', { name: hostile }, 'en'))
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;')
  })
})
