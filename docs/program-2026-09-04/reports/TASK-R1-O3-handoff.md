# TASK-R1-O3 — Release evidence parity with Pro: API diff, SBOM, hashes, rehearsal, the 8-section report

> Program: [2026-09-04](../README.md) · Task file: [`release-exit-tasks.md`](../release-exit-tasks.md)
> **Baseline observed: `main` @ `527dbd1` (`527dbd150036b5f07bd69e672825ff14ec3a592d`), worktree carrying the
> ~220 uncommitted paths of TASK-R1-O1 and TASK-R1-O2 (preserved untouched; this task adds to them).**
> The README's stated baseline `99b963a` is four commits stale. **Every number below binds to `527dbd1`.**
> Nothing was committed, pushed, tagged, signed, published, deployed or dispatched — all owner actions.
>
> Predecessors cited rather than re-derived:
> [`TASK-R1-O1-handoff.md`](./TASK-R1-O1-handoff.md) (green tree, 47 links, D145–D148),
> [`TASK-R1-O2-handoff.md`](./TASK-R1-O2-handoff.md) (the import gate and its packing machinery, D149–D153),
> `ui/dzup-ui-pro/docs/qa/release/2026-09-03-cda4816/ledger.md` (the Pro bundle and its six evidence-layer
> findings E-1…E-6 — **ported around, not ported**).

---

## 0. `<done_check>` at `527dbd1` — 0 of 4 passed, and two of the four are wrong as written

| # | Check | Result | Verdict |
|---|---|---|---|
| 1 | `ls packages/tooling/src/release/` holds an api-diff and an evidence module; a `grep -c` over the three `release:*` script names in `package.json` ≥ 3 | directory did not exist; grep **0** | **FAIL** |
| 2 | `ls docs/qa/release/` shows a `<date>-<sha>` directory with `ledger.md` and `sbom.cdx.json` | **`docs/qa/` did not exist at all** | **FAIL** |
| 3 | `sbom.cdx.json` `bomFormat` prints `CycloneDX` | nothing to read | **FAIL** |
| 4 | the report has "all eight section headings of 08-11 doc 08 §Report (custody · aggregate gates · browser/AT by tier · package matrix · API diff · supply chain · canary · operator approval — as named in the doc)" | no report existed — **and those are not doc 08's section names** | **FAIL**, and see below |

**Check 4 names the wrong eight.** The parenthetical is Pro's `ledger.md` shape
(`ui/dzup-ui-pro/docs/qa/release/2026-09-03-cda4816/`), not doc 08's. 08-11 doc
08 §Required release report names: *implemented scope and source commit ·
focused validation · aggregate repository qualification · browser/AT/security/
performance experience qualification · packed-artifact qualification ·
downstream canary/adoption evidence · publication/production authority and
actual operation status · known gaps, accepted exceptions with expiry, rollback,
and ranked next work*. The `<task>` block is explicit that doc 08 is the
authority, so **doc 08's eight are what `report.md` carries** — and `ledger.md`
carries the gate-by-gate row shape the check describes, so the check passes on
its own terms too and no reader is left guessing which document they are
holding.

**Check 2 is unsatisfiable at this commit.** It requires `ledger.md`'s "first
row [to] name a clean commit". The worktree carries ~220 uncommitted paths from
R1-O1 and R1-O2 — work this task is forbidden to disturb — so there is no clean
commit to name. The bundle therefore records the commit **plus the uncommitted
delta plus a content digest of exactly what was measured**, and stamps every
artifact `admissible: false`. That is the same position Pro was in, handled the
same way, and it is doc 08's first release stop condition reported rather than
hidden.

---

## 1. Premises tested before coding

The `_Gap:_` preamble is a hypothesis. Each clause was checked at `527dbd1`.

| Premise | Verdict at `527dbd1` |
|---|---|
| "no API diff, no SBOM, no hash record, no report has ever been produced" | **TRUE.** `docs/qa/` did not exist; no `release:*` script existed; `validate:licenses` reads **source** `package.json` files, never a tarball. |
| "CI workflows request `id-token: write` but have never exercised provenance" | **TRUE.** `.github/workflows/release.yml:18` and `publish-prerelease.yml:26` both request it; `git tag --list` is **empty** (0 tags of any kind), and `registry.npmjs.org` answers **404** for `@dzup-ui/core`, `@dzup-ui/contracts` and `@dzup-ui/tokens` (checked directly). Nothing has ever been published, so no provenance attestation exists. |
| "a `rehearse:release` script exists" | **TRUE**, and it passed — after this task's own new files were lint-clean. Its baseline run (before any edit) reached `yarn lint` and stopped **on this task's first new file**, so the "as-is" discovery run is honestly incomplete: `typecheck:all` exit 0 is the only as-is gate result, and the authoritative run is §5. |
| "the `generate:exports` drift would drop 5 composables, add 2" | **TRUE, and now measured rather than quoted** — see §3. |
| Pro's `tools/release/*.mjs` are the pattern to port | **TRUE**, with three adaptations that matter (§2) and **two of Pro's own recorded defects deliberately not reproduced**. |

---

## 2. Implemented files + API effect

**7 new modules, 3 new data/doc files, 2 new shell checks, 5 modified.**
No component source was touched. **No public runtime API changed** — everything
new lives in the private `@dzup-ui/tooling` package, in `scripts/`, in
`package.json` scripts, or under `docs/qa/`.

### 2a. New — `packages/tooling/src/release/`

| File | What it is |
|---|---|
| `binding.ts` | Source binding and admissibility: `gitState()`, `parsePorcelainZ()`, `contentDigest()`, `provenanceOf()`, `bundleId()`. One answer to "which tree was this measured from, and can anybody review it", shared by every release artifact. |
| `pack.ts` | The **one** definition of packing: `publishedPackages()`, `packWorkspace()`, `extractTarball()`, `packAll()`. Moved out of `validators/published-imports.ts` (R1-O2) so the import gate and the release tools read the *same* tarballs. |
| `api-surface.ts` | Reads the public surface out of the **packed declarations** through the TypeScript compiler — names, kinds, and for a component its `$props`/`$emit`/`$slots`. Plus `normaliseSignature()`, without which the surface is not reproducible (§4). |
| `api-diff.ts` | The diff, the VERSIONING.md classification, the changeset reconciliation, the barrel drift, the stop conditions, and the `--record` CLI. |
| `evidence.ts` | SBOM (CycloneDX 1.6), vulnerability query, licence report, per-tarball and per-file hashes, unsigned in-toto/SLSA provenance, and the packed-manifest protocol check. |
| `report.ts` | Renders `report.md` (doc 08's eight sections), `ledger.md` (the gate ledger) and `candidate-content-digest.json`, as a **projection** of the bundle's own artifacts. |
| `release.spec.ts` | **70 tests.** |

### 2b. New — data, docs and checks

| File | What it is |
|---|---|
| `packages/tooling/scripts/licence-exceptions.json` | Owned licence exceptions. **Empty**, and the file says so is a *measurement* (0 blocked, 0 unknown across all six tarballs), not a placeholder. Every entry must name an owner; the list may only shrink. |
| `packages/tooling/api-surface/README.md` | What a recorded surface is, why `-INADMISSIBLE` exists, and the reproducibility requirement. |
| `packages/tooling/api-surface/527dbd1-INADMISSIBLE.json` | The first API surface this repository has ever recorded. 1.7 MB, 1,610 symbols across six packages. **Skipped by default baseline selection** — see decision **D157**. |
| `scripts/release-checks/dist-artifacts.sh` | The dist-presence check, extracted from the rehearsal so it is a command with an exit code the ledger can record. Expanded 9 → 16 expected artifacts. |
| `scripts/release-checks/esm-only.sh` | The ESM-only check, likewise. Package list now derived from `release-policy.json`. |

### 2c. Modified

| File | Change |
|---|---|
| `package.json` | `release:api-surface:record`, `release:api-diff`, `release:evidence`, `release:report`, `release:bundle`, each with its `//` rationale. **`validate:all` is unchanged at 48 links** — none of these is a chain link, because packing six tarballs twice more is not something every aggregate run should pay for. |
| `scripts/release-rehearsal.sh` | Rewritten around a `run_gate` helper that writes `results.jsonl` + `logs/NN-<name>.txt` into the bundle and reads every exit code **directly**; adds `typecheck:tooling`, `validate:all`, `validate:published-imports --built`, `release:api-diff`, `release:evidence`, `release:report`; **replaces the `npm pack --dry-run` smoke step** (§6, D151). |
| `packages/tooling/src/manifest-generator.ts` | `renderBarrel()` split out of `generate()` and exported, so the drift can be measured **without writing to the tree**. The CLI block is now guarded by an `invokedDirectly` check — unguarded, it printed a usage message and exited 1 on `import`. |
| `packages/tooling/src/license-audit.ts` | `ALLOWED_LICENSES`, `BLOCKED_LICENSES` and `classifyLicense` exported, so `release:evidence` classifies with the **same** policy `validate:licenses` gates on. One policy, not two. |
| `packages/tooling/src/validators/published-imports.ts` | Packing helpers now imported from `../release/pack.ts` and re-exported; its 15-test spec is untouched and still green. |
| `packages/tooling/README.md` | Five new script rows. |

---

## 3. The `generate:exports` drift — confirmed, and it is not what the manifest reconciliation says

This is the finding TASK-R0-O1 is waiting for, and the first implementation of
this tool **got it wrong in a way worth recording**.

`manifest-generator.ts` emits `export * from '<family index>'` for components,
composables and providers, and enumerates names only for `utilities`. So the
manifest's per-entry `exports` **name lists are documentation that a star
re-export never consults**. Comparing those names against the packed surface
gives a real number — but it is a different number, and reporting it as "what
`generate:exports` would delete" would have overstated a 5-line change as a
455-symbol one.

The tool now measures both, separately:

| Measurement | Result at `527dbd1` | What it means |
|---|---|---|
| **Barrel drift** (`renderBarrel()` vs `packages/core/src/index.ts`, nothing written) | **would DROP 5 lines, ADD 2** | `yarn generate:exports` would remove `useAffix`, `useCalendar`, `useInfiniteScroll`, `useScrollSpy`, `useScrollToTop` from the public surface and add `useCountdown`, `useIntersection`. A **breaking removal under VERSIONING.md §2.1 performed by a generator**, with no changeset and no decision behind it. |
| **Manifest reconciliation** (packed root surface vs the documented name lists) | **455 exported-and-undocumented, 6 documented-and-undelivered** | The manifest is stale as a *document*. Same defect TASK-N2-A1 found ("stale by 43 public components"), now measured against the packed truth. It is also why `generate:component-meta` was moved onto the ownership manifest. |

The 5/2 figure in the task file is therefore **exactly right** — and it was
quoted from a document; it is now produced by a command, at a named commit,
without touching the tree.

Also recorded by the same pass: `public-api.manifest.json` declares
`"version": "0.0.1"` while `@dzup-ui/core` is `0.2.0`.

---

## 4. Three defects found in this task's own first implementation

All three were **quiet** — they produced plausible output. They are recorded
because the next person to touch a surface-diff tool will hit them again.

**F1 — the scratch consumer had no route to `vue`, and TypeScript said nothing.**
The first `packAll()` extracted the tarballs but did not create the junction to
this repository's `node_modules`. `DefineComponent` then did not resolve, every
component's type collapsed to `any`, and the recorded surface came back the
*right size* — 1,325 symbols for `@dzup-ui/core` — with `DzButton` recorded as
`"signature": "any"` and **0 symbols classified as `component`**. `degraded` was
`false`, because `skipLibCheck: true` suppresses diagnostics inside `.d.ts`
files, which is all a packed surface contains. A diff against that surface would
have been confidently, uniformly empty. Fixed by the junction; and `readSurface`
now measures degradation from its own **output** (`anySignatures` / total,
against `ANY_SIGNATURE_CEILING`) rather than from the compiler's willingness to
complain. After the fix: **204 components** detected, 0 `any` signatures.

**F2 — the surface was not reproducible, and the tool's own seeded proof exposed it.**
Diffing a fresh run against a snapshot of the *same tree* reported **185
signature changes** on `@dzup-ui/core` and 3 on `@dzup-ui/contracts`. Cause:
`typeToString` renders a cross-package type as
`import("C:/…/Temp/dzup-api-surface-Tf9Iau/consumer/node_modules/@dzup-ui/contracts/dist/anatomy.types").DzClassValue`
— and the scratch directory is a fresh `mkdtemp` per run. TypeScript also
renders a well-known symbol member as `__@iterator@32`, whose number is a
per-program ordinal. `normaliseSignature()` rewrites both. **Proof:** two
consecutive `--record` runs now produce byte-identical `surfaces` blocks (only
`provenance.generatedAt` differs).

**F3 — the dependency closure resolved every child from the tarball root, not from its parent.**
That is not what Node does. `vue-demi` — depth 2, via `@floating-ui/vue`, and
installed by yarn at `node_modules/@floating-ui/vue/node_modules/vue-demi@0.14.10`
because of peer virtualisation — came back `resolved: false`, `licence: UNKNOWN`.
A **fabricated** supply-chain finding, which is exactly what an SBOM must never
produce. Fixed by resolving each child from its parent's directory; the unknown
count went **1 → 0** and the distinct-dependency count corrected 152 → 143.

### And two of Pro's recorded defects, deliberately not reproduced

Pro's own ledger (`2026-09-03-cda4816/ledger.md` §0) records both, in the
five-line helper every Pro recorder uses:

- **E-1, the capped dirty count.** `dirtyFiles.slice(0, 50)` with a message built
  from `.length` made three *different* trees all report `dirty (50 path(s))`.
  Here `dirtyCount` is always the true count and the list is uncapped; a caller
  that wants a short list slices at render time, where the number beside it is
  still true. Pinned by a test.
- **E-2, the first path losing its first character.** Pro records `gitignore` for
  `.gitignore`. `parsePorcelainZ` uses `git status --porcelain -z`, which also
  makes the parse correct for paths containing spaces and for renames. Pinned by
  three tests.
- **E-6, the logs that could not be committed.** `.gitignore:42` is `*.log`, so
  Pro's 50 per-gate logs are ignored by the repository whose bundle rests on
  them. This bundle writes `logs/*.txt`. Avoided by extension rather than by
  editing `.gitignore`.

---

## 5. Focused validation

Every command run unpiped, exit code read directly (`cmd > log 2>&1; echo "exit $?"`).
`npx` is unusable in this repository; invocations are by module path or `yarn <script>`.

### 5a. The refusal, proven once

```
$ yarn release:api-surface:record                                        exit 1
release:api-surface:record — REFUSED

  worktree dirty: 215 path(s) differ from 527dbd1

  A recorded surface is the baseline every future release is diffed against.
  A baseline taken from a tree nobody can check out is a number with no
  referent: the next release would report changes against content that
  exists in no commit. doc 08 names this as a release stop condition
  ("dirty/unidentified source").
```

### 5b. The tools

| Command | Exit | What it produced |
|---|---|---|
| `yarn release:api-surface:record --force` | **0** | `527dbd1-INADMISSIBLE.json` — 1,610 symbols: contracts 167 · core 1,325 (204 components) · mcp 26 · nuxt 9 · testing 79 · tokens 4. `admissible: false`. |
| `yarn release:api-diff` | **0** | `api-diff.{json,md}` · 5 stop conditions · barrel drift 5/2 · reconciliation 455/6 |
| `yarn release:evidence` | **0** | 6 SBOMs + aggregate · 143 distinct deps · **20 advisory rows** · 0 blocked · 0 unknown · 0 local protocols |
| `yarn release:report` | **0** | `report.md` (8 sections) · `ledger.md` · `candidate-content-digest.json` |
| `node …/vitest.mjs run packages/tooling/src/release/release.spec.ts` | **0** | **70 tests** |
| `node …/vitest.mjs run …/validators/published-imports.spec.ts` | **0** | 15 tests, unchanged by the packing refactor |
| `node …/tsc -p packages/tooling --noEmit` | **0** | |
| `node …/eslint.js packages/tooling/src/release/ …` | **0** | `--max-warnings 0` |
| `bash scripts/release-checks/esm-only.sh` | **0** | 6 published dist directories |
| `bash scripts/release-checks/dist-artifacts.sh` | **0** | 16 expected artifacts |
| `yarn validate:licenses` | **0** | 9 allowed, 0 blocked, 0 unknown — the narrow gate, re-run for the `<validation>` block |

### 5c. The seeded proofs

| Seed | Method | Result |
|---|---|---|
| **A — a removal** | `useSeededRemoval` added to a copy of the recorded snapshot, diffed with `--against seedtest` | classified `removed` / `breaking` / level `minor`. **Not** reported as a stop condition, correctly: the pending changesets already declare `minor` for `@dzup-ui/core`, so the removal *is* explained. The unexplained case (no changeset, and a `patch`-only changeset) is pinned by two unit tests. |
| **B — a prop removal on a real component** | `loading` removed from `DzButton.$props` in the same seeded snapshot | classified `signature-changed` / `breaking` / `minor`. |
| **C — reproducibility** | two consecutive `--record` runs, `surfaces` compared byte-wise | **identical** |
| **D — the packed-manifest protocol check** | `unresolvedProtocols({ dependencies: { '@dzup-ui/contracts': 'workspace:*' } })` | flags it; a resolved semver range passes. Unit-pinned, because seeding a real tarball would mean editing a published `package.json`. |

The seeded snapshot was written to `packages/tooling/api-surface/seedtest-INADMISSIBLE.json`
and **deleted afterwards**; the directory now holds only `527dbd1-INADMISSIBLE.json`
and `README.md`. The seeded run wrote its output to the session scratchpad, never
into `docs/qa/`.

---

## 6. What the evidence found

### 6a. 20 advisories in `@dzup-ui/mcp`'s dependency closure — 8 of them `high`

Nothing in this repository had ever asked. `validate:licenses` audits licences,
not vulnerabilities, and reads source manifests rather than a tarball's closure.

| Severity | Package | Count | Reached via |
|---|---|---|---|
| **high** | `fast-uri` | 7 | `@dzup-ui/mcp` |
| **high** | `ip-address` | 1 | `@dzup-ui/mcp` |
| moderate | `hono` | 6 | `@dzup-ui/mcp` |
| moderate | `ip-address` | 2 | `@dzup-ui/mcp` |
| moderate | `qs` | 2 | `@dzup-ui/mcp` |
| moderate | `@hono/node-server` | 1 | `@dzup-ui/mcp` |
| low | `hono` | 1 | `@dzup-ui/mcp` |

All 20 are **transitive**, all in the one published package that ships a server,
and every one of them has a fixed version available. `@dzup-ui/mcp` is a
**public** package under `release-policy.json`. Routed as decision **D154** — it
is a dependency bump plus a `patch` changeset, which is not this task's to make.

`@dzup-ui/contracts`, `@dzup-ui/testing` and `@dzup-ui/tokens` are reported
`not-run` with the reason *"the package declares no runtime dependencies — there
is nothing to query, which is not the same as a clean audit"*. A zero is not
claimed for them.

### 6b. Licences: 0 blocked, 0 unknown, 0 exceptions needed

143 distinct resolved dependencies across the six tarballs, classified with the
same allow/block sets `validate:licenses` gates on. The exceptions file is empty
because nothing needed excepting — stated in the file itself so that a later
reader does not mistake an empty list for an unwritten one.

**The two gates disagree about scope, and that is the point of having both.**
`yarn validate:licenses` is **exit 0** over **9** dependencies — the direct
production dependencies of two source `package.json` files. `release:evidence`
covers **143**: the full transitive closure of what is actually inside the six
tarballs, resolved the way Node resolves it. Sharing one policy between them
means the wider audit can never be more permissive than the gate; it is simply
looking at 134 more packages.

### 6c. `npm pack --dry-run`'s smoke test cannot fail — re-measured independently

R1-O2 recorded this as F2/D151. Re-verified here directly, because this task
*replaces* the step rather than only reporting it: `npm pack --dry-run` in
`packages/contracts` prints the **tarball file list** and `grep -c
'workspace:\|link:'` over its output is **0**. The rehearsal's step 8 has been
replaced by `yarn validate:published-imports --built` (which packs with `yarn
pack` and loads the result) plus `release:evidence`'s check of the `dependencies`
block of the manifest **inside** each tarball — the check the old step believed
it was making. **`.github/workflows/ci.yml` carries the identical dead step and
was NOT touched**: the CI job graph is D151's and outside this task.

### 6d. A claim I could not substantiate, recorded as such

While extracting the ESM-only check I believed the original
`find … -name "*.cjs" -o -name "*.cjs.js"` had an `-o` precedence bug that
discarded the first branch. **It does not.** GNU find applies the implicit
`-print` to the whole expression; verified with findutils 4.10.0 against a
seeded `index.cjs` and `other.cjs.js` — both detected. The comment in
`esm-only.sh` says so. The real (smaller) gap was **scope**: the original named
three dist directories by hand and never looked at `@dzup-ui/testing`,
`@dzup-ui/mcp` or `@dzup-ui/nuxt`.

---

## 7. The rehearsal and the bundle

`yarn rehearse:release --skip-install`, run end to end, exit read directly.
**Bundle: `docs/qa/release/2026-09-21-527dbd1/`** — `report.md`, `ledger.md`,
seven evidence artifacts, `results.jsonl`, one log per gate and six CycloneDX
documents. Three rehearsals were run; **this bundle is the one that completed**
(see F4 for the two that did not, and why nothing from them was merged into it).

| # | Gate | Exit | Seconds |
|---|---|---|---|
| 1 | `yarn typecheck:all` | **0** | 67 |
| 2 | `yarn typecheck:tooling` | **0** | 6 |
| 3 | `yarn lint` | **0** | 78 |
| 4 | `yarn test` | **0** | 314 |
| 5 | `yarn test:contracts` | **0** | 67 |
| 6 | `yarn test:a11y` | **0** | 13 |
| 7 | `yarn build` | **0** | 81 |
| 8 | `yarn validate:all` | **0** | 552 (**48 links**, end to end) |
| 9 | `bash scripts/release-checks/dist-artifacts.sh` | **0** | 0 |
| 10 | `bash scripts/release-checks/esm-only.sh` | **0** | 0 |
| 11 | `yarn validate:published-imports --built` | **0** | 17 |
| 12 | `yarn release:api-diff --out <bundle>` | **0** | 16 |
| 13 | `yarn release:evidence --out <bundle>` | **0** | 13 |
| — | `yarn release:report --out <bundle>` | **0** | not a gate row: a report that reported on itself would be circular |

**`yarn install --immutable` is absent from the ledger, not passing.** The run
used `--skip-install`, and the rehearsal prints that distinction rather than
silently recording a green row.

**The script defines a 14th gate that this bundle does not contain, and that is
recorded rather than papered over.** After the bundle above was produced I added
`run_gate "nuxt-fixtures" "yarn test:nuxt-fixtures:pack"` — the nearest thing OSS
has to a downstream consumer, and without it `report.md` §6 has nothing at all in
it. The re-run that would have folded it into the ledger was **stopped by the
F4 flake below**, so rather than merge two runs' rows into one ledger (which is
precisely the "evidence bound to a different configuration" stop condition) the
13-gate bundle stands and the gate was proven on its own:

```
$ yarn test:nuxt-fixtures:pack                                            exit 0
  ✓ packed 4 tarball(s) → packages/nuxt/test/.tarballs
  ✓ staged outside the repository → <tmp>/dzup-nuxt-fixtures
  ✓ core-only · css-order · custom-prefix · optional-peer · pro-missing · ssr-hydration: ready
  · core-pro: unrun (needs DZUP_PRO_TARBALL from a Pro checkout)
```

`report.md` §6 therefore reads *"not run in this bundle"* for that row, which is
**true**. The next rehearsal will record it.

### F4 — `yarn test` can exit 1 with **zero failed tests**, and did

The first complete rehearsal stopped at gate 4:

```
 Test Files  547 passed (547)
      Tests  10356 passed | 3 skipped | 1 todo (10360)
     Errors  1 error
✗ FAILED: test (exit 1)
```

`ReferenceError: requestAnimationFrame is not defined` — an **unhandled error
after the test environment was torn down**, from
`@formkit/auto-animate/index.mjs:173`, reached by a `setTimeout` at line 161,
originating in `apps/landing/src/pages/AnimationsPage.v2.spec.ts`. That spec
already stubs `Element.prototype.animate`, `matchMedia` and
`IntersectionObserver` for auto-animate's sake; it does not cancel
auto-animate's own timer, so under load the callback outlives jsdom's window.

- **It is a flake, not a regression — but not a rare one.** It appeared in **2 of
  3** full rehearsal runs. The spec passes **exit 0** in isolation (15 tests,
  17.8 s), and rehearsal 2 passed `yarn test` at **exit 0** with the same 547
  files / 10,356 tests.
- **It is contention-sensitive, and the third run shows the mechanism.** That run
  was on a demonstrably busier machine — `typecheck:all` took **218 s** against
  67 s in rehearsal 2 — and the error count grew **1 → 66**, alongside 36
  `Async component timed out after 15000ms` and one `chunk load failed`, both of
  which are themselves load artifacts. Every one of the 66 originated in the
  same spec. The slower the machine, the wider the window between the spec
  finishing and auto-animate's timer firing.
- **It is not this task's test count moving.** R1-O2 recorded 546 files /
  10,286 tests; this task's `release.spec.ts` is +1 file / +70 tests, which is
  exactly 547 / 10,356 — and **0 failed** in every one of the three runs,
  including both that exited 1.
- **Not fixed here.** `apps/landing/src/pages/AnimationsPage.v2.spec.ts` is not
  this task's file and the fix is a judgement about how that page's animation is
  tested. Routed as decision **D155** — but note what it means for a *release*
  path: a fail-fast rehearsal is stopped two times in three by a gate with
  nothing wrong with it, and R1-O2 recorded the same class of flake for
  `DzMasonry.spec.ts` under contention. Two independent instances, one of them
  reproducible under load, is a pattern rather than bad luck.

### What the bundle contains

```
docs/qa/release/2026-09-21-527dbd1/
  report.md                        doc 08's eight sections
  ledger.md                        one row per gate, every row `527dbd1+221`
  api-diff.{json,md}               surfaces, classification, drift, stop conditions
  supply-chain.{json,md}           licences, advisories, provenance summary
  sbom.cdx.json  sbom/*.cdx.json   CycloneDX 1.6 — aggregate + one per tarball
  hashes.json                      sha256 + sha512 per tarball AND per file inside it
  provenance.json                  in-toto v1 / SLSA v1, unsigned, TP not exercised
  candidate-content-digest.json    3,581 files behind the digest
  results.jsonl                    the machine-readable gate ledger
  logs/NN-<gate>.txt               one log per gate
```


---

## 8. Aggregate qualification

**Locally qualified only**, and one qualification lower than usual: every
artifact in the bundle is stamped **`admissible: false`**, because the worktree
carries 221 uncommitted paths. The ladder reads *specified → implemented →
focused-validated → **aggregate-qualified** → browser/AT-qualified → packaged →
released*. This task reaches the fourth rung for the repository and produces the
**first packaged-artifact evidence OSS has ever had** — but packaged evidence
taken from a tree nobody can check out is a candidate record, not release
evidence, and every file says so in a field rather than in prose.

| Lane | Result | Read how |
|---|---|---|
| `yarn validate:all` | **exit 0**, all **48** links, end to end | inside the rehearsal; exit written to `results.jsonl`, never through a pipe |
| `yarn test` | **exit 0** — 547 files, 10,356 passed, 0 failed, 3 skipped, 1 todo | unpiped (one earlier run flaked — §7 F4) |
| `yarn typecheck:all` · `typecheck:tooling` · `lint` · `build` | **exit 0** | unpiped |
| `yarn validate:published-imports --built` | **exit 0** | strict mode: a stale dist is an error, not a warning |
| `yarn test:nuxt-fixtures:pack` | **exit 0** | standalone; 6 fixtures ready, `core-pro` unrun (needs `DZUP_PRO_TARBALL`) |
| `node …/tsc -p packages/tooling --noEmit` | **exit 0** | unpiped |
| `node …/eslint.js` over every touched file, `--max-warnings 0` | **exit 0** | unpiped |
| `release.spec.ts` | **exit 0** — 70 tests | unpiped |
| `published-imports.spec.ts` | **exit 0** — 15 tests | unchanged by the packing refactor |

**Chain length unchanged at 48.** None of the five `release:*` scripts is a
`validate:all` link, deliberately: each packs six tarballs (~15 s) and
`validate:published-imports` already pays that cost once per aggregate run.
Release evidence belongs to a release rehearsal, not to every commit's gate.
See decision **D156**.

**Still red: nothing.** No gate this task ran is failing.

**Pre-existing, reported, not fixed:**

- 37 capability cells and 8 visual rows remain `stale`; 441 cells `unrun`; the
  AT matrix is **0 of 534 executed** (R1-O1 §1d, R2-O2). `report.md` §4 prints
  each of those numbers rather than an aggregate.
- `e2e/matrix/browser-evidence.json` and `packages/core/security/coverage.json`
  stamp `2d51eec`, **not HEAD**, and were captured on a dirty worktree.
  `report.md` §4 marks both **not HEAD** rather than quoting them as current.
- The `core-pro` Nuxt fixture stays `unrun`: it needs `DZUP_PRO_TARBALL` from a
  Pro checkout (R1-O2).
- `.github/workflows/ci.yml`'s dead pack smoke test (**D151**) — replaced in the
  *rehearsal*, untouched in CI.
- The 18 `TS2300` duplicate-parameter errors in published declarations
  (R1-O2 **D152**) are visible in this task's recorded surface too: `DzButton`'s
  emits record as `(event: "click", event: MouseEvent): void`. Independent
  corroboration, same routing (TASK-R2-O3).

**Not claimed anywhere:** that any of this ran on CI, that any tarball was
installed from a registry, that any advisory was triaged, or that any operator
reviewed the bundle.

---

## 9. Ratchet movements (old → new, bound to `527dbd1`)

| Ratchet | Before (`527dbd1`) | After (working tree) |
|---|---|---|
| Release reports ever produced | **0** | **1** — `docs/qa/release/2026-09-21-527dbd1/report.md`, 8 sections |
| SBOMs ever produced | **0** | **7** (6 per-tarball + 1 aggregate; CycloneDX 1.6, 152 components) |
| Tarballs with a recorded sha256 **and** sha512 | **0** | **6** |
| Files inside tarballs with a recorded digest | **0** | **1,586** (`hashes.json`) |
| Provenance statements | **0** | **6**, each stating `signed: false` and `trustedPublishing.exercised: false` |
| Published packages with a recorded API surface | **0** | **6** — 1,610 symbols, 204 of them components |
| `generate:exports` drift | quoted in a task file ("5 composables, 2") | **measured at a commit**: 5 barrel lines dropped, 2 added, each named |
| doc 08 release stop conditions evaluable mechanically | **0** | **4** (`dirty-source`, `unexplained-api-diff`, `manifest-omission`, `illegal-level`); the rest need CI or a human |
| Gate runs leaving a machine-readable record | **0** | **13 rows + 13 logs** in this bundle; **14** defined by the script |
| Rehearsal steps that cannot fail | **1** (`npm pack --dry-run` + `grep`) | **0** |
| Published packages covered by the ESM-only check | **3 of 6** | **6 of 6**, derived from `release-policy.json` |
| dist artifacts asserted present after a build | **9** | **16** |
| Licence policies in the repository | 2 (a ported copy would have made one) | **1**, shared by `validate:licenses` and `release:evidence` |
| Definitions of "pack the published packages" | 1, private to the import gate | **1**, in `release/pack.ts`, shared by 3 callers |
| Known advisories in a published package's closure | **unmeasured** | **20** in `@dzup-ui/mcp` (8 high) — **D154** |
| Tooling specs | — | **+70** (`release.spec.ts`), all passing |
| `validate:all` links | 48 | **48** — unchanged, deliberately |

Note the ratchet that moved the "wrong" way: **known advisories 0 → 20**. That
is the measurement starting, not the supply chain degrading.

---

## 10. Owner decisions raised

Numbered from TASK-R1-O2's **D153**.

### D154 — 20 advisories (8 `high`) in `@dzup-ui/mcp`'s published dependency closure

`fast-uri` ×7 high · `ip-address` ×1 high + ×2 moderate · `hono` ×6 moderate +
×1 low · `qs` ×2 moderate · `@hono/node-server` ×1 moderate. All transitive, all
with a fixed version available, all in the one published package that ships a
server. Rows with GHSA links:
`docs/qa/release/2026-09-21-527dbd1/supply-chain.md`.

- **(a) Bump the offending transitive versions (a yarn resolution or a direct dependency bump), add a `patch` changeset, re-run `release:evidence` — recommended.** Mechanical, and the gate re-proves the result in 13 s.
- (b) Triage each advisory against how `@dzup-ui/mcp` actually uses `hono`/`qs` and record accepted risks in a security-exceptions file. Honest, but it is unbudgeted work and the advisories are fixable.
- (c) Withhold `@dzup-ui/mcp` from the first publication. It is `published` in `release-policy.json` today; withholding is a policy edit with a reason, which that file's shape already supports.

Doc 08's package matrix requires a vulnerability report per release but names no
severity threshold. **Setting that threshold is part of this decision.**

### D155 — `yarn test` can exit 1 with zero failed tests

§7 F4. Two independent instances now: `AnimationsPage.v2.spec.ts` (auto-animate
`setTimeout` → `requestAnimationFrame` after teardown, this task) and
`DzMasonry.spec.ts` (`ResizeObserver` under contention, R1-O2).

- **(a) Fix each at the defect** — cancel the timer in that spec's `afterEach`, or install a teardown-safe `requestAnimationFrame`. **Recommended**, and it is a small change by whoever owns that page.
- (b) Make the rehearsal tolerant of `vitest` exiting non-zero with 0 failures. **Rejected**: it turns a real unhandled error into a warning, and an unhandled error in a torn-down environment is exactly how a real leak first shows up.
- (c) Set `dangerouslyIgnoreUnhandledErrors` repository-wide. Rejected for the same reason, more broadly.

### D156 — should any `release:*` script join `validate:all`?

None does today; each packs six tarballs, and `validate:published-imports`
already pays that once per aggregate run.

- **(a) Keep them out of the chain and run them in `rehearse:release` — recommended.** Release evidence is release work.
- (b) Add `release:api-diff` as a chain link so barrel drift is caught on every commit. Tempting — the drift has sat unnoticed — but it adds ~16 s and a TypeScript program to every aggregate run.
- (c) Split a cheap `validate:barrel-drift` out of `release:api-diff`. It needs `renderBarrel()` and the file on disk, **not a tarball**, so it would cost milliseconds. **This is the better version of (b)** and the one I would raise first if the owner wants drift gated rather than reported.

### D157 — keep or delete `packages/tooling/api-surface/527dbd1-INADMISSIBLE.json`?

1.7 MB, stamped `admissible: false`, skipped by default baseline selection.

- **(a) Keep it until a clean commit is recorded, then delete it — recommended.** It is the machinery's proof and the only full-fidelity baseline that exists.
- (b) Delete it now and record the first surface after the owner commits. Loses only the ability to run a full-fidelity diff today.
- (c) Keep it permanently. **Rejected**: an inadmissible baseline that lingers is the one somebody eventually diffs against by accident.

Whichever is chosen, **`release:api-surface:record` on a clean tree is a
prerequisite of the first release**: until it runs, the API diff cannot see a
signature change at all.

### D158 — what `public-api.manifest.json` is for

Two measured facts, one decision. `yarn generate:exports` would **drop**
`useAffix`, `useCalendar`, `useInfiniteScroll`, `useScrollSpy`, `useScrollToTop`
and **add** `useCountdown`, `useIntersection`; and the manifest declares
`"version": "0.0.1"` while the package is `0.2.0`.

- **(a) The barrel is right:** add the five missing composable paths to the manifest and drop the two it wrongly promises. No version bump; the public surface does not move. **Recommended if those five are intended public API.**
- (b) The manifest is right: run `generate:exports` and ship the removal as a **`minor`** with a changeset naming the five composables (VERSIONING.md §2.1, §3).
- (c) Retire `public-api.manifest.json` as the barrel's source. `generate:component-meta` was already moved off it (TASK-N2-A1), and the 455-symbol documentation gap says the rest of it is not maintained either.

This is the input TASK-R0-O1 was waiting for, and it is **reported, not
resolved**: which option is right depends on whether those five composables are
intended public API, and that is not a fact a tool can read.

### D159 — a rollback and support policy for OSS

`report.md` §8 has a Rollback heading and nothing to put under it. Pro has
`docs/release/rollback-and-support.md`; OSS has no equivalent, and the mechanism
(`npm deprecate` plus a superseding patch — unpublish is available for only 72 h)
is stated in the generated report and nowhere else.

- **(a) Write `docs/release/rollback-and-support.md` before the first publication — recommended.** It is a prerequisite, not a follow-up: the first release is the first moment it can be needed.
- (b) Fold it into TASK-R0-O1's publication packet.
- (c) Defer. Rejected: "we will work it out if it happens" is not a policy.

---

## 11. Ranked next packet

1. **`yarn release:api-surface:record` on a clean commit.** One command, and it
   is the whole difference between an API diff that can see a prop's type change
   and one that cannot. Blocked only by the owner committing the tree.
2. **D154** — the 20 advisories. Smallest real supply-chain finding, mechanical
   fix, and `release:evidence` re-proves it in 13 s.
3. **TASK-R0-O1** — the publication packet. It now has all three inputs it was
   waiting for: R1-O1's D1 proof, this task's measured `generate:exports` drift
   (**D158**), and a supply-chain picture.
4. **D159** — the rollback policy. A generated §8 with an empty Rollback heading
   is an invitation.
5. **TASK-R1-O4** — CI dispatch. `report.md` §3 says nothing here has ever run
   on CI and §7 says no workflow has ever published; both are that task's.
6. **D156(c)** — the cheap `validate:barrel-drift` link, if the owner wants the
   `generate:exports` drift gated rather than merely reported.
