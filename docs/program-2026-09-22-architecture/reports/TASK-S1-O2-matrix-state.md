# Capability matrix — state, three-bucket triage, and the distance to N1

> **TASK-S1-O2**, 2026-09-22. Bound to `main` @
> `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` (`4e4e46f`), with this task's and
> TASK-S0-O1's changes **uncommitted** in the worktree. Locally qualified — not
> CI, release or production evidence.
>
> Companion: [`TASK-S1-O2-handoff.md`](./TASK-S1-O2-handoff.md).
> Artifact: `packages/core/docs/capability-matrix.json` (144 rows, schema 1.1.0).

---

## 1. Totals, before and after

| Tier | pass | fail | present | stale | unrun | excepted |
|---|---:|---:|---:|---:|---:|---:|
| **A** before | 106 | 0 | 175 | 0 | 65 | 4 |
| **A** after | 106 | 0 | 175 | 0 | **65** | **4** |
| **B** before | 325 | 0 | 304 | 0 | 275 | 13 |
| **B** after | 325 | 0 | 304 | 0 | **247** | **41** |
| **C** before | 147 | 0 | 106 | 21 | 100 | 0 |
| **C** after | 147 | 0 | **117** | 21 | **87** | **2** |
| **D** before | 7 | 0 | 12 | 1 | 1 | 0 |
| **D** after | 7 | 0 | 12 | 1 | **1** | 0 |
| **Σ** before | 585 | 0 | 597 | **22** | **441** | **17** |
| **Σ** after | 585 | 0 | **608** | **22** | **400** | **47** |

Cell count is conserved: 1662 before, 1662 after. Nothing was deleted and no
column was dropped.

**`fail` is 0 and was 0.** Nothing in this task promoted a cell to `pass`;
`pass` is unchanged at 585. The 11 cells that moved to `present` moved because
a test that did not exist was written and **ran green** (§4), not because a
label changed.

### The two numbers everything downstream has been quoting wrong

| Number | README §2 / §5, task title | **Measured at `4e4e46f`** |
|---|---|---|
| stale | 37 | **22** |
| stale kinds | "Tier B 10 · C 26 · D 1" | **Tier C 21 · D 1, all `perf-baseline`** |

The 37 was measured at `589be13` against artifacts that themselves stamped an
older commit. TASK-S0-O1 re-derived every `componentCommit` from git; 22 is the
figure at HEAD. The ratchet line in `<repo_conventions>` ("capability stale
37 → 0") is corrected to **22 → 0** in `EXECUTION-STATUS.md`.

### A number a reader will trip over: `visual` is not a cell

`capability-matrix.json` carries a per-row **`visual` field** as well as its
cells, and **8 rows read `visual: stale`**. Those 8 are in no tier total, are
not part of the 22, and `checkCapabilityMatrix` never reads them (N1-O6 §4.2:
visual is a row field, not an evidence cell). A reader who counts staleness by
grepping the JSON gets 30. The gate added by this task counts **cells**.

---

## 2. Stale: 22, one cause, blocked on the owner

**All 22 stale cells are `perf-baseline`, and no other column has one.** Proven
by enumeration over all 1662 cells, not by sampling.

| Tier | components owing the row | stale | clearable by an agent |
|---|---:|---:|---|
| C | 21 (every Tier C component) | 21 | **no** |
| D | 1 (`DzFileUpload`) | 1 | **no** |

`packages/core/perf/baselines.json` holds 33 baselines over 26 components and
**every one stamps `sourceCommit 4c9fb7a` (2026-08-21)**. The 22 components last
changed at `a01965f` (09-17), `2d51eec` (09-18) and `527dbd1` (09-20) — all
descendants of the capture, confirmed with `git merge-base --is-ancestor`. The
staleness is an ordering fact in git.

The only action that clears them is **rewriting `baselines.json` from a fresh
≥5-run capture** — a *baseline replacement*, withheld from every agent in this
programme and owned by **TASK-S1-O4**. So the `<done_check>`'s `stale === 0`
clause is **impossible by design** and is recorded as such rather than
satisfied. Zero of the 22 is clearable by re-running an existing lane, because
the lane's output *is* the file.

What this task did instead: made the blockage **machine-checkable** —
`packages/tooling/src/validators/capability-matrix-ceilings.json` records the
ceiling (22), the 22 component names, the owner (`TASK-S1-O4` / decision
O2-D1), and the single kind allowed to be stale. Gate 7 fails on a rise, on a
drop that does not lower the ceiling, and on a **kind swap that keeps the count
identical**.

---

## 3. The three buckets

### The rules

| Bucket | Rule | Test a reviewer can apply |
|---|---|---|
| **runnable-now** | A harness in this repository already produces this column for other components in the same way. Nothing is missing but pointing it at this component — no new harness, no new platform, no human tester. | Name the file that already produces the cell for a sibling component. If you can, it is runnable-now. |
| **needs-a-lane** | No harness here can produce the cell for this component: the evidence is human by definition, or the lane reaches only a subset and extending it is a build rather than a pointing. | Name what would have to be *built or staffed*. One task per lane, never one per cell. |
| **not-applicable** | The column measures a behaviour the component **provably cannot exhibit**. Recorded in `packages/tooling/src/quality/component-tiers.ts` `exceptions` with a falsifiable reason — never in the generator. | The reason names an API fact that a source change would make false. "Not relevant" fails this test. |

A cell that enters **not-applicable** stops being `unrun` the moment the
exception lands — it becomes `excepted`. So the not-applicable column below
records what this task **moved out** of the 441, and the residual 400 splits
into runnable-now and needs-a-lane only.

### The table — all 441 reconciled

| Column | Tier | unrun @ start | not-applicable | executed here | runnable-now (residual) | needs-a-lane | Proposed task |
|---|---|---:|---:|---:|---:|---:|---|
| `at-manual` | B·C·D | 89 | 0 | 0 | 0 | **89** | **TASK-S1-O1** (human AT session) |
| `axe` | A·B·C | 84 | **3** | 0 | **81** | 0 | TASK-S1-O2-F1 |
| `keyboard-spec` | B·C | 78 | 0 | 0 | **78** | 0 | TASK-S1-O2-F2 |
| `controlled-uncontrolled` | B·C | 88 | **27** | 0 | **61** | 0 | TASK-S1-O2-F3 |
| `ssr-sample` | A·B·C | 59 | 0 | **7** | **52** | 0 | TASK-S1-O2-F4 |
| `data-scenarios` | A·B·C | 22 | 0 | 0 | **22** | 0 | TASK-S1-O2-F5 |
| `portal-hydration` | A·B·C | 10 | 0 | **4** | **6** | 0 | TASK-S1-O2-F4 (same file) |
| `unit-spec` | A·B | 4 | 0 | 0 | **4** | 0 | TASK-S1-O2-F6 |
| `contract-spec` | A·B | 2 | 0 | 0 | **2** | 0 | TASK-S1-O2-F6 |
| `non-drag-alternative` | B | 2 | 0 | 0 | **2** | 0 | TASK-S1-O2-F6 |
| `browser-play` | B | 1 | 0 | 0 | **1** | 0 | TASK-S1-O2-F6 |
| `browser-matrix` | B | 1 | 0 | 0 | **1** | 0 | TASK-S1-O2-F6 |
| `story-light-dark` | B | 1 | 0 | 0 | **1** | 0 | TASK-S1-O2-F6 |
| **Total** | | **441** | **30** | **11** | **311** | **89** | |

`30 + 11 + 311 + 89 = 441`. Residual unrun `311 + 89 = 400`. ✔

### The headline the split produces

**Exactly one column in this matrix is blocked on a lane that does not exist,
and that lane is a human.** `at-manual` (89 cells) needs a tester with NVDA,
JAWS, VoiceOver or TalkBack in front of a real browser; no agent may fill one
of those cells and none was filled. **Every other one of the 441 is reachable
with a harness this repository already ships** — which is a far better answer
than the number suggested, and it is the first time the split has been written
down.

The prompt's own `<example>` scores `manual-at` as `0 / 0 / 0` across three
buckets, which cannot reconcile with its total. Resolved here by putting
`at-manual` in **needs-a-lane** — the lane is a staffed AT session — so the
three buckets sum to the 441 exactly. Recorded as a prompt defect, not silently
re-scored.

---

## 4. What was executed, and what it moved

### 4a. `not-applicable` — 30 cells, 28 component entries, 2 reasons

Written to `packages/tooling/src/quality/component-tiers.ts`, the file the 17
existing exceptions already live in. Two helpers carry the shared half of each
reason so the per-component half stays specific:

- **`noValueToControl(surface)` — 27 cells.** `controlled-uncontrolled`
  measures a unit spec driving one value through a host-owned (`v-model` /
  `update:<name>`) path and a component-owned one. Measured at `4e4e46f` over
  each component's SFC **and** its `.types.ts`: no `defineModel()` and no
  `update:<name>` emit paired with a prop of the same name. There is no value
  for a host to take ownership of, so the pair has no second path to compare
  the first against. Each entry then names the component's actual surface —
  `DzTable`'s `rowExpand`/`rowCollapse` notifications, `DzRadio`'s value living
  in `DzRadioGroup`, `DzTreeItem`'s in `DzTree`'s `expandedKeys` /
  `selectedKeys` / `activeKey`.
  Components (B 25 · C 2): `DzBackTop` `DzBreadcrumb` `DzButton` `DzCard`
  `DzChip` `DzColorModeToggle` `DzCopyButton` `DzFab` `DzIconButton`
  `DzInfiniteScroll` `DzListItem` `DzMegaMenu`* `DzMenu` `DzNotification`
  `DzProvider` `DzRadio` `DzResizable` `DzScrollArea` `DzSplitButton`
  `DzSplitter` `DzStepperItem` `DzTable`* `DzTag` `DzThemeProvider` `DzToast`
  `DzToolbar` `DzTreeItem`  (*Tier C)
- **`RENDERS_NO_DOM` — 3 cells.** `axe` measures a scan of the component's own
  rendered output. `DzProvider` renders `<slot />`, `DzThemeProvider` renders
  `DzProvider` around `<slot />`, `DzFieldArray` renders a scoped-slot loop.
  A scan over them audits the **host's** markup and credits a component that
  contributed no node. Same argument as the `token-contrast` exception already
  recorded for all three, one level up.

**Falsifiability is the point.** Every reason names a source fact, and each
carries the commit it was measured at plus the sentence "a `defineModel` added
here invalidates this exception". `validate:quality-tiers` already refuses an
exception keyed to a row the component does not owe, so a stale exception
cannot hide behind a deleted row either. No ratchet ceiling was raised and no
allowlist was widened to turn a gate green — no gate's colour changed.

### 4b. `runnable-now`, executed — 11 cells, 7 real SSR renders

`packages/core/tests/ssr/ssr-smoke.spec.ts` gained a `sSR: tier C` block: the
same `ssrRender` helper and the same "renders without crash" contract as the
eleven family blocks above it. The seven components were the **whole** of the
Tier C `ssr-sample` gap; four of them (`DzCommandPalette`, `DzDataGrid`,
`DzSidebar`, `DzTour`) carry the `teleports` trait, and the matrix reads the
same file for their `portal-hydration` row — so seven tests cleared eleven
cells.

`node node_modules/vitest/vitest.mjs run packages/core/tests/ssr/ssr-smoke.spec.ts`
→ **exit 0, 62 passed, 1 skipped.** All seven pass on first write; no component
failure surfaced, so nothing was filed under `<stop_conditions>`.

**`ssr-sample` and `portal-hydration` are now 0 in Tier C and Tier D.**

---

## 5. Distance to the N1 exit condition

The 08-28 roadmap's N1 exit is *"both capability matrices show zero unexplained
`unrun` in Tier C/D"*. Taking **"explained"** in the sense the Tier D gate
already enforces — an `unrun` cell with an artifact behind it is a *scheduled*
gap, one with nothing on disk is an *absent* one:

| | at start | **now** | change |
|---|---:|---:|---:|
| Tier C/D unrun, total | 101 | **88** | −13 |
| — with an artifact (scheduled) | 53 | **53** | 0 |
| — **with nothing on disk (unexplained)** | 48 | **35** | **−13** |
| Tier C/D `excepted` | 0 | **2** | +2 |

**The distance to the N1 exit is 35 cells, in two columns:**

| Column | Tier C/D unexplained | Owner |
|---|---:|---|
| `axe` | 16 | TASK-S1-O2-F1 |
| `controlled-uncontrolled` | 19 | TASK-S1-O2-F3 |

The other 53 Tier C/D unrun cells each cite a file: `at-manual` 22 (an AT task
file with six pairs waiting for a human), `keyboard-spec` 21 (the unit spec,
with the unasserted keys named), `data-scenarios` 10 (the stories file). They
are scheduled, not absent. Whether "unexplained" should mean *this* or should
mean "not `pass`" is **owner decision O2-D2** in the handoff; under the
stricter reading the distance is 88, not 35.

---

## 6. Ranked next packets

Ranked by Tier C/D cells cleared per unit of work — the N1 exit is the metric,
not the raw count.

| # | Task | Column(s) | Tier C/D | all tiers | Note |
|---|---|---|---:|---:|---|
| 1 | **TASK-S1-O2-F3** | `controlled-uncontrolled` | **19** | 61 | Highest value: closes half the unexplained distance, and the pattern is one shape repeated (`update:modelValue` + a `defaultValue` path in an existing spec). |
| 2 | **TASK-S1-O2-F1** | `axe` | **16** | 81 | Closes the other half. Per-family specs exist for all 11 families; 81 cases to add. **Expect real WCAG failures** — `<stop_conditions>` says file them, do not fix them here. |
| 3 | **TASK-S1-O4** | `perf-baseline` (stale) | **22 stale** | 22 | `[!owner]` — the ≥5-run recapture. The only thing that moves the stale ratchet off 22. |
| 4 | **TASK-S1-O1** | `at-manual` | 22 | 89 | `[!owner]`/human. The single `needs-a-lane` cluster in the whole matrix. |
| 5 | **TASK-S1-O2-F2** | `keyboard-spec` | 21 | 78 | Already "explained" (artifact + the unasserted keys named), so it does not move the N1 number under the reading in §5 — but it is the largest body of *real* untested behaviour in the catalog. |
| 6 | **TASK-S1-O2-F5** | `data-scenarios` | 10 | 22 | Empty/Loading/Error stories for the 22 `dataset`-trait components. |
| 7 | **TASK-S1-O2-F4** | `ssr-sample`, `portal-hydration` | 0 | 58 | Tier C is done; this extends the same block to Tier A/B. Cheapest cell-per-line in the table. |
| 8 | **TASK-S1-O2-F6** | 6 singleton columns | 0 | 11 | Two of the 11 (`story-light-dark`, `browser-matrix` on `DzThemeProvider`) share one root cause: **it is the only public component in the catalog with no stories file** — already recorded as `publicComponentsWithoutExample: 1` in `component-meta-ceilings.json`. One file closes both. |

### The missing-lane list, ranked

There is one.

| # | Lane | Cells | Why no harness here can do it | Task |
|---|---|---:|---|---|
| 1 | Manual assistive-technology session (NVDA·JAWS·VoiceOver·TalkBack × browser) | **89** | The evidence *is* a human operating a screen reader. `e2e/at-matrix/{Component}.md` and `index.json` already exist with the required pairs; the rows below the results marker are append-only and **an agent never fills one**. | **TASK-S1-O1** |
