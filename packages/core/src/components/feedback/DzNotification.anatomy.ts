import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzNotification — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * Six nodes, all named from the shared vocabulary. `content` is the flexible
 * middle column the title, description and actions sit in — the node a
 * consumer reaches for when the icon and close button must keep their width.
 */
export const anatomy = {
  parts: ['root', 'icon', 'content', 'title', 'description', 'action', 'close'],

  /**
   * `icon` needs the `icon` prop or slot, `description` needs a description or
   * default slot, `action` needs the `actions` slot, and `close` needs
   * `closable`. Only the root, its content column and the title are
   * unconditional.
   */
  optionalParts: ['icon', 'description', 'action', 'close'],

  /**
   * `open`/`closed` — already emitted before this declaration. The whole
   * element is behind `v-if="visible"`, so `closed` is reachable only in the
   * frame a transition holds it, which is exactly why the value is declared
   * rather than assumed absent.
   */
  states: ['open', 'closed'],

  /**
   * Empty and measured: `DzNotification.variants.ts` reads global semantic
   * tokens (`--dz-background`, `--dz-spacing-*`, the tone ramps) and owns no
   * `--dz-notification-*` property of its own.
   */
  componentTokens: [],

  recipes: ['tone'],

  /**
   * Mirrors with the document. The content column's inline padding was
   * `pr-[var(--dz-spacing-4)]`, which put the gap on the wrong side of an
   * Arabic notification; it is `pe-` as of this declaration and identical in
   * LTR. `keyboard: 'none'`: it handles no key of its own.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `alert` adds no keys of its own;
   * what this component owns is its close control.
   */
  keyboard: [
    { key: 'Enter', when: 'close', action: 'Dismiss the notification.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'close', action: 'Dismiss the notification.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /**
   * Tier B — it owns a live region, a dismiss control and a timer. A defect is
   * an announcement a screen-reader user never hears.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzNotification. */
export type DzNotificationPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzNotification — every node comes from this template. */
export type DzNotificationUi = UiOverrides<typeof anatomy>
