import { mount } from '@vue/test-utils'
/**
 * DzIconButton — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzIconButton from './DzIconButton.vue'

/** Minimal icon component stub */
const IconStub = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })

describe('dzIconButton — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Canonical sizes ──

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzIconButton, {
        props: { icon: IconStub, ariaLabel: 'Add', size },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Canonical variants ──

  it('accepts all canonical variant values', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
    for (const variant of variants) {
      const wrapper = mount(DzIconButton, {
        props: { icon: IconStub, ariaLabel: 'Add', variant },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Canonical tones ──

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzIconButton, {
        props: { icon: IconStub, ariaLabel: 'Add', tone },
      })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', tone: 'danger' },
    })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-loading when loading=true', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', loading: true },
    })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', disabled: true },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── ARIA ──

  it('sets aria-label (required for icon-only buttons)', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Delete item' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Delete item')
  })

  it('sets aria-disabled when disabled', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', disabled: true },
    })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', loading: true },
    })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  // ── Events ──

  it('emits click on button click', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does NOT emit click when disabled', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', disabled: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does NOT emit click when loading', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', loading: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // ── Loading spinner ──

  it('shows spinner SVG when loading', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add', loading: true },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  // ── HTML type attribute ──

  it('defaults to type="button"', () => {
    const wrapper = mount(DzIconButton, {
      props: { icon: IconStub, ariaLabel: 'Add' },
    })
    expect(wrapper.attributes('type')).toBe('button')
  })
})
