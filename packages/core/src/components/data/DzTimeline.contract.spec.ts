import { mount } from '@vue/test-utils'
/**
 * DzTimeline — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTimeline from './DzTimeline.vue'

describe('dzTimeline — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTimeline, { slots: { default: '<div>Event</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTimeline, { slots: { default: '<div>Event</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTimeline, {
        props: { size },
        slots: { default: '<div>Event</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts orientation values', () => {
    for (const orientation of ['vertical', 'horizontal'] as const) {
      const wrapper = mount(DzTimeline, {
        props: { orientation },
        slots: { default: '<div>Event</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzTimeline, {
      props: { ariaLabel: 'Activity timeline' },
      slots: { default: '<div>Event</div>' },
    })
    expect(wrapper.html()).toContain('Activity timeline')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzTimeline, {
      slots: { default: '<div>Timeline Event</div>' },
    })
    expect(wrapper.text()).toContain('Timeline Event')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTimeline, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Event</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
