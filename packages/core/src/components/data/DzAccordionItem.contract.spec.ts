import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
/**
 * DzAccordionItem — Contract Spec v1 conformance tests.
 *
 * DzAccordionItem requires AccordionRootContext from Reka UI via DzAccordion.
 * All tests mount via DzAccordion to satisfy the inject contract.
 */
import { defineComponent } from 'vue'
import DzAccordion from './DzAccordion.vue'
import DzAccordionItem from './DzAccordionItem.vue'

function makeSlot(attrs: Record<string, unknown> = {}, content = 'Content') {
  return defineComponent({
    components: { DzAccordionItem },
    setup: () => ({ attrs, content }),
    template: `<DzAccordionItem value="item-1" v-bind="attrs">{{ content }}</DzAccordionItem>`,
  })
}

describe('dzAccordionItem — Contract Spec v1', () => {
  it('renders without errors inside DzAccordion', () => {
    const wrapper = mount(DzAccordion, {
      props: { type: 'single', collapsible: true },
      slots: { default: makeSlot() },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with a value prop — mounts without throwing', () => {
    expect(() =>
      mount(DzAccordion, {
        props: { type: 'single', collapsible: true },
        slots: { default: makeSlot() },
      }),
    ).not.toThrow()
  })

  it('accepts disabled prop without throwing', () => {
    expect(() =>
      mount(DzAccordion, {
        props: { type: 'single', collapsible: true },
        slots: { default: makeSlot({ disabled: true }) },
      }),
    ).not.toThrow()
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAccordion, {
      props: { type: 'single', collapsible: true },
      slots: { default: makeSlot({}, 'Body text') },
    })
    expect(wrapper.text()).toContain('Body text')
  })

  it('merges consumer class via cn()', () => {
    const SlotWithClass = defineComponent({
      components: { DzAccordionItem },
      template: `<DzAccordionItem value="x" class="custom-class">Content</DzAccordionItem>`,
    })
    const wrapper = mount(DzAccordion, {
      props: { type: 'single', collapsible: true },
      slots: { default: SlotWithClass },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
