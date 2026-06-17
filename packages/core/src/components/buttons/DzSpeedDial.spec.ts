import { mount } from '@vue/test-utils'
/**
 * DzSpeedDial — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import DzSpeedDial from './DzSpeedDial.vue'

const IconStub = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })

function makeItems(overrides: Array<Record<string, unknown>> = []) {
  const base = [
    { icon: IconStub, label: 'Edit' },
    { icon: IconStub, label: 'Share' },
    { icon: IconStub, label: 'Delete' },
  ]
  return base.map((item, i) => ({ ...item, ...(overrides[i] ?? {}) }))
}

function trigger(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('button[aria-haspopup="menu"]')
}

describe('dzSpeedDial', () => {
  // ── Open / close ──

  it('toggles open on trigger click and emits open/close', async () => {
    const wrapper = mount(DzSpeedDial, { props: { items: makeItems(), ariaLabel: 'Actions' } })
    await trigger(wrapper).trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('open')).toHaveLength(1)

    await trigger(wrapper).trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('respects the controlled v-model:open prop', () => {
    const closed = mount(DzSpeedDial, { props: { items: makeItems(), ariaLabel: 'A', open: false } })
    expect(trigger(closed).attributes('aria-expanded')).toBe('false')
    const opened = mount(DzSpeedDial, { props: { items: makeItems(), ariaLabel: 'A', open: true } })
    expect(trigger(opened).attributes('aria-expanded')).toBe('true')
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems(), ariaLabel: 'A', disabled: true },
    })
    await trigger(wrapper).trigger('click')
    expect(wrapper.emitted('update:open')).toBeFalsy()
    expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
  })

  // ── Item activation ──

  it('invokes the item onClick and emits itemClick when an action is clicked', async () => {
    const onClick = vi.fn()
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems([{ onClick }]), ariaLabel: 'A', open: true },
    })
    const action = wrapper.get('button[data-index="0"]')
    await action.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    const emitted = wrapper.emitted('itemClick')
    expect(emitted).toHaveLength(1)
    expect(emitted?.[0]?.[1]).toBe(0)
  })

  it('closes after an action is activated', async () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems(), ariaLabel: 'A', open: true },
    })
    await wrapper.get('button[data-index="1"]').trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('does not activate a disabled action', async () => {
    const onClick = vi.fn()
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems([{}, { onClick, disabled: true }]), ariaLabel: 'A', open: true },
    })
    await wrapper.get('button[data-index="1"]').trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    expect(wrapper.emitted('itemClick')).toBeFalsy()
  })

  // ── Esc to close ──

  it('closes on Escape', async () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems(), ariaLabel: 'A', open: true },
    })
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  // ── Focusability ──

  it('actions are focusable (tabindex 0) only while open', async () => {
    const wrapper = mount(DzSpeedDial, { props: { items: makeItems(), ariaLabel: 'A' } })
    expect(wrapper.get('button[data-index="0"]').attributes('tabindex')).toBe('-1')
    await trigger(wrapper).trigger('click')
    expect(wrapper.get('button[data-index="0"]').attributes('tabindex')).toBe('0')
  })

  // ── Per-item tone fallback ──

  it('falls back to the dial tone when an item has none', () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems([{ tone: 'danger' }]), ariaLabel: 'A', tone: 'success', open: true },
    })
    expect(wrapper.get('button[data-index="0"]').attributes('data-tone')).toBe('danger')
    expect(wrapper.get('button[data-index="1"]').attributes('data-tone')).toBe('success')
  })

  // ── Geometry: staggered reveal via transition-delay ──

  it('applies a staggered transition-delay per action when open', () => {
    const wrapper = mount(DzSpeedDial, {
      props: { items: makeItems(), ariaLabel: 'A', open: true },
    })
    const wrappers = wrapper.findAll('[role="menu"] > div')
    expect(wrappers[0]?.attributes('style')).toContain('transition-delay: 0ms')
    expect(wrappers[1]?.attributes('style')).toContain('transition-delay: 40ms')
    expect(wrappers[2]?.attributes('style')).toContain('transition-delay: 80ms')
  })

  it('collapses actions (scale 0.4, opacity 0) when closed', () => {
    const wrapper = mount(DzSpeedDial, { props: { items: makeItems(), ariaLabel: 'A' } })
    const first = wrapper.findAll('[role="menu"] > div')[0]
    expect(first?.attributes('style')).toContain('opacity: 0')
    expect(first?.attributes('style')).toContain('scale(0.4)')
  })
})
