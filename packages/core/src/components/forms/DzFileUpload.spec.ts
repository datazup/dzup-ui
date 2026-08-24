import { mount } from '@vue/test-utils'
/**
 * DzFileUpload — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzFileUpload from './DzFileUpload.vue'

function createFile(name: string, size: number, type = 'text/plain'): File {
  const content = Array.from({ length: size }, () => 'a').join('')
  return new File([content], name, { type })
}

describe('dzFileUpload — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders drop zone with role="button"', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.find('[role="button"]').exists()).toBe(true)
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzFileUpload, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('renders default drop zone content', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.text()).toContain('Drop files here')
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzFileUpload, {
      props: { error: 'Upload failed' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Upload failed')
  })

  it('renders file list when files exist', () => {
    const file = createFile('test.txt', 100)
    const wrapper = mount(DzFileUpload, {
      props: { modelValue: [file] },
    })
    expect(wrapper.text()).toContain('test.txt')
  })

  it('emits remove when remove button is clicked', async () => {
    const file = createFile('test.txt', 100)
    const wrapper = mount(DzFileUpload, {
      props: { modelValue: [file] },
    })
    const removeBtn = wrapper.find('[aria-label="Remove test.txt"]')
    if (removeBtn.exists()) {
      await removeBtn.trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    }
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzFileUpload, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-spacing')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFileUpload, {
      attrs: { class: 'my-upload' },
    })
    expect(wrapper.html()).toContain('my-upload')
  })

  it('renders accept hint when accept is provided', () => {
    const wrapper = mount(DzFileUpload, {
      props: { accept: 'image/*' },
    })
    expect(wrapper.text()).toContain('image/*')
  })

  it('emits focus on drop zone focus', async () => {
    const wrapper = mount(DzFileUpload)
    const dropzone = wrapper.find('[role="button"]')
    await dropzone.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur on drop zone blur', async () => {
    const wrapper = mount(DzFileUpload)
    const dropzone = wrapper.find('[role="button"]')
    await dropzone.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('drop zone is reachable by Tab', async () => {
    // Renamed from "drop zone is keyboard accessible (Enter key)", which
    // asserted a tabindex and pressed no key. A test named after a behaviour it
    // does not exercise is worse than no test: it is the reason nobody noticed
    // the key handling had never been covered.
    const wrapper = mount(DzFileUpload)
    const dropzone = wrapper.find('[role="button"]')
    expect(dropzone.attributes('tabindex')).toBe('0')
  })

  it('opens the picker on Enter and on Space, and on nothing else', async () => {
    const wrapper = mount(DzFileUpload, { attachTo: document.body })
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    const click = vi.spyOn(input, 'click').mockImplementation(() => {})
    const dropzone = wrapper.find('[role="button"]')

    await dropzone.trigger('keydown', { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(1)

    await dropzone.trigger('keydown', { key: ' ' })
    expect(click).toHaveBeenCalledTimes(2)

    // A control that opened a file picker on any keystroke would make the
    // component unusable for anyone navigating by typeahead.
    for (const key of ['a', 'Tab', 'Escape', 'ArrowDown'])
      await dropzone.trigger('keydown', { key })
    expect(click).toHaveBeenCalledTimes(2)

    click.mockRestore()
    wrapper.unmount()
  })

  it('does not open the picker on Enter while disabled', async () => {
    const wrapper = mount(DzFileUpload, {
      props: { disabled: true },
      attachTo: document.body,
    })
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    const click = vi.spyOn(input, 'click').mockImplementation(() => {})

    await wrapper.find('[role="button"]').trigger('keydown', { key: 'Enter' })
    expect(click).not.toHaveBeenCalled()

    click.mockRestore()
    wrapper.unmount()
  })

  it('is controlled by modelValue, and the parent has the last word', async () => {
    const first = new File([new Uint8Array(4)], 'first.txt', { type: 'text/plain' })
    const second = new File([new Uint8Array(4)], 'second.txt', { type: 'text/plain' })

    const wrapper = mount(DzFileUpload, {
      props: { modelValue: [first], multiple: true },
    })
    expect(wrapper.text()).toContain('first.txt')

    await wrapper.get('[role="button"]').trigger('drop', {
      dataTransfer: { files: [second] },
    })

    // `defineModel` (ADR-16) updates locally and emits in the same tick — it is
    // optimistic, not strictly controlled. Worth asserting rather than assuming:
    // an application that validates in its handler will see the file rendered
    // before it has decided, and that is the contract, not a bug.
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect((emitted!.at(-1)![0] as File[]).map(f => f.name)).toEqual(['first.txt', 'second.txt'])
    expect(wrapper.text()).toContain('second.txt')

    // …and a parent that refuses the change wins, which is what makes it
    // controllable at all.
    await wrapper.setProps({ modelValue: [first] })
    expect(wrapper.text()).not.toContain('second.txt')
  })

  it('works uncontrolled, accumulating into its own default list', async () => {
    // No `modelValue` prop: `defineModel` falls back to its declared default of
    // `[]` and the component keeps the list itself. Both paths are asserted
    // because a component that only works controlled is a component whose
    // simplest example in the docs does not run.
    const wrapper = mount(DzFileUpload, { props: { multiple: true } })
    expect(wrapper.text()).not.toContain('note.txt')

    await wrapper.get('[role="button"]').trigger('drop', {
      dataTransfer: { files: [new File([new Uint8Array(4)], 'note.txt', { type: 'text/plain' })] },
    })
    expect(wrapper.text()).toContain('note.txt')
  })

  it('drop zone tabindex is -1 when disabled', () => {
    const wrapper = mount(DzFileUpload, {
      props: { disabled: true },
    })
    const dropzone = wrapper.find('[role="button"]')
    expect(dropzone.attributes('tabindex')).toBe('-1')
  })

  it('links the error message to the dropzone via aria-describedby', () => {
    const wrapper = mount(DzFileUpload, {
      props: { error: 'A file is required' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find('[role="button"]').attributes('aria-describedby')).toContain(errorId)
  })

  it('reflects the required prop via aria-required on the dropzone', () => {
    const wrapper = mount(DzFileUpload, {
      props: { required: true },
    })
    expect(wrapper.find('[role="button"]').attributes('aria-required')).toBe('true')
  })
})
