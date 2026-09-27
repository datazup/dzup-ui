# Release report — `@dzup-ui/*` candidate `2026-09-25-3c3f94a`

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
| Branch | `chore/release-decisions-20260925` |
| `git rev-parse HEAD` | `3c3f94a836f9a1fbbbc8da16a10e9e4fcd40c477` |
| `git status --porcelain` | **0 entries** — required to be empty |
| Release tags in the repository | **0 — no release tag has ever existed** |
| Content actually measured | `3c3f94a` **plus 0 uncommitted paths** |
| Content digest of what was measured | `4fed440d4a09de20d1eaa419a4f712da0ee3c284e9eeb4d4f68c760b9803927e` |
| Files behind that digest | 3,683 (57,602,718 bytes) |
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
| 1 | `yarn typecheck:all` | **0** | 24 | [`01-typecheck-all.txt`](./logs/01-typecheck-all.txt) |
| 2 | `yarn typecheck:tooling` | **0** | 2 | [`02-typecheck-tooling.txt`](./logs/02-typecheck-tooling.txt) |
| 3 | `yarn lint` | **0** | 29 | [`03-lint.txt`](./logs/03-lint.txt) |
| 4 | `yarn test` | **0** | 38 | [`04-test.txt`](./logs/04-test.txt) |
| 5 | `yarn test:contracts` | **0** | 8 | [`05-test-contracts.txt`](./logs/05-test-contracts.txt) |
| 6 | `yarn test:a11y` | **0** | 2 | [`06-test-a11y.txt`](./logs/06-test-a11y.txt) |
| 7 | `yarn build` | **0** | 21 | [`07-build.txt`](./logs/07-build.txt) |
| 8 | `yarn validate:all` | **0** | 77 | [`08-validate-all.txt`](./logs/08-validate-all.txt) |
| 9 | `bash scripts/release-checks/dist-artifacts.sh` | **0** | 0 | [`09-dist-artifacts.txt`](./logs/09-dist-artifacts.txt) |
| 10 | `bash scripts/release-checks/esm-only.sh` | **0** | 0 | [`10-esm-only.txt`](./logs/10-esm-only.txt) |
| 11 | `yarn validate:published-imports --built` | **0** | 4 | [`11-published-imports.txt`](./logs/11-published-imports.txt) |
| 12 | `yarn test:nuxt-fixtures:pack` | **0** | 1 | [`12-nuxt-fixtures.txt`](./logs/12-nuxt-fixtures.txt) |
| 13 | `yarn release:api-diff --out docs/qa/release/2026-09-25-3c3f94a` | **0** | 4 | [`13-api-diff.txt`](./logs/13-api-diff.txt) |
| 14 | `yarn release:evidence --out docs/qa/release/2026-09-25-3c3f94a` | **0** | 3 | [`14-evidence.txt`](./logs/14-evidence.txt) |

**14 of 14 gates exit 0.**

## 3. Aggregate repository qualification

`yarn validate:all` is a chain of **50 links** at this commit (counted from `package.json`, never quoted from a document).

| Lane | Exit | Seconds |
|---|---|---|
| `yarn typecheck:all` | **0** | 24 |
| `yarn typecheck:tooling` | **0** | 2 |
| `yarn lint` | **0** | 29 |
| `yarn test` | **0** | 38 |
| `yarn build` | **0** | 21 |
| `yarn validate:all` | **0** | 77 |

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
| `@dzup-ui/contracts` | 0.1.0 | 63,231 | 50 | `57cae4de32a72875…` |
| `@dzup-ui/core` | 0.2.0 | 740,945 | 1461 | `217a51a52dde641a…` |
| `@dzup-ui/mcp` | 0.2.0 | 37,028 | 17 | `1ebfcd0418344c2e…` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 8,585 | 7 | `ddaaf61719a1cd53…` |
| `@dzup-ui/testing` | 0.1.0 | 58,389 | 34 | `b03144b88b77e502…` |
| `@dzup-ui/tokens` | 0.2.0 | 53,620 | 17 | `fd056a74632175f3…` |

Full digests (sha256 **and** sha512, per tarball and per file inside it):
[`hashes.json`](./hashes.json). SBOMs: [`sbom.cdx.json`](./sbom.cdx.json)
(aggregate, CycloneDX 1.6) and `sbom/<package>.cdx.json`. Supply chain:
[`supply-chain.md`](./supply-chain.md).

Consumer-truth import gate (`validate:published-imports`, TASK-R1-O2): **exit 0** — every declared subpath of every published package loads under plain Node from the extracted tarball.

### API diff

| Package | Baseline (fidelity) | Added | Removed | Changed | Level required | Changeset declares |
|---|---|---|---|---|---|---|
| `@dzup-ui/contracts` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/core` | public-api.manifest.json@worktree (manifest-only) | 436 | 0 | 0 | **patch** | minor |
| `@dzup-ui/mcp` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |
| `@dzup-ui/nuxt` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/testing` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | minor |
| `@dzup-ui/tokens` | no published version, no snapshot, no manifest (none) | 0 | 0 | 0 | **none** | patch |

The level column is **`minor` for breaking and `patch` for additive** — the 0.x
mapping in `packages/contracts/VERSIONING.md` §1, not the 1.x one. `major` is
refused by `validate:release-policy` while `allowMajor` is false, because a
`major` bump *is* the 1.0 release.

**`generate:exports` drift on `@dzup-ui/core`** — none: a regenerated barrel would neither drop nor add an export line.

**Manifest reconciliation on `@dzup-ui/core`** — the manifest declares version `0.0.1` while the package is `0.2.0`:

- **436** symbol(s) reach a consumer through the root barrel and are absent from the manifest's documented name lists
- **0** symbol(s) the manifest promises and the packed build does not deliver

  A **different** finding from the drift above: the generated barrel
  star-re-exports each family index, so those name lists are documentation a
  star re-export never consults. This measures how stale the document is —
  the same defect TASK-N2-A1 found ("stale by 43 public components"), which is
  why `generate:component-meta` was moved onto the ownership manifest instead.

## 6. Downstream canary / adoption evidence

| Consumer | Kind | State |
|---|---|---|
| `packages/nuxt/test` fixtures | packed-tarball Nuxt consumers | **exit 0** (1s) — the `core-pro` fixture stays **unrun** whatever the exit code: it needs `DZUP_PRO_TARBALL` from a Pro checkout |
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
| `manifest-omission` | @dzup-ui/core: 436 symbol(s) reach a consumer through the root barrel and are absent from public-api.manifest.json's documented name lists. Not a generator action (the barrel star-re-exports); a stale document other tooling has already been moved off (TASK-N2-A1). |

### Accepted exceptions

**Licence exceptions: 0** (`packages/tooling/scripts/licence-exceptions.json`).
The file is empty because the measurement found nothing to except, not as a placeholder.

### Rollback

Policy: [`docs/release/rollback.md`](../../../release/rollback.md) — fix forward with
`npm deprecate` plus a superseding patch, move `latest` back with `npm dist-tag`
if needed, unpublish only for a leaked secret inside npm's 72 h window. The
`@dzup-ui` npm-scope owner acts.

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

1. **Clear the stop conditions above** before publishing (TASK-R0-O1).
2. **TASK-R0-O1** — the publish-or-freeze decision: the operator merges the release
   PR, or holds it. Nothing in this bundle publishes.
3. **TASK-R2-O2** — the AT matrix: section 4 records the executed count, and it is
   the lane with the least evidence per unit of claim.

---

_Generated 2026-09-25T06:44:39.555Z by `yarn release:report` from `3c3f94a836f9a1fbbbc8da16a10e9e4fcd40c477`._
