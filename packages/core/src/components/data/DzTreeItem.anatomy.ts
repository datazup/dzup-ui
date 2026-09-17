import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTreeItem — declared anatomy for one tree node (TASK-R5-O2, ADR-19).
 *
 * A declaration of its own rather than more names on `DzTree`, because the
 * ownership manifest records `DzTreeItem` as a `public-component`. It is also
 * **recursive**: a node renders a `<ul role="group">` of further `DzTreeItem`s,
 * each of which emits `data-part="root"` and is therefore its own boundary. The
 * conformance check stops at each nested root, which is the only reason a
 * declaration on a self-composing component is finite at all.
 *
 * `item` is the focusable row inside the `<li>`, not the `<li>` itself: the
 * `<li>` carries the ARIA (`role="treeitem"`, level, posinset) and the row
 * carries the tabindex, the hover treatment and the click target. A consumer
 * styling "a tree row" means the second one.
 *
 * The node icon is deliberately NOT a part. It comes from `node.icon` — the
 * consumer supplies the component — so they already control it, and stamping a
 * part name on markup this library did not write is the same mistake the
 * `as-child` trigger clause (S1-D2) exists to prevent.
 */
export const anatomy = {
  parts: ['root', 'item', 'indicator', 'control', 'item-label', 'group'],

  /**
   * `indicator` is the expand chevron (a placeholder span stands in for a leaf,
   * so the name is always emitted); `control` is the checkbox, present only
   * under `checkable`; `item-label` is the default label, which the consumer's
   * slot replaces; `group` is the children list, present only while expanded.
   */
  optionalParts: ['control', 'item-label', 'group'],

  /**
   * `open` / `closed` on the `<li>` and `checked` / `unchecked` on the checkbox
   * — all four already emitted — plus the presence-only `disabled` marker.
   */
  states: ['open', 'closed', 'checked', 'unchecked', 'disabled'],

  /** Empty and measured — the tree family's properties are all global. */
  componentTokens: [],

  /**
   * Mirrors with the document: the indentation is logical padding and the
   * chevron sits at the reading edge. `keyboard: 'swap-horizontal'` for the
   * same reason as `DzTree` — ArrowRight expands and ArrowLeft collapses, and
   * those swap in an RTL document.
   *
   * `icons: ['indicator']`: the chevron points into the subtree it opens, which
   * is direction-bearing by definition.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). One node of a `DzTree`. The keys are
   * the tree contract, handled in `DzTreeItem.vue`.
   */
  keyboard: [
    { key: 'ArrowDown', action: 'Move focus to the next visible node.', wcag: ['2.1.1'], apg: 'treeview' },
    { key: 'ArrowUp', action: 'Move focus to the previous visible node.', wcag: ['2.1.1'], apg: 'treeview' },
    {
      key: 'ArrowRight',
      action: 'Expand the focused node, or move to its first child when already expanded.',
      wcag: ['2.1.1'],
      apg: 'treeview',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Collapse the focused node, or move to its parent when already collapsed.',
      wcag: ['2.1.1'],
      apg: 'treeview',
      rtl: 'mirrored',
    },
    { key: 'Home', action: 'Move focus to the first visible node.', wcag: ['2.1.1'], apg: 'treeview' },
    { key: 'End', action: 'Move focus to the last visible node.', wcag: ['2.1.1'], apg: 'treeview' },
    { key: 'Enter', action: 'Activate the focused node.', wcag: ['2.1.1'], apg: 'treeview' },
    { key: ' ', action: 'Select the focused node.', wcag: ['2.1.1'], apg: 'treeview' },
  ],

  /** Tier B — the row owns focus, keyboard expansion and selection. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on one tree node. */
export type DzTreeItemPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzTreeItem — every part except the `<li>`.
 *
 * `class` at the call site lands on the row (the component forwards `$attrs`
 * there), so the `<li>` keeps `ui.root` and the rest are nodes with no other
 * route.
 */
export type DzTreeItemUi = UiOverrides<typeof anatomy>
