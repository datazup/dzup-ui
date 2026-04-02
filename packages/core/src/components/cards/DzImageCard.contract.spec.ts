import { mount } from '@vue/test-utils'
/**
 * DzImageCard — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzImageCard from './DzImageCard.vue'

describe('dzImageCard — Contract Spec v1', () => {
  const requiredProps = { src: '/test.jpg', alt: 'Test image' }

  it('renders without errors', () => {
    const wrapper = mount(DzImageCard, { props: requiredProps })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders image with src and alt', () => {
    const wrapper = mount(DzImageCard, { props: requiredProps })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('sets data-variant attribute', () => {
    const wrapper = mount(DzImageCard, { props: { ...requiredProps, variant: 'outlined' } })
    expect(wrapper.attributes('data-variant')).toBe('outlined')
  })

  it('defaults variant to elevated', () => {
    const wrapper = mount(DzImageCard, { props: requiredProps })
    expect(wrapper.attributes('data-variant')).toBe('elevated')
  })

  it('renders default slot content (body)', () => {
    const wrapper = mount(DzImageCard, {
      props: requiredProps,
      slots: { default: '<p>Card body</p>' },
    })
    expect(wrapper.text()).toContain('Card body')
  })

  it('renders header slot', () => {
    const wrapper = mount(DzImageCard, {
      props: requiredProps,
      slots: { header: '<span data-testid="header">Header</span>' },
    })
    expect(wrapper.find('[data-testid="header"]').exists()).toBe(true)
  })

  it('renders footer slot', () => {
    const wrapper = mount(DzImageCard, {
      props: requiredProps,
      slots: { footer: '<span data-testid="footer">Footer</span>' },
    })
    expect(wrapper.find('[data-testid="footer"]').exists()).toBe(true)
  })

  it('renders overlay slot', () => {
    const wrapper = mount(DzImageCard, {
      props: requiredProps,
      slots: { overlay: '<span data-testid="overlay">Overlay</span>' },
    })
    expect(wrapper.find('[data-testid="overlay"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImageCard, {
      props: requiredProps,
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
