import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzMegaMenu — declared anatomy for the multi-column menubar
 * (TASK-R5-O2, ADR-19).
 *
 * The whole tree is this component's own template — items, columns and links
 * come from the `items` prop, not from consumer markup — so `class` reaches
 * exactly one node out of eight and `ui` is the only way to style the rest.
 * That makes this the family where the override map earns its keep most
 * plainly.
 *
 * **Two layouts, one declaration.** Below the collapse breakpoint the component
 * renders a stacked disclosure; above it, a menubar with dropdown panels. The
 * part names are the same in both, deliberately: a consumer's `panel` rule
 * should not stop working because the viewport narrowed. Every part except
 * `root` and `list` is therefore optional — each renders in one branch, or per
 * item, or only while a panel is open.
 *
 * The `<li>` wrappers carry no part name. They are layout scaffolding for the
 * trigger and the panel, both of which are addressable in their own right, and
 * a name on the wrapper would give a consumer two selectors for one visual box.
 */
export const anatomy = {
  parts: ['root', 'list', 'trigger', 'indicator', 'panel', 'group', 'group-label', 'item'],

  /**
   * `trigger` and `item` repeat once per entry; `indicator` renders only for an
   * entry that has a panel; `panel`, `group` and `group-label` exist only while
   * an entry is open and only when the author supplied a column label.
   */
  optionalParts: ['trigger', 'indicator', 'panel', 'group', 'group-label', 'item'],

  /**
   * `disabled` only, as the presence-only marker triggers and links already
   * carried. `data-open`, `data-collapsed` and `data-featured` are NOT states:
   * `open` is expressed to assistive technology as `aria-expanded`, which is
   * the fact; the other two say which layout the component drew, which is a
   * rendering mode. ADR-19 §4 keeps modes out of `states` for the same reason
   * `DzTable` does not declare `data-virtual`.
   */
  states: ['disabled'],

  /**
   * The five `--dz-menu-*` properties this component owns. The rest of what it
   * reads (`--dz-surface`, `--dz-border`, the spacing and radius scales) are
   * global semantic tokens, not mega-menu overrides, so they are not promises
   * this component makes.
   */
  componentTokens: [
    '--dz-menu-bar-gap',
    '--dz-menu-panel-offset',
    '--dz-menu-panel-padding',
    '--dz-menu-column-gap',
    '--dz-menu-column-min-width',
  ],

  recipes: ['size', 'orientation'],

  /**
   * Mirrors with the document, and `keyboard: 'swap-horizontal'` because a
   * horizontal menubar's ArrowLeft/ArrowRight move along the inline axis:
   * `onTriggerKeydown` advances the focused trigger, so the keys have to
   * reverse in an Arabic document or focus walks away from the reading order.
   *
   * `icons: ['indicator']`: the caret points at the panel it opens, which is
   * direction-bearing by definition.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `menubar`. The keys below are
   * handled in `DzMegaMenu.vue`; the horizontal arrows follow the writing
   * direction.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move focus to the next top-level item.',
      wcag: ['2.1.1'],
      apg: 'menubar',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move focus to the previous top-level item.',
      wcag: ['2.1.1'],
      apg: 'menubar',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowDown',
      action: 'Open the focused item panel and move into it.',
      wcag: ['2.1.1'],
      apg: 'menubar',
    },
    {
      key: 'ArrowUp',
      when: 'panel open',
      action: 'Move to the previous item inside an open panel.',
      wcag: ['2.1.1'],
      apg: 'menubar',
    },
    {
      key: 'Enter',
      action: 'Open the focused item panel, or invoke the focused link.',
      wcag: ['2.1.1'],
      apg: 'menubar',
    },
    {
      key: ' ',
      action: 'Open the focused item panel, or invoke the focused link.',
      wcag: ['2.1.1'],
      apg: 'menubar',
    },
    { key: 'Home', action: 'Move focus to the first item.', wcag: ['2.1.1'], apg: 'menubar' },
    { key: 'End', action: 'Move focus to the last item.', wcag: ['2.1.1'], apg: 'menubar' },
    {
      key: 'Escape',
      action: 'Close the open panel and return focus to its top-level item.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'menubar',
    },
    { key: 'Tab', action: 'Move out of the menubar.', wcag: ['2.1.2'], apg: 'menubar' },
  ],

  /**
   * Tier C — composite. A menubar, a set of disclosure panels and a roving
   * focus index share one open/closed state across two layouts.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names across the mega menu. */
export type DzMegaMenuPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzMegaMenu — every part.
 *
 * Nothing here comes from consumer markup, so there is no node `class` at the
 * call site already reaches and no key to leave out.
 */
export type DzMegaMenuUi = UiOverrides<typeof anatomy>
