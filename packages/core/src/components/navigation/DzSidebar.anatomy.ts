import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSidebar — declared anatomy for the sidebar family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent.** `DzSidebarHeader`,
 * `DzSidebarFooter`, `DzSidebarSection` and `DzSidebarItem` are `compound-part`s
 * of `DzSidebar` in the ownership manifest; they emit `header`, `footer`,
 * `group` / `group-label` and `item` / `icon` / `item-label` / `suffix` and
 * never `root`, so a composed sidebar conforms to one declaration.
 *
 * `overlay` is the mobile scrim, and it is the one part that is **never inside
 * the root**: it is `Teleport`ed to the portal target so it can sit above the
 * page rather than inside the rail. It is declared because it is a real,
 * addressable, themeable node of this component, and it is `optional` because
 * a conformance check handed the `<nav>` will correctly never find it.
 *
 * `item-label` and `suffix` are named for the two nodes a collapsed rail hides:
 * a consumer animating the collapse needs to reach exactly those, and before
 * this declaration they were reachable only by the private
 * `dz-sidebar-item-label` / `dz-sidebar-item-badge` class names.
 */
export const anatomy = {
  parts: [
    'root',
    'overlay',
    'body',
    'header',
    'footer',
    'group',
    'group-label',
    'item',
    'icon',
    'item-label',
    'suffix',
  ],

  /**
   * Only the `<nav>` and its scrolling `body` are unconditional. The scrim
   * exists only on mobile and lives outside the root; every remaining part
   * comes from a sub-component the consumer chooses to render, repeats, or
   * disappears while the rail is collapsed.
   */
  optionalParts: [
    'overlay',
    'header',
    'footer',
    'group',
    'group-label',
    'item',
    'icon',
    'item-label',
    'suffix',
  ],

  /**
   * `collapsed` / `expanded` on the rail and `active` / `inactive` on an item —
   * all four were emitted before this declaration, from computed refs that
   * `validate:anatomy-parts` reports as unresolvable expressions. That is
   * precisely why they needed writing down: a value a static gate cannot read
   * out of the template has nowhere else to be recorded.
   */
  states: ['collapsed', 'expanded', 'active', 'inactive'],

  /** The `--dz-sidebar-*` surface, measured from `DzSidebar.tokens.ts`. */
  componentTokens: [
    '--dz-sidebar-width',
    '--dz-sidebar-collapsed-width',
    '--dz-sidebar-bg',
    '--dz-sidebar-foreground',
    '--dz-sidebar-border',
    '--dz-sidebar-transition',
    '--dz-sidebar-header-bg',
    '--dz-sidebar-header-border',
    '--dz-sidebar-header-padding',
    '--dz-sidebar-footer-bg',
    '--dz-sidebar-footer-border',
    '--dz-sidebar-footer-padding',
    '--dz-sidebar-section-padding-y',
    '--dz-sidebar-section-title-color',
    '--dz-sidebar-section-title-font-size',
    '--dz-sidebar-section-title-letter-spacing',
    '--dz-sidebar-item-radius',
    '--dz-sidebar-item-padding-x',
    '--dz-sidebar-item-padding-y',
    '--dz-sidebar-item-gap',
    '--dz-sidebar-item-font-size',
    '--dz-sidebar-item-font-weight',
    '--dz-sidebar-item-hover-bg',
    '--dz-sidebar-item-hover-text',
    '--dz-sidebar-item-active-bg',
    '--dz-sidebar-item-active-text',
    '--dz-sidebar-overlay-bg',
    '--dz-sidebar-overlay-z-index',
  ],

  /**
   * No recipe axis. `position` (`static` | `fixed`) names a CSS positioning
   * scheme, not one of the five `RecipeAxis` values, and inventing a sixth to
   * fit one component is the drift ADR-19 §3 warns about.
   */

  /**
   * Mirrors with the document, and this declaration is what made two fixes
   * visible — both LTR-identical:
   *
   * - `position: 'fixed'` and the mobile drawer pinned the rail with
   *   `inset-y-0 left-0`, so an Arabic page put the navigation on the edge the
   *   content reads *away* from. Now `inset-s-0`.
   * - the drawer's hidden state is `-translate-x-full`, a physical transform
   *   that would have slid an RTL rail *into* the page rather than off it. The
   *   `rtl:translate-x-full` companion reverses it, and Tailwind orders the
   *   variant rule after the base one so it wins where it applies.
   *
   * `keyboard: 'none'`: the items are links and buttons in document order with
   * no roving index, so the arrow keys carry no inline-axis meaning here.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). The quality matrix assigns APG
   * `treeview`, but this component does NOT implement the pattern
   * keyboard: its own anatomy records that the items are links and
   * buttons in document order with no roving index, so there is no arrow
   * navigation to declare. The contract states what is there rather than
   * what the pattern would like.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next item or group toggle; every one is its own tab stop.',
      wcag: ['2.1.2'],
    },
    {
      key: 'Enter',
      action: 'Activate the focused item, or expand and collapse the focused group.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: ' ',
      action: 'Activate the focused item, or expand and collapse the focused group.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /**
   * Multi-root: a teleported mobile overlay and the `<nav>`. `$attrs` binds to
   * the `<nav>`.
   *
   * The overlay is not a candidate: it renders only on mobile behind a `v-if`,
   * so a consumer's `id` would exist at some viewport widths and not others.
   */
  fallthrough: {
    target: 'root',
    reason:
      'Multi-root (teleported mobile overlay + nav). `$attrs` binds to the nav; '
      + 'the overlay is conditional on viewport and cannot carry a stable id.',
  },

  /**
   * Tier C — composite. A rail, a scrim, collapsible sections and a mobile
   * drawer share one collapsed/open state across a responsive breakpoint, and
   * the `inert` treatment of a closed drawer is a correctness question a
   * primitive alone cannot answer.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names across the sidebar family. */
export type DzSidebarPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzSidebar — the three nodes it renders itself.
 *
 * The scrim and the scrolling body have no call site at all, which makes `ui`
 * the only way to reach them; `header`, `footer`, `group` and `item` are
 * sub-components the consumer writes, where `class` already lands.
 */
export type DzSidebarUi = Pick<UiOverrides<typeof anatomy>, 'root' | 'overlay' | 'body'>

/**
 * `ui` prop shape for DzSidebarSection — the section's title row.
 *
 * The section's own element takes `class` at the call site; the title is
 * rendered from the `title` prop and is otherwise unreachable.
 */
export type DzSidebarSectionUi = Pick<UiOverrides<typeof anatomy>, 'group-label'>

/**
 * `ui` prop shape for DzSidebarItem — the three nodes inside the item.
 *
 * `class` at the call site lands on the item itself; the icon slot wrapper, the
 * label and the badge wrapper are rendered by this component and are the nodes
 * a collapse animation has to reach.
 */
export type DzSidebarItemUi = Pick<UiOverrides<typeof anatomy>, 'icon' | 'item-label' | 'suffix'>
