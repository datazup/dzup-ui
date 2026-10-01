# Tree-truth record — `ui/dzup-ui` @ `4e4e46f`

> **TASK-S0-O1**, produced 2026-09-22. One page. Every number below is bound to
> the commit named in its own row; nothing here is inherited from a document.
>
> **Commit:** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` — *"docs: regenerate
> evidence at 589be13 and land the 2026-09-22 programmes"*, `main`,
> 0 ahead / 0 behind `origin/main`.
> **Worktree at start:** clean, **0 dirty paths**.
> **Worktree at end:** **167 dirty paths, all created by this task** — the
> regenerated artifacts, the new validator, five marked ledger lines and these
> two reports. Nothing was committed: the owner commits.
> **Admissibility:** **locally qualified.** Not CI, not release, not production.

## 1. Artifact stamps

| Artifact | sourceCommit before | after | equals HEAD | regenerated |
|---|---|---|---|---|
| `packages/core/manifests/component-ownership.manifest.json` | `527dbd1` | **`4e4e46f`** | **yes** | 2026-09-22 |
| `packages/core/docs/quality-matrix.json` | `527dbd1` | **`4e4e46f`** | **yes** | 2026-09-22 |
| `packages/core/docs/capability-matrix.json` | `589be13` | **`4e4e46f`** | **yes** | 2026-09-22 |
| `packages/core/docs/component-meta.json` | `589be13` | **`4e4e46f`** | **yes** | 2026-09-22 |

**0 of 4 → 4 of 4 bound.** The equality holds **only in the uncommitted
worktree** and is broken again by the commit that lands it — see §5 and
[the handoff](./TASK-S0-O1-handoff.md) §6. The regeneration changed **157 files,
313 insertions, 313 deletions, and every changed line is a provenance hash**: no
row, count, tier, capability cell or prop moved.

| Unstamped artifact | Why it is not in the table |
|---|---|
| `packages/core/docs/llms.txt`, `llms-full.txt` | no `sourceCommit` field; regenerated, bytes unchanged |
| `e2e/at-matrix/index.json` | append-only run records with per-row `componentCommit`; **0 of 534 cells executed** — untouched, an agent never fills one |
| `packages/core/perf/baselines.json` | derived thresholds, not a capture; **O7-D1**, owner |

## 2. Gates — exact commands and exit codes

Every command unpiped: `cmd > log 2>&1; echo "exit $?"`, exit code read from the
file. `npx` is never used here (it resolves a dependency-confusion placeholder).

| Gate | Command | Exit | Verdict |
|---|---|---:|---|
| typecheck | `yarn typecheck` | **0** | vue-tsc, `packages/core` |
| typecheck (tooling) | `yarn typecheck:tooling` | **0** | includes the new validator |
| lint | `yarn lint` | **0** | after fixing one import-order error in this task's own new spec |
| test | `yarn test` | **0** | **553 files · 10,518 passed · 3 skipped · 1 todo · 0 failed** (296 s) |
| build | `yarn build` | **1** | **14 TS errors**, `packages/codemods` fixtures — **pre-existing since `589be13`** |
| aggregate, clean committed tree, **before** | `yarn validate:all` | **1** | first red at **link 39 / 50** |
| aggregate, this worktree, **after** | `yarn validate:all` | **1** | first red at **link 44 / 51** |
| new gate | `yarn validate:evidence-binding` | **0** | 4/4 bound; fires on a seeded defect |

## 3. Per-link failures

`validate:all` is **51 links** (was 50; this task appended one at the end,
deliberately not in the middle — a renumber would falsify every existing link
citation). **Count the links, never quote them.**

### Before — clean committed tree, 47 of 50 green

| Link | Command | Exit | Classification |
|---:|---|---:|---|
| 39 | `yarn validate:package-names` | **1** | **new at HEAD** — 3 occurrences, all in ledger prose that *reports* the finding. **Fixed** with the validator's own `retired-name-ok` inline marker. |
| 42 | `yarn validate:adr-references` | **1** | **new at HEAD** — 1 unresolved `ADR-21` citation, in the same sentence. **Fixed** with the validator's own `adr-example-ok` marker. |
| 48 | `yarn validate:peers` | **1** | **pre-existing, D174/D175** — two icon-library versions resolve. Untouched. |

Links 40–50 were run individually because the chain stops at its first red.

### After — this worktree, 48 of 51 green

| Link | Command | Exit | Classification |
|---:|---|---:|---|
| 44 | `yarn validate:externals` | **1** | **revealed, not caused** — 8 undeclared imports, all from `packages/codemods/dist/transforms/__fixtures__/swap-icon-library/` |
| 45 | `yarn validate:dts` | **1** | same output, missing `.d.ts` for one fixture |
| 48 | `yarn validate:peers` | **1** | **pre-existing, D174/D175**, unchanged |
| 39, 42 | | **0** | fixed by this task |
| 46, 47, 49, 50, 51 | | **0** | green |

**All three remaining reds are one root cause:** the icon-swap codemod fixtures
that landed in `589be13` reference a module installed nowhere and declared in no
`package.json` — the open D174/D175 decision.

**Why 44 and 45 were green before and are red now, measured not guessed.**
`packages/codemods/dist` is **gitignored build output**. Before this task it
held a **stale build from before `589be13`** (17 `.js` / 17 `.d.ts`, passing).
`yarn build` tried to refresh it, failed mid-way, and left partially-emitted
output that both `dist`-reading gates then judged. Proof: parking
`packages/codemods/dist` aside returns `validate:externals` and `validate:dts`
to **exit 0**, and restoring it returns them to **exit 1**.

> **The aggregate was green over a build artifact that could not be
> reproduced.** `yarn build` is not a link in `validate:all`, so whether the
> chain passes depends on whether anyone has run a build — and the last
> successful one predates the defect. This is recorded as **D-S0O1-1**.

## 4. Ratchet values at `4e4e46f`

| Ratchet | Before | After | Moved by |
|---|---:|---:|---|
| Generated artifacts bound to HEAD | 0 of 4 | **4 of 4** | this task |
| `validate:all` links | 50 | **51** | this task (`validate:evidence-binding`) |
| Gates asserting a commit-time binding | 0 | **1** | this task |
| `validate:all` first failing link | 39 / 50 | **44 / 51** | 2 fixed, 2 revealed |
| Red links traceable to one open decision | 1 of 3 | **3 of 3** | measurement |
| Capability-matrix stale cells | **22** (ledger said 37) | 22 | not this task — **S1-O4 / O7-D1** |
| Capability-matrix unrun cells | 441 | 441 | **S1-O2** |
| Capability rows / pass / fail / excepted | 144 / 585 / 0 / 17 | identical | — |
| AT cells executed | 0 of 534 | **0 of 534** | **S1-O1, human only** |
| `maxProposedCitedFromCode` | 3 | 3 | **S0-O3, owner** |
| `maxUndocumented` (ADRs) | 14 | 14 | — |
| Ownership `unclassified` / entries | 29 / 1338 | 29 / 1338 | — |
| `maxWithoutAnatomy` | 41 | 41 | — |
| story-DoD ceilings (states / a11y / real-world) | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Test files / tests | 544 / 10,263 (R1-O1) | **553 / 10,518** | +1 file / +14 tests here |
| Measured browser failures | 0 | 0 | — |

**No ratchet was raised. No exception file was widened. No maturity level was
relabelled.**

## 5. The `done_check`, scored honestly — **3 of 4 at `4e4e46f`**

| # | Clause | Result |
|---:|---|---|
| 1 | ownership `sourceCommit === HEAD` | **pass** in the worktree — **and defective**, see below |
| 2 | the same for quality, capability, component-meta | **pass** in the worktree — same defect |
| 3 | `git status --porcelain \| wc -l` = 0 **before** starting | **pass** — 0 dirty paths, verified before anything was touched |
| 4 | a tree-truth record exists carrying HEAD's short sha | **pass** — this file |

**Clauses 1 and 2 are a defective check of the kind README §4 point 3 warns
about — the fifth recurrence of this shape.** They can be satisfied **only** in
a dirty worktree, and the same prompt's `<authority>` forbids the commit that
would make the state durable. The moment the owner commits, HEAD becomes `X+1`
and all four artifacts stamp `X` again. `4e4e46f` is itself the proof: a commit
titled *"regenerate evidence at `589be13`"* that left every artifact one commit
behind. A file cannot contain the hash of the commit that contains it.

**Replaced by:** `yarn validate:evidence-binding` (link 51), which asks whether
any declared input changed *after* the artifact was stamped. That is satisfiable
from a clean committed tree, it stays true across later commits that touch no
input, and it goes red the instant a component changes without a regeneration.
Seeded-defect proof, 14 unit tests against a real throwaway git repository, and
the full argument: [handoff](./TASK-S0-O1-handoff.md) §6.

## 6. What the owner must run

```bash
# 1. commit this worktree. The artifacts then stamp 4e4e46f, HEAD becomes X+1,
#    and validate:evidence-binding stays green — sourceCommit is SUPPOSED to
#    name the parent.
# 2. after any commit that touches a declared input, regenerate in order:
yarn generate:ownership && yarn generate:quality-matrix \
  && yarn generate:capability-matrix && yarn generate:component-meta \
  && yarn generate:llms && yarn generate:docs-pages
yarn validate:evidence-binding     # must be exit 0

# 3. the three red links are ONE decision (D-S0O1-1 / D174 / D175):
#    do not clear them with `rm -rf packages/codemods/dist` — that restores a
#    fiction. Decide the icon swap, or exclude __fixtures__ from
#    packages/codemods/tsconfig.json as packages/tooling/tsconfig.json already
#    does, then add `yarn build` to validate:all.
```
