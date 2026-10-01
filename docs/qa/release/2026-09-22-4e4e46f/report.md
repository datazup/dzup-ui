# Release report — `@dzup-ui/*` candidate `2026-09-22-4e4e46f`

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
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain` | **208 entries** — required to be empty |
| Position vs `origin/main` | 0 ahead, 0 behind |
| Release tags in the repository | **0 — no release tag has ever existed** |
| Content actually measured | `4e4e46f` **plus 208 uncommitted paths** |
| Content digest of what was measured | `8b77d79224dfae2e751c0b6252bd6e43a095ccd5783c3a4c3ac74e8c128626ef` |
| Files behind that digest | 3,683 (55,269,786 bytes) |
| **Admissible as release evidence** | **false** — worktree dirty: 208 path(s) differ from 4e4e46f |

The digest is a sha256 over `<path>\0<sha256(file)>\n` for every tracked and
untracked-not-ignored file, sorted by path; it is recomputable from
[`candidate-content-digest.json`](./candidate-content-digest.json), which lists
every file and its hash. **It is not a commit id and it confers no
reviewability.** It exists so that this bundle names *exactly* what was
measured, which is the one thing the label `4e4e46f` cannot do here.

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

**No gate record.** `results.jsonl` is absent from this bundle, which means
`yarn rehearse:release` has not been run into it. Section 2 and section 3 are
therefore *unrun*, not green — a report that omitted them would be claiming a
pass it has no record of.

## 3. Aggregate repository qualification

`yarn validate:all` is a chain of **52 links** at this commit (counted from `package.json`, never quoted from a document).

No aggregate lane was recorded in this bundle. See section 2.

**Locally qualified only.** A green local run is never CI, release or production
evidence. The maturity ladder is *specified → implemented → focused-validated →
aggregate-qualified → browser/AT-qualified → packaged → released*; this section
reaches the fourth rung and no higher, and none of the six published packages has
ever been built by CI on a clean checkout.

## 4. Browser / AT / security / performance experience qualification

| Lane | Artifact | Stamped | State |
|---|---|---|---|
| Capability matrix | `packages/core/docs/capability-matrix.json` | `4e4e46f` (= HEAD) | 144 rows · 585 pass · 22 **stale** · 400 unrun · 47 excepted |
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
| `@dzup-ui/contracts` | 0.1.0 | 77,158 | 53 | `fb8af5987b772440…` |
| `@dzup-ui/core` | 0.2.0 | 742,742 | 1461 | `55cac9322680d1b1…` |
| `@dzup-ui/mcp` | 0.2.0 | 35,891 | 17 | `5b71844808ca1dc7…` |
| `@dzup-ui/nuxt` | 0.1.0-alpha.0 | 11,888 | 7 | `d2327a97589e69cb…` |
| `@dzup-ui/testing` | 0.1.0 | 58,346 | 34 | `5b5b4d3677d5a199…` |
| `@dzup-ui/tokens` | 0.2.0 | 53,584 | 17 | `bb6728c9c2ef5653…` |

Full digests (sha256 **and** sha512, per tarball and per file inside it):
[`hashes.json`](./hashes.json). SBOMs: [`sbom.cdx.json`](./sbom.cdx.json)
(aggregate, CycloneDX 1.6) and `sbom/<package>.cdx.json`. Supply chain:
[`supply-chain.md`](./supply-chain.md).

Consumer-truth import gate (`validate:published-imports`, TASK-R1-O2): _not recorded in this bundle_.

### Package qualification matrix (doc 08 §Package qualification)

**9 green · 2 red · 1 blocked** across 12 rows, stamped `4e4e46f` (= HEAD).

| # | Row | Core only | Second tier |
|---|---|---|---|
| 1 | ESM import and declarations resolve from the tarball | **green** — `yarn validate:published-imports` exit 0 — every declared export subpath imports from the packed artifact and its types condition compiles | blocked |
| 2 | Vite production build of a consumer app | **green** — production build from the packed tarball succeeded (66998 B emitted, CSS present) | blocked |
| 3 | Nuxt SSR and auto-import | **green** — cited — covered by `yarn test:nuxt-fixtures` — 7 fixtures staged outside the repo from `yarn pack` output and installed with npm; core-only (auto-import) and ssr-hydration own this row | blocked |
| 4 | Resolver ownership | **blocked** — first-tier half green (validate:ownership); the PACKED second-tier half is unrun — the core-pro fixture needs DZUP_PRO_TARBALL, and @dzup-ui-pro/pro does not resolve here · `yarn validate:ownership` exit 0 | blocked |
| 5 | CSS and token import order | **green** — cited — covered twice over: the nuxt css-order fixture and `yarn test:e2e:layer-order`, which pulls dist/tokens.css and dist/core.css out of the .tgz and asserts the cascade order in a browser | blocked |
| 6 | Individual-component tree-shaking, optional engine measured separately | **green** — 4 components built from the tarball; no sentinel survived; engine (reka-ui) measured separately per component | blocked |
| 7 | Minimum and current Vue/Reka peer versions | **green** — 5 peer(s) across 6 packed manifests: every floor explicit, no split floor, every installed version at or above its floor | blocked |
| 8 | Optional peer absent / incompatible / installed | **green** — all three lanes behaved as documented (reka-ui is a REQUIRED peer — no peerDependenciesMeta.optional is declared — so absent and incompatible are both fail-closed) | blocked |
| 9 | CSP and Trusted Types consumer fixture | **RED** — CSP half green (cited: e2e/csp); Trusted-Types half RED — 1 governed sink(s) in packed bytes and no policy is created anywhere, so a consumer setting require-trusted-types-for 'script' would throw | blocked |
| 10 | Licence and entitlement failure behaviour | **RED** — @dzup-ui/mcp ships no LICENSE file in its tarball | blocked |
| 11 | Tarball file / export / API diff | **green** — 6 tarballs diffed against the reviewed build: no missing entry point, no test/fixture leakage, no divergence from the build. 15 shipped file(s) are not named by any exports condition — reported as inventory, see detail.diffs[].unreferenced | blocked |
| 12 | SBOM, vulnerability/licence report, provenance and artifact hash | **green** — SBOM + licence + hash + provenance artifacts generated for this candidate (6 tarballs, 143 distinct deps, 0 blocked). advisory query status "mixed" — a count of zero is NOT claimed for packages that were not queried; 20 advisory row(s) present and untriaged — no severity threshold is configured (D154); provenance is UNSIGNED — signing needs CI identity and registry authority: [!owner] | blocked |

Full report: [`package-qualification.md`](./package-qualification.md).
Every blocked cell names its reason; a blocked cell is not a pass and is not a
failure of this repository — it is a measurement that could not be taken.

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

### Release stop conditions (doc 08 §Release stop conditions)

doc 08 prints **nine** bullets; its first is compound and names three independent
failures, so the gate enumerates **eleven** conditions. At this candidate:
**5 clear · 4 FIRED · 1 unevaluable · 1 unattested**.

| # | Condition (doc 08 wording) | Mode | Verdict | What revealed it |
|---|---|---|---|---|
| 1 | dirty/unidentified source | machine | **FIRED** | 208 uncommitted path(s); the candidate is 4e4e46f+208, which is not a commit anyone can check out |
| 2 | generated drift | machine | **clear** | 4 governed artifact(s) bound (1 declared input(s) modified in the working tree — SC-1's question, not this one) |
| 3 | evidence bound to a different commit/configuration | machine | **FIRED** | 5 artifact(s) in the candidate are bound to something other than this commit/configuration |
| 4 | wrong or unresolved Core/Pro package ownership | machine | **clear** | 1338 symbol(s), every one owned by a workspace package (29 carry kind `unclassified`, which is a stability CLASS, not an ownership question — ceiling-held by validate:ownership); no second-tier manifest is installed, so nothing claims second-tier ownership |
| 5 | unexplained public API diff or manifest omissions | machine | **FIRED** | 11 unexplained API finding(s) |
| 6 | required validator cannot start on the declared runtime | machine | **clear** | Node 24.14.1 satisfies `^20.19.0 \|\| >=22.13.0`; every validate:* lane resolves to a file that exists |
| 7 | threshold/budget is raised without a reviewed product justification | machine | **UNEVALUABLE** | the previous candidate `2026-09-21-527dbd1` records no ratchets.json, so its ceiling values are unknown and no comparison is possible |
| 8 | sanitizer/decoder/optional-peer path fails open | machine | **FIRED** | 1 governed fail-closed row(s) are not green |
| 9 | browser/AT/RTL/SSR evidence is missing for a changed high-risk component | machine | **clear** | no component under packages/core/src/components changed in this candidate, so no component owes new browser/AT/RTL/SSR evidence |
| 10 | tarball differs from the reviewed build or has undeclared files/entry points | machine | **clear** | 6 tarball(s) digested; row 11 green — no undeclared file or entry point |
| 11 | credentials, registry mutation, publication, signing, deployment, entitlement, or production action lacks explicit authority | attested | **UNATTESTED** | awaiting an owner signature. The repository can observe that an action did NOT happen (0 release tags, provenance.json stamped unsigned, no npm publish record). It cannot observe whether an action that DID happen was authorised -- authority lives in a person, not in a file. doc 08 lists it as a stop condition precisely because a tool cannot close it. An agent may never sign this row. |

`unevaluable` is a **red**, not a pass: a gate that cannot see a condition must
not report one. `unattested` is a condition no tool can decide, awaiting an
owner's signature — an agent may never sign it.

### Attested rows the owner must sign for this candidate (1)

| # | Statement | Signed by | Date | Decision |
|---|---|---|---|---|
| 11 | No credential was used, no registry was mutated, nothing was published, signed, deployed or promoted, no entitlement was changed and no production action was taken without explicit authority from the release owner. | _(empty)_ | _(empty)_ | _(empty)_ |

Template: [`../attestations.template.json`](../attestations.template.json).
Copy it to `attestations.json` beside this report and sign it. The emptiness
above is a recorded fact, not an absent section.

### Stop conditions reported by `release:api-diff`

| Code | Detail |
|---|---|
| `dirty-source` | worktree dirty: 201 path(s) differ from 4e4e46f. doc 08: "dirty/unidentified source, generated drift, or evidence bound to a different commit/configuration". |
| `unexplained-api-diff` | @dzup-ui/core: `yarn generate:exports` would DROP 5 barrel line(s) — every symbol behind them leaves the public surface. Breaking under VERSIONING.md §2.1, requiring a `minor`, performed by a generator with no changeset behind it: export * from './composables/useAffix/index.ts' / export * from './composables/useCalendar/index.ts' / export * from './composables/useInfiniteScroll/index.ts' / export * from './composables/useScrollSpy/index.ts' / export * from './composables/useScrollToTop/index.ts'. Owner decision, routed to TASK-R0-O1. |
| `manifest-omission` | @dzup-ui/core: `yarn generate:exports` would ADD 2 barrel line(s) the manifest declares and the barrel does not have: export * from './composables/useCountdown/index.ts' / export * from './composables/useIntersection/index.ts'. |
| `manifest-omission` | @dzup-ui/core: 455 symbol(s) reach a consumer through the root barrel and are absent from public-api.manifest.json's documented name lists. Not a generator action (the barrel star-re-exports); a stale document other tooling has already been moved off (TASK-N2-A1). |
| `manifest-omission` | @dzup-ui/core: 6 symbol(s) are promised by public-api.manifest.json and absent from the packed build. |

### Deprecations standing in the public surface

**16 `@deprecated` symbol(s)** in package sources — 
**16 with a record, 0 without.**

| Fact | Value |
|---|---|
| Records in `packages/contracts/deprecations.json` | 16 |
| Annotated with no record (doc 06 violation) | **0** |
| Carrying written instructions instead of a codemod | 4 |
| Without a dev-mode runtime warning (each with a recorded reason) | 5 |
| Schema/policy violations | 0 |

doc 06 §"API compatibility and deprecation" requires a runtime development
warning *when practical*, a typed annotation, docs, a replacement example, a
codemod or adapter where feasible, the first-deprecated and earliest-removal
versions, and a rollback path. `yarn validate:deprecations` is the gate;
`packages/contracts/deprecations.json` is the ledger, and VERSIONING.md §4 is
the policy it enforces.

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

**39 pending changeset(s).** Declared levels by package:

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

_Generated 2026-09-23T08:20:58.069Z by `yarn release:report` from `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`._
