# TASK-R2-O5 — WCAG 2.5.7, the two missing WCAG lanes, and the Baseline statement

> Handoff for [`../evidence-completion-tasks.md`](../evidence-completion-tasks.md)
> §TASK-R2-O5. Program [`../README.md`](../README.md); protocol §4; conventions §5.
>
> **Repo / commit observed:** `ui/dzup-ui` `main` @ **`2d51eec`**, worktree
> **dirty** with TASK-R2-O2's, R2-O3's and R2-O4's ~260 uncommitted paths, every
> one of them preserved untouched. Every number below is bound to `2d51eec` +
> that dirty tree and is **locally qualified** — not CI, not release, not
> production evidence.
> **Started / ended:** 2026-09-18. Nothing committed, pushed, dispatched or
> published.
>
> **SUPERSEDED STATUS — see the 2026-09-19 section below.** Everything in §§0–8
> is the record as it stood on 2026-09-18 and is left exactly as it was written. The task **ended `[x]` on 2026-09-19**, after the owner took D117, D118 and D121.
>
> **Ended `[!]` on 2026-09-18** — the SC 2.5.7 affordance is an owner *design* decision and the
> task's own `<stop_conditions>` says to stop at the proposal. Everything that
> does not depend on that pick was built, measured and validated; the decision
> sheet is [`./TASK-R2-O5-2-5-7-decision.md`](./TASK-R2-O5-2-5-7-decision.md).

---

## 0. `<done_check>` result — 0 of 4 passed, and 2 of the 4 are defective

| # | Check | Result at `2d51eec` |
|---|---|---|
| 1 | `node -e "…wcag-deviations.json…filter(x=>x.criterion==='2.5.7'&&x.state==='open').length"` → 0 | **throws** — `TypeError: d.filter is not a function`, exit 1 |
| 2 | `grep -c "text-200\|spacing" e2e/matrix/conditions.spec.ts` → ≥ 2 | **0** — neither condition existed |
| 3 | `ls docs/program-2026-09-04/reports/ \| grep -i '3-3-8\|auth-paste'` | **empty** — no audit |
| 4 | `ls browserslist .browserslistrc \|\| grep -n 'target' packages/core/vite.config.*` | **prints two lines**, both prose |

Protocol §4.2 "none pass" → run the task. Two of them needed intent-reading
rather than execution, and the standing warning about this program's done-checks
was justified again:

**Check 1 cannot pass, and could not have failed honestly either.** The JSON root
is an **object**, not an array, so `.filter` throws. Had the file been an array,
the predicate would still have been wrong twice over: `criterion` is an object
(`{id: '2.5.7', …}`), never the string `'2.5.7'`, and the state vocabulary is
`'met' | 'gap'` — **there is no `'open'`**. A literal reading of the *intended*
shape therefore returns `0`, which the check treats as "done", while three
surfaces sit open. This is the D116/D108 failure mode — a check that passes for
the wrong reason — in its most dangerous form, and it is raised as **D122**.
Evaluated by intent: `openGaps: 3`, three surfaces in `state: 'gap'` → **not
done**.

**Check 4 passes for the wrong reason by construction.** `grep -n 'target'
packages/core/vite.config.* | head -1` matches this, twice:

```
 * copied verbatim to `dist/i18n/locales/`, the target of the
```

— English prose in a doc comment. A fresh agent piping that into `head -1` sees a
line and concludes a build target is declared. Nothing in the repository declares
one. That specific false positive is why the browser floor is now read by a
**typed probe** (§2.3) instead of a grep, and the probe has a unit test that
feeds it exactly those comment lines.

---

## 1. What was measured before anything was edited

| Read | Finding |
|---|---|
| `packages/core/docs/wcag-deviations.json` | 9 drag surfaces, `openGaps: 3`, `ceiling: 3`; gaps are `DzResizable`, `DzSplitter`, `DzTable`. `recordedAt.sourceCommit` is `51dec93` — the audit has never been re-bound to a newer tree |
| `docs/program-2026-09/reports/N1-O3-wcag-fixes-handoff.md` §6.3–6.5, §7.1–7.4 | The audit was a **source reading**; the follow-up is explicitly an affordance decision. §7 numbers **eight** geometry changes (V1–V8), not six, and says in §7.1 that "before" is a *stylesheet neutralisation*, not a screenshot |
| `packages/tooling/src/docs/evidence.ts` `crossCheckWcagDeviations` | Four clauses gate the deviation record: audited set == the `drags` trait set, `openGaps` == count of `gap`, `gaps ≤ ceiling`, and `gap ⇔ singlePointerNoDrag === null`. A fabricated flip is impossible, which is why the record could be extended safely |
| `playwright.config.ts` + `e2e/matrix/fixtures.ts` | Six conditions, three engines, 88 runnable targets. `rtl` is already the precedent for a condition an engine cannot express as a context option |
| `packages/tooling/src/docs/statements.ts` | The browser-support statement is a **constant string array** with no artifact behind it (N2-D2 finding F-2) |
| `node_modules/reka-ui/dist/PinInput/PinInputInput.js` | `autocomplete: isOtpMode.value ? 'one-time-code' : 'false'` — and `DzOtpInput` never passed `otp` |

---

## 2. Implemented files and API effect

### 2.1 Two new matrix conditions — SC 1.4.4 and SC 1.4.12 (the lanes the matrix could not measure)

| File | Change |
|---|---|
| `playwright.config.ts` | `MATRIX_CONDITIONS` **6 → 8** (`text-200`, `spacing`), so the lane is **24 projects**, not 18. `conditionUse` returns no context option for either, with the reason written at the case. `CONDITION_ONLY_SPECS` replaces the one-off `testIgnore` ternary, so a spec can belong to exactly one condition without every future spec re-deriving the pattern |
| `e2e/matrix/fixtures.ts` | **+ `CONDITION_STYLESHEET`** (the criteria's own numbers), **+ `applyConditionStyles`** (called from `openTarget`, so a condition arrives by opening a story, like the `rtl` global), **+ `withConditionSuspended`** (toggles `CSSStyleSheet.disabled` on the injected sheet) |
| `e2e/matrix/conditions.spec.ts` | **+ two `case` arms**, each asserting the *mechanism engaged* before it asserts anything about the component, **+ `measureVerticalClipping`**, **+ `expectNoNewClipping`** |

**Why a stylesheet and not a context option.** Neither criterion is emulation an
engine exposes. SC 1.4.4 is the user raising the browser's **default font size**
(the root em doubles; the viewport does not change), and SC 1.4.12 is the WAI's
own text-spacing override sheet. Playwright has no user-stylesheet channel, so
the sheet is injected — and because that is a thing that can silently stop
working, each cell asserts it took effect (`documentElement` font-size ≥ 24 px;
letter-spacing ≥ 0.11 em and line-height ≥ 1.49) before it measures the
component. A condition that failed to apply now fails the cell instead of passing
88 of them for nothing. `zoom-400` is **not** a substitute: it measures SC 1.4.10
Reflow at 320 CSS px, which is the viewport axis of a different criterion.

**What the cells assert, and what they deliberately do not.** The failure both
criteria actually produce is **text clipped by a box whose height the author
fixed**, so the assertion is: no box inside the canvas *newly* clips its content
vertically. Three deliberate narrowings, each with its reason in the source:

- **Differential, not absolute** — the same render is measured twice, with the
  condition's sheet enabled and disabled (`withConditionSuspended`). A box that
  already clips at the default font size is some other defect; attributing it to
  SC 1.4.4 would have made this lane's first run a list of 88 pre-existing design
  decisions nobody could act on.
- **Vertical only** — a horizontally clipping box is usually a carousel viewport,
  a scroller or an `ellipsis` label: designed truncation with the content still
  reachable. Including that axis would report every data table in the catalogue.
- **`overflow: hidden|clip` only, never a zero-height box** — `auto`/`scroll`
  keeps the content reachable, and a collapsed accordion panel is
  `height: 0; overflow: hidden` holding its full content, which is a disclosure
  pattern and not a clip.

### 2.2 A browser lane for SC 2.5.7 — `e2e/matrix/non-drag.spec.ts` (new)

The audit that publishes "SC 2.5.7 is met for 6 of 9 drag surfaces" had **never
been put to a browser** — every verdict in it is a source reading, and N2-D2's
finding F-3 recorded that the only generated signal nearby
(`non-drag-alternative`) measures a *keyboard* path, which is SC 2.1.1, and
disagrees with the audit on four of the nine surfaces.

The new spec presses each of the nine with a **single pointer and no drag**
(`page.mouse.click` — never `down … move … up`) and reads the value the drag
itself changes: slider `aria-valuenow`, the order of a list, panel widths, a
`filechooser` event. It runs on all three engines, under the `default` condition
only.

**Its assertion is the record itself**: `expect(achieved).toBe(surface.state ===
'met')`. A surface published as met must prove it in every engine or the
published statement is overstating; a surface published as a gap must still be a
gap, or the record is stale. The day the affordance lands, this lane goes red and
the only way to green is to flip that surface in `wcag-deviations.json` — where
`crossCheckWcagDeviations` then forces `openGaps` and `ceiling` down together.
The record and the browser can no longer disagree silently, which is exactly what
a hand-maintained JSON file otherwise does.

`packages/core/docs/wcag-deviations.json` gains a **`verifiedInBrowser`** block
(lane, engines, date, commit, admissibility) and `/evidence/accessibility`
renders it — or, when it is absent, prints *"No browser has been asked to confirm
this audit; every verdict above is a source reading."*

### 2.3 The browser-support floor is now a probe, not a sentence

| File | Change |
|---|---|
| `packages/tooling/src/docs/browser-target.ts` **(new)** | `probeBrowserTarget` (fixed name list, repo root + each workspace package, sorted, no tree walk) · `classifyBrowserTargetSources` (pure, so the rules are testable without a fixture tree) · `buildTargetIn` (matches `target:` as an object **key**, which is what separates a declaration from the word "target" in a sentence) |
| `packages/tooling/src/docs/evidence.ts` · `read-evidence.ts` | `EvidenceSources.browserTarget`, filled beside `cascadeLayers` — the existing precedent for a source probe feeding a statement page |
| `packages/tooling/src/docs/statements.ts` | `position` no longer asserts the absence in prose; **+ `baselineDeclared`**, the statement rendered the moment the tree declares a floor |
| `packages/tooling/src/docs/evidence-pages.ts` | `renderBrowserFloor` picks the authored block by what the probe found, prints each declaration with the file it came from, lists **what was searched** in a `::: details`, and prints `compilerOptions.target` values **separately and labelled** — a syntax level for `tsc`, not a browser claim, on packages Vite builds |

Measured now: **0 declarations**, 34 files scanned, 3 `compilerOptions.target`
values (`ESNext`, `ES2022`). The page still says the floor is undecided, which is
still true — but it now says so because a probe found nothing, and the day an
owner adds a `browserslist` key the published statement changes with it. That is
the executable half of N2-D2's owner decision D2-D1, carried here as **D118**
with the exact diff.

### 2.4 SC 3.3.8 Accessible Authentication — audited, and two defects fixed

| Component | Paste allowed | No cognitive test | Mechanism (autofill / password manager) | Verdict |
|---|---|---|---|---|
| `DzOtpInput` | **yes** — Reka's `handlePaste` splits a pasted code across the cells on every engine, and nothing in Core intercepts it | **yes** — the code is transcribed, never solved | **was: no.** Reka emits `autocomplete="one-time-code"` only behind its `otp` flag and `DzOtpInput` never passed it, so every cell rendered `autocomplete="false"` and the platform did not offer the code it had just received by SMS | **gap → met** |
| `DzPasswordInput` | **yes** — no `@paste` handler exists anywhere in the component | **yes** | **partial.** `autocomplete="current-password"` was a hard-coded literal, and `inheritAttrs: false` sends a consumer's `autocomplete` to the wrapper `<div>` where nothing reads it — so a registration form could not say `new-password` at all. The reveal control, the other recognised support technique, carried `tabindex="-1"`, so no key could reach it | **partial → met** |

Implemented: `DzOtpInput.otp` (new prop, default `true`) forwarded to
`PinInputRoot`; `DzPasswordInput.autocomplete` (new prop, default
`current-password`) bound on the `<input>`; the toggle's `tabindex="-1"` removed;
its label moved off two English literals into `DzPasswordInput.showPassword` /
`hidePassword` (catalog 110 → 112 keys, packs regenerated). **+4 unit tests**,
each of which fails on the old code. `minor` changeset written.

### 2.5 The N1-O3 geometry changes, re-measured and photographed

The prompt says before/after screenshots exist; they do not — N1-O3 §7.1 says
"before" was a stylesheet neutralisation producing *numbers*. So they were
captured, by the same technique, on the current tree: **10 before/after pairs and
2 current-state images** in [`./assets/TASK-R2-O5/`](./assets/TASK-R2-O5/), with
[`geometry.json`](./assets/TASK-R2-O5/geometry.json).

**Every one of the eight changes reproduces N1-O3 §7.2 to the hundredth of a
pixel** three weeks and several commits later — `218.02 → 226.02`,
`278.7 × 101 → × 104`, `282.42 × 104 → × 110`, `151.25 × 158 → × 176` — and
`DzResizable` / `DzSplitter` render **byte-identical** PNGs with and without the
neutraliser, which is V4's claim ("nothing visible changes") verified rather than
repeated. The review sheet is
[`./TASK-R2-O5-geometry-review.md`](./TASK-R2-O5-geometry-review.md) (**D121**);
it also reconciles the prompt's "six" with N1-O3's eight — six move pixels, V4
and V7 do not.

### 2.6 Artifacts and generators

| File | Change |
|---|---|
| `packages/core/docs/wcag-deviations.json` | **+ `verifiedInBrowser`** — lane, three engine versions, date, commit, admissibility, and the two probe defects found on the way. `openGaps` and `ceiling` **unchanged at 3**: this task measured the record, it did not close it |
| `e2e/matrix/engine-ratchets.json` | each engine's `conditionsRun` **6 → 8**, **+ `additionalRuns`** (a second sweep with its own commit, counts, wall clock and exit code), **+ `conditionsAdded`**. The 2026-08-31 numbers are left exactly as measured — the two sweeps are two rows, never one average |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `MATRIX_CONDITIONS` 6 → 8 and every printed `/6` **derived** from that list. It was spelled by hand in two places, so a lane with eight conditions would have published "6/6 conditions" |
| `packages/tooling/src/docs/evidence.ts` · `evidence-pages.ts` | `EngineRunSummary` / `EngineAdditionalRun` types; one table row per **sweep**; the "conditions added after that sweep" sentence; `WcagDeviations.verifiedInBrowser` rendered — and its absence rendered too, as *"No browser has been asked to confirm this audit"* |
| `packages/core/docs/component-meta.json` · `llms{,-full}.txt` · `capability-matrix.json` · 153 docs pages · 6 evidence pages · `nav.json` · playground seeds | Regenerated in the mandated order (component-meta → capability → llms → docs-pages). `props 1821/1821 described` — the two new props carry their own prose, so the description ratchets stayed closed |

---

## 3. Focused validation (read directly, never through a pipe)

| Command | Result |
|---|---|
| `vitest run …/DzPasswordInput …/DzOtpInput` | **44 passed**, exit 0 (was 40; the 4 new ones each fail on the old code) |
| `yarn test packages/core/src/components/layout packages/core/src/components/data` (the prompt's own focused lane — the three resize surfaces' families) | **979 passed, 74 files**, exit 0 |
| `vitest run packages/tooling/src/docs/evidence.spec.ts` | **53 passed**, exit 0 (+5: the probe's rules, the real-repository reading, and both branches of the floor section) |
| `playwright … --project=matrix-chromium-text-200 --project=matrix-chromium-spacing --project=matrix-firefox-* --project=matrix-webkit-*` | **1056 passed, 6 skipped, 18.3m** — every cell of both new conditions on all three engines. Exit **1** for a non-test reason, characterised below |
| `playwright … --project=matrix-webkit-spacing` (alone) | **176 passed, 1 skipped, 2.3m, exit 0** |
| `playwright e2e/matrix/non-drag.spec.ts --project=matrix-{chromium,firefox,webkit}-default` | **27 passed, exit 0** — 9 surfaces × 3 engines, each agreeing with the published record |
| `yarn typecheck` | exit **0** |
| `yarn lint` | exit **0** |
| `eslint e2e/` | **9 errors — the pre-existing 9**, none in the files this task added (the new spec's 3 were fixed before the run) |
| `yarn validate:docs-pages` | exit **0** — 144 component pages + 6 evidence pages + nav + seeds fresh |
| `npx tsx packages/tooling/src/validators/capability-matrix.ts` | exit **1**, **1 violation** — `DzFileUpload` Tier-D `browser-matrix` unrun. **Identical to the baseline**, owned by TASK-R2-O1 |

### 3.1 The lane was proven against a seeded failure before its green run was believed

A clipping detector that cannot detect is a lane that passes 88 components for
nothing, so it was tested the way `FORCED_MOTION_PREFERENCE` was:

1. **The condition at 400 %** (double the criterion): **14/14 still passed**. Not
   a defect in the detector — the catalogue is `rem`-based end to end, tokens
   included, so the whole UI scales with the root em instead of overflowing a box
   sized in `px`. That is the actual finding of this lane, and it is worth
   stating plainly: **SC 1.4.4 passes because of how the token layer is built**,
   not because the assertion is weak.
2. **A seeded clip** — the condition's own stylesheet extended with
   `p, span, td { max-block-size: 6px; overflow: hidden }` — produced **4 failures
   in the same 7-component slice** (`DzCard`, `DzChip`, `DzTag`, `DzTagsInput`),
   each naming the box, its content height and its client height. The detector
   fires. (`DzTable` survived the seed because `max-height` does not apply to a
   `display: table-cell`, which is a CSS rule, not a miss.)

Both runs were reverted; the committed stylesheet is the criterion's own
numbers.

### 3.2 Two probe defects found and fixed before any verdict was trusted

Recorded because both are the kind of mistake that would have published a false
accessibility failure:

- **Pressing `[role="slider"]` presses the thumb.** In Reka the slider role is on
  the *thumb*, and SC 2.5.7's question is whether a press somewhere **other than**
  the thumb sets the value. The first run reported `DzSlider`, `DzRangeSlider` and
  `DzImageComparison` as failing a criterion they meet. The probes now press
  `[data-part="control"]` (the track) and, for the image comparison,
  `[data-part="root"]` (the image).
- **Probing before `play()` has run measures an unmounted component.**
  `DzImageComparison`'s story focuses the grip and presses ArrowRight in `play`;
  a press landing before that measured a component whose pointer handlers were
  not attached. Verified by hand against the built Storybook: the same press on a
  settled page moves the divider from **51 to 20**. The lane now waits for
  `storyCompleted` — the existing fixture, written for exactly this.

---

## 4. Aggregate qualification

| Lane | Result at `2d51eec` + this tree | Pre-existing or new |
|---|---|---|
| `yarn validate:all` (43 links, run end-to-end, exit read directly) | **exit 1 at link 20, `validate:capability-matrix`**, 1 violation: `DzFileUpload` is Tier D and its `browser-matrix` cell is unrun with no artifact | **pre-existing** — the same link, the same single violation, as the baseline this task started from. Owned by TASK-R2-O1 |
| the 19 links before it | all **✓** — including `hardcoded-strings`, `i18n-packs`, `security-corpus`, `anatomy-parts`, `quality-tiers`, `story-dod`, `at-scripts`, `at-matrix` | — |
| the 24 links after it, each run individually | **all exit 0** (`visual-baselines`, `tokens`, `tokens:refs`, `tokens:dtcg`, `tokens:schema`, `exports`, `ownership`, `mcp`, `component-meta`, `provider-defaults`, `llms`, `docs-pages`, `playground-parity`, `package-names`, `doc-snippets`, `engines`, `adr-references`, `readme-facts`, `externals`, `dts`, `changelog`, `release-policy`, `peers`, `licenses`) | — |
| `yarn test` | **10,170 passed / 3 failed / 10,177**, exit 1 | 3 inherited by name: `landing-token-fallbacks`, `story-dod-tiers countOpen`, `dzup-resolution` snapshot |
| `yarn storybook:test` | **1,451 passed / 2 failed (1,453)**, exit 1 | the same two async-options stories by name, unchanged since R2-O3 |
| `yarn typecheck` · `yarn lint` | **0** · **0** | — |
| `packages/tooling` `tsc` | **15** | **0 are mine.** 12 are R2-O4's measured baseline and 3 are R2-O2's (`evidence.spec.ts` AT fixture rows now owe a `task` field). `browser-target.ts` reports none |
| `eslint e2e/` | **9 errors, 2 files** (`e2e/smoke/storybook.spec.ts`, `e2e/utils/storybook.ts`) | pre-existing. The new spec introduced 3 and they were fixed before the lane ran. (R2-O4 recorded 147 for this command, counting generated `at-matrix/*.md`; this invocation reports the `.ts` files only, which is the README's 9) |

**The one red this task caused, and closed.** The first `yarn test` run carried a
**fourth** failure — `packages/core/security/inline-style-inventory.spec.ts`,
*"the artifact and the source agree, site for site"*. It was mine and it was
exactly right: adding a prop to `DzOtpInput` and `DzPasswordInput` moved each
file's `style="contain: layout style"` down **one line**, and R2-O4's inventory
records line numbers. `yarn csp:inline-style-inventory` regenerated it — every
count unchanged (`recipe-movable` 78 · `layout-static` 3 · `custom-property` 0 ·
`required-dynamic` 19 · `unclassified-binding` 33), only two line numbers moved —
and the spec passes. It is recorded rather than quietly fixed because it is a
good gate doing its job: a freshness check that noticed a two-line shift.

**Maturity, stated without collapsing it.** The two new conditions and the SC
2.5.7 lane are **browser-qualified, locally**: three real engines, on a static
Storybook built from this working tree, on one Windows developer machine. They
are **not** CI evidence (no lane here has ever gated a merge), **not** release
evidence (the tree is dirty and uncommitted), and **not** evidence about Safari,
a real mobile browser or a screen reader. The SC 3.3.8 fixes are
**focused-validated** (unit) and **browser-exercised** by the Storybook suite;
nothing here has been driven by an assistive technology, and the AT matrix stands
at **0 of 534**.

**A stale `packages/core/dist` costs two phantom type errors, and is worth
knowing about.** Before the core package was rebuilt, the tooling typecheck
reported 17, two of them against `packages/core/src/i18n/messages.ts`
(*"subsequent property declarations must have the same type"* and
*"`showPassword` is not a known property"*). Neither was real: the tooling
program resolves `@dzup-ui/core` to `packages/core/dist/i18n/messages.d.ts`, a
git-ignored build output from earlier in the day that still carried the old
message catalog. `yarn workspace @dzup-ui/core build` cleared both. Nothing
refreshes that directory automatically, so the next person to add a catalog key
will see the same two errors and should rebuild before believing them.

---

## 5. Ratchet movements (old → new, each bound to `2d51eec` + this working tree)

| Ratchet | Old | New |
|---|---|---|
| browser-matrix conditions per engine | 6 | **8** (`+ text-200`, `+ spacing`) |
| matrix projects | 18 | **24** |
| matrix cells measured in this task | — | **1,056** (2 conditions × 3 engines × 176), **0 failures**, **0 entries added to `known-failures.json` or `engine-exceptions.json`** |
| WCAG 2.2 AA criteria the browser matrix measures | 4 (1.4.10 · 1.4.11 · 2.5.8 · reduced motion) | **7** (+ 1.4.4, + 1.4.12, + 2.5.7) |
| SC 2.5.7 surfaces verified in a browser | 0 of 9 | **9 of 9** (27 cells over 3 engines) |
| SC 2.5.7 open gaps / ceiling | 3 / 3 | **3 / 3 — deliberately unmoved** (owner design decision D117) |
| SC 3.3.8 conformant credential inputs | 0 of 2 (never audited) | **2 of 2** |
| declared browser-floor declarations found by a gate | *(no gate; prose asserted the absence)* | **0, probed at render time** over 34 files |
| i18n catalog keys | 110 | **112** (`DzPasswordInput.showPassword` / `.hidePassword`) |
| English literals in `DzPasswordInput`'s template | 2 | **0** |
| `component-meta` props described | 1,819 / 1,819 | **1,821 / 1,821** (+2, each with its own prose — no description ratchet moved) |
| `eslint e2e/` errors | 9 | **9** (the 3 the new spec introduced were fixed before the lane ran) |
| pending changesets | 34 | **35** — measured by `validate:release-policy`, 0 major, 0 mixed. (R2-O4's row records 22; R2-O2's and R2-O3's landed between) |

**Ceilings raised: none. Gates weakened: none. Exceptions added: none.** The
`known-failures.json` ledger and `engine-exceptions.json` are untouched: both new
conditions went green on all three engines on the first complete run, so there
was nothing to triage into them — and an entry may only be added with a measured
number, which there is not one of.

---

## 6. Owner decisions raised

Full text, options and recommendations are in the register in
[`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md); the two that carry sheets are
linked here.

| # | Decision | Recommendation |
|---|---|---|
| **D117** 🟠 | **The SC 2.5.7 resize affordance** — the pick this task exists to hand over. [Sheet](./TASK-R2-O5-2-5-7-decision.md): four options with sketches, APG borrowings, costs and the constraints that bind any of them | **(a) steppers revealed on the handle**, resting state unchanged; (c) preset cycling as the zero-pixel fallback |
| **D118** 🟠 | **Adopt a browser floor, or keep publishing none** (N2-D2's D2-D1, with the engineering now done: the page reads the tree instead of asserting) | **(a) `browserslist` in the six published packages** — the channel every tool already reads |
| **D119** 🟢 | `DzOtpInput.otp` defaults to `true` — a behaviour change, taken as recommended | keep (a); reversal is one line |
| **D120** 🟢 | `DzPasswordInput`'s toggle joins the tab order; `autocomplete` becomes a prop | keep both |
| **D121** 🟠 | **The six geometry changes** — accept / revert / adjust, per item. [Review sheet](./TASK-R2-O5-geometry-review.md) with the first before/after images and a re-measurement that reproduces N1-O3 exactly | **accept all six**; a revert must restore the 28 ledger entries it removes |
| **D122** 🔴 | **A fourth `<done_check>` is defective — and this one fails in the direction that publishes a false "done"** | D116's option (a), extended: run every check against the real artifact before it ships |
| **D123** 🟢 | The widened sweep exits 1 on a **teardown** fault (worker force-kill) after all cells report green | run the lane one engine at a time, which is already the documented procedure |

---

## 7. Ranked next packet

1. **Take D117 and land the affordance** (~1.5 days after the pick). Everything
   around it is built: the lane, the record, the gate and the file list are in
   §5 of the decision sheet, and `openGaps`/`ceiling` **3 → 0** is forced in the
   same commit by `crossCheckWcagDeviations`.
2. **Take D118 and declare the floor.** One `browserslist` key per published
   package; the statement and its table then render themselves. It is the last
   `[!owner]` item on `/evidence/browser-support`.
3. **TASK-R2-O1 — persist a Playwright JSON report.** Every `browser-matrix`
   capability cell is still `unrun` because `test-results/matrix-report.json` is
   absent, which is also the one violation `validate:capability-matrix` still
   reports (`DzFileUpload`, Tier D). This task's 1,056 green cells are in
   `engine-ratchets.json` and **not** in the capability matrix, because that
   input is a git-ignored file nobody has decided to replace (N1-O2's D1).
4. **Wire the widened lane into CI one engine at a time** (D123), after R1-O4
   decides CI dispatch at all.
5. **Take D121** so the density change (V8) is either owned or reverted before
   1.0 rather than after.
6. **Re-run `e2e/matrix/non-drag.spec.ts` whenever a drag surface changes** — it
   is the only thing that keeps `/evidence/accessibility`'s conformance statement
   from going quietly stale, and it costs 27 cells.

---

## 8. What this task deliberately did not do

- **Did not implement a 2.5.7 affordance.** The prompt's `<stop_conditions>` says
  to stop at the proposal, and every candidate changes what a user sees.
- **Did not flip any surface in `wcag-deviations.json`.** The record moved only
  by gaining a *verification* block; `openGaps` and `ceiling` are untouched.
- **Did not fill a single AT cell** — 0 of 534, as they must stay until a human
  runs them.
- **Did not touch `known-failures.json` or `engine-exceptions.json`.** Nothing
  failed, so there is nothing to record; writing a reassuring note into a ratchet
  file is how ratchets stop meaning anything.
- **Did not build a second harness.** Both new conditions are projects of the
  existing matrix, and the 2.5.7 lane is a spec in the same directory under an
  existing project — no new Playwright config, in line with R2-O4's precedent.
- **Did not fix the pre-existing reds** (`capability-matrix` `DzFileUpload`,
  the 3 inherited `yarn test` failures, `packages/tooling` `tsc`, the 9
  `eslint e2e/` errors, the 2 async-options Storybook stories). They are R2-O1's
  and R1-O1's.
- **Did not commit, push, dispatch, publish, deploy or change a registry.**

---

# 2026-09-19 — the residual, after the owner took D117 / D118 / D121

> **Everything above this line is the 2026-09-18 record and is left unchanged.**
> This section records the second half of TASK-R2-O5: the work that was stopped
> `[!]` at the proposal because it depended on an owner design pick.
>
> **The picks, taken by the owner on 2026-09-19** (not by an agent, and no
> longer open):
>
> | # | Decision | Outcome taken |
> |---|---|---|
> | **D117** | SC 2.5.7 resize affordance | **Option A** — steppers revealed on the handle, resting state byte-identical, **no opt-out prop**, all three surfaces |
> | **D118** | browser floor | **Option (a)** — `browserslist` in the six published packages; the statement renders from the tree |
> | **D121** | the six N1-O3 geometry changes | **accept all six**; the 28 `known-failures.json` entries stand |
>
> **Repo / commit observed:** `main` @ **`2d51eec`**, worktree dirty with ~430
> uncommitted paths from R2-O1/O2/O3/O4/O5 and the R3/R5 tasks — every one
> preserved. Nothing committed, pushed, dispatched or published.

## Live progress (appended as the work ran)

- [x] read the 09-18 record, the two decision sheets, README §4/§5 and R2-O1 §3
- [x] verified the finished halves are still in place (two matrix conditions, the non-drag lane, the 3.3.8 audit, the typed browser-floor probe) — none redone
- [x] **D117/A implemented** on all three surfaces, to the seven steps of the decision sheet §5
- [x] i18n packs regenerated (catalog 112 → 116 keys in this phase; **110 → 116 against HEAD `2d51eec`** — corrected 2026-09-19)
- [x] unit specs: `DzResizable` **9 → 21**, `DzSplitter` **13 → 19**, `DzTable` 55 → 62 (**+25**; corrected 2026-09-19 — the figures first written here were wrong)
- [x] `wcag-deviations.json`: three surfaces `gap → met`, `openGaps` **3 → 0**, `ceiling` **3 → 0**, statement rewritten
- [x] `/evidence/accessibility` taught to render a *closed* criterion without becoming a badge
- [x] **non-drag lane re-run, 3 engines — 27/27 against the new record**
- [x] SC 2.5.8 floor measured for the new controls in both browser lanes
- [x] **D118**: `browserslist` in the six published packages; the statement renders from the tree + the engines the matrix drives
- [x] **D121**: accept recorded per item in the review sheet §4.1
- [x] resting geometry re-measured against the 09-18 pre-change numbers
- [x] full 8-condition sweep re-run per engine; ledger regenerated; artifacts regenerated; validators run

## 9. What the residual landed

### 9.1 `<done_check>`, evaluated by intent a second time

The 2026-09-18 section records the four checks and why two of them are defective
(**D122**). They were re-read rather than re-run blind, and the intent reading is
what moved:

| # | Check, read by intent | 2026-09-18 | 2026-09-19 |
|---|---|---|---|
| 1 | *are there any open SC 2.5.7 surfaces?* | **no** — `openGaps: 3`, three surfaces `state: 'gap'` | **yes, passes** — `openGaps: 0`, `ceiling: 0`, zero surfaces in `state: 'gap'`, and `crossCheckWcagDeviations` enforces all three together |
| 2 | `grep -c "text-200\|spacing" e2e/matrix/conditions.spec.ts` ≥ 2 | **passes** (landed 09-18) | passes, unchanged |
| 3 | a 3.3.8 audit note exists | **passes** (landed 09-18, §2.4) | passes, unchanged |
| 4 | *does the tree declare a browser tier, and does the evidence page cite it?* | **no** — 0 declarations; the check's literal form "finds" one by grepping the word `target` out of a doc comment | **yes, passes on intent** — six `browserslist` declarations, read by a typed probe and rendered on `/evidence/browser-support` |

**The literal text of check 1 still cannot be run** — `require(...).filter` throws
on an object — and the literal text of check 4 still matches English prose and
would have "passed" yesterday, when nothing was declared. Both are **D122**,
neither is changed by this task, and the intent reading is the only one that
means anything.

### 9.2 The 2.5.7 affordance (D117 option A) — the seven steps

| Step (decision sheet §5) | File | What landed |
|---|---|---|
| 1 | `DzResizableHandle.vue`, `DzSplitterHandle.vue` | The stepper pair on the gutter — a **sibling** of the Reka handle, not a child of it (§9.3.4). `@pointerdown.stop` **plus `@mousedown.stop` and `@touchstart.stop`** — see §9.3. `@click` moves the separator by dispatching the `keydown` Reka's own `useWindowSplitterResizeHandlerBehavior` already listens for, on the element it listens on (`[data-resize-handle]`), with `shiftKey` forwarded |
| 2 | `DzResizable.anatomy.ts`, `DzSplitter.anatomy.ts` | `step-decrease` / `step-increase` in `parts` and `optionalParts`; the four Arrow rows now cite `['2.1.1', '2.5.7']`; keyboard rows otherwise unchanged. Both names registered in `ANATOMY_PART_EXTENSIONS` as `reviewed` with a reason, so `validate:anatomy-parts`'s `maxUnreviewedPartNames` ceiling stays at 0 |
| 3 | `DzTableCell.vue` | `@click.stop` **removed**; the same pair rendered over the header cell; `stepColumn(sign, large)` extracted so the pointer path and `onResizeKey` call one function; the handle gains `data-part="separator"`, `role="separator"`, `aria-orientation`, `aria-valuenow` and `aria-valuemin`. `DzTable.anatomy.ts` declares the three new parts and, for the first time, the column-resize keyboard rows |
| 4 | `packages/core/src/i18n/messages.ts` + `locales/*` | `DzResizableHandle.shrinkPane` · `DzResizableHandle.growPane` · `DzTableCell.narrowColumn` · `DzTableCell.widenColumn`. `yarn generate:i18n-packs` re-run: **catalog 112 → 116 keys** in this phase — **110 → 116 measured against HEAD `2d51eec`**, the other two being this task's own 09-18 SC 3.3.8 keys (corrected 2026-09-19) — `en.json` rewritten, the `de` scaffold's explicit-fallback list extended. **No English literal reached a template** — the sheet's §2.4 names `DzOrderList`'s hard-coded announcer as the precedent *and* its warning |
| 5 | three `.spec.ts` files | **+25 unit tests**: `DzResizable` **9 → 21**, `DzSplitter` **13 → 19**, `DzTable` 55 → 62 — **77 → 102 against HEAD `2d51eec`**. *(Corrected 2026-09-19: this row originally read "+22 … 13 → 20, 13 → 18", which summed to 100 and contradicted §9.14's own `102`. Re-measured statically and by `yarn vitest run` over the three files: 102 passed, exit 0.)* |
| 6 | `packages/core/docs/wcag-deviations.json` | Three surfaces `gap → met` with `singlePointerNoDrag` filled; **`openGaps` 3 → 0**; **`ceiling` 3 → 0**; `conformanceStatement` rewritten; `recordedAt` re-bound; a new `closedBy` field per closed surface |
| 7 | `e2e/matrix/non-drag.spec.ts` | Re-run on three engines — **27/27** — then the generator chain in §9.8 |

**What `DzSplitterHandle` shares and what it repeats.** One Reka handle
underneath means one implementation of the *resize*; the ten-line dispatcher is
repeated in both components rather than extracted, because every other line of
those two files is already repeated (context, variants call, disabled rule) and
the family directories hold no shared non-`Dz*` module — introducing the first
one would land an `unclassified` symbol in the ownership manifest to save ten
lines. `DzSplitter.spec.ts` now asserts the two render the same control attribute
for attribute, so "they are the same component" is checked rather than assumed.

**Both handles read `DzResizableHandle.*` message ids.** Two catalog keys for one
rendered string would make a translator translate the same sentence twice.

### 9.3 Three implementation decisions that are not in the sheet, and why

1. **`@mousedown.stop` and `@touchstart.stop` beside `@pointerdown.stop`.** The
   sheet says `@pointerdown.stop`; that alone does not work. Reka's drag registry
   listens for **`mousedown` / `touchstart` on `document.body`**
   (`reka-ui/dist/utils/registry.js`), not for `pointerdown`, so stopping only
   the pointer event leaves a press on a stepper starting a zero-length drag and
   setting the global resize cursor. Read out of the source, not guessed.
2. **The steppers are not tab stops** (`tabindex="-1"`). APG `window-splitter`
   makes the separator the single tab stop of the widget and its Arrow/Home/End
   path already satisfies SC 2.1.1; adding two stops per handle would triple the
   tab stops of every splitter to duplicate a path that already exists. This is
   deliberately *not* the `DzPasswordInput` case fixed in §2.4 on 09-18: that
   toggle was the only way to perform its function, and these are the pointer
   half of a function the keyboard already has.
3. **`aria-valuemax` is not declared on the table handle.** `stepColumn` grows a
   column without a ceiling, so there is no authored maximum to declare.
   `aria-valuenow` (the width in px) and `aria-valuemin` (the clamp) are both
   real numbers; a `valuemax` would have had to be invented.
4. **The pair is a sibling of the separator, not a child of it — and it had to
   be.** This is the one thing the decision sheet's §5 got wrong, and an
   existing gate found it rather than a reviewer: the first implementation
   nested the two buttons inside the Reka handle, exactly as step 1 describes,
   and `apps/landing/src/blocks/a11y.spec.ts` turned red on the
   `resizable-workspace` block in **both themes** with one **serious** axe
   violation — `nested-interactive`, WCAG 4.1.2:

   > *Using a negative tabindex on an element inside an interactive control does
   > not prevent assistive technologies from focusing the element (even with
   > `aria-hidden="true"`).*

   The handle carries `role="separator"` and `tabindex="0"`, so it is an
   interactive control, and `tabindex="-1"` on the children is not the escape it
   looks like. The fix is structural, not a suppression: the pair moved out of
   the handle into a **zero-size flex item immediately after it** (`w-0` or
   `h-0` plus `self-stretch`), with the buttons absolutely positioned over the
   divider, and the reveal moved from a Tailwind `group` to a `peer`. The
   buttons stay real `<button>`s, the separator stays the single tab stop, and
   the resting geometry is unchanged (§9.5). Two unit tests now assert the
   structure directly — `expect(separator.querySelector('[data-dz-resize-step]'))
   .toBeNull()` — so it cannot drift back without failing in milliseconds
   instead of in a landing-page axe run.

   The alternative considered and rejected: making the controls non-focusable
   `<span role="button">`s, which also clears the rule. It clears it by shipping
   a widget role that cannot be focused, which is a worse contract than the one
   the rule was protecting.

### 9.4 The 24 × 24 floor — settled, and measured rather than assumed

**The short-gutter question the sheet's §2 Risk raised is settled: the pair never
shrinks and never becomes a single cycling control. It is absolutely positioned,
centred, and overflows the gutter's ends if the gutter is shorter than 48 px.**
A control that shrinks below 24 px fails SC 2.5.8, so shrinking was never
available; swapping to one cycling control below a height threshold is option
**C**, which the owner did not pick, and it would make the same tap mean
different things in different layouts. An overhang along the gutter's length is
not new geometry either — TASK-N1-O3 change V4 already has this handle
overhanging each pane by ~11.5 px, and the pair is revealed rather than resident.
Recorded in the decision sheet §7.1 and in `DzResizable.variants.ts` at the point
of the change. For a table column the pair overlays the header cell, as §2.3
required: 48 × 24 anchored at the resizable edge, which fits a column at
`--dz-table-col-min-width` (48 px) exactly.

**The `touch` lane could not have caught an undersized stepper, and now can.**
Its sweep skips any element whose computed `opacity` is `0` — correct for a
visually-hidden native `<input>` under a styled label, and exactly wrong for a
control whose whole design is to rest transparent. Left alone, a 12 px stepper
would have passed SC 2.5.8 in three engines while failing the criterion it was
added for. Two measurements were added, because neither covers the other:

- `e2e/matrix/conditions.spec.ts` `case 'touch'` measures every
  `[data-dz-resize-step]` box explicitly, after the generic sweep — three
  engines, coarse pointer, phone viewport.
- `e2e/matrix/non-drag.spec.ts` measures the same boxes in each of its 27 cells,
  because the `touch` lane opens each component's **default** story and
  `DzTable`'s renders no resize handle at all. The 2.5.7 lane is the only lane
  that opens `core-data-dztable--column-resizing`.

Neither needs to stage a reveal first: a box is a box whether or not it is
painted, so the measurement is honest without pretending to hover anything.

### 9.5 The resting rendering, measured against the pre-change number

The claim "nothing moves until you reach for it" is checkable, because the
geometry review of 2026-09-18 recorded these two stories **before** the
affordance existed (`./assets/TASK-R2-O5/geometry.json`, change V4):

| Story | 2026-09-18, before the steppers | 2026-09-19, with them |
|---|---|---|
| `core-layout-dzresizable--default` | `315.66 × 154` | **`315.65625 × 154`** |
| `core-layout-dzsplitter--default` | `315.66 × 154` | **`315.65625 × 154`** |

Same chromium, same 1280 × 720 viewport, same `#storybook-root` box. Measured
twice — once on the first implementation and again after the structural fix in
§9.3.4 — and identical both times, which is the point of taking the measurement
rather than reasoning about it. In the shipped structure the pair measures
**24 × 24 CSS px** in both stories, the flex item that holds it measures **0 px
wide**, and its computed `opacity` is **`0`** at rest.

The resting *paint* and the resting *layout* are unchanged; the **DOM** is not —
each handle gains two buttons, which the changeset states, because a consumer's
own DOM snapshot of one of these three components will need re-recording.

### 9.6 D118 — the floor is declared, and the page says what it does not measure

`browserslist` now sits in all six published packages (`contracts`, `core`,
`mcp`, `nuxt`, `testing`, `tokens`), the same range in each:

```json
"browserslist": ["chrome >= 111", "edge >= 111", "firefox >= 128", "safari >= 16.4", "ios_saf >= 16.4"]
```

**Why that range, and why it is not a preference.** It is the floor the styling
toolchain already imposes: the published CSS is generated by Tailwind CSS v4
(4.2.2 in this tree), whose own documented minimum is exactly Chrome 111 /
Firefox 128 / Safari 16.4. Declaring anything lower would be a promise the build
could not keep; declaring anything higher would withhold browsers that already
work. The page says that without naming a number — `statements.ts` is gated to
contain no metric, and every number on the page arrives from the tree.

The probe R2-O5 built on 09-18 found **0** declarations; it now finds **6**, so
`/evidence/browser-support` renders the `baselineDeclared` block and the
declaration table instead of the `[!owner]` warning, **with no edit to the
prose** — which is exactly the property that block was written for. Two things
were added so a declaration cannot be read as a measurement:

- a generated sentence beside the table naming the engines the matrix actually
  drives, with their probed versions, and stating that every browser the queries
  admit beyond those three is supported *by declaration* and is measured nowhere
  on the page — in particular that a declared Safari or iOS floor is not a Safari
  result;
- the standing `notMeasured` block, unchanged, which already refuses Safari, real
  mobile browsers, CI, screen readers and CSP.

The **gate** the statement warns about — one that refuses a feature below the
declared tier — was **not** built. It is R1-O5 / R0-O2 work, the decision
register says so, and building it here would have been the task deciding
something the owner did not ask it to.

### 9.7 D121 — the outcome, recorded per item

[`./TASK-R2-O5-geometry-review.md`](./TASK-R2-O5-geometry-review.md) §4.1 now
carries **accept** against each of V1, V2, V3, V5, V6 and V8, with what each
outcome means in the tree. Nothing was reverted or adjusted, so
**`e2e/matrix/known-failures.json` is untouched** and its 28 entries stay closed
— that is the whole practical consequence of accepting rather than reverting.
V8's density cost (every checkbox and radio row 3–6 px taller; a ten-row form
30–60 px taller) is recorded as accepted explicitly rather than inherited. V4 and
V7 were given no outcome because they move no pixel, and the sheet says so rather
than leaving them looking pending. A `compact` density scale is neither
commissioned nor refused by the outcome.

### 9.8 Files changed on 2026-09-19

| File | Change |
|---|---|
| `packages/core/src/components/layout/DzResizable.variants.ts` | **+ `handleSteppers`, + `handleStepperTrack`, + `handleStep`** slots with `direction` variants; a `peer/dz-resize-handle` marker on the `handle` slot so the pair — which is the handle's *next sibling*, §9.3.4 — can react to a hover or a focus on the gutter |
| `packages/core/src/components/layout/DzResizableHandle.vue` | The pair, the reveal state, the RTL-aware key mapping, the dispatcher |
| `packages/core/src/components/layout/DzSplitterHandle.vue` | The same, as the alias it is |
| `packages/core/src/components/data/DzTableCell.vue` | `@click.stop` removed; `stepColumn` extracted; the pair over the header cell; `role="separator"` + `aria-orientation` + `aria-valuenow` + `aria-valuemin` + `data-part="separator"` on the handle |
| `packages/core/src/components/layout/DzResizable.anatomy.ts` · `DzSplitter.anatomy.ts` | Two parts, two `optionalParts`, `2.5.7` beside `2.1.1` on four Arrow rows |
| `packages/core/src/components/data/DzTable.anatomy.ts` | Three parts (`separator`, `step-decrease`, `step-increase`), all optional; the column-resize keyboard rows declared for the first time |
| `packages/contracts/src/anatomy.types.ts` | `ANATOMY_PART_EXTENSIONS` gains `step-decrease` and `step-increase`, both `reviewed`, with the reason they are not `decrement`/`increment` (those are shipped by `DzNumberInput` on a spinbutton, where they change a bound *value*; one selector matching both would match two nodes whose contract differs) |
| `packages/core/src/i18n/messages.ts` · `locales/{en,de}.json` | Four keys, packs regenerated. *(Corrected 2026-09-19: this row named `locales/{en,de,pseudo}.json`. **There is no `pseudo.json`** — `packages/core/src/i18n/locales/` holds exactly `de.json` and `en.json`, at HEAD and in the worktree. No pseudo-locale pack exists or was written.)* |
| `packages/core/docs/wcag-deviations.json` | Three surfaces flipped; `openGaps` / `ceiling` **3 → 0**; `conformanceStatement` rewritten; `closedBy` per closed surface; `verifiedInBrowser` re-measured, with the 09-18 result kept beside it as `priorResult` |
| `packages/tooling/src/docs/evidence.ts` | `WcagSurface.closedBy`; `renderDragSection` prints it on a met surface, so flipping a gap no longer deletes its history from the component page |
| `packages/tooling/src/docs/statements.ts` | **+ `ACCESSIBILITY_STATEMENT.blocks.closed`** (the counterpart of `open`, and deliberately not a badge); `baselineDeclared` gains the sentence about why the floor is the toolchain's and not a preference; the page `description` no longer asserts an open gap |
| `packages/tooling/src/docs/evidence-pages.ts` | `renderAccessibilityPage` reads which half of the statement is true **from the record**; the "why it is not fixed" section becomes "how the surfaces that were open were closed" when there are no gaps; `renderBrowserFloor` prints the engines the matrix drives beside the declared floor |
| `e2e/matrix/non-drag.spec.ts` | The SC 2.5.8 measurement per cell; the `DzImageComparison` probe waits for its remote image (**D129**, §9.10.3); the header records that the flip happened and that no expectation was edited |
| `packages/tooling/src/validators/ownership-manifest.spec.ts` | The vocabulary-report test asserted *"`DzTable` is absent from the report"*. It is back in it, deliberately, because the stepper parts are recorded extensions. The assertion moved to the two things that matter and is **stricter**: `body` / `row` / `cell` have not fallen back out of the vocabulary, **and** what is reported is exactly the reviewed pair and nothing that crept in beside it |
| `packages/tooling/src/docs/evidence.spec.ts` | *"reports the real repository as declaring no browser floor"* asserted `declared` was empty — true until D118 was taken. It now asserts the other half of the same contract and is **stricter**: all six published packages declare, and all of them declare the **same** range. A floor declared in five packages of six is not a floor |
| `e2e/matrix/conditions.spec.ts` | `case 'touch'` measures `[data-dz-resize-step]` explicitly |
| `packages/{contracts,core,mcp,nuxt,testing,tokens}/package.json` | `browserslist` |
| three `.spec.ts` files | **+25 tests** (77 → 102 against HEAD; corrected 2026-09-19 — see §9.14) |
| `.changeset/a-pane-and-a-column-can-be-resized-without-dragging.md` | **`patch`** across the six published packages — see §9.11 |

### 9.9 Regenerated artifacts

Regenerated in the mandated order (ownership → quality → capability →
component-meta → llms → docs-pages → playground seeds), each by its own
generator, none hand-edited.

One thing to know about `yarn generate:ownership`: it also rewrites
`apps/storybook/stories/_data/anatomy.generated.ts`, and that file was stale
against **TASK-R2-O4's** uncommitted work as well as this task's. So its diff
carries `url-rejected` states on several navigation components that this task did
not add. That is the generator catching up with the tree, not scope creep, and it
is recorded here rather than left for the next reader to be surprised by.

### 9.10 What went wrong, and what caught it

Four things. Every one of them was found by a gate that already existed, which
is the part worth keeping: none of them was found by reading the diff.

**1. An existing axe lane caught a real accessibility defect inside this task's
own accessibility work.** The first implementation nested the stepper pair
inside the `role="separator"` handle — which is exactly what the decision
sheet's §5 step 1 says to do — and `apps/landing/src/blocks/a11y.spec.ts` failed
the `resizable-workspace` block in **both themes** with one **serious** axe
violation: `nested-interactive`, WCAG 4.1.2. That lane belongs to the landing
site, not to Core, and it is the only place in the repository where these
components are rendered inside a realistic page and handed to axe. The
structural fix, the alternative that was rejected and the two unit tests that
now hold the structure are in §9.3.4. **No rule was disabled and no violation
was allowlisted.**

**2. `validate:rtl` caught the fix's own first attempt.** Moving the pair out of
the handle meant anchoring it to a new box, and the first spelling used a
physical inset — which `DzResizable` may not, because it declares
`rtl: { mirrors: 'layout' }`. Swapping it for the logical inset was not enough
either, and that is the interesting half: a logical inset anchors the track's
**start** edge, the start edge changes sides, and a `translate` of half the
track's own width is therefore correct in one direction and **24 px out in the
other**. The shipped track is zero-thickness across the gutter and lets the
controls overflow it symmetrically, which has no such asymmetry. Measured rather
than reasoned: the pair's centre sits **+0.5 px** from the divider's centre in
LTR and **−0.5 px** in RTL, on a 1 px divider, with both controls 24 × 24 in
both directions.

(A gap the same validator has, noted in passing and **not** fixed here:
`checkRtlDeclarations` scans a component's own `.vue` and `.variants.ts`. A
compound part with no anatomy of its own — `DzTableCell.vue`, which has carried
a physical `-right-1` on the column-resize handle since before this task — is
never scanned, so the rule does not reach the file where the physical utility
actually is.)

**3. The SC 2.5.7 lane depends on a third-party image host — new defect
D129.** `DzImageComparison`'s story loads its two images from
`https://picsum.photos/...`, and the component maps a press to a position
through the root's box, which those images size. A press landing before they
paint reads a box of no height and the divider does not move. Measured rather
than supposed: after a Storybook rebuild the cell failed on chromium **and**
webkit in a cold full-lane run, failed again on chromium in a second run, and
then passed **three times running** once the images were cached. The probe now
waits for the image, which removes the race without weakening anything — a
genuinely broken tap-to-place still fails, and an image that never arrives still
fails. What it does not fix is the underlying property: **a conformance lane
whose result depends on a CDN being reachable cannot be put in CI as it
stands**, and changing a story's images is a fixture decision, not a probe fix.
Raised as **D129**.

**4. The Storybook static build is over its budget — new defect D130.**
`yarn storybook:build` ends `Storybook build 25.02 MB EXCEEDS budget 25 MB`,
exit **1**. TASK-R5-O9 measured **24.90 MB within the 25 MB budget** on the same
script and the same budget, so ~0.12 MB of growth happened between that
measurement and this one. **At most ~0.026 MB of it can be this task's** — that
is the total *raw source* added across every shipped file it touched, JSDoc
comments included, before minification — so most of the growth belongs to the
other uncommitted work in this tree (R2-O1's regenerated capability matrix and
its 2,136-cell ledger, R5-O7, R5-O9). At 0.02 MB over, though, this task is
plausibly the increment that crossed the line, and that is reported rather than
argued away. **The budget was not raised**, `--max-mb` was not touched, and the
static build still produces correct output (the size check runs last), which is
why every browser lane below could run against it.

### 9.11 Focused validation — every exit code read from a file, never through a pipe

| Command | Result |
|---|---|
| `vitest run …/DzResizable.spec.ts …/DzSplitter.spec.ts …/DzTable.spec.ts` | **102 passed**, exit 0 (81 before this task) |
| `vitest run …/evidence.spec.ts …/ownership-manifest.spec.ts …/inline-style-inventory.spec.ts` | **100 passed**, exit 0 |
| `vitest run apps/landing/src/blocks/a11y.spec.ts` | **178 passed**, exit 0 — the axe lane that caught §9.10.1 |
| `vitest run …/rtl.spec.ts` + the two layout specs | **49 passed**, exit 0 |
| `playwright e2e/matrix/non-drag.spec.ts --project=matrix-{chromium,firefox,webkit}-default` | **27 passed, exit 0**, against the *flipped* record |
| chromium sweep, 8 projects | **1431 passed · 8 skipped · 0 failed**, exit 0, 14.5m |
| firefox sweep, 8 projects | **1431 passed · 8 skipped · 0 failed**, exit 0, 24.1m |
| webkit sweep, 8 projects | **1431 passed · 8 skipped · 0 failed**, exit 0, 19.9m |
| `generate:browser-evidence` (3 reports) | exit 0 — 24/24 projects, **0 unattributed tests in any project** |
| `yarn typecheck` · `yarn lint` | **0** · **0** |
| `eslint e2e/` | **9 errors, 2 files** — the pre-existing 9; none in the files this task touched |
| `validate:` `capability-matrix` · `docs-pages` · `component-meta` · `llms` · `playground-parity` · `visual-baselines` · `anatomy-parts` · `story-dod` · `at-matrix` · `i18n-packs` · `hardcoded-strings` · `ownership` · `quality-tiers` · `tv-slots` · `rtl` | **exit 0, all fifteen** |
| `validate-release-policy` · `package-names` · `changelog` · `exports` | **exit 0, all four** — 36 pending changesets, 0 major, 0 mixed |
| `yarn storybook:test` | **1,451 passed / 2 failed of 1,453** — the **same two async-options stories by name** as on 2026-09-18, unchanged. This lane runs axe over every story, including the three this task changed |
| `yarn test` (end to end) | **exit 1 — 3 failed / 10,230 passed / 3 skipped / 1 todo over 543 files.** All three are inherited by name: `dzup-resolution` (*"covers exactly the specifiers the packages declare"*), `landing-token-fallbacks`, `story-dod-tiers countOpen`. **None from this task** |
| `yarn validate:all` (end to end, exit read from the log) | **exit 1 at `validate:tokens`**, on the **5 raw colour literals in TASK-R2-O7's untracked `packages/tooling/src/perf/tier-fixtures.ts`** — the identical first failing link, with the identical cause, that TASK-R2-O1 recorded on 2026-09-19. **Every one of the 19 links after it exits 0 when run individually** (`exports`, `ownership`, `mcp`, `component-meta`, `provider-defaults`, `llms`, `docs-pages`, `playground-parity`, `package-names`, `doc-snippets`, `engines`, `adr-references`, `readme-facts`, `externals`, `dts`, `changelog`, `release-policy`, `peers`, `licenses`) |
| `yarn storybook:build` | **exit 1 — the size budget only (§9.10.4).** The build itself succeeds and every browser lane above ran against its output |

### 9.12 The browser record moved, and it moved by zero

The ledger TASK-R2-O1 landed on 2026-09-19 (`e2e/matrix/browser-evidence.json`,
2,136 cells) was regenerated from three fresh full-sweep reports. Diffed cell by
cell against the copy taken before this task touched anything:

| | before | after |
|---|---|---|
| projects / projects run | 24 / 24 | 24 / 24 |
| components | 89 | 89 |
| cells | 2,136 | 2,136 |
| `pass` · `fail` · `unrun` | 2,112 · 0 · 24 | 2,112 · 0 · 24 |
| **cell state changes** | — | **0** |

Only the run provenance moved. **Nothing was hand-edited, no exception file was
touched, and no cell was written that a run did not produce.**

**A caveat that belongs with that claim.** `validate:capability-matrix`'s new
`browser-degradation` gate reported itself **inert**: *"no committed browser
ledger at HEAD yet, so there is nothing to have degraded FROM"*. It is R2-O1's
**D127** — the gate goes live when the owner commits the ledger — so the
zero-movement claim above rests on the explicit before/after diff taken here,
not on the gate having compared anything.

### 9.13 Visual baselines — no diff, and the reason is structural

`validate:visual-baselines`: **58 on disk, 58 accepted**, exit 0; **24 stale**,
unchanged from R2-O1's reading. The pilot's scope is `families [buttons]`, so
**no baseline covers `DzResizable`, `DzSplitter` or `DzTable`** and this change
could not move one. Nothing is filed for TASK-R2-O6 on that account, and
`yarn visual:accept` was not run.

Worth stating for whoever widens the pilot: these three components' **pixels**
are unchanged (§9.5 measures it), so even a baseline captured before this change
would still match. What changed is the DOM.

### 9.14 Ratchet movements (old → new, each bound to `2d51eec` + this working tree)

| Ratchet | Old (start of 2026-09-19) | New |
|---|---|---|
| **SC 2.5.7 open gaps** | **3** | **0** |
| **SC 2.5.7 ceiling** | **3** | **0** |
| SC 2.5.7 surfaces with a named single-pointer path | 6 of 9 | **9 of 9** |
| `non-drag` lane cells agreeing with the record | 27 of 27 (against a 3-gap record) | **27 of 27** (against a 0-gap record) |
| declared browser-floor declarations found by the probe | 0 | **6** — one per published package |
| i18n catalog keys | **110 at HEAD `2d51eec`** (112 was this task's own phase-1 checkpoint) | **116** — **+6 against HEAD** (corrected 2026-09-19; see the note below) |
| anatomy parts declared on the three surfaces | `DzResizable` 4 · `DzSplitter` 4 · `DzTable` 8 | **6 · 6 · 11** |
| reviewed `ANATOMY_PART_EXTENSIONS` entries | 7 | **9**; `maxUnreviewedPartNames` still **0**, `maxHeldPartNames` unchanged |
| unit tests on the three surfaces | **77 at HEAD `2d51eec`** (81 was a miscount — corrected 2026-09-19) | **102** — **+25**, not +22 |
| browser-matrix cells measured in this task | — | **4,293** (3 engines × 1,431), **0 failures**, **0 entries added to `known-failures.json` or `engine-exceptions.json`** |
| browser-ledger cell states changed | — | **0 of 2,136** |
| `yarn test` | 3 failed / 10,209 passed | **3 failed / 10,230 passed** — the same three, by name |
| pending changesets | 35 | **36** (0 major, 0 mixed) |
| uncommitted paths in the tree | 427 | **443** — every one of the 427 preserved untouched |
| Storybook static build | 24.90 MB (R5-O9), within budget | **25.02 MB, over the 25 MB budget** — **D130**, and the budget was not raised |
| AT cells executed | **0 of 534** | **0 of 534** — untouched, as they must be |

**Ceilings raised: none. Gates weakened: none. Exceptions added: none. Baselines
accepted: none.**

> **CORRECTION, independent verification 2026-09-19 — two rows were bound to an
> intra-task checkpoint instead of to HEAD.** `<evidence_rules>` says bind every
> metric to a commit; these two were bound to a moment.
>
> **i18n catalog keys: `110 → 116` against HEAD `2d51eec`, six keys.** Measured
> by flattening `messages.*` in `packages/core/src/i18n/locales/en.json` at
> `git show HEAD:…` and in the worktree: **110 → 116** (the files' whole-document
> key counts are 113 → 119; the extra three are the `locale` / `direction` /
> `fallback` envelope, which is not catalog content). The `112` this task quoted
> is real but is **its own phase-1 result**, not a repository baseline. The two
> phases, kept visible:
>
> | phase | date | keys | what was added |
> |---|---|---|---|
> | HEAD `2d51eec` | — | **110** | — |
> | phase 1 — SC 3.3.8 | 2026-09-18 | **112** | `DzPasswordInput.showPassword` · `.hidePassword` |
> | phase 2 — D117/A steppers | 2026-09-19 | **116** | `DzResizableHandle.shrinkPane` · `.growPane` · `DzTableCell.narrowColumn` · `.widenColumn` |
>
> Both phases belong to **this task**, so `110 → 116 (+6)` is the honest ratchet
> for the row; `110 → 112` and `112 → 116` are the honest phase splits.
>
> **Unit tests on the three surfaces: `77 → 102`, +25 — not +22.** Measured two
> ways, agreeing: a static count of `it(`/`test(` at file scope (no `.each`
> blocks exist in any of the three), and a real run —
> `yarn vitest run` over the three specs reports **102 passed / 3 files, exit 0**.
> Per file, HEAD → worktree: **`DzResizable` 9 → 21** (+12) ·
> **`DzSplitter` 13 → 19** (+6) · **`DzTable` 55 → 62** (+7). §9.2 step 5 and the
> live-progress checklist said *"13 → 20, 13 → 18, 55 → 62"*, which is wrong on
> four of the six numbers and **sums to 100**, contradicting this table's own
> (correct) `102`. Both spellings are corrected in place.

### 9.15 Owner decisions

| # | Decision | State |
|---|---|---|
| **D117** | SC 2.5.7 affordance | **taken by the owner 2026-09-19 — option (a)**, implemented, `openGaps`/`ceiling` 3 → 0 |
| **D118** | supported-browser floor | **taken by the owner 2026-09-19 — option (a)**, declared in six packages, page renders from the tree |
| **D121** | the six geometry changes | **reviewed by the owner 2026-09-19 — accept all six**, recorded per item |
| **D129** 🟠 | **The SC 2.5.7 lane loads story images from a third-party CDN.** `DzImageComparison`'s story uses `picsum.photos`, and the cell's result depends on those images having painted — measured failing twice cold and passing three times warm. The probe now waits, which removes the race but not the dependency | **new.** (a) point the story at a repository-local fixture image — deterministic, and it also removes a network call from every story render · (b) keep the remote images and accept that this cell cannot gate CI · (c) give the lane a retry. **rec. (a)**: a conformance result that depends on a CDN is not evidence, and (c) hides the property instead of removing it |
| **D130** 🟠 | **The Storybook static build exceeds its 25 MB budget** (25.02 MB; R5-O9 measured 24.90 MB). At most ~0.026 MB is this task's; the rest accumulated across the uncommitted work in this tree | **new.** (a) find and cut the growth — `assets/jsx-*.js` is 4.14 MB and `DzVisuallyHidden.stories` is 2.09 MB, both worth a look before the budget is touched · (b) raise the budget with a recorded reason · (c) leave it red. **rec. (a)**, and explicitly **not** (b) as a first move: the budget was promoted from a metric precisely so that growth has to be argued for |
| **D122** | done-checks that pass for the wrong reason | **unchanged and still open** — check 4 of this task's own block would still "pass" by matching English prose, and check 1 still throws |
| **D127** | the owner must commit the browser ledger | **unchanged** — until then `browser-degradation` is inert (§9.12) |

### 9.16 What this residual deliberately did not do

- **Did not build the tier-refusal gate** the browser-support statement warns
  about. Declaring a floor and enforcing it are different pieces of work; the
  second is R1-O5 / R0-O2 and nobody asked for it here.
- **Did not answer `DzOrderList.showControls`.** It is the same question as the
  opt-out prop this task refused, in a different component, and it is a public
  API narrowing. Decision sheet §7.3.
- **Did not fill an AT cell.** 0 of 534, unchanged.
- **Did not touch `known-failures.json`, `engine-exceptions.json` or any visual
  baseline.** Nothing failed, so there was nothing to triage, and no baseline
  covers the three components.
- **Did not fix the inherited reds**: `validate:tokens` on R2-O7's untracked
  `tier-fixtures.ts`, the three `yarn test` failures (`dzup-resolution`,
  `landing-token-fallbacks`, `story-dod-tiers countOpen`), the 9 `eslint e2e/`
  errors, the two async-options Storybook stories.
- **Did not commit, push, dispatch, publish, deploy or change a registry.**
