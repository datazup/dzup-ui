# Release evidence ledger — `2026-09-24-0a47569`

> One candidate, one bundle, one row per gate. Companion to
> [`report.md`](./report.md), which carries the eight sections doc 08 §Required
> release report names. Produced by an agent with no authority to commit, tag,
> sign, publish, deploy or dispatch CI — and none of those was done.

## 0. The candidate is not a commit

| Fact | Value |
|---|---|
| Branch | `release-evidence-20260924` |
| `git rev-parse HEAD` | `0a47569ece7f5a1c41f05e2eb8fcb3281256ee8c` |
| `git status --porcelain` | **0 entries** — required to be empty |
| Content actually measured | `0a47569` **plus 0 uncommitted paths** |
| Content digest | `2269125b3eb01fca98d7c80cd6db9900631ef2e21980a249a532eb012aa9ef6b` (3,647 files) |
| **Admissible** | **true** |

## 1. Gates

| # | Gate | Commit | Exit | Seconds | Log |
|---|---|---|---|---|---|
| 1 | `yarn install --immutable` | `0a47569+0` | **0** | 3 | [`01-install-immutable.txt`](./logs/01-install-immutable.txt) |
| 2 | `yarn typecheck:all` | `0a47569+0` | **0** | 24 | [`02-typecheck-all.txt`](./logs/02-typecheck-all.txt) |
| 3 | `yarn typecheck:tooling` | `0a47569+0` | **0** | 2 | [`03-typecheck-tooling.txt`](./logs/03-typecheck-tooling.txt) |
| 4 | `yarn lint` | `0a47569+0` | **0** | 37 | [`04-lint.txt`](./logs/04-lint.txt) |
| 5 | `yarn test` | `0a47569+0` | **0** | 65 | [`05-test.txt`](./logs/05-test.txt) |
| 6 | `yarn test:contracts` | `0a47569+0` | **0** | 12 | [`06-test-contracts.txt`](./logs/06-test-contracts.txt) |
| 7 | `yarn test:a11y` | `0a47569+0` | **0** | 2 | [`07-test-a11y.txt`](./logs/07-test-a11y.txt) |
| 8 | `yarn build` | `0a47569+0` | **0** | 22 | [`08-build.txt`](./logs/08-build.txt) |
| 9 | `yarn validate:all` | `0a47569+0` | **0** | 78 | [`09-validate-all.txt`](./logs/09-validate-all.txt) |
| 10 | `bash scripts/release-checks/dist-artifacts.sh` | `0a47569+0` | **0** | 0 | [`10-dist-artifacts.txt`](./logs/10-dist-artifacts.txt) |
| 11 | `bash scripts/release-checks/esm-only.sh` | `0a47569+0` | **0** | 0 | [`11-esm-only.txt`](./logs/11-esm-only.txt) |
| 12 | `yarn validate:published-imports --built` | `0a47569+0` | **0** | 3 | [`12-published-imports.txt`](./logs/12-published-imports.txt) |
| 13 | `yarn test:nuxt-fixtures:pack` | `0a47569+0` | **0** | 2 | [`13-nuxt-fixtures.txt`](./logs/13-nuxt-fixtures.txt) |
| 14 | `yarn release:api-diff --out docs/qa/release/2026-09-24-0a47569` | `0a47569+0` | **0** | 4 | [`14-api-diff.txt`](./logs/14-api-diff.txt) |
| 15 | `yarn release:evidence --out docs/qa/release/2026-09-24-0a47569` | `0a47569+0` | **0** | 3 | [`15-evidence.txt`](./logs/15-evidence.txt) |

Every row reads `0a47569+0` — the commit plus the uncommitted delta.
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
