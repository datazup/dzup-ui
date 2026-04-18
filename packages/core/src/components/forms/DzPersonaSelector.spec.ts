/**
 * DzPersonaSelector — Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzPersonaSelector from './DzPersonaSelector.vue'
import type { Persona } from './DzPersonaSelector.types.ts'

const personas: Persona[] = [
  { id: 'arch', name: 'Ada Lovelace', role: 'Architect' },
  { id: 'dev', name: 'Grace Hopper', role: 'Developer', avatarUrl: 'https://example.com/grace.png' },
  { id: 'qa', name: 'Linus Torvalds', role: 'QA Lead' },
]

describe('dzPersonaSelector — Unit Tests', () => {
  it('renders a searchable combobox', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '' },
    })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('passes the placeholder through to the combobox', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '', placeholder: 'Pick one…' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Pick one…')
  })

  it('marks the root with data-component', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '' },
    })
    expect(wrapper.html()).toContain('data-component="DzPersonaSelector"')
  })

  it('emits update:modelValue with the persona id on selection', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '' },
    })
    const inner = wrapper.findComponent({ name: 'DzCombobox' })
    inner.vm.$emit('update:modelValue', 'dev')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]).toEqual(['dev'])
  })

  it('emits change with the full persona object', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '' },
    })
    const inner = wrapper.findComponent({ name: 'DzCombobox' })
    inner.vm.$emit('update:modelValue', 'qa')
    const emitted = wrapper.emitted('change')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toEqual(personas[2])
  })

  it('emits change with undefined when id is not in personas', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '' },
    })
    const inner = wrapper.findComponent({ name: 'DzCombobox' })
    inner.vm.$emit('update:modelValue', 'unknown-id')
    const emitted = wrapper.emitted('change')
    expect(emitted?.[0]?.[0]).toBeUndefined()
  })

  it('disabled prop propagates', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '', disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })
})
