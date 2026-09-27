# dzup-ui — Architecture-Document Program 2026-09-22 execution status

> Live ledger for [`README.md`](./README.md). One row per task. Update the row
> when a task starts, when its `<done_check>` passes (`[x] found-done`), and
> when it ends. **Bind every number to a commit.** Handoffs live under
> [`./reports/`](./reports/) as `<TASK-ID>-handoff.md`.
>
> Opened **2026-09-22** at `main` @ **`589be13`**, clean worktree (0 dirty
> paths), 0 ahead / 0 behind `origin/main`. Re-verify README §2 before the
> first row moves — and re-verify it again in any session that starts after a
> commit lands.
>
> **Scope.** Every row is `ui/dzup-ui` work. Nothing in this ledger tracks,
> waits on or reports the state of another repository; where an external
> artifact is needed, the owning task records a skipped step with a reason.
>
> **Sibling ledgers in *this* repository, to read before starting anything:**
> [`../program-2026-09-04/EXECUTION-STATUS.md`](../program-2026-09-04/EXECUTION-STATUS.md)
> (the R-series; its R0/R1/R2 residue is the largest open body of OSS work) and
> [`../program-2026-09-22-planning/EXECUTION-STATUS.md`](../program-2026-09-22-planning/EXECUTION-STATUS.md)
> (the planning-ledger programme). This programme holds only what the
> `docs/architecture/` documents specify and no packet ever built.

## Status

| Task | Title | Priority | Status | Started | Ended | Commit observed | Report | Ratchets / owner decisions |
|---|---|---|---|---|---|---|---|---|
| TASK-S0-O1 | Re-bind the generated authority to HEAD and prove the tree green | 🔴 | `[ ]` | | | | | artifacts stamp `527dbd1` at open; target = HEAD |
| TASK-S0-O2 | Owner-decision register refresh + publication decision | 🔴 `[!owner]` | `[ ]` | | | | | A4-D1 and the eleven decisions sequenced behind it |
| TASK-S0-O3 | ADR-18/19/20 acceptance execution + Proposed-ADR gate | 🟠 `[!owner signs]` | `[ ]` | | | | | `maxProposedCitedFromCode` 3 → 0 on acceptance |
| TASK-S1-O1 | AT matrix wave 1: prepare, schedule, ingest | 🟠 `[!owner tester]` | `[ ]` | | | | | AT executed **0/534** — an agent never moves this |
| TASK-S1-O2 | Capability matrix: 37 stale → 0, 441 unrun triaged | 🔴 | `[ ]` | | | | | stale 37 → 0; unrun 441 split into three buckets |
| TASK-S1-O3 | Visual regression: authoritative platform, capture, gate | 🟢 | `[ ]` | | | | | baselines platform-keyed; visual declared as matrix input |
| TASK-S1-O4 | Performance contract: bind baselines, audit the eight scenarios | 🟢 | `[ ]` | | | | | perf contribution to stale count → 0 |
| TASK-S2-O1 | Package-qualification matrix: the seven uncovered rows | 🟠 | `[ ]` | | | | | doc-08 rows covered 5/12 → 12/12 |
| TASK-S2-O2 | Release report + stop-condition gate + deprecation machinery | 🟠 | `[ ]` | | | | | `@deprecated` symbols without a record → 0 |
| TASK-S2-O3 | Docs site: size gate, registry gate, deploy runbook | 🟢 `[!owner deploys]` | `[ ]` | | | | | five deployment decisions re-measured |
| TASK-S2-O4 | CI dispatch: min-runtime · nuxt-majors · vue-next · min-peer | 🟢 `[!owner dispatches]` | `[ ]` | | | | | four lanes, four go/no-go recommendations |
| TASK-S3-O1 | Publish the second-tier ownership schema + wire the resolver | 🔴 | `[ ]` | | | | | runs now; only live integration waits on an installed manifest |
| TASK-S3-O2 | Form-control primitives: DzGrid spans · DzStack gaps · stories | 🟢 `[!owner]` | `[ ]` | | | | | `DzGrid` span API; `utility` kind; `time` profile |
| TASK-S3-O3 | Security-corpus conformance runner in @dzup-ui/testing | 🟢 | `[ ]` | | | | | corpus versioned; runner published from this repository |
| TASK-S5-O1 | i18n completeness: gate, contribution path, plurals, RTL route | 🟠 `[!owner]` | `[ ]` | | | | | locales 2 (en + `de` scaffold at 0 %) |
| TASK-S5-O2 | Toolchain execution: Vue 3.6 · Nuxt 4 · Vitest 4 · tsdown/Vite 8 | 🟢 `[!owner]` | `[ ]` | | | | | four slices, four revertible cutovers |

## Ratchet board — move one way only

| Ratchet | At open (`589be13`) | Target | Owning task |
|---|---:|---:|---|
| Generated artifacts bound to HEAD | 0 of 4 | 4 of 4 | S0-O1 |
| Capability-matrix stale cells | 37 | 0 | S1-O2 |
| Capability-matrix unrun cells (untriaged) | 441 | 0 untriaged | S1-O2 |
| AT cells executed | 0 of 534 | wave 1 = 44 | S1-O1 (human) |
| `Proposed` ADRs cited from code | 3 | 0 | S0-O3 |
| Ownership `unclassified` | 29 | ↓ | S0-O2 (decision) |
| doc-08 package-qualification rows covered | 5 of 12 | 12 of 12 | S2-O1 |
| `@deprecated` symbols without a record | *unmeasured* | 0 | S2-O2 |
| Locales at ≥ 95 % completeness | 1 (`en`) | 2 | S5-O1 |
| Pending changesets | 38 | owner decision | S0-O2 |

## How to fill a row

- **Status** — one of `[ ]` `[~]` `[x]` `[x] found-done` `[!]`.
- **Commit observed** — the commit the task's numbers are bound to, plus the
  dirty-path count if the worktree was not clean. A number without a commit is
  not evidence.
- **Report** — relative link to `./reports/<TASK-ID>-handoff.md`.
- **Ratchets / owner decisions** — `old → new` for every ratchet the task
  moved, and a numbered line per decision raised, with options and a
  recommendation.
- **done_check outcome** — record it explicitly as `n of m at <commit>`, and if
  a check was defective, say which one and what you decided from instead.
