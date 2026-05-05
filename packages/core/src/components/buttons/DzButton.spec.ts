import { mount } from '@vue/test-utils'
/**
 * DzButton — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzButton from './DzButton.vue'
import DzButtonGroup from './DzButtonGroup.vue'

describe('dzButton — Unit Tests', () => {
  it('renders a <button> element by default', () => {
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

  // ── Polymorphic rendering (as / href / to) ──

  it('renders as <a> when href is provided', () => {
    const wrapper = mount(DzButton, {
      props: { href: 'https://example.com' },
      slots: { default: 'Link' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com')
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('button')
  })

  it('renders as <a> when as="a" is set explicitly', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'a', href: '#about' },
      slots: { default: 'About' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#about')
  })

  it('renders with custom component via as prop', () => {
    const CustomTag = defineComponent({
      name: 'CustomTag',
      setup(_, { slots }) {
        return () => h('span', { class: 'custom-rendered' }, slots.default?.())
      },
    })
    const wrapper = mount(DzButton, {
      props: { as: CustomTag },
      slots: { default: 'Custom' },
    })
    expect(wrapper.find('.custom-rendered').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom')
  })

  it('renders as <a> when to is provided and RouterLink is unavailable', () => {
    const wrapper = mount(DzButton, {
      props: { to: '/home' },
      slots: { default: 'Home' },
    })
    // Without a router, falls back to <a>
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('role')).toBe('button')
  })

  it('disabled <a> gets aria-disabled and no href', () => {
    const wrapper = mount(DzButton, {
      props: { href: 'https://example.com', disabled: true },
      slots: { default: 'Disabled Link' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('disabled <a> prevents click emission', async () => {
    const wrapper = mount(DzButton, {
      props: { href: 'https://example.com', disabled: true },
      slots: { default: 'Disabled Link' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('non-button element gets role="button" and tabindex="0"', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'div' },
      slots: { default: 'Div Button' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('all variants work with <a> element', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
    for (const variant of variants) {
      const wrapper = mount(DzButton, {
        props: { variant, href: '#test' },
        slots: { default: 'btn' },
      })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('all sizes work with <a> element', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzButton, {
        props: { size, href: '#test' },
        slots: { default: 'btn' },
      })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('all tones work with <a> element', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzButton, {
        props: { tone, href: '#test' },
        slots: { default: 'btn' },
      })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('click event fires for <a> element', async () => {
    const wrapper = mount(DzButton, {
      props: { href: '#test' },
      slots: { default: 'Link' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')![0]![0]).toBeInstanceOf(MouseEvent)
  })

  it('click event fires for custom as element', async () => {
    const wrapper = mount(DzButton, {
      props: { as: 'div' },
      slots: { default: 'Div' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('as prop takes priority over href for tag resolution', () => {
    const wrapper = mount(DzButton, {
      props: { as: 'span', href: '#test' },
      slots: { default: 'Span' },
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('loading state works with <a> element', () => {
    const wrapper = mount(DzButton, {
      props: { href: '#test', loading: true },
      slots: { default: 'Loading' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
