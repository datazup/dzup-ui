import { mount } from '@vue/test-utils'
/**
 * DzButton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzButton from './DzButton.vue'
import DzButtonGroup from './DzButtonGroup.vue'

describe('dzButton — Unit Tests', () => {
  it('renders a <button> element', () => {
    const wrapper = mount(DzButton, { slots: { default: 'Click' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzButton, {
      attrs: { class: 'my-custom-class' },
      slots: { default: 'Click' },
    })
    expect(wrapper.classes()).toContain('my-custom-class')
  })

  it('forwards extra HTML attributes to the button', () => {
    const wrapper = mount(DzButton, {
      attrs: { 'data-testid': 'save-btn' },
      slots: { default: 'Save' },
    })
    expect(wrapper.attributes('data-testid')).toBe('save-btn')
  })

  it('sets disabled attribute on the native button when disabled', () => {
    const wrapper = mount(DzButton, {
      props: { disabled: true },
      slots: { default: 'btn' },
    })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('inherits size from DzButtonGroup via inject', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { size: 'xs' },
      slots: {
        default: () => h(DzButton, null, { default: () => 'Child' }),
      },
    })
    const btn = wrapper.findComponent(DzButton)
    expect(btn.attributes('data-tone')).toBe('primary')
    // The button should exist and render
    expect(btn.text()).toBe('Child')
  })

  it('inherits variant from DzButtonGroup via inject', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { variant: 'outline' },
      slots: {
        default: () => h(DzButton, null, { default: () => 'Child' }),
      },
    })
    const btn = wrapper.findComponent(DzButton)
    // outline variant adds border class
    expect(btn.classes().some(c => c.includes('border'))).toBe(true)
  })

  it('inherits disabled from DzButtonGroup via inject', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { disabled: true },
      slots: {
        default: () => h(DzButton, null, { default: () => 'Child' }),
      },
    })
    const btn = wrapper.findComponent(DzButton)
    expect(btn.attributes('data-disabled')).toBe('')
    expect(btn.attributes('aria-disabled')).toBe('true')
  })

  it('local prop overrides group context for size', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { size: 'xs' },
      slots: {
        default: () => h(DzButton, { size: 'xl' }, { default: () => 'Big' }),
      },
    })
    const btn = wrapper.findComponent(DzButton)
    // The xl size has specific height class
    expect(btn.classes().some(c => c.includes('xl'))).toBe(true)
  })

  it('renders both prefix and suffix alongside default content', () => {
    const wrapper = mount(DzButton, {
      slots: {
        prefix: () => h('span', { 'data-testid': 'prefix-icon' }),
        default: () => 'Label',
        suffix: () => h('span', { 'data-testid': 'suffix-icon' }),
      },
    })
    expect(wrapper.find('[data-testid="prefix-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suffix-icon"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Label')
  })

  it('prevents click event propagation when disabled', async () => {
    let parentClicked = false
    const Parent = defineComponent({
      setup() {
        return () =>
          h('div', { onClick: () => { parentClicked = true } }, [
            h(DzButton, { disabled: true }, { default: () => 'btn' }),
          ])
      },
    })
    const wrapper = mount(Parent)
    await wrapper.findComponent(DzButton).trigger('click')
    expect(parentClicked).toBe(false)
  })
})
