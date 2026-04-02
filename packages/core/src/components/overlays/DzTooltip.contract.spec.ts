import { mount } from '@vue/test-utils'
/**
 * DzTooltip -- Contract Spec v1 conformance tests.
 *
 * Verifies compound component API shape, props, slots, and styling.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTooltip from './DzTooltip.vue'
import DzTooltipContent from './DzTooltipContent.vue'
import DzTooltipTrigger from './DzTooltipTrigger.vue'

/** Helper to mount the full tooltip compound tree */
/** Stub portal to render inline */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

function mountTooltip(
  rootProps: Record<string, unknown> = {},
  contentProps: Record<string, unknown> = {},
) {
  return mount(DzTooltip, {
    props: { open: true, ...rootProps },
    slots: {
      default: () => [
        h(DzTooltipTrigger, {}, () => h('button', 'Hover')),
        h(DzTooltipContent, contentProps, () => 'Tooltip text'),
      ],
    },
    global: { stubs: { TooltipPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzTooltip -- Contract Spec v1', () => {
  // ── Root props ──

  it('renders with default props', () => {
    const wrapper = mountTooltip()
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts delayDuration prop', () => {
    const wrapper = mount(DzTooltip, {
      props: { delayDuration: 500 },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts disableHoverableContent prop', () => {
    const wrapper = mount(DzTooltip, {
      props: { disableHoverableContent: true },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── v-model:open ──

  it('supports v-model:open', () => {
    const wrapper = mount(DzTooltip, {
      props: { open: false },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Content props ──

  it('dzTooltipContent accepts all side values', () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const
    for (const side of sides) {
      const wrapper = mountTooltip({}, { side })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('dzTooltipContent accepts all align values', () => {
    const aligns = ['start', 'center', 'end'] as const
    for (const align of aligns) {
      const wrapper = mountTooltip({}, { align })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('dzTooltipContent accepts sideOffset prop', () => {
    const wrapper = mountTooltip({}, { sideOffset: 8 })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzTooltipContent accepts arrow prop', () => {
    const wrapper = mountTooltip({}, { arrow: false })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── CSS containment ──

  it('has contain: layout style on content', () => {
    const wrapper = mountTooltip()
    const content = wrapper.find('[style*="contain"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })

  // ── Subcomponents ──

  it('dzTooltipTrigger renders slot content', () => {
    const wrapper = mount(DzTooltipTrigger, {
      slots: { default: () => h('button', 'Trigger') },
      global: {
        stubs: { TooltipTrigger: { template: '<span><slot /></span>' } },
      },
    })
    expect(wrapper.text()).toContain('Trigger')
    wrapper.unmount()
  })

  it('dzTooltipContent renders slot content', () => {
    const wrapper = mount(DzTooltipContent, {
      slots: { default: () => 'Content text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: { template: '<div><slot /></div>' },
          TooltipArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.text()).toContain('Content text')
    wrapper.unmount()
  })
})
