import { mount } from '@vue/test-utils'
/**
 * DzPasswordInput — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzPasswordInput from './DzPasswordInput.vue'

describe('dzPasswordInput — Unit Tests', () => {
  it('renders with password type by default', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('toggles to text type when toggle button is clicked', async () => {
    const wrapper = mount(DzPasswordInput)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('toggles back to password type on second click', async () => {
    const wrapper = mount(DzPasswordInput)
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('toggle button has accessible label', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Show password')
  })

  it('toggle button label changes when password is visible', async () => {
    const wrapper = mount(DzPasswordInput)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Hide password')
  })

  it('sets autocomplete to current-password', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.find('input').attributes('autocomplete')).toBe('current-password')
  })

  // WCAG 2.2 SC 3.3.8 Accessible Authentication (AA) accepts a password manager
  // as the mechanism that removes the recall test. The manager reads the token
  // on the <input>, and `inheritAttrs: false` used to send a consumer's
  // `autocomplete` to the wrapper <div>, where nothing reads it: a registration
  // form could not say `new-password` at all (TASK-R2-O5).
  it('puts a consumer autocomplete token on the input, not on the wrapper', () => {
    const wrapper = mount(DzPasswordInput, { props: { autocomplete: 'new-password' } })
    expect(wrapper.find('input').attributes('autocomplete')).toBe('new-password')
    expect(wrapper.element.getAttribute('autocomplete')).toBeNull()
  })

  // The reveal control is the other SC 3.3.8 support technique, and it had
  // `tabindex="-1"`: the only way to read back what you typed was a mouse, which
  // is also a plain SC 2.1.1 failure on a control with a function of its own.
  it('reaches the visibility toggle by keyboard', () => {
    const wrapper = mount(DzPasswordInput)
    expect(wrapper.find('button').attributes('tabindex')).toBeUndefined()
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzPasswordInput, {
      props: { error: 'Password is too short' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Password is too short')
  })

  it('sets aria-invalid when invalid', () => {
    const wrapper = mount(DzPasswordInput, {
      props: { invalid: true },
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('disables input and toggle button when disabled', () => {
    const wrapper = mount(DzPasswordInput, {
      props: { disabled: true },
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzPasswordInput)
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('renders a loading spinner when loading=true', () => {
    const wrapper = mount(DzPasswordInput, { props: { loading: true } })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('marks the input as busy and read-only while loading', () => {
    const wrapper = mount(DzPasswordInput, { props: { loading: true } })
    const input = wrapper.find('input')
    expect(input.attributes('aria-busy')).toBe('true')
    expect((input.element as HTMLInputElement).readOnly).toBe(true)
  })

  it('disables the visibility toggle while loading', () => {
    const wrapper = mount(DzPasswordInput, { props: { loading: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('does not render a spinner when loading=false', () => {
    const wrapper = mount(DzPasswordInput, { props: { loading: false } })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })
})
