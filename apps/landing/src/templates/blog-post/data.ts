/**
 * Sample content for the Blog Post / Article template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). The cover and inline figure
 * are inline SVG data-URIs painted from resolved `--dz-*` tokens at runtime, so
 * the source carries NO raw hex and the artwork re-themes with the page.
 */

/** A table-of-contents / in-page anchor entry mirrored by the body headings. */
export interface TocItem {
  href: string
  label: string
}

export const TOC: TocItem[] = [
  { href: '#intro', label: 'Why tokens, not hex' },
  { href: '#anatomy', label: 'The anatomy of a token' },
  { href: '#theming', label: 'Theming in one layer' },
  { href: '#code', label: 'Wiring it up' },
  { href: '#closing', label: 'Where to go next' },
]

/** A "Continue reading" related-post card. */
export interface RelatedPost {
  slug: string
  title: string
  category: string
  readingTime: string
}

export const RELATED: RelatedPost[] = [
  {
    slug: 'dark-mode-without-tears',
    title: 'Dark mode without tears: a single source of truth',
    category: 'Theming',
    readingTime: '6 min read',
  },
  {
    slug: 'accessible-color-systems',
    title: 'Accessible color systems that still look good',
    category: 'Accessibility',
    readingTime: '9 min read',
  },
  {
    slug: 'shipping-a-design-system',
    title: 'Shipping a design system your team actually adopts',
    category: 'Process',
    readingTime: '11 min read',
  },
]

/** The example snippet rendered in the article body via DzCodeBlock. */
export const SAMPLE_CODE = `:root {
  --dz-primary: oklch(0.62 0.19 264);
  --dz-radius-lg: 0.625rem;
}

[data-theme='dark'] {
  /* Same names, new values — nothing else changes. */
  --dz-primary: oklch(0.72 0.16 264);
}

.button {
  background: var(--dz-primary);
  border-radius: var(--dz-radius-lg);
}`

// ---------------------------------------------------------------------------
// Token-painted artwork (keeps the template asset-free and theme-aware)
// ---------------------------------------------------------------------------

/** Palette resolved from live `--dz-*` tokens; passed to the SVG painters. */
export interface CoverPalette {
  bg: string
  panel: string
  primary: string
  accent: string
  line: string
}

/**
 * Build the wide article cover — overlapping editorial shapes — as an inline
 * SVG data-URI from a resolved token palette.
 */
export function buildCover(p: CoverPalette): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="img" aria-label="Abstract editorial cover artwork">
  <rect width="1200" height="600" fill="${p.bg}"/>
  <circle cx="930" cy="180" r="260" fill="${p.primary}" opacity="0.16"/>
  <circle cx="1060" cy="430" r="180" fill="${p.accent}" opacity="0.20"/>
  <rect x="120" y="150" width="420" height="300" rx="24" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="156" y="194" width="190" height="20" rx="10" fill="${p.primary}"/>
  <rect x="156" y="232" width="320" height="12" rx="6" fill="${p.line}"/>
  <rect x="156" y="258" width="290" height="12" rx="6" fill="${p.line}"/>
  <rect x="156" y="284" width="310" height="12" rx="6" fill="${p.line}"/>
  <g fill="${p.primary}">
    <rect x="156" y="338" width="84" height="64" rx="12" opacity="0.9"/>
    <rect x="252" y="338" width="84" height="64" rx="12" opacity="0.55"/>
    <rect x="348" y="338" width="84" height="64" rx="12" opacity="0.3"/>
  </g>
  <circle cx="690" cy="300" r="92" fill="none" stroke="${p.accent}" stroke-width="14" opacity="0.8"/>
</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

/**
 * Build the narrower in-body figure (a faux component preview) as an inline SVG
 * data-URI — used to break up the long-form text.
 */
export function buildFigure(p: CoverPalette): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" role="img" aria-label="A button rendered in light and dark themes side by side">
  <rect width="1000" height="460" fill="${p.bg}"/>
  <rect x="40" y="40" width="440" height="380" rx="20" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="520" y="40" width="440" height="380" rx="20" fill="${p.line}"/>
  <rect x="120" y="190" width="280" height="80" rx="16" fill="${p.primary}"/>
  <rect x="600" y="190" width="280" height="80" rx="16" fill="${p.accent}"/>
  <rect x="190" y="222" width="140" height="16" rx="8" fill="${p.panel}"/>
  <rect x="670" y="222" width="140" height="16" rx="8" fill="${p.panel}"/>
</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}
