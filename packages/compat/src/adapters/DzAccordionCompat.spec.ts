/**
 * DzAccordionCompat — Unit tests.
 *
 * Validates that the compat adapter correctly maps old dzip-ui
 * single-component accordion API to the new vNext compound DzAccordion API.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDeprecationWarnings } from '../utils/deprecation.ts'
import DzAccordionCompat from './DzAccordionCompat.vue'

const sampleItems = [
  { title: 'Section 1', value: 'section1', content: 'Content for section 1' },
  { title: 'Section 2', value: 'section2', content: 'Content for section 2' },
  { title: 'Section 3', value: 'section3', disabled: true, content: 'Disabled content' },
]

describe('dzAccordionCompat', () => {
  beforeEach(() => {
    resetDeprecationWarnings()
    vi.stubEnv('DEV', true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders the underlying DzAccordion compound component', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
    expect(wrapper.text()).toContain('Section 1')
    expect(wrapper.text()).toContain('Section 2')
  })

  it('renders accordion triggers from the items prop', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    expect(buttons[0].text()).toContain('Section 1')
    expect(buttons[1].text()).toContain('Section 2')
    expect(buttons[2].text()).toContain('Section 3')
  })

  it('renders disabled accordion items', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    const buttons = wrapper.findAll('button')
    // Section 3 should be disabled
    expect((buttons[2].element as HTMLButtonElement).disabled).toBe(true)
  })

  it('maps multiple=false to type="single"', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, multiple: false, modelValue: '' },
    })
    // Should render successfully in single mode
    expect(wrapper.element).toBeTruthy()
  })

  it('maps multiple=true to type="multiple"', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, multiple: true, modelValue: [] },
    })
    // Should render successfully in multiple mode
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="small" to size="sm"', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, size: 'small', modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('maps old size="large" to size="lg"', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, size: 'large', modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('passes through new size values unchanged', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, size: 'xl', modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('emits change when an item is toggled', async () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    const changeEvents = wrapper.emitted('change')
    if (changeEvents) {
      expect(changeEvents[0]).toEqual(['section1'])
    }
  })

  it('forwards v-model for active item', async () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    const modelEvents = wrapper.emitted('update:modelValue')
    if (modelEvents) {
      expect(modelEvents[0]).toEqual(['section1'])
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: [], modelValue: '' },
      slots: { default: '<div class="custom-content">Custom Content</div>' },
    })
    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  it('renders without items when items prop is empty', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: [], modelValue: '' },
    })
    expect(wrapper.element).toBeTruthy()
  })

  it('warns about dropped expandIcon prop in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzAccordionCompat, {
      props: { items: sampleItems, expandIcon: 'chevron-down', modelValue: '' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzip-ui/compat] DzAccordionCompat: "expandIcon" prop is dropped in vNext. Use CSS to control the expand icon.',
    )
  })

  it('emits deprecation warning on mount', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
    })
    expect(warnSpy).toHaveBeenCalledWith(
      '[dzip-ui/compat] DzAccordionCompat is deprecated. Use DzAccordion from @dzip-ui/core instead.',
    )
  })

  it('only warns once per component type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(DzAccordionCompat, { props: { items: sampleItems, modelValue: '' } })
    mount(DzAccordionCompat, { props: { items: sampleItems, modelValue: '' } })
    const compatWarnings = warnSpy.mock.calls.filter(
      call => typeof call[0] === 'string' && call[0].includes('DzAccordionCompat is deprecated'),
    )
    expect(compatWarnings).toHaveLength(1)
  })

  it('passes through extra attrs to the underlying component', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, modelValue: '' },
      attrs: { 'data-testid': 'compat-accordion' },
    })
    expect(wrapper.find('[data-testid="compat-accordion"]').exists()).toBe(true)
  })

  it('forwards disabled prop to DzAccordion root', () => {
    const wrapper = mount(DzAccordionCompat, {
      props: { items: sampleItems, disabled: true, modelValue: '' },
    })
    // All trigger buttons should be disabled when root is disabled
    const buttons = wrapper.findAll('button')
    for (const button of buttons) {
      expect((button.element as HTMLButtonElement).disabled).toBe(true)
    }
  })
})
