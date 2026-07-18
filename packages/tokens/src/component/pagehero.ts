/**
 * Page Hero Component Tokens
 *
 * Dark gradient hero band for top-level views. Values ported from
 * docs-app's docs-theme.css; `--dz-auth-brand-*` fallbacks keep the
 * neural-indigo preset driving the look when present.
 */

export const PAGE_HERO_TOKENS: Record<string, string> = {
  '--dz-page-hero-accent': 'oklch(0.62 0.18 305)',
  '--dz-page-hero-bg':
    'var(--dz-auth-brand-bg, linear-gradient(160deg, oklch(0.24 0.07 286) 0%, oklch(0.18 0.05 282) 55%, oklch(0.14 0.04 280) 100%))',
  '--dz-page-hero-overlay':
    'radial-gradient(36rem 18rem at 88% -30%, var(--dz-auth-brand-glow-strong, oklch(0.55 0.19 275 / 0.4)), transparent 70%), radial-gradient(30rem 16rem at 4% 130%, var(--dz-auth-brand-glow-soft, oklch(0.6 0.18 300 / 0.22)), transparent 70%), linear-gradient(oklch(1 0 0 / 0.045) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.045) 1px, transparent 1px)',
  '--dz-page-hero-title-gradient':
    'linear-gradient(120deg, oklch(0.99 0.005 280) 30%, oklch(0.85 0.06 292) 100%)',
  '--dz-page-hero-title-size': 'clamp(1.75rem, 3vw, 2.375rem)',
  '--dz-page-hero-eyebrow-foreground': 'oklch(0.82 0.08 295 / 0.9)',
  '--dz-page-hero-desc-foreground': 'oklch(0.93 0.02 285 / 0.75)',
  '--dz-page-hero-meta-foreground': 'oklch(0.9 0.03 290 / 0.8)',
  '--dz-page-hero-action-border': 'oklch(1 0 0 / 0.28)',
  '--dz-page-hero-action-bg': 'oklch(1 0 0 / 0.14)',
  '--dz-page-hero-action-bg-hover': 'oklch(1 0 0 / 0.24)',
  '--dz-page-hero-action-foreground': 'oklch(0.99 0 0)',
  '--dz-page-hero-action-shadow': '0 10px 24px oklch(0.12 0.05 280 / 0.35)',
  '--dz-page-hero-radius': 'var(--dz-radius-lg)',
  '--dz-page-hero-padding': 'clamp(var(--dz-spacing-5), 3vw, var(--dz-spacing-8))',
  '--dz-page-hero-gap': 'var(--dz-spacing-5)',
}
