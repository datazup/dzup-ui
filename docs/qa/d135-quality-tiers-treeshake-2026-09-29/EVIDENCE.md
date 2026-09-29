# Evidence — DZUP-UI-D135-QUALITY-TIERS-TREESHAKE-20260929-R1

Measured 2026-09-29 in the packet worktree after `yarn install --immutable` and
`yarn tokens:generate`. Sizes were measured in a temporary Storage clone at the
base with only `quality-tiers.ts` changed, using the repository's
`measureExportSizes` (`packages/tooling/src/perf/export-sizes.ts`, one run;
sizes are deterministic).

| # | Acceptance | Result |
|---|---|---|
| 1 | Negative control: `yarn validate:tree-shake` | with the guard and without the fix: **rc=1**, all four fixtures (DzButton, DzInput, DzSelect, DzAlert) report `tooling-only data (contracts quality-tiers WCAG_22_CRITERIA)`. With the fix: **rc=0**, 4/4 PASS |
| 2 | Size budgets | every budgeted export −666 to −688 B gzip; over threshold **20/22 → 12/22** (table below); `baselines.json` not rewritten |
| 3 | `yarn typecheck`, `yarn lint` | rc=0 each |
| 3 | `vitest run packages/contracts packages/tooling` | **1598 passed**, 1 skipped, 1 todo |
| 3 | `yarn build`, `yarn validate:all` | rc=0 each (validate:tree-shake inside it: 4/4 PASS); tree clean afterwards |
| 3 | `build:releases` | regenerated with this changeset (`releases.ts`; `feed.xml` unchanged) |

The admission estimated "17 remain over". That came from the scratch
attribution harness, which reads about 2 % high. The repository's tool gives
12, and 12 is the figure to use.

## Sizes (gzip bytes)

| Component | Baseline median | Threshold | Main `297100b` | This packet | Saved | vs median | Budget |
|---|---|---|---|---|---|---|---|
| DzCalendar | 17916 | 18811 | 19301 over | 18613 | 688 | +3.9 % | ok |
| DzCascader | 21757 | 22844 | 24242 over | 23559 | 683 | +8.3 % | **over** |
| DzColorPicker | 19117 | 20072 | 20062 ok | 19380 | 682 | +1.4 % | ok |
| DzCombobox | 20675 | 21708 | 23291 over | 22616 | 675 | +9.4 % | **over** |
| DzCommandPalette | 19613 | 20593 | 20769 over | 20100 | 669 | +2.5 % | ok |
| DzDataGrid | 33117 | 34772 | 37125 over | 36450 | 675 | +10.1 % | **over** |
| DzDataView | 22256 | 23368 | 25537 over | 24871 | 666 | +11.7 % | **over** |
| DzDatePicker | 17546 | 18423 | 18644 over | 17971 | 673 | +2.4 % | ok |
| DzDateRangePicker | 17708 | 18593 | 18822 over | 18154 | 668 | +2.5 % | ok |
| DzFileUpload | 19418 | 20388 | 21308 over | 20629 | 679 | +6.2 % | **over** |
| DzMegaMenu | 18101 | 19006 | 20119 over | 19434 | 685 | +7.4 % | **over** |
| DzMention | 21353 | 22420 | 25965 over | 25287 | 678 | +18.4 % | **over** |
| DzMultiSelect | 19840 | 20832 | 22116 over | 21441 | 675 | +8.1 % | **over** |
| DzOrderList | 22299 | 23413 | 23343 ok | 22665 | 678 | +1.6 % | ok |
| DzPersonaSelector | 21240 | 22302 | 23952 over | 23273 | 679 | +9.6 % | **over** |
| DzSidebar | 18688 | 19622 | 19804 over | 19117 | 687 | +2.3 % | ok |
| DzTable | 15751 | 16538 | 16634 over | 15947 | 687 | +1.2 % | ok |
| DzTimePicker | 22011 | 23111 | 23452 over | 22767 | 685 | +3.4 % | ok |
| DzTour | 21165 | 22223 | 22381 over | 21707 | 674 | +2.6 % | ok |
| DzTransfer | 20028 | 21029 | 22069 over | 21396 | 673 | +6.8 % | **over** |
| DzTree | 17915 | 18810 | 19699 over | 19016 | 683 | +6.1 % | **over** |
| DzTreeSelect | 25391 | 26660 | 28553 over | 27873 | 680 | +9.8 % | **over** |

over at main: 20; over with fix: 12

## What grew since the baseline `8d80bc3` (not changed by this packet)

These figures are rollup `renderedLength` (minified, before gzip) from one-export
fixtures at `8d80bc3` and at the base.

| Source | DzMention | DzDataView | Origin |
|---|---|---|---|
| `i18n/message-format.ts` (new) | +7233 | +7233 | ICU plural/select formatter, TASK-R5-O4 |
| `i18n/messages.ts` | +1723 | +1723 | catalog growth |
| `i18n/useComponentMessages.ts`, `intl-cache.ts`, `direction.ts`, `useDzLocale.ts` | +1409 | +2329 | locale/direction provider |
| `useDzEnvironment.ts`, `provider.types.ts` | +664 | +750 | environment provider, injection keys |
| component itself | DzMention.vue +6236 | DzDataView.vue +566, DzPagination +611, DzSegmented +235 | feature work |
| `DzOptionsState.vue`, `useAsyncOptions.ts`, `useDualModel.ts` (new) | +4279 | — | async options (R5) |

All of that is deliberate programme work. The largest remaining shared cost is
the ICU formatter, which every component with text now carries: about 2.5 KB
gzip. Making it lazy, or compiling messages at build time, is a design change
for the owner (D135).
