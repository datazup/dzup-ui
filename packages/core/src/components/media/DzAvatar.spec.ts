import { mount } from '@vue/test-utils'
/**
 * DzAvatar — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzAvatar from './DzAvatar.vue'

describe('dzAvatar — Unit Tests', () => {
  it('renders a <span> with role="img"', () => {
    const wrapper = mount(DzAvatar, { props: { fallback: 'JD' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('role')).toBe('img')
  })

  it('renders image when src is provided', () => {
    const wrapper = mount(DzAvatar, { props: { src: '/test.jpg', alt: 'Test' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/test.jpg')
    expect(img.attributes('alt')).toBe('Test')
  })

  it('shows fallback text when no src', () => {
    const wrapper = mount(DzAvatar, { props: { fallback: 'AB' } })
    expect(wrapper.text()).toBe('AB')
    expect(wrapper.attributes('data-state')).toBe('fallback')
  })

  it('shows custom slot content as fallback', () => {
    const wrapper = mount(DzAvatar, {
      slots: { default: '<svg data-testid="icon"></svg>' },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAvatar, {
      attrs: { class: 'my-class' },
      props: { fallback: 'X' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('applies circle shape by default', () => {
    const wrapper = mount(DzAvatar, { props: { fallback: 'X' } })
    expect(wrapper.classes().join(' ')).toContain('rounded-full')
  })

  it('applies square shape when specified', () => {
    const wrapper = mount(DzAvatar, {
      props: { fallback: 'X', shape: 'square' },
    })
    expect(wrapper.classes().join(' ')).not.toContain('rounded-full')
  })

  it('sets aria-label when provided', () => {
    const wrapper = mount(DzAvatar, {
      props: { fallback: 'X', ariaLabel: 'User avatar' },
    })
    expect(wrapper.attributes('aria-label')).toBe('User avatar')
  })

  it('sets data-state to image when src is present', () => {
    const wrapper = mount(DzAvatar, { props: { src: '/test.jpg' } })
    expect(wrapper.attributes('data-state')).toBe('image')
  })
})
