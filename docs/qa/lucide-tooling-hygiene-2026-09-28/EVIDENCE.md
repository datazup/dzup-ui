# Evidence — DZUP-UI-LUCIDE-TOOLING-HYGIENE-20260928-R1

Measured 2026-09-28 in the packet worktree after `yarn install --immutable`,
`yarn tokens:generate` and `yarn build`.

| # | Acceptance | Result |
|---|---|---|
| 1 | `lucide-vue-next` in the three tools | **0** (the one remaining mention in `peer-surface.ts` is the dated history note on `ICON_PACKAGE`) |
| 2 | `yarn report:peer-surface` | `@lucide/vue: 22 module(s), 18 distinct glyph(s)` (the old matcher reads 0 on this dist) |
| 3 | Sizes vs `packages/core/perf/baselines.json` | see below; baselines not rewritten |
| 4 | `validate:adr-references` | 3/3 Accepted, 0 Proposed cited (ceiling 0) |
| 4 | `yarn typecheck`, `yarn lint`, `yarn validate:all` | rc=0 each |
| 4 | `vitest run packages/tooling` | **1526 passed**, 1 todo |
| 4 | `build:releases` | regenerated with the codemods changeset |

## Sizes: the icon fix, isolated

`measureExportSizes` (gzip bytes), same tree, only the `EXTERNALS` entry changed:

| Component | `@lucide/vue` external (this packet) | `lucide-vue-next` external (base) |
|---|---|---|
| DzDataView | 25537 | 27008 (+1471: icons bundled) |
| DzCombobox | 23291 | 24657 (+1366) |
| DzMention | 25965 | 25965 |
| DzTable | 16634 | 16634 |

With the fix, all 22 size metrics from `perf:capture --propose` (1 run) are
still **+4.7 % to +21.6 %** above the committed baselines (captured at
`8d80bc3`). That is code growth since the baseline, not icon counting — the
open **D135** decision (20/22 budgets breached), which this packet does not
touch.
