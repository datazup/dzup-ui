/**
 * Reveal-then-focus across the three disclosure primitives (TASK-FORM-OSS-04).
 *
 * The defect these close is one of the quietest in a form: a wizard or tabbed
 * form validates on submit, finds its first invalid field inside a panel that
 * is not currently shown, and calls `focus()` on it. The element is not in the
 * document, `focus()` does nothing, no error is raised — and the user is told
 * "please fix the errors" with no way to reach them.
 *
 * Each container can only do half of it: open the right panel and say when the
 * panel has rendered. `useRevealAndFocus` does the other half. The last test
 * here is the two halves together, which is the only form that proves the
 * defect is actually gone.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, ref } from 'vue'
import { revealAndFocus } from '../../composables/useRevealAndFocus/useRevealAndFocus.ts'
import DzAccordion from '../data/DzAccordion.vue'
import DzAccordionContent from '../data/DzAccordionContent.vue'
import DzAccordionItem from '../data/DzAccordionItem.vue'
import DzAccordionTrigger from '../data/DzAccordionTrigger.vue'
import DzTabContent from './DzTabContent.vue'
import DzTabList from './DzTabList.vue'
import DzTabs from './DzTabs.vue'
import DzTabTrigger from './DzTabTrigger.vue'

interface Revealable { revealItem: (id: string) => Promise<void> }

function mountTabs(modelValue = 'account') {
  return mount(DzTabs, {
    props: { modelValue },
    attachTo: document.body,
    slots: {
      default: () => [
        h(DzTabList, () => [
          h(DzTabTrigger, { value: 'account' }, () => 'Account'),
          h(DzTabTrigger, { value: 'billing' }, () => 'Billing'),
        ]),
        h(DzTabContent, { value: 'account' }, () => h('input', { id: 'account-field' })),
        h(DzTabContent, { value: 'billing' }, () => h('input', { id: 'billing-field' })),
      ],
    },
  })
}

describe('dzTabs — revealItem', () => {
  it('activates the tab and announces when its panel has rendered', async () => {
    const wrapper = mountTabs()
    await (wrapper.vm as unknown as Revealable).revealItem('billing')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['billing'])
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual(['billing'])
    wrapper.unmount()
  })

  it('announces even when the tab is already active', async () => {
    // A caller focusing after a reveal should not have to special-case "it was
    // already open" — that branch is where the missing focus comes back.
    const wrapper = mountTabs('billing')
    await (wrapper.vm as unknown as Revealable).revealItem('billing')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual(['billing'])
    wrapper.unmount()
  })

  it('puts the revealed field in the document, which is what focus needs', async () => {
    const wrapper = mountTabs()
    expect(document.querySelector('#billing-field')).toBeNull()

    await (wrapper.vm as unknown as Revealable).revealItem('billing')
    await wrapper.vm.$nextTick()

    expect(document.querySelector('#billing-field')).not.toBeNull()
    wrapper.unmount()
  })
})

describe('dzAccordion — revealItem', () => {
  function mountAccordion(props: Record<string, unknown> = {}) {
    return mount(DzAccordion, {
      props: { modelValue: '', ...props },
      attachTo: document.body,
      slots: {
        default: () => ['shipping', 'payment'].map(value =>
          h(DzAccordionItem, { value, key: value }, {
            default: () => [
              h(DzAccordionTrigger, () => value),
              h(DzAccordionContent, () => h('input', { id: `${value}-field` })),
            ],
          }),
        ),
      },
    })
  }

  it('opens the item and announces when its panel has rendered', async () => {
    const wrapper = mountAccordion()
    await (wrapper.vm as unknown as Revealable).revealItem('payment')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['payment'])
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual(['payment'])
    wrapper.unmount()
  })

  it('adds to the open set in multiple mode instead of replacing it', async () => {
    // Revealing one field's panel must not close another the user is reading.
    const wrapper = mountAccordion({ type: 'multiple', modelValue: ['shipping'] })
    await (wrapper.vm as unknown as Revealable).revealItem('payment')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['shipping', 'payment']])
    wrapper.unmount()
  })

  it('does not duplicate an item that is already open', async () => {
    const wrapper = mountAccordion({ type: 'multiple', modelValue: ['payment'] })
    await (wrapper.vm as unknown as Revealable).revealItem('payment')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('revealed')?.at(-1)).toEqual(['payment'])
    wrapper.unmount()
  })
})

describe('reveal then focus, which is the whole point', () => {
  it('focuses a field that was in a hidden tab a moment ago', async () => {
    const wrapper = mountTabs()
    const container = ref<HTMLElement | null>(wrapper.element as HTMLElement)

    // Before: the field does not exist, so focusing it is a silent no-op.
    expect(document.querySelector('#billing-field')).toBeNull()

    await (wrapper.vm as unknown as Revealable).revealItem('billing')
    const focused = await revealAndFocus(container, '#billing-field', { reducedMotion: true })

    expect(focused).not.toBeNull()
    expect(document.activeElement).toBe(document.querySelector('#billing-field'))
    wrapper.unmount()
  })
})
