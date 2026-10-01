import type { DzTourStep } from './DzTour.types.ts'
import { expectKeyboardContract } from '@dzup-ui/testing'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
/**
 * DzTour -- Behavior tests.
 *
 * Covers step advance/regress, finish/skip/Esc dismissal and their emits,
 * target re-measurement on resize, and the focus trap. The overlay teleports
 * to document.body, so controls are located there and clicked via native
 * events that the DzButton roots forward as `click` emits.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { anatomy as tourAnatomy } from './DzTour.anatomy.ts'
import DzTour from './DzTour.vue'

/**
 * Nodes this file appends to the document itself — tour targets, an opener — as
 * opposed to anything a component mounted. Unmounting cannot know about these, so
 * they are removed explicitly in `afterEach`; the `document.body` wipe this file used
 * to end on was removing them as a side effect of removing everything.
 */
const appended: Element[] = []

/** Append `nodes` to the body and register them for removal after this test. */
function appendToBody(...nodes: Element[]): void {
  document.body.append(...nodes)
  appended.push(...nodes)
}

/** Append two real targets and return the matching step definitions. */
function setupTargets(): DzTourStep[] {
  const a = document.createElement('button')
  a.id = 'tour-a'
  a.textContent = 'A'
  const b = document.createElement('button')
  b.id = 'tour-b'
  b.textContent = 'B'
  appendToBody(a, b)
  return [
    { target: '#tour-a', title: 'Step A', description: 'First.' },
    { target: '#tour-b', title: 'Step B', description: 'Second.', placement: 'top' },
  ]
}

/** Mount DzTour inside a host that wires both v-model bindings two-way. */
function mountHost(steps: DzTourStep[], extra: Record<string, unknown> = {}) {
  const onFinish = vi.fn()
  const onClose = vi.fn()
  const onChange = vi.fn()
  const wrapper = mount(
    defineComponent({
      components: { DzTour },
      setup() {
        const open = ref(true)
        const current = ref(0)
        return { open, current, steps, extra, onFinish, onClose, onChange }
      },
      template: `
        <DzTour
          v-model:open="open"
          v-model:current="current"
          :steps="steps"
          v-bind="extra"
          @finish="onFinish"
          @close="onClose"
          @change="onChange"
        />
      `,
    }),
    { attachTo: document.body },
  )
  return { wrapper, onFinish, onClose, onChange }
}

/** Click a teleported control by its data-testid via a native click event. */
function clickTestId(testId: string): void {
  const el = document.body.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function panelText(): string {
  return document.body.querySelector('[data-testid="dz-tour-panel"]')?.textContent ?? ''
}

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). The overlay teleports to
 * `document.body`, which made a body wipe look like the way to clear it — while
 * leaving the tour mounted with its focus trap and resize listener attached.
 */
enableAutoUnmount(afterEach)

afterEach(() => {
  for (const node of appended.splice(0))
    node.remove()
  vi.restoreAllMocks()
})

describe('dzTour -- behavior', () => {
  it('shows the first step when opened', async () => {
    mountHost(setupTargets())
    await flushPromises()
    expect(panelText()).toContain('Step A')
  })

  it('advances to the next step when Next is clicked', async () => {
    const { wrapper, onChange } = mountHost(setupTargets())
    await flushPromises()

    clickTestId('dz-tour-next')
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(1)
    expect(panelText()).toContain('Step B')
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('regresses to the previous step when Back is clicked', async () => {
    const { wrapper } = mountHost(setupTargets())
    await flushPromises()

    clickTestId('dz-tour-next')
    await flushPromises()
    expect(panelText()).toContain('Step B')

    clickTestId('dz-tour-back')
    await flushPromises()
    expect((wrapper.vm as unknown as { current: number }).current).toBe(0)
    expect(panelText()).toContain('Step A')
  })

  it('hides the Back control on the first step', async () => {
    mountHost(setupTargets())
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-back"]')).toBeNull()
  })

  it('labels the primary control "Finish" on the last step and emits finish', async () => {
    const { wrapper, onFinish } = mountHost(setupTargets())
    await flushPromises()

    clickTestId('dz-tour-next') // → last step
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-next"]')?.textContent).toContain('Finish')

    clickTestId('dz-tour-next') // Finish
    await flushPromises()
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('emits close and closes when Skip is clicked', async () => {
    const { wrapper, onClose } = mountHost(setupTargets())
    await flushPromises()

    clickTestId('dz-tour-skip')
    await flushPromises()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('closes on the Escape key and emits close', async () => {
    const { wrapper, onClose } = mountHost(setupTargets())
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)
  })

  it('re-measures the target on window resize', async () => {
    const steps = setupTargets()
    const target = document.getElementById('tour-a') as HTMLElement
    const spy = vi.spyOn(target, 'getBoundingClientRect')
    mountHost(steps)
    await flushPromises()

    spy.mockClear()
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(spy).toHaveBeenCalled()
  })

  it('traps focus inside the step popover when open', async () => {
    mountHost(setupTargets())
    await flushPromises()

    const panel = document.body.querySelector('[data-testid="dz-tour-panel"]')
    expect(panel?.contains(document.activeElement)).toBe(true)
  })

  it('omits the spotlight mask when mask is false', async () => {
    mountHost(setupTargets(), { mask: false })
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-mask"]')).toBeNull()
  })

  it('announces the current step via a live region', async () => {
    mountHost(setupTargets())
    await flushPromises()
    const live = document.body.querySelector('[role="status"][aria-live="polite"]')
    expect(live?.textContent).toContain('Step 1 of 2')
  })
})

describe('dzTour -- D7: focus is restored when the tour is dismissed', () => {
  /** Mount the host CLOSED, with a real opener focused outside the tour. */
  function mountClosedHost(steps: DzTourStep[]) {
    const opener = document.createElement('button')
    opener.id = 'tour-opener'
    opener.textContent = 'Start tour'
    appendToBody(opener)
    opener.focus()

    const wrapper = mount(
      defineComponent({
        components: { DzTour },
        setup() {
          const open = ref(false)
          const current = ref(0)
          return { open, current, steps }
        },
        template: `
          <DzTour v-model:open="open" v-model:current="current" :steps="steps" />
        `,
      }),
      { attachTo: document.body },
    )
    return { wrapper, opener }
  }

  it('defect D7 -- Skip returns focus to the control that opened the tour', async () => {
    const { wrapper, opener } = mountClosedHost(setupTargets())
    const vm = wrapper.vm as unknown as { open: boolean }

    vm.open = true
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-panel"]')?.contains(document.activeElement)).toBe(true)

    clickTestId('dz-tour-skip')
    await flushPromises()

    // `deactivate()` used to remove the keydown listener and nothing else, so
    // focus was left on <body> (N1-O1 defect D7, WCAG 2.4.3 Focus Order).
    expect(vm.open).toBe(false)
    expect(document.activeElement).toBe(opener)
  })

  it('defect D7 -- Escape returns focus to the control that opened the tour', async () => {
    const { wrapper, opener } = mountClosedHost(setupTargets())
    const vm = wrapper.vm as unknown as { open: boolean }

    vm.open = true
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(vm.open).toBe(false)
    expect(document.activeElement).toBe(opener)
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F8`: both step-navigation rows were
// published as WCAG 2.1.1 and the panel bound neither. `useFocusTrap` made Tab
// real and `useEscapeKey` made Escape real; ArrowRight and ArrowLeft were not.
// ---------------------------------------------------------------------------

/** Dispatch a key at the teleported step panel and return the event. */
function keyPanel(key: string): KeyboardEvent {
  const panel = document.body.querySelector<HTMLElement>('[data-testid="dz-tour-panel"]')
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  panel?.dispatchEvent(event)
  return event
}

describe('dzTour -- arrow-key step navigation', () => {
  it('advances a step on ArrowRight and consumes the key', async () => {
    const { wrapper, onChange } = mountHost(setupTargets())
    await flushPromises()

    const event = keyPanel('ArrowRight')
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(1)
    expect(panelText()).toContain('Step B')
    expect(onChange).toHaveBeenCalledWith(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('returns to the previous step on ArrowLeft', async () => {
    const { wrapper } = mountHost(setupTargets())
    await flushPromises()
    keyPanel('ArrowRight')
    await flushPromises()

    keyPanel('ArrowLeft')
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(0)
    expect(panelText()).toContain('Step A')
  })

  it('does not advance past the last step, and does not finish the tour on an arrow', async () => {
    const { wrapper, onFinish } = mountHost(setupTargets())
    await flushPromises()
    keyPanel('ArrowRight')
    await flushPromises()
    expect(panelText()).toContain('Step B')

    // The Next BUTTON finishes here; the arrow deliberately does not — closing
    // a modal on an arrow key is not what the press asked for.
    const event = keyPanel('ArrowRight')
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(1)
    expect(onFinish).not.toHaveBeenCalled()
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(true)
    expect(event.defaultPrevented).toBe(false)
  })

  it('does not regress before the first step', async () => {
    const { wrapper, onChange } = mountHost(setupTargets())
    await flushPromises()

    const event = keyPanel('ArrowLeft')
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(0)
    expect(onChange).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('leaves a field inside the step its own arrows', async () => {
    const { wrapper } = mountHost(setupTargets())
    await flushPromises()

    const panel = document.body.querySelector<HTMLElement>('[data-testid="dz-tour-panel"]')!
    const field = document.createElement('input')
    field.type = 'text'
    panel.append(field)

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    field.dispatchEvent(event)
    await flushPromises()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(0)
    expect(event.defaultPrevented).toBe(false)
  })

  it('conforms to its declared keyboard contract, both arrows consumed', async () => {
    mountHost(setupTargets())
    await flushPromises()
    const panel = document.body.querySelector<HTMLElement>('[data-testid="dz-tour-panel"]')!
    // ArrowLeft is asserted from the SECOND step: the row is real there, and on
    // step one the component legitimately declines it. Consumption is a claim
    // about the key being acted on, not about it being swallowed everywhere.
    keyPanel('ArrowRight')
    await flushPromises()
    expectKeyboardContract(panel, tourAnatomy, { handled: ['ArrowLeft'] })
  })
})
