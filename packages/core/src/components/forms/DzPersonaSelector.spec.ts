import type { Persona } from './DzPersonaSelector.types.ts'
/**
 * DzPersonaSelector — Unit / behavior tests.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy as personaAnatomy } from './DzPersonaSelector.anatomy.ts'
import DzPersonaSelector from './DzPersonaSelector.vue'

const personas: Persona[] = [
  { id: 'arch', name: 'Ada Lovelace', role: 'Architect' },
  { id: 'dev', name: 'Grace Hopper', role: 'Developer', avatarUrl: 'https://example.com/grace.png' },
  { id: 'qa', name: 'Linus Torvalds', role: 'QA Lead' },
]

describe('dzPersonaSelector — controlled and uncontrolled value ownership', () => {
  it.each([false, true])('persona selection, controlled=%s', async (controlled) => {
    const wrapper = mount(DzPersonaSelector, { attachTo: document.body, props: { personas, modelValue: 'arch', ...(controlled ? { 'onUpdate:modelValue': () => {} } : {}) } })
    await wrapper.get('input').trigger('click')
    await flushPromises()
    const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(node => node.textContent?.includes('Grace Hopper'))!
    expect(option).toBeDefined()
    option.click()
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['dev'])
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe(controlled ? 'Ada Lovelace' : 'Grace Hopper')
    await wrapper.setProps({ modelValue: 'qa' })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Linus Torvalds')
    wrapper.unmount()
  })
})

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

// DZUP-UI-R11-05B-20261006-C1: compare the declared listbox action with the real editable wrapper.
describe('dzPersonaSelector — declared option activation', () => {
  it.fails('selects the active persona using the second declared activation key', async () => {
    const original = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = () => {}
    const wrapper = mount(DzPersonaSelector, { attachTo: document.body, props: { personas }, attrs: { portalDisabled: true } })
    try {
      const input = wrapper.get('input')
      await input.trigger('keydown', { key: 'ArrowDown' })
      await flushPromises()
      await new Promise(resolve => setTimeout(resolve, 30))
      expect(input.attributes('aria-activedescendant')).toBeTruthy()
      const key = personaAnatomy.keyboard.filter(binding => binding.action === 'Select the focused option.')[1]!.key
      await input.trigger('keydown', { key })
      await flushPromises()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['arch'])
    }
    finally {
      wrapper.unmount()
      HTMLElement.prototype.scrollIntoView = original
    }
  })
})
