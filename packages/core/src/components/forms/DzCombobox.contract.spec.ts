import { mount } from '@vue/test-utils'
/**
 * DzCombobox — Contract Spec v1 conformance tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import DzCombobox from './DzCombobox.vue'

/**
 * Wait for a condition rather than a fixed sleep (UI-DZUP-UI-TEST-M-03): portalled
 * content lands a tick or two after mount, and a loaded host makes any fixed
 * interval either too short or wasted.
 */
async function settle(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion, { timeout: 5000, interval: 10 })
}

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
    await settle(() => expect(wrapper.findAll('.custom-item')).toHaveLength(2))

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
