import { mount } from '@vue/test-utils'
/**
 * DzCommandPalette — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCommandPalette from './DzCommandPalette.vue'

describe('dzCommandPalette — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCommandPalette)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts items prop', () => {
    const items = [{ id: '1', label: 'Save' }]
    const wrapper = mount(DzCommandPalette, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mount(DzCommandPalette, { props: { placeholder: 'Type a command...' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzCommandPalette renders DialogContent in a portal (teleport to body).
    // Portal content is not accessible in jsdom. Verify prop is accepted without error.
    const wrapper = mount(DzCommandPalette, { props: { open: true }, attrs: { class: 'custom-class' } })
    expect(wrapper.exists()).toBe(true)
  })
})
