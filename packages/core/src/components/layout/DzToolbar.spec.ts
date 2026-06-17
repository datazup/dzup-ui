import { mount } from '@vue/test-utils'
/**
 * DzToolbar -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzToolbar from './DzToolbar.vue'

describe('dzToolbar -- Unit Tests', () => {
  // -- Slot placement --

  it('places start, center, and end slots in DOM order', () => {
    const wrapper = mount(DzToolbar, {
      slots: {
        start: '<span data-testid="start">S</span>',
        center: '<span data-testid="center">C</span>',
        end: '<span data-testid="end">E</span>',
      },
    })
    const regions = wrapper.findAll('[data-toolbar-region]')
    expect(regions.map(r => r.attributes('data-toolbar-region'))).toEqual([
      'start',
      'center',
      'end',
    ])
  })

  it('uses the default slot as the start region', () => {
    const wrapper = mount(DzToolbar, {
      slots: { default: '<span data-testid="dflt">Default</span>' },
    })
    const start = wrapper.find('[data-toolbar-region="start"]')
    expect(start.find('[data-testid="dflt"]').exists()).toBe(true)
  })

  it('renders a spacer instead of a center region when center slot is absent', () => {
    const wrapper = mount(DzToolbar, {
      slots: {
        start: '<button>A</button>',
        end: '<button>B</button>',
      },
    })
    expect(wrapper.find('[data-toolbar-region="center"]').exists()).toBe(false)
    expect(wrapper.find('[data-toolbar-region="spacer"]').exists()).toBe(true)
  })

  it('omits the end region when end slot is absent', () => {
    const wrapper = mount(DzToolbar, {
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.find('[data-toolbar-region="end"]').exists()).toBe(false)
  })

  it('grows the center region to absorb free space', () => {
    const wrapper = mount(DzToolbar, {
      slots: { center: '<span>Title</span>' },
    })
    const center = wrapper.find('[data-toolbar-region="center"]')
    expect(center.classes()).toContain('flex-1')
  })

  // -- Variants --

  it('applies border for outlined variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'outlined' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('border')
  })

  it('applies shadow for elevated variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'elevated' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('shadow-[var(--dz-toolbar-shadow)]')
  })

  it('adds no surface decoration for flat variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'flat' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('border')
    expect(wrapper.classes()).not.toContain('shadow-[var(--dz-toolbar-shadow)]')
  })

  // -- Wrap --

  it('applies flex-wrap when wrap=true', () => {
    const wrapper = mount(DzToolbar, {
      props: { wrap: true },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('flex-wrap')
  })

  it('does not apply flex-wrap when wrap=false', () => {
    const wrapper = mount(DzToolbar, {
      props: { wrap: false },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('flex-wrap')
  })

  // -- Sticky --

  it('applies sticky class when sticky=true', () => {
    const wrapper = mount(DzToolbar, {
      props: { sticky: true },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('sticky')
  })

  it('does not apply sticky class when sticky=false', () => {
    const wrapper = mount(DzToolbar, {
      props: { sticky: false },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('sticky')
  })

  // -- Element --

  it('renders as <nav> when as="nav"', () => {
    const wrapper = mount(DzToolbar, {
      props: { as: 'nav' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.element.tagName).toBe('NAV')
  })
})
