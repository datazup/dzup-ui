# `@dzup-ui/core/src/theming/`

Design tokens are owned by `@dzup-ui/tokens`, not this directory.

The `tokens` package ships `tokens.css` which emits all `--dz-*` CSS custom properties under `:root` for the light theme and under `[data-theme="dark"]` (plus a `prefers-color-scheme: dark` media-query fallback) for the dark theme. The provider sets the `data-theme` attribute on `<html>` — that is the entire "engine".

This directory is **reserved for future component-level theme overrides** (e.g. per-component token remaps, theme extension registries). Nothing should be placed here until an ADR documents the extension mechanism.

References:
- `@dzup-ui/tokens/src/` — semantic token definitions (light + dark)
- `../providers/DzThemeProvider.vue` — sets `data-theme` attribute
- `../providers/theme-script.ts` — FOUC-prevention inline script (ADR-15)
