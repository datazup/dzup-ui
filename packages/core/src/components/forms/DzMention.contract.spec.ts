import type { LoadOptionsRequest } from '@dzup-ui/contracts'
import type { DzMentionOption, DzMentionTrigger } from './DzMention.types.ts'
import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzMention — Contract Spec v1 conformance tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import DzMention from './DzMention.vue'

const triggers = [
  {
    char: '@',
    options: [
      { label: 'Alice', value: 'alice' },
      { label: 'Bob', value: 'bob' },
    ],
  },
]

describe('dzMention — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a textarea by default (multiline)', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })

  it('renders a single-line input when multiline is false', () => {
    const wrapper = mount(DzMention, { props: { triggers, multiline: false } })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMention, { props: { triggers, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all input variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzMention, { props: { triggers, variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('exposes the combobox role with listbox popup', () => {
    const wrapper = mount(DzMention, { props: { triggers } })
    const control = wrapper.find('[role="combobox"]')
    expect(control.exists()).toBe(true)
    expect(control.attributes('aria-haspopup')).toBe('listbox')
    expect(control.attributes('aria-autocomplete')).toBe('list')
  })

  it('merges consumer class via cn() onto the control', () => {
    const wrapper = mount(DzMention, {
      props: { triggers },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.find('textarea').classes()).toContain('custom-class')
  })

  it('renders the placeholder', () => {
    const wrapper = mount(DzMention, { props: { triggers, placeholder: 'Write…' } })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Write…')
  })

  it('renders an error message with role="alert"', () => {
    const wrapper = mount(DzMention, { props: { triggers, error: 'Required' } })
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Required')
  })

  it('reflects disabled state on the control', () => {
    const wrapper = mount(DzMention, { props: { triggers, disabled: true } })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('passes the name attribute through for form integration', () => {
    const wrapper = mount(DzMention, { props: { triggers, name: 'comment' } })
    expect(wrapper.find('textarea').attributes('name')).toBe('comment')
  })
})

/**
 * Renderer contract C9 — DzMention on the shared async-options seam
 * (TASK-R3-O3). Before this packet the readiness matrix recorded C9 as `future`:
 * a private loader with a monotonic token fence, no error path, and nothing a
 * form renderer could drive.
 */
describe('dzMention — renderer contract C9 async options', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const people: DzMentionOption[] = [
    { label: 'Alice', value: 'alice' },
    { label: 'Albert', value: 'albert' },
  ]

  function mountMention(props: Record<string, unknown>, slots?: Record<string, string>) {
    return mount(DzMention, { props: { triggers, ...props }, slots, attachTo: document.body })
  }

  function mountHostDriven(props: Record<string, unknown> = {}) {
    return mountMention({ triggers: [{ char: '@', options: [] }], optionsState: 'idle', ...props })
  }

  type Wrapper = ReturnType<typeof mountMention>

  async function typeInto(wrapper: Wrapper, value: string) {
    const control = wrapper.find('textarea')
    const el = control.element as HTMLTextAreaElement
    el.value = value
    el.selectionStart = value.length
    el.selectionEnd = value.length
    await control.trigger('input')
    await flushPromises()
  }

  function requests(wrapper: Wrapper): LoadOptionsRequest[] {
    return (wrapper.emitted('loadOptions') ?? []).map(args => args[0] as LoadOptionsRequest)
  }

  it('asks the host with `open` for a new token and `search` as the query grows', async () => {
    const wrapper = mountHostDriven()
    await typeInto(wrapper, '@')
    await typeInto(wrapper, '@al')
    const sent = requests(wrapper)
    expect(sent.map(r => [r.reason, r.query])).toEqual([['open', ''], ['search', 'al']])
    // Every request supersedes the last, and the last one's signal says so.
    expect(sent[0]!.signal.aborted).toBe(true)
    expect(sent[1]!.signal.aborted).toBe(false)
    // `search` still fires first and carries the trigger character.
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['@', 'al'])
  })

  it('asks nobody while merely mounted: there is nothing to request until a trigger is typed', () => {
    const wrapper = mountHostDriven()
    expect(wrapper.emitted('loadOptions')).toBeUndefined()
  })

  it('shows the shared loading row instead of the list, and marks the root busy', async () => {
    const wrapper = mountHostDriven({
      optionsState: 'loading',
      triggers: [{ char: '@', options: people }],
    })
    await typeInto(wrapper, '@')
    const row = wrapper.find('[data-part="options-state"]')
    expect(row.exists()).toBe(true)
    expect(row.attributes('data-options-state')).toBe('loading')
    expect(row.attributes('role')).toBe('status')
    expect(wrapper.find('[data-mention-option]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    // The previous array is still in `triggers`; the keyboard must not insert
    // an option nobody can see, and aria-controls must not name a missing list.
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.find('textarea').attributes('aria-controls')).toBeUndefined()
  })

  it('renders what the host wrote into the trigger once ready, unfiltered', async () => {
    const wrapper = mountHostDriven()
    await typeInto(wrapper, '@zz')
    // A host that searched server-side returns matches a local filter would drop.
    await wrapper.setProps({ optionsState: 'ready', triggers: [{ char: '@', options: people }] })
    await flushPromises()
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-mention-option]').map(o => o.text())).toEqual(['Alice', 'Albert'])
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')?.[0]?.[1]).toMatchObject({ value: 'alice' })
  })

  it('says `empty` through the shared row when the host is ready with nothing', async () => {
    const wrapper = mountHostDriven()
    await typeInto(wrapper, '@q')
    await wrapper.setProps({ optionsState: 'ready' })
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="options-message"]').text()).toBe('No options found')
  })

  it('offers a retry on error that emits retry-options, asks again and keeps focus in the field', async () => {
    const wrapper = mountHostDriven()
    await typeInto(wrapper, '@al')
    await wrapper.setProps({ optionsState: 'error', optionsError: 'The directory did not answer' })
    expect(wrapper.find('[data-part="options-message"]').text()).toBe('The directory did not answer')

    const retry = wrapper.find('[data-part="options-retry"]')
    expect(retry.exists()).toBe(true)
    // A pointer retry must not steal focus from the text control (C9.4).
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    retry.element.dispatchEvent(mousedown)
    expect(mousedown.defaultPrevented).toBe(true)

    const before = requests(wrapper).length
    await retry.trigger('click')
    await flushPromises()
    expect(wrapper.emitted('retryOptions')).toHaveLength(1)
    const again = requests(wrapper)
    expect(again).toHaveLength(before + 1)
    expect(again.at(-1)).toMatchObject({ reason: 'search', query: 'al' })
    expect(document.activeElement).toBe(wrapper.find('textarea').element)
  })

  it('honours optionsRetryable=false — the host retries on its own', async () => {
    const wrapper = mountHostDriven({ optionsRetryable: false })
    await typeInto(wrapper, '@')
    await wrapper.setProps({ optionsState: 'error' })
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="options-retry"]').exists()).toBe(false)
  })

  it('aborts the in-flight request when the menu closes', async () => {
    const wrapper = mountHostDriven()
    await typeInto(wrapper, '@al')
    const [pending] = requests(wrapper)
    await wrapper.find('textarea').trigger('keydown', { key: 'Escape' })
    expect(pending!.signal.aborted).toBe(true)
  })

  it('emits nothing for static triggers — the seam is inert without optionsState or a resolver', async () => {
    const wrapper = mountMention({})
    await typeInto(wrapper, '@al')
    expect(wrapper.emitted('loadOptions')).toBeUndefined()
    expect(wrapper.find('[data-part="options-state"]').exists()).toBe(false)
  })

  describe('a resolver runs as the host of the seam request (its private loader is gone)', () => {
    it('drops a superseded response by its aborted signal, not a private counter', async () => {
      const pending: ((v: DzMentionOption[]) => void)[] = []
      const resolver = vi.fn(() => new Promise<DzMentionOption[]>((r) => {
        pending.push(r)
      }))
      const wrapper = mountMention({ triggers: [{ char: '@', options: resolver }] as DzMentionTrigger[] })
      await typeInto(wrapper, '@a')
      await typeInto(wrapper, '@al')
      const sent = requests(wrapper)
      expect(sent.map(r => r.query)).toEqual(['a', 'al'])
      expect(sent[0]!.signal.aborted).toBe(true)

      // The newer answer lands first; the stale one must not overwrite it.
      pending[1]!([{ label: 'Alice', value: 'alice' }])
      await flushPromises()
      pending[0]!([{ label: 'Stale', value: 'stale' }])
      await flushPromises()
      expect(wrapper.findAll('[data-mention-option]').map(o => o.text())).toEqual(['Alice'])
    })

    it('turns a rejected resolver into the error row, and retry calls it again', async () => {
      const resolver = vi.fn<(query: string) => Promise<DzMentionOption[]>>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce([{ label: 'Alice', value: 'alice' }])
      const wrapper = mountMention({ triggers: [{ char: '@', options: resolver }] as DzMentionTrigger[] })
      await typeInto(wrapper, '@a')
      expect(wrapper.find('[data-part="options-state"]').attributes('data-options-state')).toBe('error')
      // The catalog message, never the thrown error's own text.
      expect(wrapper.find('[data-part="options-message"]').text()).toBe('Could not load options')

      await wrapper.find('[data-part="options-retry"]').trigger('click')
      await flushPromises()
      expect(resolver).toHaveBeenCalledTimes(2)
      expect(wrapper.find('[data-part="options-state"]').exists()).toBe(false)
      expect(wrapper.findAll('[data-mention-option]').map(o => o.text())).toEqual(['Alice'])
    })

    it('keeps its pre-seam loading row and slot while pending', async () => {
      const resolver = vi.fn(() => new Promise<DzMentionOption[]>(() => {}))
      const wrapper = mountMention(
        { triggers: [{ char: '@', options: resolver }] as DzMentionTrigger[] },
        { loading: '<span data-testid="custom-loading">Searching people…</span>' },
      )
      await typeInto(wrapper, '@a')
      expect(wrapper.find('[data-part="loader"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="custom-loading"]').exists()).toBe(true)
      expect(wrapper.find('[data-part="options-state"]').exists()).toBe(false)
    })
  })
})
