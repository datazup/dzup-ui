import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
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

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). Seven of the nine `describe`
 * blocks below used to carry their own `document.body` wipe — seven copies of a hook
 * that detached the markup and left the mention popover mounted, listeners and all. One
 * `enableAutoUnmount` replaces all seven, covers the other two, and actually unmounts.
 */
enableAutoUnmount(afterEach)

describe('dzMention — trigger detection', () => {
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

  it('navigates back with ArrowUp, wrapping from the first option to the last', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, '@al')
    const textarea = wrapper.find('textarea')
    await textarea.trigger('keydown', { key: 'ArrowDown' }) // Alice → Albert
    await textarea.trigger('keydown', { key: 'ArrowUp' }) // Albert → Alice
    expect(options(wrapper)[0]!.attributes('aria-selected')).toBe('true')
    expect(textarea.attributes('aria-activedescendant')).toBe(options(wrapper)[0]!.attributes('id'))

    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    textarea.element.dispatchEvent(up) // Alice → Albert (wraps)
    await flushPromises()
    expect(up.defaultPrevented).toBe(true)
    expect(options(wrapper)[1]!.attributes('aria-selected')).toBe('true')
    await textarea.trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('@Albert ')
  })

  it('leaves ArrowUp to the textarea while the menu is closed', async () => {
    const wrapper = mountMention()
    await typeInto(wrapper, 'line one')
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    wrapper.find('textarea').element.dispatchEvent(up)
    expect(up.defaultPrevented).toBe(false)
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
  it('detects and inserts in input mode', async () => {
    const wrapper = mountMention({ multiline: false })
    await typeInto(wrapper, '@bo')
    expect(options(wrapper).map(o => o.text())).toEqual(['Bob'])
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('@Bob ')
  })
})

// -- D8: controlled/uncontrolled -------------------------------------------

describe('dzMention — D8: an external write after a user edit is honoured', () => {
  it('defect D8 -- a parent that clears `v-model:value` after the user typed is obeyed', async () => {
    // This is the exact reproduction N1-O1 measured: the
    // `RealWorldCommentComposer` story submitted a comment, set the draft back
    // to '', and the textarea kept the text.
    const wrapper = mountMention({ value: '' })

    await typeInto(wrapper, 'ship it')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toBe('ship it')

    await wrapper.setProps({ value: 'ship it' })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('ship it')

    await wrapper.setProps({ value: '' })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })
})

describe('dzMention — default v-model ownership', () => {
  function text(wrapper: ReturnType<typeof mountMention>): string {
    return (wrapper.find('textarea').element as HTMLTextAreaElement).value
  }

  it('controlled: renders the parent value, proposes the inserted text through update:modelValue, obeys a reset', async () => {
    const proposals: string[] = []
    const wrapper = mountMention({
      'modelValue': 'hi ',
      'onUpdate:modelValue': (value: string) => proposals.push(value),
    })
    expect(text(wrapper)).toBe('hi ')
    await typeInto(wrapper, 'hi @bo')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(proposals.at(-1)).toBe('hi @Bob ')
    await wrapper.setProps({ modelValue: proposals.at(-1) })
    expect(text(wrapper)).toBe('hi @Bob ')
    await wrapper.setProps({ modelValue: '' })
    expect(text(wrapper)).toBe('')
  })

  it('uncontrolled: with no model bound the component owns the text locally', async () => {
    const wrapper = mountMention()
    expect(text(wrapper)).toBe('')
    await typeInto(wrapper, '@al')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })
    await flushPromises()
    expect(text(wrapper)).toBe('@Alice ')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('@Alice ')
  })
})

describe('dzMention — D3: the public `loading` prop is not dead', () => {
  it('defect D3 -- `loading` puts the root in the busy state', () => {
    // The prop was declared (via `BaseBehaviorProps`), defaulted in the
    // component and read by nothing — `<DzMention loading>` did nothing at all
    // (N1-O1 defect D3).
    const wrapper = mountMention({ loading: true })
    const root = wrapper.find('[data-part="root"]')

    expect(root.attributes('data-loading')).toBe('')
    expect(root.attributes('aria-busy')).toBe('true')
  })

  it('defect D3 -- the root is not busy by default', () => {
    const root = mountMention().find('[data-part="root"]')
    expect(root.attributes('data-loading')).toBeUndefined()
    expect(root.attributes('aria-busy')).toBeUndefined()
  })
})
