import { mount } from '@vue/test-utils'
/**
 * DzWatermark — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzWatermark from './DzWatermark.vue'

describe('dzWatermark — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'CONFIDENTIAL' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders slotted content', () => {
    const wrapper = mount(DzWatermark, {
      props: { content: 'CONFIDENTIAL' },
      slots: { default: '<p data-testid="doc">Secret document</p>' },
    })
    expect(wrapper.find('[data-testid="doc"]').exists()).toBe(true)
  })

  it('renders an aria-hidden overlay so screen readers skip it', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'mark' } })
    const overlay = wrapper.find('[aria-hidden="true"]')
    expect(overlay.exists()).toBe(true)
  })

  it('makes the overlay non-interactive (pointer-events: none)', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'mark' } })
    const overlay = wrapper.find('[aria-hidden="true"]')
    expect(overlay.classes()).toContain('pointer-events-none')
  })

  it('scopes the design tokens via the dz-watermark class', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'mark' } })
    expect(wrapper.classes()).toContain('dz-watermark')
  })

  it('forwards extra HTML attributes to the root', () => {
    const wrapper = mount(DzWatermark, {
      props: { content: 'mark' },
      attrs: { 'data-testid': 'wm' },
    })
    expect(wrapper.attributes('data-testid')).toBe('wm')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzWatermark, { props: { content: 'mark', id: 'wm-1' } })
    expect(wrapper.attributes('id')).toBe('wm-1')
  })

  it('accepts string and string[] content without error', () => {
    const single = mount(DzWatermark, { props: { content: 'one' } })
    const multi = mount(DzWatermark, { props: { content: ['one', 'two'] } })
    expect(single.exists()).toBe(true)
    expect(multi.exists()).toBe(true)
  })
})
