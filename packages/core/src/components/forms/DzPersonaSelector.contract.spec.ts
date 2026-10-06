import type { LoadOptionsRequest } from '@dzup-ui/contracts'
import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzPersonaSelector — Contract Spec v1 conformance tests.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DzCombobox from './DzCombobox.vue'
import DzPersonaSelector from './DzPersonaSelector.vue'

const personas = [
  { id: '1', name: 'Alice Smith', role: 'Engineer' },
  { id: '2', name: 'Bob Jones', role: 'Designer', avatarUrl: 'https://example.com/bob.jpg' },
]

describe('dzPersonaSelector — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with empty personas list', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas: [] } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts placeholder prop', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas, placeholder: 'Choose persona' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas, disabled: true } })
    expect(wrapper.html()).toMatch(/disabled|data-disabled|aria-disabled/)
  })

  it('applies contain: layout style within the template', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas } })
    expect(wrapper.html()).toContain('[contain:layout_style]')
  })
})

// DZUP-UI-R8-01-20261006-R1: the declared `DzPersonaSelectorSlots` surface. The
// listbox is portalled, so the open popup is read from `document.body`.
describe('dzPersonaSelector — Contract Spec v1 slots', () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = () => {}
  })
  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView
  })
  enableAutoUnmount(afterEach)

  it('renders each persona through the #item slot with its selection state', async () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas, modelValue: '2' },
      slots: {
        item: `<template #item="{ persona, selected }"><span class="custom-persona">{{ persona.name }}:{{ selected }}</span></template>`,
      },
      attachTo: document.body,
    })
    await wrapper.find('input').trigger('click')
    await nextTick()
    const rendered = Array.from(document.body.querySelectorAll('.custom-persona'))
      .map(node => node.textContent?.trim())
    expect(rendered).toEqual(['Alice Smith:false', 'Bob Jones:true'])
  })

  it('replaces the no-match state through the #empty slot', async () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas: [] },
      slots: { empty: '<span class="custom-empty">Nobody to pick</span>' },
      attachTo: document.body,
    })
    await wrapper.find('input').trigger('click')
    await nextTick()
    expect(document.body.querySelector('.custom-empty')?.textContent).toBe('Nobody to pick')
    expect(document.body.textContent).not.toContain('No personas found')
  })
})

/**
 * Renderer contract C9 — a typed pass-through (TASK-R3-O3).
 *
 * The readiness matrix recorded C9 as `future`: the `DzCombobox` this control
 * renders had the seam, but this control declared none of it, so a form
 * renderer could only reach it through untyped `$attrs`.
 */
describe('dzPersonaSelector — renderer contract C9 async options', () => {
  it('forwards optionsState, optionsError and optionsRetryable to the combobox it renders', () => {
    const wrapper = mount(DzPersonaSelector, {
      props: { personas: [], optionsState: 'error', optionsError: 'Directory offline', optionsRetryable: false },
    })
    const combobox = wrapper.findComponent(DzCombobox)
    expect(combobox.props('optionsState')).toBe('error')
    expect(combobox.props('optionsError')).toBe('Directory offline')
    expect(combobox.props('optionsRetryable')).toBe(false)
  })

  it('leaves optionsRetryable undefined when absent, so the combobox keeps its default retry', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas: [], optionsState: 'loading' } })
    expect(wrapper.findComponent(DzCombobox).props('optionsRetryable')).toBeUndefined()
  })

  it('re-emits the combobox request unchanged, signal included', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas: [], optionsState: 'idle' } })
    // The combobox asks on mount when driven and empty (useAsyncOptions).
    const forwarded = wrapper.emitted('loadOptions')
    const original = wrapper.findComponent(DzCombobox).emitted('loadOptions')
    expect(forwarded).toHaveLength(1)
    expect((forwarded![0]![0] as LoadOptionsRequest).signal).toBe((original![0]![0] as LoadOptionsRequest).signal)
    expect(forwarded![0]![0]).toMatchObject({ reason: 'open', query: '' })
  })

  it('re-emits retry-options', async () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas: [], optionsState: 'error' } })
    wrapper.findComponent(DzCombobox).vm.$emit('retryOptions')
    expect(wrapper.emitted('retryOptions')).toHaveLength(1)
  })

  it('asks nobody when the personas are static', () => {
    const wrapper = mount(DzPersonaSelector, { props: { personas } })
    expect(wrapper.emitted('loadOptions')).toBeUndefined()
  })
})
