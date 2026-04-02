import { mount } from '@vue/test-utils'
/**
 * DzStepper — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzStepper from './DzStepper.vue'

describe('dzStepper — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzStepper, { slots: { default: '<div>Step</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzStepper, { slots: { default: '<div>Step</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts orientation values', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const wrapper = mount(DzStepper, { props: { orientation }, slots: { default: '<div>Step</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzStepper, {
      props: { ariaLabel: 'Checkout process' },
      slots: { default: '<div>Step</div>' },
    })
    expect(wrapper.html()).toContain('Checkout process')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzStepper, {
      slots: { default: '<div data-testid="step">Step 1</div>' },
    })
    expect(wrapper.find('[data-testid="step"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStepper, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Step</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
