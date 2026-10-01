import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzCollapse — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { anatomy as collapseAnatomy } from './DzCollapse.anatomy.ts'
import DzCollapse from './DzCollapse.vue'

describe('dzCollapse — Unit Tests', () => {
  it('renders a <div> with role="region"', () => {
    const wrapper = mount(DzCollapse, { slots: { default: 'content' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('sets data-state="closed" when collapsed', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-state')).toBe('closed')
  })

  it('sets data-state="open" when expanded', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('data-state')).toBe('open')
  })

  it('sets aria-hidden when collapsed', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('does not set aria-hidden when expanded', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('renders slot content', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: true },
      slots: { default: '<p>Inner content</p>' },
    })
    expect(wrapper.find('p').text()).toBe('Inner content')
  })

  it('applies overflow hidden style', () => {
    const wrapper = mount(DzCollapse, {
      props: { modelValue: false },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('style')).toContain('overflow')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzCollapse, {
      props: { id: 'collapse-1' },
      slots: { default: 'content' },
    })
    expect(wrapper.attributes('id')).toBe('collapse-1')
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F11` for this component's two
// `undetermined` rows.
//
// `DzCollapse` renders the REGION and nothing else — one `<div role="region">`
// and a `<slot />` — so the `when: 'trigger'` node is not merely slotted, it is
// the application's own sibling element. That is exactly what the anatomy already
// says (`keyboard: 'none'` on the RTL line: *"it handles no key; the trigger that
// owns the disclosure does"*), and it is why a source scan reports the two rows
// `undetermined` rather than backed or broken.
//
// The fixture is therefore a real disclosure: a consumer's `<button>` with
// `aria-expanded`/`aria-controls` beside the region it controls. That is the tree
// the contract is about, and it is the tree the assertion runs against.
// ---------------------------------------------------------------------------

/** A consumer-shaped disclosure: a trigger button and the region it controls. */
const Disclosure = defineComponent({
  components: { DzCollapse },
  setup() {
    const open = ref(false)
    function toggle(): void {
      open.value = !open.value
    }
    return { open, toggle }
  },
  template: `
    <div>
      <button
        type="button"
        data-testid="trigger"
        :aria-expanded="open"
        aria-controls="disclosure-region"
        @click="toggle"
      >Details</button>
      <DzCollapse id="disclosure-region" v-model="open">
        <p data-testid="body">Body</p>
      </DzCollapse>
    </div>
  `,
})

describe('dzCollapse — the declared trigger keys, asserted in a real disclosure', () => {
  it('has a platform owner for both declared keys once a trigger is present', () => {
    const wrapper = mount(Disclosure, { attachTo: document.body })
    // `conditions: ['trigger']` admits the single-word `when`: it names the
    // disclosure's trigger, which is a node of the pattern rather than a part of
    // this component (RESIDUAL-12 §4 `F14`, settled in `KeyboardCheckOptions`).
    expectKeyboardContract(wrapper, collapseAnatomy, {
      platform: ['Enter', ' '],
      conditions: ['trigger'],
    })
    wrapper.unmount()
  })

  it('expands and collapses the region through the activation the keys produce', async () => {
    const wrapper = mount(Disclosure, { attachTo: document.body })
    const trigger = wrapper.get('[data-testid="trigger"]')
    const region = wrapper.get('[role="region"]')
    expect(region.attributes('data-state')).toBe('closed')

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      trigger.element.dispatchEvent(event)
      // Nothing in the disclosure swallows the key — the platform's activation is
      // what the row promises, and jsdom does not synthesise it.
      expect(event.defaultPrevented, `\`${key}\` was intercepted`).toBe(false)
    }

    ;(trigger.element as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(region.attributes('data-state')).toBe('open')
    expect(region.attributes('aria-hidden')).toBeUndefined()

    ;(trigger.element as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(region.attributes('data-state')).toBe('closed')
    expect(region.attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('keeps the trigger and the region joined, which is what makes the keys reach it', () => {
    const wrapper = mount(Disclosure, { attachTo: document.body })
    const trigger = wrapper.get('[data-testid="trigger"]')
    expect(trigger.attributes('aria-controls')).toBe('disclosure-region')
    expect(wrapper.get('[role="region"]').attributes('id')).toBe('disclosure-region')
    wrapper.unmount()
  })
})
