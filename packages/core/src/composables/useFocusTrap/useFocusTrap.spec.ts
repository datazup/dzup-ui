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

    // The document-first focusable element is the `.first` button. With
    // document-order sorting, this is deterministic regardless of how the
    // selector group is ordered by the engine.
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

    const firstElement = wrapper.find('.first').element as HTMLElement
    const lastElement = wrapper.find('.third').element as HTMLElement
    lastElement.focus()

    pressTab()

    // The handler calls preventDefault + focus(); focus() works in jsdom, so the
    // observable result is that focus wraps from the last element to the first.
    expect(wrapper.vm.isActive).toBe(true)
    expect(document.activeElement).toBe(firstElement)

    wrapper.unmount()
  })

  it('handles Shift+Tab when focus is on first element by wrapping to last', () => {
    const wrapper = createWrapper()
    wrapper.vm.activate()

    const firstElement = wrapper.find('.first').element as HTMLElement
    const lastElement = wrapper.find('.third').element as HTMLElement
    firstElement.focus()

    pressTab(true)

    // Shift+Tab on the first element wraps focus to the last element.
    expect(wrapper.vm.isActive).toBe(true)
    expect(document.activeElement).toBe(lastElement)

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

describe('d7 — focus is restored when the trap is released', () => {
  /** A trap whose container is mounted, plus an opener outside it. */
  function createRestoreWrapper(options?: { restoreFocus?: boolean }) {
    const opener = document.createElement('button')
    opener.id = 'opener'
    opener.textContent = 'Open'
    document.body.append(opener)
    opener.focus()

    const wrapper = mount(
      defineComponent({
        setup() {
          const containerRef = ref<HTMLElement | null>(null)
          const trap = useFocusTrap(containerRef, options)
          return { containerRef, ...trap }
        },
        template: `
          <div ref="containerRef">
            <button class="first">First</button>
            <button class="second">Second</button>
          </div>
        `,
      }),
      { attachTo: document.body },
    )

    return { wrapper, opener }
  }

  it('defect D7 -- deactivate() returns focus to the element that held it before activate()', () => {
    const { wrapper, opener } = createRestoreWrapper()
    expect(document.activeElement).toBe(opener)

    wrapper.vm.activate()
    expect(document.activeElement).not.toBe(opener)
    expect(wrapper.element.contains(document.activeElement)).toBe(true)

    // Before the fix `deactivate()` only removed the keydown listener, so focus
    // was left on whatever the trap had taken — or on <body> once the panel
    // unmounted. Dismissing a DzTour stranded the keyboard user at the top of
    // the document (N1-O1 defect D7, WCAG 2.4.3).
    wrapper.vm.deactivate()
    expect(document.activeElement).toBe(opener)

    wrapper.unmount()
    opener.remove()
  })

  it('defect D7 -- unmounting an active trap restores focus too', () => {
    const { wrapper, opener } = createRestoreWrapper()
    wrapper.vm.activate()
    expect(document.activeElement).not.toBe(opener)

    wrapper.unmount()
    expect(document.activeElement).toBe(opener)

    opener.remove()
  })

  it('defect D7 -- `restoreFocus: false` leaves the restore to the caller', () => {
    const { wrapper, opener } = createRestoreWrapper({ restoreFocus: false })
    wrapper.vm.activate()
    wrapper.vm.deactivate()

    expect(document.activeElement).not.toBe(opener)

    wrapper.unmount()
    opener.remove()
  })

  it('defect D7 -- focus taken deliberately from outside the trap is not stolen back', () => {
    const { wrapper, opener } = createRestoreWrapper()
    const elsewhere = document.createElement('button')
    document.body.append(elsewhere)

    wrapper.vm.activate()
    elsewhere.focus()
    wrapper.vm.deactivate()

    expect(document.activeElement).toBe(elsewhere)

    wrapper.unmount()
    opener.remove()
    elsewhere.remove()
  })

  it('defect D7 -- a restore target that has left the document is skipped, not thrown on', () => {
    const { wrapper, opener } = createRestoreWrapper()
    wrapper.vm.activate()
    opener.remove()

    expect(() => wrapper.vm.deactivate()).not.toThrow()

    wrapper.unmount()
  })
})
