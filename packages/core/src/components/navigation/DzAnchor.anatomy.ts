import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzAnchor — declared anatomy for the in-page anchor rail (TASK-R5-O2, ADR-19).
 *
 * The whole tree is written by this component's own render function
 * (`renderList`), not by a slot or a sub-component, so every node here is one
 * `DzAnchor` renders and one a consumer can reach only through a part name or
 * an override map. That is the case `ui` exists for.
 *
 * `item` is on the `<a>`, not on the `<li>`, following `DzDropdownMenu`: the
 * addressable node is the one a consumer styles and a test clicks, and the
 * `<li>` is a layout wrapper whose only job is to hold the nested `list`.
 */
export const anatomy = {
  parts: ['root', 'list', 'item'],

  /**
   * `list` renders once at depth 0 and again per nesting level; `item` renders
   * once per entry and not at all for an empty `items` array. Both are
   * legitimately repeating, which is exactly what `optionalParts` records.
   */
  optionalParts: ['list', 'item'],

  /**
   * `ready` on the root (the nav is inert — it has nothing to load), and
   * `active` as the presence-only marker the current section's link already
   * carried before this declaration (`data-active`, ADR-19 §4 boolean form).
   */
  states: ['ready', 'active', 'url-rejected'],

  /** Measured from `DzAnchor.tokens.ts` — the seven properties it reads. */
  componentTokens: [
    '--dz-anchor-color',
    '--dz-anchor-hover-color',
    '--dz-anchor-active-color',
    '--dz-anchor-rail-color',
    '--dz-anchor-font-size',
    '--dz-anchor-item-gap',
    '--dz-anchor-indent',
  ],

  /**
   * No recipe axis. `DzAnchor` takes neither `size` nor `variant`; the only
   * scale it exposes is `--dz-anchor-font-size`, which is a token, not an axis.
   */

  /**
   * Mirrors with the document. The indent is already `paddingInlineStart` and
   * the rail is a logical border, so an Arabic page indents from the right
   * without any change here. `keyboard: 'none'`: the rail is a vertical list of
   * links with no inline-axis key handling of its own.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Native link activation. A link is
   * followed by Enter and NOT by Space — the difference from a button is
   * the contract, not an omission.
   */
  keyboard: [
    { key: 'Enter', action: 'Follow the link.', wcag: ['2.1.1'], apg: 'link' },
  ],

  /**
   * Tier B — the links own focus and the component moves the reading position
   * on activation, so a defect is a functional failure for keyboard users.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names in the anchor rail. */
export type DzAnchorPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzAnchor — every part, because every part is rendered by
 * this component and none is reachable from the call site.
 */
export type DzAnchorUi = UiOverrides<typeof anatomy>
