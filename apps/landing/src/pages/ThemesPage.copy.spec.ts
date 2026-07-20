/**
 * /themes copy affordances — the blocked-clipboard path (TASK-FREE3-07).
 *
 * `copyText` used to swallow every clipboard error behind a bare
 * `catch { /* clipboard unavailable *\/ }`. That comment described the ONE case
 * that matters and then did nothing about it: `navigator.clipboard` is undefined
 * outside a secure context, so on plain HTTP a visitor pressing "Copy CSS",
 * "Copy JSON" or "Copy share link" got no clipboard write, no "Copied", no
 * error — a dead button on the page whose entire purpose is exporting a theme.
 *
 * These tests drive the real page with a REJECTING clipboard and assert the
 * three things the silent version had none of: a changed button label, a visible
 * instruction next to the text the user now has to select by hand, and an
 * announcement in the live region. The success path is asserted alongside it so
 * the failure handling cannot be "fixed" by making every copy look failed.
 */

import { cleanup, fireEvent, render, within } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import ThemesPage from './ThemesPage.vue'

const Blank = { template: '<div />' }

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: Blank }, { path: '/themes', component: Blank }],
  })
}

async function mountPage() {
  const router = makeRouter()
  await router.push('/themes')
  await router.isReady()
  const utils = render(ThemesPage, { global: { plugins: [router] } })
  await flushPromises()
  return utils
}

/** Replace the clipboard with one that always rejects — the non-secure-context case. */
function stubBlockedClipboard(): void {
  vi.stubGlobal('navigator', {
    ...globalThis.navigator,
    clipboard: { writeText: () => Promise.reject(new Error('denied')) },
  })
}

/** A clipboard that resolves, for the contrast case. */
function stubWorkingClipboard(): { writeText: ReturnType<typeof vi.fn> } {
  const writeText = vi.fn(() => Promise.resolve())
  vi.stubGlobal('navigator', { ...globalThis.navigator, clipboard: { writeText } })
  return { writeText }
}

beforeEach(() => {
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
  if (typeof globalThis.IntersectionObserver === 'undefined') {
    globalThis.IntersectionObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] {
        return []
      }
    } as unknown as typeof globalThis.IntersectionObserver
  }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

/** The page's single polite live region. */
function liveRegion(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[aria-live="polite"][role="status"]')
}

/**
 * The copy-failure alert specifically.
 *
 * NOT `getByRole('alert')`: the page embeds `ThemePreviewCluster`, a live cluster
 * of real `@dzup-ui/core` components which includes alerts of its own, so the
 * role is genuinely ambiguous on this page. Scoped by class instead.
 */
function copyAlert(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.export-error[role="alert"]')
}

describe('/themes — blocked clipboard', () => {
  it.each([
    { name: 'Copy CSS', failedLabel: 'Copy failed' },
    { name: 'Copy JSON', failedLabel: 'Copy failed' },
    { name: 'Copy share link', failedLabel: 'Copy failed' },
  ])('$name reports the failure instead of doing nothing', async ({ name, failedLabel }) => {
    stubBlockedClipboard()
    const { getByRole } = await mountPage()

    const button = getByRole('button', { name: new RegExp(name, 'i') })
    await fireEvent.click(button)
    await flushPromises()

    expect(
      button.textContent,
      `"${name}" still reads its idle label after a rejected clipboard write — `
      + 'the user has no way to tell the copy did not happen',
    ).toContain(failedLabel)
  })

  it('announces the failure and tells the user what to do instead', async () => {
    stubBlockedClipboard()
    const { getByRole } = await mountPage()

    await fireEvent.click(getByRole('button', { name: /Copy CSS/i }))
    await flushPromises()

    const region = liveRegion()
    expect(region, 'the page has no polite live region to announce copy outcomes').toBeTruthy()
    expect(region!.textContent).toMatch(/copy failed/i)
    // The announcement must be actionable, not just a statement of failure.
    expect(region!.textContent).toMatch(/manually/i)
  })

  it('shows a visible alert beside the export text the user must now select', async () => {
    stubBlockedClipboard()
    const { getByRole } = await mountPage()

    await fireEvent.click(getByRole('button', { name: /Copy CSS/i }))
    await flushPromises()

    const alert = copyAlert()
    expect(alert, 'no visible copy-failure alert was rendered').toBeTruthy()
    expect(alert!.textContent).toMatch(/select the text below/i)
  })
})

describe('/themes — working clipboard', () => {
  it('writes the text and flashes the success label', async () => {
    const { writeText } = stubWorkingClipboard()
    const { getByRole } = await mountPage()

    const button = getByRole('button', { name: /Copy CSS/i })
    await fireEvent.click(button)
    await flushPromises()

    expect(writeText).toHaveBeenCalledOnce()
    // A pristine page has no palette overrides yet, so the export is the header
    // comment plus an empty `:root {}` — assert the SHAPE of the export, not a
    // `--dz-*` line that only appears once the user has changed something.
    const written = writeText.mock.calls[0]![0] as string
    expect(written).toContain('dzup-ui theme')
    expect(written).toContain(':root {')
    expect(button.textContent).toContain('Copied')
  })

  it('shows no failure alert when the copy succeeds', async () => {
    stubWorkingClipboard()
    const { getByRole } = await mountPage()

    await fireEvent.click(getByRole('button', { name: /Copy CSS/i }))
    await flushPromises()

    expect(copyAlert()).toBeNull()
    expect(liveRegion()?.textContent).toMatch(/copied/i)
  })

  /**
   * Guards the shared-state design: `copied` and `copyFailed` are single keys, so
   * a failure on one affordance must not leave a stale success on another.
   */
  it('clears a previous success when a later copy fails', async () => {
    const working = stubWorkingClipboard()
    const { getByRole } = await mountPage()

    const css = getByRole('button', { name: /Copy CSS/i })
    await fireEvent.click(css)
    await flushPromises()
    expect(css.textContent).toContain('Copied')
    expect(working.writeText).toHaveBeenCalledOnce()

    stubBlockedClipboard()
    const json = getByRole('button', { name: /Copy JSON/i })
    await fireEvent.click(json)
    await flushPromises()

    expect(json.textContent).toContain('Copy failed')
    expect(css.textContent, 'the earlier success flash outlived the later failure').not.toContain('Copied')
  })
})

describe('/themes — live region', () => {
  it('is silent before any copy is attempted', async () => {
    stubWorkingClipboard()
    await mountPage()
    expect(within(liveRegion()!).queryByText(/./)).toBeNull()
  })
})
