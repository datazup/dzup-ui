# dzup-ui — Program 2026-09-22 execution status

> Live ledger for [`README.md`](./README.md). One row per task. Update the row
> when a task starts, when its `<done_check>` passes and a second route
> confirms it (`[x] found-done`), and when it ends. Bind every number to a
> commit. Handoffs live under [`./reports/`](./reports/) as
> `<TASK-ID>-handoff.md`.
>
> Opened **2026-09-22** at `main` @ `589be13` (clean, 0/0 vs `origin/main`).
> Re-verify README §2 before the first row moves — in particular `yarn why
> vite` / `vue`, the tooling `private` flag, and whether a Lighthouse handoff
> has appeared under `../program-2026-09-04/reports/` since.
>
> This program is a **companion** to
> [`../program-2026-09-04/EXECUTION-STATUS.md`](../program-2026-09-04/EXECUTION-STATUS.md);
> it does not restate that ledger's rows. Where a planning-document residual
> is already a `TASK-R…` row there, that row is the record — see
> [`planning-docs-disposition.md`](./planning-docs-disposition.md).

## Status

| Task | Title | Priority | Status | Started | Ended | Commit observed | Report | Ratchets / owner decisions |
|---|---|---|---|---|---|---|---|---|
| TASK-PL-O1 | Workspace dependency-graph hygiene: Vite 7 / plugin-vue 6 for the apps · one Vue · guard | 🟠 | `[ ]` | | | | | before: vite 6.4.1 ×3 apps / 7.3.5 packages; vue 3.5.31 / 3.5.39 / 3.5.42 |
| TASK-PL-O2 | Consumer-resolution helper reachable outside the workspace · tooling seam decision | 🔴 `[!owner]` | `[ ]` | | | | | option-A packet → owner |
| TASK-PL-O3 | Landing Lighthouse re-measure · CLS baseline promotion packet | 🟢 `[!owner baseline]` | `[ ]` | | | | | after PL-O1; before: 08-10 hero-split CLS 0.000005 / 0 on `fce7eef` |
| TASK-PL-O4 | Disposition stamps on the 39 planning documents + README planning section (workspace-docs) | 🟢 | `[ ]` | | | | | 3 of 39 stamped at open |

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision

## Planning-document residuals already owned elsewhere (do not duplicate)

| Residual (planning source) | Owning row | State on 2026-09-22 |
|---|---|---|
| `apps/sandbox` retired-but-present (08-08 owner decision 4) | `TASK-R1-O6` (D174–D178) | `[!]` owner |
| Firefox / WebKit evidence for the recovery (08-25 §7) | `TASK-R2-O1` | `[~]` |
| Remote CI state unknown (08-25 §7, 08-10 oss-coverage) | `TASK-R1-O4` | `[!]` owner dispatch |
| Landing RTL routes (APP-1 finding) | `TASK-R5-O4` (D62) | `[x]` |
| OSS 321 lint findings (ThemeRecipe ledger "separately tracked debt") | `TASK-R1-O1` | `[x]` |
| Visual-baseline rollout (Packet 6 OSS half) | `TASK-R2-O6` | `[~]` capture half blocked |

## Owner decisions raised by this program

| # | Decision | Raised by | Options | Recommendation | Status |
|---|---|---|---|---|---|
| PL-D1 | Tooling seam: publish `@dzup-ui/tooling` / relocate the resolution helper / leave it | TASK-PL-O2 | A · B · C (see decision sheet in the handoff) | B for the helper now; A to the owner for the validator seam | open |
| PL-D2 | `@floating-ui/vue` Vue duplicate: root `resolutions` override vs dependency bump | TASK-PL-O1 | override · bump · accept | to be filled by the handoff | open |
| PL-D3 | Landing Lighthouse baseline: promote / hold / regression | TASK-PL-O3 | promote medians · hold · file regression | to be filled by the packet | open |
