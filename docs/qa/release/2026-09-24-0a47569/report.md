# Release report — `@dzup-ui/*` candidate `2026-09-24-0a47569`

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
| Branch | `release-evidence-20260924` |
| `git rev-parse HEAD` | `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c` |
| `git status --porcelain` | **0 entries** — required to be empty |
| Release tags in the repository | **0 — no release tag has ever existed** |
| Content actually measured | `0a47569` **plus 0 uncommitted paths** |
| Content digest of what was measured | `2269125b3eb01fca98d7c80cd6db9900631ef2e21980a249a532eb012aa9ef6b` |
| Files behind that digest | 3,647 (54,847,243 bytes) |
| **Admissible as release evidence** | **true** |

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
| 1 | `yarn install --immutable` | **0** | 3 | [`01-install-immutable.txt`](./logs/01-install-immutable.txt) |
| 2 | `yarn typecheck:all` | **0** | 24 | [`02-typecheck-all.txt`](./logs/02-typecheck-all.txt) |
| 3 | `yarn typecheck:tooling` | **0** | 2 | [`03-typecheck-tooling.txt`](./logs/03-typecheck-tooling.txt) |
| 4 | `yarn lint` | **0** | 37 | [`04-lint.txt`](./logs/04-lint.txt) |
| 5 | `yarn test` | **0** | 65 | [`05-test.txt`](./logs/05-test.txt) |
| 6 | `yarn test:contracts` | **0** | 12 | [`06-test-contracts.txt`](./logs/06-test-contracts.txt) |
| 7 | `yarn test:a11y` | **0** | 2 | [`07-test-a11y.txt`](./logs/07-test-a11y.txt) |
| 8 | `yarn build` | **0** | 22 | [`08-build.txt`](./logs/08-build.txt) |
| 9 | `yarn validate:all` | **0** | 78 | [`09-validate-all.txt`](./logs/09-validate-all.txt) |
| 10 | `bash scripts/release-checks/dist-artifacts.sh` | **0** | 0 | [`10-dist-artifacts.txt`](./logs/10-dist-artifacts.txt) |
| 11 | `bash scripts/release-checks/esm-only.sh` | **0** | 0 | [`11-esm-only.txt`](./logs/11-esm-only.txt) |
| 12 | `yarn validate:published-imports --built` | **0** | 3 | [`12-published-imports.txt`](./logs/12-published-imports.txt) |
| 13 | `yarn test:nuxt-fixtures:pack` | **0** | 2 | [`13-nuxt-fixtures.txt`](./logs/13-nuxt-fixtures.txt) |
| 14 | `yarn release:api-diff --out docs/qa/release/2026-09-24-0a47569` | **0** | 4 | [`14-api-diff.txt`](./logs/14-api-diff.txt) |
| 15 | `yarn release:evidence --out docs/qa/release/2026-09-24-0a47569` | **0** | 3 | [`15-evidence.txt`](./logs/15-evidence.txt) |

**15 of 15 gates exit 0.**

## 3. Aggregate repository qualification

`yarn validate:all` is a chain of **50 links** at this commit (counted from `package.json`, never quoted from a document).

| Lane | Exit | Seconds |
|---|---|---|
| `yarn typecheck:all` | **0** | 24 |
| `yarn typecheck:tooling` | **0** | 2 |
| `yarn lint` | **0** | 37 |
| `yarn test` | **0** | 65 |
| `yarn build` | **0** | 22 |
| `yarn validate:all` | **0** | 78 |

**Locally qualified only.** A green local run is never CI, release or production
evidence. The maturity ladder is *specified → implemented → focused-validated →
aggregate-qualified → browser/AT-qualified → packaged → released*; this section
reaches the fourth rung and no higher, and none of the six published packages has
ever been built by CI on a clean checkout.

## 4. Browser / AT / security / performance experience qualification

| Lane | Artifact | Stamped | State |
|---|---|---|---|
| Capability matrix | `packages/core/docs/capability-matrix.json` | `312ab47` — **not HEAD** | 144 rows · 583 pass · 24 **stale** · 441 unrun · 17 excepted |
| Browser matrix | `e2e/matrix/browser-evidence.json` | `589be13` — **not HEAD** | 24/24 projects · 2112/2136 cells pass · 0 fail · worktree was **dirty (4 paths)** at capture |
| AT matrix | `e2e/at-matrix/index.json` | _run records, not a build_ | 534 cells · **0 executed** · 534 unrun |
| WCAG | `packages/core/docs/wcag-deviations.json` | TASK-N1-O3 (the audit) and TASK-R2-O5 (the browser re-measurement and the affordance that closed the three gaps) | SC 2.5.7 Dragging Movements (AA) · ceiling 0 · **0 open gap(s)** over 9 surface(s) |
| Security | `packages/core/security/security-deviations.json` | — | ceiling 0 · 0 deviation(s) |
| Security corpus | `packages/core/security/coverage.json` | `589be13` — **not HEAD** | worktree was **dirty** at capture |
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
| `@dzup-ui/contracts` | 0.1.0 | 63,168 | 50 | `b7b4e62e12a012d5…` |
| `@dzup-ui/core` | 0.2.0 | 740,898 | 1461 | `c5cccf27e6e93f89…` |
| `@dzup-ui/mcp` | 0.2.0 | 37,028 | 17 | `1ebfcd0418344c2e…` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 8,536 | 7 | `47781cafd01f32e7…` |
| `@dzup-ui/testing` | 0.1.0 | 58,346 | 34 | `21f4d5e509368c9e…` |
| `@dzup-ui/tokens` | 0.2.0 | 53,569 | 17 | `dfb00023e634d9de…` |

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
| `packages/nuxt/test` fixtures | packed-tarball Nuxt consumers | **exit 0** (2s) — the `core-pro` fixture stays **unrun** whatever the exit code: it needs `DZUP_PRO_TARBALL` from a Pro checkout |
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

**40 pending changeset(s).** Declared levels by package:

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

_Generated 2026-09-24T20:39:30.916Z by `yarn release:report` from `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c`._
