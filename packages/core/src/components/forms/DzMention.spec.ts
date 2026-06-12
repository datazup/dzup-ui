import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzMention — Unit / behavior tests.
 *
 * Caret position is set directly on the native control before dispatching the
 * `input` event so trigger/query detection runs against a known caret offset
 * (jsdom does not maintain a real caret).
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import DzMention from './DzMention.vue'

const users = [
  { label: 'Alice', value: 'alice' },
  { label: 'Albert', value: 'albert' },
  { label: 'Bob', value: 'bob' },
]

const tags = [
  { label: 'bug', value: 'bug' },
  { label: 'feature', value: 'feature' },
]

const triggers = [
  { char: '@', options: users },
  { char: '#', options: tags },
]

function mountMention(props: Record<string, unknown> = {}) {
  return mount(DzMention, {
    props: { triggers, ...props },
    attachTo: document.body,
  })
}

/** Set the control's value + caret, then dispatch `input` (like real typing). */
async function typeInto(
  wrapper: ReturnType<typeof mountMention>,
  value: string,
  caret = value.length,
) {
  const control = wrapper.find('textarea').exists()
    ? wrapper.find('textarea')
    : wrapper.find('input')
  const el = control.element as HTMLTextAreaElement | HTMLInputElement
  el.value = value
  el.selectionStart = caret
  el.selectionEnd = caret
  await control.trigger('input')
  await flushPromises()
}

function menu(wrapper: ReturnType<typeof mountMention>) {
  return wrapper.find('[data-mention-menu]')
}

function options(wrapper: ReturnType<typeof mountMention>) {
  return wrapper.findAll('[data-mention-option]')
}

describe('dzMention — trigger detection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the menu when a trigger char is typed', async () => {
    const wrapper = mountMention()
    expect(menu(wrapper).exists()).toBe(false)
    await typeInto(wrapper, '@')
    expect(menu(wrapper).exists()).toBe(true)
    expect(options(wrapper).length).toBe(users.length)
    expect(wrapper.emitted('open')).toBeTruthy()
  })

  it('does not open when the trigger is preceded by a non-space char', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, 'name@host')
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('opens for a trigger that follows whitespace mid-text', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, 'hi @')
    expect(menu(wrapper).exists()).toBe(true)
  })

  it('closes when the token gains a space (query break)', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    expect(menu(wrapper).exists()).toBe(true)
    await typeInto(wrapper, '@al ')
    expect(menu(wrapper).exists()).toBe(false)
  })
})

describe('dzMention — filtering + search', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('filters static options by the typed query', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    const labels = options(wrapper).map(o => o.text())
    expect(labels).toEqual(['Alice', 'Albert'])
  })

  it('emits search with the active char and query', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['@', 'al'])
  })

  it('shows the no-results copy when nothing matches', async () => {
    const wrapper = mountMention({ noResultsText: 'Nobody' })
    await typeInto(wrapper, '@zzz')
    expect(wrapper.find('[data-mention-empty]').text()).toContain('Nobody')
  })

  it('does not filter when filter is false', async () => {
    const wrapper = mountMention({ filter: false })
    await typeInto(wrapper, '@zzz')
    expect(options(wrapper).length).toBe(users.length)
  })
})

describe('dzMention — async resolution', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows a loading state then renders resolved options', async () => {
    let resolve!: (v: { label: string, value: string }[]) => void
    const resolver = vi.fn(
      () => new Promise<{ label: string, value: string }[]>((r) => {
        resolve = r
      }),
    )
    const wrapper = mountMention({ triggers: [{ char: '@', options: resolver }] })

    await typeInto(wrapper, '@a')
    expect(resolver).toHaveBeenCalledWith('a')
    expect(wrapper.find('[data-mention-loading]').exists()).toBe(true)

    resolve([{ label: 'Zoe', value: 'zoe' }])
    await flushPromises()

    expect(wrapper.find('[data-mention-loading]').exists()).toBe(false)
    expect(options(wrapper).map(o => o.text())).toEqual(['Zoe'])
  })
})

describe('dzMention — keyboard insertion', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('inserts the highlighted option on Enter and closes', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, 'hi @al')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('hi @Alice ')
    expect(wrapper.emitted('select')?.at(-1)).toEqual([
      '@',
      expect.objectContaining({ value: 'alice' }),
    ])
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('navigates with ArrowDown before inserting', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    await wrapper.find('textarea').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()

    // ArrowDown moved from Alice → Albert.
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('@Albert ')
  })

  it('inserts on Tab as well', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    await wrapper.find('textarea').trigger('keydown', { key: 'Tab' })
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('@Alice ')
  })

  it('repositions the caret after the inserted mention', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    const el = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(el.selectionStart).toBe('@Alice '.length)
  })
})

describe('dzMention — multiple triggers', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('activates the # trigger with its own option set', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, 'fixing #')
    expect(options(wrapper).map(o => o.text())).toEqual(['bug', 'feature'])
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['#', ''])
  })

  it('inserts a hashtag option', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '#fea')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('#feature ')
  })
})

describe('dzMention — dismiss', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('closes the menu on Escape and emits close', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    expect(menu(wrapper).exists()).toBe(true)
    await wrapper.find('textarea').trigger('keydown', { key: 'Escape' })
    expect(menu(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not reopen the same dismissed token', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    await wrapper.find('textarea').trigger('keydown', { key: 'Escape' })
    // Re-detecting the identical token must stay closed.
    await typeInto(wrapper, '@al')
    expect(menu(wrapper).exists()).toBe(false)
    // Extending the query reopens it.
    await typeInto(wrapper, '@ali')
    expect(menu(wrapper).exists()).toBe(true)
  })
})

describe('dzMention — single-line mode', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('detects and inserts in input mode', async () => {
    const wrapper = mountMention({ multiline: false })
    await typeInto(wrapper, '@bo')
    expect(options(wrapper).map(o => o.text())).toEqual(['Bob'])
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('@Bob ')
  })
})
