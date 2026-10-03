import { mount } from '@vue/test-utils'
/**
 * DzTransfer — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTransfer from './DzTransfer.vue'

const source = [
  { key: '1', label: 'Item A' },
  { key: '2', label: 'Item B' },
]

describe('dzTransfer — Contract Spec v1', () => {
  it('renders consumer headers and item slot payloads and emits the transferred partition', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source, ariaLabel: 'Assign items', required: true },
      slots: {
        'source-header': () => h('strong', 'Available'),
        'target-header': () => h('strong', 'Assigned'),
        'item': ({ item, selected }) => h('span', `${item.label}:${selected}`),
      },
    })
    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Assign items')
    expect(wrapper.findAll('[role="listbox"]')[1]!.attributes('aria-required')).toBe('true')
    expect(wrapper.text()).toContain('Available')
    expect(wrapper.text()).toContain('Assigned')
    const first = wrapper.findAll('[role="option"]')[0]!
    expect(first.text()).toBe('Item A:false')
    await first.trigger('click')
    expect(first.text()).toBe('Item A:true')
    expect(first.attributes('aria-selected')).toBe('true')
    await wrapper.get('[aria-label="Move selected to target"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['1']]])
    expect(wrapper.emitted('change')).toEqual([[{ source: ['2'], target: ['1'] }]])
    wrapper.unmount()
  })

  it('renders without errors', () => {
    const wrapper = mount(DzTransfer, { props: { source } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTransfer, { props: { source, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTransfer, {
      props: { source },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
