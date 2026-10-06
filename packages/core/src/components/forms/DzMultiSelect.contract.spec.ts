import { mount } from '@vue/test-utils'
/**
 * DzMultiSelect — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzMultiSelect from './DzMultiSelect.vue'

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('dzMultiSelect — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzMultiSelect, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMultiSelect, { props: { items, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })

  // DZUP-UI-R9-01-20261006-R1: the declared `#tag` slot and the control's ARIA.
  it('tag slot renders each selected value with its label and a working remove', async () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, modelValue: ['a', 'b'] },
      slots: {
        tag: ({ value, label, remove }: { value: string, label: string, remove: () => void }) =>
          h('button', { class: 'custom-tag', type: 'button', onClick: remove }, `${value}:${label}`),
      },
    })
    const tags = wrapper.findAll('.custom-tag')
    expect(tags.map(tag => tag.text())).toEqual(['a:Alpha', 'b:Beta'])
    expect(wrapper.find('[aria-label="Remove Alpha"]').exists()).toBe(false)
    await tags[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b']])
  })

  it('names the default remove buttons and the input', () => {
    const wrapper = mount(DzMultiSelect, {
      props: { items, modelValue: ['a'], ariaLabel: 'Tags' },
    })
    expect(wrapper.find('[aria-label="Remove Alpha"]').exists()).toBe(true)
    expect(wrapper.get('input').attributes('aria-label')).toBe('Tags')
  })
})
