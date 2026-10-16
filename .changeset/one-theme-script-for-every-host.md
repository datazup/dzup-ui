---
"@dzup-ui/core": patch
"@dzup-ui/nuxt": patch
"@dzup-ui/tokens": patch
---

**The pre-paint theme script has one implementation, and it honours the provider's options.**

`getThemeScript` now honours a persisted `"system"` preference instead of
replacing it with `defaultTheme`, so a user who chose System in an app whose
default is light no longer sees a light flash on a dark OS. It also accepts
`persist: false` (matching `DzProvider`'s `theme.persist`) and still applies the
default theme when `localStorage` access throws.

Core exports the generator from a new, Vue-free subpath, `@dzup-ui/core/theme-script`
(`./providers` keeps re-exporting it). `@dzup-ui/nuxt` injects
`getThemeScript(options)` from it instead of a hand-copied literal, through a new
`themeScript` module option: Core's script options (`storageKey`, `attribute`,
`defaultTheme`, `persist`, `direction`, `locale`), a `nonce` for nonce-based
Content-Security-Policies, or `false` to inject nothing. `themeScriptCspHash(options)`
returns the `'sha256-…'` source for hash-based policies.

`@dzup-ui/tokens/utils`' `themeScript` literal is deprecated in favour of the
Core export (ledgered in `packages/contracts/deprecations.json`).
