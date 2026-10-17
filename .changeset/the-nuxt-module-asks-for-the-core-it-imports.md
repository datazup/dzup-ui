---
"@dzup-ui/nuxt": patch
---

**`@dzup-ui/nuxt` now requires the `@dzup-ui/core` release that ships what it imports.**

The module imports `@dzup-ui/core/ownership` and `@dzup-ui/core/theme-script` at load,
and neither exists in `@dzup-ui/core` 0.2.0 — yet the peer range `>=0.1.0-alpha.0`
accepted it, so a Nuxt app on core 0.2.0 installed cleanly and then failed to load its
config with a "package path not exported" error. The peer range is now
`>=0.3.0-0`; install `@dzup-ui/core` 0.3.0 (or a 0.3.0 prerelease) alongside this
release.
