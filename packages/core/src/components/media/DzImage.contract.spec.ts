import { mount } from '@vue/test-utils'
/**
 * DzImage — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzImage from './DzImage.vue'

describe('dzImage — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzImage, { props: { src: '/test.jpg', alt: 'Test' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders img with src and alt', () => {
    const wrapper = mount(DzImage, { props: { src: '/photo.jpg', alt: 'Photo' } })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(img.attributes('alt')).toBe('Photo')
  })

  it('accepts fit values', () => {
    for (const fit of ['cover', 'contain', 'fill', 'none'] as const) {
      const wrapper = mount(DzImage, { props: { src: '/x.jpg', alt: 'x', fit } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders loading slot', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/x.jpg', alt: 'x' },
      slots: { loading: '<div data-testid="loading">Loading...</div>' },
    })
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/x.jpg', alt: 'x' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
