import { expect, test } from '@playwright/test'
import {
  canvas,
  declareUnrun,
  expectRendered,
  knownFailure,
  matrixProject,
  openTarget,
  RUNNABLE_TARGETS,
} from './fixtures'

/**
 * The browser matrix (TASK-OSS-P5-03).
 *
 * One spec file, run once per `matrix-{engine}-{condition}` project, over every
 * Tier B–D component. The assertions are chosen per condition, so a cell in the
 * report answers "does DzSelect survive forced colors in WebKit" rather than
 * contributing to a pass count that answers nothing.
 *
 * **Why the assertions are this shallow.** Each condition asserts one property
 * that the condition itself makes checkable and that a component cannot fake:
 * a visible focus indicator, no running animation, no horizontal overflow, a
 * pointer target big enough to hit. Deeper behaviour — that a combobox filters,
 * that a dialog restores focus — belongs in `e2e/components`, which already
 * owns it in one engine. Repeating it eighteen times would triple the runtime
 * to re-prove what one lane already proves, and would bury the one thing this
 * lane exists to find.
 */

const NON_COLORS = new Set(['', 'none', 'auto', 'transparent', 'rgba(0, 0, 0, 0)'])

declareUnrun()

for (const target of RUNNABLE_TARGETS) {
  test.describe(target.component, () => {
    test(`renders under the condition`, async ({ page }) => {
      await openTarget(page, target)
      await expectRendered(page)
    })

    test(`condition assertion`, async ({ page }) => {
      const { condition } = matrixProject()

      // A cell in `known-failures.json` runs as `test.fail()` rather than being
      // skipped: it still loads the story, still costs the wall-clock, still
      // reports — and Playwright fails the run if it UNEXPECTEDLY PASSES. That
      // makes the ledger a ratchet that can only shrink, where a skip list is a
      // place failures go to be forgotten.
      const known = knownFailure(target.component, condition)
      if (known !== undefined)
        test.fail(true, known.reason)

      await openTarget(page, target)
      const root = canvas(page)
      await expectRendered(page)

      switch (condition) {
        case 'default': {
          // The focus indicator has to survive the default too, or the
          // forced-colors result below has nothing to be a regression from.
          await expectFocusIndicator(page)
          break
        }

        case 'forced-colors': {
          // WCAG 1.4.11 in a forced-colors context: the component may not rely
          // on a background colour the OS has just replaced. An outline or a
          // border has to remain, because that is what survives.
          await expectFocusIndicator(page)
          break
        }

        case 'reduced-motion': {
          // Nothing may still be animating a second after the story settles.
          // `getAnimations` sees CSS animations, transitions and the Web
          // Animations API alike, which is the only way to catch a component
          // that honours the media query in its CSS and then animates in JS.
          //
          // **Why the visibility filter (TASK-N1-O2).** The document also
          // contains Storybook's own chrome. `.sb-preparing-story` keeps a
          // `.sb-loader` spinner running `sb-rotate360` forever and is hidden
          // with `display: none` once the story is shown, never removed.
          // CSS Animations Level 1 says setting `display: none` "will terminate
          // any running animation applied to the element and its descendants" —
          // chromium and firefox do; **WebKit 26.5 does not**, and reports the
          // spinner as `running`. Measured: 84 of 88 Tier B–D components failed
          // this condition on WebKit, every one of them naming Storybook's
          // `DIV.sb-loader` and none naming anything the component rendered.
          //
          // Filtering on `checkVisibility()` (all three engines support it)
          // states the real rule rather than special-casing a class name: an
          // animation on an element with no box cannot be perceived, so it
          // cannot violate prefers-reduced-motion. Portalled overlays stay in
          // scope, because they have boxes.
          await page.waitForTimeout(1_000)
          const running = await page.evaluate(() =>
            document
              .getAnimations()
              .filter((a) => {
                if (a.playState !== 'running')
                  return false
                const node = (a.effect as KeyframeEffect | null)?.target ?? null
                if (node === null)
                  return true
                return node.isConnected && node.checkVisibility()
              })
              .map((a) => {
                const node = (a.effect as KeyframeEffect | null)?.target ?? null
                if (node === null)
                  return 'unknown'
                const cls = node.getAttribute('class')
                return cls === null || cls === '' ? node.nodeName : `${node.nodeName}.${cls}`
              }),
          )
          expect(
            running,
            `${target.component} is still animating under prefers-reduced-motion: reduce`,
          ).toEqual([])
          break
        }

        case 'zoom-400': {
          // WCAG 1.4.10 Reflow: at 320 CSS px there must be no horizontal
          // scroll. Measured on the document, not on the component, because a
          // component that overflows its container is exactly the failure.
          //
          // **Why the canvas is constrained first (TASK-N1-O3, harness defect
          // H2).** The Storybook preview sets `layout: 'centered'` globally,
          // which makes `<body>` a flex container and `#storybook-root` a flex
          // ITEM with the initial `min-width: auto`. A flex item may not shrink
          // below its min-content width, so the canvas is sized by the story's
          // MIN-CONTENT WIDTH and the component is never given a 320px
          // containing block to reflow into. What the document then measures is
          // not reflow at all — it is min-content width, which is a different
          // and much stricter property.
          //
          // Measured, on the story pages this lane drives:
          //
          //   DzTable    canvas 421px, its own `overflow-auto` wrapper 341.5px
          //              — the wrapper was never squeezed, so the scroller that
          //              exists for exactly this case never engaged. Constrain
          //              the canvas and the document overflow is 0 while the
          //              table scrolls inside its box: the component reflows,
          //              and the harness was reporting that it does not.
          //   DzDataGrid, DzImageComparison, DzMenu, DzOrderList, DzOtpInput,
          //   DzPopconfirm, DzTabs, DzToolbar, DzTour, DzTransfer — same shape,
          //              0px overflow once the canvas is a normal block box.
          //
          // An internal scroll container is the technique WCAG's own guidance
          // names for content that requires two-dimensional layout, so a lane
          // that cannot see it working is measuring the wrong thing. The three
          // declarations below reproduce what a 320px page actually does: a
          // block canvas at the viewport width. They do NOT relax anything
          // inside the story — `#storybook-root *` is untouched, so a component
          // whose own flex children refuse to shrink still fails, which is how
          // DzSpeedDial's 96px was found and kept.
          await page.addStyleTag({
            content: 'body.sb-main-centered{display:block}'
              + '#storybook-root{inline-size:100%;min-inline-size:0}',
          })
          const overflow = await page.evaluate(() => {
            const el = document.documentElement
            return el.scrollWidth - el.clientWidth
          })
          expect(
            overflow,
            `${target.component} overflows horizontally by ${overflow}px at 320px width`,
          ).toBeLessThanOrEqual(1)
          break
        }

        case 'touch': {
          // WCAG 2.5.8 Target Size (Minimum): every pointer target at least
          // 24x24 CSS px, unless it is inline in a sentence — the criterion's
          // own exception, applied by skipping targets whose parent is text.
          const undersized = await page.evaluate(() => {
            const selector = 'button, a[href], input, select, textarea, [role="button"], '
              + '[role="tab"], [role="option"], [role="menuitem"], [role="checkbox"], '
              + '[role="radio"], [role="switch"], [tabindex]:not([tabindex="-1"])'
            const out: { tag: string, w: number, h: number }[] = []
            for (const el of document.querySelectorAll(selector)) {
              const rect = el.getBoundingClientRect()
              if (rect.width === 0 || rect.height === 0)
                continue
              const style = getComputedStyle(el)

              // Inline exception: a control laid out inside a run of text.
              // WCAG 2.5.8 names it, because a link in a sentence cannot be
              // grown without breaking the line it sits in.
              if (style.display === 'inline')
                continue

              // A visually hidden native control is not the pointer target —
              // the styled label over it is. `DzCheckbox` and `DzFileUpload`
              // both use the pattern, and counting their 1x1 inputs reported a
              // 2.5.8 failure against an element no pointer can reach, which
              // is the kind of false positive that gets a lane switched off.
              const hidden = style.opacity === '0'
                || style.clipPath !== 'none'
                || style.clip !== 'auto'
                || (rect.width <= 2 && rect.height <= 2 && style.position === 'absolute')
              if (hidden)
                continue

              if (rect.width < 24 || rect.height < 24)
                out.push({ tag: el.tagName.toLowerCase(), w: rect.width, h: rect.height })
            }
            return out
          })
          expect(
            undersized,
            `${target.component} has pointer targets under 24x24 CSS px`,
          ).toEqual([])
          break
        }

        case 'rtl': {
          // The document actually flipped. Asserted because every other RTL
          // claim in this lane rests on it, and a Storybook global that
          // silently stopped applying would make the whole condition vacuous.
          const dir = await root.evaluate(el =>
            getComputedStyle(el.querySelector('[dir]') ?? el).direction)
          expect(dir, `${target.component} did not render right-to-left`).toBe('rtl')
          break
        }
      }
    })
  })
}

/**
 * Focus the first focusable node in the canvas and assert something visible
 * marks it.
 *
 * Returns quietly when the story has nothing focusable: a Tier B component can
 * legitimately render a story with no control in it (a provider, a compound
 * root whose trigger lives in another story), and failing that would train
 * everyone to ignore the condition.
 */
async function expectFocusIndicator(page: import('@playwright/test').Page): Promise<void> {
  const indicator = await page.evaluate((nonColors) => {
    const root = document.querySelector('#storybook-root')
    if (root === null)
      return { focusable: false as const }
    const el = root.querySelector<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (el === null)
      return { focusable: false as const }
    el.focus()
    const style = getComputedStyle(el)
    const visible = !nonColors.includes(style.outlineStyle)
      || Number.parseFloat(style.outlineWidth) > 0
      || !nonColors.includes(style.boxShadow)
      || Number.parseFloat(style.borderTopWidth) > 0
    return { focusable: true as const, visible, outline: style.outlineStyle }
  }, [...NON_COLORS])

  if (!indicator.focusable)
    return
  expect(indicator.visible, 'the focused element carries no visible indicator').toBe(true)
}
