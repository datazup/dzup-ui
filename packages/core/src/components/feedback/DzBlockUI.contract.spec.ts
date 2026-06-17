import { mount } from '@vue/test-utils'
/**
 * DzBlockUI — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (v-model, props, data attributes, ARIA, slots)
 * conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzBlockUI from './DzBlockUI.vue'

const OVERLAY = '[data-testid="dz-block-ui-overlay"]'

describe('dzBlockUI — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzBlockUI)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzBlockUI, {
      slots: { default: () => h('p', { class: 'panel' }, 'Body') },
    })
    expect(wrapper.find('.panel').text()).toBe('Body')
  })

  // ── v-model:blocked ──

  it('is unblocked by default (no overlay)', () => {
    const wrapper = mount(DzBlockUI)
    expect(wrapper.find(OVERLAY).exists()).toBe(false)
  })

  it('shows the overlay when blocked', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    expect(wrapper.find(OVERLAY).exists()).toBe(true)
  })

  // ── Data attributes ──

  it('sets data-blocked when blocked', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    expect(wrapper.attributes('data-blocked')).toBe('')
  })

  it('omits data-blocked when not blocked', () => {
    const wrapper = mount(DzBlockUI)
    expect(wrapper.attributes('data-blocked')).toBeUndefined()
  })

  it('sets data-full-screen when fullScreen', () => {
    const wrapper = mount(DzBlockUI, { props: { fullScreen: true } })
    expect(wrapper.attributes('data-full-screen')).toBe('')
  })

  // ── ARIA ──

  it('sets aria-busy when blocked', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('omits aria-busy when not blocked', () => {
    const wrapper = mount(DzBlockUI)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('forwards ariaLabel to the region', () => {
    const wrapper = mount(DzBlockUI, { props: { ariaLabel: 'Saving region' } })
    expect(wrapper.attributes('aria-label')).toBe('Saving region')
  })

  // ── Canonical tones (default spinner) ──

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzBlockUI, { props: { blocked: true, tone } })
      expect(wrapper.find(OVERLAY).find('[data-tone]').attributes('data-tone')).toBe(tone)
    }
  })

  // ── Canonical sizes (default spinner) ──

  it('accepts all canonical spinnerSize values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const spinnerSize of sizes) {
      const wrapper = mount(DzBlockUI, { props: { blocked: true, spinnerSize } })
      expect(wrapper.find(OVERLAY).exists()).toBe(true)
    }
  })

  // ── Slots ──

  it('renders the custom overlay slot in place of the default spinner', () => {
    const wrapper = mount(DzBlockUI, {
      props: { blocked: true },
      slots: { overlay: () => h('div', { class: 'custom-mask' }, 'Working') },
    })
    expect(wrapper.find('.custom-mask').exists()).toBe(true)
    // Default spinner (role="status") is not rendered
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  // ── Class merging ──

  it('merges consumer class via cn() on the root', () => {
    const wrapper = mount(DzBlockUI, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
    expect(wrapper.classes()).toContain('dz-block-ui')
  })
})
