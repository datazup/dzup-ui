# Evidence — DZUP-UI-D135-SIZE-BUDGETS-20260929-R1

Measured 2026-09-29 in the packet worktree at base `70647fb` after
`yarn install --immutable` and `yarn tokens:generate`.

| # | Acceptance | Result |
|---|---|---|
| 1 | 12 rewritten, rest identical | `jq` comparison against the base: exactly 12 `baselines[]` entries differ (the ids below). The 21 others, `schemaVersion`, `policy` and `harness` are identical. The file round-tripped byte-identically before the rewrite (asserted by the script). |
| 1 | Each new entry | built by `toBaseline` from `capture-baselines.ts` with 5 samples of the measured size, e.g. `size:DzMention`: `median 25287.00 + max(3σ 0.00, 5% 1264.35) = 26551.35`, `sourceCommit` `70647fb` |
| 2 | All 22 `size:*` within threshold | yes: 12 by construction (median = measurement), and 10 already were (table in `../d135-quality-tiers-treeshake-2026-09-29/EVIDENCE.md`) |
| 3 | Matrix | `perf-baseline` cells stale **21 → 11**, pass 147 → 157. 10 of the 12 raised components now pass. DzDataGrid and DzFileUpload stay stale because their runtime baselines still predate their last change |
| 3 | `yarn typecheck`, `yarn lint`, `vitest run packages/tooling`, `yarn validate:all` | rc=0 each; 1525 tooling tests passed, 1 skipped, 1 todo. The first `validate:all` failed at `validate:exports` only because the fresh worktree had no `dist`; after `yarn build` it passed, and the tree was clean afterwards |
| 4 | CI on the pushed head | recorded in the landing report |

## The 12 budgets

| Metric | Old median | Old threshold | New median | New threshold |
|---|---|---|---|---|
| `size:DzCascader` | 21757 | 22844.85 | 23559 | 24736.95 |
| `size:DzCombobox` | 20675 | 21708.75 | 22616 | 23746.8 |
| `size:DzDataGrid` | 33117 | 34772.85 | 36450 | 38272.5 |
| `size:DzDataView` | 22256 | 23368.8 | 24871 | 26114.55 |
| `size:DzFileUpload` | 19418 | 20388.9 | 20629 | 21660.45 |
| `size:DzMegaMenu` | 18101 | 19006.05 | 19434 | 20405.7 |
| `size:DzMention` | 21353 | 22420.65 | 25287 | 26551.35 |
| `size:DzMultiSelect` | 19840 | 20832 | 21441 | 22513.05 |
| `size:DzPersonaSelector` | 21240 | 22302 | 23273 | 24436.65 |
| `size:DzTransfer` | 20028 | 21029.4 | 21396 | 22465.8 |
| `size:DzTree` | 17915 | 18810.75 | 19016 | 19966.8 |
| `size:DzTreeSelect` | 25391 | 26660.55 | 27873 | 29266.65 |

## Not changed: the ICU formatter

The owner also asked to load the formatter only when a message needs plurals.
It already tree-shakes to the five components that format counts, and each of
them formats only plural messages. Deferring it saves nothing and would blank
DzDataView's first-render status line. See the admission.
