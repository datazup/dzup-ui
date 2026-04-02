import { mount } from '@vue/test-utils'
/**
 * DzAccordion (compound, Reka UI) — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzAccordion from './DzAccordion.vue'
import DzAccordionContent from './DzAccordionContent.vue'
import DzAccordionItem from './DzAccordionItem.vue'
import DzAccordionTrigger from './DzAccordionTrigger.vue'

/** Helper to render a full accordion */
function mountAccordion(accordionProps = {}) {
  return mount(DzAccordion, {
    props: { type: 'single', collapsible: true, ...accordionProps },
    slots: {
      default: () => [
        h(DzAccordionItem, { value: 'item-1' }, {
          default: () => [
            h(DzAccordionTrigger, null, { default: () => 'Section 1' }),
            h(DzAccordionContent, null, { default: () => 'Content 1' }),
          ],
        }),
        h(DzAccordionItem, { value: 'item-2' }, {
          default: () => [
            h(DzAccordionTrigger, null, { default: () => 'Section 2' }),
            h(DzAccordionContent, null, { default: () => 'Content 2' }),
          ],
        }),
      ],
    },
  })
}

describe('dzAccordion', () => {
  it('renders successfully', () => {
    const wrapper = mountAccordion()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style', () => {
    const wrapper = mountAccordion()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mountAccordion({ ariaLabel: 'FAQ' })
    expect(wrapper.attributes('aria-label')).toBe('FAQ')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAccordion, {
      props: { type: 'single' },
      attrs: { class: 'my-accordion' },
      slots: {
        default: () =>
          h(DzAccordionItem, { value: 'a' }, {
            default: () => [
              h(DzAccordionTrigger, null, { default: () => 'T' }),
              h(DzAccordionContent, null, { default: () => 'C' }),
            ],
          }),
      },
    })
    expect(wrapper.classes()).toContain('my-accordion')
  })

  it('renders trigger text', () => {
    const wrapper = mountAccordion()
    expect(wrapper.text()).toContain('Section 1')
    expect(wrapper.text()).toContain('Section 2')
  })

  it('renders chevron icon in trigger', () => {
    const wrapper = mountAccordion()
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})

describe('dzAccordionItem', () => {
  it('renders within the accordion', () => {
    const wrapper = mountAccordion()
    const items = wrapper.findAllComponents(DzAccordionItem)
    expect(items).toHaveLength(2)
  })
})

describe('dzAccordionTrigger', () => {
  it('renders trigger content', () => {
    const wrapper = mountAccordion()
    const triggers = wrapper.findAllComponents(DzAccordionTrigger)
    expect(triggers).toHaveLength(2)
    expect(triggers[0]!.text()).toContain('Section 1')
  })
})

describe('dzAccordionContent', () => {
  it('renders content components', () => {
    const wrapper = mountAccordion()
    const contents = wrapper.findAllComponents(DzAccordionContent)
    expect(contents).toHaveLength(2)
  })
})
