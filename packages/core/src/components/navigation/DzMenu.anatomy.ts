import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzMenu — declared anatomy for the navigation menu family
 * (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent.** `DzMenuItem` and
 * `DzMenuSeparator` are `compound-part`s of `DzMenu` in the ownership manifest;
 * they emit `item` / `item-label` / `separator` and never `root`, so a composed
 * menu conforms to one declaration.
 *
 * Not to be confused with `DzDropdownMenu` in `overlays/`, which declares
 * `content`/`item`/`prefix`/`suffix`/`separator` and has no root of its own.
 * This one is the persistent in-page navigation list — it renders a real
 * `<nav>`, so it declares `root`.
 *
 * `item` is on the `<a>` or `<button>` — the node that owns focus, the active
 * treatment and the disabled treatment — and `item-label` is the `<span>` that
 * holds the text and disappears when the surrounding sidebar collapses. Those
 * two nodes are addressed for different reasons, which is why they are two
 * names.
 */
export const anatomy = {
  parts: ['root', 'item', 'item-label', 'separator'],

  /**
   * Everything but the `<nav>` comes from consumer markup, and the label
   * additionally disappears under a collapsed sidebar (`ctx.collapsed`), which
   * is a legitimate absence rather than a defect.
   */
  optionalParts: ['item', 'item-label', 'separator'],

  /**
   * `ready` on the root, `active` on the current item, `disabled` as the
   * presence-only marker. All three were emitted before this declaration; none
   * is new.
   */
  states: ['ready', 'active', 'disabled'],

  /**
   * Empty and measured: `DzMenu.tokens.ts` maps to global semantic tokens
   * (`--dz-primary`, `--dz-muted`, `--dz-border`, the spacing and text scales)
   * and owns no `--dz-menu-*` property. The five `--dz-menu-*` properties in
   * the catalog belong to `DzMegaMenu`, which declares them.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document — a navigation list reads as text and every
   * utility in `DzMenu.variants.ts` is already logical. `keyboard: 'none'`: the
   * items are links and buttons in document order with no roving index, so the
   * arrow keys have no inline-axis meaning to reverse.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — the items own focus and activation. */
  /**
   * Keyboard contract (TASK-R5-O5). The quality matrix assigns APG
   * `menu`, but this component does NOT implement the pattern keyboard:
   * its own anatomy records that the items are links and buttons in
   * document order with no roving index. The contract states what is
   * there. Closing the gap to APG `menu` is component work, and the
   * honest declaration is what makes it visible.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next item; every item is its own tab stop, and there is no roving index.',
      wcag: ['2.1.2'],
    },
    { key: 'Enter', action: 'Activate the focused item.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', action: 'Activate the focused item.', wcag: ['2.1.1'], apg: 'button' },
  ],

  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the menu family. */
export type DzMenuPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzMenu — the one node it renders itself. */
export type DzMenuUi = Pick<UiOverrides<typeof anatomy>, 'root'>

/**
 * `ui` prop shape for DzMenuItem — the label wrapper.
 *
 * The item's own element takes `class` at the call site; the inner label
 * `<span>` is the node nothing else can reach.
 */
export type DzMenuItemUi = Pick<UiOverrides<typeof anatomy>, 'item-label'>
