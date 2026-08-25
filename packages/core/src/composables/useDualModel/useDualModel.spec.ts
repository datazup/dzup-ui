/**
 * useDualModel — unit tests.
 *
 * The composable is three lines and the failure it prevents is silent, so the
 * cases that matter are the ones where a consumer binds one model and not the
 * other.
 *
 * The fixtures use `useModel`, not `defineModel`. `defineModel` is a compiler
 * macro that only exists inside `<script setup>`; `useModel` is the runtime
 * function it compiles to, so a `defineComponent` fixture gets the same
 * `ModelRef` a real component gets — including the behaviour under test, which
 * is what an unbound model does.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, useModel } from 'vue'
import { useDualModel } from './useDualModel.ts'

const Control = defineComponent({
  name: 'Control',
  props: {
    value: { type: Array, default: () => [] },
    modelValue: { type: Array, default: undefined },
  },
  emits: ['update:value', 'update:modelValue'],
  setup(props) {
    const legacy = useModel(props, 'value') as unknown as import('vue').ModelRef<string[]>
    const primary = useModel(props, 'modelValue') as unknown as import('vue').ModelRef<string[] | undefined>
    const model = useDualModel(primary, legacy)
    return () =>
      h('button', { onClick: () => (model.value = [...model.value, 'x']) }, JSON.stringify(model.value))
  },
})

describe('useDualModel', () => {
  it('reads the legacy named model when only that one is bound', () => {
    const wrapper = mount(Control, { props: { value: ['a'] } })
    expect(wrapper.text()).toBe('["a"]')
  })

  it('reads the default model when only that one is bound', () => {
    const wrapper = mount(Control, { props: { modelValue: ['b'] } })
    expect(wrapper.text()).toBe('["b"]')
  })

  it('prefers the default model when a consumer binds both', () => {
    const wrapper = mount(Control, { props: { modelValue: ['new'], value: ['old'] } })
    expect(wrapper.text()).toBe('["new"]')
  })

  it('falls back to the default of the legacy model when neither is bound', () => {
    expect(mount(Control).text()).toBe('[]')
  })

  it('writes to both models on every change, so neither goes stale', async () => {
    const wrapper = mount(Control, { props: { value: ['a'] } })
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual(['a', 'x'])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['a', 'x'])
  })

  it('honours a custom isEmpty for a type where undefined is meaningful', () => {
    const Nullable = defineComponent({
      props: {
        value: { type: String as unknown as () => string | null, default: 'legacy' },
        modelValue: { type: String as unknown as () => string | null | undefined, default: undefined },
      },
      emits: ['update:value', 'update:modelValue'],
      setup(props) {
        const legacy = useModel(props, 'value') as unknown as import('vue').ModelRef<string | null>
        const primary = useModel(props, 'modelValue') as unknown as import('vue').ModelRef<string | null | undefined>
        // `null` here means "cleared", and must NOT fall through to legacy.
        const model = useDualModel(primary, legacy, v => v === undefined)
        return () => h('span', String(model.value))
      },
    })

    expect(mount(Nullable, { props: { modelValue: null } }).text()).toBe('null')
    expect(mount(Nullable, { props: { value: 'legacy' } }).text()).toBe('legacy')
  })
})
