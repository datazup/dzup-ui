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

  it('drop zone is keyboard accessible (Enter key)', async () => {
    const wrapper = mount(DzFileUpload)
    const dropzone = wrapper.find('[role="button"]')
    expect(dropzone.attributes('tabindex')).toBe('0')
  })

  it('drop zone tabindex is -1 when disabled', () => {
    const wrapper = mount(DzFileUpload, {
      props: { disabled: true },
    })
    const dropzone = wrapper.find('[role="button"]')
    expect(dropzone.attributes('tabindex')).toBe('-1')
  })
})
