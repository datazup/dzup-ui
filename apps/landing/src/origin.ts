/**
 * The canonical production origin — the one place a dzup-ui URL's host is authored.
 *
 * This module exists so that the origin has exactly one author. It shipped as
 * seven separate literals naming a `.dev` variant of our name that we do not own:
 * that host was stamped into the `homepage` field of every registry index
 * published under `public/r/**`, into the `$schema` of every exported theme file,
 * and into the /themes share-link fallback — while the canonical origin, the one
 * in `index.html`'s `<link rel="canonical">` and in the generated `sitemap.xml`,
 * was this one. A project with two domains has zero domains: every artifact
 * carrying the wrong one is a promise to a future 404, and registry JSON is a
 * distributed artifact — a consumer's `npx shadcn add` bakes whatever we publish
 * into their project, so the wrong host outlives the fix.
 *
 * ── Why this is not in `config.ts` ──────────────────────────────────────────
 * `config.ts` is the site-wide façade, and it imports `generated/components.ts`
 * and `generated/counts.ts`. The registry shapers (`blocks/registryItem.ts`,
 * `blocks/templatesItem.ts`, `gallery/registryItem.ts`) are deliberately
 * runtime-free — they take `BlockDef` as a *type* only so they load in a plain
 * Node/tsx process — and they need nothing from this file but a host string.
 * Importing the whole component index to get one constant would put the generated
 * data in the dependency graph of every build script. So the constant lives here,
 * with no imports of its own, and `config.ts` re-exports it for the site surfaces
 * that already read it from there (`router.ts`, `scripts/build-sitemap.ts`).
 *
 * Anything that needs an absolute dzup-ui URL derives it from `SITE_ORIGIN` —
 * never by retyping the host. `claims.spec.ts` fails the build if the dead host
 * reappears anywhere under `src/` or `public/`.
 *
 * No trailing slash: every caller composes `${SITE_ORIGIN}/path`.
 */
export const SITE_ORIGIN = 'https://dzup-ui.com'
