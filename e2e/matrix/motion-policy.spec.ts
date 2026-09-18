import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import {
  canvas,
  expectRendered,
  forceMotionPolicy,
  matrixProject,
  MOTION_TARGETS,
  openTarget,
  storyCompleted,
} from './fixtures'

/**
 * The motion-policy contract, asserted by the browser matrix's reduced-motion
 * condition (TASK-R5-O3, ADR-20 §7, `<requirements><motion_test_mode>`).
 *
 * `playwright.config.ts` runs this file on the three `matrix-*-reduced-motion`
 * projects only.
 *
 * ## What `conditions.spec.ts` could not prove
 *
 * Its reduced-motion cell sets the ENGINE's `prefers-reduced-motion` and then
 * checks that nothing is still animating. That is a WCAG check worth keeping, and
 * it runs over every Tier B–D component, but it cannot see the library's own
 * policy: the tokens stylesheet answers the media query directly, so a component
 * that ignores `DzProvider`'s `motion` entirely still passes. Measured, not
 * argued — with the forced mode deliberately broken, every one of its cells
 * stayed green (handoff, Continuation 2026-09-17).
 *
 * ## What this file proves instead
 *
 * The engine is set back to `no-preference` for the page, so the media query
 * says "animate". The ONLY thing left that can reduce motion is the
 * deterministic mode forced through `globalThis.__DZ_MOTION__`, which
 * `useDzMotion` reads ahead of the provider and the OS. Then, per component that
 * consumes the policy:
 *
 *   1. its animated node is revealed (the dialog opened, the accordion
 *      expanded, …);
 *   2. the policy must have RESOLVED to reduced and reached the DOM — the node
 *      carries `data-dz-motion="reduce"`, the attribute `useDzMotionAttribute`
 *      binds; and
 *   3. it must be at its END STATE immediately — no animation or transition in
 *      that subtree lasts longer than 1 ms, in any of the 20 frames after the
 *      node appears. The duration is read from `getComputedTiming()`, so a
 *      reduced animation that has already finished and one that is still
 *      running are judged the same way. Only a component that actually moves on
 *      reveal can fail this arm: seeded with every governed duration forced to
 *      2 s (2026-09-17, chromium), eight went red, and of the five attribute
 *      consumers that stayed green `DzColorModeToggle` is not revealed while
 *      `DzContextMenu`, `DzDropdownMenu`, `DzPopconfirm` and `DzSheet` ran no
 *      governed animation at all within 20 frames of opening — their
 *      `transition-*` utilities do not fire on insertion. For those the attribute
 *      arm is the load-bearing one; the annotation on each result
 *      (`governedAnimations=`) says which case a cell is in.
 *
 * A component whose policy lives in script instead (`DzAnchor` chooses
 * `window.scrollTo`'s `behavior`) is asserted on that call: every scroll it
 * issues must be `behavior: 'auto'`.
 *
 * The target list is derived from `component-meta.json` (`MOTION_TARGETS` in
 * `fixtures.ts`). A component that adopts the policy joins it automatically and
 * fails here until it has a recipe below.
 */

/** How to make a component render the node its motion policy governs. */
type Reveal
  = | { kind: 'rendered' }
    | { kind: 'click', role: 'button' | 'switch', name?: RegExp }
    | { kind: 'contextmenu', text: RegExp }
    | { kind: 'focus', role: 'button', name: RegExp }
    | { kind: 'scroll-link' }

/**
 * One recipe per motion-consuming lane target, keyed to the story
 * `targets.generated.ts` drives. Each names the control a user would use.
 */
const REVEAL: Record<string, Reveal> = {
  DzAccordion: { kind: 'click', role: 'button', name: /what is dzup-ui/i },
  DzAnchor: { kind: 'scroll-link' },
  DzBlockUI: { kind: 'click', role: 'button', name: /block panel/i },
  // Rendered with the story. Clicking would switch the document theme, which
  // animates the whole page rather than this component.
  DzColorModeToggle: { kind: 'rendered' },
  DzCommandPalette: { kind: 'click', role: 'button', name: /open command palette/i },
  DzContextMenu: { kind: 'contextmenu', text: /right-click anywhere/i },
  DzDialog: { kind: 'click', role: 'button', name: /open dialog/i },
  DzDropdownMenu: { kind: 'click', role: 'button', name: /^options$/i },
  DzPopconfirm: { kind: 'click', role: 'button', name: /delete run/i },
  DzPopover: { kind: 'click', role: 'button', name: /open popover/i },
  DzSheet: { kind: 'click', role: 'button', name: /open sheet/i },
  DzSwitch: { kind: 'click', role: 'switch' },
  // Focus opens a Reka tooltip at once; hover waits out its open delay.
  DzTooltip: { kind: 'focus', role: 'button', name: /hover me/i },
  DzTour: { kind: 'click', role: 'button', name: /start tour/i },
}

test.beforeEach(async ({ page }) => {
  const { condition } = matrixProject()
  if (condition !== 'reduced-motion') {
    throw new Error(
      `motion-policy.spec.ts ran under the ${condition} condition. playwright.config.ts scopes it to `
      + 'the matrix-*-reduced-motion projects; a run anywhere else asserts nothing meaningful.',
    )
  }
  await forceMotionPolicy(page)
  // Undo the project's `reducedMotion: 'reduce'` for this page: the media query
  // must not be able to take credit for what the forced mode does.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
})

/** Record every `window.scrollTo` options object the page passes. */
async function recordScrollCalls(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: unknown[] = []
    ;(globalThis as { __DZ_SCROLL_CALLS__?: unknown[] }).__DZ_SCROLL_CALLS__ = calls
    const original = window.scrollTo.bind(window) as (...args: unknown[]) => void
    window.scrollTo = ((...args: unknown[]) => {
      calls.push(args[0])
      original(...args)
    }) as typeof window.scrollTo
  })
}

async function reveal(page: Page, recipe: Reveal): Promise<void> {
  const root = canvas(page)
  switch (recipe.kind) {
    case 'rendered':
      return
    case 'click':
      await root.getByRole(recipe.role, recipe.name === undefined ? {} : { name: recipe.name }).first().click()
      return
    case 'contextmenu':
      await root.getByText(recipe.text).first().click({ button: 'right' })
      return
    case 'focus':
      await root.getByRole(recipe.role, { name: recipe.name }).first().focus()
      return
    case 'scroll-link':
      await root.getByRole('link').nth(1).click()
  }
}

for (const motion of MOTION_TARGETS) {
  test.describe(motion.component, () => {
    test(`resolves the forced motion policy and reaches its end state at once (${motion.parts.join(', ')})`, async ({ page }) => {
      const recipe = REVEAL[motion.component]
      expect(
        recipe,
        `${motion.component} consumes useDzMotion (component-meta.json providerHooks: ${motion.parts.join(', ')}) `
        + 'and has no reveal recipe in e2e/matrix/motion-policy.spec.ts. Add the one line that renders its animated node.',
      ).toBeDefined()

      if (motion.emits === 'script')
        await recordScrollCalls(page)

      await openTarget(page, motion.target)
      await expectRendered(page)
      await storyCompleted(page)

      // Precondition, asserted rather than assumed: the engine is NOT reporting
      // reduced motion, so nothing below can be the media query's doing.
      const env = await page.evaluate(() => ({
        channel: String((globalThis as { __DZ_MOTION__?: unknown }).__DZ_MOTION__),
        media: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }))
      expect(env.media, 'the page must report prefers-reduced-motion: no-preference').toBe(false)

      await reveal(page, recipe!)

      if (motion.emits === 'script') {
        await expect
          .poll(() => page.evaluate(() => ((globalThis as { __DZ_SCROLL_CALLS__?: unknown[] }).__DZ_SCROLL_CALLS__ ?? []).length))
          .toBeGreaterThan(0)
        const behaviours = await page.evaluate(() =>
          ((globalThis as { __DZ_SCROLL_CALLS__?: unknown[] }).__DZ_SCROLL_CALLS__ ?? [])
            .map(call => (typeof call === 'object' && call !== null ? (call as { behavior?: string }).behavior : 'no-options')))
        test.info().annotations.push({
          type: 'motion-policy',
          description: `scrollCalls=${behaviours.length} behaviours=${[...new Set(behaviours)].join('|')}`,
        })
        expect(
          behaviours,
          `${motion.component} scrolled with ${JSON.stringify(behaviours)} under __DZ_MOTION__=${env.channel}; `
          + 'the forced policy requires an instant jump',
        ).toEqual(behaviours.map(() => 'auto'))
        return
      }

      // 2. The policy resolved to reduced and reached the DOM.
      await expect(
        page.locator('[data-dz-motion="reduce"]').first(),
        `${motion.component} rendered no [data-dz-motion="reduce"] under __DZ_MOTION__=${env.channel}: `
        + 'the provider did not resolve the forced motion policy to reduced',
      ).toBeAttached()

      // 3. …and nothing in the governed subtree takes longer than 1 ms.
      //
      // Sampled on every frame for 20 frames rather than read once. The
      // attribute is in the DOM the moment a node mounts, but its enter motion
      // starts a frame or two LATER, when a `data-state` or `-enter-to` class
      // lands — a single read straight after `toBeAttached()` raced that, and
      // was measured doing so: seeded with 2 s durations, `DzDialog`'s overlay
      // and content transitions were caught on one run and missed on the next.
      // Any sighting of a governed animation longer than 1 ms fails.
      const { lingering, marked, governed } = await page.evaluate(async () => {
        const seen = new Map<string, number>()
        let governedMax = 0
        for (let frame = 0; frame < 20; frame++) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
          const inScope = document
            .getAnimations()
            .filter(animation => ((animation.effect as KeyframeEffect | null)?.target ?? null)
              ?.closest('[data-dz-motion="reduce"]') != null)
          governedMax = Math.max(governedMax, inScope.length)
          for (const animation of inScope) {
            const effect = animation.effect as KeyframeEffect
            const duration = Number(effect.getComputedTiming().duration ?? 0)
            if (!(duration > 1))
              continue
            const node = effect.target!
            const part = node.getAttribute('data-part')
            const name = 'animationName' in animation
              ? (animation as CSSAnimation).animationName
              : 'transitionProperty' in animation
                ? (animation as CSSTransition).transitionProperty
                : 'web-animation'
            seen.set(`${node.nodeName}${part === null ? '' : `[data-part=${part}]`} ${name}`, duration)
          }
        }
        return {
          marked: document.querySelectorAll('[data-dz-motion="reduce"]').length,
          governed: governedMax,
          lingering: [...seen.entries()].map(([what, duration]) => `${what} ${duration}ms`).sort(),
        }
      })
      // Recorded on the result so a report shows the check was not vacuous:
      // how many nodes carried the attribute, and the most animations the engine
      // was running inside them in any sampled frame.
      test.info().annotations.push({
        type: 'motion-policy',
        description: `marked=${marked} governedAnimations=${governed} lingering=${lingering.length}`,
      })
      expect(
        lingering,
        `${motion.component} still animates inside [data-dz-motion="reduce"]`,
      ).toEqual([])
    })
  })
}
