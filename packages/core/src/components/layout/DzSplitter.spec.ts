import { mount } from '@vue/test-utils'
/**
 * DzSplitter (alias for DzResizable) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzSplitter from './DzSplitter.vue'
import DzSplitterHandle from './DzSplitterHandle.vue'
import DzSplitterPanel from './DzSplitterPanel.vue'

/** Helper to render a splitter layout */
function mountSplitter(splitterProps: Record<string, unknown> = {}) {
  return mount(DzSplitter, {
    props: { direction: 'horizontal', ...splitterProps },
    slots: {
      default: () => [
        h(DzSplitterPanel, { defaultSize: 50 }, {
          default: () => 'Panel A',
        }),
        h(DzSplitterHandle, { withHandle: true }),
        h(DzSplitterPanel, { defaultSize: 50 }, {
          default: () => 'Panel B',
        }),
      ],
    },
  })
}

describe('dzSplitter — Unit Tests', () => {
  it('renders successfully', () => {
    const wrapper = mountSplitter()
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountSplitter()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('forwards aria-label', () => {
    const wrapper = mountSplitter({ ariaLabel: 'Splitter panels' })
    expect(wrapper.attributes('aria-label')).toBe('Splitter panels')
  })

  it('forwards aria-labelledby', () => {
    const wrapper = mountSplitter({ ariaLabelledby: 'splitter-label' })
    expect(wrapper.attributes('aria-labelledby')).toBe('splitter-label')
  })

  it('forwards aria-describedby', () => {
    const wrapper = mountSplitter({ ariaDescribedby: 'splitter-desc' })
    expect(wrapper.attributes('aria-describedby')).toBe('splitter-desc')
  })

  it('forwards id to root element', () => {
    const wrapper = mountSplitter({ id: 'my-splitter' })
    // SplitterGroup from Reka UI may render the id on its root element
    expect(wrapper.html()).toContain('my-splitter')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSplitter, {
      props: { direction: 'horizontal' },
      attrs: { class: 'my-splitter' },
      slots: {
        default: () => [
          h(DzSplitterPanel, { defaultSize: 100 }, {
            default: () => 'Content',
          }),
        ],
      },
    })
    expect(wrapper.classes()).toContain('my-splitter')
  })

  it('renders panel content', () => {
    const wrapper = mountSplitter()
    expect(wrapper.text()).toContain('Panel A')
    expect(wrapper.text()).toContain('Panel B')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountSplitter({ disabled: true })
    expect(wrapper.attributes('data-disabled')).toBe('')
  })

  it('does not set data-disabled when not disabled', () => {
    const wrapper = mountSplitter({ disabled: false })
    expect(wrapper.attributes('data-disabled')).toBeUndefined()
  })

  it('renders vertical direction', () => {
    const wrapper = mountSplitter({ direction: 'vertical' })
    expect(wrapper.exists()).toBe(true)
  })
})

describe('dzSplitterPanel — Unit Tests', () => {
  it('renders within the splitter group', () => {
    const wrapper = mountSplitter()
    const panels = wrapper.findAllComponents(DzSplitterPanel)
    expect(panels).toHaveLength(2)
  })
})

describe('dzSplitterHandle — Unit Tests', () => {
  it('renders within the splitter group', () => {
    const wrapper = mountSplitter()
    const handles = wrapper.findAllComponents(DzSplitterHandle)
    expect(handles).toHaveLength(1)
  })
})

/**
 * WCAG 2.2 SC 2.5.7 Dragging Movements — the single-pointer, non-drag path.
 *
 * Owner decision **D117 option A**, taken 2026-09-19. `DzSplitter` and
 * `DzResizable` share one Reka handle, so one implementation closed both
 * surfaces — and these tests exist precisely because "they are the same
 * component" is an assumption that only stays true while something checks it.
 * The reasoning behind the capture-phase spy is in `DzResizable.spec.ts`.
 */
describe('dzSplitterHandle — SC 2.5.7 single-pointer resize (D117/A)', () => {
  function spyOnHandleKeys(wrapper: ReturnType<typeof mountSplitter>): KeyboardEvent[] {
    const seen: KeyboardEvent[] = []
    wrapper.element.addEventListener('keydown', (event: Event) => {
      seen.push(event as KeyboardEvent)
      event.stopPropagation()
    }, true)
    return seen
  }

  it('renders a decrease and an increase control on the gutter', () => {
    const wrapper = mountSplitter()

    expect(wrapper.find('[data-part="step-decrease"]').exists()).toBe(true)
    expect(wrapper.find('[data-part="step-increase"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-dz-resize-step]')).toHaveLength(2)
  })

  it('keeps the controls OUTSIDE the separator — axe `nested-interactive`', () => {
    // The alias must not drift structurally from DzResizableHandle: the same
    // axe rule (WCAG 4.1.2, serious) applies to the same Reka separator.
    const separator = mountSplitter().find('[data-part="separator"]').element

    expect(separator.querySelector('[data-dz-resize-step]')).toBeNull()
    expect(separator.nextElementSibling?.querySelectorAll('[data-dz-resize-step]'))
      .toHaveLength(2)
  })

  it('a single click, with no pointer movement, drives the resize handler', async () => {
    const wrapper = mountSplitter()
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-decrease"]').trigger('click')
    await wrapper.find('[data-part="step-increase"]').trigger('click')

    expect(seen.map(e => e.key)).toEqual(['ArrowLeft', 'ArrowRight'])
    for (const event of seen)
      expect((event.target as HTMLElement).hasAttribute('data-resize-handle')).toBe(true)
  })

  it('maps to the block axis when the panes stack vertically', async () => {
    const wrapper = mountSplitter({ direction: 'vertical' })
    const seen = spyOnHandleKeys(wrapper)

    await wrapper.find('[data-part="step-decrease"]').trigger('click')
    await wrapper.find('[data-part="step-increase"]').trigger('click')

    expect(seen.map(e => e.key)).toEqual(['ArrowUp', 'ArrowDown'])
  })

  it('renders no stepper pair when the group is frozen', () => {
    expect(mountSplitter({ disabled: true }).find('[data-dz-resize-step]').exists()).toBe(false)
  })

  it('renders the same affordance as DzResizableHandle, attribute for attribute', () => {
    const splitter = mountSplitter().find('[data-dz-resize-step="decrease"]')

    // The two components are a naming alias, and a conformance claim published
    // for both must not be able to hold for only one of them.
    expect(splitter.attributes('tabindex')).toBe('-1')
    expect(splitter.attributes('type')).toBe('button')
    expect(splitter.attributes('aria-label')).toBe('Shrink panel')
    expect(splitter.classes()).toContain('h-6')
    expect(splitter.classes()).toContain('w-6')
  })
})
