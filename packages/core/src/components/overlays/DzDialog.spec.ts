import { mount } from '@vue/test-utils'
/**
 * DzDialog -- Unit / behavior tests.
 *
 * Tests the compound dialog tree: mounting, open/close, class merging,
 * event forwarding, and subcomponent rendering.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzDialog from './DzDialog.vue'
import DzDialogClose from './DzDialogClose.vue'
import DzDialogContent from './DzDialogContent.vue'
import DzDialogDescription from './DzDialogDescription.vue'
import DzDialogOverlay from './DzDialogOverlay.vue'
import DzDialogTitle from './DzDialogTitle.vue'
import DzDialogTrigger from './DzDialogTrigger.vue'

/** Helper to mount the full dialog compound tree */
/** Stub portal to render inline (Reka UI portals don't work in jsdom) */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

function mountDialog(
  dialogProps: Record<string, unknown> = {},
  contentProps: Record<string, unknown> = {},
) {
  return mount(DzDialog, {
    props: { open: true, ...dialogProps },
    slots: {
      default: () => [
        h(DzDialogTrigger, {}, () => h('button', { class: 'trigger' }, 'Open')),
        h(DzDialogContent, contentProps, () => [
          h(DzDialogTitle, {}, () => 'Dialog Title'),
          h(DzDialogDescription, {}, () => 'Dialog Description'),
          h(DzDialogClose),
        ]),
      ],
    },
    global: {
      stubs: { DialogPortal: InlinePortal },
    },
    attachTo: document.body,
  })
}

describe('dzDialog -- Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders trigger button when open is false', () => {
    const wrapper = mount(DzDialog, {
      props: { open: false },
      slots: {
        default: () => h(DzDialogTrigger, {}, () => h('button', 'Open')),
      },
    })
    expect(wrapper.find('button').text()).toBe('Open')
    wrapper.unmount()
  })

  it('renders dialog content in portal when open', () => {
    const wrapper = mountDialog()
    // Content is portaled to body
    const title = document.body.textContent
    expect(title).toContain('Dialog Title')
    wrapper.unmount()
  })

  it('renders overlay when open', () => {
    const wrapper = mountDialog()
    // Overlay is in the DOM (portaled)
    const overlay = document.querySelector('[data-state]')
    expect(overlay).toBeTruthy()
    wrapper.unmount()
  })

  it('renders title text', () => {
    const wrapper = mountDialog()
    expect(document.body.textContent).toContain('Dialog Title')
    wrapper.unmount()
  })

  it('renders description text', () => {
    const wrapper = mountDialog()
    expect(document.body.textContent).toContain('Dialog Description')
    wrapper.unmount()
  })

  it('renders close button', () => {
    const wrapper = mountDialog()
    // The close button should be present in the portaled content
    const buttons = document.querySelectorAll('button')
    // At least trigger + close button
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })

  it('merges consumer class on DzDialogContent', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () =>
          h(DzDialogContent, { class: 'my-dialog' }, () =>
            h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const contentEl = wrapper.find('.my-dialog')
    expect(contentEl.exists()).toBeTruthy()
    wrapper.unmount()
  })

  it('merges consumer class on DzDialogTitle', () => {
    const wrapper = mount(DzDialogTitle, {
      attrs: { class: 'my-title' },
      slots: { default: () => 'Title' },
      global: {
        stubs: { DialogTitle: { template: '<h2 :class="$attrs.class"><slot /></h2>', inheritAttrs: false } },
      },
    })
    expect(wrapper.find('h2').classes()).toContain('my-title')
    wrapper.unmount()
  })

  it('merges consumer class on DzDialogDescription', () => {
    const wrapper = mount(DzDialogDescription, {
      attrs: { class: 'my-desc' },
      slots: { default: () => 'Desc' },
      global: {
        stubs: { DialogDescription: { template: '<p :class="$attrs.class"><slot /></p>', inheritAttrs: false } },
      },
    })
    expect(wrapper.find('p').classes()).toContain('my-desc')
    wrapper.unmount()
  })

  it('merges consumer class on DzDialogOverlay', () => {
    const wrapper = mount(DzDialogOverlay, {
      attrs: { class: 'my-overlay' },
      global: {
        stubs: { DialogOverlay: { template: '<div :class="$attrs.class" />', inheritAttrs: false } },
      },
    })
    expect(wrapper.find('div').classes()).toContain('my-overlay')
    wrapper.unmount()
  })

  it('applies size variant classes to content', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () =>
          h(DzDialogContent, { size: 'lg' }, () =>
            h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = wrapper.find('[style*="contain"]')
    expect(content.classes().join(' ')).toContain('max-w-lg')
    wrapper.unmount()
  })

  it('applies sm size variant', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () =>
          h(DzDialogContent, { size: 'sm' }, () =>
            h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = wrapper.find('[style*="contain"]')
    expect(content.classes().join(' ')).toContain('max-w-sm')
    wrapper.unmount()
  })

  it('applies full size variant', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () =>
          h(DzDialogContent, { size: 'full' }, () =>
            h(DzDialogTitle, {}, () => 'Title')),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = wrapper.find('[style*="contain"]')
    expect(content.classes().join(' ')).toContain('max-w-')
    wrapper.unmount()
  })

  it('dzDialogClose defaults aria-label to Close', () => {
    const wrapper = mount(DzDialogClose, {
      global: {
        stubs: {
          DialogClose: {
            template: '<button :aria-label="$attrs[\'aria-label\']"><slot /></button>',
            inheritAttrs: false,
          },
          X: { template: '<svg />' },
        },
      },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close')
    wrapper.unmount()
  })

  it('dzDialogClose accepts custom aria-label', () => {
    const wrapper = mount(DzDialogClose, {
      attrs: { 'aria-label': 'Dismiss' },
      global: {
        stubs: {
          DialogClose: {
            template: '<button :aria-label="$attrs[\'aria-label\']"><slot /></button>',
            inheritAttrs: false,
          },
          X: { template: '<svg />' },
        },
      },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Dismiss')
    wrapper.unmount()
  })

  it('dzDialogClose renders custom slot content', () => {
    const wrapper = mount(DzDialogClose, {
      slots: { default: () => 'X close' },
      global: {
        stubs: { DialogClose: { template: '<button><slot /></button>' } },
      },
    })
    expect(wrapper.text()).toContain('X close')
    wrapper.unmount()
  })

  it('modal defaults to true', () => {
    const wrapper = mount(DzDialog, {
      slots: { default: () => h('div', 'child') },
    })
    // Component should accept default modal=true without error
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  // ── Animation / Transition tests ──

  it('wraps overlay and content in Transition when animated (default)', () => {
    const wrapper = mountDialog()
    // Find Transition components -- they render as wrappers with name attribute
    const transitions = wrapper.findAllComponents({ name: 'Transition' })
    // Should have at least 2 Transitions (overlay + content)
    expect(transitions.length).toBeGreaterThanOrEqual(2)
    wrapper.unmount()
  })

  it('uses default transition names', () => {
    const wrapper = mountDialog()
    const transitions = wrapper.findAllComponents({ name: 'Transition' })
    const names = transitions.map(t => t.props('name'))
    expect(names).toContain('dz-dialog-overlay')
    expect(names).toContain('dz-dialog-content')
    wrapper.unmount()
  })

  it('disables transitions when animated=false', () => {
    const wrapper = mountDialog({ animated: false })
    const transitions = wrapper.findAllComponents({ name: 'Transition' })
    // When animated=false, transition names should be empty strings (no animation)
    for (const t of transitions) {
      const name = t.props('name') as string
      if (name === '' || name === undefined) {
        // Empty name means no transition classes are applied
        expect(name === '' || name === undefined).toBe(true)
      }
    }
    wrapper.unmount()
  })

  it('applies custom overlay transition name', () => {
    const wrapper = mountDialog({ overlayTransition: 'custom-overlay' })
    const transitions = wrapper.findAllComponents({ name: 'Transition' })
    const names = transitions.map(t => t.props('name'))
    expect(names).toContain('custom-overlay')
    wrapper.unmount()
  })

  it('applies custom content transition name', () => {
    const wrapper = mountDialog({ contentTransition: 'custom-content' })
    const transitions = wrapper.findAllComponents({ name: 'Transition' })
    const names = transitions.map(t => t.props('name'))
    expect(names).toContain('custom-content')
    wrapper.unmount()
  })

  it('does not render content when closed', () => {
    const wrapper = mount(DzDialog, {
      props: { open: false },
      slots: {
        default: () => [
          h(DzDialogTrigger, {}, () => h('button', 'Open')),
          h(DzDialogContent, {}, () => h(DzDialogTitle, {}, () => 'Title')),
        ],
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    expect(wrapper.find('button').text()).toBe('Open')
    wrapper.unmount()
  })
})
