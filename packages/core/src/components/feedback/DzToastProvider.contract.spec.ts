import { mount } from '@vue/test-utils'
/**
 * DzToastProvider — Contract Spec v1 conformance tests.
 *
 * DzToastProvider is a context-provider wrapper. It supplies a toast context
 * (add/remove/clear/toasts) to the component tree via provide/inject.
 */
import { describe, expect, it } from 'vitest'
import DzToastProvider from './DzToastProvider.vue'

describe('dzToastProvider — Contract Spec v1', () => {
  it('renders without errors with default props', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: '<div data-testid="child">app</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: '<div data-testid="child">Hello</div>' },
    })
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello')
  })

  it('accepts duration prop without throwing', () => {
    expect(() =>
      mount(DzToastProvider, {
        props: { duration: 3000 },
        slots: { default: '<span />' },
      }),
    ).not.toThrow()
  })

  it('accepts maxToasts prop without throwing', () => {
    expect(() =>
      mount(DzToastProvider, {
        props: { maxToasts: 3 },
        slots: { default: '<span />' },
      }),
    ).not.toThrow()
  })

  it('accepts swipeDirection prop without throwing', () => {
    expect(() =>
      mount(DzToastProvider, {
        props: { swipeDirection: 'left' },
        slots: { default: '<span />' },
      }),
    ).not.toThrow()
  })
})
