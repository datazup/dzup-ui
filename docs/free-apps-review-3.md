# dzup-ui — Free-Tier Apps Review #3 (`apps/landing`)

> **Status:** Specification. The `<task>` blocks below are the build.
> **Owner:** dzup-ui team · **Review date:** 2026-07-17 · **Baseline:** working tree on top of `d3047a8` (branch `main`, 623 modified files uncommitted — this review measured *that* state, not the commit)
> **Scope:** the free-tier landing app — `apps/landing` (source, registry artifacts, scripts, CI gates). The Storybook app was reviewed in [`free-apps-review.md`](./free-apps-review.md) and is touched here only where a finding crosses both.
>
> **Method:** three independent sweeps of this checkout — the app-level source
> (`App.vue`/router/pages/components/composables/`index.html`), the content/registry layer
> (blocks, templates, gallery, motion, `public/r/**`, `src/generated/**`), and the
> build/test/CI infrastructure (scripts, workflows, Playwright, Lighthouse) — plus a
> line-by-line verification of every TASK-FREE2-\* checkbox and a fresh run of every gate.
> Every claim carries a `file:line` or a command result, re-verified before being written down.
> Where two sweeps disagreed (the `public/r` drift guard), the workflow file was read again
> by hand and the loser was dropped.
>
> **Relationship to other docs:** follow-up to [`free-apps-review.md`](./free-apps-review.md)
> (Review #2, TASK-FREE2-01…12) and [`free-apps-audit.md`](./free-apps-audit.md)
> (TASK-FREE-01…18). Review #2 found the gate declared done at 90% and the two-domain identity
> crisis; **its defect tier is now fixed and verified below.** This review finds what is left:
> one of the three registries breaks the
> `shadcn add` contract the other two document, the live-stats fetcher targets a GitHub repo
> that doesn't exist, and the prose makes one capability claim the code disproves. It then
> adds the improvement tier. [`design-tasks.md`](./design-tasks.md) (TASK-DS-\*) and
> [`new-features.md`](./new-features.md) remain separate backlogs.
>
> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
> **Priority:** 🟠 P1 (user-visible defects & false claims) · 🟢 P2 (consistency, coverage & new capability)
> **Numbering:** `TASK-FREE3-*`, distinct from `TASK-FREE-*`, `TASK-FREE2-*`, `TASK-DS-*`, `TASK-APP-*`.
> Numbering starts at `-02`; the IDs of the remaining tasks are left unchanged from the
> original draft so existing references stay valid.

---

## Part 1 — Where Review #2 stands (measured 2026-07-17)

Every TASK-FREE2 checkbox was **verified against the tree, not trusted**, and every gate
was re-run on this checkout:

| Gate (run 2026-07-17) | Result |
|---|---|
| `yarn lint` (packages/ + apps/, `--max-warnings 0`) | ✅ exit 0, zero output |
| `npx vue-tsc -p apps/landing/tsconfig.json` | ✅ 0 errors (Review #2 measured 6) |
| `yarn workspace @dzup-ui/landing test` | ✅ **32 files / 1,953 tests, all green** (was 23 / 1,676) — includes per-page axe, single-`<main>` landmark checks, route-announcer assertion |

| Task | Doc says | Verified verdict | Evidence |
|---|---|---|---|
| TASK-FREE2-01 (apps under lint+typecheck, zero baseline) | `[x]` | ✅ **Fixed** — runtime-confirmed above | `package.json:19` `eslint packages/ apps/ --max-warnings 0`; `typecheck:apps` folded into `typecheck:all`; scratch file deleted |
| TASK-FREE2-02 (unship Visual Refresh gallery) | `[x]` | ✅ **Fixed** | `.storybook/main.ts:29,80-85` — `_gallery`/`_app-specific` excluded by default, opt-in via `DZUP_GALLERY`; zero bare `@storybook/vue3` imports remain |
| TASK-FREE2-03 (broken/lying doc links) | `[x]` | ✅ **Fixed** | `ComponentStatus.mdx:140`, `Typography.mdx:68`, `Releases.mdx:24` all corrected; `check-mdx-links.mjs` guards |
| TASK-FREE2-04 (coming-soon lede, double `<main>`, stale registry comment) | `[x]` | ✅ **Fixed** | `EcosystemGrid.vue:28`; `AiIdePage.vue:86` is a `<div>`; zero "Phase A1" in `apps/landing/src` |
| TASK-FREE2-05 (one canonical origin) | `[x]` | ✅ **Fixed** | `grep dzup-ui.dev` over `apps/` (incl. `public/r/**`) = 0 matches; `claims.spec.ts` bans reappearance |
| TASK-FREE2-06 (app-specific components decision) | `[x]` | ✅ **Fixed** | stories relocated to `stories/_app-specific/`, excluded from the public build |
| TASK-FREE2-07 (story raw colours, DzButton `_shared`) | `[x]` | ✅ **Fixed** | `DzColorPicker.stories.ts:223-332` tokenized; `DzButton.stories.ts:15` imports `../_shared` |
| TASK-FREE2-08 (`system` theme reachable) | `[x]` | ✅ **Fixed** | `ThemeToggle.vue:44-50` renders `DzColorModeToggle` with `:show-system="true"`; `useProviderThemeSync.ts` reconciles the dual writers |
| TASK-FREE2-09 (live template previews) | `[ ]` | ❌ **Not done** — carried forward, see Part 3 | `TemplatesPage.vue:93-121` still static `.webp` + icon `onerror` fallback |
| TASK-FREE2-10 (on-site What's New + RSS) | `[ ]` | ❌ **Not done** — carried forward | `config.ts:132` still deep-links GitHub; no `/changelog` route, no feed |
| TASK-FREE2-11 (Storybook viewport/RTL/density toolbars) | `[ ]` | ⚠️ **Partial** — carried forward | viewport toolbar shipped via TASK-FREE-17 (`preview.ts:35,48-49`); RTL `dir` global, density, keyboard-shortcuts guide still absent |
| TASK-FREE2-12 (per-component "Open in playground") | `[ ]` | ❌ **Not done** — carried forward | only the pre-existing REPL/StackBlitz infra; no autodocs affordance |
| Amendment TASK-FREE-08 (OG-image 404s) | open | ✅ **Fixed** | `build-og-images.ts` + `generated/ogImages.ts` manifest; `router.ts:232,315` advertise `og:image` **only** for manifest-present files — nothing points at a 404 |
| Amendment TASK-FREE-18 (stale "schema only" comment) | open | ✅ **Fixed** | `blocks/registry.ts:8` header rewritten |

**Net:** the entire defect tier of Review #2 (01–08) landed and holds under fresh
measurement. What remains open from it is exactly the improvement tier (09–12) — those four
are **not** re-specified here; they stay live in `free-apps-review.md` and are listed in
Part 3 so this document is a complete picture of the backlog.

---

## Part 2 — What this review found (all new, all verified)

| # | Severity | Finding | Evidence |
|---|---|---|---|
| 1 | 🟠 | **The animations registry breaks the `shadcn add` contract the blocks registry documents as fatal.** `registryDependencies` carries bare `Dz*` component names (`["DzCard","DzAvatar"]`, even landing-local `DzAurora`), the schema pins the shadcn-vue *fork* instead of canonical `ui.shadcn.com`, and `files[].type` is the item-type `registry:block` with no `target` — three divergences from `blocks/registryItem.ts`'s own rules, and the spec **asserts the divergence as intended** | `gallery/registryItem.ts:33-34,70,118,123,139` vs `blocks/registryItem.ts:24-31,43-44,154-160`; `gallery/registryItem.spec.ts:97-98`; live artifacts `public/r/animations/*.json` |
| 2 | 🟠 | **Live-stats fetcher targets a GitHub repo that doesn't exist**: `GITHUB_REPO = 'dzup-ui/dzup-ui'` vs the real `datazup/dzup-ui` everywhere else — and `orgConsistency.spec.ts` only matches full `github.com/<org>/` URLs, so the bare `owner/repo` slug slips the gate. Once `VITE_ENABLE_LIVE_STATS=true`, the star pill 404s while the footer badge (correct slug) works | `lib/liveStats.ts:26,59` vs `config.ts:129`, `Footer.vue:60`; `orgConsistency.spec.ts:70` |
| 3 | 🟠 | **Feature grid claims a "first-party Nuxt module available"** — `packages/nuxt` exists in-repo but is unpublished (npm 404), the Nuxt guide doesn't exist, and the compare table's own Framework cell says plain `'Vue 3'`. The Hero trust row lists `'Nuxt'` too. Round numbers were made honest by the counts machinery; this is the same failure in prose | `data.ts:80`, `Hero.vue:62` vs `Footer.vue:32-34`, `data/compare.ts:75` |
| 4 | 🟠 | **StackBlitz and MCP flows depend on npm packages that 404 today**: generated StackBlitz projects pin `@dzup-ui/*@^0.1.0` (unpublished → `npm install` fails), `/ai` instructs `npx @dzup-ui/mcp` — while the rest of the site scrupulously disables anything unpublished (live stats, npm badges). Inconsistent honesty bar | `lib/stackblitz.ts:28`, `AiIdePage.vue` vs `useLiveStats.ts:48-51`, `Footer.vue:52-56` |
| 5 | 🟠 | **Mobile LCP fails the 2.5 s budget on every measured route (3.08–4.34 s) but is warn-gated** — a change pushing mobile LCP to 8 s passes CI. Desktop is `error`; mobile (the majority device) is advisory, and the exception is pinned in both directions by a spec | `lighthouserc.mobile.json:3,20` vs `lighthouserc.json:22`; `lighthouserc.spec.ts:76-85` |
| 6 | 🟢 | `sitemap.xml`/`robots.txt` are generated in `build` but are the **one committed artifact family missing from the CI drift guard** — the guard rebuilds registry/animations/component-index/counts/og and diffs them, but never runs `build:sitemap`. A block added without a rebuild ships a stale committed sitemap undetected. (`build:stats` is excluded *on purpose* — live APIs; sitemap is a pure projection and could be guarded) | `ci.yml:160-174` vs `package.json:17`; `build-sitemap.ts:26,187-188` |
| 7 | 🟢 | Three manual-only generators commit visual/identity assets with no drift story: `yarn og` (`shoot-og.mts` → `public/og/*.png`), `yarn thumbnails`, `yarn brand-assets`. `build-og-images.ts` only *inventories* what exists — if a block's visuals change, its committed OG card stays stale and the manifest keeps saying "fine" | `package.json` scripts; `build-og-images.ts:19-24` |
| 8 | 🟢 | **The CI `e2e` job never exercises the landing app** — it runs the Storybook suites. The landing's only browser test in CI is the light+dark pixel guard, which runs against the **dev server**, not `dist`; the hero snapshot test only has win32 snapshots so it silently skips on ubuntu; there is no mobile-viewport or functional (nav/palette/404/theme) browser coverage at all — those live only in jsdom | `ci.yml:422-429,490`; root `package.json:54-57`; `playwright.config.ts:39,44`; `e2e/visual.spec.ts:98-133` |
| 9 | 🟢 | Unit a11y suites gate **serious/critical only** — moderate rules (`landmark-no-duplicate-main`, `landmark-unique`) pass silently; the `/ai` double-`<main>` shipped past this exact suite and was patched with a one-off structural assertion rather than closing the class | `blocks/a11y.spec.ts:84`, `pages.a11y.spec.ts:66,146-181` |
| 10 | 🟢 | Skip-link target `<main id="main">` has no `tabindex` — the `tabindex="-1"` is added only in the router `afterEach`, so on **first load** (no navigation yet) skip-link focus movement is browser-dependent | `App.vue:70-74,103,109` |
| 11 | 🟢 | CSS token fallbacks paint the **wrong brand**: indigo/violet (`#6366f1`, `#4f46e5`, `#a855f7`) where brand primary-500 is `#0766ee`; `theme-color` meta is one static value, never dark | `TopNav.vue:242,247`, `Footer.vue:160,219`, `AnnouncementBanner.vue:103-106`, `App.vue:276`, `NotFoundPage.vue:130`, `RethemeButton.vue:91` vs `public/favicon.svg:4`, `index.html:14` |
| 12 | ✅ | ~~16 of 44 templates ship **no dark-mode thumbnail**~~ — **closed 2026-07-20 by TASK-FREE2-09**, which regenerated the full set (44 light + 44 dark). See TASK-FREE3-09 | was `public/templates/thumbnails/` 44 light vs 28 dark; now 44/44 |
| 13 | 🟢 | Copy-paste consistency drift in 3 content blocks: raw `<h4>/<h5>/<h6>` instead of `DzHeading :level="n"` (levels are correct, so a11y is fine — but consumers copy the exception) | `TocAside.vue:37-92`, `CodeShowcase.vue:71`, `BlogList.vue:97,125` |
| 14 | 🟢 | Interaction polish: clipboard failures on `/themes` are swallowed with no "copy failed" affordance; the mobile drawer never moves focus on open; the `mailto:` contact link opens with `target="_blank"` (orphan blank tab) | `ThemesPage.vue:116-123`; `TopNav.vue:59,157`; `Footer.vue:23,106-111` |
| 15 | 🟢 | Stale-comment debt: `AiIdePage.vue:90` cites a `pageLandmarks.spec.ts` that doesn't exist (the invariant lives in `pages.a11y.spec.ts`); three comments quote the historical documented-count as 139 while `generated/counts.ts:12` says 137; `scripts/verify-auth.mts` is a self-labelled "throwaway" wired to nothing | `AiIdePage.vue:90`; `lib/seo.ts:10`, `data.ts:9`, `data/compare.ts:20` vs `generated/counts.ts:12`; `verify-auth.mts:3` |
| 16 | 🟢 | Landing coverage `functions` floor is 65% (measured 65.52%) against the repo's stated 80% bar — a real, documented gap in handler/composable coverage | `vitest.config.ts:74-79` |
| 17 | 🟢 | No i18n/RTL seam at the app shell: static `lang="en"`, no `dir` handling in the chrome (block previews accept `?dir`, the shell doesn't). Recorded as a capability gap, not a defect | `index.html:2`, `router.ts:183` |

**Reviewed and accepted (no task):** the `#fff` caption colours over image scrims in
`media/CarouselShowcase.vue:162,183,189` and `media/Gallery.vue:216` (commented, legibility
over photos) and the hex brand presets inside the colour-picker demo `AppearanceEditor.vue`
(inherent to the demo). The two `Footer.vue` files are intentional (site chrome vs
copy-paste block), not a duplicate.

**Found healthy, preserve:** origin single-sourced with zero `.dev` leakage and spec-guarded;
per-route SEO head correct and self-resetting with manifest-gated `og:image`; `system` theme
mode reachable and the dual-writer bug fixed; layered error handling (`DzErrorBoundary`,
`lazyComponent` retry/timeout, real 404 page, plain-DOM last resort); only `/` eager, `?raw`
globs out of the entry, `.route-view` CLS guard on both transition paths; route-change focus
+ aria-live announcer; ⌘K palette on a freshly generated component index; blocks & templates
registries fully shadcn-conformant (`registryDependencies: []`, canonical schema,
`registry:file`+`target`) with **zero drift** across all 87 committed block JSONs;
`generated/counts.ts` exact against the filesystem; OG manifests exactly match disk; motion
primitives leak-free, SSR-guarded, reduced-motion honoured; `certifications.ts` still
CI-backed with live `KNOWN_A11Y_DEBT` pointers; bundle budget healthy (206/240 kB entry JS,
244/285 kB payload, gzip-9, gated in CI); Lighthouse config drift-guarded by spec; the CI
drift guard over `public/r/**` + llms + counts **does exist and works** (`ci.yml:160-174`) —
one sweep claimed otherwise and was wrong.

---

## Part 3 — Carried forward — **all four landed 2026-07-18/19, after this review was drafted**

The improvement tier owned by [`free-apps-review.md`](./free-apps-review.md) has since
shipped. Verified on this tree 2026-07-20:

- **TASK-FREE2-09** ✅ live template previews — the build guard + `--missing` thumbnail mode
  retired the `onerror` icon fallback (`TemplatesPage.vue:102`). **This closes finding 12 and
  TASK-FREE3-09 below**: `public/templates/thumbnails/` now holds 44 light **and** 44 dark.
- **TASK-FREE2-10** ✅ on-site What's New + Atom feed — `/changelog` route (`router.ts:392`)
  and `public/feed.xml`, generated from a shared release parser in `packages/tooling`.
- **TASK-FREE2-11** ✅ Storybook global RTL toolbar (`preview.ts:31-33`, `globalTypes.direction`).
  Density was deliberately deferred — there is no `--dz-spacing` scalar to drive it.
- **TASK-FREE2-12** ✅ per-component "Open in playground" on every autodocs page, with
  snippets generated from `@example` and compile-validated.

Nothing from Review #2 remains open. This document is now the whole free-tier backlog.

---

## How these tasks are written

Same contract as [`free-apps-audit.md`](./free-apps-audit.md#how-these-tasks-are-written):
each task is a ready-to-run agent prompt per Anthropic's prompt-engineering guidance
([be clear and direct](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct),
[use XML tags](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/use-xml-tags),
[give Claude a role](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts),
[let Claude think](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/chain-of-thought)) —
a `<role>`, a one-sentence `<task>`, the `<motivation>` an agent cannot infer, named
`<requirements>` that are each a checkable constraint, ordered `<steps>`, and
`<success_criteria>` that is the definition of done. Copy a block verbatim into an agent,
together with the conventions block below.

```xml
<repo_conventions source="CLAUDE.md + ADR-04/12/15/17, measured 2026-07-17 — authoritative">
  <apps>
    apps/landing — Vite + Vue 3 + vue-router SPA. Pages in src/pages/, blocks in src/blocks/
      (87 across 12 categories), templates in src/templates/ (44, iframe-previewed), motion in
      src/motion/, effect demos in src/gallery/. SITE_ORIGIN single-sourced in src/origin.ts
      (https://dzup-ui.com). GENERATED (never hand-edit): src/generated/**, public/r/**,
      public/llms*.txt, public/sitemap.xml, robots.txt, the counts block in index.html —
      scripts/build-*.ts own them, claims.spec.ts + the CI drift guard (ci.yml "Landing
      generated artifacts unchanged") enforce them. Never type a count.
    apps/storybook — Storybook 10. Covered by free-apps-review.md; only cross-cutting
      changes here touch it.
  </apps>
  <styling>Token-only (ADR-04) in components, stories AND landing: every colour is a
    var(--dz-*) reference; no raw hex/rgb, no Tailwind palette classes. --dz-{intent} is a
    fill/border colour, never a text colour — use --dz-{intent}-muted-foreground.
    Blocks use DzHeading :level="n" (they nest under BlockPreview's H3), never raw <h*>
    and never DzText with a heading `as`.</styling>
  <a11y>WCAG 2.2 AA. Exactly one <main> and one <h1> per document. Honour
    prefers-reduced-motion. Verify light AND dark (Playwright defaults to light).</a11y>
  <validation>
    yarn typecheck && yarn lint            # both exit 0/0 on this baseline — any problem is YOURS
    yarn typecheck:apps                    # landing vue-tsc, 0 errors baseline
    yarn workspace @dzup-ui/landing test   # 32 files / 1,953 tests green baseline
    yarn test                              # 1 pre-existing win32 failure (path separators) is
                                           # the green baseline on Windows; don't run
                                           # concurrently with a storybook build
    yarn build && yarn storybook:build     # required order: packages before storybook
    yarn workspace @dzup-ui/landing build  # throws if storybook-static missing
    yarn validate:tokens                   # colour-lint + contrast gates
  </validation>
  <scope>Free tier. Never gate a demo, never add a paywall. "Pro" is reserved for the paid tier.</scope>
  <honesty>Never print a number a build step did not derive. Never claim a capability that is
    not published and verifiable (the Nuxt-module lesson). Never leave a comment that
    describes shipped code as unbuilt — or unbuilt code as shipped.</honesty>
</repo_conventions>
```

---

# 🟠 P1 — Contract breaks & false claims

---

## [ ] TASK-FREE3-02 — Bring the animations registry up to the shadcn contract the blocks registry documents

```xml
<role>
You are the registry maintainer who wrote the warning in blocks/registryItem.ts:24-31: a
bare component name in registryDependencies makes `shadcn add` try to fetch
<registry>/DzButton.json and 404. The blocks and templates registries obey that rule; the
animations registry — built later, its docstring claiming to "mirror the Blocks registry
shaping one-for-one" — violates it three ways, and its spec asserts the violations as
intended behaviour. These are live, fetchable artifacts under public/r/animations/.
</role>

<task>
Make the animations registry emit the same canonical shadcn shape as blocks and templates —
empty registryDependencies with runtime packages in dependencies[], the ui.shadcn.com
schema, and registry:file entries with explicit targets — and fix the spec so it enforces
the contract instead of cementing the divergence.
</task>

<motivation>
Verified in source and in the emitted artifacts, 2026-07-17:
  • gallery/registryItem.ts:139 — registryDependencies: [...entry.components] emits bare
    Dz* names: public/r/animations/animated-beam.json carries ["DzCard","DzAvatar"];
    aurora-drift.json carries ["DzAurora"], a landing-local src/motion primitive that is
    not resolvable by ANY means (not npm, not the registry).
  • gallery/registryItem.ts:33-34 — schema pinned to https://shadcn-vue.com/schema/…, the
    fork; blocks pin canonical ui.shadcn.com and blocks/registryItem.spec.ts:39 asserts
    "not the shadcn-vue fork" as policy.
  • gallery/registryItem.ts:70,118,123 — files[].type is 'registry:block' (an ITEM type,
    not a file kind) and no target is emitted; blocks/templates use 'registry:file' +
    explicit target (blocks/registryItem.ts:154-160).
  • gallery/registryItem.spec.ts:97-98 asserts registryDependencies equals components
    verbatim — the spec protects the bug.
  • Mitigant: no first-party surface consumes these via CLI yet ("no CLI is wired here",
    module docstring). That is why this is P1 and not P0 — but the artifacts are public.
</motivation>

<requirements>
  <shape>toRegistryItem for gallery emits: registryDependencies: [] always; npm runtime
    packages (e.g. @dzup-ui/core) in dependencies[] exactly as blocks do; $schema and
    per-item schema from ui.shadcn.com; files[] entries typed 'registry:file' with a
    target path consistent with the blocks convention. Component names still belong in
    the item — carry them in the meta/description the way blocks surface their
    composition, not in registryDependencies.</shape>
  <motion_case>Effects whose demo imports a landing-local src/motion primitive must
    include that primitive's source as an additional files[] entry (the copy-paste unit
    must be self-contained), or be excluded from the CLI-consumable registry with an
    explicit `standalone: false` style marker — pick one policy, document it in the
    module docstring, apply it uniformly. DzAurora-class entries must not ship
    unresolvable references either way.</motion_case>
  <spec>Rewrite gallery/registryItem.spec.ts to assert the canonical contract (empty
    registryDependencies, canonical schema host, registry:file + target) — mirror the
    assertions blocks/registryItem.spec.ts already makes so the three registries are
    tested to one standard.</spec>
  <regenerate>Re-run build:animations-registry; the CI drift guard (ci.yml "Landing
    generated artifacts unchanged") must pass, meaning committed public/r/animations/**
    matches the new generator output.</regenerate>
  <docstring>Fix the "mirrors the Blocks registry shaping one-for-one" docstring — after
    this task it should finally be true; if any deliberate difference remains, the
    docstring names it.</docstring>
</requirements>

<steps>
  1. Read blocks/registryItem.ts + its spec end-to-end — it is the reference
     implementation; note every field it emits and every assertion it carries.
  2. Decide the motion-primitive policy (bundle source vs mark non-standalone); write it
     down in the docstring first.
  3. Rewrite gallery/registryItem.ts emission + its spec.
  4. yarn workspace @dzup-ui/landing build:animations-registry; commit regenerated
     artifacts; verify with git diff that every animations/*.json changed shape as
     intended (spot-check animated-beam, aurora-drift, accordion-height).
  5. Full landing suite + lint/typecheck per <validation>.
</steps>

<success_criteria>
  - Every public/r/animations/*.json has registryDependencies: [], canonical
    ui.shadcn.com schema, and registry:file entries with targets.
  - No emitted artifact references a name that neither npm nor the registry can resolve.
  - gallery/registryItem.spec.ts enforces the same contract blocks' spec does.
  - CI drift guard green; landing suite green.
</success_criteria>
```

---

## [ ] TASK-FREE3-03 — Honesty pass: the wrong GitHub slug, the Nuxt claim, and the unpublished-package flows

```xml
<role>
You are the reviewer who built this site's honesty machinery — derived counts, disabled
npm badges, deliberately empty testimonials — and you know its value is binary: one false
claim discovered costs the credibility of every true one. Three claims currently fail the
bar the site sets for itself, and one of them is a latent runtime 404 the consistency gate
was specifically built to prevent but structurally cannot see.
</role>

<task>
Fix the GITHUB_REPO slug and widen the org-consistency gate to catch bare owner/repo
slugs; remove or truthfully reword the "first-party Nuxt module available" claim and the
Hero's Nuxt trust chip; and bring the StackBlitz/MCP surfaces to the same
disabled-until-published standard as the npm badges and live stats.
</task>

<motivation>
Measured on this checkout, 2026-07-17:
  • lib/liveStats.ts:26 — GITHUB_REPO = 'dzup-ui/dzup-ui'; the real repo is
    datazup/dzup-ui (config.ts:129, Footer.vue:60). fetchGithubStars() builds
    api.github.com/repos/dzup-ui/dzup-ui → 404. Both the runtime refresh AND the
    build-time bake (scripts/build-stats.ts) use this constant. orgConsistency.spec.ts:70
    only matches literal github.com/<org>/dzup-ui URLs, so the bare slug interpolated
    into an API path slips through — the gate has a structural blind spot, not a missed
    case.
  • data.ts:80 — "Tree-shakeable ESM with a first-party Nuxt module available." and
    Hero.vue:62 lists 'Nuxt' in the trust row. packages/nuxt exists in-repo but is
    UNPUBLISHED (npm 404); the Nuxt guide does not exist (Footer.vue:32-34 documents
    this); data/compare.ts:75 lists dzup's own framework as plain 'Vue 3'.
  • lib/stackblitz.ts:28 pins @dzup-ui/core|tokens|contracts to ^0.1.0 from npm —
    unpublished, so every generated StackBlitz project fails npm install. AiIdePage
    instructs `npx @dzup-ui/mcp` — also 404. Meanwhile useLiveStats.ts:48-51 and
    Footer.vue:52-56 document why npm badges and stats are OFF until publish: the site
    already has a standard for exactly this situation; these two surfaces just predate it.
</motivation>

<requirements>
  <slug>One exported constant for the owner/repo slug (derive it from config.ts LINKS.github
    or define it beside SITE_ORIGIN — single source either way); liveStats and build-stats
    consume it. Widen orgConsistency.spec.ts to also scan for bare `<wrong-org>/dzup-ui`
    slug literals (dzup-ui/dzup-ui and any historical org names) across apps/ src, so this
    class cannot recur.</slug>
  <nuxt>data.ts:80 stops claiming availability: either scope it to what is true today
    ("SSR-safe, tree-shakeable ESM" — the Nuxt module ships when it ships) or make it a
    roadmap-marked line, consistent with how the ecosystem grid handles status. Remove
    'Nuxt' from Hero.vue:62's trust row (that row lists things the library is BUILT WITH
    that a visitor can verify) until @dzup-ui/nuxt is published and the guide exists.</nuxt>
  <stackblitz_mcp>Pick the same pattern the npm badges use — feature-flag the StackBlitz
    buttons and the /ai npx instructions behind the publish, with an honest inline note
    ("available at v0.1 publish") — OR make them work today (e.g. StackBlitz projects
    that vendor the built tarballs). Do not leave flows that end in npm 404 reachable
    from primary CTAs. Whichever pattern you pick, apply it to BOTH surfaces.</stackblitz_mcp>
  <no_regression>claims.spec.ts and orgConsistency.spec.ts stay green; if you add the
    slug scan, seed it with a fixture proving it catches 'dzup-ui/dzup-ui'.</no_regression>
</requirements>

<steps>
  1. Fix the constant; grep apps/ for every 'dzup-ui/dzup-ui' occurrence (comments too —
     useLiveStats.ts:34 has one) and align them.
  2. Widen orgConsistency.spec.ts; watch it fail on the pre-fix tree state (or a fixture),
     then pass.
  3. Reword data.ts:80 + Hero.vue:62; re-run the landing suite (claims.spec reads shipped
     files — regenerate whatever build:counts owns if wording feeds an artifact).
  4. Implement the chosen publish-gate pattern for StackBlitz + /ai MCP instructions.
  5. Full <validation> list.
</steps>

<success_criteria>
  - api.github.com path is built from the same slug the footer badge uses; a wrong-slug
    literal anywhere in apps/ fails orgConsistency.spec.ts.
  - No shipped prose claims the Nuxt module is available; Hero trust row lists only
    verifiable stack facts.
  - No reachable CTA leads to an npm 404; the gate pattern is uniform across
    StackBlitz, MCP, badges, and stats.
  - Landing suite 32/1,953 baseline green (numbers may grow, never shrink).
</success_criteria>
```

---

## [x] TASK-FREE3-04 — Get mobile LCP under budget and flip the gate from warn to error

> **Landed 2026-07-20 as End State B (ratchet), because End State A is provably unreachable.**
> LCP can never precede FCP, and mobile FCP measures 2222–2686ms on every audited route —
> `/blocks` and `/templates` exceed 2500ms **at FCP alone**. The site is fully client-rendered
> (`<div id="app">` ships empty), so nothing is contentful until 226.5 kB gzip of critical path
> lands and mounts Vue. Cutting the entry by 19 kB gzip moved FCP by approximately nothing,
> which is the evidence that the cost is the whole path rather than one trimmable chunk.
> Reaching 2500 needs prerendered above-the-fold HTML (SSG); that is the ratchet's next lever
> and a much larger change than this task.
>
> Mobile LCP is now `["error", 4000]` — tight enough to fail the pre-task site (worst route
> 4192–4296ms) and loose enough not to paint CI red on day one. **The 4000 is provisional:**
> it was calibrated on a dev machine and CI reads higher, so the first CI run is the real
> calibration, with a one-time documented raise permitted if needed. `lighthouserc.spec.ts`
> pins both bounds and the "never back to warn" rule.
>
> Measured improvements (medians of 3 interleaved runs, two sessions): `/blocks/hero-split`
> **4296 → 3559ms (-737ms)**, `/compare` -156ms, `/` -251ms; `/blocks` and `/templates` net
> flat within noise. TBT on `/` 496 → 161ms (crosses the 300ms budget). Entry JS 154 → 135 kB
> gzip, initial payload 248 → 227 kB. CLS stayed 0 across all 120 measured runs.
>
> **Two findings worth more than the numbers.** (1) The a11y suite's `IntersectionObserver`
> stub was a no-op, so `observe()` never fired — once sections mount lazily that means axe
> audits a page of empty placeholders and passes. Fixed to report an immediate intersection;
> it promptly exposed a real bug, a skipped heading level (h2 → h4) on **every** block detail
> page, now fixed with a visually-hidden `h2`. (2) Preloading a route's full static-import set
> made `/blocks` *worse* (FCP +293ms, LCP +484ms): a preload is a reprioritisation, not extra
> bandwidth, and pulling a 488 kB chunk forward starves the entry. The plugin now bounds
> preloads to imports ≤60 kB.
>
> **Not done:** no image lever was applied — the LCP element on both worst routes turned out
> to be a text paragraph, not an image, so `fetchpriority`/eager-loading would have been a
> fix to a non-problem. Webfonts were checked and ruled out too (landing uses system fonts).

```xml
<role>
You are a performance engineer who knows a warn-gated budget is a decision to lose slowly:
every measured mobile route is over the 2.5 s LCP line today, desktop is hard-gated, and
mobile — the majority of first visits to a component-library site coming from social and
search — is the one form factor where regressions are free. The bundle-size lever is
already pulled (206/240 kB, gated); the remaining levers are TBT/render path, per the
prior A/B harness work.
</role>

<task>
Drive mobile LCP under 2.5 s on every audited route and flip
lighthouserc.mobile.json's largest-contentful-paint assertion from warn to error — or,
if 2.5 s is genuinely unreachable on the throttled profile, land a ratchet: error at a
measured achievable ceiling now, tightening as wins land, so the number can never move
backwards unwatched again.
</task>

<motivation>
Measured, recorded in-repo:
  • lighthouserc.mobile.json:20 — ["warn", {maxNumericValue: 2500}]; desktop
    (lighthouserc.json:22) is ["error", 2500].
  • The //lcp note (mobile.json:3) records: / 3.09s, /blocks 4.15s, /templates 3.77s,
    /compare 3.08s, /blocks/hero-split 4.34s — all failing.
  • lighthouserc.spec.ts:76-85 pins the warn-exception in both directions, so flipping
    the gate requires updating that spec — it will remind you.
  • Prior art in-repo: the perf A/B harness memory (interleaved vite preview ports;
    sequential runs are machine-drift noise), the entry-chunk work (?raw globs evicted),
    the vendor split (vite.config.ts:30-44). CLS and a11y are already error-gated on
    mobile — LCP is the only advisory number left.
</motivation>

<requirements>
  <measure_first>Establish the current mobile LCP breakdown per route (element, phase:
    TTFB/load-delay/load-time/render-delay) with the interleaved A/B method before
    changing anything. Name the LCP element per route in your findings — /blocks and
    /blocks/hero-split at 4.1-4.3s are the priority targets.</measure_first>
  <levers>Candidate levers, in expected-value order: defer/skip below-fold work on the
    index pages (the blocks index mounts many previews), preconnect/preload the LCP
    resource, font-display and critical CSS, TBT reduction on route mount (long tasks
    delay render), image sizing/priority hints. Do not regress the desktop error gates,
    the CLS 0.1 gate, or the bundle budget while pulling them.</levers>
  <gate>End state A (preferred): all audited routes < 2500 ms mobile → flip mobile.json
    to ["error", 2500] and update lighthouserc.spec.ts to assert the two configs now
    agree on LCP. End state B (fallback, only with evidence A is unreachable): set
    ["error", <measured p75 ceiling + margin>] with a dated comment stating the ratchet
    plan, and update the //lcp note with fresh numbers either way.</gate>
  <honest_numbers>Update the //lcp measurement note with your final measured values and
    date — it is the only place these numbers live; stale ones mislead the next
    engineer.</honest_numbers>
</requirements>

<steps>
  1. Build everything; run the mobile Lighthouse config locally against vite preview,
     twice interleaved, record per-route LCP element + phase breakdown.
  2. Attack the worst route first (/blocks/hero-split 4.34s); re-measure after each
     lever; keep a change→delta log.
  3. When routes pass (or the ceiling is proven), flip the assertion + fix
     lighthouserc.spec.ts + refresh the //lcp note.
  4. Run the full landing-perf gate list: check:bundle, check:storybook, both Lighthouse
     configs. CI must be green with LCP as error.
</steps>

<success_criteria>
  - lighthouserc.mobile.json's LCP assertion level is "error" (at 2500, or at a
    documented ratchet ceiling with a dated plan).
  - lighthouserc.spec.ts reflects the new state; the //lcp note carries fresh dated
    numbers.
  - Desktop LCP/CLS/a11y error gates and the bundle budget still pass.
</success_criteria>
```

---

# 🟢 P2 — Consistency, coverage & capability

---

## [ ] TASK-FREE3-05 — Close the drift-guard gaps: sitemap into CI, a policy for screenshot assets, delete the throwaway script

```xml
<role>
You are the engineer who built the "Landing generated artifacts unchanged" CI step after
91 registry files shipped stale. The principle: every committed artifact that is a pure
function of the source tree gets rebuilt and diffed in CI; everything else gets an
explicit, written reason. Two families currently have neither.
</role>

<task>
Add build:sitemap to the CI drift guard (rebuilding and diffing public/sitemap.xml +
robots.txt), write down the drift policy for the three manual screenshot/asset generators
(og, thumbnails, brand-assets) in the scripts README, and delete scripts/verify-auth.mts.
</task>

<motivation>
  • ci.yml:160-174 rebuilds registry/animations-registry/component-index/counts/og and
    diffs their outputs — build:sitemap is absent and sitemap.xml/robots.txt are not in
    the diff list, yet build-sitemap.ts:26 declares "GENERATED, NEVER HAND-EDITED" and
    package.json:17 runs it in every build. A route added without rebuilding ships a
    stale committed sitemap silently. (build:stats is excluded ON PURPOSE — live APIs —
    ci.yml:157-159 documents it; sitemap has no such excuse.)
  • yarn og / yarn thumbnails / yarn brand-assets commit PNGs/webp/SVGs with no drift
    story at all: build-og-images.ts:19-24 only inventories what exists, so a block whose
    visuals changed keeps serving its old OG card and nothing notices. Pixel-diffing
    screenshots in CI is NOT wanted (machine drift) — but the policy vacuum is.
  • scripts/verify-auth.mts:3 is self-labelled "Throwaway verification", referenced by
    nothing in package.json or CI — committed dead code in a directory whose README
    purports to explain every script.
  • build-sitemap.ts:64-73 keeps a hand-maintained STATIC_ROUTE_FILES map — fine today,
    but worth a header comment warning it must move when a page file is renamed.
</motivation>

<requirements>
  <sitemap_guard>ci.yml's drift step also runs `yarn workspace @dzup-ui/landing
    build:sitemap` and adds public/sitemap.xml + public/robots.txt to the git diff
    --exit-code list. Verify the generator is deterministic first (no timestamps in
    output — if there is a lastmod, make it derive from something stable or strip it),
    otherwise the guard flakes.</sitemap_guard>
  <asset_policy>scripts/README.md gains a short "committed screenshot assets" section
    naming the three generators, when to re-run each (og: when a template's visuals
    change; thumbnails: same; brand-assets: on brand change), and the explicit statement
    that they are exempt from the CI drift guard and why. The exemption becomes a
    decision, not an accident.</asset_policy>
  <coverage_report>Inherited from the retired TASK-FREE3-09: emit a per-kind coverage line
    ("templates: 44/44 light, 44/44 dark thumbs") from build-og-images.ts or the counts
    spec, and assert in claims.spec.ts (or a sibling) that thumbnail coverage does not
    DECREASE from the committed manifest. Pixel-diffing screenshots in CI is NOT wanted
    (machine drift) — counting them is. FREE2-09 closed today's gap; this keeps the next
    template batch from silently reopening it.</coverage_report>
  <delete>verify-auth.mts is deleted. If any doc references it as a live tool, fix the
    reference (docs/free-apps-*.md mention it historically — leave history intact,
    that's what it is).</delete>
</requirements>

<steps>
  1. Run build:sitemap twice; diff outputs to prove determinism (fix if not).
  2. Extend the ci.yml step; push a branch with a deliberately-stale sitemap once to
     watch the guard fail, then fix.
  3. Write the README policy section; delete the script.
  4. Full <validation> list.
</steps>

<success_criteria>
  - A stale committed sitemap.xml fails CI's drift step.
  - scripts/README.md documents the screenshot-asset policy and every file in scripts/
    is either wired or explained.
  - A new template lacking a dark thumbnail fails the non-decrease assertion.
  - verify-auth.mts is gone; lint/typecheck/test baselines hold.
</success_criteria>
```

---

## [x] TASK-FREE3-06 — Give the landing real browser e2e: functional flows against the built dist, CI-runnable snapshots, a mobile project

> **Landed 2026-07-21, with one step blocked on a push.** `apps/landing/e2e` now holds the
> five flows plus a Pixel 7 project; `playwright.config.ts` grew a `LANDING_E2E_TARGET=preview`
> switch that swaps the dev server for `vite preview` over `dist`, and a new gating
> `landing-e2e` CI job drives that. The job builds with `LANDING_SKIP_STORYBOOK=1` — no flow
> leaves the SPA, and mounting a multi-minute Storybook build would have eaten the whole
> budget; `landing-perf` still gates the real mount via `check:storybook`. The dev-server
> pixel guard was REMOVED from `landing-perf` rather than duplicated: the new job runs the
> same histograms against the built artifact, so keeping a weaker copy would have cost a
> Chromium install to assert less. Suite runs **16s** against preview / **28s** against dev
> locally, both green, so dev↔preview parity is confirmed — including that the existing win32
> hero baselines pass unchanged against `dist`, which settles whether baselines are
> target-sensitive (they are not).
>
> **Deliberate deviations and findings:**
> - **Nothing is hard-coded to the catalog.** `e2e/utils/catalog.ts` derives the block and
>   template URLs from `public/sitemap.xml` and the block title from `public/r/<id>.json` —
>   both generated from the registries and both diffed by CI's drift guard, so a renamed block
>   moves the fixtures with it instead of turning the suite red for a non-reason.
> - **Found — and then fixed — a real, shipped defect in the ⌘K palette.**
>   `useGlobalSearch` weights a block's `id` (10), `tags` (5) and `Dz*` components (2), and
>   `GlobalCommandPalette` puts that whole haystack in each row's `label` expressly so the
>   palette's substring filter "never drops a ranked match". It did not survive: Reka's
>   `ComboboxItem` registers each row's RENDERED TEXT with `ComboboxRoot` and hides any row its
>   own filter scores 0 — a second filter downstream of and invisible to the first. Because the
>   `#item` slot renders only title + category, searching `hero-centered`, `stat-row` or
>   `DzBadge` returned "No components, blocks or templates match" while `centered` worked.
>   `DzCommandPalette` now sets `ignore-filter` on `ComboboxRoot` and filters on `label` with
>   Reka's own `useFilter` collator, so matching stays case- and accent-insensitive rather than
>   silently downgrading to `includes`. That also removed a `:filter-function` binding which had
>   quietly stopped doing anything — it is not a `ComboboxRoot` prop in Reka 2.x, so it fell
>   through to `$attrs` onto the listbox. Guarded at both levels: a
>   `DzCommandPalette.spec.ts` case that mounts the REAL Reka stack (every stubbed/shallow test
>   in that file passed throughout the bug — `filteredItems` was always correct), verified to
>   fail with `ignore-filter` removed; and the landing e2e case, now a real test rather than the
>   `fixme` it started as. Changeset: `command-palette-label-is-the-search-key` (patch,
>   `@dzup-ui/core`) — which regenerates `src/generated/releases.ts`, committed with it since
>   CI diffs that file.
> - **`apps/landing/tsconfig.json` now includes `e2e/**` and `playwright.config.ts`**, so the
>   specs are typechecked by `typecheck:apps` in CI. They never were before — `visual.spec.ts`
>   included.
> - **BLOCKED: the Linux baselines are not committed yet.** Generating them requires a Linux
>   Chromium with the runner's font set; this workstation has no Docker daemon and no WSL, so
>   they cannot be produced locally. `.github/workflows/landing-e2e-snapshots.yml` shoots them
>   on the runner and uploads them for review + commit (dispatch, or push `ci/landing-snapshots`).
>   Until that artifact is committed, the `landing-e2e` job's two `hero snapshot` tests fail on
>   a missing baseline. **Do not "fix" that with `--update-snapshots=missing` in CI** — that
>   pins whatever the runner happened to render, unreviewed, and reports green.

```xml
<role>
You are a quality engineer who noticed the site's excellent-looking test wall has a
specific hole: 1,953 unit tests run in jsdom, but the only real browser that touches the
landing in CI is one pixel-histogram spec — pointed at the dev server, not the built
artifact that ships. Nav, palette, 404, and theme flows have never run in a real browser in CI,
the hero snapshot silently skips on ubuntu (win32-only snapshots), and no mobile viewport
is ever driven.
</role>

<task>
Add a functional Playwright suite for the landing's core flows that runs in CI against
the BUILT dist (vite preview), regenerate the visual snapshots on linux so the hero test
actually executes in CI, and add a mobile-viewport project covering at least the nav
drawer and one block page.
</task>

<motivation>
  • ci.yml:422-429 — the `e2e` job runs test:e2e:functional / test:e2e:visual which
    resolve (root package.json:54-55) to the STORYBOOK e2e dirs. Zero landing coverage.
  • The landing pixel guard runs once in landing-perf (ci.yml:490,
    --grep "renders real pixels") against playwright.config.ts:44's DEV server — the
    built artifact (dist/) is never driven by a browser.
  • e2e/visual.spec.ts-snapshots/ holds only *-win32.png; visual.spec.ts:98-133
    documents that the hero test skips on other platforms — green CI is not evidence
    the hero renders.
  • playwright.config.ts:39 declares a single Desktop Chrome project. Mobile exists in
    CI only as Lighthouse perf numbers (and LCP there is warn-gated — TASK-FREE3-04).
  • jsdom already covers routing/head/a11y logic well (router.spec.ts, pages.a11y.spec.ts)
    — do NOT duplicate those assertions in the browser; e2e earns its runtime by testing
    what jsdom cannot: real focus, real chunk loading, real viewport behaviour.
</motivation>

<requirements>
  <functional>A new e2e spec (or specs) covering, in a real Chromium: (1) TopNav
    navigation to /blocks and /templates including a lazy-chunk load; (2) ⌘K palette
    open→type→navigate; (3) direct-load of a deep route and of an unknown route (404
    page, URL preserved); (4) theme toggle light→dark→system with a data-theme
    assertion and no blank-paint (reuse the pixel-histogram helper); (5) skip-link:
    Tab from load, Enter, assert document.activeElement is inside #main — this
    doubles as the regression test for the skip-link finding (App.vue:103).</functional>
  <built_artifact>These run against `vite preview` of a real build in CI (the
    landing-perf job already builds everything — chain there, or give the e2e job its
    own build). The dev-server config stays for local iteration; CI drives dist.</built_artifact>
  <snapshots>Regenerate visual snapshots inside the CI ubuntu environment (commit
    *-linux.png next to the win32 ones) so the hero visual test executes on CI; keep
    the win32 snapshots for local Windows dev. maxDiffPixelRatio stays tight.</snapshots>
  <mobile>A second Playwright project (e.g. Pixel 7 descriptor) running at minimum:
    nav drawer open/navigate/close (with the focus expectations from TASK-FREE3-07 once
    it lands — write the test to the correct behaviour, mark it fixme until then if
    needed), and one block detail page render check.</mobile>
  <budget>Keep the whole landing e2e job under ~5 minutes: small flow set, no
    per-block sweeps (unit axe already covers that), workers per CI core.</budget>
</requirements>

<steps>
  1. Wire the CI job first (build → preview → one trivial spec) so the pipe exists;
     then grow the spec set.
  2. Port the pixel-histogram helper into a shared e2e util; write the five functional
     flows.
  3. Generate linux snapshots via the CI runner (or act/container locally); commit.
  4. Add the mobile project + its two specs.
  5. Verify ci.yml end-to-end green twice (flake check), locally run the suite against
     both dev and preview to confirm parity.
</steps>

<success_criteria>
  - CI runs a landing functional e2e suite against a built dist and it gates (no
    continue-on-error).
  - The hero visual test executes on ubuntu CI (linux snapshots committed).
  - A mobile-viewport project runs in CI covering the drawer and a block page.
  - Suite runtime ≤ ~5 min; two consecutive green runs.
</success_criteria>
```

---

## [x] TASK-FREE3-07 — App-shell interaction polish: skip-link focus, drawer focus, copy feedback, mailto

> **Landed 2026-07-20.** `tabindex="-1"` is now in App.vue's template (asserted on a fresh
> mount *before* any navigation — jsdom cannot do fragment navigation, so the unit test pins
> the app-side precondition and leaves real activation to FREE3-06's e2e flow). Drawer entry
> focus uses a template ref, not `getElementById`, so a second mounted nav can't steal it;
> non-modal is asserted so nobody upgrades it to a focus trap. `copyText` failure gets a
> button-label flip, a visible `role="alert"` beside the export text, and a polite live region
> that now announces the SUCCESS path too (it was silent before). **Deliberate deviation:** the
> failure state decays over 6s, not the success flash's 1.6s — the requirement said "same
> decay", but 1.6s is not long enough to read "select and copy manually", decide, and act.
> Footer discriminates on URL scheme (`mailto:`/`tel:`/`sms:`) rather than a per-entry flag.
> Comment sweep found **6** stale sites, not the 3 catalogued (`config.ts`, `AiIdePage.vue`,
> `claims.spec.ts` ×2 also carried them); the rule applied was to keep the *historical wrong*
> literal (it's a stable fact) and drop the *"real figure is N"* literal (it drifts).

```xml
<role>
You are a frontend engineer doing the last-mile interaction pass a design system's own
site must survive: the details keyboard and assistive-tech users hit in the first thirty
seconds, on the site whose product is "we sweat these details for you."
</role>

<task>
Make the skip link move focus on first load, move focus into the mobile drawer when it
opens, surface clipboard failures on /themes, and stop the mailto link opening a blank
tab — plus sweep the three stale comments this review catalogued.
</task>

<motivation>
  • App.vue:103 skip link targets <main id="main"> (App.vue:109) which has NO tabindex;
    the tabindex="-1" arrives only in router afterEach (App.vue:70-74) — on the first
    painted route no navigation has fired, so skip-link focus movement is
    browser-dependent. The robust pattern is a permanent tabindex="-1" on the target.
  • TopNav.vue:157 toggles mobileOpen with no focus move into #mobile-nav (only
    closeMobile at :59 restores focus). A keyboard user tabs through the remaining
    utility icons before reaching the menu they just opened.
  • ThemesPage.vue:116-123 copyText swallows clipboard errors (/* clipboard
    unavailable */) — in a non-secure context the user clicks Copy CSS/JSON/share-link
    and NOTHING happens, no "Copied", no error.
  • Footer.vue:23 marks mailto:hello@dzup-ui.com external:true → rendered with
    target="_blank" rel="noreferrer noopener" (Footer.vue:106-111); target=_blank on a
    mailto leaves an orphan blank tab in several browsers.
  • Stale comments: AiIdePage.vue:90 cites pageLandmarks.spec.ts (doesn't exist — the
    invariant lives in pages.a11y.spec.ts); lib/seo.ts:10, data.ts:9, data/compare.ts:20
    quote the historical documented-count as 139 while generated/counts.ts:12 says 137 —
    rendered numbers are all derived and correct, but the war-story comments now
    disagree with each other.
</motivation>

<requirements>
  <skip_link>tabindex="-1" lives permanently on <main id="main"> in the template (the
    afterEach can keep re-asserting it harmlessly). Add/extend a unit assertion in
    pages.a11y.spec.ts: on a fresh mount BEFORE any navigation, activating the skip
    link moves document.activeElement into #main.</skip_link>
  <drawer>On mobileOpen becoming true, focus moves to the first focusable element
    inside #mobile-nav (nextTick). Escape/close continues to restore focus to the
    toggle (already works — don't regress it). Non-modal drawer: no focus trap, just
    the entry move.</drawer>
  <copy_feedback>copyText failure sets a visible, aria-live-announced "Copy failed —
    select and copy manually" state (or equivalent) with the same decay the "Copied"
    flash has. Apply to every copy affordance ThemesPage routes through copyText.</copy_feedback>
  <mailto>The Footer link model distinguishes mailto from external-http: mailto renders
    with no target (default navigation). Keep rel hygiene for true external links.</mailto>
  <comments>Fix the pageLandmarks.spec.ts reference; align the three 139-comments to
    reference "the documented-component count at the time (see generated/counts.ts)"
    instead of a literal that drifts — or just correct the number and accept the next
    drift. Prefer the former: comments should not carry derivable numbers, per the
    honesty rule.</comments>
</requirements>

<steps>
  1. Skip link + spec assertion first (it feeds TASK-FREE3-06's e2e flow).
  2. Drawer focus move + a unit test with a mounted TopNav.
  3. copyText failure state + test (mock a rejecting navigator.clipboard).
  4. Footer mailto branch + nav.spec.ts/unit coverage.
  5. Comment sweep; full <validation> list.
</steps>

<success_criteria>
  - Skip link demonstrably moves focus on a fresh first load (unit-asserted).
  - Opening the mobile drawer moves focus into it; closing restores it.
  - A blocked clipboard produces visible, announced feedback on /themes.
  - The contact mailto opens in the same tab.
  - No comment in apps/landing/src references a nonexistent spec file or carries a
    stale count literal.
</success_criteria>
```

---

## [x] TASK-FREE3-08 — Brand-correct the CSS fallback colours and the theme-color meta

> **Landed 2026-07-20 — scope was much larger than this task states.** The `<motivation>`
> below names 6 chrome files. The real footprint was **503 fallback sites across 88 files**:
> the indigo-fallback convention had spread through `pages/`, `gallery/demos/`,
> `motion/components/`, `tailwind.css` and `motion/tokens.css`. Fixing only the 6 named files
> would have satisfied the wording while leaving the success criterion false everywhere else.
> Swept all of `apps/landing/src` except `blocks/` + `templates/` (visitor copy-paste source,
> exempt per this task — 377 sites, counted and reported by the guard rather than silently
> skipped). Confirmed with the user before widening.
>
> The sweep was a **resolver, not a find/replace**: each token is resolved through
> `tokens.css` (following `var()` chains into the primitive ramp) and converted with the same
> `oklchToHex` the manager-palette guard uses. A blind indigo→blue replace would have put
> primary-500's hex behind `--dz-colors-primary-600`, which is new drift wearing the old
> drift's clothes. Correcting *every* `--dz-*` fallback (not just brand ones) also fixed
> neutral/border/surface fallbacks that were Tailwind-slate guesses — `--dz-background` was
> `#ffffff` against a real light value of `#e7e8e9`.
>
> **Two findings this surfaced.** (1) `theme-color` cannot be handled by media queries alone:
> no CSS media query can see the app's manual `dz-theme` override, so `useTheme` now switches
> which meta *applies* (`media="all"`/`"none"`) rather than rewriting a colour — that keeps
> both brand literals in the HTML where the guard can still recompute them. (2) **Three
> phantom tokens** — `--dz-colors-base-white`, `--dz-colors-base-black`, `--dz-border-strong`
> — are referenced at 12 sites but defined nowhere in `tokens.css`, so their fallback is the
> only value that ever renders and is permanently unguardable. Left as-is (picking a real
> token for each is a design call, not a sweep) but the guard now asserts the phantom list
> explicitly, so a new one cannot be added silently.
>
> Guard: `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` (9 tests).

```xml
<role>
You are the design-token maintainer. The failure mode CSS fallbacks exist for — token
stylesheet missing or late — is precisely the moment the site must still look like
ITSELF. Today, if tokens fail, the site paints generic-template indigo instead of the
blue the favicon, manifest, and OG images establish as the brand.
</role>

<task>
Replace every indigo/violet literal fallback in apps/landing with the real brand values
(primary-500 #0766ee family), and make the theme-color meta respond to dark mode.
</task>

<motivation>
  • Brand primary-500 is #0766ee — public/favicon.svg:4, public/site.webmanifest:8,
    index.html:14 theme-color agree.
  • Fallbacks disagree: #6366f1/#a855f7 in TopNav.vue:242,247, Footer.vue:160,
    AnnouncementBanner.vue:103-106; #4f46e5 for --dz-primary/--dz-ring in App.vue:276,
    NotFoundPage.vue:130, Footer.vue:219, RethemeButton.vue:91. These are
    var(--dz-*, fallback) second arguments — invisible until the day they aren't.
  • index.html:14 theme-color is a single static light value; browser chrome stays
    light-branded in dark mode. Two <meta name="theme-color" media="(prefers-color-scheme:
    …)"> tags are the standard fix (and the FOUC script or theme runtime can keep it
    honest for the manual override case).
  • Note: this task is about the LANDING's own chrome files (--lp-* and inline
    fallbacks); block/template copy-paste code is already token-clean per this review.
</motivation>

<requirements>
  <sweep>Grep apps/landing/src for hex-literal fallbacks in var(--dz-*, …) and
    var(--lp-*, …) positions plus standalone style hexes in the chrome components; every
    brand-coloured one becomes the matching value from the tokens package's primary ramp
    (read packages/tokens for the authoritative hex per shade — do not eyeball). The
    accepted #fff-over-scrim cases in media blocks are OUT of scope (documented
    exception).</sweep>
  <theme_color>index.html ships paired theme-color metas with prefers-color-scheme
    media; if useTheme's manual override should also update it, wire it where the theme
    runtime already writes data-theme (small, no new dependency).</theme_color>
  <guard>Extend the existing colour-lint approach if practical: a check (spec or
    validate:tokens extension) asserting no var(--dz-…, #hex) fallback in apps/landing
    diverges from the token package's value for that variable. If that is
    disproportionate, a targeted claims.spec-style test over the known fallback sites
    is enough — pick one, state why in the test header.</guard>
</requirements>

<steps>
  1. Extract the authoritative primary/ring ramp values from packages/tokens.
  2. Sweep and replace the six files' fallbacks; visually verify light+dark (tokens
     loaded AND with the tokens stylesheet manually blocked, which is the case
     fallbacks exist for).
  3. Add the paired theme-color metas (+ optional runtime sync).
  4. Add the guard test; full <validation> list.
</steps>

<success_criteria>
  - Zero indigo/violet literals remain in apps/landing chrome; blocking the token
    stylesheet paints a recognisably dzup-blue degraded page.
  - Browser chrome colour follows dark mode.
  - A guard fails if a fallback diverges from its token again.
</success_criteria>
```

---

## [x] TASK-FREE3-09 — Dark thumbnails for the 16 uncovered templates, and a completeness check

> **Closed 2026-07-20 without being run — superseded by TASK-FREE2-09.** That task's
> template-preview work regenerated the full thumbnail set as a side effect: measured on this
> tree, `public/templates/thumbnails/` holds **44 light + 44 dark** `.webp` (was 44 + 28), so
> the 16-slug gap below no longer exists and the light-fallback path is unreachable for
> dark visitors. **Do not run this task.** The one requirement it carried that FREE2-09 did
> *not* deliver — a coverage report + non-decrease assertion so a future template can't
> silently ship half-covered — is folded into TASK-FREE3-05's `<asset_policy>` clause.
> The block below is retained only as the record of what was found.

```xml
<role>
You are finishing the templates gallery's dark-mode story. The manifest-gated fallback
built earlier is doing its job — dark visitors see the light screenshot instead of a
404 — but 16 of the 44 cards (the newest batch) still visibly flash light-mode shots in
a dark UI, on the page whose pitch includes dark-mode support.
</role>

<task>
Generate the missing 16 dark-variant thumbnails with the existing shoot-thumbnails
pipeline, regenerate the manifest, and add a check that reports (not gates) thumbnail
coverage so the next batch can't silently ship half-covered.
</task>

<motivation>
  • public/templates/thumbnails/ holds 44 light .webp but only 28 -dark.webp. Missing
    dark set (all dated 2026-06-25): error-500, error-403, coming-soon, pricing,
    feature-product, contact, about-faq, chat-messages, calendar-scheduler,
    file-manager, tasks-todo, data-table, invoice, shopping-cart, account-settings,
    order-history.
  • TemplatesPage.vue:114-118 consults TEMPLATE_DARK_THUMB_SLUGS
    (generated/ogImages.ts:68) and falls back to the light image — graceful, but
    off-brand for the newest 16 cards in dark mode.
  • The pipeline exists: yarn thumbnails (shoot-thumbnails.mts) already produces dark
    variants for the other 28; this is a re-run + commit, plus the missing feedback
    loop. Screenshot assets are exempt from the CI drift guard by policy
    (TASK-FREE3-05) — hence "report, not gate".
  • This is an interim fix: TASK-FREE2-09 (live template previews) supersedes
    thumbnails entirely when it lands. Do not build anything that task would throw
    away.
</motivation>

<requirements>
  <generate>Run the thumbnails pipeline for the 16 missing dark variants (verify the
    output renders the DARK theme — headless screenshots have shipped white-on-white
    before; check a sample by eye and by pixel histogram). Regenerate
    generated/ogImages.ts so TEMPLATE_DARK_THUMB_SLUGS covers all 44.</generate>
  <report>build-og-images.ts (or the counts spec) logs a per-kind coverage line —
    "templates: 44/44 light, 44/44 dark thumbs" — and claims.spec.ts (or a sibling)
    asserts dark-thumb coverage does not DECREASE from the committed manifest, so a new
    template without a dark shot surfaces in review instead of silently joining the
    fallback set.</report>
</requirements>

<steps>
  1. yarn thumbnails scoped to the 16 (or full re-run if the script has no scoping —
     but then diff-review the 28 existing for unintended churn before committing).
  2. Eyeball + histogram-check 3 samples in dark; regenerate the manifest; run the
     landing suite (claims.spec reads it).
  3. Add the coverage report + non-decrease assertion.
</steps>

<success_criteria>
  - All 44 templates have light and dark thumbnails on disk and in the manifest;
    dark-mode /templates shows dark cards throughout.
  - A future template lacking a dark thumb fails the non-decrease assertion.
</success_criteria>
```

---

## [x] TASK-FREE3-10 — DzHeading in the three straggler content blocks

```xml
<role>
You maintain the copy-paste block catalog, where every block is a teaching example:
whatever a block does, fifty consumer codebases will do. Three content blocks use raw
heading tags where the other 84 use DzHeading — the levels happen to be right, so
nothing fails, but the exception is what gets copied.
</role>

<task>
Convert the raw <h4>/<h5>/<h6> in TocAside, CodeShowcase, and BlogList to
DzHeading :level="n", preserving the current visual hierarchy and heading levels
exactly.
</task>

<motivation>
  • content/TocAside.vue:37-92 (h4→h6 — the nesting itself is the ToC demo content and
    stays), content/CodeShowcase.vue:71 (h4), content/BlogList.vue:97,125 (h4/h5) use
    native tags; catalog convention is DzHeading :level="n" (blocks nest under
    BlockPreview's H3, which is why blocks start at level 4 — see repo_conventions).
  • A11y is currently unaffected (levels correct, per-block axe suite green) — this is
    consistency-only, priced accordingly. If DzHeading's sizing tokens shift the visual
    scale, use its size/appearance props to hold the current look; do NOT reach for
    <style scoped> or raw utility colours.
</motivation>

<requirements>
  <convert>All heading tags in the three files become DzHeading with the same numeric
    levels; rendered heading semantics (getByRole('heading', {level: n}) counts)
    identical before/after.</convert>
  <visual>Visual scale preserved (compare screenshots or the block preview by eye,
    light and dark).</visual>
  <regen>Blocks' source ships into public/r/** — regenerate (build:registry) and commit
    the artifacts; the CI drift guard enforces this anyway.</regen>
</requirements>

<steps>
  1. Convert TocAside (careful: its h4→h6 ladder is demo content — keep all three
     levels), then CodeShowcase, then BlogList.
  2. Run the per-block axe suite + heading-level assertions; eyeball both themes.
  3. build:registry; commit regenerated public/r artifacts; full <validation>.
</steps>

<success_criteria>
  - Zero raw <h*> tags remain in apps/landing/src/blocks/**.
  - Heading-level structure and visual hierarchy unchanged; block a11y suite green.
  - Regenerated registry artifacts committed; CI drift guard green.
</success_criteria>
```

---

## [x] TASK-FREE3-11 — Ratchet the axe gates onto moderate-impact rules

```xml
<role>
You are the accessibility engineer who watched a duplicate-<main> ship to /ai straight
past a green axe suite, because landmark-no-duplicate-main is graded "moderate" and both
suites gate serious/critical only. The one-off structural assertion that patched it
protects one rule on one surface; the class — moderate findings are invisible — is still
open, and the suites' own comments say widening naively would "re-arm a long backlog".
</role>

<task>
Extend the landing's two axe suites (pages + blocks) to also gate an explicit allowlist
of moderate-impact rules — starting with the landmark family — and record the remaining
moderate backlog as a visible, ratchetable count instead of silence.
</task>

<motivation>
  • blocks/a11y.spec.ts:84 and pages.a11y.spec.ts:66 — BLOCKING_IMPACTS = {critical,
    serious}. Moderate/minor findings are surfaced in output but never fail.
  • pages.a11y.spec.ts:146-181 documents the /ai incident and the deliberate decision
    not to widen wholesale. This task honours that: rule-by-rule opt-in, not an impact
    flip.
  • The Storybook side solved the same shape with a per-family ratchet (a11y gate
    rolled out family-by-family) — same pattern, different surface.
  • Candidate first wave (page-level suite): landmark-no-duplicate-main,
    landmark-unique, landmark-one-main, region? (measure first — region is noisy),
    heading-order (already partly covered by the custom heading checks). Block-level
    suite: measure before promising; blocks render in isolation so landmark rules
    mostly don't apply there.
</motivation>

<requirements>
  <mechanism>A BLOCKING_MODERATE_RULES allowlist (shared helper if both suites can use
    it) — a violation whose rule id is listed fails regardless of its impact grade.
    The existing impact-based gate stays as-is.</mechanism>
  <measure_then_gate>First run each candidate rule across all pages/blocks and record
    the hit count in the task PR. Gate only rules at zero current violations (fix the
    trivial ones to get there if close); rules with a real backlog go into a reported,
    dated "moderate debt" list in the spec header — the ratchet's next targets.</measure_then_gate>
  <no_vacuous>The anti-vacuous guards (empty-render detection, forced async resolution)
    apply to the new assertions exactly as to the old — a rule passing because nothing
    mounted is the failure mode this suite already learned to kill.</no_vacuous>
  <one_off_retired>The bespoke single-<main> structural assertion stays (it's cheap and
    direct) but its comment updates to note the axe rule now also gates — double
    coverage, stated on purpose.</one_off_retired>
</requirements>

<steps>
  1. Instrument: run both suites logging ALL moderate violations by rule id; tabulate.
  2. Fix zero-cost stragglers; freeze the first-wave allowlist at zero-violation rules.
  3. Implement the allowlist mechanism + update the /ai comment block.
  4. Record the remaining moderate debt (rule → count → surfaces) in the spec header
     with a date, mirroring the Storybook ratchet convention.
  5. Full landing suite green; verify a seeded duplicate-<main> fixture fails via the
     axe path (then remove the fixture).
</steps>

<success_criteria>
  - The landmark rule family (at minimum) gates as errors in the pages suite.
  - A duplicate <main> now fails the axe path, not just the bespoke assertion.
  - Remaining moderate findings are enumerated with counts and a date in the spec
    header — visible debt, not silence.
</success_criteria>
```

---

## [x] TASK-FREE3-12 — Raise the landing coverage `functions` floor from 65 toward the repo's 80% bar

> **Landed 2026-07-21. Functions 64.16% → 80.49–83.44%; the floor is now 80, and the
> landing clears the repo's own 80% bar rather than being excused from it.** All four
> numbers ratcheted: branches 88→89, functions 65→80, lines 89→91, statements 89→91.
>
> **Why a range, and why the floors sit a point below it.** These percentages are not
> reproducible to the decimal. The function TOTAL for the same tree came back as 1,953 /
> 2,051 / 2,343 across runs of the same command, because how much of a compiled SFC v8
> attributes to its file depends on what else ran — a file counted in its executed shape
> reports several times the functions of the same file counted statically, so both sides
> of the fraction move together. A narrower invocation shifts it again
> (`--coverage.include=apps/landing/src/**` read 82.57% where `yarn test:coverage` read
> 80.49%). So: measure with CI's own command, take the lowest reading, leave a point of
> margin. The four numbers are `floor(min observed) − 1`, except `functions`, pinned at
> the repo's 80 bar. A gate set to the highest reading would have been red on arrival.
>
> **No `v8 ignore` was needed anywhere** — every point came from executing code, not from
> exempting it. Four seams did the work:
>
> - **Interaction sweeps** (`templates/interactions.spec.ts`, `blocks/interactions.spec.ts`,
>   `pages.interactions.spec.ts`): mount each template / block / route and click every
>   enabled control, asserting the click doesn't throw, Vue's `errorHandler` catches
>   nothing, and the surface still renders. Per area: templates 29.0% → 82.8%, blocks
>   87.0% → 93.2%, pages 36.1% → 67.5%, `components/blocks` 23.4% → 54.7%. Controls are
>   deduped by role + class signature — a data table renders one delete button per row on
>   one handler, and `/blocks` ~90 cards on one handler, so clicking each buys nothing but
>   wall-clock. That dedupe took the landing suite from 142s back to 101s against a 96s
>   pre-task baseline (+5%), inside the task's ~20% runtime budget; the same suite varies
>   96–212s run to run on this machine, so treat all four figures as one-machine medians.
> - **`templates/rawSources.spec.ts`**: loads the Code-tab `?raw` chunk for all 44
>   templates. 79 functions in one file (75 of them Vite glob thunks, 4/79 → 79/79) and,
>   more to the point, a real drift guard — a renamed template file degrades the Code tab
>   to its "source unavailable" fallback silently, and
>   `render.spec.ts` stays green through it because the component resolves via a different glob.
> - **`motion/directives/directives.spec.ts`** (0/8 → 100% on `animateOnScroll`): the
>   pointer directives were invisible to the gallery suite for a structural reason —
>   every one gates on `matchMedia('(hover: hover) and (pointer: fine)')` and the shared
>   jsdom stub answers `matches: false` to every query, so they correctly declined to
>   attach on what looked like a touch device and nothing past `attach()` ever ran.
> - **`motion/composables.spec.ts` + `composables/useThemeTransition.spec.ts`**: scroll/
>   timeline maths, the View-Transitions capability detectors, and the theme swap's
>   reduced-motion path (theme still changes, cross-fade doesn't).
>
> Two things found on the way: the stale `SocialProof.spec.ts` failure (it asserted both
> live metrics were `null`, but the repo went public and `githubStars` now bakes a real
> `0`) is fixed by stubbing the composable instead of reading build output — plus a new
> test that `0` takes the number path, not the "unavailable" CTA. And `useTheme`'s
> singleton builds its `watch(mode)` inside whichever component's `setup` calls it FIRST,
> so unmounting that component disposes the watcher for everyone; inert in the app
> (`App.vue` never unmounts) but a trap for any spec that mounts and unmounts hosts.
>
> Remaining 388 uncovered functions are enumerated by area, dated, in the `vitest.config.ts`
> threshold comment — the honest tail is jsdom-hostile rAF/canvas motion internals and
> flows only a real browser reaches (`apps/landing/e2e` owns those).

```xml
<role>
You are a quality engineer closing a gap between the repo's stated bar (CLAUDE.md
Quality Gates: 80%+ coverage) and the landing's configured floor: functions sits at 65
(measured 65.52%) while branches/lines/statements hold 88/89/89. A 65% functions floor
means a third of the landing's handlers and composable methods can be dead-on-arrival
without any gate noticing.
</role>

<task>
Identify the uncovered functions in apps/landing/src, cover the ones that carry logic,
and ratchet vitest.config.ts's functions threshold for the landing glob up to the
measured new floor — landing at or as close to 80 as the code honestly supports.
</task>

<motivation>
  • vitest.config.ts:74-79 — per-glob thresholds for apps/*/src/**: branches 88,
    functions 65, lines 89, statements 89. The 65 is a recorded accommodation, not a
    target.
  • Likely gap concentrations (verify with the coverage report, don't trust this list):
    event handlers in page components, error/edge branches of composables
    (useThemeDesigner's ~700 lines, useLiveStats fetch failures, clipboard paths —
    which TASK-FREE3-07 adds tests for anyway), and the View-Transitions/motion
    wrappers where jsdom limits what's honest to test.
  • Coverage runs in CI on PRs (ci.yml coverage job) with testTimeout 60s (the /blocks
    axe file needs 35s instrumented) — budget accordingly; don't let new tests push the
    job past its timeout headroom.
  • Honesty rule: cover code by exercising behaviour, not by calling functions to tick
    a counter. Where a function is genuinely untestable in jsdom (VT API, rAF loops),
    prefer an explicit /* v8 ignore */ with a one-line reason over a fake test — visible
    exemption beats fraudulent coverage.
</motivation>

<requirements>
  <inventory>Generate the per-file functions-coverage report for apps/landing/src;
    list the sub-65% files in the PR description with a covered/ignored/deferred
    disposition each.</inventory>
  <tests>Behavioural tests for the logic-bearing gaps (assert outcomes, not spies-only);
    reuse the suite's existing harness patterns (async loader resolution, matchMedia
    polyfill, no body-wipe in afterEach — see the a11y spec headers for the traps).</tests>
  <ratchet>Raise the functions threshold to the new measured floor minus a 1-point
    flake margin; if you reach ≥80, align it with the other three. Never lower any of
    the four existing numbers.</ratchet>
  <runtime>The coverage CI job's total runtime grows by no more than ~20%; if a test is
    expensive, say why in its header or make it cheaper.</runtime>
</requirements>

<steps>
  1. Run coverage locally; extract the functions-gap inventory per file.
  2. Write behavioural tests for the top gaps (composables first — highest
     logic-density); mark the honest exemptions.
  3. Re-measure; set the new threshold; run the CI coverage job path locally
     (vitest run --coverage) to confirm green under the 60s testTimeout.
  4. Full <validation> list.
</steps>

<success_criteria>
  - The landing functions threshold in vitest.config.ts is raised to the new measured
    floor (target ≥80; every point above 65 counts, with the inventory explaining the
    remainder).
  - Every exemption is an explicit ignore-with-reason, not an untested function.
  - Coverage CI job green within its existing timeout budget.
</success_criteria>
```

---

## Appendix — findings intentionally left without a task

- **i18n/RTL seam (finding 17):** a single-locale marketing site is a defensible scope;
  recording the absence is the deliverable. If/when a locale is added, the seam order is:
  `<html lang>` from route meta → `dir` propagation in the shell (block previews already
  accept `?dir`) → string extraction. Do not build speculative infrastructure now.
- **`#fff` over image scrims / colour-picker demo hexes (Part 2, "reviewed and accepted"):**
  documented exceptions; a task would be process noise.
- **`STATIC_ROUTE_FILES` hand-map in `build-sitemap.ts:64-73`:** covered by the header
  comment required in TASK-FREE3-05; not worth its own automation until it bites.
- **Storybook-side carryovers** (RTL/density toolbars, playground affordance, What's New):
  shipped as TASK-FREE2-10/11/12 — see Part 3. Density stays unbuilt by decision: there is
  no `--dz-spacing` scalar to drive a density toggle, and inventing one is a tokens-package
  change, not a Storybook one.

---

## Suggested execution order

**Start with the truth tasks, finish with the gates that measure them.** Nothing in this
document blocks on a human, so the order below is chosen for dependency and merge-conflict
cost, not for approvals. Six waves; waves 1 and 5 parallelize, the rest are serial by
dependency.

1. **TASK-FREE3-03 + 02 + 05 in parallel** — the honesty pass, the registry contract, and the
   drift guards. Disjoint files, contained diffs, and each installs a gate that prevents
   recurrence (the bare-slug scan, the registry spec, the sitemap diff). Run 03 first among
   equals if you must pick: it is the one that stops the site claiming a Nuxt module that
   isn't published, and false capability claims are the costliest thing here to leave standing.
   Note 02 regenerates `public/r/animations/**`, which the CI drift guard diffs — that agent
   must commit the regenerated artifacts or CI goes red on an otherwise-correct change.
2. **TASK-FREE3-07 → 08, serially** — interaction polish then brand fallbacks. Both edit
   `Footer.vue` (07 the mailto branch at `:23,106-111`; 08 the colour fallbacks at
   `:160,219`), so run them in sequence or fold them into one agent. 07 first: its skip-link
   fix is a precondition for one of TASK-FREE3-06's e2e flows.
3. **TASK-FREE3-04 alone** — mobile LCP. Measurement-heavy, long-running, and it owns the
   `landing-perf` CI job; giving it a clean tree avoids re-measuring on top of someone else's
   diff. Its A/B harness is drift-sensitive — interleave preview ports, never trust
   sequential before/after on a dev machine.
4. **TASK-FREE3-06 alone** — browser e2e. Sequenced after 04 because both modify the same CI
   job, and after 07 because it tests that fix. This is the largest task in the document; wire
   the CI pipe with one trivial spec first, then grow the flow set.
5. **TASK-FREE3-10 + 11 in parallel** — the DzHeading stragglers and the axe moderate-impact
   ratchet. Small, independent, and 11 closes the class of bug that let a duplicate `<main>`
   ship past a green suite.
6. **TASK-FREE3-12 last** — the coverage floor. Tasks 03, 07 and 11 all add tests; running
   12 after them means the measured floor has already risen and the ratchet is cheaper to set.

**Shortest path to visible value:** if you only have capacity for one wave, take wave 1.
It removes every false claim the site currently makes and leaves three gates behind that
stop the same class from returning — the highest ratio of credibility repaired to diff size
in the document.

**Parallelism note:** the wave-1 and wave-5 tasks write to genuinely disjoint files, so run
those agents with `isolation: "worktree"` and merge. Waves 2–4 are serial by dependency, not
by caution — don't parallelize them to save wall-clock; you will pay it back in rebases.

**Copy discipline:** each task is a self-contained agent prompt. Paste the
`<role>`…`<success_criteria>` block **together with** the `repo_conventions` block from
[How these tasks are written](#how-these-tasks-are-written) — the conventions carry the
validation commands and the zero-error baseline. Agents given the task without the
conventions reliably rediscover the `eslint --fix` type-regression trap documented in
TASK-FREE2-01's notes.
