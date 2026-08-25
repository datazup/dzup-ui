import { mount } from '@vue/test-utils'
/**
 * DzSearchInput — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzSearchInput from './DzSearchInput.vue'

describe('dzSearchInput — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSearchInput, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})

describe('dzSearchInput — renderer contract C3 states', () => {
  it('reflects readonly as a presence-only data-readonly', () => {
    const wrapper = mount(DzSearchInput, { props: { readonly: true } })
    expect(wrapper.attributes('data-readonly')).toBe('')
  })

  it('omits data-readonly entirely when not readonly — never ="false"', () => {
    const wrapper = mount(DzSearchInput, { props: {} })
    expect(wrapper.attributes('data-readonly')).toBeUndefined()
  })
})
