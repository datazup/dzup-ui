import { mount } from '@vue/test-utils'
/**
 * DzScrollArea — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzScrollArea from './DzScrollArea.vue'

describe('dzScrollArea — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzScrollArea, { slots: { default: '<div>Scrollable</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts orientation values', () => {
    for (const orientation of ['vertical', 'horizontal', 'both'] as const) {
      const wrapper = mount(DzScrollArea, { props: { orientation }, slots: { default: '<div>Content</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts type values', () => {
    for (const type of ['auto', 'always', 'scroll', 'hover'] as const) {
      const wrapper = mount(DzScrollArea, { props: { type }, slots: { default: '<div>Content</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzScrollArea, {
      slots: { default: '<div data-testid="content">Scrollable</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzScrollArea, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
