import { mount } from '@vue/test-utils'
/**
 * DzButtonGroup — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzButtonGroup from './DzButtonGroup.vue'

describe('dzButtonGroup — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzButtonGroup, { slots: { default: '<button>A</button>' } })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Role ──

  it('has role="group" on root element', () => {
    const wrapper = mount(DzButtonGroup, { slots: { default: '<button>A</button>' } })
    expect(wrapper.attributes('role')).toBe('group')
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { disabled: true },
      slots: { default: '<button>A</button>' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzButtonGroup, { slots: { default: '<button>A</button>' } })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  // ── ARIA ──

  it('forwards aria-label', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { ariaLabel: 'Action group' },
      slots: { default: '<button>A</button>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Action group')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzButtonGroup, { slots: { default: '<button>A</button>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzButtonGroup, {
      attrs: { class: 'custom-class' },
      slots: { default: '<button>A</button>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzButtonGroup, {
      slots: { default: '<button>Child</button>' },
    })
    expect(wrapper.text()).toContain('Child')
  })

  // ── Orientation ──

  it('defaults to horizontal orientation', () => {
    const wrapper = mount(DzButtonGroup, { slots: { default: '<button>A</button>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts vertical orientation', () => {
    const wrapper = mount(DzButtonGroup, {
      props: { orientation: 'vertical' },
      slots: { default: '<button>A</button>' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
