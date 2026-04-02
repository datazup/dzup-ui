import { mount } from '@vue/test-utils'
/**
 * DzSplitButton — Contract Spec v1 conformance tests.
 *
 * Verifies that the compound split button's public API (props, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzSplitButton from './DzSplitButton.vue'

describe('dzSplitButton — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Role ──

  it('has role="group" on root element', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('role')).toBe('group')
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzSplitButton, {
      props: { disabled: true },
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('sets data-loading when loading=true', () => {
    const wrapper = mount(DzSplitButton, {
      props: { loading: true },
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  // ── ARIA ──

  it('forwards aria-label', () => {
    const wrapper = mount(DzSplitButton, {
      props: { ariaLabel: 'Save options' },
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Save options')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSplitButton, {
      attrs: { class: 'custom-class' },
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // ── Canonical sizes ──

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSplitButton, {
        props: { size },
        slots: { default: '<button>Save</button>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Canonical variants ──

  it('accepts all canonical variant values', () => {
    const variants = ['solid', 'outline', 'ghost', 'text', 'link'] as const
    for (const variant of variants) {
      const wrapper = mount(DzSplitButton, {
        props: { variant },
        slots: { default: '<button>Save</button>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Canonical tones ──

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzSplitButton, {
        props: { tone },
        slots: { default: '<button>Save</button>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Slots ──

  it('renders default slot content', () => {
    const wrapper = mount(DzSplitButton, {
      slots: { default: '<button>Save</button>' },
    })
    expect(wrapper.text()).toContain('Save')
  })
})
