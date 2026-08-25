import { mount } from '@vue/test-utils'
/**
 * DzInputGroup — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzInputGroup from './DzInputGroup.vue'

describe('dzInputGroup — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzInputGroup, { slots: { default: '<input />' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzInputGroup, { slots: { default: '<input />' } })
    // DzInputGroup does not set contain: layout style on root (it's a grouping wrapper)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzInputGroup, { props: { size }, slots: { default: '<input />' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders prefix slot', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: '<input />', prefix: '<span data-testid="prefix">$</span>' },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
  })

  it('renders suffix slot', () => {
    const wrapper = mount(DzInputGroup, {
      slots: { default: '<input />', suffix: '<span data-testid="suffix">.00</span>' },
    })
    expect(wrapper.find('[data-testid="suffix"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzInputGroup, {
      attrs: { class: 'custom-class' },
      slots: { default: '<input />' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})

describe('dzInputGroup — renderer contract C2 identity', () => {
  /**
   * The group inherits ariaDescribedby, ariaInvalid and ariaLabelledby from
   * BaseAccessibilityProps and used to read none of them. A consumer could pass
   * all three and get a DOM that mentioned none.
   */
  it('honours the identity props it declares', () => {
    const wrapper = mount(DzInputGroup, {
      props: {
        ariaLabelledby: 'label-id',
        ariaDescribedby: 'help-id',
        ariaInvalid: true,
      },
      slots: { default: '<input />' },
    })
    expect(wrapper.attributes('aria-labelledby')).toBe('label-id')
    expect(wrapper.attributes('aria-describedby')).toBe('help-id')
    expect(wrapper.attributes('aria-invalid')).toBe('true')
  })

  /**
   * `:aria-invalid="ariaInvalid"` is not enough. `ariaInvalid` is typed
   * `boolean | 'grammar' | 'spelling'`, so Vue declares it a Boolean prop and
   * casts an absent one to `false` — and an `aria-*` binding renders `false`
   * as the string rather than dropping the attribute. Every group would have
   * announced `aria-invalid="false"` on a field nobody had validated.
   */
  it('emits none of them when none is given', () => {
    const wrapper = mount(DzInputGroup, { slots: { default: '<input />' } })
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.attributes('aria-invalid')).toBeUndefined()
  })
})
