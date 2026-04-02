import { mount } from '@vue/test-utils'
/**
 * DzToast — Contract Spec v1 conformance tests.
 *
 * Uses DzToastProvider as the test wrapper since DzToast
 * requires the toast context from its provider.
 */
import { describe, expect, it } from 'vitest'
import DzToastProvider from './DzToastProvider.vue'

describe('dzToast (via DzToastProvider) — Contract Spec v1', () => {
  it('renders DzToastProvider without errors', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: '<div>App content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts duration prop', () => {
    const wrapper = mount(DzToastProvider, {
      props: { duration: 3000 },
      slots: { default: '<div>App</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts maxToasts prop', () => {
    const wrapper = mount(DzToastProvider, {
      props: { maxToasts: 3 },
      slots: { default: '<div>App</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts swipeDirection prop', () => {
    const directions = ['right', 'left', 'up', 'down'] as const
    for (const swipeDirection of directions) {
      const wrapper = mount(DzToastProvider, {
        props: { swipeDirection },
        slots: { default: '<div>App</div>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: '<div data-testid="app">App</div>' },
    })
    expect(wrapper.find('[data-testid="app"]').exists()).toBe(true)
  })
})
