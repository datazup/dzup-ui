import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
/**
 * useClickOutside — Unit tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import { useClickOutside } from './useClickOutside.ts'

/** Helper component that mounts the composable in a real lifecycle */
function createWrapper(
  handler: (event: MouseEvent) => void,
  options?: { enabled?: Ref<boolean> },
) {
  return mount(
    defineComponent({
      setup() {
        const targetRef = ref<HTMLElement | null>(null)
        useClickOutside(targetRef, handler, options)
        return { targetRef }
      },
      template: '<div ref="targetRef" class="target"><span class="inner">inside</span></div>',
    }),
    { attachTo: document.body },
  )
}

describe('useClickOutside', () => {
  it('calls handler when clicking outside the target', async () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    // Create an outside element and click it
    const outside = document.createElement('div')
    document.body.appendChild(outside)

    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: outside })
    document.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(event)

    document.body.removeChild(outside)
    wrapper.unmount()
  })

  it('does not call handler when clicking inside the target', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    const inner = wrapper.find('.inner').element
    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: inner })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('does not call handler when clicking the target element itself', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    const target = wrapper.find('.target').element
    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: target })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('does not call handler when enabled is false', () => {
    const handler = vi.fn()
    const enabled = ref(false)
    const wrapper = createWrapper(handler, { enabled })

    const outside = document.createElement('div')
    document.body.appendChild(outside)

    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: outside })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(outside)
    wrapper.unmount()
  })

  it('respects dynamic enabled toggling', async () => {
    const handler = vi.fn()
    const enabled = ref(false)
    const wrapper = createWrapper(handler, { enabled })

    const outside = document.createElement('div')
    document.body.appendChild(outside)

    // Disabled: no call
    const event1 = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event1, 'target', { value: outside })
    document.dispatchEvent(event1)
    expect(handler).not.toHaveBeenCalled()

    // Enable it
    enabled.value = true

    const event2 = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event2, 'target', { value: outside })
    document.dispatchEvent(event2)
    expect(handler).toHaveBeenCalledTimes(1)

    document.body.removeChild(outside)
    wrapper.unmount()
  })

  it('cleans up listener on unmount', () => {
    const handler = vi.fn()
    const wrapper = createWrapper(handler)

    wrapper.unmount()

    const outside = document.createElement('div')
    document.body.appendChild(outside)

    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: outside })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(outside)
  })

  it('handles null target ref gracefully', () => {
    const handler = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          const targetRef = ref<HTMLElement | null>(null)
          useClickOutside(targetRef, handler)
          return { targetRef }
        },
        template: '<div>no ref binding</div>',
      }),
      { attachTo: document.body },
    )

    const event = new MouseEvent('mousedown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: document.body })
    document.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
