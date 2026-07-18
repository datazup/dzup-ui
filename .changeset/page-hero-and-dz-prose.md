---
'@dzup-ui/core': minor
'@dzup-ui/tokens': minor
---

New `DzPageHero` layout component + `.dz-prose` rich-content styles.

**DzPageHero** — dark gradient hero band for top-level views (eyebrow,
gradient h1, description, meta row, glass-treated actions cluster), extracted
from docs-app's `DocsPageHero` so every app on the neural-indigo preset can
share the band. Styling keys off the new `PAGE_HERO_TOKENS`
(`--dz-page-hero-*`) in `@dzup-ui/tokens`, with `--dz-auth-brand-*` fallbacks.

**.dz-prose** — typography for rendered rich content (markdown → sanitized
HTML), ported from docs-app's `.docs-prose` and shipped unlayered in
`dist/core.css` via base.css.
