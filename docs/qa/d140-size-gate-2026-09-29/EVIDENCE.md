# Evidence — DZUP-UI-D140-SIZE-GATE-20260929-R1

Measured 2026-09-29 in the packet worktree (base `7c23198`) after
`yarn install --immutable`, `yarn tokens:generate` and `yarn build`.
Raw logs: `/data/storage/datazup-runtime/ninel/dzup-ui-d140-20260929/`.

| # | Acceptance | Result |
|---|---|---|
| 1 | Gate on the real tree | `yarn perf:size-gate` rc=0, "all 22 size:* budgets within threshold", 22–23 s (22 Vite fixture builds) |
| 1 | Negative control | a scratch copy of `baselines.json` with `size:DzTable` threshold 15000 (measured 15947): `tsx packages/tooling/src/perf/size-gate.ts --baselines <copy>` rc=1, `FAIL size:DzTable: 15947 B > 15000 B (+6.3% vs threshold)`, "1 of 22 over budget: DzTable" |
| 1 | Unit spec | `size-gate.spec.ts` 5/5: at/under threshold passes, over fails and names the id, unmeasured or threshold-less budget fails, non-size ignored, committed file has 22 thresholded `size:*` |
| 2 | 10 rewritten, rest identical | `jq` against the admission commit: exactly the 10 ids below differ. The 12 D135 entries (`70647fb`), 11 runtime entries, `schemaVersion`, `policy` and `harness` are identical. The script asserted a byte-identical round-trip first and that each of the 10 was within its old threshold |
| 3 | `yarn typecheck` / `yarn lint` / `yarn test` / `yarn validate:all` | rc=0 each (8 s / 32 s / 42 s / 90 s). Tests: 558 files, 10651 passed, 3 skipped, 1 todo. `validate:all`: "All checks passed!" |
| 3 | Regeneration | Re-running capability-matrix → component-meta → docs-pages → llms at the final head changes only the HEAD stamp (`sourceCommit` a6150b6 → 41640ea) and the hashes derived from it, in 155 files. No cell, count or content line differs. The stamp is HEAD at generation time by design, and `validate:capability-matrix` accepts an older one. The re-stamp was discarded; the D135 packet left the same state |
| 3 | Capability matrix | `perf-baseline` cells stale **11 → 2**, pass 157 → 166. DzDataGrid and DzFileUpload stay stale on their runtime baselines (O7-D1 runtime half, deferred) |
| 4 | CI on the pushed head | recorded in the landing report |

## The 10 re-recorded budgets (O7-D1, size half)

`toBaseline` with 5 samples of the measured size; threshold = median × 1.05; `sourceCommit` `7c23198`.

| Metric | Old median | Old threshold | New median | New threshold |
|---|---|---|---|---|
| `size:DzCalendar` | 17916 | 18811.8 | 18613 | 19543.65 |
| `size:DzColorPicker` | 19117 | 20072.85 | 19380 | 20349 |
| `size:DzCommandPalette` | 19613 | 20593.65 | 20100 | 21105 |
| `size:DzDatePicker` | 17546 | 18423.3 | 17971 | 18869.55 |
| `size:DzDateRangePicker` | 17708 | 18593.4 | 18154 | 19061.7 |
| `size:DzOrderList` | 22299 | 23413.95 | 22665 | 23798.25 |
| `size:DzSidebar` | 18688 | 19622.4 | 19117 | 20072.85 |
| `size:DzTable` | 15751 | 16538.55 | 15947 | 16744.35 |
| `size:DzTimePicker` | 22011 | 23111.55 | 22767 | 23905.35 |
| `size:DzTour` | 21165 | 22223.25 | 21707 | 22792.35 |

Each was within its old threshold (headroom 1.1 %–3.6 %). With the new
baselines, every one of the 22 budgets allows +5 % from its size at `7c23198`
or `70647fb`.

## Why not in `validate:all`

22 serial Vite builds took 22 s on the workstation. A 2-core CI runner will
take longer. The build job runs the gate as a blocking step after
`yarn build`, beside the informational per-component report.
