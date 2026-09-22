# Release report — `@dzup-ui/*` candidate `2026-09-21-527dbd1`

> # ⛔ SUPERSEDED AS A STATEMENT ABOUT THE CURRENT TREE — 2026-09-22
>
> **§2's "13 of 13 gates exit 0" and §3's six `0`s are 2026-09-21 measurements
> of content that no longer exists.** Two further packets (**TASK-R0-O1**,
> **TASK-R0-O2**) and a release-exit fix pass landed after this bundle was cut:
> **206 of the 3,581 digested files have changed and 1 is gone**, the tree is
> `527dbd1` + **304** uncommitted paths rather than + 221, `yarn validate:all` is
> **50 links** rather than 48 and **exits 1** at link 48 (`validate:peers` →
> `validate:icon-duplicates`, red by design per TASK-R1-O6), and `api-diff.json`
> contains **zero** mentions of `ariaInvalid` — the one breaking change in the
> candidate, removed from `BaseAccessibilityProps` the next day.
>
> The full table of what changed is at the top of
> [`ledger.md`](./ledger.md). The bundle is deliberately **not** regenerated
> (**D173**): it is a point-in-time record, and rewriting it would destroy
> evidence the owner has not reviewed. This note exists so it cannot be read as
> covering the current candidate. Source:
> [`../../../program-2026-09-04/reports/release-exit-verification-2026-09-22.md`](../../../program-2026-09-04/reports/release-exit-verification-2026-09-22.md),
> finding **S2**.

> **The first release report this repository has ever produced.** Its eight
> sections are the eight doc 08 §Required release report names, each stated
> *independently* as the document requires — a green section 3 does not make
> section 4 green, and none of them makes section 7 anything but empty.
>
> Produced by `yarn release:report`, which is a **projection**: every row below
> comes from a companion artifact in this bundle or from a generated artifact in
> the repository, quoted with the commit it stamps. No row was typed by hand and
> no row is inferred from a file existing.
>
> Produced by an agent with no authority to commit, tag, sign, publish, deploy or
> dispatch CI — and none of those was done.

---

## 1. Implemented scope and source commit

| Fact | Value |
|---|---|
| Branch | `main` |
| `git rev-parse HEAD` | `527dbd150036b5f07bd69e672825ff14ec3a592d` |
| `git status --porcelain` | **221 entries** — required to be empty |
| Position vs `origin/main` | 0 ahead, 0 behind |
| Release tags in the repository | **0 — no release tag has ever existed** |
| Content actually measured | `527dbd1` **plus 221 uncommitted paths** |
| Content digest of what was measured | `e1e44b4da647601fd43912219bba0dfca49b4f8c0270bf543d3a90746958ee5c` |
| Files behind that digest | 3,581 (51,109,809 bytes) |
| **Admissible as release evidence** | **false** — worktree dirty: 221 path(s) differ from 527dbd1 |

The digest is a sha256 over `<path>\0<sha256(file)>\n` for every tracked and
untracked-not-ignored file, sorted by path; it is recomputable from
[`candidate-content-digest.json`](./candidate-content-digest.json), which lists
every file and its hash. **It is not a commit id and it confers no
reviewability.** It exists so that this bundle names *exactly* what was
measured, which is the one thing the label `527dbd1` cannot do here.

doc 08 §Release stop conditions, first item: *"dirty/unidentified source,
generated drift, or evidence bound to a different commit/configuration"*. It is
met. Every section below is therefore evidence about a **candidate**, not about
a release, and the bundle says so in every artifact it writes (`admissible:
false`) rather than only here.

### Candidate packages

| Package | Version | Class |
|---|---|---|
| `@dzup-ui/contracts` | 0.1.0 | published |
| `@dzup-ui/core` | 0.2.0 | published |
| `@dzup-ui/mcp` | 0.2.0 | published |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | published |
| `@dzup-ui/testing` | 0.1.0 | published |
| `@dzup-ui/tokens` | 0.2.0 | published |
| `@dzup-ui/compat` | 0.1.0-alpha.0 | **withheld** — Public and publishable (0.1.0-alpha.0, `publishConfig.access: public`, included in ci.yml's pack smoke test) but on the changesets `ignore` list, so no changeset can ever release it. |
| `@dzup-ui/codemods` | 0.1.0-alpha.0 | **withheld** — Same as compat. |

## 2. Focused validation

One row per gate the rehearsal ran, in order, with the exit code read directly
from the command (never through a pipe — a pipe returns the last stage's status,
which is how an aggregate reported green over a stale artifact for three packets).

| # | Gate | Exit | Seconds | Log |
|---|---|---|---|---|
| 1 | `yarn typecheck:all` | **0** | 67 | [`01-typecheck-all.txt`](./logs/01-typecheck-all.txt) |
| 2 | `yarn typecheck:tooling` | **0** | 6 | [`02-typecheck-tooling.txt`](./logs/02-typecheck-tooling.txt) |
| 3 | `yarn lint` | **0** | 78 | [`03-lint.txt`](./logs/03-lint.txt) |
| 4 | `yarn test` | **0** | 314 | [`04-test.txt`](./logs/04-test.txt) |
| 5 | `yarn test:contracts` | **0** | 67 | [`05-test-contracts.txt`](./logs/05-test-contracts.txt) |
| 6 | `yarn test:a11y` | **0** | 13 | [`06-test-a11y.txt`](./logs/06-test-a11y.txt) |
| 7 | `yarn build` | **0** | 81 | [`07-build.txt`](./logs/07-build.txt) |
| 8 | `yarn validate:all` | **0** | 552 | [`08-validate-all.txt`](./logs/08-validate-all.txt) |
| 9 | `bash scripts/release-checks/dist-artifacts.sh` | **0** | 0 | [`09-dist-artifacts.txt`](./logs/09-dist-artifacts.txt) |
| 10 | `bash scripts/release-checks/esm-only.sh` | **0** | 0 | [`10-esm-only.txt`](./logs/10-esm-only.txt) |
| 11 | `yarn validate:published-imports --built` | **0** | 17 | [`11-published-imports.txt`](./logs/11-published-imports.txt) |
| 12 | `yarn release:api-diff --out docs/qa/release/2026-09-21-527dbd1` | **0** | 16 | [`12-api-diff.txt`](./logs/12-api-diff.txt) |
| 13 | `yarn release:evidence --out docs/qa/release/2026-09-21-527dbd1` | **0** | 13 | [`13-evidence.txt`](./logs/13-evidence.txt) |

**13 of 13 gates exit 0.**

> ⛔ **On 2026-09-21, over content that no longer exists.** Re-run on 2026-09-22: row 8 `yarn validate:all` exits **1** (link 48, red by design) and row 4 `yarn test` exited **1** until the post-teardown defect behind it was fixed the same day (finding **S1**). See the supersession note at the top of this file.

## 3. Aggregate repository qualification

`yarn validate:all` is a chain of **48 links** at this commit (counted from `package.json`, never quoted from a document).

> ⛔ **50 links on 2026-09-22**, and exiting **1**. The chain gained `validate:icon-duplicates` (inside `validate:peers`) and `validate:docs-size` after this bundle was cut. Every `0` in the table below is a 2026-09-21 reading.

| Lane | Exit | Seconds |
|---|---|---|
| `yarn typecheck:all` | **0** | 67 |
| `yarn typecheck:tooling` | **0** | 6 |
| `yarn lint` | **0** | 78 |
| `yarn test` | **0** | 314 |
| `yarn build` | **0** | 81 |
| `yarn validate:all` | **0** | 552 |

**Locally qualified only.** A green local run is never CI, release or production
evidence. The maturity ladder is *specified → implemented → focused-validated →
aggregate-qualified → browser/AT-qualified → packaged → released*; this section
reaches the fourth rung and no higher, and none of the six published packages has
ever been built by CI on a clean checkout.

## 4. Browser / AT / security / performance experience qualification

| Lane | Artifact | Stamped | State |
|---|---|---|---|
| Capability matrix | `packages/core/docs/capability-matrix.json` | `527dbd1` (= HEAD) | 144 rows · 570 pass · 37 **stale** · 441 unrun · 17 excepted |
| Browser matrix | `e2e/matrix/browser-evidence.json` | `2d51eec` — **not HEAD** | 24/24 projects · 2112/2136 cells pass · 0 fail · worktree was **dirty (443 paths)** at capture |
| AT matrix | `e2e/at-matrix/index.json` | _run records, not a build_ | 534 cells · **0 executed** · 534 unrun |
| WCAG | `packages/core/docs/wcag-deviations.json` | TASK-N1-O3 (the audit) and TASK-R2-O5 (the browser re-measurement and the affordance that closed the three gaps) | SC 2.5.7 Dragging Movements (AA) · ceiling 0 · **0 open gap(s)** over 9 surface(s) |
| Security | `packages/core/security/security-deviations.json` | — | ceiling 0 · 0 deviation(s) |
| Security corpus | `packages/core/security/coverage.json` | `2d51eec` — **not HEAD** | worktree was **dirty** at capture |
| Performance | `packages/core/perf/baselines.json` | _per-baseline provenance_ | 33 baseline(s) |
| Visual | `e2e/visual/visual-baselines.json` | — | 58 accepted baseline(s) |

**Stale and unrun cells stay visible.** Nothing here is collapsed into an
aggregate count and no manual AT result cell was filled by a tool: a fabricated
row is worse than an empty one. An artifact stamped anything other than HEAD is
marked **not HEAD** above rather than quoted as if it described this candidate.

## 5. Packed-artifact qualification

Every package `release-policy.json` classifies as **published**, packed with
`yarn pack` (never `npm pack`: npm copies `workspace:*` verbatim and the tarball
dies with `EUNSUPPORTEDPROTOCOL` on install).

| Package | Version | Bytes | Files | sha256 |
|---|---|---|---|---|
| `@dzup-ui/contracts` | 0.1.0 | 63,196 | 50 | `5c3d05dbb7760d07…` |
| `@dzup-ui/core` | 0.2.0 | 741,860 | 1461 | `191cdecdfb76d573…` |
| `@dzup-ui/mcp` | 0.2.0 | 35,891 | 17 | `5b71844808ca1dc7…` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 8,555 | 7 | `3a85ce380c94d7db…` |
| `@dzup-ui/testing` | 0.1.0 | 58,346 | 34 | `5b5b4d3677d5a199…` |
| `@dzup-ui/tokens` | 0.2.0 | 53,584 | 17 | `bb6728c9c2ef5653…` |

Full digests (sha256 **and** sha512, per tarball and per file inside it):
[`hashes.json`](./hashes.json). SBOMs: [`sbom.cdx.json`](./sbom.cdx.json)
(aggregate, CycloneDX 1.6) and `sbom/<package>.cdx.json`. Supply chain:
[`supply-chain.md`](./supply-chain.md).

Consumer-truth import gate (`validate:published-imports`, TASK-R1-O2): **exit 0** — every declared subpath of every published package loads under plain Node from the extracted tarball.

### API diff

| Package | Baseline (fidelity) | Added | Removed | Changed | Level required | Changeset declares |
|---|---|---|---|---|---|---|
| `@dzup-ui/contracts` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/core` | public-api.manifest.json@worktree (manifest-only) | 455 | 6 | 0 | **minor** | minor |
| `@dzup-ui/mcp` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |
| `@dzup-ui/nuxt` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/testing` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/tokens` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |

The level column is **`minor` for breaking and `patch` for additive** — the 0.x
mapping in `packages/contracts/VERSIONING.md` §1, not the 1.x one. `major` is
refused by `validate:release-policy` while `allowMajor` is false, because a
`major` bump *is* the 1.0 release.

**`generate:exports` drift on `@dzup-ui/core`** — running the generator would rewrite `packages/core/src/index.ts`:

- **would DROP 5 line(s)**, taking every symbol behind them out of the public surface — breaking under VERSIONING.md §2.1, requiring a `minor`:
  - `export * from './composables/useAffix/index.ts'`
  - `export * from './composables/useCalendar/index.ts'`
  - `export * from './composables/useInfiniteScroll/index.ts'`
  - `export * from './composables/useScrollSpy/index.ts'`
  - `export * from './composables/useScrollToTop/index.ts'`
- **would ADD 2 line(s)** the manifest declares and the barrel lacks:
  - `export * from './composables/useCountdown/index.ts'`
  - `export * from './composables/useIntersection/index.ts'`

  Reported as an owner finding, **not silently resolved**: a generator would
  perform a breaking removal with no changeset and no decision behind it, and
  which side is right — the barrel or the manifest — is not a tool's call.
  Routed to **TASK-R0-O1**.

**Manifest reconciliation on `@dzup-ui/core`** — the manifest declares version `0.0.1` while the package is `0.2.0`:

- **455** symbol(s) reach a consumer through the root barrel and are absent from the manifest's documented name lists
- **6** symbol(s) the manifest promises and the packed build does not deliver: `UseIntersectionOptions`, `UseIntersectionReturn`, `formatRemaining`, `toRemainingParts`, `useCountdown`, `useIntersection`

  A **different** finding from the drift above: the generated barrel
  star-re-exports each family index, so those name lists are documentation a
  star re-export never consults. This measures how stale the document is —
  the same defect TASK-N2-A1 found ("stale by 43 public components"), which is
  why `generate:component-meta` was moved onto the ownership manifest instead.

## 6. Downstream canary / adoption evidence

| Consumer | Kind | State |
|---|---|---|
| `packages/nuxt/test` fixtures | packed-tarball Nuxt consumers | _not run in this bundle_ — the `core-pro` fixture stays **unrun** whatever the exit code: it needs `DZUP_PRO_TARBALL` from a Pro checkout |
| `ui/dzup-ui-pro` | the one real downstream consumer | Pro peers still declare `@dzup-ui/core@^0.1.0-alpha.0`; its tarball installs need `--legacy-peer-deps`. **No canary of this candidate has been installed into Pro.** |
| Public adopters | — | **none.** Nothing has been published: npm 404 for every `@dzup-ui/*` name. |

**There is no downstream canary for this candidate.** Pro built a consumer matrix
(`tools/release/consumer-matrix.mjs`) over real fixture consumers; OSS has the
Nuxt fixtures and the `validate:published-imports` scratch consumer, and neither
is an adoption signal. Section 6 is therefore **empty by fact, not by omission**,
and a release decision that needs it does not have it.

## 7. Publication / production authority and actual operation status

| Operation | Authorised | Performed |
|---|---|---|
| `git commit` / `git push` | no — owner | **no** |
| `git tag` | no — owner | **no** (0 release tags exist) |
| `changeset version` | no — owner | **no** |
| `changeset publish` | no — owner | **no** |
| Registry mutation | no — owner | **no** |
| CI dispatch | no — owner (TASK-R1-O4) | **no** |
| Signing / trusted publishing | no — needs a key and an operator | **no.** `.github/workflows` requests `id-token: write` and no workflow has ever published, so **no npm provenance attestation exists for any `@dzup-ui/*` package** |
| Deployment / DNS | no — owner (TASK-R1-O5) | **no** |

**Operator approval: empty by design.** No operator has reviewed this bundle, and
an agent may not sign the line on one's behalf. The row exists so that its
emptiness is a recorded fact rather than an absent section.

| Approval | Name | Date | Decision |
|---|---|---|---|
| Release operator | _(empty)_ | _(empty)_ | _(empty)_ |

## 8. Known gaps, accepted exceptions, rollback, ranked next work

### Stop conditions met (doc 08 §Release stop conditions)

| Code | Detail |
|---|---|
| `dirty-source` | worktree dirty: 221 path(s) differ from 527dbd1. doc 08: "dirty/unidentified source, generated drift, or evidence bound to a different commit/configuration". |
| `unexplained-api-diff` | @dzup-ui/core: `yarn generate:exports` would DROP 5 barrel line(s) — every symbol behind them leaves the public surface. Breaking under VERSIONING.md §2.1, requiring a `minor`, performed by a generator with no changeset behind it: export * from './composables/useAffix/index.ts' / export * from './composables/useCalendar/index.ts' / export * from './composables/useInfiniteScroll/index.ts' / export * from './composables/useScrollSpy/index.ts' / export * from './composables/useScrollToTop/index.ts'. Owner decision, routed to TASK-R0-O1. |
| `manifest-omission` | @dzup-ui/core: `yarn generate:exports` would ADD 2 barrel line(s) the manifest declares and the barrel does not have: export * from './composables/useCountdown/index.ts' / export * from './composables/useIntersection/index.ts'. |
| `manifest-omission` | @dzup-ui/core: 455 symbol(s) reach a consumer through the root barrel and are absent from public-api.manifest.json's documented name lists. Not a generator action (the barrel star-re-exports); a stale document other tooling has already been moved off (TASK-N2-A1). |
| `manifest-omission` | @dzup-ui/core: 6 symbol(s) are promised by public-api.manifest.json and absent from the packed build. |

### Accepted exceptions

**Licence exceptions: 0** (`packages/tooling/scripts/licence-exceptions.json`).
The file is empty because the measurement found nothing to except, not as a placeholder.

### Rollback

**There is no rollback policy document in this repository.** Pro has
`docs/release/rollback-and-support.md`; OSS has nothing equivalent, and nothing
has ever been published, so there is also nothing to roll back *from*. The
mechanism that would be used — `npm deprecate` plus a superseding patch, since
unpublish is only available for 72 h — is stated here and nowhere else, which is
itself the gap. Writing that policy is a prerequisite of the first publication
and is routed to **TASK-R0-O1**.

### Changesets standing in the plan

**36 pending changeset(s).** Declared levels by package:

| Package | Declared |
|---|---|
| `@dzup-ui/contracts` | minor |
| `@dzup-ui/core` | minor |
| `@dzup-ui/mcp` | patch |
| `@dzup-ui/nuxt` | minor |
| `@dzup-ui/testing` | minor |
| `@dzup-ui/tokens` | patch |

### Ranked next work

1. **Commit the tree and re-run this bundle.** Every artifact here is stamped
   `admissible: false`; one clean commit turns the whole bundle into evidence and
   lets `release:api-surface:record` write the first real baseline.
2. **TASK-R0-O1** — the publish-or-freeze packet. The `generate:exports` drift in
   section 5 and the changeset table above are its two missing inputs.
3. **TASK-R1-O4** — CI dispatch. Nothing in section 3 has ever run on CI, and
   section 7 has no provenance because no workflow has ever published.
4. **A rollback and support policy** for OSS, as section 8 requires.
5. **TASK-R2-O2** — the AT matrix: section 4 records the executed count, and it is
   the lane with the least evidence per unit of claim.

---

_Generated 2026-09-21T14:57:15.723Z by `yarn release:report` from `527dbd150036b5f07bd69e672825ff14ec3a592d`._
