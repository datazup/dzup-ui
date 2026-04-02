import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
/**
 * useEscapeKey — Unit tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import { useEscapeKey } from './useEscapeKey.ts'

/** Helper to mount composable in a real Vue lifecycle */
function createWrapper(
  handler: () => void,
  active?: Ref<boolean>,
) {
  return mount(
    defineComponent({
      setup() {
        useEscapeKey(handler, active)
        return {}
      },
      template: '<div>test</div>',
    }),
    { attachTo: document.body },
  )
}

function dispatchEscapeKey(): void {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  document.dispatchEvent(event)
}

function dispatchOtherKey(): void {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
  document.dispatchEvent(event)
}

describe('useEscapeKey', () => {
  it('calls handler when Escape key is pressed', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    dispatchEscapeKey()

    expect(handler).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('does not call handler for non-Escape keys', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    dispatchOtherKey()

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does not call handler when active is false', () => {
    const handler = vi.fn()
    const active = ref(false)
    const wrapper = createWrapper(handler, active)

    dispatchEscapeKey()

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('responds when active changes from false to true', () => {
    const handler = vi.fn()
    const active = ref(false)
    const wrapper = createWrapper(handler, active)

    dispatchEscapeKey()
    expect(handler).not.toHaveBeenCalled()

    active.value = true
    dispatchEscapeKey()
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('stops responding when active changes from true to false', () => {
    const handler = vi.fn()
    const active = ref(true)
    const wrapper = createWrapper(handler, active)

    dispatchEscapeKey()
    expect(handler).toHaveBeenCalledTimes(1)

    active.value = false
    dispatchEscapeKey()
    expect(handler).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('calls handler by default when active is not provided', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    dispatchEscapeKey()

    expect(handler).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('cleans up listener on unmount', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    wrapper.unmount()
    dispatchEscapeKey()

    expect(handler).not.toHaveBeenCalled()
  })
})
