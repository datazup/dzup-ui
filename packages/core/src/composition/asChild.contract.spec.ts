/**
 * The `asChild` allowlist and its shared test matrix (TASK-R5-O6,
 * 08-11 doc 03 §Composition/DOM · findings R-024, R-063).
 *
 * `asChild` makes **the consumer's own element** the rendered node. Every other
 * promise this library makes about a root — a `data-part` it stamped, a recipe
 * class it merged, a focus ring it owns — stops applying there, because there
 * is no dzup element left to carry it. A component adopting that is opting out
 * of the styling contract for its root, which has to be a decision somebody
 * recorded rather than a prop that spread by copy-paste.
 *
 * ## The inventory is 8, not the 5 the brief assumed
 *
 * The task text's count came from `grep -rln asChild packages/core/src`, which
 * matches the unrelated identifier **`hasChildren`** in `DzTreeItem`,
 * `treeNavigation.ts`, `DzCascader` and `DzTreeSelect` — four false positives —
 * and misses the six always-on triggers, which spell it `as-child` in a
 * template and never mention `asChild` at all. A word-boundary scan of the
 * script blocks plus a scan of the templates gives the real surface:
 *
 * | Mode | Components |
 * |---|---|
 * | `opt-in` prop | `DzButton`, `DzDialogClose` |
 * | `always` (pass-through trigger) | `DzContextMenuTrigger`, `DzDialogTrigger`, `DzDropdownMenuTrigger`, `DzPopoverTrigger`, `DzSheetTrigger`, `DzTooltipTrigger` |
 *
 * `DzPopconfirm` is deliberately absent: its trigger is a real `<span>` it
 * renders itself, which is why it is the one overlay whose trigger carries a
 * `data-part` (TASK-R5-O2 §2, clause S1-D2).
 *
 * ## What the allowlist gates
 *
 * Both directions, which is the point of a list rather than a convention:
 * source that uses `asChild` without an entry fails, and an entry with no
 * source fails. A component cannot add itself, because the list lives in
 * `@dzup-ui/contracts` — a package a component edit does not touch.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AS_CHILD_ALLOWLIST, asChildEntryFor } from '@dzup-ui/contracts'
import { expectAsChild } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DzButton from '../components/buttons/DzButton.vue'
import DzDialog from '../components/overlays/DzDialog.vue'
import DzDialogClose from '../components/overlays/DzDialogClose.vue'
import DzDialogContent from '../components/overlays/DzDialogContent.vue'
import DzDialogTitle from '../components/overlays/DzDialogTitle.vue'
import DzDialogTrigger from '../components/overlays/DzDialogTrigger.vue'

const HERE = dirname(fileURLToPath(import.meta.url))
const CORE_SRC = resolve(HERE, '..')
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

function collectVueFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory())
      collectVueFiles(path, out)
    else if (entry.endsWith('.vue') && entry.startsWith('Dz'))
      out.push(path)
  }
  return out
}

/**
 * Strip comments, so a usage example in a doc block is not read as code.
 *
 * Needed, not defensive: `DzDialog`, `DzTooltip`, `DzDropdownMenu`,
 * `DzPopover` and `DzSheet` each show `<DzXTrigger as-child>` in their
 * `@example`, and a naive scan reports all five as implementers of a feature
 * none of them has.
 */
function stripComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/**
 * Components that expose `asChild` **to a consumer**.
 *
 * Two discriminations matter, and getting either wrong changes the inventory:
 *
 * 1. **`\basChild\b`, not `asChild`.** The unanchored form matches
 *    `hasChildren` in `DzTreeItem`, `treeNavigation.ts`, `DzCascader` and
 *    `DzTreeSelect`. That is where the brief's "5 implementers" came from: four
 *    of the five were this identifier.
 * 2. **`as-child` wrapping `<slot />`, not `as-child` anywhere.** Six
 *    components use Reka's `as-child` around markup **they wrote themselves** —
 *    `DzSelect` on a `<ChevronDown>`, `DzCombobox`/`DzMultiSelect`/
 *    `DzTimePicker`/`DzCascader`/`DzColorPicker` on their own `<button>`. That
 *    is an internal implementation detail with no consumer surface at all, and
 *    counting it would put six components on an allowlist for a promise they do
 *    not make. The public case is the one whose child is the consumer's slot.
 */
function implementersInSource(): { component: string, mode: 'opt-in' | 'always' }[] {
  const found: { component: string, mode: 'opt-in' | 'always' }[] = []

  for (const path of collectVueFiles(CORE_SRC)) {
    const component = basename(path, '.vue')
    const source = stripComments(readFileSync(path, 'utf8'))

    // Opt-in: the component READS a prop by that name, judged from the `.vue`
    // alone. The sibling `.types.ts` is deliberately not consulted: types files
    // are per *family*, not per component, so `DzDialog.types.ts` holds
    // `DzDialogCloseProps.asChild` and a filename-based lookup attributes the
    // close button's prop to the dialog — which is how this scan first reported
    // `DzDialog` as an implementer of a feature it does not have. The `.vue`
    // that reads `props.asChild` is the component that has the feature.
    const readsProp = /\basChild\b/.test(source)

    // Always-on: an `as-child` attribute (never the bound `:as-child` form,
    // which is a forwarded prop) whose content is the consumer's slot.
    const passesThroughSlot = /\sas-child(?:\s[^>]*)?>\s*<slot\b/.test(source)

    if (readsProp)
      found.push({ component, mode: 'opt-in' })
    else if (passesThroughSlot)
      found.push({ component, mode: 'always' })
  }

  return found.sort((a, b) => a.component.localeCompare(b.component))
}

describe('the asChild allowlist gates both directions', () => {
  const inSource = implementersInSource()

  it('every component using asChild has an allowlist entry', () => {
    const unlisted = inSource
      .filter(row => asChildEntryFor(row.component) === undefined)
      .map(row => row.component)

    expect(
      unlisted,
      'A component uses `asChild` with no entry in AS_CHILD_ALLOWLIST. `asChild` opts a '
      + 'component out of the styling contract for its root — the consumer\'s element carries '
      + 'no `data-part`, no recipe class and no focus ring of ours — so adding it is a '
      + 'decision that has to be recorded with its element kinds, its guarantees and a reason. '
      + 'Add the entry in packages/contracts/src/as-child-allowlist.ts.',
    ).toEqual([])
  })

  it('every allowlist entry still names a component that uses asChild', () => {
    const present = new Set(inSource.map(row => row.component))
    const stale = AS_CHILD_ALLOWLIST
      .filter(entry => !present.has(entry.component))
      .map(entry => entry.component)

    // The other direction. A stale entry is how an allowlist stops being a list
    // of what is true and becomes a list of what was once proposed.
    expect(stale).toEqual([])
  })

  it('each entry records the mode the source actually implements', () => {
    const mismatched = inSource
      .filter((row) => {
        const entry = asChildEntryFor(row.component)
        return entry !== undefined && entry.mode !== row.mode
      })
      .map(row => `${row.component}: source is '${row.mode}'`)

    expect(mismatched).toEqual([])
  })

  it('the allowlist is 8 entries — 2 opt-in props and 6 always-on triggers', () => {
    expect(AS_CHILD_ALLOWLIST).toHaveLength(8)
    expect(AS_CHILD_ALLOWLIST.filter(e => e.mode === 'opt-in')).toHaveLength(2)
    expect(AS_CHILD_ALLOWLIST.filter(e => e.mode === 'always')).toHaveLength(6)
  })

  it('every entry carries a reason', () => {
    // An allowlist entry without a stated reason is an entry nobody reviewed,
    // and the reason is what the docs page publishes.
    const unreasoned = AS_CHILD_ALLOWLIST
      .filter(entry => entry.reason.trim().length < 20)
      .map(entry => entry.component)
    expect(unreasoned).toEqual([])
  })

  it('an entry claiming a guarantee is an entry the matrix below runs', () => {
    // Guard against a guarantee being declared for a component the matrix never
    // renders — which would be a promise in a data file and nothing else.
    const guaranteed = AS_CHILD_ALLOWLIST.filter(e => e.guarantees.length > 0)
    expect(guaranteed.length).toBeGreaterThan(0)
    for (const entry of guaranteed)
      expect(entry.unimplemented, `${entry.component} cannot both guarantee and be unimplemented`).toBeUndefined()
  })
})

describe('the shared asChild matrix', () => {
  it('a dialog trigger keeps the consumer element and wires it up', () => {
    const wrapper = mount(DzDialog, {
      props: { open: false },
      slots: {
        default: () => [
          h(DzDialogTrigger, {}, () => h('button', { class: 'consumer-el' }, 'Open')),
          h(DzDialogContent, {}, () => h(DzDialogTitle, {}, () => 'Title')),
        ],
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    expectAsChild(asChildEntryFor('DzDialogTrigger')!, {
      container: document.body,
      consumerTag: 'button',
      consumerMarker: 'consumer-el',
    })
    wrapper.unmount()
  })

  it('a close control with asChild renders the consumer button, not its own', () => {
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, {}, () => [
          h(DzDialogTitle, {}, () => 'Title'),
          h(DzDialogClose, { asChild: true }, () => h('button', { class: 'consumer-el' }, 'Cancel')),
        ]),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    expectAsChild(asChildEntryFor('DzDialogClose')!, {
      container: document.body,
      consumerTag: 'button',
      consumerMarker: 'consumer-el',
    })
    wrapper.unmount()
  })

  it('a close control WITHOUT asChild renders its own control', () => {
    // The other half of an `opt-in` entry, and the one a matrix usually forgets:
    // the default must still be a normal dzup component.
    const wrapper = mount(DzDialog, {
      props: { open: true },
      slots: {
        default: () => h(DzDialogContent, {}, () => [
          h(DzDialogTitle, {}, () => 'Title'),
          h(DzDialogClose),
        ]),
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    const own = document.body.querySelector('[data-part="close"], button[aria-label="Close"]')
    expect(own).not.toBeNull()
    wrapper.unmount()
  })

  it('a trigger does NOT stamp a data-part on the consumer\'s element', () => {
    // The negative clause of the composition rule (S1-D2, D18). Stamping a part
    // there would make this library the author of a part on markup it did not
    // write, and would put a name in the docs that the consumer's own CSS owns.
    const wrapper = mount(DzDialog, {
      props: { open: false },
      slots: {
        default: () => [
          h(DzDialogTrigger, {}, () => h('button', { class: 'consumer-el' }, 'Open')),
          h(DzDialogContent, {}, () => h(DzDialogTitle, {}, () => 'Title')),
        ],
      },
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    const consumerEl = document.body.querySelector('.consumer-el')!
    expect(consumerEl.getAttribute('data-part')).toBeNull()
    wrapper.unmount()
  })
})

describe('the button asChild prop is declared but does nothing (R-024)', () => {
  // Recorded in the allowlist as `unimplemented` rather than deleted, so the
  // defect is counted by the contract lane instead of by whoever next reads the
  // types. A published prop that does nothing is worse than an absent one: it
  // is a promise the type system confirms and the DOM ignores.
  const entry = asChildEntryFor('DzButton')!

  it('is recorded as unimplemented, with the reason', () => {
    expect(entry.unimplemented).toBeDefined()
    expect(entry.guarantees).toEqual([])
  })

  it('and the DOM agrees — asChild changes nothing', () => {
    const withProp = mount(DzButton, {
      props: { asChild: true },
      slots: { default: () => h('a', { class: 'consumer-el', href: '/x' }, 'Go') },
    })
    const without = mount(DzButton, {
      slots: { default: () => h('a', { class: 'consumer-el', href: '/x' }, 'Go') },
    })

    // Identical output: a <button> wrapping the consumer's <a> either way. If
    // this ever stops being true, `asChild` has been implemented and the entry
    // must gain real guarantees instead of an `unimplemented` note.
    expect(withProp.element.tagName).toBe('BUTTON')
    expect(withProp.element.tagName).toBe(without.element.tagName)
    expect(withProp.element.getAttribute('data-part')).toBe('root')
  })

  it('polymorphism via `as` is the feature that does work', () => {
    // Stated so the allowlist entry's advice ("use `as`") is itself checked.
    const wrapper = mount(DzButton, {
      props: { as: 'a', href: '/x' },
      slots: { default: 'Go' },
    })
    expect(wrapper.element.tagName).toBe('A')
  })
})

describe('the allowlist scanner itself fails when it should (seeded)', () => {
  it('a word-boundary scan does not match `hasChildren`', () => {
    // The precise mistake behind the brief's "5 implementers". Four of those
    // five were this.
    const decoy = 'function hasChildren(option) { return option.children.length > 0 }'
    expect(/\basChild\b/.test(decoy)).toBe(false)
    expect(/asChild/.test(decoy)).toBe(true)
  })

  it('an always-on trigger is detected from the template, not the script', () => {
    const trigger = `<template><PopoverTrigger as-child><slot /></PopoverTrigger></template>`
    expect(/<\w[^>]*\sas-child[\s>/]/.test(trigger)).toBe(true)
    expect(/\basChild\b/.test(trigger)).toBe(false)
  })

  it('a forwarded `:as-child="asChild"` is opt-in, not always-on', () => {
    // DzDialogClose's shape. Counting it as always-on would claim a default it
    // does not have.
    const forwarded = `<DialogClose :as-child="asChild"><slot /></DialogClose>`
    expect(/:as-child=/.test(forwarded)).toBe(true)
  })

  it('checkAsChild reports a substituted tag', () => {
    const Substituted = defineComponent({
      setup: () => () => h('div', { 'class': 'consumer-el', 'tabindex': '0', 'data-x': '1' }, 'x'),
    })
    const wrapper = mount(Substituted, { attachTo: document.body })

    expect(() =>
      expectAsChild(
        { component: 'Seeded', mode: 'always', elements: '*', guarantees: ['semantics'] },
        { container: wrapper.element.parentElement!, consumerTag: 'button', consumerMarker: 'consumer-el' },
      ),
    ).toThrow(/rendered as <div>/)
    wrapper.unmount()
  })

  it('checkAsChild reports a missing consumer element', () => {
    const Swallowed = defineComponent({ setup: () => () => h('button', 'ours') })
    const wrapper = mount(Swallowed, { attachTo: document.body })

    expect(() =>
      expectAsChild(
        { component: 'Seeded', mode: 'always', elements: '*', guarantees: ['semantics'] },
        { container: wrapper.element.parentElement!, consumerTag: 'button', consumerMarker: 'consumer-el' },
      ),
    ).toThrow(/is not in the\s+rendered output/)
    wrapper.unmount()
  })

  it('checkAsChild reports a non-focusable consumer element', () => {
    const Div = defineComponent({
      setup: () => () => h('div', { 'class': 'consumer-el', 'data-x': '1' }, 'x'),
    })
    const wrapper = mount(Div, { attachTo: document.body })

    expect(() =>
      expectAsChild(
        { component: 'Seeded', mode: 'always', elements: '*', guarantees: ['keyboard'] },
        { container: wrapper.element.parentElement!, consumerTag: 'div', consumerMarker: 'consumer-el' },
      ),
    ).toThrow(/received no `tabindex`/)
    wrapper.unmount()
  })
})
