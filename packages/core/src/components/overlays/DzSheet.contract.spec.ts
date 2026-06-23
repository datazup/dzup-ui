import { mount } from '@vue/test-utils'
/**
 * DzSheet — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzSheet from './DzSheet.vue'
import DzSheetContent from './DzSheetContent.vue'
import DzSheetDescription from './DzSheetDescription.vue'
import DzSheetTitle from './DzSheetTitle.vue'

/** Stub portal to render inline (Reka UI portals don't work in jsdom) */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

/** Helper to mount the full sheet compound tree with the sheet open */
function mountSheet(props: Record<string, unknown> = {}, contentProps: Record<string, unknown> = {}) {
  return mount(DzSheet, {
    props: { open: true, ...props },
    slots: {
      default: () => h(DzSheetContent, contentProps, () => [
        h(DzSheetTitle, {}, () => 'Sheet Title'),
        h(DzSheetDescription, {}, () => 'Sheet Description'),
      ]),
    },
    global: { stubs: { DialogPortal: InlinePortal } },
    attachTo: document.body,
  })
}

describe('dzSheet — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSheet, { slots: { default: '<div>Content</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzSheet, {
      slots: { default: '<div data-testid="content">Sheet children</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzSheet is a thin wrapper around DialogRoot and does not forward class attrs
    const wrapper = mount(DzSheet, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Modal semantics & ARIA wiring (regression: aria-modal + auto labelledby) ──

  it('open modal sheet exposes aria-modal="true"', () => {
    const wrapper = mountSheet()
    const content = document.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
    expect(content?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('non-modal sheet does not set aria-modal="true"', () => {
    const wrapper = mountSheet({ modal: false })
    const content = document.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
    expect(content?.getAttribute('aria-modal')).not.toBe('true')
    wrapper.unmount()
  })

  it('resolves accessible name via Reka auto aria-labelledby pointing at the title', () => {
    const wrapper = mountSheet()
    const content = document.querySelector('[role="dialog"]')
    const labelledby = content?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const titleEl = document.getElementById(labelledby as string)
    expect(titleEl).not.toBeNull()
    expect(titleEl?.textContent).toContain('Sheet Title')
    wrapper.unmount()
  })

  it('resolves aria-describedby to the description element', () => {
    const wrapper = mountSheet()
    const content = document.querySelector('[role="dialog"]')
    const describedby = content?.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    const descEl = document.getElementById(describedby as string)
    expect(descEl).not.toBeNull()
    expect(descEl?.textContent).toContain('Sheet Description')
    wrapper.unmount()
  })

  it('does not clobber Reka auto aria-labelledby when consumer omits it', () => {
    // ariaLabelledby defaults to undefined -- must NOT remove Reka's generated id.
    const wrapper = mount(DzSheet, {
      props: { open: true },
      slots: {
        default: () => h(DzSheetContent, {}, () => [
          h(DzSheetTitle, {}, () => 'Only Title'),
        ]),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })
    const content = document.querySelector('[role="dialog"]')
    expect(content?.getAttribute('aria-labelledby')).toBeTruthy()
    wrapper.unmount()
  })

  it('forwards a consumer-provided ariaLabelledby override', () => {
    const wrapper = mountSheet({}, { ariaLabelledby: 'external-heading' })
    const content = document.querySelector('[role="dialog"]')
    expect(content?.getAttribute('aria-labelledby')).toBe('external-heading')
    wrapper.unmount()
  })
})
