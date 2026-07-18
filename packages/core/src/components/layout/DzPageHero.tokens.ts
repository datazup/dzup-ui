/**
 * DzPageHero -- anatomy-to-token mapping.
 *
 * Custom-prop indirection for the page-hero anatomy; canonical values live
 * in `@dzup-ui/tokens` (`PAGE_HERO_TOKENS`).
 */

export const pageHeroTokens = {
  background: 'var(--dz-page-hero-bg)',
  overlay: 'var(--dz-page-hero-overlay)',
  radius: 'var(--dz-page-hero-radius)',
  padding: 'var(--dz-page-hero-padding)',
  gap: 'var(--dz-page-hero-gap)',
  titleGradient: 'var(--dz-page-hero-title-gradient)',
  titleSize: 'var(--dz-page-hero-title-size)',
  eyebrowForeground: 'var(--dz-page-hero-eyebrow-foreground)',
  descForeground: 'var(--dz-page-hero-desc-foreground)',
  metaForeground: 'var(--dz-page-hero-meta-foreground)',
  actionBorder: 'var(--dz-page-hero-action-border)',
  actionBackground: 'var(--dz-page-hero-action-bg)',
  actionBackgroundHover: 'var(--dz-page-hero-action-bg-hover)',
  actionForeground: 'var(--dz-page-hero-action-foreground)',
  actionShadow: 'var(--dz-page-hero-action-shadow)',
} as const
