import { mount } from '@vue/test-utils'
/**
 * DzAlert — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzAlert from './DzAlert.vue'

describe('dzAlert — Unit Tests', () => {
  it('renders a <div> element', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'msg' } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAlert, {
      attrs: { class: 'my-custom-class' },
      slots: { default: 'msg' },
    })
    expect(wrapper.classes()).toContain('my-custom-class')
  })

  it('forwards extra HTML attributes to the root element', () => {
    const wrapper = mount(DzAlert, {
      attrs: { 'data-testid': 'my-alert' },
      slots: { default: 'msg' },
    })
    expect(wrapper.attributes('data-testid')).toBe('my-alert')
  })

  it('applies filled variant classes for filled+primary', () => {
    const wrapper = mount(DzAlert, {
      props: { variant: 'filled', tone: 'primary' },
      slots: { default: 'msg' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-primary)]')
    expect(classStr).toContain('text-[var(--dz-primary-foreground)]')
  })

  it('applies outline variant classes for outline+danger', () => {
    const wrapper = mount(DzAlert, {
      props: { variant: 'outline', tone: 'danger' },
      slots: { default: 'msg' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('border-[var(--dz-danger)]')
  })

  it('applies subtle variant classes for subtle+success', () => {
    const wrapper = mount(DzAlert, {
      props: { variant: 'subtle', tone: 'success' },
      slots: { default: 'msg' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('bg-[var(--dz-success-muted)]')
    expect(classStr).toContain('text-[var(--dz-success)]')
  })

  it('applies ghost variant classes for ghost+warning', () => {
    const wrapper = mount(DzAlert, {
      props: { variant: 'ghost', tone: 'warning' },
      slots: { default: 'msg' },
    })
    const classStr = wrapper.classes().join(' ')
    expect(classStr).toContain('text-[var(--dz-warning)]')
  })

  it('title slot takes priority over title prop', () => {
    const wrapper = mount(DzAlert, {
      props: { title: 'Prop Title' },
      slots: {
        default: 'Body',
        title: 'Slot Title',
      },
    })
    expect(wrapper.text()).toContain('Slot Title')
    // Prop text should not appear since slot overrides it
    expect(wrapper.text()).not.toContain('Prop Title')
  })

  it('icon slot takes priority over icon prop', () => {
    const IconComp = defineComponent({
      render() {
        return h('svg', { 'data-testid': 'prop-icon' })
      },
    })
    const wrapper = mount(DzAlert, {
      props: { icon: IconComp },
      slots: {
        default: 'Body',
        icon: '<svg data-testid="slot-icon"></svg>',
      },
    })
    expect(wrapper.find('[data-testid="slot-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="prop-icon"]').exists()).toBe(false)
  })

  it('does not show title area when neither title prop nor title slot', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'msg' } })
    // Only the message body should be present
    expect(wrapper.findAll('.font-medium')).toHaveLength(0)
  })

  it('does not show actions area when no actions slot', () => {
    const wrapper = mount(DzAlert, { slots: { default: 'msg' } })
    const actionsContainer = wrapper.findAll('.mt-\\[var\\(--dz-spacing-3\\)\\]')
    expect(actionsContainer).toHaveLength(0)
  })

  it('close button has accessible label', () => {
    const wrapper = mount(DzAlert, {
      props: { closable: true },
      slots: { default: 'msg' },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close')
  })

  it('close button contains SVG icon', () => {
    const wrapper = mount(DzAlert, {
      props: { closable: true },
      slots: { default: 'msg' },
    })
    expect(wrapper.find('button svg').exists()).toBe(true)
  })
})
