import { mount } from '@vue/test-utils'
/**
 * DzResizable (compound, Reka UI Splitter) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzResizable from './DzResizable.vue'
import DzResizableHandle from './DzResizableHandle.vue'
import DzResizablePanel from './DzResizablePanel.vue'

/** Helper to render a resizable layout */
function mountResizable(resizableProps = {}) {
  return mount(DzResizable, {
    props: { direction: 'horizontal', ...resizableProps },
    slots: {
      default: () => [
        h(DzResizablePanel, { defaultSize: 50 }, {
          default: () => 'Panel A',
        }),
        h(DzResizableHandle, { withHandle: true }),
        h(DzResizablePanel, { defaultSize: 50 }, {
          default: () => 'Panel B',
        }),
      ],
    },
  })
}

describe('dzResizable', () => {
  it('renders successfully', () => {
    const wrapper = mountResizable()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style', () => {
    const wrapper = mountResizable()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mountResizable({ ariaLabel: 'Resizable panels' })
    expect(wrapper.attributes('aria-label')).toBe('Resizable panels')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzResizable, {
      props: { direction: 'horizontal' },
      attrs: { class: 'my-resizable' },
      slots: {
        default: () => [
          h(DzResizablePanel, { defaultSize: 100 }, {
            default: () => 'Content',
          }),
        ],
      },
    })
    expect(wrapper.classes()).toContain('my-resizable')
  })

  it('renders panel content', () => {
    const wrapper = mountResizable()
    expect(wrapper.text()).toContain('Panel A')
    expect(wrapper.text()).toContain('Panel B')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountResizable({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('renders vertical direction', () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzResizablePanel', () => {
  it('renders within the resizable group', () => {
    const wrapper = mountResizable()
    const panels = wrapper.findAllComponents(DzResizablePanel)
    expect(panels).toHaveLength(2)
  })
})

describe('dzResizableHandle', () => {
  it('renders within the resizable group', () => {
    const wrapper = mountResizable()
    const handles = wrapper.findAllComponents(DzResizableHandle)
    expect(handles).toHaveLength(1)
  })
})

describe('dzResizable — D2: group-level `disabled` is not presentational only', () => {
  it('defect D2 -- the handle is inert when the group is disabled', () => {
    // `DzResizableContext` carried `direction` and `size` only, so
    // `<DzResizable disabled>` stamped `data-disabled` on the group and nothing
    // else — the handles stayed focusable and Arrow keys still resized. Freezing
    // a layout meant repeating `disabled` on every handle (N1-O1 defect D2).
    const wrapper = mountResizable({ disabled: true })
    const handle = wrapper.find('[data-part="separator"]')

    expect(handle.exists()).toBe(true)
    expect(handle.attributes('data-disabled')).toBe('')
    // Reka's own signal that the handle will not resize.
    expect(handle.attributes('data-panel-resize-handle-enabled')).toBe('false')
  })

  it('defect D2 -- the handle stays live when the group is not disabled', () => {
    const wrapper = mountResizable()
    const handle = wrapper.find('[data-part="separator"]')

    expect(handle.attributes('data-disabled')).toBeUndefined()
    expect(handle.attributes('tabindex')).toBe('0')
  })

  it('defect D2 -- a handle can still freeze itself inside an enabled group', () => {
    const wrapper = mount(DzResizable, {
      props: { direction: 'horizontal' },
      slots: {
        default: () => [
          h(DzResizablePanel, { defaultSize: 50 }, { default: () => 'A' }),
          h(DzResizableHandle, { disabled: true }),
          h(DzResizablePanel, { defaultSize: 50 }, { default: () => 'B' }),
        ],
      },
    })

    expect(wrapper.find('[data-part="separator"]').attributes('data-disabled')).toBe('')
  })

  it('defect D2 -- a group-disabled handle is indistinguishable from a self-disabled one', () => {
    const group = mountResizable({ disabled: true })
    const self = mount(DzResizable, {
      props: { direction: 'horizontal' },
      slots: {
        default: () => [
          h(DzResizablePanel, { defaultSize: 50 }, { default: () => 'A' }),
          h(DzResizableHandle, { withHandle: true, disabled: true }),
          h(DzResizablePanel, { defaultSize: 50 }, { default: () => 'B' }),
        ],
      },
    })

    const read = (w: ReturnType<typeof mountResizable>) => {
      const el = w.find('[data-part="separator"]').element
      return {
        dataDisabled: el.getAttribute('data-disabled'),
        resizeEnabled: el.getAttribute('data-panel-resize-handle-enabled'),
        tabindex: el.getAttribute('tabindex'),
        role: el.getAttribute('role'),
      }
    }

    expect(read(group)).toEqual(read(self))
  })
})

/**
 * WCAG 2.2 SC 2.5.7 Dragging Movements — the single-pointer, non-drag path.
 *
 * Owner decision **D117 option A**, taken 2026-09-19. Before it, every test in
 * this file passed against a handle that could only be moved by a key or by a
 * drag: `packages/core/docs/wcag-deviations.json` recorded the failure and
 * `e2e/matrix/non-drag.spec.ts` confirmed it in chromium, firefox and webkit.
 * Every test below except the `disabled` guard fails on the pre-decision
 * component, because the controls it looks for do not exist there.
 */
describe('dzResizableHandle — SC 2.5.7 single-pointer resize (D117/A)', () => {
  /**
   * Record every `keydown` the component sends to Reka's handle, and stop it
   * before Reka sees it.
   *
   * The listener sits on the GROUP in the CAPTURE phase, for a measured reason:
   * `SplitterGroup.adjustLayoutByDelta` asserts on a layout array that only
   * exists once the group has been measured, and **jsdom gives every element a
   * zero-sized box** — so Reka's own keyboard path throws here too, with or
   * without this affordance. Letting it run would add uncaught exceptions to
   * `yarn test` and prove nothing about this component. Capturing asserts
   * exactly what this component owes — the right key, with the right modifier,
   * on the element Reka listens to — and leaves the *effect* to be measured
   * where geometry is real: `e2e/matrix/non-drag.spec.ts`, three engines.
   */
  function spyOnHandleKeys(wrapper: ReturnType<typeof mountResizable>): KeyboardEvent[] {
    const seen: KeyboardEvent[] = []
    wrapper.element.addEventListener('keydown', (event: Event) => {
      seen.push(event as KeyboardEvent)
      event.stopPropagation()
    }, true)
    return seen
  }

  it('renders a decrease and an increase control on the gutter', () => {
    const wrapper = mountResizable()

    expect(wrapper.find('[data-part="step-decrease"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="step-increase"]').exists()).toBe(true)
    // The browser lane finds them by this attribute; it is part of the contract
    // between the component and `e2e/matrix/non-drag.spec.ts`.
    expect(wrapper.findAll('[data-dz-resize-step]')).toHaveLength(2)
  })

  it('keeps the controls OUTSIDE the separator — axe `nested-interactive`', () => {
    // The first implementation nested them inside the Reka handle, which
    // carries `role="separator"` and `tabindex="0"`.
    // `apps/landing/src/blocks/a11y.spec.ts` caught it: axe's
    // `nested-interactive` (WCAG 4.1.2, serious) refuses focusable content
    // inside an interactive control, and says in as many words that
    // `tabindex="-1"` does NOT exempt it, because assistive technologies can
    // still focus the element. Asserted here so the structure cannot drift
    // back without a unit test failing first, well before the landing suite.
    const wrapper = mountResizable()
    const separator = wrapper.find('[data-part="separator"]').element

    expect(separator.querySelector('[data-dz-resize-step]')).toBeNull()
    // …and they are the separator's immediate NEXT sibling, which is what
    // `step()` walks back along to find the element Reka listens on.
    const marker = separator.nextElementSibling
    expect(marker).not.toBeNull()
    expect(marker!.querySelectorAll('[data-dz-resize-step]')).toHaveLength(2)
  })

  it('a single click, with no pointer movement, drives the resize handler', async () => {
    const wrapper = mountResizable()
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-decrease"]').trigger('click')
    await wrapper.find('[data-part="step-increase"]').trigger('click')

    // Delivered to Reka's OWN marker element — `data-resize-handle` is where
    // `useWindowSplitterResizeHandlerBehavior` attaches its listener — so this
    // is the resize path, not a second one beside it.
    expect(seen).toHaveLength(2)
    for (const event of seen)
      expect((event.target as HTMLElement).hasAttribute('data-resize-handle')).toBe(true)
  })

  it('uses the keyboard path rather than a second implementation of it', async () => {
    const wrapper = mountResizable()
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-decrease"]').trigger('click')
    await wrapper.find('[data-part="step-increase"]').trigger('click')

    // A horizontal group resizes along the inline axis, and these are exactly
    // the keys `useWindowSplitterResizeHandlerBehavior` already handles — so
    // the pointer step and the keyboard step cannot drift apart.
    expect(seen.map(e => e.key)).toEqual(['ArrowLeft', 'ArrowRight'])
  })

  it('maps to the block axis when the panes stack vertically', async () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-decrease"]').trigger('click')
    await wrapper.find('[data-part="step-increase"]').trigger('click')

    expect(seen.map(e => e.key)).toEqual(['ArrowUp', 'ArrowDown'])
  })

  it('carries Shift through, so both paths agree on the larger step too', async () => {
    const wrapper = mountResizable()
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-increase"]').trigger('click', { shiftKey: true })

    expect(seen).toHaveLength(1)
    expect(seen[0]!.shiftKey).toBe(true)
  })

  it('renders no stepper pair when the group is frozen', () => {
    const wrapper = mountResizable({ disabled: true })

    // A control that cannot act would be a 24x24 pointer target that does
    // nothing, which is worse than no control at all.
    expect(wrapper.find('[data-dz-resize-step]').exists()).toBe(false)
  })

  it('rests invisible and at the 24px floor, so nothing in a consuming layout moves', () => {
    const wrapper = mountResizable()
    const button = wrapper.find('[data-part="step-decrease"]')
    const track = button.element.parentElement!
    const marker = track.parentElement!

    // The resting state is the whole reason option A was affordable: a
    // zero-size box beside the gutter, fully transparent until a pointer or a
    // focus arrives. (The real geometry is measured in three engines by the
    // `touch` matrix condition and by `non-drag.spec.ts`; this is the
    // source-level guard on the classes those measurements depend on.)
    expect(track.className).toContain('absolute')
    expect(marker.className).toContain('opacity-0')
    expect(marker.className).toContain('w-0')
    expect(button.classes()).toContain('h-6')
    expect(button.classes()).toContain('w-6')
    // Not a tab stop: APG `window-splitter` makes the separator the single tab
    // stop of the widget and its Arrow keys already satisfy SC 2.1.1.
    expect(button.attributes('tabindex')).toBe('-1')
  })
})
