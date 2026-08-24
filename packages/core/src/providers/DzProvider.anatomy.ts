import type { ComponentAnatomy } from '@dzup-ui/contracts'

/**
 * DzProvider — declared anatomy (TASK-OSS-P4-02, ADR-19).
 *
 * **`parts: 'none'` is a promise, not a gap.** ADR-19 distinguishes "renders no
 * element of its own" from "has parts nobody wrote down", and this is the first
 * case: the template is a bare `<slot />`. That is load-bearing rather than
 * incidental — it is what lets the provider sit inside a shadow root, inside a
 * `<tbody>`, or between a flex container and its children without changing
 * layout, and the Styling Cookbook's shadow-DOM recipe depends on it.
 *
 * It is also the constraint that decides how a nested provider handles
 * direction: with no element to hang `dir` on, a nested provider changes what
 * `useDzDirection()` answers and leaves the DOM attribute to the host. Rendering
 * a wrapper to fix that would trade a documented limitation for an undocumented
 * layout change in every consumer.
 */
export const anatomy = {
  parts: 'none',

  /** Nothing rendered means nothing to put a state on. */
  states: [],

  /**
   * A provider reads no `--dz-provider-*` token and offers none. Its whole
   * output is context; the tokens it makes reachable belong to the components
   * that consume them.
   */
  componentTokens: [],

  /**
   * Renders no element, so there is no layout to mirror and no key to swap.
   * `mirrors: 'none'` here means "nothing to mirror", not "deliberately
   * physical" — the distinction matters because this is the component that
   * decides* the direction for everything below it (ADR-20).
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Tier B.
   *
   * The ladder has no rung for infrastructure, and this component is neither
   * presentational nor an interactive primitive: it renders nothing to focus
   * and nothing to look at. It sits at B for the consequence, not the surface —
   * getting `motion` wrong animates for a user who asked the OS not to; getting
   * `direction` wrong lays out an Arabic application left-to-right; getting
   * `nonce` wrong drops the style tag under a strict CSP. Every one of those is
   * silent, global, and invisible to the component that suffers it.
   *
   * The two Tier B rows it cannot satisfy — `keyboard-spec` and `browser-play`,
   * both of which need a focusable node — are recorded as exceptions in the
   * quality assignment rather than dropped, so the capability matrix still
   * shows the cell and says why it is empty.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy
