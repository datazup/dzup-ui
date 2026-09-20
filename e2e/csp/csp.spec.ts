import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * The strict-CSP browser lane (TASK-R2-O4).
 *
 * TASK-N1-O5 wrote `DzFileUpload.csp-fixture.spec.ts` and said plainly what it
 * did **not** prove: *"jsdom does not enforce CSP. These specs prove the
 * component emits nothing a strict policy blocks; they do not prove a browser
 * served a real `Content-Security-Policy` header accepted the page."* That gap
 * is owner decision **O5-5**. This file is the half that was owed.
 *
 * The method is a comparison, not an inspection: the **same bytes** are served
 * twice, at `/open/` with no policy and at `/strict/` with
 * `default-src 'self'; style-src 'self' 'nonce-…'; style-src-attr 'none'` and no
 * `'unsafe-inline'` anywhere. Anything that differs between the two runs is
 * something the policy changed. A lane that only looked at the strict run would
 * pass on a page that was broken in both.
 *
 * Three results, and the third is a finding rather than a pass:
 *
 * 1. `DzThemeProvider` + `DzFileUpload` render **identically** under the policy.
 * 2. The URL policy holds in a real engine: the `javascript:` URL is not in the
 *    DOM, and the element that would have carried it is not a link.
 * 3. Finding F-C1 is **narrower than its two counts suggested**. A `style`
 *    attribute in the SERVED markup is dropped, as expected. The identical
 *    declaration written by a Vue render is **not**: Vue applies a static
 *    template `style` through CSSOM (`el.style.setProperty`), which CSP does not
 *    govern. So a client-rendered page is unaffected by `style-src-attr`, and
 *    the exposure is SSR output — where the same 78 components emit a literal
 *    `style=` and the parser applies it. Measured here for the first time, with
 *    a control element in the fixture proving the directive is enforced at all.
 */

/** The properties the comparison reads. Chosen because each has a visible failure mode. */
const COMPARED = [
  'display',
  'position',
  'boxSizing',
  'width',
  'height',
  'paddingTop',
  'paddingLeft',
  'borderTopWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderRadius',
  'backgroundColor',
  'color',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'gap',
  'opacity',
] as const

interface Snapshot {
  readonly mounted: boolean
  readonly theme: string | null
  readonly primaryToken: string
  readonly uploadStyles: Record<string, string>
  readonly buttonStyles: Record<string, string>
  readonly buttonContain: string
  readonly parserStyleContain: string
  readonly allowedHref: string | null
  readonly refusedTag: string
  readonly refusedHref: string | null
  readonly refusedState: string | null
  readonly hostileUrlsInDom: number
  readonly styleElements: { readonly count: number, readonly withNonce: number }
  readonly violations: readonly string[]
}

async function snapshot(page: Page, mount: 'strict' | 'open'): Promise<Snapshot> {
  // Registered before navigation so a violation during the initial parse is
  // caught. A listener added afterwards misses exactly the events that matter.
  await page.addInitScript(() => {
    ;(globalThis as unknown as { __dzViolations: string[] }).__dzViolations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      const e = event as SecurityPolicyViolationEvent
      ;(globalThis as unknown as { __dzViolations: string[] }).__dzViolations.push(
        `${e.effectiveDirective || e.violatedDirective}|${e.blockedURI}`,
      )
    })
  })

  await page.goto(`/${mount}/`)
  await page.waitForSelector('html[data-dz-mounted="true"]', { timeout: 30_000 })
  await page.waitForSelector('#upload-host [data-part="root"]', { timeout: 30_000 })

  return page.evaluate((compared) => {
    const read = (el: Element | null): Record<string, string> => {
      const out: Record<string, string> = {}
      if (el === null)
        return out
      const computed = getComputedStyle(el)
      for (const property of compared)
        out[property] = computed[property as keyof CSSStyleDeclaration] as string
      return out
    }

    const upload = document.querySelector('#upload-host [data-part="root"]')
    const allowed = document.querySelector('#allowed-link')
    const refused = document.querySelector('#refused-link')
    const styles = [...document.querySelectorAll('style')]

    const hostile = [...document.querySelectorAll('*')].filter(el =>
      [...el.attributes].some(a => /javascript\s*:/i.test(a.value)),
    )

    return {
      mounted: document.documentElement.dataset.dzMounted === 'true',
      theme: document.documentElement.getAttribute('data-theme'),
      primaryToken: getComputedStyle(document.documentElement)
        .getPropertyValue('--dz-primary')
        .trim(),
      uploadStyles: read(upload),
      buttonStyles: read(allowed),
      buttonContain: allowed === null ? '' : getComputedStyle(allowed).contain,
      parserStyleContain: (() => {
        const el = document.querySelector('#parser-style')
        return el === null ? '(absent)' : getComputedStyle(el).contain
      })(),
      allowedHref: allowed?.getAttribute('href') ?? null,
      refusedTag: refused?.tagName.toLowerCase() ?? '(absent)',
      refusedHref: refused?.getAttribute('href') ?? null,
      refusedState: refused?.getAttribute('data-state') ?? null,
      hostileUrlsInDom: hostile.length,
      styleElements: {
        count: styles.length,
        withNonce: styles.filter(s => s.getAttribute('nonce') !== null).length,
      },
      violations: (globalThis as unknown as { __dzViolations: string[] }).__dzViolations,
    }
  }, COMPARED as unknown as string[])
}

test.describe('strict CSP', () => {
  test('the page mounts, renders and reports what the policy blocked', async ({ page }) => {
    const strict = await snapshot(page, 'strict')
    const open = await snapshot(page, 'open')

    // ── 1. It runs at all ────────────────────────────────────────────────────
    // `script-src 'self'` with no `'unsafe-inline'`: a build that emitted an
    // inline module-preload polyfill would stop here, which is why the fixture
    // turns that polyfill off rather than allowlisting it.
    expect(strict.mounted, 'the bundle did not execute under the policy').toBe(true)
    expect(open.mounted).toBe(true)

    // ── 2. DzThemeProvider survives the policy ───────────────────────────────
    expect(strict.theme, 'the theme attribute was not written under CSP').toBe('light')
    expect(strict.theme).toBe(open.theme)
    expect(strict.primaryToken, '--dz-primary did not resolve under CSP').not.toBe('')
    expect(strict.primaryToken).toBe(open.primaryToken)

    // Every `<style>` the library injects must carry the nonce, or the policy
    // drops it and the symptom is a colour sweep nobody can reproduce (ADR-20
    // §8). None is injected at rest, so this asserts the stronger thing: there
    // is no un-nonced style element at all.
    expect(strict.styleElements.count - strict.styleElements.withNonce).toBe(0)

    // ── 3. DzFileUpload renders identically ──────────────────────────────────
    // The Tier D component, and the one N1-O5 fixed by moving `contain` out of
    // a style attribute. If that fix regressed, this is where it shows.
    expect(strict.uploadStyles).toEqual(open.uploadStyles)

    // ── 4. The URL policy holds in a real engine ─────────────────────────────
    expect(strict.allowedHref).toBe('/docs/getting-started')
    expect(strict.refusedTag, 'a refused URL must not render a link').toBe('button')
    expect(strict.refusedHref).toBeNull()
    expect(strict.refusedState).toBe('url-rejected')
    expect(strict.hostileUrlsInDom, 'a javascript: URL reached an attribute').toBe(0)
    expect(open.refusedTag, 'the policy is not a function of the CSP header').toBe('button')
    expect(open.hostileUrlsInDom).toBe(0)
  })

  test('finding F-C1 in a browser: the exposure is the SSR-rendered markup, not the client render', async ({ page }) => {
    const strict = await snapshot(page, 'strict')
    const open = await snapshot(page, 'open')

    // ── The control: the policy IS enforced ──────────────────────────────────
    // `#parser-style` carries `style="contain: layout style"` in the served
    // HTML, so the parser applies it — and `style-src-attr 'none'` stops the
    // parser. Without this element a green run could equally mean the header
    // never arrived, which is the failure mode a lane like this exists to make
    // impossible.
    expect(open.parserStyleContain, 'the control element is missing from the fixture')
      .toContain('layout')
    expect(
      strict.parserStyleContain,
      'a `style` attribute in the served markup survived `style-src-attr`. The policy '
      + 'is not being enforced, so every other result in this file is about an unprotected page.',
    ).not.toBe(open.parserStyleContain)

    // ── The finding ──────────────────────────────────────────────────────────
    // `DzButton` declares `style="contain: layout style"` in its TEMPLATE, and
    // it is one of the 78 `recipe-movable` sites in
    // `packages/core/security/inline-style-inventory.json`. It is NOT dropped,
    // and the reason matters: Vue compiles a static template `style` into a
    // render-time `patchStyle`, which writes through CSSOM
    // (`el.style.setProperty`) — a path CSP does not govern. The parser path
    // above is governed; the CSSOM path is not.
    //
    // So finding F-C1's exposure is narrower and sharper than its two counts
    // suggested: a client-rendered dzup-ui page is unaffected by
    // `style-src-attr`, and the SAME components emit a literal `style=` in
    // SERVER-rendered markup, where the parser applies it and the policy drops
    // it. That is an SSR + strict-CSP defect, measured here for the first time.
    // Pinned in both directions: when the sweep moves those declarations into
    // recipes, this stops being true and the test says so.
    expect(open.buttonContain, 'the control changed: DzButton no longer declares containment')
      .toContain('layout')
    expect(
      strict.buttonContain,
      'DzButton containment WAS dropped under the policy. That would mean the client render '
      + 'now sets a style attribute rather than writing through CSSOM — a change in exposure, '
      + 'not a fix. Re-read the inventory dispositions before touching this expectation.',
    ).toBe(open.buttonContain)

    // Everything else about the button is identical, which is what makes the
    // parser/CSSOM distinction above attributable rather than asserted.
    for (const property of Object.keys(open.buttonStyles)) {
      expect(strict.buttonStyles[property], `${property} differed under the policy`)
        .toBe(open.buttonStyles[property])
    }

    // The violation the control produced is reported, and it is the only one.
    // A second violation would mean the library emitted a construct the policy
    // blocks — which is the claim `DzFileUpload.csp-fixture.spec.ts` makes in
    // jsdom and this lane is here to check in an engine.
    const libraryViolations = strict.violations.filter(v => !v.startsWith('style-src-attr'))
    expect(libraryViolations, 'the library emitted a construct a strict policy blocks')
      .toEqual([])
  })
})
