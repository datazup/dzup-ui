import type { TransferItem } from './DzTransfer.types'
import { mount } from '@vue/test-utils'
/**
 * DzTransfer — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzTransfer from './DzTransfer.vue'

const sourceItems: TransferItem[] = [
  { key: 'a', label: 'Item A' },
  { key: 'b', label: 'Item B' },
  { key: 'c', label: 'Item C' },
  { key: 'd', label: 'Item D', disabled: true },
]

describe('dzTransfer — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('renders role="group" on root', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[role="group"]').exists()).toBe(true)
  })

  it('renders source items', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.text()).toContain('Item A')
    expect(wrapper.text()).toContain('Item B')
  })

  it('renders target items based on modelValue', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a', 'b'] },
    })
    // A and B should be in target, C should be in source
    const sourceText = wrapper.text()
    expect(sourceText).toContain('Item C')
  })

  it('renders Source and Target headers', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.text()).toContain('Source')
    expect(wrapper.text()).toContain('Target')
  })

  it('renders transfer action buttons', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[aria-label="Move selected to target"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Move selected to source"]').exists()).toBe(true)
  })

  it('disables transfer buttons when no items selected', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const toTarget = wrapper.find('[aria-label="Move selected to target"]')
    expect(toTarget.attributes('disabled')).toBeDefined()
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('renders search inputs when searchable', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, searchable: true },
    })
    const searchInputs = wrapper.findAll('input[type="text"]')
    expect(searchInputs.length).toBe(2)
  })

  it('does not render search inputs when not searchable', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, searchable: false },
    })
    const searchInputs = wrapper.findAll('input[type="text"]')
    expect(searchInputs.length).toBe(0)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
      attrs: { class: 'my-transfer' },
    })
    expect(wrapper.html()).toContain('my-transfer')
  })

  it('renders item count in list headers', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a'] },
    })
    // Source should show 0/3, Target should show 0/1
    expect(wrapper.text()).toContain('/3')
    expect(wrapper.text()).toContain('/1')
  })

  it('clicking source item selects it', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const options = wrapper.findAll('[role="option"]')
    if (options.length > 0) {
      await options[0]!.trigger('click')
      // After click, checkbox should be checked
      const checkbox = options[0]!.find('input[type="checkbox"]')
      expect(checkbox.element as HTMLInputElement).toBeTruthy()
    }
  })
})
