import { mount } from '@vue/test-utils'
/**
 * DzBlockUI — Unit / behavior tests.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import DzBlockUI from './DzBlockUI.vue'

const OVERLAY = '[data-testid="dz-block-ui-overlay"]'
const CONTENT = '[data-testid="dz-block-ui-content"]'

describe('dzBlockUI — Unit Tests', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // ── Toggle ──

  it('shows the overlay when blocked becomes true and hides it again', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: false } })
    expect(wrapper.find(OVERLAY).exists()).toBe(false)

    await wrapper.setProps({ blocked: true })
    expect(wrapper.find(OVERLAY).exists()).toBe(true)

    await wrapper.setProps({ blocked: false })
    expect(wrapper.find(OVERLAY).exists()).toBe(false)
  })

  // ── aria-busy ──

  it('reflects aria-busy with the blocked state', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: false } })
    expect(wrapper.attributes('aria-busy')).toBeUndefined()

    await wrapper.setProps({ blocked: true })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  // ── inert content (keyboard/pointer blocking) ──

  it('marks the content inert while blocked and clears it on unblock', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: false } })
    const content = wrapper.find(CONTENT)
    expect(content.attributes('inert')).toBeUndefined()

    await wrapper.setProps({ blocked: true })
    await nextTick()
    expect(wrapper.find(CONTENT).attributes('inert')).toBeDefined()

    await wrapper.setProps({ blocked: false })
    await nextTick()
    expect(wrapper.find(CONTENT).attributes('inert')).toBeUndefined()
  })

  // ── Pointer capture ──

  it('prevents the default of pointer events on the overlay', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    wrapper.find(OVERLAY).element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  // ── Default overlay content ──

  it('renders a spinner in the default overlay', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    expect(wrapper.find(OVERLAY).find('[role="status"]').exists()).toBe(true)
  })

  it('renders the message and uses it as the spinner label', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true, message: 'Saving…' } })
    const overlay = wrapper.find(OVERLAY)
    expect(overlay.text()).toContain('Saving…')
    expect(overlay.find('[role="status"]').attributes('aria-label')).toBe('Saving…')
  })

  it('falls back to "Loading" as the spinner label without a message', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    expect(wrapper.find(OVERLAY).find('[role="status"]').attributes('aria-label')).toBe('Loading')
  })

  // ── Events ──

  it('emits block when entering the blocked state', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: false } })
    await wrapper.setProps({ blocked: true })
    await nextTick()
    expect(wrapper.emitted('block')).toHaveLength(1)
  })

  it('emits unblock when leaving the blocked state', async () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true } })
    await wrapper.setProps({ blocked: false })
    await nextTick()
    expect(wrapper.emitted('unblock')).toHaveLength(1)
  })

  // ── Focus management ──

  it('moves focus out of the content into the overlay when blocked', async () => {
    const wrapper = mount(DzBlockUI, {
      attachTo: document.body,
      props: { blocked: false },
      slots: { default: () => h('button', { id: 'inner' }, 'Edit') },
    })

    const inner = document.getElementById('inner') as HTMLButtonElement
    inner.focus()
    expect(document.activeElement).toBe(inner)

    await wrapper.setProps({ blocked: true })
    await nextTick()

    const overlay = wrapper.find(OVERLAY).element
    expect(document.activeElement).toBe(overlay)
    wrapper.unmount()
  })

  it('restores focus to the previously focused element on unblock', async () => {
    const wrapper = mount(DzBlockUI, {
      attachTo: document.body,
      props: { blocked: false },
      slots: { default: () => h('button', { id: 'inner' }, 'Edit') },
    })

    const inner = document.getElementById('inner') as HTMLButtonElement
    inner.focus()

    await wrapper.setProps({ blocked: true })
    await nextTick()
    await wrapper.setProps({ blocked: false })
    await nextTick()

    expect(document.activeElement).toBe(inner)
    wrapper.unmount()
  })

  // ── Full-screen mode ──

  it('teleports the overlay to <body> in fullScreen mode', async () => {
    const wrapper = mount(DzBlockUI, {
      attachTo: document.body,
      props: { blocked: true, fullScreen: true },
    })
    await nextTick()

    // Overlay lives under <body>, not inside the component root.
    expect(wrapper.find(OVERLAY).exists()).toBe(false)
    expect(document.body.querySelector(OVERLAY)).not.toBeNull()
    wrapper.unmount()
  })

  it('keeps the overlay inside the root when not fullScreen', () => {
    const wrapper = mount(DzBlockUI, { props: { blocked: true, fullScreen: false } })
    expect(wrapper.find(OVERLAY).exists()).toBe(true)
  })

  // ── Custom overlay slot ──

  it('passes the blocked flag to the overlay slot', () => {
    const slot = vi.fn(() => h('div', 'custom'))
    mount(DzBlockUI, {
      props: { blocked: true },
      slots: { overlay: slot },
    })
    expect(slot).toHaveBeenCalledWith(expect.objectContaining({ blocked: true }))
  })
})
