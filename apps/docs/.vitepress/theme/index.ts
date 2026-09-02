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
 * bundle cost. Both components registered here are small and synchronous — so
 * they render during SSG without `<ClientOnly>` and add nothing to the shared
 * graph — and both defer everything heavy to a dynamic `import()`:
 * `DzPlayground` loads `@vue/repl` inside a click handler, `DzThemeBuilder`
 * loads its panel (and `@dzup-ui/tokens`) on mount.
 *
 * `defineAsyncComponent` was tried here first and **measured**: it grew the
 * shared `framework` chunk by 28,174 B, charged to every page on the site. §7
 * of the handoff has the numbers; the point is that "it's lazy" is a testable
 * claim and this packet tested it rather than asserting it.
 *
 * The stock VitePress theme is still extended rather than replaced — owner
 * decision D1-D6 (the site does not render with `--dz-*` tokens) is untouched
 * here and stated in the handoff.
 */
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import DzPlayground from './components/DzPlayground.vue'
import DzThemeBuilder from './components/DzThemeBuilder.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DzPlayground', DzPlayground)
    app.component('DzThemeBuilder', DzThemeBuilder)
  },
} satisfies Theme
