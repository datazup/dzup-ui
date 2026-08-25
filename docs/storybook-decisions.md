# Storybook Sprint 0 — Decision Record

> Companion to [`tasks.md`](./tasks.md). Captures the "evaluate and document"
> outcomes for the optional Sprint 0 tasks (0.5, 0.11, 0.15) plus the rollout
> notes for the deferred infrastructure pieces.

## TASK-0.5 — `DzThemeProvider` global decorator

**Decision: do _not_ wrap all stories in `DzThemeProvider`.** Use the
`withThemeByDataAttribute` decorator alone.

**Rationale**

- Theming is driven entirely by the `data-theme` attribute and the `var(--dz-*)`
  cascade. `withThemeByDataAttribute({ attributeName: 'data-theme' })` already sets
  exactly that attribute, which is everything core components need.
- No core component injects/consumes a theme **context**; the tokens CSS handles
  light/dark purely via CSS. A `DzThemeProvider` wrapper would add a second source
  of truth for the same attribute and risk fighting the toolbar (both would try to
  own `data-theme`).
- Keeping the provider out of the global decorator avoids a hard dependency from
  every story onto a context component, keeping stories closer to how consumers use
  the primitives.

**Revisit if** a future component requires the theme **context** (not just the
attribute) — e.g. reading the resolved theme in JS. At that point, add
`DzThemeProvider` as an _inner_ decorator (mounted **below** `withThemeByDataAttribute`
so the attribute still wins) and have the provider read, not set, `data-theme`.

## TASK-0.11 — Visual regression

**Decision (superseded by TASK-APP-01): adopt Chromatic now, capturing every
story in light × dark.** Wire it as a **non-blocking** CI check first, then
promote to required once baselines are stable (TASK-X.5).

> **History.** Sprint 0 chose "Playwright snapshots first, Chromatic later"
> because Chromatic needs a project token + account (out of scope for a no-account
> Sprint 0), while the repo already ran Playwright. In practice neither was wired,
> and local Playwright snapshots carry Mac-vs-Linux baseline flake. TASK-APP-01
> resolves the gap by going straight to Chromatic: it snapshots in an isolated
> server environment (no OS baseline flake), is free for public repos, and — via
> its **modes** feature — captures each story in both themes in one run, which
> also proves the token system holds in dark mode.

**Why Chromatic (not Playwright snapshots)**

- Isolated, consistent render environment — removes the Mac-vs-Linux baseline
  flake that plagues committed local screenshots.
- Free for open-source; Storybook-native; parallelized with a review UI and
  permalinks.
- **Modes** capture light + dark from the existing `withThemeByDataAttribute`
  global in one run (no duplicated stories).

**What shipped (TASK-APP-01)**

1. `chromatic` devDependency + a `chromatic` script in `apps/storybook/package.json`
   (`chromatic --build-script-name build --exit-zero-on-changes`). The project
   token is read from the `CHROMATIC_PROJECT_TOKEN` env var / CI secret — never
   committed.
2. `parameters.chromatic.modes = { light: { theme: 'light' }, dark: { theme:
   'dark' } }` in `.storybook/preview.ts`, applied **globally** so every story is
   captured in both themes. Each mode flips the `theme` global that
   `withThemeByDataAttribute` already owns. Stories opt out of a mode with their
   own `parameters.chromatic.modes` and out of snapshots with
   `parameters.chromatic.disableSnapshot`.
3. Non-determinism sweep — snapshots disabled (with an explanatory comment) on the
   inherently non-deterministic stories:
   - **`DzCountdown`** (meta) — live drift-corrected timers, every story ticks.
   - **`DzRelativeTime`** (meta) — `Date.now()`-relative phrases refreshed by an
     age-adaptive timer.
   - **`DzAnimatedNumber`** (meta) — count-up tween on mount + `Math.random()`
     re-rolls.
   - **`DzCarousel` → Autoplay, Real World: Testimonials** and
     **`DzCarouselParts` → Dots Only** (per-story) — autoplay auto-advances the
     active slide.
   Heavy stories (e.g. `DzDataGrid` "Performance: 1,000 Rows") keep their existing
   `loader` lazy datasets (TASK-X.7) so snapshots stay cheap; `onlyChanged`
   (TurboSnap) further caps the per-run snapshot count.
4. A dedicated **`.github/workflows/chromatic.yml`** job runs on PRs (and `main`),
   `continue-on-error: true`, and posts the build/review + published-Storybook
   links to the job summary. `fetch-depth: 0` enables baseline detection +
   TurboSnap.

## TASK-0.15 — Figma / design reference

**Original decision (Sprint 0): defer `@storybook/addon-designs`; reserve a
`design` parameter convention.** Do not add the addon until Figma frames exist to
link.

- When design sources are available, embed per-component via the `design`
  parameter:
  ```ts
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/file/…' } }
  ```
- Adopting the convention now (even unused) means turning on the addon later is a
  one-line `main.ts` change with zero story rewrites.

**Update (TASK-APP-03 — addon switched on).** The reserved convention is now live.
As predicted, switch-on was a single `addons` line — zero story rewrites.

1. `@storybook/addon-designs` (`^11.1.3`, peer-compatible with Storybook 10) added
   to `apps/storybook/package.json` and registered last in `.storybook/main.ts`
   `addons`. It renders a **Design** panel next to the Controls/A11y panels.
2. The `design` parameter is documented in **Contributing → "Design reference"** as
   *required-when-available* and seeded in the story template
   (`_shared/Dz.stories.template.ts`, with a `REPLACE_ME` URL reminder).
3. **Graceful degradation:** stories without `parameters.design` show the addon's
   built-in "design link coming soon" empty state — not an error — so the rollout
   is opt-in per component with no big-bang rewrite.
4. **Flagship seeds** prove the wiring: `DzButton`, `DzCard`, `DzInput` carry
   `parameters.design` Figma URLs (placeholder `node-id`s until the canonical frames
   land — swap the `dzup-ui-design-system` file/node when they do).
5. **MDX embed:** `Buttons.mdx` imports the `<Figma>` block from
   `@storybook/addon-designs/blocks` and embeds the family frame so design + live
   docs sit together on the Overview page.

This feeds the maturity dashboard's **Design** column (a component counts as
"design-linked" once its `meta` carries `parameters.design`).

### Update 2026-07-10 (TASK-DS-07) — scoped back: no Figma library exists

**Decision: Path B.** The placeholder seeds are removed and the documentation now
says plainly that no component links a Figma frame. Confirmed with the maintainer
on 2026-07-10: there is no maintained Figma library for dzup-ui and none is in
progress.

**Why the previous state was worse than doing nothing.** Points 4 and 5 above
described seeds that never worked. `addon-designs` parses a Figma URL with
`/figma\.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})/` — the file key must be 22+
*alphanumeric* characters. `dzup-ui-design-system` is 21 characters and contains
hyphens, so it never matched; the addon fell through to a plain iframe of a URL
that does not resolve. All three "flagship seeds" and the `Buttons.mdx` embed
rendered a broken frame, not a design. Meanwhile `Contributing.mdx` told authors
"Do not point it at a placeholder file; an empty panel is the honest signal" — a
rule the repo itself broke in the three most-visited stories.

A blank Design panel reads as *scope*. A broken iframe reads as *neglect*. Half of
~139 components showing the first and three showing the second was the one state
not worth staying in.

**What changed:**

- `parameters.design` deleted from `DzButton`, `DzCard`, `DzInput` stories. (In
  `DzCard` the surrounding `parameters` block survives — it carries `a11yError`.)
- The `<Figma>` embed and its import deleted from `Buttons.mdx`, along with the
  "Design source" section that claimed the family "is specified in Figma."
- `_shared/Dz.stories.template.ts` no longer seeds a `REPLACE_ME` URL. The
  convention survives as a comment showing the shape to add when a frame exists.
- **Contributing → "Design reference"** now leads with the ground truth ("there is
  no Figma library for dzup-ui today"), and states that the code — variants,
  tokens, stories — is the source of truth.
- **ComponentStatus** explains that its Design column reads `—` for every component
  by design, rather than leaving a fully-empty column to read as an unfilled gap.

**What was deliberately kept.** `@storybook/addon-designs` stays installed and the
`design` parameter stays wired through `componentStatus.ts`. The original Sprint-0
reasoning still holds: the convention costs nothing while unused, and keeping it
means the first real frame is a one-line story change rather than a migration. The
dashboard column is the coverage tracker Path A would have needed — it simply reads
zero today.

**Revisit when:** a Figma library ships. At that point Path A becomes available —
seed the flagships first, add `design` to the story template, and the Design column
starts counting without any further plumbing.

### Update 2026-07-16 (TASK-FREE-12) — addon removed; the column is gone

**Decision: uninstall.** The "deliberately kept" paragraph above did not survive
contact with the cost. `@storybook/addon-designs` was mounting an empty Design panel
on **all 1,393 stories** and adding weight to every build, to display a parameter
that zero stories carried and — per the 2026-07-10 finding above — that nothing was
going to fill. "The convention costs nothing while unused" was the load-bearing
claim, and it was false: an addon is not free, and a permanently-empty panel is
itself an assertion that a design source exists somewhere.

**What changed:**

- `@storybook/addon-designs` removed from `apps/storybook/package.json` and from the
  `addons` array in `.storybook/main.ts`.
- The **Design** column removed from the ComponentStatus matrix, along with the
  `design` field and its regex in `stories/_data/componentStatus.ts`. A column that
  reads `—` for every row reports the absence of a thing, not the state of one; the
  page now says so explicitly instead of rendering it.
- **Contributing → "Design reference"** now states the addon is not installed and
  documents the two-line path to bring it back.
- `_shared/Dz.stories.template.ts` drops the reserved-parameter comment block.

**Why this is not a reversal of Sprint 0.** Sprint 0 said "do not add the addon
until Figma frames exist to link." That was right. TASK-APP-03 added it anyway on
the theory that switch-on should be pre-paid; three years of an empty panel is a
worse price than the one-line change it was avoiding. This restores the Sprint-0
position — with the switch-on cost now measured rather than assumed.

**Revisit when:** a Figma library ships. Re-add the dependency and the `addons` line,
re-add the `design` field to `componentStatus.ts`, and seed the flagships. The
convention's *shape* is still documented in Contributing; only the unused machinery
is gone.

## TASK-SK-1 — Storybook states which build of the library it resolves

**Decision: `merged-source`, said out loud.**

`.storybook/main.ts` and `apps/storybook/vitest.config.ts` both resolved
`@dzup-ui/*` through `workspaceAliases(repoRoot)` — the single-sourced list
TASK-FREE-12 introduced after finding that two of five hand-copied alias maps had
lost `@dzup-ui/core/styles`. That fixed the *duplication*. It left two things it
could not fix:

- **The list was still handwritten**, so it could disagree with the packages. It
  did: ten entries against thirty-one declared specifiers. Storybook's stories
  and MDX reach `@dzup-ui/core/providers` and `@dzup-ui/core/resolver`, and
  neither had an entry — both resolved only because the bare `@dzup-ui/core`
  alias happened to point at a *directory*.
- **There was no mode.** Storybook builds the library from source, which is
  correct for a documentation site that has to show the working tree — but
  nothing recorded that as a decision, so nothing distinguished it from an
  application that should have been resolving the built package.

Both configs now call `createDzupResolution({ mode: 'merged-source', root })`
from `packages/tooling/src/resolution/`, which derives the alias list from each
package's `exports` map. Two additions Storybook did not have before:

- `resolve.dedupe` — `vue`, `reka-ui` and the `@dzup-ui/*` packages. Storybook
  loads the framework's own Vue *and* the workspace source; deduping is what
  keeps overlay teleports, focus traps and `provide`/`inject` on one copy.
  Nothing in the repository set `dedupe` before this.
- `optimizeDeps.exclude` gains the workspace packages, so Vite's pre-bundler
  cannot serve a cached copy of source that has since been edited. It is
  appended to the existing `@vue/repl` exclusion, not replacing it.

**Ordering is still load-bearing**, and still for the same reason — but it is now
a property of the derived data (most-specific-first, asserted by a spec) rather
than of the order someone typed the lines in. The REPL's
`vue/compiler-sfc` alias and the framework's own entries keep their position
ahead of the workspace list; only the workspace tail is generated.

**Evidence:** `yarn storybook:build` 23.62 MB, within the 25 MB budget;
`yarn typecheck:all`, `yarn lint`, `yarn validate:exports` and `yarn build` green.

## TASK-X.4 — Public vs app-specific triage (Feedback components)

**Decision (Sprint 6 scope):** classify the five flagged feedback components as
follows. The Sprint-3 half (`DzPersonaSelector`) was resolved earlier (public).

| Component | Verdict | Where it lives |
|-----------|---------|----------------|
| `DzRunStatusBadge` | **Public, app-specific** | `Core/Feedback/App-Specific/*`, `status:experimental`. Exported from `@dzup-ui/core`; fully implemented. |
| `DzTokenProgressBar` | **Public, app-specific** | `Core/Feedback/App-Specific/*`, `status:experimental`. Exported; fully implemented. |
| `GovernanceBadge` | **Excluded** | Unimplemented stub (placeholder `<span data-stub>`), **not exported** from `@dzup-ui/core`. No story. |
| `TeamMemberBadge` | **Excluded** | Same — unimplemented stub, not exported. No story. |

**Rationale**

- `DzRunStatusBadge` / `DzTokenProgressBar` are real, exported, and tested-by-story,
  but they encode datazup product vocabulary (run-orchestration statuses, LLM token
  budgets). Documenting them under a clearly labelled **App-Specific** sidebar group
  keeps them discoverable without implying they are portable design-system
  primitives. Marked `experimental` because their contracts are product-driven.
- `GovernanceBadge` / `TeamMemberBadge` are stubs (their `.vue` files carry
  `// TODO: implement …` and render an empty `<span data-stub>`). They have no
  contract, no types graduation, and are absent from the public barrel. Writing
  stories now would document a non-existent API, so they are **excluded** until they
  reach Contract Spec v1 — at which point they likely also belong under App-Specific.

**Revisit when** the two stubs are implemented (add types/variants/contract spec),
or if the design system decides to fully exclude product-specific components from
the published Storybook (then move the App-Specific group behind a build flag).

> ### ⚠ SUPERSEDED by TASK-FREE2-06 (2026-07-17) — and stale long before that
>
> **Both halves of the "Revisit when" above happened, and nobody came back.** The two
> stubs were implemented (`GovernanceBadge` and `TeamMemberBadge` gained types,
> tokens, variants, contract specs, stories, and barrel exports), which per this
> record's own terms meant they "likely also belong under App-Specific" — the table
> above still calls them unimplemented, unexported, and story-less. All four rows are
> now wrong.
>
> How far it drifted, in one number: the two components this table calls
> **"unimplemented stubs"** ship `tags: ['autodocs', 'status:stable']` — the TOP of
> the maturity ladder in `stories/_shared/status.ts`, which is a support promise. They
> did not merely graduate past this record; they graduated two tiers past the ones it
> *did* keep (`DzRunStatusBadge` / `DzTokenProgressBar` are still `experimental`).
>
> See TASK-FREE2-06 for the measured state and the replacement decision: the
> App-Specific group moves behind a build flag, which is the second branch this record
> named.
>
> Kept rather than deleted because the reasoning is the input to TASK-FREE2-06, and
> because the failure mode is the point: a decision record whose revisit conditions
> are prose is a reminder nobody receives. TASK-FREE2-06 replaces this one's
> revisit clause with a CI sentinel.

---

## Sprint 12 — Cross-Cutting & Hardening

### TASK-X.1 — Compositions library

`Core/Compositions/*` now holds **five** compositions. `WorkspaceForm` was ported
during Sprint 3; Sprint 12 adds the remaining two flagship screens:

| Story | Families exercised | Notes |
|-------|--------------------|-------|
| `AppShellDashboard` | layout + navigation + cards + feedback | Full app screen built from real `DzAppShell` + `DzSidebar` + `DzStatCard` + `DzGrid` + `DzCard` (vs. the `DzAppShell` "Real World: Dashboard" story, which uses inline `<div>`s to keep the layout primitive self-contained). Interactive sidebar collapse with an awaited `play()`. |
| `SettingsPage` | navigation + cards + forms | `DzTabs` section rail → `DzCard` panels → `DzFormField`/`DzInput`/`DzSelect`/`DzSwitch`/`DzTextarea`. `play()` switches all three tabs. |

`DzSidebarItem` takes its icon via the **`#icon` slot** (not an `icon` prop) — the
composition uses `<template #icon><component :is="…" /></template>`.

### TASK-X.2 — Token & theming docs interactivity

- `DesignTokens.mdx`: added a `<Typeset>` type-scale ramp fed from `var(--dz-text-*)`
  in the `--dz-font-sans` family, plus live spacing bars (width `var(--dz-spacing-*)`).
  Radius/shadow swatches were already token-driven.
- `Theming.mdx` / `DesignTokens.mdx`: semantic + primitive `<ColorPalette>` already
  read live from `var(--dz-*)` (Sprint 0, TASK-0.14).
- `Media.mdx`: the icon set is shown via `<Canvas of={DzIconStories.IconGallery} />`.
  **Why not the React `<IconGallery>` block:** this is a Vue Storybook; the
  `@storybook/addon-docs` `<IconGallery>`/`<IconItem>` blocks render in React and
  cannot host `lucide-vue-next` components. Embedding the live Vue `DzIcon` gallery
  story keeps the doc in sync with the icons the library actually ships (which is the
  goal of the task) without hand-copying SVG paths into the MDX.

### TASK-X.6 — Sidebar taxonomy polish

`preview.ts` `storySort` now orders `Core` families by family-sprint order and pins
each family's `Overview` MDX to the top via `['Overview', '*']`, so opening a family
lands on its overview rather than the first component alphabetically. Verified
`Core/<Family>/<Component>` title convention across all 12 families + compositions,
and `showRoots: true` in `manager.ts`.

### TASK-X.7 — Performance budget

- **Lazy heavy stories:** `DzDataGrid` "Performance: 1,000 Rows" now builds its
  dataset inside a story `loader` (`makeLargeData()`), so the 1k-row cost is paid only
  when that story is viewed — not at story-file import (which also covers the
  lightweight `Default`/`With Sorting` stories and the autodocs page). `DzCommandPalette`
  is already lazy in the meaningful sense: its overlay/list content only mounts when the
  palette opens (portalled on demand), and its sample item set is small.
- **Build baseline (June 2026, local `storybook build`):**
  - Build time: ~2 min (Vite preview bundle).
  - `storybook-static/` total: **~13 MB** (assets ~6.5 MB), 112 story chunks.
  - Largest chunks are vendor: `iframe` runtime ~2.16 MB (gzip 669 kB) and `axe`
    (a11y) ~580 kB (gzip 160 kB) — both expected for a Storybook build and outside
    story-author control.
- **Follow-up (CI) — DONE (non-blocking metric).** `apps/storybook/scripts/check-bundle-size.mjs`
  (`yarn workspace @dzup-ui/storybook check:size`) walks `storybook-static/` and
  reports total on-disk size, the `assets/` subtotal, JS-chunk count, and the
  largest artifacts (raw + gzip). It runs in the `storybook` CI job right after
  `storybook build` and writes a shields.io size badge into the uploaded artifact.
  It is **non-blocking** (always exits 0) so a size change never fails the build —
  the "track first, budget later" step. Promote to an enforced budget once a
  baseline is trusted by passing `--max-mb <n>` (exits 1 when the total exceeds
  the cap). Current build measures **~21 MB on disk** (assets ~13 MB, ~398 JS
  chunks) — larger than the ~13 MB June 2026 baseline because the docs build now
  also bakes the `@vue/repl` playground, the bundled `@dzup-ui/core` sandbox, the
  CodeMirror editor, and the generated `llms.txt`/releases artifacts added by the
  TASK-APP-06/07/08 work; the largest chunks remain the expected vendor ones
  (Storybook `iframe`/manager runtime, `axe`). Build time stays visible as the CI
  step duration.

### TASK-X.3 / TASK-X.5 / TASK-X.8 — gated on infrastructure

- **TASK-X.3 (a11y `error` gate): IN PROGRESS — 1 of 11 families enforced
  (2026-07-09, TASK-DS-06).** The rollout is per-family: spread `a11yError` into a
  family's story metas once its audit is clean. The blocker named below (TASK-0.9)
  is resolved — the Vitest browser runner works, and the audit has now been run for
  real across all 175 story files.

  **Cards is enforced** (`packages/core/stories/cards/*.stories.ts`, 4 files,
  0 violations). The global default stays `'todo'`; the remaining 10 families are
  report-only against a measured backlog (Buttons 0, Overlays 1, Compositions 3,
  Media 3, Typography 3, Feedback 13, Layout 14, Inputs 26, Navigation 36, Data 39,
  Forms 82 failing stories).

  Choosing Cards over Typography followed the task's own instruction, and the data
  agreed: Cards had 3 failing stories to Typography's 9. **Buttons audits at 0 and
  is the obvious next notch** — it was excluded here only because the task said to
  start narrow and not with buttons.

  Driving Cards to zero required one **component** fix, not a story patch:
  `DzText`, `DzCaption`, `DzRelativeTime` and `DzStatCard` rendered
  `--dz-{intent}` as a text colour (3.69–4.38:1 in light — below AA). They now use
  `--dz-{intent}-muted-foreground` (7.31–10.25:1). That single fix also cleared 6
  of Typography's 9.

  The per-family recipe is written down in `apps/storybook/stories/Accessibility.mdx`
  so the next family is a checklist, not a rediscovery.
- **TASK-X.5 (visual-regression gate):** Chromatic now runs non-blocking on PRs
  (TASK-APP-01 / `.github/workflows/chromatic.yml`). **Promote to a required
  check once baselines are trusted:**
  1. Create the Chromatic project and add `CHROMATIC_PROJECT_TOKEN` as a repo
     secret (Settings → Secrets and variables → Actions). Never commit it.
  2. Merge one PR to establish the baseline on `main`; run the workflow a few
     times to confirm it is flake-free across light **and** dark (no unexpected
     diffs on unchanged stories — chase any remaining non-determinism into
     `disableSnapshot` / a scoped `modes` opt-out first).
  3. In Chromatic project settings, enable **"UI Review"** and set the PR check to
     required; optionally turn on **"Auto-accept changes on `main`"** so baselines
     advance on merge.
  4. Flip the workflow to blocking: remove `continue-on-error: true` from the job
     and drop `exitZeroOnChanges: true` from the `chromaui/action` step so a
     pending/denied visual review fails the check.
  5. Add **"Visual Regression (Chromatic)"** to the branch-protection required
     status checks for `main` (mirrors the a11y `error`-gate rollout in TASK-X.3).
- **TASK-X.8 (deploy):** needs a hosting target (internal Pages / Chromatic
  permalinks) + repo secrets. The static build is verified to come out clean
  (`storybook-static/`); publishing + the README link are the remaining steps.

---

## TASK-FREE2-01 — How `apps/storybook` is typechecked

**Decision: the Storybook build is the typecheck gate for this app. Do not add
`apps/storybook` to `yarn typecheck:apps`.**

`typecheck:apps` runs `vue-tsc` against `apps/landing` only. Running it against
`apps/storybook/tsconfig.json` is not a stricter gate — it is the wrong tool, and
measures as such (2026-07-16, on a green build):

| Code   | Count | What it is |
|--------|-------|------------|
| TS5097 | 699   | `.ts` import extensions — *mandated* by CLAUDE.md rule 5 |
| TS2307 | 341   | bundler-only modules (`@vue/repl/style.css`, `?raw` globs) |
| TS7006 / TS7031 | 563 | implicit `any` in MDX/story callbacks vue-tsc types as `unknown` |
| other  | 68    | |
| **total** | **1,671** | |

The two largest buckets are not defects: the repo *requires* `.ts` specifiers, and
Vite resolves the CSS/`?raw` imports that bare `tsc` cannot. That tsconfig exists to
describe the app **to the Vite builder**, which is what `yarn storybook:build`
exercises — and that build does fail on real type errors in `.storybook/**` and
`stories/**`. Reaching 0 under standalone `vue-tsc` would mean turning on
`allowImportingTsExtensions`, hand-writing ambient module declarations for the
bundler imports, and typing every MDX callback — a large change that would gate on
an environment the app never actually runs in.

`yarn storybook:build` is therefore a **blocking** step of the CI `storybook` job
(`.github/workflows/ci.yml`) — no `continue-on-error`. That job, not `vue-tsc`, is
what catches a type error in this app.

## TASK-FREE2-02 — `Visual Refresh/*` is internal; it does not ship

**Decision: exclude the eight `_gallery/*Gallery.stories.ts` screens from every
build by default, and gate them back in behind `DZUP_GALLERY=1`.**

```bash
# The team's local-run path — the comparison is unchanged, just not published.
DZUP_GALLERY=1 yarn workspace @dzup-ui/storybook dev
DZUP_GALLERY=1 yarn storybook:build     # if you need it as a static build
```

**Why they had to leave the sidebar.** Every top-level sidebar root is a claim that
"this is for you, the consumer." `Visual Refresh` was a root beside `Core` and
`Guides` whose `FreeStyled` stories render `freestyle/*.vue` — hand-rolled markup in
raw `indigo`/`slate` Tailwind classes with zero dzup-ui components. That is correct
for what those files ARE (the untokenized comparison target that
`docs/visual-refresh/AUDIT.md` scores the token system against — `color-lint.ts`
exempts them for exactly this reason), and indefensible as something a user browses
next to the rules forbidding it. TASK-FREE-12 had already pinned the root last in
`storySort` on the theory that ordering it made it legible; it didn't. The problem
was never the position — it was publication.

**Why an inclusion flag, not a glob negation.** `stories` entries are globbed
independently, so a trailing `!…` pattern is not guaranteed to subtract from an
earlier entry — and a silently-ineffective negation fails open, i.e. it ships the
scratch. `main.ts` therefore names what DOES build:

```ts
'../../../packages/core/stories/!(_gallery)/**/*.stories.ts',      // families
'../../../packages/core/stories/_gallery/DzTokenBrowser.stories.ts', // public docs
...(INCLUDE_GALLERY ? ['…/_gallery/*Gallery.stories.ts'] : []),      // internal
```

**The `_gallery/` split is the trap here.** The directory holds two unrelated things:
the eight internal screens, and `DzTokenBrowser.stories.ts` — which is the **public
`Guides/Design Tokens` page**, and is also what `DesignTokens.mdx` attaches to via
`<Meta of={…} />`. A directory-wide exclusion would have taken a shipped guide out
with the scratch, and the build would have stayed green while doing it. Hence the
explicit re-include, and hence the sentinels below.

**Enforcement.** `scripts/check-mdx-links.mjs` (already in the `storybook` CI job,
run against the built `storybook-static/index.json`) asserts both halves:

- no id starts with `visual-refresh` — scratch cannot leak back;
- `guides-design-tokens--designtokens` + `--browser` exist — the exclusion did not
  overshoot.

Both were proved to fail before passing: a `DZUP_GALLERY=1` build trips the first
(24 ids), and the token-browser ids come from a real build, not from assumption.
Note the id is `--designtokens`, **not** `--docs`: an `of`-attached MDX docs entry is
named after the MDX file. Don't "correct" it.

**Also fixed here:** all 8 files imported types from `@storybook/vue3` — a package in
no `package.json`, resolving only transitively. They now use `@storybook/vue3-vite`
like the other 168 story files. Repo-wide, zero files import `@storybook/vue3`.

**Revisit if** the visual-refresh comparison is ever retired (delete the directory and
the flag together), or if it acquires a genuine consumer-facing story — in which case
it needs to be rebuilt from dzup-ui components first, which is the whole point of the
instrument.

## TASK-FREE2-06 — `App-Specific` is another product's domain vocabulary; it does not ship

**Decision: option (b) — exclude the four `Core/Feedback/App-Specific/*` stories from
the public build, gated back in behind `DZUP_APP_SPECIFIC=1`. The components stay
exported from `@dzup-ui/core` for the internal consumer.** Supersedes TASK-X.4.

```bash
# The internal-consumer path — the pages are unchanged, just not published.
DZUP_APP_SPECIFIC=1 yarn workspace @dzup-ui/storybook dev
DZUP_APP_SPECIFIC=1 yarn storybook:build   # if you need it as a static build
```

**The state this replaces was not "kept but under-documented" — it was three
mutually contradictory claims.** Measured 2026-07-17:

| Surface | Said | Truth |
|---|---|---|
| `Feedback.mdx` | the two badges are "unimplemented stubs (placeholder `<span>`s)" | implemented — 78 and 61 lines, each with `.tokens.ts`, `.variants.ts`, `.contract.spec.ts` |
| `Feedback.mdx` | "not exported from `@dzup-ui/core`" | both exported (`components/feedback/index.ts:184,197`) |
| `Feedback.mdx` | "intentionally **excluded** from this Storybook" | both ship a public page in the sidebar |
| `build-counts.ts` / ⌘K palette | — | filter on the `Dz` prefix, so both are invisible to every count and to search **while publishing a page** |

So the docs told readers two components did not exist, the sidebar showed them, and
the counts disagreed with both. That is the "current state is neither" the task
names, and no amount of documenting the tier fixes the third row.

**Why (b) and not (a) — document the tier.** The vocabulary is not
design-system-flavoured, it is one product's domain model:

- `GovernanceBadge.pattern` is `supervisor | contract_net | blackboard | peer_to_peer | council` — datazup's agent-coordination taxonomy.
- `TeamMemberBadge.participantId` is documented as the id "within the team run (not the team-definition ID)" — a distinction meaningless outside the runtime that mints both.
- `DzTokenProgressBar` is an LLM token-budget bar with 70%/90% thresholds.
- `DzRunStatusBadge` is `PENDING…CANCELLED` mapped onto `DzBadge`.

A catalog is a promise of general-purpose reuse. Option (a)'s best case — a reader
understands why these are here and is told to use `DzBadge`/`DzProgress` instead — is
a paragraph explaining that four of the catalog's entries are not for them. That is
the cost of (a) forever, paid on every read, in exchange for zero reuse.

And (a)'s bill is not just prose: it requires renaming `TeamMemberBadge` →
`DzTeamMemberBadge` and `GovernanceBadge` → `DzGovernanceBadge` (public catalog
entries carry the prefix) through `packages/compat` + a codemod entry + a changeset —
i.e. permanently widening the public API surface, and adding a compat shim we
maintain indefinitely, so that a domain widget can be spelled consistently in a
catalog it should not be in. The rename becomes **internal debt** instead, noted
below.

**This does not conflict with the free-tier scope rule** ("never gate a demo"). These
are not demos of general-purpose components — they are another product's widgets. The
rule protects the reader's ability to evaluate dzup-ui; removing these serves it.

**Mechanism — the TASK-FREE2-02 inclusion flag, extended.** The four story files move
`packages/core/stories/feedback/` → `packages/core/stories/_app-specific/`, and
`main.ts` keeps naming what ships:

```ts
'../../../packages/core/stories/!(_gallery|_app-specific)/**/*.stories.ts',
...(INCLUDE_APP_SPECIFIC ? ['…/_app-specific/*.stories.ts'] : []),
```

An inclusion flag, not a glob negation, for the reason TASK-FREE2-02 gives: `stories`
entries are globbed independently, so a trailing `!…` fails **open** — it ships the
thing it was meant to hide. A directory is used rather than four named files so the
exclusion cannot rot: a fifth app-specific story lands in the right place or it is
visibly in the wrong one.

**Why a directory move rather than leaving them in `feedback/`.** The four files were
inside the family directory that every family-wide glob walks — the same glob that
feeds the counts and the component index. Moving them makes the exclusion structural
rather than a list to maintain, and it is what makes the counts self-correct (below).
The story files keep their `Core/Feedback/App-Specific/*` titles: under the flag the
sidebar reads exactly as it does today.

**What the four keep.** All of it, except publication. They are still exported, still
built into `@dzup-ui/core`, and still covered by their unit + contract specs (which
live in `packages/core/src/`, untouched). Every validator that walks the stories tree
— `contract-parity`, `story-status`, `story-dod`, `color-lint` — recurses from
`packages/core/stories` with only a `node_modules` skip, so `_app-specific/` stays
gated by all four. Verified, not assumed: injecting a bogus `status:*` tag into
`GovernanceBadge.stories.ts` trips `validate:story-status` from its new home.

**The one thing that did NOT come for free — and the fix.** `apps/storybook/vitest.config.ts`
runs `storybookTest({ configDir })`, which takes its story list from `main.ts` — the
same glob this decision narrows. So the naive version of (b) would have dropped the
four out of the `storybook-test` job's `play()` + a11y audit **silently**: unpublishing
would have quietly become untesting, which is not what was decided and is exactly the
kind of drift TASK-X.4 died of. The `storybook-test` CI step therefore runs with
`DZUP_APP_SPECIFIC: '1'` (`.github/workflows/ci.yml`) — the four are tested like every
other story, while the `storybook` job builds the published artifact **without** the
flag and asserts their ids are absent. Test everything; publish a subset.

> **If you add another excluded group, do the same audit.** The question is not "does
> the sidebar still look right" — it is "which tool reads `main.ts` as its source of
> truth?" Today that is the builder AND the test runner. Only the first should shrink.

**Counts — derived, and they move on their own.** `build-counts.ts` reads
`documentedNames()` per family from `Dz*.stories.ts` under `stories/<family>`, so the
move drops `DzRunStatusBadge` + `DzTokenProgressBar` from the Feedback family's
`documented` count (**139 → 137**) and the four files from `storyFiles`. `catalog`
stays **205**: it globs `.vue` files under `src/components`, and the components are
still there — which is exactly right, since (b) does not remove them from the library.
The two unprefixed badges were never in `documented` at all (the `Dz` filter), so the
number does not move for them. Nothing was hand-edited; `claims.spec.ts` reads the
shipped artifacts back off disk and would fail if it were.

**Enforcement — the sentinel replaces the "revisit when" clause.**
`check-mdx-links.mjs` already asserts the public `index.json` carries no
`visual-refresh` id; its `absentPrefix` is now a **list**, and
`core-feedback-app-specific` is the second entry. This is deliberate: TASK-X.4 went
stale precisely because its revisit conditions were prose in a file nobody re-read.
Proved in both directions on real builds (2026-07-17): a default build serves **0**
such ids and `check:mdx-links` passes (with the two `guides-design-tokens--*` ids
still present, so the exclusion did not overshoot); a `DZUP_APP_SPECIFIC=1` build
serves **38** (4 components × their full story sets — the pages are unchanged, not
degraded) and the sentinel exits 1.

**Internal debt (accepted, not fixed here).** `TeamMemberBadge` and `GovernanceBadge`
still lack the `Dz` prefix that every other export carries. Under (b) they are not
catalog entries, so the prefix rule does not bind them and the rename does not earn a
compat shim + codemod + changeset. It is real debt — they are still exported from a
package whose every other symbol is prefixed. Fix it **if** they are ever promoted to
public (in which case the rename is a precondition, not a follow-up), or fold it into
an unrelated breaking change if one comes along.

**Revisit if** one of these turns out to be general-purpose after all — the honest
signal is a second, unrelated consumer asking for it, not a hunch. At that point it
gets the `Dz` prefix, a generic vocabulary (a status badge whose statuses are the
caller's, not `PENDING…CANCELLED`), and moves back into `feedback/`, where the counts
pick it up automatically.

## Deferred infrastructure — follow-up notes

These Sprint 0 tasks are **scaffolded in-repo** but need a one-time network install
or external account to go green. None are code-complete blockers for the rest of the
sprint.

### TASK-0.9 — Vitest addon (Playwright browser)

Scaffolded: `apps/storybook/vitest.config.ts`, `.storybook/vitest.setup.ts`,
`@storybook/addon-vitest` + `@vitest/browser` + `playwright` in `package.json`, and
the `storybook-test` CI job.

First-time local setup (needs network):

```bash
yarn install
yarn workspace @dzup-ui/storybook exec playwright install chromium
yarn workspace @dzup-ui/storybook test-storybook
```

The in-Storybook **test widget** appears once `@storybook/addon-vitest` is installed
and the Vitest server is running.

### TASK-0.10 — Coverage

Enabled in `apps/storybook/vitest.config.ts` (`test.coverage`, v8). Published by the
`storybook-test` CI job as the `storybook-coverage` artifact. Treated as a
barometer, **not** a 100% gate.

### TASK-0.12 — CI build job

The `storybook` build job already existed; Sprint 0 adds the `storybook-test` job
(play() + a11y + coverage). Both publish artifacts.

## FREE2-11 — Global toolbars: viewport, direction (RTL), density

Bringing the Storybook to parity with the landing's own template-preview toolbar,
which already answers device-width and direction. Three globals were in scope.

### Viewport — already shipped (FREE-17)

A global viewport toolbar was wired under FREE-17: `.storybook/preview.ts` sets
`parameters.viewport.options = RESPONSIVE_VIEWPORTS` (imported from the single
`packages/core/stories/_shared/options.ts` definition), so every story offers the
mobile/sm/tablet/lg/desktop/wide widths. No `initialGlobals.viewport`, so the
default stays `responsive` (canvas fills its frame) and no existing story changed
how it renders. The three layout stories that predate it (DzGrid, DzContainer,
DzAppShell) keep their per-story `viewport.options` — same object, now redundant
but harmless.

### Direction (LTR / RTL) — shipped

A global `direction` toolbar (`globalTypes.direction`, default `ltr` via
`initialGlobals`) plus a decorator that writes `dir` to **`<html>`** — not just the
in-canvas wrapper — so Reka overlays teleported to `<body>` inherit it too. The
decorator always writes the current value, so switching back to LTR never leaves a
stale `rtl`. This ships the **toggle**; fixing the RTL layout bugs it surfaces is
follow-up work (below), deliberately out of scope.

**RTL spot-check (static analysis of the 5 named components — not yet visually
confirmed in a built Storybook; each is a physical-direction usage that will not
mirror under `dir="rtl"`):**

- **DzTabs** — `DzTabs.variants.ts` uses physical `border-r`, `mr-px` and
  `rounded-l` in the `enclosed` variant; under RTL the segment borders/radii sit on
  the wrong edge. Fix: logical `border-e` / `me-px` / `rounded-s`.
- **DzSlider** — `DzSlider.variants.ts` uses `mr-3` for the value label gap; under
  RTL the gap lands on the wrong side. Fix: `me-3`.
- **DzPagination** — prev/next/first/last render `ChevronLeft`/`ChevronRight`/
  `ChevronsLeft`/`ChevronsRight`; icon glyphs do **not** auto-flip, so in RTL "next"
  visually points the wrong way. Fix: swap the glyph (or rotate) when `dir=rtl`.
- **DzBreadcrumb** — default separator is a direction-neutral `/`, but the documented
  `ChevronRight` separator (and any caller passing one) does not flip in RTL.
- **DzDrawer** — no physical CSS in its variants, but its slide side is driven through
  Reka without a `ConfigProvider dir` (none exists in the repo), so a `side="start"`-
  style drawer will not mirror. Adopting Reka's `ConfigProvider` with the `dir` global
  is the idiomatic fix and would fix teleported overlays project-wide at once.

These are the entry points for a future "RTL support" task; the toggle makes them
observable.

### Density (comfortable / compact) — DEFERRED, blocker documented

**Not shipped.** A density global would scale spacing, but the token system has **no
single `--dz-spacing` scalar to turn**: `packages/tokens/src/primitives/spacing.ts`
defines ~34 independent literal steps (`--dz-spacing-0` … `--dz-spacing-96`), none
expressed against a shared multiplier. The only way to scale them at once today is to
emit an override for *every* step — which is exactly what the landing blocks theme
editor does (`useBlockTheme.ts` loops `SPACING_SCALE` × a density factor).

Porting that into a Storybook decorator would stand up a **parallel spacing mechanism**
in the docs — the thing this task was told not to invent — and, applied on the story
wrapper, it would not reach Reka overlays teleported to `<body>` (the same escape the
`dir` decorator dodges only because it writes to `<html>`; CSS-var overrides on a
wrapper do not cascade to a portal outside it). So density is **deferred until the
tokens generator expresses each step as `calc(var(--dz-spacing-unit) * n)`** — a
one-scalar refactor in `@dzup-ui/tokens`. Once that lands, a density toolbar becomes a
genuine one-decorator win (set `--dz-spacing-unit`) and should ship comfortable/compact
then. Tracked here rather than built, per the task's explicit guardrail.

### Keyboard shortcuts — documented

`manager.ts` enables `enableShortcuts: true`; the shortcuts that matter are now
listed in a "Keyboard shortcuts" section of `stories/Accessibility.mdx`.

---

## TASK-FREE2-12 — "Open in playground" on every component docs page

**Decision: inject one generated, per-component playground affordance into the
autodocs template globally — no per-page authoring.** The REPL (`DzRepl`) and
StackBlitz launcher (`OpenInStackblitz`) already existed but surfaced only on
`GettingStarted` and the family Overview MDX pages; every one of the 139+ component
docs pages — where "let me try this with my own props" actually fires — was a
navigation hop away from a sandbox with that component loaded.

**Mechanism — a custom `docs.page`, not a `docs.container`.** `.storybook/preview.ts`
sets `parameters.docs.page` to `stories/_blocks/AutodocsPage.ts`, a byte-for-byte
mirror of Storybook 10.5's built-in `DocsPage` (Title / Subtitle / Description /
Primary / Controls / Stories) with an `<OpenInPlayground/>` block injected right after
the primary demo. `docs.page` applies to **autodocs (tag-generated) pages only** — MDX
guide pages (Introduction, the family Overviews, Contributing) supply their own page
and are untouched — so the affordance is scoped to component pages with no page-type
sniffing. Verified on the real static build: the four MDX pages checked carry **0**
playground panels; `core-buttons-dzbutton--docs` carries **1**. A `docs.container`
wrapper was rejected because it wraps *every* docs page (guides included) and would
have needed a `filterByAutodocs` guard to do what `docs.page` does for free.

Because `AutodocsPage` mirrors an arrangement that is not itself contractual (the
blocks it composes are stable public API; their order is not), a future Storybook
major could drift it. `verify-repl.mjs` asserts the playground renders on real
component pages, so a drift that drops the injection fails CI.

**Payload — derived, never hand-added.** `scripts/build-playground-snippets.mjs`
turns each component's `@example` (`.vue` header — the same source `build-llms.mjs`
mines) into a self-contained SFC: it imports the `Dz*` components the fragment uses,
declares the refs/handlers its bindings reference, and replaces unknown placeholder
tags (`<SearchIcon/>`, `<UserIcon/>` — unresolvable in the sandbox) with a neutral
glyph. Every wrapped SFC is **compile-validated with `@vue/compiler-sfc`** (the REPL's
own compiler); anything that fails converts to a fallback. Measured on this tree: of
159 components, **114 ship their own converted example**, 42 a compound subpart falls
back to its **parent's** example (so `DzTableRow` opens the full `DzTable` example, in
context), and 3 (`DzIcon`, `DzEmoji`, `DzTransfer`) fall back to their **family
starter** — never a broken or empty preload.

**Why the generated file is committed** (unlike the gitignored `_data/*.generated.ts`
siblings): the docs block that reads `playgroundSnippets.generated.ts` is reachable
from `.storybook/preview.ts`, which the Vitest `storybook-test` CI job loads with **no
generation step**. A gitignored import there would make that job structurally red —
the exact trap the landing's untracked generated files hit. So the file is committed
and a CI drift-guard (`build:playground-snippets` + `git diff --exit-code`) keeps it a
pure function of the component sources.

**Performance.** The inline `DzRepl` is collapsed behind a "Try it live" toggle and
lazy-mounts only on click — booting `@vue/repl` eagerly on all 139 pages would be a
real regression. The StackBlitz launcher already loads its SDK on click.

**CI.** `verify-repl.mjs` gained a cross-family sample — one simple (`DzButton`), one
compound (`DzTable`), one form control (`DzSelect`): it opens each docs page, expands
the playground, and asserts the derived snippet actually mounts in the sandbox
(compile-validation proves a snippet parses; this proves it runs).
