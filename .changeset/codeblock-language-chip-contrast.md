---
"@dzup-ui/core": patch
---

Fix `DzCodeBlock`'s language chip failing WCAG AA.

The chip (`bash`, `vue`, …) inherited the header's `--dz-muted-foreground` and sat
on a 10%-opacity `--dz-foreground` fill, measuring **3.64:1** — below the 4.5:1
required for text. It carries real information, so it now takes the full
`--dz-foreground` colour, and the pair passes.

Found with an axe pass over the landing hero, which renders two code blocks above
the fold. `yarn validate:tokens` does not catch this: the `intent-text-contrast`
gate is scoped to `--dz-{intent}` text on `{intent}-muted` fills, and this pair is
neither.
