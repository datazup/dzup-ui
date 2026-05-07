import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzAsyncBoundary from './DzAsyncBoundary.vue'

describe('DzAsyncBoundary', () => {
  it('renders loading slot while suspended', async () => {
    const AsyncChild = defineComponent({
      async setup() {
        await new Promise(() => {}) // never resolves
        return () => h('span', 'loaded')
      },
    })
    const wrapper = mount(DzAsyncBoundary, {
      slots: {
        default: () => h(AsyncChild),
        loading: '<span data-testid="loading">Loading...</span>',
      },
    })
    // During suspension, loading fallback is shown
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('accepts timeout and delay props without throwing', () => {
    expect(() =>
      mount(DzAsyncBoundary, {
        props: { timeout: 5000, delay: 200 },
        slots: { default: '<span>content</span>' },
      }),
    ).not.toThrow()
  })

  it('renders error slot via onErrorCaptured when synchronous child throws', async () => {
    const ThrowingChild = defineComponent({
      setup() { throw new Error('sync error') },
      render() { return h('span') },
    })
    const wrapper = mount(DzAsyncBoundary, {
      slots: {
        default: () => h(ThrowingChild),
        error: ({ error }: { error: unknown; reset: () => void }) =>
          h('span', { 'data-testid': 'error' }, String(error)),
      },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
  })
})
