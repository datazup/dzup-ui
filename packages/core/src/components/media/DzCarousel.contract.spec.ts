import { mount } from '@vue/test-utils'
/**
 * DzCarousel — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCarousel from './DzCarousel.vue'

describe('dzCarousel — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCarousel, { slots: { default: '<div>Slide</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCarousel, { slots: { default: '<div>Slide</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCarousel, { props: { size }, slots: { default: '<div>Slide</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts orientation values', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const wrapper = mount(DzCarousel, { props: { orientation }, slots: { default: '<div>Slide</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzCarousel, {
      props: { ariaLabel: 'Image gallery' },
      slots: { default: '<div>Slide</div>' },
    })
    expect(wrapper.html()).toContain('Image gallery')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCarousel, {
      slots: { default: '<div data-testid="slide">Slide Content</div>' },
    })
    expect(wrapper.find('[data-testid="slide"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCarousel, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Slide</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
