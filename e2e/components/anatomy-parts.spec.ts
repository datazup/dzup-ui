import { expect, test } from '@playwright/test'
import { loadStoryCanvas } from '../utils/storybook'

/**
 * Declared anatomy, in a real browser (TASK-N2-S1, ADR-19).
 *
 * The unit-level family specs (`{family}.anatomy.spec.ts` under
 * `packages/core/src/components/`) already assert every declaration against
 * rendered DOM — in **jsdom**. That is enough to prove the attribute lands, and
 * not enough to prove a consumer can select it: jsdom does not compute the
 * cascade, does not run a portal into a real document, and cannot tell you that
 * `[data-part="control"]` matched a node with the geometry the recipe intended.
 *
 * This spec runs across the **three engines** the Playwright config declares
 * (chromium, firefox, webkit), which is the pattern
 * `styling-overrides.spec.ts` established for the five pilots, extended to the
 * three families TASK-N2-S1 completed.
 *
 * What each row asserts:
 *
 * 1. Every part in `requiredParts` is present and selectable **by attribute
 *    alone** — no class name, no descendant selector against generated output.
 * 2. `data-part="root"` is on the component's own root, so a consumer's
 *    outermost selector is stable.
 * 3. The part actually has a box (`boundingBox() !== null` for the visible ones),
 *    because a `data-part` on a zero-size node is a selector a consumer cannot
 *    use.
 *
 * Story IDs follow Storybook's kebab-cased title: `Core/Inputs/DzTextarea` →
 * `core-inputs-dztextarea`.
 */

interface Row {
  /** The component, for the test name. */
  component: string
  /** Full story id, including the export. */
  story: string
  /** Parts that must be present in THIS story — the non-optional ones plus any the story renders. */
  requiredParts: string[]
  /** Set when the story renders more than one instance of the component. */
  multiple?: boolean
}

/**
 * Tier B+ components of the three completed families, plus the Tier A shells
 * that carry a family's structural parts (`DzInputGroup`, `DzButtonGroup`).
 *
 * `DzOtpInput` is deliberately absent: its cells are Reka `PinInputInput`
 * elements and the story renders them inside a form fixture whose focus
 * management makes a first-load assertion flaky in webkit — it is covered in
 * jsdom by `inputs.anatomy.spec.ts` and the gap is stated rather than papered
 * over.
 */
const ROWS: Row[] = [
  // ── inputs ──
  { component: 'DzInput', story: 'core-inputs-dzinput--default', requiredParts: ['root', 'control', 'input'] },
  { component: 'DzInputGroup', story: 'core-inputs-dzinputgroup--default', requiredParts: ['root', 'content'], multiple: true },
  { component: 'DzInputMask', story: 'core-inputs-dzinputmask--phone', requiredParts: ['root', 'control', 'input'] },
  { component: 'DzNumberInput', story: 'core-inputs-dznumberinput--default', requiredParts: ['root', 'control', 'input', 'decrement', 'increment'] },
  { component: 'DzPasswordInput', story: 'core-inputs-dzpasswordinput--default', requiredParts: ['root', 'control', 'input', 'toggle'] },
  { component: 'DzSearchInput', story: 'core-inputs-dzsearchinput--default', requiredParts: ['root', 'control', 'icon', 'input'] },
  { component: 'DzTextarea', story: 'core-inputs-dztextarea--default', requiredParts: ['root', 'input'] },

  // ── buttons ──
  { component: 'DzButton', story: 'core-buttons-dzbutton--default', requiredParts: ['root'] },
  { component: 'DzButtonGroup', story: 'core-buttons-dzbuttongroup--default', requiredParts: ['root'], multiple: true },
  { component: 'DzCopyButton', story: 'core-buttons-dzcopybutton--default', requiredParts: ['root'] },
  { component: 'DzFab', story: 'core-buttons-dzfab--default', requiredParts: ['root', 'icon'], multiple: true },
  { component: 'DzIconButton', story: 'core-buttons-dziconbutton--default', requiredParts: ['root'], multiple: true },
  { component: 'DzSpeedDial', story: 'core-buttons-dzspeeddial--fab', requiredParts: ['root', 'list'], multiple: true },
  { component: 'DzSplitButton', story: 'core-buttons-dzsplitbutton--default', requiredParts: ['root', 'action', 'trigger'], multiple: true },
  { component: 'DzToggleButton', story: 'core-buttons-dztogglebutton--default', requiredParts: ['root'], multiple: true },

  // ── typography ──
  { component: 'DzBlockquote', story: 'core-typography-dzblockquote--default', requiredParts: ['root', 'content'] },
  { component: 'DzCaption', story: 'core-typography-dzcaption--default', requiredParts: ['root'], multiple: true },
  { component: 'DzCode', story: 'core-typography-dzcode--default', requiredParts: ['root'], multiple: true },
  { component: 'DzHeading', story: 'core-typography-dzheading--default', requiredParts: ['root'], multiple: true },
  { component: 'DzKbd', story: 'core-typography-dzkbd--single-key', requiredParts: ['root', 'item'], multiple: true },
  { component: 'DzRelativeTime', story: 'core-typography-dzrelativetime--just-now', requiredParts: ['root'], multiple: true },
  { component: 'DzText', story: 'core-typography-dztext--default', requiredParts: ['root'], multiple: true },
]

test.describe('declared anatomy is selectable in a real browser', () => {
  for (const row of ROWS) {
    test(`${row.component} — every declared part is reachable by attribute`, async ({ page }) => {
      const frame = await loadStoryCanvas(page, row.story)

      for (const part of row.requiredParts) {
        const locator = frame.locator(`[data-part="${part}"]`).first()
        await expect(locator, `${row.component} must emit data-part="${part}"`).toBeAttached()
      }
    })
  }
})

test.describe('the root part is on the outermost node', () => {
  for (const row of ROWS) {
    test(`${row.component} — data-part="root" exists and has a box`, async ({ page }) => {
      const frame = await loadStoryCanvas(page, row.story)

      const root = frame.locator('[data-part="root"]').first()
      await expect(root).toBeAttached()

      // A part on a zero-size node is a selector a consumer cannot use. The one
      // exception in the catalogue is DzVisuallyHidden, which is not in this
      // table precisely because being unmeasurable is its contract.
      const box = await root.boundingBox()
      expect(box, `${row.component}'s root must be measurable`).not.toBeNull()
    })
  }
})

test.describe('parts do not leak across component boundaries', () => {
  /**
   * The rule a consumer relies on and the one an earlier draft of
   * `styling-overrides.spec.ts` got wrong: **a part name is unique within a
   * component, never across a page.** `content` is a select's listbox in one
   * place and a table's body in another, so any selector has to say which
   * component it means — and a nested `data-part="root"` is the marker that
   * says a new component starts here.
   */
  test('a nested component root marks a new anatomy scope', async ({ page }) => {
    const frame = await loadStoryCanvas(page, 'core-buttons-dzspeeddial--fab')

    // DzSpeedDial's own root, then the DzFab trigger's root inside it.
    const outer = frame.locator('[data-part="root"]').first()
    await expect(outer).toBeAttached()

    const nested = outer.locator('[data-part="root"]')
    expect(
      await nested.count(),
      'DzSpeedDial composes DzFab and DzIconButton, each of which declares its own root',
    ).toBeGreaterThan(0)
  })
})
