import { mount } from '@vue/test-utils'
/**
 * DzAccordionItem — Contract Spec v1 conformance tests.
 *
 * DzAccordionItem requires AccordionRootContext from Reka UI via DzAccordion.
 * All tests mount via DzAccordion to satisfy the inject contract.
 */
import { describe, expect, it } from 'vitest'
import DzAccordion from './DzAccordion.vue'
import DzAccordionItem from './DzAccordionItem.vue'

const wrapItem = (itemAttrs: Record<string, unknown> = {}, slotContent = 'Content') =>
  mount(DzAccordion, {
    props: { type: 'single', collapsible: true },
    slots: {
      default: {
        components: { DzAccordionItem },
        template: `<DzAccordionItem value="item-1" v-bind='${JSON.stringify(itemAttrs)}'>${slotContent}</DzAccordionItem>`,
      },
    },
  })

describe('dzAccordionItem — Contract Spec v1', () => {
  it('renders without errors inside DzAccordion', () => {
    const wrapper = wrapItem()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with a value prop — mounts without throwing', () => {
    expect(() => wrapItem({ value: 'section-a' })).not.toThrow()
  })

  it('accepts disabled prop without throwing', () => {
    expect(() => wrapItem({ disabled: true })).not.toThrow()
  })

  it('renders default slot content', () => {
    const wrapper = wrapItem({}, '<div data-testid="body">Body</div>')
    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAccordion, {
      props: { type: 'single', collapsible: true },
      slots: {
        default: {
          components: { DzAccordionItem },
          template: `<DzAccordionItem value="x" class="custom-class">Content</DzAccordionItem>`,
        },
      },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
