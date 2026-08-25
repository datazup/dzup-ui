# dzup-ui — Free-Tier Apps Review #2 (`apps/landing` + `apps/storybook`)

> **Status:** Specification. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Review date:** 2026-07-15 · **Baseline:** working tree on top of `aa182d9` (branch `main`)
> **Scope:** the two public-facing free-tier apps — `apps/landing` and `apps/storybook`
> (plus the story corpus in `packages/core/stories/**`, which is the Storybook's content).
>
> **Method:** three independent sweeps on this checkout — a full `apps/landing` source review,
> a full `apps/storybook` + story-corpus review, and a measured re-run of every gate the first
> audit touched. Every claim below carries a `file:line` or a command result, and each was
> re-verified by hand before being written down. Nothing is inferred from documentation.
>
> **Relationship to other docs:** this is the follow-up to
> [`free-apps-audit.md`](./free-apps-audit.md) (TASK-FREE-01…18). That audit found the
> catastrophic tier: builds that could not run, a front door that 404'd, counts that lied.
> **Most of it is now fixed and verified below.** This review finds the next tier down:
> the internal scratch that ships to the public sidebar, the links that 404 *inside* the
> docs, the two-domain identity crisis, the gate that was declared done at 90%. It also adds
> the improvement tasks — the features that separate a good free tier from a top-tier one.
> [`design-tasks.md`](./design-tasks.md) (TASK-DS-*) and [`new-features.md`](./new-features.md)
> (TASK-APP-*) remain the design-system and app-feature backlogs.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
> **Priority:** 🔴 P0 (broken or regressed gates) · 🟠 P1 (user-visible defects & false claims) · 🟢 P2 (consistency, coverage & new capability)
> **Numbering:** `TASK-FREE2-*`, distinct from `TASK-FREE-*`, `TASK-DS-*`, `TASK-NF-*`, `TASK-APP-*`.

---

## Part 1 — Where the first audit stands (measured 2026-07-15)

Every gate was re-run on this checkout. The five tasks marked `[x]` in `free-apps-audit.md`
were **verified, not trusted**:

| Task | Verdict | Evidence |
|---|---|---|
| TASK-FREE-01 (emit `core.css`) | ✅ **Fixed** | `yarn build` exits 0; `packages/core/dist/core.css` = 16,937 B; all 11 family `components/*/index.js` chunks emitted. Storybook builds in 1 m 29 s; `public/playground/` holds `core.css` + `tokens.css` + `dzup-core.mjs` (correct names). |
| TASK-FREE-02 (loud landing build) | ✅ **Fixed** | `serve-storybook.ts` `closeBundle()` now **throws** on a missing/empty `storybook-static/index.html`; escape hatch is `LANDING_SKIP_STORYBOOK=1` with a loud banner. `yarn workspace @dzup-ui/landing build` exits 0 and `dist/storybook/index.html` exists. |
| TASK-FREE-03 (REPL + `verify-repl` in CI) | ✅ **Fixed** | The historical `dzup-core.css` 404 target is gone; CI `storybook` job now runs `validate:llms` **and** `verify:repl` (real Chromium) after the build. |
| TASK-FREE-04 (derived counts) | ✅ **Fixed** | `apps/landing/scripts/build-counts.ts` derives everything (fail-loud on zero) and rewrites the `index.html` head; `apps/landing/src/claims.spec.ts` reads the shipped files off disk. Landing suite: **23 files / 1,676 tests, all green**, claims spec included. |
| TASK-FREE-05 (apps under lint + typecheck) | ⚠️ **Partial — see TASK-FREE2-01** | Root `package.json:16` is still `"lint": "eslint packages/"` — **apps/ is still never linted**. `vue-tsc -p apps/landing/tsconfig.json` still reports **6 errors** (was 7). And the packages lint baseline **regressed**: 192 problems (147 errors, 45 warnings) in 18 files vs the audit's 107-in-12 — new debt in `packages/mcp/*`, `packages/tokens/src/design-md.ts` + `design-emit.spec.ts`, and a scratch file `packages/tooling/measure-warning.ts`. |

CI wiring also verified healthy: the `storybook` job builds all packages first; `landing-perf`
builds contracts → tokens → core → storybook → landing, then asserts `/storybook/` exists in
`dist` (`check:storybook`), enforces the bundle budget, and runs Lighthouse; `validate` runs
`validate:tokens`; `build` runs `validate:exports --built`. `chromatic.yml` now builds before
Chromatic but **`continue-on-error` remains** — per TASK-FREE-01's own rule that is correct
*until the first baseline is accepted*, and wrong after; it stays on that task's tab.

Two local-environment notes (not tasks — one command each):

- `yarn storybook:build` exits **127** locally (`'storybook' is not recognized`) because the
  working tree bumped `apps/storybook` to `storybook ^10.4.3` without a reinstall — installed
  is 10.3.4, so the workspace `.bin` shim is stale. **Run `yarn install`.** CI is unaffected
  (fresh `--immutable` install every run).
- Don't run the landing vitest suite concurrently with a Storybook build on a dev machine:
  esbuild dies wholesale with "The service was stopped" under that contention (all 23 files
  fail, cleanly pass on rerun).

### Amendments to still-open TASK-FREE-* tasks (new evidence, same task)

- **TASK-FREE-08 (SEO/share images):** the OG-image generator already exists —
  `apps/landing/scripts/shoot-og.mts`, wired as a manual `yarn og` (`package.json:21`) — but
  `public/og/` contains **zero files**, while `router.ts:192` stamps `og:image: /og/${block.id}.png`
  on all 87 block routes. Every block share-card 404s until `yarn og` becomes a build/CI step
  with output either committed (with a drift guard) or generated into `dist/`.
- **TASK-FREE-18 (stale comments):** one more location — `blocks/registry.ts:8` still says
  "Phase A1 ships the *schema only* … an empty `BLOCKS` array" above a registry of ~87 blocks
  (sibling of the already-listed `router.ts:96`).

---

## Part 2 — What this review found (all new, all verified)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| 1 | 🔴 | TASK-FREE-05 declared done at ~90%: apps still unlinted, 6 landing type errors, packages lint baseline regressed 107 → 147 errors | `package.json:16`; `vue-tsc` output; lint run 2026-07-15 |
| 2 | 🟠 | Internal design-exploration scratch ships in the public sidebar: 8 "Visual Refresh" gallery stories incl. `Freestyle*` mockups built from raw `indigo`/`slate` Tailwind with zero dzup-ui components | `packages/core/stories/_gallery/*Gallery.stories.ts:7` ×8 |
| 3 | 🟠 | Those 8 files also import from undeclared `@storybook/vue3` (rest of corpus: `@storybook/vue3-vite`) | `_gallery/*Gallery.stories.ts:1` ×8 |
| 4 | 🟠 | Broken story-id links inside shipped docs: `guides-contributing--docs` (doesn't exist) and `getting-started-design-tokens--docs` (doesn't exist) | `ComponentStatus.mdx:142`, `Typography.mdx:63` |
| 5 | 🟠 | Two MDX pages link to `../../CLAUDE.md` — 404s in the docs iframe and points readers at an internal agent-instructions file | `GettingStarted.mdx:40`, `Contributing.mdx:18` |
| 6 | 🟠 | `Releases.mdx` labels a link "`CHANGELOG.md`" that actually opens the Introduction page | `Releases.mdx:23` |
| 7 | 🟠 | The home page's ecosystem section ledes "**Coming soon.**" directly above four tiles the data layer marks `status: 'available'` with live links | `EcosystemGrid.vue:28` vs `data.ts:121-160` |
| 8 | 🟠 | Nested `<main>` landmark on `/ai`: `App.vue:50` wraps routes in `<main id="main">`; `AiIdePage.vue:85` renders its own `<main class="ai">` inside it (every other page uses a `div`/`section` root; templates are safe — they render in an iframe via `TemplatePreviewPage`) | `App.vue:50`, `AiIdePage.vue:85` |
| 9 | 🟠 | Two-domain identity: 7 `dzup-ui.dev` literals vs the canonical `SITE_ORIGIN = 'https://dzup-ui.com'` — including registry `homepage` fields **published into `public/r/**` artifacts** and the theme-share URL fallback | `config.ts:17` vs `gallery/registryItem.ts:40`, `blocks/registryItem.ts:61`, `blocks/templatesItem.ts:40`, `useThemeDesigner.ts:393,675`, `blocks/llmsText.spec.ts:84`, `QrShareCard.vue:17` |
| 10 | 🟠 | Four datazup-product components sit in the public free-tier catalog under an undocumented `Core/Feedback/App-Specific` sidebar bucket; two lack the `Dz` prefix | `TeamMemberBadge.stories.ts:23`, `GovernanceBadge.stories.ts:29`, `DzRunStatusBadge`, `DzTokenProgressBar.stories.ts:19` |
| 11 | 🟢 | `DzColorPicker.stories.ts` is the **only** story file with raw Tailwind palette classes (`text-gray-400/500` ×6) — and `validate:tokens` did not catch it, so the validator has a gap too | `forms/DzColorPicker.stories.ts:221,225,229,270,303,330` |
| 12 | 🟢 | The flagship `DzButton.stories.ts` ignores the `_shared` fragments the Contributing guide mandates, and carries a dead `const count = { value: 0 }` in a `setup()` that `data()` shadows | `DzButton.stories.ts:22-85,378-380` vs `Contributing.mdx:27-35` |
| 13 | 🟢 | `system` theme mode is fully implemented (`THEME_MODES`, FOUC script honours it) but **unreachable**: both UI toggles do a binary light↔dark flip, so one click permanently pins the visitor off "follow system" | `useTheme.ts:61-64` vs `ThemeToggle.vue`, `RethemeButton.vue` |
| 14 | 🟢 | `main.ts`/`preview.ts` both carry "keep in sync (TASK-0.1)" comments while listing 5 vs 2 addons — the stated invariant is already false | `main.ts:11-24`, `preview.ts:16-17` |
| 15 | 🟢 | `RESPONSIVE_VIEWPORTS` presets exist but are wired globally to nothing (3 story files use them; no `viewport` parameter in `preview.ts`); no RTL toggle, no density toggle — while the landing's template preview toolbar *already offers* a direction switch, so the Storybook is behind the marketing site | `_shared/options.ts:77-81`, `preview.ts`, `TemplateDetailPage.vue:75-77` |
| 16 | 🟢 | Templates get static thumbnails with an `onerror` icon fallback where blocks get live previews — the gallery asymmetry hides the templates' actual quality | `templates/registry.ts:1204-1206` vs `BlocksIndexPage`'s `LazyBlockPreview` |
| 17 | 🟢 | The site's only changelog surface is an off-site GitHub link, while the Storybook already *generates* release data at build time and the landing even ships a changelog *template* — everything needed for an on-site What's New + RSS exists | `config.ts` `LINKS.changelog`, `Footer.vue:32`, `apps/storybook/scripts/build-releases.mjs`, `templates/registry.ts:415` |

**Found healthy, preserve:** motion composables and listener sites all clean up and honour
reduced-motion (spot-checked `useInView`, `useScrollProgress`, `useTypewriter`, `TopNav`,
`Hero`, `BlockPreview`); template previews are correctly iframe-isolated; per-component status
badges and the maturity dashboard are fully wired; `autodocs` works; the honesty discipline
(`TESTIMONIALS` deliberately empty, live stats degrade to `null`) is intact.

---

## How these tasks are written

Same contract as [`free-apps-audit.md`](./free-apps-audit.md#how-these-tasks-are-written):
each task is a ready-to-run agent prompt per Anthropic's prompt-engineering guidance
([be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct),
[use XML tags](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/use-xml-tags),
[give Claude a role](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts),
[let Claude think](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-of-thought),
[multishot examples](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/multishot-prompting)) —
a `<role>`, a one-sentence `<task>`, the `<motivation>` an agent cannot infer, named
`<requirements>` that are each a checkable constraint, ordered `<steps>`, and
`<success_criteria>` that is the definition of done. Copy a block verbatim into an agent,
together with the conventions block below.

```xml
<repo_conventions source="CLAUDE.md + ADR-04/12/15/17, measured 2026-07-15 — authoritative">
  <apps>
    apps/landing — Vite + Vue 3 + vue-router SPA. Pages in src/pages/, blocks in src/blocks/
      (~87 across 12 categories), templates in src/templates/ (44+, each iframe-previewed via
      TemplatePreviewPage), motion in src/motion/, effect demos in src/gallery/. Static facts in
      src/config.ts (SITE_ORIGIN = https://dzup-ui.com). GENERATED (never hand-edit): src/generated/**,
      public/r/**, public/llms*.txt, public/sitemap.xml, robots.txt, the counts block in index.html
      (scripts/build-counts.ts owns it; claims.spec.ts enforces it — never type a count).
    apps/storybook — Storybook 10 (@storybook/vue3-vite). Config in .storybook/{main,manager,preview}.ts;
      story corpus in packages/core/stories/{family}/ (176 files) + _shared/ helpers + _gallery/;
      MDX guides in apps/storybook/stories/; doc blocks in stories/_blocks/.
      Build chain: build:counts && build:releases && build:playground && build:llms && storybook build.
  </apps>
  <styling>Token-only (ADR-04) in components, STORIES and LANDING alike: every colour is a
    var(--dz-*) reference; no raw hex/rgb and no Tailwind palette classes (text-gray-500 etc.).
    --dz-{intent} is a fill/border colour, never a text colour — use --dz-{intent}-muted-foreground.
    DzText does not accept heading `as` values — use DzHeading :level="n".</styling>
  <a11y>WCAG 2.2 AA. Exactly one <main> and one <h1> per document. Honour prefers-reduced-motion.
    Verify light AND dark (Playwright defaults to light).</a11y>
  <validation>
    yarn install                              # FIRST, once — the tree bumped storybook without it
    yarn typecheck && yarn lint               # TASK-FREE2-01 DONE: `lint` now covers packages/ AND both
                                              # apps at a 0-error/0-warning baseline (--max-warnings 0).
                                              # It exits 0. Any new problem is YOURS — don't add to it.
    yarn typecheck:apps                       # landing types, folded into `typecheck:all`. 0 errors.
                                              # (The 6 errors this review measured were already fixed by
                                              # d3047a8 before TASK-FREE2-01 ran — see that task's notes.)
    yarn test                                 # vitest incl. apps/*/src. 1 pre-existing win32 failure
                                              # (interaction-contract.spec.ts path separators) is the
                                              # green baseline on Windows. Don't run concurrently with
                                              # a storybook build (esbuild dies under contention).
    yarn build                                # all packages — required before any storybook build
    yarn storybook:build                      # green as of this review
    yarn workspace @dzup-ui/landing build     # green; throws if storybook-static is missing
    yarn validate:tokens                      # colour-lint + contrast gates
  </validation>
  <scope>Free tier. Never gate a demo, never add a paywall. "Pro" is reserved for the paid tier.</scope>
  <honesty>Never print a number a build step did not derive. Never leave a comment that describes
    shipped code as unbuilt. Never fabricate testimonials, logos, or stats.</honesty>
</repo_conventions>
```

---

# 🔴 P0 — Finish the gate that was declared done

---

## [x] TASK-FREE2-01 — Close out TASK-FREE-05 for real: apps under lint + typecheck, and a zero-error baseline

> **Landed 2026-07-16.** `yarn lint` = `eslint packages/ apps/ --max-warnings 0`, exits **0/0**.
> `typecheck:apps` (vue-tsc, apps/landing) added and folded into `typecheck:all` — **0 errors**.
> Both gates were already blocking in CI as their own `typecheck` / `lint` jobs (which `build`
> `needs:`), so widening the scripts widened the gates; they were NOT moved into `validate`, which
> would have cost the parallelism for nothing. `packages/tooling/measure-warning.ts` deleted (a
> one-off probe; its finding — the warning-token fix — already shipped). `count-a11y.mjs` and
> `flip-family.mjs` moved to `packages/tooling/scripts/` so one `**/scripts/**` glob carries the
> `no-console` override.
>
> **Three things this task's own motivation got wrong** — later checkouts had moved:
> 1. **The 6 landing type errors were already gone**, fixed by `d3047a8` before this ran. There is
>    no `as="h4"` anywhere in `apps/landing/src`, and no unused `writeFile` in `verify-auth.mts`.
>    So **no `DzHeading :level="4"` conversion happened** — there was nothing to convert. The block
>    a11y suite is green regardless.
> 2. **Lint measured 155 problems (140 errors), not 192/147.**
> 3. **`--fix` is not safe to trust here.** It introduced two real regressions that only `vue-tsc`
>    caught: `new Array<number>(BINS).fill(0)` → `Array.from({length:BINS}).fill(0)` (dropping the
>    type argument → `unknown[]`) in `ThemesPage.vue`, and `.some(x => x === tag)` → `.includes(tag)`
>    in `TemplatesPage.vue`, defeating a workaround explained in the comment directly above it. It
>    also hoisted imports above 7 files' leading doc comments, orphaning them. **Typecheck after
>    linting, and read the diff.**
>
> Two config-level rule overrides exist, both in `eslint.config.js` with a justification:
> `no-console` off for `**/scripts/**` (stdout is a CLI's interface), and `vue/component-api-style`
> off for `DzPresence.vue` (it clones a slot vnode, which needs a render function).
> Regex rewrites for `regexp/no-super-linear-backtracking` were verified **byte-identical**: the
> `llms.txt`/`llms-full.txt` and `releases.generated.ts` generators produce the same output as
> before, modulo their timestamp.

```xml
<role>
You are a build engineer who has seen what "done at 90%" costs: TASK-FREE-05 was checked off
while the lint script still reads `eslint packages/`, and in the gap since, the packages baseline
itself regressed by 40 errors. You know a gate that exits 1 on a "known baseline" is a gate
everyone has already learned to ignore — the only stable baselines are zero and enforced.
</role>

<task>
Make `yarn lint` and the typecheck gates actually cover both free-tier apps, drive every error —
the 6 remaining landing type errors and all 147 packages lint errors — to zero, and wire both
gates into CI as blocking so the baseline can never silently move again.
</task>

<motivation>
Measured on this checkout, 2026-07-15:

  • `package.json:16` — `"lint": "eslint packages/"`. The two public-facing apps have still
    never been linted by any gate. TASK-FREE-05's own success criterion required this.
  • `npx vue-tsc -p apps/landing/tsconfig.json` — 6 errors:
      – 1 × TS6133 `apps/landing/scripts/verify-auth.mts` (unused `writeFile` import)
      – 1 × TS2322 `blocks/application/AppShell.vue` (`unknown` → `boolean`)
      – 4 × TS2322 `as="h4"` not assignable to `TextElement` — `SettingsLayout.vue` ×3 and
        `TableCard.vue` ×1. DzText deliberately rejects heading elements; the fix is
        `DzHeading :level="4"` per the styling convention, not a type cast.
  • `yarn lint` — 192 problems (147 errors, 45 warnings) in 18 files, up from the audit's
    107-in-12. The new debt: `packages/mcp/*` (a package added after the audit and never
    brought under the flat config's standards), `packages/tokens/src/design-md.ts` +
    `design-emit.spec.ts`, and `packages/tooling/measure-warning.ts` — a root-level scratch
    file whose name says exactly what it is.
</motivation>

<requirements>
  <lint_scope>`yarn lint` must lint `packages/` AND `apps/landing` AND `apps/storybook`
    (source + stories + scripts + config; exclude generated output — src/generated/**,
    public/r/**, storybook-static, dist — via eslint.config.js ignores, not ad-hoc CLI globs).</lint_scope>
  <zero>After your change, `yarn lint` exits 0 with zero errors AND zero warnings. Auto-fix
    what is auto-fixable (the audit measured ~97% of app problems are), fix the rest by hand,
    and delete `packages/tooling/measure-warning.ts` unless something imports it (grep first;
    if something does, move it under src/ properly and lint it).</zero>
  <typecheck>Add a root script `typecheck:apps` (vue-tsc for apps/landing; apps/storybook is
    covered by its build per docs/storybook-decisions.md — state this in the script's comment)
    and fold it into `typecheck:all`. Fix the 6 landing errors: the four `as="h4"` sites become
    `DzHeading :level="4"` (they are blocks — keep the visual size using heading tokens, and
    re-run the block a11y suite to confirm heading order stays sane inside BlockPreview's H3
    nesting).</typecheck>
  <ci_blocking>CI must run the widened `yarn lint` and `typecheck:all` (now including apps) as
    blocking steps in the `validate` job. No `continue-on-error`, no `|| true`.</ci_blocking>
  <no_weakening>Fix code to satisfy rules; do not turn rules off to satisfy code. Any rule you
    genuinely must disable gets a config-level override with a one-line justification comment —
    expect near zero of these.</no_weakening>
</requirements>

<steps>
  1. `yarn install` (the tree bumped storybook's version range without reinstalling), then
     record the exact current failure counts: `yarn lint` and
     `npx vue-tsc -p apps/landing/tsconfig.json`.
  2. Delete/relocate the tooling scratch file; fix the mcp and tokens lint errors; get
     `eslint packages/` to 0/0.
  3. Widen the lint script to the apps; extend eslint.config.js ignores for generated output;
     run `eslint apps/ --fix`; hand-fix the remainder to 0/0.
  4. Fix the 6 landing type errors (DzHeading for the four `as="h4"`; the unknown→boolean cast;
     the unused import). `npx vue-tsc -p apps/landing/tsconfig.json` → 0.
  5. Add `typecheck:apps`, fold into `typecheck:all`, wire both widened gates into the CI
     `validate` job as blocking.
  6. Run the full gate list from <repo_conventions><validation>; `yarn test` must stay at its
     documented win32 baseline.
</steps>

<success_criteria>
  - `yarn lint` covers packages + both apps and exits 0 with 0 errors / 0 warnings.
  - `npx vue-tsc -p apps/landing/tsconfig.json` reports 0 errors; `typecheck:all` includes it.
  - `packages/tooling/measure-warning.ts` is gone or properly homed.
  - CI `validate` job runs both widened gates as blocking steps.
  - The landing block a11y suite is still green after the DzHeading changes.
</success_criteria>
```

---

# 🟠 P1 — User-visible defects and false claims

---

## [x] TASK-FREE2-02 — Unship the "Visual Refresh" internal design gallery from the public sidebar

> **Landed 2026-07-17.** Mechanism: an **inclusion flag**, not a glob negation —
> `.storybook/main.ts` names what ships (`stories/!(_gallery)/**` + an explicit
> `_gallery/DzTokenBrowser.stories.ts`) and globs the 8 screens in only under
> `DZUP_GALLERY=1`. A trailing `!…` entry was rejected because `stories` entries are
> globbed independently, so an ineffective negation fails *open* — it ships the scratch.
> Measured on real builds: public = **0** `visual-refresh` ids (and 0 `freestyle`
> chunks — the mockups no longer bundle at all); `DZUP_GALLERY=1` = **24** ids, so the
> comparison stays runnable. All 8 files now import `@storybook/vue3-vite`; zero files
> repo-wide import `@storybook/vue3`. Decision + local-run path in
> `docs/storybook-decisions.md`; `_gallery/README.md` no longer claims they're pinned
> in the sidebar.
>
> **Correction to this task's spec:** it says to assert `guides-design-tokens--docs`.
> That id **does not exist** — `DesignTokens.mdx` attaches via `<Meta of={…} />`, and an
> `of`-attached docs entry is named after the MDX file, so the real ids are
> `guides-design-tokens--designtokens` and `--browser`. Asserting the specified id
> would have failed on a correct tree. The sentinels use the measured ids.

```xml
<role>
You are a design-system maintainer who knows the docs sidebar is the product's shop window:
every top-level entry is a claim that "this is for you, the consumer." Internal A/B design
explorations in that window don't just confuse — they exhibit the exact raw-colour style the
library's own rules forbid, as if the house style were optional.
</role>

<task>
Remove the eight `Visual Refresh/*` design-exploration stories from the public Storybook build
while keeping them runnable for the team, and bring their story files up to corpus standards
so they can never be mistaken for documentation again.
</task>

<motivation>
`packages/core/stories/_gallery/{AppShell,Dashboard,DataTable,Detail,Form,Settings,Sidebar,
States}Gallery.stories.ts` all set `title: 'Visual Refresh/<X>'`. "Visual Refresh" is absent
from `preview.ts`'s `storySort.order`, so it dangles as an unexplained top-level root beside
`Core` and `Guides` in the shipped sidebar. Each ships a `FreeStyled` story rendering
`freestyle/Freestyle*.vue` mockups — hand-rolled markup in raw `indigo`/`slate` Tailwind with
zero dzup-ui components. This is the docs/visual-refresh/AUDIT.md exploration (internal
"freestyle vs dzup-ui vs brand" comparison), not library documentation.

Two secondary defects ride along: all 8 files import types from `@storybook/vue3` — a package
declared in no package.json (it resolves transitively today; one hoisting change breaks it) —
while the other 168 story files and the authoring template use `@storybook/vue3-vite`.
`_gallery/DzTokenBrowser.stories.ts` (the `Guides/Design Tokens` page) shares the directory
and MUST keep shipping.
</motivation>

<requirements>
  <exclude>The 8 `*Gallery.stories.ts` (and their `freestyle/` mockups) must not appear in the
    built public Storybook. Choose the mechanism deliberately and document it in
    docs/storybook-decisions.md: a tag-based exclusion (tag the stories and filter tags in
    main.ts) or a glob exclusion in main.ts's stories field. The mechanism must keep the files
    runnable locally (e.g. an env flag or a dev-only include) — the visual-refresh comparison
    still has value to the team.</exclude>
  <keep_token_browser>`Guides/Design Tokens` (DzTokenBrowser) still builds and renders —
    it lives in the same `_gallery/` directory; your exclusion must not catch it.</keep_token_browser>
  <imports>All 8 files import from `@storybook/vue3-vite`, matching the corpus.</imports>
  <verify_sidebar>After `yarn storybook:build`, assert the built `index.json` contains no
    story id starting with `visual-refresh` and still contains `guides-design-tokens--docs`.
    Add that assertion to an existing verification script (verify-repl.mjs's neighbourhood)
    or a small new one wired into the storybook CI job, so scratch can't leak again.</verify_sidebar>
</requirements>

<steps>
  1. Read `.storybook/main.ts` stories globs and the 8 story files; read one Freestyle*.vue to
     confirm the raw-colour content for your notes.
  2. Implement the exclusion; fix the 8 imports.
  3. `yarn build && yarn storybook:build`; check index.json for the two assertions above.
  4. Wire the index.json assertion into CI; document the decision + the local-run path in
     docs/storybook-decisions.md.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - The public build's sidebar has no "Visual Refresh" root; index.json has no visual-refresh ids.
  - `Guides/Design Tokens` still renders.
  - Zero story files import from `@storybook/vue3`.
  - A CI-wired assertion prevents recurrence; the decision is documented.
</success_criteria>
```

---

## [x] TASK-FREE2-03 — Repair every broken or lying link inside the shipped docs

> **Landed 2026-07-17.** Smaller than measured: **2 of the 5 links were already fixed**
> by TASK-FREE-11 (`ComponentStatus.mdx` → `contributing--docs`, `Typography.mdx` →
> `guides-design-tokens--designtokens`), which also shipped `check-mdx-links.mjs` —
> so the validator this task asks for **already existed** and needed extending, not
> writing. Three real defects remained and are fixed:
>
> - `Releases.mdx:23` — `CHANGELOG.md` now links the real changelog on GitHub
>   (was: `?path=/docs/introduction--docs`). Verified in the shipped chunk.
> - `GettingStarted.mdx:40` / `Contributing.mdx:18` — CLAUDE.md links **removed**, not
>   redirected. This task offers DESIGN.md as the substitute, but **DESIGN.md contains
>   neither thing the two links promise** (no package dependency graph; nothing about
>   story layout) — swapping the URL would have traded a dead link for a lying one.
>   Both sentences already state the fact, so the requirement's second branch applies.
> - The `main.ts`/`preview.ts` comments now state the real invariant: the two addon
>   lists answer *different* questions (build-time/manager vs preview-runtime) and are
>   **not** meant to match; only addon-docs needs both. No TASK-0.1 reference.
>
> **Validator extended** (same script, per this task's suggestion): now also scans
> `stories/_blocks/*.ts`, bans CLAUDE.md links in **every** form (the absolute GitHub
> URL the repo had "fixed" them into is what it caught), reports runtime-built dynamic
> links rather than silently passing them, and carries the FREE2-02 sentinels. Proved
> red-then-green by reintroducing each defect: exits 1 on the CLAUDE.md URL + the dead
> `getting-started-design-tokens--docs` id, exits 0 restored.
>
> **Not machine-checkable, by construction:** the Releases mislabel pointed at a
> *valid* id (`introduction--docs`), so no id-resolver could ever have caught it. A
> label/target mismatch needs a human or an LLM check.
>
> **Left alone, flagged:** `Accessibility.mdx:106` cites `CLAUDE.md` in **prose** (not a
> link) as the source of rule 1b. It passes the success criterion as written. Note the
> generated public `DESIGN.md` cites "CLAUDE.md rule #1" the same way, so this is a
> broader pattern worth one decision rather than a drive-by edit here.

```xml
<role>
You are a documentation engineer. Your standard: a docs site that 404s on its own internal
links has failed at the one thing docs exist to do — and a link whose label says "CHANGELOG"
while opening the Introduction is worse than a 404, because the reader doesn't know they were
misled. Links inside a docs system are API, and APIs get validators.
</role>

<task>
Fix the five broken or mislabeled cross-links in the Storybook MDX pages, correct the two
config comments that state a false invariant, and add a link-check that fails the build when
an MDX story-id link points at a story that does not exist.
</task>

<motivation>
Verified on this checkout:

  • `ComponentStatus.mdx:142` links `?path=/docs/guides-contributing--docs#design-reference` —
    Contributing.mdx's `<Meta title="Contributing" />` produces the id `contributing--docs`
    (Introduction.mdx:27/85 and Theming.mdx:38 already use the correct id). 404.
  • `Typography.mdx:63` links `?path=/docs/getting-started-design-tokens--docs` — the page
    lives at `guides-design-tokens--docs`. 404.
  • `Releases.mdx:23` — link text says `CHANGELOG.md`, target is `?path=/docs/introduction--docs`.
  • `GettingStarted.mdx:40` and `Contributing.mdx:18` link `../../CLAUDE.md` — a repo-relative
    path that resolves against the docs iframe URL (404) and, if it ever did resolve, would hand
    users an internal agent-instructions file. Introduction.mdx:41 shows the right pattern: an
    absolute GitHub URL to the public DESIGN.md.
  • `.storybook/main.ts:11` and `preview.ts:16` both say "Keep in sync … (TASK-0.1)" while
    listing 5 addons vs 2. The invariant is already false — main.ts:12's own comment explains
    why (only docs needs a preview entry; a11y/themes wire differently). The comments must state
    the real rule, not a dead task reference.
</motivation>

<requirements>
  <links>All five links fixed: the two story ids corrected; the Releases link either points at
    the real changelog on GitHub or is relabeled to what it opens; the two CLAUDE.md references
    replaced with the public DESIGN.md GitHub URL (or removed where the sentence works without
    a link). Verify each by clicking through a built Storybook, not by inspection.</links>
  <comments>The main.ts/preview.ts comment pair states the actual invariant (which addons need
    entries on which side, and why) with no reference to a closed task.</comments>
  <validator>A build-time link check: extract every `?path=/docs/...` and `?path=/story/...`
    id from `apps/storybook/stories/*.mdx` and the doc blocks, and assert each id exists in the
    built `index.json`. Wire it after `storybook build` in the CI storybook job (it can join the
    TASK-FREE2-02 index.json assertion in one script). It must fail on today's tree before your
    link fixes and pass after — prove both.</validator>
</requirements>

<steps>
  1. Fix the five links and the two comments.
  2. Write the link-check script; run it against a build of the UNFIXED tree (git stash) to
     see it catch the two 404 ids; unstash; see it pass.
  3. Wire it into the CI storybook job.
  4. `yarn storybook:build`, click through all five fixed links in the built output.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - Zero broken `?path=` links in the built docs; the link checker enforces this in CI.
  - No shipped page links to CLAUDE.md.
  - The addon-registration comments describe the true invariant.
  - The checker demonstrably fails pre-fix and passes post-fix.
</success_criteria>
```

---

## [x] TASK-FREE2-04 — Landing truth pass: the "Coming soon" that shipped, and the double `<main>`

```xml
<role>
You are a front-end engineer with an editor's eye. The home page is the one page every visitor
reads; a lede that says "Coming soon." above four live, linked, badge-carrying tiles tells
every reader the site doesn't know what it has shipped. And you treat landmark structure as
load-bearing: assistive tech builds its page map from it.
</role>

<task>
Remove the stale "Coming soon." claim from the home page's ecosystem section, fix the nested
`<main>` landmark on `/ai`, and correct the stale foundation-phase comment in the blocks
registry — then add the regression guards that keep all three true.
</task>

<motivation>
  • `EcosystemGrid.vue:28` — the section lede ends "… Same tokens, same accessibility bar,
    same design language. Coming soon." Directly below, `data.ts:121-160` marks Blocks,
    Templates, Animations AND Themes `status: 'available'`; the tiles render live "Free"
    badges and are whole-tile router links. The component's doc comment (`EcosystemGrid.vue:16-17`)
    is stale the same way — "Blocks, Templates and Animations are the first" omits Themes.
  • `App.vue:50` wraps every routed view in `<main id="main" class="landing-main">` (the skip
    link's target). `AiIdePage.vue:85` renders its own `<main class="ai">` as the page root —
    nested main landmarks, invalid HTML, ambiguous page map on /ai. Every other page root is a
    div/section; the 30+ `<main>`s inside src/templates/** are CORRECT (templates render inside
    an iframe via TemplatePreviewPage and are copyable full-page artifacts — do not touch them).
  • `blocks/registry.ts:8` — "Phase A1 ships the *schema only* … an empty `BLOCKS` array",
    above ~87 registered blocks. (Sibling `router.ts:96` is already claimed by TASK-FREE-18;
    fix this one here only if TASK-FREE-18 hasn't already landed — check first.)
</motivation>

<requirements>
  <lede>The ecosystem lede describes the current state (four available surfaces) with no
    temporal claim that can rot. If a future tile is genuinely planned, the per-tile
    `status` field is where that belongs — the data layer already supports it.</lede>
  <landmark>`AiIdePage.vue`'s root becomes a non-landmark element; exactly one `<main>` in the
    rendered document on /ai. Verify the skip link still lands on `#main` there.</landmark>
  <guard>Add a spec (in the landing suite, alongside claims.spec.ts) that mounts each PAGE
    component (not templates) inside a stub carrying a <main> wrapper and asserts none renders
    a second main landmark — so the next page author can't reintroduce it.</guard>
  <comment>The blocks/registry.ts header describes what the file is now (schema + ordered
    category metadata + ~87 blocks via module-level import.meta.glob, loaded by node scripts
    through Vite ssrLoadModule).</comment>
</requirements>

<steps>
  1. Rewrite the lede + component doc comment in EcosystemGrid.vue.
  2. Change AiIdePage.vue's root element; click through /ai checking the skip link and that
     styles keyed off `main.ai` (check its <style> block / class selectors) still apply.
  3. Write the one-main-per-page spec; watch it fail against the unfixed AiIdePage (git stash
     dance) and pass after.
  4. Fix the registry comment (after checking TASK-FREE-18's status).
  5. Run the gate list; the landing a11y/block suites stay green.
</steps>

<success_criteria>
  - Home page makes no "coming soon" claim about shipped surfaces.
  - /ai renders exactly one <main>; the new spec enforces one-main across all pages.
  - blocks/registry.ts's header comment is true.
</success_criteria>
```

---

## [x] TASK-FREE2-05 — One canonical origin: end the `dzup-ui.dev` / `dzup-ui.com` split

```xml
<role>
You are a release engineer who knows that a project with two domains has zero domains: every
artifact that bakes in the wrong one — a registry file, a schema URL, a share link — is a
promise to a future 404. The repo already has a single source of truth (`SITE_ORIGIN`); your
job is to make it the only author of origin strings.
</role>

<task>
Replace every hardcoded `dzup-ui.dev` origin with values derived from `SITE_ORIGIN`
(`apps/landing/src/config.ts:17` — `https://dzup-ui.com`), decide the production value of
`REGISTRY_HOST`, regenerate the published registry artifacts, and add the guard that keeps
new origin literals out.
</task>

<motivation>
Seven `dzup-ui.dev` literals ship today against a canonical origin of `dzup-ui.com`
(`config.ts:17`, plus `index.html`'s canonical link):

  • `blocks/registryItem.ts:61` and `gallery/registryItem.ts:40` — `REGISTRY_HOMEPAGE`, and
    `blocks/templatesItem.ts:40` — `TEMPLATES_REGISTRY_HOMEPAGE`. These are written into the
    `homepage` fields of the shadcn-compatible registry JSON published under `public/r/**` —
    a consumer-visible wrong domain in a committed, distributed artifact.
  • `useThemeDesigner.ts:393` — `$schema: 'https://dzup-ui.dev/schema/theme.json'` in every
    exported theme file.
  • `useThemeDesigner.ts:675` — the share-URL fallback when `window` is absent; the moment
    prerendering lands (TASK-FREE-08's open question) every prerendered /themes share link
    points at the wrong domain.
  • `blocks/llmsText.spec.ts:84` — the spec itself hardcodes the wrong origin as its fixture.
  • `blocks/media/QrShareCard.vue:17` — demo content (`https://app.dzup-ui.dev/handoff`).
    Demo content may be fictional, but it must not be wrong-brand: a visitor scanning the demo
    QR should not land on an unowned domain one typo from ours.

Related decision: `blocks/config.ts:31` — `REGISTRY_HOST = ''` means every copyable
`npx shadcn add` command and "Open in v0" URL resolves from `window.location.origin` at
runtime. Correct on production; on localhost/preview deployments, visitors copy commands
embedding a localhost URL.
</motivation>

<requirements>
  <single_source>All origin values derive from `SITE_ORIGIN` — direct import where the module
    graph allows; where a module must not depend on config.ts (check import boundaries), a
    shared constants module both import. Zero `dzup-ui.dev` literals remain in apps/ source
    (the spec fixture updates to the canonical origin too).</single_source>
  <registry>Set `REGISTRY_HOST` to the production origin (derived, not retyped) OR document —
    in the block comment at blocks/config.ts:31 — why runtime-origin resolution is preferred;
    if you set it, verify copied commands on a `vite preview` build now embed the canonical
    host.</registry>
  <regenerate>Re-run the registry builds so `public/r/**` reflects the corrected homepage
    fields; commit the regenerated output (it is a committed artifact per the current policy —
    see TASK-FREE-18's drift-guard requirement).</regenerate>
  <demo>QrShareCard's demo link uses the canonical domain or an obviously-fictional
    `example.com` URL — never a plausible-but-unowned domain.</demo>
  <guard>Add a check to an existing validator (claims.spec.ts is the natural home) asserting
    no file under apps/landing/src or public/r contains `dzup-ui.dev`. It must fail pre-fix,
    pass post-fix.</guard>
</requirements>

<steps>
  1. Grep the tree for `dzup-ui.dev` to catch any occurrence beyond the seven listed.
  2. Introduce the shared origin constant; convert all sites; decide + document REGISTRY_HOST.
  3. Rebuild the registry; diff public/r/** to confirm only homepage fields changed.
  4. Add the guard spec; prove fail-then-pass.
  5. Run the gate list; the theme designer's share flow and an exported theme's $schema are
     click-verified in a built preview.
</steps>

<success_criteria>
  - `grep -r "dzup-ui.dev"` over apps/ and public/r returns nothing.
  - public/r/** homepage fields carry the canonical origin; registry build is deterministic.
  - REGISTRY_HOST decision is implemented and documented.
  - A spec permanently rejects the stale domain.
</success_criteria>
```

---

## [x] TASK-FREE2-06 — Decide what "App-Specific" components are doing in a public component library

> **Landed 2026-07-17. Decision: (b) REMOVE FROM PUBLIC.** The vocabulary settles it —
> `GovernanceBadge.pattern` is `supervisor | contract_net | blackboard | peer_to_peer |
> council`, `TeamMemberBadge.participantId` is scoped to "the team run (not the
> team-definition ID)". No consumer outside datazup can use these, so (a)'s best case is
> a paragraph explaining that four catalog entries are not for you — plus a permanent
> `Dz*` rename through compat + codemod + changeset to spell them consistently in a
> catalog they should not be in. The four story files moved to
> `packages/core/stories/_app-specific/` and ship only under `DZUP_APP_SPECIFIC=1`,
> reusing the FREE2-02 inclusion-flag mechanism (a negation fails *open*). Components
> stay exported; the rename is recorded as internal debt. Decision +
> promote-it-back criteria in `docs/storybook-decisions.md` (supersedes TASK-X.4).
>
> **Correction to this task's premise:** it describes the bucket as under-documented.
> It was worse — `Feedback.mdx` stated the two badges were "unimplemented stubs …
> not exported … intentionally **excluded** from this Storybook" while both were
> implemented, exported, `status:stable`, and publishing pages. Meanwhile
> `build-counts.ts` and the ⌘K palette filter on the `Dz` prefix, so those two were
> **published but uncounted and unsearchable**. Three surfaces, three different
> answers; the docs section is deleted rather than corrected.
>
> **The trap this nearly walked into:** `apps/storybook/vitest.config.ts` runs
> `storybookTest({ configDir })`, so the play() + a11y runner reads the SAME
> `main.ts` glob as the builder. Narrowing it would have silently ended a11y and
> play() coverage for four shipped components — unpublishing quietly becoming
> untesting. The `storybook-test` CI step now sets `DZUP_APP_SPECIFIC: '1'`: tested
> like everything else, published like nothing else. Verified both ways — without the
> flag the runner reports "No test files found" for `GovernanceBadge`.
>
> **Measured, not assumed:** public build serves **0** `core-feedback-app-specific`
> ids and `check:mdx-links` passes (the two `guides-design-tokens--*` ids still
> present, so the exclusion did not overshoot); `DZUP_APP_SPECIFIC=1` serves **38**
> and the sentinel exits 1. Counts moved on their own: documented **139 → 137**
> (Feedback 16 → 14), catalog **205** unchanged (still `.vue`-derived — the
> components did not leave the library), `index.html` meta + DESIGN.md rewritten by
> their generators. `claims.spec.ts` green. Nothing hand-edited.
>
> **One test rewritten, not deleted.** `componentIndex.spec.ts` asserted that the two
> `Dz*` App-Specific components appear in `COMPONENTS` — a guard against a regex that
> assumed exactly one title-group segment and silently dropped nested titles. They
> were its only fixture. The guard now tests `readComponentTitle` directly against
> synthetic titles (the bug lives in the regex, so the test belongs on the regex), so
> it holds even though nothing published nests a group — which is precisely when a
> silent-drop bug would return unseen.

```xml
<role>
You are the design-system owner making a product-scope call. A component library's catalog is
a promise of general-purpose reuse; four components named after one company's product concepts
(governance, token budgets, run status, team members) sitting in the public free-tier sidebar
under an unexplained "App-Specific" bucket blur that promise. There are two honest resolutions
— document the bucket as a first-class concept, or move it out of the public catalog — and the
current state is neither.
</role>

<task>
Resolve the status of the four `Core/Feedback/App-Specific` components — `TeamMemberBadge`,
`GovernanceBadge`, `DzRunStatusBadge`, `DzTokenProgressBar` — by either documenting the bucket
as an explicit, explained tier of the public catalog, or removing it from the public build;
and fix the naming inconsistency either way.
</task>

<motivation>
`packages/core/stories/feedback/` carries four story files titled
`Core/Feedback/App-Specific/…` (e.g. `TeamMemberBadge.stories.ts:23`,
`DzTokenProgressBar.stories.ts:19`, whose comment points generic users to DzProgress and
references internal task id TASK-X.4). The bucket appears in no storySort entry and gets two
bare links in Feedback.mdx (:85-86) with no explanation of what "App-Specific" means, who these
are for, or why they ship in a general-purpose library. Two of the four lack the `Dz` prefix
that every other exported component carries — `TeamMemberBadge`, `GovernanceBadge` — so the
public API surface is inconsistent too. These components are counted in the published
component totals (the counts are build-derived, so any relocation updates them automatically —
never hand-edit a count).

This is a decision task: the wrong outcome is doing nothing. Removing them from the FREE
catalog does not conflict with the free-tier scope rule (never gate a demo) — these are not
demos of general-purpose components; they are another product's domain widgets.
</motivation>

<requirements>
  <decide>Choose exactly one:
    (a) KEEP + DOCUMENT — Feedback.mdx and Introduction.mdx gain a short, honest section
        defining the App-Specific tier (domain-flavoured components maintained to the same
        contract/a11y bar, useful as composition references); the bucket gets a storySort
        position; each of the four stories' descriptions states its generic alternative
        (DzBadge, DzProgress, DzAvatarGroup …).
    (b) REMOVE FROM PUBLIC — exclude the four stories from the public build (the TASK-FREE2-02
        mechanism extends naturally); components stay exported for the internal consumer.
    Record the decision and its rationale in docs/storybook-decisions.md.</decide>
  <naming>If (a): rename `TeamMemberBadge` → `DzTeamMemberBadge` and `GovernanceBadge` →
    `DzGovernanceBadge` — public catalog components carry the prefix. Ship the rename through
    packages/compat + a codemod entry per the repo's migration tooling, with a changeset.
    If (b): the rename is optional; note it as internal debt instead.</naming>
  <counts>Do not touch any count anywhere — `build-counts.ts` derives them. After your change,
    re-run the landing build and confirm claims.spec.ts still passes with the new derived
    numbers.</counts>
</requirements>

<steps>
  1. Read the four components + their .types.ts and stories; read Feedback.mdx:80-90 and the
     visual-refresh audit references to TASK-X.4 for context on why they exist.
  2. Make the call; write the decision record first — it forces the rationale to be explicit.
  3. Implement (docs + storySort, or exclusion + compat rename).
  4. `yarn build && yarn storybook:build`; landing build; claims.spec green with new counts.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - A decision record exists in docs/storybook-decisions.md.
  - Either the App-Specific tier is documented + sorted + cross-linked, or it no longer
    appears in the public build.
  - No hand-edited counts anywhere; claims.spec passes.
  - If kept: no unprefixed component names in the public catalog.
</success_criteria>
```

---

# 🟢 P2 — Consistency, coverage, and new capability

---

## [x] TASK-FREE2-07 — Story-corpus consistency: the raw-colour stragglers and the flagship that ignores the house style

> **Landed 2026-07-17.** Six `text-gray-*` classes tokenised to
> `text-[var(--dz-muted-foreground)]`; DzButton.stories.ts now imports `sizeArgType`,
> `toneArgType`, `disabledArgType`, `a11yArgTypes`, `VARIANTS.button` and `TONES` from
> `_shared`; the dead `count` ref is gone.
>
> **Correction to this task's premise — the validator was never the hole.** The task
> asserts colour-lint "demonstrably does not flag bare `text-{palette}-{shade}` classes"
> and asks for the rule to be extended. It already had that rule, and it works:
> `checkSource` on the pre-fix file with the marker narrowed reports all six classes.
> What actually let them ship was line 1 of the file — a blanket
> `token-check-disable-file`, added so the hex *presets* (legitimate test data) would
> pass, which switched off **all three** rule groups as a side effect. Extending the
> regex would have changed nothing; the file was exempt before any regex ran.
>
> So the fix is to the marker's *reach*, not the pattern. `token-check-allow-raw-values`
> now exempts group 1 (`#hex` / `rgb()` / `hsl()`) only, leaving palette classes and
> untokenized borders armed — which is the whole of what "this file is about colour
> values" actually justifies. `token-check-disable-file` keeps its blunt meaning for
> `_gallery/freestyle/*`, where raw Tailwind IS the point. DzColorPicker's `.vue` and
> `.stories.ts` moved to the narrow marker; the sweep then surfaced a **seventh**
> violation the review missed — an untokenized `border` at `:269`.
>
> Proven fail-then-pass by driving `checkSource` over `git show HEAD:` of the story:
> 7 violations with the narrow marker, 0 with the blunt one (the gap), 0 after the fix.
> Four cases added to `color-lint.spec.ts` pin that a raw-values exemption never covers
> a palette class. The `VariantToneMatrix` refactor was diffed against the hand-rolled
> version by mounting both: byte-identical markup, same 30 labels — note the tone labels
> are title-cased in `setup`, not by a `capitalize` class, which would have left each
> button's accessible name as the lowercase token.

```xml
<role>
You are a design-system engineer who knows the DzButton story is the most-read file in the
corpus — it is where every contributor learns the house style by imitation. If IT hand-rolls
what `_shared` provides, `_shared` is dead code walking. And you know a validator with a gap
is a rule with an expiry date: `DzColorPicker.stories.ts` proves `validate:tokens` misses
`text-gray-*` classes in stories.
</role>

<task>
Purge the last raw Tailwind palette classes from the story corpus, close the `validate:tokens`
gap that let them survive, and refactor `DzButton.stories.ts` to consume the `_shared`
fragments it is supposed to exemplify.
</task>

<motivation>
  • `packages/core/stories/forms/DzColorPicker.stories.ts:221,225,229,270,303,330` — six
    `text-gray-400`/`text-gray-500` classes: the ONLY raw-palette usage in 176 story files
    (verified by corpus-wide scan). ADR-04 and CLAUDE.md rule 1 forbid it; the correct token
    is `text-[var(--dz-muted-foreground)]`.
  • Those six classes shipped THROUGH `yarn validate:tokens`. Fixing the file without
    fixing whatever let them through re-arms the trap.
    [CORRECTED ON LANDING — see the note above this block. The colour-lint DOES flag
    bare `text-{palette}-{shade}` in stories; that rule was never missing. The file was
    exempt at line 1 via a blanket `token-check-disable-file` taken out for its hex
    presets. The hole was the marker's reach, not the regex.]
  • `packages/core/stories/buttons/DzButton.stories.ts:22-85` hand-declares size/tone/aria
    argTypes and literal option arrays that `_shared/options.ts` exports (`sizeArgType`,
    `toneArgType`, `a11yArgTypes`, `SIZES`, `TONES`) — the exact fragments `Contributing.mdx:27-35`
    and `_shared/Dz.stories.template.ts:56-65` mandate. And `:378-380` carries a dead
    `const count = { value: 0 }` in `setup()` — the story's template reads `data().clickCount`,
    so the ref is returned and never used.
</motivation>

<requirements>
  <fix>The six DzColorPicker classes become `--dz-*` token references with equivalent visual
    weight (muted caption text). Verify in both themes in a running Storybook.</fix>
  <validator>Extend the colour-lint in packages/tooling so `text-*`, `bg-*`, `border-*`,
    `ring-*`, `fill-*`, `stroke-*` classes naming a Tailwind palette colour
    (`{colour}-{50..950}`) fail in story files. It must fail on the unfixed
    DzColorPicker.stories.ts and pass after — prove both. Add the case to the validator's
    spec.</validator>
  <flagship>DzButton.stories.ts imports its argTypes/options from `../_shared`; behaviour and
    rendered stories are unchanged (compare the built docs page before/after); the dead
    `count` ref is gone. If a hand-rolled argType carries something the shared fragment lacks
    (a better description, an extra control), improve the SHARED fragment — every family
    benefits — rather than keeping the fork.</flagship>
</requirements>

<steps>
  1. Fix the six classes; check both themes.
  2. Extend the colour-lint + its spec; git-stash-prove fail-then-pass.
  3. Sweep the corpus with the extended validator — fix anything else it now catches beyond
     DzColorPicker (there should be nothing; the scan said this was the only file — trust the
     validator over the scan).
  4. Refactor DzButton.stories.ts onto _shared; remove the dead ref; diff the built docs page.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - Zero raw palette classes in packages/core/stories/** and `validate:tokens` enforces it
    (with a spec).
  - DzButton.stories.ts consumes _shared fragments and matches Contributing.mdx's own
    instructions; its rendered stories are unchanged.
</success_criteria>
```

---

## [x] TASK-FREE2-08 — Make `system` theme mode reachable again (three-way theme control)

> **Landed 2026-07-17.** The nav control is now `DzColorModeToggle` (icon variant) — the
> library's own component, dogfooded on the site that markets it. It cycles
> light → dark → system, shows the preference as its glyph (sun / moon / monitor), and
> its live region announces `System theme (Light)`, carrying both the mode and the
> resolved theme to assistive tech. Verified in a real browser: clicking alone reaches
> `light, dark, system`. RethemeButton stays a binary flip but now says so — its tooltip
> states that it pins an explicit mode and points at the nav control for `system`.
>
> **The `<sync>` question: the dual writers DID desync, and it lost a real preference.**
> Reproduced, not theorised. `useTheme` and `DzThemeProvider` share the `dz-theme` key
> and both write `data-theme`, but each reads that key exactly once, at init — so they
> agree at load and never again. The failing path: pick **light** explicitly, then flip
> the OS to dark; the provider, still holding the `system` preference it read at mount,
> recomputes on its own media listener and overwrites `data-theme` back to `dark`. The
> visitor's explicit choice is gone. App.vue's comment asserted these two "stay in sync
> rather than conflicting" — that assertion was false and is now replaced by the design.
>
> **Authority:** the landing `useTheme` singleton owns the preference (it is created
> before any component mounts and is what the FOUC IIFE agrees with). `ThemeSync` +
> `useProviderThemeSync` make the provider mirror it — two-way, so a `DzColorModeToggle`
> inside a block preview is adopted rather than lost, each direction value-guarded so a
> propagated write lands as a same-value assignment and stops there. The provider's
> internal attribute write survives (it cannot be disabled from outside) but can no
> longer express an opinion the singleton does not hold.
>
> Adopting DzColorModeToggle in the nav is only correct BECAUSE of that bridge: it binds
> to the provider context, so before the bridge it would have split the site's theme
> state in two.
>
> Browser-verified (Playwright, temporary spec): explicit light survives an OS flip to
> dark; system mode tracks a live OS flip both ways; and with `dz-theme=system` + OS dark,
> `data-theme` is already `dark` at `domcontentloaded` — no FOUC (ADR-15). 18 new unit
> specs (`useTheme.spec.ts`, `themeSync.spec.ts`); the sync specs were proven non-vacuous
> by neutering the bridge and watching 3 of 4 fail.
>
> **Trade-off, deliberate:** a nav theme change now cross-fades via the CSS
> `--dz-landing-theme-transition` rather than the full-page View Transition snapshot —
> `DzColorModeToggle` knows nothing of that landing-only flourish. RethemeButton, where
> the effect is the selling point, still drives `useThemeTransition`.
>
> **Gotcha for anyone touching `themeSync.spec.ts`:** `DZ_THEME_KEY` is a `Symbol()`, so
> a statically-imported `DzThemeProvider` provides under a different key than a bridge
> re-imported after `vi.resetModules()` injects with. `useTheme({ optional: true })` then
> silently returns its no-op sentinel and the tests pass for the wrong reason. Import
> core inside the fresh graph.

```xml
<role>
You are a front-end engineer who respects user agency: "follow my OS" is the default most
visitors arrive with, and a UI that silently converts one curious click into a permanent
override — with no way back — has taken a preference the user never expressed and made it
irrevocable. The library even ships a component for this (DzColorModeToggle); the site that
markets it doesn't use it.
</role>

<task>
Expose light / dark / system as a three-state control on the landing site so a visitor can
return to following their OS preference, and verify the two writers of `data-theme` cannot
disagree.
</task>

<motivation>
`apps/landing/src/composables/useTheme.ts` fully implements `'light' | 'dark' | 'system'`
(exports THEME_MODES; persists mode; the FOUC IIFE in index.html honours a stored `system`).
But both UI entry points — `ThemeToggle.vue` (nav) and `RethemeButton.vue` — call a binary
toggle: `useTheme.ts:61-64` sets `mode = resolved === 'dark' ? 'light' : 'dark'`. One click
and the stored mode is pinned to a literal; `system` is unreachable without clearing
localStorage. Peer libraries (shadcn/ui, Nuxt UI) expose the three-way switch; this repo even
shipped `DzColorModeToggle` as a core component (TASK-NF-32) that the landing never adopted.

Secondary, verify-and-fix-if-broken: `App.vue` has TWO `data-theme` writers — `useTheme()`
(App.vue:14) writing on <html>, and the `DzThemeProvider` wrapper (App.vue:42). The in-code
comment (App.vue:37-41) asserts they stay in sync; the system-mode resolution path (OS flips
while the page is open) is exactly where dual writers desync. This review did not click-test
it; you must.
</motivation>

<requirements>
  <control>The nav theme control offers light / dark / system (use DzColorModeToggle if its
    API fits — dogfooding the library on its own site is half the point; otherwise a compact
    segmented control). Current resolved theme and the "following system" state are both
    visible. Keyboard operable, labelled, correct in both themes.</control>
  <retheme>RethemeButton (the hero's "re-theme this page" affordance) may stay a playful
    binary flip — but it must set an explicit mode knowingly; add one line to its
    tooltip/label acknowledging the nav control is where "system" lives, if user testing of
    the copy supports it. Do not remove the affordance.</retheme>
  <sync>Click-test the dual-writer question: set system mode, flip the OS preference (or
    emulate via devtools), confirm <html data-theme>, DzThemeProvider's context, and any
    DzColorModeToggle instances inside block previews all agree. If they desync, make one
    writer canonical and the other a reader, and record the design in a comment where
    App.vue:37-41's assertion sits today.</sync>
  <persistence>A visitor who chooses system, closes the tab, and returns gets system (the
    FOUC script already supports this — don't break it; test with a stored 'system' value).</persistence>
</requirements>

<steps>
  1. Read useTheme.ts fully; read DzColorModeToggle's API; decide the control.
  2. Implement the three-way control in TopNav; keep RethemeButton behaviour deliberate.
  3. Run the sync click-test matrix: {light, dark, system} × OS flip × navigation across
     /blocks (previews mount their own toggles). Fix what desyncs.
  4. Verify FOUC behaviour: hard-reload in each stored mode; no flash (ADR-15).
  5. Run the gate list; landing suites green; add a spec for the three-way mode transitions
     in useTheme (unit level: toggle/system transitions + persistence).
</steps>

<success_criteria>
  - A visitor can select system mode from the UI and it persists and tracks OS changes live.
  - data-theme has one effective authority; the sync design is documented in-code.
  - No FOUC regression; new unit specs cover the mode transitions.
</success_criteria>
```

---

## [ ] TASK-FREE2-09 — Live template previews in the gallery (parity with blocks)

```xml
<role>
You are a product-minded front-end engineer. The blocks index sells blocks by *running* them —
LazyBlockPreview mounts the real component in view. The templates index sells templates with a
static thumbnail and, when that image is missing, a placeholder icon — for the most valuable
artifacts on the site, full pages that took the longest to build. The machinery for live
template rendering already exists (every detail page iframes TemplatePreviewPage); the gallery
just doesn't use it.
</role>

<task>
Upgrade the templates index so each card shows a live (or build-generated, always-present)
preview of the real template instead of a maybe-missing static thumbnail — reusing the
existing TemplatePreviewPage iframe route — without blowing the page's performance budget.
</task>

<motivation>
`apps/landing/src/templates/registry.ts:1204-1206` maps each card to
`/templates/thumbnails/<slug>.webp` with an `<img onerror>` → icon fallback; several newer
templates (registry entries dated 2026-06-25) have no thumbnail, so their cards show the
fallback icon — an empty-looking card for a finished template. Meanwhile
`TemplateDetailPage.vue` already renders every template live in an `<iframe>` pointed at the
`/templates/preview/:slug` route (`TemplatePreviewPage.vue:71` mounts the real component), with
device-width, theme and direction params. Blocks get live previews in their index; templates —
the bigger sell — do not.

The performance budget is real: the landing has a CI Lighthouse gate (LCP < 2.5 s, CLS < 0.1)
and a gzip bundle budget. 44+ live iframes on one page would destroy it. The task is choosing
the mechanism that gets "real pixels on every card" within the budget.
</motivation>

<requirements>
  <mechanism>Choose deliberately, and record the trade-off in the PR description:
    (a) Lazy live iframes — IntersectionObserver-gated `/templates/preview/:slug` iframes with
        loading="lazy", scaled via transform, a hard cap on concurrently-mounted frames, and a
        static first paint (no CLS);
    (b) Build-generated screenshots — extend the existing Playwright infrastructure
        (scripts/shoot-og.mts is the pattern) to screenshot every registry entry at build
        time, light AND dark, failing the build on a missing capture — so a card can never
        again render a placeholder icon;
    or a hybrid (generated image, live iframe on hover/focus). Any option must produce a
    preview for EVERY registry entry, enforced by a build check, not an onerror fallback.</mechanism>
  <budget>The CI Lighthouse and bundle-budget gates stay green. Measure before/after with the
    interleaved-preview harness noted in docs (sequential runs drift).</budget>
  <a11y>Cards remain links with text names; previews are decorative (aria-hidden iframes /
    alt="" images with the name adjacent); reduced-motion users get no autoplaying motion
    inside previews (pass the existing reduce-motion param through if using iframes).</a11y>
  <dark>Previews respect the visitor's current theme (the preview route already accepts a
    theme param; screenshots must be captured per-theme and swapped).</dark>
</requirements>

<steps>
  1. Inventory which registry entries lack thumbnails today (script the check — it becomes
     the build guard).
  2. Prototype option (a) on the templates index with 6 cards; measure LCP/CLS locally.
     If the budget strains, fall back to (b)/hybrid.
  3. Implement fully, including the every-entry build guard and per-theme handling.
  4. Run the landing build + Lighthouse + bundle gates; click through both themes and
     reduced-motion.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - Every template card shows a real preview of the template in the visitor's theme; a build
    check makes a missing preview a build failure, retiring the onerror icon path.
  - Lighthouse (LCP/CLS) and bundle-budget CI gates remain green.
  - Keyboard, screen-reader and reduced-motion behaviour verified.
</success_criteria>
```

---

## [ ] TASK-FREE2-10 — On-site "What's New" + RSS: stop outsourcing the changelog to GitHub

```xml
<role>
You are a developer-experience engineer. A library's release feed is retention
infrastructure: it is how existing users learn there is a reason to come back. Sending them
to a raw CHANGELOG.md on GitHub — from a site that already *generates structured release
data at build time* — leaves the highest-intent page of the site unbuilt.
</role>

<task>
Add a What's New page to the landing site and an RSS/Atom feed, both generated at build time
from the same release data the Storybook's Releases page already derives — one source, three
surfaces.
</task>

<motivation>
Today `LINKS.changelog` (config.ts) and the footer (`Footer.vue:32`) deep-link to
`CHANGELOG.md` on GitHub — the only release surface the site offers. Yet the machinery
exists: `apps/storybook/scripts/build-releases.mjs` already parses CHANGELOG.md + .changeset
+ package changelogs into a data module (gitignored, rebuilt every build, deprecations pulled
forward) for the Storybook's Guides/Releases page. The landing even ships a *changelog
template* (`templates/registry.ts:415`) — the design exists as a sales artifact but not as a
real page. Peer libraries (Nuxt UI, PrimeVue) surface releases in-product with feeds.
</motivation>

<requirements>
  <shared_source>Extract build-releases.mjs's parsing into a shared script both apps consume
    (packages/tooling is the natural home) — do NOT fork the parser. The Storybook page keeps
    working from the same data.</shared_source>
  <page>A `/changelog` (or `/whats-new`) route on the landing: version sections, date, change
    categories, deprecations called out, per-component links into the Storybook docs where a
    change names a component. Use the shipped changelog template's design as the starting
    point — the site should dogfood its own template. Route metadata (title/description/og)
    per the router's existing head machinery; add the route to build-sitemap.ts.</page>
  <feed>`public/feed.xml` (Atom) generated at build from the same data: entry per release,
    absolute URLs on SITE_ORIGIN, validating against the Atom spec (run a validator in the
    spec). Autodiscovery `<link rel="alternate">` in index.html — via build-counts.ts's
    head-rewrite mechanism or the static head, but never hand-maintained content that can
    drift.</feed>
  <links>LINKS.changelog and the footer point at the on-site page; the page itself links out
    to the full GitHub history for the long tail.</links>
  <honesty>Every date and version comes from the parsed data; nothing hand-typed
    (claims.spec.ts discipline applies).</honesty>
</requirements>

<steps>
  1. Read build-releases.mjs and the Storybook Releases page; extract the parser to shared
     tooling; keep the Storybook consumer green.
  2. Build the landing route from the shared data + the changelog template's design.
  3. Generate the Atom feed in the landing build chain; add the validator spec; wire
     autodiscovery.
  4. Update LINKS/footer/sitemap; run build-sitemap and confirm the new URL.
  5. Full landing build + tests + Lighthouse; storybook build (Releases page unchanged).
</steps>

<success_criteria>
  - /changelog renders build-derived release history; the footer/config links point to it.
  - A valid Atom feed ships with autodiscovery; a spec validates it every test run.
  - One release parser feeds both apps; the Storybook Releases page is unchanged.
</success_criteria>
```

---

## [ ] TASK-FREE2-11 — Storybook global toolbars: viewport presets, RTL, and density

```xml
<role>
You are a Storybook infrastructure engineer for a component library. Reviewers judge a
library by what its docs let them *check without cloning*: does this table survive 360 px?
does the drawer mirror correctly in RTL? The landing site's template preview toolbar already
answers device-width and direction; the Storybook — the surface actually aimed at engineers —
answers neither globally.
</role>

<task>
Wire the already-defined responsive viewports as a global Storybook toolbar, add a global
LTR/RTL direction toggle, evaluate a density global against what the token system supports,
and document the manager's keyboard shortcuts — bringing the Storybook to parity with the
landing's own preview toolbar.
</task>

<motivation>
  • `packages/core/stories/_shared/options.ts:77-81` defines RESPONSIVE_VIEWPORTS
    (mobile/tablet/desktop, bracketing the sm/md/lg breakpoints) — consumed by exactly 3
    story files (DzGrid, DzContainer, DzAppShell). `preview.ts` sets no global viewport
    configuration, so 173 story files offer no responsive check at all.
  • No `dir` global exists anywhere in preview.ts; the only theme machinery is
    withThemeByDataAttribute for light/dark. Meanwhile the landing's TemplateDetailPage
    toolbar (TemplateDetailPage.vue:75-77) already writes theme AND direction onto its
    preview iframe — the marketing site out-features the engineering docs.
  • manager.ts enables Storybook keyboard shortcuts (enableShortcuts: true) but no Guides
    page mentions they exist.
  Storybook 10 note: viewport/backgrounds/measure/outline moved from standalone addons into
  core across SB 9/10 — verify the current SB10 API (parameters.viewport / initialGlobals /
  core features) before reaching for an addon package; the fix is likely config-only.
</motivation>

<requirements>
  <viewports>A global viewport toolbar using RESPONSIVE_VIEWPORTS as its options (import from
    _shared — one source), default full-size. The 3 per-story usages keep working or migrate
    to the global mechanism if it fully covers them.</viewports>
  <rtl>A global `dir` toolbar (LTR/RTL) implemented as a decorator setting `dir` on the story
    root. Spot-check 5 direction-sensitive components (DzDrawer, DzTabs, DzPagination,
    DzBreadcrumb, DzSlider) under RTL and file what breaks as findings in your summary — this
    task ships the *toggle*; fixing RTL bugs it reveals is follow-up work, not scope
    creep.</rtl>
  <density>Investigate: the tokens memory/system scales --dz-spacing (the blocks theme editor
    already does density via it). If a density global is a one-decorator win using existing
    tokens, ship comfortable/compact; if it needs new token plumbing, write the finding into
    docs/storybook-decisions.md and stop — do not invent a parallel spacing system.</density>
  <shortcuts>A short "Keyboard" section on an existing Guides page (Accessibility.mdx or
    GettingStarted.mdx) documenting the enabled manager shortcuts that matter (search, sidebar
    focus, panel toggles).</shortcuts>
  <no_drift>Any toolbar you add must appear in the built public Storybook — verify in
    storybook-static, not just dev mode (manager config diverges between the two more than
    you'd expect).</no_drift>
</requirements>

<steps>
  1. Confirm SB 10.4's viewport/globals API from the installed package's types (after
     `yarn install`), not from memory.
  2. Wire viewports; migrate/verify the 3 existing usages.
  3. Add the dir global + decorator; run the 5-component RTL spot-check; record findings.
  4. Time-box the density investigation; ship or document.
  5. Write the shortcuts section. Build; verify all toolbars in storybook-static; run the
     gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - Built public Storybook shows viewport + direction toolbars on every story; viewports come
    from the single _shared definition.
  - RTL spot-check findings are recorded (toggle ships regardless).
  - Density is shipped or its blocker documented in storybook-decisions.md.
  - Keyboard shortcuts are documented on a Guides page.
</success_criteria>
```

---

## [ ] TASK-FREE2-12 — "Open in playground" on every component docs page

```xml
<role>
You are a developer-experience engineer. The moment of highest intent in any component docs
is "let me try this with my own props" — and today that moment dead-ends: the live REPL and
StackBlitz launcher exist but are parked on the Getting Started page and a few family
overviews, an extra navigation hop away from all 139+ component pages where the intent
actually fires.
</role>

<task>
Put an "Open in playground" affordance on every component's docs page — deep-linking into the
existing REPL/StackBlitz infrastructure preloaded with that component's primary story code —
generated, not hand-added.
</task>

<motivation>
The infrastructure is already built: `stories/_blocks/DzRepl.ts` (the @vue/repl embed),
`playground.config.ts`, the StackBlitz form-POST launcher used by the landing
(apps/landing/playground-template/), and build-playground.mjs producing the core bundle the
REPL consumes. But they surface only on GettingStarted.mdx and family overview MDX pages
(e.g. Buttons.mdx:63-67). A visitor reading DzTable's docs — the page where "can it do X?"
becomes "let me try X" — has no path into a sandbox with DzTable loaded. shadcn/ui, Nuxt UI
and PrimeVue all offer per-component sandbox entry.

Hand-adding a REPL block to 139+ docs pages is the wrong answer: it would drift exactly like
hand-typed counts did. The right answer is one mechanism that derives per-component playground
code from what already exists (the story corpus or the llms.txt component API extraction).
</motivation>

<requirements>
  <mechanism>One generated affordance, not 139 hand-edits. Candidates — pick after reading the
    autodocs template API for SB10: (a) a custom autodocs template that injects an "Open in
    playground" block reading a per-component parameter; (b) a doc-block component dropped
    into the autodocs page via the docs container; (c) a manager-level link (toolbar/panel)
    that deep-links the current component into the REPL. The affordance must appear on every
    component docs page without per-file authoring; a per-story opt-out parameter is fine.</mechanism>
  <payload>The playground opens preloaded with a minimal working example of THAT component:
    derive it from the component's primary story source (the Component Status dashboard
    already parses raw story source via import.meta.glob '?raw' — reuse that extraction
    pattern) or from the llms.txt example extraction. Imports rewritten to the playground's
    module conventions; the snippet must actually run — verify with the existing
    verify-repl.mjs pattern extended to sample N components, not just DzButton.</payload>
  <graceful>Components whose primary story cannot be automatically converted (complex
    compositions) fall back to opening the playground with the family's starter snippet —
    never a broken preload, never a hidden button.</graceful>
  <ci>Extend the REPL verification in CI to assert the per-component deep link works for a
    sample across families (one simple, one compound, one form control).</ci>
</requirements>

<steps>
  1. Read DzRepl.ts, playground.config.ts, the SB10 autodocs template docs, and the status
     dashboard's raw-source parsing; choose the mechanism and write it down.
  2. Build the snippet-derivation for one simple component (DzButton) end-to-end; verify in
     the REPL.
  3. Generalize; implement the fallback path; sweep-test a sample of ~15 components across
     all 11 families in a built Storybook.
  4. Extend verify-repl.mjs's CI coverage to the sampled deep links.
  5. Run the gate list from <repo_conventions><validation>.
</steps>

<success_criteria>
  - Every component docs page in the built Storybook carries a working "Open in playground"
    affordance with that component preloaded (or the documented family fallback).
  - Zero per-page hand authoring; the mechanism is generated/parameterized.
  - CI verifies a cross-family sample of deep links compiles in the real REPL.
</success_criteria>
```

---

## Backlog candidates (observed gaps, deliberately not yet tasks)

Recorded so they aren't lost; each needs a scoping decision before it deserves a prompt:

- **Versioned docs** — one implicit version everywhere; becomes real the first time a breaking
  release ships. Decide policy (docs per major, or latest-only + changelog) before building.
- **i18n / locale switching** — `index.html` is `lang="en"` with no locale machinery. Large
  surface; needs a product decision on target locales first.
- **Privacy-friendly analytics** — the site has zero usage measurement, so tasks like
  TASK-FREE2-09/10/12 can't be validated against real behaviour. Needs a tooling/privacy call.
- **Community showcase / "built with" gallery** — `TESTIMONIALS` is deliberately empty pending
  real users; a showcase has the same honesty constraint. Revisit after deployment
  (TASK-FREE-07) produces real users.
- **Search consolidation** — `useGlobalSearch` and `useBlockSearch` + two palette components
  overlap heavily over one ranker (`lib/searchScore.ts`); also the two palettes route the same
  block hit differently (global → detail page; in-page → preview deck,
  `GlobalCommandPalette.vue:73` vs `BlocksIndexPage.vue:257-268`). Fold into the next palette
  feature work rather than refactoring for its own sake.
- **Chromatic flip to blocking** — owned by TASK-FREE-01's `<chromatic>` clause; still waiting
  on an accepted first baseline (`continue-on-error` remains in `chromatic.yml`).

---

## Suggested execution order

1. **TASK-FREE2-01** first and alone — it finishes the audit's P0 story and re-baselines the
   gates every later task must pass. Everything after this lands on a zero-error tree.
2. **TASK-FREE2-02 + 03** — the shipped-docs embarrassments (scratch in the sidebar, 404s in
   the docs). Small, high-visibility, and each installs a validator that prevents recurrence.
3. **TASK-FREE2-04 + 05** — the landing truth pass and the domain unification. Do 05 before
   any deploy (TASK-FREE-07): don't publish registry artifacts carrying the wrong domain.
4. **TASK-FREE2-06** — the scope decision. Cheap to decide, and it changes the counts every
   marketing surface derives, so decide before the next release.
5. **TASK-FREE2-07 + 08** — corpus consistency and the theme control. Independent,
   parallelizable.
6. **TASK-FREE2-09 → 12** — the capability tier, in value order: template previews (sales),
   changelog + RSS (retention), Storybook toolbars (evaluation), per-component playground
   (conversion). Each is independent; ship as capacity allows.

---

# TASK-APP-1 — real-component rollout (2026-08-25)

> From `docs/program-2026-08/oss-recovery-and-shared-kit-tasks.md`. The packet
> asked: inventory hand-rolled UI in `apps/landing`, `apps/sandbox` and the
> Storybook doc blocks, and replace it with real `@dzup-ui/core` components
> "where a component fits", measuring that a11y, theming and RTL are **inherited
> rather than re-implemented**.

## The discovery changed the answer

Two of the three named slices turned out not to exist as described, and the
third turned out to be the wrong measurement.

**Slice "sandbox pages" is closed by a standing instruction.**
`docs/free-apps-audit.md:165` records `apps/sandbox` as *"LEGACY. Last touched
2026-06-09, not in CI, superseded by Storybook … **Do not add to it.**"* CI
agrees: the sandbox-parity gate was replaced by `validate:contract-parity`
(TASK-FREE-16), no root script targets it, and it has no e2e config. Rolling
components into a tree nobody builds is work nobody sees, and the audit already
said not to. **Not done, on purpose.**

**Slice "Storybook doc blocks" has nothing to roll out.**
`apps/storybook/stories/_blocks/` contains **fifteen `.ts` files and zero
`.vue` files** — the doc blocks are render functions and data, not markup. A
grep for `<button|<input|<select|role="tab"|role="dialog"` across the directory
returns nothing.

**Slice "landing sections" is real, and the hand-rolled UI is almost all
brand chrome.** Which is the finding.

## The candidate inventory

| Candidate | Raw markup | Fits | Verdict |
|---|---|---|---|
| `components/RethemeButton.vue` | 1 `<button>` | `DzButton` | **Keep.** A gradient-haloed pill with a mode badge and a backdrop blur, on the hero. Reproducing it means overriding radius, padding, colour, weight and adding two structural children — re-specification, not adoption. |
| `components/AnnouncementBanner.vue` | 1 `<button>` | `DzIconButton` | **Keep** — but see "the gap this exposes". White icon on a brand gradient; no Core tone renders legibly on an arbitrary brand surface. Its `right: 12px` **was** fixed. |
| `components/blocks/BlockSearchBar.vue` | 4 `<button>` | `DzButton` / `DzToggleButton` | **Keep.** Filter chips and a pill "Clear". `DzButton`'s `ui` surface is `root` + `spinner`, so parity needs height, padding, radius, colour and weight overrides at once. |
| `components/blocks/BlockCategoryNav.vue` | `role="tablist"` + `role="tab"` | `DzTabs` | **Keep the markup, fix the behaviour.** `DzTabs` owns its panels; here the "panels" are page sections and activation must *not* follow focus (a category mounts a stack of live previews). But the hand-rolled keyboard handler was wrong — see below. |
| `components/TopNav.vue` | 2 `<button>` | — | **Keep.** One is a `DzDropdownMenuTrigger` child (already the library's pattern); one is the mobile menu toggle, same brand-chrome case. Already uses `DzButton` + `DzDropdownMenu*`. |
| `pages/ThemesPage.vue` | 8 `<input type="range">` | `DzSlider` | **Keep.** The theme designer's hue and chroma sliders paint the OKLCH ramp *into the track* (`--track`). The gradient is the affordance. |
| `gallery/**`, `motion/**` | assorted | — | **Keep.** Animation demos; the raw element is the subject of the demo. |
| `blocks/**`, `templates/**` | assorted | — | **Out of scope by the packet's own `<blocks>` rule** — `?raw`-paired copy-pasteable sources. |

**Zero replacements, and that is the result, not an evasion.** The landing app's
remaining hand-rolled controls are deliberately *not* the library's default
surfaces: pills, gradients, glows and painted tracks. Swapping them at parity
would mean overriding every part of the component, which adds indirection and
removes nothing.

## What the app genuinely failed to inherit was behaviour

The packet's premise — *"that UI does not inherit the library's a11y, theming,
RTL, and reduced-motion behaviour"* — is correct. It is just not visible in the
component swap. It is visible in the CSS and the keyboard.

### 1. The category nav re-introduced a defect the library had just fixed

`BlockCategoryNav`'s `onKeydown` hard-coded `ArrowRight` as "next".
`TASK-OSS-P4-05` fixed exactly this in the library's own `useTabs`, weeks
earlier, and wrote down why: APG's tab pattern is expressed as *previous* and
*next*, and in a right-to-left document the next tab is to the **left**, so an
Arabic reader pressing the key that points at the next tab gets the previous
one. The nav re-implemented the pattern and re-implemented the bug.

It now reads `useDzDirection()` from `@dzup-ui/core` — the same ADR-20 provider
contract the library's components use. `BlockCategoryNav.spec.ts` (4 tests)
proves both directions, that the **vertical** keys do *not* swap, and that
Home/End are direction-independent.

### 2. Twenty-seven declarations in the shell did not mirror

The shell — nav, banner, category nav, search bar, both command palettes,
changelog, templates page, gallery cards — carried physical `left`/`right`,
`margin-left`/`-right`, `padding-left` and `border-left` where the meaning is
flow-relative. All 27 are now logical (`inset-inline-*`, `margin-inline-*`,
`padding-inline-*`, `border-inline-*`). **Identical in LTR** — the light and dark
hero visual snapshots pass untouched.

Twenty-four physical declarations remain and every one is justified in
`src/shellDirection.spec.ts`: centring (`left: 50%` with `translateX(-50%)`),
decorative composition (aurora blobs, beam anchors — the library's own
`mirrors: 'none'` case), and JavaScript-driven geometry (a drag handle and a
sliding indicator whose offsets come from `getBoundingClientRect`, where logical
CSS and physical maths would disagree).

The spec is a ratchet with three assertions: no unjustified physical
declaration, no *stale* justification (an entry whose line no longer holds one),
and a count ceiling.

### 3. Nothing could have caught either, because the shell cannot render RTL

`e2e/block-responsive.spec.ts` certifies **88** block previews across
`dir=ltr` and `dir=rtl`. It reaches RTL through
`/blocks/preview/<id>?dir=rtl` — and `document.documentElement.setAttribute('dir', …)`
is called in exactly **two** places in the whole app: `BlockPreviewPage.vue` and
`templates/previewCustomiser.ts`.

**No ordinary landing route can be right-to-left.** The app certifies RTL for
the content it *documents* and never for the chrome it *is*, which is why 27
physical declarations and a reversed arrow key sat there unnoticed.

### 4. A merge gate was flaky, and running it four times is how that surfaced

`e2e/block-responsive.spec.ts` asserts `<html dir>` five milliseconds of
hydration after a `domcontentloaded` navigation, with Playwright's default 5 s
expect timeout. Four full landing runs: **105/105, 105/105, 102/105, 105/105.**
The one failure was the run launched immediately after `yarn landing:build` —
three of 88 blocks reported `dir` absent after 14 polls over 5 s — and the same
spec then passed 88/88 in isolation twice.

CI runs build and test back to back, which is precisely the contended case. The
timeout is now 20 s on that one hydration-dependent assertion; the containment
checks around it keep the default, so a block that genuinely fails to render
still fails fast. Re-run in the same build-then-test shape: **105/105**.

This is not an APP-1 regression — the spec is untouched by this packet — but it
is a merge gate that fails under the load its own CI job creates.

## The gap this exposes in the library

Recorded, not acted on — `<stop_conditions>` says a replacement that needs a new
core component is a separate, unadmitted feature.

1. **No tone renders on a brand surface.** `CanonicalTone` is
   `neutral | primary | success | warning | danger | info`, all built on
   `--dz-foreground` / `--dz-muted` / surface tokens. A control on a brand
   gradient or a photo — an announcement bar, a hero overlay — has no tone to
   ask for, so every app hand-rolls one. This is the single reason the two
   clearest replacement candidates were rejected.
2. **`DzButton`'s `ui` surface is `root` + `spinner`.** That is honest (its
   anatomy says so, and the slots render consumer content with no wrapper of the
   button's own), but it means "the same button, pill-shaped, in muted
   foreground" is five overrides on one part rather than two named ones.
3. **The landing has no direction control.** Adding `dir` to the app shell — a
   toolbar, a query parameter, or a locale — would let the responsive
   certification cover the chrome as well as the blocks. It is a product
   decision, not a refactor.

## Evidence

| Gate | Result |
|---|---|
| `yarn lint` (`--max-warnings 0`) | exit 0 |
| `yarn typecheck:all` | exit 0 |
| `vitest run apps/landing/src` | **49 files / 2,597 passed** (was 47 / 2,590 — the two new specs) |
| `yarn landing:build` | exit 0 |
| `yarn test:e2e:landing` | **105/105** in four of five runs — see finding 4; includes the light **and** dark hero visual snapshots, unchanged |
| `yarn test:responsive:landing` | **88/88** across both directions, twice |
| `yarn validate:bundle-budget` | 2 passed, 0 failed |
