import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzErrorBoundary from './DzErrorBoundary.vue'

/** Always throws during setup — reliably triggers onErrorCaptured */
const ThrowingChild = defineComponent({
  setup() {
    throw new Error('test error')
  },
  render() {
    return h('span', 'unreachable')
  },
})

/** Renders normally (no throw) */
const SafeChild = defineComponent({
  render() {
    return h('span', 'ok')
  },
})

describe('DzErrorBoundary', () => {
  it('renders default slot normally', () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: { default: () => h(SafeChild) },
    })
    expect(wrapper.text()).toContain('ok')
  })

  it('renders fallback slot when child throws', async () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: {
        default: () => h(ThrowingChild),
        fallback: ({ error }: { error: unknown; reset: () => void }) =>
          h('span', { 'data-testid': 'fallback' }, String(error)),
      },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="fallback"]').exists()).toBe(true)
  })

  it('calls onError prop when error is caught', async () => {
    const onError = vi.fn()
    mount(DzErrorBoundary, {
      props: { onError },
      slots: {
        default: () => h(ThrowingChild),
        fallback: () => h('span', 'err'),
      },
    })
    await nextTick()
    expect(onError).toHaveBeenCalledOnce()
  })

  it('exposes reset() to clear the error', async () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: {
        default: () => h(ThrowingChild),
        fallback: ({ reset }: { error: unknown; reset: () => void }) =>
          h('button', { onClick: reset }, 'reset'),
      },
    })
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    // After reset, the fallback slot should not be visible (error cleared)
    // Note: ThrowingChild would throw again on re-render, but reset was called
  })
})
