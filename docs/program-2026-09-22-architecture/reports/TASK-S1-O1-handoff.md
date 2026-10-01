# TASK-S1-O1 — AT matrix wave 1: prepare, schedule, ingest — handoff

> **Programme:** [2026-09-22 architecture](../README.md) · **Status:** `[!]` blocked on a named tester (**D112**)
> **Measured at** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`. Worktree **dirty
> by design** — ~258 paths from eleven prior tasks at session start, every one
> preserved; nothing reverted, stashed, cleaned or committed.
> **Deliverables:** [`TASK-S1-O1-wave-1-schedule.md`](./TASK-S1-O1-wave-1-schedule.md) · [`docs/qa/at-run-record.md`](../../qa/at-run-record.md)

---

## 0. The constraint, and the proof it held

`<evidence_rules>` and README §8: **an agent never fills a manual AT result
cell.** A fabricated row is worse than an empty one, because an empty one is
true.

**Executed AT cells at the end of this task: 0. Unchanged.** Four independent
proofs, each read directly and never through a pipe:

```
$ grep -rho '| unrun |' e2e/at-matrix/*.md > f; echo "grep exit=$?"; wc -l < f
grep exit=0
534

$ grep -rn -i 'FIXTURE\|SYNTHETIC' e2e/at-matrix/
(no output)  exit=1   ← 1 means no match, which is the pass

$ test -d e2e/at-matrix/runs && echo EXISTS || echo "no runs/ directory"
no runs/ directory

$ git status --porcelain e2e/at-matrix/
(empty)

$ node -e "const i=require('./e2e/at-matrix/index.json');const r=i.entries.flatMap(e=>e.rows);
           console.log('cells',r.length,'executed',r.filter(x=>x.result!=='unrun').length)"
cells 534 executed 0
```

`e2e/at-matrix/` is byte-identical to HEAD. The task's terminal state is `[!]`
on a named human, which its own `<stop_conditions>` names as the *expected*
outcome rather than a failure.

---

## 1. Implemented files and API effect

| File | Effect |
|---|---|
| `packages/tooling/src/quality/at-ingest.ts` | **new.** The ingest lane. Exports `checkRunRecord`, `renderRunRows`, `appendRunRows`, `renderVersions`, `archiveName`, `RULES`, and the `AtRunRecord` / `AtRunStep` / `IngestRefusal` / `IngestContext` types. CLI: `yarn at:ingest <record.json> [--dry-run] [--matrix-dir <dir>] [--allow-fixture]`. |
| `packages/tooling/src/quality/at-ingest.spec.ts` | **new.** 53 tests, essentially all of them assertions that something is **refused**. |
| `packages/tooling/src/validators/at-runs.ts` | **new.** `validate:at-runs` — cross-checks archived records against the matrix rows they produced. Exports `checkAtRuns`, `AT_RUNS_DIR`. |
| `packages/tooling/src/validators/at-runs.spec.ts` | **new.** 8 tests. |
| `docs/qa/at-run-record.md` | **new.** The record format and the complete refusal table, written for a tester rather than for a reviewer. |
| `docs/program-2026-09-22-architecture/reports/TASK-S1-O1-wave-1-schedule.md` | **new.** The `<done_check>`'s required packet: wave 1's 44 cells named, four costed 1.0 options, tester prerequisites, cadence, owner decisions. |
| `package.json` | **+2 scripts and their `//` docs:** `at:ingest`, `validate:at-runs`. `validate:at-runs` appended at the **END** of `validate:all`. |
| `docs/.../owner-decision-register-2026-09-22.md` | row 30 (D112) corrected — it listed three C9 options where row 32 listed four. |
| `docs/.../EXECUTION-STATUS.md` | TASK-S1-O1 row + 4 ratchet rows + the link-count row. |

**No file under `e2e/at-matrix/` was touched.** No component, contract, token or
generated artifact changed.

### 1a. What the ingest lane refuses, and why it is more than the validator

`validate:at-matrix` asks *is this row well-formed*. `at:ingest` asks *does this
record deserve to become a row*. Five of its seventeen rules have no counterpart
in the validator, and those five are where a fabricated or empty record is
caught:

| Rule | Refuses | Validator equivalent |
|---|---|---|
| `record/at`, `record/browser` | a bare product name, or `latest` | **none** — `versions` is free text the validator only checks for blankness |
| `record/os` | a missing platform | **none** — there is no OS column |
| `record/date` | a **future** date, or a non-day like `2026-02-30` | **none** |
| `record/duplicate` | the same `{pair, task, tester, date}` already recorded | **none** |
| `record/steps` | an **empty** or **all-`unrun`** record | **none** — the validator never sees a record, only rows |
| `record/verdict` | a verdict stronger than its steps | **none** |
| `record/delimiter` | a `\|` or newline that would shift every later column | **none** |
| `record/component`, `record/pair`, `record/step-task`, `record/step-result`, `record/tester`, `record/source-commit` | a cell that does not exist, a blank identity | overlaps — enforced at both ends deliberately |

**It fails closed and whole.** A record with one bad field writes nothing; there
is no "ingest the valid half" mode. That is the specific failure this programme
keeps catching — a lane that accepts a malformed input and reports success — and
a partial ingest is exactly that shape: some rows land, the tester believes the
session is recorded, and the matrix carries a pairing that looks driven and is
not.

**Append-only is enforced, not promised.** `appendRunRows` re-parses the file it
produced and asserts the pre-existing rows are still present, unchanged, in
order, as a prefix. A stray header edit or a CRLF round-trip that re-renders an
existing row throws and the write does not happen.

### 1b. A bug the specs found while being written

`new Date('2026-02-30T00:00:00Z')` is **not** `NaN` — it is the 2nd of March. The
first version of the date rule used a `NaN` check and accepted `2026-02-30`,
silently relocating the session three days from where it happened. Replaced with
an ISO round-trip (`parsed.toISOString().slice(0,10) === input`). Small, and the
kind of small wrongness a later staleness comparison reads as fact.

---

## 2. Phase 1 — the three R2-O2 scaffold fixes, re-proved at HEAD

The prompt asks for a **seeded regression for each**. All three already have one,
authored by TASK-R2-O2; the correct action is to **re-run and cite**, not to
author a second copy. README §4 item 4: never redo work a report records.

| Fix | Seeded regression | Result at `4e4e46f` |
|---|---|---|
| An all-`fail` run resolves to `fail`, never `pass` | `at-matrix.spec.ts:77` "resolves an ALL-FAIL run to `fail`, never `pass` — the defect itself", plus 11 siblings covering `partial`, all-`blocked`, one-pass-of-six, and `fail` outranking `stale` | **pass** |
| Tier D obligations ⊇ C ⊇ B | `at-matrix.spec.ts:159` "is monotonic: D contains C contains B", plus "requires every declared pairing at Tier D" and "requires none at Tier A" | **pass** |
| `validate:at-scripts` is a live link | chain position, measured | **link 22 of 57**, `exit 0` |

```
$ node node_modules/vitest/vitest.mjs run \
    packages/tooling/src/quality/at-matrix.spec.ts \
    packages/tooling/src/validators/at-matrix.spec.ts
  ✓ 35 tests                                                   EXIT=0
```

**The prompt's premise about `validate:at-scripts` is false and the task brief
repeated it.** It does not need building: R2-O2 wired it, it is chain link 22,
and it is green:

```
$ node node_modules/tsx/dist/cli.mjs packages/tooling/src/quality/generate-at-scripts.ts --check
  Tier C/D components    22
  scripted               22
  steps                  124
  matrix cells covered   132 of 534
  story resolution       checked against 1648 built stories
✓ at-scripts: 22/22 components scripted, every scaffold task covered,
  every story id resolves.                                     EXIT=0
```

**Script staleness: none.** Every one of the 124 steps resolves to a story id
that exists in the 1,648 built stories. This was the cheapest thing to check and
the most expensive to get wrong — a drifted script sends a tester to a dead
story and they discover it forty minutes into a session, and the cost is
measured in tester-hours. It is green *before* anybody is booked.

What `validate:at-scripts` does **not** cover, and what this task added: nothing
checked that a *submitted record* was genuine, and nothing cross-checked an
archived record against the matrix. Those are `at:ingest` and
`validate:at-runs`.

---

## 3. Phase 3 — the ingest path, built and proved

Phase 3's live half has **no records to ingest**, which `<stop_conditions>` names
as the expected state. What is deliverable now is the path itself, and it is
built and proved end to end.

### 3a. The synthetic proof, and where it lived

The proof ran against a **copy** of all 89 scaffold files in the session
scratchpad — never `e2e/at-matrix/`. The record was marked `"fixture": true`,
and every field said so in capitals (`SYNTHETIC-FIXTURE-NOT-AN-AT 0.0.0`,
`FIXTURE-NOT-A-TESTER`). Two independent containments:

1. `at:ingest` **refuses** a `fixture` record against `e2e/at-matrix/`, and
   refuses `--allow-fixture` against that path at all — before it reads the
   record.
2. `validate:at-runs` **refuses** a `fixture` record found in the real archive
   directory (`archive/fixture`).

```
A. fixture → REAL matrix, --allow-fixture
   ✗ --allow-fixture is refused against e2e/at-matrix/.                  EXIT=1
B. fixture → REAL matrix, no flag
   ✗ [record/fixture] … It may never enter e2e/at-matrix/.               EXIT=1
C. fixture → scratch copy, --dry-run
   ✓ accepted (nothing written); printed the 2 rows                      EXIT=0
D. fixture → scratch copy, for real
   ✓ ingested 2 row(s) into DzFileUpload.md (append-only).
     archive  …/matrix/runs/DzFileUpload-nvda-firefox-2026-09-23-fixture-…json
     executed cells  2 of 536                                            EXIT=0
```

In the scratch copy, the six generated `unrun` rows were still present, in order,
byte-identical, with the two new rows **beneath** them — append-only, observed
rather than asserted. `index.json` rebuilt itself to 536 cells / 2 executed (536
because the two step rows add to the denominator, exactly as the format
intends).

**The scratch copy was then destroyed**, and §0 proves the real matrix is
untouched.

### 3b. The refusal battery, through the real CLI

Each of these is a separate record differing from a valid one in exactly one
way. Every one exits 1 and writes nothing.

| Record | Rule fired | Exit |
|---|---|---|
| `steps: []` | `record/steps` | 1 |
| `tester: "-"` | `record/tester` | 1 |
| `at: "NVDA"`, `browser: "Firefox latest"` | `record/at` **and** `record/browser` | 1 |
| `date: "2027-01-05"` (future) | `record/date` | 1 |
| `component: "DzNotAComponent"` | `record/component` | 1 |
| `steps[0].id: "typeahead"` (not owed by `DzFileUpload`) | `record/step-task` | 1 |
| `verdict: "pass"` over a `fail` step | `record/verdict` | 1 |
| the same valid record, ingested twice | `record/duplicate` (once per step) | 1 |

---

## 4. Focused validation — exact commands and exit codes

`npx` is **not** used. In this repository it fetches dependency-confusion
placeholders that exit 0 without running, which is a silent false green; the
`<done_check>`'s and the task brief's `npx` invocations are re-expressed below.

```
$ node node_modules/eslint/bin/eslint.js \
    packages/tooling/src/quality/at-ingest.ts \
    packages/tooling/src/quality/at-ingest.spec.ts \
    packages/tooling/src/validators/at-runs.ts \
    packages/tooling/src/validators/at-runs.spec.ts
                                                                  EXIT=0

$ node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json
                                                                  EXIT=0

$ node node_modules/vitest/vitest.mjs run \
    packages/tooling/src/quality/at-ingest.spec.ts \
    packages/tooling/src/quality/at-matrix.spec.ts \
    packages/tooling/src/validators/at-runs.spec.ts \
    packages/tooling/src/validators/at-matrix.spec.ts
  4 files · 96 tests passed                                       EXIT=0

$ node node_modules/tsx/dist/cli.mjs packages/tooling/src/quality/generate-at-scripts.ts --check
  ✓ 22/22 components scripted, 1648 story ids resolve             EXIT=0

$ node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/at-matrix.ts
  cells 534 · executed 0 · required 136 · required executed 0 · unrun 534 · stale 0
  ✓ no malformed or unevidenced rows.                             EXIT=0

$ node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/at-runs.ts
  archived records 0 · executed cells 0 of 534
  ✓ no archived session records yet — the honest state.            EXIT=0
```

### 4a. Aggregate qualification

See §8. The new gate is **locally qualified, not aggregate-qualified**, for a
pre-existing reason unrelated to this task.

---

## 5. Ratchet movements

| Ratchet | Old | New |
|---|---|---|
| **AT cells executed** | 0 of 534 | **0 of 534 — unchanged, wave 1 ready.** The one ratchet an agent may never move. |
| AT ingest lane that fails closed | 0 (none existed) | **1** — 17 refusal rules, 53 specs |
| Archived records cross-checked against the matrix | 0 (nothing checked them) | **1** — `validate:at-runs`, link 57 |
| AT scripts stale or unrunnable | *unmeasured this programme* | **0** — 22/22, 124 steps, 1,648 story ids resolve |
| `validate:all` links | 56 | **57** — appended at the END; links 1–56 keep their numbers, `validate:at-scripts` still 22, `validate:at-matrix` still 23 |
| Tooling spec count | — | **+61** (53 + 8) |
| Inherited cost estimates corrected | 3 wrong | **3 corrected** (schedule §7) |

**No ratchet raised. No allowlist or exception file widened. No ceiling moved.
No result cell written.**

---

## 6. Owner decisions raised

Full costing in [`TASK-S1-O1-wave-1-schedule.md`](./TASK-S1-O1-wave-1-schedule.md) §2 and §6.

1. **D112 🔴 — name an AT tester and a wave-1 date.** *This is the whole
   blocker.* Wave 1 is **20.6 tester-hours** on **one Windows machine** (NVDA +
   Firefox, JAWS + Chrome), ≈ 4 working days dedicated or ≈ 4 calendar weeks at
   a day a week. **Recommendation: (b)** — an internal tester with JAWS in demo
   mode, accepting a reboot every 40 minutes; move to a licensed seat if wave 1
   justifies wave 2. Not an external contractor first: wave 1 is also how the
   scripts get debugged by real use, and that feedback is worth more in-house
   than the hours saved.
2. **D114 🔴 — which 1.0 accessibility claim.** Four options, costed at HEAD:
   narrow to Tier A/B (**18.5 h** + 3–4 agent-days scripting Tier B first) ·
   narrow the pair set to what ran (**20.6 h**) · defer C9 past 1.0 (**0 h**,
   and the README's WCAG AA claim must be qualified in the same change) · claim
   the tier ladder, 136 cells (**50.5 h**). **Recommendation: the tier ladder,
   reached through the pair set** — run wave 1 first and decide with a defect
   count in hand. **Except option 1, which must be decided now or never**: it is
   the only option whose *first hour is different work* (Tier B, not Tier C/D).
3. **D113 🟠 — cadence.** **Recommendation: both** — event-driven when a cell
   goes stale (≈ 16 h/quarter) *and* one full sweep per minor release. Each
   alone has a failure the other covers.
4. **D115 🟠 — script Tier B's 67 cells?** **Recommendation: after wave 1** —
   unless option 1 is chosen, in which case it is immediately on the critical
   path. Never "run it unscripted": that is how two testers come to disagree
   about what "tested" means.

**Corrected in the register, and said out loud:** row 30 (D112) listed **three**
C9 options while row 32 (D114) listed **four**. The fourth — claim the tier
ladder — was created by TASK-R2-O2's tier ladder after row 30 was written, and
README §7 item 4 still says three. Row 30 now lists four and points at the
schedule packet. No verdict, cost or recommendation was altered; only a stale
option count in one of two places.

---

## 7. `<done_check>` outcome — **3 of 4 at `4e4e46f`**, clause 3 defective

| # | Clause | Result |
|---|---|---|
| 1 | `grep -rho '\| unrun \|' e2e/at-matrix/*.md \| wc -l` → **534** | **PASS** — 534, at start and at end. |
| 2 | an `at:ingest`-shaped lane exists | **PASS** — `at:ingest`, added by this task. *It did not exist at start; the brief's claim here was correct.* |
| 3 | `npx tsx packages/tooling/src/validators/at-scripts.ts` → 0, and `validate:at-scripts` in the chain | **DEFECTIVE — two ways.** |
| 4 | `TASK-S1-O1-wave-1-schedule.md` exists with three costed 1.0 options | **PASS** — and four options, since a fourth exists. |

**Clause 3, first defect: the file it names has never existed.** There is no
`packages/tooling/src/validators/at-scripts.ts`. `validate:at-scripts` is
`tsx packages/tooling/src/quality/generate-at-scripts.ts --check`. This is the
**fourth** time in this programme a check has named a path that was never
written, and it is the failure mode README §4 item 3 warns about: the clause
cannot decide the question it claims to decide, because running it as written
produces "no such file" whatever the state of the repository.

**Clause 3, second defect: `npx`.** In this repository `npx` resolves
dependency-confusion placeholder packages that exit **0 without running**. A
clause whose pass condition is "exit 0" is therefore satisfiable by a command
that did nothing — the precise definition of a false green, and strictly worse
than the missing path, which at least fails loudly.

**Decided from the evidence instead**, per README §4 item 3. The clause's
*intent* — "the AT scripts are not stale and the gate is live" — is satisfied:
`generate-at-scripts.ts --check` **exit 0**, 22/22, 1,648 story ids resolve, and
`validate:at-scripts` is chain link **22 of 57**. The clause's *text* cannot be
satisfied by any state of the repository.

**A passing phase-1 check does not close this task**, as the prompt says. The
task ends `[!]` on D112.

Running tally: **16 of 16 prompts in this programme are defective** per S0-O2's
audit; this is the 16th confirmed, and the task brief that carried it repeated
two of its errors (it asserted `validate:at-scripts` does not exist — it does,
and is green) while correctly flagging the `npx` hazard.

---

## 8. Aggregate qualification

```
$ node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"
57
```

`yarn validate:all` run **end to end**, exit code read directly. See §9 for the
verbatim result. The pre-existing failure is unchanged and is **not** caused by
this task:

- Links **1–50** green.
- **Stops at link 51**, `validate:peers`, whose *second* command
  `validate:icon-duplicates` reports
  `✗ [single-version] lucide-vue-next 0.475.0 + 0.477.0`. `validate:peers`
  itself passes; the failing half is the duplicate-icon check. It is owner
  decision **D-peer-hygiene** (README §7 item 5) and no agent may resolve it.
- Links **52–57** — `licenses`, `tree-shake`, `evidence-binding`,
  `deprecations`, `adr-status`, **`at-runs`** — are **unreached in the
  aggregate** and each exits **0** individually.

Therefore `validate:at-runs` is **locally qualified, not aggregate-qualified**,
and the maturity ladder in `<evidence_rules>` forbids collapsing those two. It
will be aggregate-qualified the moment the icon-duplicate decision lands; no
work in this task can advance it.

`validate:at-scripts` (22) and `validate:at-matrix` (23) are **inside** the
green prefix and are genuinely aggregate-qualified.

---

## 9. Verbatim aggregate result

Run end to end, exit code captured to a file and read directly — **never through
a pipe**.

```
$ node -e "console.log(require('./package.json').scripts['validate:all'].split('&&').length)"
57

$ yarn validate:all > validate-all.log 2>&1; echo "VALIDATE_ALL_EXIT=$?"
VALIDATE_ALL_EXIT=1
```

**The only `✗` in the entire 457-line log** — grepped, not skimmed:

```
$ grep -a -n '✗' validate-all.log
457:✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
```

Immediately above it, in the same link: `Peer dependency validation passed.` —
so **`validate:peers` itself passes** and the failing half is its second
command, `validate:icon-duplicates`. Pre-existing, owner-owned (README §7 item
5), untouched by this task.

**The two AT links are inside the green prefix and passed in the aggregate:**

```
✓ at-scripts: 22/22 components scripted, every scaffold task covered,
  every story id resolves.                                        ← link 22

Manual AT task matrix — TASK-OSS-P5-04
  components (Tier B–D)  89
  cells                  534
  executed               0
  required cells         136  (tier-differentiated, TASK-R2-O2)
  required executed      0
  unrun                  534  (reported)
  stale                  0  (reported)
✓ at-matrix: no malformed or unevidenced rows.                    ← link 23
```

**`validate:at-runs` (link 57) does not appear in the log at all:**

```
$ grep -a -c 'at-runs' validate-all.log
0
```

Unreached, because the chain stops at 51. It exits **0** individually (§4). It is
therefore **locally qualified, not aggregate-qualified** — and per
`<evidence_rules>`' maturity ladder those two levels are not collapsed here.

### 9a. Full test suite

```
$ yarn test > yarn-test.log 2>&1; echo "YARN_TEST_EXIT=$?"
YARN_TEST_EXIT=0
  Test Files  567 passed (567)
       Tests  11012 passed | 3 skipped | 1 todo (11016)
    Duration  349.77s
```

**Exit 0 on the first run — no re-run needed.** The two `failed` substrings in
the log are a *test name* ("...never one that just failed") and a benign
`Error: chunk load failed` from an async-component timeout in `apps/landing`,
which occurred because `validate:all` was running concurrently and loaded the
machine. Zero failing tests; the suite reported green despite the load rather
than the documented reverse.

Against the baseline this task inherited (564 files / 10,926 tests): **+3 files,
+86 tests.** Two of those files and 61 of those tests are this task's
(`at-ingest.spec.ts` 53, `at-runs.spec.ts` 8). **The remaining +1 file and +25
tests are not this task's and are not claimed** — consistent with another
session writing to this checkout, which this repository has seen before. Stated
rather than absorbed, because a test count silently inheriting someone else's
work is how a ratchet stops meaning anything.

### 9b. The matrix, re-verified after every gate had run

```
$ grep -rho '| unrun |' e2e/at-matrix/*.md > f; echo "grep exit=$?"; wc -l < f
grep exit=0
534
$ git status --porcelain e2e/at-matrix/
(empty)
```

**534 `unrun`, 0 executed, `e2e/at-matrix/` byte-identical to HEAD** — the state
this task was required to preserve, measured at the start, after the synthetic
proof, and again after the full aggregate.

---

## 10. Ranked next packet

1. **D112 — book the tester.** Nothing in this repository can advance the AT
   ratchet. The engineering is finished twice over: the scripts have been ready
   since N1-O4, the resolver since R2-O2, the ingest path since today. 0 of 534
   has not moved across four programmes, and no fifth programme will move it.
   **20.6 hours and one Windows machine.**
2. **`validate:icon-duplicates` (owner, §7 item 5).** It is the single link
   blocking aggregate qualification for links 52–57 — now six gates, including
   two built in the last two days. Every gate appended from here inherits
   "locally qualified" until this is decided, and the cost compounds.
3. **D115 only if D114 picks option 1.** Otherwise it waits for wave 1 to debug
   the script format by real use.
4. **Nothing else in S1-O1.** Phase 3 runs when records exist. The lane will
   refuse anything that is not one.
