import { enableAutoUnmount, mount } from '@vue/test-utils'
/**
 * DzPopover -- Unit / behavior tests.
 *
 * Tests compound popover tree: mounting, class merging, arrow rendering,
 * size variants, side/align props, and event forwarding.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { cascaderVariants } from '../forms/DzCascader.variants.ts'
import { comboboxVariants } from '../forms/DzCombobox.variants.ts'
import { datePickerVariants } from '../forms/DzDatePicker.variants.ts'
import { dateRangePickerVariants } from '../forms/DzDateRangePicker.variants.ts'
import { mentionVariants } from '../forms/DzMention.variants.ts'
import { multiSelectVariants } from '../forms/DzMultiSelect.variants.ts'
import { selectVariants } from '../forms/DzSelect.variants.ts'
import { timePickerVariants } from '../forms/DzTimePicker.variants.ts'
import { treeSelectVariants } from '../forms/DzTreeSelect.variants.ts'
import { commandPaletteVariants } from './DzCommandPalette.variants.ts'
import { contextMenuVariants } from './DzContextMenu.variants.ts'
import { dialogVariants } from './DzDialog.variants.ts'
import { dropdownMenuVariants } from './DzDropdownMenu.variants.ts'
import { popconfirmVariants } from './DzPopconfirm.variants.ts'
import { popoverVariants } from './DzPopover.variants.ts'
import DzPopover from './DzPopover.vue'
import DzPopoverContent from './DzPopoverContent.vue'
import DzPopoverTrigger from './DzPopoverTrigger.vue'
import { sheetVariants } from './DzSheet.variants.ts'
import { tourVariants } from './DzTour.variants.ts'

/**
 * Wait for a condition rather than a fixed sleep (UI-DZUP-UI-TEST-M-03): portalled
 * content lands a tick or two after mount, and a loaded host makes any fixed
 * interval either too short or wasted.
 */
async function settle(assertion: () => void): Promise<void> {
  await vi.waitFor(assertion, { timeout: 5000, interval: 10 })
}

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

/**
 * Teardown through Vue, not through the DOM (RESIDUAL-18). This file used to end
 * each test with a `document.body` wipe, which detaches the markup while
 * leaving every component instance mounted; the popovers here `attachTo:
 * document.body`, so the attached host is removed by the unmount too.
 */
enableAutoUnmount(afterEach)

describe('dzPopover -- Unit Tests', () => {
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
    const content = wrapper.find('[class~="[contain:layout_style]"]')
    expect(content.exists()).toBeTruthy()
    wrapper.unmount()
  })

  it('renders real Reka content inline when portalDisabled is true', async () => {
    const wrapper = mount(DzPopover, {
      props: { open: true },
      slots: {
        default: () => h('div', { 'data-testid': 'popover-host' }, [
          h(DzPopoverTrigger, {}, () => h('button', 'Toggle inline popover')),
          h(DzPopoverContent, { portalDisabled: true }, () => 'Inline popover body'),
        ]),
      },
      attachTo: document.body,
    })
    await settle(() => expect(wrapper.find('[data-testid="popover-host"] [role="dialog"]').text()).toContain('Inline popover body'))
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzPopover, {
      props: { open: true },
      slots: {
        default: () => h('div', { 'data-testid': 'popover-host' }, [
          h(DzPopoverTrigger, {}, () => h('button', 'Toggle portaled popover')),
          h(DzPopoverContent, {}, () => 'Portaled popover body'),
        ]),
      },
      attachTo: document.body,
    })
    await settle(() => expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('Portaled popover body'))

    const host = document.querySelector('[data-testid="popover-host"]')
    expect(host?.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })
})

/**
 * Surface assignment (UI-DZUP-UI-DESIGN-M-10).
 *
 * Every floating panel paints with the one overlay-tier pair, `--dz-popover` /
 * `--dz-popover-foreground`; modal surfaces (dialog, sheet) sit on
 * `--dz-surface-raised`. Before, popovers and menus used the PAGE token
 * `--dz-background` (the same colour as the page beneath them) while the select
 * family used `--dz-surface`, so two overlays side by side disagreed.
 */
describe('overlay surface tokens', () => {
  const floating: Array<[string, string]> = [
    ['DzPopover content', popoverVariants().content()],
    ['DzDropdownMenu content', dropdownMenuVariants().content()],
    ['DzContextMenu content', contextMenuVariants().content()],
    ['DzCommandPalette content', commandPaletteVariants().content()],
    ['DzTour panel', tourVariants().panel()],
    ['DzSelect content', selectVariants().content()],
    ['DzCombobox content', comboboxVariants().content()],
    ['DzMultiSelect content', multiSelectVariants().content()],
    ['DzDatePicker content', datePickerVariants().content()],
    ['DzDateRangePicker content', dateRangePickerVariants().content()],
    ['DzTreeSelect panel', treeSelectVariants().panel()],
    ['DzCascader panel', cascaderVariants().panel()],
    ['DzTimePicker panel', timePickerVariants().panel()],
    ['DzMention menu', mentionVariants().menu()],
  ]

  it.each(floating)('%s paints with the overlay tier', (_name, classes) => {
    expect(classes).toContain('bg-[var(--dz-popover)]')
    expect(classes).not.toMatch(/bg-\[var\(--dz-(?:background|surface)\)\]/)
  })

  it('the popover arrow and the popconfirm panel follow the same token', () => {
    expect(popoverVariants().arrow()).toContain('fill-[var(--dz-popover)]')
    expect(popconfirmVariants().panel()).toContain('bg-[var(--dz-popconfirm-bg,var(--dz-popover))]')
  })

  it('pairs the panel text with the overlay foreground where the panel sets one', () => {
    expect(popoverVariants().content()).toContain('text-[var(--dz-popover-foreground)]')
    expect(selectVariants().content()).toContain('text-[var(--dz-popover-foreground)]')
  })

  it('paints sticky search bands with the panel token, so they match the panel they cover', () => {
    expect(selectVariants().searchWrapper()).toContain('bg-[var(--dz-popover)]')
    expect(treeSelectVariants().searchWrapper()).toContain('bg-[var(--dz-popover)]')
  })

  it('puts dialog and sheet content on the raised surface, not the page token', () => {
    for (const classes of [dialogVariants().content(), dialogVariants().header(), dialogVariants().footer(), sheetVariants().content()]) {
      expect(classes).toContain('bg-[var(--dz-surface-raised)]')
      expect(classes).not.toContain('bg-[var(--dz-background)]')
    }
  })
})
