import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzButton — declared anatomy (TASK-OSS-P3-02, ADR-19).
 *
 * The reference declaration: the first component in the catalog to say, in a
 * form a test and a generator can both read, what a consumer may address.
 *
 * **Two parts, not four.** The obvious anatomy for a button is
 * `root · icon · label · spinner`, and that is what the packet's own example
 * shows. This component cannot honestly declare `icon` or `label`: the prefix,
 * default and suffix slots render whatever the *consumer* passes, with no
 * wrapper of DzButton's own. Naming them as parts would require adding wrapper
 * elements — a change to rendered structure, which belongs to the pilot task
 * (TASK-OSS-P3-03), not to the schema task. So this declares what exists today
 * and P3-03 decides whether to wrap.
 *
 * That is the point of a machine-checked anatomy: it can only be as good as the
 * DOM, and the gap between the two is visible instead of asserted away.
 */
export const anatomy = {
  parts: ['root', 'spinner'],

  // The spinner exists only while `loading` is true.
  optionalParts: ['spinner'],

  /**
   * `idle`/`loading`/`disabled` — the values this component actually emits, and
   * none of them is in the global `DataState` union that used to type
   * `data-state`. That contradiction is the evidence behind ADR-19 §4's move to
   * per-component enums; `loading` and `disabled` are also emitted as
   * presence-only boolean attributes.
   */
  states: ['idle', 'loading', 'disabled'],

  /**
   * Every `--dz-button-*` this component reads, and therefore every one a
   * consumer may set. The list was five entries until a Playwright run caught
   * the omission the hard way: a fixture set `--dz-radius-md` (the obvious
   * guess) and the corner never moved, because DzButton reads
   * `--dz-button-radius`. A partial list is worse than none — it tells a reader
   * they have seen the override points.
   *
   * `validate:ownership` now reports `--dz-{component}-*` tokens a component
   * references but does not declare, so the next omission is caught by a
   * generator rather than by a browser.
   */
  componentTokens: [
    '--dz-button-disabled-opacity',
    '--dz-button-focus-ring-color',
    '--dz-button-focus-ring-offset',
    '--dz-button-focus-ring-width',
    '--dz-button-font-family',
    '--dz-button-font-weight',
    '--dz-button-icon-font-size',
    '--dz-button-icon-height',
    '--dz-button-icon-width',
    '--dz-button-lg-font-size',
    '--dz-button-lg-gap',
    '--dz-button-lg-height',
    '--dz-button-lg-padding-x',
    '--dz-button-md-font-size',
    '--dz-button-md-gap',
    '--dz-button-md-height',
    '--dz-button-md-padding-x',
    '--dz-button-radius',
    '--dz-button-sm-font-size',
    '--dz-button-sm-gap',
    '--dz-button-sm-height',
    '--dz-button-sm-padding-x',
    '--dz-button-transition',
    '--dz-button-xl-font-size',
    '--dz-button-xl-gap',
    '--dz-button-xl-height',
    '--dz-button-xl-padding-x',
    '--dz-button-xs-font-size',
    '--dz-button-xs-gap',
    '--dz-button-xs-height',
    '--dz-button-xs-padding-x',
  ],

  recipes: ['variant', 'size', 'tone'],

  /**
   * The three axes a `DzProvider` can set application-wide (ADR-20 §6,
   * TASK-OSS-P4-02). This is the first component wired to `useDzDefaults`, and
   * the list is here rather than in a survey so the rest of the rollout has
   * something to satisfy: a component that honours a provider default says so,
   * and one that does not is visibly absent from the generated matrix.
   *
   * Precedence is fixed and not per-component: prop, then `DzButtonGroup`
   * context, then the provider, then the defaults above.
   */
  globalDefaults: ['size', 'variant', 'tone'],

  /**
   * Mirrors with the document: prefix and suffix slots swap sides, and the
   * spinner sits at the inline start. Nothing about a button is physical.
   *
   * `keyboard: 'none'` because a button has no inline-axis navigation of its
   * own — Arrow keys belong to whatever groups it, and `DzButtonGroup` is a
   * `role="group"` rather than a toolbar, so the browser's own Tab order
   * applies and there is nothing to swap.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Tier A: it manages focus, carries `disabled`/`aria-disabled` semantics, and
   * is polymorphic across `button`/`a`/`RouterLink`. A defect here is a
   * functional failure for someone using a keyboard or a screen reader.
   */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzButtonPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzButton (the prop itself lands in TASK-OSS-P3-03). */
export type DzButtonUi = UiOverrides<typeof anatomy>
