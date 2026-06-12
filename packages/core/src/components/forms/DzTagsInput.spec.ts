import { mount } from '@vue/test-utils'
/**
 * DzTagsInput — Unit / behavior tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import DzTagsInput from './DzTagsInput.vue'

function mountTags(props: Record<string, unknown> = {}) {
  return mount(DzTagsInput, {
    props,
    attachTo: document.body,
  })
}

function field(wrapper: ReturnType<typeof mountTags>) {
  return wrapper.find('input[type="text"]')
}

/** Type text into the draft then press a key. */
async function typeAndKey(
  wrapper: ReturnType<typeof mountTags>,
  text: string,
  key: string,
) {
  const input = field(wrapper)
  await input.setValue(text)
  await input.trigger('keydown', { key })
}

describe('dzTagsInput — add tokens', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('commits a token on Enter', async () => {
    const wrapper = mountTags()
    await typeAndKey(wrapper, 'apple', 'Enter')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['apple'])
    expect(wrapper.emitted('add')?.[0]).toEqual(['apple'])
    // Draft cleared.
    expect((field(wrapper).element as HTMLInputElement).value).toBe('')
  })

  it('commits a token on a comma delimiter', async () => {
    const wrapper = mountTags()
    await typeAndKey(wrapper, 'banana', ',')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['banana'])
  })

  it('trims whitespace and ignores empty tokens', async () => {
    const wrapper = mountTags()
    await typeAndKey(wrapper, '   ', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await typeAndKey(wrapper, '  spaced  ', 'Enter')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['spaced'])
  })

  it('supports custom delimiters', async () => {
    const wrapper = mountTags({ delimiters: ['Enter', ';'] })
    await typeAndKey(wrapper, 'a', ';')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['a'])
  })
})

describe('dzTagsInput — remove tokens', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('removes a token via its chip close button', async () => {
    const wrapper = mountTags({ value: ['x', 'y'] })
    const closeBtn = wrapper.findAll('[data-dz-tag] button')[0]!
    await closeBtn.trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['y'])
    expect(wrapper.emitted('remove')?.[0]).toEqual(['x', 0])
  })

  it('removes the last token with Backspace on an empty field', async () => {
    const wrapper = mountTags({ value: ['one', 'two'] })
    const input = field(wrapper)
    await input.setValue('')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['one'])
  })

  it('does not remove on Backspace while the draft is non-empty', async () => {
    const wrapper = mountTags({ value: ['one'] })
    const input = field(wrapper)
    await input.setValue('typing')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })
})

describe('dzTagsInput — duplicates & max', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('rejects duplicates by default', async () => {
    const wrapper = mountTags({ value: ['dup'] })
    await typeAndKey(wrapper, 'dup', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.[0]).toEqual(['dup', 'duplicate'])
  })

  it('allows duplicates when allowDuplicates is set', async () => {
    const wrapper = mountTags({ value: ['dup'], allowDuplicates: true })
    await typeAndKey(wrapper, 'dup', 'Enter')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['dup', 'dup'])
  })

  it('honors max', async () => {
    const wrapper = mountTags({ value: ['a', 'b'], max: 2 })
    await typeAndKey(wrapper, 'c', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.[0]).toEqual(['c', 'max'])
  })
})

describe('dzTagsInput — validation', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const isEmail = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)

  it('rejects tokens failing the validate predicate', async () => {
    const wrapper = mountTags({ validate: isEmail })
    await typeAndKey(wrapper, 'not-an-email', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.[0]).toEqual(['not-an-email', 'invalid'])
  })

  it('accepts tokens passing the validate predicate', async () => {
    const wrapper = mountTags({ validate: isEmail })
    await typeAndKey(wrapper, 'a@b.com', 'Enter')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['a@b.com'])
  })
})

describe('dzTagsInput — paste', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function paste(wrapper: ReturnType<typeof mountTags>, text: string) {
    return field(wrapper).trigger('paste', {
      clipboardData: { getData: () => text },
    })
  }

  it('splits pasted text on delimiters into multiple tokens', async () => {
    const wrapper = mountTags()
    await paste(wrapper, 'red, green, blue')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['red', 'green', 'blue'])
  })

  it('splits pasted multi-line text', async () => {
    const wrapper = mountTags()
    await paste(wrapper, 'one\ntwo\nthree')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['one', 'two', 'three'])
  })

  it('drops invalid pieces while keeping valid ones', async () => {
    const isEmail = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
    const wrapper = mountTags({ validate: isEmail })
    await paste(wrapper, 'a@b.com, nope, c@d.com')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['a@b.com', 'c@d.com'])
  })
})

describe('dzTagsInput — addOnBlur', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('commits the draft on blur when enabled', async () => {
    const wrapper = mountTags({ addOnBlur: true })
    const input = field(wrapper)
    await input.setValue('pending')
    await input.trigger('blur')
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['pending'])
  })

  it('does not commit the draft on blur by default', async () => {
    const wrapper = mountTags()
    const input = field(wrapper)
    await input.setValue('pending')
    await input.trigger('blur')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })
})

describe('dzTagsInput — disabled & readonly', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not add tokens when disabled', async () => {
    const wrapper = mountTags({ disabled: true })
    await typeAndKey(wrapper, 'nope', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('does not add tokens when readonly', async () => {
    const wrapper = mountTags({ readonly: true })
    await typeAndKey(wrapper, 'nope', 'Enter')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('does not render closable chips when disabled', () => {
    const wrapper = mountTags({ value: ['a'], disabled: true })
    expect(wrapper.find('[data-dz-tag] button').exists()).toBe(false)
  })
})

describe('dzTagsInput — emits', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('forwards focus and blur events', async () => {
    const wrapper = mountTags()
    const input = field(wrapper)
    await input.trigger('focus')
    await input.trigger('blur')
    expect(wrapper.emitted('focus')).toBeTruthy()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('flashes danger then clears when a token is rejected', async () => {
    vi.useFakeTimers()
    const wrapper = mountTags({ value: ['dup'] })
    await typeAndKey(wrapper, 'dup', 'Enter')
    // Field carries the flash outline immediately after rejection.
    expect(wrapper.find('[role="group"]').classes().some(c => c.includes('outline-2'))).toBe(true)
    vi.advanceTimersByTime(700)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="group"]').classes().some(c => c.includes('outline-2'))).toBe(false)
    vi.useRealTimers()
  })
})
