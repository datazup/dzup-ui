import { mount } from '@vue/test-utils'
/**
 * DzAspectRatio — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzAspectRatio from './DzAspectRatio.vue'

describe('dzAspectRatio — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzAspectRatio, { slots: { default: 'content' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('sets aspect-ratio: 1 by default', () => {
    const wrapper = mount(DzAspectRatio, { slots: { default: 'content' } })
    expect(wrapper.attributes('style')).toContain('aspect-ratio: 1')
  })

  it('applies custom aspect ratio', () => {
    const wrapper = mount(DzAspectRatio, {
      props: { ratio: 16 / 9 },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('style')).toContain('aspect-ratio')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAspectRatio, {
      attrs: { class: 'my-class' },
      slots: { default: 'content' },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzAspectRatio, {
      attrs: { 'data-testid': 'ar' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-testid')).toBe('ar')
  })

  it('renders slot content', () => {
    const wrapper = mount(DzAspectRatio, {
      slots: { default: '<img alt="test" />' },
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzAspectRatio, {
      props: { id: 'ar-1' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('id')).toBe('ar-1')
  })
})
