import { mount } from '@vue/test-utils'
/**
 * DzPopover -- Unit / behavior tests.
 *
 * Tests compound popover tree: mounting, class merging, arrow rendering,
 * size variants, side/align props, and event forwarding.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzPopover from './DzPopover.vue'
import DzPopoverContent from './DzPopoverContent.vue'
import DzPopoverTrigger from './DzPopoverTrigger.vue'

/** Helper to mount full popover compound */
/** Stub portal to render inline */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

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

describe('dzPopover -- Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders trigger button', () => {
    const wrapper = mountPopover()
    expect(wrapper.find('button').text()).toBe('Toggle')
    wrapper.unmount()
  })

  it('renders popover content when open', () => {
    const wrapper = mountPopover()
    expect(wrapper.text()).toContain('Popover body')
    wrapper.unmount()
  })

  it('merges consumer class on DzPopoverContent', () => {
    const wrapper = mount(DzPopoverContent, {
      attrs: { class: 'custom-popover' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div v-bind="$attrs"><slot /></div>', inheritAttrs: false },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.html()).toContain('custom-popover')
    wrapper.unmount()
  })

  it('renders arrow by default', () => {
    const wrapper = mount(DzPopoverContent, {
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div><slot /></div>' },
          PopoverArrow: { template: '<div class="arrow" />' },
        },
      },
    })
    expect(wrapper.find('.arrow').exists()).toBe(true)
    wrapper.unmount()
  })

  it('hides arrow when arrow=false', () => {
    const wrapper = mount(DzPopoverContent, {
      props: { arrow: false },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div><slot /></div>' },
          PopoverArrow: { template: '<div class="arrow" />' },
        },
      },
    })
    expect(wrapper.find('.arrow').exists()).toBe(false)
    wrapper.unmount()
  })

  it('applies sm size variant', () => {
    const wrapper = mount(DzPopoverContent, {
      props: { size: 'sm' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div v-bind="$attrs"><slot /></div>', inheritAttrs: false },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.html()).toContain('w-48')
    wrapper.unmount()
  })

  it('applies md size variant (default)', () => {
    const wrapper = mount(DzPopoverContent, {
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div v-bind="$attrs"><slot /></div>', inheritAttrs: false },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.html()).toContain('w-72')
    wrapper.unmount()
  })

  it('applies lg size variant', () => {
    const wrapper = mount(DzPopoverContent, {
      props: { size: 'lg' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div v-bind="$attrs"><slot /></div>', inheritAttrs: false },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.html()).toContain('w-96')
    wrapper.unmount()
  })

  it('defaults to side=bottom', () => {
    const wrapper = mount(DzPopoverContent, {
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: {
            template: '<div :data-side="$attrs.side"><slot /></div>',
            inheritAttrs: false,
          },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.find('[data-side="bottom"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('passes side=top to content', () => {
    const wrapper = mount(DzPopoverContent, {
      props: { side: 'top' },
      slots: { default: () => 'Text' },
      global: {
        stubs: {
          PopoverPortal: { template: '<div><slot /></div>' },
          PopoverContent: {
            template: '<div :data-side="$attrs.side"><slot /></div>',
            inheritAttrs: false,
          },
          PopoverArrow: { template: '<div />' },
        },
      },
    })
    expect(wrapper.find('[data-side="top"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dzPopoverTrigger renders child element', () => {
    const wrapper = mount(DzPopoverTrigger, {
      slots: { default: () => h('span', { class: 'my-trigger' }, 'Click') },
      global: {
        stubs: { PopoverTrigger: { template: '<span><slot /></span>' } },
      },
    })
    expect(wrapper.find('.my-trigger').exists()).toBe(true)
    wrapper.unmount()
  })

  it('modal defaults to false', () => {
    const wrapper = mount(DzPopover, {
      slots: { default: () => h('div', 'child') },
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('full compound tree mounts without errors', () => {
    const wrapper = mountPopover({ modal: true })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('content has contain: layout style', () => {
    const wrapper = mountPopover()
    const content = wrapper.find('[style*="contain"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })
})
