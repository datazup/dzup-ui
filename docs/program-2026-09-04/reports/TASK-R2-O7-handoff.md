# TASK-R2-O7 — Performance contract completion (leak · long-task · memory · hydration)

> **COMPLETE.** Written incrementally as the task ran — captures cross context
> windows and the filesystem is the memory — and closed out at the end. Every
> section below is a measurement, not a plan.

| Binding | Value |
|---|---|
| Repo | `ui/dzup-ui` |
| HEAD | **`2d51eec`** — `feat: land program-2026-09-04 R3/R5 — i18n, layout spans, async options, corpus schema`. **Not `99b963a`**, which README §2 and this task's gap note still assume; every number below is bound to `2d51eec`. |
| Worktree | **dirty — 443 uncommitted paths at start, 445 at end** (R2-O1/O2/O3/O4/O5 and the R3/R5 tasks). The two added are this task's own handoff and its baseline proposal; every other path was preserved untouched. |
| Date | 2026-09-19 |
| Machine profile | win32 10.0.26200 · x64 · Intel i7-10875H @ 2.30 GHz · **16 logical CPUs** · 31.9 GB RAM (10.5 GB free at capture start) · Node v24.14.1 · uptime 74.8 h. Sole agent; no other heavy process during the capture window. |
| Authority | No commit, push, dispatch, publish, deploy — **and no baseline replacement** (README §5 `<repo_conventions><authority>`). This is load-bearing here: see **O7-D1**. |

---

## 1. `<done_check>` — result **by intent**, clause by clause

**0 of 3 clauses pass by intent. Clause 1 can never pass, whatever anyone does.
Clause 3 passes vacuously today and proves nothing. Clause 2 can pass falsely.**
Filed as **D131**.

### Clause 1 — `Object.keys(b.metrics ?? b).filter(…)` → ≥ 4

Measured: prints **`0`**. It is wrong at two independent levels:

1. **Wrong level.** `packages/core/perf/baselines.json` has no `metrics` key at
   all, so `??` falls through to `b`, whose keys are exactly
   `["schemaVersion", "policy", "baselines"]` — three fixed strings, none of
   which can ever match `/leak|longTask|memory|hydration/i`.
2. **Wrong container.** Even corrected to the intended level, `b.baselines` is
   an **array**, so `Object.keys()` yields the index strings `"0" … "32"` —
   which also never match.

So no amount of work on this task can make this clause print `≥ 4`. It is not a
check that is currently failing; it is a check that cannot succeed.

*The honest form*, which is what I ran:

```bash
node -e "const b=require('./packages/core/perf/baselines.json');console.log(b.baselines.filter(r=>/leak|longtask|memory|hydration/i.test(r.id)).length)"
```

→ **0** at `2d51eec`. So the intent also fails, correctly: the four lanes exist
in the working tree but **no lane metric is recorded in the committed
baselines**, and recording one is an owner act (**O7-D1**).

### Clause 2 — capability-matrix validator shows 0 stale perf cells

Run by module path (**not** `npx` — see below):

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts   → exit 0
```

Output: **22 stale cell(s)**, and a per-cell dump shows **all 22 are
`perf-baseline`** (21 Tier C + `DzFileUpload` Tier D). So the clause **fails by
intent**.

Two things the clause gets wrong:

- **`npx tsx` is the known-unsafe invocation in this repo** — it can fetch a
  dependency-confusion placeholder that prints a warning and exits 0. A clause
  phrased "*output shows* 0 stale perf cells" is then satisfied by a run that
  produced **no output at all**. This is the dangerous direction: silent green.
- The validator **exits 0 with 22 stale cells** by design (staleness is
  reported, never failed), so an exit code cannot substitute for reading it.

### Clause 3 — `grep -n 'runs' packages/core/perf/baselines.json | head -1`

Measured output:

```
7:    "ratchet": "downward only, on >= 5 runs whose cv is within the measurable limit; …"
```

That is line 7 — the **policy prose**, not a metric. It contains the literal
characters `>= 5 runs`, so read as written the clause "shows ≥ 5 runs" is
**satisfied today, on a file containing zero new metrics**. `head -1` guarantees
it can never reach a `"runs":` field belonging to any metric, let alone a new
one. It passes for the wrong reason, which is worse than failing.

*The honest form*: assert `runs >= 5` on each record whose `id` matches the new
kinds.

**Protocol outcome (README §4):** none pass ⇒ run the task. Done.

---

## 2. The true stale-perf-cell count at HEAD

**22**, not the 11 the task's gap note states, and not a number that has moved
since: TASK-R2-O1 measured 22 on 2026-09-18 and 22 is what the validator prints
at `2d51eec` today. The prompt's "11" is inherited from N0-05 F5 and predates
the component churn of the last two programmes.

All 22 are `perf-baseline` cells. **Every one of them is stale for the same
mechanical reason**, and it is worth stating precisely because it decides what
this task can and cannot close:

```ts
// packages/tooling/src/quality/generate-capability-matrix.ts, case 'perf-baseline'
const staleAt = mine.some(b => !evidenceIsCurrent(b.sourceCommit, componentCommit))
```

A perf cell is `stale` when the **baseline's `sourceCommit` is older than the
component's last-change commit**. Every recorded baseline carries
`sourceCommit: 4c9fb7a1…`; the 22 components have all changed since. The cells
are therefore *correctly* stale, and the **only** thing that clears them is a
recapture written into `packages/core/perf/baselines.json` — i.e. **baseline
replacement**, which README §5 `<authority>` withholds from every prompt in this
programme. That conflict is **O7-D1** below; it is not something the lanes can
fix.

| Tier | Component | metrics with a threshold |
|---|---|---|
| C | DzCalendar, DzCascader, DzColorPicker, DzCombobox, DzCommandPalette, DzDataView, DzDatePicker, DzDateRangePicker, DzMegaMenu, DzMention, DzMultiSelect, DzOrderList, DzPersonaSelector, DzSidebar, DzTimePicker, DzTour, DzTransfer, DzTree, DzTreeSelect | 1/1 each |
| C | DzDataGrid | 2/4 |
| C | DzTable | 1/4 |
| D | DzFileUpload | 1/2 |

---

## 3. What already existed vs what I finished

An interrupted earlier attempt on 2026-09-18 (20:50–21:11) left this task
**substantially built and entirely unverified**. I verified it rather than
restarting it. Nothing was rewritten that measured correctly.

### Already existed, verified correct, cited and kept

| Path | Verdict |
|---|---|
| `packages/tooling/perf-lanes/leak-lane.spec.ts` | Correct. 50 cycles, tolerance 0 falling out of the standing formula rather than a special case, teleport deliberately **not** stubbed, seeded-failure pair (leaky + clean) first in the file. |
| `packages/tooling/perf-lanes/long-task-lane.spec.ts` | Correct. One identical script for all 22 (focus → 3×ArrowDown → Enter → Escape) so the numbers are comparable; count gated, worst-span recorded but never gated. |
| `packages/tooling/perf-lanes/memory-lane.spec.ts` | Correct. Heap delta after forced collection. |
| `packages/tooling/perf-lanes/hydration-lane.spec.ts` | Correct, **and honest about its own scope**: measures `renderToString` + `createSSRApp().mount()` in-process, and states in the header that this is a library-side floor with no network, bundle parse, paint or Nitro. Core+Pro records **`unrun` with a reason**, never a fabricated comparison. |
| `packages/tooling/perf-lanes/setup.ts` | Correct, and it documents a real defect it already fixed: a missing `matchMedia` threw inside Vue's post-flush queue during `hydrate()` and corrupted every later `app.mount()` in the same fork — 25 failures, none at the fault. |
| `packages/tooling/perf-lanes/vitest.config.ts` | Correct. Lanes live outside every root `include` glob, so no root invocation can pull ~1,100 heavy mounts into `yarn test` by accident; `fileParallelism: false` and one fork per file, because a lane that runs concurrently measures the other lane's CPU. |
| `packages/tooling/src/perf/leak-detector.ts` | Correct instrument (one type defect, fixed — §3.2). |
| `packages/tooling/src/perf/long-task.ts`, `heap.ts`, `lane-report.ts`, `harness-hash.ts` | Correct. `lane-report.ts` extracts the report-always/fail-only-under-`DZUP_PERF_GATE` contract so four lanes obey it by construction. |
| `packages/tooling/src/perf/tier-fixtures.ts` | Correct, and its completeness gate is a **spec**, not a comment: `tier-fixtures.spec.ts` reads Tier C/D out of `quality-matrix.json` and fails when a component has no fixture, so promotion to Tier C creates the leak obligation automatically. |
| `packages/tooling/src/perf/baselines.ts` | Correct. Schema 1.1.0 (additive): four new `MetricKind`s, the `count` unit, and a `HarnessIdentity` block that answers D90 — `sourceCommit` says which product code was measured, `configHash` says which instrument measured it. |
| `packages/tooling/src/perf/capture-baselines.ts` | Correct, and it is the piece that makes this task legal: **`--propose <path>`** separates *measuring* from *adopting a budget*. |
| `package.json` | `perf:propose`, `test:perf:bench`, `test:perf:lanes`, `test:perf` as an aggregate — all present and correct. |

### What I finished

1. **Fixed the `validate:tokens` red this task owned** (§4).
2. **Fixed a TypeScript defect in `leak-detector.ts`** that the tooling
   typecheck was carrying: TS2425, the observer counter's `class Counted extends
   original` declared `override disconnect(): void` as a *method* while the base
   type declared it as a *property*. The obvious fix — declare the base as a
   method — is forbidden by this repo's `ts/method-signature-style` ESLint rule,
   so **the two rules together leave no legal subclass**. Replaced the subclass
   with a `construct` Proxy that patches `disconnect` on the instance. That is
   also the better instrument: the proxy preserves the real prototype, so
   `instanceof ResizeObserver` still holds for a component that checks.
   Verified: 24/24 `instruments.spec.ts` still pass, including observer counting.
3. **Verified every lane actually runs** — see §5.
4. **Captured a ≥5-run proposal** — see §6.
5. **Two harness defects found and filed** — D131 (done-check), D132 (ratchet
   not enforced at the write point).

### Corrected ledger state

The `TASK-R2-O7` row read `[ ]` (todo). That was **false** at session start:
**14 new files** of this task's machinery were already in the tree, untracked
and unverified (6 under `packages/tooling/perf-lanes/`, 8 under
`packages/tooling/src/perf/`), `packages/tooling/src/perf/{baselines,capture-baselines}.ts`
were already modified, and `package.json` already carried four of its scripts
(`perf:propose`, `test:perf`, `test:perf:bench`, `test:perf:lanes`). Corrected
to `[~]` in `EXECUTION-STATUS.md` and in `evidence-completion-tasks.md`.

---

## 4. The `validate:all` red this task owned — fixed

`yarn validate:all` exited 1 at **`validate:tokens`**, the first failing link,
on **5 raw colour literals in `packages/tooling/src/perf/tier-fixtures.ts`** —
this task's own uncommitted file. TASK-R2-O1 and TASK-R2-O5 both measured it and
both correctly refused to touch another task's work.

**It is a genuine exception, and the validator has a documented mechanism for
it.** `color-lint.ts` names this exact case in its own help text and in its
source comments: *"file is ABOUT colour values (a picker, its fixtures)"*. The
literals are `DzColorPicker`'s `modelValue` and `presets` — values the component
**parses**, not styling. `var(--dz-primary)` is not a colour a picker can seed a
hue wheel from; it is a string the component would reject, which would mount an
empty shell and make the fixture measure nothing.

The validator offers two markers and says *"reach for the narrow marker first"*.
I used the **narrower** one:

- `token-check-disable-line` on the two offending lines, each with its reason.
- **Not** `token-check-allow-raw-values`, which is file-scoped and would
  silently license a hex literal in a future `DzTree` fixture that has no claim
  to one. The source comment records that this is exactly how six stray
  `text-gray-*` classes once rode along inside `DzColorPicker.stories.ts`.

Nothing was invented and no gate was weakened.

> **CORRECTION, independent verification 2026-09-19.** The sentence that stood
> here also claimed *"the other 21 fixtures stay armed"*. **They are not**, and
> the reason is this section's own prose. `checkSource()` decides the
> file-scoped exemption with a bare
> `content.includes('token-check-allow-raw-values')`
> ([`color-lint.ts:338`](../../../packages/tooling/src/token-checks/color-lint.ts)) —
> **it is comment-blind**. The paragraph above, and the source comment at
> `tier-fixtures.ts:149` that explains why the file-scoped marker was
> *rejected*, both spell the marker out, so **naming it turns it on**. Measured
> by driving `checkSource()` directly on the real file, four ways:
>
> | condition | violations |
> |---|---|
> | as it ships today | **0** |
> | file-marker string neutralised, `-line` directives kept | **0** |
> | `-line` directives stripped, file-marker string kept | **0** |
> | both removed — the true raw count | **5** |
>
> So the intended narrow suppression *is* sufficient (row 2), but it is not what
> is load-bearing: the file is **also, accidentally, exempt file-wide for
> group 1**, which is precisely the outcome the comment says it avoided. The
> other 21 fixtures are unarmed for raw `#hex`/`rgb()`/`hsl()`. Tailwind-class
> and border rules stay armed either way (the narrow marker never covered them).
> Registered as **D139**; **not fixed here**, because deleting the marker's name
> from a comment re-arms a gate over 21 fixtures and that is a behaviour change
> this correction pass is not authorised to make.

**Deviation from TASK-R2-O1's suggestion, on purpose.** R2-O1 §3.3 recommended
`token-check-allow-raw-values` on this file. That marker would work, but it is
file-scoped, and `color-lint.ts` itself says "reach for the narrow marker first"
and records the precedent: six `text-gray-*` classes once rode along inside
`DzColorPicker.stories.ts` behind a file marker "that was only ever asked for to
cover its hex presets (TASK-FREE2-07)". `tier-fixtures.ts` holds 22 fixtures and
only one of them is about colour, so the per-line marker is the correct reach.

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/token-checks/color-lint.ts            → exit 0  ("0 raw color literals found")
node node_modules/tsx/dist/cli.mjs packages/tooling/src/token-checks/design-md-check.ts       → exit 0
node node_modules/tsx/dist/cli.mjs packages/tooling/src/token-checks/intent-text-contrast.ts  → exit 0
```

`validate:tokens` (all three sub-checks) is **green**. The first failing link in
`validate:all` has moved past this task.

---

## 5. Lane verification — all four lanes run, and their detectors are proven

```
node node_modules/vitest/vitest.mjs run -c packages/tooling/perf-lanes/vitest.config.ts
  → exit 0 · Test Files 4 passed (4) · Tests 74 passed (74) · Duration 49.71s
```

**49.7 s for all four lanes**, against the task's 30-minute stop condition. No
sampling was needed and none was applied: all 22 Tier C/D fixtures run in every
lane, at the full 50 cycles for leak.

Supporting checks, each run by module path and read from a file, never a pipe:

| Check | Result |
|---|---|
| `vitest run packages/tooling/src/perf/` | exit 0 — 47 tests (statistics 19, tier-fixtures 4, instruments 24) |
| `eslint packages/tooling/src/perf packages/tooling/perf-lanes` | exit 0 |
| `vue-tsc -p packages/tooling/tsconfig.json` | **0 errors in `src/perf/` or `perf-lanes/`** (17 remain repo-wide, all other tasks' — see §10) |
| root `vitest.config.ts` `include` globs | `packages/tooling/perf-lanes/*.spec.ts` matches **none** of `packages/*/{src,tests,scripts,security}/**`, so the lanes cannot be pulled into `yarn test` by accident. Verified by reading the globs, not assumed. |

### The seeded failures all fire

This is the part that matters most, because the characteristic failure of all
four instruments is *silent success*: a detector that has stopped detecting
reports zero for everything, which looks exactly like a clean catalogue. Each
lane therefore opens with a deliberately broken component, and those checks are
**unconditional** — they fail with `DZUP_PERF_GATE` off.

| Lane | Seed | Fires |
|---|---|---|
| leak | component adding a `window` listener, a `ResizeObserver`, an interval and a body node per mount, with no `onUnmounted` | ✅ ≥5 of each over 6 cycles, **and** the paired clean component reports `no growth` |
| long task | keydown handler busy-waiting 120 ms | ✅ ≥1 span over the 50 ms budget, **and** the paired fast handler reports 0 |
| memory | ~1 MB of JS-heap objects retained per mount in a module-level array | ✅ > 3 MB over 4 mounts |
| hydration | page whose `setup` blocks 120 ms | ✅ ssr + hydrate > 200 ms |

The memory seed carries its own correction in the source, and it is a good
example of the instrument being tested rather than trusted: the first version
retained `new Uint8Array(1 MB)` and the lane reported a **negative** delta,
because a typed array's backing store is external memory that `heapUsed` does
not count. A seed the instrument cannot see would have certified a broken
detector as working.

### Leak lane — 22 of 22 components, tolerance 0, **zero growth**

**No leak was found anywhere in the Tier C/D catalogue.** Every one of the 22
components reports `no growth over 49 counted cycles` across listeners,
observers, portal nodes, connected document nodes and intervals — the tolerance
the task sets at exactly 0.

So there is **no leak defect to file**, and in particular no Reka-primitive
upstream finding: the `<stop_conditions>` clause about a leak living in a Reka
primitive rather than a Dz component did not trigger.

Two details make that result trustworthy rather than vacuous:

- **Teleport is not stubbed** in this lane (unlike `perf-bench.spec.ts`). A
  stubbed teleport renders in place, so a portal that is never torn down leaves
  nothing in `document.body` to count — the lane would pass vacuously on exactly
  the twelve overlay components it exists for.
- **The mount container is owned by the lane, not by `attachTo`.** The fixture
  module records why: `@vue/test-utils` creates a parent `<div>` for an
  `attachTo` target and `unmount()` does not remove it, so a first attempt
  reported one extra body child per cycle for all 22 components *and for the
  deliberately clean control* — the lane would have opened by filing 22 leak
  defects against the test runner.

### Long-task lane — 2 breaches seen in the verification run

One scripted interaction per component (mount → focus → 3×ArrowDown → Enter →
Escape → unmount), identical for all 22 so the numbers are comparable. In the
verification run, 20 of 22 recorded **0** steps over 50 ms; two did not:

| Component | Step | Span |
|---|---|---|
| `DzCombobox` | `key:ArrowDown` | 76.3 ms |
| `DzCommandPalette` | `mount` | 58.9 ms |

A single observation cannot separate a regression from the machine, so nothing
was concluded from this run. **The 5-run capture settled it** — both breach on
**15 of 15** samples across five separate processes, which is the component, not
the host. Filed as **D133**; the numbers are in §6.2.

The honest limits are worth restating because the number invites over-reading:
jsdom does no layout and no paint, so this lane sees **script cost only**. A step
that is cheap here can still be a long task in a browser through style
recalculation. What it finds is real; what it misses belongs to a browser lane.

---

## 6. Capture — 5 runs, quiet machine, written as a **proposal**

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/perf/capture-baselines.ts \
  --propose docs/program-2026-09-04/reports/TASK-R2-O7-baseline/baselines.proposed.json
  → exit 0 · 5 × [bench spec + 4 lanes] in separate processes, then 22 tree-shaken fixture builds
  → 212 metrics — 168 with a threshold, 44 not yet measurable
  → "(proposal only — packages/core/perf/baselines.json is unchanged.
      Adopting these numbers as budgets is an owner action.)"
```

`sourceCommit 2d51eec` · host `win32/x64, 16 CPUs, node v24.14.1` ·
`schemaVersion 1.1.0` · `harness.configHash 9757e4f50eb29bb2` over **24 files**,
`vitest 3.2.6`. Nothing else heavy ran during the window.

**33 → 212 metrics.** The 179 new ones are the four lanes:

| Kind | Metrics | With a threshold | Runs per metric |
|---|---|---|---|
| `leak` | **110** (22 components × 5 axes) | **110** | 5 |
| `longtask` | 44 (22 × {`over-50ms`, `worst-span`}) | 27 | 15 |
| `memory` | 22 | 4 | 10 |
| `hydration` | 3 (core-only ssr/hydrate/tti) | 0 | 35 |
| *(existing)* `runtime` | 11 | 5 | 35 |
| *(existing)* `size` | 22 | 22 | 5 |

Every new metric clears the ≥5-run floor; the minimum is exactly 5 (the leak
lane takes one measurement per process × 5 processes, deliberately — the 50
cycles *are* the repetition, and 7 measurements per process would be 7 × 50 × 22
mounts for no extra signal).

### 6.1 Leak — 110 metrics, **every sample zero**, every threshold 0

```
leak metrics: 110 | all-zero: 110 | NON-ZERO: 0
axes: document-nodes-50, listeners-50, observers-50, portal-nodes-50, timers-50
distinct thresholds: 0
```

This is the cleanest result in the capture and it is worth being precise about
why the number 0 is meaningful here rather than merely absent: a recorded
distribution of zeros has median 0 and σ 0, so the standing formula
`median + max(3σ, 5 %)` yields a threshold of **exactly 0**, and any growth at
all is then a regression under the ordinary policy. "Tolerance 0" is not a
special case bolted onto the leak lane — it falls out of the policy the other
five metric kinds already obey.

**No leak defect is filed, because no leak was found.**

### 6.2 Long task — two **reproducible** breaches, and they are not noise

`over-50ms` is the gated metric (the `worst-span` millisecond is recorded but
never gated: it is a wall-clock number on a shared host, which is what the 9
committed `variance-exceeds-signal` verdicts are about).

Across 15 samples per component:

| Component | Samples (`over-50ms`) | Median | Threshold |
|---|---|---|---|
| **`DzCombobox`** | `1,1,1,1,1,1,1,1,1,1,1,1,1,1,1` | **1** | 1.05 |
| **`DzCommandPalette`** | `1,1,1,1,1,1,1,1,2,1,1,1,1,1,1` | **1** | `null` (cv 0.26, just over the limit) |
| `DzDataGrid` | `0×6, 3, 2, 1, 0×6` | 0 | 2.73 |
| `DzCascader` | `1,0,0` repeating | 0 | 1.46 |
| `DzCalendar` | 3 of 15 = 1 | 0 | 1.24 |
| `DzDataView`, `DzDatePicker` | 1 of 15 = 1 | 0 | 0.77 |
| the other 15 components | all zero | 0 | **0.00** |

`DzCombobox` breached the 50 ms budget on **15 of 15 samples** — five separate
processes, three scripted interactions each, without exception. That is not
contention; that is a property of the component. The verification run named the
step: `key:ArrowDown`, 76.3 ms. `DzCommandPalette` breached on 15 of 15 too
(one sample of 2), at `mount`, 58.9 ms.

Filed as **D133**.

**A design consequence the owner should see before adopting.** For a count
metric whose correct value is 0, the standing formula only yields a threshold of
0 when *every* sample is 0. Fifteen components get `0.00` and are genuinely
gated at zero; the six sporadic ones get a derived budget of ~0.8–2.7, i.e. the
adopted budget would **permit** the occasional breach it just measured. That is
the policy behaving as designed for a noisy metric, but it is not what "a
long-task budget" sounds like. Raised as **O7-D4**.

### 6.3 Memory — two components retain megabytes per cycle, with **no** handle growth

Heap delta across 20 mount/unmount cycles, two forced collections on each side,
after 2 warm-up cycles. 18 of 22 components land under 0.5 MB with a spread that
swamps the signal (`variance-exceeds-signal`, the honest verdict for a heap
delta on a developer machine). Four earned a threshold — and two of those four
are large and **almost perfectly reproducible**:

| Component | Median over 20 cycles | cv | n | Threshold earned |
|---|---|---|---|---|
| **`DzCommandPalette`** | **51.84 MB** | **0.01** | 10 | 54.43 MB |
| **`DzTour`** | **5.33 MB** | **0.02** | 10 | 5.59 MB |
| `DzTree`, `DzSidebar` | < 0.2 MB | — | 10 | small |
| the other 18 | 0.24–0.45 MB | 0.29–0.95 | 10 | `null` |

A cv of 0.01 over ten samples from five separate processes is not noise: it is
~2.6 MB retained **per mount/unmount cycle** for `DzCommandPalette` and ~0.27 MB
for `DzTour`, surviving two forced collections.

And the leak lane says these same two components grow **zero** listeners, zero
observers, zero portal nodes, zero document nodes and zero timers over 50
cycles. So this is retention that handle-counting cannot see — precisely the
failure class the memory lane was added for, and the first time this repository
has been able to see it.

**The correlation worth acting on:** `DzCommandPalette` and `DzTour` are the
**only two fixtures in the file that mount with `open: true`**. The two
components with large retention are exactly the two whose overlay is open at
mount. That is a strong pointer at the overlay/teleport path rather than at
either component's own logic, and it is the first thing to test.

Filed as **D134**, with the honest caveat that the *mechanism* is not yet
identified and part of the delta may belong to jsdom or to Vue's per-instance
caches rather than to the component.

### 6.4 Hydration — Core-only measured, Core+Pro `unrun`

| Metric | Median | cv | n | Threshold |
|---|---|---|---|---|
| `hydration:core-only:ssr` | 6.52 ms | 1.91 | 35 | `null` |
| `hydration:core-only:hydrate` | 10.25 ms | 0.60 | 35 | `null` |
| `hydration:core-only:tti` | 16.68 ms | 1.10 | 35 | `null` |

All three are `variance-exceeds-signal` on this host — the correct verdict, not
a failure. Core+Pro is `unrun` with its reason recorded (**O7-D2**).

### 6.5 The ratchet, measured — **and this is why `--propose` mattered**

Comparing the proposal to the committed file over all 33 shared metrics:

| Movement | Count |
|---|---|
| threshold would move **UP** (a *raised* budget) | **22** |
| threshold would move **DOWN** (a legitimate ratchet) | 2 |
| newly measurable | 3 |
| threshold lost | 0 |

**Had I run `yarn perf:capture` in place, 22 of 33 committed budgets would have
been silently raised**, by up to +21.6 % (`size:DzMention` 22,421 → 27,263 B).
That is D132 demonstrated rather than argued.

### 6.6 An inherited finding: **20 of 22 export-size budgets are breached at HEAD**

Separately from the ratchet question — these are fresh medians against the
**committed** thresholds, and `size` is deterministic (cv 0.000 on every one):

| Export | Committed threshold | Median at `2d51eec` | Over by |
|---|---|---|---|
| `size:DzMention` | 22,421 B | 25,965 B | **+15.8 %** |
| `size:DzDataView` | 23,369 B | 25,571 B | +9.4 % |
| `size:DzPersonaSelector` | 22,302 B | 23,918 B | +7.2 % |
| `size:DzCombobox` | 21,709 B | 23,267 B | +7.2 % |
| `size:DzTreeSelect` | 26,661 B | 28,562 B | +7.1 % |
| `size:DzDataGrid` | 34,773 B | 37,132 B | +6.8 % |
| …14 more between +0.7 % and +6.1 % | | | |

**This is not caused by this task** — it is the accumulated growth of the R3/R5
and R2 packets since `4c9fb7a`, and none of it is lane code (the lanes ship in
`packages/tooling`, which is private and not in any published export). It is
reported here because this capture is the first measurement that could see it,
and because it decides what `DZUP_PERF_GATE=1` does today (§10).

---

## 7. Defects filed

### D131 🔴 — a **sixth** task's `<done_check>` is defective, in all three clauses

Joins D108 / D116 / D122 / D124. Detail in §1. In short:

| Clause | Verdict | Why |
|---|---|---|
| 1 | **can never pass** | `Object.keys(b.metrics ?? b)` inspects the file root (3 fixed keys; no `metrics` key exists); the intended level `b.baselines` is an **array**, so `Object.keys` there yields `"0"…"32"`. Wrong level *and* wrong container. |
| 2 | fails by intent; **can pass falsely** | Prescribes `npx tsx`, the invocation this repo has measured as unsafe (placeholder fetch → no output, exit 0), and the clause is phrased on *output*, so "no output" reads as "0 stale cells". |
| 3 | **passes vacuously today** | `grep -n 'runs' … \| head -1` returns line 7, the **policy prose** (`"…on >= 5 runs whose cv…"`). `head -1` guarantees it never reaches a metric's `"runs":`. It is satisfied on a file with zero new metrics. |

Honest replacements are in §1. **Recommendation:** replace the three clauses in
`evidence-completion-tasks.md`, and add a standing rule to README §4 that a
`<done_check>` clause must be shown to **fail** on the unfixed tree before it is
written — four of the six defective checks in this programme would have been
caught by running them once against the state they were meant to reject.

### D132 🟠 — the downward-only ratchet is documented, tested, and **not enforced where baselines are written**

`statistics.ts` exports `mayRatchet()`, which refuses to move a threshold unless
the fresh median improved, runs ≥ 5 and cv is within the measurable limit. It
has six unit tests. **It has no production call site:**

```
$ grep -rn "mayRatchet" packages/ --include=*.ts | grep -v statistics
packages/tooling/src/perf/capture-baselines.ts:12:  * … `mayRatchet` refuses to lower a recorded median   ← a comment
packages/tooling/src/perf/statistics.spec.ts: …                                                          ← its tests
```

`capture-baselines.ts` builds each `Baseline` from the fresh distribution alone
(`toBaseline` → `thresholdFor`) and **never reads the recorded file**. So
`yarn perf:capture` writes whatever the machine produced that day — **upward
moves included** — over the committed budgets, which is precisely what the
policy string inside that same file forbids ("raising a threshold needs a
recorded owner decision, not a slower run").

Not hypothetical here: a fresh capture measures components changed under two
programmes, on a 16-CPU laptop at 74 h uptime. It is the strongest argument for
`--propose`, and the reason I did not run `perf:capture` in place (**O7-D1**).

**Recommendation:** have `capture-baselines.ts` read the committed file and pass
each metric through `mayRatchet()`, writing the **recorded** threshold when the
ratchet is refused and printing a per-metric line saying so. The owner may
instead prefer capture to stay dumb with the ratchet in a separate `perf:adopt`
step — either closes it. The present state (a rule living only in prose and
tests) does not.

### D133 🟠 — `DzCombobox` and `DzCommandPalette` block past the 50 ms budget, **reproducibly**

Full data in §6.2. `DzCombobox` breached on **15 of 15** samples across five
processes (`key:ArrowDown`, 76.3 ms); `DzCommandPalette` on **15 of 15**
(`mount`, 58.9 ms). 20 of 22 components have a median of 0 and 15 are all-zero.
A 15-of-15 rate across five processes is the component, not the host.

Limit stated so the number is not over-read: jsdom does no layout or paint, so
this is **script cost only** — a real browser can only be worse. The breach is a
floor.

**Recommendation:** profile both steps. The lane already names the step, so the
pointer is exact. Routed in TASK-R2-O3's register style as the task prompt asks.

### D134 🟠 — `DzCommandPalette` retains ~2.6 MB per cycle, `DzTour` ~0.27 MB, with **zero** handle growth

Full data in §6.3. Reproducible to cv 0.01 / 0.02 over ten samples from five
processes, after two forced collections and two discarded warm-up cycles — while
the leak lane reports zero growth in all five handle axes for the same two
components over 50 cycles.

**The pointer:** these are the only two fixtures that mount with `open: true`.
The retention correlates with an **open overlay**, not with either component's
own logic.

**Recommendation:** re-measure with `open: false` first — one flag, and it
decides whether this is one bug or two — then profile the overlay mount path.
Do **not** adopt the 54 MB threshold: that would write an unexplained number
into the file as a *budget*.

**Caveat, stated plainly:** the number is reproducible; its attribution is not
yet proven. Some of the delta may belong to jsdom or to Vue's per-instance
caches rather than to the component.

### D135 🔴 — the 22 per-export `size:*` budgets are enforced by **nothing**, and 20 are breached at HEAD

Full data in §6.6. The evidence that nothing enforces them is direct:

```
DZUP_PERF_GATE=1 vitest run packages/tooling/src/perf-bench.spec.ts
  → exit 0 · Test Files 1 passed · Tests 11 passed
```

Eleven tests, **all `runtime`**. The gate exits 0 while 20 size budgets are
breached, because no test ever compares a `size:*` metric to its threshold.
`validate:bundle-budget` measures whole build artifacts via
`bundlesize.config.json` — a different measurement — and is **not in
`validate:all`** (`/bundle-budget/.test(scripts['validate:all'])` → `false`).

So the repository derives thresholds for 22 per-export budgets under the
variance policy, marks capability cells against them, and never asserts one.

**Not caused by this task**: the growth is accumulated R2/R3/R5 work since
`4c9fb7a`, and no lane code ships in a published export (`packages/tooling` is
private).

**Recommendation:** add a `size` arm to the perf gate **and** triage the six
exports over +6 % before any budget moves. The arm must land together with a
decision on the 20 existing breaches, or it lands red on day one.

---

## 8. Owner decisions

### O7-D1 🔴 — adopting these numbers as budgets is an owner act, and it is the **only** thing that can close the 22 stale perf cells

`<success_criteria>` says "stale perf cells 11 → 0". That is **unreachable by
any agent under the standing rules**, for a mechanical reason:

- a `perf-baseline` cell is stale iff the baseline's `sourceCommit` predates the
  component's last-change commit (§2);
- the only way to change a baseline's `sourceCommit` is to **write**
  `packages/core/perf/baselines.json`;
- README §5 `<authority>` withholds "baseline replacement" from every prompt in
  this programme, and D132 shows an in-place capture would also raise budgets
  silently.

So I captured into a proposal:
`docs/program-2026-09-04/reports/TASK-R2-O7-baseline/baselines.proposed.json`.

**Options.** (a) Adopt the proposal wholesale, regenerate the matrix, 22 stale
cells resolve. (b) Adopt only the **new lane** metrics — every existing budget
untouched, but the 22 cells stay stale, because staleness is a property of the
existing size/runtime metrics, not of the new lanes. (c) Re-capture on a
dedicated quiet machine, then adopt.

**Recommendation: (c), then (a).** This host is a developer laptop and the
evidence that it is not a measurement host is already in the repository — 9 of
11 committed runtime metrics carry `variance-exceeds-signal`, and this capture
reproduces that (§6). The **count** metrics (leak, long-task) are robust to
contention and are worth adopting from this capture; the millisecond and byte
metrics are not. Adopting (a) wholesale from this host would bake a contended
machine's numbers into budgets that only ever ratchet down — the one mistake the
policy exists to prevent.

### O7-D2 🟠 — the Core+Pro hydration comparison is `unrun`, by the task's own stop condition

`<stop_conditions>`: "when the Core+Pro hydration case has no Pro registration
yet (TASK-R3-O1) — record Core-only and say so." That is what happened, and the
lane says it in its own output rather than only in prose:

```
· hydration core+pro: unrun — DZUP_PRO_TARBALL is not set and `@dzup-ui-pro/pro`
  does not resolve. Produce a Pro tarball from a Pro checkout and set
  DZUP_PRO_TARBALL (same contract as `yarn test:nuxt-fixtures:pack`), then re-run.
```

Nothing was fabricated. TASK-R3-O1 is open and an OSS task may not check out or
build the Pro tree.

**Options.** (a) Produce a Pro tarball from the Pro checkout and re-run the lane
(~2 min once the tarball exists). (b) Defer to TASK-R3-O1. **Recommendation:
(a)** — the lane is written and waiting on one environment variable, and this is
the number the Pro programme will measure against.

### O7-D3 🟢 — D90 is answered; close it by option (b)

`harness-hash.ts` plus the `harness` block in schema 1.1.0 implement D90 option
(b), "add a real config hash to `baselines.json`", **without** removing R5-O9's
`perf-harness.sha256` manifest — the two answer different questions and the
module states which. The block hashes the harness sources **and** the Vitest
version, because the harness shells out to `vitest.mjs`: a Vitest major moves
every number while every hashed file stays byte-identical.

It is already doing work. Every lane printed `harness unrecorded: the recorded
baselines predate schema 1.1.0 …`, and the hash **changed mid-session** when I
edited `tier-fixtures.ts` during a run — the instrument correctly reporting that
the tree it hashes had moved. *Operational note for the next capture: do not
edit a harness file inside a capture window.*

**Recommendation:** close D90 by option (b) when the proposal is adopted.

### O7-D4 🟠 — a count budget derived from a *noisy* count permits the breach it just measured

The leak lane's "tolerance 0" works because every sample is 0: median 0, σ 0,
threshold `0 + max(0, 0)` = **0**. The long-task lane is also a count, but its
samples are not all zero, and the same formula then yields a *non-zero* budget:

| Component | Samples | Derived budget | Effect |
|---|---|---|---|
| 15 components | all zero | **0.00** | correctly gated at zero |
| `DzCalendar` | 3 of 15 are 1 | 1.24 | permits 1 breach per run |
| `DzCascader` | 5 of 15 are 1 | 1.46 | permits 1 |
| `DzDataGrid` | 3, 2, 1 in one process | 2.73 | permits 2 |
| `DzCombobox` | 15 of 15 are 1 | 1.05 | permits the D133 breach outright |

The policy is working as designed for a noisy metric. It is simply not what "a
long-task budget" sounds like to a reader, and the owner should decide rather
than inherit it.

**Options.** (a) Leave it — one policy, no special cases, and the derived budget
is at least honest about the spread. (b) Pin every `longtask:*:over-50ms`
threshold to **0** and treat any breach as a defect, as the leak lane does: the
count's correct value is 0 by definition, unlike a millisecond. (c) Pin to 0
only for components whose samples are already all-zero, and leave the seven
noisy ones derived until they are fixed.

**Recommendation: (c) now, (b) once D133 is closed.** (c) locks in the fifteen
components that are provably clean — so a regression in any of them is caught
immediately — without pretending the seven known-noisy ones are at zero, and it
converts to (b) component by component as each is fixed. (a) is the weakest: it
would adopt `DzCombobox`'s budget at 1.05 on the very day the lane measured that
component breaching 15 times out of 15.

---

## 9. What this task deliberately did not do

1. **Did not replace `packages/core/perf/baselines.json`.** README §5
   `<authority>` withholds baseline replacement, and D132 shows an in-place
   capture would silently raise budgets. The numbers are a proposal (**O7-D1**).
2. **Did not close the 22 stale perf cells** — impossible without (1). Reported
   honestly rather than regenerating the matrix against a file I may not write.
3. **Did not fabricate the Core+Pro hydration comparison** (**O7-D2**).
4. **Did not build the Nuxt fixture for the hydration lane.** The install alone
   (~800 packages plus a production build, per fixture, staged outside the repo)
   exceeds this task's own 30-minute stop condition, and the number it yields is
   Nitro's, not the library's. The lane measures the library-side floor, says so
   in its header, and the end-to-end number is recorded as owed.
5. **Did not touch another task's work.** ~443 uncommitted paths from
   R2-O1/O2/O3/O4/O5 and R3/R5 were preserved. The one shared file edited is
   `package.json`, and only the `perf:*` / `test:perf*` lines this task's own
   earlier attempt had already added.
6. **Did not weaken a gate or hand-edit a generated artifact.** The colour-lint
   exemption is the validator's own documented narrow marker (§4); no capability
   cell was hand-edited; `e2e/matrix/browser-evidence.json` (TASK-R2-O1) was not
   regenerated or touched, and neither browser gate was altered.
7. **Did not commit, push, dispatch, publish or deploy.**
8. **Did not fix the inherited reds** in §10 — they belong to other tasks.

---

## 10. Aggregate qualification — inherited vs caused

Every command below was run by module path (never `npx`), written to its own log
and its exit code read **directly**, never through a pipe.

### Caused by this task: nothing red. And one link turned green.

> **`yarn validate:all` exits 0. The whole 44-link chain passes, end to end.**
>
> ```
> yarn validate:all > validate-all.log 2>&1 ; echo "exit $?"   → exit 0
> 33 ✓ lines · 0 lines matching ✗/✘/×/FAIL/Error:/error TS · 363 lines
> ```
>
> This is a **first** for this programme. The chain was red at link 16 of 37 at
> `99b963a`, and TASK-R2-O1 moved it to link **22 of 44** — `validate:tokens`,
> failing on the 5 raw colour literals in **this task's own uncommitted
> `tier-fixtures.ts`**. **Suppressing** them (§4) — the literals are still in the
> file and are meant to be; see §4's 2026-09-19 correction — removed the last
> failing link. Two
> independent agents measured that red and correctly declined to touch another
> task's file; it was mine, and it is closed.

| Gate | Result | Whose |
|---|---|---|
| `yarn validate:all` | **exit 0**, 44/44 links | — (was R2-O7's red) |
| `DZUP_PERF_GATE=1` bench spec | exit 0 · 11/11 | — |
| `DZUP_PERF_GATE=1` perf lanes | exit 0 · **74/74**, 22/22 components leak-clean | — |
| `vitest run packages/tooling/src/perf/` | exit 0 · 47/47 | — |
| `eslint packages/tooling/src/perf perf-lanes` | exit 0 | — |
| `vue-tsc -p packages/tooling/tsconfig.json` | **0 errors under `src/perf/` or `perf-lanes/`** | — |

### Inherited — re-measured, because my edits live inside their scope

`packages/tooling/src/perf/*.spec.ts` is matched by `yarn test`'s include globs,
so "it cannot have affected the suite" would have been an assumption. It was
measured instead.

| Gate | Result | Note |
|---|---|---|
| `yarn test` | **3 failed · 10,230 passed · 3 skipped · 1 todo** (543 files) | **Exactly the inherited count**, and the same three files: `dzup-resolution.spec.ts` (the third failure R2-O3 identified — the README's "2 inherited" is stale), `landing-token-fallbacks.spec.ts`, `story-dod-tiers.spec.ts › countOpen › subtracts a waiver`. **None under `packages/tooling/src/perf/`. Zero new failures caused.** |
| `eslint e2e/` | **9 errors** | Exactly the inherited count; zero mention any perf path. Outside the `yarn lint` target. |
| `packages/tooling` typecheck | **17 errors**, none in `src/perf/` or `perf-lanes/` | 18 at session start; the one closed was this task's TS2425. The other 17 sit in `docs/`, `quality/`, `validators/`, `ownership/`, `playground/`, `perf-bench.spec.ts` and `packages/core/src/i18n/messages.ts` — other tasks' dirty work and pre-existing. **Not in `validate:all`**, which typechecks `packages/core` only. |

### Inherited — cited, not re-measured, and said so

`yarn storybook:test` (1,451/1,453 — two async-options stories) and
`yarn storybook:build` (**25.02 MB against a 25 MB budget**, D130) were **not**
re-run. Neither can be affected by this task: every file it touches lives in
`packages/tooling`, which is private, is not part of any published export, and
is not in Storybook's graph. Re-running a ~25 MB build to confirm a number I
cannot have moved would have cost more than it proved. **D130's budget was not
raised and was not touched.**

---

## 11. Ratchet movements

| Ratchet | Before | After | Bound to |
|---|---|---|---|
| Perf lanes doc 06 requires (leak · long-task · memory · hydration) | **0 of 4** | **4 of 4 built, verified and captured** | `2d51eec` |
| Perf metrics under the variance policy | 33 | **212 proposed** (33 live — adoption is **O7-D1**) | proposal |
| Tier C/D components with a leak obligation *asserted* | 0 | **22 of 22**, tolerance 0, and the obligation is enforced by a spec against `quality-matrix.json`, so a 23rd Tier C component acquires it automatically | `2d51eec` |
| Leak axes measured per component | 0 | **5** (listeners · observers · portal nodes · document nodes · timers) | `2d51eec` |
| Components with a *measured* long-task verdict | 0 | **22** (20 clean, 2 breaching — D133) | `2d51eec` |
| Components with a *measured* heap-retention verdict | 0 | **22** (20 small/unmeasurable, 2 large — D134) | `2d51eec` |
| Hydration TTI, Core-only | unmeasured | 16.68 ms median (cv 1.10, no threshold earned) | `2d51eec` |
| Hydration TTI, Core+Pro | unmeasured | **still `unrun`, with a recorded reason** (O7-D2) | — |
| `baselines.json` schema | 1.0.0 | **1.1.0** (additive: 4 metric kinds, `count` unit, `HarnessIdentity`) | proposal |
| Perf harness config hash (**D90**) | did not exist | **exists**, `9757e4f50eb29bb2` over 24 files + vitest version | proposal |
| `validate:tokens` **violations** from this task's file | **5** | **0** — **by suppression, not removal** (corrected 2026-09-19) | `2d51eec` |
| **`yarn validate:all` first failing link** | **22 of 44** (`validate:tokens`) | **none — the whole 44-link chain exits 0** | `2d51eec` + dirty tree |
| `packages/tooling` tsc errors in `src/perf/` | 1 (TS2425) | **0** | `2d51eec` |
| `packages/tooling` tsc errors, repo-wide | 18 | **17** (the one closed is this task's; the rest are other tasks') | `2d51eec` |
| Defects on the register | D130 | **D135** (+D131, D132, D133, D134, D135) | — |
| Stale perf cells | 22 | **22 — unchanged, and only the owner can move it** (O7-D1) | `2d51eec` |

**Two ratchets deliberately did not move**, and saying so is the point:

- **Stale perf cells stay at 22.** Moving them requires writing
  `packages/core/perf/baselines.json`, which is withheld. Regenerating the
  matrix against a file I may not change would have produced the same 22 with a
  fresh timestamp — motion without evidence.
- **No perf threshold was ratcheted.** 22 of 33 would have moved **up** (§6.5).
  A budget that moves up is not a budget.

> **CORRECTION, independent verification 2026-09-19 — the colour-literal row.**
> An earlier spelling of that row read *"raw colour literals 5 → 0"*, which reads
> as *removal*. **Nothing was removed.** All five literals — `#3366ff` on
> `tier-fixtures.ts:152` and `#ffffff`/`#ff0000`/`#00ff00`/`#0000ff` on
> `:154` — are **still in the file, deliberately**, and the ratchet that moved is
> the **violation count** `validate:tokens` reports, 5 → 0, achieved with the
> pre-existing line-scoped `// token-check-disable-line` directive
> (`color-lint.ts:194-195`, present at HEAD).
>
> **Why they are load-bearing**, in this handoff's own words (§4): they are
> `DzColorPicker`'s `modelValue` and `presets` — values the component **parses**,
> not styling — and the fixture exists to isolate that component's paint cost.
> `var(--dz-primary)` is a string the picker rejects, which would mount an empty
> shell and make the fixture measure nothing. The reason **is** recorded, both
> here and in the file.
>
> Two details the original framing also blurred:
> - **The lines carry six hex values; the validator flags five.** `#000000` is
>   not matched, because the hex pattern requires at least one `a`–`f` letter
>   (`color-lint.ts:135`) so that numeric ids like `#1234` do not trip it. "5" is
>   a violation count, not a literal count.
> - **What is actually suppressing them is not only the narrow directive** — see
>   the correction in §4 and **D139**.

---

## 12. Ranked next packet

1. **Take O7-D1** — capture on a quiet host and adopt. Everything else in this
   packet is blocked behind it: the 22 stale cells, the `DZUP_PERF_GATE` promise,
   and any future comparison. Highest value per unit of owner time in this task.
2. **D135 — gate the per-export size budgets** (🔴). The repository currently
   derives 22 budgets and asserts none, and 20 are breached by up to +15.8 %.
   This is the largest *silent* gap the capture found: unlike the lanes, the
   machinery already exists and simply is not wired to anything.
3. **D134 — re-measure `DzCommandPalette` / `DzTour` with `open: false`.** One
   flag, minutes of work, and it either confirms an open-overlay retention bug
   across the catalogue or narrows it to two components. Cheapest high-information
   step on the register.
4. **D133 — profile `DzCombobox`'s ArrowDown and `DzCommandPalette`'s mount.**
   The lane names the exact step; this is ordinary profiling work.
5. **O7-D2 — produce a Pro tarball and re-run the hydration lane.** One
   environment variable once TASK-R3-O1 or a Pro checkout provides the tarball.
6. **D132 — wire `mayRatchet()` into the write path**, so the file's own policy
   string becomes true. Small, and it prevents a repeat of the 22-raised-budgets
   scenario the next time anyone runs `perf:capture`.
7. **D131 — repair this task's `<done_check>`** and add the "prove the check
   fails first" rule to README §4. Six defective checks in one programme is a
   process problem, not six coincidences.
8. **O7-D4 — decide the long-task budget shape** (pin-to-zero vs derived).
   Cheap, but it should follow D133 rather than precede it.
