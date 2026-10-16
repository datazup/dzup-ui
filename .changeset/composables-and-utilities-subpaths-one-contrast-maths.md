---
"@dzup-ui/core": patch
"@dzup-ui/tokens": patch
"@dzup-ui/contracts": patch
---

**`@dzup-ui/core/composables` and `@dzup-ui/core/utilities`, one WCAG contrast implementation, frozen provider defaults, and `sideEffects` on tokens and contracts.**

- **New subpaths `@dzup-ui/core/composables` and `@dzup-ui/core/utilities`.**
  `import { useToast } from '@dzup-ui/core/composables'` and
  `import { cn } from '@dzup-ui/core/utilities'` no longer pull in the root
  entry, which re-exports every component family and loads the base
  stylesheet. Both subpaths export the same functions as the root, and the root
  is unchanged. `validate:exports` checks that each subpath exports every
  manifest entry in its category and nothing the root does not export.
- **New in `@dzup-ui/tokens/utils`: `oklchToLinearSrgb`, `oklchLuminance`,
  `wcagLuminanceFromLinear`, `wcagContrastRatio` and `clampUnit`.** The DESIGN.md
  contrast gate and the landing site's theme designer and block theme now call
  these functions, so the contrast verdict shown to a visitor uses the same
  maths as the verdict the gate enforces.
- **`DZ_PROVIDER_DEFAULTS` and `DZ_ALLOWED_URL_SCHEMES` are frozen at every
  level.** Before, only the outer objects were frozen. A cast-away `push` onto
  the scheme allowlist, or a write to the sanitizer `limits`, now throws in
  strict code instead of widening every URL sink and sanitizer call on the page.
  The types are unchanged.
- **`@dzup-ui/tokens` declares `"sideEffects": ["*.css"]` and
  `@dzup-ui/contracts` declares `"sideEffects": false`.** Bundlers other than
  Rollup can now drop the modules a build does not import.
