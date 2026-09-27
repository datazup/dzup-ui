# Release evidence ledger — `2026-09-21-527dbd1`

> # ⛔ SUPERSEDED AS A STATEMENT ABOUT THE CURRENT TREE — 2026-09-22
>
> **Every gate row below is a 2026-09-21 measurement of content that no longer
> exists. Do not read any `0` in §1 as a statement about this repository today.**
> The bundle is kept, unregenerated, as a point-in-time record (**D173**); this
> note is what stops it being read as a green light, which is the S1-F10 failure
> mode — *"the aggregate reported green over a stale artifact for three
> packets"* — in its most expensive form.
>
> Measured 2026-09-22 by the independent release-exit pass
> ([`../../../program-2026-09-04/reports/release-exit-verification-2026-09-22.md`](../../../program-2026-09-04/reports/release-exit-verification-2026-09-22.md),
> finding **S2**) and re-measured by the fix pass the same day:
>
> | What the bundle says | What is true on 2026-09-22 |
> |---|---|
> | §0 *"`527dbd1` **plus 221 uncommitted paths**"* | `527dbd1` **plus 304**. Two further packets (**TASK-R0-O1**, **TASK-R0-O2**) and this fix pass landed after the bundle was cut. |
> | `candidate-content-digest.json` — 3,581 files, digest `e1e44b4d…58ee5c` | **206 of the 3,581 digested files have changed and 1 is gone** (`apps/docs/scripts/report-size.mjs`). By area: `apps/docs/components` 140 · `packages/core/src` **19** · `packages/tooling/{scripts,src}` 12 · `packages/core/docs` 3 · `docs/qa/release` 3 · `apps/landing/src` 3 · `.github/workflows` 2 · `packages/contracts/src/props.types.ts` · `CLAUDE.md` · `package.json` · `eslint.config.js`. The digest describes nothing that exists. |
> | Gate row 8, `yarn validate:all` → **0** | The chain is now **50 links** (it was 48 when this bundle was cut) and **exits 1** at link 48, `validate:peers` → `validate:icon-duplicates`, on a real unwaived duplication (two versions of the icon library resolve). Red **by design** per TASK-R1-O6 — but row 8's `0` is not the current answer to the question row 8 asks. |
> | Gate row 4, `yarn test` → **0** | Not reproducible as recorded: the same command exited **1** on 2026-09-22 with 0 failed tests and 127 unhandled post-teardown errors (**S1**, D155/R1-O3-F4 recurring). Fixed 2026-09-22 at the defect in `apps/landing/src/pages/AnimationsPage.v2.spec.ts`; the bundle's `0` was nonetheless a different run of a different tree. |
> | `api-diff.json` / `api-diff.md` — "public surface of all published packages, classified against VERSIONING.md" | **Does not contain the one breaking change in the candidate.** TASK-R0-O2 removed `ariaInvalid` from `BaseAccessibilityProps` on 2026-09-22, *after* this file was written: `grep -c ariaInvalid api-diff.json` → **0**, while 66 components lost the prop. Any re-levelling read off this diff will be wrong. |
> | `hashes.json`, `sbom*`, `provenance.json` — per-tarball sha256/sha512 | Describe tarballs a rebuild would **not** reproduce: 19 `packages/core/src` files and `packages/contracts/src/props.types.ts` are published-package sources and all have changed. `validate:published-imports` now prints **two** `STALE` lines (contracts + core), not one. |
>
> **`admissible: false` was already true and remains the operative fact.** What
> changed is that the bundle is now inadmissible for a second, independent
> reason: not merely *dirty at capture*, but *superseded after capture*. It is
> evidence about 2026-09-21, and only that. A fresh bundle has to be cut from a
> clean tree before any publication decision rests on one — it was not
> regenerated here because regenerating rewrites evidence the owner has not yet
> reviewed, which is exactly what **D173(b)** declines to do.

> One candidate, one bundle, one row per gate. Companion to
> [`report.md`](./report.md), which carries the eight sections doc 08 §Required
> release report names. Produced by an agent with no authority to commit, tag,
> sign, publish, deploy or dispatch CI — and none of those was done.

## 0. The candidate is not a commit

| Fact | Value |
|---|---|
| Branch | `main` |
| `git rev-parse HEAD` | `527dbd150036b5f07bd69e672825ff14ec3a592d` |
| `git status --porcelain` | **221 entries** — required to be empty |
| Content actually measured | `527dbd1` **plus 221 uncommitted paths** |
| Content digest | `e1e44b4da647601fd43912219bba0dfca49b4f8c0270bf543d3a90746958ee5c` (3,581 files) |
| **Admissible** | **false** — worktree dirty: 221 path(s) differ from 527dbd1 |

## 1. Gates

| # | Gate | Commit | Exit | Seconds | Log |
|---|---|---|---|---|---|
| 1 | `yarn typecheck:all` | `527dbd1+221` | **0** | 67 | [`01-typecheck-all.txt`](./logs/01-typecheck-all.txt) |
| 2 | `yarn typecheck:tooling` | `527dbd1+221` | **0** | 6 | [`02-typecheck-tooling.txt`](./logs/02-typecheck-tooling.txt) |
| 3 | `yarn lint` | `527dbd1+221` | **0** | 78 | [`03-lint.txt`](./logs/03-lint.txt) |
| 4 | `yarn test` | `527dbd1+221` | **0** | 314 | [`04-test.txt`](./logs/04-test.txt) |
| 5 | `yarn test:contracts` | `527dbd1+221` | **0** | 67 | [`05-test-contracts.txt`](./logs/05-test-contracts.txt) |
| 6 | `yarn test:a11y` | `527dbd1+221` | **0** | 13 | [`06-test-a11y.txt`](./logs/06-test-a11y.txt) |
| 7 | `yarn build` | `527dbd1+221` | **0** | 81 | [`07-build.txt`](./logs/07-build.txt) |
| 8 | `yarn validate:all` | `527dbd1+221` | **0** | 552 | [`08-validate-all.txt`](./logs/08-validate-all.txt) |
| 9 | `bash scripts/release-checks/dist-artifacts.sh` | `527dbd1+221` | **0** | 0 | [`09-dist-artifacts.txt`](./logs/09-dist-artifacts.txt) |
| 10 | `bash scripts/release-checks/esm-only.sh` | `527dbd1+221` | **0** | 0 | [`10-esm-only.txt`](./logs/10-esm-only.txt) |
| 11 | `yarn validate:published-imports --built` | `527dbd1+221` | **0** | 17 | [`11-published-imports.txt`](./logs/11-published-imports.txt) |
| 12 | `yarn release:api-diff --out docs/qa/release/2026-09-21-527dbd1` | `527dbd1+221` | **0** | 16 | [`12-api-diff.txt`](./logs/12-api-diff.txt) |
| 13 | `yarn release:evidence --out docs/qa/release/2026-09-21-527dbd1` | `527dbd1+221` | **0** | 13 | [`13-evidence.txt`](./logs/13-evidence.txt) |

Every row reads `527dbd1+221` — the commit plus the uncommitted delta.
**No row claims to be bound to a commit, because none is.**

## 2. Artifacts

| Artifact | Present | What it records |
|---|---|---|
| [`report.md`](./report.md) | yes | doc 08's eight release-report sections |
| [`api-diff.md`](./api-diff.md) / `.json` | yes | public surface of all published packages, classified against VERSIONING.md |
| [`supply-chain.md`](./supply-chain.md) / `.json` | yes | licences, vulnerabilities, provenance summary |
| [`sbom.cdx.json`](./sbom.cdx.json) + `sbom/` | yes | CycloneDX 1.6, one per tarball plus an aggregate |
| [`hashes.json`](./hashes.json) | yes | sha256 + sha512 per tarball and per file inside it |
| [`provenance.json`](./provenance.json) | yes | in-toto v1 / SLSA v1 statements, **unsigned**, trusted publishing **not exercised** |
| [`candidate-content-digest.json`](./candidate-content-digest.json) | yes | every file behind the digest above |
| `logs/` | yes | one `.txt` per gate |

> **The logs are `.txt`, not `.log`, on purpose.** `.gitignore:42` is `*.log`, so a
> bundle that wrote `logs/*.log` could never be committed — the per-gate evidence
> the ledger rests on would vanish at `git add`. Pro's bundle hit exactly this
> (its finding **E-6**, 50 ignored logs); OSS avoids it by extension rather than by
> editing `.gitignore`.
