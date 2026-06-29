import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzAsyncBoundary from './DzAsyncBoundary.vue'

describe('dzAsyncBoundary — Contract Spec v1', () => {
  it('renders loading slot during suspension', () => {
    const AsyncChild = defineComponent({
      async setup() {
        await new Promise(() => {})
        return () => h('span', 'done')
      },
    })
    const wrapper = mount(DzAsyncBoundary, {
      slots: {
        default: () => h(AsyncChild),
        loading: '<div data-testid="loading-slot">Loading</div>',
      },
    })
    expect(wrapper.find('[data-testid="loading-slot"]').exists()).toBe(true)
  })

  it('error slot receives error and reset scoped props', async () => {
    const ThrowingChild = defineComponent({
      setup() { throw new Error('thrown') },
      render() { return h('span') },
    })
    const wrapper = mount(DzAsyncBoundary, {
      slots: {
        default: () => h(ThrowingChild),
        error: ({ error, reset }: { error: unknown, reset: () => void }) =>
          h('div', [
            h('span', { 'data-testid': 'err' }, String(error)),
            h('button', { 'data-testid': 'rst', 'onClick': reset }, 'reset'),
          ]),
      },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="err"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="rst"]').exists()).toBe(true)
  })

  it('accepts all defined props', () => {
    expect(() =>
      mount(DzAsyncBoundary, {
        props: { timeout: 3000, delay: 100, onError: () => {} },
        slots: { default: '<span>ok</span>' },
      }),
    ).not.toThrow()
  })
})
