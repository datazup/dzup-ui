/**
 * The nine ARIA prop declarations removed by TASK-N5-02, asserted against the
 * real components.
 *
 * Six controls declared twelve identity props between them and honoured none of
 * them. Nine were removed and three were implemented; this file covers the
 * removals, and each implementation is asserted beside its own component.
 *
 * Why one cross-family file rather than nine lines spread across six specs: the
 * thing under test is a **policy decision**, not a component behaviour. A
 * removal has three observable consequences and all three have to hold together
 * or the removal is half-done:
 *
 *   1. the component no longer treats the value as a prop — it falls through to
 *      `$attrs`, and therefore onto the root element, which is a *different*
 *      wrong answer from the old silent swallow rather than no answer;
 *   2. a dev-mode warning names the removal so (1) is discoverable;
 *   3. nothing else about the element changed.
 *
 * Deliberately **not** in `tests/a11y/`: `packages/tooling/src/forms/probe.ts`
 * scans that directory to decide the readiness matrix's `specs a/…` column, so a
 * file dropped there would move a matrix cell as a side effect of testing a
 * different thing. A gate should not be able to be nudged by where a spec file
 * is put.
 */

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import DzOrderList from '../src/components/data/DzOrderList.vue'
import DzFloatLabel from '../src/components/forms/DzFloatLabel.vue'
import DzInplace from '../src/components/forms/DzInplace.vue'
import DzGrid from '../src/components/layout/DzGrid.vue'
import DzStack from '../src/components/layout/DzStack.vue'
import DzStepper from '../src/components/navigation/DzStepper.vue'
import DzStepperItem from '../src/components/navigation/DzStepperItem.vue'
import DzTabs from '../src/components/navigation/DzTabs.vue'
import { resetRemovedPropWarnings } from '../src/utilities/warnRemovedProp.ts'

/**
 * Every removal, as data.
 *
 * A table rather than nine hand-written tests, because the interesting failure
 * is "one of them was re-declared" and a table is the only shape that keeps
 * catching that as the list changes.
 */
const REMOVALS = [
  { name: 'DzGrid', component: DzGrid, prop: 'ariaInvalid', attr: 'aria-invalid', props: {}, slots: {} },
  { name: 'DzStack', component: DzStack, prop: 'ariaInvalid', attr: 'aria-invalid', props: {}, slots: {} },
  { name: 'DzTabs', component: DzTabs, prop: 'ariaInvalid', attr: 'aria-invalid', props: {}, slots: {} },
  {
    name: 'DzStepper',
    component: DzStepper,
    prop: 'ariaInvalid',
    attr: 'aria-invalid',
    props: {},
    slots: { default: () => h(DzStepperItem, { title: 'Step 1' }) },
  },
  { name: 'DzInplace', component: DzInplace, prop: 'ariaInvalid', attr: 'aria-invalid', props: { value: 'x' }, slots: {} },
  { name: 'DzFloatLabel', component: DzFloatLabel, prop: 'ariaLabel', attr: 'aria-label', props: { label: 'Email' }, slots: {} },
  { name: 'DzFloatLabel', component: DzFloatLabel, prop: 'ariaLabelledby', attr: 'aria-labelledby', props: { label: 'Email' }, slots: {} },
  { name: 'DzFloatLabel', component: DzFloatLabel, prop: 'ariaDescribedby', attr: 'aria-describedby', props: { label: 'Email' }, slots: {} },
  { name: 'DzFloatLabel', component: DzFloatLabel, prop: 'ariaInvalid', attr: 'aria-invalid', props: { label: 'Email' }, slots: {} },
] as const

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetRemovedPropWarnings()
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('removed ARIA props — the declaration is gone', () => {
  it('removes nine declarations across six controls', () => {
    expect(REMOVALS).toHaveLength(9)
    expect(new Set(REMOVALS.map(r => r.name)).size).toBe(6)
  })

  for (const removal of REMOVALS) {
    it(`${removal.name} warns in dev when \`${removal.prop}\` is still passed`, () => {
      mount(removal.component as never, {
        props: removal.props as never,
        attrs: { [removal.attr]: removal.prop === 'ariaInvalid' ? 'true' : 'ref-id' },
        slots: removal.slots as never,
      })
      const messages = warn.mock.calls.map(c => String(c[0]))
      expect(
        messages.some(m => m.includes(`${removal.name} no longer accepts \`${removal.prop}\``)),
        `expected a removal warning for ${removal.name}.${removal.prop}, got: ${messages.join(' | ')}`,
      ).toBe(true)
    })
  }

  it('says nothing when no removed prop is passed', () => {
    mount(DzGrid, { props: { cols: 2 } })
    mount(DzStack, {})
    expect(warn).not.toHaveBeenCalled()
  })
})

/**
 * The consequence the warning exists to name.
 *
 * Before the removal the binding was declared, unread and therefore invisible.
 * After it, Vue routes it into `$attrs` and every one of these components
 * spreads `$attrs` onto its root — so the attribute *appears*. That is not a
 * defect to be hidden; it is the price of the removal, and it is asserted here
 * so nobody later "fixes" it by silently stripping a consumer's attribute.
 */
describe('removed ARIA props — the value now falls through to the root', () => {
  it('renders a passed aria-invalid on DzGrid as a plain attribute', () => {
    const wrapper = mount(DzGrid, { attrs: { 'aria-invalid': 'true' } })
    expect(wrapper.attributes('aria-invalid')).toBe('true')
  })

  it('renders a passed aria-describedby on the DzFloatLabel wrapper, not on the control', () => {
    const wrapper = mount(DzFloatLabel, {
      props: { label: 'Email' },
      attrs: { 'aria-describedby': 'hint' },
      slots: { default: () => h('input') },
    })
    expect(wrapper.attributes('aria-describedby')).toBe('hint')
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})

/**
 * DzOrderList keeps all four of its identity props: they are read, and its `<ul>`
 * carries them. Included here so the removal table cannot be mistaken for "every
 * component that inherits BaseAccessibilityProps lost something".
 */
describe('controls that kept their identity props', () => {
  it('keeps DzOrderList forwarding aria-label, aria-labelledby and aria-describedby to its list', () => {
    const wrapper = mount(DzOrderList, {
      props: {
        value: [{ id: 1 }],
        dataKey: 'id',
        ariaLabel: 'Ranked items',
        ariaLabelledby: 'h1',
        ariaDescribedby: 'hint',
      },
    })
    const list = wrapper.find('ul')
    expect(list.attributes('aria-label')).toBe('Ranked items')
    expect(list.attributes('aria-labelledby')).toBe('h1')
    expect(list.attributes('aria-describedby')).toBe('hint')
    expect(warn).not.toHaveBeenCalled()
  })
})
