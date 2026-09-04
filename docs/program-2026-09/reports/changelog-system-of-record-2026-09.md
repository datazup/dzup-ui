# `[!owner]` Changelog system of record — Changesets vs `workspace-changelog`

> Memo for [`release-and-toolchain-tasks.md` → TASK-N5-01](../release-and-toolchain-tasks.md) step 4.
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-03 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `6f1f6539…` (`6f1f653 Merge remote-tracking branch 'origin/main'`)
> **Worktree at run start:** **clean — 0 entries.**
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`, `@changesets/cli` `2.30.0`.
>
> **Evidence class: `locally qualified, against a committed tree`.** Not CI, not
> release, not production.
>
> **This memo decides nothing.** It states what is wired to what, and asks for
> one decision (§6) whose consequences are costed in §5. Nothing is published,
> no version is bumped, no changelog is rewritten by this packet.

---

## 1. The framing in the reassessment is wrong in one load-bearing way

`02-capability-matrix-oss.md` §"Release engineering" says:

> 17 unreleased changesets vs external `workspace-changelog` stale since
> 2026-06-27

Three corrections, each measured on this checkout:

| Claim | Measured | Correction |
|---|---|---|
| 17 changesets | `ls .changeset/*.md` minus `README.md` = **16** | Off by one. Quoted in three documents; every N5 packet uses 16. |
| "external" | The data is `ui/dzup-ui/CHANGELOG.md` — **committed, in-repo, 77,527 bytes, 136 entries** | Only the *writer* was external. The store is here and is load-bearing. |
| stale since 2026-06-27 | Newest entry `date=2026-06-27`; all 136 entries carry `updatedAt=2026-06-27`; last commit `24cfb6e` (2026-06-27, `Datazup Automation`) | **Confirmed on three independent signals.** |

The third correction is the one that changes the decision: this is not "an
external tool we could stop using". It is **a dead writer with a live,
CI-gated reader.**

---

## 2. What each system actually is

### 2.1 `workspace-changelog` — per-commit, no versions, generator gone

`ui/dzup-ui/CHANGELOG.md`, date-grouped `## YYYY-MM-DD` → `### Added|Changed|Fixed`,
every bullet wrapped in paired HTML markers. One entry, verbatim:

```markdown
<!-- workspace-changelog:entry id=…:34d7ffd…:changelog:Fixed:e9513e839083 repo=out/workspace-changelog-remote/changelog-main-refresh-20260627-121850/worktrees/ui-dzup-ui commit=34d7ffd32d537befbe50bd43dca40959b147c988 date=2026-06-27 updatedAt=2026-06-27T12:40:13.515Z -->
- Fix use avatar fallback as accessible label. ([README.md](README.md)) (ninel.hodzic)
<!-- /workspace-changelog:entry -->
```

- **Granularity: one entry = one commit.** Text is the commit subject,
  mechanically. Attributed to a git author.
- **No version numbers anywhere** — not in headings, not in entries, not in the
  marker metadata. There is no notion of a release, a package, or a semver bump
  in this system at all.
- Provenance links are degenerate: every entry cites `([README.md](README.md))`
  regardless of what changed. `release-parser.mjs` strips the group as noise.
- **No generator survives in the workspace.** The `repo=` path
  (`out/workspace-changelog-remote/…`) does not exist locally; `out/` exists
  nowhere. The invocation named in the post-mortems
  (`yarn workspace:changelog-rebuild --resume-run …`) is **not a script in any
  `package.json` in this workspace.** It ran on a remote Coolify host, committed,
  and the worktree is gone.
- Sibling repos confirm one workspace-wide sweep that then stopped:
  `ui/dzup-ui-pro/CHANGELOG.md` (29 entries, newest 2026-06-23) and
  `workspace-docs/CHANGELOG.md` (25, newest 2026-06-25), same run id.

### 2.2 Changesets — per-intent, per-package, never actually run

- 16 pending changesets, mapping to **4 commits**: `7d351cd` (1), `4c9fb7a` (8),
  `8d80bc3` (1), `e986952` (5).
- `.changeset/config.json` uses the stock `@changesets/cli/changelog` generator —
  **no custom formatter**, so no mechanism exists to inject a date.
- `release.yml` runs `changesets/action@v1` with `publish: yarn release`
  (`yarn build && changeset publish`). `publish-prerelease.yml` is
  `workflow_dispatch`-only.
- **`changeset publish` appears never to have run.** Every dated heading in the
  seven per-package changelogs (`## 0.2.0 (2026-08-10)`) carries a date
  Changesets cannot emit and no script in the repo adds. Those dates were typed
  by hand.

### 2.3 The one place they meet

`packages/tooling/src/release-parser.mjs`. Its own header:

> The repo produces a rich `CHANGELOG.md` via the workspace-changelog tooling …
> plus pending `.changeset/*.md` entries staged for the next release, and
> per-package semver `CHANGELOG.md` files where deprecations are formally
> announced. This module turns all three into one typed dataset

`parseReleaseData({ repoRoot })` reads all three inputs. Exactly **two**
consumers, both read-only build scripts:

| Consumer | Produces | Reaches |
|---|---|---|
| `apps/landing/scripts/build-releases.ts` | `apps/landing/src/generated/releases.ts` (1,638 lines), `public/feed.xml`, `index.html` | The public `/changelog` page and the **public Atom feed** |
| `apps/storybook/scripts/build-releases.mjs` | The Storybook `Guides/Releases` page | Storybook readers |

And it is **CI-gated**: `.github/workflows/ci.yml:228`, step *"Landing generated
artifacts unchanged"*, rebuilds `releases.ts` and `git diff --exit-code`s it.
`build-releases.ts:227` additionally throws
`No dated releases parsed from CHANGELOG.md — refusing to write an empty feed.`

**Consequence: `ui/dzup-ui/CHANGELOG.md` cannot simply be deleted.** Deleting it
trips that throw, empties the public feed, and fails the CI diff step.

---

## 3. The defect this memo exists to surface: two gates enforce mutually exclusive formats

Measured, not inferred, by running both regexes over real files:

| Gate | Rule | On `## 0.2.0` (Changesets) | On `## 0.2.0 (2026-08-10)` (hand-dated) |
|---|---|---|---|
| `validate:changelog` (`packages/tooling/scripts/validate-changelog.ts`) | heading matches `^##\s+\[?\d+\.\d+\.\d+` **and** carries an ISO date on the same line | **FAIL** — "Version entry missing ISO date" | PASS |
| `validate:mcp` (`packages/tooling/src/validators/mcp-surface.ts`, `latestChangelogVersion`) | `/^##\s+(\d+\.\d+\.\d+(?:-[\w.]+)?)\s*$/m` — anchored, nothing may follow | PASS → `0.2.0` | **FAIL** → `null` |

No changelog in this repository can satisfy both. `@dzup-ui/mcp` is the package
that proves it: its changelog is in the Changesets format and it passes CI only
because `validate-changelog.ts`'s hand-typed `PUBLISHABLE_PACKAGES` array lists
seven packages and **`@dzup-ui/mcp` is not one of them**. `apps/landing/CHANGELOG.md`
is in the same shape and is also unchecked.

**The consequence is a booby trap on the release path.** `changeset version`
rewrites each bumped package's `CHANGELOG.md` with an undated `## x.y.z`
heading. The first real release therefore converts two silent violations into a
**red `validate:changelog`** — and therefore a red `validate:all` — for every
package it bumped. Today that is up to 4 of the 7 covered packages (core,
contracts, testing, nuxt), and 7 of 7 once compat and codemods are released.

Three mutually incompatible heading grammars coexist on disk right now:

| File | Heading | Machine-written? |
|---|---|---|
| `ui/dzup-ui/CHANGELOG.md` | `## 2026-06-27` (date, no version) | yes — by the dead generator |
| `packages/{core,contracts,tokens,testing,compat,codemods,nuxt}/CHANGELOG.md` | `## 0.2.0 (2026-08-10)` (both) | **no — hand-typed** |
| `packages/mcp/CHANGELOG.md`, `apps/landing/CHANGELOG.md` | `## 0.2.0` (version, no date) | yes — by Changesets |

The root file escapes `validate:changelog` entirely because the validator never
looks at the repository root, where it would fail outright.

**What this packet did about it:** nothing that weakens a gate. `yarn
validate:release-policy` R9 records the collision count as a **ratchet** (ceiling
`1`, the mcp case) so it cannot spread quietly, and R10 requires every published
package to be either covered by `validate:changelog` or listed as exempt with a
reason. `@dzup-ui/mcp` is listed as exempt in
`packages/tooling/scripts/release-policy.json`, with this section as the reason.
**A ratchet on an open defect is not a pass** and the JSON says so.

---

## 4. What each system is good at

|  | `workspace-changelog` | Changesets |
|---|---|---|
| Unit of record | a **commit** | an **intent**, per package |
| Version awareness | none | the entire point |
| Author intent | inferred from a commit subject | written by the author, in prose, at the time |
| Per-package attribution | none | mandatory |
| Coverage of history | 136 entries, 2026-04-02 → 2026-06-27 | 16 pending, 2026-07-22 → 2026-08-25 |
| Coverage of the last 10 weeks | **none — the writer is gone** | complete |
| Who consumes it | public `/changelog` page, Atom feed, Storybook Releases (via `release-parser.mjs`) | `changeset version` → per-package `CHANGELOG.md`; also read by `release-parser.mjs` |
| Can it survive without the other | yes, but frozen | yes — but the public feed and its CI diff gate would need migrating |

They are not two implementations of one thing. One is a **commit log rendered
for humans**; the other is a **release ledger**. The reason both exist is that
neither was ever asked to do the other's job.

---

## 5. Recommendation

**Changesets is the system of record for releases. `workspace-changelog` is
retired as a writer and its 136 entries are kept as frozen history.**

The reasoning is not preference:

1. The `workspace-changelog` writer **does not exist in this workspace**. A
   system of record whose generator cannot be run is already not one; it has
   simply not been declared.
2. It has **no concept of a version**. The library is about to make versions
   mean something specific (`packages/contracts/VERSIONING.md`: minor =
   breaking). A changelog that cannot say which release a change landed in
   cannot support that policy.
3. Changesets is already the CI release path (`release.yml`), already
   per-package, and already carries 16 authored entries covering everything
   since the other system stopped.

**But it is retired as a *writer*, not deleted**, because the reader is live and
CI-gated (§2.3). Concretely, the smallest correct sequence:

| # | Step | Cost | Reversible |
|---|---|---|---|
| 1 | Freeze `ui/dzup-ui/CHANGELOG.md` — add a header stating the writer is retired, the entries are history to 2026-06-27, and releases are recorded per package | one edit | yes |
| 2 | Decide the heading grammar (§6, decision D1) and make `validate:changelog` and `validate:mcp` agree with it | one of the two gates changes; see D1 options | yes |
| 3 | Keep `release-parser.mjs` and both `build-releases` consumers reading all three inputs — they already merge; the root file simply stops growing | zero | — |
| 4 | Add `@dzup-ui/mcp` to `validate:changelog`'s list and drop the exemption from `release-policy.json` (R10 will then require it) | blocked on step 2 | yes |
| 5 | Replace `validate-changelog.ts`'s hand-typed `PUBLISHABLE_PACKAGES` with a derivation from the workspace, the way `generate-readme-facts.ts` already derives its package table | small | yes |

**Step 5 is the durable half.** The array is a hand-typed inventory of a fact the
repository already knows, and this is the second time such an array has been
found wrong: `generate-readme-facts.ts` exists because the README's hand-typed
package table had five wrong rows and two missing packages. The same class of
list, the same class of failure, one file apart.

---

## 6. `[!owner]` decisions

### D1 — the CHANGELOG heading grammar 🔴

`validate:changelog` and `validate:mcp` cannot both be satisfied (§3). One of
them changes. Three options, costed:

| Option | Change | Cost | Consequence |
|---|---|---|---|
| **D1-a** — adopt Changesets' native grammar | Relax `validate:changelog` to accept `## x.y.z` with no date; keep the ISO-date requirement only where a date is present | ~10 lines in one validator; 7 existing dated headings stay valid | The gate stops asserting a date that Changesets cannot produce. **Weakens one clause of an existing gate** — record it as such. Nothing else moves. |
| **D1-b** — make Changesets emit the date | Write a custom changelog formatter in `.changeset/config.json` (replacing `@changesets/cli/changelog`) that appends ` (YYYY-MM-DD)`; fix `validate:mcp`'s anchored regex to tolerate it | ~40 lines + a spec; touches the release path itself | No gate is weakened. Costs a bespoke formatter to maintain, and a formatter bug is discovered at release time. |
| **D1-c** — do nothing | — | zero now | The first `changeset version` turns `validate:all` red. This is the current trajectory and the ratchet exists to keep it visible. |

**Recommendation: D1-a.** The date was never a promise the tooling could keep —
all 13 dated headings were typed by hand, unreproducibly. A gate that requires
an unreproducible artifact is asserting a process, not a fact. D1-b is
defensible if the release date is genuinely wanted in the file rather than
derived from the git tag; it is more code on the least-exercised path in the
repository.

### D2 — freeze or revive `workspace-changelog` 🟠

**Recommendation: freeze** (§5). Reviving it means locating and re-hosting a
generator that does not exist in this workspace, to produce per-commit entries
with no version awareness, in parallel with a system that has both. If the
`/changelog` page and Atom feed are wanted to keep covering post-June work, the
cheaper path is to have `release-parser.mjs` render pending changesets and
per-package releases into the same shape — it already parses both.

**What freezing does not do:** it does not delete the file, does not remove the
CI diff gate, and does not change the public page's current content.

### D3 — derive `validate:changelog`'s package list 🟢

**Recommendation: yes**, after D1. Blocked on D1 only because adding
`@dzup-ui/mcp` to the list under today's rules makes the gate unsatisfiable.

---

## 7. Inputs from sibling packets that belong here

- **A4-D1 (from N2-A4, `registry-evaluation-2026-09.md`) — publish-or-freeze.**
  The npm packages 404 and the domain does not resolve. Every claim in this memo
  about "the release path" describes machinery that **has never delivered a
  package to a registry**. Whichever way D1 goes, the first publish is still the
  first publish, and this memo's §3 trap fires on it.
- **A4-D3 — `validate:registry` before anything publishes from `/r/`.** Out of
  scope for this memo; carried into the 1.0 exit criteria as a gate that must
  exist before the registry surface is public.
- **`validate-min-runtime` has never been dispatched** (the repo's own
  `docs/program-2026-08/EXECUTION-STATUS.md:710` says so). That job runs
  `validate:all` at the Node floor, so it is also the job where a changelog
  format regression would first surface in CI. It has not run.

---

## 8. What this memo refuses to imply

- **That Changesets works.** It assembles a plan (`changeset status` exit 0, now
  gated). It has never versioned or published anything in this repository. The
  hand-typed dates are the evidence.
- **That the 16 changesets are release-ready.** Their *levels* are audited in
  the N5-01 handoff and 11 of 16 are over-declared under the new policy. That is
  a separate open question.
- **That freezing `workspace-changelog` is free.** It has a live reader behind a
  CI diff gate and a public Atom feed. §5 step 3 is the reason it is cheap, not
  a claim that it is zero.
- **That the ratchet in R9 makes the release path safe.** It records a known
  defect at its current size. It is not a fix and the JSON comment says so
  explicitly.
