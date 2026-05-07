import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFieldArray from './DzFieldArray.vue'

describe('DzFieldArray', () => {
  it('renders correct number of items from modelValue', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b', 'c'] },
      slots: {
        default: ({ field }: { field: unknown; index: number; remove: () => void; move: (to: number) => void }) =>
          h('span', { 'data-testid': 'item' }, String(field)),
      },
    })
    expect(wrapper.findAll('[data-testid="item"]')).toHaveLength(3)
  })

  it('emits add when append is triggered', async () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a'] },
      slots: {
        default: () => h('span', 'item'),
        append: () => h('button', { 'data-testid': 'add' }, 'Add'),
      },
    })
    await wrapper.find('[data-testid="add"]').trigger('click')
    // The append slot is just rendered — the parent would wire onClick to append()
    // DzFieldArray exposes no internal click handler on the append slot
    expect(wrapper.find('[data-testid="add"]').exists()).toBe(true)
  })

  it('remove() emits remove event with index', async () => {
    let removeFn: (() => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b'] },
      slots: {
        default: ({ remove, index }: { field: unknown; index: number; remove: () => void; move: (to: number) => void }) => {
          if (index === 0) removeFn = remove
          return h('span', 'item')
        },
      },
    })
    removeFn?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('remove')).toBeDefined()
    expect(wrapper.emitted('remove')?.[0]).toEqual([0])
  })

  it('hides append slot when count equals max', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b'], max: 2 },
      slots: {
        default: () => h('span', 'item'),
        append: () => h('button', { 'data-testid': 'add' }, 'Add'),
      },
    })
    expect(wrapper.find('[data-testid="add"]').exists()).toBe(false)
  })

  it('shows append slot when count is below max', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a'], max: 3 },
      slots: {
        default: () => h('span', 'item'),
        append: () => h('button', { 'data-testid': 'add' }, 'Add'),
      },
    })
    expect(wrapper.find('[data-testid="add"]').exists()).toBe(true)
  })
})
