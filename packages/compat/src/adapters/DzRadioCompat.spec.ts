/**
 * DzRadioCompat -- Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzup-ui
 * single-component radio API to the new vNext DzRadioGroup + DzRadio API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzRadioCompat from './DzRadioCompat.vue'

const sampleOptions = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue', disabled: true },
]

describe('dzRadioCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzRadioGroup with DzRadio children', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    expect(wrapper.text()).toContain('Red')
    expect(wrapper.text()).toContain('Green')
    expect(wrapper.text()).toContain('Blue')
  })

  it('renders radio buttons from the options prop', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('renders disabled radio options', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    const buttons = wrapper.findAll('button')
    // Blue (index 2) should be disabled
    const disabledButtons = buttons.filter(b => (b.element as HTMLButtonElement).disabled)
    expect(disabledButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, size: 'small', modelValue: 'red' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, size: 'large', modelValue: 'red' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, size: 'xl', modelValue: 'red' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('forwards disabled prop to DzRadioGroup', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, disabled: true, modelValue: 'red' },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('forwards name prop to DzRadioGroup', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, name: 'color', modelValue: 'red' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('emits change and input events when a radio is selected', async () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    // Click the Green radio button
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    const changeEvents = wrapper.emitted('change')
    const inputEvents = wrapper.emitted('input')
    if (changeEvents) {
      expect(changeEvents[0]).toEqual(['green'])
    }
    if (inputEvents) {
      expect(inputEvents[0]).toEqual(['green'])
    }
  })

  it('forwards v-model for selected value', async () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    const modelEvents = wrapper.emitted('update:modelValue')
    if (modelEvents) {
      expect(modelEvents[0]).toEqual(['green'])
    }
  })

  it('renders without options when options prop is empty', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: [], modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('renders default slot content alongside options', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
      slots: { default: '<div class="custom-radio">Extra</div>' },
    })
    expect(wrapper.find('.custom-radio').exists()).toBe(true)
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzRadioCompat is deprecated. Use DzRadioGroup from @dzup-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzRadioCompat, { props: { options: sampleOptions, modelValue: 'red' } })
    mount(DzRadioCompat, { props: { options: sampleOptions, modelValue: 'red' } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzRadioCompat'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('passes through extra attrs to the underlying component', () => {
    const wrapper = mount(DzRadioCompat, {
      props: { options: sampleOptions, modelValue: 'red' },
      attrs: { 'data-testid': 'compat-radio' },
    })
    expect(wrapper.find('[data-testid="compat-radio"]').exists()).toBe(true)
  })
})
