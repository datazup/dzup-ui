# TASK-N2-D3 — Inline playgrounds + ThemeRecipe theme builder

> **Status:** COMPLETE (2026-09-02). Sections 2 onward were written by the
> orchestrator after finishing the packet in-session — four agents in this lane
> were lost to transport failures; see §2 for what that means for the evidence.
> Repo `ui/dzup-ui`, branch `main`, HEAD `51dec93 new version for themes`,
> worktree **dirty** (265 entries at run start: the uncommitted N1 evidence
> program plus N2-T1 / A1 / A2 / A3 / D1 / D2 / S1). Nothing is committed,
> pushed, dispatched, deployed or published by this packet.
> Toolchain: Node `v24.14.1`, Yarn `4.16.0`.

---

## 1. The spike, first — and it did not fail

**The orchestrator's brief said the stop condition was "unusually likely to
fire". It did not fire, for a reason nothing in the brief, in D1 §15 or in
D2 §14 records: the mechanism D3 was asked to spike already exists in this
repository, is wired into a shipping surface, and has its own browser-driven
verification script.**

`apps/storybook/scripts/build-playground.mjs` (112 lines, dated 2026-07-17) +
`apps/storybook/stories/_blocks/playground.config.ts` (131 lines) +
`apps/storybook/stories/_blocks/DzRepl.ts` (223 lines) +
`apps/storybook/scripts/verify-repl.mjs` (10,395 B) are a complete, working
`@vue/repl` integration that resolves `@dzup-ui/core` from a workspace,
unpublished package. `@vue/repl` is already a declared devDependency of
`apps/storybook` (`^4.6.1`, resolving to **4.7.2**), and three MDX pages
(`Buttons.mdx`, `FormsValidation.mdx`, `GettingStarted.mdx`) already embed it.

### 1a. The resolution mechanism, as measured

Not import maps *or* bundled artifacts — **both, in a specific arrangement**:

| Layer | What resolves it | Where |
|---|---|---|
| `import { DzButton } from '@dzup-ui/core'` inside the sandbox | An **import-map entry** `{"@dzup-ui/core": "<base>/playground/dzup-core.mjs"}`, merged on top of `@vue/repl`'s built-in Vue map with `mergeImportMap()` | `playground.config.ts:107-110` |
| The URL that entry points at | A **single self-contained ESM bundle** produced by a Vite lib build whose `rollupOptions.external` is exactly `['vue', 'vue/server-renderer']` — `reka-ui`, `@floating-ui/vue`, `lucide-vue-next`, `tailwind-variants`, `clsx`, `tailwind-merge`, `@internationalized/date`, `qrcode-generator` and `@dzup-ui/contracts` are all **inlined** | `build-playground.mjs:65-95` |
| `vue` staying a singleton | Kept external so the sandbox's own Vue (from `useVueImportMap()`) serves both the compiled user SFC and the library | `build-playground.mjs:91` |
| The `--dz-*` custom properties | `packages/tokens/dist/tokens.css`, copied to `public/playground/tokens.css` and `<link>`ed into the sandbox `<head>` | `build-playground.mjs:97`, `playground.config.ts:91` |
| The base interaction utilities | `core.css`, the stylesheet **Rollup extracts from the bundle itself** (`cssFileName: 'core'`), so it cannot drift from what the sandbox imports | `build-playground.mjs:85` |
| The Tailwind utility classes `tv()` emits | **`https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`**, a runtime CDN script that JITs `inline-flex`, `h-[var(--dz-button-md-height)]`, … inside the sandbox | `playground.config.ts:32` |

**Why a bundle and not a served `dist/` tree.** `packages/core/dist` is
`preserveModules` output: **637 `.js` files, 5.7 MB**, whose bare imports are the
nine third-party specifiers above. Serving it statically would need an
import-map entry for every one of those nine *and* their transitive graphs, and
would cost the browser ~250 module fetches for a barrel import. The existing
answer — one file, everything but `vue` inlined — is the correct one and is
already written down in the script's own header.

**Two properties of that mechanism the brief did not anticipate, both
measured:**

1. **It bundles from `packages/core/src`, not from `packages/core/dist`.** The
   task requirement says "resolve `@dzup-ui/*` from built dist". The shipping
   implementation deliberately does not, and records why at
   `build-playground.mjs:17-24`: the extracted `core.css` "cannot drift from what
   the sandbox actually imports, and the playground no longer needs core to have
   been built." **That decision is now load-bearing in a way its author could not
   have known:** `packages/core/dist` is git-ignored (`.gitignore:9`, 0 tracked
   files) and its newest file is **2026-08-25T09:24Z** against a newest source
   file of **2026-09-02T00:48Z** — **8 days and one entire N2-S1 stale**. A
   playground bundled from `dist` today would render the *pre-S1* components
   (before 23 anatomy declarations, 22 new `ui` bindings and the `data-part`
   emissions) directly beside a prop table generated from a **fresh** source
   extraction. Bundling from source is the only variant of this mechanism that is
   honest on this tree. Recorded as finding **D3-F2**.
2. **It has a hard runtime dependency on two CDNs.** `cdn.jsdelivr.net` serves
   `es-module-shims@1.5.18` and the Vue runtime/compiler (`@vue/repl`'s
   defaults), and a second `cdn.jsdelivr.net` request serves
   `@tailwindcss/browser@4`. Without network the playground does not render, and
   **without Tailwind's browser JIT it renders unstyled** — the components carry
   no stylesheet of their own (ADR-04: `tv()` + Tailwind over `--dz-*`). Every
   local browser build in this repository is therefore a network-dependent
   surface. `@vue/repl` exposes `ResourceLinkConfigs` (`esModuleShims`,
   `vueCompilerUrl`, `typescriptLib`, …) and `useVueImportMap({runtimeDev,
   runtimeProd, serverRenderer})`, and `vue.runtime.esm-browser.js` +
   `compiler-sfc.esm-browser.js` are already in `node_modules` — so
   self-hosting is available and was not taken. Recorded as finding **D3-F3**.

### 1b. What the spike therefore changed about this packet

The task's step 1 ("spike `@vue/repl` with built dzup-ui dist; record the
resolution mechanism") is **answered by prior art**, so the risk in this lane
moved. It is no longer *"can this be resolved"*. It is *"will this packet build
the fifth second-implementation"* — after a second component-API extractor
(**B9**), a second `llms` structural validator (A3-F-3), a second component-page
renderer (D1 §4) and a second theme engine, which is what this task's own
`<stop_conditions>` warns about. **A second playground and a second theme
builder are both sitting right there**, and `apps/landing` already ships a
1,570-line `ThemesPage.vue` over a 466-line `useThemeDesigner.ts` with its own
Playwright round-trip spec (`apps/landing/e2e/theme-recipe.spec.ts`).

The rest of this handoff is written against that constraint.

---

## 2. Custody of a four-agent packet

This packet was executed by **four agents**. Three were killed mid-run by
transport failures; the fourth (2026-09-02 13:10) stalled at the lint step and
also wrote nothing here. Sections 2 onward were written by the **orchestrator**,
in-session, after finishing the packet directly — a fifth fresh-context agent was
judged worse value than finishing work already substantially complete.

**What that means for the evidence below.** Every number in §4–§9 was
re-measured in this session against the tree as it stands. Two numbers are
**inherited** from the lost agents — they survive only as comments in the source
they justify — and they are labelled as inherited where they appear (§7,
findings **D3-F4** and **D3-F5**). They are not re-derived here, and they should
not be quoted as this session's measurements.

State found on arrival, verified rather than assumed:

| Claim | Verified |
|---|---|
| `validate:playground-parity` already chained into `validate:all` | **Yes — link 26 of 36** |
| `<DzPlayground>` on the component pages | **129 of 144** — and the 15 gaps are typed refusals, not omissions (§4) |
| `apps/docs/guide/theme-builder.md` embeds `<DzThemeBuilder />` | Yes |
| Three specs exist and pass | `playground.spec.ts` 38 · `theme-recipe-url.spec.ts` 16 · `docs-pages.spec.ts` 26 = **80 tests** |
| A site build existed | Yes, 12:24 — superseded by this session's rebuild |

## 3. What the packet ships

| File | Role |
|---|---|
| `packages/tooling/src/playground/playground-contract.ts` | **The one statement of the sandbox contract** — the three asset filenames, the two editor stylesheets, the bare specifier the import map binds, the Tailwind browser-JIT URL, `wrapStoryTemplate()`, `componentTagsIn()`. |
| `packages/tooling/src/docs/playground-seeds.ts` | Builds `seeds.json` from the metadata artifact. Returns a seed **or the measured reason there is none**, from one function — so a page cannot print a reason that is not the reason. |
| `packages/tooling/src/validators/playground-parity.ts` | `yarn validate:playground-parity` — **link 36**. Holds three surfaces against the contract. |
| `apps/docs/.vitepress/theme/playground.ts` | Boots `@vue/repl`. Every REPL import is dynamic; Vue is imported **by name**, deliberately (§7). |
| `apps/docs/.vitepress/theme/theme-recipe-url.ts` | The theme builder's non-visual half. **Contains no theming logic** — every operation is a call into `@dzup-ui/tokens`. |
| `apps/docs/.vitepress/theme/components/{DzPlayground,DzThemeBuilder,ThemeBuilderPanel}.vue` | The chrome. `DzPlayground` **opens closed** — a button until pressed. |
| `apps/docs/scripts/sync-playground-assets.mjs` | Copies the **single** producer's output (`apps/storybook/scripts/build-playground.mjs`); `--check` asserts byte-identity. Not a second bundler. |

**API effect on the published library: none.** No `packages/core` runtime source
was touched. The additions are one tooling module, one generator, one validator
and one docs-app surface.

## 4. Coverage — 129 of 144, and the 15 are refusals

The arithmetic was verified against the artifact directly, not read off a log:

```
144 public components
−12  no runnable story at all   (11 no-runnable-story + 1 no-stories-file)
───
132  records carrying runnable.template
− 3  unexported-tags  (DzAsyncBoundary, DzErrorBoundary, DzMenu)
───
129  seeds
```

The three `unexported-tags` refusals are the rule a template-only check cannot
see: the story mounts a tag `@dzup-ui/core` does not export, so importing it
would make the sandbox **throw on load** rather than render. The artifact is the
authority on what is exported (**B9/B12**) — the refusal is measured, never a
`Dz`-prefix guess.

**Every one of the 15 prints a stated absence on its own page**, with the reason
in prose. `DzTour`: *"Every story in `…/DzTour.stories.ts` either has a computed
template or binds Storybook's `args`, neither of which can be mounted outside
Storybook. A playground here would have to be written by hand, and a
hand-written example is not evidence of anything."* `DzThemeProvider`: *"It has
no stories file, so there is no real example to run — and this page will not
invent one."*

This is the discipline D2 applied to 506 `unrun` capability cells: the gap is
published by name, at the same weight as the coverage.

## 5. The theme builder adds no theming logic

The stop condition — *"when the theme builder would need a token mutation API
ThemeRecipe does not expose, that is a tokens-package feature request, not a
docs hack"* — **did not fire**. `theme-recipe-url.ts` imports nine functions from
`@dzup-ui/tokens` (`applyThemeRecipe`, `createDefaultThemeRecipe`,
`normalizeThemeRecipe`, `resolveThemeRecipeMode`, `serializeThemeRecipe`,
`ThemeRecipeError`, `themeRecipeFromUrl`, `themeRecipeToCssText`,
`themeRecipeToUrl`) and **recomputes no colour**. Validation errors surface the
message `ThemeRecipe` itself threw, verbatim — a shared link that silently
reverts to the default theme is worse than one that says the link is broken.

The round-trip is proven by **16 tests**, not by inspection.

This mattered more than the brief implies: this lane has now found a second
component-API extractor (**B9**), a second `llms` structural validator (A3-F-3),
a second component-page renderer (D1 §4) and — while this packet ran — a second
theme designer in `apps/landing` (`ThemesPage.vue`, 1,570 lines, over a 466-line
`useThemeDesigner.ts`). A fifth would have been the easiest thing in the packet
to write.

## 6. Four gates, each seeded and observed red

Every seed was restored and the restoration **verified by hash**, not by eye.

| # | Seed | Gate | Result |
|---|---|---|---|
| 1 | Rename one editor stylesheet to `repl/codemirror-editorX.css` in the copy step | `validate:playground-parity` | **exit 1** — *"apps/docs/scripts/sync-playground-assets.mjs does not reference `repl/codemirror-editor.css` … the editor renders unstyled with no gate able to see it"* |
| 2 | Append one hand-written sentence to `apps/docs/components/DzButton.md` | `validate:docs-pages` | **exit 1** — *"is STALE — it disagrees with a fresh render"* |
| 3 | Delete `DzButton` from `seeds.json` | `validate:docs-pages` | **exit 1** — *"seeds.json is STALE"* |
| 4 | Append one comment line to the copied `core.css` | `playground:check` | **exit 1** — *"DIFFERS from the producer's output. The docs playground would run a different library than Storybook's."* |

**Seed 1 is the regression test for D3-F7** — the defect where a renamed
stylesheet passed `validate:playground-parity`, `playground:check`,
`validate:docs-pages` *and* the site build, all green, while the editor rendered
unstyled. It fires now because the two stylesheet names were moved into the
contract.

**Seed 3 is honest about what actually caught it.** `docs-pages.ts` says the page
and the seeds file "are compared by `validate:docs-pages` as well as wired
together here". They are — but because both are rendered by **one generator from
one artifact**, they cannot disagree unless one is hand-edited, and what fires
then is the *freshness* clause, not the cross-check. The cross-check is
unreachable by construction. Recorded as **D3-F9**; it is a comment claiming more
than the code does, not a broken gate.

## 7. Performance — the requirement, measured twice

### 7a. Structural: nothing REPL-related is statically reachable

`grep` over `apps/docs` finds **zero** static `@vue/repl` imports; the only three
references are `import('@vue/repl')`, `import('@vue/repl/codemirror-editor')` and
a comment. In the built site, **no HTML file references** the `vue-repl`,
`codemirror-editor`, `jsx` (Babel) or `ThemeBuilderPanel` chunks. A component
page preloads exactly three things:

```
/assets/chunks/theme.JHMgglFp.js
/assets/chunks/framework.l13ENdJN.js
/assets/components_DzButton.md.C9D_L7kK.lean.js
```

### 7b. A/B build — what a page pays for the feature existing

A B-variant was built with `renderPlayground()` returning `[]`, then restored
(§8). This is the measurement the requirement actually asks for:

| Metric | A (playgrounds) | B (no playground sections) | Δ |
|---|---|---|---|
| `guide/getting-started.html` | 47,247 B | 47,247 B | **0** |
| shared `style.css` | 115,336 B | 115,336 B | **0** |
| `framework` chunk | 113,335 B | 113,335 B | **0** |
| `theme` chunk | 59,482 B | 59,482 B | **0** (content hash differs) |
| `DzButton.html` | 110,094 B | 109,291 B | +803 B |
| `DzButton` page chunk | 26,786 B | 26,325 B | +461 B |
| generated markdown, 153 files | 2,076,863 B | 2,040,463 B | +36,400 B |
| whole `dist/` | 29,822,709 B | 29,569,823 B | +252,886 B |

**A page with no playground on it is byte-identical between the two builds.**
That is the `<performance>` requirement met — but for a more precise reason than
"the component is lazy", and the distinction is **D3-F8**: the chrome is *not*
page-conditional. Registering `DzPlayground` in the VitePress theme puts its CSS
in the shared stylesheet and its code in the shared `theme` chunk whether or not
a page carries the tag. The requirement holds because **nothing REPL-related is
statically reachable from that chrome**, not because the chrome is absent.

### 7c. Real browser transfer, against the built site

Measured with Playwright over `vitepress preview`, counting response bodies:

| Page | Requests | Transferred |
|---|---|---|
| `/guide/getting-started` (no tag) | 21 | 405,168 B |
| `/evidence/capability-matrix` (no tag) | 8 | 467,985 B |
| `/components/DzButton` (tag, **not pressed**) | 23 | 542,778 B |
| `/components/DzButton` (**after Launch**) | 35 | 2,531,707 B |

Pressing Launch adds **12 requests and 1,988,929 B** — `vue-repl` 1,045,245 B,
`codemirror-editor` 287,876 B, `seeds.json` 119,657 B, `tokens.css` 48,961 B,
plus three CDN fetches (`es-module-shims` 46,712 B, `runtime-dom` 107,357 B,
`@tailwindcss/browser` 281,817 B). **Zero HTTP errors.** The 4,340,223 B Babel
chunk `@vue/repl` pulls in was **not fetched even after Launch** — a third
deferral tier.

### 7d. The sandbox renders the real library

The measurement asserts the outcome, not just the bytes. After Launch the
sandbox iframe contains 5 buttons reading `["Solid","Outline","Ghost","Text","Link"]`,
the first carrying the real `tv()` output —

```
inline-flex items-center justify-center … h-[var(--dz-button-md-height)]
bg-[var(--dz-primary-solid)] text-[var(--dz-primary-foreground)] …
```

— and a **computed background of `oklch(0.55 0.22 260)`**. That single value
proves three things at once: the Tailwind browser JIT compiled
`bg-[var(--dz-primary-solid)]`, `tokens.css` resolved the custom property, and
the component running is the library's, not a copy.

**Inherited measurements (from the lost agents, not re-derived here):** writing
`import('vue')` as a namespace import grew the shared `framework` chunk
111,886 → 140,060 B, **+28,174 B on all 158 pages** (**D3-F4**); and because
VitePress 1.6.4 builds with `cssCodeSplit` disabled, `import '@vue/repl/style.css'`
grew the shared stylesheet 112,811 → 131,233 B, **+18,422 B of code-editor CSS
charged to every reader of every page** (**D3-F5**) — which is why the two editor
stylesheets are served as files and `<link>`ed at launch instead.

## 8. Determinism and restoration

155 generated files (144 component pages + index + 6 evidence pages + nav +
`seeds.json`) were fingerprinted **before** the B excursion and re-verified
**after** it:

```
sha256sum -c .tmp-d3/generated-A.sha256  →  exit 0, 155 OK, 0 mismatches
```

The generator ran twice more between those two points, from a patched and then a
restored source, and produced byte-identical output both times — which is the
cold-run determinism proof as well as the restoration proof. `docs-pages.ts` and
`sync-playground-assets.mjs` were each restored and hash-verified against their
pre-seed digests. All four gates were re-run green afterwards.

## 9. Validation ladder

| Lane | Result |
|---|---|
| `yarn validate:playground-parity` | **exit 0** — 3 surfaces agree (3 assets, 2 editor stylesheets, specifier `@dzup-ui/core`, Tailwind JIT pinned) |
| `yarn --cwd apps/docs playground:check` | **exit 0** |
| `yarn validate:docs-pages` | **exit 0** — 144 pages + index + 6 evidence pages + nav + **playground seeds** |
| `yarn lint` | **exit 0** |
| **`yarn validate:all`** | **exit 0 — 36 links, run end-to-end in full** |
| `yarn test` | **9,089 passing / 2 failed** (496 files passed / 2 failed, 2 skipped, 1 todo) |
| `tsc -p packages/tooling` | **7 errors — the 7 pre-existing, none in this packet's files** |
| `vitepress build` | **exit 0** — 159 HTML pages, 39.3 s |

**The two test failures are the pre-existing B5 pair** —
`token-checks/landing-token-fallbacks.spec.ts` and
`validators/story-dod-tiers.spec.ts` — neither in this packet's surface. This
packet's own three specs are green (80 tests).

**`validate:all` was run in full, not sampled.** The S1 reconciliation
established that a narrow gate plus a link count is not aggregate qualification;
a stale `quality-matrix.json` sat under three consecutive "exit 0, 33 links"
claims (**S1-F10**). The 36-link chain above was run end-to-end.

**The `packages/tooling` `tsc` streak is broken.** A new validator has introduced
a type error invisible to every green gate six times running (A1-F7, A2-F-10,
S1). This packet's four new tooling files introduce **none**.

## 10. Ratchet movements

| Ratchet | Before | After |
|---|---|---|
| `validate:all` links | 35 | **36** (`validate:playground-parity`) |
| repo tests | 9,035 | **9,089** (+54) |
| **public components with an editable playground / 144** | *(uninitialised)* | **129 / 144** |
| **playground refusals, by measured reason** | *(uninitialised)* | **15** — `no-runnable-story` 11 · `unexported-tags` 3 · `no-stories-file` 1 |
| **public components promising a playground with no seed** | *(uninitialised)* | **0** — held by `validate:docs-pages` |
| **static `@vue/repl` imports in `apps/docs`** | *(uninitialised)* | **0** — the whole isolation claim rests on this |
| **REPL bytes on a page that does not launch one** | *(uninitialised)* | **0** — A/B byte-identical |
| **surfaces held against the sandbox contract** | *(uninitialised)* | **3** |
| docs site size | 20.67 MB | **29.82 MB** — still under **no size gate** (D3-F10) |
| offline search index | 1,542,784 B | **1,617,254 B** |
| `packages/tooling` `tsc` errors | 7 pre-existing | **7 — none new** |

## 11. Findings

- **D3-F4** *(inherited)* — `import('vue')` as a namespace import costs +28,174 B
  on every page. Vue is imported by name for that reason; the comment at
  `playground.ts:22-28` is load-bearing and should not be "tidied".
- **D3-F5** *(inherited)* — VitePress 1.6.4 disables `cssCodeSplit`, so CSS behind
  a dynamic `import()` still lands in the one shared stylesheet. "Lazy" and "lazy
  in the bytes" are different claims; only serving the editor CSS as files
  achieves the second.
- **D3-F7** *(inherited, fix verified here)* — a renamed editor stylesheet passed
  **four** green gates while the sandbox rendered unstyled. Fixed by moving the
  names into the contract; seed 1 (§6) is the regression test.
- **D3-F8** 🟠 — **the playground chrome is not page-conditional.** Registering the
  component in the VitePress theme puts its CSS and code into the shared
  stylesheet and `theme` chunk regardless of which pages carry the tag. The
  isolation requirement is met because nothing REPL-related is statically
  reachable — not because the chrome is deferred. Anyone who later adds a static
  `@vue/repl` import anywhere in `apps/docs` silently converts a 1.3 MB
  on-demand cost into an every-page cost, and **no gate would see it**.
- **D3-F9** — the page↔seeds cross-check described in `docs-pages.ts` is
  unreachable by construction; the freshness clause is what fires. The comment
  claims more than the code does.
- **D3-F10** 🟠 — **the docs site is now 29.82 MB and covered by no size gate at
  all.** D1-F-4 measured that `check-bundle-size.mjs` reads `storybook-static`
  only; D2 grew the site 16.04 → 20.67 MB against that gap; this packet grew it
  to 29.82 MB (**+44 %**), of which 5.67 MB is REPL machinery that no page loads
  unless a reader presses a button. Three consecutive packets have grown an
  ungated artifact. The bytes are defensible; the absence of a ceiling is not.

## 12. Owner decisions

- **D3-D1** — `apps/storybook/stories/_blocks/playground.config.ts` remains a
  parallel copy of the sandbox contract, held by `validate:playground-parity`
  rather than re-pointed at `@dzup-ui/tooling/playground`. Gate now, unify later?
- **D3-D2** — the sandbox has a hard runtime dependency on **jsDelivr** for
  `es-module-shims`, the Vue runtime and the Tailwind browser JIT (**D3-F3**).
  Without network it does not render; without Tailwind it renders **unstyled**.
  Self-hosting is available (`@vue/repl` exposes `ResourceLinkConfigs`; the files
  are already in `node_modules`) and was not taken. Accept, or self-host?
- **D3-D3** — **give the docs site a size ceiling** (D3-F10). It is the only
  static artifact in the repository with none.
- **D3-D4** — the playground bundles from `packages/core/src`, not `dist`
  (**D3-F2**), because `dist` is git-ignored and was 8 days and one entire N2-S1
  stale. This is the only variant that is honest on this tree, and it
  contradicts the task's own wording ("resolve from built dist"). Ratify the
  deviation, or fix `dist` freshness?
- **D3-D5** — 11 of the 15 refusals are `no-runnable-story`: stories with computed
  templates or `args` bindings that cannot mount outside Storybook. Converting
  them is a story-authoring backlog item that would raise 129 → 140. Schedule, or
  accept 129?

## 13. What this surface refuses to imply

- **That a playground is a test.** Nothing here runs in CI, and a sandbox that
  renders is not evidence a component is correct. The capability and AT matrices
  remain the evidence surfaces; this is a demonstration.
- **That 129 of 144 is 144.** The 15 absences are printed on their own pages with
  the measured reason.
- **That the example is authored.** Every seed template is a story file's own
  bytes; the only line the generator writes is the `import` Storybook supplies
  implicitly. Each running playground names the story, the file and the line
  range it came from, on the page.
- **That it works offline.** The idle panel says so before a reader presses
  anything: *"Needs network access: the sandbox pulls Vue and the Tailwind
  browser compiler from jsDelivr."*
- **That any of this is released.** Locally qualified, worktree-dirty,
  uncommitted — the same standing as every other N1/N2 packet.

## 14. Seam for the next packet

`packages/tooling/src/playground/playground-contract.ts` is the single place any
future sandbox consumer binds to. Add a surface by adding it to the parity
validator's list — not by restating an asset name.

**Ranked next:** **TASK-N2-A4** (registry distribution evaluation) is the only
remaining N2 packet and is read-only by design, terminating in an owner
decision. After it the N2 lane is complete and the program's open weight moves to
**N5** (release policy, ARIA-prop gap closure, toolchain currency) — where D3-D3
(a size ceiling) and D3-D2 (the CDN dependency) both belong as inputs.

