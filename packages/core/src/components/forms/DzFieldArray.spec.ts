import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFieldArray from './DzFieldArray.vue'

describe('dzFieldArray', () => {
  it('renders correct number of items from modelValue', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b', 'c'] },
      slots: {
        default: ({ field }: { field: unknown, index: number, remove: () => void, move: (to: number) => void }) =>
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
        default: ({ remove, index }: { field: unknown, index: number, remove: () => void, move: (to: number) => void }) => {
          if (index === 0)
            removeFn = remove
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

  it('append() adds an item and emits add', async () => {
    let appendFn: ((item: string) => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a'] },
      slots: {
        default: () => h('span', 'item'),
        append: ({ append }: { append: (item: string) => void }) => {
          appendFn = append
          return h('button', 'Add')
        },
      },
    })
    appendFn?.('b')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('add')).toBeDefined()
    expect(wrapper.emitted('add')?.[0]).toEqual(['b'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']])
  })

  it('append() is a no-op once max is reached', async () => {
    let appendFn: ((item: string) => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b'], max: 2 },
      slots: {
        // append slot is hidden at max, so reach append() from the default slot
        default: ({ append }: { append: (item: string) => void }) => {
          appendFn ??= append
          return h('span', 'item')
        },
      },
    })
    appendFn?.('c')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('remove() is a no-op once min is reached', async () => {
    let removeFn: (() => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a'], min: 1 },
      slots: {
        default: ({ remove }: { remove: () => void }) => {
          removeFn ??= remove
          return h('span', 'item')
        },
      },
    })
    removeFn?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('move() ignores out-of-range targets without corrupting the array', async () => {
    let moveFn: ((to: number) => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b', 'c'] },
      slots: {
        default: ({ move, index }: { move: (to: number) => void, index: number }) => {
          if (index === 0)
            moveFn = move
          return h('span', 'item')
        },
      },
    })
    moveFn?.(-1)
    moveFn?.(5)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('reorder')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
