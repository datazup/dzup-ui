# Execution status — release-and-toolchain-tasks.md (N5)

> Live ledger for the **synchronous** run of
> [`release-and-toolchain-tasks.md`](./release-and-toolchain-tasks.md).
> Started **2026-09-03** against `ui/dzup-ui` `main` @ `6f1f653`.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked on owner decision
>
> Predecessor lanes: [`EXECUTION-STATUS.md`](./EXECUTION-STATUS.md) (N0-05 + N1-O1…O6,
> complete 2026-09-01) · [`EXECUTION-STATUS-N2.md`](./EXECUTION-STATUS-N2.md)
> (N2-T1/A1–A4/D1–D3/S1, complete 2026-09-02, nine `[x]`).
>
> **Nothing here is committed, pushed, dispatched to CI, or published** — every
> packet stops at "locally qualified" per README §3 `<authority>`.

## Custody at N5 run start (2026-09-03)

| Fact | State |
|---|---|
| `ui/dzup-ui` branch / HEAD | `main` @ `6f1f653 Merge remote-tracking branch 'origin/main'` (2026-09-02 20:23 +0200) |
| Tracking | `main...origin/main`, **0 ahead / 0 behind** |
| Worktree | **CLEAN — 0 entries.** This is the material change since the N2 lane: the standing N1 owner decision #1 ("commit the tree, then re-run") **has been taken**. `e0d1707 feat: land program-2026-09 N0-N2 — evidence execution, agent surfaces, docs site` carries the whole N1+N2 program. |
| Admissibility | Evidence produced in this lane is **locally qualified against a committed tree** — one level better than N1/N2's *worktree-dirty* standing, still **not** CI, release or production evidence. |
| Toolchain | Node `v24.14.1`, Yarn `4.16.0` (`packageManager` pin), engines floor `^20.19.0 \|\| >=22.13.0` |
| Packages | `codemods · compat · contracts · core · mcp · nuxt · testing · tokens · tooling` (9) |
| Pending changesets | **16**, not the 17 the task file and `02 §2` quote. Counted as `.changeset/*.md` minus `README.md`. First correction of this lane; every N5 packet that quotes the figure uses 16. |

## Execution order (and why)

The task file's own ordering note: *"N5-01 (0.x policy) unblocks N5-02 (the
ARIA-prop breaking fixes) — a breaking change without a stated breaking-change
convention is not reviewable. N5-03/04/05 are independent."* Within the
independent three, priority decides: N5-03 and N5-05 are 🟠, N5-04 is 🟢.

| Order | Task | Priority | Depends on | Rationale |
|---|---|---|---|---|
| 1 | TASK-N5-01 — 0.x semver statement, changelog system of record, changeset reconciliation | 🟠 | — | Hard blocker for N5-02; named by N2-A4 as the prerequisite for its Option A; the first packet in the 2026-09 program whose subject is *publication*. |
| 2 | TASK-N5-02 — close the six ARIA-prop gaps | 🟠 | N5-01 | Illegal to ship without N5-01's policy. Drives the FORM-OSS gate's 6 `gap` cells to 0. |
| 3 | TASK-N5-03 — toolchain currency (Vue 3.6-RC lane, Nuxt 4, Vapor, migration memo) | 🟠 | — | Independent; the 3.6-RC lane is the cheapest breakage insurance available and Nuxt 3 is already EOL. |
| 4 | TASK-N5-05 — ADR-19 / ADR-20 acceptance packets | 🟠 `[!]` | — (inputs from N2-S1 §11) | Read-mostly decision documents; ends in an owner decision by design. Runs after the code-touching 🟠 packets so its divergence tables describe the tree N5-02/03 leave behind. |
| 5 | TASK-N5-04 — peer & runtime hygiene | 🟢 `[!]` | — | Lowest priority; four owner decisions, evidence-first, nothing ships. |

## Inherited inputs carried into this lane

| From | Finding | Where it lands |
|---|---|---|
| N2-A4 (registry study) | **A4-D1** publish-or-freeze is the decision gating every consumer surface; **A4-D3** build `validate:registry` before anything is published from `/r/` | N5-01 system-of-record memo + 1.0 exit criteria |
| N2-D3 (playgrounds) | **D3-D3** the docs site is 29.82 MB under no size gate — the only static artifact in the repo with none | N5-01 (release hygiene) / N5-03 (toolchain memo) |
| N2-S1 (anatomy rollout) | §11 the `data-scope` evaluation; S1-F3 the contract does not compose; the DataState union widening `DzButton` violates | N5-05 ADR-19 acceptance packet |
| N2-S1 | **S1-F10** — the aggregate gate reported green over a stale artifact for three packets; `yarn validate:all` must be run **end-to-end, in full**, never sampled | Every N5 packet's validation ladder |
| N1 ledger | Owner decision #1 (commit the tree) — **taken**, 2026-09-02 | Closed; recorded above |

## Task status

| Task | Status | Started | Finished | Report |
|---|---|---|---|---|
| TASK-N5-01 | `[x]` done (7 `[!owner]`) | 2026-09-03 | 2026-09-03 | [`N5-01-release-policy-handoff.md`](./reports/N5-01-release-policy-handoff.md) · [`changelog-system-of-record-2026-09.md`](./reports/changelog-system-of-record-2026-09.md) · [`1-0-exit-criteria-2026-09.md`](./reports/1-0-exit-criteria-2026-09.md) |
| TASK-N5-02 | `[x]` done | 2026-09-03 | 2026-09-03 | [`N5-02-aria-prop-gaps-handoff.md`](./reports/N5-02-aria-prop-gaps-handoff.md) |
| TASK-N5-03 | `[x]` done | 2026-09-03 | 2026-09-03 | [`N5-03-toolchain-currency-handoff.md`](./reports/N5-03-toolchain-currency-handoff.md) + migration memo |
| TASK-N5-05 | `[x]` done `[!]` | 2026-09-03 | 2026-09-03 | [`N5-05-adr-acceptance-handoff.md`](./reports/N5-05-adr-acceptance-handoff.md) + 2 packets |
| TASK-N5-04 | `[x]` done `[!]` | 2026-09-03 | 2026-09-03 | [`N5-04-peer-hygiene-handoff.md`](./reports/N5-04-peer-hygiene-handoff.md) + [`peer-hygiene-2026-09.md`](./reports/peer-hygiene-2026-09.md) |

## Run log

- **2026-09-03** — Lane opened. Custody verified: `main` @ `6f1f653`, clean worktree,
  0 ahead / 0 behind `origin/main`. Changeset count re-measured at **16** (task file
  says 17). Execution order fixed as 01 → 02 → 03 → 05 → 04.
- **2026-09-03** — TASK-N5-01 `[x]`. 7 `[!owner]`. `validate:all` 36 → 37 links, exit 1
  at link 15 on two inherited failures. TASK-N5-02 started.
- **2026-09-03** — TASK-N5-02 `[x]`. FORM-OSS gate 6 gap → 0 (12 props: 3 implemented,
  9 removed). 6 `[!owner]`. TASK-N5-03 started, carrying N5-01 D6 as its first item.
- **2026-09-03** — TASK-N5-03 terminated mid-run by a server-side **HTTP 529**, at the
  Vapor-README step. Work intact on disk (Item 0 validators, `vue-next.yml`, Nuxt 4
  retarget, 4 changesets, both reports). **Resumed the same agent** rather than
  launching a fresh one — the N2-D3 precedent, where four agents each re-paid the
  assessment cost. Handoff headings jumped §5.1 → §9; §6–§8 outstanding.
- **2026-09-03** — TASK-N5-05 started **concurrently** with N5-03's tail. Justified:
  N5-05 is read-mostly over ADR files and committed code, and N5-03's remaining
  footprint (README generated facts, its own report, the validation ladder) does not
  intersect it. N5-05 carries an explicit no-touch list.
- **2026-09-03** — TASK-N5-05 `[x]`. 15 `[!owner]`, 0 files modified, both ADRs still
  `Proposed`. Brief figures re-measured: `ui` pilots **5 → 27**, anatomy files **9 → 32**.
  The 14-ADR ceiling is **not** a lever — the validator is status-blind and neither ADR
  is in the registry.
- **2026-09-03** — **TASK-N5-01 `[x]`.** `changeset status` was **already green** at
  run start (SK-1 fixed the changeset in August); the durable defect was that **no
  gate ran it**. `yarn validate:release-policy` now does, plus nine invariants
  `changeset status` cannot see — proven against six negative probes including the
  exact SK-1 shape. Policy authored at `packages/contracts/VERSIONING.md` (ships in
  the contracts tarball), README mention generated through `generate:readme-facts`.
  Audit: 16 changesets — 5 correct, 10 over-declared (safe direction), 1
  correct-where-it-matters, **0 under-declared**; **zero changeset files edited**,
  because re-levelling changes the next release's version numbers. Seven `[!owner]`
  decisions (D1–D7).
- **2026-09-03 — LANE-WIDE FINDING, carry into every N5 packet.** `yarn validate:all`
  **exits 1 on `main` @ `6f1f653`**, at link **15 of 37**: `validate:at-matrix` and
  `validate:capability-matrix` both fail on generated-evidence staleness inherited
  from `e0d1707`. Link 15's cause is isolated to the byte — `componentCommit` is
  git-derived provenance inside a byte comparison, so the artifact **cannot be green
  in a committed state**; this is the same defect the repo already recorded in
  2026-08 (`EXECUTION-STATUS-REC.md` defect #2) and that `validate:component-meta`
  already avoids by excluding `sourceCommit`. **The custody table's "locally
  qualified against a committed tree" standing is therefore weaker than assumed: the
  committed tree is not green.** No N5 packet may claim a green `validate:all` until
  owner decision **D6** is taken; report 35/37 with the two inherited failures named.
  Corollary, and a near-repeat of S1-F10: the first `validate:all` run here was read
  through `; echo "…$?"`, which reported the *wrapper's* exit 0 over the command's
  exit 1. **Read gate output directly.**

### TASK-N5-01 — closed 2026-09-03 (`[x]`, 7 `[!owner]`)

**The failure the brief sent it to fix was already fixed.** `changeset status`
exited **0** on `main` at run start — TASK-SK-1 repaired the offending changeset in
August. The durable defect, named in SK-1's own write-up and never closed, is that
**no gate ran the command**. So the packet's deliverable changed shape: not a fix,
a guard. `yarn validate:release-policy` spawns the real `changeset status` plus
nine invariants it cannot see, proven against **six negative probes** (the exact
SK-1 mixed changeset, a private-app changeset, an unknown package, `major` on 0.x —
which `changeset status` happily exits 0 on and would ship `1.0.0` — a removed
`privatePackages`, a planted `pre.json`). Two live defects found on the way:
`@dzup-ui/landing` (private) was standing in the release plan, and `apps/docs`
(added by N2-D1) was never registered in the changesets config and reproduces
SK-1's failure exactly.

**Changeset audit — 16, not 17, confirmed by measurement.** 5 correctly leveled ·
10 over-declared · 1 correct-where-it-matters · **0 under-declared** · **0 files
edited**. Zero edits is the deliberate call: every error runs in the safe
direction, and re-levelling would take `@dzup-ui/core` from `0.3.0` to `0.2.1` —
release behaviour, not a content edit. Filed as **D3** for the owner.

**Validation, read honestly.** `validate:all` **exit 1**, failing at **link 15 of
37**: `validate:at-matrix` and `validate:capability-matrix`. Both are **inherited
generated-evidence staleness from `e0d1707`**; **0 component failures, 0 caused by
this packet**; links 17–37 re-run individually and pass. Link 15 was root-caused to
the byte — the only differing lines are `componentCommit`, i.e. `lastCommitFor(source)`,
**git provenance inside a byte comparison**, so that artifact can never be green in
a committed state. Filed as **D6**.

**S1-F10 nearly recurred, and the agent said so.** Its first `validate:all` ended
`; echo "…$?"`, and the runner reported the wrapper's **0** over the command's
**1**. The lane rule stands: read gate output directly, never through a pipe.

**Ratchets:** `validate:all` links **36 → 37** · `generate:readme-facts` documents
**4 → 5**, regions **3 → 5** · packages with a recorded release classification
**5 (no reasons) → 13/13** · new `changelogFormatCollisionCeiling` = **1**. No
existing ratchet moved.

**Owner decisions opened: 7.** The two sharpest: **D1 🔴** — `validate:changelog`
(requires an ISO date) and `validate:mcp` (anchored, forbids one) are **mutually
exclusive**, and `changeset version` writes the shape that fails, so **the first
release turns `validate:all` red**. **D2 🟠** — `@dzup-ui/compat` and
`@dzup-ui/codemods` are public, publishable, in CI's pack smoke test, and
permanently unreleasable.

**Handed to N5-02:** removal of an un-honoured prop is **`minor`, never `patch`**
(it type-checked in consumer source; deleting it stops that source compiling);
implementing one honestly is `patch` — so the implement-vs-remove evidence table
*is* the level table. And one blocker the brief got wrong: **codemods has no
deprecation utilities**. `warnDeprecated` lives in `packages/compat/src/utils/deprecation.ts`,
and **Core may not import compat**.

### TASK-N5-02 — closed 2026-09-03 (`[x]`, 6 `[!owner]`)

**The six gap cells were twelve props.** The gate counts cells, not declarations;
`⛔ gap` on six controls resolved to **12 un-honoured ARIA props**. Decisions were
made per prop from evidence, and **two of the six recorded owner decisions were
partly wrong**: `DzStepper` and `DzInplace` were parked as "remove all", but
`aria-labelledby`/`aria-describedby` are honourable on the exact elements those
components already put `aria-label` on. Final split: **3 implemented / 9 removed**.
Reka turned out to be irrelevant to five of the six controls — only `DzTabs` is
Reka-backed, and the deciding fact throughout was **the element's role under ARIA
1.2**, not the primitive.

| Control | Props | Decision |
|---|---|---|
| `DzFloatLabel` | `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`, `ariaInvalid` | remove ×4 (`minor`) |
| `DzInplace` | `ariaLabelledby` / `ariaInvalid` | implement (`patch`) / remove (`minor`) |
| `DzGrid`, `DzStack` | `ariaInvalid` | remove ×2 (`minor`) |
| `DzStepper` | `ariaLabelledby`, `ariaDescribedby` / `ariaInvalid` | implement ×2 (`patch`) / remove (`minor`) |
| `DzTabs` | `ariaInvalid` | remove (`minor`) |
| `DzOrderList` | `dragHandleLabel` | implement as `title` (`patch`) |

**Gate: `44 controls, 245 pass, 6 gap` → `44 controls, 251 pass, 0 gap`.** C2 identity
`38 pass / 6 gap → 44 pass / 0 gap`. **No cell became `n-a`** — all six are honest
passes, and no other clause row moved.

**One gate edit, declared as one.** `probe.ts` resolved inherited bases *by name*,
so `extends Omit<BaseAccessibilityProps, 'ariaInvalid'>` still matched
`/BaseAccessibilityProps/` and reported a **removed** prop as declared-and-unread —
which would have made the only available removal mechanism unusable and held six
*fixed* cells red. `omittedKeys()` reads string literals from the second type
argument and nothing else; anything unparseable degrades to the old behaviour.
Pinned in both directions.

**The root cause is one line in contracts (D1).** `ariaInvalid` sits in
`BaseAccessibilityProps` (labelling) rather than `BaseValidationProps` — that single
misplacement is why six unrelated layout/label components declared a validation prop
they could never honour. Fixing it is a contracts-wide `minor`; not taken.

**D3 🔴 — `0 gap` overstates.** `DzInplace` carries a *reviewed* C2 gap ("does not
consume the field context") that **can never reach the matrix**: C2 is source-decided
and a `wrapper` owes nothing. The packet says so rather than letting the zero stand
unqualified.

**Validation.** `validate:form-readiness` 0 · `vue-tsc` 0 · `eslint --max-warnings 0`
0 · five focused vitest suites 0. **`validate:all` 37 links, exit 1 at link 15** —
links 15/16 (`at-matrix`, `capability-matrix`) are the **inherited `e0d1707`
staleness**, untouched; 17–37 re-run individually, all exit 0. Three artifacts went
stale *because* nine props left the surface (`component-meta`, `docs-pages`, `llms`)
and each was regenerated with its own generator — the packet's stated line:
*regenerating your own artifact is the fix; regenerating another lane's is
concealment*. `yarn test` 2 failed / 499 passed, **both inherited and proven so** —
those specs and every input they read are byte-identical to HEAD.

**Ratchets:** gap cells **6 → 0** · pass **245 → 251** · component-meta props
**1734 → 1725** (−9 exactly) · `hardcoded-string-ok` exemptions **1 → 0** ·
propsWithoutDescription **63 → 63 (held)** · pending changesets **16 → 18**.
No ratchet loosened, no ceiling raised.

**Handed to N5-03:** 🔴 take **N5-01 D6** first — links 15/16 have now stood red
across two consecutive packets and each has spent a handoff section proving the red
is not its own, a cost that recurs per packet against a one-line fix. Secondary:
`vue-component-meta@3.3.7` is the sensitive pin — component-meta, llms-full, 144
docs pages, playground seeds and nav are all projections of its output and each is
byte-compared by a gate, so a bump rewrites five artifacts at once.

### TASK-N5-05 — closed 2026-09-03 (`[x]`, 15 `[!owner]`, 0 files modified)

**Three documents, nothing else touched.** Worktree 85 → 88 entries, exactly its three
new reports. Both ADRs verified still `Proposed`; no status flipped, no ADR file edited,
no source changed.

**The measured-vs-claimed table is the lane's sharpest evidence finding yet.** The task
file's own figures for what shipped against ADR-19/20:

| Claimed | Measured | Verdict |
|---|---|---|
| 5 `ui`-prop pilots | **27** (26 public + `DzDialogContentProps`) | stale by **22** |
| 9 anatomy files | **32** `.anatomy.ts` (31 public + `DzDialogContent`) | stale by **23** |
| ten context composables | **10** | **correct** — the only brief figure to survive |

This is the fourth consecutive packet in the 2026-09 program to find its own brief's
counts wrong, and the pattern is now one-directional: the briefs **understate** what
shipped. "5 pilots" described a pilot; the tree has a rollout.

**The 14-ADR ceiling moves by zero, and the reason matters.**
`validate-adr-references` (exit 0) prints `17 cited · 3 documented · 14 registry-only
(ceiling 14)` — the 3 documented **are** ADR-18/19/20, and both subjects have been out
of `adr-registry.json` since their files were written. So accepting either ADR lowers
nothing. Worse, **the validator is status-blind**: it never reads Proposed/Accepted/
Rejected, and **nothing in the repository gates ADR status at all**. The ceiling was
cited as the ratchet acceptance would move; it is not a lever on this decision.

**Divergences: ADR-19 has 13 (8 amend-ADR / 4 fix-code / 1 open), ADR-20 has 9
(8 / 1).** ADR-20 has **no clause the code contradicts** — every divergence there is
*under-claiming what shipped* or *over-claiming adoption*.

- **ADR-19, most consequential:** §4's `DataState` widening **was never performed**.
  `data-attributes.types.ts:17-25` is still the closed 8-value union and
  `DzButton.vue:176` still emits `loading|disabled|idle` — so §4's own argument, *"a
  union a shipped component already violates is not a contract"*, remains literally
  true of the code it was written to fix.
- **ADR-20, most consequential:** §7's motion policy has **zero consumers across 144
  components**. Accepting it unamended would record an accessibility capability —
  honouring reduced-motion through the provider — **that the library does not have**.
- Also: only **3 of 6 cascade layers ship** (`dz-reset`, `dz-utilities`, `dz-overrides`
  exist nowhere), which makes one ADR-19 Consequences bullet false; `dz-overrides`
  works today **only by CSS append-order accident**.

**Custody under concurrency held.** It ran alongside N5-03's tail, touched none of
N5-03's files (verified file-by-file), and **declined to run the aggregate ladder** —
so it makes no aggregate-qualified claim. It also skipped `validate:hardcoded-strings`
*despite* it being read-only, because that validator's source is modified by another
packet in this worktree and any number would measure N5-03's in-flight edit rather than
`main`. It disclosed that its first vitest run was piped through `tail`, swallowing the
exit code, and cites only the re-run unpiped result.

**It wrote no consequence text into either ADR** — post-acceptance text under a
`Proposed` status line is self-contradictory. Paste-ready text sits in each packet.

**Handed to N5-04:** the **Node 20 floor is a decision input, not a dependency
setting**. ADR-20 §4 rejects `Intl.Locale.prototype.getTextInfo()` *solely* because it
sits above the ADR-18 floor, and carries a **hand-maintained checked-in RTL subtag
list** in its place — so raising the floor **deletes a hand-maintained i18n data
table**, the same hand-typed-facts class N2-S1 logged five prior sightings of. Two
riders: ADR-18 is one of only three documented ADRs, so there is a real document to
amend; and direction has **zero component consumers** today, making now the cheap
moment, before P4-05 builds the RTL matrices on it.

### TASK-N5-03 — closed 2026-09-03 (`[x]`, 6 `[!owner]`, survived an HTTP 529)

**Item 0 closed the gate that could never be green.** `componentCommit` =
`lastCommitFor(source)` is git provenance recorded *inside* an artifact that is then
byte-compared against a fresh build — **stale at birth**: the commit touching
`DzButton.vue` becomes the answer to `lastCommitFor()` the instant it lands, but the
artifact regenerated before that commit recorded the previous hash. `stripComponentCommits()`
in `quality/git.ts` applies the exclusion `validate:component-meta` already made for
`sourceCommit`. **No content clause weakened**, proven by four probes, all restored:

| Probe | Expected | Observed |
|---|---|---|
| mutate one `componentCommit` | exit 0 | **0** |
| mutate one content field | exit 1 | **1** |
| fresh content + **144** wrong provenance stamps | exit 0 | **0** |
| from green, flip one cell `stale`→`pass` | exit 1 | **1** |

**Link 15 is green. Link 16 is still red, and honestly so.** N5-01 had not separated
its two causes: 66 lines of provenance (fixed) **plus 34 lines of genuine content
staleness** — the committed matrix calls 7 button-family `visual` cells `covered` and
`DzOrderList`'s perf cell `pass` where a fresh build calls all 8 `stale`. Forbidden to
regenerate, the packet left it red and filed **D1**: *the committed artifact currently
overstates its evidence.* That is the correct outcome — the red link is now a true
statement about the repository rather than an artifact of the gate.

**The finding nobody tasked: `@dzup-ui/contracts` could not be `import()`ed by Node at
all.** Five extensionless re-exports in the published `dist/index.js`. **37 validate
links, 9,187 tests and `typecheck:all` all passed over it**, because every one of them
resolves like a bundler. The Nuxt fixture lane was red on *both* Nuxt majors for this
single pre-existing reason. Fixed across 27 specifiers and verified by actually
importing the built entry under Node. This is the same defect class the whole program
keeps meeting — **a claim nothing could falsify** — and it sat under the repo's
zero-runtime-deps foundation package.

**Vue 3.6-RC lane: exists, and actually ran here.** `vue-next.yml` applies
`resolutions` → installs → runs → restores `package.json` + `yarn.lock` and
**verifies the restore** (exit 3 if not); exit 2 ≠ exit 1, so *"never ran"* and
*"broken"* are distinguishable. **9,181 pass / 2 fail (505 files).** Triage: **library
defects 0 · RC behaviour changes 0 · test-env 1 · inherited 2.**

**Nuxt 4: `@nuxt/kit` 3.14.0 → 4.5.2, `module.ts` needed no change.** All 6 fixtures
pass on `nuxt@4.4.5` **and** on `nuxt@3.19.0` — so **the Nuxt 3 floor does not have to
drop**, and `peerDependencies.nuxt` was deliberately left at `>=3.0.0` (**D2**).
Fixtures pin `4.4.5` because **4.4.6+ drops Node 20** (**D4**, an ADR-18 amendment).

**The Vapor statement cannot be quoted from a run that never happened.** Backed by
`yarn test:vue-next:vapor`, exit 0: `createVaporApp` + `vaporInteropPlugin` renders
`DzButton` with `data-tone="primary"` under `vue@3.6.0-rc.6`. The README paragraph is
**generated** from the peer range, the lane's pinned version, and *whether the spec
exists* — **delete the spec and the README says UNBACKED**.

**Ladder:** `validate:all` 37 links, exit 1 at link 16; links 1–15 pass; because the
chain is `&&`-joined, 17–37 did not execute, so all 21 were run individually — **every
one exit 0**. `typecheck` 0 · `lint` 0 · `test` 1 (2 failed / 503 passed, both
inherited) · nuxt fixtures both majors 0 · vapor 0. **Failures caused: none** — the one
it introduced was found by its own first RC run and fixed before the ladder was recorded.

**Ratchets:** first failing link **15 → 16** · changesets **18 → 20** · spec files
**501 → 505** · README fact regions **5 → 6**. No ceiling raised, lowered or rewritten.

**Custody note.** The packet was terminated mid-run by a server-side **HTTP 529** and
**resumed rather than restarted**, per the N2-D3 precedent. It also reports that **the
background-task wrapper announced "exited with code 0" three times for commands that
exited 1** — `validate:all`, the RC lane and `yarn test`. The lane's standing
read-the-gate-directly rule is what caught all three.

**Sequencing artifact, recorded honestly:** N5-03's ranked note asked that its **D3(2)**
— a gate that `import()`s each published entry under Node — land *before* the ADR
acceptance packets, since ADR-19's `ANATOMY_PART_VOCABULARY` and ADR-20's injection keys
both live in the package Node could not load. That note arrived **after** TASK-N5-05 had
already completed, so it was not honoured. It stands as an owner item, and it
strengthens rather than invalidates N5-05's packets.

### TASK-N5-04 — closed 2026-09-03 (`[x]`, 4 `[!owner]`, 0 dependency changes)

**Both headline claims were measured, and both were wrong in the detail.**

- **`reka-ui` — "Button-only apps must install it."** *Install: true. Ship: false, and
  the named mechanism is wrong.* 67/209 core `.vue` files import it, but a Button-only
  bundle contains **zero** `reka` occurrences. The `./buttons` barrel reaches it through
  **exactly one edge — `DzSpeedDial → DzTooltip`**. Measured on real tarballs: barrel
  without reka **exit 1**; `./cards` without reka **exit 0**; deep per-component import
  without reka **exit 0**.
- **`lucide-vue-next` — "hard dependency, icon lock-in."** True, but mis-argued: the
  whole surface is **22 modules / 18 glyphs / 8,769 B**, and all 433 exports cost
  **+1,206 B gzip**. `DzIcon` already accepts any `Component`. Two facts absent from the
  brief: **`lucide-vue-next@0.477.0` is deprecated upstream** (→ `@lucide/vue`, now
  1.0.0), and **two versions are installed simultaneously** — core `^0.477.0` nested,
  apps `^0.475.0` hoisted — **with no gate able to see it**.

**The premise this lane handed it about Node 20 was false, and it checked.** N5-05's
ranked note (relayed by the orchestrator) held that raising the floor would delete
ADR-20 §4's hand-maintained RTL subtag list, because the list exists only while
`Intl.Locale.prototype.getTextInfo()` sits above the floor. **Probed across Node
20.19.0, 22.13.0, 22.23.2, 23.0.0, 24.0.0 and 24.20.0: `getTextInfo()` first exists in
Node 24.0.0** — well above any floor under discussion. So **D3 (`>=22.13.0`) is
decoupled from the RTL list entirely.** ADR-20's conclusion survives for a *better*
reason: the predecessor `textInfo` is available at the floor but **answers differently
on 20.19.0 vs 22.13.0 at the same ICU 76.1**. Two errors also found in the list itself:
`'uz-AF'` is dead code (lower-cased lookup) and `'ha'` contradicts ICU.

**D4 — the i18n catalog is unreachable from the published package by every path.**
`enMessages`, `pseudoMessages` and the `DzMessageCatalog` augmentation: three
`ERR_PACKAGE_PATH_NOT_EXPORTED` probes, absent from all 433 barrel exports, and the
`declare module` d.ts is unreferenced from `index.d.ts` — **so consumers see an empty
catalog type**. Recommendation: export → gate → *then* a first locale, never the
reverse.

**D1 — recommend leaving `reka-ui` alone.** `peerDependenciesMeta.optional` on its own
was measured and is **worse**: the build still exits 1, the diagnostic degrades to a
Vite pseudo-module, and `validate:peers` passes it. The working variant (optional peer
+ `./components/*`) produces byte-identical output but **freezes 637 dist paths as
public API in a 0.2.0 package**.

**Implemented: one additive report-only tool** (`report:peer-surface` + spec, 10 cases)
— deliberately **not** a gate: exit 0 always, no baseline, outside `validate:all`.
Everything else is prepared, unapplied text, because both suggested implementations
touch public API, which is the packet's own stop condition. `packages/core/package.json`
is **byte-identical to HEAD**.

**Ladder:** `lint` 0 · `typecheck` 0 · `typecheck:all` 0 · `validate:peers` 0 ·
`validate:externals` 0 · `vitest peer-surface` 0 · `validate:all` **1 at link 16** ·
`test` **1** (2 failed / 504 passed; 9,191 passed of 9,197). **Inherited unchanged;
caused: none.** One correction to this ledger: **link 16 reports 12 stale cells (11
Tier C + 1 Tier D), not 8** — "8" was the button-family delta, and 12 reconciles exactly
with N5-03's own §10 table. **Ratchets: none moved**, `validate:all` 37 → 37.

---

## Lane closed — all five N5 packets complete

**Five packets, `[x]` each: N5-01, N5-02, N5-03, N5-05, N5-04.** Executed synchronously
except N5-05, which ran alongside N5-03's tail under an explicit no-touch list and
touched none of its files. **HEAD never moved: `6f1f653` at open and at close.** Nothing
committed, pushed, dispatched, published or version-bumped. Worktree 85 → 92 entries.

**Owner decisions opened by this lane: 38** (N5-01 7 · N5-02 6 · N5-03 6 · N5-05 15 ·
N5-04 4), on top of the 62 standing from N2.

**What the lane actually found.** It was scheduled as the *publication* lane, and the
recurring discovery was not about release mechanics at all — it is that **the gates and
the consumer disagree**, and only the gates were ever consulted:

| Packet | Expected | Found |
|---|---|---|
| N5-01 | a broken `changeset status` | already fixed in August — **no gate ever ran the command** |
| N5-02 | 6 un-honoured ARIA props | **12**, root-caused to one misplaced field in `BaseAccessibilityProps` |
| N5-03 | a Vue 3.6 lane | **`@dzup-ui/contracts` cannot be `import()`ed by Node** — under 37 green links and 9,187 tests |
| N5-05 | 5 `ui` pilots, 9 anatomy files | **27 and 32**; and the ADR-debt ratchet is **status-blind**, so acceptance moves it by zero |
| N5-04 | reka-ui forced on every consumer | a **single edge**, `DzSpeedDial → DzTooltip`; and the i18n catalog is **unreachable from the published package** |

**The single highest-value next packet** (N5-04's closing read, and it matches the
lane's evidence): dispatch `validate-min-runtime` and `nuxt-majors`, and land
**N5-03-D3(2)** — the gate that `import()`s every published `exports` target under Node.
The lane's two worst findings are **one defect**: *a configuration every gate calls green
that no consumer can use.* 37 links and 9,197 tests passed over a package Node could not
load, because every one of them resolves like a bundler.

**The greatest threat to this lane's own credibility, stated plainly — N5-04-F10.**
`test:nuxt-fixtures:pack` runs `yarn pack` with **no build and no freshness check**. In
this very tree it staged tarballs from a `dist` written **2026-08-25 — nine days older
than the source beside it** (557,112 B stale vs 583,429 B fresh). The Nuxt fixture lane
is the repository's **only runtime observation post**, and N5-03's green result on both
Nuxt majors **may have been obtained against a stale artifact**. Nobody can currently
tell. That is a one-line fix and it is nobody's assigned task — and *"nobody can tell"*
is precisely the property this program exists to eliminate. **It is filed here rather
than resolved, because resolving it silently is the failure mode it describes.**
