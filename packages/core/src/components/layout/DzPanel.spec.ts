import { mount } from '@vue/test-utils'
/**
 * DzPanel -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzPanel from './DzPanel.vue'

describe('dzPanel -- Unit Tests', () => {
  it('renders the header prop text', () => {
    const wrapper = mount(DzPanel, { props: { header: 'Billing' } })
    expect(wrapper.text()).toContain('Billing')
  })

  it('does not render a chevron when not collapsible', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' } })
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('renders a chevron when collapsible', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('starts expanded by default (collapsed=false)', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
  })

  it('honors an initial collapsed model value', () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T', collapsible: true, collapsed: true },
    })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('toggles collapsed state and emits update:collapsed on header click', async () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true])
    expect(wrapper.emitted('toggle')?.[0]).toEqual([true])
  })

  it('toggles back to expanded on a second click', async () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:collapsed')?.[1]).toEqual([false])
  })

  it('reacts to external collapsed model changes', async () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T', collapsible: true, collapsed: false },
    })
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('marks collapsed body content as inert (out of tab order)', async () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T', collapsible: true, collapsed: true },
      slots: { default: '<button data-testid="inner">Inner</button>' },
    })
    const body = wrapper.find('.dz-panel__body')
    expect(body.attributes('inert')).toBeDefined()
  })

  it('does not mark expanded body content as inert', () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T', collapsible: true, collapsed: false },
      slots: { default: '<button data-testid="inner">Inner</button>' },
    })
    const body = wrapper.find('.dz-panel__body')
    expect(body.attributes('inert')).toBeUndefined()
  })

  it('omits the header divider for the legend variant', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', variant: 'legend' } })
    expect(wrapper.find('.dz-panel__header').classes()).not.toContain('border-b')
  })

  it('keeps the header divider for non-legend variants', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', variant: 'outlined' } })
    expect(wrapper.find('.dz-panel__header').classes()).toContain('border-b')
  })

  it('does not toggle when a non-collapsible header is clicked', async () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' } })
    // Header wrapper is a div, not a button; clicking it must not emit.
    await wrapper.find('.dz-panel__header > div').trigger('click')
    expect(wrapper.emitted('update:collapsed')).toBeUndefined()
  })
})
