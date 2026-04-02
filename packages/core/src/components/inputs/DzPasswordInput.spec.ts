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
})
