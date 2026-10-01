import { DZ_DIRECTION_KEY } from '@dzup-ui/contracts'
import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzToolbar -- Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { anatomy as toolbarAnatomy } from './DzToolbar.anatomy.ts'
import DzToolbar from './DzToolbar.vue'

describe('dzToolbar -- Unit Tests', () => {
  // -- Slot placement --

  it('places start, center, and end slots in DOM order', () => {
    const wrapper = mount(DzToolbar, {
      slots: {
        start: '<span data-testid="start">S</span>',
        center: '<span data-testid="center">C</span>',
        end: '<span data-testid="end">E</span>',
      },
    })
    const regions = wrapper.findAll('[data-toolbar-region]')
    expect(regions.map(r => r.attributes('data-toolbar-region'))).toEqual([
      'start',
      'center',
      'end',
    ])
  })

  it('uses the default slot as the start region', () => {
    const wrapper = mount(DzToolbar, {
      slots: { default: '<span data-testid="dflt">Default</span>' },
    })
    const start = wrapper.find('[data-toolbar-region="start"]')
    expect(start.find('[data-testid="dflt"]').exists()).toBe(true)
  })

  it('renders a spacer instead of a center region when center slot is absent', () => {
    const wrapper = mount(DzToolbar, {
      slots: {
        start: '<button>A</button>',
        end: '<button>B</button>',
      },
    })
    expect(wrapper.find('[data-toolbar-region="center"]').exists()).toBe(false)
    expect(wrapper.find('[data-toolbar-region="spacer"]').exists()).toBe(true)
  })

  it('omits the end region when end slot is absent', () => {
    const wrapper = mount(DzToolbar, {
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.find('[data-toolbar-region="end"]').exists()).toBe(false)
  })

  it('grows the center region to absorb free space', () => {
    const wrapper = mount(DzToolbar, {
      slots: { center: '<span>Title</span>' },
    })
    const center = wrapper.find('[data-toolbar-region="center"]')
    expect(center.classes()).toContain('flex-1')
  })

  // -- Variants --

  it('applies border for outlined variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'outlined' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('border')
  })

  it('applies shadow for elevated variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'elevated' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('shadow-[var(--dz-toolbar-shadow)]')
  })

  it('adds no surface decoration for flat variant', () => {
    const wrapper = mount(DzToolbar, {
      props: { variant: 'flat' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('border')
    expect(wrapper.classes()).not.toContain('shadow-[var(--dz-toolbar-shadow)]')
  })

  // -- Wrap --

  it('applies flex-wrap when wrap=true', () => {
    const wrapper = mount(DzToolbar, {
      props: { wrap: true },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('flex-wrap')
  })

  it('does not apply flex-wrap when wrap=false', () => {
    const wrapper = mount(DzToolbar, {
      props: { wrap: false },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('flex-wrap')
  })

  // -- Sticky --

  it('applies sticky class when sticky=true', () => {
    const wrapper = mount(DzToolbar, {
      props: { sticky: true },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).toContain('sticky')
  })

  it('does not apply sticky class when sticky=false', () => {
    const wrapper = mount(DzToolbar, {
      props: { sticky: false },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.classes()).not.toContain('sticky')
  })

  // -- Element --

  it('renders as <nav> when as="nav"', () => {
    const wrapper = mount(DzToolbar, {
      props: { as: 'nav' },
      slots: { start: '<button>A</button>' },
    })
    expect(wrapper.element.tagName).toBe('NAV')
  })
})

// ---------------------------------------------------------------------------
// APG `toolbar` roving focus — RESIDUAL-13, closing RESIDUAL-12 §4 `F1`
// ---------------------------------------------------------------------------

/**
 * Three controls in two regions, attached to the document so focus is real.
 *
 * `attachTo` is not optional decoration here: `document.activeElement` only
 * moves for an element that is in the document, so a detached mount would make
 * every assertion below pass for the wrong reason.
 */
function mountBar(
  props: Record<string, unknown> = {},
  provide: Record<symbol, unknown> = {},
  start = '<button data-testid="a">A</button><button data-testid="b">B</button>',
) {
  return mount(DzToolbar, {
    props: { ariaLabel: 'Document actions', ...props },
    slots: { start, end: '<button data-testid="c">C</button>' },
    attachTo: document.body,
    global: { provide },
  })
}

/** The `tabindex` of every button in the bar, in DOM order. */
function tabStops(wrapper: ReturnType<typeof mountBar>): (string | undefined)[] {
  return wrapper.findAll('button').map(b => b.attributes('tabindex'))
}

describe('dzToolbar -- APG toolbar roving focus', () => {
  it('is one tab stop: the first control is reachable and every sibling is not', () => {
    const wrapper = mountBar()
    expect(tabStops(wrapper)).toEqual(['0', '-1', '-1'])
    wrapper.unmount()
  })

  it('moves focus to the next control on ArrowRight and carries the tab stop with it', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(buttons[1]!.element)
    expect(tabStops(wrapper)).toEqual(['-1', '0', '-1'])
    wrapper.unmount()
  })

  it('crosses a region boundary — ArrowRight reaches the end region from the start region', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[1]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(buttons[2]!.element)
    expect(buttons[2]!.attributes('data-testid')).toBe('c')
    wrapper.unmount()
  })

  it('moves focus to the previous control on ArrowLeft', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[2]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(buttons[1]!.element)
    wrapper.unmount()
  })

  it('wraps at both ends, so the group is a ring rather than a dead end', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[2]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(buttons[2]!.element)
    wrapper.unmount()
  })

  it('focuses the first control on Home and the last on End', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[1]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(buttons[2]!.element)
    expect(tabStops(wrapper)).toEqual(['-1', '-1', '0'])

    await wrapper.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    expect(tabStops(wrapper)).toEqual(['0', '-1', '-1'])
    wrapper.unmount()
  })

  it('swaps the inline arrows in a RTL document, which is what `rtl: mirrored` declares', async () => {
    const wrapper = mountBar({}, { [DZ_DIRECTION_KEY]: ref('rtl') })
    const buttons = wrapper.findAll('button')
    ;(buttons[1]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(buttons[1]!.element)
    wrapper.unmount()
  })

  it('navigates the block axis when orientation is vertical, and leaves the inline arrows alone', async () => {
    const wrapper = mountBar({ orientation: 'vertical' })
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[1]!.element)

    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttons[0]!.element)

    // A vertical bar is announced as vertical; ArrowRight is not its axis.
    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('leaves a text field its own arrows — the caret is the field\'s, not the toolbar\'s', async () => {
    const wrapper = mountBar({}, {}, '<input data-testid="q" type="search"><button data-testid="b">B</button>')
    const field = wrapper.find('[data-testid="q"]')
    ;(field.element as HTMLElement).focus()

    await field.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(field.element)
    wrapper.unmount()
  })

  it('skips a disabled control rather than parking focus on it', async () => {
    const wrapper = mountBar({}, {}, '<button data-testid="a">A</button><button disabled data-testid="off">Off</button>')
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLElement).focus()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })

    // Two live controls: A in the start region and C in the end region.
    expect(document.activeElement).toBe(buttons[2]!.element)
    expect(buttons[1]!.attributes('tabindex')).toBeUndefined()
    wrapper.unmount()
  })

  it('leaves \'Tab\' to the document — one tab stop means it is not trapped', () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')
    ;(buttons[0]!.element as HTMLElement).focus()

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    buttons[0]!.element.dispatchEvent(event)

    // The declared `Tab` row says "move OUT of the toolbar". A component that
    // consumed Tab would be trapping focus, which is the opposite of the row.
    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(buttons[0]!.element)
    wrapper.unmount()
  })

  it('records the control the user reached as the single tab stop', async () => {
    const wrapper = mountBar()
    const buttons = wrapper.findAll('button')

    await buttons[2]!.trigger('focusin')

    expect(tabStops(wrapper)).toEqual(['-1', '-1', '0'])
    wrapper.unmount()
  })

  it('takes over a tab stop the toolbar itself moved, and leaves a deliberate opt-out alone', () => {
    const wrapper = mountBar({}, {}, '<button data-testid="a">A</button><button tabindex="-1" data-testid="hidden">H</button>')
    // The author's own `tabindex="-1"` is untouched; the two live controls
    // share one tab stop between them.
    expect(wrapper.find('[data-testid="hidden"]').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('[data-testid="a"]').attributes('tabindex')).toBe('0')
    expect(wrapper.find('[data-testid="c"]').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('conforms to its declared keyboard contract and consumes each inline navigation key', () => {
    const wrapper = mountBar()
    expectKeyboardContract(wrapper, toolbarAnatomy, {
      handled: ['ArrowRight', 'ArrowLeft', 'Home', 'End'],
      // The `Tab` row — "Move out of the toolbar; the toolbar is one tab stop."
      // RESIDUAL-14 §4.2 reported it `undetermined`: the controls are the
      // consumer's `<slot />` content, so nothing a source scan can see receives
      // the key, even though `applyTabStop` above is exactly the mechanism.
      // `expect: 'one'` is the half of the row a key list cannot state — the
      // roving `tabindex` takes the siblings OUT of the order, which is the
      // opposite of `DzCheckboxGroup`'s "each box is its own tab stop".
      tabStops: { of: 'button', expect: 'one' },
    })
    wrapper.unmount()
  })

  it('consumes the block-axis keys only when it is the axis the bar declares', () => {
    const vertical = mountBar({ orientation: 'vertical' })
    expectKeyboardContract(vertical, toolbarAnatomy, { handled: ['ArrowDown', 'ArrowUp'] })
    vertical.unmount()
  })
})
