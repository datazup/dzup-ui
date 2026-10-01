import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzListItem — keyboard activation (RESIDUAL-13, closing RESIDUAL-12 §4 `F9`).
 *
 * A file of its own rather than more cases in `DzList.spec.ts`, and the reason is
 * mechanical rather than stylistic: `capability-matrix.json`'s `keyboard-spec`
 * cell resolves the spec beside the component as `{dir}/{component}.spec.ts`
 * (`generate-capability-matrix.ts`'s `sidecar`), so a row whose keys are asserted
 * only in its parent's spec reads as a row with no keyboard evidence at all.
 * `DzListItem` is recorded in the ownership manifest as a `public-component`, it
 * declares its own anatomy, and it now has its own behaviour, so it owns its own
 * spec.
 *
 * Every test below drives the key and asserts the *effect* — an emitted
 * activation, a prevented default, a row that stays inert — never that a handler
 * exists. RESIDUAL-12's reading of `DzChip` is the reason: a spec that asserts a
 * handler is present is satisfied by a handler that does nothing.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzList from './DzList.vue'
import { anatomy as listItemAnatomy } from './DzListItem.anatomy.ts'
import DzListItem from './DzListItem.vue'

/** A list of one row, `interactive` unless told otherwise. */
function mountRow(listProps: Record<string, unknown> = { interactive: true }, itemProps: Record<string, unknown> = {}) {
  const wrapper = mount(DzList, {
    props: listProps,
    slots: { default: () => h(DzListItem, itemProps, { default: () => 'Aurora' }) },
  })
  return { wrapper, item: wrapper.findComponent(DzListItem) }
}

describe('dzListItem — keyboard activation', () => {
  it('is reachable by keyboard when the list is interactive', () => {
    const { item } = mountRow()
    expect(item.attributes('tabindex')).toBe('0')
  })

  it('activates on Enter, emitting the same click an interactive row emits for the mouse', async () => {
    const { item } = mountRow()

    await item.trigger('keydown', { key: 'Enter' })

    const emitted = item.emitted('click')
    expect(emitted).toHaveLength(1)
    expect(emitted![0]![0]).toBeInstanceOf(MouseEvent)
  })

  it('activates on Space', async () => {
    const { item } = mountRow()

    await item.trigger('keydown', { key: ' ' })

    expect(item.emitted('click')).toHaveLength(1)
  })

  it('consumes both activation keys, so Space does not scroll the page under the row', async () => {
    const { item } = mountRow()
    const el = item.element

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was not consumed`).toBe(true)
    }
  })

  it('reaches a consumer listener bound through $attrs, exactly as a pointer click does', async () => {
    const seen: string[] = []
    const wrapper = mount(DzList, {
      props: { interactive: true },
      slots: {
        default: () => h(
          DzListItem,
          { onClick: (event: MouseEvent) => seen.push(event.type) },
          { default: () => 'Aurora' },
        ),
      },
    })

    await wrapper.findComponent(DzListItem).trigger('keydown', { key: 'Enter' })

    // One entry, and it is a `click`: the activation is the same event a mouse
    // would have produced, which is what keeps the declared emit signature true.
    expect(seen).toEqual(['click'])
  })

  it('does not activate a non-interactive row, which is not focusable either', async () => {
    const { item } = mountRow({})

    expect(item.attributes('tabindex')).toBeUndefined()
    await item.trigger('keydown', { key: 'Enter' })
    expect(item.emitted('click')).toBeUndefined()
  })

  it('does not activate a disabled row', async () => {
    const { item } = mountRow({ interactive: true }, { disabled: true })

    await item.trigger('keydown', { key: 'Enter' })
    await item.trigger('keydown', { key: ' ' })

    expect(item.emitted('click')).toBeUndefined()
  })

  it('leaves every other key to the document — Escape is not an activation', async () => {
    const { item } = mountRow()

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    item.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(item.emitted('click')).toBeUndefined()
  })

  it('conforms to its declared keyboard contract, both keys consumed', () => {
    const { item } = mountRow()
    // `conditions: ['interactive']` is RESIDUAL-12 §4 `F14` settled: both rows
    // are scoped to a PROP, which the coherence check would otherwise read as a
    // typo'd part name. See `KeyboardCheckOptions.conditions`.
    expectKeyboardContract(item, listItemAnatomy, {
      handled: ['Enter', ' '],
      conditions: ['interactive'],
    })
  })
})
