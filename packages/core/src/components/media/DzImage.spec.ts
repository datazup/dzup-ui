import { mount } from '@vue/test-utils'
/**
 * DzImage — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzImage from './DzImage.vue'

describe('dzImage — Unit Tests', () => {
  it('renders a <div> root with <img> child', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test image' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('sets src and alt on the image', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test image' },
    })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/test.jpg')
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('sets loading="lazy" when lazy prop is true', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test', lazy: true },
    })
    expect(wrapper.find('img').attributes('loading')).toBe('lazy')
  })

  it('does not set loading attribute when lazy is false', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test', lazy: false },
    })
    expect(wrapper.find('img').attributes('loading')).toBeUndefined()
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImage, {
      attrs: { class: 'my-class' },
      props: { src: '/test.jpg', alt: 'Test' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzImage, {
      attrs: { 'data-testid': 'img' },
      props: { src: '/test.jpg', alt: 'Test' },
    })
    expect(wrapper.attributes('data-testid')).toBe('img')
  })

  it('applies aspect-ratio style when provided', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test', aspectRatio: '16/9' },
    })
    expect(wrapper.attributes('style')).toContain('aspect-ratio: 16/9')
  })

  it('starts in loading state', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test' },
    })
    expect(wrapper.attributes('data-state')).toBe('loading')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzImage, {
      props: { src: '/test.jpg', alt: 'Test', id: 'img-1' },
    })
    expect(wrapper.attributes('id')).toBe('img-1')
  })
})
