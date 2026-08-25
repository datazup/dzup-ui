/**
 * DzStepper — step gating and reveal (TASK-FORM-OSS-04).
 *
 * A wizard cannot advance past a step whose fields are invalid, and the stepper
 * is the only thing that knows a change is being attempted. What it must *not*
 * know is what validation is — the guard is a boolean, and everything it means
 * stays with the host.
 *
 * The reveal path is the other half: a form that validates on submit and finds
 * its first error on step 3 has to get the user there, and `revealItem` is that
 * — which is why it deliberately ignores the guard that would otherwise refuse.
 */

import type { DzStepperContext } from './DzStepper.types.ts'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { DZ_STEPPER_KEY } from './DzStepper.types.ts'
import DzStepper from './DzStepper.vue'
import DzStepperItem from './DzStepperItem.vue'

/** Two ticks: one for the model write, one for anything awaiting it. */
async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function mountStepper(props: Record<string, unknown> = {}) {
  return mount(DzStepper, {
    props: { modelValue: 0, ...props },
    slots: {
      default: () => [
        h(DzStepperItem, { title: 'Account' }),
        h(DzStepperItem, { title: 'Profile' }),
        h(DzStepperItem, { title: 'Review' }),
      ],
    },
  })
}

/**
 * Reaches the stepper's own `setActiveStep` — the function `DzStepperItem`
 * calls, and the one the guard lives in.
 *
 * The first version of these two tests clicked an item and then asserted
 * conditionally*, `if (guard was called)`. That passes whether or not the
 * guard exists, which makes it a test that cannot fail. Driving the context is
 * the real path and it either runs or throws.
 */
function setActiveStep(wrapper: ReturnType<typeof mountStepper>, index: number): void {
  const provides = (wrapper.vm.$ as unknown as { provides: Record<symbol, unknown> }).provides
  const context = provides[DZ_STEPPER_KEY as unknown as symbol] as DzStepperContext
  expect(context, 'stepper context not provided').toBeDefined()
  context.setActiveStep(index)
}

describe('dzStepper — beforeChange guard', () => {
  it('advances when the host permits it', async () => {
    const beforeChange = vi.fn(() => true)
    const wrapper = mountStepper({ beforeChange })

    setActiveStep(wrapper, 1)
    await flush()

    expect(beforeChange).toHaveBeenCalledWith(0, 1)
    expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('blocked')).toBeUndefined()
  })

  it('blocks the change and says why when the guard returns false', async () => {
    const beforeChange = vi.fn(() => false)
    const wrapper = mountStepper({ beforeChange })

    setActiveStep(wrapper, 1)
    await flush()

    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('blocked')?.at(-1)).toEqual([0, 1, 'guard'])
  })

  it('waits for an async guard rather than advancing and rolling back', async () => {
    // Validation is usually async, and a stepper that moved first and undid it
    // afterwards would flash the next step at the user.
    let settle: (permitted: boolean) => void = () => {}
    const beforeChange = vi.fn(() => new Promise<boolean>((resolve) => {
      settle = resolve
    }))
    const wrapper = mountStepper({ beforeChange })

    setActiveStep(wrapper, 1)
    await flush()
    expect(wrapper.emitted('change')).toBeUndefined()

    settle(true)
    await flush()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
  })

  it('is never told what validation is — only whether the move is allowed', () => {
    // The guard's signature is two step indices and a boolean back. Anything
    // richer would put form semantics into a navigation primitive, which is
    // this packet's stop condition.
    const beforeChange = vi.fn(() => true)
    const wrapper = mountStepper({ beforeChange })

    setActiveStep(wrapper, 2)

    expect(beforeChange).toHaveBeenCalledWith(0, 2)
    expect(beforeChange.mock.calls[0]).toHaveLength(2)
  })
})

describe('dzStepper — linear', () => {
  it('allows the next step', async () => {
    const wrapper = mountStepper({ linear: true })
    setActiveStep(wrapper, 1)
    await flush()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
  })

  it('refuses a jump past the furthest step reached', async () => {
    const wrapper = mountStepper({ linear: true })
    setActiveStep(wrapper, 2)
    await flush()

    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('blocked')?.at(-1)).toEqual([0, 2, 'linear'])
  })

  it('lets the user go back, and then forward again to where they had reached', async () => {
    // "Linear" to a person filling in a form means "you cannot skip ahead",
    // not "you may only ever move one step at a time".
    const wrapper = mountStepper({ linear: true, modelValue: 2 })
    await wrapper.setProps({ modelValue: 2 })

    setActiveStep(wrapper, 0)
    await flush()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([0])

    await wrapper.setProps({ modelValue: 0 })
    setActiveStep(wrapper, 2)
    await flush()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])
  })

  it('does nothing at all when linear is off, which is the default', async () => {
    const wrapper = mountStepper()
    setActiveStep(wrapper, 2)
    await flush()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])
  })
})

describe('dzStepper — revealItem', () => {
  it('moves to the step and announces when its panel has rendered', async () => {
    const wrapper = mountStepper()
    const vm = wrapper.vm as unknown as { revealItem: (i: number) => Promise<void> }

    await vm.revealItem(2)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual([2])
  })

  it('announces revealed *after* the change, not instead of it', async () => {
    const wrapper = mountStepper()
    const vm = wrapper.vm as unknown as { revealItem: (i: number) => Promise<void> }

    await vm.revealItem(1)

    expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual([1])
  })

  it('ignores the guard, because it is how a form takes the user to an error', async () => {
    // A guard exists to stop the user advancing past an invalid step. Applying
    // it to a reveal would trap them on that step with the error out of reach.
    const beforeChange = vi.fn(() => false)
    const wrapper = mountStepper({ beforeChange })
    const vm = wrapper.vm as unknown as { revealItem: (i: number) => Promise<void> }

    await vm.revealItem(2)

    expect(beforeChange).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('does nothing when the step is already active', async () => {
    const wrapper = mountStepper({ modelValue: 1 })
    const vm = wrapper.vm as unknown as { revealItem: (i: number) => Promise<void> }

    await vm.revealItem(1)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // …but still announces, so a caller can focus without special-casing it.
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual([1])
  })
})
