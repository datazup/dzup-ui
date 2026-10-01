# TASK-S0-O2 — Refresh the owner-decision register and drive the publication decision

> **Status: COMPLETE** at `4e4e46f` — engineering done; **A4-D1 and 61 other rows
> remain the owner's to take.** Written incrementally as the task ran.
> Programme: [`../README.md`](../README.md) · Ledger: [`../EXECUTION-STATUS.md`](../EXECUTION-STATUS.md)
> Register produced: [`./owner-decision-register-2026-09-22.md`](./owner-decision-register-2026-09-22.md)
>
> **Role boundary, stated first:** this task **prepares** decisions. It takes
> none. No commit, no publish, no `changeset version`, no registry mutation, no
> DNS change, no baseline replacement, no ADR signature. Where a decision could
> not be resolved it stays open **with costed options** — the honest outcome.

## 0. Measured baseline at task start

| Fact | Value | Command |
|---|---|---|
| HEAD | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` (`4e4e46f` — "docs: regenerate evidence at 589be13 and land the 2026-09-22 programmes") | `git rev-parse HEAD` |
| Worktree | **255 dirty paths** — every one produced by the nine executed tasks of this programme, uncommitted by design. **Preserved: nothing reverted, stashed, checked out or cleaned.** | `git status --porcelain \| wc -l` |
| Branch | `main...origin/main`, 0 ahead / 0 behind | `git status --short --branch \| head -2` |
| Pending changesets | **42** (README §2 says 38 — **stale**) | `ls .changeset/*.md \| wc -l` |
| `validate:all` links | **55** (README §2 says 50 — **stale**; the count moved five times in three days) | `node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"` |
| `[!]` rows in this programme's ledger | **10** (S0-O2, S0-O3, S1-O1, S1-O3, S1-O4, S2-O3, S2-O4, S3-O2, S5-O1, S5-O2) | `grep -c '^\| TASK-S.*\[!' docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` |
| Task rows total | 16 (6 open, 10 executed) | `grep -c '^\| TASK-S' …/EXECUTION-STATUS.md` |

**Register row-count floor: 10.**

## 1. Progress log

- [x] Read README §4/§5/§7, the S0-O2 prompt (custody-and-release-tasks.md 118–180), CLAUDE.md, VERSIONING.md.
- [x] Measured HEAD, dirty count, changeset count, link count, `[!]` row count.
- [x] Created this handoff (incremental-write discipline).
- [x] Harvested **44 decisions** from the nine handoffs' "owner decisions raised" sections.
- [x] Re-measured the publication facts — all confirmed, three corrected (see §2).
- [x] Consolidated 20 ids into 8 rows; sequenced by what they block (§5).
- [x] Wrote the register — **62 rows**, ids 1–62 contiguous, 12 columns each.
- [x] Updated EXECUTION-STATUS.md.

## 2. Re-measurement of every publication fact — confirmed / changed / unverifiable

All commands run from `ui/dzup-ui` at `4e4e46f`, exit codes read **directly**, never through a pipe.

| # | Fact the 09-04 packet quotes | Re-measured at `4e4e46f` | Verdict | Command |
|---|---|---|---|---|
| 1 | packages 404 on npm | `E404` for **all six** published packages (`contracts`, `core`, `mcp`, `nuxt`, `testing`, `tokens`) | **confirmed** | `for p in contracts core mcp nuxt testing tokens; do npm view "@dzup-ui/$p" version; done` |
| 2 | `dzup-ui.com` NXDOMAIN at apex and www | **Non-existent domain** at `dzup-ui.com`, `www.dzup-ui.com` **and** `docs.dzup-ui.com` | **confirmed + widened** | `nslookup dzup-ui.com` · `nslookup www.dzup-ui.com` · `nslookup docs.dzup-ui.com` |
| 3 | 38 pending changesets (README §2) / 37 (prior register) | **42** | **CHANGED** — grew 4 since 09-22 | `ls .changeset/*.md \| wc -l` |
| 4 | artifacts stamp `527dbd1`, one commit behind | **all four BOUND to HEAD** (`4e4e46f`) — S0-O1 closed this | **CHANGED — resolved** | `node -e "…sourceCommit===HEAD…"` (§0 of TASK-S0-O1-tree-truth-4e4e46f.md) |
| 5 | `validate:all` = 50 links | **55 links**; exit **1**, stops at link **51** | **CHANGED** | `node -e "…split('&&').length"` · `yarn validate:all > log 2>&1; echo "exit $?"` |
| 6 | capability `stale 37`, `unrun 441` | **stale 22** (C 21 · D 1) · **unrun 400** · **excepted 47** | **CHANGED** | `node -e "…capability-matrix.json…totals"` |
| 7 | `release-policy.json allowMajor: false` | `false`; 6 published, 2 withheld, tooling/apps private | **confirmed** | `node -e "…release-policy.json…"` |
| 8 | VERSIONING.md 0.x: minor = breaking, `major` refused | line 27 (`minor` = breaking), line 29 (`major` = the 1.0 act), line 37 (`major` refused by gate) | **confirmed** | `grep -nE 'minor.*breaking\|major' packages/contracts/VERSIONING.md` |
| 9 | ADR-18/19/20 all `Proposed`, ceiling 3 | **`Proposed` × 3**, `0/3 Accepted`, ceiling **3**, cited from **273** (19) / **169** (20) / **1** (18) source files | **confirmed** | `yarn validate:adr-references` → exit 0 |
| 10 | AT matrix 534 cells, 0 executed | **534** `unrun` | **confirmed** | `grep -rho '\| unrun \|' e2e/at-matrix/*.md > f; wc -l < f` |
| 11 | 29 `unclassified` ownership symbols | **29** of 1,338 | **confirmed** | `node -e "…component-ownership.manifest.json…kinds"` |
| 12 | second-tier package installed? | **NOT INSTALLED** | **confirmed** | `node -e "try{require.resolve('@dzup-ui-pro/pro/package.json')…}"` |
| 13 | `de` locale completeness | **0 % — 0 of 116 catalog keys**; locales ≥95 % = **1** (floor 1); arabic/hebrew typeface **none** | **confirmed** | `yarn validate:i18n-completeness` → exit 0 |
| 14 | `@dzup-ui/mcp` ships no LICENSE | **confirmed twice over**: no `packages/mcp/LICENSE` file **and** `files` = `["README.md","dist","docs","server.json"]` — the other **five** all have both | **confirmed** | `ls packages/mcp/LICENSE` (exit 2) · `node -e "…files…"` |
| 15 | perf: 4 of 6 metric families unbaselined | **`leak`, `longtask`, `memory`, `hydration` have no baseline**; `runtime`, `size` do; host **undesignated — in-place capture is refused**; committed evidence `win32-x64-16c-node24` | **confirmed** | `yarn validate:perf-baselines` → exit 0 |
| 16 | visual: 24 of 58 baselines on the wrong platform | **58 on disk**; authority **linux**; `gallery` 16 linux **gate** · `theme-recipe` 18 linux **gate** · `component-baselines` **24 win32 developer-local**; **24 stale** | **confirmed** | `yarn validate:visual-baselines` → exit 0 |
| 17 | stop-condition gate 5 clear / 4 fired / 1 unevaluable / 1 unattested | **exactly that** — SC-1, SC-3, SC-5, SC-8 fired · SC-7 unevaluable · SC-11 unattested | **confirmed** | `yarn validate:stop-conditions` → exit **1** |
| 18 | `@deprecated` symbols without a record | **16 annotations, 16 with a record, 0 without** | **confirmed** | `yarn validate:deprecations` → exit 0 |
| 19 | `proTierMissingMessage()` deprecated | exists at `packages/nuxt/src/module.ts:195`, exported, in the deprecation ledger | **confirmed** | `grep -rn 'proTierMissingMessage' packages/ --include='*.ts'` |
| 20 | links 52–55 unreached in the aggregate | **each exits 0 individually**; **none reached** in `validate:all` | **confirmed** | `for l in licenses tree-shake evidence-binding deprecations; do yarn "validate:$l"; echo "exit $?"; done` |

### 2.1 Two harness hazards observed live, and worth recording

1. **The background-task harness reported "exit code 0" for `yarn validate:all` while the gate itself exited 1.** The reported status was the wrapping subshell's, not the gate's. The exit code was recovered only because the command was written as `… > log 2>&1; echo "exit $?" > exitfile`. This is the same class as the pipe hazard `<repo_conventions>` warns about, in a new disguise: **a task-completion notification is not a gate result.**
2. **`grep … | wc -l` masks grep's exit code** exactly as `grep … | head` does. The AT-matrix count was therefore taken as `grep … > file; echo "exit $?"; wc -l < file`.


---

## 3. Implemented files, and their API effect

**No source, no gate, no artifact and no configuration was touched. API effect: none.**
This task is documentation only, which is what `[!owner]` means here.

| File | What it is |
|---|---|
| `docs/program-2026-09-22-architecture/reports/owner-decision-register-2026-09-22.md` | **new** — the refreshed register. 62 rows, ids 1–62, three parts (A blocking now · B evidence claims · C scheduled), plus §3 A4-D1's three costed paths, §4 the changelog⇄mcp recommendation, §5 the single owner act, §6 consolidations/supersessions, §7 the `unverified` rows |
| `docs/program-2026-09-22-architecture/reports/TASK-S0-O2-handoff.md` | **new** — this file, written incrementally |
| `docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` | **modified** — the TASK-S0-O2 row only |

Nothing was committed, pushed, published, dispatched, deployed, versioned or
signed. No ADR status was edited. No ratchet was raised and no exception file was
widened. No sibling repository was touched. `/tmp` was not used; gate logs went to
a repo-local `.tmp-s0o2/` scratch directory that is **removed at the end of this
task**, and the size-measurement script lived in the session scratchpad.

## 4. The `<done_check>` audit that produced register row 41

Register row 41 is the numbered decision the brief asked for on the recurring
defect class. **Measured, not assumed: 16 of 16 prompts in this programme carry
at least one defective `<done_check>` or `<validation>` clause, and all 7 unrun
prompts do.** Aggregate counts across the three task files: **`/tmp` 43 ·
`npx ` 29 · a pipe into `head`/`wc`/`xargs` 12 · `sourceCommit===` 2.**

| Prompt | Status | Defect classes present |
|---|---|---|
| TASK-S0-O1 | `[x]` | `/tmp`; **`sourceCommit === HEAD`** (unsatisfiable — the task replaced the invariant with the evidence-binding gate) |
| TASK-S0-O2 (**this task**) | running | **class (v) twice**: clause 3 wants A4-D1 at a status only the owner can produce, and `<validation>`'s `git status --porcelain | wc -l  # only this task's documents may appear` is impossible against 255 pre-existing paths; plus the pipe itself |
| TASK-S0-O3 | `[ ]` **unrun** | `npx`; `/tmp`; a **placeholder path** (`<adr validator>.ts`); clause 1 satisfiable only by an ADR status edit the same prompt forbids |
| TASK-S1-O1 | `[ ]` **unrun** | `npx`; `grep … | wc -l` |
| TASK-S1-O2 | `[x]` | `npx`; a `sourceCommit`-dependent precondition |
| TASK-S1-O3 | `[x]` | `/tmp`; `ls … | head` |
| TASK-S1-O4 | `[x]` | `/tmp` (recorded as DEFECTIVE by the task itself) |
| TASK-S2-O1 | `[x]` | `/tmp` |
| TASK-S2-O2 | `[x]` | `npx`; `/tmp` |
| TASK-S2-O3 | `[ ]` **unrun** | `npx`; `/tmp` |
| TASK-S2-O4 | `[ ]` **unrun** | `ls … | xargs grep -l … | wc -l` (double-masked); `/tmp`; and `grep -n 'go\|no-go'` matches the substring "go" in any prose, so it is near-vacuous |
| TASK-S3-O1 | `[x]` | `npx` **with a path that does not exist**; `/tmp` |
| TASK-S3-O2 | `[ ]` **unrun** | `npx`; `ls … | grep -i async | wc -l` |
| TASK-S3-O3 | `[x]` | `npx` |
| TASK-S5-O1 | `[x]` | `npx` |
| TASK-S5-O2 | `[ ]` **unrun** | `grep … | head -3`; and its heading carries a malformed backtick |

**Why class (ii) is the dangerous one.** `npx` in this repository fetches
dependency-confusion placeholders that **exit 0 without running**. A clause
reading `npx tsx …/validator.ts; echo "exit $?"` → `0` therefore reports a
**silent false green**: it cannot distinguish "the validator passed" from "the
validator never ran". Four unrun prompts would have been decided on that.

**Why class (v) is the one this task had to refuse.** Clause 3 asks A4-D1 to
carry "a status that is **not** `open`". An agent cannot take an owner decision,
so the only ways to satisfy that literally are to fabricate an outcome or to take
a forbidden decision. The clause has a second branch — "or with a dated
re-measurement of its evidence" — and **this task took that branch deliberately**,
saying so in the register's §3 preamble.

**Recommended remedy (register row 41 option (a))**: one shared `<harness_facts>`
block at the top of each of the three task files, stating that `/tmp` is not
writable (use a repo-local path or the scratchpad); that `npx` must never be used
and tools are invoked by module path (`node node_modules/tsx/dist/cli.mjs`,
`node node_modules/vitest/vitest.mjs run`, `node node_modules/eslint/bin/eslint.js`,
`node node_modules/vue-tsc/bin/vue-tsc.js`) while `yarn` works; that no gate
result may be read through a pipe — `| head` and `| wc -l` both mask the
producer's exit code and a **background-task completion notice reports the
wrapper's status**, so always `cmd > local.log 2>&1; echo "exit $?"`; that no
clause may require an action the same prompt forbids nor compare a value with
itself (`sourceCommit === HEAD` is unsatisfiable — use `yarn validate:evidence-binding`);
and that chain links must be counted, never quoted, and gates cited by **name**.
Then fix the 7 unrun prompts in place. One block of text in three files, against a
defect every task in this programme has now recorded.

## 5. Consolidations and sequencing

**44 decisions harvested** from the nine handoffs' "owner decisions raised"
sections, plus **~25 historical ids** carried from the 2026-09-04 register and
README §7. **20 raised ids merged into 8 rows**; **6 rows closed as `superseded`**;
**1 dropped as out of scope.**

| Row | Merged | Why one question |
|---|---|---|
| #3 | D174 · D175 · `N5-04 D2` · `D-S0O1-3` · `D-S1O3-5` | all five are the icon library; two are the same red link counted at different link numbers (48, then 51) |
| #2 | D127 · SC-1 · SC-3 · `D-S2O2-3(a)` | all four are "commit the tree" |
| #8 | `D-S2O1-3` · `D-S3O3-5` · `D-S3O3-6` | the Nuxt nonce defect and the Trusted-Types posture |
| #13 | A4-D2 · D166 | the prior register's own §7.2 already said so |
| #16 | `D-S2O1-1` · `D-S0O1-1(c)` | "is `yarn build` a gate?" |
| #21 | D135 · D140 · `D-S1O4-4` | one measurement recorded three times, at three commits |
| #23 | `O2-D1` · `D-S1O4-2` · D132 | `D-S1O4-2` **is** `O2-D1` executed |
| #61 | `D-S3O3-3` · `D-S3O3-4` | both are "how honest is the conformance reference" |

**Superseded (closed, not carried):** `D-S0O1-1` build half (the tsconfig
exclusion landed and `yarn build` is green) · `D-S0O1-5` (widened and relocated to
the register's §1.1) · `S3O1-D5` record half (16 of 16 annotations now have a
record) · `A4-D3` (`validate:registry` is chain link 40) · `D-S1O3-5` as a
standalone row · `D173` (folded into #39). **Dropped as out of scope:** `A4-D5`
(Pro distribution posture — cross-repo by its own admission; recorded once as an
exclusion per README §5 `<repository_boundary>`).

**Sequencing decision and its reasoning.** README §7 puts A4-D1 first and the
register keeps it as row 1 — but rows 2–16 are its *inputs*, so row 1 and §3.5
state that A4-D1 is **decidable only after them**. That preserves §7's order
without implying A4-D1 can be answered in isolation. Parts B and C were split out
on the prompt's own `<stop_conditions>` guidance ("blocking now" vs "scheduled"),
because 62 rows in one table is more than one owner reads in one sitting.

## 6. Focused validation output

All from `ui/dzup-ui` at `4e4e46f`, exit codes read **directly**.

| Command | Exit | Note |
|---|---|---|
| `ls docs/program-2026-09-22-architecture/reports/owner-decision-register-*.md` | **0** | one file: `owner-decision-register-2026-09-22.md` |
| `grep -c '^\| [0-9]' …/owner-decision-register-2026-09-22.md` | **0** | **62** — against a `[!]`-row floor of **10** |
| `grep -c '^\| TASK-S.*\[!' …/EXECUTION-STATUS.md` | **0** | **10** |
| `grep -n 'A4-D1' …/reports/*.md` | **0** | 12 hits in the register; row 1 carries a **dated re-measurement**, status `open` |
| table-structure check (12 columns, ids 1–62, no gaps, no duplicates) | **0** | *"ALL 62 ROWS: 13 delimiters = 12 columns — OK"* |
| `yarn validate:i18n-completeness` | **0** | 116 keys · `de` **0 %** · locales ≥95 % = **1**, floor 1 · arabic/hebrew typeface `none` |
| `yarn validate:perf-baselines` | **0** | 33 metrics · 24 thresholds · **4 families without a baseline** · host **undesignated** |
| `yarn validate:visual-baselines` | **0** | 58 baselines · authority **linux** · **24 win32 developer-local** · 24 stale |
| `yarn validate:adr-references` | **0** | `0/3 Accepted · 3 Proposed cited from code (ceiling 3)` |
| `yarn validate:deprecations` | **0** | 16 annotations · **16 with a record · 0 without** |
| `yarn validate:licenses` | **0** | link 52 — **unreached in the aggregate** |
| `yarn validate:tree-shake` | **0** | link 53 — **unreached in the aggregate** |
| `yarn validate:evidence-binding` | **0** | link 54 — **unreached in the aggregate** |
| `yarn validate:stop-conditions` | **1** | 11 conditions: **5 clear · 4 FIRED · 1 unevaluable · 1 unattested** — `RELEASE STOPPED` |
| `yarn validate:peers` | **1** | link 51. **`validate:peers` itself passes**; the chained `validate:icon-duplicates` fails on `[single-version]` |
| `yarn validate:all` | **1** | **55 links**; 1–50 green, stops at **51**, 52–55 unreached |
| size re-measurement (22 serial Vite builds, gzip) | **0** | **20 of 22 over threshold**, worst `size:DzMention` **+15.8 %** |

`yarn typecheck`, `yarn lint`, `yarn test` and `yarn build` were **not re-run** by
this task — it changed no source, so a re-run could only re-measure someone
else's result. Their last measured values at `4e4e46f` are **0 / 0 / 0 / 0**
(`yarn test`: 564 files, 10,926 passed, 0 failed), recorded by the tasks that ran
them. This handoff does not restate them as its own evidence.

## 7. Aggregate qualification

**Red, and traceable to one open decision.** `yarn validate:all` = **55 links**,
exit **1**. Links **1–50 green**. Link **51**
(`validate:peers && validate:icon-duplicates`) fails on
`✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may`
— **pre-existing**, register row 3, open since 2026-09-21. Links **52–55**
(`licenses`, `tree-shake`, `evidence-binding`, `deprecations`) are **unreached in
the aggregate** and each exits **0** individually.

**Nothing in this task made anything red, and nothing was fixed** — it is a
documentation task by construction.

**Three measurement corrections this task contributes:**

1. **The chain is 55 links** — not 50 (README §2), not 51 or 52 (two handoffs).
   `validate:evidence-binding` is link **54**, not 51; the unreached set is
   **52–55**, not 49–52. Two register rows carry the corrected numbering.
2. **`validate:peers` passes.** The link-51 failure is its chained second half,
   `validate:icon-duplicates`, and the *only* failing clause is `[single-version]`
   — the upstream deprecation and the 40 drifting registry items print as `!`
   advisories that say *"not a failure"*. Both offending declarants
   (`@dzup-ui/landing`, `@dzup-ui/sandbox`) are **workspace apps, not published
   packages**, so **aligning two ranges clears the link without taking the swap
   decision and without re-recording a single baseline.** That is a materially
   cheaper unblock than anything previously recorded for D174/D175.
3. **SC-5 is not fully cleared by the commit** — see §8. This is the correction to
   `D-S2O2-3` and the most consequential finding of this task.

## 8. The correction to `D-S2O2-3`, and what the commit really clears

`D-S2O2-3` states that one owner act clears SC-1, SC-3 and SC-5 **together**.
Measured at `4e4e46f`, SC-5's **11 findings have two distinct causes**:

- **5** are `no baseline — every symbol is unbaselined` (`contracts`, `mcp`,
  `nuxt`, `testing`, `tokens`) → **cleared** by the commit plus
  `yarn release:api-surface:record` on the clean tree.
- **6** are `@dzup-ui/core: manifest omission(s) — promised and not delivered`,
  each `severity: breaking`, `level: minor`: `useCountdown`, `useIntersection`,
  `formatRemaining`, `toRemainingParts`, `UseIntersectionOptions`,
  `UseIntersectionReturn`. **No commit and no baseline record touches these.**

I verified the cause directly: `public-api.manifest.json` — whose own `version`
field reads **`0.0.1`** against a `0.2.0` package — **names all six**, and
`packages/core/src/index.ts` exports **none** of them; its lines 51–52 carry a
comment acknowledging the drift. Symmetrically the barrel exports five symbols the
manifest does not name (`useAffix`, `useCalendar`, `useInfiniteScroll`,
`useScrollSpy`, `useScrollToTop`). That is **D158 ≡ `D-S2O2-5`**, register row 5,
and it turns on whether those five composables were ever meant to be public API —
*"not a fact a tool can read."*

**Honest statement for the owner:** the commit (plus one command) clears **SC-1,
SC-3 and 5 of SC-5's 11 findings**. Clearing SC-5 entirely also needs row 5's
decision. And per row 38, SC-7 will read `unevaluable` once more legitimately,
because the previous candidate records no `ratchets.json` and backfilling it would
mean fabricating a ceiling — so **a fully green stop-condition run is two
candidates away, not one.**

## 9. Ratchet movements

**None. No ratchet was moved, raised or lowered.** Every ceiling was re-measured
and **every one agrees with its recorded value at `4e4e46f`**, so no ratchet-board
row in `EXECUTION-STATUS.md` is falsified by this task and none was edited.

| Ratchet | Recorded | Re-measured | Verdict |
|---|---|---|---|
| `capability-matrix-ceilings.json` `staleCells` | 22 | **22** (C 21 · D 1) | agrees |
| …`staleCellKinds.kinds` | `["perf-baseline"]` | **`["perf-baseline"]`** | agrees — every stale cell is one cause |
| …`unrunCells.baseline` (report-only) | 400 | **400** (A 65 · B 247 · C 87 · D 1) | agrees |
| capability `excepted` | 47 | **47** (A 4 · B 41 · C 2) | agrees |
| `perf-baselines-ceilings.json` `metricFamiliesWithoutBaseline` | 4 | **4** (`leak`, `longtask`, `memory`, `hydration`) | agrees |
| …`unmeasurableMetrics` | 9 | **9** | agrees |
| `visual-baselines-ceilings.json` `developerLocalLanes` | 1 | **1** (`component-baselines`, 24 win32) | agrees |
| `adr-registry.json` `maxProposedCitedFromCode` | 3 | **3** (ADR-18/19/20, `0/3 Accepted`) | agrees |
| ownership `unclassified` | 29 | **29** of 1,338 | agrees |
| AT matrix executed | 0 / 534 | **0 / 534** | agrees — untouched, as required |
| `@deprecated` without a record | 0 | **0** (16 of 16 have one) | agrees |
| `validate:all` links | — | **55**, first failure at **51** | **recorded here; README §2's 50 is stale** |
| pending changesets | 38 (README §2) | **42** | **README stale by 4** |

## 10. Owner decisions raised by this task

The product *is* a 62-row register, so rather than duplicate it, here is what is
**new** or **materially changed** by this task:

1. **Register row 41 — the `<done_check>` defect class, with a concrete remedy.**
   A new numbered decision carrying **D77** and extending `D42`/`D57`/`D66`/`D72`.
   Measured: **16 of 16** prompts defective, all **7 unrun** prompts defective.
   Remedy: one shared `<harness_facts>` block (§4) plus in-place fixes to the 7
   unrun prompts. **Recommendation (a).**
2. **Register row 3, materially cheapened.** The icon decision is two decisions
   bundled: a **range alignment** (clears link 51 today; two `package.json` lines;
   no re-baselining) and the **upstream swap** (codemod + full icon re-baseline,
   `minor`). It was previously recorded only as the expensive whole.
   **Recommendation: take the cheap half now, schedule the swap.**
3. **Register row 4, enlarged.** The changelog⇄mcp fix needs a **third** part —
   the version parser must accept a prerelease `-` — or A4-D1's cheapest path (a
   snapshot publish) still turns the chain red after the recorded fix lands.
   **Recommendation: `validate:mcp` yields; take (a)+(b)+(d).**
4. **Register row 5, promoted onto the critical path.** It is SC-5's unclearable
   half (§8), not merely a barrel-hygiene note.
5. **Register row 17, promoted out of hygiene.** `apps/sandbox` removal (D177) was
   filed as "gates nothing"; it is **half of row 3's cause**.
6. **Seven rows closed as `superseded`** (§5). Carrying dead rows is how the prior
   list reached 233 open.
7. **A standing harness note:** a background-task completion notice reported
   "exit code 0" for a gate that exited **1**. It is written into row 41's remedy.

## 11. Ranked next packet

1. **The owner acts, in this order** (register §3.5): commit → record the API
   baselines **and** decide barrel-vs-manifest → `mcp` LICENSE + the Nuxt nonce →
   the three-part changelog⇄mcp fix + re-level all 42 changesets + bump the `mcp`
   transitives + write the rollback document → sign `attestations.json` **last**.
2. **Row 3's cheap half** — align `apps/landing` and `apps/sandbox` to
   `lucide-vue-next@^0.477.0`. Clears link 51 and makes links 52–55 measurable in
   the aggregate for the first time in this programme. Minutes of work.
3. **Row 41's remedy** — the `<harness_facts>` block plus the 7 unrun prompts. It
   is the precondition for the remaining packets producing trustworthy done_check
   verdicts, and **TASK-S0-O3 is the next one to run**, carrying two of the defect
   classes including a placeholder path.
4. **TASK-S0-O3** — ADR-19/20 signature; hold ADR-18 behind the Node floor (row 19).
5. **Row 20** — designate the perf capture host. It is the root of a five-row
   chain (#20 → #21/#22 → #23 → #24) blocked since 2026-09-23.
6. **Row 26** — the linux visual capture: one sitting, 8 components, and it moves
   `developerLocalLanes` 1 → 0.

## 12. `<done_check>` outcome — **3 of 4 at `4e4e46f`**, with two defective clauses named

| # | Clause | Outcome |
|---|---|---|
| 1 | a register dated within the current programme exists | **pass** — `owner-decision-register-2026-09-22.md`, `ls` exit 0 |
| 2 | row count ≥ the number of `[!]` rows in EXECUTION-STATUS.md | **pass** — **62 ≥ 10** |
| 3 | A4-D1 appears with a status **not** `open`, **or** with a dated re-measurement of its evidence | **pass on the second branch — the first branch is DEFECTIVE.** A4-D1 is the owner's decision; an agent can satisfy "not `open`" only by fabricating an outcome or taking a forbidden decision. Row 1 therefore carries **status `open` with a full dated re-measurement** (register §3.1) and three costed executable paths (§3.2–3.4). Recorded as defect class (v) in register row 41 |
| 4 | each numeric fact carries a commit or a date and a reproducing command | **satisfied by construction, not mechanically checkable** — every row has an `evidence @ 4e4e46f` cell and a `reproduce` cell; the three numbers that could **not** be reproduced are marked `unverified` in register §7 rather than repeated |

**Also defective, in this task's own `<validation>` block:**
`git status --porcelain | wc -l   # only this task's documents may appear` — impossible
by construction against **255** pre-existing dirty paths belonging to the nine
executed tasks, and the pipe masks the exit code besides. Decided from the
evidence instead: measured **255 at start**, preserved every path, and confirmed
at the end that the only additions are this task's two documents (the reports
directory is untracked, so `git status --porcelain` collapses it to a single
entry) plus the one `EXECUTION-STATUS.md` modification, which was already
tracked-and-modified.

## 13. Authority statement

No commit · no push · no CI dispatch · no publish · no registry mutation · no
`changeset version` · no version bump · no deployment · no DNS change · no
baseline replacement · no ADR signature · no ratchet raised · no allowlist or
exception file widened · no sibling repository touched. All **255** pre-existing
dirty paths preserved. Network use was limited to read-only `npm view` and
`nslookup`. No throwaway worktree was created, so none needed removing.

**No decision was taken and no outcome was fabricated. A4-D1 remains `open`.**
