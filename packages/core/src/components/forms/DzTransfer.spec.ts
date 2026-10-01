import type { TransferItem } from './DzTransfer.types'
import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzTransfer — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { anatomy as transferAnatomy } from './DzTransfer.anatomy.ts'
import DzTransfer from './DzTransfer.vue'

const sourceItems: TransferItem[] = [
  { key: 'a', label: 'Item A' },
  { key: 'b', label: 'Item B' },
  { key: 'c', label: 'Item C' },
  { key: 'd', label: 'Item D', disabled: true },
]

describe('dzTransfer — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('renders role="group" on root', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[role="group"]').exists()).toBe(true)
  })

  it('renders source items', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.text()).toContain('Item A')
    expect(wrapper.text()).toContain('Item B')
  })

  it('owns every option with two labelled multiselect listboxes', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a'] },
    })
    const listboxes = wrapper.findAll('[role="listbox"]')

    expect(listboxes).toHaveLength(2)
    expect(listboxes.map(listbox => listbox.attributes('aria-label'))).toEqual([
      'Source items',
      'Target items',
    ])
    for (const listbox of listboxes) {
      expect(listbox.attributes('aria-multiselectable')).toBe('true')
      for (const option of listbox.findAll('[role="option"]'))
        expect(option.element.parentElement).toBe(listbox.element)
    }
  })

  it('places required semantics on the target listbox, not the group wrapper', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, required: true },
    })
    const [sourceList, targetList] = wrapper.findAll('[role="listbox"]')

    expect(wrapper.get('[role="group"]').attributes('aria-required')).toBeUndefined()
    expect(sourceList!.attributes('aria-required')).toBeUndefined()
    expect(targetList!.attributes('aria-required')).toBe('true')
  })

  it('renders target items based on modelValue', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a', 'b'] },
    })
    // A and B should be in target, C should be in source
    const sourceText = wrapper.text()
    expect(sourceText).toContain('Item C')
  })

  it('renders Source and Target headers', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.text()).toContain('Source')
    expect(wrapper.text()).toContain('Target')
  })

  it('renders transfer action buttons', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.find('[aria-label="Move selected to target"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Move selected to source"]').exists()).toBe(true)
  })

  it('disables transfer buttons when no items selected', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const toTarget = wrapper.find('[aria-label="Move selected to target"]')
    expect(toTarget.attributes('disabled')).toBeDefined()
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('renders search inputs when searchable', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, searchable: true },
    })
    const searchInputs = wrapper.findAll('input[type="text"]')
    expect(searchInputs.length).toBe(2)
  })

  it('does not render search inputs when not searchable', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, searchable: false },
    })
    const searchInputs = wrapper.findAll('input[type="text"]')
    expect(searchInputs.length).toBe(0)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
      attrs: { class: 'my-transfer' },
    })
    expect(wrapper.html()).toContain('my-transfer')
  })

  it('renders item count in list headers', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, modelValue: ['a'] },
    })
    // Source should show 0/3, Target should show 0/1
    expect(wrapper.text()).toContain('/3')
    expect(wrapper.text()).toContain('/1')
  })

  it('clicking source item selects it', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBeGreaterThan(0)
    expect(options[0]!.find('input, button, select, textarea, a[href]').exists()).toBe(false)
    expect(options[0]!.find('[data-transfer-check]').exists()).toBe(true)

    await options[0]!.trigger('click')
    expect(options[0]!.attributes('aria-selected')).toBe('true')
    expect(options[0]!.find('[data-transfer-check]').attributes('data-checked')).toBe('true')
  })

  it('toggles options with Enter and Space', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    const [first, second] = wrapper.findAll('[role="option"]')

    await first!.trigger('keydown', { key: 'Enter' })
    await second!.trigger('keydown', { key: ' ' })

    expect(first!.attributes('aria-selected')).toBe('true')
    expect(second!.attributes('aria-selected')).toBe('true')
  })

  it('prevents pointer and keyboard selection while disabled', async () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, disabled: true },
    })
    const option = wrapper.find('[role="option"]')

    expect(option.attributes('aria-disabled')).toBe('true')
    expect(option.attributes('tabindex')).toBe('-1')
    await option.trigger('click')
    await option.trigger('keydown', { key: 'Enter' })
    expect(option.attributes('aria-selected')).toBe('false')
  })

  it('marks both lists with data-dz-transfer-list (invalid border hook)', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
    })
    expect(wrapper.findAll('[data-dz-transfer-list]').length).toBe(2)
  })

  it('applies the danger border target selector when invalid', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, invalid: true },
    })
    // data-invalid flag + the descendant selector that colors the list borders.
    const group = wrapper.find('[data-invalid]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('class')).toContain('[&_[data-dz-transfer-list]]:border-[var(--dz-danger)]')
  })

  it('links the error message to the group via aria-describedby', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems, error: 'Selection required' },
    })
    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    const errorId = errorEl.attributes('id')!
    expect(errorId).toBeTruthy()
    expect(wrapper.find('[role="group"]').attributes('aria-describedby')).toContain(errorId)
  })
})

// ---------------------------------------------------------------------------
// RESIDUAL-13, closing RESIDUAL-12 §4 `F6` — and correcting two rows that read
// as backed for the wrong reason. `Home`/`End` were measured as unbacked;
// `ArrowDown`/`ArrowUp` were attributed to `retryRouteOwnerKeydown`, which moves
// focus to the async ERROR state's retry control and not to the next option.
// ---------------------------------------------------------------------------

describe('dzTransfer — APG listbox navigation inside a pane', () => {
  /** Mount attached, so `.focus()` and `document.activeElement` are real. */
  function mountPanes() {
    const wrapper = mount(DzTransfer, {
      props: { source: sourceItems },
      attachTo: document.body,
    })
    const panes = wrapper.findAll('[role="listbox"]')
    return { wrapper, source: panes[0]!, target: panes[1]! }
  }

  /** Enabled options of a pane, in DOM order. */
  const optionsOf = (pane: ReturnType<typeof mountPanes>['source']) =>
    pane.findAll('[role="option"]:not([data-disabled])')

  it('moves focus to the next and previous option with the arrows', async () => {
    const { wrapper, source } = mountPanes()
    const options = optionsOf(source)
    ;(options[0]!.element as HTMLElement).focus()

    await source.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[1]!.element)

    await source.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(options[0]!.element)
    wrapper.unmount()
  })

  it('moves to the first option on Home and the last on End', async () => {
    const { wrapper, source } = mountPanes()
    const options = optionsOf(source)
    ;(options[1]!.element as HTMLElement).focus()

    await source.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(options.at(-1)!.element)

    await source.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(options[0]!.element)
    wrapper.unmount()
  })

  it('skips a disabled option — Item D is never a destination', async () => {
    const { wrapper, source } = mountPanes()
    const disabled = source.find('[role="option"][data-disabled]')
    expect(disabled.exists()).toBe(true)
    expect(disabled.text()).toContain('Item D')

    await source.trigger('keydown', { key: 'End' })

    expect(document.activeElement).not.toBe(disabled.element)
    expect((document.activeElement as HTMLElement).textContent).toContain('Item C')
    wrapper.unmount()
  })

  it('does not wrap, because a listbox is not a ring', async () => {
    const { wrapper, source } = mountPanes()
    const options = optionsOf(source)

    await source.trigger('keydown', { key: 'End' })
    await source.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options.at(-1)!.element)

    await source.trigger('keydown', { key: 'Home' })
    await source.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(options[0]!.element)
    wrapper.unmount()
  })

  it('navigates each pane independently rather than across both', async () => {
    const { wrapper, source, target } = mountPanes()
    // Move Item A across so the target pane has an option of its own.
    const first = optionsOf(source)[0]!
    await first.trigger('click')
    await wrapper.find('[data-part="action"]')?.trigger('click')
    await wrapper.vm.$nextTick()

    const targetOptions = optionsOf(target)
    if (targetOptions.length === 0) {
      // The move control is addressed by part; if the markup ever stops carrying
      // one, the assertion below would silently pass on an empty pane.
      throw new Error('the target pane rendered no option, so this asserts nothing')
    }

    await target.trigger('keydown', { key: 'End' })
    expect(target.element.contains(document.activeElement)).toBe(true)
    expect(source.element.contains(document.activeElement)).toBe(false)
    wrapper.unmount()
  })

  it('consumes all four navigation keys', () => {
    const { wrapper, source } = mountPanes()
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      source.element.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was not consumed`).toBe(true)
    }
    wrapper.unmount()
  })

  it('leaves the keys alone when a pane has no option to move to', () => {
    const wrapper = mount(DzTransfer, { props: { source: [] }, attachTo: document.body })
    const pane = wrapper.findAll('[role="listbox"]')[0]!
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    pane.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    wrapper.unmount()
  })

  it('conforms to its declared keyboard contract, with the four listbox keys consumed', () => {
    const { wrapper } = mountPanes()
    expectKeyboardContract(wrapper, transferAnatomy, {
      handled: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
      // `when: 'transfer action'` is two words, so it is read as free text; no
      // single-word prop condition to admit here.
    })
    wrapper.unmount()
  })

  // -- APG listbox type-ahead: `D-RES14-2`, closed by RESIDUAL-15 --------------
  //
  // `sourceItems` above all begin with "Item", so a type-ahead test written over
  // them would pass on a function that always returned the first option. These
  // labels have four distinct initials on purpose, and two share one so the
  // cycling half can be asserted.

  const typeAheadItems: TransferItem[] = [
    { key: 'a', label: 'Apricot' },
    { key: 'b', label: 'Banana' },
    { key: 'c', label: 'Cherry' },
    { key: 'd', label: 'Blueberry' },
    { key: 'e', label: 'Elderberry', disabled: true },
  ]

  function mountTypeAhead() {
    const wrapper = mount(DzTransfer, {
      props: { source: typeAheadItems },
      attachTo: document.body,
    })
    const pane = wrapper.findAll('[role="listbox"]')[0]!
    return { wrapper, pane, options: pane.findAll('[role="option"]:not([data-disabled])') }
  }

  /** Type one character at the pane and settle. */
  const type = (pane: ReturnType<typeof mountTypeAhead>['pane'], key: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    pane.element.dispatchEvent(event)
    return event
  }

  it('moves focus to the option whose rendered label starts with the character typed', () => {
    const { wrapper, pane, options } = mountTypeAhead()
    ;(options[0]!.element as HTMLElement).focus()

    expect(type(pane, 'c').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(options[2]!.element)
    expect(options[2]!.text()).toContain('Cherry')

    wrapper.unmount()
  })

  it('cycles through same-initial options and wraps, rather than sticking on the first', () => {
    const { wrapper, pane, options } = mountTypeAhead()
    ;(options[0]!.element as HTMLElement).focus()

    // Banana (1) then Blueberry (3), then back to Banana — the search starts
    // AFTER the focused option, which is what makes repeating a key cycle.
    type(pane, 'b')
    expect(document.activeElement).toBe(options[1]!.element)
    type(pane, 'b')
    expect(document.activeElement).toBe(options[3]!.element)
    type(pane, 'b')
    expect(document.activeElement).toBe(options[1]!.element)

    wrapper.unmount()
  })

  it('matches case-insensitively and skips a disabled option even when it is the only match', () => {
    const { wrapper, pane, options } = mountTypeAhead()
    ;(options[0]!.element as HTMLElement).focus()

    expect(type(pane, 'C').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(options[2]!.element)

    // `Elderberry` is `disabled`, so it is not one of `options` at all — the key
    // matches nothing, the event is left alone, and focus does not move.
    expect(type(pane, 'e').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(options[2]!.element)

    wrapper.unmount()
  })

  it('leaves a character alone when no label matches, and when a modifier is held', () => {
    const { wrapper, pane, options } = mountTypeAhead()
    ;(options[0]!.element as HTMLElement).focus()

    expect(type(pane, 'z').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(options[0]!.element)

    // Ctrl+B is a browser shortcut, not a search. Same for Alt and Meta.
    const modified = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true })
    pane.element.dispatchEvent(modified)
    expect(modified.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(options[0]!.element)

    wrapper.unmount()
  })

  it('reads the label a consumer slotted, not the item, which is what a screen reader announces', () => {
    const wrapper = mount(DzTransfer, {
      props: { source: typeAheadItems },
      slots: { item: '<span>Zebra {{ params.item.key }}</span>' },
      attachTo: document.body,
    })
    const pane = wrapper.findAll('[role="listbox"]')[0]!
    const options = pane.findAll('[role="option"]:not([data-disabled])')
    ;(options[0]!.element as HTMLElement).focus()

    // Every rendered label now starts with "Z", so "b" — which matches
    // `Banana` as an *item* — matches nothing as a *label*.
    const missed = new KeyboardEvent('keydown', { key: 'b', bubbles: true, cancelable: true })
    pane.element.dispatchEvent(missed)
    expect(missed.defaultPrevented).toBe(false)

    const hit = new KeyboardEvent('keydown', { key: 'z', bubbles: true, cancelable: true })
    pane.element.dispatchEvent(hit)
    expect(hit.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(options[1]!.element)

    wrapper.unmount()
  })
})
