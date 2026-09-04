# `[!owner]` 1.0 exit criteria — refined against measured repository state

> Memo for [`release-and-toolchain-tasks.md` → TASK-N5-01](../release-and-toolchain-tasks.md) step 4.
> Starting proposal: roadmap **N5-R2** in
> `workspace-docs/repos/ui/docs/architecture/dzup-ui-program-reassessment-2026-08-28/06-roadmap-2026-09.md:107`.
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-03 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `6f1f6539…` · **Worktree at run start:** clean — 0 entries.
> **Evidence class: `locally qualified, against a committed tree`.** Not CI, not
> release, not production.
>
> **This refines N5-R2; it does not replace it.** Every one of the roadmap's
> seven criteria is kept. Four are made measurable against an artifact that
> already exists, two are split because one sentence was hiding two decisions,
> and four are **added** — three from sibling packets (A4-D1, A4-D3, D3-D3) and
> one from this packet's own measurement.
>
> **Declaring 1.0 is an owner act.** Mechanically it is one edit — `allowMajor`
> in `packages/tooling/scripts/release-policy.json` — and `yarn
> validate:release-policy` R5 refuses a `major` changeset until it is made. This
> list is what should be true before that edit.

---

## 1. The roadmap's seven, measured

N5-R2 verbatim:

> 1.0 exit criteria `[!owner]`: proposed — ADRs accepted, anatomy/`ui` adoption ≥
> Tier B components, matrix failures 0, AT Tier C/D executed, DTCG shipped, docs
> site live, Pro ownership manifest feeding the resolver.

| # | Roadmap criterion | Measured today | Distance |
|---|---|---|---|
| 1 | ADRs accepted | **0 of 3 accepted.** ADR-18, ADR-19, ADR-20 all carry `**Status:** Proposed`. A further **14** ADRs are cited in code with no document at all (`adr-registry.json`, `maxUndocumented: 14`). | Owner signature × 3; the 14 are a separate ledger |
| 2 | anatomy/`ui` adoption ≥ Tier B | **20 of 89** Tier B+ components declare an anatomy (B 18/67, C 1/21, D 1/1). Across all tiers, 31 of 144; the ownership ratchet `maxWithoutAnatomy` reads **113**. The typed `ui` prop is declared on **27** components. | 69 Tier B+ components |
| 3 | matrix failures 0 | **Two gates are RED on `main` right now** — see §2. Beyond that: form-readiness carries **6 `gap`** cells (TASK-N5-02's target) and **47 `unrun`**; the capability matrix reports **12 stale cells**. | 2 red gates + 6 gaps |
| 4 | AT Tier C/D executed | **0 of 132.** 22 Tier C/D components × 6 AT pairs. Across all tiers: **0 of 534** cells executed; every one reads `unrun`. | 132 manual test sessions |
| 5 | DTCG shipped | **Done** (TASK-N2-T1). `dist/tokens.dtcg.json`, `@dzup-ui/tokens/dtcg`, round-trip gate `validate:tokens:dtcg` green. | — |
| 6 | docs site live | **Built, not live.** The VitePress site exists and `validate:docs-pages` is green; it is **29.82 MB under no size gate** (D3-D3, the only static artifact in the repo with none), and the domain does not resolve (A4-D1). | a size gate + a deployment |
| 7 | Pro ownership manifest feeding the resolver | **Core half done.** `DzResolver` resolves by exact name from generated ownership and no longer guesses by `Dz` prefix (`.changeset/resolver-resolves-by-exact-name.md`). The **Pro** ownership manifest is owned by the Pro repository. | Pro-side, out of this repo |

Two of the seven are done. One is Pro-owned. Four are open, and criterion 4 is
open by 132 sessions of human work that no amount of engineering shortens.

---

## 2. The finding that changes the shape of criterion 3

`yarn validate:all` on `main` @ `6f1f653`, run end-to-end, **exits 1**. It fails
at link **15 of 37**, and a second link fails when the chain is continued
manually:

| Link | Gate | Result |
|---|---|---|
| 15 | `validate:at-matrix` | **FAIL** — `e2e/at-matrix/index.json disagrees with the markdown files` |
| 16 | `validate:capability-matrix` | **FAIL** — `packages/core/docs/capability-matrix.json is stale` |
| 1–14, 17–37 | the other 35 | pass |

**Neither failure was caused by TASK-N5-01** — `e2e/at-matrix/` and
`packages/core/docs/capability-matrix.json` are untouched by this packet
(`git status` confirms).

**Root cause of link 15, isolated to the byte:** the *only* differing lines
between the committed index and a fresh build are `componentCommit` values.
Committed entries carry `80ce3012…`, `e986952e…`, `4c9fb7a1…`; a fresh build
returns `e0d17078…` for all of them — because `e0d1707` is the commit that
landed the N1+N2 program and touched those component sources, while the index
inside that same commit had been generated before it.

**`componentCommit` is git-derived provenance inside a byte comparison.** The
index therefore cannot be green in a committed state: regenerating and
committing it produces a new commit, and if that commit touches any Tier B+
component source the index is stale again on arrival.

**This exact defect is already on the repository's record.**
`docs/program-2026-08/EXECUTION-STATUS-REC.md` lists as defect #2: *"A test that
could never be green in a committed state — byte-comparing a manifest whose
`sourceCommit` is stamped from `HEAD`."* `validate:component-meta` learned the
lesson and says so in its own script comment — *"`sourceCommit` excluded — it is
provenance, and gating on it would fail on every unrelated commit."*
`validate:at-matrix` did not, and byte-compares the whole file.

`capability-matrix.json` carries `sourceCommit: 51dec93c…`, a commit from before
`e0d1707`, so it is the same *class* of staleness — but **I did not isolate its
cause to that field** and do not claim it is identical.

### What this means for criterion 3

"Matrix failures 0" as written is ambiguous between two very different things:

- **3a — the matrix *gates* are green.** Blocked today by two provenance-shaped
  freshness failures that a regeneration fixes for exactly as long as nobody
  commits. This needs a **fix to `validate:at-matrix`** (exclude
  `componentCommit` from the comparison, the way `validate:component-meta`
  excludes `sourceCommit`), not a regeneration.
- **3b — the matrix *cells* carry no failures.** A different and much larger
  claim: 6 form-readiness gaps, 12 stale capability cells, 534 unrun AT cells.

**They are split below.** Collapsing them is exactly the "never collapse
evidence into aggregate test counts" failure the conventions forbid.

---

## 3. The refined list

Grouped by what kind of thing has to happen. **`[!owner]` on the list as a
whole**; the owner's decision is which of C1–C15 are exit criteria and which are
post-1.0.

### Contract — the promises 1.0 makes

| # | Criterion | Today | Source |
|---|---|---|---|
| **C1** | ADR-18, ADR-19, ADR-20 carry `Accepted` **in the ADR file itself** | 0/3 | N5-R2 #1; TASK-N5-05 produces the packets |
| **C2** | The three §7 reconciliations in `packages/contracts/VERSIONING.md` are resolved in the source documents (ADR-19 §6, TOKENS.md, `Versioning.mdx`) | open | **new** — this packet |
| **C3** | Every Tier B+ component declares an anatomy (`maxWithoutAnatomy` reaches 55, i.e. Tier A only) | 20/89 | N5-R2 #2, made measurable against the existing ratchet |
| **C4** | The typed `ui` prop is on every component that declares more than `root` | 27 declared | N5-R2 #2, split from C3 — they are two rollouts, not one |
| **C5** | Zero un-honoured declared ARIA props | 6 open | TASK-N5-02 |

### Evidence — the gates and the cells

| # | Criterion | Today | Source |
|---|---|---|---|
| **C6** | `yarn validate:all` exits 0 **end-to-end**, on a committed tree, in CI | **exit 1 at link 15/37** | N5-R2 #3, split (3a) |
| **C7** | `validate:at-matrix` stops byte-comparing `componentCommit` — a gate that cannot be green in a committed state is not a gate | open | **new** — §2 |
| **C8** | Zero `gap` cells in the form-readiness matrix; zero `stale` cells in the capability matrix | 6 gaps, 12 stale | N5-R2 #3, split (3b) |
| **C9** | Every Tier C/D AT cell executed with recorded versions/tester/date/commit | **0 of 132** | N5-R2 #4 |
| **C10** | The CI job `validate-min-runtime` has actually been dispatched at least once and passed | **never dispatched** (the repo's own `EXECUTION-STATUS.md:710`) | **new** — a floor nothing has run on is a claim, not a floor (ADR-18) |

### Distribution — the part that makes it a release

| # | Criterion | Today | Source |
|---|---|---|---|
| **C11** | The 16 pending changesets are released, or withdrawn with a recorded reason | 16 pending, `changeset publish` never run | **new** — this packet |
| **C12** | Decision **A4-D1** (publish-or-freeze) is taken and executed: the packages resolve on npm, or the repository stops advertising install commands for packages that 404 | packages 404; domain does not resolve | N2-A4 |
| **C13** | `validate:registry` exists and gates `/r/` before anything is published from it | not built | N2-A4 (**A4-D3**) |
| **C14** | The docs site is under a size gate and deployed | 29.82 MB, no gate, not deployed | N2-D3 (**D3-D3**), N5-R2 #6 |
| **C15** | Decision **N5-01-D1** (changelog heading grammar) is taken, so the first `changeset version` does not turn `validate:all` red | open | this packet's system-of-record memo §6 |

**Done and stated as done:** DTCG export shipped (N5-R2 #5). **Pro-owned:** the
Pro ownership manifest feeding the resolver (N5-R2 #7) — the Core half landed;
the Pro half is a Pro-repository exit criterion and should be tracked there, not
here.

---

## 4. Ordering, and the one criterion that is not engineering

Most of C1–C15 are days of work. **C9 is not.** 132 manual assistive-technology
sessions across NVDA/JAWS/VoiceOver/TalkBack on four platforms, each producing a
recorded result with AT version, browser version, tester and date, is the
long pole by a wide margin, and it cannot be parallelised by writing more code.
`yarn validate:at-scripts` exists and the scripts are written (TASK-N1-O4);
what is missing is testers.

If 1.0 is wanted before that work is done, the honest options are:

- **narrow the claim** — 1.0 covers Tier A/B; Tier C/D components stay marked
  `experimental` in the component-status ladder until their cells are executed;
- **narrow the pair set** — execute a documented subset (e.g. NVDA-Firefox and
  VoiceOver-Safari) and record the other four pairs as `unrun` rather than
  claiming them;
- **move C9 post-1.0** and say so in the release notes.

All three are defensible. **Silently shipping 1.0 with 534 unrun AT cells and a
WCAG AA claim on the README is not**, and that is the specific outcome this
criterion exists to prevent.

---

## 5. What this memo refuses to imply

- **That the criteria are ranked.** They are grouped by kind. Which are exit
  criteria and which are post-1.0 is the owner's decision, and it is the whole
  point of the memo.
- **That C6 going green means the tree is good.** Two of the 37 links are red
  today for reasons that predate this packet, and the fix for one of them (C7)
  is a change to a gate, not to evidence. Regenerating the two artifacts would
  turn C6 green until the next commit and would prove nothing.
- **That 20/89 anatomy coverage is a criticism of TASK-N2-S1.** That packet
  moved the ratchet from 136 to 113 by completing three families outright, which
  is the right shape. C3 states the remaining distance, not a shortfall.
- **That anything here has been verified in CI.** Every number in this memo is a
  local run against a committed tree. `validate-min-runtime` — the job that
  would run `validate:all` at the declared Node floor — has never been
  dispatched, which is why it is C10.
