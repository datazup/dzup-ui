/**
 * Sample content for the Blog Index template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). Post cover artwork is an
 * inline SVG data-URI painted from resolved `--dz-*` tokens at runtime, so the
 * source carries NO raw hex and the thumbnails re-theme with the page.
 */

/** A post summary rendered as a card in the grid (and the featured hero). */
export interface Post {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  initials: string
  date: string
  readingTime: string
  /** Hue offset (degrees) so each cover reads as a distinct piece of art. */
  hue: number
}

export const CATEGORIES: string[] = [
  'All',
  'Engineering',
  'Design',
  'Accessibility',
  'Process',
]

export const FEATURED: Post = {
  slug: 'design-tokens-first-principles',
  title: 'Stop hardcoding colors: design tokens from first principles',
  excerpt:
    'Why every value in a modern UI — color, radius, shadow, type — should resolve through a named token, and how that one decision unlocks effortless theming.',
  category: 'Engineering',
  author: 'Esmir Isić',
  initials: 'EI',
  date: 'Jun 25, 2026',
  readingTime: '8 min read',
  hue: 0,
}

export const POSTS: Post[] = [
  {
    slug: 'dark-mode-without-tears',
    title: 'Dark mode without tears: a single source of truth',
    excerpt:
      'Treat dark mode as a side effect of well-named tokens, not a feature you bolt on per component.',
    category: 'Theming',
    author: 'Mara Petrović',
    initials: 'MP',
    date: 'Jun 21, 2026',
    readingTime: '6 min read',
    hue: 40,
  },
  {
    slug: 'accessible-color-systems',
    title: 'Accessible color systems that still look good',
    excerpt:
      'Contrast ratios are a constraint, not a compromise. A workflow for palettes that pass AA without going grey.',
    category: 'Accessibility',
    author: 'Liam Novak',
    initials: 'LN',
    date: 'Jun 18, 2026',
    readingTime: '9 min read',
    hue: 90,
  },
  {
    slug: 'shipping-a-design-system',
    title: 'Shipping a design system your team actually adopts',
    excerpt:
      'Adoption is a distribution problem. How to make the right component the path of least resistance.',
    category: 'Process',
    author: 'Sofia Adeyemi',
    initials: 'SA',
    date: 'Jun 14, 2026',
    readingTime: '11 min read',
    hue: 150,
  },
  {
    slug: 'composing-not-configuring',
    title: 'Composing, not configuring: the slot-first mindset',
    excerpt:
      'When a component grows a tenth boolean prop, it is asking to be a set of slots instead.',
    category: 'Design',
    author: 'Noah Bergström',
    initials: 'NB',
    date: 'Jun 10, 2026',
    readingTime: '7 min read',
    hue: 210,
  },
  {
    slug: 'motion-with-restraint',
    title: 'Motion with restraint: animation that respects the user',
    excerpt:
      'A small motion budget, honoured reduced-motion preferences, and transitions that explain rather than decorate.',
    category: 'Design',
    author: 'Ana Costa',
    initials: 'AC',
    date: 'Jun 6, 2026',
    readingTime: '5 min read',
    hue: 280,
  },
  {
    slug: 'testing-components-confidently',
    title: 'Testing components with confidence, not ceremony',
    excerpt:
      'Contract tests pin the behavior that matters and free you to refactor the rest without fear.',
    category: 'Engineering',
    author: 'Esmir Isić',
    initials: 'EI',
    date: 'Jun 2, 2026',
    readingTime: '10 min read',
    hue: 330,
  },
]

// ---------------------------------------------------------------------------
// Token-painted artwork (keeps the template asset-free and theme-aware)
// ---------------------------------------------------------------------------

/** Palette resolved from live `--dz-*` tokens; passed to the cover painter. */
export interface CoverPalette {
  bg: string
  panel: string
  primary: string
  line: string
}

/**
 * Build a per-post cover thumbnail — layered shapes rotated by `hue` so each
 * card reads as a distinct piece — as an inline SVG data-URI. The `hue` rotates
 * the token-derived primary so covers stay on-theme yet visually varied.
 */
export function buildCover(p: CoverPalette, hue: number): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="Decorative post cover">
  <defs>
    <filter id="h" color-interpolation-filters="sRGB">
      <feColorMatrix type="hueRotate" values="${hue}"/>
    </filter>
  </defs>
  <rect width="640" height="360" fill="${p.bg}"/>
  <g filter="url(#h)">
    <circle cx="500" cy="90" r="150" fill="${p.primary}" opacity="0.22"/>
    <rect x="60" y="120" width="260" height="170" rx="20" fill="${p.panel}" stroke="${p.line}"/>
    <rect x="90" y="150" width="120" height="16" rx="8" fill="${p.primary}"/>
    <rect x="90" y="182" width="200" height="10" rx="5" fill="${p.line}"/>
    <rect x="90" y="202" width="170" height="10" rx="5" fill="${p.line}"/>
    <rect x="90" y="236" width="70" height="30" rx="8" fill="${p.primary}"/>
    <circle cx="470" cy="250" r="64" fill="none" stroke="${p.primary}" stroke-width="12" opacity="0.7"/>
  </g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
