# Release evidence ledger — `2026-09-22-4e4e46f`

> One candidate, one bundle, one row per gate. Companion to
> [`report.md`](./report.md), which carries the eight sections doc 08 §Required
> release report names. Produced by an agent with no authority to commit, tag,
> sign, publish, deploy or dispatch CI — and none of those was done.

## 0. The candidate is not a commit

| Fact | Value |
|---|---|
| Branch | `main` |
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain` | **208 entries** — required to be empty |
| Content actually measured | `4e4e46f` **plus 208 uncommitted paths** |
| Content digest | `8b77d79224dfae2e751c0b6252bd6e43a095ccd5783c3a4c3ac74e8c128626ef` (3,683 files) |
| **Admissible** | **false** — worktree dirty: 208 path(s) differ from 4e4e46f |

## 1. Gates

**No gate record in this bundle.** `results.jsonl` is absent — `yarn rehearse:release` has not been run into it.

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
| `logs/` | **no** | one `.txt` per gate |

> **The logs are `.txt`, not `.log`, on purpose.** `.gitignore:42` is `*.log`, so a
> bundle that wrote `logs/*.log` could never be committed — the per-gate evidence
> the ledger rests on would vanish at `git add`. Pro's bundle hit exactly this
> (its finding **E-6**, 50 ignored logs); OSS avoids it by extension rather than by
> editing `.gitignore`.
