# TASK-N2-D1 — Public docs-site skeleton with generated prop tables

> **Status:** complete. Written incrementally as the packet ran.
> Repo `ui/dzup-ui`, branch `main`, HEAD `51dec93 new version for themes`,
> worktree **dirty** (175 entries at run start: the uncommitted N1 evidence
> program plus N2-T1 / A1 / A2 / A3). Nothing is committed, pushed, dispatched,
> deployed or published by this packet.
> Toolchain: Node `v24.14.1`, Yarn `4.16.0`.
> Every number below is bound to that HEAD and to the artifact
> `packages/core/docs/component-meta.json` @ schema `1.1.0`,
> `sourceCommit 51dec93c…`, extractor `vue-component-meta@3.3.7`.

---

## 1. Headline

**The docs site is a projection, not a description — so it cannot be wrong about
the library, only stale, and stale does not build.**

`apps/docs` is VitePress `1.6.4` (memo in §2; the presumption stood, and the
Vite-version stop condition was measured rather than assumed — nested Vite 5,
every existing app unchanged). It builds locally to **16.04 MB / 476 files / 152
HTML pages in 17.4 s**, carrying **144 generated component pages** whose prop,
event, slot and expose tables come from
**`renderComponentSection` — the same function `llms-full.txt` is rendered by**,
called with a page-level heading. No second renderer, no second extractor
(**B9**); the only change to the shared function is an optional options object
whose defaults reproduce `llms-full.txt` **byte for byte**, proven by
`validate:llms` staying green with all four A3 ratchets unmoved.

**Two independent staleness axes, both proven failing and both restored.** The
generator re-extracts every component from source and refuses to write a page if
the committed artifact disagrees — reusing `validate:component-meta`'s own
freshness clause, lifted into `checkFreshness()` rather than reimplemented. The
site config then asserts the SHA-256 of the artifact the pages were rendered
from, so `vitepress build` alone fails when the artifact has moved since. Five
seeded violations (stale artifact ×2 paths, hand-edited page, orphan page,
missing page/nav/dead link) all went red; `component-meta.json` restored to
`d7138b3f…` and all **146 generated files verified byte-identical** afterwards.

**Honest rendering is the design, not a caveat.** The column is *Declared
default* and `DzButton.variant` prints `undefined`, never the story's hand-typed
`solid` (**B10**). The 26 `defineExpose` members show names and types with the
description column **omitted**, not empty. The 71 `defineModel`-synthesised
events say so. `DzAccordion` — A3's F-1, published with no API at all — gets
three separate statements that its zeros mean *unknown*, and the first draft of
this packet's own fidelity table said *"the component emits nothing"* until that
was caught by reading the rendered page and fixed with two regression tests.

**Search works and was verified, not assumed**: VitePress's offline MiniSearch
index, **1,051 sections**, queried directly — component names and family names
both return their components.

**`yarn validate:all` exit 0, 32 → 33 links** (`validate:docs-pages`);
`yarn lint` exit 0 including the **10** new files (**B6**); `yarn test` red only
on **B5**'s two pre-existing failures, **+22 tests** measured A/B.
`packages/tooling`'s 7 `tsc` errors are pre-existing and **none is in this
packet's files** (**B-A1-F7**, checked by hand because a green `yarn typecheck`
proves nothing there).

**B8 resolved by measurement:** the Storybook 25 MB budget reads
`storybook-static` and nothing else, so this site does not consume its ~0.6 MB of
headroom — **and is covered by no size gate at all**, which is finding F-4.

**Nine findings**, of which the sharpest is that **twelve component descriptions
carry unescaped HTML** and one carries literal `<code>` tags: it broke the first
build of this site, `llms.txt` never noticed because it is plain text, and the
escaping obligation now falls on every present and future consumer of
`component-meta.json`. **Nothing was deployed, hosted, published or committed;
`build:registry` and `generate:exports` were not run.**

---

## 2. The framework memo — VitePress 1.6 vs Nuxt Content

**Written before a line of the app was scaffolded**, as the task requires. The
presumption in the task prompt is VitePress 1.6; the memo's job is to say
whether *this* repository gives a reason to overturn it.

**Decision: VitePress `1.6.4`, as `apps/docs`. The presumption stands.**
Nuxt Content was evaluated and rejected on four repo-specific grounds; a fifth
candidate (VitePress `2.0.0-alpha.19`) was rejected on maturity.

### 2a. The four criteria the task names, measured against this repo

| Criterion | VitePress 1.6.4 | Nuxt Content 3 (on Nuxt 4) |
|---|---|---|
| **SSG output** | Native and the only mode. `vitepress build` emits static HTML + a client bundle; no server, no adapter, no runtime data layer. Matches `<scope>`'s "local build + preview only" exactly, and matches how this repo already ships static sites (`apps/landing` → `vite build`, `apps/storybook` → `storybook build`). | SSG is `nuxt generate` — supported, but the default posture is a server (Nitro). The content layer is a **SQLite/WASM database** at runtime (`@nuxt/content` v3), which is a second data store next to the artifact we already treat as the single truth. Prerendering it works; it is not the framework's centre of gravity. |
| **Vue component in a page** (D3's playground needs this) | Markdown is compiled to a Vue SFC. `<script setup>` in a `.md` file, `.vitepress/theme/index.ts` component registration, and `<ClientOnly>` are first-class. A D3 inline playground is a registered global component dropped into a generated page — no framework change. | Equally capable (MDC). No advantage; the capability is a tie, so it cannot overturn the presumption. |
| **Versioning story** | **Neither framework ships versioned docs.** VitePress's own answer is "deploy a copy per version at a path prefix" — which is what `apps/landing` already does for `/storybook/`. Since this repo is pre-1.0 (`0.x`, and TASK-N5-01 has not yet stated the policy), the honest versioning story today is *one version, the tip*, and the cheapest future migration is a path prefix. That is a VitePress-shaped answer. | Nuxt Content can model versions as content collections, which is genuinely more capable — but it is capability for a policy that **does not exist yet** (N5-01). Buying a heavier framework for an unstated policy is the mistake this program keeps naming. |
| **Search** | **Built in and offline**: `themeConfig.search.provider: 'local'` uses MiniSearch, already a `vitepress` dependency. Zero new packages, zero network, works in `vitepress preview`. Algolia DocSearch is a config swap later if wanted. | No built-in search. Needs `@nuxtjs/algolia`, a self-hosted index, or a hand-rolled MiniSearch integration — i.e. more dependencies to reach parity with what VitePress gives for free. |

### 2b. The four repo-specific reasons — the ones that actually decide it

1. **Vite-version blast radius — the task's own stop condition.** Measured, not
   assumed:

   | Workspace | `vite` | `@vitejs/plugin-vue` |
   |---|---|---|
   | root devDependencies | `^7` (resolved **7.3.5**) | `^6` |
   | `apps/landing` | `^6.1.0` | `^5.2.0` |
   | `apps/sandbox` | `^6.1.0` | `^5.2.0` |
   | `apps/storybook` | `^6.1.0` | `^5.2.0` |
   | `packages/tooling` | `^7` | `^6` |

   The repo already runs **three** Vite majors side by side under the
   node-modules linker. `vitepress@1.6.4` declares `vite: ^5.4.14` and
   `@vitejs/plugin-vue: ^5.2.1` as **its own dependencies** (not peers), so it
   resolves a *nested* Vite 5 and touches nothing else. **No existing app's Vite
   version changes** — the stop condition "workspace wiring would force a Vite
   version change on existing apps" is therefore **not** triggered. Verified
   post-install in §5.

   Nuxt Content on Nuxt 4 would pull Nuxt, Nitro, h3, unstorage, better-sqlite3
   / WASM SQLite and its own Vite — a fourth toolchain in a repo whose
   `.yarnrc.yml` already carries three `packageExtensions` entries just to keep
   Nuxt's peer graph resolvable (`nuxt@*`, `@nuxt/devtools@*`,
   `@vue/devtools-core@*` all get `vite: ^5.0.0` pinned in by hand). That is a
   measured signal that Nuxt is the harder dependency in *this* tree.

2. **The site is a renderer, not an application.** Everything on it — 144
   component pages, prop/event/slot/expose tables, family navigation, the search
   corpus — is a projection of `packages/core/docs/component-meta.json`
   (constraint **B9**). Markdown in, HTML out. Nuxt Content's value proposition
   is a *queryable content database* with a schema, collections and a runtime
   query API. We already have the database; it is the artifact, and it is
   generated and gated. Adding a second content store would give this packet
   exactly the shape the program keeps flagging as the defect: a second copy of
   facts nothing compares.

3. **Vue 3.5.13 across the tree, and a Vue-3.6 lane is coming (N5-03).**
   VitePress 1.6.4 declares `vue: ^3.5.13`, matching the root exactly, and is a
   thin layer over it. Nuxt 4 owns its own Vue resolution and its own compat
   surface; a Nuxt-shaped docs site would become a *second* consumer that
   TASK-N5-03's Vue-3.6-RC lane has to satisfy. The docs site should not be able
   to block a toolchain packet.

4. **`packages/tooling` may not depend on `@dzup-ui/*` (README §3
   `<packages>`), and the generator must live in `packages/tooling`.** The page
   generator here is a sibling of `src/llms/` and `src/meta/` — a plain
   `tsx` script that emits markdown to `apps/docs/components/`. That works
   identically under either framework, which means the framework choice only
   ever buys presentation. Given that, the cheapest presentation layer that can
   still host D3's playground wins, and that is VitePress.

### 2c. Why not VitePress 2.0.0-alpha.19

`npm view vitepress dist-tags` → `latest: 1.6.4`, `next: 2.0.0-alpha.19`
(measured 2026-09-01). VitePress 2 declares `vite: ^8.2.0` and `shiki: ^4.4.1` —
a Vite major **ahead of the root's own 7.3.5**, on an alpha tag. The
`<maturity_levels>` convention in this repo does not let a *public* surface —
which is what this site is meant to become — rest on an alpha whose API can
still move. Recorded as the migration path, not the starting point: the 1.x →
2.x move is a config-shape change, and it becomes attractive once the repo's own
Vite floor reaches 8.

### 2d. What the decision costs, stated honestly

- **A nested Vite 5** in `node_modules`, purely for the docs toolchain. Disk
  cost, not a correctness cost; measured in §5.
- **No versioned docs today.** The site publishes the tip of `main` and says so
  on the page. Versioning is an owner decision that follows N5-01's 0.x policy.
- **VitePress owns the theme.** This packet ships the **stock default theme, with
  no custom CSS at all** — visual alignment with `apps/landing`'s brand would mean
  a custom theme, and a theme is presentation work that D3 (playgrounds + theme
  builder) is better placed to do once it knows what it needs to host. Stated as a
  gap, not as a design decision: the site currently does not look like dzup-ui.

---

## 3. What was built

| Path | Lines | What it is |
|---|---|---|
| `packages/tooling/src/docs/docs-pages.ts` | 458 | **Pure page renderer.** Front matter, provenance bullets, the "how to read this page" contract, the hand-written-prose merge point, compound parts nested under their parent, the per-page fidelity block, and `escapeForVue`. The API tables are **not** here — see §4. |
| `packages/tooling/src/docs/generate-docs-pages.ts` | 218 | **`yarn generate:docs-pages`.** Runs the freshness gate, writes 146 files, removes orphans. `--check` is `yarn validate:docs-pages`. |
| `packages/tooling/src/docs/docs-pages.spec.ts` | 342 | 22 unit tests, including a whole-catalog assertion that no page carries markup VitePress would compile. |
| `apps/docs/.vitepress/config.ts` | 155 | VitePress config. Generated sidebar, local search, and the **artifact-fingerprint assertion**. |
| `apps/docs/package.json` | 21 | `@dzup-ui/docs`. `build` = `yarn generate && vitepress build`, deliberately. |
| `apps/docs/index.md` | 30 | Home page. |
| `apps/docs/guide/getting-started.md` | 111 | Install docs — **P1-04's validated snippets, reused, not rewritten** (§6). |
| `apps/docs/guide/styling-contract.md` | 64 | ADR-19's five layers, and what it does *not* yet claim. |
| `apps/docs/guide/tokens.md` | 69 | The three token tiers, re-mapping, the DTCG export. |
| `apps/docs/guide/agents.md` | 49 | `llms.txt` / `llms-full.txt` / `@dzup-ui/mcp`, and why they agree with the site. |
| `apps/docs/guide/how-this-site-is-built.md` | 54 | What is generated, what is hand-written, what turns the build red. |
| `apps/docs/components/_usage/DzButton.md` | 24 | Hand-written prose exemplar. |
| `apps/docs/components/_usage/DzAccordion.md` | 33 | Hand-written prose exemplar for the component with **no extractable API** — the case that proves the merge point cannot become a hand-typed table. |
| `apps/docs/components/*.md` | — | **144 generated component pages** + `index.md`. Committed, not git-ignored (§3b). |
| `apps/docs/.vitepress/generated/nav.json` | — | Generated sidebar + artifact fingerprint. |
| `apps/docs/scripts/report-size.mjs` | 94 | Size **reporter** for the static build, `--max-mb` ready. Not a gate — see F-4 and D1-D4. |
| `apps/docs/.gitignore` | 8 | Ignores `.vitepress/dist` and `.vitepress/cache` **only**. |

**Modified (four files, all additive):**

| Path | Change |
|---|---|
| `packages/tooling/src/llms/render-llms.ts` | `renderComponentSection` gained an optional `ComponentSectionOptions` (`level`, `memberHeadingLevel`). **Defaults reproduce `llms-full.txt` byte for byte** — proven in §5. This is A3 §14's own suggestion taken. |
| `packages/tooling/src/validators/component-meta.ts` | Clause group 1 (freshness) lifted out of the CLI block into an exported `checkFreshness()`; the CLI now calls it. Behaviour and message text unchanged. |
| `packages/tooling/scripts/validate-doc-snippets.ts` | `apps/docs/guide` added to `DOC_ROOTS`, so the docs site's install snippets are inside P1-04's fixture gate. |
| `eslint.config.js` | Ignores for the generated pages and VitePress output (§7 measures the lint surface this creates). |
| `package.json` | `generate:docs-pages`, `validate:docs-pages` (+ its `//` doc key), `docs` / `docs:build` / `docs:preview`, and `validate:docs-pages` added to `validate:all`. |

### 3b. The generated pages are committed, deliberately

`apps/docs/.gitignore` ignores `.vitepress/dist/` and `.vitepress/cache/` and
**nothing else**. The 144 component pages are committed generated truth, beside
`packages/core/docs/llms.txt` and `component-meta.json`.

That is TASK-N2-A3's finding **F-4** applied in advance: the agent-facing document
was git-ignored, so *"a PR could change what 144 components are described as with
a zero-line diff"*. A docs site is the same object with a human audience. It also
buys the gate: `validate:docs-pages` compares a fresh render against a committed
output, which needs a committed output to exist.

---

## 4. Reuse, not a second renderer

The orchestrator's second requirement, answered directly: **the component-page
body is `renderComponentSection` from `packages/tooling/src/llms/render-llms.ts`
— the same function `llms-full.txt` is built from — called as**

```ts
renderComponentSection(record, artifact, { level: 1, memberHeadingLevel: 2 })
```

Nothing about props, events, slots, exposed members, taxonomies, v-model
bindings, anatomy parts or usage snippets is re-derived in this packet. The A2
handoff §13 rules are therefore obeyed *by construction* rather than by
discipline:

| §13 rule | Where it is implemented | What this packet did |
|---|---|---|
| Column is **"Declared default"**; `null` → `—`, the literal → `undefined`; never print `solid` for `DzButton.variant` | `render-llms.ts` | reused; a unit test asserts `| \`solid\` |` never appears on a page |
| Read `descriptionSource`; label `defineModel`-synthesised events as such | `render-llms.ts` | reused |
| `defineExpose` → names + types, description column omitted | `render-llms.ts` | reused |
| Examples verbatim or an explicit absence | `render-llms.ts` | reused |
| Distinguish "declares nothing" from "we could not read what it declares" | `render-llms.ts` (`NO_API_NOTE` / `NO_MEMBERS_NOTE`) | reused, **and escalated** — see §8 |
| Compound parts documented through their parent | this packet | 64 parts nested inside their parent's page; none gets a page implying standalone use |

**The one change to the shared renderer** is an optional options object. `level`
lifts the heading from `###` to `#` for a standalone page; `memberHeadingLevel`
turns the inline `**Props** (12):` label into `## Props (12)` so VitePress can
build a page outline. **Both default to the `llms-full.txt` behaviour**, and the
`llms` documents re-render byte-identical (§5). The alternative — a second
renderer in the docs app — is constraint **B9**'s failure mode, and this lane has
already found one 567-line instance of it.

**What this packet added instead of duplicating:** page-level concerns only —
front matter, the family line, the contract callout, the prose merge, part
nesting, and the fidelity block. None of them is an API fact.

---

## 5. Proof the gates can fail — five seeded violations, all restored

Every gate in this lane is proven by seeding the violation it claims to catch.
This packet has **two independent staleness axes**, and both were made to fail.

| # | Seeded | Gate | Result |
|---|---|---|---|
| **S1** | Edited `component-meta.json` (`"Primary button component."` → `"SEEDED STALE — a description the source does not have."`) and ran `yarn generate:docs-pages` | freshness (artifact vs source), reusing `checkFreshness()` | **exit 1, nothing written** |
| **S2** | Same seed, then ran `vitepress build` **alone** | fingerprint (pages vs artifact), in `.vitepress/config.ts` | **exit 1 before the first page compiles** |
| **S3** | Hand-edited a generated page — the `variant` row of `DzButton.md` | `yarn validate:docs-pages` | **exit 1, names the file** |
| **S4** | Copied a page to `DzGhostComponent.md` (what a rename leaves behind) | orphan clause | **exit 1** |
| **S5** | Deleted `DzTooltip.md`; separately deleted `.vitepress/generated/nav.json`; separately added a dead internal link to `guide/tokens.md` | missing-page clause · config guard · VitePress `ignoreDeadLinks: false` | **exit 1 in all three** |

Verbatim output of the two that matter most.

**S1 — the freshness gate, which is the requirement's stated whole point:**

```
✗ [freshness] packages/core/docs/component-meta.json is STALE — it disagrees with a fresh extraction of the sources. Run `yarn generate:component-meta` and commit the result.

The docs site was NOT generated. A site rendered from a stale artifact publishes API
facts the source no longer has, and a reader cannot tell. Regenerate the artifact first.
```

**S2 — the fingerprint, which catches the case S1 cannot** (the artifact
regenerated *after* the pages were):

```
failed to load config from ...\apps\docs\.vitepress\config.ts
build error:
The generated docs pages are STALE.
  pages were rendered from component-meta.json sha256 d7138b3f0479b4e2b522d7e23723bbdcb7e639f73d2698b266a87bec4163d4cd
  the artifact on disk is now              sha256 1aab55ba7d7c823131f23d0349454ae6d44860bf7a9fe2eaeab2b00a4344effa
Every prop, event and slot table on this site would describe the previous extraction. Run `yarn generate:docs-pages`.
```

**Restoration verified, not asserted.**

```
sha256sum packages/core/docs/component-meta.json
  d7138b3f0479b4e2b522d7e23723bbdcb7e639f73d2698b266a87bec4163d4cd   (identical to the pre-seed hash)
sha256sum -c pages-sha-before.txt | grep -c ': OK'
  146                                                                (all 146 generated files byte-identical)
yarn validate:docs-pages
  OK  docs pages fresh - 144 component pages + index + nav, rendered from packages/core/docs/component-meta.json
```

### 5b. The renderer change is byte-neutral for the `llms` documents

The one change to a shared, gated file (`renderComponentSection`'s options
object) had to leave `llms.txt` and `llms-full.txt` untouched:

```
tsx packages/tooling/src/llms/generate-llms.ts --check
  OK  llms docs fresh - packages/core/docs/llms.txt, packages/core/docs/llms-full.txt

yarn validate:llms                                              (29 s)
  OK  llms: both documents fresh against the metadata artifact, structurally sound, and
      every one of the 144 public components discoverable by an MCP client.
  ratchets: publicComponentsUnreachableFromLlms 0 · componentsWithoutDescription 3 ·
            publicComponentsWithNoMembers 1 · publicComponentsWithoutExampleInLlms 0
```

Every A3 ratchet unmoved; `llms-full.txt` still 419,922 B.

### 5c. The stop condition on Vite versions — measured after install

```
root vite            7.3.5
vitepress own vite   5.4.21   (nested, node_modules/vitepress/node_modules/vite)
apps/landing         6.4.1    unchanged
apps/sandbox         6.4.1    unchanged
apps/storybook       6.4.1    unchanged
```

`yarn install` added **63 packages / +50.92 MiB** and **changed no existing app's
Vite**. The root `package.json` gained no `vitepress` entry — it is a
devDependency of `apps/docs` only. **The stop condition did not fire.**

---

## 6. The install docs reuse P1-04's validated snippets

`apps/docs/guide/getting-started.md` reuses the install prose and snippets that
already exist in `apps/storybook/stories/GettingStarted.mdx` — including the Nuxt
configuration carrying its `fixture:` marker, which binds it to
`packages/nuxt/test/fixtures/core-only/nuxt.config.ts`.

**And the gate was widened to cover the new file.** `DOC_ROOTS` in
`packages/tooling/scripts/validate-doc-snippets.ts` is an explicit list, so a new
app is outside it by default — which would have made the docs site, the single
most likely place for install instructions to drift, the one place P1-04's gate
did not look. That is the shape of TASK-N2-A3's finding **F-3** (a correct
validator pointed at a subset nobody re-examined), so it was closed at the moment
the surface was created rather than found later.

Measured, by moving the file aside and re-running:

```
before   OK  doc-snippets: 19 fixture-backed snippet(s) match their fixtures
after    OK  doc-snippets: 20 fixture-backed snippet(s) match their fixtures
```

(`getting-started.md` restored, sha256 `899e4636…` unchanged.)

---

## 7. Focused validation output

| Command | Result | Time |
|---|---|---|
| `vitest run packages/tooling/src/docs/docs-pages.spec.ts` | **26 passed** | 3.2 s |
| `eslint packages/tooling/src/docs apps/docs --max-warnings 0` | **exit 0** | — |
| `tsc --noEmit -p packages/tooling/tsconfig.json` | **exit 2 — 7 errors, none in this packet's files** (§9, constraint B-A1-F7) | 25 s |
| `yarn validate:doc-snippets` | exit 0 — 20 snippets | 1 s |
| `yarn validate:component-meta` | exit 0 — fresh, 144/144, all nine ratchets at ceiling | 13 s |
| `yarn validate:llms` | exit 0 — four documents fresh, four ratchets unmoved | 29 s |
| `yarn validate:docs-pages` *(new)* | exit 0 — 144 pages + index + nav fresh | 13 s |
| `yarn workspace @dzup-ui/docs build` | **exit 0** | 34 s |
| `node apps/docs/scripts/report-size.mjs` | 16.04 MB / 476 files | — |

### 7a. Build stats

| Measure | Value |
|---|---|
| generated markdown | **146 files, 786,593 B** — 144 component pages + `components/index.md` + `nav.json` |
| largest / smallest page | `DzTable.md` 12,306 B · `DzCaption.md` 3,015 B |
| **static build** | **16.04 MB across 476 files** — `components/` 12.58 MB (145 files) · `assets/` 3.24 MB (322) · `guide/` 0.17 MB (5) |
| HTML pages emitted | **152** = 144 components + components index + 5 guide + home + 404 |
| build time | `vitepress build` **17.44 s**; `yarn generate && vitepress build` **34 s** end to end — the generate step is dominated by the ~13 s freshness re-extraction, which *is* the gate |
| local search index | `@localSearchIndexroot.*.js` **736,743 B**, **1,051 indexed sections** |
| new npm packages | 63 (+50.92 MiB in `node_modules`), all beneath `vitepress` |
| new lint surface (**B6**) | **10 files** — `config.ts`, `package.json`, 5 guide pages, `index.md`, 2 `_usage/*.md`. The 144 generated pages are ignored, with the reason recorded in `eslint.config.js`. |

### 7b. Search, verified rather than assumed

The built index was loaded with MiniSearch — VitePress's own `local` provider and
its own bundled copy — and queried directly:

```
documents indexed: 1051
"DzTooltip"  -> 14 hits, all on /components/DzTooltip
"overlays"   -> 73 hits, including /components/#overlays and every Overlays component
"breadcrumb" -> 16 hits, all on /components/DzBreadcrumb
"accordion"  -> 16 hits, all on /components/DzAccordion
```

Family search works because each page prints `- **Family:** Overlays` as page
**text**; front matter alone is not indexed by the local provider. Title and
heading matches are boosted 4x so a component-name query ranks its own page
first.

### 7c. What the site actually contains

| | |
|---|---|
| public component pages | **144** — every `public-component` in the ownership manifest |
| compound parts rendered | **64**, nested inside their parent's page (all 64 attach to a component that has a page; asserted by a spec) |
| families in the sidebar | **12** — forms 28 · data 19 · layout 18 · feedback 18 · navigation 12 · media 10 · overlays 10 · buttons 8 · inputs 8 · typography 8 · cards 3 · providers 2 |
| risk tiers shown | A 55 · B 67 · C 21 · D 1 |
| statuses shown | stable 99 · experimental 37 · beta 7 · **none 1** (`DzThemeProvider`) |
| pages with an anatomy-parts line | **5** — `DzButton`, `DzFileUpload`, `DzInput`, `DzSelect`, `DzTable`. The other 139 print nothing, because they have not *declared* parts — which is not the same claim as having none (N2-S1's ratchet) |
| pages with an `Exposed on ref` table | 21 |
| pages carrying hand-written prose | **2** (`DzButton`, `DzAccordion`) — the mechanism, demonstrated, not a content programme |

---

## 8. Honest rendering — what the site refuses to imply

The orchestrator's third requirement, taken as the design constraint rather than
a caveat. Rendering 144 components makes every absence visible at once, so each
one had to be given a sentence.

| Situation | How many | What the page does |
|---|---|---|
| A prop declares `undefined` because the ADR-20 provider supplies the value | **487 catalog-wide** | Column is **"Declared default"**; the cell prints `` `undefined` ``, `—` means no default is declared, and the page's contract note explains the difference. **`DzButton.variant` prints `undefined`, never `solid`** — the story's hand-typed `'solid'` is nowhere on this site, because nothing generated says it (**B10**, A2-D3). |
| An event has no description and is `defineModel`-synthesised | 71 | *"synthesised by `defineModel` (ADR-16) — no authored description exists"* — a fact, not an apology. |
| An event has no description and **is** authored | 35 | `—`, and the fidelity block counts it. |
| `defineExpose` members | 26, **0 described** | Names and types; the description column is **omitted**, not shown empty. |
| A component declares an API and the extractor recovered none of it | **1 — `DzAccordion`** | Two callouts and a table whose Notes column says **`unknown — the extractor recovered nothing`** in every row. See below. |
| A component genuinely declares nothing (a bare sub-part) | 4 compound parts | A *different* sentence: *"declares no props, events or slots; it renders a fixed element."* |
| A public component has no Storybook story | 1 — `DzThemeProvider` | *"No published example"* warning. Nothing is synthesised. |
| A component has not declared an ADR-19 anatomy | 139 of 144 | The parts line is simply absent. The styling-contract guide states explicitly that *"has not declared parts"* is not *"has no parts"* — that is N2-S1's ratchet, not missing data. |

### 8a. `DzAccordion`, specifically

A3's finding **F-1**: published with no API at all, and *"no other ratchet can see
it"* because 0/0 scores as perfect on every coverage ratio. This is the surface
where that becomes visible to a human, so it gets three separate statements:

1. The shared renderer's `NO_MEMBERS_NOTE` — *"That is an extraction gap, **not** a
   statement that it has none."*
2. A hand-written `::: danger` in `components/_usage/DzAccordion.md` naming the
   discriminated-union cause and sending the reader to the types file.
3. The generated fidelity block, whose Notes column reads **`unknown — the
   extractor recovered nothing for this component`** in all four rows.

Point 3 was a **defect in this packet's first draft**, caught by reading the
rendered page: the table said *"the component emits nothing"* and *"the component
declares no slots"*, because those sentences were keyed on `count === 0`. For
`DzAccordion` the zero is an **absent measurement**, not a measurement of
absence, and printing the confident sentence would have re-created — inside the
fidelity block, of all places — exactly the failure mode the block exists to
prevent. Two regression tests now hold the distinction.

### 8b. Where the site is honest by *not* saying something

- **No evidence badges.** Risk tier and status are shown because they are
  generated; per-component accessibility, browser and AT evidence is **not** on
  this site, and `guide/how-this-site-is-built.md` says so in as many words. That
  payload is D2's, and inventing a green badge for it here would be the single
  most damaging thing this packet could do.
- **No versioning.** The footer states the site publishes the tip of `main` and
  is not versioned.
- **No effective defaults, anywhere.** Resolving them needs the provider's
  defaults to become generated data first (A2-D3).

---

## 9. Aggregate qualification — what ran, and what is still red

| Gate | Result | Note |
|---|---|---|
| `yarn lint` (`packages/ apps/`, `--max-warnings 0`) | **exit 0**, 95 s | Includes the 10 new `apps/docs` entries (**B6** honoured deliberately, not by accident). |
| `yarn test` | **red — exactly the two pre-existing failures** | `landing-token-fallbacks` and `story-dod-tiers > countOpen > subtracts a waiver`. **Constraint B5; neither is this packet's, neither was touched.** |
| `yarn typecheck` (core) | exit 0 | via `validate:all`. |
| `tsc -p packages/tooling/tsconfig.json` | **exit 2 — 7 errors, none in `src/docs/`** | `perf-bench.spec.ts` ×2, `accept-visual-baseline.ts` ×2, `story-dod-triage.ts`, `at-matrix.spec.ts`, `story-dod-tiers.spec.ts`. Pre-existing; **B-A1-F7** / A1-D4 / A2-F-10 / A3-F-6 — the home of every validator is still outside `typecheck:all`. Checked **by hand**, because a green `yarn typecheck` proves nothing about this package. |
| `yarn validate:all` | see §9a | |

### 9a. Test-count movement

```
packages/tooling with    docs-pages.spec.ts : 768 passed
packages/tooling without docs-pages.spec.ts : 746 passed
                                              --- exactly +22, nothing removed
```

Full suite: **8,860 passing / 2 failed / 2 skipped / 1 todo (8,865 total)**, 386 s.

**Stated honestly rather than reconciled:** the N2 ledger records A3's baseline as
**8,843 passing**, and 8,843 + 22 = 8,865 ≠ 8,860. This packet's own delta is
measured at exactly **+22** by the A/B run above, so the 5-test difference is
between A3's measurement and this one, on a worktree that has moved. It is not
reconciled here because reconciling it would mean re-running the suite on a tree
this packet cannot restore. **Reported, not absorbed.**

### 9b. Maturity level reached

`specified → implemented → **focused-validated** → aggregate-qualified`.

The site is **locally qualified, worktree-dirty**: built once on one machine, on a
tree carrying four uncommitted programs. It is **not** CI evidence, **not**
release evidence, and **not deployed** — no hosting, no DNS, no CI job, no
`build:registry` run. Per README §3 `<authority>`, deployment is named explicitly
as an owner action.

---

## 10. Findings

Nine. Rendering 208 records into 144 pages turned out to be a good instrument for
the same reason the extraction was: it forces every field of every component
through one code path, and anything malformed stops being a statistic.

| # | Finding | Consequence |
|---|---|---|
| **F-1** 🔴 | **Twelve descriptions in the catalog carry unescaped HTML, and one carries literal `<code>` tags.** `DzBreadcrumbItem.href`: *"Renders as `<span>` when absent"* — with no backticks. `DzList.ordered`, `DzMenuItem.href`, `DzSidebarItem.href`/`.to`, `DzTableBody`/`Cell`/`Footer`/`Header`/`Row`, `DzTableCell.header`; and `DzStepperItem.clickable` contains `Falls back to the parent <code>DzStepper.clickable</code>` — raw HTML written into a JSDoc comment. | **This broke the first build of this site** (`[vite:vue] DzBreadcrumb.md: Element is missing end tag`). `llms.txt` never noticed because it is plain text, so the defect has been latent since the prose was written. The artifact publishes the prose **raw**, which is correct — but that puts the escaping obligation on *every* consumer forever: this site, D2's evidence pages, D3's playground, any third party reading `component-meta.json`, and Context7 if A3's §15 is enacted. Handled here by `escapeForVue`; **12 one-line source edits would remove the hazard at the root** → owner decision **D1-D1**. |
| **F-2** 🟠 | **15 of 144 public component pages show a Storybook `render()` function instead of usable markup.** `DzAccordion`, `DzBlockUI`, `DzCopyButton`, `DzDataView`, `DzEmoji`, `DzFlex`, `DzGrid`, `DzIcon`, `DzIconButton`, `DzMasonry`, `DzPanel`, `DzRelativeTime`, `DzScrollProgress`, `DzToolbar`, `DzTour` — their primary story's `template` is computed, so only `source` exists (A2 measured 128/208 with a static template; this is what that number means *for public components on a page*). | On `llms-full.txt` a `render()` body is tolerable — an agent can read it. On a docs page the example is the most-read thing there, and these 15 readers get `${faqItems}` and `v-bind="args"` instead of a component they can paste. Nothing is faked, so the page is honest; it is just not useful. **Fixed at the source** by giving those 15 stories a static-literal template, which improves `llms-full.txt` and the MCP `get_component_example` tool at the same time → ranked next packet. |
| **F-3** 🟠 | **Three public components have no prose at all — not a gap, a blank.** `DzAsyncBoundary` (no description · 3/3 props · 3/3 slots undescribed), `DzErrorBoundary` (no description · 1/1 props · 2/2 slots), `DzFieldArray` (no description · 3/4 props). A3's **F-5** found the three missing *component* descriptions; on a rendered page it is visible that the emptiness goes all the way down. | Their pages are an H1, a table of `—` and a fidelity block reporting `0` described. That is the honest rendering, and it is also a very public advertisement of the gap — which is the argument *for* publishing fidelity rather than hiding it. **Roughly 12 one-line JSDoc edits** close all three. |
| **F-4** 🟠 | **The repository's only static-artifact budgets cannot see this site.** Verified rather than assumed, per **B8**: `apps/storybook/scripts/check-bundle-size.mjs` measures `join(appRoot, 'storybook-static')` and nothing else; `apps/landing/scripts/check-bundle-budget.ts` measures gzip sizes of named chunks in `apps/landing/dist/assets`. Neither can reach `apps/docs/.vitepress/dist`. | Two consequences, opposite in sign. **Good:** the docs site does **not** consume B8's ~0.6 MB of Storybook headroom — that constraint is untouched. **Bad:** the repo has just gained a **16.04 MB publishable artifact with no size gate at all**, which is the same gap `check-bundle-size.mjs` was written to close for Storybook. A reporter ships here (`apps/docs/scripts/report-size.mjs`, `--max-mb` ready); picking the ceiling from one local build would be inventing a baseline → owner decision **D1-D4**. |
| **F-5** 🟠 | **An eslint rule would have rewritten the install documentation into being wrong — and the existing copy of that snippet is unreachable by the same rule.** `perfectionist/sort-imports` fired on the `main.ts` snippet in `guide/getting-started.md`, demanding `import { createApp } from 'vue'` before `import '@dzup-ui/tokens/css'`. The stylesheet import must come **first**; reordering it is how a consumer gets a flash of unstyled content. `eslint --fix` would have done it silently. | **Third sighting of the class**: A1's **F8** (`regexp/use-ignore-case` would have changed a published JSON Schema pattern), A3's **F-7** (the `cli-scripts` override gap). Disabled for `apps/docs/guide/**/*.md/**` with the reason recorded at the rule. **The asymmetry is the interesting half:** the identical snippet in `apps/storybook/stories/GettingStarted.mdx` never triggered it, because `@antfu/eslint-config` lints fenced code in `.md` and **not** in `.mdx`. Every code block in the eleven Storybook `.mdx` docs pages is outside the lint gate entirely — nobody decided that. |
| **F-6** 🟢 | **Six `@example` JSDoc blocks are extracted, published in the artifact, and rendered by nothing.** `DzButton.as`, `DzButton.ui`, `DzDialogContent.ui`, `DzInput.ui`, `DzSelect.ui`, `DzTable.ui`. A2's **F-9** predicted a docs site "can render deprecation banners and inline examples — it will have six"; the deprecation banner *is* rendered (`DzDialogContent.overlayClass`), the examples are not, in `llms-full.txt` either. | An author wrote six worked examples and no surface shows them. ~8 lines in `render-llms.ts` fixes **both** surfaces at once. **Deliberately not done here:** it changes the bytes of four documents A3 has just gated and re-measured, and doing that as a side effect of a docs packet is the wrong shape → ranked next packet. |
| **F-7** 🟢 | **1,137 of 1,649 prop descriptions (69 %) end without terminal punctuation; 3 begin lower-case.** A3's **F-5** measured this for 208 component descriptions; the prop level is eight times larger and is now rendered into 144 visible tables. | Not a defect — a consistency debt that was unmeasurable until something rendered every prop of every component in one place. Cheap to normalise, and it changes `llms-full.txt`, the MCP metadata tools and 144 pages simultaneously. |
| **F-8** 🟢 | **`DzThemeProvider` is the only public component with no `status`**, so its page prints a risk tier and no status label. It is also the only public component with no story (A2's `publicComponentsWithoutExample` = 1) and the only one whose page carries the "no published example" warning. | Three independent "the one component that…" facts landing on one record. Worth a look at whether it is public on purpose. |
| **F-9** 🟢 | **This packet's own bug, reported because the class keeps recurring: a page assembled from array elements silently stopped escaping.** `render-llms.ts`'s `fenced()` returns opener + body + closer as a **single** array element, so a fence tracker that inspected elements opened a fence and never saw it close — everything after the first usage snippet on every page went unescaped. Unit tests were green; the *real build* caught it. | Mirror image of A2's **F-4** (a gate clause satisfied by a comment) and A1's **F8**: the thing the code inspects and the thing it means are different objects, and only an observed failure tells you which one you wrote. Now covered by a whole-catalog spec that renders all 144 pages and asserts no unescaped `<` survives outside code. **This is the third packet in a row in which the mandatory "run it for real" step found something no green gate could.** |

---

## 11. Ratchet movements

| Ratchet | Old | New | Note |
|---|---|---|---|
| `validate:all` links | **32** | **33** | `validate:docs-pages` added, between `validate:llms` and `validate:package-names`. |
| **public components with a documentation page / 144** | *(uninitialised)* | **144 / 144** | New — initialised and held as a gate. A public component with no page fails `validate:docs-pages`. |
| **orphan documentation pages** | *(uninitialised)* | **0** | New — a page no public component produces fails the gate, so a rename cannot leave a page behind claiming a component still ships. |
| **compound parts attributed to a page** | *(uninitialised)* | **64 / 64** | New — asserted by spec; a part whose parent has no page would be undocumented. |
| **public component pages whose example is not paste-ready markup** | *(uninitialised)* | **15 / 144** | New (F-2). Falls as those stories get static-literal templates. |
| **public components with no prose at all** (no description **and** every prop undescribed) | *(uninitialised)* | **3** — `DzAsyncBoundary`, `DzErrorBoundary`, `DzFieldArray` | New (F-3). A strictly stronger statement than A3's `componentsWithoutDescription` = 3, which counts only the header line. |
| **descriptions carrying unescaped HTML** | *(uninitialised)* | **12** | New (F-1). Every renderer of the artifact must escape until this is 0. |
| fixture-backed doc snippets under gate | 19 | **20** | `validate:doc-snippets` now covers `apps/docs/guide` as well. |
| `packages/tooling` tests | 746 | **768** (+22) | `docs-pages.spec.ts`; A/B measured, nothing removed. |
| documents under an llms gate | 4 | 4 | Unmoved — deliberately. |
| A3's four llms ratchets | 0 / 3 / 1 / 0 | 0 / 3 / 1 / 0 | Unmoved; the renderer change is byte-neutral. |
| A2's nine extraction ratchets | at ceiling | at ceiling | Unmoved; this packet reads the artifact and never regenerates it. |
| anatomy non-declaring | 136 | 136 | N2-S1 owns it. The site renders the 5 declaring components' parts and states that the other 139 have *not declared*, rather than that they have none. |
| **static-artifact size gates in the repo** | 2 (`storybook-static` 25 MB · landing chunk budgets) | 2 | **Unmoved, and that is the finding** — the new 16.04 MB artifact is covered by neither (F-4). A reporter exists; a ceiling is an owner decision. |

**B8 resolved as a measurement, not an assumption:** the docs site does **not**
consume the Storybook budget. `check-bundle-size.mjs` reads
`apps/storybook/storybook-static` only, so B8's ~0.6 MB of headroom is exactly
where A3 left it.

---

## 12. Unresolved owner decisions

| # | Decision | Why it is the owner's |
|---|---|---|
| **D1-D1** | **Fix the 12 unescaped-HTML descriptions at source?** Twelve one-line JSDoc edits (`<span>` → `` `<span>` ``, and `DzStepperItem.clickable`'s literal `<code>` tags → backticks). It removes a hazard every present and future consumer of `component-meta.json` must otherwise handle. | Touches component source and changes the bytes of `llms.txt`, `llms-full.txt` and 12 docs pages. Cheap, but it is a content change to a gated public surface. |
| **D1-D2** | **Deploy the site — and where?** Nothing is hosted, no DNS, no CI job, no path chosen. The natural precedent is `apps/landing` nesting Storybook at `/storybook/`; `/docs/` is the symmetric answer, and it is also the shape versioning would later use (`/docs/0.3/`). | README §3 `<authority>` names deployment explicitly. It also interacts with **A3-D2**: the site would be the fourth published copy of facts that already 404 in production (see §14). |
| **D1-D3** | **Does this site replace Storybook as the public face, or sit beside it?** The 08-11 program demoted Storybook without funding a replacement; that replacement now exists as a skeleton. Storybook remains the internal workbench and the only place a component actually *renders*. | A positioning decision with consequences for the landing site's links, `llms-content.ts`'s `INDEX_URL` / `FULL_URL` (which point at `/storybook/…`), the MCP server's URLs, and D3's scope. |
| **D1-D4** | **What size ceiling should `apps/docs` carry?** Measured today: **16.04 MB**, of which `components/` is 12.58 MB across 145 pages. `report-size.mjs --max-mb <n>` is ready. | One local build is not a trusted baseline; `check-bundle-size.mjs`'s own header records that it took the identical reporter-then-budget path. Picking a number is a policy call. |
| **D1-D5** | **Should `apps/docs` join `typecheck:all`?** `apps/docs/.vitepress/config.ts` is currently typechecked by nothing (`typecheck:apps` is `apps/landing` only). It is 155 lines and the file that throws the fingerprint error. | Same family as **A1-D4**: adding a project to `typecheck:all` can turn a green gate red, and the tooling package's 7 pre-existing errors are the standing example. Deliberately not done unilaterally. |
| **D1-D6** | **Theme.** The site ships VitePress's stock theme with no custom CSS — it does not look like dzup-ui, and it does not eat its own dog food by rendering with `--dz-*` tokens. | A visual-identity decision, and D3 (theme builder) is better placed to execute it once it knows what it must host. |
| **D1-D7** | **Should the `@example` blocks render?** (F-6) ~8 lines in `render-llms.ts`, improves `llms-full.txt`, the MCP metadata tools and 144 pages at once. | Changes four gated documents' bytes. Same class as D1-D1. |

---

## 13. Ranked next packet

1. **Give the 15 static-template-less stories a literal template (F-2).** Highest
   ratio of reader value to effort in this list: it fixes the *worst* pages on
   the site, and it improves `llms-full.txt` and `get_component_example` at the
   same time because all three read one field. ~15 story edits, then
   `yarn generate:component-meta && yarn generate:llms && yarn generate:docs-pages`.
2. **Close F-1 and F-3 together — 24 one-line source edits.** Twelve backtick
   fixes (F-1) and twelve JSDoc lines for the three prose-blank components
   (F-3). Both are visible on the public site today, both are trivial, both move
   ratchets that only fall.
3. **Render `@example` blocks (F-6, D1-D7).** ~8 lines, six worked examples that
   currently reach nobody.
4. **A size ceiling for `apps/docs` (F-4, D1-D4)**, once two or three builds have
   established a baseline. `--max-mb` is already implemented.
5. **`apps/docs` into `typecheck:all` (D1-D5)** — or, better, resolve **A1-D4**
   and put `packages/tooling` in first; that has now been the top-ranked hygiene
   item in three consecutive handoffs and has grown from 5 errors to 7.
6. **A custom theme (D1-D6)** — properly D3's, listed so it is not lost.

---

## 14. The D2 seam — evidence pages

**What D2 gets for free.** Every public component already has a page, a stable
URL (`/components/<Name>`), a sidebar entry, a search-indexed body and a
per-page *Extraction fidelity* section that is exactly the shape an evidence
block needs. D2's work is to add a second such block, not to build a site.

**Where to put the code.** `packages/tooling/src/docs/docs-pages.ts`, beside
`renderFidelity()`. Add `renderEvidence(record)` and one line in
`renderComponentPage`:

```ts
body.push(...renderEvidence(record))   // after renderFidelity
```

That is the whole integration. Do **not** add a second generator or a second
app: the freshness gate, the fingerprint, the orphan clause and
`validate:docs-pages` all key off `buildDocsPages()` returning the complete file
list, and anything written outside it becomes an orphan and fails the gate — by
design.

**The data is already in the record D2 will be handed.** `record.capability` is
the capability-matrix join, and A2 kept the cell *names*, not a count:

```ts
interface CapabilityJoin {
  tier: string
  pattern: string
  securityBoundary: string
  traits: string[]
  cells: Record<string, number>
  unrun: string[]   // kinds whose cell is `unrun`, BY NAME
  stale: string[]   // kinds whose cell is `stale`, BY NAME
}
```

Present for **144 / 144** public components; compound parts correctly carry none.

**Four constraints D2 inherits, and they are not negotiable here:**

1. **`<evidence_rules>`: stale and unrun cells stay visible.** `unrun` and
   `stale` are arrays of names for exactly this reason. A page that renders
   "12 evidence cells" and hides which four are unrun would be the first
   dishonest thing on this site. Render the names.
2. **Nothing on this site may become a green badge for evidence that has not
   run.** The N1 lane measured 534 AT cells with 0 executed and 12 FF/WebKit
   projects configured and unrun. A "WCAG AA" badge over that is the exact
   failure this program exists to stop.
3. **A green local run is not CI, release or production evidence.** Say which it
   is, per component, on the page.
4. **`guide/how-this-site-is-built.md` currently states "It is not evidence."**
   That sentence is a promise to the reader; D2 must edit it in the same change
   that starts publishing evidence, or the site contradicts itself.

**Suggested shape**, consistent with what is already there: an *Evidence* H2
after *Extraction fidelity*, a table of `kind · state · when · where`, `unrun`
and `stale` rows printed by name with no state icon that could read as a pass,
and a link to the AT-matrix markdown for Tier C/D components.

---

## 15. The D3 seam — playgrounds and the theme builder

**VitePress makes this a component registration, not a framework change.** That
was the deciding capability in the framework memo (§2a), so here is the exact
route.

**1. Register a global component.** Create `apps/docs/.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import DzPlayground from './components/DzPlayground.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DzPlayground', DzPlayground)
  },
}
```

Markdown is compiled to a Vue SFC, so `<DzPlayground component="DzButton" />`
then works **inside a generated page**.

**2. Emit the tag from the generator, not by hand.** One line in
`renderComponentPage`, guarded so it is deterministic and gated like everything
else:

```ts
body.push('## Playground', '', `<DzPlayground component="${record.name}" />`, '')
```

Two things to watch:

- **`escapeForVue` will escape that tag.** It escapes `<` outside code spans, which
  is why the site survives F-1. D3 must add its component tags to an allowlist
  (or push them through a channel the escaper skips) — and must **not** simply
  disable the escaper, or `DzBreadcrumb.md` breaks the build again.
- **A `<script setup>` block in a generated page** goes above the front matter's
  closing `---`? No — it goes in the body, and only one per page. If D3 needs
  per-page imports, prefer the global registration above; it keeps the generator
  emitting one line instead of a script block.

**3. The theme builder.** `ThemeRecipe`'s URL serialisation already exists (the
competitive benchmark calls it "the hard part, already built"), and the DTCG
export from N2-T1 gives a machine-readable token document with **674/674
`--dz-*` names round-trip-verified in both cascades**. A theme builder page is
`guide/` content plus a registered component; it needs no generator change.

**4. What D3 should also pick up.** Owner decision **D1-D6** — the site ships the
stock VitePress theme and does not render with `--dz-*` tokens. A component
library whose documentation site is not styled by the library is a weak position,
and D3 is the packet with the theme expertise.

**5. What D3 must not do.** Re-extract anything (**B9**); hand-write a prop
table; or make a playground the *source* of an API fact. A playground's controls
must be built from `record.props` and the frozen taxonomies in
`artifact.taxonomies` — which is where the story `argTypes` that publish
contradicting defaults (**B10**, A2-F-3) would otherwise be tempting.

---

## 16. Live defects inherited, re-stated as required

**B-A2-D6 / B-A3-D2 remain open and this packet makes them slightly worse.**
`apps/landing/scripts/build-registry.ts` `rm -rf`s and rewrites 282 tracked
files, so it has deliberately never been run. Consequences, unchanged and
re-verified as still true:

- `/r/component-meta.json` **404s in production**, so `@dzup-ui/mcp`'s three
  metadata tools work locally through the source fallback and fail over HTTP.
- The Storybook build has not been run either, so **production still serves the
  pre-A3 `llms.txt`**, and MCP clients over HTTP still see 101 of 144 components.

**What this packet adds to that ledger:** a fourth surface — this site — which is
correct locally and does not exist in production at all. It is *not* affected by
the `/r/` wipe (it reads `packages/core/docs/component-meta.json` directly at
build time, never a site path), so it introduces no new dependency on the
un-runnable script. But if D1-D2 chooses to deploy under `apps/landing`, that
changes: the landing build is the thing that would publish it.

`build:registry` was **not** run. Nothing was deployed, hosted, published or
dispatched.

---

## 17. Custody

- **Nothing committed, pushed, stashed, reverted or cleaned.** The worktree was
  dirty with 175 entries at run start and every one of them is untouched.
- **`yarn install` ran once**, adding `vitepress@1.6.4` as a devDependency of
  `apps/docs` only. `yarn.lock` gained 761 lines; the root `package.json` gained
  scripts, not dependencies.
- **Five seeded failures, all restored and verified by hash** — `component-meta.json`
  back to `d7138b3f…`, all 146 generated files `sha256sum -c` clean, three moved
  files moved back.
- **`generate:exports` was not run** (**B3**); `public-api.manifest.json` is
  byte-unchanged and this packet never reads it.
- **`build:registry` was not run** (**B-A2-D6**).
- **Storybook and `apps/landing` are untouched** — no file under either was
  modified. (`eslint.config.js`, `package.json`, `validate-doc-snippets.ts`,
  `render-llms.ts` and `component-meta.ts` were modified; none is inside those
  apps.)
- Scratch files used during the run were written to the session scratchpad, and
  the one temporary directory created inside the repo (`.tmp-dbg/`) was removed.
