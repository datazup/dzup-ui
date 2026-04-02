import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
/**
 * DzRadio — Contract Spec v1 conformance tests.
 */
import { defineComponent, h } from 'vue'
import DzRadio from './DzRadio.vue'
import DzRadioGroup from './DzRadioGroup.vue'

/**
 * Helper: mount DzRadio inside a DzRadioGroup (required by Reka UI).
 */
function mountRadioInGroup(radioProps: Record<string, unknown> = {}, radioAttrs: Record<string, unknown> = {}, slotContent = 'Option 1') {
  const Wrapper = defineComponent({
    render() {
      return h(DzRadioGroup, { modelValue: '' }, {
        default: () => h(DzRadio, { value: 'option1', ...radioProps, ...radioAttrs }, {
          default: () => slotContent,
        }),
      })
    },
  })
  return mount(Wrapper)
}

describe('dzRadio — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountRadioInGroup()
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountRadioInGroup({ size })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('renders default slot content (label)', () => {
    const wrapper = mountRadioInGroup({}, {}, 'My Label')
    expect(wrapper.text()).toContain('My Label')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountRadioInGroup({}, { class: 'custom-class' })
    expect(wrapper.html()).toContain('custom-class')
  })
})
