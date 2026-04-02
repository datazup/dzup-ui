import { mount } from '@vue/test-utils'
/**
 * DzImageCard — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzImageCard from './DzImageCard.vue'

describe('dzImageCard — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders an image with correct src and alt', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'My photo' },
    })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(img.attributes('alt')).toBe('My photo')
  })

  it('renders body content from default slot', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
      slots: { default: '<p>Description</p>' },
    })
    expect(wrapper.find('p').text()).toBe('Description')
  })

  it('renders header slot', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
      slots: { header: '<h3>Title</h3>' },
    })
    expect(wrapper.find('h3').text()).toBe('Title')
  })

  it('renders footer slot', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
      slots: { footer: '<button>Action</button>' },
    })
    expect(wrapper.find('button').text()).toBe('Action')
  })

  it('renders overlay slot', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
      slots: { overlay: '<div data-testid="overlay">Badge</div>' },
    })
    expect(wrapper.find('[data-testid="overlay"]').exists()).toBe(true)
  })

  it('applies elevated variant by default', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo' },
    })
    expect(wrapper.classes().join(' ')).toContain('shadow')
  })

  it('applies outlined variant', () => {
    const wrapper = mount(DzImageCard, {
      props: { src: '/photo.jpg', alt: 'Photo', variant: 'outlined' },
    })
    expect(wrapper.classes().join(' ')).toContain('border')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzImageCard, {
      attrs: { class: 'my-class' },
      props: { src: '/photo.jpg', alt: 'Photo' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })
})
