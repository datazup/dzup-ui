import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSplitButton — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * A compound component: the group shell is this file's `root`, and `action` and
 * `trigger` are emitted by `DzSplitButtonAction` and `DzSplitButtonMenu`, the
 * two compound parts a consumer composes into the default slot.
 *
 * Declaring them **here** rather than giving each part its own anatomy is the
 * pattern `DzTable` already established: the composing component owns the
 * contract, so a consumer reads one document and writes one `ui` map, and the
 * parts stay parts rather than becoming components with contracts of their own.
 * `validate:anatomy-parts` resolves an emission through the ownership
 * manifest's `parentComponent`, so the two files are covered by this
 * declaration and by nothing else.
 *
 * Both are optional because both arrive through a slot: a split button rendered
 * without its menu is unusual, but it is legal and it renders.
 */
export const anatomy = {
  parts: ['root', 'action', 'trigger'],
  optionalParts: ['action', 'trigger'],
  states: ['idle', 'loading', 'disabled'],

  /** Empty and measured: no `--dz-split-button-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],

  /** The action and the disclosure sit on the inline axis and flip with the document. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Two `<button>`s: the primary action, and the
   * disclosure that a **consumer's** menu is attached to.
   *
   * ## `D-RES14-4`, decided by RESIDUAL-15: the menu rows are withdrawn
   *
   * The table used to publish the whole APG `menu-button` pattern: `ArrowDown` and
   * `Enter`, both scoped to `trigger`, "open the menu and focus its first item",
   * and `Escape` scoped to `menu open` "closes the menu and returns focus to the
   * trigger". The measurement, and it is not close:
   *
   * - `DzSplitButtonMenu.vue` is a `<div class="relative">` containing a `<slot>`
   *   whose **fallback** is a bare `<button data-part="trigger" type="button"
   *   aria-haspopup="true">` at `:55`. There is no `open` ref, no
   *   `DZ_SPLIT_BUTTON_KEY` field for menu state, no `reka-ui` import and no
   *   `keydown` anywhere in the file or in `DzSplitButton.vue`.
   * - Both `@example` blocks in the family — `DzSplitButton.vue:13` and
   *   `DzSplitButtonMenu.vue:10` — show the menu being **composed into the slot**
   *   (`<DzDropdownMenu>` / `<DzDropdownMenuContent>`). The menu is the
   *   consumer's, by design and by documentation. RESIDUAL-14 §2.3 found that
   *   those very `@example` blocks were what had been crediting the rows: every
   *   menu primitive in this component's closure arrived through its own prose.
   * - **`DzDropdownMenu` already publishes the withdrawn rows, correctly.**
   *   `DzDropdownMenu.anatomy.ts:96` declares `Escape` → *"Close the menu and
   *   return focus to the trigger."* — the identical sentence — backed by Reka's
   *   `DismissableLayer`; `:66` declares `ArrowDown`, and
   *   `DzDropdownMenuTrigger.vue` wraps Reka's `DropdownMenuTrigger`, which opens
   *   on the arrow. So the pattern is implemented in this repository, on the
   *   component that owns a menu.
   *
   * This is the `DzTable` → `DzDataGrid` move RESIDUAL-14 §5 made for the three
   * sort rows, for the same reason: a row belongs to the component that
   * implements it, and a second copy on a wrapper is a promise the wrapper cannot
   * keep. `Enter` *(trigger)* is **kept and re-described** rather than withdrawn,
   * because the trigger really is a `<button>` and `Enter` really does activate
   * it — what the old sentence over-claimed was the consequence.
   *
   * **Rejected alternative (a): implement the menu-button contract here.** It
   * means this component owning a menu rather than slotting one — open state, an
   * overlay primitive, focus restoration — and it changes what the slot *means*
   * from "your menu" to "your items", which is a breaking change to the published
   * API of both `@example` blocks. It would also be a second implementation of
   * `DzDropdownMenu` inside a button family. **Rejected alternative (c): document
   * both rows as requirements on the slotted menu.** There is no column for that;
   * `expectKeyboardContract`'s `conditions` is the nearest thing and it admits a
   * prop name, not a slot. Nothing about the rendered markup changed here — two
   * rows left a published table and one sentence became true.
   */
  keyboard: [
    /**
     * RESIDUAL-14 re-scoped these two from `root` to `action`. `root` is the
     * `role="group"` wrapper at `DzSplitButton.vue`'s top, which contains a `<slot />`
     * and activates on nothing; the primary action is the
     * `<button data-part="action">` at `DzSplitButtonAction.vue:59`, which is what the
     * sentence has always described. Scoped to `root`, the row was satisfied by a menu
     * primitive that entered the closure through this file's own `@example` — and once
     * comments stopped being evidence it was satisfied by nothing at all. The words on
     * the documentation page do not change; the node the citation points at does.
     */
    { key: 'Enter', when: 'action', action: 'Activate the primary action.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'action', action: 'Activate the primary action.', wcag: ['2.1.1'], apg: 'button' },
    /**
     * Re-described by RESIDUAL-15 (see the `D-RES14-4` note above). It used to
     * read "Open the menu and focus its first item", which the
     * `<button data-part="trigger" aria-haspopup="true">` at
     * `DzSplitButtonMenu.vue:55` cannot do: activating it is all this component
     * owns, and what opens is whatever the consumer composed into the slot.
     * `apg` drops from `menu-button` to `button` for the same reason — the
     * `menu-button` pattern is `DzDropdownMenu`'s, and `aria-haspopup="true"` on
     * this node is what tells a screen reader a menu is on the other end of it.
     */
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Activate the disclosure; the menu composed into its slot is what opens.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /** Tier B — two focusable controls sharing one disabled/loading model. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSplitButtonPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzSplitButton — **`root` only**.
 *
 * `action` and `trigger` are real, declared, selectable parts, and a consumer
 * reaches them from a stylesheet exactly like any other part. They are absent
 * from the `ui` map because the nodes are rendered by *sibling components a
 * consumer composed into the slot*, not by this template: routing classes to
 * them would mean plumbing the map through `DZ_SPLIT_BUTTON_KEY` and having two
 * more components read it, which is a template refactor rather than a styling
 * change — this task's stated stop condition.
 *
 * Narrowing the type is how that limit becomes visible: `:ui="{ action: … }"`
 * is a **type error** rather than a class that silently lands nowhere. Same
 * mechanism `DzTable` uses for the same reason (its `body`/`row`/`cell` are
 * emitted by `DzTableRow` and friends).
 */
export type DzSplitButtonUi = Pick<UiOverrides<typeof anatomy>, 'root'>
