import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzResizable — declared anatomy for the resizable family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy, declared on the parent** — the `DzTable` pattern. The
 * group renders nothing but a slot; every visible node comes from
 * `DzResizablePanel` and `DzResizableHandle`, which the ownership manifest
 * records as `compound-part`s with `parentComponent: 'DzResizable'`. They emit
 * `panel`, `separator` and `indicator` — never `root` — so a composed
 * resizable conforms to this one declaration (N2-S1 finding S1-F3, the
 * parent-covers composition rule).
 *
 * `separator` rather than a new word: the resize handle carries
 * `role="separator"`, which is the node's role and the vocabulary already has
 * the name.
 */
export const anatomy = {
  parts: ['root', 'panel', 'separator', 'indicator'],

  /**
   * Every part but the group is composed by the consumer, and the grip
   * `indicator` renders only when a handle sets `withHandle`.
   */
  optionalParts: ['panel', 'separator', 'indicator'],

  /**
   * `inactive` / `hover` / `drag` come from reka-ui's `SplitterResizeHandle`,
   * which writes them on every handle. They are this component's states from a
   * consumer's side — there is one element with one `data-state` — so they are
   * declared rather than left to a composition check to report. `disabled` is a
   * presence-only flag on the group and on each handle, and ADR-19 §4 puts
   * presence-only attributes in `states` beside the `data-state` values.
   */
  states: ['inactive', 'hover', 'drag', 'disabled'],

  /**
   * Empty and measured: `DzResizable.variants.ts` reads global semantic tokens
   * (`--dz-border`, `--dz-primary`, `--dz-control-visual-size`) and owns no
   * `--dz-resizable-*` property.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * Mirrors with the document: panel order follows the reading direction, which
   * is what `flex` on a logical axis already does. `keyboard:
   * 'swap-horizontal'` — a horizontal handle resizes along the inline axis, so
   * ArrowRight grows the inline-start panel in LTR and the inline-end panel in
   * RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `window-splitter` on the handle.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move the separator towards the inline end.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move the separator towards the inline start.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowDown',
      action: 'Move the separator down when the panes stack vertically.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
    },
    {
      key: 'ArrowUp',
      action: 'Move the separator up when the panes stack vertically.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
    },
    {
      key: 'Home',
      action: 'Move the separator to its minimum position.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
    },
    {
      key: 'End',
      action: 'Move the separator to its maximum position.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
    },
    {
      key: 'Enter',
      action: 'Collapse the pane, or restore it when already collapsed.',
      wcag: ['2.1.1'],
      apg: 'window-splitter',
    },
  ],

  /**
   * Tier B — the handle is a focus-managing `role="separator"` with keyboard
   * resize; a defect makes a pane impossible to size without a pointer.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the resizable family. */
export type DzResizablePart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzResizable — the group is the only node it renders.
 *
 * `panel`, `separator` and `indicator` are written by the consumer at the
 * call site and already take `class`.
 */
export type DzResizableUi = Pick<UiOverrides<typeof anatomy>, 'root'>
