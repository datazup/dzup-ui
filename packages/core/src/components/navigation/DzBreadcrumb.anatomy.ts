import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzBreadcrumb — declared anatomy for the breadcrumb family
 * (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent**, the `DzCard` / `DzTable`
 * pattern: `DzBreadcrumbItem` and `DzBreadcrumbSeparator` are `compound-part`s
 * of `DzBreadcrumb` in the ownership manifest, they emit `item` /
 * `item-label` / `separator` and never `root`, and this one declaration covers
 * the composed trail. Declaring each separately would answer "what can I style
 * on a breadcrumb?" in three places.
 *
 * `item` is the `<li>` and `item-label` is the `<a>` or `<span>` inside it,
 * because those two nodes take different classes for different reasons: the
 * `<li>` carries the row's spacing, the inner node carries the link, the
 * current-page and the disabled treatment. Collapsing them would make
 * "style every crumb's spacing" and "style the current crumb's text" the same
 * selector.
 */
export const anatomy = {
  parts: ['root', 'list', 'item', 'item-label', 'separator'],

  /**
   * Only the `<nav>` and its `<ol>` are unconditional. Crumbs and separators
   * are written by the consumer as `<DzBreadcrumbItem>` / `<DzBreadcrumbSeparator>`
   * children, so a breadcrumb with an empty default slot legitimately has none.
   */
  optionalParts: ['item', 'item-label', 'separator'],

  /**
   * `ready` on the root, `disabled` as the presence-only marker a non-link
   * crumb already carried. There is no `current` state: the current page is
   * expressed as `aria-current="page"`, which is the accessible fact, and
   * duplicating it as a data attribute would give a consumer two sources for
   * one truth.
   */
  states: ['ready', 'disabled', 'url-rejected'],

  /**
   * Empty and measured. `DzBreadcrumb.tokens.ts` maps to global semantic
   * tokens (`--dz-foreground`, `--dz-muted-foreground`, `--dz-transition-fast`)
   * and owns no `--dz-breadcrumb-*` property of its own.
   */
  componentTokens: [],

  /**
   * Mirrors with the document — a breadcrumb is a sentence, and the whole
   * trail has to run the other way in Arabic.
   *
   * `icons: ['separator']`: the default separator glyph is a chevron pointing
   * along the reading direction. It is the one node in this family that MUST
   * mirror, and naming it here is what tells a theme author that flipping it is
   * required rather than optional.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['separator'] },

  /**
   * Keyboard contract (TASK-R5-O5). A breadcrumb is a list of links: the
   * APG pattern adds no keys of its own, and each crumb behaves as a
   * link.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next crumb; every crumb is its own tab stop.',
      wcag: ['2.1.2'],
      apg: 'breadcrumb',
    },
    { key: 'Enter', action: 'Follow the focused crumb.', wcag: ['2.1.1'], apg: 'link' },
  ],

  /** Tier B — the crumbs are links; they own focus and activation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the breadcrumb family. */
export type DzBreadcrumbPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzBreadcrumb — the two nodes it renders itself.
 *
 * `item`, `item-label` and `separator` come from sub-components the consumer
 * writes at the call site, where `class` already reaches them.
 */
export type DzBreadcrumbUi = Pick<UiOverrides<typeof anatomy>, 'root' | 'list'>

/**
 * `ui` prop shape for DzBreadcrumbItem — the crumb's own two nodes.
 *
 * `class` at the call site lands on the inner link (that is where the
 * component forwards `$attrs`), so `ui.item` is the only way to reach the
 * `<li>` wrapper.
 */
export type DzBreadcrumbItemUi = Pick<UiOverrides<typeof anatomy>, 'item' | 'item-label'>
