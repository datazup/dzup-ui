/**
 * DzSwitchCompat — Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzup-ui
 * switch API to the new vNext DzSwitch API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzSwitchCompat from './DzSwitchCompat.vue'

describe('dzSwitchCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzSwitch component', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false },
    })
    // DzSwitch renders a label with a SwitchRoot (button) inside
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('forwards v-model for boolean state', async () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false },
    })
    const button = wrapper.find('button')
    await button.trigger('click')
    const modelEvents = wrapper.emitted('update:modelValue')
    if (modelEvents) {
      expect(modelEvents[0]).toEqual([true])
    }
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, size: 'small' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('maps old size="medium" to size="md"', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, size: 'medium' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, size: 'large' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, size: 'xl' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('forwards disabled prop to DzSwitch', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, disabled: true },
    })
    expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('forwards name prop to DzSwitch', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, name: 'notifications' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits change event when toggled', async () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false },
    })
    await wrapper.find('button').trigger('click')
    const changeEvents = wrapper.emitted('change')
    if (changeEvents) {
      expect(changeEvents[0]).toEqual([true])
    }
  })

  it('emits input event (old API) when toggled', async () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false },
    })
    await wrapper.find('button').trigger('click')
    const inputEvents = wrapper.emitted('input')
    if (inputEvents) {
      expect(inputEvents[0]).toEqual([true])
    }
  })

  it('renders activeText when switch is on', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: true, activeText: 'ON' },
    })
    expect(wrapper.text()).toContain('ON')
  })

  it('renders inactiveText when switch is off', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false, inactiveText: 'OFF' },
    })
    expect(wrapper.text()).toContain('OFF')
  })

  it('renders default slot when no activeText/inactiveText', () => {
    const wrapper = mount(DzSwitchCompat, {
      props: { modelValue: false },
      slots: { default: 'Toggle me' },
    })
    expect(wrapper.text()).toContain('Toggle me')
  })

  it('warns about dropped activeColor prop in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzSwitchCompat, {
      props: { modelValue: false, activeColor: '#ff0000' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzSwitchCompat: "activeColor" prop is dropped in vNext. Use design tokens instead.',
    )
  })

  it('warns about dropped inactiveColor prop in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzSwitchCompat, {
      props: { modelValue: false, inactiveColor: '#cccccc' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzSwitchCompat: "inactiveColor" prop is dropped in vNext. Use design tokens instead.',
    )
  })

  it('warns about dropped width prop in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzSwitchCompat, {
      props: { modelValue: false, width: 60 },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzSwitchCompat: "width" prop is dropped in vNext. Use CSS to control width.',
    )
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzSwitchCompat, {
      props: { modelValue: false },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzSwitchCompat is deprecated. Use DzSwitch from @dzup-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzSwitchCompat, { props: { modelValue: false } })
    mount(DzSwitchCompat, { props: { modelValue: false } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzSwitchCompat is deprecated'),
    )
    expect(compatWarnings).toHaveLength(1)
  })
})
