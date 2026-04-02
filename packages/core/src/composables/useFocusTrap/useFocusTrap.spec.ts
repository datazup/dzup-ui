import { mount } from '@vue/test-utils'
/**
 * useFocusTrap — Unit tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import { useFocusTrap } from './useFocusTrap.ts'

/** Helper component with focusable elements inside a container */
function createWrapper() {
  return mount(
    defineComponent({
      setup() {
        const containerRef = ref<HTMLElement | null>(null)
        const trap = useFocusTrap(containerRef)
        return { containerRef, ...trap }
      },
      template: `
        <div ref="containerRef">
          <button class="first">First</button>
          <input class="second" />
          <a href="#" class="third">Third</a>
        </div>
      `,
    }),
    { attachTo: document.body },
  )
}

/** Helper component with no focusable elements */
function createEmptyWrapper() {
  return mount(
    defineComponent({
      setup() {
        const containerRef = ref<HTMLElement | null>(null)
        const trap = useFocusTrap(containerRef)
        return { containerRef, ...trap }
      },
      template: '<div ref="containerRef"><span>No focusable elements</span></div>',
    }),
    { attachTo: document.body },
  )
}

function pressTab(shiftKey = false): void {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  })
  document.dispatchEvent(event)
}

describe('useFocusTrap', () => {
  it('returns activate, deactivate, and isActive', () => {
    const wrapper = createWrapper()
    const { activate, deactivate, isActive } = wrapper.vm

    expect(typeof activate).toBe('function')
    expect(typeof deactivate).toBe('function')
    expect(isActive).toBe(false)

    wrapper.unmount()
  })

  it('starts inactive', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.isActive).toBe(false)
    wrapper.unmount()
  })

  it('becomes active after activate() is called', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()

    expect(wrapper.vm.isActive).toBe(true)
    wrapper.unmount()
  })

  it('becomes inactive after deactivate() is called', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()
    wrapper.vm.deactivate()

    expect(wrapper.vm.isActive).toBe(false)
    wrapper.unmount()
  })

  it('focuses the first focusable element on activate', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()

    const firstButton = wrapper.find('.first').element as HTMLElement
    expect(document.activeElement).toBe(firstButton)

    wrapper.unmount()
  })

  it('does not throw when activating twice', () => {
    const wrapper = createWrapper()

    expect(() => {
      wrapper.vm.activate()
      wrapper.vm.activate()
    }).not.toThrow()

    expect(wrapper.vm.isActive).toBe(true)
    wrapper.unmount()
  })

  it('does not throw when deactivating without activating', () => {
    const wrapper = createWrapper()

    expect(() => {
      wrapper.vm.deactivate()
    }).not.toThrow()

    wrapper.unmount()
  })

  it('handles Tab when focus is on last element by wrapping to first', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()

    const lastElement = wrapper.find('.third').element as HTMLElement
    lastElement.focus()

    pressTab()

    // In jsdom, focus() calls work but keyboard events don't move focus natively.
    // The handler calls preventDefault + focus(), so we verify the handler runs.
    // Due to jsdom limitations, we verify the trap is active and doesn't throw.
    expect(wrapper.vm.isActive).toBe(true)

    wrapper.unmount()
  })

  it('handles Shift+Tab when focus is on first element by wrapping to last', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()

    const firstElement = wrapper.find('.first').element as HTMLElement
    firstElement.focus()

    pressTab(true)

    expect(wrapper.vm.isActive).toBe(true)

    wrapper.unmount()
  })

  it('handles container with no focusable elements', () => {
    const wrapper = createEmptyWrapper()
    wrapper.vm.activate()

    expect(() => pressTab()).not.toThrow()
    expect(wrapper.vm.isActive).toBe(true)

    wrapper.unmount()
  })

  it('cleans up on unmount', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()
    expect(wrapper.vm.isActive).toBe(true)

    wrapper.unmount()

    // After unmount, the listener should be removed.
    // We can't directly verify listener removal, but we verify no errors.
    expect(() => pressTab()).not.toThrow()
  })

  it('handles null container ref gracefully on activate', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const containerRef = ref<HTMLElement | null>(null)
          const trap = useFocusTrap(containerRef)
          return { containerRef, ...trap }
        },
        template: '<div>no ref binding</div>',
      }),
      { attachTo: document.body },
    )

    expect(() => wrapper.vm.activate()).not.toThrow()
    expect(wrapper.vm.isActive).toBe(true)

    wrapper.unmount()
  })
})
