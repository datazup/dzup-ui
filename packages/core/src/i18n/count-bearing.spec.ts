import type { DzMessages } from '@dzup-ui/contracts'
import type { Component } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import DzCountdown from '../components/data/DzCountdown.vue'
import DzDataView from '../components/data/DzDataView.vue'
import DzMention from '../components/forms/DzMention.vue'
import DzRating from '../components/forms/DzRating.vue'
import DzTagsInput from '../components/forms/DzTagsInput.vue'
import DzProvider from '../providers/DzProvider.vue'
import { messageArguments } from './message-format.ts'
import { enMessages } from './messages.ts'
import { pseudoMessages } from './pseudo.ts'
import { useComponentMessageFormat } from './useComponentMessages.ts'

/**
 * The five count-bearing components (TASK-R5-O4).
 *
 * Each built its plural by concatenation. The claims tested here: English is
 * unchanged, another locale's plural categories reach the DOM through a host
 * catalog, a broken host translation degrades to English rather than breaking
 * the component, and the pseudo catalog still formats.
 */

const NOW = new Date('2026-06-14T15:00:00.000Z')

function withProvider(component: Component, props: Record<string, unknown>, provider: Record<string, unknown> = {}) {
  return mount(DzProvider, {
    props: provider,
    slots: { default: () => h(component, props) },
    attachTo: document.body,
  })
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

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('the catalog entries', () => {
  const COUNT_BEARING = [
    ['DzCountdown', 'days'],
    ['DzCountdown', 'hours'],
    ['DzCountdown', 'minutes'],
    ['DzCountdown', 'seconds'],
    ['DzDataView', 'showingAll'],
    ['DzDataView', 'showingRange'],
    ['DzMention', 'suggestionsAvailable'],
    ['DzRating', 'starTitle'],
    ['DzTagsInput', 'count'],
    ['DzTagsInput', 'countOfMax'],
  ] as const

  it.each(COUNT_BEARING)('%s.%s is a plural on its count', (group, key) => {
    const message = (enMessages[group] as Record<string, string>)[key]!
    expect([...messageArguments(message).values()]).toContain('plural')
  })
})

describe('english output is unchanged', () => {
  it('dzCountdown announces "1 day, 1 hour, 1 minute, 5 seconds remaining"', () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    const wrapper = withProvider(DzCountdown, { target: NOW.getTime() + 90_065_000 })
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('1 day, 1 hour, 1 minute, 5 seconds remaining')
  })

  it('dzCountdown announces plurals and the finished state', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    const wrapper = withProvider(DzCountdown, { target: NOW.getTime() + 2 * 86_400_000 + 7_200_000 + 2_000 })
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('2 days, 2 hours, 2 seconds remaining')
    vi.advanceTimersByTime(3 * 86_400_000)
    await flushPromises()
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Countdown finished')
  })

  it('dzDataView announces one item, many items and a page range', () => {
    const one = withProvider(DzDataView, { items: [{ id: 1 }] })
    expect(one.find('[aria-live="polite"]').text()).toBe('Showing 1 item')
    const many = withProvider(DzDataView, { items: [{ id: 1 }, { id: 2 }] })
    expect(many.find('[aria-live="polite"]').text()).toBe('Showing 2 items')
    const paged = withProvider(DzDataView, { items: Array.from({ length: 25 }, (_, id) => ({ id })), paginator: true, rows: 10 })
    expect(paged.find('[aria-live="polite"]').text()).toBe('Showing 1 to 10 of 25 items')
  })

  it('dzDataView fixes the one English defect the literal had: "of 1 items"', () => {
    const wrapper = withProvider(DzDataView, { items: [{ id: 1 }], paginator: true, rows: 10 })
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Showing 1 to 1 of 1 item')
  })

  it('dzRating titles each star "1 star", "2 stars"', () => {
    const wrapper = withProvider(DzRating, { count: 3 })
    expect(wrapper.findAll('[data-part="item"]').map(star => star.attributes('title')))
      .toEqual(['1 star', '2 stars', '3 stars'])
  })

  it('dzTagsInput announces the count with and without a maximum', () => {
    expect(withProvider(DzTagsInput, { modelValue: ['a'] }).find('[aria-live="polite"]').text()).toBe('1 tag')
    expect(withProvider(DzTagsInput, { modelValue: ['a', 'b'], max: 5 }).find('[aria-live="polite"]').text())
      .toBe('2 tags of 5')
  })

  it('dzMention announces how many suggestions are available', async () => {
    const wrapper = withProvider(DzMention, {
      triggers: [{ char: '@', options: [{ label: 'Alice', value: 'alice' }, { label: 'Albert', value: 'albert' }] }],
    })
    const control = wrapper.find('textarea').exists() ? wrapper.find('textarea') : wrapper.find('input')
    const element = control.element as HTMLTextAreaElement
    element.value = '@Al'
    element.selectionStart = 3
    element.selectionEnd = 3
    await control.trigger('input')
    await flushPromises()
    expect(wrapper.find('[role="status"]').text()).toBe('2 suggestions available')
  })
})

describe('another locale reaches the DOM through a host catalog', () => {
  const bs: DzMessages = {
    DzTagsInput: { count: '{count, plural, one {# oznaka} few {# oznake} other {# oznaka}}' },
    DzRating: { starTitle: '{count, plural, one {# zvjezdica} few {# zvjezdice} other {# zvjezdica}}' },
  }

  it('uses Bosnian `few` where English has only two forms', () => {
    const tags = withProvider(DzTagsInput, { modelValue: ['a', 'b', 'c'] }, { locale: 'bs-BA', messages: bs })
    expect(tags.find('[aria-live="polite"]').text()).toBe('3 oznake')
    const stars = withProvider(DzRating, { count: 5 }, { locale: 'bs-BA', messages: bs })
    expect(stars.findAll('[data-part="item"]').map(star => star.attributes('title')))
      .toEqual(['1 zvjezdica', '2 zvjezdice', '3 zvjezdice', '4 zvjezdice', '5 zvjezdica'])
  })

  it('keeps English branches on English rules for an untranslated key in a French app', () => {
    const wrapper = withProvider(DzTagsInput, { modelValue: [] }, { locale: 'fr-FR' })
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('0 tags')
  })
})

describe('a broken host translation degrades to English', () => {
  it.each([
    ['a syntax error', '{count, plural, one {# oznaka}'],
    ['an argument the component does not pass', '{broj} oznaka'],
  ])('renders the English default for %s and warns once', (_, message) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const messages: DzMessages = { DzTagsInput: { count: message } }
    const first = withProvider(DzTagsInput, { modelValue: ['a', 'b'] }, { messages })
    const second = withProvider(DzTagsInput, { modelValue: ['a', 'b'] }, { messages })
    expect(first.find('[aria-live="polite"]').text()).toBe('2 tags')
    expect(second.find('[aria-live="polite"]').text()).toBe('2 tags')
    expect(warn.mock.calls.filter(([text]) => String(text).includes('DzTagsInput.count'))).toHaveLength(1)
    warn.mockRestore()
  })
})

describe('the pseudo catalog still formats', () => {
  it('keeps plural syntax intact while accenting and framing the text', () => {
    let formatted = ''
    const Probe = defineComponent({
      setup() {
        const format = useComponentMessageFormat('DzTagsInput')
        formatted = format('count', { count: 2 })
        return () => h('span')
      },
    })
    withProvider(Probe, {}, { messages: pseudoMessages() })
    // Accented branch text, `#` formatted, frame intact, padded.
    expect(formatted).toMatch(/^\[!!! 2 ţáĝş [·~]+ !!!\]$/)
  })
})
