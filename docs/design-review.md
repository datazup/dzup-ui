# dzup-ui — Design Review & Next Tasks

_Review date: 2026-07-08. Scope: core design system (`packages/`), the landing app
(`apps/landing`), and Storybook (`apps/storybook` + `packages/core/stories`)._

> **The tasks below are written up as ready-to-run agent prompts in
> [`design-tasks.md`](./design-tasks.md)** (TASK-DS-01 … TASK-DS-12), following the same
> XML/role/success-criteria format as [`new-features.md`](./new-features.md). This doc is
> the analysis; that one is the execution.

**Headline:** the engineering is genuinely top-tier — OKLCH token cascade, a
pure/testable `DESIGN.md` emitter, dependency-free WCAG contrast math, a dogfooded
landing, and a Storybook with `play()` + status + autodocs on ~160 stories. The
weaknesses are almost all the **same shape**: _claims that outrun enforcement._ The
infrastructure exists; the ratchet hasn't been pulled. That is the through-line to fix.

---

## The cross-cutting theme: claims vs. enforcement

| Surface | The claim | The reality |
|---|---|---|
| Core | DESIGN.md: "Documented pairs meet WCAG AA" | Contrast gate asserts ~22 pairs; the `-muted` / `-muted-foreground`, `link`, and card/popover-foreground pairs it advertises are **not gated** (pass today, unguarded against regression) |
| Core | Narrative: "Motion is quick and functional (150–300 ms)" | DESIGN.md emits **no motion/easing, z-index, or breakpoint** table — those tokens exist but are invisible to the AI consumers the file is _for_ |
| Storybook | Accessibility.mdx: "enforced pipeline" | The a11y ratchet is **0 of 11 families** — every family still says "🔍 Audit"; `a11yError` is spread by zero stories |
| Landing | 5 social-proof stat tiles | 2 of 5 (`githubStars`, `npmDownloads`) are hardcoded `null`; **no testimonials, no logo wall** on the home page |
| Docs | "158 components" / "155 .vue files" | Actually **205 `.vue` files**, flat layout — hand-maintained counts have drifted; CLAUDE.md's nested-folder layout description is also wrong |

If you fix one _category_, fix this one. Everything below rolls up to it.

---

## Design improvements, ranked by impact

### 1. Advance the a11y ratchet — it has never engaged. (highest)
The whole per-family enforcement machine (`packages/core/stories/_shared/a11y.ts`,
`preview.ts` global `a11y.test: 'todo'`, CI wiring) is built and has never advanced
one notch. Pick the cleanest family (Typography or Cards), clear its violations, flip
it to `a11yError`. That proves the loop and turns an aspirational claim into a real gate.

### 2. Clear story-authoring token debt — it's what's blocking #1. (high)
114 of 175 story files use raw Tailwind grays (`text-gray-*`) / untokenized `border-t`
— an ADR-04 violation _inside the docs surface_, and the dominant `color-contrast` axe
failure. Even flagship `DzButton.stories.ts` does it. A codemod
(`text-gray-* → text-[var(--dz-muted-foreground)]`, `border-t → border-[var(--dz-border)]`)
plus an ESLint rule forbidding raw color literals in `*.stories.ts` clears most of the
backlog keeping families from enforcing.

### 3. Close the contrast-gate coverage gap. (high, cheap)
Extend `buildContrastPairs()` in
`packages/tooling/src/token-checks/design-md-check.ts` to assert _every_ pair DESIGN.md
advertises: the `{intent}-muted-foreground` on `{intent}-muted` set, `--dz-link` on
background, `--dz-foreground` on card/popover/surface. They pass today (~7–8:1) — the
value is regression-proofing the headline AA guarantee. Low effort, directly hardens the
promise.

### 4. Make DESIGN.md faithful — add the missing token families. (high)
`design-emit.ts` has builders for color/type/spacing/elevation/shapes/components but
**none** for motion (`primitives/transitions.ts`), z-index (`primitives/z-index.ts`), or
breakpoints (`primitives/breakpoints.ts`) — all real, CSS-emitted tokens. The file's
entire purpose is a portable channel for AI tools that can't run the MCP; omitting these
makes them undiscoverable. Add `buildMotion` / `buildLayers` + `<!-- dz:motion -->`
placeholders following the existing pattern.

### 5. Rebuild the hero to show the product; wire real social proof. (high — landing)
The hero is a well-executed but _derivative_ 2024-SaaS archetype (aurora + grid + grain +
gradient headline) with **zero product visual above the fold** and 4 GPU-composited
full-bleed layers competing behind the LCP text. `ShowcaseDashboard.vue` (the split
light/dark live dashboard, one section down) is the single best proof on the site —
promote a compact version into the hero. Then: wire `useLiveStats` into
`SocialProof.vue` (reserve widths to avoid CLS), add a testimonials/logo-wall to
`HomePage.vue`, and add an "install → import → use" code panel — developers currently
never see `<DzButton>` in code on the home page.

### 6. Normalize the intent contract & de-duplicate palettes. (medium — core)
Two consistency smells: (a) `warning` breaks the uniform intent state-set with bespoke
`-solid` / `-solid-hover` tokens, forcing special-cases in `tv()` and the contrast gate —
either give _all_ intents a `-solid` pair or formalize warning as a documented exception
in contracts; (b) 6 intent palettes duplicate a decorative twin within ~2–5° of hue
(`primary` 260° / `blue` 258°, `danger` 25° / `red` 27°, …) = ~66 near-identical
primitive vars shipped twice. Alias intents onto their twin.

### 7. Kill the 26 duplicated reduced-motion `<style scoped>` blocks. (medium — core)
26 components carry byte-identical `@media (prefers-reduced-motion)` blocks — an ADR-04
violation ×26. Hoist one global rule into the tokens CSS layer (or standardize
`motion-reduce:` in `.variants.ts`), delete all 26, add a CI check failing on
`<style scoped>` in `core`.

---

## Suggested next tasks (sequenced)

### Quick wins (this week)
1. Extend `buildContrastPairs()` to full advertised coverage (#3) — small, high-trust.
2. Add motion/z-index/breakpoint builders to `design-emit.ts` + narrative (#4).
3. Auto-derive component/block/template counts (glob-based, like the token counts already
   are) and fix CLAUDE.md's stale 155/158 count and layout description.
4. Wire live GitHub/npm stats into `SocialProof.vue` with reserved widths (#5).

### Structural (this sprint)
5. Codemod story token debt + ESLint rule; then flip the first family to `a11yError`
   (#1, #2) — do these together, in that order.
6. Global reduced-motion rule + strip 26 `<style scoped>` blocks + CI guard (#7).
7. Refactor `TopNav.vue`'s 9-item bar into grouped menus (de-dupe Components/Docs → same
   Storybook target, and Ecosystem-vs-children).

### Bigger bets (next)
8. Hero v2: promote `ShowcaseDashboard`, trim decorative layers, re-measure against the
   landing-perf CI budget; add testimonials + code panel (#5).
9. Resolve the `warning`-intent asymmetry and de-duplicate intent/decorative palettes (#6).
10. Storybook maturity pass: drive `UNTAGGED_COUNT` to 0, reconcile the barely-used `beta`
    tier, and add `*Parts` anatomy stories for the remaining compound families (Dialog,
    Sheet, Table, Sidebar, Accordion, menus) following `DzCardParts.stories.ts`.

---

## One decision worth making now
The Figma `@storybook/addon-designs` panel is installed and the docs claim "linked from
each component's Design panel," but only 3 stories have (placeholder) node-ids — it's
blank for ~150 components. Either commit to seeding real frames or scope back the docs
language. Don't leave it half-claimed.

---

## Appendix — what's strong (keep)

- **Token architecture** — OKLCH-authored ramps generated from one algorithm
  (`primitives/colors.ts`); clean primitive → semantic → component three-tier cascade; a
  pure, unit-tested DESIGN.md emitter (`design-emit.ts`) whose _values_ are all
  auto-derived; a real dependency-free WCAG contrast gate (`oklch-contrast.ts` +
  `design-md-check.ts`).
- **Landing** — genuine dogfooding via an `--lp-*` layer built on top of `--dz-*`
  primitives; `ShowcaseDashboard.vue` (live split light/dark) is the strongest proof on
  the site; skip link, scoped `data-theme` panes, `matchMedia` gating, and
  `prefers-reduced-motion` honored throughout.
- **Storybook** — 175 story files across all 11 families; `argTypes` (154), `play()`
  (162), `status:*` (164), autodocs (166); token-mirrored manager light/dark themes; live
  `@vue/repl` + Open-in-StackBlitz DX is a standout. The 64 "storyless" components are
  Reka compound sub-parts correctly documented through their parent — not a real gap.

## Key files referenced
- Core: `packages/tokens/src/design-emit.ts`, `packages/tokens/src/design-narrative.md`,
  `packages/tokens/src/primitives/{colors,transitions,z-index,breakpoints,shadows}.ts`,
  `packages/tokens/src/semantic/{light,dark}.ts`,
  `packages/tooling/src/token-checks/{oklch-contrast,design-md-check}.ts`
- Landing: `apps/landing/src/pages/HomePage.vue`, `apps/landing/src/components/{Hero,SocialProof,TopNav,ShowcaseDashboard}.vue`,
  `apps/landing/src/config.ts`, `apps/landing/src/composables/useLiveStats.ts`,
  `apps/landing/src/tailwind.css`
- Storybook: `apps/storybook/.storybook/{main,preview,manager}.ts`,
  `packages/core/stories/_shared/{a11y,status}.ts`,
  `apps/storybook/stories/{Accessibility,ComponentStatus}.mdx`,
  `apps/storybook/stories/_data/componentStatus.ts`,
  `packages/core/stories/{buttons/DzButton,cards/DzCardParts}.stories.ts`
