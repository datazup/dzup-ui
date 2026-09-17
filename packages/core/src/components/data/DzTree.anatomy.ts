import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTree — declared anatomy for the tree's container (TASK-R5-O2, ADR-19).
 *
 * Two parts, and this is the `boundary-stops` clause rather than a thin
 * component. `DzTreeItem` is a **public component in its own right** — the
 * ownership manifest records it as `public-component`, not as a `compound-part`
 * of `DzTree` — so it declares its own anatomy, emits `data-part="root"` on
 * each `<li role="treeitem">`, and is therefore an anatomy boundary. `DzTree`
 * renders the `<ul role="tree">` and the empty-state placeholder, and owns
 * nothing else.
 *
 * The placeholder is `role="none"` on purpose: a bare `listitem` is not an
 * allowed owned element of `role="tree"`. It is still a real, themeable node,
 * so it takes the `empty` name.
 */
export const anatomy = {
  parts: ['root', 'empty'],

  /** The placeholder renders only while `items` is empty. */
  optionalParts: ['empty'],

  /** `ready` / `loading` / `disabled` on the root — all three already emitted. */
  states: ['ready', 'loading', 'disabled'],

  /**
   * Empty and measured: `DzTree.tokens.ts` maps to global semantic tokens and
   * owns no `--dz-tree-*` property.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document — the indentation is a logical padding and has to
   * run from the reading edge. `keyboard: 'swap-horizontal'`: a tree's
   * ArrowRight expands a node and ArrowLeft collapses it, which is the clearest
   * case in the catalog of keys that mean the opposite thing in an RTL
   * document.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `treeview`; `treeNavigation.ts`
   * beside the component is where the movement is implemented.
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

  /**
   * Tier C — composite. Expansion, selection, checkable state and roving focus
   * are shared across an arbitrarily deep recursion.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names on the tree container. */
export type DzTreePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTree — the two nodes it renders itself. */
export type DzTreeUi = UiOverrides<typeof anatomy>
