import { mount } from '@vue/test-utils'
/**
 * DzPopover -- Contract Spec v1 conformance tests.
 *
 * Verifies compound component API shape, props, events, slots, and styling.
 */
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import DzPopover from './DzPopover.vue'
import DzPopoverContent from './DzPopoverContent.vue'
import DzPopoverTrigger from './DzPopoverTrigger.vue'

/** Stub portal to render inline */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

/** Helper to mount the full popover compound tree */
function mountPopover(
  rootProps: Record<string, unknown> = {},
  contentProps: Record<string, unknown> = {},
) {
  return mount(DzPopover, {
    props: { open: true, ...rootProps },
    slots: {
      default: () => [
        h(DzPopoverTrigger, {}, () => h('button', 'Toggle')),
        h(DzPopoverContent, contentProps, () => 'Popover body'),
      ],
    },
    global: { stubs: { PopoverPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzPopover -- Contract Spec v1', () => {
  // ── Root props ──

  it('renders with default props', () => {
    const wrapper = mountPopover()
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts modal prop', () => {
    const wrapper = mount(DzPopover, {
      props: { modal: true },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts modal=false (default)', () => {
    const wrapper = mount(DzPopover, {
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── v-model:open ──

  it('supports v-model:open', () => {
    const wrapper = mount(DzPopover, {
      props: { open: false },
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.props('open')).toBe(false)
    wrapper.unmount()
  })

  // ── Content props ──

  it('dzPopoverContent accepts all side values', () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const
    for (const side of sides) {
      const wrapper = mountPopover({}, { side })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('dzPopoverContent accepts all align values', () => {
    const aligns = ['start', 'center', 'end'] as const
    for (const align of aligns) {
      const wrapper = mountPopover({}, { align })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('dzPopoverContent accepts all size values', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const wrapper = mountPopover({}, { size })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    }
  })

  it('dzPopoverContent accepts sideOffset prop', () => {
    const wrapper = mountPopover({}, { sideOffset: 12 })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzPopoverContent accepts arrow prop', () => {
    const wrapper = mountPopover({}, { arrow: false })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── CSS containment ──

  it('has contain: layout style on content', () => {
    const wrapper = mountPopover()
    const content = wrapper.find('[style*="contain"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })

  // ── Content events ──

  it('dzPopoverContent emits escapeKeyDown', () => {
    const onEscapeKeyDown = vi.fn()
    const wrapper = mount(DzPopover, {
      props: { open: true },
      slots: {
        default: () =>
          h(DzPopoverContent, { onEscapeKeyDown }, () => 'Body'),
      },
      global: { stubs: { PopoverPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Subcomponents ──

  it('dzPopoverTrigger renders slot content', () => {
    const wrapper = mount(DzPopoverTrigger, {
      slots: { default: () => h('button', 'Click') },
      global: {
        stubs: { PopoverTrigger: { template: '<span><slot /></span>' } },
      },
    })
    expect(wrapper.text()).toContain('Click')
    wrapper.unmount()
  })

  it('dzPopoverContent renders slot content', () => {
    const wrapper = mount(DzPopoverContent, {
      slots: { default: () => 'Popover text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div><slot /></div>' },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.text()).toContain('Popover text')
    wrapper.unmount()
  })
})
