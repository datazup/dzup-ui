/**
 * `overlays` — Tier B+ anatomy conformance (TASK-R5-O2, ADR-19).
 *
 * The family with the highest compound-part count in the catalogue, and the one
 * where the **composition rules** this packet writes down are all exercised at
 * once:
 *
 * 1. *parent-covers* — a compound part emits a vocabulary name, never `root`,
 *    and the parent declares it (`DzDropdownMenu`, `DzContextMenu`, `DzSheet`,
 *    `DzPopover`, `DzTooltip`).
 * 2. *wrapper-covers-union* — a component that renders another **declaring**
 *    component inline declares the union of what its DOM emits
 *    (`DzConfirmDialog`, which fills `DzDialogContent`).
 * 3. *`as-child` triggers are not parts* — a trigger that merges onto the
 *    consumer's own element is never given a part name, because the attribute
 *    would land on markup this library did not write (N2-S1 S1-F3 / S1-D2).
 *
 * Almost everything here is portalled to `document.body`, which is outside the
 * subtree `expectAnatomy` walks, so the DOM assertions below attach to the
 * document and query it directly rather than pretending a wrapper contains the
 * overlay.
 */

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { anatomy as commandPaletteAnatomy } from './DzCommandPalette.anatomy.ts'
import { anatomy as confirmDialogAnatomy } from './DzConfirmDialog.anatomy.ts'
import DzConfirmDialog from './DzConfirmDialog.vue'
import { anatomy as contextMenuAnatomy } from './DzContextMenu.anatomy.ts'
import { anatomy as dropdownMenuAnatomy } from './DzDropdownMenu.anatomy.ts'
import DzDropdownMenu from './DzDropdownMenu.vue'
import DzDropdownMenuContent from './DzDropdownMenuContent.vue'
import DzDropdownMenuItem from './DzDropdownMenuItem.vue'
import DzDropdownMenuSeparator from './DzDropdownMenuSeparator.vue'
import { anatomy as popconfirmAnatomy } from './DzPopconfirm.anatomy.ts'
import DzPopconfirm from './DzPopconfirm.vue'
import { anatomy as popoverAnatomy } from './DzPopover.anatomy.ts'
import { anatomy as sheetAnatomy } from './DzSheet.anatomy.ts'
import { anatomy as tooltipAnatomy } from './DzTooltip.anatomy.ts'
import { anatomy as tourAnatomy } from './DzTour.anatomy.ts'

/** Every Tier B+ component in the family, with its declaration. */
const DECLARATIONS = {
  DzCommandPalette: commandPaletteAnatomy,
  DzConfirmDialog: confirmDialogAnatomy,
  DzContextMenu: contextMenuAnatomy,
  DzDropdownMenu: dropdownMenuAnatomy,
  DzPopconfirm: popconfirmAnatomy,
  DzPopover: popoverAnatomy,
  DzSheet: sheetAnatomy,
  DzTooltip: tooltipAnatomy,
  DzTour: tourAnatomy,
} as const

afterEach(() => {
  document.body.innerHTML = ''
})

/**
 * Every `data-part` in the document that belongs to the component under test.
 *
 * Stops at any node carrying `data-part="root"`, which is another component's
 * root and therefore an anatomy boundary — the same mechanical rule
 * `expectAnatomy` applies (N2-S1 S1-F3). Without it, `DzConfirmDialog` would
 * report the `root` of the two `DzButton`s in its action row as undeclared
 * parts of its own, which is the false positive the boundary rule exists to
 * prevent.
 */
function partsInDocument(): Set<string> {
  const found = new Set<string>()
  for (const node of document.querySelectorAll('[data-part]')) {
    const part = node.getAttribute('data-part')
    if (part === null)
      continue
    // `closest` includes the node itself, which is what the boundary rule
    // wants here: neither of these overlays declares a `root` of its own, so
    // any `root` in the document is a nested component's and everything at or
    // under it belongs to that component.
    if (node.closest('[data-part="root"]') !== null)
      continue
    found.add(part)
  }
  return found
}

describe('overlays — every Tier B+ component declares an anatomy', () => {
  it('covers all nine', () => {
    expect(Object.keys(DECLARATIONS).sort()).toEqual([
      'DzCommandPalette',
      'DzConfirmDialog',
      'DzContextMenu',
      'DzDropdownMenu',
      'DzPopconfirm',
      'DzPopover',
      'DzSheet',
      'DzTooltip',
      'DzTour',
    ])
  })

  it('none of them claims `root` — every one is a portal or a shell', () => {
    // The rule this family establishes: a component with no element of its own
    // in its own position does not invent one. `DzDialogContent` set the
    // precedent before this packet.
    for (const [name, anatomy] of Object.entries(DECLARATIONS))
      expect(anatomy.parts, name).not.toContain('root')
  })

  it('none of them declares a `trigger` it would set `as-child`', () => {
    // `DzPopconfirm` is the exception and it is deliberate: its trigger is a
    // real <span> this component renders, not a merge onto consumer markup.
    for (const [name, anatomy] of Object.entries(DECLARATIONS)) {
      if (name === 'DzPopconfirm')
        continue
      expect(anatomy.parts, name).not.toContain('trigger')
    }
  })
})

describe('dzDropdownMenu — its compound parts emit what it declares', () => {
  async function open(): Promise<void> {
    mount(DzDropdownMenu, {
      props: { open: true },
      slots: {
        default: () => h(DzDropdownMenuContent, null, {
          default: () => [
            h(DzDropdownMenuItem, null, {
              default: () => 'Rename',
              prefix: () => h('span', 'P'),
              suffix: () => h('span', 'S'),
            }),
            h(DzDropdownMenuSeparator),
          ],
        }),
      },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
  }

  it('emits content, item, prefix, suffix and separator into the portal', async () => {
    await open()
    for (const part of ['content', 'item', 'prefix', 'suffix', 'separator'])
      expect(document.querySelector(`[data-part="${part}"]`), part).not.toBeNull()
  })

  it('emits no `root` — the parent owns the family and renders no element', async () => {
    await open()
    expect(document.querySelector('[data-part="root"]')).toBeNull()
  })

  it('emits only names the declaration lists', async () => {
    await open()
    for (const part of partsInDocument())
      expect(dropdownMenuAnatomy.parts, `undeclared part "${part}"`).toContain(part)
  })
})

describe('dzConfirmDialog — the wrapper declares the union it renders', () => {
  async function open(extra: Record<string, unknown> = {}): Promise<void> {
    mount(DzConfirmDialog, {
      props: { open: true, title: 'Delete?', message: 'This cannot be undone.', ...extra },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
  }

  it('emits its own four parts', async () => {
    await open()
    for (const part of ['icon', 'title', 'description', 'action'])
      expect(document.querySelector(`[data-part="${part}"]`), part).not.toBeNull()
  })

  it('also emits DzDialogContent\'s parts, which is why they are declared', async () => {
    await open()
    for (const part of ['overlay', 'content'])
      expect(document.querySelector(`[data-part="${part}"]`), part).not.toBeNull()
  })

  it('emits `viewport` too, once the wrapped dialog is scrollable', async () => {
    // `scrollable` reaches DzDialogContent through this component's attribute
    // forwarding, which is exactly why `viewport` is part of the union rather
    // than a part of DzDialogContent alone.
    await open({ scrollable: true })
    expect(document.querySelector('[data-part="viewport"]')).not.toBeNull()
  })

  it('emits only names the declaration lists', async () => {
    await open()
    for (const part of partsInDocument())
      expect(confirmDialogAnatomy.parts, `undeclared part "${part}"`).toContain(part)
  })
})

describe('dzPopconfirm — the one trigger in the family that is a real element', () => {
  it('emits `trigger` on the wrapper it renders itself', () => {
    const wrapper = mount(DzPopconfirm, {
      props: { title: 'Delete?' },
      slots: { default: '<button>Delete</button>' },
    })

    expect(wrapper.find('[data-part="trigger"]').exists()).toBe(true)
    // The consumer's own button is inside it, untouched.
    expect(wrapper.find('[data-part="trigger"] button').exists()).toBe(true)
    expect(wrapper.find('button').attributes('data-part')).toBeUndefined()
  })
})
