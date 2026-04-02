import { mount } from '@vue/test-utils'
/**
 * DzCaption — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCaption from './DzCaption.vue'

describe('dzCaption — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCaption, { slots: { default: 'Small text' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCaption, { slots: { default: 'Caption text here' } })
    expect(wrapper.text()).toContain('Caption text here')
  })

  it('accepts tone values', () => {
    const tones = ['default', 'muted', 'success', 'warning', 'danger'] as const
    for (const tone of tones) {
      const wrapper = mount(DzCaption, { props: { tone }, slots: { default: 'Text' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCaption, {
      attrs: { class: 'custom-class' },
      slots: { default: 'Text' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
