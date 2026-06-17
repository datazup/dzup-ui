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

describe('dzAccordion — open/close behavior', () => {
  /** Reads the data-state of each trigger button (open | closed). */
  function triggerStates(wrapper: ReturnType<typeof mountAccordion>): string[] {
    return wrapper.findAll('button[data-state]').map(btn => btn.attributes('data-state') ?? '')
  }

  it('single mode: opening a second item closes the first', async () => {
    const wrapper = mountAccordion({ type: 'single', collapsible: true })
    const triggers = wrapper.findAll('button[data-state]')

    await triggers[0]!.trigger('click')
    expect(triggerStates(wrapper)).toEqual(['open', 'closed'])

    await triggers[1]!.trigger('click')
    expect(triggerStates(wrapper)).toEqual(['closed', 'open'])
  })

  it('single + collapsible: clicking the open item closes it', async () => {
    const wrapper = mountAccordion({ type: 'single', collapsible: true })
    const trigger = wrapper.find('button[data-state]')

    await trigger.trigger('click')
    expect(trigger.attributes('data-state')).toBe('open')

    await trigger.trigger('click')
    expect(trigger.attributes('data-state')).toBe('closed')
  })

  it('single (collapsible defaults on): clicking the open item closes it without an explicit prop', async () => {
    const wrapper = mountAccordion({ type: 'single' })
    const trigger = wrapper.find('button[data-state]')

    await trigger.trigger('click')
    expect(trigger.attributes('data-state')).toBe('open')

    await trigger.trigger('click')
    expect(trigger.attributes('data-state')).toBe('closed')
  })

  it('multiple mode: opening a second item keeps the first open', async () => {
    const wrapper = mountAccordion({ type: 'multiple' })
    const triggers = wrapper.findAll('button[data-state]')

    await triggers[0]!.trigger('click')
    await triggers[1]!.trigger('click')
    expect(triggerStates(wrapper)).toEqual(['open', 'open'])
  })

  it('emits change with the active value', async () => {
    const wrapper = mountAccordion({ type: 'single', collapsible: true })
    await wrapper.find('button[data-state]').trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual(['item-1'])
  })
})
