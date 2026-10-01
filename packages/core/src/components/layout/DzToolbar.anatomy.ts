import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzToolbar — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The other component ADR-19's opening argument names: `core.css` selects on
 * `.dz-toolbar[data-variant=elevated]`, so `data-variant` and `data-size` have
 * been public and undeclared since before the ADR existed.
 *
 * **The three regions share one part name on purpose.** `start`, `center` and
 * `end` are not in the ADR-19 vocabulary and none of them names a job that
 * recurs across families, so inventing three names for one component is the
 * drift §3 forbids. They are each a related set of controls, which is what
 * `group` means, and the region they are is already carried — publicly, since
 * before this declaration — on `data-toolbar-region`. A consumer addresses one
 * region with `[data-part=group][data-toolbar-region=end]`.
 *
 * The flex spacer that stands in for an empty centre region is `aria-hidden`
 * and gets no part: it is a layout artefact, not an addressable node.
 */
export const anatomy = {
  parts: ['root', 'group'],

  /** `group` repeats — one per rendered region — which ADR-19 requires be said out loud. */
  optionalParts: ['group'],

  /**
   * No `data-state`: a toolbar has no condition of its own. Its controls carry
   * theirs.
   */
  states: [],

  /** Measured from `DzToolbar.variants.ts` — every `--dz-toolbar-*` it reads. */
  componentTokens: [
    '--dz-toolbar-bg',
    '--dz-toolbar-border',
    '--dz-toolbar-shadow',
    '--dz-toolbar-radius',
    '--dz-toolbar-gap',
    '--dz-toolbar-padding-x',
    '--dz-toolbar-padding-y',
    '--dz-toolbar-sticky-z',
  ],

  recipes: ['size', 'variant', 'orientation'],

  /**
   * Mirrors with the document — `start` and `end` are reading-order words, not
   * screen edges, and the regions are laid out with logical flex. That is the
   * whole reason they are named `start`/`end` rather than `left`/`right`.
   * `keyboard: 'swap-horizontal'`: `role="toolbar"` roving focus moves along
   * the inline axis, so ArrowRight advances in LTR and retreats in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `toolbar` roving focus: the whole
   * bar is one tab stop and the arrows move within it.
   *
   * **Implemented in RESIDUAL-13, four rows after this table was published.**
   * RESIDUAL-12 measured these four navigation rows as backed by nothing — no
   * `keydown`, no composable, no primitive anywhere in `DzToolbar.vue` — and
   * named it *"the worst of them"*: a declared `role="toolbar"` whose arrows do
   * nothing is a WCAG 2.1.1 gap, not a stale table. `DzToolbar.vue` now owns the
   * roving focus and the single tab stop, so the rows below are the same claim
   * they always were and are now true.
   *
   * The two vertical rows are **new**, and they are an addition rather than a
   * correction: `orientation: 'vertical'` has always been a supported prop and
   * has always reached `aria-orientation="vertical"`, so an AT user was told the
   * bar navigates on the block axis while only the inline arrows were declared.
   * They are scoped with a two-word `when` on purpose — a single lowercase word
   * is read as a part or state name, and `vertical` is neither.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move focus to the next control in the toolbar.',
      wcag: ['2.1.1'],
      apg: 'toolbar',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move focus to the previous control in the toolbar.',
      wcag: ['2.1.1'],
      apg: 'toolbar',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowDown',
      when: 'orientation vertical',
      action: 'Move focus to the next control in the toolbar.',
      wcag: ['2.1.1'],
      apg: 'toolbar',
    },
    {
      key: 'ArrowUp',
      when: 'orientation vertical',
      action: 'Move focus to the previous control in the toolbar.',
      wcag: ['2.1.1'],
      apg: 'toolbar',
    },
    { key: 'Home', action: 'Move focus to the first control.', wcag: ['2.1.1'], apg: 'toolbar' },
    { key: 'End', action: 'Move focus to the last control.', wcag: ['2.1.1'], apg: 'toolbar' },
    {
      key: 'Tab',
      action: 'Move out of the toolbar; the toolbar is one tab stop.',
      wcag: ['2.1.2'],
      apg: 'toolbar',
    },
  ],

  /**
   * Tier B — `role="toolbar"` owns roving focus across the controls it
   * contains; a defect makes the whole group unreachable by keyboard.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzToolbar. */
export type DzToolbarPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzToolbar.
 *
 * `ui.group` lands on **every** rendered region — the regions share a part
 * name, so they share the override. Address one region with
 * `[data-toolbar-region]` in a stylesheet.
 */
export type DzToolbarUi = UiOverrides<typeof anatomy>
