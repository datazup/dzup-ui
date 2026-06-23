import { mount } from '@vue/test-utils'
/**
 * DzOtpInput — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzOtpInput from './DzOtpInput.vue'

describe('dzOtpInput — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders exactly `length` focusable OTP cells (default 6)', () => {
    const wrapper = mount(DzOtpInput)
    // Cells are the visible, non-hidden inputs. Reka's aggregate form input is
    // coerced to type="hidden" so it never counts as a cell.
    const cells = wrapper.findAll('input').filter(i => i.element.type !== 'hidden')
    expect(cells.length).toBe(6)
  })

  it('renders exactly `length` cells for custom lengths', () => {
    for (const length of [4, 6, 8]) {
      const wrapper = mount(DzOtpInput, { props: { length } })
      const cells = wrapper.findAll('input').filter(i => i.element.type !== 'hidden')
      expect(cells.length).toBe(length)
    }
  })

  it('does not expose a stray focusable input after the cells', () => {
    const wrapper = mount(DzOtpInput, { props: { length: 6 } })
    // The only extra input (Reka's aggregate) must be hidden: not focusable
    // (tabindex="-1") and excluded from assistive tech (aria-hidden="true").
    const nonCells = wrapper
      .findAll('input')
      .filter(i => i.element.type === 'hidden')
    expect(nonCells.length).toBe(1)
    const aggregate = nonCells[0]!.element
    expect(aggregate.getAttribute('tabindex')).toBe('-1')
    expect(aggregate.getAttribute('aria-hidden')).toBe('true')
    // No focusable input may sit in the tab order beyond the cells.
    const focusable = wrapper.findAll('input').filter((i) => {
      const tabindex = i.element.getAttribute('tabindex')
      return i.element.type !== 'hidden' && tabindex !== '-1'
    })
    expect(focusable.length).toBe(6)
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzOtpInput, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('h-12')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzOtpInput, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('applies invalid styling when invalid prop is true', () => {
    const wrapper = mount(DzOtpInput, {
      props: { invalid: true },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzOtpInput, {
      props: { error: 'Invalid code' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Invalid code')
  })

  it('connects aria-describedby to the error element', () => {
    const wrapper = mount(DzOtpInput, {
      props: { id: 'pin', error: 'Invalid code' },
    })
    expect(wrapper.find('[aria-describedby]').attributes('aria-describedby')).toContain('pin-error')
    expect(wrapper.find('#pin-error').text()).toBe('Invalid code')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzOtpInput, {
      attrs: { class: 'my-otp' },
    })
    expect(wrapper.html()).toContain('my-otp')
  })

  it('emits focus event on input focus', async () => {
    const wrapper = mount(DzOtpInput)
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) {
      await inputs[0]!.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    }
  })

  it('emits blur event on input blur', async () => {
    const wrapper = mount(DzOtpInput)
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) {
      await inputs[0]!.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    }
  })

  it('accepts ariaLabel prop', () => {
    const wrapper = mount(DzOtpInput, {
      props: { ariaLabel: 'Verification code' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
