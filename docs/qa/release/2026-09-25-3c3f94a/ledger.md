# Release evidence ledger — `2026-09-25-3c3f94a`

> One candidate, one bundle, one row per gate. Companion to
> [`report.md`](./report.md), which carries the eight sections doc 08 §Required
> release report names. Produced by an agent with no authority to commit, tag,
> sign, publish, deploy or dispatch CI — and none of those was done.

## 0. The candidate is not a commit

| Fact | Value |
|---|---|
| Branch | `chore/release-decisions-20260925` |
| `git rev-parse HEAD` | `3c3f94a836f9a1fbbbc8da16a10e9e4fcd40c477` |
| `git status --porcelain` | **0 entries** — required to be empty |
| Content actually measured | `3c3f94a` **plus 0 uncommitted paths** |
| Content digest | `4fed440d4a09de20d1eaa419a4f712da0ee3c284e9eeb4d4f68c760b9803927e` (3,683 files) |
| **Admissible** | **true** |

## 1. Gates

| # | Gate | Commit | Exit | Seconds | Log |
|---|---|---|---|---|---|
| 1 | `yarn typecheck:all` | `3c3f94a+0` | **0** | 24 | [`01-typecheck-all.txt`](./logs/01-typecheck-all.txt) |
| 2 | `yarn typecheck:tooling` | `3c3f94a+0` | **0** | 2 | [`02-typecheck-tooling.txt`](./logs/02-typecheck-tooling.txt) |
| 3 | `yarn lint` | `3c3f94a+0` | **0** | 29 | [`03-lint.txt`](./logs/03-lint.txt) |
| 4 | `yarn test` | `3c3f94a+0` | **0** | 38 | [`04-test.txt`](./logs/04-test.txt) |
| 5 | `yarn test:contracts` | `3c3f94a+0` | **0** | 8 | [`05-test-contracts.txt`](./logs/05-test-contracts.txt) |
| 6 | `yarn test:a11y` | `3c3f94a+0` | **0** | 2 | [`06-test-a11y.txt`](./logs/06-test-a11y.txt) |
| 7 | `yarn build` | `3c3f94a+0` | **0** | 21 | [`07-build.txt`](./logs/07-build.txt) |
| 8 | `yarn validate:all` | `3c3f94a+0` | **0** | 77 | [`08-validate-all.txt`](./logs/08-validate-all.txt) |
| 9 | `bash scripts/release-checks/dist-artifacts.sh` | `3c3f94a+0` | **0** | 0 | [`09-dist-artifacts.txt`](./logs/09-dist-artifacts.txt) |
| 10 | `bash scripts/release-checks/esm-only.sh` | `3c3f94a+0` | **0** | 0 | [`10-esm-only.txt`](./logs/10-esm-only.txt) |
| 11 | `yarn validate:published-imports --built` | `3c3f94a+0` | **0** | 4 | [`11-published-imports.txt`](./logs/11-published-imports.txt) |
| 12 | `yarn test:nuxt-fixtures:pack` | `3c3f94a+0` | **0** | 1 | [`12-nuxt-fixtures.txt`](./logs/12-nuxt-fixtures.txt) |
| 13 | `yarn release:api-diff --out docs/qa/release/2026-09-25-3c3f94a` | `3c3f94a+0` | **0** | 4 | [`13-api-diff.txt`](./logs/13-api-diff.txt) |
| 14 | `yarn release:evidence --out docs/qa/release/2026-09-25-3c3f94a` | `3c3f94a+0` | **0** | 3 | [`14-evidence.txt`](./logs/14-evidence.txt) |

Every row reads `3c3f94a+0` — the commit plus the uncommitted delta.
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
