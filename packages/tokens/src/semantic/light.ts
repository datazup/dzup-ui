/**
 * Light Theme Semantic Tokens
 *
 * Maps primitive color tokens to semantic roles for the light theme.
 * These are the default (`:root`) values.
 */

/**
 * Semantic token definitions for light mode.
 * Values reference primitive CSS custom properties via var().
 */
export const LIGHT_SEMANTIC_TOKENS: Record<string, string> = {
  /* ── Surfaces ──
   * Elevation ladder, lowest → highest:
   *   background  → the page itself
   *   surface-sunken → recessed wells, table stripes, inset tracks
   *   surface     → resting cards / panels
   *   surface-raised → cards lifted on hover / dragged items
   *   surface-overlay → floating layers (menus, popovers, tooltips)
   * Each tier pairs with `--dz-surface-foreground` for text/icons. */
  '--dz-background': 'var(--dz-colors-neutral-100)',
  '--dz-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-surface-sunken': 'var(--dz-colors-neutral-200)',
  '--dz-surface': 'oklch(1 0 0)',
  '--dz-surface-raised': 'oklch(1 0 0)',
  '--dz-surface-overlay': 'oklch(1 0 0)',
  '--dz-surface-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-muted': 'var(--dz-colors-neutral-200)',
  // neutral-600 (not -500) so muted text clears WCAG AA 4.5:1 on both the page
  // surface (neutral-100 → 5.55:1) and muted surfaces (neutral-200 → 4.61:1).
  // neutral-500 sat at ~3.95:1 / ~3.27:1 and failed axe color-contrast across
  // components. Dark mode (neutral-400) already passes and is unchanged.
  '--dz-muted-foreground': 'var(--dz-colors-neutral-600)',

  /* ── Borders ── */
  '--dz-border': 'var(--dz-colors-neutral-300)',
  '--dz-border-hover': 'var(--dz-colors-neutral-300)',
  // A lighter line for non-interactive separators inside content (dividers,
  // table rows) where the standard `--dz-border` would feel too heavy.
  '--dz-divider': 'var(--dz-colors-neutral-200)',
  '--dz-ring': 'var(--dz-colors-primary-500)',
  // Ring offset = the surface the focused element sits on, so a 2px offset ring
  // reads as a gap rather than a second colored band.
  '--dz-ring-offset': 'var(--dz-background)',

  /* ── Links ── */
  '--dz-link': 'var(--dz-colors-primary-600)',
  '--dz-link-hover': 'var(--dz-colors-primary-700)',

  /* ── Disabled (applies to any control) ── */
  '--dz-disabled': 'var(--dz-colors-neutral-100)',
  '--dz-disabled-foreground': 'var(--dz-colors-neutral-400)',

  /* ── Highlight (selected list / menu / option rows) ── */
  '--dz-highlight': 'var(--dz-colors-primary-100)',
  '--dz-highlight-foreground': 'var(--dz-colors-primary-700)',

  /* ── Primary ──
   * Per-intent state set (shared across every intent below):
   *   {intent}            the intent color      (shade 500) — fills, borders, accents
   *   {intent}-foreground guaranteed-legible text on the SOLID fill
   *   {intent}-hover      the intent color, hovered (shade 600)
   *   {intent}-active     the intent color, pressed (shade 700)
   *   {intent}-solid      AA-safe solid fill    — put {intent}-foreground on THIS
   *   {intent}-solid-hover  the solid fill, hovered
   *   {intent}-muted      subtle tinted bg      (shade 100) — badges, alerts
   *   {intent}-muted-foreground emphasis text on the subtle bg (shade 700)
   *   {intent}-border     intent-tinted border for subtle/outline containers
   *
   * `-solid` / `-solid-hover` (TASK-DS-10) exist so every intent exposes the SAME
   * state set. For five intents they resolve to the same shades as `{intent}` /
   * `{intent}-hover`; `warning` is the one intent whose legible fill is a lighter
   * shade (see its block below). Components now read `{intent}-solid` uniformly and
   * no longer branch on `tone === 'warning'`.
   *
   * `-active` is a pressed SURFACE color, not a text-bearing fill: nothing puts
   * `{intent}-foreground` on it, and for `warning` it could not legibly carry it.
   * The contrast gate asserts the `-solid` pair, which is what components render. */
  '--dz-primary': 'var(--dz-colors-primary-500)',
  '--dz-primary-foreground': 'oklch(1 0 0)',
  '--dz-primary-hover': 'var(--dz-colors-primary-600)',
  '--dz-primary-active': 'var(--dz-colors-primary-700)',
  '--dz-primary-solid': 'var(--dz-colors-primary-500)',
  '--dz-primary-solid-hover': 'var(--dz-colors-primary-600)',
  '--dz-primary-muted': 'var(--dz-colors-primary-100)',
  '--dz-primary-muted-foreground': 'var(--dz-colors-primary-700)',
  '--dz-primary-border': 'var(--dz-colors-primary-200)',

  /* ── Secondary ── */
  '--dz-secondary': 'var(--dz-colors-secondary-500)',
  '--dz-secondary-foreground': 'oklch(1 0 0)',
  '--dz-secondary-hover': 'var(--dz-colors-secondary-600)',
  '--dz-secondary-active': 'var(--dz-colors-secondary-700)',
  '--dz-secondary-solid': 'var(--dz-colors-secondary-500)',
  '--dz-secondary-solid-hover': 'var(--dz-colors-secondary-600)',
  '--dz-secondary-muted': 'var(--dz-colors-secondary-100)',
  '--dz-secondary-muted-foreground': 'var(--dz-colors-secondary-700)',
  '--dz-secondary-border': 'var(--dz-colors-secondary-200)',

  /* ── Accent ── */
  '--dz-accent': 'var(--dz-colors-neutral-100)',
  '--dz-accent-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Destructive ── */
  '--dz-destructive': 'var(--dz-colors-danger-500)',
  '--dz-destructive-foreground': 'oklch(1 0 0)',

  /* ── Status: Success ── */
  '--dz-success': 'var(--dz-colors-success-500)',
  '--dz-success-foreground': 'oklch(1 0 0)',
  '--dz-success-hover': 'var(--dz-colors-success-600)',
  '--dz-success-active': 'var(--dz-colors-success-700)',
  '--dz-success-solid': 'var(--dz-colors-success-500)',
  '--dz-success-solid-hover': 'var(--dz-colors-success-600)',
  '--dz-success-muted': 'var(--dz-colors-success-100)',
  '--dz-success-muted-foreground': 'var(--dz-colors-success-700)',
  '--dz-success-border': 'var(--dz-colors-success-200)',

  /* ── Status: Warning ── (TASK-DS-10 normalization)
   * Warning is the one intent that carries DARK foreground text — a bright yellow
   * cannot legibly seat white text at any usable shade. Its intent color is
   * therefore pinned to the LIGHTEST shade that still reads as a saturated amber,
   * shade 400, so that `--dz-warning-foreground` (near-black) clears AA *on
   * `--dz-warning` itself*: neutral-900 on warning-400 = 5.87:1 (SC 1.4.3). This
   * matches the dark theme, which already sits at shade 400. On the previous
   * shade 500 the same pair measured only 3.51:1 — below AA — which is the token
   * defect this normalization closes. The advertised solid-fill pattern
   * `bg-[var(--dz-warning)] text-[var(--dz-warning-foreground)]` now passes, and
   * the DESIGN.md contrast gate asserts it (design-md-check.ts).
   *
   * Trade-off, recorded honestly: as a purely DECORATIVE accent/border on the
   * light page, `--dz-warning` now measures ~2.34:1 (was 3.92:1 at shade 500).
   * That is a non-text use (SC 1.4.11) that this token set already does not hold
   * to 3:1 for warning — `--dz-warning-border` ships at 1.63:1 and the contrast
   * gate deliberately does not assert border/decorative pairs. A warning graphic
   * that must meet 3:1 (e.g. an icon-only status dot) belongs on a muted surface
   * with `--dz-warning-muted-foreground`, not on the bare intent color.
   *
   * `-solid` (300 = 8.44:1) / `-solid-hover` (400 = 5.87:1) remain the max-contrast
   * fills components render uniformly across every intent. `-active` is a pressed
   * SURFACE color, not a text-bearing fill; `-solid-active` exists for no intent. */
  '--dz-warning': 'var(--dz-colors-warning-400)',
  '--dz-warning-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-warning-hover': 'var(--dz-colors-warning-600)',
  '--dz-warning-active': 'var(--dz-colors-warning-500)',
  '--dz-warning-solid': 'var(--dz-colors-warning-300)',
  '--dz-warning-solid-hover': 'var(--dz-colors-warning-400)',
  '--dz-warning-muted': 'var(--dz-colors-warning-100)',
  '--dz-warning-muted-foreground': 'var(--dz-colors-warning-700)',
  '--dz-warning-border': 'var(--dz-colors-warning-300)',

  /* ── Status: Danger ── */
  '--dz-danger': 'var(--dz-colors-danger-500)',
  '--dz-danger-foreground': 'oklch(1 0 0)',
  '--dz-danger-hover': 'var(--dz-colors-danger-600)',
  '--dz-danger-active': 'var(--dz-colors-danger-700)',
  '--dz-danger-solid': 'var(--dz-colors-danger-500)',
  '--dz-danger-solid-hover': 'var(--dz-colors-danger-600)',
  '--dz-danger-muted': 'var(--dz-colors-danger-100)',
  '--dz-danger-muted-foreground': 'var(--dz-colors-danger-700)',
  '--dz-danger-border': 'var(--dz-colors-danger-200)',

  /* ── Status: Info ── */
  '--dz-info': 'var(--dz-colors-info-500)',
  '--dz-info-foreground': 'oklch(1 0 0)',
  '--dz-info-hover': 'var(--dz-colors-info-600)',
  '--dz-info-active': 'var(--dz-colors-info-700)',
  '--dz-info-solid': 'var(--dz-colors-info-500)',
  '--dz-info-solid-hover': 'var(--dz-colors-info-600)',
  '--dz-info-muted': 'var(--dz-colors-info-100)',
  '--dz-info-muted-foreground': 'var(--dz-colors-info-700)',
  '--dz-info-border': 'var(--dz-colors-info-200)',

  /* ── Input ── */
  '--dz-input-bg': 'oklch(1 0 0)',
  '--dz-input-border': 'var(--dz-colors-neutral-300)',
  '--dz-input-border-focus': 'var(--dz-colors-primary-500)',
  '--dz-input-placeholder': 'var(--dz-colors-neutral-400)',

  /* ── Card ── */
  '--dz-card': 'oklch(1 0 0)',
  '--dz-card-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Popover ── */
  '--dz-popover': 'oklch(1 0 0)',
  '--dz-popover-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Overlay / Scrim ── */
  '--dz-overlay-bg': 'oklch(0 0 0 / 0.6)',
  // `--dz-scrim` is the canonical name for the dimming layer behind modals,
  // drawers and sheets; `--dz-overlay-bg` is kept as the legacy alias.
  '--dz-scrim': 'oklch(0 0 0 / 0.6)',

  /* ── Sidebar ──
   * Sidebar token values are NOT written at the semantic tier. Tier 3 component
   * defaults in `src/component/sidebar.ts` provide neutral fallbacks (which
   * resolve to `var(--dz-surface)` etc.). Brand overrides — including the
   * "always-dark" Datazup sidebar look — live in
   * `@datazup/dzup-theme/styles/preset-dark-sidebar.css`. Apps opt in by
   * importing that preset; apps that don't import it get a neutral light
   * sidebar that follows the page surface.
   *
   * Writing concrete dark-neutrals here used to silently override the Tier 3
   * defaults regardless of whether the consumer wanted a dark sidebar — that
   * cascade collision was the bug Phase 6 of the shell improvement plan
   * resolved at the brand-preset level. Now that the preset writes the full
   * canonical set, this block is redundant and removed. */

  /* ── AppShell ── */
  '--dz-appshell-header-bg': 'oklch(1 0 0)',
  '--dz-appshell-header-border': 'var(--dz-colors-neutral-200)',
  '--dz-appshell-main-bg': 'var(--dz-colors-neutral-100)',

  /* ── CodeBlock ── */
  '--dz-codeblock-bg': 'var(--dz-colors-neutral-900)',
  '--dz-codeblock-text': 'var(--dz-colors-neutral-100)',
  '--dz-codeblock-border': 'var(--dz-colors-neutral-800)',
  '--dz-codeblock-header-bg': 'var(--dz-colors-neutral-800)',
  '--dz-codeblock-header-text': 'var(--dz-colors-neutral-400)',
  '--dz-codeblock-line-number': 'var(--dz-colors-neutral-600)',

  /* ── Chart / categorical palette ──
   * A 10-way qualitative scale for data viz. Hues are spread around the wheel so
   * adjacent series stay distinct; pull from the decorative spectrum rather than
   * the intent palettes so charts don't read as success/danger by accident. */
  '--dz-chart-1': 'var(--dz-colors-primary-500)',
  '--dz-chart-2': 'var(--dz-colors-secondary-500)',
  '--dz-chart-3': 'var(--dz-colors-success-500)',
  '--dz-chart-4': 'var(--dz-colors-warning-500)',
  '--dz-chart-5': 'var(--dz-colors-danger-500)',
  '--dz-chart-6': 'var(--dz-colors-cyan-500)',
  '--dz-chart-7': 'var(--dz-colors-violet-500)',
  '--dz-chart-8': 'var(--dz-colors-pink-500)',
  '--dz-chart-9': 'var(--dz-colors-amber-500)',
  '--dz-chart-10': 'var(--dz-colors-teal-500)',

  /* ── Orchestration run status ── */
  '--dz-status-pending': 'var(--dz-muted-foreground)',
  '--dz-status-running': 'var(--dz-info)',
  '--dz-status-paused': 'var(--dz-warning)',
  '--dz-status-completed': 'var(--dz-success)',
  '--dz-status-failed': 'var(--dz-danger)',
  '--dz-status-cancelled': 'var(--dz-muted-foreground)',

  /* ── Progress thresholds (token-usage bars) ── */
  '--dz-progress-amber': 'var(--dz-warning)',
  '--dz-progress-red': 'var(--dz-danger)',
}
