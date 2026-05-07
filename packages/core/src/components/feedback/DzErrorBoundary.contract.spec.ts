import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import DzErrorBoundary from './DzErrorBoundary.vue'

const ThrowingChild = defineComponent({
  setup() { throw new Error('render error') },
  render() { return h('span', 'unreachable') },
})

describe('DzErrorBoundary — Contract Spec v1', () => {
  it('renders default slot content', () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: { default: '<p>default content</p>' },
    })
    expect(wrapper.text()).toContain('default content')
  })

  it('renders fallback slot with scoped error and reset props', async () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: {
        default: () => h(ThrowingChild),
        fallback: ({ error, reset }: { error: unknown; reset: () => void }) =>
          h('div', [
            h('span', { 'data-testid': 'error-msg' }, String(error)),
            h('button', { 'data-testid': 'reset-btn', onClick: reset }, 'Reset'),
          ]),
      },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="error-msg"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="reset-btn"]').exists()).toBe(true)
  })

  it('exposes reset() method', () => {
    const wrapper = mount(DzErrorBoundary, {
      slots: { default: '<span>ok</span>' },
    })
    expect(typeof wrapper.vm.reset).toBe('function')
  })

  it('accepts onError prop', () => {
    expect(() =>
      mount(DzErrorBoundary, {
        props: { onError: () => {} },
        slots: { default: '<span>ok</span>' },
      }),
    ).not.toThrow()
  })
})
