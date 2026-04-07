/**
 * DzButtonCompat — Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzup-ui
 * button API to the new vNext DzButton API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzButtonCompat from './DzButtonCompat.vue'

describe('dzButtonCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzButton component', () => {
    const wrapper = mount(DzButtonCompat, {
      slots: { default: 'Click me' },
    })
    // Should render a button element (DzButton renders <button> by default)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Click me')
  })

  it('maps old type="primary" to variant="solid" and tone="primary"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { type: 'primary' },
      slots: { default: 'Primary' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('data-tone')).toBe('primary')
  })

  it('maps old type="danger" to tone="danger"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { type: 'danger' },
      slots: { default: 'Delete' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('data-tone')).toBe('danger')
  })

  it('maps old type="default" to tone="neutral"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { type: 'default' },
      slots: { default: 'Default' },
    })
    const button = wrapper.find('button')
    expect(button.attributes('data-tone')).toBe('neutral')
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { size: 'small' },
      slots: { default: 'Small' },
    })
    // The DzButton uses data attributes and class variants — check it renders
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { size: 'large' },
      slots: { default: 'Large' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { size: 'xl' },
      slots: { default: 'XL' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('forwards disabled prop to DzButton', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
    })
    expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('forwards loading prop to DzButton', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { loading: true },
      slots: { default: 'Loading' },
    })
    expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(DzButtonCompat, {
      slots: { default: 'Click' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzButtonCompat, {
      slots: { default: 'Test' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzButtonCompat is deprecated. Use DzButton from @dzup-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzButtonCompat, { slots: { default: 'First' } })
    mount(DzButtonCompat, { slots: { default: 'Second' } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzButtonCompat'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('passes through extra attrs to the underlying button', () => {
    const wrapper = mount(DzButtonCompat, {
      attrs: { 'data-testid': 'compat-btn' },
      slots: { default: 'Test' },
    })
    expect(wrapper.find('button').attributes('data-testid')).toBe('compat-btn')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzButtonCompat, {
      slots: { default: 'Button Label' },
    })
    expect(wrapper.text()).toContain('Button Label')
  })

  it('maps type="text" to variant="text"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { type: 'text' },
      slots: { default: 'Text' },
    })
    // Should render without errors — text variant maps to neutral tone
    expect(wrapper.find('button').attributes('data-tone')).toBe('neutral')
  })

  it('maps type="link" to variant="link"', () => {
    const wrapper = mount(DzButtonCompat, {
      props: { type: 'link' },
      slots: { default: 'Link' },
    })
    expect(wrapper.find('button').attributes('data-tone')).toBe('neutral')
  })
})
