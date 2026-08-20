/**
 * ContextMenuBoard — the one block the generic sweep structurally cannot reach.
 *
 * `blocks/interactions.spec.ts` clicks every enabled control in every block, and
 * that is exactly why this block escapes it: its entire menu lives behind a
 * RIGHT-click. A left click on the board does nothing, so the sweep records a
 * pass having exercised none of the six actions — the block ran 7 of its 18
 * functions while reporting full statement coverage, and it is named in
 * `vitest.config.ts` as standing debt for that reason.
 *
 * Opening the menu is therefore the whole point of this file. Everything after
 * the `contextmenu` event is ordinary: the items are real menu items and their
 * `@select` handlers write the visible "last action" readout, which is what these
 * assertions read.
 *
 * Not covered here: the ContextMenu-key path a keyboard-only user takes to the
 * same menu. Reka opens it from a real key event that jsdom does not synthesise
 * faithfully, so a test for it would assert the stub rather than the behaviour —
 * `apps/landing/e2e` is where that belongs.
 */

import { DzThemeProvider } from '@dzup-ui/core'
import { fireEvent, render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import ContextMenuBoard from './ContextMenuBoard.vue'

beforeAll(() => {
  if (typeof window.matchMedia !== 'function') {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
  }
  // Reka's floating menus measure and observe their trigger; jsdom ships neither
  // API, and without them the content never mounts.
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver
  }
  if (typeof globalThis.DOMRect === 'undefined') {
    globalThis.DOMRect = class {
      constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
      top = 0
      left = 0
      right = 0
      bottom = 0
      toJSON(): object { return {} }
    } as unknown as typeof DOMRect
  }
})

function mountBoard() {
  return render(defineComponent({
    setup: () => () => h(DzThemeProvider, null, { default: () => h(ContextMenuBoard) }),
  }))
}

/** The board is the context-menu trigger; right-clicking it opens the menu. */
async function openMenu(container: ParentNode): Promise<void> {
  const trigger = container.querySelector<HTMLElement>('.cb-board')
    ?? container.querySelector<HTMLElement>('[data-state]')!
  await fireEvent.contextMenu(trigger, { clientX: 40, clientY: 40 })
  await flushPromises()
}

describe('contextMenuBoard', () => {
  it('renders the board with no menu open', () => {
    const { container } = mountBoard()

    expect(container.querySelector('.cb-wrap')).toBeTruthy()
    expect(
      screen.queryByRole('menu'),
      'the menu must not be mounted before it is asked for',
    ).toBeNull()
  })

  it('opens the menu on right-click — the interaction the generic sweep cannot make', async () => {
    const { container } = mountBoard()

    await openMenu(container)

    const menu = screen.getByRole('menu')
    expect(menu).toBeTruthy()
    // The menu is Teleported out of the block, so it is queried from the screen
    // rather than the container — a container-scoped query would find nothing
    // and read as "the menu never opened".
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(1)
  })

  it('runs each enabled action and reports it back on the board', async () => {
    const { container } = mountBoard()

    for (const action of ['Open', 'Rename', 'Duplicate', 'Download']) {
      await openMenu(container)
      const item = screen.getAllByRole('menuitem').find(el => el.textContent?.includes(action))
      expect(item, `the menu must offer "${action}"`).toBeTruthy()

      await fireEvent.click(item!)
      await flushPromises()

      expect(
        container.textContent,
        `selecting "${action}" must be reflected on the board`,
      ).toContain(action)
    }
  })

  it('leaves the disabled item inert rather than silently acting', async () => {
    const { container } = mountBoard()
    await openMenu(container)

    const disabled = screen.getAllByRole('menuitem')
      .find(el => el.getAttribute('aria-disabled') === 'true' || el.hasAttribute('data-disabled'))
    expect(disabled, 'the block ships one deliberately disabled action').toBeTruthy()

    const before = container.textContent
    await fireEvent.click(disabled!)
    await flushPromises()

    expect(container.textContent).toBe(before)
  })
})
