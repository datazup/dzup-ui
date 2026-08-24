import type { ComponentAnatomy } from '@dzup-ui/contracts'

/**
 * `DzFileUpload` anatomy (ADR-19, TASK-OSS-P3-02).
 *
 * Declared as part of TASK-OSS-P5-06: this is the catalog's only Tier D
 * component, and the capability-matrix gate does not let a Tier D row sit
 * empty. The `rtl-contract` cell was the one with nothing behind it.
 *
 * **This declares what the component emits today, not what it should emit.**
 * `DzFileUpload` is not one of the five P3-03 parts pilots, so it carries no
 * `data-part` attributes yet: its addressable surface is the root, and the drop
 * zone, the file list and the remove buttons are not yet nameable by a
 * consumer. Declaring the parts it *ought* to have would put six promises in a
 * generated manifest that the DOM does not keep — which is the exact failure
 * mode ADR-19 introduced this file to end. The larger anatomy belongs in
 * whichever packet extends the parts rollout past the pilots.
 */
export const anatomy = {
  /** One addressable node today. See the note above. */
  parts: ['root'],

  /**
   * The template sets `data-state="disabled"` and `data-disabled`, and nothing
   * else. `dragover` is real behaviour and is *not* listed, because it lives in
   * a class on the drop zone rather than in a state attribute a consumer can
   * select — listing it would be advertising a hook that does not exist.
   */
  states: ['disabled'],

  /**
   * None. Every value the component uses is a global semantic token
   * (`--dz-border`, `--dz-spacing-2`); it defines no `--dz-file-upload-*` of
   * its own, so there is no component-scoped override point to promise.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * `mirrors: 'layout'` — the file list, its remove button and the size label
   * sit on the inline axis and follow the writing direction. The variants
   * already use `ms-*`, which is what TASK-OSS-P4-05's migration left behind.
   *
   * `keyboard: 'none'` — the only keys the component handles are Enter and
   * Space on the drop zone, and neither has a direction to swap.
   *
   * No `icons`: the upload arrow points up and the remove glyph is an X.
   * Neither carries direction, and mirroring either would be a defect.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Tier D — security or data boundary. It reads files the user chooses, over
   * both a picker and a drop target, and hands them to the host. See
   * `packages/core/security/DzFileUpload.threat-model.md`.
   */
  riskTier: 'D',
} as const satisfies ComponentAnatomy
