import { mount } from '@vue/test-utils'
/**
 * DzChip — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import DzChip from './DzChip.vue'

describe('dzChip', () => {
  // ── Rendering ──

  it('renders a <span> element with default content', () => {
    const wrapper = mount(DzChip, { slots: { default: 'Vue 3' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.text()).toContain('Vue 3')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzChip, {
      attrs: { class: 'my-custom' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.classes()).toContain('my-custom')
  })

  // ── Props ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzChip, {
      props: { tone: 'primary' },
      slots: { default: 'Primary' },
    })
    expect(wrapper.attributes('data-tone')).toBe('primary')
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzChip, { props: { tone }, slots: { default: 'chip' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts all variant values', () => {
    const variants = ['solid', 'outline', 'subtle'] as const
    for (const variant of variants) {
      const wrapper = mount(DzChip, { props: { variant }, slots: { default: 'chip' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all size values', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const wrapper = mount(DzChip, { props: { size }, slots: { default: 'chip' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Disabled ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzChip, {
      props: { disabled: true },
      slots: { default: 'chip' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when not disabled', () => {
    const wrapper = mount(DzChip, { slots: { default: 'chip' } })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  // ── Closable ──

  it('does not show close button by default', () => {
    const wrapper = mount(DzChip, { slots: { default: 'chip' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows close button when closable', () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does NOT emit close when disabled', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true, disabled: true },
      slots: { default: 'chip' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close on Delete keypress when closable', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    await wrapper.trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on Backspace keypress when closable', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    await wrapper.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders prefix slot', () => {
    const wrapper = mount(DzChip, {
      slots: {
        default: 'chip',
        prefix: '<span data-testid="icon">*</span>',
      },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  // ── Accessibility ──

  it('has role="status"', () => {
    const wrapper = mount(DzChip, { slots: { default: 'chip' } })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzChip, {
      props: { ariaLabel: 'Filter: Vue 3' },
      slots: { default: 'Vue 3' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Filter: Vue 3')
  })

  it('sets tabindex when closable', () => {
    const wrapper = mount(DzChip, {
      props: { closable: true },
      slots: { default: 'chip' },
    })
    expect(wrapper.attributes('tabindex')).toBe('0')
  })

  it('does not set tabindex when not closable', () => {
    const wrapper = mount(DzChip, { slots: { default: 'chip' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzChip, { slots: { default: 'chip' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
