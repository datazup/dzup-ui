# TASK-S1-O4 — the eight doc-06 performance scenarios, audited

> Programme: [Architecture Review 2026-09-22](../README.md) · file
> [evidence-execution-tasks.md](../evidence-execution-tasks.md) · agent run
> **2026-09-23**. Companion to
> [`TASK-S1-O4-handoff.md`](./TASK-S1-O4-handoff.md).
>
> **Commit every number is bound to:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
> (`4e4e46f`), with the six prior tasks' work uncommitted in the worktree.
> **Locally qualified only** — measured once, on one contended Windows
> workstation, never in CI. Nothing here is CI, release or production evidence.
>
> **No baseline was captured, replaced or written.**
> `packages/core/perf/baselines.json` is byte-identical to its HEAD blob
> (`sha256 dad67bf4…`) before and after every run recorded below.

---

## 0. Where the "eight" comes from, and why the list below has eight rows

2026-08-11 doc 06 §"Performance and reliability contract"
(`workspace-docs/repos/ui/docs/architecture/dzup-ui-system-reassessment-2026-08-11/06-quality-accessibility-i18n-security-spec.md`
lines 135–150) is a list of **seven bullets**, not eight. The S1-O4 packet says
"eight measured scenarios" and its own `<requirements><example>` numbers
*optional-engine load* as **#7**, which is bullet **6** of the seven. Exactly
one split reconciles the two, and only one bullet can carry it: bullet 4,
*"p50/p95 interaction latency **and** peak/retained memory"*, is the only one
that joins two different instruments measuring two different quantities. Every
other bullet names one measurement with a qualifier.

So the numbering used throughout this report is:

| # | doc-06 source | split? |
|---|---|---|
| 1 | per-entry gzip/brotli and retained-module size | bullet 1 |
| 2 | Core-only and Core + one-Pro-component startup/hydration | bullet 2 |
| 3 | Tier C dataset scenarios: mount, first usable render, scroll, selection/edit, filter/sort, layout, teardown | bullet 3 |
| 4 | p50/p95 interaction latency | bullet 4a |
| 5 | peak/retained memory | bullet 4b |
| 6 | long-task count and animation frame stability | bullet 5 |
| 7 | optional-engine load separated from Dzup wrapper overhead | bullet 6 |
| 8 | no listener/observer/portal leakage after repeated mount/unmount | bullet 7 |

This derivation is recorded rather than assumed because **the transcription is
the audit's baseline** (`<discovery>` step 3), and a reader who counts seven
bullets and eight rows must be able to see which one was split and why. The
alternative readings — splitting bullet 1 into gzip/brotli and retained-module
size, or bullet 3 into per-sub-scenario rows — both put optional-engine load at
a number other than 7 and are therefore refuted by the packet's own example.

---

## 1. The verdict table

`covered` / `partially covered (what is missing)` / `not covered (proposed
task)`, per `<requirements><scenario_honesty>`. **No scenario was redefined to
fit the lane that exists.**

| # | doc-06 scenario | Lane | Verdict | Evidence / proposed task |
|---|---|---|---|---|
| 1 | per-entry gzip/brotli and retained-module size | `size:*` via `perf/export-sizes.ts` (22 Tier C/D exports) | **partially covered** — gzip yes; **brotli absent**; **retained-module size absent**; and no test asserts a `size:*` metric at all | 22 gzip baselines committed. Re-measured here at `4e4e46f`: **20 of 22 exceed their committed threshold**, worst `size:DzMention` 22,421 → 25,965 B (**+15.8 %**). Deterministic (cv 0.000), so this is the one scenario that is fully measurable on *any* host. Gaps → **TASK-S1-O4-a** |
| 2 | Core-only and Core + one-Pro startup/hydration | `perf-lanes/hydration-lane.spec.ts` → `hydration:core-{only,pro}:{ssr,hydrate,tti}` | **partially covered** — core-only implemented and measured, **not baselined**; core-pro implemented and honestly **unrun** | core-only at `4e4e46f`: ssr median 8.19 ms (cv 1.96), hydrate 12.42 ms (cv 0.59), tti 20.61 ms (cv 1.13) — every cv far above the 0.25 measurable limit, so **unmeasurable on this host**. core-pro prints `unrun — DZUP_PRO_TARBALL is not set`; satisfying it is a named external precondition, out of scope here per `<repository_boundary>`. → **TASK-S1-O4-b** |
| 3 | Tier C dataset: mount · first usable render · scroll · selection/edit · filter/sort · layout · teardown | `perf-bench.spec.ts` (11 runtime metrics) | **partially covered** — **2 of 7** sub-scenarios reached; **4 of 7 are not measurable in jsdom at all** | mount: 8 metrics over **4 of 21** Tier C components (`DzDataGrid` ×3, `DzTable` ×3, `DzAccordion`, `DzTabs`). selection/edit: partial (`DzListbox:arrow-down-10`, `DzDialog:open-close`). teardown: **bundled into mount**, never separated — `wrapper.unmount()` sits inside the timed block. first usable render, scroll, layout: **absent and unreachable** — jsdom paints nothing, lays out nothing and scrolls nothing. filter/sort: **absent**. → **TASK-S1-O4-c** (browser lane) and **TASK-S1-O4-d** (separate teardown, widen mount coverage) |
| 4 | p50/p95 interaction latency | `statistics.ts` `Distribution` + 2 interaction scenarios | **partially covered** — p50 **is** the gate, p95 is **recorded and never gated**, and only 2 interaction scenarios exist | `isRegression()` compares `fresh.median > threshold` only; `p95` is stored on every distribution and read by no assertion. Both interaction metrics (`DzDialog:open-close`, `DzListbox:arrow-down-10`) are recorded `unmeasurable: variance-exceeds-signal`. → **TASK-S1-O4-e** |
| 5 | peak/retained memory | `perf-lanes/memory-lane.spec.ts` → `memory:<c>:heap-delta-20`, 22 components | **partially covered** — **retained** measured (no baseline); **peak absent** | Ran here: 22 metrics, all `no baseline`, e.g. `DzCalendar` 469,552 B median. The instrument samples `n=2` per process run with cv 0.72–1.16 — a capture would aggregate to n≥10 but almost every metric would still land `unmeasurable` on a host this noisy. Peak (high-water) heap is not sampled at all. → **TASK-S1-O4-f** |
| 6 | long-task count and animation frame stability | `perf-lanes/long-task-lane.spec.ts` → `longtask:<c>:{over-50ms,worst-span}`, 22 components | **partially covered** — long-task count implemented (no baseline); **animation-frame stability absent** | Ran here: **3 of 22 components run a task over 50 ms** — `DzCombobox`, `DzCommandPalette`, `DzPersonaSelector`, each median 1, **cv 0.00, deterministic within the run**. `worst-span` is recorded and deliberately never gated. Frame stability needs a compositor; jsdom has none. → **TASK-S1-O4-g** |
| 7 | optional-engine load separated from Dzup wrapper overhead | — | **not covered** | Nothing separates engine cost from wrapper cost, and the lane that exists **hides** it: `export-sizes.ts` lists `@internationalized/date`, `@floating-ui/vue`, `qrcode-generator` and `lucide-vue-next` in `EXTERNALS`, so every `size:*` figure excludes the engine by construction. `packages/core` declares no optional peers (`peerDependenciesMeta` is absent) and core source contains no dynamic engine import — the only `import()` in `packages/core/src` is `import('vue')`, 5 sites. → **TASK-S1-O4-h** |
| 8 | no listener/observer/portal leakage after repeated mount/unmount | `perf-lanes/leak-lane.spec.ts` → 5 metrics × 22 components, 50 cycles | **partially covered** — the detector is real, unconditional and green; the **gate is not reachable** because no baseline exists | Ran here: **110 metrics, every one `no growth` over 49 counted cycles, 0 leaks**. The lane's only failure path is `judge(...)` → `verdict.fail`, which returns `false` whenever the metric has no baseline — so at `4e4e46f` this lane **cannot fail**, whatever `DZUP_PERF_GATE` says. The seeded-failure checks above it *are* unconditional, so a broken detector is still loud. → **TASK-S1-O4-i** |

**Score: 0 covered · 7 partially covered · 1 not covered · 0 not-applicable.**

---

## 2. The finding that runs through six of the eight rows

**Four of the six declared metric families have no baseline at all.**

`packages/core/perf/baselines.json` is schema **1.0.0** and holds **33
baselines: 22 `size` + 11 `runtime`, and nothing else.** TASK-R2-O7 built the
`leak`, `longtask`, `memory` and `hydration` lanes, ran them, and captured them
only into a **proposal**
(`docs/program-2026-09-04/reports/TASK-R2-O7-baseline/baselines.proposed.json`,
at `2d51eec`) — correctly, because adopting a budget is an owner act. The
proposal was never adopted, so the committed file still predates those lanes.

Measured, not inferred. `DZUP_PERF_GATE=1 yarn test:perf` at `4e4e46f`:

| family | metric observations | verdict |
|---|---:|---|
| `leak` | 110 | **no baseline** ×110 |
| `longtask` | 44 | **no baseline** ×44 |
| `memory` | 22 | **no baseline** ×22 |
| `hydration` | 3 | **no baseline** ×3 |
| `runtime` | 11 | 9 `not yet measurable` · **2 `ok`** |
| `size` | 0 | **no test asserts a `size:*` metric** (D135) |
| | **190** | |

**Two of 190 metric observations could have failed.** The other 188 are
structurally incapable of failing: 179 have nothing to compare against, 9 have
no threshold, and the 22 deterministic size budgets are asserted by no test.
That single number is the honest state of the performance contract at `4e4e46f`,
and it is the evidence behind the `DZUP_PERF_GATE` recommendation in the
handoff §7.

---

## 3. What can be measured *here*, and what needs the authoritative host

`<stop_conditions>` asks for this split explicitly, and the leak / long-task /
memory families named in the task title fall on three different sides of it.

| scenario | measurable on this workstation? | why |
|---|---|---|
| 1 — export size | **yes, exactly** | A gzipped byte count is deterministic. Measured here: cv 0.000 on all 22, and the 20 breaches are a fact about the code, not the machine. |
| 8 — leak counts | **yes** | A listener either survives unmount or it does not. The count is an integer produced by the component's own teardown, not by the clock. All 110 read 0 here and would read 0 on any host. |
| 6 — long-task **count** | **mostly** — but the 50 ms boundary is the machine | Within this run the counts are deterministic (cv 0.00), yet whether a span crosses 50 ms depends on the CPU. The 3 breaches found here are real on *this* class of host and must be re-confirmed on the designated one before they become budgets. |
| 6 — frame stability | **no** | Needs a compositor. jsdom has none. |
| 5 — retained memory | **no** | Measured (the collector is available — `heap.ts` triggers one without `--expose-gc`), but cv 0.72–1.16 per run. The numbers exist; none of them earns a threshold here. |
| 2 — hydration timings | **no** | cv 0.59–1.96. Same reason. |
| 3 — mount / interaction timings | **no** | 9 of 11 runtime metrics are already recorded `variance-exceeds-signal` from a capture on this same host class. |
| 3 — render / scroll / layout | **no, and not on any Node host** | jsdom does not paint, lay out or scroll. These need a real browser, not a quieter machine. |
| 2 — core+pro hydration | **no** | `@dzup-ui-pro/pro` does not resolve and `DZUP_PRO_TARBALL` is unset. A named external precondition, out of scope here. |
| 7 — optional-engine load | **n/a — nothing to run** | The instrument does not exist. |

**Machine state during every run above** (`<discovery>` step 4, recorded before
and after): 16 logical CPUs, 32,641 MB RAM. Before: CPU load **21 %**, 7,249 MB
free, **562 processes**. Before the proposal capture: CPU load **38 %**, 7,315 MB
free, **556 processes**. This is a busy developer workstation, not a measurement
host — which is the finding, not an apology. It is why no number above was
promoted to a threshold.

---

## 4. Proposed tasks, one per gap

Each is named in the verdict table. None is executed here; each is sized so the
next agent can pick one up without re-deriving the gap.

| id | scenario | what it does | authority |
|---|---|---|---|
| **TASK-S1-O4-a** | 1 | Add brotli beside gzip in `export-sizes.ts`; add a retained-module-size metric (module graph reachable from the export, not emitted bytes); add a `size` arm to the perf gate. **Must land together with a decision on the 20 existing breaches, or it lands red on day one.** | agent, except the breach decision (D135 / D-S1O4-4) |
| **TASK-S1-O4-b** | 2 | Produce a Pro tarball, set `DZUP_PRO_TARBALL`, and run the core+pro half so the comparison the Pro programme measures against has a number on this side. | `[!owner]` — needs a Pro build |
| **TASK-S1-O4-c** | 3 | A browser perf lane (Playwright, the runner this repo already has for visual and AT) for *first usable render*, *scroll* and *layout*. These cannot be reached from jsdom at any host quality. | agent to build, `[!owner]` to baseline |
| **TASK-S1-O4-d** | 3 | Separate teardown from mount in `perf-bench.spec.ts` (today `wrapper.unmount()` is inside the timed block); add `filter/sort` and `selection/edit` dataset scenarios; widen mount coverage from 4 of 21 Tier C components. | agent |
| **TASK-S1-O4-e** | 4 | Gate p95 as well as p50. `Distribution.p95` is recorded on every metric and read by no assertion; doc 06 asks for both. | agent |
| **TASK-S1-O4-f** | 5 | Sample **peak** heap as well as retained, and raise `ITERATIONS` above 2 so the memory lane can earn a threshold on a quiet host. | agent |
| **TASK-S1-O4-g** | 6 | Animation-frame stability. Belongs with **-c**: both need a real browser. | agent to build, `[!owner]` to baseline |
| **TASK-S1-O4-h** | 7 | Split optional-engine cost from wrapper cost. Today `EXTERNALS` in `export-sizes.ts` removes the engines from every size figure, so the number a consumer sees is the wrapper alone and the engine is invisible. Measure both, report both. | agent |
| **TASK-S1-O4-i** | 8 | Adopt the four lane families as baselines so the leak lane can fail. This is **not** an engineering task — the lanes work; it is the owner capture in handoff §8. | `[!owner]` |

---

## 5. What this audit deliberately did not do

- **It did not redefine a scenario to fit a lane.** Six rows read "partially
  covered" where a looser reading would have read "covered": teardown is not
  mount, p95 is not p50, retained is not peak, a long-task count is not frame
  stability, gzip is not brotli, and a lane with no baseline is not a gate.
- **It did not fabricate a measurement.** Every number above came from a run
  whose log is in the session scratchpad and whose exit code was read directly.
  Scenarios 3 (render/scroll/layout), 6 (frame stability) and 7 carry a named
  reason instead of a number, per `<requirements><scenario_honesty>`.
- **It did not reach into the sibling repository** to satisfy scenario 2's
  core+pro half. `<repository_boundary>` allows the commercial tier to appear
  only as a published package or as a named external precondition with a yes/no
  probe; the lane already implements exactly that probe, and it answered *no*.
