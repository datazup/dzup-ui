---
'@dzup-ui/tokens': patch
---

Ship declarations for every root export. The multi-entry `rollupTypes` build wrote the theme-script rollup over `dist/index.d.ts`, so consumers had no types for tokens, palettes or the ThemeRecipeV1 API; declarations are now emitted per file.
