import { mount } from '@vue/test-utils'
/**
 * DzImageComparison — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzImageComparison from './DzImageComparison.vue'

describe('dzImageComparison — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzImageComparison)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts both orientation values', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const wrapper = mount(DzImageComparison, { props: { orientation } })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.attributes('data-orientation')).toBe(orientation)
    }
  })

  it('exposes a slider role with aria value bounds', () => {
    const wrapper = mount(DzImageComparison, { props: { position: 40 } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.exists()).toBe(true)
    expect(slider.attributes('aria-valuemin')).toBe('0')
    expect(slider.attributes('aria-valuemax')).toBe('100')
    expect(slider.attributes('aria-valuenow')).toBe('40')
  })

  it('renders before and after images from convenience props with alt text', () => {
    const wrapper = mount(DzImageComparison, {
      props: {
        beforeSrc: '/raw.jpg',
        afterSrc: '/edited.jpg',
        beforeAlt: 'Original',
        afterAlt: 'Edited',
      },
    })
    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(2)
    const [before, after] = imgs
    expect(before!.attributes('src')).toBe('/raw.jpg')
    expect(before!.attributes('alt')).toBe('Original')
    expect(after!.attributes('src')).toBe('/edited.jpg')
    expect(after!.attributes('alt')).toBe('Edited')
  })

  it('renders before and after slots', () => {
    const wrapper = mount(DzImageComparison, {
      slots: {
        before: '<div data-testid="before">B</div>',
        after: '<div data-testid="after">A</div>',
      },
    })
    expect(wrapper.find('[data-testid="before"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="after"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImageComparison, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
