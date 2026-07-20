/**
 * TopNav (TASK-DS-12) — the a11y contract of the regrouped header.
 *
 * The desktop menus are Reka-backed, so this asserts the wiring we own: the
 * trigger's menu semantics, that a menu opens to real links (not click handlers
 * that fake navigation), aria-current on the active route and on the group that
 * contains it, and a mobile drawer that closes on Escape and on navigation.
 */
import { cleanup, fireEvent, render, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import TopNav from './TopNav.vue'

const Blank = { template: '<div />' }

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/blocks', component: Blank },
      { path: '/templates', component: Blank },
      { path: '/animations', component: Blank },
      { path: '/themes', component: Blank },
      { path: '/compare', component: Blank },
      { path: '/pro', component: Blank },
      { path: '/ai', component: Blank },
    ],
  })
}

async function mountAt(path: string) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const utils = render(TopNav, { global: { plugins: [router] } })
  return { ...utils, router }
}

beforeEach(() => {
  // ThemeToggle -> useTheme reads matchMedia, which jsdom does not implement.
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
  vi.stubGlobal('scrollY', 0)
})

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('topNav — desktop', () => {
  it('renders exactly five top-level entries in the primary nav', async () => {
    const { getByRole } = await mountAt('/')
    const nav = getByRole('navigation', { name: 'Primary' })
    // 2 menu triggers (buttons) + 3 plain links.
    expect(within(nav).getAllByRole('button')).toHaveLength(2)
    expect(within(nav).getAllByRole('link')).toHaveLength(3)
  })

  it('gives each menu trigger correct menu semantics', async () => {
    const { getByRole } = await mountAt('/')
    const trigger = getByRole('button', { name: /Components/ })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens a menu of real links, not click handlers', async () => {
    const { getByRole } = await mountAt('/')
    const trigger = getByRole('button', { name: /Components/ })
    await fireEvent.click(trigger)
    await new Promise(r => setTimeout(r, 0))

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const menu = document.querySelector('[role="menu"]')
    expect(menu).not.toBeNull()

    const items = [...menu!.querySelectorAll('[role="menuitem"]')]
    expect(items.length).toBe(4)
    // Every item is an anchor with a resolvable href — middle-click and
    // "open in new tab" must work, which a @select handler alone would break.
    for (const item of items) {
      expect(item.tagName).toBe('A')
      expect(item.getAttribute('href')).toBeTruthy()
    }
    expect(items.map(i => i.getAttribute('href'))).toEqual([
      '/storybook/',
      '/blocks',
      '/templates',
      '/animations',
    ])
  })

  it('marks the active route with aria-current="page"', async () => {
    const { getByRole } = await mountAt('/compare')
    expect(getByRole('link', { name: 'Compare' }).getAttribute('aria-current')).toBe('page')
  })

  it('marks the group that contains the active route as current', async () => {
    const { getByRole } = await mountAt('/blocks')
    // /blocks lives under Components.
    expect(getByRole('button', { name: /Components/ }).getAttribute('aria-current')).toBe('true')
    expect(getByRole('button', { name: /Docs/ }).hasAttribute('aria-current')).toBe(false)
  })

  it('leaves every group unmarked when the route is outside them', async () => {
    const { getByRole } = await mountAt('/compare')
    expect(getByRole('button', { name: /Components/ }).hasAttribute('aria-current')).toBe(false)
    expect(getByRole('button', { name: /Docs/ }).hasAttribute('aria-current')).toBe(false)
  })
})

describe('topNav — mobile drawer', () => {
  it('is closed by default and wired to its toggle', async () => {
    const { getByLabelText } = await mountAt('/')
    const toggle = getByLabelText('Toggle menu')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.getAttribute('aria-controls')).toBe('mobile-nav')
    expect(document.getElementById('mobile-nav')).toBeNull()
  })

  it('opens, and groups its links under labelled lists', async () => {
    const { getByLabelText, getByRole } = await mountAt('/')
    await fireEvent.click(getByLabelText('Toggle menu'))

    const drawer = getByRole('navigation', { name: 'Primary (mobile)' })
    expect(drawer).toBeTruthy()
    // Each group's <ul> is labelled by its heading, so a screen reader announces
    // "Components, list" rather than an anonymous run of links.
    const lists = drawer.querySelectorAll('ul[aria-labelledby]')
    expect(lists.length).toBe(2)
    for (const list of lists) {
      const label = document.getElementById(list.getAttribute('aria-labelledby')!)
      expect(label?.textContent?.trim()).toBeTruthy()
    }
  })

  /**
   * Opening the drawer moves focus into it (TASK-FREE3-07).
   *
   * The toggle is the LAST control in the utility cluster and the drawer renders
   * after it, so before this the keyboard user who opened the menu was left
   * standing on the button — Tab took them onward through the document, not into
   * the thing they had just opened. The complement of the Escape restore below.
   */
  it('moves focus to the first link inside the drawer when it opens', async () => {
    const { getByLabelText } = await mountAt('/')
    await fireEvent.click(getByLabelText('Toggle menu'))
    // The focus move is queued on nextTick — the drawer is v-if, so it does not
    // exist in the DOM at the moment `mobileOpen` flips.
    await nextTick()

    const drawer = document.getElementById('mobile-nav')!
    const first = drawer.querySelector<HTMLElement>('a[href]')
    expect(first, 'the drawer rendered with no focusable link').toBeTruthy()
    expect(
      document.activeElement,
      `focus stayed on <${(document.activeElement as HTMLElement)?.tagName?.toLowerCase()}> `
      + 'instead of entering the drawer',
    ).toBe(first)
  })

  /**
   * Non-modal by design: the page behind stays interactive, so Tab must be free
   * to leave the drawer. Asserted so nobody "improves" this into a focus trap.
   */
  it('does not trap focus — the drawer holds no tab guards', async () => {
    const { getByLabelText } = await mountAt('/')
    await fireEvent.click(getByLabelText('Toggle menu'))
    await nextTick()

    const drawer = document.getElementById('mobile-nav')!
    expect(drawer.querySelectorAll('[data-focus-guard], [aria-hidden="true"][tabindex]').length).toBe(0)
    expect(drawer.getAttribute('aria-modal')).toBeNull()
  })

  it('closes on Escape and returns focus to the toggle', async () => {
    const { getByLabelText } = await mountAt('/')
    const toggle = getByLabelText('Toggle menu')
    await fireEvent.click(toggle)
    expect(document.getElementById('mobile-nav')).not.toBeNull()

    await fireEvent.keyDown(document.getElementById('mobile-nav')!, { key: 'Escape' })
    expect(document.getElementById('mobile-nav')).toBeNull()
    expect(document.activeElement).toBe(toggle)
  })

  it('closes when the route changes, so it never traps the user', async () => {
    const { getByLabelText, router } = await mountAt('/')
    await fireEvent.click(getByLabelText('Toggle menu'))
    expect(document.getElementById('mobile-nav')).not.toBeNull()

    await router.push('/themes')
    await new Promise(r => setTimeout(r, 0))
    expect(document.getElementById('mobile-nav')).toBeNull()
  })
})
