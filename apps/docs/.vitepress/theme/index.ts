/**
 * VitePress theme entry — TASK-N2-D3.
 *
 * Registers the two components the generated pages and the theme-builder page
 * are allowed to use. This is D1 §15's route taken exactly as offered: markdown
 * compiles to a Vue SFC, so a globally registered component works inside a
 * generated page and the generator emits one tag instead of a script block.
 *
 * **Both are shells, and that is the requirement, not a nicety.**
 * `<performance>` says the site's non-playground pages must not pay the REPL
 * bundle cost. Both components are small and synchronous — so they render
 * during SSG without `<ClientOnly>` and add nothing to the shared graph — and
 * both defer everything heavy to a dynamic `import()`: `DzPlayground` loads
 * `@vue/repl` inside a click handler, `DzThemeBuilder` loads its panel (and
 * `@dzup-ui/tokens`) on mount.
 *
 * `defineAsyncComponent` was tried here first and **measured**: it grew the
 * shared `framework` chunk by 28,174 B, charged to every page on the site. §7
 * of the handoff has the numbers; the point is that "it's lazy" is a testable
 * claim and this packet tested it rather than asserting it.
 *
 * ── Why nothing is registered here any more (TASK-R1-O5, D3-F8) ─────────────
 * Global registration put both components in the shared `theme` chunk, which
 * every page on the site `modulepreload`s — `/guide/getting-started` was
 * loading the playground chrome to render a page with no playground on it. D3
 * measured that and recorded it as **D3-F8**: the isolation requirement was
 * met only because nothing REPL-related is *statically reachable* from the
 * chrome, not because the chrome was absent, so the first static `@vue/repl`
 * import anywhere in `apps/docs` would have turned a 1.3 MB on-demand cost into
 * an every-page cost with no gate in the way.
 *
 * Both components are now imported by the pages that use them — the generated
 * component pages emit a `<script setup>` import (`docs-pages.ts`,
 * `PAGE_COMPONENT_IMPORT_PATH`), and `guide/theme-builder.md` imports its own.
 * One implementation, charged to its readers. This does **not** close D3-F5:
 * VitePress 1.6.4 disables `cssCodeSplit`, so the chrome's CSS is still in the
 * one shared stylesheet however it is registered.
 *
 * This file stays — the stock VitePress theme is still extended rather than
 * replaced, and owner decision D1-D6 (the site does not render with `--dz-*`
 * tokens) is untouched here and stated in the handoff. `enhanceApp` is the seam
 * the next theme-level concern lands in.
 */
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
} satisfies Theme
