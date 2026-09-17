import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzColorModeToggle — declared anatomy for the theme switcher
 * (TASK-R5-O2, ADR-19).
 *
 * One part, and that is the honest count. The component renders a wrapper
 * `<span>` and then delegates the whole control to one of three other
 * components — `DzIconButton`, `DzSwitch` or `DzSegmented` — each of which is
 * its own anatomy boundary (`boundary-stops`, the second clause of the
 * composition rule in this task's handoff §2). Re-declaring a button's parts
 * here would make this component the author of a surface it does not render.
 *
 * The live region is deliberately unaddressable, for the reason the previous
 * slice recorded for `DzLightbox` and `DzTour`: a part name on a `sr-only`
 * announcer invites a consumer to make it visible, and an announcer that is
 * visible is a defect.
 *
 * **One boundary is missing and it is not this component's to fix.**
 * `variant="switch"` renders `DzSwitch`, which is in the `forms` family and
 * therefore blocked on owner decision D15 (S1-D4 / `DzOptionsState`). Until
 * `forms` declares, `DzSwitch`'s `checked`/`unchecked` values are inside this
 * component's subtree with nothing to stop them, so
 * `navigation.anatomy.spec.ts` conformance-checks the `icon` and `segmented`
 * variants and asserts the `switch` variant's root only. That is a blocked
 * check, recorded as such, not a silenced one.
 */
export const anatomy = {
  parts: ['root'],

  /**
   * Empty: the wrapper announces nothing. Every state a consumer can see —
   * pressed, checked, disabled — belongs to the delegate inside it and is
   * declared there.
   */
  states: [],

  /** Measured from `DzColorModeToggle.tokens.ts`. */
  componentTokens: [
    '--dz-color-mode-toggle-icon-size',
    '--dz-color-mode-toggle-transition',
  ],

  /**
   * `variant` (icon | switch | segmented) is mirrored onto the root as
   * `data-variant` and was already; `size` is forwarded to the delegate.
   */
  recipes: ['variant', 'size'],

  /** Mirrors with the document; no inline-axis key handling of its own. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Native `button` activation; the mode
   * advances by one step per activation.
   */
  keyboard: [
    {
      key: 'Enter',
      action: 'Activate the control, advancing the colour mode.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    { key: ' ', action: 'Activate the control, advancing the colour mode.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /** Tier B — every variant is a focusable control that changes global state. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the colour-mode toggle. */
export type DzColorModeTogglePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzColorModeToggle — the wrapper it renders. */
export type DzColorModeToggleUi = UiOverrides<typeof anatomy>
