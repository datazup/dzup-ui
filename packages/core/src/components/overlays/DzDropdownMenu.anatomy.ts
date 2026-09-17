import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDropdownMenu — declared anatomy for the dropdown-menu family
 * (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy with no `root`.** `DzDropdownMenu` renders reka-ui's
 * `DropdownMenuRoot` around a bare slot: no element of its own, and everything
 * visible comes from `DzDropdownMenuTrigger`, `DzDropdownMenuContent`,
 * `DzDropdownMenuItem` and `DzDropdownMenuSeparator`, which the ownership
 * manifest records as `compound-part`s with
 * `parentComponent: 'DzDropdownMenu'`. `DzDialogContent` already declares an
 * anatomy without a `root` for the same reason.
 *
 * **The trigger is deliberately not a part.** `DzDropdownMenuTrigger` renders
 * `as-child`, so any attribute it sets lands on the *consumer's* element —
 * the residual composition case N2-S1 recorded as S1-F3/S1-D2, where a
 * merged attribute cannot be told apart from the host's own. Stamping
 * `data-part="trigger"` onto someone else's node would make this library the
 * author of a part on markup it did not write. The trigger is reachable with
 * `class` at the call site, which is where it is written.
 */
export const anatomy = {
  parts: ['content', 'item', 'prefix', 'suffix', 'separator'],

  /**
   * Every part is composed by the consumer — a `DzDropdownMenu` with no
   * `DzDropdownMenuContent` renders nothing at all — and `item`, `prefix`,
   * `suffix` and `separator` repeat.
   */
  optionalParts: ['content', 'item', 'prefix', 'suffix', 'separator'],

  /**
   * `open` / `closed` come from reka-ui's `DropdownMenuContent`; `disabled` is
   * the presence-only flag reka writes on a disabled item. `data-highlighted`
   * is reka's roving-focus marker rather than a component state, and is not
   * declared — it is the pointer/keyboard cursor, not a condition of the menu.
   */
  states: ['open', 'closed', 'disabled'],

  /**
   * Empty and measured: the variants read global semantic tokens
   * (`--dz-popover`, `--dz-border`, `--dz-radius-md`) and own no
   * `--dz-dropdown-menu-*` property.
   */
  componentTokens: [],

  /**
   * Mirrors with the document — reka resolves `align="start"` against the
   * writing direction, and the item padding is logical. `keyboard: 'none'`:
   * a vertical menu moves on ArrowUp/ArrowDown; ArrowRight opens a submenu,
   * which reka already flips for RTL.
   *
   * `icons`: a submenu chevron points at the panel it opens, so it mirrors.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['suffix'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `menu` behind a `menu-button`
   * trigger. The horizontal rows carry no `rtl` marker: this component
   * declares `rtl.keyboard: 'none'`, and a row marked mirrored would
   * contradict it (owner decision D36).
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Move focus to the next item, wrapping at the end.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'ArrowUp',
      action: 'Move focus to the previous item, wrapping at the start.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    { key: 'Home', action: 'Move focus to the first item.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'End', action: 'Move focus to the last item.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'Enter', action: 'Invoke the focused item and close the menu.', wcag: ['2.1.1'], apg: 'menu' },
    { key: ' ', action: 'Invoke the focused item and close the menu.', wcag: ['2.1.1'], apg: 'menu' },
    {
      key: 'ArrowRight',
      when: 'item with a submenu',
      action: 'Open the focused item submenu and focus its first item.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'ArrowLeft',
      when: 'submenu open',
      action: 'Close the current submenu and return to its parent item.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'Escape',
      action: 'Close the menu and return focus to the trigger.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'menu',
    },
    {
      key: '<character>',
      action: 'Move focus to the next item whose label starts with that character.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
  ],

  /**
   * Tier B — a focus-trapping menu with roving focus, typeahead and Escape
   * handling; a defect strands focus inside a closed menu.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the dropdown-menu family. */
export type DzDropdownMenuPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for the dropdown-menu family.
 *
 * Declared for completeness and consumed by the compound parts rather than by
 * `DzDropdownMenu` itself, which renders no element.
 */
export type DzDropdownMenuUi = UiOverrides<typeof anatomy>
