import type { DzTourStep } from './DzTour.types.ts'
import { flushPromises, mount } from '@vue/test-utils'
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
import DzTour from './DzTour.vue'

/** Append two real targets and return the matching step definitions. */
function setupTargets(): DzTourStep[] {
  const a = document.createElement('button')
  a.id = 'tour-a'
  a.textContent = 'A'
  const b = document.createElement('button')
  b.id = 'tour-b'
  b.textContent = 'B'
  document.body.append(a, b)
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

afterEach(() => {
  document.body.innerHTML = ''
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
