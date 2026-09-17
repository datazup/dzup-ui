import { expectFallthrough } from '@dzup-ui/testing'
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

// ---------------------------------------------------------------------------
// Attribute fallthrough (TASK-R5-O6)
// ---------------------------------------------------------------------------

describe('dzToastViewport — attribute fallthrough', () => {
  // A compound sub-part: DzToast owns the family's anatomy and this component
  // has no anatomy file of its own, so the declaration is carried here rather
  // than in one. Stamping a `data-part` on it purely to make the check
  // addressable would add an emission `validate:anatomy-parts` would then
  // report as undeclared — so the spec says where the target is instead, via
  // `targetSelector`, and the component stays honest about having no parts.
  const fallthrough = {
    target: 'the ToastViewport element',
    reason:
      'Multi-root (viewport + the toast list). `$attrs` binds to the viewport, '
      + 'which is the positioned region a consumer restyles.',
  } as const

  it('a consumer\'s class lands on the viewport, not on a toast', () => {
    const wrapper = mount(DzToastProvider, {
      slots: { default: makeViewportSlot({ class: 'dz-fallthrough-probe' }) },
      attachTo: document.body,
    })

    expectFallthrough(
      wrapper.element.parentElement ?? document.body,
      fallthrough,
      { className: 'dz-fallthrough-probe', targetSelector: 'ol[tabindex]' },
      'DzToastViewport',
    )
    wrapper.unmount()
  })
})
