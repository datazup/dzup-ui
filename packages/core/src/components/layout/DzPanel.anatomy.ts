import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPanel — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * ADR-19's opening argument names this component by hand: `core.css` already
 * selects on `.dz-panel[data-size=lg]`, so the recipe attributes have been
 * public and undeclared since before the ADR was written. This declaration is
 * what makes that surface a promise instead of an accident.
 *
 * `content` is inside a `DzCollapse` when `collapsible` is set. `DzCollapse`
 * declares `root`, so it is an anatomy boundary and a DOM check on a collapsible
 * panel sees the body through the boundary rather than as part of the panel —
 * which is why `content` is optional here even though the template always
 * renders one.
 */
export const anatomy = {
  parts: ['root', 'header', 'trigger', 'title', 'indicator', 'action', 'content'],

  /**
   * `trigger` degrades to a plain `<div>` when the panel is not collapsible and
   * the chevron `indicator` renders only then; `action` needs the `actions`
   * slot; `content` sits behind a `DzCollapse` boundary in the collapsible
   * branch.
   */
  optionalParts: ['indicator', 'action', 'content'],

  /**
   * No `data-state`. Disclosure is carried on `aria-expanded` where a screen
   * reader can use it, and the visual state is the chevron's transform; a
   * `data-state` mirroring `aria-expanded` would be a second source of truth.
   */
  states: [],

  /** Measured from `DzPanel.variants.ts` — every `--dz-panel-*` it reads. */
  componentTokens: [
    '--dz-panel-bg',
    '--dz-panel-foreground',
    '--dz-panel-border',
    '--dz-panel-shadow',
    '--dz-panel-radius',
    '--dz-panel-accent',
    '--dz-panel-gap',
    '--dz-panel-padding-x',
    '--dz-panel-padding-y',
    '--dz-panel-header-padding-y',
    '--dz-panel-title-size',
  ],

  recipes: ['size', 'variant', 'tone'],

  /**
   * Mirrors with the document — the header is a logical flex row and every
   * padding utility is `px-`/`py-`. `keyboard: 'none'`: the trigger responds to
   * Enter and Space, neither of which has an inline axis.
   *
   * The chevron is NOT direction-bearing: it points down when collapsed and up
   * when open, on the block axis, so mirroring it would be wrong.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `disclosure` on the header
   * trigger, and only while `collapsible`.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Expand or collapse the panel body.',
      wcag: ['2.1.1'],
      apg: 'disclosure',
    },
    {
      key: ' ',
      when: 'trigger',
      action: 'Expand or collapse the panel body.',
      wcag: ['2.1.1'],
      apg: 'disclosure',
    },
  ],

  /**
   * Tier B — the collapsible header is a real button that owns focus and an
   * `aria-controls` relationship, and the body goes `inert` when collapsed.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzPanel. */
export type DzPanelPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzPanel — every node comes from this template. */
export type DzPanelUi = UiOverrides<typeof anatomy>
