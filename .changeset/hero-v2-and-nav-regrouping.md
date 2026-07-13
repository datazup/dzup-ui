---
"@dzup-ui/landing": minor
---

Hero v2 (TASK-DS-11) and the regrouped TopNav + trust scaffold (TASK-DS-12).

**Hero v2 — lead with the product, not the gradient.**

- A compact, *live* `ShowcaseFrame` (real `@dzup-ui/core` components, no screenshot)
  now sits above the fold, alongside a new `HeroCodePanel` — a two-step
  "install → import → use" panel that reuses `PmCommandTabs` and `DzCodeBlock`.
  At 1280×800 the page previously showed **zero** product visuals and **zero** code.
- Full-bleed decorative layers cut from **four to one**. Measured individually
  (Playwright, 1280×800, medians): the aurora cost ~52ms of first paint, the
  spotlight ~48ms, the grid + grain ~4ms. The spotlight survives — cheapest of the
  three that do real work, and the only one with no `filter` or `mix-blend-mode`.
- The headline no longer runs through `lp-gradient-text`, and the seven-child
  staggered `opacity: 0` entrance is gone — it promoted seven compositing layers
  and gated the LCP element on an animation. Only the visual column animates.
- `ShowcaseDashboard`'s two below-the-fold frames now mount through the existing
  `useLazyMount`, a screen ahead of the scroll.
- The hero's duplicate stat row is removed; `SocialProof` already renders it.
- Net, interleaved A/B against the previous build on the same machine: **median LCP
  1092ms → 948ms (−13%)**, CLS 0 → 0, compositing layers 35 → 17.

**Accessibility, measured with axe (WCAG 2.x A/AA, serious + critical):**
desktop **11 → 6** violations, mobile **10 → 7**.

- `ShowcaseFrame`'s window declared `role="img"` while containing a segmented
  control, a search input, a switch and buttons — an `axe` `nested-interactive`
  violation and simply wrong. It is now `role="group"`.
- The hero's "Built with" list dimmed `--dz-foreground` to `opacity: 0.62`, which
  measures **4.41:1**. axe never reported it: the aurora and grain layers made the
  backdrop uncomputable, so the rule returned *incomplete* rather than *fail*.
  Removing those layers surfaced it; it now uses `--dz-muted-foreground`. The same
  layers were also causing a real **4.1:1** failure on the re-theme button's mode
  pill. Nodes axe could not evaluate at all dropped from 38 to 22.

**TopNav — nine flat items regrouped into five.**

- `Components` and `Docs` both resolved into Storybook; they are now distinct
  menus. `Ecosystem` duplicated its own children (Blocks / Templates / Animations /
  Themes, three of which were its siblings) and is gone — the home-page section
  stays. `/templates` reaches the nav for the first time.
- Menus are Reka-backed `DzDropdownMenu`, non-modal, opening onto real anchors
  (middle-click and open-in-new-tab work). `aria-current="page"` marks the active
  route and `aria-current="true"` the group containing it. Menu items get a
  `--dz-ring` focus ring. The mobile drawer mirrors the grouping, closes on Escape
  with focus returned to its toggle, and closes on navigation.
- `src/nav.ts` is the single source for both surfaces; `nav.spec.ts` gates the two
  invariants the review found broken: ≤5 top-level entries, and no destination
  reachable from two entries.

**Trust section — shipped empty, on purpose.**

`HomeTestimonials` is built from `DzCard` / `DzAvatar` / `DzText` and renders
nothing while `TESTIMONIALS` in `config.ts` is `[]`. dzup-ui has no public users
yet (the GitHub repo and the npm package are both unpublished — the same reason
`useLiveStats` degrades its tiles), so there is no real quote to print and no logo
we have permission to show. A fabricated testimonial would be worse than none.
`HomeTestimonials.spec.ts` asserts the list stays empty and that the section
renders correctly once real, permission-cleared entries are added.
