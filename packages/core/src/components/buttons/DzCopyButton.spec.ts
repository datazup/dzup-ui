import { mount } from '@vue/test-utils'
/**
 * DzCopyButton — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzCopyButton from './DzCopyButton.vue'

// Mock the Clipboard API
const writeTextMock = vi.fn().mockResolvedValue(undefined)
Object.assign(navigator, {
  clipboard: { writeText: writeTextMock },
})

describe('dzCopyButton', () => {
  // ── Rendering ──

  it('renders a <button> element', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders with type="button"', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('renders copy icon by default', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    // Copy icon has a <rect> element
    expect(svg.find('rect').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test' },
      attrs: { class: 'my-custom' },
    })
    expect(wrapper.classes()).toContain('my-custom')
  })

  // ── Props ──

  it('renders label text', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test', label: 'Copy code' },
    })
    expect(wrapper.text()).toContain('Copy code')
  })

  it('disables the button when disabled prop is set', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test', disabled: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test', disabled: true },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when not disabled', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  // ── Copy behavior ──

  it('calls clipboard API on click', async () => {
    writeTextMock.mockClear()
    const wrapper = mount(DzCopyButton, { props: { value: 'hello world' } })
    await wrapper.trigger('click')
    expect(writeTextMock).toHaveBeenCalledWith('hello world')
  })

  it('emits copied event on successful copy', async () => {
    writeTextMock.mockClear()
    const wrapper = mount(DzCopyButton, { props: { value: 'test-value' } })
    await wrapper.trigger('click')
    // Allow microtask (clipboard API is async)
    await vi.dynamicImportSettled()
    expect(wrapper.emitted('copied')).toBeTruthy()
    expect(wrapper.emitted('copied')![0]).toEqual(['test-value'])
  })

  it('does NOT copy when disabled', async () => {
    writeTextMock.mockClear()
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test', disabled: true },
    })
    await wrapper.trigger('click')
    expect(writeTextMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('copied')).toBeUndefined()
  })

  // ── Accessibility ──

  it('has default aria-label "Copy to clipboard"', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    expect(wrapper.attributes('aria-label')).toBe('Copy to clipboard')
  })

  it('uses custom aria-label when provided', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test', ariaLabel: 'Copy API key' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Copy API key')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCopyButton, { props: { value: 'test' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Slots ──

  it('renders custom icon slot', () => {
    const wrapper = mount(DzCopyButton, {
      props: { value: 'test' },
      slots: {
        icon: '<span data-testid="custom-icon">ICON</span>',
      },
    })
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
  })
})
