import { expect, test } from '@playwright/test'
import {
  BLOCK_ID,
  BLOCK_PATH,
  BLOCK_TITLE,
  TEMPLATE_PATH,
  UNKNOWN_BLOCK_PATH,
  UNKNOWN_PATH,
} from './utils/catalog.ts'
import { expectPainted } from './utils/pixels.ts'

/**
 * Landing core flows, in a real Chromium, against the artifact CI ships
 * (TASK-FREE3-06).
 *
 * ## What this file is NOT for
 *
 * jsdom already covers the landing's routing, head management and a11y logic well
 * (`router.spec.ts`, `router.head.spec.ts`, `pages.a11y.spec.ts`, the per-block axe
 * suite) and those run in seconds. Re-asserting them here would just buy a slower
 * copy of a test that already exists.
 *
 * Every test below therefore asserts something jsdom structurally cannot:
 *
 *   • **real focus** — jsdom has no sequential focus navigation and no fragment
 *     activation, so "does Tab reach the skip link, and does Enter move focus into
 *     <main>" is unanswerable there. It is the exact behaviour TASK-FREE3-07's
 *     permanent `tabindex="-1"` exists for, and this is its end-to-end proof.
 *   • **real chunk loading** — jsdom resolves `() => import()` from the module
 *     graph. Whether a route's chunk is actually FETCHED over the wire, and whether
 *     it arrives and mounts, is a network fact.
 *   • **real painting** — compositing is invisible to the DOM (see `utils/pixels.ts`).
 *   • **the built artifact** — under `LANDING_E2E_TARGET=preview` these drive
 *     `vite preview` over `apps/landing/dist`: minified, code-split, real asset
 *     URLs, the SPA history fallback. None of that exists in a unit test.
 */

/** Root-relative pathname of the page currently loaded. */
function pathnameOf(url: string): string {
  return new URL(url).pathname
}

test.describe('landing flows', () => {
  test('TopNav navigates to /blocks and /templates, fetching each route chunk', async ({ page }) => {
    // Count script responses so the assertion is about the NETWORK, not the DOM:
    // both routes are `() => import()` in router.ts, and the thing a unit test
    // cannot tell you is whether that chunk was really fetched and executed.
    //
    // Keyed on `resourceType`, not on a `.js` suffix: the built dist serves
    // `assets/BlocksIndexPage-<hash>.js` but the dev server serves the module as
    // `/src/pages/BlocksIndexPage.vue`, so an extension filter passes against one
    // target and fails against the other for no app-related reason.
    const scripts: string[] = []
    page.on('response', (response) => {
      if (response.request().resourceType() === 'script')
        scripts.push(pathnameOf(response.url()))
    })

    await page.goto('/')
    await expect(page.locator('header.nav')).toBeVisible()

    // /blocks and /templates live in the "Components" menu (nav.ts). `exact`
    // matters — the nav also carries a "Browse components" CTA, and Playwright's
    // accessible-name matching is substring by default.
    const before = scripts.length
    await page.getByRole('button', { name: 'Components', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Blocks', exact: true }).click()

    await expect(page).toHaveURL(/\/blocks$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(
      scripts.length,
      'navigating to /blocks fetched no script — its route chunk never loaded',
    ).toBeGreaterThan(before)

    const beforeTemplates = scripts.length
    await page.getByRole('button', { name: 'Components', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Templates', exact: true }).click()

    await expect(page).toHaveURL(/\/templates$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(
      scripts.length,
      'navigating to /templates fetched no script — its route chunk never loaded',
    ).toBeGreaterThan(beforeTemplates)
  })

  test('⌘K palette opens, filters and navigates', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.landing-shell')).toBeVisible()

    // The global shortcut is bound by DzCommandPalette itself (a document-level
    // keydown listener), so this exercises the real binding, not a click on a
    // trigger. `ControlOrMeta` picks ⌘ on macOS and Ctrl elsewhere.
    await page.keyboard.press('ControlOrMeta+k')

    const palette = page.getByRole('dialog', { name: 'Search components, blocks and templates' })
    await expect(palette).toBeVisible()
    // With an empty query the palette shows the curated "popular" set, so an empty
    // list here means the index never reached it.
    await expect(palette.getByRole('option').first()).toBeVisible()

    await palette.getByRole('combobox').fill(BLOCK_TITLE)

    const row = palette.getByRole('option').filter({ hasText: BLOCK_TITLE }).first()
    await expect(row).toBeVisible()
    await row.click()

    // Selecting a block row routes to its detail page (GlobalCommandPalette.onSelect).
    await expect(page).toHaveURL(new RegExp(`${BLOCK_PATH}$`))
    await expect(palette).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  /**
   * Regression guard for a defect this suite found and DzCommandPalette then fixed.
   *
   * `useGlobalSearch` builds a weighted index in which a block's `id` (weight 10),
   * its `tags` (5) and the `Dz*` components it is built from (2) are all matchable,
   * and `GlobalCommandPalette` puts that flat haystack in each row's `label` so the
   * palette's own filter can see all of it.
   *
   * It used not to survive the trip: Reka's `ComboboxItem` registers each row's
   * RENDERED TEXT with `ComboboxRoot` and hid any row its own filter scored 0 — a
   * second filter downstream of both the ranker and the label filter. Because the
   * `#item` slot renders only the title and the category, everything else in the
   * index was unreachable — `hero-centered`, `stat-row` and `DzBadge` all returned
   * "No components, blocks or templates match" while `centered` worked.
   * `DzCommandPalette` now sets `ignore-filter`, so its own label filter is the
   * only one. `DzCommandPalette.spec.ts` pins the component half; this pins the
   * whole path, through the real index, in a real browser.
   */
  test('⌘K palette finds a block by its id, not just its title', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog', { name: 'Search components, blocks and templates' })
    await expect(palette).toBeVisible()

    await palette.getByRole('combobox').fill(BLOCK_ID)
    await expect(palette.getByRole('option').filter({ hasText: BLOCK_TITLE })).toBeVisible()
  })

  test('direct-loads a deep route, and unknown routes 404 without losing the URL', async ({ page }) => {
    // A cold, address-bar load of a lazy detail route — the SPA history fallback
    // plus the route chunk, neither of which a client-side `router.push` exercises.
    await page.goto(BLOCK_PATH)
    // The detail page is preview-first: the block's own preview heading IS the
    // page H1, so assert the level rather than the old hero's `#block-detail-title`.
    await expect(page.getByRole('heading', { level: 1, name: BLOCK_TITLE })).toBeVisible()
    expect(pathnameOf(page.url())).toBe(BLOCK_PATH)

    await page.goto(TEMPLATE_PATH)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(pathnameOf(page.url())).toBe(TEMPLATE_PATH)

    // Unknown path → the catch-all 404 route. The URL must survive: the old
    // behaviour was a silent redirect to `/`, which told the visitor (and every
    // crawler) that the dead link WAS the home page.
    await page.goto(UNKNOWN_PATH)
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    expect(
      pathnameOf(page.url()),
      '404 must preserve the failing URL, not redirect',
    ).toBe(UNKNOWN_PATH)

    // Unknown catalog id → a different code path (`resolveBlockId` → `toNotFound`
    // re-matches the same path through the catch-all param). It must land on the
    // same page, keep the same URL, and say specifically that the BLOCK is missing.
    await page.goto(UNKNOWN_BLOCK_PATH)
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    expect(pathnameOf(page.url())).toBe(UNKNOWN_BLOCK_PATH)
    await expect(page.getByText('There is no block at')).toBeVisible()
  })

  test('theme toggle cycles light → dark → system and never paints blank', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const html = page.locator('html')
    // Fresh profile: no `dz-theme` in localStorage ⇒ mode `system`, and
    // Playwright's default `colorScheme` is light, so the site resolves to light.
    await expect(html).toHaveAttribute('data-theme', 'light')

    // DzColorModeToggle (icon variant) cycles light → dark → system and labels
    // the action it will perform, so the accessible name is the state machine.
    const toggle = page.locator('header.nav .theme-toggle button')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme')

    await toggle.click()
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme')
    expect(await page.evaluate(() => localStorage.getItem('dz-theme'))).toBe('light')

    await toggle.click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to system theme')
    expect(await page.evaluate(() => localStorage.getItem('dz-theme'))).toBe('dark')
    // The load-bearing half: `data-theme="dark"` only says the attribute flipped.
    // The blank-page regression this helper exists for had a perfect DOM and an
    // all-white render, and it was reachable through exactly this control.
    await expectPainted(page, 'dark', 'theme toggle → dark')

    await toggle.click()
    // Back to following the OS, which Playwright reports as light.
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme')
    expect(await page.evaluate(() => localStorage.getItem('dz-theme'))).toBe('system')
    await expectPainted(page, 'light', 'theme toggle → system')
  })

  test('skip link takes focus on first Tab and moves focus into <main>', async ({ page }) => {
    // Deliberately the FIRST interaction after a cold load, with no navigation in
    // between. That is the case TASK-FREE3-07 fixed: `tabindex="-1"` used to be
    // added by the router's afterEach, which has not fired on the first painted
    // route — so the very first use of the skip link, the one a keyboard user hits
    // within seconds of arriving, was the one case with no tabindex on the target.
    await page.goto('/')
    await expect(page.locator('.landing-shell')).toBeVisible()

    await page.keyboard.press('Tab')
    const skip = page.locator('a.skip-link')
    await expect(skip, 'the skip link must be the first tab stop on the page').toBeFocused()
    // It is only useful if it becomes visible when focused (it is parked off-screen).
    await expect(skip).toBeInViewport()

    await page.keyboard.press('Enter')

    const landedInMain = await page.evaluate(() => {
      const main = document.getElementById('main')
      return !!main && main.contains(document.activeElement)
    })
    expect(
      landedInMain,
      'activating the skip link must move focus into #main, not just scroll to it',
    ).toBe(true)
  })
})
