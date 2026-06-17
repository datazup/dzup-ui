import { mount } from '@vue/test-utils'
/**
 * DzBackTop — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (props, events, ARIA, appearance delegation) of the
 * scroll-to-top affordance.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzBackTop from './DzBackTop.vue'

describe('dzBackTop — Contract Spec v1', () => {
  // ── Renders ──

  it('renders a real button', () => {
    const wrapper = mount(DzBackTop)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('defaults to type="button"', () => {
    const wrapper = mount(DzBackTop)
    expect(wrapper.find('button').attributes('type')).toBe('button')
  })

  // ── ARIA ──

  it('renders a default accessible label of "Back to top"', () => {
    const wrapper = mount(DzBackTop)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Back to top')
  })

  it('accepts a custom accessible label', () => {
    const wrapper = mount(DzBackTop, { props: { ariaLabel: 'Scroll up' } })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Scroll up')
  })

  // ── Appearance delegation (DzFab) ──

  it('accepts all canonical size values and reflects data-size', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzBackTop, { props: { size } })
      expect(wrapper.find('button').attributes('data-size')).toBe(size)
    }
  })

  it('accepts all canonical tone values and reflects data-tone', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzBackTop, { props: { tone } })
      expect(wrapper.find('button').attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts the FAB variant values', () => {
    const variants = ['solid', 'outline', 'ghost'] as const
    for (const variant of variants) {
      const wrapper = mount(DzBackTop, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Events ──

  it('emits click on activation', async () => {
    const wrapper = mount(DzBackTop)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders a default up-arrow glyph', () => {
    const wrapper = mount(DzBackTop)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('lets the default slot override the icon', () => {
    const wrapper = mount(DzBackTop, {
      slots: { default: () => h('span', { 'data-testid': 'custom' }, 'x') },
    })
    expect(wrapper.find('[data-testid="custom"]').exists()).toBe(true)
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzBackTop, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
