import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
/**
 * DzToastViewport — Contract Spec v1 conformance tests.
 *
 * DzToastViewport must be rendered inside DzToastProvider to receive the
 * inject context. All tests mount via DzToastProvider as the wrapper.
 */
import { defineComponent } from 'vue'
import DzToastProvider from './DzToastProvider.vue'
import DzToastViewport from './DzToastViewport.vue'

function makeViewportSlot(attrs: Record<string, unknown> = {}) {
  return defineComponent({
    components: { DzToastViewport },
    setup: () => ({ attrs }),
    template: `<DzToastViewport v-bind="attrs" />`,
  })
}

describe('dzToastViewport — Contract Spec v1', () => {
  it('renders without errors inside DzToastProvider', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: makeViewportSlot() },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the ToastViewport element', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: makeViewportSlot() },
    })
    expect(wrapper.html()).toBeTruthy()
  })

  it('accepts position="top-right" without throwing', () => {
    expect(() =>
      mount(DzToastProvider, {
        slots: { default: makeViewportSlot({ position: 'top-right' }) },
      }),
    ).not.toThrow()
  })

  it('accepts position="bottom-left" without throwing', () => {
    expect(() =>
      mount(DzToastProvider, {
        slots: { default: makeViewportSlot({ position: 'bottom-left' }) },
      }),
    ).not.toThrow()
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: makeViewportSlot({ class: 'custom-viewport' }) },
    })
    expect(wrapper.html()).toContain('custom-viewport')
  })
})
