import { mount } from '@vue/test-utils'
/**
 * DzFab — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzFab from './DzFab.vue'

const IconStub = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })

describe('dzFab', () => {
  it('renders a circular elevated button (rounded-full + fab shadow token)', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    const cls = wrapper.attributes('class') ?? ''
    expect(cls).toContain('dz-fab')
    expect(cls).toContain('rounded-full')
    expect(cls).toContain('shadow-[var(--dz-fab-shadow)]')
  })

  it('renders the icon prop', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('prefers the default slot over the icon prop', () => {
    const wrapper = mount(DzFab, {
      props: { icon: IconStub, ariaLabel: 'Compose' },
      slots: { default: () => h('span', { 'data-testid': 'slot-icon' }, 'x') },
    })
    expect(wrapper.find('[data-testid="slot-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(false)
  })

  it('shows the spinner and hides the icon while loading', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', loading: true } })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(false)
  })

  it('applies fixed positioning classes when pinned to a corner', () => {
    const wrapper = mount(DzFab, {
      props: { icon: IconStub, ariaLabel: 'Compose', position: 'bottom-right' },
    })
    const cls = wrapper.attributes('class') ?? ''
    expect(cls).toContain('fixed')
    expect(cls).toContain('bottom-[var(--dz-fab-offset)]')
    expect(cls).toContain('right-[var(--dz-fab-offset)]')
  })

  it('does not apply fixed positioning by default (static)', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose' } })
    expect(wrapper.attributes('class') ?? '').not.toContain('fixed')
  })

  it('reflects the native disabled attribute when disabled', () => {
    const wrapper = mount(DzFab, { props: { icon: IconStub, ariaLabel: 'Compose', disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
