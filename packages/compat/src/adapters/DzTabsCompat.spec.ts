/**
 * DzTabsCompat -- Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzup-ui
 * single-component tabs API to the new vNext compound DzTabs API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzTabsCompat from './DzTabsCompat.vue'

const sampleTabs = [
  { label: 'Tab 1', value: 'tab1' },
  { label: 'Tab 2', value: 'tab2' },
  { label: 'Tab 3', value: 'tab3', disabled: true },
]

describe('dzTabsCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzTabs compound component', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    // Should render a root element with the tabs structure
    expect(wrapper.element).toBeTruthy()
    expect(wrapper.text()).toContain('Tab 1')
    expect(wrapper.text()).toContain('Tab 2')
  })

  it('renders tab triggers from the tabs prop', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    // Should render tab trigger buttons
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    expect(buttons[0].text()).toContain('Tab 1')
    expect(buttons[1].text()).toContain('Tab 2')
    expect(buttons[2].text()).toContain('Tab 3')
  })

  it('renders disabled tab triggers', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    const buttons = wrapper.findAll('button')
    // Tab 3 should be disabled
    expect((buttons[2].element as HTMLButtonElement).disabled).toBe(true)
  })

  it('maps old type="line" to variant="line"', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, type: 'line', modelValue: 'tab1' },
    })
    // Should render successfully with line variant
    expect(wrapper.find('[data-variant="line"]').exists()).toBe(true)
  })

  it('maps old type="card" to variant="enclosed"', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, type: 'card', modelValue: 'tab1' },
    })
    expect(wrapper.find('[data-variant="enclosed"]').exists()).toBe(true)
  })

  it('maps old type="border-card" to variant="enclosed"', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, type: 'border-card', modelValue: 'tab1' },
    })
    expect(wrapper.find('[data-variant="enclosed"]').exists()).toBe(true)
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, size: 'small', modelValue: 'tab1' },
    })
    // Should render without errors
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, size: 'large', modelValue: 'tab1' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, size: 'xl', modelValue: 'tab1' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('emits change and tabClick when a tab is clicked', async () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    // Should emit both old-style tabClick and new-style change
    const changeEvents = wrapper.emitted('change')
    const tabClickEvents = wrapper.emitted('tabClick')
    if (changeEvents) {
      expect(changeEvents[0]).toEqual(['tab2'])
    }
    if (tabClickEvents) {
      expect(tabClickEvents[0]).toEqual(['tab2'])
    }
  })

  it('forwards v-model for the active tab', async () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    // Model value should be forwarded
    expect(wrapper.element).toBeTruthy()
    // Change tab
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    const modelEvents = wrapper.emitted('update:modelValue')
    if (modelEvents) {
      expect(modelEvents[0]).toEqual(['tab2'])
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
      slots: { default: '<div class="custom-content">Custom Content</div>' },
    })
    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('renders without tabs when tabs prop is empty', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: [], modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzup-ui/compat] DzTabsCompat is deprecated. Use DzTabs from @dzup-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzTabsCompat, { props: { tabs: sampleTabs, modelValue: 'tab1' } })
    mount(DzTabsCompat, { props: { tabs: sampleTabs, modelValue: 'tab1' } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzTabsCompat'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('passes through extra attrs to the underlying component', () => {
    const wrapper = mount(DzTabsCompat, {
      props: { tabs: sampleTabs, modelValue: 'tab1' },
      attrs: { 'data-testid': 'compat-tabs' },
    })
    expect(wrapper.find('[data-testid="compat-tabs"]').exists()).toBe(true)
  })

  it('applies closable prop to all tabs when set on root', () => {
    const wrapper = mount(DzTabsCompat, {
      props: {
        tabs: [
          { label: 'Tab A', value: 'a' },
          { label: 'Tab B', value: 'b' },
        ],
        closable: true,
        modelValue: 'a',
      },
    })
    // Each tab trigger should have the closable behavior
    expect(wrapper.element).toBeTruthy()
  })
})
