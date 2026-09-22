# TASK-R1-O5 — Docs-site publication readiness — handoff

> **Date:** 2026-09-21 · **Commit observed:** `527dbd1` (`git rev-parse HEAD`),
> **not** the `99b963a` the task file names. The README's §2 baseline is three
> commits stale; every number below is bound to `527dbd1` plus this task's
> uncommitted work, on a tree that already carried **231 uncommitted paths**
> from TASK-R1-O1…O4. All of them were preserved untouched.
>
> **`[!owner deploy]` — nothing was deployed.** No DNS record, no hosting
> account, no deploy workflow written or run, no request made to a domain
> expecting it to answer. The packet is
> [`docs-deployment-packet-2026-09.md`](./docs-deployment-packet-2026-09.md).

---

## 0. `<done_check>` — what it said, and what was true

Run first, as README §4 requires. **1 of 4 checks passed, and the one that
passed is the one whose premise was false.**

| Check | Result | Reality |
|---|---|---|
| `grep -c 'validate:registry' package.json` → ≥ 2, `yarn validate:registry` → 0 | **FAIL** — count was **0**; the script did not exist | Built here. §2 |
| `grep -n 'docs' packages/tooling/scripts/*budget*.json` contains an `apps/docs` entry | **FAIL** — and *no such file exists*. The check names a path pattern with zero matches in the repo. The real bundle-budget config is `bundlesize.config.json` at the root, it covers three `packages/*/dist` files, and it is **not chained into `validate:all`** at all | Built a new budget. §1 |
| `yarn validate:docs-pages` → 0 **and** reports 0 unescaped-HTML descriptions and 0 non-paste-ready examples | **PASS on exit code, FAIL on the assertion.** It exits 0 — but it has never reported either number, and never could: it is a staleness/orphan comparison, not a content gate. A `<done_check>` that reads an exit code and attributes a claim to it is the false-pass shape TASK-R1-O4 hit | Both numbers now exist and are ratcheted. §3 |
| `ls reports/ \| grep -i 'docs-deployment'` | **FAIL** — no packet | Written. §5 |

---

## 1. Premises tested — three of six were false

The `_Gap:_` preamble is a hypothesis. Measured at `527dbd1`:

| Premise | Verdict | Measurement |
|---|---|---|
| "the dist is the only static artifact under **no size gate**" | **TRUE, and understated.** There are **two** ungated publishable artifacts, not one, and arguably three. `apps/docs/.vitepress/dist` had no gate; `apps/storybook/storybook-static` had one only as a bare `--max-mb 25` with no seed, no provenance and no ratchet; `apps/landing/dist` has none at all (`check:bundle` measures first-paint gzip only) | §1.1 |
| "16.04 → 20.67 MB … 29.82 MB at the 1.0 memo" | **TRUE and stale.** Today it is **34,730,981 B — 33.12 MB**, a further **+11 %** since the memo and **+106 %** since N2-D1 | `yarn docs:build; du -sb` |
| "`validate:registry` does not exist while 282 files ship" | **TRUE, exactly.** 282 files: 89 root `.json` + 87 root `.md` + 60 `animations/` + 45 `templates/` + 1 `.css` | `find apps/landing/public/r -type f \| wc -l` |
| "the registry theme item is inert and unlayered (A4-F4)" | **TRUE.** `tokens.json`: 673 light + 123 dark `cssVars`, **zero** `data-theme`, **zero** `@layer`, no `css` block at all | §2.2 |
| "**12** descriptions carry unescaped HTML" | **TRUE to the unit** — my independent detector found exactly 12, and named the same members | §3.1 |
| "**15** examples are not paste-ready" | **FALSE as stated — it is two different numbers, and neither is an open defect.** (a) Playground seeds: 15 public components have no seed, and **all 15 already carry a typed `SeedRefusal`** with a measured reason (11 `no-runnable-story`, 3 `unexported-tags`, 1 `no-stories-file`). The `<content>` requirement "a real runnable seed **or** a typed refusal reason" was **already met, 15/15**, at HEAD. (b) Usage-section markup: `componentsWithoutStaticTemplate` is **80** of 209, of which the public population is **14**, not 15 — TASK-R3-O3 moved it on 2026-09-17. Lowering either means **writing stories**, which TASK-R5-O8's `<stop_conditions>` routes to story-DoD and owner decision **D53** | §3.2 |
| "**3** components have no prose (`DzAsyncBoundary`, `DzErrorBoundary`, `DzFieldArray`)" | **FALSE — 0.** All three carry a description, and `propsWithoutDescription`, `slotsWithoutDescription`, `eventsWithoutDescription` and `exposedWithoutDescription` are all at ceiling **0**. TASK-R5-O8 closed this on 2026-09-04; the gap preamble predates it | `component-meta.json`, `component-meta-ceilings.json` |
| "the playground chrome is not page-conditional (D3-F8)" | **TRUE, and now measurable.** Before: `theme.*.js` = **59,482 B**, `modulepreload`ed by **every** page including `/guide/getting-started`, with the playground chrome inside it | §4 |

### 1.1 The size gate

**`packages/tooling/src/validators/docs-size.ts`** + data in
**`docs-size-ceilings.json`**, chained into `validate:all` as
`yarn validate:docs-size` (link 38 of **50**).

Two budgets, both seeded from a measured build at `527dbd1`:

| Budget | Seed | Ceiling | Headroom | Tolerance |
|---|---|---|---|---|
| `apps/docs/.vitepress/dist` | 34,730,981 B (33.12 MB, 510 files) | **36,000,000 B** | +3.65 % | 1,400,000 B |
| `apps/storybook/storybook-static` | 26,232,563 B (25.02 MB, 425 files) | **27,262,976 B** (= 26 MiB) | +3.93 % | 1,100,000 B |

Design decisions, each with its reason in the file:

- **Down-only, both directions fail.** Over the ceiling fails and names the
  **biggest three files**; sitting further *under* it than the tolerance fails
  too and says to lower it. A ceiling nobody lowers stops meaning anything.
- **A tolerance, because these are bytes and not counts.** Every other ratchet
  in this repo counts things, so an exact-equality rule works. A byte ratchet
  with no tolerance fails on a re-run of the same commit — **measured, not
  assumed**: two `yarn docs:build` runs of the identical tree, ten minutes
  apart, produced **34,730,981 B** and **34,731,159 B**. The 178 B is content-hash
  length, and it is exactly the noise an exact-equality ratchet would have
  failed on, one run after it was seeded. The tolerance (~4 %,
  roughly two large chunks) is *data*, not a constant in the code, and a spec
  asserts every seeded ceiling is inside its own tolerance — otherwise the
  budget seeded today fails tomorrow as "stale", which is the ratchet eating
  itself.
- **An unbuilt artifact SKIPS and exits 0.** `dist` is a build output (ADR-12);
  a fresh clone has nothing to measure and `validate:all` must stay runnable
  without a 40-second VitePress build in front of it. `--require-dist` makes the
  absence an error, and that is how **`apps/docs`'s own `build` script** calls
  it: the enforcement point is the build that produces the artifact, the same
  split `check-bundle-size.mjs` already used for Storybook.
- **One number, two consumers, asserted.** The Storybook ceiling is also stated
  as `--max-mb` in `apps/storybook/package.json`. A `parity` clause fails when
  the two drift apart — the shape `validate:playground-parity` uses.

`apps/docs/scripts/report-size.mjs` was **deleted**, and `apps/docs`'s `size`
script now delegates to the validator (`yarn --cwd ../.. validate:docs-size
--all`), exactly as its neighbouring `check` script already delegated to
`validate:docs-pages`. Keeping it would have been a second measurement
implementation, which is constraint **B9**'s failure mode. Its own header named
this promotion path — *"one local build is not a trusted baseline"* — four
packets and 17 MB ago.

### 1.2 The `0.00 MB` defect handed over by TASK-R1-O4 — diagnosed and fixed

R1-O4's `storybook` CI job failed with
`Storybook build 25.00 MB EXCEEDS budget 25 MB`, described as "a size gate
firing by 0.00 MB … a rounding/comparison defect".

**The comparison was correct; the *message* was the defect.**
`check-bundle-size.mjs` compares exact bytes (`totalBytes > maxMb * MB`) and
then prints `formatBytes()`, which is fixed at two decimals. The build was
**26,232,563 B** against a **26,214,400 B** budget — genuinely over, by
**18,163 B** — and two decimal places on 25 MB cannot show 18 kB. A gate whose
failure message reads as its own bug is a gate somebody switches off.

Fixed by printing the number that decided the exit code: exact bytes, the
overage, and a pointer to where the ceiling is recorded. `formatBytes()` in the
new validator does the same by construction, and a spec asserts it
(`formatBytes(26_232_563) === '25.02 MB (26,232,563 B)'`).

The **ceiling itself** was also the wrong shape: a flat `25` with no seed
measurement and no provenance. It is now 26 MiB, seeded from a real build,
recorded in `docs-size-ceilings.json` with its reason, and held against the
script's `--max-mb` by the parity clause. **This unblocks the `storybook` CI
job**; the rest of `ci.yml`'s red is R1-O4's finding and not touched here.

---

## 2. `validate:registry` — the gate, and the eight seeded failures

**`packages/tooling/src/validators/registry.ts`**, chained as link 37 of 50.
Static, no network, does not re-run the generators (freshness against `BLOCKS`
is A4-F2's separate open item; this asks "is what we would serve *usable*").

**Nine clauses** over 3 registries · 191 items · 401 installable files:

| Clause | What it refuses |
|---|---|
| `index` | a non-canonical `$schema` (the shadcn-vue fork is not interchangeable), no `name`, a non-absolute `homepage`, an empty `items[]`, **or a declared registry that has vanished** (§2.1) |
| `resolves` | an index entry with no payload beside it, or a payload that disagrees with the entry on `type`/`title` |
| `orphan` | a payload served but listed by nothing (with a named, reasoned exclusion list) |
| `item` | wrong item `$schema`, a `name` that is not the filename, an unknown `type`, an empty `title`/`description` |
| `files` | a `files[]` entry with no `path`/`type`/`target`, or one that **resolves to nothing** — no inline `content` and no file at that path |
| `pro-source` | **A4-F5** — `@dzup-ui-pro` in a dependency, a registry dependency, a `target`, or inside inline file content |
| `theme` | **A4-F4** — §2.2 |
| `dependency` | an `@dzup-ui/*` dependency the release policy **withholds** (`compat`, `codemods`) — a guaranteed install failure, not a future one |
| `docs` *(report)* | a block with no markdown mirror |

A tenth, `unpublished` *(report)*, states **A4-D1** on every run: every item
depends on `@dzup-ui/core` and `@dzup-ui/tokens`, which 404 on npm. The gate
cannot fail on it — it is an owner decision, not a defect — but it may not be
silent about it either.

### 2.0 The seeded failure, proving it fires

`yarn validate:registry --self-test` mutates a deep copy of the **real**
registry — not a fixture — once per hard clause, and asserts that clause, and
only that clause, turns red. Exit **0**, all eight caught:

```
  ✓ [index]      index $schema swapped for the shadcn-vue fork
  ✓ [resolves]   an index entry whose payload file is gone
  ✓ [orphan]     a payload nothing in the index lists
  ✓ [item]       an item whose name disagrees with its filename
  ✓ [files]      a files[] entry with neither inline content nor a file on disk
  ✓ [pro-source] an item importing Pro source (A4-F5)
  ✓ [theme]      a theme with no dark-scheme alias for dzup-ui's own selector (A4-F4)
  ✓ [dependency] an item depending on a package the release policy withholds
```

The same run is a spec (`registry.spec.ts`, 20 tests), so it is in `yarn test`
and not only in a CLI somebody remembered to type.

### 2.1 Finding **F-2** — the registry generators are not commutative

Found by running the gate, which is what a gate is for.

`build-registry.ts` **wipes `public/r/` before it writes** (its own header:
"so a removed/renamed block leaves no stale artifact"), and the animations
registry is written by a **second** script into `public/r/animations/`.
Running `yarn workspace @dzup-ui/landing build:registry` alone therefore
**deletes 60 files**, and the first version of my gate — which walked the tree
for `registry.json` files — reported *two healthy registries and exited 0*.

Discovery cannot see an absence. The three registries are now **declared** in
`EXPECTED_REGISTRIES` with the script that owns each, and a missing one is an
`index` error naming the fix. `apps/landing`'s own `build` chains the two in the
surviving order, so CI was never affected; a developer running one script was.
Both registries were restored and verified byte-identical to HEAD except
`tokens.json` (§2.2). **Routed as D171** — the deeper fix is for
`build:registry` to stop wiping directories it does not own.

### 2.2 A4-F4 closed at the generator

`tokens.json` carried 673 + 123 `cssVars` and **nothing dzup-ui's own runtime
toggles**: shadcn writes `cssVars.dark` under `.dark`, `DzThemeProvider`
switches `[data-theme="dark"]`. 78.8 KB installed, dark mode inert. The
predecessor's header described the gap and left it open — *"a consumer drives
them with shadcn's `.dark` convention"* is a workaround the consumer has to be
told about, on a page that does not exist.

`apps/landing/src/blocks/tokensItem.ts` now emits a `css` block:

```jsonc
"css": { "@layer dz-tokens": { "[data-theme=\"dark\"]": { "--dz-…": "…", … } } }
```

- the alias makes **both** conventions work;
- `@layer dz-tokens` is the layer ADR-19 gives the tokens — unlayered
  declarations outrank every layer, so an alias written outside one would
  quietly beat the package's own stylesheet;
- **only the dark scheme is aliased**: shadcn's `:root` write is already
  dzup-ui's light selector, so duplicating 673 light tokens would add ~30 KB to
  every install and change nothing. A spec asserts that too.

`toTokensItem()` now also throws on a stylesheet that yields **no dark tokens**
— a theme with one colour scheme is A4-F4 wearing another hat.

### 2.3 A defect in my own gate, found by the gate

The `theme` clause first tested
`JSON.stringify(item.css).includes('[data-theme="dark"]')` and stayed **red
against a correct item**: serialisation had already turned the selector's
quotes into `\"`. Fixed by reading selector **keys** (`cssKeys()`), and the spec
asserts the trap directly:
`expect(JSON.stringify(healthy.css)).not.toContain(DZUP_DARK_SELECTOR)`.

---

## 3. Content defects, fixed at their sources

### 3.1 Twelve bare-HTML descriptions → **0**, with a ratchet

Measured independently before trusting the number: strip fenced and inline code
spans, then look for a tag. **Exactly 12**, and the same twelve:

| Member | Tag | Source |
|---|---|---|
| `DzBreadcrumbItem.href` | `<span>` | `DzBreadcrumb.types.ts:56` |
| `DzList.ordered` | `<ol>` | `DzList.types.ts:53` |
| `DzMenuItem.href` | `<a>` | `DzMenu.types.ts:62` |
| `DzSidebarItem.href` | `<a>` | `DzSidebar.types.ts:129` |
| `DzSidebarItem.to` | `<RouterLink>` | `DzSidebar.types.ts:131` |
| `DzStepperItem.clickable` | `<code>` — literal HTML in a JSDoc | `DzStepper.types.ts:140` |
| `DzTableCell.header` | `<th>` | `DzTable.types.ts:312` |
| `DzTableBody` · `DzTableCell` · `DzTableFooter` · `DzTableHeader` · `DzTableRow` | `<tbody>` `<td>` `<tfoot>` `<thead>` `<tr>` | the five `.vue` header comments |

A thirteenth — `DzMegaMenu`'s `MegaMenuLink.href` — was fixed with them. It is
not a component member and never reached the count, but it is the same defect
in the same family and would have reached `llms-full.txt`.

**Why the source and not the page.** `escapeForVue()` in `docs-pages.ts`
already neutralises these for the *site* and still does — it is the last line,
and D1-F-1 (`DzBreadcrumb.md`, "Element is missing end tag") is why it exists.
But an escaper protects the one consumer that has one. A description is
rendered as markdown by the docs pages, **both `llms.txt` endpoints, the MCP
tool payloads and the registry prose**, and none of those three escapes
anything. The fix is one backtick pair in the JSDoc.

Held by a new ratchet **`descriptionsWithBareHtml: 0`** in
`component-meta-ceilings.json`, with a `schema`-level clause that names the
offending members rather than only counting them (a number alone is not
actionable here). Seeded failure driven in `component-meta.spec.ts`: a bare tag
fails and names `DzButton <span>`; the same text in backticks passes.

Regenerated in the documented order: `component-meta` → `llms` →
`docs-pages`/seeds. `validate:llms` caught the missed step and was then green.

### 3.2 The "15 non-paste-ready examples" — already typed refusals

`apps/docs/public/playground/seeds.json` at `527dbd1`: **129 seeds, 15
refusals, 15/15 typed**, `sourceCommit` = HEAD.

| Reason | n | Components |
|---|---|---|
| `no-runnable-story` | 11 | DzAnimatedNumber, DzBlockUI, DzDataView, DzDeferredContent, DzMasonry, DzPageHero, DzPanel, DzRelativeTime, DzScrollProgress, DzToolbar, DzTour |
| `unexported-tags` | 3 | DzAsyncBoundary (`AsyncChild`), DzErrorBoundary (`Bomb`), DzMenu (`Home`, `Settings`) |
| `no-stories-file` | 1 | DzThemeProvider |

Every one is *correct*: the three `unexported-tags` cases name local helper
components and icons the library does not export, and importing a name
`@dzup-ui/core` does not export would make the sandbox throw rather than render
(constraint **B9**). **Converting them means rewriting stories**, which is
story-DoD's ownership and owner decision **D53**. Nothing was changed here, and
nothing was faked — a fabricated seed is worse than a typed refusal.

---

## 4. D3-F8 — page-conditional chrome, measured

**Before:** `DzPlayground` and `DzThemeBuilder` were registered globally in
`apps/docs/.vitepress/theme/index.ts`, which put them in the shared `theme`
chunk that **every** page `modulepreload`s.

**After:** nothing is registered globally. The generated pages emit their own
import, and `guide/theme-builder.md` imports its own panel.

```
<script setup>
import DzPlayground from '../.vitepress/theme/components/DzPlayground.vue'
</script>
```

| Page class | Before | After | Δ preloaded JS |
|---|---|---|---|
| `theme` chunk, on **every** page | 59,482 B | **53,752 B** | **−5,730 B** |
| `/guide/getting-started`, `/evidence/*`, `/`, and the **15** refusal component pages | theme chunk only | theme chunk only, now smaller | **−5,730 B** |
| The **129** component pages with a playground | theme chunk only | + `playground.*.js` 3,159 B + `DzPlayground.vue_…js` 2,221 B | **−350 B** |
| `/guide/theme-builder` | theme chunk; panel fetched on mount | + `ThemeBuilderPanel.*.js` 26,878 B preloaded | same total bytes, fetched earlier on the one page that needs them |

Whole dist: 34,687,719 → **34,730,981 B (+43,262 B)** — 129 import lines and
their preload links. **That is the trade, stated plainly:** +43 KB of static
bytes so that every page stops preloading chrome it cannot use, and so that a
future static `@vue/repl` import lands in a page chunk instead of the shared one.

**What this does NOT fix:** D3-F5. VitePress 1.6.4 disables `cssCodeSplit`, so
the chrome's CSS is still in the one shared stylesheet however it is
registered. "Lazy" and "lazy in the bytes" stay different claims; this moves the
code, not the CSS, and the code says so.

### 4.1 One implementation, not two

- The generator emits the import **only** when the page actually carries the
  `<DzPlayground …/>` tag (asserted: 129 of 145 generated pages have a
  `<script setup>`; the 15 refusal pages have none).
- `escapeForVue()` gained a **second, closed channel** — `<script setup>`, one
  or more allowlisted import lines, `</script>`, and *nothing else*, validated
  as a **whole block** before its first line passes, so a stray `<script setup>`
  in prose can neither open the channel nor be left open over the rest of the
  page. Four specs drive it, including "escapes a script block that is not the
  generator's" and "escapes an unterminated block instead of swallowing the page".

### 4.2 Finding **F-3** — the escape rule was stated three times

The whole-catalogue "no unescaped markup" assertion existed **twice more**, as
hand-rolled copies in `docs-pages.spec.ts` and `evidence.spec.ts`. Both went red
against correct pages the moment the new channel landed. That is **D3-F6
repeating**: the escaper gains a channel and only some copies learn about it.

Fixed permanently: the rule is now one exported function,
`unescapedMarkupLines()`, and **both** specs ask it. Three statements of one
rule are now one.

---

## 5. Files changed, and the API effect

### New

| File | Effect |
|---|---|
| `packages/tooling/src/validators/registry.ts` | `yarn validate:registry` (+ `--all`, `--self-test`). New `validate:all` link |
| `packages/tooling/src/validators/registry.spec.ts` | 20 tests; drives all 8 seeds |
| `packages/tooling/src/validators/docs-size.ts` | `yarn validate:docs-size` (+ `--all`, `--require-dist`). New `validate:all` link |
| `packages/tooling/src/validators/docs-size-ceilings.json` | the two byte ceilings, with seed, date, tolerance and reason |
| `packages/tooling/src/validators/docs-size.spec.ts` | 14 tests; both failure modes + the seed-vs-tolerance invariant |
| `docs/program-2026-09-04/reports/docs-deployment-packet-2026-09.md` | the `[!owner deploy]` packet |

### Changed

| File | Effect |
|---|---|
| `package.json` | `validate:registry`, `validate:docs-size` + their `//` docs; chained into `validate:all`. **48 → 50 links** |
| `packages/tooling/src/validators/component-meta.ts` | `bareHtmlInDescription()`, `membersWithBareHtml()`, the 10th measured number, a member-naming clause |
| `packages/tooling/src/validators/component-meta-ceilings.json` | `descriptionsWithBareHtml: 0` |
| `packages/tooling/src/docs/docs-pages.ts` | `PAGE_COMPONENT_IMPORT_PATH`, `SCRIPT_OPEN`/`SCRIPT_CLOSE`, `componentImportLine()`, `isAllowedImportLine()`, `isGeneratedScriptBlock()`, `unescapedMarkupLines()`; the import block is emitted; `escapeForVue` gained the channel |
| `apps/docs/.vitepress/theme/index.ts` | **global registrations removed**; the theme is now `extends: DefaultTheme` only |
| `apps/docs/guide/theme-builder.md` | imports its own panel (hand-authored page) |
| `apps/docs/package.json` | `size` delegates to the validator; `build` ends with `validate:docs-size --require-dist` |
| `apps/docs/scripts/report-size.mjs` | **deleted** — replaced by the gate it named as its own successor |
| `apps/storybook/package.json` | `check:size --max-mb 25 → 26` |
| `apps/storybook/scripts/check-bundle-size.mjs` | exact bytes + overage in the message; points at the single recorded ceiling |
| `apps/landing/src/blocks/tokensItem.ts` (+ `.spec.ts`) | `css` dark alias inside `@layer dz-tokens`; throws on a dark-less stylesheet |
| 11 `packages/core/src/components/**` files | 13 JSDoc descriptions backticked. **Prose only — no prop, type, default or runtime behaviour changed** |
| `packages/tooling/src/docs/{docs-pages,evidence}.spec.ts` | both ask `unescapedMarkupLines()` |
| `packages/tooling/src/validators/component-meta.spec.ts` | the new ratchet's seeded failures |

### Regenerated (generated artifacts, all stamping `527dbd1`)

`packages/core/docs/component-meta.json` · `llms.txt` · `llms-full.txt` ·
145 `apps/docs/components/*.md` · `apps/docs/.vitepress/generated/nav.json` ·
`apps/docs/public/playground/seeds.json` · `apps/landing/public/r/tokens.json` ·
`apps/docs/.vitepress/dist` (untracked build output).

**Public API effect: none.** No prop, event, slot, export, subpath or type
changed. The only consumer-visible changes are documentation prose, the
`registry:theme` payload gaining a `css` field, and three new npm scripts.

---

## 6. Validation — exit codes read directly, never through a pipe

Every command was run as `cmd > logfile 2>&1; echo "exit $?"`.

| Command | Exit | Result |
|---|---|---|
| `yarn docs:build` | **0** | build complete in 35.74 s; `du -sb` → **34,730,981 B**. Re-run at the end with the gate wired into the script: exit **0**, **34,731,159 B** (+178 B of hash noise), budget enforced by `--require-dist` |
| `yarn validate:docs-size` | **0** | docs 96.5 % of ceiling, Storybook 96.2 %, parity clause green |
| `yarn validate:registry` | **0** | 3 registries · 191 items · 401 files · no Pro source · theme layered and dark-aware |
| `yarn validate:registry --self-test` | **0** | **8 / 8** seeded defects caught by their own clause |
| `yarn validate:docs-pages` | **0** | |
| `yarn validate:component-meta` | **0** | `descriptionsWithBareHtml 0` |
| `yarn validate:playground-parity` | **0** | |
| `yarn validate:llms` | **1 → 0** | caught the stale regeneration; green after `yarn generate:llms` |
| `yarn typecheck:tooling` | **2 → 0** | 3 errors of my own, fixed |
| `yarn lint` | **1 → 0** | 25 style errors of my own, `--fix`ed |
| `vitest run` on the 7 touched spec files | **0** | **177 passed** |
| `yarn validate:all` | ****0**** | **all 50 links green, end to end, 20 min.** Was 48 links; this task added 2 |
| `yarn test` | ****1**** | **10,433 passed · 1 failed · 3 skipped · 1 todo across 550 files** (296 s). The one failure is **not mine** — see below. R1-O1 recorded 10,356 / 0 at the same commit |

### Still red, and whose it is

| # | What | Whose | Evidence |
|---|---|---|---|
| **F-5** | `packages/tooling/scripts/validate-engines.spec.ts:84` — *"has the min-runtime preflight job wired to .nvmrc"* — asserts `.github/workflows/ci.yml` contains `node-version-file: .nvmrc`. It no longer does: **TASK-R1-O4 extracted `validate-min-runtime` into its own reusable workflow**, and the string now lives at `.github/workflows/validate-min-runtime.yml:52` (and `min-peer.yml:87`). The assertion was not moved with it | **TASK-R1-O4**, uncommitted. I touched neither `ci.yml` nor that spec — `git status` attributes both | **Not fixed here**, per the scope rule, but it is one line: point the two `expect`s at `validate-min-runtime.yml`, or assert the string in *whichever* workflow now owns the job. The **validator** `yarn validate:engines` is green inside `validate:all`; only the spec's claim about `ci.yml`'s shape is stale. This is the delta between R1-O1's `10,356 / 0` and today's `10,433 / 1` |
| `validate:published-imports` prints `STALE @dzup-ui/core` | mine, and **deliberately left** | My JSDoc edits are newer than `packages/core/dist` (built 14:25 by an earlier task). It is a **report**, not an error — the gate itself says "this run is evidence about that older build" — and rebuilding `core` would invalidate the `dist` hashes in TASK-R1-O3's release candidate bundle (`docs/qa/release/2026-09-21-527dbd1/hashes.json`). Prose-only `.d.ts` comments are not worth breaking another task's evidence for; the next `yarn build` clears it |
| **↑ Amended 2026-09-22: that single line is now TWO, and the second is not mine** | **`@dzup-ui/contracts` line: TASK-R0-O2** | `validate:all` at 2026-09-22 prints both:<br>`STALE @dzup-ui/contracts: dist (2026-09-21T14:24:40.600Z) predates packages/contracts/src/props.types.ts (2026-09-22T08:11:38.987Z)`<br>`STALE @dzup-ui/core:      dist (2026-09-21T14:25:30.113Z) predates packages/core/src/components/inputs/DzInputGroup.types.ts (2026-09-22T08:11:07.245Z)`<br>TASK-R0-O2's `ariaInvalid` removal added the `contracts` line and its handoff does not record it (`release-exit-verification-2026-09-22.md` §E2, finding **S10**). Both are still reports, `validate:published-imports PASSED`, and the link is green — **but the reasoning above no longer transfers.** R0-O2's edit is a **type-surface** change, not prose-only JSDoc, so "not worth breaking another task's evidence for" is a different trade: the bundle's `hashes.json` and `api-diff.json` already fail to describe the current candidate (finding **S2**, and the supersession note now at the top of `docs/qa/release/2026-09-21-527dbd1/ledger.md`), so the evidence a rebuild would invalidate is evidence that is already stale. **Rebuilding is what S2 says must happen anyway.** |
| `ci.yml` red since 2026-07-03 | **TASK-R1-O4**'s finding | The `storybook` job's cause **was** mine and is fixed (§1.2). The other six are not |
| `apps/landing` long-run flake | known, pre-existing | **Did not occur.** The run completed all 550 files |

---

## 7. Ratchet movements

| Ratchet | Old → new | Where |
|---|---|---|
| `validate:all` links | **48 → 50** | `+validate:registry` (37), `+validate:docs-size` (38) |
| `descriptionsWithBareHtml` | **(none) → 0**, measured 12 → 0 | `component-meta-ceilings.json` |
| docs-dist byte ceiling | **(none) → 36,000,000 B** | `docs-size-ceilings.json` |
| Storybook byte ceiling | **26,214,400 B (`--max-mb 25`, unseeded) → 27,262,976 B (26 MiB, seeded, provenanced, ratcheted)** | same |
| Registry gate | **(none) → 9 clauses + 1 standing report, 8 seeded failures** | `registry.ts` |
| A4-F4 | **open → closed** (0 `data-theme`, 0 `@layer` → both present, gated) | `tokensItem.ts` |
| D3-F8 | **open → closed**; shared `theme` chunk **59,482 → 53,752 B** on every page | `.vitepress/theme/index.ts` |
| Escape-rule implementations | **3 → 1** | `unescapedMarkupLines()` |
| Unchanged, deliberately | `componentsWithoutStaticTemplate` **80** (public 14) · `publicComponentsWithoutExample` **1** · playground refusals **15** — all three need stories, not metadata (D53) | |

---

## 8. Owner decisions raised (continuing from **D164**)

| # | Decision | Options | Recommendation | Blocks |
|---|---|---|---|---|
| **D165** | Docs/site **hosting target** | (a) Cloudflare Pages · (b) GitHub Pages · (c) the existing `datazup.com` host | **(a)** — only (a) can set the `/r/*` and immutable-asset cache headers §4 of the packet specifies; (b) is free and account-less but collapses the cache row to "host defaults" | criterion C14's second half |
| **D166** | **Domain and site composition** | (a) register `dzup-ui.com`, one origin: `/` landing, `/storybook/`, `/docs/` · (b) `docs.dzup-ui.com` as a second origin · (c) `datazup.com/ui/` | **(a)** — `SITE_ORIGIN` is already `https://dzup-ui.com` and is baked into all 3 registry indexes, 87 markdown mirrors, both `llms*.txt`, `sitemap.xml` and every canonical link. (c) costs a regeneration of all 282 registry files. **Free to change today; not after A4-D1** | everything; `dzup-ui.com` is **NXDOMAIN** — it may never have been registered |
| **D167** | Deploy **trigger** | (a) `workflow_dispatch` + `push: tags: ['v*']` · (b) `push: main` · (c) manual | **(a)** — the site documents a published API, and `ci.yml` has not been green since 2026-07-03 (R1-O4), so `main` is not a quality signal | the `docs-deploy` workflow |
| **D168** | **Cache policy ownership** | (a) host with `_headers` · (b) accept fixed host defaults | **(a)**, and it is a consequence of D165, not an independent choice. `/r/*.json` is a machine-read API that a 10-minute blanket cache governs badly in both directions | consumer correctness of `shadcn add` |
| **D169** | **Rollback drill** | (a) re-run `docs-deploy` at the previous tag · (b) repoint a stored deployment | **(a)** — every input is generated from the tree, so the tag *is* the artifact | the release checklist |
| **D170** | `apps/landing/dist` **has no total-size ceiling** — it is the third publishable artifact. `check:bundle` measures first-paint gzip only | (a) add a third budget · (b) leave it to `check:bundle` | **(a)**, but **not seeded here**: the only local build is from 2026-08-28 and carries a 230 MB Storybook with duplicated `iframe` chunks. A ceiling seeded from a stale artifact is a fabricated number. Needs one fresh `yarn workspace @dzup-ui/landing build` | a complete C14 |
| **D171** | `build:registry` **wipes directories it does not own** (F-2) | (a) scope the wipe to the files it writes · (b) merge the two generators · (c) leave it, gated | **(a)** — `validate:registry` now *detects* the hole; a generator that deletes a sibling's output is still wrong | developer-local correctness |
| **D172** | **Deploy before or after A4-D1** | (a) after · (b) before, with install commands suppressed · (c) before, as-is | **(a)** — a live site whose every install command returns `E404` is worse than NXDOMAIN, because NXDOMAIN is honest | the order of the whole packet |
| **D173** | `docs/qa/release/2026-09-21-527dbd1/candidate-content-digest.json` now names a **deleted** file (`apps/docs/scripts/report-size.mjs`) | (a) re-run `yarn release:report` after this lands · (b) leave — a candidate digest is a point-in-time record of its commit | **(b)** for the existing bundle, **(a)** at the next candidate. It is an output, not a gate input — nothing reads it | R1-O3's bundle accuracy |

---

## 9. Ranked next packet

1. **Fix F-5 — one line, and `yarn test` is back to 0 failures.** `validate-engines.spec.ts:84` still asserts `ci.yml` owns `node-version-file: .nvmrc`; R1-O4 moved that job to `validate-min-runtime.yml`. It is the only thing standing between this tree and R1-O1’s "truthfully green". 🔴
2. **TASK-R0-O1 / A4-D1 — publish-or-freeze.** Everything in §8 waits behind it,
   and `validate:registry` now prints the fact on every run instead of leaving
   it in a report. 🔴
3. **D166 — does anyone own `dzup-ui.com`?** One lookup. It is NXDOMAIN, which
   is consistent with "never bought", and it is the single fact that decides
   whether `SITE_ORIGIN` is correct or is a promise to 282 future 404s. 🔴
4. **D170 — seed the `apps/landing/dist` budget** from one fresh build. Fifteen
   minutes, and it closes the last ungated publishable artifact. 🟠
5. **D171 — stop `build:registry` deleting `r/animations/`.** The gate catches
   it now; the generator should not do it. 🟠
6. **Lower `componentsWithoutStaticTemplate` (80 / public 14) via story-DoD**,
   under **D53**. This is the real content-debt residual behind the gap
   preamble's "15 examples", and it is story work, not metadata work. 🟢
7. **D3-F5 — serve the playground CSS as files.** Now that the code is
   page-conditional, the CSS is the only part of the chrome still charged to
   every page, and it needs a VitePress version that re-enables
   `cssCodeSplit`. 🟢

---

## 10. What was deliberately not done

- **No deploy, in any form.** No DNS record, no hosting account, no
  `docs-deploy.yml` written (it is *described* in §5 of the packet, not
  created), no request to a domain expecting it to provision.
- **No commit, push, CI dispatch, publish or baseline replacement.** The tree
  carries this work plus R1-O1…O4's; the owner commits.
- **No story rewrites** to convert the 15 typed playground refusals or the 14
  public non-static templates — story-DoD's ownership, owner decision D53, and
  a fabricated seed is worse than an honest refusal.
- **No third size budget** for `apps/landing/dist` from a four-week-old local
  build (**D170**).
- **No fix to `ci.yml`'s other red.** R1-O4 found it has not been green since
  2026-07-03; the `storybook` job's size failure was mine to fix and is fixed,
  the rest is not mine.
- **No change to `escapeForVue`'s existing behaviour.** The 12 source fixes do
  not make the escaper redundant and it was not relaxed — it is the last line
  for the one consumer that has one.
- **`apps/landing/public/r/component-meta.json`**, a 1.7 MB build leftover that
  `build:registry` created during this task, was **removed** — it was not in the
  tree before and is not mine to add.
