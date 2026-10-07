---
'@dzup-ui/tokens': patch
---

The DTCG export types the three `--dz-transition-*` primitives

`dist/tokens.dtcg.json` now emits `--dz-transition-{fast,normal,slow}` as DTCG
`transition` tokens instead of listing them as untyped. `duration` and
`timingFunction` stay `{group.token}` references to `primitive.duration.*` and
`primitive.easing.default`, and `delay` is `0ms`, the CSS initial value the
fragment leaves implicit. The untyped set goes from 26 to 23.
`--dz-page-hero-bg` stays untyped, but its reason now says what it is (a
background value with a gradient fallback) instead of reading as a colour that
failed to parse.

**What this changes for you.** Nothing in `dist/tokens.css`: the `--dz-*` custom
properties are the runtime ABI, and none of them changed. If you read the DTCG
file, three tokens moved from `$extensions["com.dzup"].untyped` into
`primitive.transition`.
