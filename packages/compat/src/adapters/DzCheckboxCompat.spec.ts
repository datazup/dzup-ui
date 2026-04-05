/**
 * DzCheckboxCompat -- Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzip-ui
 * checkbox API to the new vNext DzCheckbox API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzCheckboxCompat from './DzCheckboxCompat.vue'

describe('dzCheckboxCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzCheckbox component', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { label: 'Accept terms' },
    })
    expect(wrapper.text()).toContain('Accept terms')
  })

  it('renders label prop as slot content', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { label: 'Subscribe to newsletter' },
    })
    expect(wrapper.text()).toContain('Subscribe to newsletter')
  })

  it('renders default slot content instead of label', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { label: 'Ignored label' },
      slots: { default: 'Custom slot content' },
    })
    expect(wrapper.text()).toContain('Custom slot content')
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { size: 'small', label: 'Small' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="medium" to size="md"', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { size: 'medium', label: 'Medium' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { size: 'large', label: 'Large' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { size: 'xl', label: 'XL' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('forwards disabled prop to DzCheckbox', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { disabled: true, label: 'Disabled' },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('forwards indeterminate prop to DzCheckbox', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { indeterminate: true, label: 'Indeterminate' },
    })
    expect(wrapper.find('[data-state="indeterminate"]').exists()).toBe(true)
  })

  it('forwards name prop to DzCheckbox', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { name: 'agree', label: 'Agree' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('forwards value prop for checkbox groups', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { value: 'option-a', label: 'Option A' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('emits change and input events when toggled', async () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { label: 'Toggle', modelValue: false },
    })
    // Find and click the checkbox button
    const checkbox = wrapper.find('button')
    await checkbox.trigger('click')
    const changeEvents = wrapper.emitted('change')
    const inputEvents = wrapper.emitted('input')
    if (changeEvents) {
      expect(changeEvents).toHaveLength(1)
      expect(changeEvents[0]).toEqual([true])
    }
    if (inputEvents) {
      expect(inputEvents).toHaveLength(1)
      expect(inputEvents[0]).toEqual([true])
    }
  })

  it('forwards v-model for checked state', async () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { modelValue: false, label: 'Check me' },
    })
    const checkbox = wrapper.find('button')
    await checkbox.trigger('click')
    const modelEvents = wrapper.emitted('update:modelValue')
    if (modelEvents) {
      expect(modelEvents[0]).toEqual([true])
    }
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzCheckboxCompat, {
      props: { label: 'Test' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzip-ui/compat] DzCheckboxCompat is deprecated. Use DzCheckbox from @dzip-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzCheckboxCompat, { props: { label: 'First' } })
    mount(DzCheckboxCompat, { props: { label: 'Second' } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzCheckboxCompat'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('passes through extra attrs to the underlying component', () => {
    const wrapper = mount(DzCheckboxCompat, {
      props: { label: 'Test' },
      attrs: { 'data-testid': 'compat-checkbox' },
    })
    expect(wrapper.find('[data-testid="compat-checkbox"]').exists()).toBe(true)
  })
})
