# Execution status — oss-recovery-and-shared-kit-tasks.md

> Live ledger for the synchronous run of `oss-recovery-and-shared-kit-tasks.md`
> (REC-01 → SK-1 → SK-2 → APP-1, with AR-2 on its own gate). Started
> **2026-08-25** against `ui/dzup-ui` `main` @ `e986952`, clean worktree.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
>
> **Nothing here is committed, pushed, dispatched to CI, or published** — every
> packet stops at "locally qualified" per README §3 `<authority>`.

## Custody re-verification (README §2)

| Claim in README §2 | State on 2026-08-25 at run start |
|---|---|
| `ui/dzup-ui` worktree **dirty**, deleted `.changeset/*` staged | **Not true.** Worktree clean. Nothing to preserve. |
| `main` 3 commits ahead of `origin/main` `a959c6c` | **Not true.** `main` and `origin/main` are the **same commit**, `e986952` (2026-08-25). The foundation and form programs have been pushed. |
| Recovery lives on `fix/blocks-gallery-ui-ux` | Branch gone locally and remotely; all seven recovery SHAs are in `main`. See REC-01. |
| Pro checkout on `esmir`, behind `origin/main` | Unchanged. Nothing in this lane consumes a Pro manifest. |

## Progress

| Task | Status | Result |
|---|---|---|
| TASK-REC-01 | `[x]` | Recovery is in `main` **and** `origin/main` — all 7 SHAs. Every accepted number was stale. **Three defects found on `main`**: `@dzup-ui/testing` could not compile *or build*; one test was unsatisfiable by construction; the `test:prepare` guard proved three committed generated artifacts stale. Promotion request written with two file groups. |
| TASK-SK-1 | `[x]` | The helper existed **three times**, once in another repository, and none of the copies had a mode. Now one derivation from `exports`: 10 handwritten entries -> **31 derived**, five consumers migrated, the predecessor deleted. Found that `@dzup-ui/core/providers` resolved only by accident, that nothing anywhere set `dedupe`, and that **`changeset status` was failing on `main`** - the release plan was blocked. |
| TASK-SK-2 | `[x]` | The migration was already done by SK-1; the real work was ranking, asserting and reporting. **`yarn why` shows two `vue`, two `reka-ui` peer contexts and two `vite` majors in this tree**, and before SK-1 **no config anywhere set `resolve.dedupe`** - the 08-08 plan had measured the fix seventeen days earlier and it was never applied here. Two new Playwright files assert one portal root + focus return: **18/18 on three engines** plus 2/2 on the landing app. One consumer (`website-app`, another repo) is still exposed; patch proposed, not applied. |
| TASK-APP-1 | `[x]` | Two of three slices did not exist as described (sandbox is LEGACY with a standing "do not add to it"; the Storybook doc blocks are 15 `.ts` files and no `.vue`). Slice 3 found **zero components worth swapping** - the remaining hand-rolled UI is brand chrome no Core tone can render. What the app had failed to inherit was **behaviour**: the category nav re-implemented the RTL arrow-key defect P4-05 had just fixed, and 27 shell declarations did not mirror. Both fixed, both ratcheted. **No landing route can render RTL at all**, which is why nothing caught either. |
| TASK-AR-2 | `[x]` | **Nothing Arabic is vendored, because no font is vendored at all** - `git ls-files` returns zero font binaries; the library ships font *names* with system fallbacks. So there is no licence obligation **and no Arabic typeface**. Custody file + 11-check RTL matrix written. Two blockers: the licence audit **cannot see a vendored asset** (a gate must exist before anyone vendors one), and **the Arabic app is not in this checkout**, so its vendored core - AR-2s original subject - cannot be inspected. |

---

## Cross-cutting finding — `yarn validate:all` cannot pass on CI

Found while binding the final numbers, and it belongs to no single packet.

`validate:capability-matrix` resolves its `browser-matrix` cells from
**`test-results/matrix-report.json`** — an uncommitted Playwright artifact
written only by `yarn test:e2e:matrix` with `PLAYWRIGHT_JSON_OUTPUT` set. With
the file absent, every `browser-matrix` cell is `unrun`, and `DzFileUpload` is
Tier D, so the validator fails:

```text
✗ [tier-d] DzFileUpload is Tier D and its `browser-matrix` cell is unrun with no
  artifact (required by tier B). A Tier D gap is a security gap and does not get
  to be an empty cell.
```

**`test:e2e:matrix` appears in no workflow under `.github/workflows/`** — not
`ci.yml`, not the four others — while `ci.yml:143` runs `yarn validate:all`. So
on a clean CI checkout the artifact never exists and this gate is red every
time. It was green locally at the start of this session only because an earlier
local run had left the file behind; running the TASK-SK-2 overlay smokes through
the root Playwright config cleared `test-results/`, which is how it surfaced.

**Locally re-established**, and the run is worth having on its own:
`matrix-chromium-default` + `matrix-chromium-rtl` → **352 passed, 2 skipped**
(8.5 min) — the first recorded run of the full RTL condition across the component
matrix. `yarn validate:all` is **exit 0** again.

That fixes this machine, not CI. Two things an owner has to decide:

1. **Add `test:e2e:matrix` to CI**, or move `validate:capability-matrix` out of
   `validate:all`, or teach the validator to distinguish "the lane did not run"
   from "the lane ran and this cell failed". Today they are the same cell state —
   exactly the distinction the matrix's own note asks for: *"`unrun` — which is
   not the same as 'it ran and failed'."*
2. **A merge gate should not depend on a transient artifact from another lane.**
   Any Playwright run through the root config deletes it. Same class of fragility
   as the five stale generated artifacts in REC-01 §5.3: a derived thing nothing
   keeps current.

---

## TASK-REC-01 — verify and freeze the OSS CI recovery

**Maturity: focused-validated → aggregate-qualified.** Chromium only; no remote
CI evidence; the Lighthouse baseline was deliberately not re-measured.

Full report, with every command output bound to the HEAD it ran on:
`workspace-docs/repos/ui/docs/planning/NEXT_SESSION_PROMPT_2026-08-25-dzup-ui-oss-recovery-freeze.md`

### The question the task asked, answered

*Did the recovery reach `main`?* **Yes.** All seven SHAs
(`62273f9 804cc59 d7b9a1a ff91966 e2b6f90 dab9658 fce7eef`) are commits, and
`git branch -a --contains` puts every one of them in `main`, `origin/main` and
`origin/preserve/local-main-20260817`. `fix/blocks-gallery-ui-ux` no longer
exists on either side. The `--grep` search for squashed equivalents was
therefore unnecessary.

*Is remote `main` green?* **Unknown, and it has to stay unknown.** There is no
fetch authority, so `origin/main` is read as of someone else's last fetch. The
08-10 observation (`1f17c52` red on CLS `0.1378…`) is five commits stale and is
not carried forward in either direction.

### Every accepted number was unbound — and two were wrong

`<rebinding>`'s trigger (a recovery SHA absent from `main`) did not fire. The
numbers were unbound anyway, because the source moved five commits past them.

| Accepted (08-10) | Measured on `e986952` |
|---|---|
| 391 files / 6,569 passed / 1 skipped / 1 todo | **449 files / 8,011 passed / 2 skipped / 1 todo** |
| landing ratchet 88 / 65 / 89 / 89 | **89 / 80 / 91 / 91** — raised by `TASK-FREE3-12`; the task file's copy is stale |
| "the 529-test set" | `apps/landing/src` is **47 files / 2,590 tests**; no current path selection yields 529 |
| Lighthouse CLS desktop `0.0000050537…` / mobile `0` | not re-run, not replaced, not promoted |

### Three defects, all pre-existing on `main`

**1. `@dzup-ui/testing` could not compile — or build.** `packages/testing/src/rtl.ts`
(from `TASK-OSS-P4-05`) imported `type { ComponentRtl }` from
`@dzup-ui/contracts`. The package emits declarations, so its tsconfig sets
`rootDir: "src"`; the inherited `paths` map resolves that specifier to
`packages/contracts/src/index.ts`, pulling another package's source into the
program. Thirteen `TS6059` errors — and `yarn workspace @dzup-ui/testing build`
failed identically, so this was a **broken package build**, not just a red gate.

The file beside it had already written the rule down. `anatomy.ts` explains why
`CheckableAnatomy` is structural: *"a package that emits declarations cannot
import another package's source anyway without breaking its own `rootDir`."*

Underneath sat a second defect: **`@dzup-ui/contracts` is not a dependency of
`@dzup-ui/testing`** in any field. Had the import compiled, the published
`dist/rtl.d.ts` would have named a package no consumer was told to install.

Fixed with `CheckableRtl` — an exported structural interface carrying the one
field the helper reads. A real `ComponentRtl` satisfies it by shape, so nothing
downstream changes: `packages/core/tests/rtl.spec.ts` (10) and the testing suite
(30) pass unedited, the build succeeds, and `dist/rtl.d.ts` no longer names
`@dzup-ui/contracts`.

**2. A test that could never be green in a committed state.**
`ownership-manifest.spec.ts` holds two rules that contradict each other. One
says the validator *"ignores `sourceCommit`, which changes on every unrelated
commit"*. The next compares the serialized manifest to the committed file byte
for byte — and `sourceCommit` is stamped from `git rev-parse HEAD`.

Regenerating cannot fix it: committing the regenerated file moves `HEAD` again,
so the file is stale the moment it lands. It is unsatisfiable by construction,
and it was the single red test in the aggregate run (expected `8d80bc3…`,
received `e986952…`). Now normalized on both sides; everything that is real
drift — entries, `generatedFrom`, schema version, byte format — is still
compared exactly, and the pass proves nothing else had drifted. 35/35.

**3. The last two commits landed without running the generators.** Five derived
artifacts were stale, and they went stale together: `README.md` (catalog claim
206 → **207**), `apps/landing/src/generated/counts.ts` (same, plus `forms`
31 → **32**), `apps/landing/src/generated/releases.ts` (`PENDING` missing
**three** committed changesets), `e2e/at-matrix/index.json` (34 stale
`componentCommit` values) and `packages/core/docs/capability-matrix.json` (48
stale rows). The last two fail their own validators, so **`yarn validate:all`
was red on `main`**; it is green after the refresh. The public README currently
under-counts the catalog by one.

### Gates

| Gate | Result |
|---|---|
| `git diff --check` | clean |
| `yarn lint` (`--max-warnings 0`) | **exit 0** — the 31 `BlocksIndexPage.vue` findings are gone; the file is committed at `e067d82`, not dirty |
| `yarn typecheck:all` | exit 2 → **exit 0** after defect 1 |
| `yarn test:prepare` | exit 0 (and see defect 3) |
| focused vitest `apps/landing/src` | **47 files / 2,590 passed** |
| hero-split browser regression (`block-detail.spec.ts`) | **2/2**, chromium — includes the ≤ 60 px movement and CLS-budget assertion |
| `yarn landing:build` | exit 0, 45.2 s |
| `yarn test:coverage` | first run 1 failed (defect 2); re-run after the fix **449 files / 8,011 passed / 2 skipped / 1 todo, exit 0**. No threshold unmet |
| `yarn validate:all` | red on `main` (defect 3); **exit 0** after regenerating the two stale matrices |

### Promotion groups proposed (nothing staged, stashed or reset)

- **Group A — build/gate repair.** `packages/testing/src/rtl.ts` ·
  `packages/testing/src/index.ts` ·
  `packages/tooling/src/validators/ownership-manifest.spec.ts`. This is what
  stands between `main` and a green `yarn build` / `yarn validate:all`. No
  component and no runtime behaviour; one exported type added.
- **Group B — generated-artifact refresh.** `README.md` ·
  `apps/landing/src/generated/counts.ts` ·
  `apps/landing/src/generated/releases.ts` · `e2e/at-matrix/index.json` ·
  `packages/core/docs/capability-matrix.json` ·
  `apps/storybook/stories/_data/capability.generated.ts`. Pure generator output — and the
  last two are what stood between `main` and a green `yarn validate:all`. It
  moves the public README's headline number, so the owner may want it beside a
  release note.

Requested authority: commit Group A → push → monitor the successor CI run to a
terminal state. Not requested: baseline replacement, publication, threshold
changes.

### Unresolved owner decisions

1. **Nobody knows whether remote CI is green**, and nobody can find out without
   fetch authority. This repository has had no observed remote CI result since
   `1f17c52` went red two weeks ago.
2. **Group B changes a published claim** (206 → 207 components). Refresh alone,
   or beside a release note?
3. **The recovery's Lighthouse baseline is unbound.** Either re-measure it on an
   uncontended machine and accept a new one, or delete the old numbers so
   nothing promotes them by accident.

### Ranked next packet

1. **TASK-SK-1** — its only stop condition ("REC-01 not locally green") is now
   satisfied.
2. Group A promotion, whenever an owner is available; every later packet's
   validation runs through `yarn typecheck:all`.

---

## TASK-SK-1 — explicit shared-kit consumer helper for merged-source vs externalized

**Maturity: implemented → focused-validated → aggregate-qualified.** Not
browser/AT-qualified beyond the builds; not packaged; not released.

### Discovery changed the shape of the task

The task described consumers that "each re-declare workspace aliases to
`packages/*/src`". That was true when it was written and had already been
half-fixed: `TASK-FREE-12` introduced `workspaceAliases(repoRoot)` after finding
that two of five hand-copied maps had lost `@dzup-ui/core/styles`.

So the gap was not duplication-in-general. It was **four** specific things, and
the fourth is the one that matters most:

| Where the logic lived | Entries | What it was missing |
|---|---:|---|
| `packages/tooling/src/workspace-aliases.ts` | 10 | 21 of the declared specifiers |
| `apps/sandbox/vite.config.ts` (hand-rolled) | 7 | `core/ownership`, `testing`, `testing/vitest` |
| root `vitest.config.ts` (hand-rolled) | 8 | `tokens/css`, `/tailwind`, `/utils`, `core/styles`, `testing/vitest` |
| **`@datazup/dzup-theme`'s `dzupAliases`** — *another repository* | 7 | `core/ownership`, `testing`, `testing/vitest` |

`workspace-share/apps/website-app` consumes the third-party copy. So an
application outside this repository has been **compiling the library from
source**, with no mode to state otherwise and nobody having decided it.

### Three things nobody had noticed

1. **`@dzup-ui/core/providers` resolved by accident.** The landing app, the
   sandbox and Core's own source import it. No alias list in any of the four
   copies mentioned it. It worked because the bare `@dzup-ui/core` entry pointed
   at a *directory*, so any path under `packages/core/src` resolved — declared or
   not. `@dzup-ui/core/resolver` was in the same position.
2. **Nothing anywhere set `dedupe`.** `vue` and `reka-ui` are Core's peers, and
   two copies of either is the failure overlays hit first — the exact risk
   `TASK-SK-2` is written to address. Not one consumer guarded against it.
3. **`changeset status` was failing on `main`.** See "Fourth defect" below.

### What was built

`packages/tooling/src/resolution/` — `createDzupResolution({ mode, root?, packages? })`.

- **Mode is required**, with no default. That is the packet's actual argument:
  the current state exists because five configs made the same choice without
  anyone writing it down.
- **The alias list is derived from each package's `exports` map** — the same
  authority `validate:exports` and the ownership manifest use. **31 specifiers**
  where the handwritten list had 10. A new subpath export reaches every consumer
  the moment it is declared.
- `merged-source` rewrites `dist/x.js` → `src/x.ts` and checks the file exists.
  Two labelled escapes: `generated-artifact` (`tokens/css`, `tokens/tailwind` —
  written by `yarn tokens:generate`, no source form) and `override` (**exactly
  one**: `core/styles` → `src/styles/base.css`, because `dist/core.css` is
  Tailwind's output). A spec fails if an override ever becomes derivable, so the
  table cannot grow back into the list it replaced.
- `externalized` never points at `src/` — asserted over every entry — and drops
  private packages, which have no published form. Naming one explicitly throws.
- Ordering is a property of the data: most-specific-first, with a spec asserting
  every subpath precedes the package it extends. `alias` is an **ordered array**,
  not the `Record<string, string>` the prompt suggested, because a record invites
  a re-key that silently reorders it and cannot be spread into the array-shaped
  alias config Storybook already builds.

### Equivalence, proven rather than asserted

`<migration>` asks for no behaviour change. A permanent spec pins all ten
specifiers the old helper carried to the same resolved **module** — including
the two the old list pointed at a directory (`packages/core/src` and
`packages/core/src/index.ts` are the same module reached differently).

The tightening it *does* introduce — an undeclared deep path no longer resolves —
found exactly one caller, below.

### The tightening found a real one

`packages/tooling/src/perf-bench.spec.ts` dynamically imported **18** paths of
the form `@dzup-ui/core/components/data/DzDataGrid.vue` — internal file paths of
another package, dressed as public API. They now import from the declared family
barrels (`@dzup-ui/core/data`, `/overlays`, `/forms`, `/navigation`), which
export every one of the 18 names. The imports sit *outside* the timed region, so
nothing measured changed: 11/11 pass.

**Finding for the owner:** `validate:boundaries` declares `tooling: []` — tooling
may import from no dzup package — *and* forbids deep imports into other packages.
These 18 violated both rules and the validator reported zero violations, because
its regex reads line-by-line and these are multi-line `await import(...)` calls
with the specifier on its own line. The gate that exists to forbid this cannot
see it.

### Fourth defect: the release plan was blocked

`.changeset/the-catalog-says-what-it-owes.md` (from `TASK-OSS-P5-01`) names
`@dzup-ui/tooling` alongside `@dzup-ui/core` and `@dzup-ui/contracts`.
`@dzup-ui/tooling` is on the changesets `ignore` list, and changesets refuses a
changeset that mixes ignored and non-ignored packages:

```text
Found mixed changeset the-catalog-says-what-it-owes
Found ignored packages: @dzup-ui/tooling
Found not ignored packages: @dzup-ui/contracts @dzup-ui/core
Mixed changesets that contain both ignored and not ignored packages are not allowed
```

So `changeset status` — and `changeset version` — **failed outright on `main`**.
No local gate runs it (`validate:changelog` is a different script), which is why
nobody saw it. Removing the `@dzup-ui/tooling` line fixes it; the package is
private and unpublished, so it has no version to bump and no changelog to write,
and naming it was never meaningful. `changeset status` now reports a clean plan.

### No changeset for SK-1, and why

The task asks for "a changeset (minor for tooling)". `@dzup-ui/tooling` is on the
`ignore` list, so a changeset naming it reproduces the exact failure above —
verified by adding one and running `changeset status`. Nothing else SK-1 touched
is publishable: the rest is app configs, a private package's source, and docs.
The one publishable change in the working tree (`@dzup-ui/testing` gaining
`CheckableRtl`, from REC-01 §5.1) is part of the still-unreleased `expectRtl`
feature, which already has a pending changeset.

### Validation

| Gate | Result |
|---|---|
| `yarn typecheck:all` | exit 0 |
| `yarn lint` (`--max-warnings 0`) | exit 0 |
| new spec `packages/tooling/src/resolution` | **24 passed** |
| `yarn validate:boundaries` | 0 violations |
| `yarn validate:exports` | 0 errors — 33 entries, 199 declared exports |
| `yarn validate:externals` | 8 passed, 0 failed, 1 skipped |
| `yarn build` (all packages) | exit 0 |
| `yarn landing:build` | exit 0, 36.5 s |
| `yarn storybook:build` | exit 0 — 23.62 MB, within the 25 MB budget |
| `yarn test` | **450 files / 8,035 passed / 2 skipped / 1 todo**, 0 failed |
| `changeset status` | clean plan (was failing before this packet) |

### Files

| File | Effect |
|---|---|
| `packages/tooling/src/resolution/dzup-resolution.types.ts` | the API, written first |
| `packages/tooling/src/resolution/dzup-resolution.ts` | derivation from `exports`; 31 specifiers |
| `packages/tooling/src/resolution/dzup-resolution.spec.ts` | 24 specs over a real on-disk fixture |
| `packages/tooling/package.json` | new `./resolution` export subpath |
| `packages/tooling/src/workspace-aliases.ts` | **deleted** — superseded |
| `apps/landing/vite.config.ts` · `apps/sandbox/vite.config.ts` · `apps/storybook/.storybook/main.ts` · `apps/storybook/vitest.config.ts` · `vitest.config.ts` | migrated; every one now states its mode |
| `packages/tooling/src/perf-bench.spec.ts` | 18 undeclared deep imports → declared barrels |
| `.changeset/the-catalog-says-what-it-owes.md` | unblocks the release plan |
| `packages/tooling/README.md` · `docs/storybook-decisions.md` · `docs/resolution-external-consumers.md` | docs, including the external-app example and the `dzup-theme` patch proposal |

### Unresolved owner decisions

1. **`@datazup/dzup-theme` is another repository's package.** The patch proposal
   in `docs/resolution-external-consumers.md` turns `dzupAliases` into a
   re-export with an explicit mode and deprecates the mode-less form. Not
   applied — not ours.
2. **Should `website-app` be `externalized`?** It resolves source today. Changing
   it means `yarn build` in `ui/dzup-ui` becomes a prerequisite of that app's
   build. That is the correct trade and it is a workflow change for its owner.
3. **How does `@dzup-ui/tooling` reach an external app?** It is `private: true`.
   A `portal:` entry is the smallest answer; publishing it is the other, and a
   bigger decision.
4. **`validate:boundaries` cannot see dynamic imports.** Widening it will find
   more than the 18 this packet fixed.

### Ranked next packet

1. **TASK-SK-2** — its prerequisite ("SK-1 merged locally") is satisfied, and
   SK-1 hands it the `dedupe` mechanism it needs plus the finding that no
   consumer had one.
2. The `validate:boundaries` blind spot — small, and it protects the rule SK-1
   just enforced by other means.

---

## TASK-SK-2 — rank and migrate overlay consumers; keep overlays testable

**Maturity: implemented → focused-validated → browser-qualified (three engines
for the Storybook lane, chromium for the landing lane).** Not packaged, not
released. One consumer is outside this repository and remains unmigrated by
design.

### The migration was already done — by SK-1

SK-2's `<migration>` step is "switch to the helper (mode stated explicitly)".
Every in-repo overlay consumer was switched in SK-1, because the alias map and
the `dedupe` list come from the same call. So this packet's real work was the
three things SK-1 could not do: **rank**, **assert**, and **report what is still
exposed**.

### Ranking

The table `<ranking>` asks for is in
`oss-recovery-and-shared-kit-tasks.md` under the task, as instructed. Summary:

| Rank | App | Overlay families | Files | Risk before |
|---:|---|---:|---:|---|
| 1 | `apps/landing` | 18 | 69 | high — public site, largest surface |
| 2 | `apps/storybook` | 18 | 15 | high — public docs **and** the test surface everything else trusts |
| 3 | `workspace-share/apps/website-app` | 1 | 1 | **still unmitigated** — another repository |
| 4 | `apps/sandbox` | 14 | 7 | moderate → low; the tree is retired |

### The duplicate-copy risk is real, and nothing was guarding it

`yarn why` on this tree:

| Package | Copies | Second copy from |
|---|---|---|
| `vue` | `3.5.31` **and** `3.5.39` | `@floating-ui/vue@1.1.11`, a **direct dependency of `@dzup-ui/core`** |
| `reka-ui` | `2.9.2` under **two** `@dzup-ui/core` peer contexts | `[5b90a]`, `[66a70]` |
| `vite` | `6.4.1` **and** `7.3.5` | apps declare `^6.1.0`, root and packages `^7` |
| `@vitejs/plugin-vue` | `5.2.4` **and** `6.0.7` | same split |

And **not one config in `ui/dzup-ui` set `resolve.dedupe`** before SK-1 — not
the landing app, not either Storybook config, not the root Vitest config, not
the sandbox.

That matters because `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md`
had already **measured** the failure and the fix seventeen days earlier:
`mount(DzConfirmDialog)` throws `Cannot read properties of null (reading 'ce')`
with two Reka copies, `reka-ui` in `dedupe` fixes it, and deduping `vue` alone
does **not** (pin the single Reka copy and the single Vue follows, not the
reverse). The plan even carried a correction reading *"'No app has `dedupe`' is
wrong"* — which was true of reward-app and false of this library.

SK-1's `dedupe` is derived from `@dzup-ui/core`'s `peerDependencies`, so
`reka-ui` and `vue` are both in it and a future peer joins without an edit.

### What now asserts it

Two Playwright files, checking the two things an open/close test passes straight
through — **one portal root**, and **focus returning to the trigger**:

| Spec | Scope | Result |
|---|---|---|
| `e2e/components/overlay-portals.spec.ts` | Storybook: `DzDialog`, `DzTooltip` | **18/18** — 6 tests × chromium + firefox + webkit |
| `apps/landing/e2e/overlay-portals.spec.ts` | the shipping app: `/blocks/create-dialog`, `/blocks/tooltip-toolbar` | **2/2** chromium |

The existing `e2e/components/overlays.spec.ts` proves overlays open and close
and says nothing about portals or focus — which is exactly why a duplicate copy
could have shipped through it.

The probes are Reka's own `[data-dismissable-layer]` and
`[data-reka-popper-content-wrapper]` counts. They are not a public contract and
are not asserted as one; they are the thing that doubles, which is what makes
them the right probe for this specific failure. The dialog spec also checks that
a closed overlay **tears its layer down** rather than leaving a detached one
holding live Escape and outside-click handlers, and that opening twice does not
accumulate roots.

### The portal-target half needed nothing

`<testability>` says to add the documented `portal` prop where a consumer has no
portal target contract, and explicitly not to invent a second mechanism.
`TASK-OSS-P4-04` had already finished that job: **19** portal consumers, each
resolving instance → provider → `document.body`, with the four hard-coded ones
(`DzBlockUI`, `DzSidebar`, `DzPopconfirm`, `DzTour`) given a `portalTo`. There
was nothing left to add, and adding anything would have been the second
mechanism the task forbids.

### External app: proposal, not edit

`<scope>` says read-only for apps we do not own.
`workspace-share/apps/website-app` reaches `@dzup-ui/*` through
`@datazup/dzup-theme`'s `dzupAliases` — the third hand-copied list, with no mode
and no `dedupe`. It imports one overlay (`DzSelect`), so the surface is small,
but it is **the only consumer still carrying the defect the 2026-08-08 plan
opens with**.

The patch — `dzupAliases` becomes a re-export of `createDzupResolution` with the
mode explicit, and the mode-less form is deprecated — is in
`docs/resolution-external-consumers.md`. Not applied.

### Plan documents updated

`DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md` gained a dated
update: its status line, its SK-1 and SK-2 remaining-plan rows, and a section
recording what was applied, what asserts it, and what is still exposed. Its SK-2
row named `MfaSetupModal`, `TemplatePicker`, `DzFileUploadModal` and
`AppChatDrawerShell` — **those live in reward-app**, not here, and are untouched;
the row now says so rather than reading as unfinished dzup-ui work.

### Validation

| Gate | Result |
|---|---|
| `yarn lint` | exit 0 |
| `yarn typecheck:all` | exit 0 |
| `e2e/components/overlay-portals.spec.ts` | **18/18** across chromium, firefox, webkit |
| `yarn test:e2e:landing` (full suite) | **105/105**, 4.8 min — includes the 2 new smokes |
| Storybook `e2e/components` + `e2e/smoke` (chromium, prebuilt) | **79/79** |
| `yarn storybook:build` | green in SK-1, unchanged here |

### Unresolved owner decisions

1. **`@datazup/dzup-theme` must accept the patch** before `website-app` is
   covered. Until then that app can still hit the `renderSlot`/`ce` mount
   failure.
2. **Which mode `website-app` should be in.** It compiles library source today.
3. **The Vite 6 / Vite 7 split inside this repository.** Three apps on
   `vite@6.4.1` + `@vitejs/plugin-vue@5.2.4`, root and packages on `7.3.5` +
   `6.0.7`. `dedupe` does not address it and a major upgrade is far outside SK-2.
   Recorded so nobody re-derives it.
4. **`apps/sandbox` is retired** yet still carries 14 overlay families and is
   still a workspace. Migrated for consistency; whether it should exist is a
   separate call.
5. **The landing overlay smoke runs on chromium only**, because that is what
   `apps/landing/playwright.config.ts` defines (chromium + mobile-chrome). The
   three-engine evidence comes from the Storybook lane.

### Ranked next packet

1. **TASK-APP-1** — the next in the lane; its prerequisite is SK-2, now closed.
2. The `@datazup/dzup-theme` patch, whenever its owner is available. It is the
   last consumer with the original defect.

---

## TASK-APP-1 — real-component rollout in the apps

**Maturity: implemented → focused-validated → aggregate-qualified (landing
lane).** Full results and the candidate inventory:
`docs/free-apps-review.md` §TASK-APP-1.

### Two of the three slices did not exist as described

**Slice 1, "sandbox pages", is closed by a standing instruction.**
`docs/free-apps-audit.md:165` records `apps/sandbox` as *"LEGACY … not in CI,
superseded by Storybook … **Do not add to it.**"* CI agrees: its parity gate was
replaced by `validate:contract-parity` (TASK-FREE-16), no root script targets
it, it has no e2e config. Rolling components into a tree nobody builds is work
nobody sees. **Not done, deliberately** — and the task file's "lowest risk"
ordering is what pointed at it, not a judgement that it was valuable.

**Slice 2, "Storybook doc blocks", has nothing to roll out.**
`apps/storybook/stories/_blocks/` is **fifteen `.ts` files and zero `.vue`
files** — render functions and data, not markup.

### Slice 3 found that zero components should be swapped

Eight candidate groups, every one **"keep"**, each with a reason in the review
doc. The landing app's remaining hand-rolled controls are brand chrome — a
gradient-haloed retheme pill, a white-on-gradient banner dismiss, pill filter
chips, hue sliders that paint the OKLCH ramp into their own track. Matching them
with a Core component means overriding radius, padding, colour, weight and
sometimes structure at once, which adds indirection and removes nothing.

**That is the finding, not an evasion of the task.** The packet's premise —
*"that UI does not inherit the library's a11y, theming, RTL, and reduced-motion
behaviour"* — is right; it just is not visible in a component swap.

### What the app had actually failed to inherit

**1. The category nav re-introduced a defect the library had just fixed.**
`BlockCategoryNav.onKeydown` hard-coded `ArrowRight` as "next".
`TASK-OSS-P4-05` fixed exactly that in `useTabs` weeks earlier and wrote down
why: in a right-to-left document the *next* tab is to the left, so an Arabic
reader pressing the key pointing at the next tab gets the previous one. The nav
hand-rolls the tab pattern — legitimately, because `useTabs` activates on focus
and activating a category here mounts a stack of live previews — and
re-implemented the bug along with the pattern.

It now reads `useDzDirection()` (ADR-20), the same contract the library's own
components use. New `BlockCategoryNav.spec.ts`: **4 tests** covering both
directions, that the vertical keys do *not* swap, and that Home/End are
direction-independent.

**2. Twenty-seven shell declarations did not mirror.** Physical `left`/`right`,
`margin-left`/`-right`, `padding-left` and `border-left` where the meaning is
flow-relative, across 13 files — nav, banner, category nav, search bar, **both**
command palettes, changelog, templates page, gallery card, skip link. All now
logical. **Identical in LTR**, and the light and dark hero visual snapshots pass
untouched, which is the parity proof `<rollout>` asks for.

24 physical declarations remain, every one justified in the new
`src/shellDirection.spec.ts`: centring (`left: 50%` + `translateX(-50%)`),
decorative composition (aurora blobs, beam anchors — the library's own
`mirrors: 'none'` case), and JavaScript-driven geometry (a drag handle and a
sliding indicator positioned from `getBoundingClientRect`, where logical CSS and
physical maths would disagree). The spec is a **three-way ratchet**: no
unjustified declaration, no *stale* justification, and a count ceiling.

**3. Nothing could have caught either, and this is the real finding.**
`e2e/block-responsive.spec.ts` certifies 88 block previews in both directions —
through `/blocks/preview/<id>?dir=rtl`. `document.documentElement.setAttribute('dir', …)`
is called in exactly **two** places in the entire app: `BlockPreviewPage.vue` and
`templates/previewCustomiser.ts`.

**No ordinary landing route can render right-to-left.** The app certifies RTL
for the content it *documents* and never for the chrome it *is*. That is why a
reversed arrow key and 27 physical declarations sat there unnoticed while the
library was being made RTL-correct one floor down.

### 4. Running the gate four times found it flaky

`e2e/block-responsive.spec.ts` asserts `<html dir>` after a
`domcontentloaded` navigation, with Playwright's default 5 s expect timeout —
but `dir` is written by the page's `onMounted`, so the assertion waits on
**hydration**. Four full landing runs: **105/105, 105/105, 102/105, 105/105**.
The failure was the run launched immediately after `yarn landing:build`; three
of 88 blocks reported `dir` absent after 14 polls, and the spec then passed
88/88 in isolation twice.

CI runs build and test back to back, which is exactly that case. The timeout is
now 20 s on that one assertion — the containment checks around it keep the
default, so a block that genuinely fails to render still fails fast. Re-run in
the same build-then-test shape: **105/105**. Not an APP-1 regression; the spec
is untouched by this packet.

### One more instance of the SK-1 tightening working

The first draft of `BlockCategoryNav.spec.ts` imported
`@dzup-ui/core/providers/DzProvider.vue` — an undeclared deep path. Under the old
directory alias it would have resolved silently; it now fails, and the spec
imports `{ DzProvider }` from the declared `@dzup-ui/core/providers` subpath
instead.

### Validation

| Gate | Result |
|---|---|
| `yarn lint` (`--max-warnings 0`) | exit 0 |
| `yarn typecheck:all` | exit 0 |
| `vitest run apps/landing/src` | **49 files / 2,597 passed** (was 47 / 2,590) |
| `yarn landing:build` | exit 0 |
| `yarn test:e2e:landing` | **105/105** in four of five runs — see finding 4 — including the light and dark hero visual snapshots |
| `yarn test:responsive:landing` | **88/88** across `dir=ltr` and `dir=rtl`, twice |
| `yarn validate:bundle-budget` | 2 passed, 0 failed |

### Unresolved owner decisions

1. **Core has no tone for a brand surface.** `CanonicalTone` is
   `neutral | primary | success | warning | danger | info`, all resolved against
   `--dz-foreground` / `--dz-muted` / surface tokens. A control on a gradient or a
   photo has nothing to ask for, so every app hand-rolls one. This is the single
   reason the two clearest replacement candidates were rejected. A new tone is an
   unadmitted feature — `<stop_conditions>` says so — but it is the thing standing
   between the apps and real adoption.
2. **`DzButton`'s `ui` surface is `root` + `spinner`.** Honest (its anatomy says
   so) but it makes "the same button, pill-shaped, muted" five overrides on one
   part.
3. **The landing needs a direction control** — a toolbar, a query parameter, or a
   locale — before the responsive certification can cover the chrome as well as
   the blocks. Product decision.
4. **`apps/sandbox`**: still a workspace, still has a `deploy/sandbox/coolify.json`,
   still carries 14 overlay families, and the audit says do not add to it.
   Somebody should decide whether it exists.

### Ranked next packet

1. **TASK-AR-2** — the last packet in this lane, independently gated. Its RTL
   verification matrix now has a concrete precedent to point at: the shell
   direction ratchet, and the fact that no app route can render RTL.
2. **A brand/inverse tone for Core.** Decision 1 above; it is what unblocks a
   real component rollout in the free apps.

---

## TASK-AR-2 — Arabic vendor custody gate and RTL verification matrix

**Maturity: implemented (evidence only).** This packet writes one document and
changes no source, which is what it was asked to do.

**Complete, not blocked.** All three success criteria are met and **none of the
three stop conditions fired**: nobody asked for a vendoring without evidence, no
deployment-context inventory needed regenerating (there is none here), and no
proprietary font is bundled — no font is bundled at all. What is blocked is
**vendoring**, which this task explicitly excludes: *"This task produces EVIDENCE
and a verification matrix; it vendors nothing."* The gate is now built; walking
through it is decision 1 below.

Full evidence file: `docs/rtl/arabic-vendor-custody.md`.

### The inventory is empty, and why that is the finding

The task expected fonts, locale datasets and shaping helpers to inventory and
licence. There are none — and "none found" understates it:

**`git ls-files` returns zero font binaries.** No `.woff`, `.woff2`, `.ttf` or
`.otf` is tracked anywhere. The only font files on disk are Nunito Sans under
`storybook-static/` and `apps/landing/dist/storybook/` — Storybook's own
`sb-common-assets` build output, untracked, regenerated by every build, never in
a published tarball.

**The library ships font *names*, not font *files*.** Every typography token is
a CSS family stack (`'Inter', ui-sans-serif, system-ui, …`; the ThemeRecipe
`geist` / `rounded` / `serif` variants likewise). No `@font-face`, no
`fonts.googleapis`, no `fonts.gstatic`, nothing bundled — verified by grep across
`packages/tokens/src`, `apps/landing` and `apps/storybook`.

Same for the rest of the expected inventory: **no vendored CLDR** (native `Intl`,
cached in `packages/core/src/i18n/intl-cache.ts`), **no bidi or shaping helper**
(delegated to the user agent), and the RTL language list is 14 BCP-47 tags of our
own code in `useDzLocale.ts`.

**So there is no font licence obligation — and there is also no Arabic
typeface.** Those are two halves of one fact, and the second half is decision 1.

### What the licence gate does and does not see

`yarn validate:licenses` scans production dependencies of core and pro from
`package.json`: **9 allowed, 0 blocked, 0 unknown**. It covers the three
Arabic-relevant packages — `@internationalized/date` (**Apache-2.0**, calendar
maths incl. Islamic calendars), `lucide-vue-next` (**ISC**, the source of every
direction-bearing icon) and `reka-ui` (**MIT**).

It **cannot see a vendored asset**: a font committed under `packages/` has no
`package.json` and would pass silently. Not a defect today; it is precisely the
gap that opens the moment anyone acts on decision 1, which is why the evidence
file makes a new gate a prerequisite of vendoring rather than a follow-up.

### The matrix

Eleven checks, each bound to where it actually runs, rather than a description
someone has to re-derive. Status today:

- **Enforced:** the source-level physical-utility lint and the
  generated-matrix-matches-declarations check (`yarn validate:rtl`); the
  hardcoded-string gate; the 88-block × `ltr`/`rtl` responsive certification;
  the inline-axis keyboard rule where a component declares it.
- **Available but unwired:** `expectRtlComputed` — the half of the contract that
  needs real layout. It throws under jsdom rather than passing vacuously, and it
  is **not in any Playwright project**, so that half is currently unasserted.
- **Not asserted at all:** icon mirroring beyond `DzSelect`'s declared
  `indicator`; and the `ar` vs `ar-u-nu-latn` numbering system, where the two
  render different digits and nothing proves the library honours the choice.
- **Cannot run:** the app **shell** under `dir="rtl"` — see below.

**Coverage: 8 of 144 public components declare an RTL contract**, because only 8
declare an anatomy. The generated matrix already says this in its own words —
*"the rest are silent, not compliant"* — and both rollouts are one rollout.

### The gap the matrix makes unavoidable

`document.documentElement.setAttribute('dir', …)` appears in **two files** in
the whole landing app: `BlockPreviewPage.vue` and `templates/previewCustomiser.ts`.
No ordinary route can render right-to-left. The app certifies RTL for the content
it *documents* and never for the chrome it *is* — the same finding `TASK-APP-1`
arrived at from the other direction, which is why 27 non-mirroring declarations
and a reversed arrow key survived in the shell.

### Two custody facts, one of them blocking

**There is no Arabic Language app in this checkout.** `workspace-share/apps/`
holds nine apps and none is it, so the ledger's "do not regenerate the
deployment-context inventory" instruction never fires — there is nothing here to
regenerate.

**The Arabic app's vendored core cannot be inspected from here.** The 08-08 plan
records *"Arabic's vendored core is a standalone/deployment fallback"* and asks
AR-2 to *"refresh Arabic vendor artifacts only from a canonical built release"*.
Those artifacts live in that app. **This is the one part of AR-2 that is blocked
on custody rather than on a decision**, and it is the part the 08-10 lane meant
by "Arabic vendor custody".

### Validation

| Gate | Result |
|---|---|
| `yarn validate:licenses` | **9 allowed, 0 blocked, 0 unknown** |
| `yarn validate:rtl` | pass — declarations and generated matrix agree |
| `yarn lint` | exit 0 |
| source changed | **none** — one document |

### Unresolved owner decisions

1. **There is no Arabic typeface, and nothing says so.** Arabic text renders in
   whatever the user agent substitutes — no line-height, numeral style or weight
   guarantee from us. Three branches: *say so* (recommended, costs nothing);
   *name* an Arabic family in the stack (still vendors nothing, helps only users
   who have it); or *vendor* one — the only branch with a licence question. SIL
   OFL fonts are shippable **with** obligations (attribution, reserved font name,
   OFL derivatives), and the audit cannot see a vendored file, so **a gate must
   exist before anything is vendored**.
2. **Wire `expectRtlComputed` into a Playwright project.** The cheapest real
   increase in RTL evidence available — the helper is written and deliberately
   refuses to pass under jsdom.
3. **Give the landing a direction control** so the certification can cover the
   shell, not only the blocks.
4. **Assert `ar` vs `ar-u-nu-latn` numerals.**
5. **The Arabic app's vendored core** needs a checkout before AR-2's original
   subject can be closed.

### Ranked next packet

1. **Decision 1a — write down that Arabic typography is the host's
   responsibility.** One paragraph in the theming docs, no licence exposure, and
   it closes the gap between "we support RTL" and what the token stack delivers.
2. **Decision 2 — `expectRtlComputed` in a Playwright project.** Turns an
   unasserted half of the RTL contract into evidence.
3. The lane's own successor work is the promotion request from `TASK-REC-01`;
   every packet here is locally qualified and none is committed.

---

## Lane closeout — 2026-08-25

Every packet ran synchronously, in the order the task file prescribes. Nothing
is committed, pushed, dispatched to CI, or published.

### Final aggregate state

| Gate | Result |
|---|---|
| `yarn lint` (`--max-warnings 0`) | exit 0 |
| `yarn typecheck:all` | exit 0 |
| `yarn build` (all packages) | exit 0 |
| `yarn test` | **452 files / 8,042 passed / 2 skipped / 1 todo** |
| `yarn test:coverage` | 449 files / 8,011 passed; no threshold unmet |
| `yarn validate:all` | **exit 0** — see the cross-cutting finding above for what it took |
| `yarn landing:build` · `yarn storybook:build` | exit 0 · 23.62 MB within the 25 MB budget |
| `yarn test:e2e:landing` | 105/105 |
| `yarn test:responsive:landing` | 88/88 across `ltr`/`rtl` |
| Storybook `e2e/components` + `e2e/smoke` | 79/79 |
| `e2e/components/overlay-portals.spec.ts` | 18/18 across chromium, firefox, webkit |
| `e2e/matrix` chromium default + rtl | 352 passed, 2 skipped |
| `changeset status` | clean plan |

Where it started: `yarn typecheck:all` red, `@dzup-ui/testing` unbuildable,
one unsatisfiable test, `changeset status` failing, and five stale generated
artifacts.

### Six defects found, all pre-existing on `main`

1. `@dzup-ui/testing` could not compile **or build** — `rtl.ts` imported
   another package's source across its own `rootDir`, and `@dzup-ui/contracts`
   was not even a declared dependency (REC-01 §5.1).
2. A test that could never be green in a committed state — byte-comparing a
   manifest whose `sourceCommit` is stamped from `HEAD` (REC-01 §5.2).
3. Five generated artifacts stale from the last two commits; two of them fail
   their own validators, so `yarn validate:all` was red (REC-01 §5.3).
4. `changeset status` failing outright — a changeset mixing an ignored package
   with two published ones. The release plan was blocked (SK-1).
5. `validate:boundaries` cannot see multi-line dynamic imports, so 18
   double-violations went unreported (SK-1).
6. `validate:all` depends on a transient artifact from a lane CI never runs
   (cross-cutting finding above).

### What each packet actually turned out to be

- **REC-01** — the recovery had reached `main` **and** `origin/main`; every
  accepted number was stale; three defects fixed; promotion request written with
  two file groups.
- **SK-1** — the helper existed **three times**, once in another repository, and
  none of the copies had a mode. Now one derivation from `exports`: 10
  handwritten entries → 31 derived.
- **SK-2** — the migration was already done by SK-1, so the work was ranking,
  asserting and reporting. Two Playwright files now assert one portal root and
  focus return.
- **APP-1** — zero components were worth swapping, and that is the finding. What
  the app had failed to inherit was **behaviour**: a reversed arrow key and 27
  non-mirroring declarations.
- **AR-2** — nothing Arabic is vendored because **no font is vendored at all**,
  so there is no licence obligation and no Arabic typeface. Blocked on two
  custody facts, not on engineering.

### The one thing every packet needs and none of them has

An owner decision on the **promotion request** (REC-01 §6). Group A is three
files and is what stands between `main` and a green `yarn build`. Nothing in
this lane is committed, and remote CI has had no observed result since
`1f17c52` went red.
