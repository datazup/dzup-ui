import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCheckboxGroup — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * One node, and that is the whole honest answer: this component renders a
 * `role="group"` container and puts every `DzCheckbox` a consumer writes inside
 * it. Each of those is a declaring component and emits `data-part="root"`, so
 * the boundary rule stops the check there — the group promises the container
 * and nothing about its members' internals.
 *
 * No `ui` prop, deliberately: with one part, `class` already reaches the only
 * node there is, and a one-key map would be a second spelling of the same
 * thing (the reading of the success criterion recorded as D16 option (a)).
 */
export const anatomy = {
  parts: ['root'],

  /** Nothing is conditional: the container always renders. */
  optionalParts: [],

  /** `ready` / `disabled` as `data-state`, plus the presence-only `disabled`. */
  states: ['ready', 'disabled'],

  /**
   * Empty and measured: `DzCheckboxGroup.tokens.ts` reads two spacing tokens
   * from the global scale rather than owning properties of its own.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * Mirrors with the document — a horizontal group flows with the text.
   * `keyboard: 'none'`: checkboxes are individually focusable, so there is no
   * roving arrow contract to swap.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A group of checkboxes is not a
   * roving-focus widget: every box is its own tab stop and owns its own
   * Space.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next checkbox; each box in the group is its own tab stop.',
      wcag: ['2.1.2'],
      apg: 'checkbox',
    },
    { key: ' ', action: 'Toggle the focused checkbox.', wcag: ['2.1.1'], apg: 'checkbox' },
  ],

  /** Tier B — it owns a multi-value form contract and a disabled cascade. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzCheckboxGroupPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCheckboxGroup. */
export type DzCheckboxGroupUi = UiOverrides<typeof anatomy>
