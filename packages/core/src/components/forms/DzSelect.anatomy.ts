import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSelect — declared anatomy (TASK-OSS-P3-03, ADR-19).
 *
 * The Reka-backed pilot, and the one that tests the boundary rule: *a node that
 * exists only because Reka renders it is not addressable*.
 *
 * Every part below is a node **this component's own template names** — the
 * `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>` elements it writes and
 * already passes classes to. What is deliberately absent is anything reachable
 * only by selecting inside Reka's output: the popper wrapper Reka positions,
 * its focus-scope and dismissable-layer nodes, and the hidden native `<select>`
 * it keeps in sync for form submission. Those are Reka's to change in a patch
 * release, and promising them would make this library's contract depend on
 * another library's internals.
 *
 * `item`, `item-indicator` and `item-label` repeat once per option and are
 * therefore optional — "sometimes many" has to be declared, not inferred.
 *
 * Note that `content` and everything under it render into a **portal**, so a
 * conformance check on the mounted wrapper sees only the trigger side; the
 * open-state check reads `document.body`.
 */
export const anatomy = {
  parts: [
    'root',
    'trigger',
    'icon',
    'content',
    'viewport',
    'input',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'error',

    /**
     * TASK-N2-S1. These three were **emitted and undeclared** — by this
     * component's own template *and* by `DzOptionsState.vue`, the unexported
     * internal it renders for the async loading/error/retry states. Nothing
     * could see it: `expectAnatomy` only checks the branches a spec mounts, and
     * no spec mounts the failed-async branch, so a pilot shipped three parts
     * outside its own contract for the life of the pilot.
     *
     * They are declared here rather than renamed. Renaming a shipped
     * `data-part` is breaking (ADR-19 §3) and belongs to the owner lane; see
     * the S1 handoff §4.2 for the naming question these three raise.
     */
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * Everything except `root` and `trigger` is conditional: the listbox exists
   * only while open, the search input only when `searchable`, the items only
   * when there are options, `empty` only when there are not, and `error` only
   * when there is one.
   */
  optionalParts: [
    'icon',
    'content',
    'viewport',
    'input',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `open`/`closed` come from Reka on the trigger and content; `idle`/`disabled`
   * are this component's own. Both are emitted, so both are declared — a
   * component that re-exports a primitive's state still owns the promise.
   */
  states: ['idle', 'open', 'closed', 'disabled', 'invalid', 'checked', 'unchecked'],

  /**
   * **Empty, and that is the honest answer.** DzSelect owns no `--dz-select-*`
   * token: `DzSelect.tokens.ts` maps straight to global semantic tokens
   * (`--dz-background`, `--dz-border`, `--dz-muted-foreground`, …), so there is
   * no per-component custom property a consumer can set to restyle one select
   * without moving the whole theme.
   *
   * Declaring invented names here would document an override point that does
   * not exist. Until a token-ownership decision adds them (ADR-17 territory,
   * not this pilot's), the sanctioned per-instance route is `ui`, and the
   * theme-wide route is the global tokens.
   */
  componentTokens: [],

  recipes: ['variant', 'size'],

  /** Tier A: focus-managing, form-bearing, and keyboard-navigable. */
  /**
   * Mirrors with the document, and the chevron is direction-bearing: it points
   * at the panel it opens, so it flips with the layout.
   *
   * `keyboard: 'none'` deliberately. A listbox navigates the **block** axis —
   * ArrowUp and ArrowDown — and those do not swap in RTL. Declaring
   * `swap-horizontal` here would be copying a rule from tabs to a component
   * whose arrows point the other way.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['indicator'] },

  /**
   * Tier B — interactive primitive. It owns focus, the listbox keyboard
   * contract and a value, and its popup is teleported, so hydration is part of
   * its contract rather than an implementation detail.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSelectPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSelect. */
export type DzSelectUi = UiOverrides<typeof anatomy>
