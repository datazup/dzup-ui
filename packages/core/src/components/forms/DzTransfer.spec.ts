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

  it('owns every option with two labelled multiselect listboxes', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a'] },
    })
    const listboxes = wrapper.findAll('[role="listbox"]')

    expect(listboxes).toHaveLength(2)
    expect(listboxes.map(listbox => listbox.attributes('aria-label'))).toEqual([
      'Source items',
      'Target items',
    ])
    for (const listbox of listboxes) {
      expect(listbox.attributes('aria-multiselectable')).toBe('true')
      for (const option of listbox.findAll('[role="option"]'))
        expect(option.element.parentElement).toBe(listbox.element)
    }
  })

  it('places required semantics on the target listbox, not the group wrapper', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, required: true },
    })
    const [sourceList, targetList] = wrapper.findAll('[role="listbox"]')

    expect(wrapper.get('[role="group"]').attributes('aria-required')).toBeUndefined()
    expect(sourceList!.attributes('aria-required')).toBeUndefined()
    expect(targetList!.attributes('aria-required')).toBe('true')
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
    expect(options.length).toBeGreaterThan(0)
    expect(options[0]!.find('input, button, select, textarea, a[href]').exists()).toBe(false)
    expect(options[0]!.find('[data-transfer-check]').exists()).toBe(true)

    await options[0]!.trigger('click')
    expect(options[0]!.attributes('aria-selected')).toBe('true')
    expect(options[0]!.find('[data-transfer-check]').attributes('data-checked')).toBe('true')
  })

  it('toggles options with Enter and Space', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const [first, second] = wrapper.findAll('[role="option"]')

    await first!.trigger('keydown', { key: 'Enter' })
    await second!.trigger('keydown', { key: ' ' })

    expect(first!.attributes('aria-selected')).toBe('true')
    expect(second!.attributes('aria-selected')).toBe('true')
  })

  it('prevents pointer and keyboard selection while disabled', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, disabled: true },
    })
    const option = wrapper.find('[role="option"]')

    expect(option.attributes('aria-disabled')).toBe('true')
    expect(option.attributes('tabindex')).toBe('-1')
    await option.trigger('click')
    await option.trigger('keydown', { key: 'Enter' })
    expect(option.attributes('aria-selected')).toBe('false')
  })

  it('marks both lists with data-dz-transfer-list (invalid border hook)', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.findAll('[data-dz-transfer-list]').length).toBe(2)
  })

  it('applies the danger border target selector when invalid', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, invalid: true },
    })
    // data-invalid flag + the descendant selector that colors the list borders.
    const group = wrapper.find('[data-invalid]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('class')).toContain('[&_[data-dz-transfer-list]]:border-[var(--dz-danger)]')
  })

  it('links the error message to the group via aria-describedby', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, error: 'Selection required' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find('[role="group"]').attributes('aria-describedby')).toContain(errorId)
  })
})
