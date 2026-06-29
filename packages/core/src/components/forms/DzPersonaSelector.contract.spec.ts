import { mount } from '@vue/test-utils'
/**
 * DzPersonaSelector — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzPersonaSelector from './DzPersonaSelector.vue'

const personas = [
  { id: '1', name: 'Alice Smith', role: 'Engineer' },
  { id: '2', name: 'Bob Jones', role: 'Designer', avatarUrl: 'https://example.com/bob.jpg' },
]

describe('dzPersonaSelector — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with empty personas list', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas: [] } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas, placeholder: 'Choose persona' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas, disabled: true } })
    expect(wrapper.html()).toMatch(/disabled|data-disabled|aria-disabled/)
  })

  it('applies contain: layout style within the template', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas } })
    expect(wrapper.html()).toContain('contain: layout style')
  })
})
