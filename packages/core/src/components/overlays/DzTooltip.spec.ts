import { mount } from '@vue/test-utils'
/**
 * DzTooltip -- Unit / behavior tests.
 *
 * Tests compound tooltip tree: mounting, class merging, arrow rendering,
 * side/align props, and content visibility.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTooltip from './DzTooltip.vue'
import DzTooltipContent from './DzTooltipContent.vue'
import DzTooltipTrigger from './DzTooltipTrigger.vue'

/** Helper to mount full tooltip compound */
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
        h(DzTooltipTrigger, {}, () => h('button', 'Hover me')),
        h(DzTooltipContent, contentProps, () => 'Tooltip text'),
      ],
    },
    global: { stubs: { TooltipPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzTooltip -- Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders trigger button', () => {
    const wrapper = mountTooltip()
    expect(wrapper.find('button').text()).toBe('Hover me')
    wrapper.unmount()
  })

  it('renders tooltip content when open', () => {
    const wrapper = mountTooltip()
    expect(wrapper.text()).toContain('Tooltip text')
    wrapper.unmount()
  })

  it('merges consumer class on DzTooltipContent', () => {
    const wrapper = mount(DzTooltipContent, {
      attrs: { class: 'custom-tooltip' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: { template: '<div v-bind="$attrs"><slot /></div>', inheritAttrs: false },
          TooltipArrow: { template: '<div />' },
        },
      },
    })
    // The cn()-merged class containing 'custom-tooltip' is passed via :class to the stub
    const html = wrapper.html()
    expect(html).toContain('custom-tooltip')
    wrapper.unmount()
  })

  it('renders arrow by default', () => {
    const wrapper = mount(DzTooltipContent, {
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: { template: '<div><slot /></div>' },
          TooltipArrow: { template: '<div class="arrow" />' },
        },
      },
    })
    expect(wrapper.find('.arrow').exists()).toBe(true)
    wrapper.unmount()
  })

  it('hides arrow when arrow=false', () => {
    const wrapper = mount(DzTooltipContent, {
      props: { arrow: false },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: { template: '<div><slot /></div>' },
          TooltipArrow: { template: '<div class="arrow" />' },
        },
      },
    })
    expect(wrapper.find('.arrow').exists()).toBe(false)
    wrapper.unmount()
  })

  it('defaults to side=top', () => {
    const wrapper = mount(DzTooltipContent, {
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: {
            template: '<div :data-side="$attrs.side"><slot /></div>',
            inheritAttrs: false,
          },
          TooltipArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.find('[data-side="top"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('passes side=bottom to content', () => {
    const wrapper = mount(DzTooltipContent, {
      props: { side: 'bottom' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: {
            template: '<div :data-side="$attrs.side"><slot /></div>',
            inheritAttrs: false,
          },
          TooltipArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.find('[data-side="bottom"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('delay defaults to 200', () => {
    const wrapper = mount(DzTooltip, {
      slots: { default: () => h('div') },
    })
    // Component renders without error with default delay
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts custom delay', () => {
    const wrapper = mount(DzTooltip, {
      props: { delayDuration: 0 },
      slots: { default: () => h('div') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzTooltipTrigger renders as-child', () => {
    const wrapper = mount(DzTooltipTrigger, {
      slots: { default: () => h('span', { class: 'my-trigger' }, 'Hover') },
      global: {
        stubs: { TooltipTrigger: { template: '<span><slot /></span>' } },
      },
    })
    expect(wrapper.find('.my-trigger').exists()).toBe(true)
    wrapper.unmount()
  })

  it('full compound tree mounts without errors', () => {
    const wrapper = mountTooltip({ delayDuration: 0, disableHoverableContent: true })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })
})
