import type { DzFieldArraySlotProps } from './DzFieldArray.types.ts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFieldArray from './DzFieldArray.vue'

describe('dzFieldArray — Contract Spec v1', () => {
  it('default slot receives field, index, remove, move', () => {
    let capturedProps: DzFieldArraySlotProps | undefined
    mount(DzFieldArray, {
      props: { modelValue: ['x'] },
      slots: {
        default: (slotProps: DzFieldArraySlotProps) => {
          capturedProps = slotProps
          return h('span', 'item')
        },
      },
    })
    expect(capturedProps).toBeDefined()
    expect(capturedProps!.field as unknown).toBe('x')
    expect(capturedProps!.index).toBe(0)
    expect(typeof capturedProps!.remove).toBe('function')
    expect(typeof capturedProps!.move).toBe('function')
  })

  it('append slot renders when count < max', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: [], max: 5 },
      slots: {
        append: () => h('span', { 'data-testid': 'append' }, '+'),
      },
    })
    expect(wrapper.find('[data-testid="append"]').exists()).toBe(true)
  })

  it('append slot hidden when count >= max', () => {
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b', 'c'], max: 3 },
      slots: {
        append: () => h('span', { 'data-testid': 'append' }, '+'),
      },
    })
    expect(wrapper.find('[data-testid="append"]').exists()).toBe(false)
  })

  it('emits remove event when remove() is called', async () => {
    let removeFn: (() => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b'] },
      slots: {
        default: ({ remove }: { field: unknown, index: number, remove: () => void, move: (to: number) => void }) => {
          removeFn ??= remove
          return h('span', 'item')
        },
      },
    })
    removeFn?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('remove')).toBeDefined()
  })

  it('emits reorder event when move() is called', async () => {
    let moveFn: ((to: number) => void) | undefined
    const wrapper = mount(DzFieldArray, {
      props: { modelValue: ['a', 'b', 'c'] },
      slots: {
        default: ({ move, index }: { field: unknown, index: number, remove: () => void, move: (to: number) => void }) => {
          if (index === 0)
            moveFn = move
          return h('span', 'item')
        },
      },
    })
    moveFn?.(2)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('reorder')).toBeDefined()
    expect(wrapper.emitted('reorder')?.[0]).toEqual([0, 2])
  })
})
