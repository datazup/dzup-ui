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

describe('dzPasswordInput — renderer contract C3 states', () => {
  it('reflects readonly as a presence-only data-readonly', () => {
    const wrapper = mount(DzPasswordInput, { props: { readonly: true } })
    expect(wrapper.attributes('data-readonly')).toBe('')
  })

  it('omits data-readonly entirely when not readonly — never ="false"', () => {
    const wrapper = mount(DzPasswordInput, { props: {} })
    expect(wrapper.attributes('data-readonly')).toBeUndefined()
  })
})
