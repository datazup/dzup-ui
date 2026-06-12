import { mount } from '@vue/test-utils'
/**
 * DzPanel -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzPanel from './DzPanel.vue'

describe('dzPanel -- Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=outlined, size=md, tone=neutral)', () => {
    const wrapper = mount(DzPanel, { props: { header: 'Title' } })
    expect(wrapper.classes()).toContain('dz-panel')
    expect(wrapper.attributes('data-variant')).toBe('outlined')
    expect(wrapper.attributes('data-size')).toBe('md')
    expect(wrapper.attributes('data-tone')).toBe('neutral')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzPanel, { props: { size, header: 'T' } })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('accepts all surface variant values', () => {
    const variants = ['outlined', 'elevated', 'legend'] as const
    for (const variant of variants) {
      const wrapper = mount(DzPanel, { props: { variant, header: 'T' } })
      expect(wrapper.attributes('data-variant')).toBe(variant)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzPanel, { props: { tone, header: 'T' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // -- Dynamic element --

  it('renders as div by default', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders as the specified HTML element via "as" prop', () => {
    const wrapper = mount(DzPanel, { props: { as: 'section', header: 'T' } })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  // -- a11y --

  it('renders a non-button header when not collapsible', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders a header toggle button with aria-expanded when collapsible', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-expanded')).toBe('true')
  })

  it('links the toggle to the region via aria-controls', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', collapsible: true } })
    const controls = wrapper.find('button').attributes('aria-controls')
    expect(controls).toBeTruthy()
    expect(wrapper.find(`#${controls}`).exists()).toBe(true)
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', ariaLabel: 'Settings group' } })
    expect(wrapper.attributes('aria-label')).toBe('Settings group')
  })

  it('sets id when provided', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T', id: 'panel-1' } })
    expect(wrapper.attributes('id')).toBe('panel-1')
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' }, attrs: { class: 'my-panel' } })
    expect(wrapper.classes()).toContain('my-panel')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzPanel, { props: { header: 'T' }, attrs: { 'data-testid': 'panel' } })
    expect(wrapper.attributes('data-testid')).toBe('panel')
  })

  // -- Slots --

  it('renders default (body) slot content', () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T' },
      slots: { default: '<p data-testid="body">Body</p>' },
    })
    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
  })

  it('renders header slot, overriding the header prop', () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'Prop title' },
      slots: { header: '<span data-testid="hdr">Slot title</span>' },
    })
    expect(wrapper.find('[data-testid="hdr"]').text()).toBe('Slot title')
    expect(wrapper.text()).not.toContain('Prop title')
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzPanel, {
      props: { header: 'T' },
      slots: { actions: '<button data-testid="act">Edit</button>' },
    })
    expect(wrapper.find('[data-testid="act"]').exists()).toBe(true)
  })
})
