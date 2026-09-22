# Disposition of the planning documents that concern `ui/dzup-ui` — `workspace-docs/repos/ui/docs/planning/`

> Part of the [Planning-Ledger Program 2026-09-22](./README.md). The planning
> directory holds 39 files; **six concern this repository** and are
> dispositioned below, one row per file, keeping the directory's `ls` order
> number so a row can be cited unambiguously from either repository. The
> other 33 are owned by `ui/dzup-ui-pro` and are listed in §"Not this
> repository's" by name only — their disposition, proofs and residuals live in
> `ui/dzup-ui-pro/docs/program-2026-09-22-planning/planning-docs-disposition.md`
> and nothing about them is recorded here.
>
> **A row marked Executed is closed: cite the proof and move on.** Only the
> "Residual → owner" column can produce work, and where it names an existing
> `TASK-R…-O…` id the work already has a prompt in
> [`program-2026-09-04`](../program-2026-09-04/README.md) — run that, never a
> copy.
>
> Verified **2026-09-22** against `ui/dzup-ui` `main` @ `589be13` (clean).
> Every commit named below was checked with `git cat-file -e` and
> `git merge-base --is-ancestor main` on that date.

## Reading the columns

- **Asked for** — what the document told the next session to do.
- **Disposition** — `Executed` (done, proof on disk) · `Consumed` (the file
  itself says a successor replaced it).
- **Proof** — the path or commit a fresh agent opens to confirm it without
  re-deriving.
- **Residual → owner** — what the document left open on 2026-09-22 and which
  task owns it. `TASK-PL-O…` are this program's prompts; `TASK-R…-O…` are
  program-2026-09-04's; "other repository" means neither UI repository can
  perform it.

## The rows that concern `ui/dzup-ui`

| # | Planning document | Asked for | Disposition | Proof | Residual → owner |
|---|---|---|---|---|---|
| 1 | `DZUP_UI_PORTAL_TESTABILITY_NEXT_SESSION_PROMPT_2026-08-08.md` | Finish the 14-owner Reka portal contract (UI-3b); start SK-1 consumer helper, then SK-2 / APP-1 app packets | **Executed** | UI-3b at `8ecbe35` + `9a93d9f` (14/14 direct portal owners, plan §"Direct portal-owner inventory after UI-3b"); SK-1 / SK-2 done 2026-08-25 (`../program-2026-08/EXECUTION-STATUS-REC.md`); the in-repo half of APP-1 ran — the landing RTL defect it found was fixed by `TASK-R5-O4` (decision D62) | SK-2 consumer half (`MfaSetupModal`, `TemplatePicker`, `DzFileUploadModal`, `AppChatDrawerShell`), APP-1 across 14 apps, AR-2 Arabic vendor custody → **other repositories** (README §8) |
| 2 | `DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md` | Diagnose the duplicate reka-ui / Vue mount failure; portal contract; `@dzup-ui/testing`; consumer helper with explicit modes; rollout D1–D5 | **Executed in-repo** — UI-1/2/3a/3b, `createDzupResolution` (SK-1), `e2e/components/overlay-portals.spec.ts` 18/18 and `apps/landing/e2e/overlay-portals.spec.ts` 2/2 (SK-2); `reka-ui` resolves to one copy on 2026-09-22 | `docs/resolution-external-consumers.md`; `packages/tooling/src/resolution/`; plan §"Update 2026-08-25" | (a) the helper lives in **private** `@dzup-ui/tooling` and no external app can import it → **TASK-PL-O2**; (b) owner decision 3, the Vite 6/7 + `@vitejs/plugin-vue` 5/6 split, still measured on 2026-09-22 → **TASK-PL-O1**; (c) owner decision 4, `apps/sandbox` → `TASK-R1-O6` (D174–D178); (d) decisions 1–2 (`@datazup/dzup-theme` patch, `website-app` mode), D3 stub removal, D5 Arabic vendored core, the 14-app Vue skew → **other repositories** |
| 29 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-oss-coverage-and-sk1.md` | Freeze the OSS CI recovery, request commit/push authority; then SK-1 | **Executed** — all seven recovery SHAs (`62273f9`…`fce7eef`) are in `main` (verified by REC-01, row 37); SK-1 done | row 37; `../program-2026-08/EXECUTION-STATUS-REC.md` | Lighthouse CLS baseline never re-measured → **TASK-PL-O3**; remote CI state → `TASK-R1-O4` `[!]` |
| 36 | `NEXT_SESSION_PROMPT_2026-08-11-dzup-ui-system-foundations.md` (OSS half) | Packet P0 authoritative ownership inventory; Packet P1 Core + Pro integration repair; findings 1–3 (Nuxt module and resolver naming `@dzup-ui/pro`, prefix heuristics, stale Pro component list) | **Executed** as `TASK-OSS-P0-01/02` + `P1-01…04`. Findings 1–3 fixed: exact-name ownership manifest, resolver without prefix guessing, Nuxt module naming `@dzup-ui-pro/pro` — the only `@dzup-ui/pro` left in `packages/core/src` is the negative assertion in `resolver.spec.ts:177` | `../program-2026-08/EXECUTION-STATUS.md` | none. Findings 4–9 are Pro-owned (Pro programme row 36) |
| 37 | `NEXT_SESSION_PROMPT_2026-08-25-dzup-ui-oss-recovery-freeze.md` | REC-01: verify the recovery landed, unbind stale numbers, fix three defects, request promotion of Groups A / B | **Executed** — Groups A and B are committed (`main` @ `589be13` is clean and `validate:all` green per `TASK-R1-O1`) | `../program-2026-08/EXECUTION-STATUS-REC.md`; `../program-2026-09-04/reports/TASK-R1-O1-handoff.md` | §7: Firefox / WebKit → `TASK-R2-O1` `[~]`; remote CI unknown → `TASK-R1-O4` `[!]`; Lighthouse CLS baseline "not re-run, not promoted" → **TASK-PL-O3** |
| 39 | `dzup-ui-theme-recipe-packets-0-6-continuation-2026-08-09.md` (OSS half) | Packets 0 (contract foundation), 1 (landing consumer integration), 3 (cross-surface persistence) and 5 (Storybook toolbar axes) in OSS; the OSS App Shell / Form visual matrix of packet 6 | **Executed** — `ThemeRecipeV1` normalisation / presets / serialisation / URL contract in `packages/tokens/src/theme-recipe.ts` + spec; Storybook axes in `storybook-theme-recipe.ts`; 18 visual baselines at `fd5dd49` | `packages/tokens/src/theme-recipe.ts`, `theme-recipe.spec.ts`, `storybook-theme-recipe.ts`; `fd5dd49` | none OSS-side. "Separately tracked debt" OSS item (321 lint findings) → closed by `TASK-R1-O1`; visual-regression rollout → `TASK-R2-O6` `[~]`. Packets 2, 4, 6 and every closeout section are Pro-owned (Pro programme row 39) |

## Not this repository's — Pro-owned files (names only)

Rows 3–28, 30–35 and 38 are `ui/dzup-ui-pro` work in full (the eleven 08-09
Showcase / boundary session prompts, the 08-10 neutral-model prompts and
quality packets, and the neutral-model alignment plan). Each ran its
OSS-surface gate against this repository's built `dist/` without touching OSS
source. Nothing about them is dispositioned here; open the Pro programme's
table.

| # | File |
|---|---|
| 3 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-boundary-validator-test-support-and-shared-primitive-semantics.md` |
| 4 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-data-insights-and-performance.md` |
| 5 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-filter-builder-model-ownership-and-contract-authority.md` |
| 6 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-grid-accessibility-and-mobile-performance.md` |
| 7 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-mobile-performance-and-pro-quality.md` |
| 8 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-packet-6-remediation-and-planning-room.md` |
| 9 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-showcase-shell-performance-and-contract-authority.md` |
| 10 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-query-builder-contract-ownership-and-governance-authority.md` |
| 11 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-root-export-collisions-and-contract-authority.md` |
| 12 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-whiteboard-neutral-scene-model-ownership.md` |
| 13 | `NEXT_SESSION_PROMPT_2026-08-09-dzup-ui-workflow-designer-neutral-model-ownership.md` |
| 14 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-approval-flow-neutral-model-ownership.md` |
| 15 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-audit-log-neutral-model-ownership.md` |
| 16 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-barcode-neutral-model-ownership.md` |
| 17 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-browser-quality-and-planning-models.md` |
| 18 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-chart-neutral-data-model-ownership.md` |
| 19 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-data-grid-pro-neutral-model-ownership.md` |
| 20 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-funnel-negative-value-normalization.md` |
| 21 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-funnel-neutral-model-ownership.md` |
| 22 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-geo-schema-targets-and-remaining-neutral-models.md` |
| 23 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-image-editor-neutral-model-ownership.md` |
| 24 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-mind-map-neutral-model-ownership.md` |
| 25 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-network-graph-neutral-model-ownership.md` |
| 26 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-notebook-neutral-document-output-model-ownership.md` |
| 27 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-notification-center-neutral-model-ownership.md` |
| 28 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-org-chart-neutral-model-ownership.md` |
| 30 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-planning-browser-quality-and-visualization-models.md` |
| 31 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-report-notebook-composition-and-final-model.md` |
| 32 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-rich-text-neutral-model-ownership.md` |
| 33 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-scheduler-neutral-model-ownership.md` |
| 34 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-tree-map-neutral-model-ownership.md` |
| 35 | `NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-visualization-targets-and-data-models.md` |
| 38 | `dzup-ui-neutral-model-dzupagent-orchestration-alignment-and-refactoring-plan-2026-08-10.md` |

Rows 36 and 39 are shared documents; only their OSS halves appear above.

## What the table says in one paragraph

Every planning document that concerns this repository is executed with proof
on disk. Its work was absorbed by three successive programmes
(`program-2026-08`, `program-2026-09`, `program-2026-09-04`), which is why an
item that "looks open" in a planning file is almost always already a
`TASK-R…-O…` row with a handoff. What the successors did **not** pick up is
three specific residuals (`TASK-PL-O1…O3`) plus the documentation debt of the
directory itself (`TASK-PL-O4`); everything else the documents left open
belongs to another repository or to the owner.
