import { mount } from '@vue/test-utils'
/**
 * DzAlert — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, events, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzAlert from './DzAlert.vue'

describe('dzAlert — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=subtle, tone=info)', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'Hello' } })
    expect(wrapper.attributes('data-tone')).toBe('info')
    expect(wrapper.text()).toContain('Hello')
  })

  it('accepts all canonical variant values', () => {
    const variants = ['filled', 'outline', 'subtle', 'ghost'] as const
    for (const variant of variants) {
      const wrapper = mount(DzAlert, { props: { variant }, slots: { default: 'msg' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzAlert, { props: { tone }, slots: { default: 'msg' } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // -- Data attributes --

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzAlert, { props: { tone: 'danger' }, slots: { default: 'msg' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  it('sets data-state="open" when visible', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'msg' } })
    expect(wrapper.attributes('data-state')).toBe('open')
  })

  // -- ARIA --

  it('sets role="alert" for danger tone', () => {
    const wrapper = mount(DzAlert, { props: { tone: 'danger' }, slots: { default: 'Error' } })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('sets role="alert" for warning tone', () => {
    const wrapper = mount(DzAlert, { props: { tone: 'warning' }, slots: { default: 'Warn' } })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('sets aria-live="polite" for non-urgent tones', () => {
    const wrapper = mount(DzAlert, { props: { tone: 'info' }, slots: { default: 'Info' } })
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('sets aria-live="polite" for success tone', () => {
    const wrapper = mount(DzAlert, { props: { tone: 'success' }, slots: { default: 'Done' } })
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzAlert, {
      props: { ariaLabel: 'Error notification' },
      slots: { default: 'msg' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Error notification')
  })

  // -- Events --

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(DzAlert, {
      props: { closable: true },
      slots: { default: 'Dismissible' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('hides after close button is clicked', async () => {
    const wrapper = mount(DzAlert, {
      props: { closable: true },
      slots: { default: 'Dismissible' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-state]').exists()).toBe(false)
  })

  // -- Slots --

  it('renders default slot content', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'Alert message' } })
    expect(wrapper.text()).toContain('Alert message')
  })

  it('renders title slot', () => {
    const wrapper = mount(DzAlert, {
      slots: {
        default: 'Body',
        title: '<span data-testid="custom-title">Custom Title</span>',
      },
    })
    expect(wrapper.find('[data-testid="custom-title"]').exists()).toBe(true)
  })

  it('renders title prop', () => {
    const wrapper = mount(DzAlert, {
      props: { title: 'Prop Title' },
      slots: { default: 'Body' },
    })
    expect(wrapper.text()).toContain('Prop Title')
  })

  it('renders icon slot', () => {
    const wrapper = mount(DzAlert, {
      slots: {
        default: 'Body',
        icon: '<svg data-testid="custom-icon"></svg>',
      },
    })
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzAlert, {
      slots: {
        default: 'Body',
        actions: '<button data-testid="action-btn">Retry</button>',
      },
    })
    expect(wrapper.find('[data-testid="action-btn"]').exists()).toBe(true)
  })

  // -- Close button --

  it('does not render close button when closable=false', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'msg' } })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders close button when closable=true', () => {
    const wrapper = mount(DzAlert, {
      props: { closable: true },
      slots: { default: 'msg' },
    })
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBe('Close')
  })

  // -- Icon prop --

  it('renders icon component from icon prop', () => {
    const IconComp = defineComponent({
      render() {
        return h('svg', { 'data-testid': 'icon-comp' })
      },
    })
    const wrapper = mount(DzAlert, {
      props: { icon: IconComp },
      slots: { default: 'msg' },
    })
    expect(wrapper.find('[data-testid="icon-comp"]').exists()).toBe(true)
  })
})
