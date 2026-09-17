import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzStepper — declared anatomy for the progress stepper's container
 * (TASK-R5-O2, ADR-19).
 *
 * One part, and this is the `boundary-stops` clause rather than a thin
 * component. `DzStepperItem` is a **public component in its own right** — the
 * ownership manifest records it as `public-component`, not as a `compound-part`
 * of `DzStepper` — so it declares its own anatomy, emits `data-part="root"`,
 * and is therefore an anatomy boundary. `DzStepper` renders a `role="group"`
 * wrapper around a slot and owns nothing else.
 *
 * That is the difference between this family and `DzCard` or `DzBreadcrumb`,
 * where the sub-components ARE compound parts and the parent declares them all.
 * The manifest's `kind` is what decides which rule applies, not how the markup
 * reads at the call site.
 */
export const anatomy = {
  parts: ['root'],

  /** `ready` on the group. The per-step status belongs to `DzStepperItem`. */
  states: ['ready'],

  /**
   * Empty and measured: `DzStepper.tokens.ts` maps to global semantic tokens
   * (`--dz-primary`, `--dz-border`, the spacing and text scales) and owns no
   * `--dz-stepper-*` property.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * Mirrors with the document — the horizontal stepper's connector line runs
   * along the inline axis and every utility in `DzStepper.variants.ts` is
   * already logical. `keyboard: 'swap-horizontal'`: a horizontal stepper's
   * arrow keys move along that axis, so they reverse in an Arabic document.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). The stepper itself takes no keyboard;
   * each step is its own control. The arrows are declared mirrored on the
   * container because the steps read along the inline axis.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next navigable step; each step is its own tab stop.',
      wcag: ['2.1.2'],
    },
  ],

  /** Tier B — the steps own focus and activation when the stepper is clickable. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the stepper container. */
export type DzStepperPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzStepper — the one node it renders. */
export type DzStepperUi = UiOverrides<typeof anatomy>
