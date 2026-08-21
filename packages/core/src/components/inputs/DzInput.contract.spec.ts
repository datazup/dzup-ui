/**
 * DzInput — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { anatomy } from './DzInput.anatomy.ts'
import DzInput from './DzInput.vue'

describe('dzInput — Contract Spec v1', () => {
  // ── Prop defaults ──

  it('renders with default props (variant=outline, size=md)', () => {
    const wrapper = mount(DzInput)
    // Root element is a div wrapper
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzInput, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical variant values', () => {
    const variants = ['outline', 'filled', 'underlined'] as const
    for (const variant of variants) {
      const wrapper = mount(DzInput, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all input type values', () => {
    const types = ['text', 'email', 'password', 'url', 'tel', 'search'] as const
    for (const type of types) {
      const wrapper = mount(DzInput, { props: { type } })
      expect(wrapper.find('input').attributes('type')).toBe(type)
    }
  })

  // ── Data attributes ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzInput, { props: { tone: 'danger' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-loading when loading=true', () => {
    const wrapper = mount(DzInput, { props: { loading: true } })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('omits data-loading when loading=false', () => {
    const wrapper = mount(DzInput)
    expect(wrapper.attributes('data-loading')).toBeUndefined()
  })

  it('sets data-disabled when disabled=true', () => {
    const wrapper = mount(DzInput, { props: { disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when disabled=false', () => {
    const wrapper = mount(DzInput)
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('sets data-state="disabled" when disabled', () => {
    const wrapper = mount(DzInput, { props: { disabled: true } })
    expect(wrapper.attributes('data-state')).toBe('disabled')
  })

  it('sets data-state="readonly" when readonly', () => {
    const wrapper = mount(DzInput, { props: { readonly: true } })
    expect(wrapper.attributes('data-state')).toBe('readonly')
  })

  // ── ARIA ──

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzInput, { props: { invalid: true } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-invalid when error message is provided', () => {
    const wrapper = mount(DzInput, { props: { error: 'Required field' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-required when required', () => {
    const wrapper = mount(DzInput, { props: { required: true } })
    expect(wrapper.find('input').attributes('aria-required')).toBe('true')
  })

  it('forwards aria-label to the input element', () => {
    const wrapper = mount(DzInput, { props: { ariaLabel: 'Email address' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Email address')
  })

  it('connects aria-describedby to the error element', () => {
    const wrapper = mount(DzInput, { props: { id: 'email', error: 'Invalid email' } })
    expect(wrapper.find('input').attributes('aria-describedby')).toContain('email-error')
    expect(wrapper.find('#email-error').text()).toBe('Invalid email')
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzInput)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzInput)
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('emits change event on native change', async () => {
    const wrapper = mount(DzInput, { props: { modelValue: 'hello' } })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders prefix slot', () => {
    const wrapper = mount(DzInput, {
      slots: {
        prefix: '<span data-testid="prefix-icon">P</span>',
      },
    })
    expect(wrapper.find('[data-testid="prefix-icon"]').exists()).toBe(true)
  })

  it('renders suffix slot', () => {
    const wrapper = mount(DzInput, {
      slots: {
        suffix: '<span data-testid="suffix-icon">S</span>',
      },
    })
    expect(wrapper.find('[data-testid="suffix-icon"]').exists()).toBe(true)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzInput)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Clearable ──

  it('shows clear button when clearable and input has value', async () => {
    const wrapper = mount(DzInput, {
      props: { clearable: true, modelValue: 'hello' },
    })
    expect(wrapper.find('button[aria-label="Clear input"]').exists()).toBe(true)
  })

  it('hides clear button when input is empty', () => {
    const wrapper = mount(DzInput, {
      props: { clearable: true, modelValue: '' },
    })
    expect(wrapper.find('button[aria-label="Clear input"]').exists()).toBe(false)
  })

  it('emits clear event when clear button is clicked', async () => {
    const wrapper = mount(DzInput, {
      props: { clearable: true, modelValue: 'hello' },
    })
    await wrapper.find('button[aria-label="Clear input"]').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  // ── Error message ──

  it('renders error message when error prop is set', () => {
    const wrapper = mount(DzInput, { props: { error: 'This field is required' } })
    expect(wrapper.find('[role="alert"]').text()).toBe('This field is required')
  })

  it('omits error message element when error prop is not set', () => {
    const wrapper = mount(DzInput)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
  // ── Anatomy (ADR-19) ──

  it('conforms to its declared anatomy in the default render', () => {
    expectAnatomy(mount(DzInput), anatomy)
  })

  it('conforms with every conditional part present at once', () => {
    // The render most likely to emit an undeclared part, because it is the one
    // no single existing test covers.
    const wrapper = mount(DzInput, {
      props: { modelValue: 'text', clearable: true, error: 'Required' },
      slots: { prefix: '<i>@</i>', suffix: '<i>x</i>' },
    })

    for (const part of ['prefix', 'suffix', 'clear', 'error'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)

    expectAnatomy(wrapper, anatomy)
  })

  it('conforms while loading, when the spinner replaces the clear button', () => {
    const wrapper = mount(DzInput, { props: { modelValue: 'x', clearable: true, loading: true } })

    expect(wrapper.find('[data-part="spinner"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="clear"]').exists()).toBe(false)
    expectAnatomy(wrapper, anatomy)
  })

  it('conforms when disabled and when readonly', () => {
    expectAnatomy(mount(DzInput, { props: { disabled: true } }), anatomy)
    expectAnatomy(mount(DzInput, { props: { readonly: true } }), anatomy)
  })

  it('puts the input part on the native element, not on its wrapper', () => {
    // A consumer targeting `input` means the thing that takes the value.
    const wrapper = mount(DzInput)
    expect(wrapper.find('[data-part="input"]').element.tagName).toBe('INPUT')
    expect(wrapper.find('[data-part="control"]').element.tagName).toBe('DIV')
  })

  // ── Per-part overrides (`ui`) ──

  it('applies a ui override to the part it names', () => {
    const wrapper = mount(DzInput, {
      props: { modelValue: 'x', clearable: true, ui: { clear: 'w-10' } },
    })

    expect(wrapper.find('[data-part="clear"]').classes()).toContain('w-10')
  })

  it('reaches a part no prop and no slot could reach', () => {
    // The argument for the whole mechanism: before `ui`, restyling the error
    // message meant a descendant selector against classes tv() generates.
    const wrapper = mount(DzInput, {
      props: { error: 'Required', ui: { error: 'text-base' } },
    })

    const error = wrapper.find('[data-part="error"]').classes()
    expect(error).toContain('text-base')
    expect(error).not.toContain('text-[length:var(--dz-text-xs)]')
  })

  it('keeps class on the control, where it has always landed', () => {
    const wrapper = mount(DzInput, { attrs: { class: 'shadow-lg' } })

    expect(wrapper.find('[data-part="control"]').classes()).toContain('shadow-lg')
    expect(wrapper.classes()).not.toContain('shadow-lg')
  })

  it('sends ui.root to the outer node instead', () => {
    const wrapper = mount(DzInput, { props: { ui: { root: 'w-full' } } })

    expect(wrapper.classes()).toContain('w-full')
  })

  it('needs no !important to win', () => {
    const wrapper = mount(DzInput, { props: { ui: { input: 'text-right' } } })

    expect(wrapper.find('[data-part="input"]').classes()).toContain('text-right')
    expect(wrapper.html()).not.toContain('!important')
  })

  it('changes nothing when no ui is given', () => {
    expect(mount(DzInput, { props: { ui: {} } }).html()).toBe(mount(DzInput).html())
  })
})
