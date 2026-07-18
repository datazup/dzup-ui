---
"@dzup-ui/tokens": minor
"@dzup-ui/core": minor
"@dzup-ui/tooling": minor
"@dzup-ui/codemods": minor
---

Normalize the `warning` intent: every intent now exposes the same solid-fill state set (TASK-DS-10).

`warning` was the only intent that shipped `-solid` / `-solid-hover`, so every
consumer — `tv()` variants, the contrast gate, the story codemod — carried a
`tone === 'warning'` branch, and each branch was a place to forget warning exists.

**New tokens (additive; nothing was renamed or removed):**

- `--dz-{intent}-solid` and `--dz-{intent}-solid-hover` for `primary`, `secondary`,
  `success`, `danger`, `info`. These resolve to the same primitive shades as
  `--dz-{intent}` / `--dz-{intent}-hover` (500/600 light, 400/300 dark), so **no
  published token changed color** and the swap is a visual no-op for those five.
- `--dz-warning-hover`, which the intent was missing entirely.

`--dz-warning-solid` / `--dz-warning-solid-hover` keep their exact values. They are
no longer a bespoke pair — they are warning's members of a uniform family.

**Why warning is shaped this way, and why the fill set has two states.** Near-black
`--dz-warning-foreground` on `--dz-warning` (shade 500) measures **3.51:1** — below
WCAG AA. A warning button therefore fills with shade 300 (8.44:1) and hovers to 400
(5.87:1). The ramp affords no shade between 400 and 500, so a third, darker pressed
step is not available at AA. The uniform fill set is `-solid` + `-solid-hover`; there
is no `-solid-active` for any intent.

**Behavior change.** `DzButton`, `DzToast` and `DzTabs` previously hovered solid
`success` / `danger` / `info` fills with a `/90` alpha shortcut while `primary` used
its designed `-hover` shade. All tones now hover to `--dz-{tone}-solid-hover` (the
shade-600 step). This aligns them with `primary` and puts every hover fill under the
contrast gate, which the alpha shortcut escaped.

**`-active` reclassified.** `--dz-{intent}-active` is documented as a pressed *surface*
color, not a text-bearing fill: no component puts `{intent}-foreground` on it, and
`--dz-warning-active` could not carry it legibly. The contrast gate no longer asserts
that pair (94 → 84 pairs), because it was gating a combination nothing renders.

**Special cases removed:** `buildContrastPairs()` in `@dzup-ui/tooling`, the solid and
outline compound variants across 15 `*.variants.ts` / `*.tokens.ts` files, and the
`story-color-tokens` codemod all now loop over intents with no branch.
