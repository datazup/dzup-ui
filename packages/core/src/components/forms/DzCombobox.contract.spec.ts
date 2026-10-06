import { mount } from '@vue/test-utils'
/**
 * DzCombobox — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzCombobox from './DzCombobox.vue'

const items = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
]

describe('dzCombobox — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCombobox, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCombobox, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCombobox, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // DZUP-UI-R9-01-20261006-R1: the declared `#item` slot and the listbox ARIA.
  it('item slot renders each option with its index and selection', async () => {
    const wrapper = mount(DzCombobox, {
      props: { items, modelValue: 'react', defaultOpen: true, portalDisabled: true },
      slots: {
        item: ({ item, index, selected }: { item: { label: string }, index: number, selected: boolean }) =>
          h('span', { class: 'custom-item' }, `${index}:${item.label}:${selected}`),
      },
      attachTo: document.body,
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.findAll('.custom-item').map(node => node.text())).toEqual(['0:Vue:false', '1:React:true'])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(items.length)
    wrapper.unmount()
  })

  it('names the input from the aria-label prop', () => {
    const wrapper = mount(DzCombobox, { props: { items, ariaLabel: 'Framework' } })
    expect(wrapper.get('input').attributes('aria-label')).toBe('Framework')
  })
})
