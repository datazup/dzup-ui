import { mount } from '@vue/test-utils'
/**
 * DzTag — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import DzTag from './DzTag.vue'

describe('dzTag', () => {
  // ── Rendering ──

  it('renders a <span> element with default content', () => {
    const wrapper = mount(DzTag, { slots: { default: 'Frontend' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.text()).toContain('Frontend')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTag, {
      attrs: { class: 'my-custom' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.classes()).toContain('my-custom')
  })

  // ── Props ──

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzTag, {
      props: { tone: 'danger' },
      slots: { default: 'Bug' },
    })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzTag, { props: { tone }, slots: { default: 'tag' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts all variant values', () => {
    const variants = ['solid', 'outline', 'subtle'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTag, { props: { variant }, slots: { default: 'tag' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all size values', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTag, { props: { size }, slots: { default: 'tag' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // ── Disabled ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTag, {
      props: { disabled: true },
      slots: { default: 'tag' },
    })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── Closable ──

  it('does not show close button by default', () => {
    const wrapper = mount(DzTag, { slots: { default: 'tag' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows close button when closable', () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'tag' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'tag' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does NOT emit close when disabled', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true, disabled: true },
      slots: { default: 'tag' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  // ── Events ──

  it('emits focus event', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'tag' },
    })
    await wrapper.trigger('focus')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzTag, {
      props: { closable: true },
      slots: { default: 'tag' },
    })
    await wrapper.trigger('blur')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // ── Slots ──

  it('renders prefix slot', () => {
    const wrapper = mount(DzTag, {
      slots: {
        default: 'tag',
        prefix: '<span data-testid="icon">*</span>',
      },
    })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  // ── Accessibility ──

  it('forwards aria-label', () => {
    const wrapper = mount(DzTag, {
      props: { ariaLabel: 'Category: Bug' },
      slots: { default: 'Bug' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Category: Bug')
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTag, { slots: { default: 'tag' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
