import type { Persona } from './DzPersonaSelector.types.ts'
/**
 * DzPersonaSelector — Unit / behavior tests.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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
  // Known defect, pinned as asserted CURRENT behaviour (UI-DZUP-UI-TEST-M-07).
  // It was an `it.fails`, which passed on ANY throw — a renamed part, a missing
  // anatomy binding or a mount error all read as "defect still present". The
  // preconditions below fail loudly instead, and the last block states what
  // the editable input does today with the second declared activation key:
  // nothing. When the defect is repaired, flip that block to expect ['arch'].
  it('pins that the second declared activation key does not yet select the active persona', async () => {
    const activation = personaAnatomy.keyboard.filter(binding => binding.action === 'Select the focused option.')
    expect(activation).toHaveLength(2)
    const key = activation[1]!.key
    expect(key).toBe(' ')

    const original = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = () => {}
    const wrapper = mount(DzPersonaSelector, { attachTo: document.body, props: { personas }, attrs: { portalDisabled: true } })
    try {
      const input = wrapper.get('input[role="combobox"]')
      await input.trigger('keydown', { key: 'ArrowDown' })
      await flushPromises()
      await vi.waitFor(() => expect(input.attributes('aria-activedescendant')).toBeTruthy())
      const active = input.attributes('aria-activedescendant')!
      expect(document.getElementById(active)?.textContent).toContain('Ada Lovelace')

      await input.trigger('keydown', { key })
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(input.attributes('aria-expanded')).toBe('true')
      expect(input.attributes('aria-activedescendant')).toBe(active)
    }
    finally {
      wrapper.unmount()
      HTMLElement.prototype.scrollIntoView = original
    }
  })
})
