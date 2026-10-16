import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzAsyncBoundary from './DzAsyncBoundary.vue'
import DzErrorBoundary from './DzErrorBoundary.vue'

describe('dzAsyncBoundary', () => {
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
        error: ({ error }: { error: unknown, reset: () => void }) =>
          h('span', { 'data-testid': 'error' }, String(error)),
      },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
  })
})

// UI-DZUP-UI-UX-H-01: an unslotted boundary must not go blank on failure.
describe.each([
  ['DzAsyncBoundary', DzAsyncBoundary],
  ['DzErrorBoundary', DzErrorBoundary],
] as const)('%s default error state', (_name, Boundary) => {
  it('renders a role=alert message with a retry control that calls reset', async () => {
    let shouldThrow = true
    const FlakyChild = defineComponent({
      setup() {
        if (shouldThrow)
          throw new Error('boom')
        return () => h('span', { 'data-testid': 'content' }, 'ok')
      },
    })
    const wrapper = mount(Boundary as typeof DzErrorBoundary, {
      slots: { default: () => h(FlakyChild) },
    })
    await nextTick()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Something went wrong.')
    const retry = alert.find('button')
    expect(retry.text()).toBe('Try again')

    shouldThrow = false
    await retry.trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })
})
