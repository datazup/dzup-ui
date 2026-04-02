import { mount } from '@vue/test-utils'
/**
 * DzTable — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTable from './DzTable.vue'

describe('dzTable — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTable, {
        props: { size },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts variant values', () => {
    const variants = ['default', 'bordered', 'striped'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTable, {
        props: { variant },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts density values', () => {
    const densities = ['compact', 'default', 'comfortable'] as const
    for (const density of densities) {
      const wrapper = mount(DzTable, {
        props: { density },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzTable, {
      props: { ariaLabel: 'Users' },
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.html()).toContain('Users')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell data</td></tr>' },
    })
    expect(wrapper.text()).toContain('Cell data')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTable, {
      attrs: { class: 'custom-class' },
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
