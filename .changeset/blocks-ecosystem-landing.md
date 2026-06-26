---
"@dzup-ui/landing": minor
---

Ship the **Blocks** ecosystem surface in the landing app (`apps/landing`).

This activates the previously "Planned" Blocks tile into a live `/blocks` catalog:

- **Display infrastructure (Phase A):** new `/blocks` route + `BlocksIndexPage`, a typed
  block registry (`src/blocks/registry.ts`) that pairs each block's lazily-loaded component
  with its exact `?raw` source (zero preview/code drift), the `BlockPreview` shell
  (Preview/Code tabs, viewport resizer, copy), `BlockCard` + `BlockCategoryNav`, "Built from"
  component chips, and per-route SEO/meta. The Ecosystem tile is now `status: 'available'`
  linking to `/blocks`, with matching nav + footer links.
- **Quality gates (Phase C):** a Vitest registry guard (`registry.spec.ts`) that fails loudly
  if a block advertises a `@dzup-ui/core` component that does not exist, plus the a11y /
  responsive / reduced-motion audit.
- **Catalog (Phase B, in progress):** one reference block live — `hero-centered` (Marketing) —
  composed purely from free `@dzup-ui/core` components and `--dz-*` tokens, validating the
  end-to-end pipeline. The remaining MVP and full catalog blocks are fast-follows.

No published `@dzup-ui/*` library package changes — this is a private app and is versioned for
changelog purposes only (it is never published to npm).
