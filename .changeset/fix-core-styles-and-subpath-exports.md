---
"@dzup-ui/core": patch
---

Fix export targets that the build never emitted.

`package.json` declared `"./styles": "./dist/core.css"`, and the README told consumers to
`@import "@dzup-ui/core/styles"` — but no build step ever produced a CSS file, so the import
failed to resolve for anyone installing the package. `src/index.ts` now side-effect-imports
`./styles/base.css` and the Vite lib build pins the extracted asset to `dist/core.css`
(`build.lib.cssFileName`). The JS entry itself stays CSS-free, so `./styles` remains opt-in and
safe to import under SSR.

The same class of bug hit every per-family subpath: `./buttons`, `./cards`, `./data`,
`./feedback`, `./forms`, `./inputs`, `./layout`, `./media`, `./navigation`, `./overlays`,
`./typography` and `./providers` all shipped an `index.d.ts` with no `index.js` beside it —
Rollup inlines re-export-only barrels under `preserveModules`, so no chunk was emitted and the
subpath resolved to nothing. Each barrel is now an explicit build entry.

`yarn validate:exports` now asserts that **every** target in an `exports` map exists on disk,
including plain-string and non-JS (`.css`/`.json`) targets, which it previously never walked.
