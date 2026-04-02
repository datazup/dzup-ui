import { mount } from '@vue/test-utils'
/**
 * DzPasswordInput — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzPasswordInput from './DzPasswordInput.vue'

describe('dzPasswordInput — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzPasswordInput, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
