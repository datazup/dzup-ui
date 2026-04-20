const l = {
  /* ── Header ── */
  "--dz-appshell-header-height": "4rem",
  "--dz-appshell-header-bg": "var(--dz-surface)",
  "--dz-appshell-header-border": "var(--dz-border)",
  "--dz-appshell-header-z-index": "var(--dz-z-sticky)",
  "--dz-appshell-header-padding-x": "var(--dz-spacing-4)",
  /* ── Main ── */
  "--dz-appshell-main-bg": "var(--dz-background)",
  "--dz-appshell-main-padding": "var(--dz-spacing-6)",
  /* ── Transition ── */
  "--dz-appshell-transition": "all var(--dz-duration-normal) var(--dz-ease-default)"
}, i = {
  "--dz-badge-radius": "var(--dz-radius-full)",
  "--dz-badge-font-weight": "500",
  "--dz-badge-font-family": "var(--dz-font-sans)",
  /* Size: sm */
  "--dz-badge-sm-height": "var(--dz-spacing-5)",
  "--dz-badge-sm-padding-x": "var(--dz-spacing-2)",
  "--dz-badge-sm-font-size": "var(--dz-text-xs)",
  /* Size: md */
  "--dz-badge-md-height": "var(--dz-spacing-6)",
  "--dz-badge-md-padding-x": "var(--dz-spacing-2_5)",
  "--dz-badge-md-font-size": "var(--dz-text-xs)",
  /* Size: lg */
  "--dz-badge-lg-height": "var(--dz-spacing-7)",
  "--dz-badge-lg-padding-x": "var(--dz-spacing-3)",
  "--dz-badge-lg-font-size": "var(--dz-text-sm)"
}, u = {
  "--dz-button-radius": "var(--dz-radius-md)",
  "--dz-button-font-weight": "500",
  "--dz-button-font-family": "var(--dz-font-sans)",
  "--dz-button-transition": "all var(--dz-duration-fast) var(--dz-ease-default)",
  "--dz-button-focus-ring-width": "2px",
  "--dz-button-focus-ring-offset": "2px",
  "--dz-button-focus-ring-color": "var(--dz-ring)",
  "--dz-button-disabled-opacity": "0.5",
  /* Size: xs */
  "--dz-button-xs-height": "var(--dz-spacing-7)",
  "--dz-button-xs-padding-x": "var(--dz-spacing-2)",
  "--dz-button-xs-font-size": "var(--dz-text-xs)",
  "--dz-button-xs-gap": "var(--dz-spacing-1)",
  /* Size: sm */
  "--dz-button-sm-height": "var(--dz-spacing-8)",
  "--dz-button-sm-padding-x": "var(--dz-spacing-3)",
  "--dz-button-sm-font-size": "var(--dz-text-xs)",
  "--dz-button-sm-gap": "var(--dz-spacing-1_5)",
  /* Size: md */
  "--dz-button-md-height": "var(--dz-spacing-9)",
  "--dz-button-md-padding-x": "var(--dz-spacing-4)",
  "--dz-button-md-font-size": "var(--dz-text-sm)",
  "--dz-button-md-gap": "var(--dz-spacing-2)",
  /* Size: lg */
  "--dz-button-lg-height": "var(--dz-spacing-10)",
  "--dz-button-lg-padding-x": "var(--dz-spacing-6)",
  "--dz-button-lg-font-size": "var(--dz-text-sm)",
  "--dz-button-lg-gap": "var(--dz-spacing-2)",
  /* Size: xl */
  "--dz-button-xl-height": "var(--dz-spacing-12)",
  "--dz-button-xl-padding-x": "var(--dz-spacing-8)",
  "--dz-button-xl-font-size": "var(--dz-text-base)",
  "--dz-button-xl-gap": "var(--dz-spacing-2_5)"
}, g = {
  "--dz-card-radius": "var(--dz-radius-lg)",
  "--dz-card-padding": "var(--dz-spacing-6)",
  "--dz-card-shadow": "var(--dz-shadow-sm)",
  "--dz-card-border-width": "1px",
  "--dz-card-border-color": "var(--dz-border)",
  "--dz-card-transition": "box-shadow var(--dz-duration-fast) var(--dz-ease-default)"
}, v = {
  "--dz-codeblock-bg": "var(--dz-surface-raised)",
  "--dz-codeblock-border": "var(--dz-border)",
  "--dz-codeblock-radius": "var(--dz-radius-lg)",
  "--dz-codeblock-padding": "var(--dz-spacing-4)",
  "--dz-codeblock-font-family": "var(--dz-font-mono)",
  "--dz-codeblock-font-size": "var(--dz-text-sm)",
  "--dz-codeblock-line-height": "1.7",
  "--dz-codeblock-text": "var(--dz-foreground)",
  /* ── Header ── */
  "--dz-codeblock-header-bg": "var(--dz-muted)",
  "--dz-codeblock-header-padding-x": "var(--dz-spacing-4)",
  "--dz-codeblock-header-padding-y": "var(--dz-spacing-2)",
  "--dz-codeblock-header-font-size": "var(--dz-text-xs)",
  "--dz-codeblock-header-color": "var(--dz-muted-foreground)",
  /* ── Line Numbers ── */
  "--dz-codeblock-line-number-color": "var(--dz-muted-foreground)",
  "--dz-codeblock-line-number-width": "3rem"
}, m = {
  "--dz-dialog-radius": "var(--dz-radius-xl)",
  "--dz-dialog-padding": "var(--dz-spacing-6)",
  "--dz-dialog-shadow": "var(--dz-shadow-xl)",
  "--dz-dialog-bg": "var(--dz-surface)",
  "--dz-dialog-border-color": "var(--dz-border)",
  "--dz-dialog-overlay-bg": "var(--dz-overlay-bg)",
  "--dz-dialog-z-index": "var(--dz-z-modal)",
  "--dz-dialog-overlay-z-index": "var(--dz-z-modal-backdrop)",
  "--dz-dialog-transition": "all var(--dz-duration-normal) var(--dz-ease-out)",
  /* Sizes */
  "--dz-dialog-sm-max-width": "24rem",
  "--dz-dialog-md-max-width": "28rem",
  "--dz-dialog-lg-max-width": "32rem",
  "--dz-dialog-xl-max-width": "36rem",
  "--dz-dialog-full-max-width": "100vw"
}, p = {
  "--dz-input-radius": "var(--dz-radius-md)",
  "--dz-input-font-size": "var(--dz-text-sm)",
  "--dz-input-font-family": "var(--dz-font-sans)",
  "--dz-input-transition": "border-color var(--dz-duration-fast) var(--dz-ease-default), box-shadow var(--dz-duration-fast) var(--dz-ease-default)",
  "--dz-input-focus-ring-width": "1px",
  "--dz-input-focus-ring-color": "var(--dz-ring)",
  "--dz-input-focus-ring-offset": "1px",
  "--dz-input-disabled-opacity": "0.5",
  /* Size: sm */
  "--dz-input-sm-height": "var(--dz-spacing-8)",
  "--dz-input-sm-padding-x": "var(--dz-spacing-2_5)",
  "--dz-input-sm-font-size": "var(--dz-text-xs)",
  /* Size: md */
  "--dz-input-md-height": "var(--dz-spacing-9)",
  "--dz-input-md-padding-x": "var(--dz-spacing-3)",
  "--dz-input-md-font-size": "var(--dz-text-sm)",
  /* Size: lg */
  "--dz-input-lg-height": "var(--dz-spacing-10)",
  "--dz-input-lg-padding-x": "var(--dz-spacing-3_5)",
  "--dz-input-lg-font-size": "var(--dz-text-base)"
}, b = {
  /* ── Layout ── */
  "--dz-sidebar-width": "16rem",
  "--dz-sidebar-collapsed-width": "4rem",
  "--dz-sidebar-z-index": "var(--dz-z-sticky)",
  "--dz-sidebar-transition": "width var(--dz-duration-normal) var(--dz-ease-default)",
  /* ── Surfaces ── */
  "--dz-sidebar-bg": "var(--dz-surface)",
  "--dz-sidebar-border": "var(--dz-border)",
  /* ── Text ── */
  "--dz-sidebar-text": "var(--dz-muted-foreground)",
  "--dz-sidebar-text-hover": "var(--dz-foreground)",
  /* ── Item ── */
  "--dz-sidebar-item-radius": "var(--dz-radius-md)",
  "--dz-sidebar-item-padding-x": "var(--dz-spacing-3)",
  "--dz-sidebar-item-padding-y": "var(--dz-spacing-2)",
  "--dz-sidebar-item-gap": "var(--dz-spacing-3)",
  "--dz-sidebar-item-font-size": "var(--dz-text-sm)",
  "--dz-sidebar-item-font-weight": "500",
  /* ── Item: Hover ── */
  "--dz-sidebar-item-hover-bg": "var(--dz-accent)",
  "--dz-sidebar-item-hover-text": "var(--dz-accent-foreground)",
  /* ── Item: Active ── */
  "--dz-sidebar-item-active-bg": "var(--dz-primary)",
  "--dz-sidebar-item-active-text": "var(--dz-primary-foreground)",
  /* ── Section ── */
  "--dz-sidebar-section-padding-y": "var(--dz-spacing-2)",
  "--dz-sidebar-section-title-font-size": "var(--dz-text-xs)",
  "--dz-sidebar-section-title-font-weight": "600",
  "--dz-sidebar-section-title-color": "var(--dz-muted-foreground)",
  "--dz-sidebar-section-title-padding-x": "var(--dz-spacing-3)",
  "--dz-sidebar-section-title-letter-spacing": "0.05em",
  "--dz-sidebar-section-title-text-transform": "uppercase",
  /* ── Header & Footer ── */
  "--dz-sidebar-header-padding": "var(--dz-spacing-4)",
  "--dz-sidebar-header-border": "var(--dz-border)",
  "--dz-sidebar-footer-padding": "var(--dz-spacing-4)",
  "--dz-sidebar-footer-border": "var(--dz-border)",
  /* ── Mobile overlay ── */
  "--dz-sidebar-overlay-bg": "var(--dz-overlay-bg)",
  "--dz-sidebar-overlay-z-index": "var(--dz-z-modal-backdrop)"
}, h = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
}, s = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950], n = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.68,
  500: 0.55,
  600: 0.47,
  700: 0.39,
  800: 0.31,
  900: 0.23,
  950: 0.15
}, t = {
  50: 0.12,
  100: 0.22,
  200: 0.4,
  300: 0.62,
  400: 0.82,
  500: 1,
  600: 0.94,
  700: 0.82,
  800: 0.68,
  900: 0.52,
  950: 0.36
}, a = {
  primary: { chroma: 0.18, hue: 260 },
  secondary: { chroma: 0.12, hue: 290 },
  neutral: { chroma: 0.01, hue: 260 },
  success: { chroma: 0.16, hue: 145 },
  warning: { chroma: 0.16, hue: 85 },
  danger: { chroma: 0.2, hue: 25 },
  info: { chroma: 0.14, hue: 230 }
};
function c(r, d) {
  return {
    lightness: n[d],
    chroma: r.chroma * t[d],
    hue: r.hue
  };
}
function o(r) {
  const d = {};
  for (const e of s)
    d[e] = c(r, e);
  return d;
}
function x(r) {
  const d = r.lightness.toFixed(3), e = r.chroma.toFixed(4), z = r.hue.toFixed(1);
  return `oklch(${d} ${e} ${z})`;
}
const f = {
  primary: o(a.primary),
  secondary: o(a.secondary),
  neutral: o(a.neutral),
  success: o(a.success),
  warning: o(a.warning),
  danger: o(a.danger),
  info: o(a.info)
}, k = {
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px"
}, y = {
  none: "none",
  xs: "0 1px 2px oklch(0 0 0 / 0.04)",
  sm: "0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)",
  md: "0 4px 6px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)",
  lg: "0 10px 15px oklch(0 0 0 / 0.08), 0 4px 6px oklch(0 0 0 / 0.04)",
  xl: "0 20px 25px oklch(0 0 0 / 0.1), 0 8px 10px oklch(0 0 0 / 0.04)",
  "2xl": "0 25px 50px oklch(0 0 0 / 0.15)",
  inner: "inset 0 2px 4px oklch(0 0 0 / 0.05)"
}, w = {
  none: "none",
  xs: "0 1px 2px oklch(0 0 0 / 0.1)",
  sm: "0 1px 3px oklch(0 0 0 / 0.15), 0 1px 2px oklch(0 0 0 / 0.1)",
  md: "0 4px 6px oklch(0 0 0 / 0.15), 0 2px 4px oklch(0 0 0 / 0.1)",
  lg: "0 10px 15px oklch(0 0 0 / 0.2), 0 4px 6px oklch(0 0 0 / 0.1)",
  xl: "0 20px 25px oklch(0 0 0 / 0.25), 0 8px 10px oklch(0 0 0 / 0.1)",
  "2xl": "0 25px 50px oklch(0 0 0 / 0.35)",
  inner: "inset 0 2px 4px oklch(0 0 0 / 0.15)"
}, S = {
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem"
}, E = {
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms"
}, _ = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
}, T = {
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace"
}, A = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
  "7xl": "4.5rem",
  "8xl": "6rem",
  "9xl": "8rem"
}, N = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2"
}, I = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900"
}, O = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em"
}, L = {
  base: "0",
  dropdown: "1000",
  sticky: "1020",
  fixed: "1030",
  "modal-backdrop": "1040",
  modal: "1050",
  popover: "1060",
  tooltip: "1070",
  toast: "1080"
}, C = {
  /* ── Surfaces ── */
  "--dz-background": "var(--dz-colors-neutral-950)",
  "--dz-foreground": "var(--dz-colors-neutral-50)",
  "--dz-surface": "var(--dz-colors-neutral-900)",
  "--dz-surface-raised": "var(--dz-colors-neutral-800)",
  "--dz-muted": "var(--dz-colors-neutral-800)",
  "--dz-muted-foreground": "var(--dz-colors-neutral-400)",
  /* ── Borders ── */
  "--dz-border": "var(--dz-colors-neutral-700)",
  "--dz-border-hover": "var(--dz-colors-neutral-600)",
  "--dz-ring": "var(--dz-colors-primary-400)",
  /* ── Primary ── */
  "--dz-primary": "var(--dz-colors-primary-400)",
  "--dz-primary-foreground": "var(--dz-colors-primary-950)",
  "--dz-primary-hover": "var(--dz-colors-primary-300)",
  "--dz-primary-muted": "var(--dz-colors-primary-900)",
  "--dz-primary-muted-foreground": "var(--dz-colors-primary-300)",
  /* ── Secondary ── */
  "--dz-secondary": "var(--dz-colors-secondary-400)",
  "--dz-secondary-foreground": "var(--dz-colors-secondary-950)",
  "--dz-secondary-hover": "var(--dz-colors-secondary-300)",
  "--dz-secondary-muted": "var(--dz-colors-secondary-900)",
  "--dz-secondary-muted-foreground": "var(--dz-colors-secondary-300)",
  /* ── Accent ── */
  "--dz-accent": "var(--dz-colors-neutral-800)",
  "--dz-accent-foreground": "var(--dz-colors-neutral-50)",
  /* ── Destructive ── */
  "--dz-destructive": "var(--dz-colors-danger-400)",
  "--dz-destructive-foreground": "var(--dz-colors-danger-950)",
  /* ── Status: Success ── */
  "--dz-success": "var(--dz-colors-success-400)",
  "--dz-success-foreground": "var(--dz-colors-success-950)",
  "--dz-success-muted": "var(--dz-colors-success-900)",
  "--dz-success-muted-foreground": "var(--dz-colors-success-300)",
  /* ── Status: Warning ── */
  "--dz-warning": "var(--dz-colors-warning-400)",
  "--dz-warning-foreground": "var(--dz-colors-neutral-900)",
  "--dz-warning-muted": "var(--dz-colors-warning-900)",
  "--dz-warning-muted-foreground": "var(--dz-colors-warning-300)",
  /* ── Status: Danger ── */
  "--dz-danger": "var(--dz-colors-danger-400)",
  "--dz-danger-foreground": "var(--dz-colors-danger-950)",
  "--dz-danger-muted": "var(--dz-colors-danger-900)",
  "--dz-danger-muted-foreground": "var(--dz-colors-danger-300)",
  /* ── Status: Info ── */
  "--dz-info": "var(--dz-colors-info-400)",
  "--dz-info-foreground": "var(--dz-colors-info-950)",
  "--dz-info-muted": "var(--dz-colors-info-900)",
  "--dz-info-muted-foreground": "var(--dz-colors-info-300)",
  /* ── Input ── */
  "--dz-input-bg": "var(--dz-colors-neutral-800)",
  "--dz-input-border": "var(--dz-colors-neutral-600)",
  "--dz-input-border-focus": "var(--dz-colors-primary-400)",
  "--dz-input-placeholder": "var(--dz-colors-neutral-500)",
  /* ── Card ── */
  "--dz-card": "var(--dz-colors-neutral-900)",
  "--dz-card-foreground": "var(--dz-colors-neutral-50)",
  /* ── Popover ── */
  "--dz-popover": "var(--dz-colors-neutral-900)",
  "--dz-popover-foreground": "var(--dz-colors-neutral-50)",
  /* ── Overlay ── */
  "--dz-overlay-bg": "oklch(0 0 0 / 0.7)",
  /* ── Sidebar ── */
  "--dz-sidebar-bg": "var(--dz-colors-neutral-950)",
  "--dz-sidebar-foreground": "var(--dz-colors-neutral-400)",
  "--dz-sidebar-border": "var(--dz-colors-neutral-800)",
  "--dz-sidebar-heading": "var(--dz-colors-neutral-500)",
  "--dz-sidebar-item-hover-bg": "var(--dz-colors-neutral-800)",
  "--dz-sidebar-item-hover-text": "var(--dz-colors-neutral-50)",
  "--dz-sidebar-item-active-bg": "var(--dz-colors-primary-500)",
  "--dz-sidebar-item-active-text": "oklch(1 0 0)",
  "--dz-sidebar-header-bg": "oklch(0 0 0)",
  "--dz-sidebar-footer-bg": "oklch(0 0 0)",
  /* ── AppShell ── */
  "--dz-appshell-header-bg": "var(--dz-colors-neutral-900)",
  "--dz-appshell-header-border": "var(--dz-colors-neutral-700)",
  "--dz-appshell-main-bg": "var(--dz-colors-neutral-950)",
  /* ── CodeBlock ── */
  "--dz-codeblock-bg": "var(--dz-colors-neutral-950)",
  "--dz-codeblock-text": "var(--dz-colors-neutral-100)",
  "--dz-codeblock-border": "var(--dz-colors-neutral-800)",
  "--dz-codeblock-header-bg": "var(--dz-colors-neutral-900)",
  "--dz-codeblock-header-text": "var(--dz-colors-neutral-500)",
  "--dz-codeblock-line-number": "var(--dz-colors-neutral-700)",
  /* ── Chart Colors (shifted lighter for dark bg) ── */
  "--dz-chart-1": "var(--dz-colors-primary-400)",
  "--dz-chart-2": "var(--dz-colors-secondary-400)",
  "--dz-chart-3": "var(--dz-colors-success-400)",
  "--dz-chart-4": "var(--dz-colors-warning-400)",
  "--dz-chart-5": "var(--dz-colors-danger-400)",
  /* ── Orchestration run status ── */
  "--dz-status-pending": "var(--dz-muted-foreground)",
  "--dz-status-running": "var(--dz-info)",
  "--dz-status-paused": "var(--dz-warning)",
  "--dz-status-completed": "var(--dz-success)",
  "--dz-status-failed": "var(--dz-danger)",
  "--dz-status-cancelled": "var(--dz-muted-foreground)",
  /* ── Progress thresholds (token-usage bars) ── */
  "--dz-progress-amber": "var(--dz-warning)",
  "--dz-progress-red": "var(--dz-danger)"
}, K = {
  /* ── Surfaces ── */
  "--dz-background": "var(--dz-colors-neutral-50)",
  "--dz-foreground": "var(--dz-colors-neutral-900)",
  "--dz-surface": "oklch(1 0 0)",
  "--dz-surface-raised": "var(--dz-colors-neutral-50)",
  "--dz-muted": "var(--dz-colors-neutral-100)",
  "--dz-muted-foreground": "var(--dz-colors-neutral-500)",
  /* ── Borders ── */
  "--dz-border": "var(--dz-colors-neutral-200)",
  "--dz-border-hover": "var(--dz-colors-neutral-300)",
  "--dz-ring": "var(--dz-colors-primary-500)",
  /* ── Primary ── */
  "--dz-primary": "var(--dz-colors-primary-500)",
  "--dz-primary-foreground": "oklch(1 0 0)",
  "--dz-primary-hover": "var(--dz-colors-primary-600)",
  "--dz-primary-muted": "var(--dz-colors-primary-100)",
  "--dz-primary-muted-foreground": "var(--dz-colors-primary-700)",
  /* ── Secondary ── */
  "--dz-secondary": "var(--dz-colors-secondary-500)",
  "--dz-secondary-foreground": "oklch(1 0 0)",
  "--dz-secondary-hover": "var(--dz-colors-secondary-600)",
  "--dz-secondary-muted": "var(--dz-colors-secondary-100)",
  "--dz-secondary-muted-foreground": "var(--dz-colors-secondary-700)",
  /* ── Accent ── */
  "--dz-accent": "var(--dz-colors-neutral-100)",
  "--dz-accent-foreground": "var(--dz-colors-neutral-900)",
  /* ── Destructive ── */
  "--dz-destructive": "var(--dz-colors-danger-500)",
  "--dz-destructive-foreground": "oklch(1 0 0)",
  /* ── Status: Success ── */
  "--dz-success": "var(--dz-colors-success-500)",
  "--dz-success-foreground": "oklch(1 0 0)",
  "--dz-success-muted": "var(--dz-colors-success-100)",
  "--dz-success-muted-foreground": "var(--dz-colors-success-700)",
  /* ── Status: Warning ── */
  "--dz-warning": "var(--dz-colors-warning-500)",
  "--dz-warning-foreground": "var(--dz-colors-neutral-900)",
  "--dz-warning-muted": "var(--dz-colors-warning-100)",
  "--dz-warning-muted-foreground": "var(--dz-colors-warning-700)",
  /* ── Status: Danger ── */
  "--dz-danger": "var(--dz-colors-danger-500)",
  "--dz-danger-foreground": "oklch(1 0 0)",
  "--dz-danger-muted": "var(--dz-colors-danger-100)",
  "--dz-danger-muted-foreground": "var(--dz-colors-danger-700)",
  /* ── Status: Info ── */
  "--dz-info": "var(--dz-colors-info-500)",
  "--dz-info-foreground": "oklch(1 0 0)",
  "--dz-info-muted": "var(--dz-colors-info-100)",
  "--dz-info-muted-foreground": "var(--dz-colors-info-700)",
  /* ── Input ── */
  "--dz-input-bg": "oklch(1 0 0)",
  "--dz-input-border": "var(--dz-colors-neutral-300)",
  "--dz-input-border-focus": "var(--dz-colors-primary-500)",
  "--dz-input-placeholder": "var(--dz-colors-neutral-400)",
  /* ── Card ── */
  "--dz-card": "oklch(1 0 0)",
  "--dz-card-foreground": "var(--dz-colors-neutral-900)",
  /* ── Popover ── */
  "--dz-popover": "oklch(1 0 0)",
  "--dz-popover-foreground": "var(--dz-colors-neutral-900)",
  /* ── Overlay ── */
  "--dz-overlay-bg": "oklch(0 0 0 / 0.5)",
  /* ── Sidebar ── */
  "--dz-sidebar-bg": "var(--dz-colors-neutral-900)",
  "--dz-sidebar-foreground": "var(--dz-colors-neutral-300)",
  "--dz-sidebar-border": "var(--dz-colors-neutral-800)",
  "--dz-sidebar-heading": "var(--dz-colors-neutral-400)",
  "--dz-sidebar-item-hover-bg": "var(--dz-colors-neutral-800)",
  "--dz-sidebar-item-hover-text": "var(--dz-colors-neutral-100)",
  "--dz-sidebar-item-active-bg": "var(--dz-colors-primary-600)",
  "--dz-sidebar-item-active-text": "oklch(1 0 0)",
  "--dz-sidebar-header-bg": "var(--dz-colors-neutral-950)",
  "--dz-sidebar-footer-bg": "var(--dz-colors-neutral-950)",
  /* ── AppShell ── */
  "--dz-appshell-header-bg": "oklch(1 0 0)",
  "--dz-appshell-header-border": "var(--dz-colors-neutral-200)",
  "--dz-appshell-main-bg": "var(--dz-colors-neutral-50)",
  /* ── CodeBlock ── */
  "--dz-codeblock-bg": "var(--dz-colors-neutral-900)",
  "--dz-codeblock-text": "var(--dz-colors-neutral-100)",
  "--dz-codeblock-border": "var(--dz-colors-neutral-800)",
  "--dz-codeblock-header-bg": "var(--dz-colors-neutral-800)",
  "--dz-codeblock-header-text": "var(--dz-colors-neutral-400)",
  "--dz-codeblock-line-number": "var(--dz-colors-neutral-600)",
  /* ── Chart Colors ── */
  "--dz-chart-1": "var(--dz-colors-primary-500)",
  "--dz-chart-2": "var(--dz-colors-secondary-500)",
  "--dz-chart-3": "var(--dz-colors-success-500)",
  "--dz-chart-4": "var(--dz-colors-warning-500)",
  "--dz-chart-5": "var(--dz-colors-danger-500)",
  /* ── Orchestration run status ── */
  "--dz-status-pending": "var(--dz-muted-foreground)",
  "--dz-status-running": "var(--dz-info)",
  "--dz-status-paused": "var(--dz-warning)",
  "--dz-status-completed": "var(--dz-success)",
  "--dz-status-failed": "var(--dz-danger)",
  "--dz-status-cancelled": "var(--dz-muted-foreground)",
  /* ── Progress thresholds (token-usage bars) ── */
  "--dz-progress-amber": "var(--dz-warning)",
  "--dz-progress-red": "var(--dz-danger)"
};
export {
  l as APPSHELL_TOKENS,
  i as BADGE_TOKENS,
  h as BREAKPOINTS,
  u as BUTTON_TOKENS,
  g as CARD_TOKENS,
  v as CODEBLOCK_TOKENS,
  C as DARK_SEMANTIC_TOKENS,
  m as DIALOG_TOKENS,
  E as DURATIONS,
  _ as EASINGS,
  T as FONT_FAMILIES,
  A as FONT_SIZES,
  I as FONT_WEIGHTS,
  p as INPUT_TOKENS,
  O as LETTER_SPACINGS,
  K as LIGHT_SEMANTIC_TOKENS,
  N as LINE_HEIGHTS,
  a as PALETTE_CONFIGS,
  k as RADIUS_SCALE,
  s as SHADE_STEPS,
  y as SHADOW_SCALE,
  w as SHADOW_SCALE_DARK,
  b as SIDEBAR_TOKENS,
  S as SPACING_SCALE,
  L as Z_INDEX_SCALE,
  x as formatOklch,
  f as palettes
};
