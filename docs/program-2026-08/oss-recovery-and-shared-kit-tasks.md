# dzup-ui — OSS recovery freeze and shared-kit lane (task prompts)

> Part of the [System Program 2026-08](./README.md). This is the lane reserved by
> `workspace-docs/repos/ui/docs/planning/NEXT_SESSION_PROMPT_2026-08-10-dzup-ui-oss-coverage-and-sk1.md`:
> close the OSS CI recovery first, then SK-1, SK-2, APP-1 in that order, with
> AR-2 gated separately on vendor-custody evidence. The ThemeRecipe ledger
> records the recovery as *implemented and locally qualified* on
> `fix/blocks-gallery-ui-ux`; whether it ever reached `main` has **not** been
> verified — TASK-REC-01 verifies it.
>
> Every prompt assumes `<repo_conventions>` from [README.md §3](./README.md#3-how-these-tasks-are-written).
> Re-read them before starting any task.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
> **Priority:** 🔴 P0 · 🟠 P1 · 🟢 P2

## Ordering

```text
TASK-REC-01 (freeze + authority request)
   └─> TASK-SK-1 (shared-kit consumer helper)
         └─> TASK-SK-2 (overlay consumers → helper)
               └─> TASK-APP-1 (real-component rollout in apps)
TASK-AR-2 (Arabic vendor custody) — independent; gated on evidence, never on the lane above
```

Do not mix SK-1 changes into a recovery commit. Do not start SK-1 until REC-01
reports the recovery as locally green on the exact source you are editing.

---

## 🔴 P0 — Recovery freeze

### [ ] TASK-REC-01 — Verify and freeze the OSS CI recovery state; request promotion authority

_Gap: the 08-10 handoff left the recovery on `fix/blocks-gallery-ui-ux` (local
`fce7eef`, three commits ahead of `origin/…` `ff91966`; remote `main` `1f17c52`
red on CLS `0.1378…` for `/blocks/hero-split`), with an uncommitted
`BlocksIndexPage.vue` edit that was red on focused lint with 31 style findings.
Local `main` is now `ae89240` (2026-08-11) and root `lint` runs with
`--max-warnings 0`. Nobody has recorded whether the recovery commits reached
`main` or whether remote `main` is green._

```xml
<role>You are the release-custody engineer for ui/dzup-ui. Follow <repo_conventions> from docs/program-2026-08/README.md exactly. You verify and report; you do not promote.</role>

<task>Establish, with reproducible evidence, the exact state of the OSS CI recovery relative to the current main, re-qualify it locally if source changed since the last accepted qualification, and produce a promotion request that an owner can approve or reject. Perform no commit, push, checkout of a different branch, CI dispatch, or baseline replacement.</task>

<motivation>Every later packet in this lane (SK-1, SK-2, APP-1) must sit on a green recovery, and the ledger forbids mixing them with the recovery commit. The recovery's evidence is bound to specific commits; if those commits were merged, rebased, or superseded, the evidence must be re-bound or re-run. Reporting maturity levels separately (implementation ≠ focused ≠ aggregate ≠ remote CI ≠ publication) is what lets an owner grant a narrow authority instead of a blanket one.</motivation>

<discovery>
  Run read-only and record every output verbatim in your report:
  1. `git -C ui/dzup-ui status --short --branch` — current branch, ahead/behind, dirty files. Preserve every dirty file.
  2. For each recovery commit `62273f9 804cc59 d7b9a1a ff91966 e2b6f90 dab9658 fce7eef`: `git cat-file -t <sha>` and `git branch -a --contains <sha>`. Classify each as: in main / only on fix/blocks-gallery-ui-ux / absent locally.
  3. `git log --all --oneline --grep="CLS\|hero-split\|coverage-policy\|test:prepare"` to find squashed or re-authored equivalents if the SHAs are absent.
  4. `git fetch --dry-run` is NOT allowed to mutate; if you cannot read remote state without fetching, say so and use `git log origin/main -1` as-is, flagging its age.
  5. Confirm the recovery behaviours exist in current source regardless of SHA: HeroSplit measured wide/compact preview minimum heights; `test:prepare` invoked by both `test` and `test:coverage` in package.json; the coverage policy scoping packages and landing independently (vitest config), with the nested app ratchet intact.
  6. `yarn lint` (root, `--max-warnings 0`) — report whether the 31 BlocksIndexPage.vue findings are gone; if not, list them but do not auto-fix unless the file's active owner is you (check `git log -1 -- apps/landing/src/pages/BlocksIndexPage.vue` and the dirty state).
</discovery>

<requirements>
  <rebinding>If any recovery SHA is absent from main, treat the last accepted qualification (coverage 391 files / 6,569 passed / 1 skipped / 1 todo; Lighthouse hero-split CLS desktop 0.000005053747362772389 in 3/3, mobile 0 in 3/3) as UNBOUND and re-run the focused gates on current source. Never promote old numbers onto new source.</rebinding>
  <focused_gates>
    Run in this order and stop at the first red required gate:
    `git diff --check` · `yarn lint` · `yarn typecheck:all` · focused preparation/registry tests (the 529-test set: `vitest run` on the landing registry/preparation spec paths you locate) · the forced-transition browser regression for HeroSplit (section movement ≤ 60 px and CLS &lt; 0.1; the landing browser file previously passed 2/2) via `yarn test:e2e:landing` scoped to that spec · `yarn landing:build`.
  </focused_gates>
  <aggregate_gate>Only if any source file changed after the last accepted snapshot: `yarn test:coverage`. Thresholds are unchanged by you: packages 80/80/80/80; landing 88 branches / 65 functions / 89 lines / 89 statements; 65% ratchet. Report the exact file/test counts.</aggregate_gate>
  <lighthouse>Do not replace the accepted Lighthouse baseline. If you re-run the config-driven desktop/mobile matrix, report CLS only; do not promote LCP timings from a contended machine as a baseline (the ledger rejected such a run once already).</lighthouse>
  <separation>If the recovery and the concurrent gallery work (BlocksIndexPage.vue and related) need distinct promotion units, propose the grouping by file list; do not stage, stash, or reset anything.</separation>
</requirements>

<steps>
  1. Complete <discovery>; write the commit-classification table.
  2. Decide bound/unbound per <rebinding>.
  3. Run <focused_gates>; capture outputs to the scratchpad and quote the summary lines.
  4. Run <aggregate_gate> if required.
  5. Write the promotion request (see <example>) and append it, dated, to workspace-docs/repos/ui/docs/planning/ as a new file `NEXT_SESSION_PROMPT_<date>-dzup-ui-oss-recovery-freeze.md`, binding every number to `git rev-parse HEAD` and the dirty-file list. Do not touch indexes/document-catalog.jsonl.
</steps>

<example>
```markdown
## Promotion request — ui/dzup-ui @ <HEAD sha>, branch main, dirty: [list]
| Level | Evidence | Status |
|---|---|---|
| Implementation | HeroSplit min-heights present (apps/landing/src/blocks/…), test:prepare wired | present |
| Focused validation | lint 0/0 · typecheck:all ✓ · 529/529 · e2e hero-split 2/2 (max move 41 px, CLS 0.0000) | green |
| Aggregate qualification | yarn test:coverage 391 files / 6,569 / 1 skip / 1 todo (re-run <date>) | green |
| Remote CI | origin/main 1f17c52 last known red (run 31336695186); not re-checked (no fetch authority) | unknown |
| Publication | none | not requested |
Requested authority: commit group A (recovery files …) → push → monitor successor CI to terminal state. Group B (gallery: BlocksIndexPage.vue …) owned by <owner>, not included.
```
</example>

<validation>git diff --check · yarn lint · yarn typecheck:all · focused vitest paths · yarn test:e2e:landing (hero-split spec) · yarn landing:build · (conditional) yarn test:coverage</validation>

<success_criteria>Every recovery SHA is classified; every number in the report is bound to the HEAD you ran it on; maturity levels are reported separately; the promotion request names exact file groups; no git state changed except files you were asked to create in workspace-docs.</success_criteria>

<stop_conditions>Unresolved source custody (a recovery file is dirty and owned by someone else) · concurrent overlapping edits in target files · any required gate red that you cannot fix inside the recovery scope · any request to commit, push, dispatch CI, or replace a baseline — report and wait for explicit authority.</stop_conditions>
```

---

## 🟠 P1 — Shared-kit lane

### [ ] TASK-SK-1 — Explicit shared-kit consumer helper for merged-source vs externalized modes

_Gap: the 08-10 handoff reserved SK-1 as "the explicit shared-kit consumer
helper for merged-source versus externalized modes" and ordered it first after
recovery. Today consumers (Storybook `viteFinal`, the sandbox, landing, and
downstream apps under `workspace-share/apps/*`) each re-declare workspace
aliases to `packages/*/src` — the same resolution logic copied per consumer,
which is exactly how the Nuxt/resolver `@dzup-ui/pro` drift (reassessment H1)
happened._

```xml
<role>You are a build-tooling engineer for ui/dzup-ui. Follow <repo_conventions> exactly. This is a bounded packet separate from the recovery commit (TASK-REC-01 must be locally green first).</role>

<task>Add one typed, documented helper that lets any consumer choose between "merged-source" (resolve @dzup-ui/* to workspace packages/*/src for in-repo development) and "externalized" (resolve to the built/published packages) without re-implementing alias logic, and migrate the in-repo consumers that currently hand-roll aliases to it.</task>

<motivation>Alias logic duplicated across Storybook, sandbox, landing, and external apps drifts independently and is the root cause class behind stale handwritten inventories. A single helper makes the mode an explicit, testable decision, gives external apps (workspace-share) one supported integration path, and is the prerequisite for SK-2 (overlay consumers) and APP-1 (real-component rollout).</motivation>

<discovery>
  1. `grep -rn "packages/core/src\|packages/tokens/src\|alias" ui/dzup-ui/apps/*/vite.config.* ui/dzup-ui/apps/storybook/.storybook/main.ts` — list every hand-rolled alias map.
  2. `grep -rln "shared-kit\|sharedKit\|externalized\|merged-source" ui/dzup-ui workspace-share --include=*.ts --include=*.mts --include=*.md` (exclude node_modules) — find prior naming and any existing partial helper; reuse its name if one exists.
  3. Read packages/tooling/ for an existing vite/alias utility and the validate:externals script (tsx packages/tooling/scripts/validate-externals.ts) — the helper must agree with its notion of externals.
  4. Identify which package should own the helper: prefer @dzup-ui/tooling (dev-only) unless external apps need it at runtime, in which case document why.
</discovery>

<requirements>
  <api>
    Export a pure function, e.g. `createDzupResolution({ mode: 'merged-source' | 'externalized', root?: string, packages?: DzupPackageName[] })` returning `{ alias: Record&lt;string,string&gt;, dedupe: string[], optimizeDeps?: {...} }` suitable for spreading into a Vite `resolve` config and into Storybook `viteFinal`. Mode is REQUIRED — no implicit default — so every consumer states its choice.
    Cover all workspace packages (contracts, tokens, core, compat, testing, nuxt, mcp, codemods) plus subpaths (`@dzup-ui/tokens/css`, `@dzup-ui/core/styles`, …) by reading package.json `exports`, not by a handwritten list.
  </api>
  <safety>In externalized mode the helper must never point at src/. In merged-source mode it must dedupe vue and @dzup-ui/* so two copies cannot load. Unknown package names throw with an actionable message.</safety>
  <tests>Vitest: both modes produce deterministic alias maps from a fixture root; subpath exports resolve; unknown package throws; snapshot of the merged-source map for the real repo root to catch accidental package additions.</tests>
  <migration>Replace hand-rolled alias maps in apps/storybook/.storybook/main.ts and apps/sandbox + apps/landing vite configs with the helper (merged-source). Do not change behaviour; confirm builds byte-equivalent where practical (compare dist file lists).</migration>
  <docs>A short section in packages/tooling/README.md (or the owning package) and a note in docs/storybook-decisions.md; an example for an external app in externalized mode.</docs>
</requirements>

<steps>
  1. Discovery; choose owning package; write the API signature in a .types.ts first.
  2. Implement from package.json exports; add tests.
  3. Migrate Storybook, sandbox, landing; run their builds.
  4. Document; add a changeset (minor for tooling) — do not commit.
</steps>

<validation>yarn typecheck:all · yarn lint · vitest on the new spec · yarn validate:externals · yarn validate:exports · yarn storybook:build · yarn landing:build · yarn build (tooling/core unaffected)</validation>

<success_criteria>One helper, two explicit modes, zero remaining hand-rolled @dzup-ui alias maps in apps/ ; tests green; builds green and unchanged in output; docs show an external-app example.</success_criteria>

<stop_conditions>REC-01 not locally green · an external app under workspace-share needs a runtime dependency on the helper (ownership decision) · the helper would require core to know about pro (never) · any commit/push.</stop_conditions>
```

---

### [ ] TASK-SK-2 — Rank and migrate overlay consumers onto the shared-kit helper; keep overlays testable

_Gap: SK-2 is the second reserved packet ("rank SK-2 overlay consumers"). The
Reka dedupe / overlay testability plan
(`workspace-docs/repos/ui/docs/planning/DZUP_UI_REKA_DEDUPE_AND_OVERLAY_TESTABILITY_PLAN_2026-08-08.md`)
and the portal testability prompt from the same date identified that overlay
components (Dialog, Popover, Tooltip, Menu, Toast, Drawer) are the consumers
most sensitive to duplicate Vue/Reka copies — exactly what wrong alias
resolution produces._

```xml
<role>You are a frontend infrastructure engineer for ui/dzup-ui. Follow <repo_conventions>. Prerequisite: TASK-SK-1 merged locally.</role>

<task>Produce a ranked inventory of overlay consumers across in-repo apps and external workspace-share apps, migrate them in rank order to the SK-1 helper, and make each migrated consumer's overlays testable in Playwright (portal target reachable, no duplicate Reka instance).</task>

<motivation>Overlays break first when two copies of vue or reka-ui load: teleports land in the wrong root, focus traps fight, and tests flake. Ranking by blast radius (number of overlay components × users of the app) lets the work stop at any point with the riskiest consumers fixed.</motivation>

<discovery>
  1. Read the two 2026-08-08 plans named above if present; extract their open items and test patterns (portal container selection, `data-testid` conventions).
  2. For each app in ui/dzup-ui/apps/* and workspace-share/apps/*: count imports of DzDialog, DzDrawer, DzPopover, DzTooltip, DzDropdownMenu, DzContextMenu, DzToast, DzConfirmDialog, DzCommandPalette; record its alias mechanism (helper / hand-rolled / published package).
  3. Check each for duplicate instances: `yarn why vue` / `yarn why reka-ui` in that app, and the `dedupe` setting.
</discovery>

<requirements>
  <ranking>A table: app · overlay imports · alias mechanism · duplicate-copy risk · rank. Put it in this file under the task when done.</ranking>
  <migration>Top-ranked first. Each migration = switch to the helper (mode stated explicitly) + a Playwright smoke that opens one dialog and one tooltip, asserts a single portal root and focus return on close.</migration>
  <testability>Where a consumer has no portal target contract, add the documented `portal` prop / provider target (coordinate with TASK-OSS-P4-04 if the provider lands first; do not invent a second mechanism).</testability>
  <scope>Read-only for external apps you do not own: produce the ranked table and a per-app patch proposal instead of editing.</scope>
</requirements>

<steps>1. Discovery + ranking table. 2. Migrate in-repo consumers in rank order. 3. Add Playwright smokes. 4. Write patch proposals for external apps. 5. Update the plan documents' open items with results.</steps>

<validation>yarn lint · yarn typecheck:all · yarn storybook:build · yarn test:e2e (overlay smokes) · yarn test:e2e:landing</validation>

<success_criteria>Ranked table exists; every in-repo overlay consumer uses the helper; each has a passing overlay smoke; no duplicate vue/reka-ui resolution in migrated apps.</success_criteria>

<stop_conditions>SK-1 not merged locally · an external app's owner has not accepted the patch proposal · a fix would require forking an overlay component.</stop_conditions>
```

---

### [ ] TASK-APP-1 — Real-component rollout: replace hand-rolled UI in apps with @dzup-ui/core components

_Gap: APP-1 is the third reserved packet. Landing sections, sandbox pages, and
Storybook doc blocks still hand-roll buttons, cards, tabs, and form rows with
raw markup + tokens. That UI does not inherit the library's a11y, theming, RTL,
and reduced-motion behaviour, so the apps under-represent the product and
regress independently._

```xml
<role>You are a design-system adoption engineer. Follow <repo_conventions>; free tier only — never add a paywall and reserve the word "Pro" for the paid tier.</role>

<task>Inventory hand-rolled UI in apps/landing, apps/sandbox, and apps/storybook doc blocks, and replace it page by page with real @dzup-ui/core components where a component fits, measuring that a11y, theming (light/dark), and RTL are inherited rather than re-implemented.</task>

<motivation>The apps are the library's proof. Every hand-rolled control is a place where the product's own claims (WCAG 2.2 AA, token-only theming, RTL) are not exercised, and a place that drifts when the component changes. Rolling real components out is also how TASK-SK-1's helper and TASK-OSS-P4's provider get their first real consumers.</motivation>

<discovery>
  1. `grep -rn "&lt;button\|&lt;input\|&lt;select\|role=\"tab\"\|role=\"dialog\"" apps/landing/src apps/sandbox/src apps/storybook/stories/_blocks` — list candidates; exclude `?raw`-paired block sources in apps/landing/src/blocks (those are deliberately copy-pasteable snippets; handle separately).
  2. For each candidate name the Dz component that fits (DzButton, DzCard, DzTabs, DzFormField+DzInput, DzBadge, …) or mark "no fit — keep".
  3. Record current Lighthouse/CLS and e2e baselines for touched landing routes before editing (read-only).
</discovery>

<requirements>
  <rollout>One page or section per slice. Keep visual parity (token values unchanged) unless the component's design is the intended fix. Remove now-dead scoped styles from the app shell when a component replaces the markup.</rollout>
  <blocks>For apps/landing/src/blocks (the registry/llms.txt sources), only replace markup if the block's documented purpose is "composed from core components"; otherwise leave the snippet and note it.</blocks>
  <evidence>For each slice: `yarn storybook:build` (if doc blocks touched), `yarn landing:build`, `yarn test:e2e:landing` and the responsive sweep `yarn test:responsive:landing` for any block touched; axe via the existing a11y e2e project; verify light AND dark by screenshot in the e2e run.</evidence>
  <perf>Do not regress the landing mobile LCP gate or HeroSplit CLS; if a component swap increases initial JS beyond validate:bundle-budget, lazy-load the page section rather than inlining.</perf>
</requirements>

<steps>1. Discovery table (candidate · replacement · page). 2. Slice 1: sandbox pages (lowest risk). 3. Slice 2: Storybook doc blocks. 4. Slice 3: landing sections, one route at a time with before/after e2e. 5. Record results in docs/free-apps-review.md.</steps>

<validation>yarn lint · yarn typecheck:all · yarn storybook:build · yarn landing:build · yarn test:e2e:landing · yarn test:responsive:landing · yarn validate:bundle-budget</validation>

<success_criteria>Every candidate is either replaced or explicitly kept with a reason; touched routes keep green e2e, a11y, CLS and bundle budgets; no new scoped styles; light/dark/RTL verified.</success_criteria>

<stop_conditions>A replacement needs a new core component (that is a separate, unadmitted feature) · bundle budget cannot be met by lazy-loading · any "Pro" gating or wording creeps into free apps.</stop_conditions>
```

---

## 🟢 P2 — Separately gated

### [ ] TASK-AR-2 — Arabic vendor custody gate: evidence file and RTL verification matrix before any vendoring

_Gap: AR-2 ("Arabic vendor custody") is listed last in the 08-10 lane and is
"separately gated by Arabic vendor-custody evidence". The ThemeRecipe ledger
mentions two app deployment-context inventories (Template and Arabic Language
apps) that must not be regenerated. No custody evidence file exists in
ui/dzup-ui for Arabic fonts, locale data, or shaping assets._

```xml
<role>You are a compliance-minded frontend engineer. Follow <repo_conventions>. This task produces EVIDENCE and a verification matrix; it vendors nothing.</role>

<task>Discover every Arabic/RTL vendor asset the library or its apps depend on (fonts, locale/format data, bidi or shaping helpers), record licence and provenance for each in a custody evidence file, and define the RTL verification matrix that TASK-OSS-P4-05 and the apps will execute. Stop before adding, copying, or re-hosting any asset whose custody is not evidenced.</task>

<motivation>Vendoring a font or locale dataset without licence evidence is a publication risk for an OSS package, and re-generating the Arabic Language app's deployment inventory was explicitly forbidden by the ledger. Separating "what do we rely on and may we ship it" from "does RTL work" keeps the legal decision with the owner and the engineering work unblocked.</motivation>

<discovery>
  1. `grep -rn "arabic\|ar-\|\"ar\"\|dir=\"rtl\"\|Noto\|Cairo\|Tajawal\|IBM Plex Arabic\|Amiri" ui/dzup-ui --include=*.ts --include=*.vue --include=*.css --include=*.json --include=*.html` (exclude node_modules/dist) — assets, font-face declarations, locale imports.
  2. Search workspace-share/apps/* for the Arabic Language app and its deployment-context inventory; read it, do not regenerate it.
  3. For each asset: source URL, version, licence (SIL OFL / Apache / CLDR terms / proprietary), where it is loaded from (bundled, CDN, system), and whether the OSS licence audit (`yarn validate:licenses`) currently sees it.
</discovery>

<requirements>
  <evidence_file>Create docs/rtl/arabic-vendor-custody.md with a table per asset: name · version · licence · provenance link · load path · OSS-shippable? (yes / no / owner decision) · evidence date. Unknown fields stay "unknown"; never guess a licence.</evidence_file>
  <matrix>Define the RTL verification matrix: components (primitives first, then data/overlays), axes (dir=rtl × light/dark × compact density × reduced motion), checks (logical properties only — no left/right in CSS, icon mirroring policy, caret/slider/knob direction, number formatting via Intl with `ar` and `ar-u-nu-latn`, text-align, scroll direction, keyboard arrow semantics). Reference where each check will run (Playwright project, contract spec, story).</matrix>
  <licence_gate>If any asset is shippable only under conditions (attribution, no-modification, reserved font name), write the exact obligation next to it. Anything "no" or "owner decision" is a stop for vendoring.</licence_gate>
</requirements>

<steps>1. Discovery. 2. Evidence file. 3. Matrix. 4. Run `yarn validate:licenses` and record whether it covers the assets. 5. Report the owner decisions required.</steps>

<validation>yarn validate:licenses · yarn lint (docs unaffected) · no source change</validation>

<success_criteria>Every Arabic/RTL asset in use is listed with licence evidence or an explicit "unknown"; the RTL matrix is concrete enough for TASK-OSS-P4-05 to execute; no asset was vendored or moved.</success_criteria>

<stop_conditions>Any asset lacks licence evidence and someone asks you to vendor it anyway · the deployment-context inventory would need regenerating · a proprietary font is already bundled (report immediately).</stop_conditions>
```
