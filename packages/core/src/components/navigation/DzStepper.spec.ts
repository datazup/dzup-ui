import { mount } from '@vue/test-utils'
/**
 * DzStepper — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzStepper from './DzStepper.vue'
import DzStepperItem from './DzStepperItem.vue'

describe('dzStepper — Unit Tests', () => {
  it('renders a <div> with role="group"', () => {
    const wrapper = mount(DzStepper, {
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('has aria-label for accessibility', () => {
    const wrapper = mount(DzStepper, {
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Progress steps')
  })

  it('renders stepper items', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => [
          h(DzStepperItem, { title: 'Account' }),
          h(DzStepperItem, { title: 'Profile' }),
        ],
      },
    })
    expect(wrapper.findAllComponents(DzStepperItem)).toHaveLength(2)
  })

  it('renders step titles', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => h(DzStepperItem, { title: 'Account Setup' }),
      },
    })
    expect(wrapper.text()).toContain('Account Setup')
  })

  it('renders step description', () => {
    const wrapper = mount(DzStepper, {
      slots: {
        default: () => h(DzStepperItem, { title: 'Step', description: 'Details here' }),
      },
    })
    expect(wrapper.text()).toContain('Details here')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzStepper, {
      attrs: { class: 'my-class' },
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.classes()).toContain('my-class')
  })

  it('supports custom aria-label', () => {
    const wrapper = mount(DzStepper, {
      props: { ariaLabel: 'Checkout progress' },
      slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('Checkout progress')
  })

  describe('clickable navigation', () => {
    it('does not mark items clickable by default', async () => {
      const wrapper = mount(DzStepper, {
        props: { modelValue: 2 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A' }),
            h(DzStepperItem, { title: 'B' }),
            h(DzStepperItem, { title: 'C' }),
          ],
        },
      })
      await nextTick()
      expect(wrapper.find('[data-clickable]').exists()).toBe(false)
    })

    it('exposes role=button and tabindex on completed/active items when clickable', async () => {
      const wrapper = mount(DzStepper, {
        props: { clickable: true, modelValue: 1 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A' }),
            h(DzStepperItem, { title: 'B' }),
            h(DzStepperItem, { title: 'C' }),
          ],
        },
      })
      await nextTick()
      const reachable = wrapper.findAll('[data-clickable]')
      // active + completed = 2 reachable; upcoming (C) is not clickable
      expect(reachable.length).toBe(2)
      reachable.forEach((el) => {
        expect(el.attributes('role')).toBe('button')
        expect(el.attributes('tabindex')).toBe('0')
      })
    })

    it('updates v-model and emits change + navigate on click', async () => {
      const wrapper = mount(DzStepper, {
        props: { clickable: true, modelValue: 2 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A' }),
            h(DzStepperItem, { title: 'B' }),
            h(DzStepperItem, { title: 'C' }),
          ],
        },
      })
      await nextTick()
      const reachable = wrapper.findAll('[data-clickable]')
      await reachable[0]!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
      expect(wrapper.emitted('change')?.[0]).toEqual([0])
      expect(wrapper.emitted('navigate')?.[0]).toEqual([0])
    })

    it('does not navigate to upcoming steps', async () => {
      const wrapper = mount(DzStepper, {
        props: { clickable: true, modelValue: 0 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A' }),
            h(DzStepperItem, { title: 'B' }),
            h(DzStepperItem, { title: 'C' }),
          ],
        },
      })
      await nextTick()
      // The last item is upcoming and should not be data-clickable
      const items = wrapper.findAllComponents(DzStepperItem)
      const lastEl = items[2]!.element as HTMLElement
      expect(lastEl.hasAttribute('data-clickable')).toBe(false)
      await items[2]!.trigger('click')
      expect(wrapper.emitted('navigate')).toBeUndefined()
    })

    it.each([
      ['Enter', 'Enter'],
      ['Space', ' '],
    ])('%s activates a clickable step', async (_label, key) => {
      const wrapper = mount(DzStepper, {
        props: { clickable: true, modelValue: 2 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A' }),
            h(DzStepperItem, { title: 'B' }),
            h(DzStepperItem, { title: 'C' }),
          ],
        },
      })
      await nextTick()
      const reachable = wrapper.findAll('[data-clickable]')
      await reachable[0]!.trigger('keydown', { key })
      expect(wrapper.emitted('navigate')?.length).toBe(1)
      expect(wrapper.emitted('navigate')?.[0]).toEqual([0])
    })

    it('per-item clickable prop overrides parent', async () => {
      const wrapper = mount(DzStepper, {
        props: { clickable: false, modelValue: 1 },
        slots: {
          default: () => [
            h(DzStepperItem, { title: 'A', clickable: true }),
            h(DzStepperItem, { title: 'B' }),
          ],
        },
      })
      await nextTick()
      const reachable = wrapper.findAll('[data-clickable]')
      // Only the per-item-enabled completed step opts in
      expect(reachable.length).toBe(1)
    })
  })
})

/**
 * TASK-N5-02 — `ariaLabelledby` and `ariaDescribedby` were declared and never
 * forwarded.
 *
 * Both are supported on `role="group"`, which is what the stepper root is, and
 * `aria-describedby` is global to every role. The root already carried
 * `aria-label`; refusing the id-reference form of the same name on the same
 * element was incoherent. Implemented, not removed — a `patch` under
 * `packages/contracts/VERSIONING.md` §3.
 */
describe('dzStepper — identity props', () => {
  const withStep = { slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) } }

  it('forwards ariaLabelledby to the group root', () => {
    const wrapper = mount(DzStepper, { props: { ariaLabelledby: 'wizard-heading' }, ...withStep })
    expect(wrapper.attributes('aria-labelledby')).toBe('wizard-heading')
  })

  it('forwards ariaDescribedby to the group root', () => {
    const wrapper = mount(DzStepper, { props: { ariaDescribedby: 'wizard-hint' }, ...withStep })
    expect(wrapper.attributes('aria-describedby')).toBe('wizard-hint')
  })

  /**
   * Two names on one element is not an error — accname prefers `aria-labelledby`
   * — but shipping a fallback literal that the browser is guaranteed to discard
   * is noise in the DOM and in every snapshot of it. The default yields.
   */
  it('drops the default aria-label when ariaLabelledby names the group instead', () => {
    const wrapper = mount(DzStepper, { props: { ariaLabelledby: 'wizard-heading' }, ...withStep })
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('keeps an explicit ariaLabel even alongside ariaLabelledby', () => {
    const wrapper = mount(DzStepper, {
      props: { ariaLabel: 'Checkout', ariaLabelledby: 'wizard-heading' },
      ...withStep,
    })
    expect(wrapper.attributes('aria-label')).toBe('Checkout')
    expect(wrapper.attributes('aria-labelledby')).toBe('wizard-heading')
  })

  it('keeps the default aria-label when nothing else names the group', () => {
    const wrapper = mount(DzStepper, withStep)
    expect(wrapper.attributes('aria-label')).toBe('Progress steps')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
