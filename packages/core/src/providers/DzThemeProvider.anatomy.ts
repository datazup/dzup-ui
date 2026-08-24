import type { ComponentAnatomy } from '@dzup-ui/contracts'

/**
 * DzThemeProvider — declared anatomy (TASK-OSS-P4-02, ADR-19).
 *
 * Declared here rather than left for the P3 rollout because this component
 * became a thin wrapper over `DzProvider` in TASK-OSS-P4-02, and a wrapper that
 * does not say what it renders is exactly the case ADR-19 §3 wants stated out
 * loud: it renders nothing, it always rendered nothing, and a consumer may rely
 * on that.
 *
 * The `<style>` tag the provider injects to suppress transitions during a theme
 * switch is not a part. It lives in `<head>` for one frame, carries no
 * `data-part`, and nothing may target it — which is why it takes a CSP nonce
 * instead.
 */
export const anatomy = {
  parts: 'none',
  states: [],
  componentTokens: [],

  /** Renders no element: nothing to mirror, no key to swap. */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Tier B, for the same reason as `DzProvider`: a theme that resolves wrongly
   * is a contrast failure across an entire application, and the failure is
   * invisible to every component it affects. It carries the same two recorded
   * exceptions, and for the same reason — it renders no focusable node.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy
