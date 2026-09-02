# Execution status — evidence-execution-tasks.md (N0-05 + N1-O1…O6)

> Live ledger for the **synchronous** run of
> [`evidence-execution-tasks.md`](./evidence-execution-tasks.md).
> Started **2026-08-31** against `ui/dzup-ui` `main` @ `51dec93`.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
>
> **Nothing here is committed, pushed, dispatched to CI, or published** — every
> packet stops at "locally qualified" per README §3 `<authority>`.

## Custody re-verification (README §2, re-checked 2026-08-31)

| Claim in README §2 | State at run start |
|---|---|
| `ui/dzup-ui` on `main` @ `51dec93` | **True.** `main...origin/main`, HEAD `51dec93 new version for themes`. |
| worktree **clean** | **No longer true — docs-only dirt.** ` M docs/program-2026-08/EXECUTION-STATUS.md`, ` M docs/program-2026-08/README.md`, `?? docs/program-2026-09/`. No `packages/**` or `apps/**` file is modified, so source-derived regeneration is still bound to `51dec93`. Recorded here because `TASK-N1-O2 <run_integrity>` rejects browser evidence from a dirty worktree — that stop condition is evaluated per task. |
| Generated artifacts record `sourceCommit 8d80bc39` | **True.** `component-ownership.manifest.json` and `capability-matrix.json` both read `8d80bc39653e50a6da458d005b7691d2fb833edb`. `public-api.manifest.json` carries no `sourceCommit`. `packages/contracts/quality-matrix.json` is **not at that path** — locate before quoting (N0-05 discovery). |
| Toolchain | Node `v24.14.1`, Yarn `4.16.0`, 117 root scripts, `validate:all` chains typecheck + lint + 26 validators. |

## Progress

| # | Task | Priority | Status | Result |
|---|---|---|---|---|
| 1 | TASK-N0-05 — Re-bind generated evidence artifacts to HEAD | 🔴 | `[x]` | 8 generators re-run in dependency order; **net change 4 files, 1 line each** (`sourceCommit` only). Determinism **proven** (100 files, 0 bytes differ across two runs). **Row-level delta zero** — 1,327 ownership entries, 144 tiers, 1,661 capability cells all unchanged. `validate:all` **exit 0**, 27/27 green. 5 findings → [handoff](./reports/N0-05-rebind-handoff.md) |
| 2 | TASK-N1-O1 — Author the 51 tier-required Story DoD items | 🔴 | `[x]` | **51/51 authored, ratchet 51 → 0.** 30 `States` / 11 `Accessibility` / 10 `RealWorld*` appended to 32 existing story files; every `play()` asserts. `validate:all` **exit 0** (27/27). Storybook **23.50 → 24.15 MB** of 25 MB. **Fixed a tooling defect that had silently disabled `storybook:test` since `d3047a8`** — every `play()` in the repo was unverified until now; lane is 1437/1440, all 51 new green, 3 failures pre-existing. **Zero `packages/core/src/` files touched**; 11 defects reported not fixed → [handoff](./reports/N1-O1-story-dod-handoff.md) |
| 3 | TASK-N1-O2 — Run the 12 Firefox/WebKit matrix projects | 🔴 | `[x]` | **All 12 executed, both sweeps run twice, 176 outcomes, 0 unclassified.** Firefox 151.0 / WebKit 26.5 / chromium 149.0. **Firefox reproduces all 46 chromium failures with zero divergence** — the 46 are a real cross-engine defect set, not a chromium artefact. WebKit: 44 defect + 2 excepted. **Found and fixed harness defect H1** — 84/88 WebKit `reduced-motion` cells were falsely failing on Storybook's own loader. Chromium ratchet 46 **untouched** (MD5 verified at 9 checkpoints). `validate:all` **exit 0**. Evidence is **worktree-dirty → not release-admissible** → [handoff](./reports/N1-O2-firefox-webkit-handoff.md) |
| 4 | TASK-N1-O3 — Fix 28 target-size + 18 reflow WCAG 2.2 failures | 🔴 | `[x]` | **Ratchet 46 → 0.** All 28 WCAG 2.5.8 and all 18 WCAG 1.4.10 cells fixed and re-measured; **all three engines run all six conditions, 1 056/1 056 each, exit 0** — 3 168 green cells, 0 failures, 0 exceptions, 0 divergences. Fixed at the token/variant layer: 1 new token (`--dz-control-target-min`), 4 utilities in `base.css`, 13 `.variants.ts`. **Three ledger diagnoses were wrong**: `DzLightbox` bound 10 `tv()` slot FUNCTIONS and rendered unclassed (correcting E4/D3); 11 of the 18 reflow entries were a **harness defect** (`layout: 'centered'` made the lane measure min-content width, not reflow); **31 `--dz-spacing-N-N` references named a token the scale never emits**, silently dropping 26 declarations. 0 of 18 reflow entries were component CSS. **2.5.7: 9/9 keyboard-operable, 6/9 meet the SC's single-pointer requirement**, 3 `[!owner]`. `validate:all` **exit 0**; `yarn test` red with 2 **pre-existing** tooling failures. → [handoff](./reports/N1-O3-wcag-fixes-handoff.md) |
| 5 | TASK-N1-O6 — Visual-regression ownership + 5th matrix input | 🟢 | `[x]` | **Decided: self-hosted Playwright, per-component, scoped by family, with a committed acceptance ledger.** Pilot `buttons` — 8 components x light/dark = **16 baselines, deterministic**: 4 cold runs, 64 captures, 16 SHA-256 digests, **zero divergence**, so the lane runs at `maxDiffPixels: 0` (the screen-level lanes' 0.01 ratio is 187 px on a DzButton canvas). **Authority rule proven, not asserted**: bulk `--update-snapshots` refused in-run; a changed digest fails `validate:visual-baselines` with no browser; `test:e2e:update` removed; `--bootstrap` recorded **0** against a tampered file. A 1 px padding change on DzButton was caught in **6 snapshots across 3 components** — including two that compose it and were never edited. Matrix input wired: **covered 8 · stale 0 · not-covered 136, zero `unknown`**; cell count unchanged at 1 661. `validate:all` **exit 0, 28 links** (new gate added). 3 stop-condition answers, 7 owner decisions → [memo](./reports/N1-O6-visual-regression-memo.md) · [handoff](./reports/N1-O6-visual-regression-handoff.md) |
| 6 | TASK-N1-O5 — Security corpus (DzFileUpload + 13 declarers) | 🟠 | `[x]` | **DzFileUpload security exceptions 2 → 0** — both replaced by real specs, and **one of the two exception texts was factually false**: `csp-fixture` claimed "no inline style" while the template root carried `style="contain: layout style"`, which `style-src-attr` blocks — so a strict CSP silently removed the containment the hostile corpus depends on. Corpus schema **v1.0.0 in `@dzup-ui/testing`, 34 fixtures / 6 categories**, outcomes keyed **per sink** (`javascript:` is `rejected` in `<a href>` and `inert` in `<img src>` — one global outcome cannot be true of both), shared by design with Pro TASK-N1-P1. **15 declarers, not 13** (13 `url` + 1 `file` + 1 `payload`); **263 fixture assertions bound, 372 tests green**. Security capability cells `2 present · 2 excepted · 41 unrun` → **45 present, 0 unrun, 0 excepted**. **No declared boundary was false** — but **there is no URL policy anywhere in `packages/core/src`**: 6 navigation components pass all 9 `url-scheme` fixtures straight to a live `href` (**54 measurements, high severity, breaking to fix → N5-02**), pinned in a new deviation register. `validate:all` **exit 0, 28 links**; `yarn test` red with the **2 pre-existing** failures only. → [handoff](./reports/N1-O5-security-corpus-handoff.md) |
| 7 | TASK-N1-O4 — Manual AT-matrix cells `[!owner]` | 🟠 | `[!]` | **22/22 Tier C/D components scripted — 126 steps, 397 checkable expectations, 62/62 story ids resolved against the 1 635-story built index.** Scripts are **generated** from `at-scripts.data.ts` so they cannot drift from the scaffold: the generator fails if a scaffold task has no step, if a step invents a task the pattern does not imply, or if a story id does not exist — **all six negative probes fired**. **AT cells executed 0/534 → 0/534, and that is the honest number**: no NVDA, no JAWS, no macOS/iOS/Android on this host (only Narrator, which is not a declared pair), and no tester assigned. **No run record was fabricated.** Two findings outrank the scripts: **(a) the capability matrix reads `pass` for a component whose every AT pair FAILED** — proven in memory, no fake row written; `CellState` has no `fail` value (E3's shape, in the neighbouring lane); **(b) 9 of 22 components have uncommitted source edits**, so a run today would stamp a false `sourceCommit`. Also: the scaffold declares **no tier-differentiated pairs — Tier D owes exactly what Tier B owes**; `DzSidebar` declares APG `treeview` while correctly shipping a `navigation` landmark; `DzCommandPalette` owes an `error` task it has no surface for. Cadence proposed: wave 1 = `nvda-firefox` + `jaws-chrome`, **44 cells, ~21 h**; full Tier C/D **132 cells, ~75 h**. `validate:all` **exit 0, 28 links**; `yarn test` red with the **2 pre-existing** failures only. **11 owner decisions** → [handoff](./reports/N1-O4-at-matrix-handoff.md) |

**Execution order rationale.** N0-05 is blocking (nothing may quote a number
bound to `8d80bc39`). O1/O2/O3 follow in file order — O2 measures, O3 fixes what
O2 and the chromium lane measured. O5 and O6 are independent; O6 is deliberately
run before O4 because O4's success criterion terminates in an owner gate
(named tester + cadence) that no agent can satisfy, so it is executed last and
is expected to land `[!]` with scripts + a cadence proposal delivered.

## Ratchet board (updated after every task)

| Ratchet | Ceiling at run start | Current | Task that moves it |
|---|---|---|---|
| unclassified ownership symbols | 29 | 29 | — (hold) |
| anatomy non-declaring | ~~137~~ **136** | 136 | N2-S1 — ceiling was **mis-documented in 4 places**; DzFileUpload lowered it 2026-08-24 |
| story-DoD tier-required open | 51 | **0** ✅ | N1-O1 — closed |
| browser measured failures (cross-engine) | 46 | **0** ✅ | N1-O3 — closed; `known-failures.json` has no entries |
| firefox measured failures | *(uninitialised)* | **0 defect · 0 divergence** | N1-O2 initialised at 46; N1-O3 closed it |
| webkit measured failures | *(uninitialised)* | **0 defect · 0 divergence** | N1-O2 initialised at 44+2; N1-O3 closed both divergences with a measured reason |
| AT cells executed / 534 | 0 | **0 — unmoved, and honestly so** | N1-O4 `[!]` — scripts + cadence delivered; execution needs a named tester, a committed tree, and the `at-manual` cell fix (§6.2 of its handoff) |
| DzFileUpload security exceptions | 2 | **0** ✅ | N1-O5 — closed; both are real specs |
| security-corpus deviations (component × sink × fixture) | *(uninitialised)* | **54** — ceiling 54 (42 high · 12 low) | N1-O5 initialised; every entry `publicBehaviourChange: true` → N5-02 |
| capability-matrix security cells `unrun` | 41 | **0** | N1-O5 — 45/45 `present` |
| visual coverage / 144 components | *(uninitialised)* | **8 covered · 0 stale · 136 not-covered** | N1-O6 initialised; rollout ranked in its handoff §6 (forms → data → inputs → media first) |
| accepted visual baselines with a recorded cause | 0 of 34 | **50 of 50** | N1-O6 — 34 grandfathered with their true capture commits, 16 pilot captures accepted individually |

---

## Findings carried forward (later tasks must bind to these)

| # | Finding | Consequence |
|---|---|---|
| F1 | **`sourceCommit` is recorded off by one by construction** — verified across three generations, each stamped its landing commit's *parent*. The quality and capability matrices **copy** the label instead of computing it; the capability matrix was really generated at `7984c68`. True drift was 13/13/12 commits, not the 15 the README claims — and only 6 files changed since, none of them a matrix-row source. | Explains why N0-05 moved nothing. Any task quoting a `sourceCommit` must state "records X (really generated at its child)". Fixing the stamp is an unscheduled defect, not this file's work. |
| F2 | **The anatomy ratchet ceiling is 136, not 137** — lowered by `DzFileUpload` on 2026-08-24, still documented as 137 in four places. | N2-S1's stated `137 → 124` would book a phantom −1. Recorded so nobody re-raises the ceiling. |
| F3 | **`generate:exports` was deliberately NOT run.** A sandboxed dry run (zero repo writes) shows it would drop `useAffix` / `useCalendar` / `useInfiniteScroll` / `useScrollSpy` / `useScrollToTop` and add `useCountdown` / `useIntersection`. | **Owner decision** — a generator reports, it never decides public API (`<generated_authority>`). Routes to the N5 release lane. |
| F4 | **`test-results/matrix-report.json` is git-ignored and is the sole copy of the chromium run.** Deleting it silently flips every browser capability cell to `unrun`. MD5-snapshotted before N0-05, verified intact after. | **N1-O2 and N1-O3 must not clobber it.** Any Playwright invocation that rewrites `test-results/` has to preserve or re-merge this file. |
| F5 | 11 stale `perf-baseline` cells are legitimately stale — a re-run artifact, not re-bindable by regeneration. | Stays stale until a perf re-run task exists. Not a defect. |

## Defect register (found by execution, deliberately NOT fixed)

These were surfaced by TASK-N1-O1 while authoring stories. Per its
`<no_gaming>` / stop conditions, component source was left untouched (0 files
under `packages/core/src/`). **D8–D11 were measured by the browser run, not
inferred** — four stories had to be rewritten to assert what the components
actually do rather than what they claim.

| ID | Defect | Severity |
|---|---|---|
| **D8** | **`useDualModel` silently ignores external writes after the first user edit — across 7 controls.** | **Highest** |
| D7 | `useFocusTrap` never restores focus on release. | High |
| D4 | Nested interactive controls inside `role="combobox"` buttons (`DzCascader`, `DzTreeSelect`). | High (a11y) |
| D1/D2 | Container-level `disabled` is presentational only (`DzTree`, `DzResizable`). | Medium |
| D3 | `DzMention`'s `loading` prop is shadowed by an internal ref. | Medium |
| D9 | `DzCombobox`'s clear button ignores `disabled`. | Medium |
| D10 | `DzTreeSelect` runs two focus mechanisms simultaneously. | Medium |
| D11 | `DzDropdownMenu` has a dangling `aria-controls`. | Low (a11y) |
| D5 | `:ariaLabel` typo. | Low |
| D6 | The story-DoD validator's own prop detection is over-broad. | Low (tooling) |

Three **pre-existing** `storybook:test` failures, in files N1-O1 never touched:
`DzFormField` / `DzFormParts` assert a `role="alert"` that `DzFormMessage`
deliberately dropped in `e986952`; `Localisation` passes `:options` to
`DzSelect`, which takes `items`, crashing at `DzSelect.vue:199`.

## Evidence-integrity findings from TASK-N1-O2

| # | Finding | Consequence |
|---|---|---|
| E1 | **The 46 measured failures are cross-engine.** Firefox reproduced all 46 — 41 with chromium's exact numbers, 5 differing only by Gecko text metrics. | Answers the open question the ledger itself posed. N1-O3 fixes one defect set, not three. |
| E2 | **The surviving chromium record only covers 2 of 6 projects** (`config.argv` proves it) — an ordinary partial re-run on 2026-08-25 overwrote the full 6-condition run. | The "46" was always a 2-condition number. A clean-tree 6-condition chromium re-run is owed, plus a degradation gate so a partial run can never again overwrite a full one. |
| E3 | **No browser-matrix capability cell was ever `unrun`** — the generator only checked that the report *file exists*, so all 89 read `pass` regardless of engine. | The matrix was overstating browser evidence. Now carries real per-engine coverage plus a new `browser-engine-ratchets` input. |
| E4 | **`DzLightbox:touch` is measurement-unstable** — 3 undersized controls at t=0, 0 at t=+1s, in a transient teleported overlay. | One chromium ratchet entry is a timing artefact, not a defect. N1-O3 must not "fix" it blindly. |
| E5 | **Playwright's WebKit on Windows is `Playwright.exe` (WinCairo) reporting a macOS UA.** | It is **not** Safari evidence. Any claim of Safari support needs a real macOS run. |
| E6 | **D5 answered:** ARIA reflection saves `:ariaLabel` on all 3 engines, but **SSR emits `<ul arialabel="…">`**. | A real defect **no browser matrix can ever see**. Needs an SSR-side gate. |

## Findings from TASK-N1-O3 (these correct or extend the ones above)

| # | Finding | Consequence |
|---|---|---|
| **G1** | **E4 was wrong, and the correction matters more than the entry.** `DzLightbox:touch` was not a timing artefact. The component's template bound **ten `tv()` slot functions without calling them** (`:class="styles.closeButton"`), so `normalizeClass` returned the empty string and **DzLightbox rendered with no classes at all** — no backdrop, no blur, no sizing, no positioning. The close control measured 16×16 and the nav controls 20×20 because that is the size of the bare SVG inside them, against the 32×32 and 40×40 the variants declare. The overlay's short teleported life is why it was hard to catch, not what was wrong. **Owner decision D3 in the N1-O2 handoff is superseded.** | A repo-wide scan found DzLightbox is the **only** component with the bug — and that **every one of its bindings had it**. Nothing in the repository can see this class of defect: typecheck, lint, unit specs, contract specs and story-DoD all passed on a component that rendered unstyled. A one-expression validator would catch it. |
| **G2** | **31 references to `--dz-spacing-N-N` name a token the scale does not emit** (it emits `--dz-spacing-N_N`), across 15 files. 26 carry no fallback, so the CSS parser dropped the whole declaration and the padding or gap was simply absent — which is why a `DzTree` node row measured 21 px, its own text height. | Fixed in all 31 places. `validate:tokens`' reference-integrity check reads `DESIGN.md`, not component source, so **no gate in a repository with 29 validators could see it**. A gate that extracts every `var(--dz-…)` from `packages/core/src` and checks it against the emitted token maps is the same size as the existing check. |
| **G3** | **Harness defect H2: the `zoom-400` condition was not measuring reflow.** Storybook's global `layout: 'centered'` makes `#storybook-root` a flex item with `min-width: auto`, so the canvas is sized by the story's **min-content width** and the component is never given a 320 px containing block. `DzTable`'s own `overflow-auto` wrapper was never squeezed and never engaged. **11 of the 18 reflow entries were this, not a component.** | Fixed in `conditions.spec.ts` with three declarations and the measurement that justifies them. The condition is now **stricter**, not weaker: every target is genuinely asked to reflow into 320 px, and the full sweep is still 1 056/1 056. Same class as N1-O2's H1. |
| **G4** | **Zero of the 18 reflow failures were component CSS.** 11 harness, 5 story fixtures with a hard-coded width, 2 story fixtures with a non-wrapping flex row. **No WCAG 1.4.10 exception was claimed** — not the data-table one the Understanding document would have granted `DzTable` and `DzDataGrid`. | The library's reflow story is far better than the ratchet suggested. It also means the docs site can publish 1.4.10 conformance without an exception footnote. |
| **G5** | **WCAG 2.5.7 is not met for two operations.** All 9 drag surfaces are keyboard-operable, but the SC requires a **single pointer without dragging**, which pane resize (`DzResizable`/`DzSplitter`) and column resize (`DzTable`) do not have. Reka's `SplitterResizeHandle` binds only focus/blur plus the drag. | The library's only open WCAG 2.2 AA gap after N1-O3. APG's Window Splitter pattern specifies keyboard only, so the affordance is a design decision — `[!owner]`, with a scoped follow-up in the handoff §6.5. |
| **G6** | **`yarn test` is red with 2 failures, both pre-existing and neither in this task's lane.** `landing-token-fallbacks` (6 hard-coded colour fallbacks in the landing themes page disagree with their tokens) and `story-dod-tiers > countOpen > subtracts a waiver` (its fixture asks the live repo for an open tier-required item — **N1-O1 drove that count to 0**, so `find` returns `undefined`). | `yarn validate:all` does not run `yarn test`, which is why neither had surfaced. T2 is N1-O1's success breaking its own unit test; T1 belongs to the landing app. |

## Order change after TASK-N1-O3

**N1-O6 promoted ahead of N1-O5.** N1-O3 left **six unreviewed visible geometry
changes** (tree rows 21 → 33 px; DzLightbox going from unstyled to styled) and
N1-O6 exists precisely because *"target-size and reflow fixes change geometry
with no gate to catch unintended visual drift"*. Running O6 now captures the
pilot baselines **after** the geometry change rather than straddling it. O5
touches security fixtures, not geometry, so it loses nothing by waiting.

## Agent-stall note (TASK-N1-O3)

The O3 agent stalled ~10 min after writing its handoff, during a final sweep.
Because a stalled agent is not a trustworthy reporter, the orchestrator
**independently re-verified** the two load-bearing claims: `yarn validate:all`
→ **exit 0**, and `e2e/matrix/known-failures.json` → **0 open entries**. Both
hold. The handoff is complete through §9 and its appendix.

## Findings from TASK-N1-O6 (visual regression)

| # | Finding | Consequence |
|---|---|---|
| **J1** | **The repository already had TWO visual-regression systems, both configured never to fail.** The Playwright visual lane runs in CI with `continue-on-error: true` ("report-only"); Chromatic has a workflow, a dependency, TurboSnap and light/dark modes in `preview.ts`, and runs `continue-on-error` **and** `exitZeroOnChanges`, needing a token that is not in the repo. | The missing piece was never a comparator. It was authority — a reason to believe a green run means something. That reframed the task from "pick a tool" to "write the rule", which is why self-hosted Playwright won. **Chromatic is now "finish or retire", `[!owner]`, with the volume known: 1,440 stories × 2 modes = 2,880 snapshots per full build.** |
| **J2** | **The 34 committed baselines had no recorded origin** — no author, no reason, no capture commit — and `yarn test:e2e:update` was `playwright test --update-snapshots`: one command, all 34 rewritten anonymously. | All 34 are now in `e2e/visual/visual-baselines.json` with their **true** capture commits recovered from git (`b550403`, `cfd4835`, `078c1dd`, `fd5dd49`) and a reason that says plainly this is custody, not review. Every change from here needs a stated cause. |
| **J3** | **Baselines are platform-locked and nobody had decided which platform is authoritative.** Playwright writes `{arg}-{project}-{platform}.png`; all 34 committed baselines are `chromium-linux` (CI is `ubuntu-latest`) and this host writes `chromium-win32` — a different file, never compared. | Recorded as `scope.platform` vs `scope.ciPlatform` in the ledger, and the gate reports the disagreement on every run. **The per-component lane is developer-local evidence until one accept pass runs on Linux.** `[!owner]` |
| **J4** | **Determinism measured, not assumed. Windows font rasterisation is not a source of drift here.** 4 cold runs (3 probes + the acceptance capture), 64 captures, 16 SHA-256 digests, **zero divergence** — and the baselines still matched at zero tolerance after two full Storybook rebuilds. | The lane runs at `maxDiffPixels: 0`. No tolerance above zero was bought, so the stop condition about loosening past 0.1 % never engaged. For contrast the screen-level lanes' `maxDiffPixelRatio: 0.01` is **187 px** on the measured 154 × 122 `DzButton` canvas. |
| **J5** | **The lane catches composition fan-out, which is the class of drift N1-O3 produced.** A 1 px padding change on `DzButton` failed **6 snapshots across 3 components** — `DzButtonGroup` and `DzSplitButton` moved without either source file being edited, and the other 5 button components correctly did not. | Answers the question the task's motivation asked. A screen-level snapshot cannot name which component moved; this one can, and it separates "this component changed" from "everything re-rendered". |
| **J6** | **`yarn lint` does not cover `e2e/`** — its target is `packages/ apps/`. `eslint e2e/` finds 9 pre-existing errors, and the whole browser harness (18 matrix projects, 3 visual specs, the AT scaffold) is outside the lint gate. | A one-word change to the lint target plus 9 fixes. Deliberately not done here — widening a repo-wide gate mid-task would mix this task's result with somebody else's debt. |
| **J7** | **Three Windows/Playwright harness traps, each of which failed silently.** (a) Node refuses to spawn `npx.cmd` without a shell (CVE-2024-27980 fix), so the accept tool failed with **no child output**; (b) Playwright's `--grep` matches the full title *path*, so a `^`-anchored pattern selects **zero tests and exits 0**; (c) a stale `vite preview` from N1-O3 still held port 6106, and `STORYBOOK_E2E_STATIC=1` forces `reuseExistingServer: false`. | All three fixed or worked around and written down. N1-O3's handoff says `.pw-out/` is removed at task end — it was not, and neither was its server. |

## Findings from TASK-N1-O5 (security corpus)

| # | Finding | Consequence |
|---|---|---|
| **S1** | **The `csp-fixture` exception was factually false, and the falsehood was load-bearing.** It said *"No inline style … so there is no CSP directive whose absence changes its behaviour."* The template root carried `style="contain: layout style"`. A style **attribute** is governed by `style-src-attr`, which falls back to `style-src`, so a strict CSP without `'unsafe-inline'` **drops it** — removing exactly the containment the hostile corpus relies on to keep a 4 096-character file name inside the component box. | The hosts that configured CSP most carefully got the least contained control, and **no gate in a repository with 29 validators could see it**. Same class as G1 (`DzLightbox`'s uncalled `tv()` slots) and G2 (`--dz-spacing-N-N`). Fixed by moving the declaration into the `tv()` recipe as `[contain:layout_style]` — the form `DzCard`/`DzPanel` already used, and the one the styling contract requires. **78 other `.vue` files still carry a static `style="contain: …"`, and 38 bind a dynamic `:style` that cannot become a class.** |
| **S2** | **There is no URL policy anywhere in `packages/core/src`** — no scheme check, no allowlist, no normalization. Measured, not inferred: all **9** `url-scheme` fixtures reach the rendered `href` verbatim on all **6** navigation-sink components (`DzButton`, `DzAnchor`, `DzBreadcrumb`, `DzMenu`, `DzSidebar`, `DzMegaMenu`) — 54 measurements. Mixed case, a leading C0 control and an embedded tab all pass too, so a future policy built on `startsWith` would close one of four. | **High severity, and breaking to fix**: `javascript:void(0)` renders today and would stop. Reported, not fixed, per the task's stop condition → **release lane N5-02**. The allowlist, the rejection shape (no `href`, never a rewritten `#`) and the escape-hatch location (provider, not prop) are written up in `url-boundary.threat-model.md` §2a; `effectiveScheme()` in `boundary-suites.ts` is already the normalizer a fix needs. |
| **S3** | **No declared boundary turned out to be false, and the subresource half is genuinely clean.** All 8 `<img src>` bindings meet `inert`; all **151** hostile-content assertions pass (markup injection, attribute break-out, mXSS comments, bidi override, embedded NUL, stacked combining marks, 4 096-char runs) in **both** text and attribute contexts. | **No component in the catalog has a markup-escaping defect.** The residual on image sinks is not XSS but an unconditional GET to an origin the page author did not choose — the host's `img-src`, which the documentation has to say. |
| **S4** | **Three declarers have no sink of their own.** `DzMenu`, `DzSidebar` and `DzBreadcrumb` declare `url`; the `href` lives on `DzMenuItem` / `DzSidebarItem` / `DzBreadcrumbItem`, **none of which are among the 144 matrix rows**. `DzAvatarGroup` is the same shape for `src`. | *"Which components own a URL sink"* cannot be answered from the matrix alone. Either compound sub-parts become rows (and owe evidence), or the matrix documents that a parent's boundary covers its parts. `[!owner]` |
| **S5** | **`DzQRCode` has an undeclared URL sink.** Its `icon` prop becomes `<img src>` — word for word `DzImage`'s boundary justification — but `SecurityBoundary` holds **one value per component**, so declaring `payload` means the URL rows are never asked for. | Bound and asserted anyway (measures `inert`), but the matrix cannot express it. Making `securityBoundary` a set is an owner decision. `[!owner]` |
| **S6** | **The declarer count in the task file and this ledger was wrong: 15, not 13.** 13 `url` + 1 `file` (`DzFileUpload`) + 1 `payload` (`DzQRCode`). | The 13 is the `url` subset. All 15 are covered. |
| **S7** | **The resolution gate caught this task's own export addition.** `dzup-resolution.spec.ts` snapshots every `@dzup-ui/*` specifier and went red on the new `@dzup-ui/testing/security-corpus` subpath. | Working as designed — updated by hand in sorted position, not by `-u`. Worth knowing for anyone adding an export subpath. |

## Owner decisions accumulated (nothing below is an agent call)

| # | Decision | Raised by |
|---|---|---|
| **Name an AT tester and adopt a cadence.** This is TASK-N1-O4's `<owner_gate>` itself and nothing downstream moves without it. Wave 1 (`nvda-firefox` + `jaws-chrome` over the 22 Tier C/D components) is **44 cells, ~21 h**; the full six-pair Tier C/D sweep is **132 cells, ~75 h**. | O4 |
| **The capability matrix publishes a FAILED AT run as `pass`.** `at-manual` counts `result !== 'unrun'` as executed and never inspects the value, so all-six-`fail` resolves to `state: 'pass'`. Proven in memory without fabricating a row. `CellState` has no `fail` value, so the repair is a schema change five packets read. **Must be closed before the first wave lands** — executing cells before it is worse than 0/534. Same shape as E3. | O4 |
| **The AT scaffold declares no tier-differentiated pairs: Tier D owes exactly what Tier B owes** (all six pairs; `evidenceOrigin: "tier B"` on every C/D row). Confirm, or widen Tier D. | O4 |
| **`DzSidebar` declares APG `treeview` but correctly ships `role="navigation"`** — APG recommends against tree/menu patterns for site navigation, so the *declaration* is wrong, not the component. Fix the metadata, or the component. Left as a permanent asterisk on one script until decided. | O4 |
| **`tasksFor()` has no per-component opt-out**, so `DzCommandPalette` owes an `error` task it has no validation surface for. `unrun` would be a lie (`unrun` means the AT was unavailable). Add an opt-out, or accept a permanent not-applicable note. | O4 |
| **The AT row schema cannot express a per-task result** — the generated header instructs "one row per `{task, pair}`" and the seven columns have no task column. Change the header text, or add the column to an append-only format that already holds 534 rows. | O4 |
| **Should `validate:at-scripts` become link 29 of `validate:all`?** Deliberately left out so this task's result is not mixed with the chain's. | O4 |
| **Six components put an unfiltered host URL into a live `<a href>`** and closing it is a breaking change (`javascript:void(0)`). The allowlist, rejection shape and escape-hatch location are specified; the decision is not an agent's. | O5 |
| **`securityBoundary` is one value per component**, so `DzQRCode` cannot declare both `payload` and `url` and its `icon` sink is invisible to the matrix. | O5 |
| **Compound sub-parts are sinks but not matrix rows** (`DzMenuItem`, `DzSidebarItem`, `DzBreadcrumbItem`). Make them rows, or document that a parent's boundary covers its parts. | O5 |
| **78 components emit a static `style` attribute a strict CSP blocks, and 38 bind a dynamic `:style` that cannot become a class.** The library cannot make a CSP claim until this has a repo-wide answer. | O5 |
| **No browser has verified any CSP claim.** jsdom does not enforce CSP; the specs prove emitted constructs, not acceptance. Same shape as E5. | O5 |
| **The capability-matrix generator gained a new input** — `packages/core/security/coverage.json`, declaring which components a class-level artifact covers (the generator fails if the named file is absent). Same kind of extension as N1-O6's fifth input. Confirm, or choose 13 stub threat-model documents instead (rejected here as box-ticking). | O5 |
| **The tree is dirty, so every number in this program is inadmissible as release evidence.** Committing it and re-running the three sweeps (~50 min unattended, expected to reproduce exactly) is the single highest value-per-minute action available. | O2 · O3 |
| **WCAG 2.5.7 is still not met for pane resize and column resize** (`DzResizable`/`DzSplitter`/`DzTable`) — no single-pointer, non-drag path. APG's Window Splitter pattern specifies keyboard only, so there is **no precedent to follow**; choosing the affordance is a design decision. | O3 |
| **Six visible geometry changes are unreviewed by a designer.** N1-O6 built the lane that would hold them and **captured its pilot baselines after those changes**, so nothing yet reviews them; rollout ranks 1–4 pair capture with the review. | O3 · O6 |
| **Chromatic is configured, tokenless and non-blocking — finish it or retire it.** 2,880 snapshots per full build. | O6 |
| **The authoritative baseline platform is undecided** — committed baselines are `linux`, the pilot's are `win32`, and they are never compared. | O6 |
| **The CI visual step is `continue-on-error: true`**, so no visual regression can fail a build today. | O6 |
| **Should `visual-baseline` become an `EvidenceKind`?** It would give every component a real matrix cell, and it changes what all 144 components owe. | O6 |
| **`validate:tokens` cannot see a broken `--dz-*` reference in component source** — 31 references named a non-existent token, 26 silently dropping a declaration, and every gate stayed green for months. | O3 |
| **A `tv()` slot bound without being called is invisible to every gate** — `DzLightbox` shipped ten, and typecheck, lint, unit specs, contract specs and story-DoD all passed. | O3 |
| **`generate:exports` would change the public API** (drops 5 composables, adds 2). | N0-05 |
| **The browser record is still unpersisted and unprotected**; `validate:capability-matrix` should fail when a cell degrades `pass` → `unrun`. | O2 · O3 |
| **Two pre-existing `yarn test` failures** leave the full unit suite red (a landing themes-page drift; and a validator spec that N1-O1's own success broke). `validate:all` does not run `yarn test`, which is why they never surfaced. | O3 |

## What TASK-N1-O6 proved (the fan-out this program had no gate for)

Baseline authority was **demonstrated, not asserted**. Three controls ship: an
in-run guard, a browser-free digest gate (`validate:visual-baselines`, now link
15 of `validate:all`), and `test:e2e:update` replaced by a refusal. Each was
shown to fire: a changed digest → exit 1; **bulk `--update-snapshots` → refused**;
more than one snapshot per invocation → refused; a missing or placeholder
`--reason`/`--by` → refused.

Then end-to-end: **a 1 px padding change on `DzButton` failed 6 snapshots across
3 components** — `DzButtonGroup` and `DzSplitButton` moved without their own
sources being edited. That is precisely the uncaught geometry fan-out N1-O3
created and could not see.

**Windows font rasterisation was measured and is not a drift source here**, so
the lane runs at `maxDiffPixels: 0` rather than the screen lanes' 0.01 ratio
(which would be 187 px on the measured 154 × 122 DzButton canvas).

**Blunt caveats, recorded in the ledger and re-reported by the gate every run:**
baselines are **platform-locked** — the pilot's are `win32`, CI is `linux`, so
**this lane cannot gate CI until one accept pass runs on Linux** `[!owner]`.
Nobody has reviewed the 16 images; they are first captures taken **after**
N1-O3's geometry changes. `yarn lint` does not cover `e2e/` (9 pre-existing
errors live there). Chromatic/Argos stay `[!owner]` — 1,440 stories × 2 modes =
**2,880 snapshots per build**.

**Rollout:** 272 snapshots remain, ranked forms → data → inputs → media (all six
unreviewed N1-O3 changes fall in ranks 1–4). Full sweep ~4.5 min; a family costs
10–20 min through the sanctioned `--bootstrap` first-capture path, which cannot
launder a change.

## The finding TASK-N1-O5 was built to surface

**There is no URL policy anywhere in `packages/core/src`. HIGH severity.**
All 9 url-scheme fixtures reach a live `href` **verbatim** on all 6 navigation
components — **54 measurements** — including mixed-case, leading-control and
embedded-tab evasions.

**Deliberately not fixed.** `javascript:void(0)` renders today, so closing this
is a breaking change and belongs to **TASK-N5-02**'s lane, not here. It is
pinned in a new `security-deviations.json` that fails in **both** directions —
it breaks if the hole widens *and* it breaks if the hole is silently closed
without the release packet.

**The `csp-fixture` exception was factually false.** It claimed "no inline
style" while the template root carried `style="contain: layout style"` —
blocked by `style-src-attr`, so a strict CSP was silently removing the very
containment the hostile corpus depends on. Fixed by moving it into `tv()` as
`[contain:layout_style]`, the form `DzCard`/`DzPanel` already used.

**No declared boundary was false** — the DzLightbox precedent did not repeat.
All 8 subresource sinks and all 151 hostile-content assertions pass.

**Schema decision worth knowing:** a fixture carries an expected outcome **per
sink kind**, not one globally. `javascript:alert(1)` must be `rejected` in
`<a href>` and is `inert` in `<img src>` — no single global outcome is true of
both. Pro's sink registry already has "sink kind" as a column, so it is the
lookup key with no translation table. There is deliberately **no "unsafe" value
in the schema**; that belongs to measuring code.

**Left unproven, stated plainly:** jsdom does not enforce CSP, so the specs
prove *emitted constructs*, not browser acceptance. **78 other components still
emit a CSP-blocked `style` attribute and 38 bind a dynamic `:style` that cannot
become a class.** All client-side; no SSR pass was run.

---

## Run complete — 2026-09-01

**6 of 7 tasks `[x]`, 1 `[!]` by design.** Every ratchet an agent could close is
closed; the one that remains needs a human with a screen reader.

| Ratchet | Start | End |
|---|---|---|
| story-DoD tier-required open | 51 | **0** ✅ |
| browser measured failures (cross-engine) | 46 | **0** ✅ |
| DzFileUpload security exceptions | 2 | **0** ✅ |
| firefox / webkit engine divergences | *uninitialised* | initialised, then **0 / 0** ✅ |
| security capability cells unrun | 41 | **0** ✅ |
| AT cells executed | 0 / 534 | **0 / 534** — `[!]` owner-gated |
| unclassified ownership symbols | 29 | 29 (holds) |
| anatomy non-declaring | 136 | 136 (holds — N2-S1's work) |

**Aggregate gate: `yarn validate:all` → exit 0, 28 links green**, independently
verified by the orchestrator after the final task. `yarn test` is red with
exactly two pre-existing failures, neither owned by this program.

**No ceiling was ever raised.** No commit, push, CI dispatch, publication or
baseline replacement was performed by any task.

### The four defects this program found that no gate could see

| Defect | Why it was invisible |
|---|---|
| **`DzLightbox` had ten `tv()` slots bound but never called** — every DzLightbox rendered completely unstyled. | Typecheck, lint, unit specs, contract specs and story-DoD all passed. A bound-but-uncalled slot is valid code. |
| **`storybook:test` could not start at HEAD** since `d3047a8` — so **every `play()` function in the repo was unverified**. | The lane failed at config load, which reads as infrastructure noise rather than a red test. |
| **No URL policy exists anywhere in `packages/core/src`** — 9 hostile schemes reach a live `href` verbatim across 6 components. | Nothing asserted the absence of a thing. |
| **`at-manual` cell resolution publishes `pass` for a component whose every AT pair FAILED** — `CellState` has no `fail` value. | The AT lane has never run, so the bug had no way to manifest. **It would have corrupted the first real AT wave.** |

Plus two evidence-integrity findings: **no browser capability cell was ever
really `unrun`** (the generator only checked the report file existed), and
**the surviving chromium record covers 2 of 6 conditions** — the "46" was always
a partial number.

### What the owner must decide (nothing below is an agent call)

1. **Commit the tree, then re-run.** Every number here is *locally qualified,
   worktree-dirty* and therefore **inadmissible as release evidence**. ~50 min
   unattended, expected to reproduce exactly. Highest value per minute available.
2. **Fix `at-manual` cell resolution before the first AT wave**, or the wave
   publishes failures as passes.
3. **Name an AT tester and a cadence** — wave 1 is 44 cells / ~21 h.
4. **WCAG 2.5.7 pane- and column-resize affordance** — the library's only open
   AA gap, procurement-visible under the EAA, and it has **no APG precedent**,
   so it is a design decision.
5. **The URL-policy fix is breaking** (`javascript:void(0)` renders today) →
   TASK-N5-02.
6. **One visual-baseline accept pass on Linux** — baselines are win32-locked, so
   the lane cannot gate CI until then.
7. **Design review of six unreviewed geometry changes** from N1-O3.
8. **`generate:exports` would change the public API** (drops 5 composables,
   adds 2) — deliberately not run.
