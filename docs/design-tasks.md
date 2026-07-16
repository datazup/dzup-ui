# dzup-ui — Design Review Tasks (Core · Landing · Storybook)

> **Status:** Specification. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Last updated:** 2026-07-09
> **Source:** [`design-review.md`](./design-review.md) (review date 2026-07-08). That doc
> is the *analysis*; this doc is the *execution*. Every task below cites the review item
> it closes.
>
> **The through-line:** every finding in the review has the same shape — **claims that
> outrun enforcement**. The infrastructure exists (contrast gate, a11y ratchet, DESIGN.md
> emitter, live-stats composable); the ratchet has never been pulled. These tasks pull it.
>
> **Companion docs:** [`tasks.md`](./tasks.md) (Storybook Sprint 0 — the machinery
> TASK-DS-05/06 finish), [`new-features.md`](./new-features.md) (app upgrades; same prompt
> format), [`storybook-decisions.md`](./storybook-decisions.md) (TASK-X.3 = the a11y gate,
> TASK-0.15 = the Figma deferral), [`landing.md`](./landing.md) (landing spec).

---

## How these tasks are written

Each task is a **ready-to-run prompt** for a coding agent, authored per Anthropic's
prompt-engineering guidance:
[be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct),
[use XML tags](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/use-xml-tags),
[give Claude a role](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts),
[let Claude think](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-of-thought),
and [multishot examples](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/multishot-prompting).

Concretely, every block carries:

| Element | Why |
|---|---|
| `<role>` | System-prompt-style persona, set before the task. Sharpens domain judgment. |
| `<task>` | One sentence. What to produce, phrased as an imperative. |
| `<motivation>` | The *why* and the context an agent can't infer. Explaining intent measurably improves the output. |
| `<requirements>` | Nested, named sub-tags — each a discrete constraint the agent can check itself against. |
| `<steps>` | Ordered, sequential. Gives the model room to think and work in order. |
| `<example>` | Concrete shape of the output where prose is ambiguous. |
| `<success_criteria>` | The definition of done. If it can't be checked, it isn't in here. |

Instructions are phrased as **what to do**, not what to avoid. Copy a prompt block
verbatim into an agent to execute it.

```xml
<repo_conventions source="CLAUDE.md + ADR-04 / ADR-17 — authoritative">
  <packages>
    packages/tokens — canonical source of truth. primitives/{colors,typography,spacing,radius,shadows,transitions,z-index,breakpoints}.ts
      → semantic/{light,dark}.ts → components/*.ts. `generate.ts` emits tokens.css AND the repo-root DESIGN.md
      (via design-emit.ts, a pure/testable emitter, + design-narrative.md, the prose with <!-- dz:* --> placeholders).
    packages/tooling — token-checks/{oklch-contrast,design-md-check,color-lint}.ts. Dependency-free WCAG math; the
      contrast gate that asserts DESIGN.md's own advertised pairs. Vitest specs live alongside.
    packages/core — 205 .vue components in a FLAT per-family layout (11 families). Styling via tv() in *.variants.ts.
    packages/contracts — types only, zero runtime deps. Frozen variant/size/tone taxonomies (ADR-02).
  </packages>
  <apps>
    apps/storybook — Storybook 10, @storybook/vue3-vite. preview.ts sets a11y `test: 'todo'` globally.
      Per-family enforcement opts in by spreading `a11yError` from packages/core/stories/_shared/a11y.ts.
      175 story files in packages/core/stories/{family}/; shared helpers in stories/_shared/; MDX guides in
      apps/storybook/stories/; doc blocks in apps/storybook/stories/_blocks/.
    apps/landing — Vite + Vue 3 + vue-router. Sections in src/components/, static facts in src/config.ts,
      live stats in src/composables/useLiveStats.ts. Dogfoods core: an --lp-* layer built on top of --dz-* primitives.
  </apps>
  <styling>
    Token-only (ADR-04): every CSS value references var(--dz-*). No raw hex/rgb()/hsl(), no hardcoded Tailwind
    color classes (bg-blue-500, text-gray-600), no <style scoped> in core components. This rule applies to
    STORIES and LANDING code too — they are the docs surface and the shop window.
  </styling>
  <a11y>WCAG 2.2 AA. Keyboard reachable, visible focus rings (--dz-ring), semantic landmarks, honor
    prefers-reduced-motion. Verify light AND dark.</a11y>
  <validation>
    `yarn lint` RUNS (the "missing ../eslint.config.shared.js" claim is stale — corrected 2026-07-09),
    but exits 1 on 107 pre-existing style errors in 12 files, none of them stories. Treat a NEW lint error
    in a file you touched as a real failure; do not treat the pre-existing 107 as your regression.
    Primary gates: `yarn typecheck` (0 errors; note it skips stories/apps), `yarn test` (vitest — 1 known
    win32 failure in interaction-contract.spec.ts is the green baseline), `yarn validate:tokens`
    (color-lint + DESIGN.md contrast + intent-text contrast),
    `yarn workspace @dzup-ui/storybook build` and `... test-storybook` for the docs side,
    `yarn workspace @dzup-ui/landing build` for the landing side, and `vue-tsc -p apps/landing/tsconfig.json`
    for landing types (the build skips vue-tsc).
    Do not claim a task passes without a clean run of the relevant gate.
  </validation>
  <honesty>
    This repo's failure mode is documentation that overstates enforcement. When a task cannot fully deliver,
    scope back the CLAIM in prose to match what is actually gated — never leave a claim half-backed.
  </honesty>
</repo_conventions>
```

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done
> **Priority:** 🔴 P0 (makes an existing claim true) · 🟠 P1 (structural debt) · 🟢 P2 (polish)

---

# Part A — Core: make the guarantees real

## 🔴 P0 — Close the claim/enforcement gap

### [x] TASK-DS-01 — Extend the contrast gate to every pair DESIGN.md advertises

> **Landed 2026-07-09.** `buildContrastPairs()` now asserts **94 pairs** (was 22),
> intents looped so a new intent extends the gate automatically. Failure messages
> name both tokens, the theme, both ratios, and the WCAG SC. Regressing
> `--dz-primary-muted-foreground` reddens the suite with
> `contrast(light): … = 2.40:1, requires 4.5:1 (WCAG 2.2 AA, 1.4.3 body text)`.
>
> **Scoped back, per `<honesty>`:** the task assumed `--dz-border` would pass at
> 3:1. It measures **1.63:1** on the page (`--dz-input-border` 2.00:1,
> `--dz-input-placeholder` 2.88:1, `--dz-disabled-foreground` 2.34:1). Rather
> than lower a threshold or gate a failing pair, the gate covers **text at 1.4.3
> + the focus ring at 1.4.11**, and `design-narrative.md` now states plainly
> which tokens are *not* contrast-gated. Raising the border tokens is a palette
> change — it belongs to TASK-DS-10.

_Closes review item **#3**. Gap: `buildContrastPairs()` in
`packages/tooling/src/token-checks/design-md-check.ts` asserts ~22 pairs, but DESIGN.md
states "Documented pairs meet **WCAG AA**" for a wider set — the `{intent}-muted` /
`{intent}-muted-foreground` family, `--dz-link`, and `--dz-foreground` on
card/popover/surface are **ungated**. They pass today (~7–8:1); nothing stops a regression._

```xml
<role>You are a design-systems engineer who owns the accessibility guarantees of @dzup-ui/tokens. Follow <repo_conventions> exactly.</role>

<task>Extend buildContrastPairs() in packages/tooling/src/token-checks/design-md-check.ts so the contrast gate asserts every foreground/background pair that DESIGN.md advertises as WCAG AA, in both light and dark themes.</task>

<motivation>DESIGN.md is the portable art-direction contract consumed by AI tools that cannot run the MCP, and it states plainly that documented pairs meet WCAG AA. Today ~22 pairs are asserted while the advertised set is larger, so the headline guarantee rests partly on pairs nothing checks. The uncovered pairs pass today at roughly 7–8:1 — this is not a bug hunt, it is regression-proofing. The math (oklch-contrast.ts) and the harness already exist; only the pair list is short. Cheap to do, and it converts a prose promise into a build-time fact.</motivation>

<requirements>
  <coverage>Assert, for BOTH light and dark: every `{intent}-muted-foreground` on `{intent}-muted` (primary, secondary, success, warning, danger, info, neutral); `--dz-link` on `--dz-background` and on `--dz-surface`; `--dz-foreground` on `--dz-card`, `--dz-popover`, and `--dz-surface`; and `--dz-muted-foreground` on `--dz-muted`.</coverage>
  <thresholds>Body text and UI text at AA (4.5:1). Where a pair is legitimately large-text-only or a non-text boundary (e.g. `--dz-border`), assert the applicable threshold (3:1) and record which WCAG success criterion it maps to in a comment, so the number is never arbitrary.</thresholds>
  <derivation>Derive the pair list from the token definitions programmatically wherever an intent family is uniform (loop the intents), so adding a future intent extends the gate automatically. Enumerate by hand only the genuinely bespoke pairs.</derivation>
  <failure_output>When a pair fails, the assertion message must name the two tokens, the theme, the measured ratio, and the required ratio — an agent or a human should be able to fix it without opening the test.</failure_output>
  <warning_exception>The `warning` intent ships bespoke `-solid` / `-solid-hover` tokens instead of the uniform state set. Handle it explicitly in this task (assert its real pairs) and leave the normalization itself to TASK-DS-09.</warning_exception>
</requirements>

<steps>
  1. Read design-md-check.ts and oklch-contrast.ts; list the pairs currently asserted.
  2. Read DESIGN.md plus packages/tokens/src/semantic/{light,dark}.ts and list every pair the file advertises as AA.
  3. Diff the two lists. Write the missing pairs into buildContrastPairs(), looping intents where uniform.
  4. Extend design-md-check.spec.ts to cover the new pairs, including one deliberately-failing fixture that proves the failure message is legible.
  5. Run `yarn test` and `yarn typecheck`. If any newly-gated pair actually fails, fix the TOKEN (or narrow the DESIGN.md claim) — never loosen the threshold to make the test pass.
</steps>

<example name="failure message shape">
  ✗ contrast(light): --dz-warning-muted-foreground on --dz-warning-muted = 3.91:1, requires 4.5:1 (WCAG 2.2 AA, 1.4.3 body text)
</example>

<success_criteria>Every pair DESIGN.md advertises as AA is asserted in light and dark; `yarn test` is green; deliberately regressing a semantic token in semantic/light.ts turns the suite red with a message naming both tokens and both ratios.</success_criteria>
```

---

### [x] TASK-DS-02 — Make DESIGN.md faithful: emit motion, z-index, and breakpoint tokens

> **Landed 2026-07-09.** `buildMotion` / `buildLayers` / `buildBreakpoints` added
> to `design-emit.ts`, spliced at `<!-- dz:motion -->`, `<!-- dz:layers -->`,
> `<!-- dz:breakpoints -->`; `motion:`, `layers:` and `breakpoints:` added to the
> YAML front matter; `buildOverview` counts all three from source. `generate` is
> idempotent (verified: re-run produces no diff).
>
> `buildMotion` and `buildLayers` **throw** on an unmapped easing/layer, so
> adding a token to `primitives/` without documenting what it is *for* fails the
> build — that is the "test that fails if a token is added" the task asked for.
>
> **Prose corrected:** the narrative claimed motion is "150–300 ms". The real
> scale is **150–500 ms** (`slower: 500ms`), and the emitted range is now derived
> from `DURATIONS` rather than typed. The task's example table (`--dz-z-modal:
> 1400`) was hypothetical; the real scale is 0–1080 and the "what belongs here"
> column was written against the actual components (no `DzDrawer` exists).

_Closes review item **#4**. Gap: `design-emit.ts` exports `buildOverview`, `buildColors`,
`buildTypography`, `buildSpacing`, `buildElevation`, `buildShapes`, `buildComponents` —
and **nothing** for `primitives/transitions.ts`, `primitives/z-index.ts`, or
`primitives/breakpoints.ts`. All three are real, CSS-emitted token families. The narrative
prose even claims "Motion is quick and functional (150–300 ms)" while emitting no motion
table. The file exists to be the channel for tools that can't run the MCP; omitting a
family makes it undiscoverable to exactly that audience._

```xml
<role>You are a design-systems engineer who owns DESIGN.md, the portable token contract for AI tools that cannot run @dzup-ui/mcp. Follow <repo_conventions> exactly.</role>

<task>Add motion/easing, z-index (layering), and breakpoint sections to the generated DESIGN.md by writing buildMotion, buildLayers, and buildBreakpoints builders in packages/tokens/src/design-emit.ts, following the existing builder pattern exactly.</task>

<motivation>DESIGN.md is deliberately high-level, but "high-level" is not the same as "incomplete." Three whole token families — transitions/easing, z-index, breakpoints — are emitted into tokens.css and consumed by real components, yet are invisible in the one file that external tools (Stitch, Figma Make, a fresh Claude session with no MCP) read. Worse, the hand-written narrative asserts a motion policy ("150–300 ms") that no table substantiates, which is the same claims-outrun-enforcement pattern this review is fixing. Every value in DESIGN.md is auto-derived from the token source today; these three sections must be too, so they can never drift.</motivation>

<requirements>
  <pattern>Mirror the existing builders precisely: a pure function `buildX(input: DesignMdInput): string` returning a Markdown fragment, unit-tested in design-emit.spec.ts, injected into design-narrative.md at a new `<!-- dz:motion -->` / `<!-- dz:layers -->` / `<!-- dz:breakpoints -->` placeholder. Values come from the token source — never retyped.</pattern>
  <motion>Emit duration tokens (`--dz-duration-*`) and easing curves (`--dz-ease-*`) as a table, plus a one-line usage rule per curve (e.g. which is for enter vs exit). Verify the narrative's "150–300 ms" claim against the emitted durations; if the real range differs, correct the PROSE to match the tokens.</motion>
  <layers>Emit the `--dz-z-*` scale as an ordered table (lowest → highest) with what occupies each layer (dropdown, sticky, overlay, modal, popover, toast), so an AI consumer stacks a new surface correctly instead of inventing `z-index: 9999`.</layers>
  <breakpoints>Emit the breakpoint scale with min-widths and the mobile-first authoring rule.</breakpoints>
  <front_matter>Add the new families to the YAML front matter where they belong (a `motion:` and `breakpoints:` key), so machine consumers get them without parsing Markdown tables.</front_matter>
  <overview_counts>Update buildOverview's summary line so the counted families include motion/layers/breakpoints, keeping the counts glob- or source-derived rather than hardcoded.</overview_counts>
</requirements>

<steps>
  1. Read design-emit.ts end to end; note how buildElevation sources values and how design-narrative.md's placeholders are substituted.
  2. Read primitives/{transitions,z-index,breakpoints}.ts and confirm the exact exported shapes.
  3. Write buildMotion, buildLayers, buildBreakpoints. Add matching unit tests to design-emit.spec.ts asserting each renders every token from its source (a test that would fail if a token were added and the builder not updated).
  4. Add the three placeholders + surrounding prose to design-narrative.md, and the front-matter keys.
  5. Run `yarn workspace @dzup-ui/tokens generate`, then `yarn test` and `yarn typecheck`. Diff the regenerated DESIGN.md and confirm every emitted value matches its primitive.
</steps>

<example name="layers table shape">
  | Token | Value | Occupied by |
  | --- | --- | --- |
  | `--dz-z-dropdown` | 1000 | DzDropdownMenu, DzSelect listbox |
  | `--dz-z-modal` | 1400 | DzDialog, DzSheet |
</example>

<success_criteria>DESIGN.md contains motion, layering, and breakpoint sections whose every value is traceable to a primitives/*.ts export; `yarn workspace @dzup-ui/tokens generate` is idempotent (re-running produces no diff); the narrative's motion claim matches the emitted durations; `yarn test` green.</success_criteria>
```

---

### [x] TASK-DS-03 — Auto-derive component/block/template counts and fix the stale layout docs

> **Landed 2026-07-09.** Counts are glob-derived in `design-md.ts`
> (`catalogCounts()`), fed to `buildOverview` + a new `<!-- dz:catalog -->`
> placeholder. Adding a `.vue` and re-running `generate` moves every published
> number; verified by adding and removing a probe component.
>
> **Counting rule — two counts, each labelled** (decision, 2026-07-09):
> `components` = **205**, every exported `.vue` including compound sub-parts;
> `documented` = **139**, components with a docs page of their own. Neither ever
> appears without its rule beside it. Landing shows `documented`; DESIGN.md
> publishes both.
>
> **The drift was worse than the review found:** 147, 155, 158, 163 and 205 were
> all in circulation. Swept: `CLAUDE.md`, `DESIGN.md`, `config.ts` FACTS (now
> `COMPONENTS.length`), `AiIdePage.vue` (now `BLOCKS.length` / `TEMPLATES.length`),
> `packages/mcp/README.md` (literal removed — a non-generated file cannot hold a
> derived number honestly).
>
> **Two findings the review missed:**
> 1. `CLAUDE.md` did **not** describe a nested layout — it was already flat. The
>    real defect was the heading ("File layout per component") plus `index.ts`
>    listed per-component when there are exactly **11**, one per family. Fixed
>    against disk, including that `.tokens.ts`/`.variants.ts` are optional.
> 2. `build-component-index.ts` matched `Core/<Family>/<Dz…>` with a single group
>    segment, silently dropping `DzRunStatusBadge` and `DzTokenProgressBar`
>    (filed under `Core/Feedback/App-Specific/…`) from ⌘K search. The "137" the
>    palette reported was a **bug, not a rule**. Fixed → 139, with
>    `generated/componentIndex.spec.ts` asserting the title-parser and the
>    filename-glob can never diverge again.

_Closes the review's `Docs` row. Gap: DESIGN.md says "158 components"; CLAUDE.md says
"155 `.vue` files" **and** describes a nested per-component folder layout. Reality:
**205 `.vue` files**, flat within each family. The token counts in DESIGN.md are already
auto-derived — the component counts are not, and they have drifted._

```xml
<role>You are a docs-tooling engineer for the dzup-ui monorepo. Follow <repo_conventions> exactly.</role>

<task>Replace every hand-maintained component/block/template count in the generated docs with a glob-derived count, and correct CLAUDE.md's stale component count and file-layout description.</task>

<motivation>Hand-maintained counts always drift, and these already have: three files state three different numbers (158, 155, and the real 205). Because DESIGN.md and CLAUDE.md are the primary context an AI agent loads before writing dzup-ui code, a wrong layout description actively misleads — an agent told to expect `buttons/DzButton/DzButton.vue` will not find it, because the real layout is flat (`buttons/DzButton.vue`). The token counts in DESIGN.md are already derived at generate-time, so the pattern to copy is in the same file.</motivation>

<requirements>
  <derivation>Count `.vue` files under packages/core/src/components, blocks under apps/landing/src/blocks, and templates under apps/landing/src/templates at generate/build time. Feed the results into buildOverview and the DESIGN.md "Depth channel" paragraph the same way the token counts flow today.</derivation>
  <subparts>Decide and document one counting rule: whether Reka compound sub-parts (DzCardBody, DzTabTrigger, …) count toward the headline number. State the rule beside the number so the figure is interpretable rather than merely large. Apply the same rule everywhere the count appears.</subparts>
  <claude_md>Correct CLAUDE.md: the component count, and the "File layout per component" section — replace the nested-folder example with the real flat layout, verified against packages/core/src/components/buttons/.</claude_md>
  <sweep>Grep the repo for other stale counts (Introduction.mdx, README, landing config.ts FACTS, llms.txt generators) and route each to the derived source rather than editing the literal.</sweep>
</requirements>

<steps>
  1. `find packages/core/src/components -name '*.vue' | wc -l` and confirm the real number; list one family directory to confirm the flat layout.
  2. Add the glob-derived counts to the tokens generate step, alongside the existing token counts.
  3. Regenerate DESIGN.md; confirm the counts change with the filesystem, not with an edit.
  4. Fix CLAUDE.md's count and layout section against the verified reality.
  5. Sweep for remaining literals; wire them to the derived source. Run `yarn test`, `yarn typecheck`, and both app builds.
</steps>

<success_criteria>Adding a new .vue component and re-running generate updates every published count with no hand edit; CLAUDE.md's layout section matches what is actually on disk; no file in the repo states a component count that disagrees with another.</success_criteria>
```

---

### [~] TASK-DS-04 — Wire live GitHub stars + npm downloads into `SocialProof.vue`

> **Partially landed 2026-07-09 — blocked on publication, not on code.**
>
> The review was out of date: `build-stats.ts` already existed, was already wired
> ahead of `vite build`, and `SocialProof.vue` already consumed `useLiveStats`.
> What was actually missing — and is now done — is the CLS discipline, the
> freshness affordance, and the accessible names:
>
> - **CLS:** each figure reserves its formatted width (`--reserve`, in `ch`)
>   before `DzCountUp` tweens 0 → value, with `font-variant-numeric: tabular-nums`.
> - **A11y:** each tile's accessible name is a full phrase ("139 free components"),
>   set on the anchor, not a bare number on the figure.
> - **Freshness:** live tiles carry `title="As of the last site build, 2 Jul 2026"`.
> - **Dead state removed:** `FACTS.githubStars` / `FACTS.npmDownloads` were
>   hardcoded `null` and read by `TopNav.vue`, so the star pill could *never*
>   render a count. Both fields deleted; `TopNav` now reads `useLiveStats`.
> - **Fail-safe proven:** with the APIs unreachable, `build-stats.ts` keeps the
>   last-known values and exits 0.
>
> **The success criterion "all 5 stat tiles show real numbers" cannot be met
> today.** `api.github.com/repos/dzup-ui/dzup-ui` → **404**;
> `registry.npmjs.org/@dzup-ui/core` → **404**. Neither the repo nor the package
> is published, so there is no real number to show. Both tiles degrade to a
> call-to-action ("Star on GitHub" / "Install from npm") rather than a fabricated
> figure. **The task closes itself the day those two are published** — no code
> change required; the next build bakes the numbers in.

_Closes review item **#5** (social-proof half). Gap: 5 stat tiles ship on the home page,
but `githubStars` and `npmDownloads` are hardcoded `null` — 2 of 5 render a static
fallback. `apps/landing/src/composables/useLiveStats.ts` already exists and is
uncommitted/unwired._

```xml
<role>You are a Vue + Vite front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Render real GitHub star and npm weekly-download counts in SocialProof.vue by wiring the existing useLiveStats composable, reserving layout width so the numbers cannot cause layout shift.</task>

<motivation>Social proof only works with real numbers — a stat tile that renders a placeholder undermines the four tiles beside it that are true. The composable (src/composables/useLiveStats.ts) already exists; config.ts already reserves FACTS.githubStars / FACTS.npmDownloads as null. What is missing is the wiring and, critically, the CLS discipline: numbers that arrive after paint will reflow the tile row unless their width is reserved, and the landing has a Lighthouse CI budget of CLS < 0.1 that this must not break.</motivation>

<requirements>
  <fetch>Prefer build-time fetch (a script run before `vite build`) so the static site ships real numbers with no per-visit API call and no rate-limit exposure. Guard every network call: a failed or rate-limited API must fall back to the last-known value and let the build succeed. Never let a marketing page break a build.</fetch>
  <cls>Reserve the tile's width before the number resolves — a min-width sized to the widest plausible value, a tabular-nums font-variant, or a skeleton of the same box. Verify against the existing landing-perf CI budget (LCP < 2.5s, CLS < 0.1) rather than assuming.</cls>
  <display>Use the existing CountUp motion component for the count-in, and honor prefers-reduced-motion by rendering the final value immediately. Give each tile an accessible label ("12,400 GitHub stars"), not a bare number.</display>
  <freshness>Show the numbers as of the build (e.g. a title attribute with the fetch date) so a stale static number is honest rather than falsely live.</freshness>
</requirements>

<steps>
  1. Read useLiveStats.ts, config.ts FACTS, and SocialProof.vue; identify why the composable is currently unused.
  2. Add the build-time fetch script and wire it into the landing `build` script before `vite build`.
  3. Wire SocialProof.vue to the real values; reserve widths; add the accessible labels.
  4. Simulate a failed fetch (unset the token / point at an unreachable host) and confirm the build still succeeds with a fallback value.
  5. Run `yarn workspace @dzup-ui/landing build` and `vue-tsc -p apps/landing/tsconfig.json`. Verify light and dark.
</steps>

<success_criteria>All 5 stat tiles show real numbers; a network failure during build degrades to the last-known value instead of erroring; the landing-perf CI job still passes its CLS budget.</success_criteria>
```

---

# Part B — Storybook: pull the ratchet

## 🔴 P0 — The a11y gate has never engaged

### [x] TASK-DS-05 — Clear story-authoring token debt (codemod + lint rule)

> **Landed 2026-07-09.** 124 of 175 story files rewritten by a re-runnable codemod
> (`yarn codemod:story-colors` → `packages/codemods/src/transforms/story-color-tokens.ts`,
> 29 unit tests). **1,089 raw color utilities + 269 untokenized borders → 0.**
> The gate is `color-lint.ts`, already wired into `yarn validate:tokens`.
>
> **The mapping is derived, not eyeballed.** Palette→intent came from OKLCH hue
> distance against the intent ramps: `blue`→primary (Δ2°), `red`→danger (Δ2°),
> `violet`→secondary (Δ2°), `green`→success (Δ5°), `sky`→info (Δ5°),
> `yellow`→warning (Δ8°). `amber` (Δ17°) and `rose` (Δ13°) are mapped by **role**,
> documented as such. Everything ≥10° from an intent (`purple`, `teal`, `cyan`, …)
> stays decorative and maps to the primitive ramp `--dz-colors-{palette}-{shade}` —
> a semantic token would invert with the theme and destroy the demo.
>
> The codemod **refuses to guess**: it reported 21 literals it could not classify
> from their own class list (opacity modifiers, `dark:` variants, `text-white` over
> an undeclared surface) and exited non-zero until each was hand-resolved. It also
> validates that every token it emits exists in `tokens.css`.
>
> **Corrections to this task's own premises**, per `<honesty>`:
> - **`yarn lint` is not broken.** There is no missing `eslint.config.shared.js`;
>   the flat config resolves and runs. It exits 1 on **107 pre-existing style errors
>   in 12 files** (85 auto-fixable), **none of them in `*.stories.ts`**. Fixing those
>   is unrelated to this task, so the guard was added where it can actually gate
>   today: `color-lint.ts`, which `yarn validate:tokens` already runs in CI. The
>   root memory/doc claim was stale.
> - **`DzButton.stories.ts` had no raw color literal** — only a bare `border-t`.
>   The review's "even the flagship does it" is true for the border half only.
> - **The real root cause of the debt:** `color-lint.ts:39` *explicitly exempted*
>   `.stories.ts`, and never scanned Tailwind color classes at all — only
>   hex/rgb/hsl. Both fixed. Its `var(--dz-…)` line exclusion is now applied to raw
>   CSS values only, because a class list normally carries a token *and* a raw
>   literal on the same line.
>
> **Legitimate exceptions, each documented at the call site:**
> `packages/core/stories/_gallery/freestyle/*.vue` (8 files) are the deliberate
> raw-Tailwind visual target the token system is measured against — marked
> `token-check-disable-file`. Two data sites (`DzCodeBlock` code sample,
> `DzQRCode` SVG data-URI) carry `token-check-disable-next-line`.
>
> **Bugs found and fixed on the way:** four `var()` references to tokens that are
> defined nowhere — `--dz-sidebar-header-text`, `--dz-sidebar-footer-text`,
> `--dz-colors-text-muted`, and `var(--dz-colors-border,#e5e7eb)` (whose hex
> fallback therefore always applied).

_Closed review item **#2**, and unblocked TASK-DS-06. Gap: **112 of 175** story files
used raw Tailwind grays (`text-gray-*`, `bg-gray-*`), and 269 class lists carried an
untokenized `border` — an ADR-04 violation *inside the docs surface*, and the dominant
`color-contrast` axe failure._

```xml
<role>You are a refactoring engineer for the dzup-ui design system. Follow <repo_conventions> exactly.</role>

<task>Codemod every raw color literal and untokenized border out of packages/core/stories/**, then add a lint rule that prevents them from returning.</task>

<motivation>ADR-04 forbids raw colors, and the stories are the surface where consumers LEARN the system — a story that reaches for text-gray-500 teaches the exact habit the ADR exists to prevent. It is also the direct blocker for enforcement: raw grays are the dominant source of axe `color-contrast` failures, and those failures are why no family can flip to `a11yError` (TASK-DS-06). Fixing 115 files by hand is error-prone and slow; a codemod plus a rule is fast, complete, and self-maintaining. The mapping is mechanical because every gray already has a semantic equivalent.</motivation>

<requirements>
  <mapping>Establish the mapping from the semantic tokens, not by eye: `text-gray-{400..600}` → `text-[var(--dz-muted-foreground)]`; `text-gray-{700..900}` → `text-[var(--dz-foreground)]`; `bg-gray-{50,100}` → `bg-[var(--dz-muted)]`; bare `border-t`/`border-b`/`border` → the same plus `border-[var(--dz-border)]`. Where a story's intent is genuinely a non-semantic decorative swatch (a color-palette demo), leave it and add a one-line comment saying why.</mapping>
  <codemod>Write the transform as a script under packages/codemods so it is reviewable, re-runnable, and reusable — not a shell one-liner run once. Report the files it changed and the literals it could not classify, and fail loudly on the latter rather than guessing.</codemod>
  <lint_rule>Add an ESLint rule that fails on raw color literals (hex, rgb(), hsl(), and the Tailwind color-class families) in `**/*.stories.ts`. Note that `yarn lint` is currently broken repo-wide (missing ../eslint.config.shared.js) — fix that config as part of this task, or the rule you add can never run. If fixing it is out of scope, wire the check as a vitest assertion instead and say so explicitly in the PR description.</lint_rule>
  <verification>Both themes. A story that looked right in light mode with text-gray-600 may now be the only thing that reads correctly in dark — check the diff visually, don't just trust the build.</verification>
</requirements>

<steps>
  1. Enumerate the offending files and the distinct literals in use: grep packages/core/stories for the Tailwind color families and bare border utilities.
  2. Build the literal → token mapping table from packages/tokens/src/semantic/{light,dark}.ts. Get it reviewed before running anything.
  3. Write the codemod; dry-run it; inspect the unclassified list and hand-resolve each.
  4. Apply. Run `yarn workspace @dzup-ui/storybook build` and spot-check ~10 stories in light and dark.
  5. Add the lint rule (fixing the eslint shared-config path if needed) and confirm it fails on a deliberately reintroduced `text-gray-500`.
</steps>

<example name="the transform">
  - <p class="text-sm text-gray-500 border-t pt-4">Helper text</p>
  + <p class="text-sm text-[var(--dz-muted-foreground)] border-t border-[var(--dz-border)] pt-4">Helper text</p>
</example>

<success_criteria>Zero raw color literals remain in packages/core/stories (excluding commented, intentional palette demos); the lint or vitest guard fails when one is reintroduced; `storybook build` is green and stories read correctly in both themes.</success_criteria>
```

---

### [x] TASK-DS-06 — Advance the a11y ratchet: flip the first family to `a11yError`

> **Landed 2026-07-09. Cards is enforced; the ratchet has moved one notch.**
>
> **The audit was run for real**, not estimated: global flipped to `'error'`, all
> 175 story files scanned in headless Chromium, then reverted. Failing stories per
> family — Buttons **0**, Overlays 1, Compositions 3, Media 3, Typography 9,
> Feedback 13, Layout 14, Inputs 26, Navigation 36, Data 39, Forms 82, Cards **3**.
>
> **Cards picked** (3 failing stories vs Typography's 9), and all three were
> `color-contrast`. Driving them to zero needed a **component** fix, not a story
> patch: `DzText`, `DzCaption`, `DzRelativeTime` and `DzStatCard` rendered
> `--dz-{intent}` as a *text* colour — 3.69–4.38:1 on `--dz-background` in light,
> below AA. They now use `--dz-{intent}-muted-foreground` (7.31–10.25:1). That one
> root-cause fix also cleared **6 of Typography's 9** for free.
>
> Two story-markup fixes: a `--dz-primary-subtle` chip (a token that does not
> exist, so it always fell back to `--dz-muted` at 3.41:1) → the real
> `primary-muted` pair; and a warning badge → `--dz-warning-solid`.
>
> **The gate is proven, not assumed.** With `a11yError` spread into all four Cards
> metas, injecting `text-[var(--dz-border)]` into `DzCard`'s Default story turns
> `storybook-test` red with axe's real computed colours
> (`#b5b7bb` on `#ffffff` = 2:1, needs 4.5:1); reverting turns it green (37/37).
> Per-family scoping is proven too: 152 `color-contrast` findings remain across the
> ungated families and the job still exits 0.
>
> **Ruleset already correct:** `preview.ts` pins `wcag22aa`, so the "WCAG 2.2 AA"
> claim was already backed. No change needed.
>
> **A token defect this surfaced:** `--dz-warning-foreground` on `--dz-warning` is
> **3.51:1** in light — a solid fill pair that fails AA. `--dz-warning-solid` exists
> for exactly this (8.44:1). That is the asymmetry **TASK-DS-10** must normalize.
>
> **Deviation from this task's `<family_choice>`, stated plainly:** it says "do not
> start with buttons." Buttons in fact audits at **0 violations** and is now the
> cheapest next notch. Cards was still flipped, per the instruction to advance
> *exactly one* notch and start narrow. Buttons is recorded as next.
>
> The per-family rollout recipe is written into `Accessibility.mdx`.

_Closed review item **#1** (highest impact) and advanced `storybook-decisions.md`
**TASK-X.3** from blocked → in progress (1 of 11 families). Gap: the entire per-family
enforcement machine was built — `stories/_shared/a11y.ts` exports `a11yError`,
`preview.ts` sets the global to `test: 'todo'`, the Vitest browser runner and CI job
exist — and **`a11yError` was spread by zero stories**._

```xml
<role>You are an accessibility engineer for the dzup-ui design system. Follow <repo_conventions> exactly.</role>

<task>Advance the a11y ratchet by exactly one notch: pick the cleanest family, drive its axe violations to zero, spread a11yError into its story metas, and make CI fail on a regression there.</task>

<motivation>dzup-ui advertises WCAG AA as a headline guarantee and has built every piece of machinery needed to enforce it — the addon, the browser runner, the per-family opt-in constant, the CI job — and has never once used them. `a11yError` appears in zero story files. The point of this task is not breadth, it is PROOF: one family that genuinely fails CI on a real violation converts an aspirational claim into a working gate, and makes every subsequent family a repetition rather than a research project. Start narrow so the loop is provably closed before it is widened.</motivation>

<requirements>
  <family_choice>Pick Typography or Cards — the two with the smallest interactive surface and the fewest portalled overlays. Justify the pick in one line. Do not start with buttons or overlays.</family_choice>
  <audit>Run the real audit (`yarn workspace @dzup-ui/storybook test-storybook`) and read the actual violations. Fix the ROOT cause: if the violation is in the component, fix the component; if it is in the story's own markup, fix the story. Fix the component even when patching the story would silence the report faster.</audit>
  <false_positives>Where a finding is a genuine false positive (a deliberately low-contrast decorative element), disable that ONE rule at the story level with a comment naming the rule and the reason. Never blanket-disable a rule, and never disable at the preview level.</false_positives>
  <flip>Spread `a11yError` (from stories/_shared/a11y.ts) into that family's story metas. Confirm CI actually reddens by introducing a temporary violation, watching the job fail, then reverting.</flip>
  <docs>Update apps/storybook/stories/Accessibility.mdx so its family table shows the flipped family as ✅ Enforced and the rest honestly as 🔍 Audit. Record the per-family rollout recipe you just executed, so the next family is a checklist and not a rediscovery. Update storybook-decisions.md TASK-X.3 from blocked to in-progress with the real state.</docs>
  <ruleset>Confirm the axe ruleset includes WCAG 2.2 AA tags, not only the axe defaults (which stop at 2.1). If it does not, set it — the docs claim 2.2.</ruleset>
</requirements>

<steps>
  1. Confirm TASK-DS-05 has landed (raw grays are the dominant color-contrast source; auditing before it wastes the pass).
  2. Run the a11y audit across all families and record the per-family violation counts. Pick the cleanest; state the count.
  3. Fix that family's violations at the root. Re-run until zero.
  4. Spread a11yError into the family's metas. Prove CI fails by regressing one story on purpose, then revert.
  5. Update Accessibility.mdx and storybook-decisions.md to describe exactly what is enforced — no more.
</steps>

<example name="meta opt-in">
  import { a11yError } from '../_shared'
  const meta = { title: 'Core/Typography/DzHeading', parameters: { ...a11yError } }
</example>

<success_criteria>One family runs at `test: 'error'` with zero violations; a deliberately introduced violation in that family fails the storybook-test CI job; Accessibility.mdx claims enforcement for exactly that family and no other; the rollout recipe is written down.</success_criteria>
```

---

## 🟢 P2 — Docs maturity

### [x] TASK-DS-07 — Resolve the half-claimed Figma integration

> **Landed 2026-07-10. Path B (scope back).** Ground truth established by asking:
> **no Figma library for dzup-ui exists**, and none is in progress.
>
> **The placeholders were worse than blank.** `addon-designs` parses a Figma URL
> with `/figma\.com\/([\w-]+)\/([0-9a-zA-Z]{22,128})/` — the file key must be 22+
> *alphanumeric* characters. `dzup-ui-design-system` is 21 characters and contains
> hyphens, so it never matched: all three "flagship seeds" (`DzButton`, `DzCard`,
> `DzInput`) and the `<Figma>` embed in `Buttons.mdx` rendered a **broken iframe**,
> not a frame. A blank panel reads as *scope*; a broken one reads as *neglect*.
>
> **The repo was already breaking its own rule.** `Contributing.mdx` said "Do not
> point it at a placeholder file; an empty panel is the honest signal" — while the
> three most-visited stories did exactly that.
>
> Removed: the 3 `design` params, the `<Figma>` embed + its import, the
> `REPLACE_ME` seed in `Dz.stories.template.ts`, and the "Design source" section
> claiming the button family "is specified in Figma." Rewritten:
> **Contributing → Design reference** now leads with the ground truth and states
> that the code (variants, tokens, stories) is the source of truth.
> **ComponentStatus** explains that its Design column reads `—` for every
> component *by design*, rather than leaving an empty column to read as a gap.
>
> **Kept deliberately:** the addon stays installed and `design` stays wired
> through `componentStatus.ts`. The Sprint-0 reasoning holds — the convention
> costs nothing unused, and the first real frame is a one-line story change. The
> Design column *is* the coverage tracker Path A would have needed; it reads zero.
>
> Decision + rationale recorded in `storybook-decisions.md` TASK-0.15.
> `yarn workspace @dzup-ui/storybook build` green.

_Closes the review's **"one decision worth making now."** `@storybook/addon-designs` is
installed and the docs claim frames are "linked from each component's Design panel," but
only **3 stories** carry (placeholder) node-ids — the panel is blank for ~150 components.
This is the claims-vs-enforcement pattern in miniature, and it needs a decision, not code._

```xml
<role>You are a design-systems lead deciding the scope of the Figma integration. Follow <repo_conventions> exactly, especially <honesty>.</role>

<task>Choose one of two paths for the Figma integration and execute it fully: either seed real frame URLs across the component catalog, or scope the documentation language back to what is actually linked.</task>

<motivation>@storybook/addon-designs is installed (TASK-APP-05) and Contributing.mdx presents the `design` parameter as a convention, but only 3 stories have node-ids and those are placeholders. A visitor opening the Design panel on any of ~150 components sees nothing, which is worse than an absent panel: it reads as neglect rather than as scope. Half-claimed is the one state not worth staying in. Both paths below are respectable; leaving it as-is is not.</motivation>

<requirements>
  <path_a name="commit">If a real Figma library exists or will exist: seed frame URLs family by family, starting with the flagship components (DzButton, DzInput, DzCard, DzDialog). Add the `design` parameter to the story template so new stories inherit the expectation. Track coverage in the Component Status dashboard's Design column (it already has one) so the gap is legible rather than invisible.</path_a>
  <path_b name="scope_back">If no Figma library exists: remove the "linked from each component's Design panel" claim from the docs, keep the addon installed but describe it accurately (e.g. "flagship components link their Figma frame; the rest are unlinked"), and drop or clearly mark the 3 placeholder node-ids so nobody mistakes them for real frames.</path_b>
  <decision_record>Whichever path: write the decision and its rationale into storybook-decisions.md as an update to TASK-0.15, with the date. A reader six months from now should be able to see why.</decision_record>
</requirements>

<steps>
  1. Establish the ground truth: does a maintained Figma library for dzup-ui exist? Ask; do not assume.
  2. Pick the path that the answer forces.
  3. Execute it fully — including the Component Status Design column and the Contributing.mdx wording.
  4. Record the decision in storybook-decisions.md; run `yarn workspace @dzup-ui/storybook build`.
</steps>

<success_criteria>The Design panel's behavior matches what the docs say it does, for every component. storybook-decisions.md records which path was taken and why.</success_criteria>
```

---

### [x] TASK-DS-08 — Storybook maturity pass: untagged stories, the `beta` tier, and `*Parts` anatomy

> **Landed 2026-07-10.** Two of this task's three premises were measurably stale.
>
> **`UNTAGGED_COUNT` was 2, not "nonzero and unbounded":** `DashboardCard` and
> `FormComposition`. Their three siblings in `stories/compositions/` already carried
> `status:stable`, so this was an inconsistency, not a category error. Tagged by
> evidence — both ship `play()` tests, neither has a TODO, and every component they
> compose is `stable`. **Now 0, and enforced:**
> `packages/tooling/src/validators/story-status.ts` (+11 tests) fails CI when any
> `Core/<Family>/<Component>` story carries zero or two `status:*` tags, or when a
> `deprecated` component names no replacement. Proven by removing a tag and watching
> the suite redden with the file name and a fixable message.
>
> **"Only Cards ships a `*Parts` story" was false — 19 already existed**, including
> five of the six the task asks for (Dialog, Sheet, Table, Sidebar, the menu family).
> Only **Accordion** was missing; `DzAccordionParts.stories.ts` is written against
> its real API (root owns `type`/`collapsible`/`variant`/`size`; sub-parts read
> context via `DZ_ACCORDION_KEY`), with `play()` tests asserting Reka's real output
> (`aria-expanded`, the `region` labelled by its trigger, `type="multiple"`
> independence).
>
> **One genuine coverage hole found by measuring, not by reading the task:** of 64
> storyless components, 62 appear on a `*Parts` page and `DzDescriptionsItem` appears
> 22× in its parent's own story — but **`DzTableFooter` is exported from
> `@dzup-ui/core` and appeared in zero stories.** Added to `DzTableParts` with a
> story that asserts the summary row lands in `<tfoot>`, not `<tbody>`.
>
> **The `beta` tier: defined, not deleted.** Investigated first — *every* component
> has a `.contract.spec.ts` and nearly all have `play()` tests, so neither can
> discriminate `beta` from `experimental`. The tiers are a human judgment about API
> risk; the defect was that the judgment was undocumented. `status.ts` now types
> `entry` / `exit` on every tier and states them. The one mechanically observable
> criterion is real and load-bearing: **every `stable` component is listed on its
> family Overview page and no `beta` or `experimental` one is** (verified 5/5 vs
> 0/11) — that is the `beta → stable` exit rule.
>
> **Scoped back, per `<honesty>`:** the criteria are *reviewer-applied*, not
> machine-derived, and both `status.ts` and ComponentStatus.mdx say so. CI enforces
> that a tag exists and is well-formed — it cannot decide whether a `stable`
> component deserves to be. `deprecated` has **0 members**, which is a fact (nothing
> is scheduled for removal), not a gap; the tier is retained because it is the
> ladder's terminal state and the migration table depends on it.
>
> ComponentStatus.mdx now states plainly that sub-parts are documented through their
> parent, so "64 storyless components" is never read as a coverage hole again.

_Closes the review's sequenced item **#10**. The 64 "storyless" components are Reka compound
sub-parts documented through their parent — correctly, and **not** a real gap. What is a gap:
`UNTAGGED_COUNT` is nonzero, the `beta` status tier is barely used (so it carries no
information), and only Cards ships a `*Parts` anatomy story._

```xml
<role>You are a Storybook docs engineer for the dzup-ui design system. Follow <repo_conventions> exactly.</role>

<task>Drive UNTAGGED_COUNT to zero, make the four-tier status taxonomy meaningful, and add *Parts anatomy stories for the remaining compound families.</task>

<motivation>The status taxonomy (experimental | beta | stable | deprecated) is the library's honesty mechanism, and it only informs anyone if every component carries a tag and each tier means something. Today some stories are untagged and `beta` is applied so rarely that a reader cannot tell whether it means "nearly stable" or "nobody has triaged this." Separately, DzCardParts.stories.ts is an excellent pattern — it documents a compound component's anatomy in one place — and six other compound families have no equivalent, which is exactly why their sub-parts read as "missing stories" to anyone counting.</motivation>

<requirements>
  <tagging>Bring UNTAGGED_COUNT to 0. Tag by evidence — a component with a play() test, a stable API, and a clean a11y audit is `stable`; one with a TODO in its source or an unresolved contract question is `experimental`. Do not tag everything `stable` to clear the counter.</tagging>
  <beta_tier>Either define `beta` precisely in _shared/status.ts (one sentence: what must be true to enter and to leave it) and apply it to the components that meet that definition, or remove the tier and migrate its members. A tier nobody can apply consistently is noise.</beta_tier>
  <parts_stories>Add `*Parts.stories.ts` for Dialog, Sheet, Table, Sidebar, Accordion, and the menu family, following packages/core/stories/cards/DzCardParts.stories.ts: an anatomy diagram, each sub-part shown in situ, and the composition rules. Confirm the Component Status dashboard then counts them as documented.</parts_stories>
  <honesty>Update the docs to state plainly that sub-parts are documented through their parent, so the "64 storyless components" figure is never read as a coverage hole again.</honesty>
</requirements>

<steps>
  1. Read _shared/status.ts and the Component Status dashboard's parser; list the untagged stories.
  2. Tag them by evidence, family by family; resolve the beta-tier question first, since it changes what some tags should be.
  3. Write the six *Parts stories against the DzCardParts pattern.
  4. Run `yarn workspace @dzup-ui/storybook build`; confirm the dashboard shows 0 untagged and the new anatomy pages.
</steps>

<success_criteria>UNTAGGED_COUNT is 0; every tier in the taxonomy has a written entry/exit definition and at least one member (or has been removed); all seven compound families have a *Parts anatomy story.</success_criteria>
```

---

# Part C — Structural debt

## 🟠 P1 — Duplication and asymmetry

### [x] TASK-DS-09 — Hoist the duplicated reduced-motion blocks; ban `<style scoped>` in core

> **Landed 2026-07-10. Zero `<style scoped>` blocks remain under `packages/core/src`.**
>
> **The global rule already existed.** `tokens.css` ends with an *unlayered*
> `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { … !important } }`.
> Unlayered `!important` on `*` beats every component declaration, so the 26 local
> copies were not merely duplicated — they were **already dead**. Nothing needed
> hoisting; the blocks needed deleting. That also disproves one worry: `DzSidebar`
> carries transition classes and *no* reduced-motion query, and was never a bug —
> the global rule always covered it.
>
> **Mechanism (one, as required): the global stylesheet, not `motion-reduce:`.**
> `motion-reduce:` would have to be added to every animated utility in every
> `*.variants.ts` — the same duplication in different syntax — and it cannot reach
> Vue `<Transition>` classes or Reka's `[data-state]` animations, which are not
> authored in `tv()` at all. The policy lives where it already lived.
>
> **Classified before deleting** (a script that *refuses* to strip a block carrying
> anything beyond the reduced-motion query): **17 pure duplicates** removed
> outright; **10 carried real CSS**, hand-migrated into
> `packages/core/src/styles/base.css` — the hand-authored, layered sheet, not the
> generated `tokens.css` (`ADR-17`: tokens owns token families, not behavioral CSS).
> Hoisted: the `dz-dialog-*` / `dz-sidebar-overlay-*` transition classes (whose
> names are **public API** via `overlayTransition` / `contentTransition`, and which
> were duplicated between `DzDialogContent` and `DzDialogOverlay`), `DzTabTrigger`'s
> close-button chrome, `DzProgress`'s indeterminate keyframes, and the input
> autofill/selection resets — now applied through `inputElementVariants` rather than
> a nested `input` selector.
>
> **Three bugs found on the way, all of the same family — `var()` fallbacks masking
> tokens that do not exist:**
> - `--dz-spacing-0-5` **is not defined**; `var(--dz-spacing-0-5, 0.125rem)` always
>   fell through. The scale has no half-step, so the value is now derived:
>   `calc(var(--dz-spacing-1) / 2)`.
> - `DzInput` shipped raw colors inside its scoped block — `var(--dz-primary, #6366f1)`
>   and `color: white` — invisible to `color-lint`, which never scanned `<style>`.
>   Now `--dz-primary` / `--dz-primary-foreground`.
> - `.sr-only` was defined **only** inside `DzSpinner`, while a dozen other core
>   components render `.sr-only` and silently depended on the *consumer's* Tailwind
>   to define it. It is now declared once in `base.css`, making the library correct
>   standalone.
>
> **One specificity trap caught by reading, not running:** `.dz-tab-close-btn:hover`
> (0,2,0) needs its `!important` to beat `[data-state='active'][data-closable]
> .dz-tab-close-btn` (0,3,0). Dropping it would have left the button at 50% opacity
> on hover over an active closable tab. Preserved, with the reason written down.
>
> **The guard:** `packages/tooling/src/validators/scoped-style.ts` (+7 tests) fails
> on any `<style>` block under `packages/core/src`, and does **not** trip on the
> literal `<style>` inside `DzThemeProvider.vue`'s doc comment. Proven by
> reintroducing a block into `DzCard.vue` and watching CI name the file and line.
>
> `yarn typecheck` 0 errors; 1271 tests green across the five affected families.

_Closes review item **#7**. Gap: **27 core components** carry a `<style scoped>` block, most
of them a byte-identical `@media (prefers-reduced-motion: reduce)` rule — an ADR-04
violation replicated 26 times, and 26 places a future motion policy would have to be
changed._

```xml
<role>You are a refactoring engineer for @dzup-ui/core. Follow <repo_conventions> exactly.</role>

<task>Replace the ~26 duplicated per-component reduced-motion <style scoped> blocks with a single global rule, delete the blocks, and add a CI check that fails on any <style scoped> in packages/core.</task>

<motivation>ADR-04 says components style through tv() variants and never through <style scoped>. Twenty-seven components violate it, and most violate it identically: the same prefers-reduced-motion media query, copy-pasted. Beyond the ADR, this is a maintenance trap — the reduced-motion policy lives in 26 places, so it will drift, and a 27th component added tomorrow will copy the 27th block. One global rule in the tokens CSS layer (or a standardized `motion-reduce:` prefix in the variants) expresses the policy once. The CI check is what makes it stay expressed once.</motivation>

<requirements>
  <inventory>First enumerate the 27 files and diff their style blocks. They are not all identical — some carry component-specific rules alongside the reduced-motion query. Classify each before deleting anything, and handle the non-identical ones individually.</inventory>
  <global_rule>Hoist the shared reduced-motion policy into the tokens CSS layer (packages/tokens) or standardize on Tailwind's `motion-reduce:` variant inside each *.variants.ts. Pick one and state why; do not ship both mechanisms.</global_rule>
  <equivalence>For each component you strip, verify the motion behavior is unchanged with the OS reduce-motion setting both on and off. A component whose animation was suppressed by its own block and is now suppressed by the global rule must behave identically — check, don't assume.</equivalence>
  <ci_guard>Add a check (vitest assertion or lint rule) that fails when `<style scoped>` appears anywhere under packages/core/src. Prove it fails by adding one temporarily.</ci_guard>
</requirements>

<steps>
  1. `grep -rl '<style scoped>' packages/core/src/components`; diff the blocks; classify identical vs bespoke.
  2. Implement the single global mechanism; verify it applies to one component before touching the rest.
  3. Strip the identical blocks; hand-migrate the bespoke ones into their *.variants.ts.
  4. Verify motion behavior with reduce-motion on and off, in light and dark.
  5. Add the CI guard; prove it fails; run `yarn typecheck`, `yarn test`, and the storybook build.
</steps>

<success_criteria>Zero `<style scoped>` blocks under packages/core/src; the reduced-motion policy is expressed exactly once; a reintroduced block fails CI; no component's motion behavior changed.</success_criteria>
```

---

### [~] TASK-DS-10 — Normalize the `warning` intent and de-duplicate the near-identical palettes

> **Landed 2026-07-10: half (a) done in full. Half (b) declined, with measurements.**
>
> ## (a) `warning` normalized — option (a), every intent gets `-solid` / `-solid-hover`
>
> Chosen because the extra tokens are useful to more than warning: `--dz-warning-solid`
> was already being used **in every place the other intents use `--dz-{intent}`**
> (DzButton, DzChip, DzTag, DzAlert, DzBadge, DzProgress, DzToast, DzMeterGroup,
> DzKnob, DzScrollProgress, GovernanceBadge). The concept was uniform; only the name
> was bespoke.
>
> Added `--dz-{intent}-solid` / `-solid-hover` for the five remaining intents,
> resolving to the same shades `--dz-{intent}` / `-hover` already held, so **no
> published token changed color**. Added the missing `--dz-warning-hover`.
> Special-cases deleted from `buildContrastPairs()`, from 15 `*.variants.ts` /
> `*.tokens.ts` files, and from the `story-color-tokens` codemod.
>
> **Why the fill set has two states, not three.** Measured with the repo's own WCAG
> math: near-black `--dz-warning-foreground` on `--dz-warning` (shade 500) is
> **3.51:1** — the failing pair DS-06 predicted. Warning fills at shade 300 (8.44:1)
> and hovers to 400 (5.87:1). **There is no shade between 400 and 500**, so a darker
> pressed step cannot pass AA. A yellow solid fill with dark text physically affords
> two AA steps in this ramp. No intent gets `-solid-active`.
>
> **Claim narrowed, per `<honesty>`:** `--dz-{intent}-active` is now documented as a
> pressed *surface*, not a text-bearing fill. It has **zero consumers**, and
> `--dz-warning-active` could never carry `--dz-warning-foreground`. The gate went
> **94 → 84 pairs**: the 10 dropped are `{intent}-foreground` on `{intent}-active`
> for the five non-warning intents × 2 themes — shades 700/200, the highest-contrast
> steps (9.03–13.43:1), gating a combination nothing renders. No *color* lost
> coverage: `-solid` / `-solid-hover` resolve to exactly what `{intent}` / `-hover` did.
>
> **Behavior change, stated plainly:** solid `success` / `danger` / `info` hovers used
> a `/90` alpha shortcut while `primary` used its designed `-hover` shade. All tones
> now hover to `--dz-{tone}-solid-hover`. This is a real visual change, it aligns them
> with `primary`, and it puts every hover fill under the contrast gate — the alpha
> shortcut escaped it entirely. Changeset added.
>
> ## (b) Palette dedup — **not done. The premise does not survive measurement.**
>
> The task assumes the twins are "near-identical" from **hue alone**. But every palette
> shares one `LIGHTNESS_SCALE` and `CHROMA_MULTIPLIER`, so a pair differs by
> (base chroma, hue) — and the chroma gap is invisible to a hue comparison. Computing
> ΔE in Oklab (JND ≈ 0.02), worst shade per pair:
>
> | pair | Δhue | Δchroma | ΔE | verdict |
> |---|---|---|---|---|
> | `secondary`/`violet` | 2° | **0.060** | **0.0603** | 3.0× JND — visibly different |
> | `warning`/`yellow` | 8° | 0.010 | 0.0277 | 1.4× JND |
> | `success`/`green` | 5° | 0.020 | 0.0249 | 1.2× JND |
> | `primary`/`blue` | 2° | 0.020 | 0.0213 | 1.1× JND |
> | `info`/`sky` | 5° | 0.010 | 0.0161 | below JND |
> | `danger`/`red` | 2° | 0.010 | 0.0123 | below JND |
> | `neutral`/`slate` | 5° | 0.008 | 0.0081 | below JND |
>
> Only **3 of 7** are perceptually equivalent — not 6. Aliasing the other four would
> change published colors, which `<compatibility>` forbids.
>
> **And aliasing even the safe three is unsafe here.** `previewCustomiser.ts` re-skins
> by writing `--dz-colors-primary-<shade>: var(--dz-colors-<palette>-<shade>)` at
> runtime, and its preset list **contains `blue` and `violet`** — precisely the twins
> of `primary` and `secondary`. Aliasing decorative→intent would make picking "Blue"
> produce a **circular `var()`**, which CSS resolves to the guaranteed-invalid value:
> the whole primary ramp, and every semantic token derived from it, would blank out.
> Separately, `useThemeDesigner.ts` regenerates `--dz-colors-{intent}-*` for all seven
> intents, so any decorative→intent alias makes a user's intent retune silently drag
> their chart colors with it — defeating the documented purpose of the decorative ramp
> ("no semantic meaning on their own").
>
> **The stated success criterion is unreachable.** "tokens.css is measurably smaller"
> is false. Simulating the alias on the emitted file (33 properties, the three safe
> pairs): **raw 45,723 → 45,786 B (+63 B)**, **gzip 6,189 → 6,171 B (−18 B, −0.29%)**.
> `var(--dz-colors-danger-500)` is *longer* than the `oklch(…)` literal it replaces,
> and the repeated literals already gzip almost perfectly. There is no payload win.
>
> **Left in place, deliberately.** The near-twins are documented in `primitives/colors.ts`
> as intentional so nobody "fixes" them again. Revisit only if the preview/designer
> stop overriding the primitive ramps.

_Closes review item **#6**. Two smells: (a) `warning` breaks the uniform intent state-set
with bespoke `-solid` / `-solid-hover` tokens, forcing special-cases in `tv()` and in the
contrast gate; (b) 6 intent palettes each duplicate a decorative twin within ~2–5° of hue
(`primary` 260° / `blue` 258°, `danger` 25° / `red` 27°, …) — roughly **66 near-identical
primitive custom properties shipped twice**._

```xml
<role>You are a design-systems architect who owns the @dzup-ui/tokens intent contract. Follow <repo_conventions> exactly. Note that ADR-02 freezes the PUBLIC variant/size/tone taxonomies — this task changes the token layer beneath them, and must not change the public taxonomy.</role>

<task>Resolve the warning-intent asymmetry and collapse the six intent palettes that duplicate a decorative twin, without changing any public token name that consumers depend on.</task>

<motivation>An intent contract is only useful if it is uniform: every consumer — tv() variants, the contrast gate, the theme designer, an AI agent reading DESIGN.md — can assume that if `primary` has a token, `warning` has the same one. Today warning alone ships `-solid` / `-solid-hover`, so every consumer carries a special case, and each special case is a place to forget warning exists. Separately, six intent palettes sit within 2–5° of hue from a decorative twin, so the CSS ships ~66 primitive variables that are perceptually the same color under two names — pure payload with no expressive gain. Both are token-layer cleanups; neither should be visible to a consumer using the public API.</motivation>

<requirements>
  <warning_decision>Choose ONE and apply it completely: (a) give every intent a `-solid` / `-solid-hover` pair, so the state-set is uniform and the special-cases disappear; or (b) formalize warning as a documented exception in @dzup-ui/contracts, typed so a consumer can discover it. Prefer (a) if the extra tokens are genuinely useful to more than warning; prefer (b) if they are not. State the reasoning.</warning_decision>
  <special_case_removal>Whichever path: remove the resulting special-cases from the tv() variants and from buildContrastPairs() (see TASK-DS-01), so the uniformity is load-bearing rather than decorative.</special_case_removal>
  <palette_dedup>For each intent/decorative pair within ~5° of hue, alias the decorative name onto the intent ramp rather than generating a second ramp. Measure the emitted tokens.css before and after and report the byte delta.</palette_dedup>
  <compatibility>Every currently-published `--dz-*` custom property must continue to resolve to a perceptually equivalent color. Aliasing is a token-layer change, not a rename — if a public name would disappear, keep it as an alias and note the deprecation path in the changeset. Add a changeset.</compatibility>
  <verification>Re-run the contrast gate (TASK-DS-01's expanded version) after the change: aliasing shifts hue by 2–5°, which can move a ratio across the 4.5:1 line. Do not assume the pairs still pass.</verification>
</requirements>

<steps>
  1. Read primitives/colors.ts; tabulate every intent and decorative palette with its hue, and identify the pairs within ~5°.
  2. Decide the warning question; write the reasoning into the ADR-17 notes or a new decision record.
  3. Apply the warning normalization; delete the special-cases it existed to serve.
  4. Alias the duplicate palettes; regenerate tokens.css; report the byte delta.
  5. Run the full contrast gate, `yarn test`, `yarn typecheck`, both app builds, and visually diff a themed page in light and dark. Add a changeset.
</steps>

<success_criteria>Every intent exposes the same state-set (or the exception is typed and documented in contracts); no `tv()` variant or contrast-gate entry special-cases warning; tokens.css is measurably smaller; every previously-published --dz-* name still resolves to a perceptually equivalent color; the expanded contrast gate is green.</success_criteria>
```

---

# Part D — Landing

## 🟠 P1 — Show the product

### [x] TASK-DS-11 — Hero v2: lead with the product, not the gradient

> **Landed 2026-07-10.** Live `ShowcaseFrame` (compact, `:glow="false"`) + a new
> `HeroCodePanel` sit above the fold; decorative layers 4 → 1; median LCP
> **1092ms → 948ms (−13%)**, CLS 0 → 0.
>
> **The review's "4 GPU-composited full-bleed layers" is wrong, and it matters.**
> Resolving every real compositing layer to its DOM node (CDP `LayerTree` +
> `DOM.describeNode`) shows the aurora, grid, spotlight and grain are **not**
> promoted — they paint into `section.hero`'s single layer. What *was* promoted:
> the seven `.hero-inner` children, by the staggered `hero-rise` keyframe. The
> layer cost came from the animation, not the decoration. Both are now gone; the
> page's composited layers went **35 → 17**.
>
> **Per-layer cost, measured, one build, suppressed at document-start**
> (Playwright, 1280×800, median of 6, unthrottled — Lighthouse's desktop preset
> is `cpuSlowdownMultiplier: 1`, and CDP CPU throttling suppresses
> `largest-contentful-paint` entries entirely, which is why the harness does not
> use it):
>
> | removed | LCP | Δ |
> |---|---|---|
> | — (baseline) | 772ms | — |
> | aurora | 720ms | −52ms |
> | aurora + grid + grain | 716ms | −56ms |
> | all four | 668ms | −104ms |
>
> The spotlight is the one kept: ~48ms, the same as the aurora, but with no
> `filter` and no `mix-blend-mode` (the grain's blend mode was forcing the one
> genuinely extra compositing layer), and it does the job that justifies a layer
> at all — focusing the LCP text.
>
> **Method note, because the first numbers lied.** A sequential before/after is
> worthless here: the same untouched v1 build measured **772ms** cold and
> **1032ms** twenty minutes later. All reported deltas come from *interleaved*
> runs against two `vite preview` servers (v1 and v2 side by side, alternating,
> warm-up discarded). Across four such A/Bs v2 won every time: −16, −60, −144,
> −120ms. This is a Playwright harness, **not** Lighthouse — the numbers are a
> same-machine comparison, not a CI-comparable absolute.
>
> **Accessibility improved as a side effect, and the reason is worth recording.**
> axe (serious+critical) went **11 → 6** desktop, **10 → 7** mobile. The hero's
> "Built with" list dimmed `--dz-foreground` to `opacity: 0.62` = **4.41:1**, and
> the re-theme mode pill measured **4.1:1**. axe had reported the first as
> *incomplete*, not *fail*, because the aurora and grain made the backdrop
> uncomputable. **The decorative layers were hiding a real contrast failure from
> the audit.** Nodes axe could not evaluate fell from 38 to 22. Also fixed:
> `ShowcaseFrame`'s window declared `role="img"` around a segmented control, a
> search input, a switch and buttons (`nested-interactive`) — now `role="group"`.
>
> **Scoped back, per `<honesty>`:**
> - The frame is **visible** above the fold, not **wholly contained** by it: it
>   occupies y=228…1001 at 1280×800, so ~570px of dashboard (window chrome,
>   toolbar, four stat cards, chart) reads above 800px and the members table
>   continues below. Both code blocks are visible. The success criterion says
>   "visible", and this is that — but it is not a frame that fits.
> - The `<decorative_budget>` asked each surviving layer to "justify itself
>   against the LCP measurement". The spotlight costs ~48ms and buys focus behind
>   the headline. That is a taste call backed by a number, not a number alone.
> - **The hero's Pro pill was removed** ("41 Pro components coming soon" → `/pro`).
>   It cost fold budget the product visual now uses. `/pro` remains in the nav and
>   in `FreeVsPro`, so the funnel is intact, but this is a deliberate deletion the
>   task did not ask for.
> - Beating the baseline required one change outside the hero: `ShowcaseDashboard`
>   now mounts its two frames through the existing `useLazyMount`. Without it, v2
>   was a wash (−16…−60ms, inside the ±60ms noise band) rather than a win.
>
> **Mobile:** the compact frame is never mounted below 1024px (`matchMedia`, not
> just CSS) — the `<product_visual>` requirement's sanctioned "gracefully reduced"
> path. The full side-by-side `ShowcaseDashboard` is the next section.

_Closes review item **#5** (hero half). Gap: the hero is a well-executed but **derivative**
2024-SaaS archetype — aurora + grid + grain + gradient headline — with **zero product visual
above the fold** and **4 GPU-composited full-bleed layers** competing behind the LCP text.
`ShowcaseDashboard.vue`, one section down, is the single strongest proof on the site.
A developer never sees `<DzButton>` in code on the home page._

```xml
<role>You are a Vue front-end + performance engineer on the dzup-ui landing app. Follow <repo_conventions> exactly.</role>

<task>Rebuild the hero to show the product above the fold: promote a compact ShowcaseDashboard, trim the decorative layers, and add an "install → import → use" code panel.</task>

<motivation>A component library's landing hero has one job: prove the components are good. Ours currently proves that we can build an aurora gradient — a visual archetype a visitor has seen on fifty SaaS sites this year, rendered by four full-bleed GPU-composited layers sitting directly behind the LCP text. Meanwhile ShowcaseDashboard.vue, the live split light/dark dashboard one scroll down, is genuinely excellent and unmistakably ours. Promoting it costs one section of scroll and buys the entire first impression. The code panel closes the other gap: a developer evaluating a Vue library wants to see the import and the JSX-equivalent within five seconds, and today the home page never shows one.</motivation>

<requirements>
  <product_visual>Promote a compact variant of ShowcaseDashboard into the hero, above the fold at 1280×800 and gracefully reduced (or lazily deferred) on mobile. It must remain LIVE real components, not a screenshot — that is the whole point of it.</product_visual>
  <decorative_budget>Reduce the full-bleed decorative layers from 4 to at most 1. Every remaining layer must justify itself against the LCP measurement, not against taste. The landing-perf CI job already asserts LCP < 2.5s and CLS < 0.1 — measure before and after and report both numbers.</decorative_budget>
  <code_panel>Add an "install → import → use" panel showing the real npm install command, the real import, and a real `<DzButton>` usage, with the package-manager tabs and copy button that already exist on block pages (PmCommandTabs). Reuse; do not rebuild.</code_panel>
  <motion>Honor prefers-reduced-motion for anything that remains. Transform/opacity only; no layout-affecting animation above the fold.</motion>
  <sequencing>Land this AFTER TASK-DS-04 (live stats) so the hero and the social-proof row are measured against the perf budget together, in one pass, rather than each blaming the other.</sequencing>
</requirements>

<steps>
  1. Measure the current hero: LCP, CLS, and the composited-layer count. Record the baseline numbers.
  2. Extract a compact ShowcaseDashboard variant; place it above the fold; verify it stays live and themed.
  3. Cut the decorative layers to ≤1; re-measure after each removal so you know which layer cost what.
  4. Add the code panel using the existing PmCommandTabs + copy-code components.
  5. Run `yarn workspace @dzup-ui/landing build` and the landing-perf CI job. Verify light, dark, and reduced-motion. Report before/after LCP and CLS.
</steps>

<success_criteria>A real dzup-ui component and a real code snippet are both visible above the fold at 1280×800; at most one full-bleed decorative layer remains; LCP and CLS are measurably better than the recorded baseline and inside the CI budget.</success_criteria>
```

---

### [~] TASK-DS-12 — Add testimonials / logo wall, and regroup the 9-item TopNav

> **Landed 2026-07-10. Nav done in full. Trust section shipped empty, on purpose.**
>
> ## Trust section — the `<social_proof_honesty>` path
>
> **No real testimonials or logos exist.** dzup-ui has no public users: the GitHub
> repo and the npm package are both unpublished (the same 404 that blocks
> TASK-DS-04 and makes `useLiveStats` degrade its star/download tiles). The only
> "Testimonials" in the repo is `src/blocks/marketing/Testimonials.vue` — demo
> block content, illustrative by design, and not evidence of anything.
>
> So `HomeTestimonials.vue` is built from `DzCard` / `DzAvatar` / `DzText` and
> renders **nothing** while `TESTIMONIALS` in `config.ts` is `[]`. Not a hidden
> section with a "coming soon" — literally no DOM. `HomeTestimonials.spec.ts`
> asserts (a) the list stays empty, so the day someone seeds a plausible-sounding
> quote the suite reddens, and (b) the section renders a labelled, attributed,
> source-linked card once real entries exist, so the scaffold is not dead code.
>
> **The home page therefore gains no visible trust signal.** That is the outcome
> the task chose in advance ("A fabricated testimonial is worse than an absent
> one"), but it is worth stating plainly: review item #5's trust gap is *closed as
> a decision*, not closed as a feature.
>
> ## TopNav — 9 flat items → 5, both defects fixed
>
> | before | after |
> |---|---|
> | Components → `/storybook/` | **Components** ▾ · All components `/storybook/` · Blocks · Templates · Animations |
> | Docs → `/storybook/?path=…getting-started` | **Docs** ▾ · Getting started · Design tokens · Theming · Accessibility · AI IDE setup · Contributing |
> | Ecosystem → `/#ecosystem` | *(removed — it duplicated its own children)* |
> | Blocks · Animations · Themes · AI IDE · Compare · Pro | **Themes** · **Compare** · **Pro** |
>
> `/templates` had a route and an Ecosystem tile but **no way into it from the
> header**; it now has one. `src/nav.ts` is the single source for the desktop
> menus and the mobile drawer, and `nav.spec.ts` gates ≤5 top-level entries and
> zero duplicate destinations.
>
> Menus are `DzDropdownMenu` (`:modal="false"`, so the page stays scrollable),
> and each item is a **real anchor** — `as-child` + `RouterLink` for in-app
> routes, `as="a"` for Storybook — verified in `TopNav.spec.ts`, because a
> `@select` handler alone would break middle-click and open-in-new-tab. Escape
> closes and returns focus to the trigger; the drawer closes on route change.
> Verified in a browser: Enter opens, ArrowDown roves, the `--dz-ring` focus ring
> lands on menu items, Escape restores focus. axe finds no violations on the nav
> in either the open-menu or open-drawer state.
>
> **Scoped back, per `<honesty>`:**
> - The `--dz-ring` ring on menu items comes from a **global** `.lp-menu-item` rule
>   in `tailwind.css`, not a `<style scoped>` block: `DzDropdownMenuContent`
>   portals its items to `<body>`. Core's own treatment is a focus *background*.
> - "Zero duplicate destinations" is gated across nav entries and menu items. The
>   header CTA still points at `/storybook/`, the same target as
>   *Components → All components*. A call-to-action restating the primary
>   destination is intentional, and it is not a nav entry — but it is a repeat, and
>   the gate does not cover it.
> - `aria-current="true"` on a menu **trigger** (a `<button>`, not a link) marks
>   "the current page is inside this group". `aria-current="page"` is left to the
>   `RouterLink` leaves, where it belongs.
>
> ## Two `@dzup-ui/core` bugs found while doing this — both fixed, both changeset'd
>
> - **`DzDropdownMenu`'s `defaultOpen` never worked.** It was declared on
>   `DzDropdownMenuProps`, never forwarded to Reka's `DropdownMenuRoot`, *and*
>   `defineModel<boolean | undefined>('open')` declared `open` as a Boolean prop
>   with no default — so Vue boolean-cast the unbound value to `false`, Reka read
>   "controlled and closed", and the menu was pinned shut. Forwarding alone was not
>   enough; the model needed `{ default: undefined }`. Click-to-open was unaffected
>   (the local model fed the value back), which is why nothing noticed. The prop's
>   doc comments were also wrong — `modal` was documented as "controlled open
>   state". Regression tests added.
> - **`DzCodeBlock`'s language chip fails AA** at **3.64:1** (`--dz-muted-foreground`
>   on a 10% `--dz-foreground` fill). Now `--dz-foreground`. `yarn validate:tokens`
>   cannot see this: `intent-text-contrast` only gates `--dz-{intent}` text on
>   `{intent}-muted` fills.

_Closes the remainder of review item **#5** and sequenced item **#7**. Gap: the home page has
no testimonials and no logo wall — the two most conventional trust signals — and `TopNav.vue`
carries a flat 9-item bar in which Components and Docs point at the same Storybook target,
and Ecosystem duplicates its own children._

```xml
<role>You are a Vue front-end engineer on the dzup-ui landing app. Follow <repo_conventions> exactly, especially <honesty>.</role>

<task>Add a testimonials or logo-wall section to HomePage.vue, and restructure TopNav.vue's flat 9-item bar into grouped menus with no duplicate destinations.</task>

<motivation>Two independent problems, both about legibility of the front door. First: the home page carries five stat tiles and no human proof — no quote, no logo, nothing that says another person uses this. Second: the nav has grown to nine flat items, of which "Components" and "Docs" resolve to the same Storybook target and "Ecosystem" duplicates the children listed beneath it. A nine-item bar with two duplicate destinations reads as a site that grew rather than a site that was designed.</motivation>

<requirements>
  <social_proof_honesty>Ship testimonials or logos ONLY if real ones exist. If they do not, ship the section scaffolded and empty behind a config flag rather than inventing a quote or displaying a logo without permission. A fabricated testimonial is worse than an absent one, and this repo's whole review theme is claims outrunning reality.</social_proof_honesty>
  <section>Build it from real @dzup-ui/core components (DzCard, DzAvatar — which requires an `alt`) so it inherits theming and a11y. Follow the landing block-authoring conventions: --dz-* tokens only, never the landing's --lp-* layer.</section>
  <nav_grouping>Restructure TopNav into grouped menus. Resolve the two real defects explicitly: Components and Docs must not point at the same target (merge them, or differentiate the destinations), and Ecosystem must not duplicate its own children. Aim for ≤5 top-level items.</nav_grouping>
  <nav_a11y>Menus must be keyboard navigable with correct ARIA (use DzDropdownMenu / DzMenu rather than hand-rolling), have a visible focus ring (--dz-ring), and mark the current route with aria-current="page". Verify the mobile drawer too.</nav_a11y>
</requirements>

<steps>
  1. Ask whether real testimonials/logos exist and are cleared for use. Let the answer decide scaffold-vs-ship.
  2. Build the section from core components; verify in light and dark; run the landing a11y suite.
  3. Map every current nav item to its destination; identify the duplicates; design the ≤5-item grouping.
  4. Rebuild TopNav with DzDropdownMenu/DzMenu; verify keyboard flow, aria-current, and the mobile drawer.
  5. Run `yarn workspace @dzup-ui/landing build` and `vue-tsc -p apps/landing/tsconfig.json`.
</steps>

<success_criteria>The home page carries a real trust section or an honestly-empty scaffolded one — never a fabricated quote; TopNav has ≤5 top-level items, zero duplicate destinations, full keyboard navigation, and aria-current on the active route.</success_criteria>
```

---

# Part E — The a11y ratchet, to the end

### [~] TASK-DS-13 — Pull the a11y ratchet through every remaining family

_Filed by free-apps-audit **TASK-FREE-06**, which required "a tracked, ordered
follow-up with the per-family counts, so the ratchet has a visible finish line."
This is that tracker. Depends on TASK-DS-06 (the recipe) and the `--dz-warning`
token fix recorded under TASK-DS-10(a)._

> **2026-07-16: Buttons, Overlays, and Media are enforced — 4 of 11 families,
> with Cards.** What landed with this notch:
>
> - **The token defect is fixed at the token.** `--dz-warning` moved from shade
>   500 to shade 400 in the light theme (dark already sat at 400), so
>   `--dz-warning-foreground` on `--dz-warning` measures **5.87:1** in both
>   themes (was 3.51:1). Measured with `packages/tooling/src/token-checks/
>   oklch-contrast.ts`; asserted by the DESIGN.md contrast gate
>   (`yarn validate:tokens`, 96 pairs ≥ AA). Trade-off recorded in
>   `semantic/light.ts`: as a decorative accent on the light page the bare
>   intent colour drops to ~2.34:1 — a non-text use the gate deliberately does
>   not assert; icon-only warning graphics belong on a muted surface.
> - **Component fixes, not story patches:** `DzQRCode` no longer puts
>   `role="img"` on its root (the `expired` refresh button was a focusable
>   descendant of an image — `nested-interactive`); `DzCarouselDots` wraps each
>   dot in a ≥24×24px hit target (`target-size`, WCAG 2.2). Contract specs
>   updated to pin both.
> - **`a11yDisableRules` was a silent no-op and is now real.** It only emitted
>   `config.rules` (axe.configure), but the global gate pins `options.runOnly`
>   by WCAG tag, and axe re-selects tag-matched rules regardless of a
>   configure-time disable. The helper now also emits the `options.rules`
>   override, which is the only thing that beats `runOnly`. Its first use is
>   `DzCarousel`'s vertical story (dots obscured inside the transform viewport —
>   needs a layout redesign, disabled for `target-size` only, justified inline).
> - The no-op `a11y: { test: 'todo' }` story override in
>   `DzSplitButton.stories.ts` is gone.

**The ordered remainder**, failing stories re-derived 2026-07-16 by flipping the
global to `'error'` over all 176 story files in headless Chromium (the run
`Accessibility.mdx` now reports). Flip in this order; fix root causes in
components per the DS-06 recipe:

| Order | Family | Failing stories | Dominant failure classes |
|---|---|---|---|
| 1 | Typography | 2 | `DzCode` `scrollable-region-focusable` ×2 — component fix |
| 2 | Compositions | 2 | |
| 3 | Layout | 12 | |
| 4 | Feedback | 13 | |
| 5 | Gallery (`stories/_gallery`) | 19 (7 files) | Cross-family demo stories — **never previously counted** in any backlog table |
| 6 | Inputs | 23 | Contrast + labelling |
| 7 | Data | 29 | `nested-interactive` + contrast |
| 8 | Navigation | 33 | ARIA structure (tabs/menu/stepper) |
| 9 | Forms | 74 | Labelling / ARIA structure |

Failure classes across the 207 failing stories (a story can hit several):
`color-contrast` 132 · `scrollable-region-focusable` 38 · `label` 19 ·
`button-name` 18 · `nested-interactive` 16 · `aria-required-parent` 15 ·
`aria-required-children` 13 · `aria-allowed-attr` 10 · `aria-hidden-focus` 5 ·
`target-size` 5 · others 12.

**End state:** every family enforced, then `preview.ts`'s global `a11y.test`
flips `'todo'` → `'error'` and the per-family opt-ins are deleted.

**Landing parity, stated honestly (per TASK-FREE-06):** the landing block suite
(`apps/landing/src/blocks/a11y.spec.ts`) runs under jsdom, which has no layout,
so axe reports `color-contrast` as *incomplete*, never *fail* — the 87 blocks
are **not** contrast-verified by any gate today. The blocks are token-only
(`--dz-*`), so the token-level contrast gate covers their defaults, but
story-specific combinations are unchecked. Browser-level coverage exists in
skeleton form: the Playwright landing run (`apps/landing/playwright.config.ts`)
already drives real Chromium against `/blocks` and could run axe there —
that is the right vehicle, and it is additional scope, not part of this tracker's
per-family flips.

---

## Summary — task map

| # | Task | Area | Type | Priority | Closes | Depends on | Status |
|---|------|------|------|----------|--------|------------|--------|
| 01 | Extend the contrast gate to every advertised pair | core | Enforcement | 🔴 P0 | review #3 | — | ✅ 94 pairs gated |
| 02 | Emit motion / z-index / breakpoint tokens into DESIGN.md | core | Fidelity | 🔴 P0 | review #4 | — | ✅ done |
| 03 | Auto-derive counts; fix CLAUDE.md layout + count | docs | Fidelity | 🔴 P0 | review "Docs" row | — | ✅ done |
| 04 | Live GitHub stars + npm downloads in SocialProof | landing | Credibility | 🔴 P0 | review #5 (half) | — | 🚧 blocked: repo + npm pkg unpublished (404) |
| 05 | Codemod story token debt + lint rule | storybook | Debt | 🟠 P1 | review #2 | — | ✅ 1,089 literals + 269 borders → 0 |
| 06 | Flip the first family to `a11yError` | storybook | Enforcement | 🔴 P0 | review #1 · TASK-X.3 | **05** | ✅ Cards enforced (1/11) |
| 07 | Resolve the half-claimed Figma integration | storybook | Decision | 🟢 P2 | review "one decision" | — | ☐ todo |
| 08 | Untagged stories, `beta` tier, `*Parts` anatomy | storybook | Docs | 🟢 P2 | review #10 | — | ☐ todo |
| 09 | Global reduced-motion rule + `<style scoped>` CI guard | core | Debt | 🟠 P1 | review #7 | — | ☐ todo |
| 10 | Normalize `warning`; de-duplicate palettes | core | Contract | 🟠 P1 | review #6 | **01** | 🌓 (a) done · (b) declined |
| 11 | Hero v2: product above the fold | landing | Differentiator | 🟠 P1 | review #5 | **04** | ✅ LCP −13%, decor 4→1 |
| 12 | Trust section + TopNav regrouping | landing | Polish | 🟠 P1 | review #5, #7 | — | 🌓 nav done · trust empty by design |
| 13 | Pull the a11y ratchet through every remaining family | storybook | Enforcement | 🟠 P1 | free-apps audit TASK-FREE-06 | **06**, 10(a) | 🌓 4/11 enforced · warning token fixed · 9 families remain (207 stories) |

### Findings for later tasks (discovered while doing 11–12)

- **[DS-11] The review's "4 GPU-composited full-bleed layers" was not true.** The
  four hero decorations painted into `section.hero`'s single layer. The seven
  promoted layers were the `hero-rise` entrance animation's targets. Resolving
  CDP `LayerTree` layers back to DOM nodes takes ten minutes and would have
  changed the framing of the task. Worth doing before the next perf claim.
- **[DS-11] Decorative layers can hide contrast failures from axe.** `color-contrast`
  returns *incomplete*, not *fail*, when it cannot resolve an element's backdrop —
  and a blurred aurora plus a `mix-blend-mode: overlay` grain layer defeat it.
  Removing them turned 16 "incomplete" nodes into evaluable ones and surfaced two
  genuine AA failures (4.41:1 and 4.1:1) that had been shipping. **Any page whose
  a11y story rests on axe should be audited with its decorative layers off.**
- **[DS-11] `aria-hidden-focus` × 6 on `ComponentGallery`'s `.tile-demo`** is the
  only serious axe violation left on the home page (desktop). Pre-existing,
  untouched, and now the largest single item on that page's a11y backlog.
- **[DS-11] `DzCodeBlock` fails `scrollable-region-focusable`** at narrow widths —
  the same defect already recorded below for `DzCode`. Its `content` slot is
  `overflow-x-auto p-4` with no `tabindex="0"`, so a keyboard user cannot scroll a
  long line. The fix belongs in the component, and it is a real API change: every
  code block in Storybook, blocks and landing becomes a tab stop. Its own task.
- **[DS-12] `defineModel<T | undefined>('open')` is a trap for Boolean props.**
  Vue boolean-casts an unbound Boolean prop to `false`, so a wrapper that forwards
  it to a headless primitive silently forces *controlled, closed*. `DzDropdownMenu`
  needed `{ default: undefined }`. `DzSidebar` is the only other component with a
  Boolean `defineModel` plus a `default*` prop, and it is safe (it does not forward
  to a Reka `default*`). Worth a lint rule if a third case appears.
- **[DS-12] `packages/core` overlay specs assert almost nothing.** `DzDropdownMenu`'s
  "accepts modal prop" test mounted the component and asserted `wrapper.exists()`.
  A dead public prop survived it. Contract specs that only check for a rendered
  root are how `defaultOpen` shipped broken.

### Findings for later tasks (discovered while doing 01–04)

- **[x] Subtle variants under-contrast in light mode — FIXED 2026-07-09** (was
  gating TASK-DS-06). `--dz-{intent}` is shade 500: a fill/border color. Used as
  text it failed AA both on its own subtle fill (**3.72–4.26:1**) and on the page
  background (**3.69–4.38:1**), in light mode, for all six intents. The tokens
  already carried the right color — `{intent}-muted-foreground` — and the
  components reached for the wrong one.

  Fixed across **17 files**: `DzButton` (outline · ghost · text · link),
  `DzBadge`, `DzChip`, `DzTag`, `DzAlert`, `GovernanceBadge`, `DzTree`,
  `DzListItem`, `DzMenu`, `DzTreeSelect`, `DzSelect`, `DzCombobox`,
  `DzMultiSelect`, plus the four `.tokens.ts` anatomy mirrors. Every changed pair
  now measures **7.31–10.25:1** (light) / **8.03–10.19:1** (dark). Solid fills
  (`{intent}-foreground` on `{intent}`) and borders (`{intent}` at SC 1.4.11)
  were deliberately left alone.

  Guarded by a new **`intent-text-contrast.ts`** check, wired into
  `yarn validate:tokens` and proven to fail on a reintroduced violation. The rule
  is stated in `CLAUDE.md` (#1b) and in the generated `DESIGN.md` Colors section.

  > **Not yet covered:** `--dz-{intent}` still appears as a text color on
  > *unknown* surfaces in ~50 other files. Some are legitimate — `DzSpinner` and
  > `DzRating` use it to drive `currentColor` for a **graphic** (SC 1.4.11, 3:1),
  > not text. Others are real AA failures on the page background (`DzCaption`
  > tone=danger at 4.38:1, `DzText`, `DzStatCard`, `DzTabs`). The gate is
  > deliberately scoped to the same-intent-on-muted pair so it stays true;
  > widening it needs the fill-vs-graphic-vs-text distinction that TASK-DS-10's
  > token normalization should introduce.
  >
  > **Verification limit:** axe's `color-contrast` rule cannot run under jsdom
  > (no computed colors), so the proof here is the OKLCH contrast math over the
  > resolved tokens, not an axe pass. Browser-level confirmation lands with
  > TASK-DS-06.
- **`DzToast` hardcodes `z-[100]`,** ignoring `--dz-z-toast` (1080). It therefore
  renders *below* every modal. Relevant to TASK-DS-09's token-only sweep.
- **`--dz-warning-active` is dead.** No variant consumes it, and at 3.51:1 under
  `--dz-warning-foreground` it could not be used as a solid fill anyway. Delete
  or define it in TASK-DS-10.
- **[DS-06] `--dz-warning` is unusable as a solid fill.** Measured:
  `--dz-warning-foreground` on `--dz-warning` = **3.51:1** (light), below AA.
  `--dz-warning-solid` gives 8.44:1 in both themes. Every other intent's
  `{intent}-foreground` on `{intent}` passes (4.54–6.93:1). This is the concrete
  cost of the warning asymmetry — **TASK-DS-10** should either make `-solid` the
  uniform state for all intents or darken `--dz-warning`.
- **[DS-06] The `--dz-{intent}`-as-text defect is broader than the four components
  fixed here.** `intent-text-contrast.ts` only gates the same-intent-on-muted pair.
  The full axe run shows **152 `color-contrast` findings** still open across the
  ungated families, most of them this same root cause on the *page* background
  (which the gate deliberately does not cover). Widening the gate needs the
  fill-vs-graphic-vs-text distinction TASK-DS-10 introduces.
- **[DS-06] Buttons audits at 0 violations** and is the cheapest next family to
  flip to `a11yError`. Overlays (1), Compositions (3), Media (3) and Typography (3,
  after the tone fix) follow.
- **[DS-06] `DzCode` fails `scrollable-region-focusable`.** Its `<pre>` has
  `overflow-x-auto` but no `tabindex="0"`, so a keyboard user cannot scroll a long
  snippet. Two typography stories fail on this; the fix belongs in the component.
- **[DS-05] `yarn lint` is NOT broken.** The flat config resolves; `eslint packages/`
  runs and reports **107 pre-existing errors across 12 files** (85 auto-fixable),
  **none in `*.stories.ts`**. Files: `mcp/*` (7), `stories/_gallery/*` (2),
  `core/src/components/media/index.ts`, `tokens/src/design-emit.spec.ts`,
  `tokens/src/design-md.ts`. Clearing them would make `yarn lint` a usable gate —
  worth a small task of its own. The `<validation>` note at the top of this file and
  the corresponding memory are both stale.
- **[DS-05] Four `var()` references to tokens defined nowhere** were found and fixed:
  `--dz-sidebar-header-text`, `--dz-sidebar-footer-text`, `--dz-colors-text-muted`,
  and `var(--dz-colors-border,#e5e7eb)` (hex fallback always applied). A repo-wide
  "every `var(--dz-*)` resolves" check would be cheap and is not currently in
  `validate:tokens` — `design-md-check` only validates the refs DESIGN.md itself
  names.
- **`interaction-contract.spec.ts` fails on Windows** (asserts `/` separators
  against a validator that returns `\`). Pre-existing on a clean `HEAD`; unrelated
  to these tasks, but it means `yarn test` is red for any win32 contributor.

**Suggested execution order** (from the review's own sequencing):

```
Week 1 (quick wins)     01 → 02 → 03 → 04
Sprint  (structural)    05 → 06   (in that order — 05 unblocks 06)
                        09 → 12
Next    (bigger bets)   11 → 10 → 08 → 07
```

---

## What this list deliberately does not include

The review's appendix identifies work that is **already correct** and must not be
"improved":

- **The 64 "storyless" components** are Reka compound sub-parts documented through their
  parent. This is the right pattern. TASK-DS-08 makes it *legible*; it does not add 64 stories.
- **The `--lp-*` landing layer** is genuine dogfooding built on top of `--dz-*` primitives,
  not a parallel token system. Leave it.
- **The OKLCH three-tier cascade, `design-emit.ts`'s purity, and the dependency-free
  contrast math** are the strongest things in the repo. Every task above extends them
  rather than replacing them.

---

## Sources

- **Method:** Anthropic prompt engineering —
  [Be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct) ·
  [Use XML tags](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/use-xml-tags) ·
  [System prompts / roles](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts) ·
  [Chain of thought](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-of-thought) ·
  [Multishot prompting](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/multishot-prompting)
- **Review:** [`design-review.md`](./design-review.md) (2026-07-08)
- **Prior art in this repo:** [`new-features.md`](./new-features.md) (same prompt format,
  18 tasks shipped) · [`tasks.md`](./tasks.md) (Storybook sprints) ·
  [`storybook-decisions.md`](./storybook-decisions.md) (TASK-X.3, TASK-0.15)
- **Standards:** [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) ·
  [axe-core rule descriptions](https://dequeuniversity.com/rules/axe/)
