import { mount } from '@vue/test-utils'
/**
 * DzTimeline + DzTimelineItem — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTimeline from './DzTimeline.vue'
import DzTimelineItem from './DzTimelineItem.vue'

describe('dzTimeline', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('has role="list"', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.attributes('role')).toBe('list')
  })

  it('has default aria-label "Timeline"', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.attributes('aria-label')).toBe('Timeline')
  })

  it('forwards custom aria-label', () => {
    const wrapper = mount(DzTimeline, {
      props: { ariaLabel: 'Project history' },
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.attributes('aria-label')).toBe('Project history')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTimeline, {
      attrs: { class: 'my-timeline' },
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.classes()).toContain('my-timeline')
  })

  it('has contain: layout style', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event 1' }),
      },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})

describe('dzTimelineItem', () => {
  it('renders content within DzTimeline', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Created project' }),
      },
    })
    expect(wrapper.text()).toContain('Created project')
  })

  it('has role="listitem"', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, null, { default: () => 'Event' }),
      },
    })
    const item = wrapper.findComponent(DzTimelineItem)
    expect(item.attributes('role')).toBe('listitem')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () => h(DzTimelineItem, { tone: 'success' }, { default: () => 'Done' }),
      },
    })
    const item = wrapper.findComponent(DzTimelineItem)
    expect(item.attributes('data-tone')).toBe('success')
  })

  it('renders status text', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () =>
          h(DzTimelineItem, { status: '2 hours ago' }, { default: () => 'Event' }),
      },
    })
    expect(wrapper.text()).toContain('2 hours ago')
  })

  it('renders custom indicator slot', () => {
    const wrapper = mount(DzTimeline, {
      slots: {
        default: () =>
          h(DzTimelineItem, null, {
            default: () => 'Event',
            indicator: () => h('span', { 'data-testid': 'custom-indicator' }, 'X'),
          }),
      },
    })
    expect(wrapper.find('[data-testid="custom-indicator"]').exists()).toBe(true)
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzTimeline, {
        slots: {
          default: () => h(DzTimelineItem, { tone }, { default: () => 'Event' }),
        },
      })
      const item = wrapper.findComponent(DzTimelineItem)
      expect(item.attributes('data-tone')).toBe(tone)
    }
  })
})
