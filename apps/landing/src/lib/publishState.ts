/**
 * publishState — the one switch that says whether the `@dzup-ui/*` packages are
 * on npm yet, and the one sentence the site says while they are not.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * The site already had this standard, it just wasn't shared. `useLiveStats`
 * gates its browser refresh behind an env flag because the GitHub/npm endpoints
 * 404 until publish; `Footer.vue` ships no npm-backed shields badge for the same
 * reason; `config.ts` keeps `TESTIMONIALS` empty rather than inventing one. The
 * rule underneath all three: **an unpublished capability is not advertised, and
 * no CTA may end in a 404.**
 *
 * Two surfaces predated that rule and still ended in `npm install` failures:
 *   • "Open in StackBlitz" (blocks + templates) forked a project whose
 *     `package.json` pins `@dzup-ui/core|tokens|contracts` to a published range
 *     that does not exist — the WebContainer boots, `npm install` 404s, and the
 *     visitor's first hands-on impression of the library is a red install log.
 *   • `/ai` handed out copy-paste MCP configs running `npx -y @dzup-ui/mcp` —
 *     also unpublished, so the client fails to start the server.
 * Both were reachable from primary CTAs. They now read this flag.
 *
 * ── The contract ────────────────────────────────────────────────────────────
 * Set `VITE_PACKAGES_PUBLISHED=true` in the build environment the moment the
 * v0.1 packages are live on npm, and every gated surface turns on at once — no
 * code change, nothing to remember, nothing left behind claiming otherwise.
 * (Flip `VITE_ENABLE_LIVE_STATS` in the same breath: it gates the stars/downloads
 * refresh against the same publish event.)
 *
 * Read through a FUNCTION, not a module-level const, so a test can drive both
 * states with `vi.stubEnv` and no module-graph reset.
 */

/** `true` once the `@dzup-ui/*` packages resolve on npm. Build-time flag. */
export function packagesPublished(): boolean {
  return import.meta.env.VITE_PACKAGES_PUBLISHED === 'true'
}

/**
 * The inline note shown where a package-dependent action would be. States the
 * fact (not on npm yet) and what unblocks it — never dressed up as a feature.
 */
export const UNPUBLISHED_NOTE
  = 'Available at the v0.1 npm publish — the @dzup-ui packages aren’t on npm yet, '
    + 'so an install would fail. Copy the source or browse the repo in the meantime.'
