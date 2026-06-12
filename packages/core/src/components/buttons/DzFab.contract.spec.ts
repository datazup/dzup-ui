import { mount } from '@vue/test-utils'
/**
 * DzFab — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (props, events, data attributes, ARIA) conforms to
 * the canonical contract shared by the button family.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzFab from './DzFab.vue'

/** Minimal icon component stub */
const IconStub = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })

describe('dzFab — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Canonical sizes ──

  it('accepts all canonical size values and reflects data-size', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', size } })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  // ── Variants (FAB subset) ──

  it('accepts the FAB variant values', () => {
    const variants = ['solid', 'outline', 'ghost'] as const
    for (const variant of variants) {
      const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Canonical tones ──

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', tone } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', tone: 'danger' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-loading when loading=true', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', loading: true } })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── ARIA ──

  it('sets aria-label (required for icon-only buttons)', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Ask AI' } })
    expect(wrapper.attributes('aria-label')).toBe('Ask AI')
  })

  it('sets aria-disabled when disabled', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', disabled: true } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  // ── Events ──

  it('emits click on button click', async () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does NOT emit click when disabled', async () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does NOT emit click when loading', async () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', loading: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFab, {
      props: { icon: IconStub, ariaLabel: 'Compose' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // ── HTML type attribute ──

  it('defaults to type="button"', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    expect(wrapper.attributes('type')).toBe('button')
  })
})
