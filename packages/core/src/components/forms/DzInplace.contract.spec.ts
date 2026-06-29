import { mount } from '@vue/test-utils'
/**
 * DzInplace — Contract Spec v1 conformance tests.
 *
 * Verifies the public API: v-model (active/value), slots, emitted events,
 * data attributes, and the display-trigger button semantics.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzInplace from './DzInplace.vue'

describe('dzInplace — Contract Spec v1', () => {
  // ── Renders ──

  it('renders without errors', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the display view as a button by default', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello' } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
  })

  // ── Data attributes ──

  it('reflects display/edit state via data-state', async () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello' } })
    expect(wrapper.attributes('data-state')).toBe('display')
    await wrapper.find('button').trigger('click')
    expect(wrapper.attributes('data-state')).toBe('edit')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello', disabled: true } })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  // ── ARIA ──

  it('forwards ariaLabel to the display trigger', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello', ariaLabel: 'Edit name' } })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Edit name')
  })

  // ── Slots ──

  it('renders the #display slot with value + activate', () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello' },
      slots: {
        display: ({ value }: { value: unknown, activate: () => void }) =>
          h('span', { 'data-testid': 'disp' }, String(value)),
      },
    })
    expect(wrapper.find('[data-testid="disp"]').text()).toBe('Hello')
  })

  // ── v-model:active ──

  it('supports controlled v-model:active', async () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello', active: true } })
    // Editor branch is shown when active=true.
    expect(wrapper.attributes('data-state')).toBe('edit')
  })

  it('emits open when activated', async () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  // ── CSS containment ──

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.attributes('class')).toContain('custom-class')
  })
})
