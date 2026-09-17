import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzImageComparison — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `panel` for the two image layers: they are the same kind of node — a full
 * surface holding one image — and the vocabulary's word for a surface region is
 * `panel`. Which one a consumer is looking at is already public on the layer's
 * z-order and on the slot they filled. `separator` for the divider line (its
 * role) and `control` for the `role="slider"` grip (its role); neither is
 * `indicator`, because both are operable.
 *
 * The `img` elements themselves get no part: the vocabulary has no word for an
 * image, and inventing one here is the drift ADR-19 forbids. Recorded in the
 * TASK-R5-O2 handoff as the vocabulary request `image` / `media`; the two
 * layer slots replace them wholesale in the meantime.
 */
export const anatomy = {
  parts: ['root', 'panel', 'label', 'separator', 'control'],

  /**
   * `panel` renders exactly twice — once per layer — which ADR-19 requires be
   * said out loud, and `label` renders once per supplied caption, so zero, one
   * or two times.
   */
  optionalParts: ['panel', 'label'],

  /**
   * No `data-state`. `data-disabled` is a presence-only flag, and
   * `data-orientation` is a recipe axis mirrored on the root rather than a
   * condition.
   */
  states: ['disabled'],

  /** Measured — every `--dz-image-comparison-*` the variants read. */
  componentTokens: [
    '--dz-image-comparison-divider-color',
    '--dz-image-comparison-divider-width',
    '--dz-image-comparison-handle-size',
    '--dz-image-comparison-handle-bg',
    '--dz-image-comparison-handle-color',
    '--dz-image-comparison-label-bg',
    '--dz-image-comparison-label-color',
  ],

  recipes: ['orientation'],

  /**
   * `mirrors: 'none'`, deliberately — the case the N2-S1 handoff flagged
   * before this slice ran. The reveal is a `clip-path` measured in physical
   * percent from the left edge and driven by a physical `pointermove`
   * coordinate; the two captions are pinned to the physical edges the layers
   * actually occupy. Mirroring the box while the clip stayed physical would put
   * each caption over the other image. `keyboard: 'none'` for the same reason:
   * ArrowRight moves the divider right, which is the direction the user watches
   * it go.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `slider` on the divider — the
   * keyboard alternative to a pointer-only drag, which is what SC 2.1.1
   * requires of it. The arrows map to the visible left and right edges of
   * the image and therefore do NOT swap in a RTL document, which is why
   * `rtl.keyboard` is `none`.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move the divider towards the right edge of the image.',
      wcag: ['2.1.1', '2.5.7'],
      apg: 'slider',
      rtl: 'fixed',
    },
    {
      key: 'ArrowLeft',
      action: 'Move the divider towards the left edge of the image.',
      wcag: ['2.1.1', '2.5.7'],
      apg: 'slider',
      rtl: 'fixed',
    },
    {
      key: 'ArrowUp',
      action: 'Move the divider towards the right edge of the image.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    {
      key: 'ArrowDown',
      action: 'Move the divider towards the left edge of the image.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    { key: 'Home', action: 'Move the divider fully to the left edge.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'End', action: 'Move the divider fully to the right edge.', wcag: ['2.1.1'], apg: 'slider' },
  ],

  /**
   * Tier B — the grip is a focusable `role="slider"` with keyboard control and
   * a live `aria-valuetext`.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzImageComparison. */
export type DzImageComparisonPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzImageComparison — every node comes from this template. */
export type DzImageComparisonUi = UiOverrides<typeof anatomy>
