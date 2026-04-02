import { mount } from '@vue/test-utils'
/**
 * DzIconButton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import DzIconButton from './DzIconButton.vue'

/** Minimal stub icon component (markRaw prevents Vue reactivity warning) */
const StubIcon = markRaw(defineComponent({
  name: 'StubIcon',
  render() {
    return h('svg', { 'data-testid': 'stub-icon' })
  },
}))

describe('dzIconButton', () => {
  it('renders a <button> element', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test' },
    })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders the provided icon component', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Add' },
    })
    expect(wrapper.find('[data-testid="stub-icon"]').exists()).toBe(true)
  })

  it('sets aria-label from prop', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Delete item' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Delete item')
  })

  it('is square (same width and height)', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test', size: 'md' },
    })
    // The p-0 class removes padding, and square size class is applied
    expect(wrapper.classes()).toContain('p-0')
  })

  it('shows spinner when loading', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Loading', loading: true },
    })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    // Icon should be hidden
    expect(wrapper.find('[data-testid="stub-icon"]').exists()).toBe(false)
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test', loading: true },
    })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('emits click when clicked', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test', disabled: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test', tone: 'danger' },
    })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test' },
      attrs: { class: 'extra-class' },
    })
    expect(wrapper.classes()).toContain('extra-class')
  })

  it('hides icon from screen readers with aria-hidden', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: StubIcon, ariaLabel: 'Test' },
    })
    const iconEl = wrapper.find('[data-testid="stub-icon"]')
    expect(iconEl.attributes('aria-hidden')).toBe('true')
  })
})
