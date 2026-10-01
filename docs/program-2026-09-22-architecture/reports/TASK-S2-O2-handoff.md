# TASK-S2-O2 — Release report, stop-condition gate and deprecation machinery

> Programme: [Architecture Review 2026-09-22](../README.md) · file
> [custody-and-release-tasks.md](../custody-and-release-tasks.md) · agent run
> **2026-09-22**. Written incrementally while the task ran.
>
> **Commit this report is bound to:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
> (`4e4e46f`). README §2 says `589be13`; **stale**, re-verified per README §4
> point 1. Every number below is a measurement **at `4e4e46f`** with the four
> prior tasks' work uncommitted in the worktree. Nothing here is CI, release or
> production evidence — it is **locally qualified** only.

---

## 0. Progress log (append-only, written while the task ran)

| # | When | What |
|---|---|---|
| 1 | session start | HEAD `4e4e46f` confirmed. **197 dirty paths** inherited from S0-O1 / S1-O2 / S3-O1 / S2-O1 — preserved, none reverted, stashed, checked out or cleaned. |
| 2 | done_check | Run first, per README §4. **0 of 4 pass** → task runs in full. Clause defects recorded in §1. |
| 3 | discovery | doc-08 and doc-06 lists transcribed verbatim (§2). **doc 08 has NINE prose bullets, not eleven** — §2a. Deprecation inventory measured (§2b). |
| 4 | resumed | Session stalled mid-discovery; **all work on disk was preserved and none was restarted**. Resumed from the three lanes on disk. |
| 5 | fix | **Date-rollover defect found in my own gates** and fixed: `bundleId()` is `<date>-<sha>`, so the candidate's identity changed at midnight while the tree did not. §3a. |
| 6 | proof | Seeded-defect proof of the stop-condition gate: **exit 0 → 1 (named) → 0**, byte-identical restore. §5b. |
| 7 | measurement | Deprecations **16 with a record, 0 without**; `proTierMissingMessage()` found. §4. Report: **exactly 8 top-level sections**. §5c. |
| 8 | aggregate | §6. |
| 9 | end | §7–§10. |

---

## 1. `<done_check>` outcome on entry — **0 of 4 at `4e4e46f`**

> Scored again on exit in **§10a: 4 of 4**, with three clauses recorded as
> defective. The table below is the state *before* anything was built.

| # | Check | Result on entry |
|---:|---|---|
| 1 | a script matching `/release-report\|stop-conditions\|deprecations/` exists | **FAIL** — zero matches in `package.json#scripts`. |
| 2 | `yarn generate:release-report` → 0 with exactly eight top-level sections | **FAIL** (no such script). **Clause defective** — writes to `/tmp/rr.log`, unwritable on this machine. |
| 3 | `npx tsx packages/tooling/src/validators/stop-conditions.ts` | **FAIL** — file does not exist. **Clause defective** — `npx` is unsafe in this repo. |
| 4 | `npx tsx packages/tooling/src/validators/deprecations.ts` | **FAIL** — file does not exist. Same `npx` defect. |


---

## 2. Discovery — what doc 08 actually says

### 2a. doc 08 lists **nine** bullets; this gate enumerates **eleven**

The first bullet is **compound** — *"dirty/unidentified source, generated drift,
or evidence bound to a different commit/configuration"* — and names three
independent failures with three different remedies. Splitting it gives
**3 + 8 = 11**, which is the count the task brief uses.

**The split is recorded as data, not inferred in code**
(`stop-conditions.json#$nineBulletsElevenConditions`), precisely so a reader who
counts bullets in doc 08 and finds nine does not conclude that two conditions
were invented. This is the kind of silent arithmetic that turns a spec into a
rumour, and it is the reason the config file carries prose at all.

### 2b. The eleven, and how each is decided

| # | Condition | How it is decided |
|---:|---|---|
| 1 | dirty / unidentified source | `git status --porcelain` |
| 2 | generated drift | `validate:evidence-binding` (S0-O1's link 51), reused |
| 3 | evidence bound to a different commit/configuration | every `*.json` in the candidate, via its own `provenance.admissible` / `sourceCommit` |
| 4 | wrong or unresolved Core/Pro package ownership | the ownership manifest + `validate:ownership` |
| 5 | unexplained public API diff or manifest omissions | `api-diff.json` |
| 6 | required validator cannot start on the declared runtime | `package.json#engines` + every `validate:*` script resolving to a file that exists |
| 7 | threshold/budget raised without a reviewed justification | `ratchets.json` of this candidate vs the previous one |
| 8 | sanitizer/decoder/optional-peer path **fails open** | **package-qualification rows 8 and 9** |
| 9 | browser/AT/RTL/SSR evidence missing for a changed high-risk component | tiers B/C/D + `git status` over `packages/core/src/components` |
| 10 | tarball differs from the reviewed build / undeclared files or entry points | **package-qualification row 11** |
| 11 | action lacks explicit authority | **human attestation only** — see §5d |

**Conditions 8 and 10 are the pay-off from TASK-S2-O1.** Before that task
neither was mechanically detectable and both could only be *described*; the
twelve-row matrix is what makes them decidable, and this gate consumes
`package-qualification.json` directly rather than re-deriving anything.

---

## 3. Implemented files and API effect

| File | What it is |
|---|---|
| `packages/tooling/src/validators/stop-conditions.ts` | the eleven-condition gate (new) |
| `packages/tooling/src/validators/stop-conditions.json` | its config **as data** — the 9→11 split, the attested rows, ceiling/allowlist files, high-risk tiers, which qualification rows carry which condition (new) |
| `packages/tooling/src/validators/stop-conditions.spec.ts` | unit tests (new) |
| `packages/tooling/src/validators/deprecations.ts` | the `@deprecated` ⇄ record gate (new) |
| `packages/tooling/src/validators/deprecations.spec.ts` | unit tests (new) |
| `packages/contracts/deprecations.json` | the deprecation register — 16 records, each with replacement, first-deprecated, earliest-removal **with its basis**, codemod-or-migration, runtime-warning status, rollback and owner (new) |
| `docs/qa/release/attestations.template.json` | the human-signature template for condition 11 (new) |
| `packages/tooling/src/release/report.ts` | the eight-section release report + `--verify-sections` (modified) |
| `packages/tooling/src/release/release.spec.ts` | section-contract tests (modified) |
| `scripts/release-rehearsal.sh` | the three new lanes wired into the rehearsal (modified) |
| `package.json` | `validate:deprecations` · `validate:stop-conditions` · `generate:release-report` (modified) |

**Public API effect: none.** Nothing under `packages/core/src`, no export added,
removed or renamed. `packages/contracts/deprecations.json` is a new **data file
in a published package**; it is not referenced by `exports`, so it is inert to
consumers today — see **D-S2O2-4**.

### 3a. A defect in my own gates, found by the clock

The session crossed midnight, and that exposed a real bug:
`bundleId()` is `<YYYY-MM-DD>-<shortCommit>`, so **the candidate's identity
changed while the tree did not**. Every artifact for `4e4e46f` sat in
`2026-09-22-4e4e46f`; both new tools looked in `2026-09-23-4e4e46f`.

Measured consequences, before the fix:

- `validate:stop-conditions` — **4 conditions `unevaluable`** (SC-3, SC-5, SC-8, SC-10) for a reason with nothing to do with the release;
- `generate:release-report` — printed **`api-diff: ABSENT · supply chain: ABSENT · qualification: ABSENT`** for a commit whose evidence was entirely present.

A release report that says ABSENT about evidence that exists is exactly the
false statement doc 08 §8 exists to prevent, so this was not cosmetic.

**Fix:** `candidateForCommit()` resolves a candidate by **commit**, not date —
prefer the exact `bundleId` *if it holds evidence*, else the newest directory
for the **same short commit** that does, else the exact name (so a genuinely
missing candidate still reports missing rather than silently borrowing another
commit's evidence). It never crosses commits: only names ending in
`-<shortCommit>` are considered. An explicit `--candidate` / `--out` is still
honoured verbatim. Both tools now use it.

**Effect of the fix, same tree, same commit:**

| Condition | Before | After |
|---|---|---|
| SC-3 evidence binding | `unevaluable` | **fired** (5 artifacts stamped `admissible:false`) |
| SC-5 API diff | `unevaluable` | **fired** (11 unexplained findings) |
| SC-8 fail-open | `unevaluable` | **fired** (row 9 red) |
| SC-10 tarball | `unevaluable` | **clear** |
| **Totals** | 5 clear · 1 fired · 4 unevaluable · 1 unattested | **5 clear · 4 fired · 1 unevaluable · 1 unattested** |

The gate went from *blind on four conditions* to *deciding all but one*. The
count of reds rose, which is the correct direction: an `unevaluable` condition
was always being reported as a red, but a red with no information in it.

The stray `docs/qa/release/2026-09-23-4e4e46f/` — a duplicate candidate for an
unchanged tree, created only by the rollover — was removed.

---

## 4. Deprecation machinery — measured

```
yarn validate:deprecations  →  exit 0
16 `@deprecated` symbol(s) in packages/*/src — 16 WITH a record, 0 WITHOUT.
  16 records · 4 with written instructions instead of a codemod
  · 5 without a runtime dev warning (each with a recorded reason)
```

| Package | Records |
|---|---:|
| `@dzup-ui/compat` | 11 |
| `@dzup-ui/core` | 2 |
| `@dzup-ui/tokens` | 2 |
| `@dzup-ui/nuxt` | 1 |

The gate is **bidirectional**: it fails both on an annotation with no record and
on a record whose annotation has disappeared, so the register cannot rot in
either direction.

**`proTierMissingMessage()` — the live test case — is found**, and its record is
the most interesting one in the file because it refuses to guess:

> `firstDeprecated: "0.1.0-alpha.0"` — *"NOT derivable from git: the annotation
> is UNCOMMITTED at `4e4e46f` (`git log -S'@deprecated' -- packages/nuxt/src/module.ts`
> returns nothing). It arrived with TASK-S3-O1's second-tier resolver work,
> which the owner has not committed. Recorded as the package's current
> unreleased version, and it must be re-derived once S3-O1 lands."*

Its `runtimeWarning.status` is `absent` with a stated reason — that adding one
would mean editing another task's uncommitted work and entangling two diffs.
**5 of 16 records carry such a reason; none is silently blank.**

---

## 5. Focused validation output

Every command run unpiped, exit code written to a log and read from it. `/tmp`
is **not writable on this machine**, so every log went to the session
scratchpad. `npx` was not used.

| # | Command | Exit | Result |
|---:|---|---:|---|
| 1 | `yarn validate:deprecations` | **0** | 16 symbols · 16 with a record · 0 without |
| 2 | `yarn validate:stop-conditions` | **1** | **by design** — 11 conditions: 5 clear · 4 fired · 1 unevaluable · 1 unattested |
| 3 | `yarn generate:release-report` | **0** | **8 top-level sections, all present, in order** |
| 4 | `vitest run stop-conditions.spec.ts deprecations.spec.ts release.spec.ts` | **0** | **3 files, 132 tests passed** |
| 5 | seeded-defect proof, control | **0** | SC-10 clear |
| 6 | seeded-defect proof, seeded | **1** | SC-10 **fired and named** |
| 7 | seeded-defect proof, restored | **0** | SC-10 clear again, file byte-identical |

### 5a. The eleven conditions at `4e4e46f`

```
✗ SC-01 [fired]       dirty/unidentified source
✓ SC-02 [clear]       generated drift
✗ SC-03 [fired]       evidence bound to a different commit/configuration
✓ SC-04 [clear]       wrong or unresolved Core/Pro package ownership
✗ SC-05 [fired]       unexplained public API diff or manifest omissions
✓ SC-06 [clear]       required validator cannot start on the declared runtime
? SC-07 [unevaluable] threshold/budget raised without a reviewed justification
✗ SC-08 [fired]       sanitizer/decoder/optional-peer path fails open
✓ SC-09 [clear]       browser/AT/RTL/SSR evidence missing for a changed high-risk component
✓ SC-10 [clear]       tarball differs from the reviewed build / undeclared files
⊘ SC-11 [unattested]  action lacks explicit authority
```

**Every red is correct and none is mine to clear:**

- **SC-1** — 208 uncommitted paths; the candidate is `4e4e46f+208`, *"not a commit anyone can check out"*. This is the programme's design (the owner commits), and it is exactly what this condition is for.
- **SC-3** — 5 artifacts stamped `provenance.admissible = false`, because they were generated on that dirty tree. Honest and self-consistent.
- **SC-5** — 11 unexplained findings: 5 packages have **no API baseline at all** (*"every symbol is unbaselined, so no change is explained"*) and `@dzup-ui/core` has **6 manifest omissions**.
- **SC-8** — chains straight to TASK-S2-O1: *"row 9 (CSP and Trusted Types): red — Trusted-Types half RED, 1 governed sink in packed bytes"*. The fail-open condition now has a real input.
- **SC-7** — `unevaluable`, and it says why and how to fix it: the previous candidate `2026-09-21-527dbd1` records no `ratchets.json`, so no comparison is possible. Remedy named in the output: run the gate with `--write-ratchets` on each candidate.

**An `unevaluable` condition is reported as a red, not a pass.** That is the
single most important design decision in this gate: *a gate that cannot see a
condition must not report one.*

### 5b. Seeded-defect proof (the gate is worthless unless it fires)

Run against a **scratch candidate** in the session scratchpad, so real evidence
was never written to:

```
1. CONTROL   --only 10 --candidate <scratch>   → exit 0   ✓ SC-10 [clear]
2. SEEDED    row 11 verdict flipped to "red"   → exit 1   ✗ SC-10 [fired]
             · row 11 (Tarball file/export/API diff): red — SEEDED DEFECT:
               2 undeclared file(s) shipped (dist/transforms/__tests__/leak.js)
             ✗ RELEASE STOPPED. SC-10 (fired) — tarball differs from the
               reviewed build or has undeclared files/entry points
3. RESTORED  pristine copy replaced            → exit 0   ✓ SC-10 [clear]
```

- The fired run **names the condition** by id *and* by its doc-08 wording, and quotes the offending row verbatim.
- Restore is **byte-identical**: sha256 `ee3d0bfec10fcd31…` before and after.
- The real `docs/qa/release/2026-09-22-4e4e46f/package-qualification.json` is unchanged (`ee3d0bfec10fcd31…`), verified independently after the proof.

### 5c. The eight-section release report

`generate:release-report` runs `--verify-sections`, which asserts the rendered
document against the section list rather than trusting the renderer:

```
1. Implemented scope and source commit
2. Focused validation
3. Aggregate repository qualification
4. Browser / AT / security / performance experience qualification
5. Packed-artifact qualification
6. Downstream canary / adoption evidence
7. Publication / production authority and actual operation status
8. Known gaps, accepted exceptions, rollback, ranked next work
```

`grep -c '^## '` → **8**. Each section is present **even when it has nothing to
report**, and an empty section says **UNRUN**, never green:

> `gates recorded: 0 (sections 2 and 3 report UNRUN, not green)`

That is the doc-08 requirement that the eight sections be stated
*independently* — a section that silently vanishes when empty lets a reader
infer coverage that was never measured.

Section 8 is the one that earns its place: it reports, unprompted, that
`generate:exports` **would drop 5 composable exports** from `@dzup-ui/core`'s
barrel and add 2, i.e. a generator would perform a **breaking removal with no
changeset behind it** — and it explicitly declines to resolve it:

> *"Reported as an owner finding, not silently resolved: a generator would
> perform a breaking removal with no changeset and no decision behind it, and
> which side is right — the barrel or the manifest — is not a tool's call."*

### 5d. Condition 11 is human-only, by construction

The repository **can** show that an action did not happen (0 release tags,
`provenance.json` stamped unsigned, no publish record). It **cannot** show that
an action which *did* happen was authorised — authority lives in a person.

So condition 11 is `unattested` (a red) until a human signs
`docs/qa/release/<candidate>/attestations.json`, for which
`docs/qa/release/attestations.template.json` is the template. The template says
in its own body:

> *"An agent must never fill `attestedBy`, `date` or `decision` in a real
> candidate's attestations.json — a fabricated signature is worse than an empty
> one, for the same reason an agent never fills a manual AT result cell."*

**No attestations.json was created for this candidate.** Leaving condition 11
red is the correct outcome, not an omission.

---

## 6. Aggregate qualification — pre-existing vs new

Run end to end on the worktree this task hands over. Exit codes read from a
log file, never through a pipe.

| Lane | Exit | Verdict |
|---|---:|---|
| `yarn typecheck` | **0** | green |
| `yarn build` | **0** | green — 8 of 8 workspaces, unchanged from the state TASK-S2-O1 left |
| `yarn lint` | **0** | green — **first run was 1**, 23 errors, *all 23 in this task's own new files*; fixed at the defect (§6b) |
| `yarn test` | **0** | **558 files, 10699 passed, 0 failed** — exit 0 when run on its own. It exited 1 in two *loaded* runs, for a reason that was never a test failure (§6a) |
| `yarn validate:all` | **1** | 52 links; sole red is link **48 `validate:peers`** — **pre-existing D174/D175** |

### 6a. `yarn test` exited 1 twice with zero failing tests — chased down, not waved away

```
Test Files  558 passed (558)
Tests       10699 passed | 3 skipped | 1 todo
Errors      1 error

Error: [vitest-worker]: Timeout calling "onTaskUpdate"
  at Object.onTimeoutError  node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
  at Timeout._onTimeout     node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
```

**No test failed.** The non-zero exit comes from one unhandled error whose
stack lies entirely inside `node_modules/vitest` — the reporter RPC timing out
while a worker is slow to acknowledge a task update. It names no test file.

Per `<repo_conventions><validation>` ("report tooling failures and component
failures SEPARATELY") this is recorded as a **tooling failure**:

- it reproduced **twice**, in two independent full runs, with an identical stack;
- both runs were under load (other lanes running concurrently); the second reported `environment 2116s` of cumulative setup;
- the baseline TASK-S2-O1 left was **556 files / 10,637 passed, exit 0**. This task adds **2 spec files** (`stop-conditions.spec.ts`, `deprecations.spec.ts`) and the suite is now **558 files / 10699 passed**, still with **0 failures**;
- run in isolation, the three suites this task touched pass cleanly: `vitest run stop-conditions.spec.ts deprecations.spec.ts release.spec.ts` → **exit 0, 3 files, 132 tests**.

**Resolved, by running the lane on its own rather than reasoning about it.**
The suspicion worth testing was that this task's two new spec files caused it —
they do real filesystem work (temp candidate directories, seeded JSON), which
lengthens a worker's task-update latency. Both failing runs, however, had other
lanes executing concurrently. Re-run with nothing else on the machine:

```
yarn test > test-solo.log 2>&1; echo "exit $?"   ->  exit 0
Test Files  558 passed (558)
Tests       10699 passed | 3 skipped | 1 todo      (no Errors line)
```

**Exit 0, same tree, same spec files.** The failure was load, not content, and
the suite this task hands over is green. Recorded rather than deleted because
an aggregate that goes red under parallel load will do it again to the next
agent, who should not have to rediscover that the stack is entirely inside
`node_modules/vitest`. Filed as **D-S2O2-7** at the lowest priority.

### 6b. Every new red this task produced was its own, and all were fixed

`yarn lint` failed on the first aggregate with **23 errors, all 23 in files this
task created or modified** — nothing in anyone else's code. 20 were
auto-fixable (import ordering, lowercase test titles, indentation, `prefer-template`);
3 needed judgement:

- two unused capturing groups in a semver regex — the minor and patch are matched so a range like `^2.9.2` is consumed, but only the major is read, so they became non-capturing;
- one `no-template-curly-in-string` in a spec whose fixture **is** a verbatim copy of a real source line containing `${file}` — interpolating it would destroy the thing under test, so it carries a scoped `eslint-disable-next-line` with that reason. (The first attempt put a three-line comment between the directive and its target, which silently moved the directive onto the wrong line — the lint run caught it.)

`yarn lint` is **0** on the tree handed over.

### 6c. Pre-existing reds, unchanged and untouched

`validate:all` exits 1 at link **48 `validate:peers`**:

```
[single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
  lucide-vue-next@0.475.0  declared by @dzup-ui/landing, @dzup-ui/sandbox
  lucide-vue-next@0.477.0  declared by @dzup-ui/core
```

This is **D174/D175**, open since TASK-R1-O6, and is the *only* red link. It is
not this task's and was deliberately not touched: clearing it needs manifest
changes in two apps plus a lockfile update, and the upstream package is
deprecated in favour of `@lucide/vue`.

**`yarn validate:stop-conditions` exits 1 by design** and is *not* a regression:
it is a new gate reporting the true state of an uncommitted candidate. It is
deliberately **not** a `validate:all` link — SC-1 fires on any dirty worktree,
which is correct for a release and useless for a per-change gate — so adding it
did not make the aggregate red. Only `validate:deprecations` was chained.

---

## 7. Ratchet movements (old → new), all bound to `4e4e46f`

| Ratchet | Old | New | Moved by |
|---|---:|---:|---|
| **`@deprecated` symbols without a record** | *unmeasured* | **0 of 16** | this task |
| Repository-wide deprecation ledger | **0** | **1** (`packages/contracts/deprecations.json`, 16 records) | this task |
| Release stop conditions that are executable | **0 of 11** (prose only) | **11 of 11** | this task |
| Stop conditions decided at `4e4e46f` | — | **10 machine-decided · 1 human-attested** | this task |
| Stop conditions `unevaluable` (blind) | **4** (before the candidate-resolution fix) | **1** (SC-7, with its remedy named) | §3a |
| Release-report sections **enforced** | 0 (8 intended) | **8 of 8, asserted by `--verify-sections`** | this task |
| Attested rows with a signature template | **0** | **1** | this task |
| `validate:all` links | **51** | **52** (`validate:deprecations`) | this task |
| `validate:all` links green | 50 of 51 | **51 of 52** | sole red still link 48 |
| Candidate resolution rule | date + sha (breaks at midnight) | **commit-based** in both new tools | §3a |
| Test files / tests | 556 / 10,637 | **558 / 10699** | +2 spec files, +62 tests, **0 failures** |
| Pending changesets | 40 | **41** | this task (contracts `patch`, VERSIONING.md) |
| `yarn build` exit code | 0 | **0** | unchanged — S2-O1's win held |
| AT cells executed | 0 of 534 | **0 of 534** | **not moved, deliberately** — human only |
| `maxProposedCitedFromCode` | 3 | 3 | S0-O3, owner |
| `validate:peers` (link 48) | red | **red** | **not moved** — D174/D175, owner |

**No ratchet was raised, no allowlist widened, no exception file touched, no
attestation signed, and no stop condition relabelled to make the gate pass.**

The one ceiling this task *could* have raised — the `unevaluable` count — went
**down** (4 → 1) by making the gate see more, not by accepting less.

---

## 8. Owner decisions raised

### D-S2O2-1 (amber) — `bundleId()` makes a candidate's identity depend on the date

**Fact.** §3a. `bundleId()` is `<YYYY-MM-DD>-<shortCommit>`. At midnight the same
unchanged tree acquires a second candidate name, and every tool that resolves a
candidate by that name stops finding the evidence. Measured live: four stop
conditions went `unevaluable` and the release report printed `ABSENT` three
times for evidence that was entirely present.

I fixed the two consumers this task owns (`validate:stop-conditions`,
`generate:release-report`) with `candidateForCommit()`. **The generators still
mint date-based directories**: `release:evidence` and `release:api-diff` both
call `bundleId()` directly.

| Option | Cost |
|---|---|
| **(a)** move `candidateForCommit()` into `release/binding.ts` and use it in `evidence.ts` and `api-diff.ts` too | ~5 lines each. One resolution rule everywhere |
| **(b)** drop the date from `bundleId()` — a candidate becomes `<shortCommit>` | cleanest conceptually (evidence is bound to a commit, which is this programme's own rule), but renames every existing candidate directory and breaks the two historical bundles' paths |
| **(c)** leave the generators as they are | the inconsistency survives and the next cross-midnight run re-learns it |

**Recommendation: (a) now, (b) at 1.0** when renaming the candidate directories
is cheap. Not done here because it touches the R1-O3 evidence generator, which
is outside this task's scope boundary.

### D-S2O2-2 (amber) — SC-7 cannot evaluate until candidates carry `ratchets.json`

**Fact.** SC-7 (threshold raised without justification) compares this candidate's
ceilings with the previous candidate's. The previous candidate
(`2026-09-21-527dbd1`) records no `ratchets.json`, so **no comparison is
possible** and SC-7 is `unevaluable` — a red, correctly.

The rehearsal now runs the gate with `--write-ratchets`, so the *next* candidate
will have a baseline. **Backfilling `527dbd1` is not possible** — that tree is
two commits gone and its ceilings cannot be re-measured honestly.

**Recommendation:** accept one `unevaluable` SC-7 on the next candidate as the
cost of starting the chain, and treat the one after that as the first real
comparison. Do **not** seed a synthetic baseline; a fabricated ceiling is worse
than a missing one.

### D-S2O2-3 (red) — five of six published packages have no API baseline, so SC-5 can never clear

**Fact.** SC-5 fired with 11 findings, of which **5 are `no baseline — every
symbol is unbaselined, so no change is explained`** (`contracts`, `mcp`, `nuxt`,
`testing`, `tokens`). Only `@dzup-ui/core` has one, and it is `manifest-only`
fidelity against an `admissible:false` snapshot.

Until a baseline is recorded on a **clean** tree, SC-5 is structurally red and
the stop-condition gate can never pass, no matter how good the release is.

| Option | Cost |
|---|---|
| **(a)** owner commits the worktree, then runs `yarn release:api-surface:record` on the clean tree | the only path that produces an *admissible* baseline. Requires the commit this programme has been deferring |
| **(b)** record a baseline now, on the dirty tree | it would be stamped `admissible:false` and SC-3 would keep firing on it — a baseline nobody may cite |
| **(c)** exempt unbaselined packages from SC-5 | **rejected** — that is widening an exception to make a gate pass |

**Recommendation: (a).** This is the single biggest blocker to a green
stop-condition run, and it is an owner act by construction.

### D-S2O2-4 (green) — the deprecation ledger lives in a published package but does not ship

**Fact.** `packages/contracts/deprecations.json` sits in a published package
whose `files` is `["LICENSE","VERSIONING.md","dist"]`, so it is **not shipped**
and no consumer can read it. It is a repo-internal ledger in a published
package's directory.

| Option | Cost |
|---|---|
| **(a)** leave it, and treat it as repo-internal | zero. `VERSIONING.md` already points at it by path for anyone reading the repo |
| **(b)** ship it — add to `files` and give it an `./deprecations` export | consumers and codemods could read the ledger programmatically; it becomes public surface subject to VERSIONING.md |
| **(c)** move it to `packages/tooling/` | consistent with "tooling is private", but puts the ledger further from the versioning policy that defines it |

**Recommendation: (a) now, (b) when a consumer asks.** Shipping it makes its
*shape* a public contract, which should be a deliberate act, not a side effect.

### D-S2O2-5 (red) — `generate:exports` would perform a breaking removal with no changeset

**Fact.** Surfaced unprompted by report section 8: running `generate:exports`
would **drop 5 composable exports** from `@dzup-ui/core`'s barrel
(`useAffix`, `useCalendar`, `useInfiniteScroll`, `useScrollSpy`,
`useScrollToTop`) and add 2 (`useCountdown`, `useIntersection`).

Dropping 5 public exports is breaking under VERSIONING.md §2.1 and would require
a `minor` — performed by a generator, with no decision behind it.

**Recommendation:** decide **which side is authoritative — the barrel or the
manifest — before anyone runs `generate:exports` again.** The report deliberately
does not resolve it; already routed to **TASK-R0-O1**, and re-raised here because
the release report now states it in section 8 of every candidate.

### D-S2O2-6 (amber) — condition 11 needs a signature before any real release

**Fact.** SC-11 is `unattested` and will stay red until a human signs
`docs/qa/release/<candidate>/attestations.json`. The template exists; **no
attestation was created**, deliberately.

**Recommendation:** the release owner signs it as the *last* step before
publishing, never earlier — a signature given before the other ten conditions
are clear attests to something that has not happened yet.

---

## 9. Ranked next packet

1. **D-S2O2-3(a) — commit the worktree, then record API baselines.** (red)
   Five published packages have no baseline; SC-5 is structurally red until they
   do. It also clears SC-1 and SC-3 in one move, because all three fire on the
   same fact: **the candidate is `4e4e46f+208`, which is not a commit anyone can
   check out.** One owner action turns three reds green.
2. **D-S2O1-1(a) — gate `packages/nuxt` and add `yarn build` to `validate:all`.** (red)
   Carried forward from TASK-S2-O1 and still the cheapest structural fix in the
   programme: a published package has no type gate, which is how a broken build
   reached the worktree unseen.
3. **D-S2O2-1(a) — one candidate-resolution rule everywhere.** (amber)
   ~10 lines. Until then `release:evidence` and `release:api-diff` still mint
   date-based directories that the two new tools have to work around.
4. **D-S2O2-5 — decide barrel vs manifest before `generate:exports` runs.** (red)
   A generator that performs an unreviewed breaking removal is a live hazard,
   and the release report now announces it on every candidate.
5. **TASK-S0-O2 — owner-decision register + publication decision.** (red)
   It now has the full input set: this task's six decisions, S2-O1's six, and a
   stop-condition gate that will refuse the release until they are taken.
6. **D174/D175 — the icon-library swap.** (red, unchanged)
   Still the only red link in `validate:all`.

---

## 10. `done_check` scored, and final state

### 10a. `done_check` — **0 of 4 at `4e4e46f`** on entry, **4 of 4 on exit**; clauses 2–4 defective

| # | Clause | On entry | On exit |
|---:|---|---|---|
| 1 | a script matching `release-report\|stop-conditions\|deprecations` exists | **FAIL** | **pass** — all three |
| 2 | `yarn generate:release-report` → 0 with exactly eight top-level sections | **FAIL** | **pass** — exit 0, `grep -c '^## '` = 8. **Clause defective:** it redirects to `/tmp/rr.log`, which is **not writable on this machine** |
| 3 | `npx tsx packages/tooling/src/validators/stop-conditions.ts` | **FAIL** | **pass** under the corrected invocation. **Clause defective:** `npx` is unsafe in this repository — it fetches dependency-confusion placeholders that exit **0 without running**, so this clause can report a *pass* for a validator that never executed |
| 4 | `npx tsx packages/tooling/src/validators/deprecations.ts` | **FAIL** | **pass** under the corrected invocation. Same `npx` defect |

**Clauses 3 and 4 are the more dangerous pair.** A `/tmp` redirect fails loudly
(`Permission denied`); an `npx` placeholder fails **silently and green**. Both
were run by module path through `yarn` instead, and every exit code was read
from a log file, never through a pipe.

This is the **11th and 12th** recurrence of a defective `<done_check>` clause in
this programme — all five tasks run so far have found at least one.

### 10b. The prompt file was not rewritten

`docs/program-2026-09-22-architecture/custody-and-release-tasks.md` shows as
modified in `git status`. **That modification is not this task's.** It is a
single `adr-example-ok` HTML comment appended to TASK-S0-O3's `<motivation>`
line, added by **TASK-S0-O1** and recorded in its handoff §3c
(`custody-and-release-tasks.md:205`). It is inherited dirty work, preserved.

Verified by `git diff` on the file: **one hunk, one line, an HTML comment**. No
prompt text was altered, and the TASK-S2-O2 status checkbox at line 339 is still
`[ ]` — this task did not edit it, on the principle that the ledger
(`EXECUTION-STATUS.md`) is where status lives.

### 10c. Final state

**Worktree:** `4e4e46f`, **209 dirty paths**, nothing committed, pushed,
published, dispatched, deployed, signed or baseline-replaced. The **197 paths
inherited** from S0-O1 / S1-O2 / S3-O1 / S2-O1 are all preserved — none
reverted, stashed, checked out or cleaned. `git worktree list` shows only the
main tree.

One directory was **removed**: `docs/qa/release/2026-09-23-4e4e46f/`, a duplicate
candidate for an unchanged tree created solely by the date rollover (§3a). No
other file was deleted.

**No ratchet was raised, no allowlist widened, no exception file touched, no
attestation signed, and no stop condition was relabelled to make the gate pass.**
