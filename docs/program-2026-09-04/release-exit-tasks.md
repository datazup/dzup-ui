# dzup-ui — Release-exit tasks (R0 + R1)

> Part of the [Architecture Review Program 2026-09-04](./README.md). Every
> prompt assumes the `<repo_conventions>` block in [README §5](./README.md#5-how-these-tasks-are-written)
> and the check-first protocol in [README §4](./README.md#4-how-to-run-a-task--the-check-first-protocol).
>
> **Sources:** 08-11 reassessment doc 08 (validation and release matrix — the
> per-release rows OSS never ran: API diff, SBOM/hashes, Node `import()` of
> every published entry, min-peer lane, 8-section release report), doc 06
> §Supply chain / §API compat; 08-28 roadmap N5-R1…R3; the 1.0 exit memo
> [`../program-2026-09/reports/1-0-exit-criteria-2026-09.md`](../program-2026-09/reports/1-0-exit-criteria-2026-09.md)
> (criteria C1–C15); the N5-01…05 handoffs and their owner-decision registers;
> the N2-A4 registry study; the N0-05 and N2-S1 evidence findings (F1, F3, F4,
> S1-F10). Every number below is bound to `main` @ `99b963a`.
>
> **The rule that governs this file:** a release claim is only as good as the
> committed tree it is bound to. R1-O1 makes that tree green *for real*;
> R1-O2 makes what consumers install *truthful*; only then do the owner
> packets in R0 become decidable. Nothing here publishes anything.
>
> **Ordering:** R1-O1 first (nothing may quote a number before the artifacts
> stamp HEAD). R1-O2 next (its gate must precede ADR acceptance — N5-03's
> sequencing note). R1-O3 after R1-O1. R0-O1, R1-O4, R1-O5, R1-O6 end in owner
> decisions and can be prepared in parallel. R0-O2 last: it needs R5-O1's code
> work and R1-O2's gate.

> **Status legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[x] found-done` · `[!]` blocked on owner decision
> **Priority:** 🔴 · 🟠 · 🟢

---

## Status as marked — re-verified 2026-09-22 at `527dbd1` + 304 uncommitted paths

> The eight boxes below were left `[ ]` after execution; this pass **re-ran every
> `<done_check>` against the tree** rather than reading the ledger, and marked
> them from the result. Baseline is `527dbd1`, **not** the `99b963a` this file's
> preamble names — four commits landed after it (`a01965f`, `569d887`, `2d51eec`,
> `527dbd1`), so **every count in the `_Gap:_` blocks below is stale by
> construction** and must be re-measured before it is quoted. All work is
> uncommitted; the owner commits.

| Task | Mark | `<done_check>` re-run at `527dbd1` | What remains |
|---|---|---|---|
| R1-O1 | `[x]` | **7 of 7** — manifest `sourceCommit` == HEAD · `validate:capability-matrix` 0 · **`yarn test` exit 0** (552 files, 10,504 passed, 0 errors, 0 rAF) · tooling `tsc` 0 · `eslint e2e/` 0 and in the root `lint` target · 0 tracked build leftovers · both validators chained | — |
| R1-O2 | `[x]` | **Pass** — `validate:published-imports` exit 0 over **6 packages / 31 entries / 62 export leaves**; `./i18n` + `./i18n/locales/en.json` exported, `DzMessageCatalog` reachable from a packed tarball; `@dzup-ui/contracts` imports clean; pack path refuses a stale `dist` | — |
| R1-O3 | `[x]` | **4 of 4** — `src/release/{api-diff,api-surface,evidence,report}.ts`, 7 `release:*` scripts, `docs/qa/release/2026-09-21-527dbd1/` with CycloneDX SBOM, hashes, provenance and all **8** report sections | bundle is a point-in-time record and is now stale (**D173**, deliberately not regenerated) |
| R1-O4 | `[!]` | Engineering done — 3 workflows dispatchable (`nuxt-majors` is a **job inside `vue-next.yml`**, not a file: check 1 is unsatisfiable as written), `min-peer.yml` added, dispatch request written. **Recording table is empty** | **owner dispatches**; evidence pages stay untouched until run ids exist |
| R1-O5 | `[!]` | Gates green — `validate:registry` 0, `validate:docs-size` 0 (docs dist + storybook under byte ceilings, in `validate:all`), `descriptionsWithBareHtml` **12 → 0**, prose-less components **3 → 0**, all 15 playground seeds carry typed `SeedRefusal`s | **owner deploy** (D165–D169); domain still NXDOMAIN |
| R1-O6 | `[!]` | Gate built and **firing red on a real defect** — `validate:icon-duplicates` reports 2 lucide versions (`0.475.0` from landing+sandbox, `0.477.0` from core); memo covers all four items; `apps/sandbox` still present | **owner** D174–D178. This is the single `✗` in `validate:all` |
| R0-O1 | `[!]` | Register (**368** rows) + publication packet exist, three costed options | **A4-D1 `open`** — the file's own rule says leave `[!]` |
| R0-O2 | `[!]` | Registry has 18/19/20, `validate:adr-references` is status-aware and exits 0 (ceiling 3), `ariaInvalid` moved to `BaseValidationProps` with a changeset, ADR-13 collision resolved by cross-reference (no OSS document exists, so check 4's `→ 1` is unsatisfiable as written) | **owner signature** — all three ADRs still `Status: Proposed` |

**Aggregate at `527dbd1`:** `yarn validate:all` is a **50-link** chain (not the 37
the preamble states) and exits **1 at link 48 only** — `validate:peers` →
`validate:icon-duplicates`, red *by design* pending R1-O6's owner decision.
Links 49–50 (`validate:licenses`, `validate:tree-shake`) never start under `&&`;
run alone both exit 0. Independent adversarial pass and its fixes:
[`./reports/release-exit-verification-2026-09-22.md`](./reports/release-exit-verification-2026-09-22.md).

**Four `<done_check>` clauses are wrong as written** and were judged on substance,
with the reason recorded above: R1-O4 check 1 (`nuxt-majors` is a job), R0-O2
check 4 (`ls docs/adr/ | grep -c 'ADR-13'` → 1, but OSS has no ADR-13 document),
R1-O2 check 4 (globs `validators/exports*`; the snapshot is
`scripts/required-export-subpaths.json`), R1-O5 check 3 (attributes two content
counts to `validate:docs-pages`, which reports neither — they are ratchets in
`validate:component-meta`).

---

## 🔴 The tree and what consumers install

### [x] TASK-R1-O1 — A truthfully green committed tree 🔴

_Gap: `yarn validate:all` on `main` @ `99b963a` exits 1 at link 16 of 37
(`validate:capability-matrix`: 12 stale cells — 7 button-family `visual`,
`DzOrderList` perf, +4); `yarn test` carries 2 inherited failures
(`landing-token-fallbacks`, `story-dod-tiers countOpen` — its fixture reads
the live repo); `packages/tooling` `tsc` has 7 errors; `e2e/` sits outside the
lint target with 9 latent errors; 12 committed build leftovers remain in
`packages/core/src/providers/`. Every generated artifact stamps `51dec93`
because the shared helper records the parent commit (N0-05 F1), and the
aggregate gate reported green over a stale artifact for three packets
(N2-S1 S1-F10). Sources: N5-03 D1, N0-05 F1/F5, N2-S1 S1-F10,
`../program-2026-09/EXECUTION-STATUS-N5.md`._

```xml
<role>You are a release engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Your only product is a committed tree on which every gate is green for a reason you can name — not a tree on which the gates were made to pass.</role>

<task>Make `main` green end-to-end: fix the sourceCommit stamping defect so artifacts record the commit they were generated at, regenerate the artifact chain in dependency order, resolve the 12 stale capability cells, the 2 failing unit specs, the 7 tooling type errors and the 9 e2e lint errors, delete the 12 build leftovers under packages/core/src/providers/ and gate their return, and chain validate:at-scripts and validate:tree-shake into validate:all (or record why not). Produce a dry-run proof of whether N5-01 D1 (validate:changelog vs validate:mcp) really turns validate:all red after a `changeset version`.</task>

<motivation>Every downstream task in this program quotes a number, and every number is worthless while the artifacts stamp a commit four back from HEAD and the aggregate gate can be red for reasons nobody triaged. A green tree that is green because a stale artifact was regenerated by hand proves nothing (S1-F10); a green tree whose every gate ran end-to-end, unpiped, at HEAD is the baseline the 1.0 criteria (C6, C7, C8) are measured against.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `node -e "console.log(require('./packages/core/manifests/component-ownership.manifest.json').sourceCommit)"` equals `git rev-parse HEAD` (first 7 chars agree).
  - `npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"` → `exit 0`.
  - `yarn test > /tmp/oss-test.log 2>&1; echo "exit $?"` → `exit 0` (do not pipe).
  - `npx tsc -p packages/tooling --noEmit; echo "exit $?"` → `exit 0`.
  - `npx eslint e2e/ --max-warnings 0; echo "exit $?"` → `exit 0` and the root `lint` script's target includes `e2e/`.
  - `git ls-files packages/core/src/providers | grep -E '\.(js|d\.ts|map)$' | wc -l` → `0`.
  - `grep -c 'validate:at-scripts\|validate:tree-shake' package.json` shows both inside the `validate:all` chain (or EXECUTION-STATUS.md records a reasoned exclusion).
</done_check>

<discovery>
  1. Read ../program-2026-09/reports/N0-05-rebind-handoff.md §F1 (the off-by-one stamp) and locate the shared helper every generator calls for `sourceCommit`; confirm the defect by regenerating one artifact on a clean tree and comparing the stamp with `git rev-parse HEAD`.
  2. Read ../program-2026-09/reports/N5-03-toolchain-currency-handoff.md D1 for the 12 stale cells and which inputs feed them; list each cell with the artifact that would refresh it.
  3. Read ../program-2026-09/reports/N1-O1-story-dod-handoff.md for why `story-dod-tiers countOpen` broke (the ratchet reached 0 and the spec's fixture reads the live repo) and ../program-2026-09/reports/N0-05-rebind-handoff.md F4/F5 for the perf and browser cells that are legitimately stale until TASK-R2-O1 re-runs them — those are not yours to fake.
  4. Run `yarn validate:all` once, end-to-end, capturing to a file; record the first failing link and every later link's status by continuing the chain manually.
</discovery>

<requirements>
  <stamping>The generator helper records `git rev-parse HEAD` of the tree the artifact was generated from, and every artifact in the chain (ownership → quality → capability → component-meta → llms → docs-pages → playground seeds) carries the same value after one regeneration pass. Provenance fields stay excluded from byte comparisons (the `validate:component-meta` / `validate:at-matrix` lesson) — do not reintroduce the class of gate that cannot be green in a committed state.</stamping>
  <no_fake_freshness>A stale cell is fixed by regenerating from its real input or by re-running the lane that produced it. Cells that need a browser or perf run (TASK-R2-O1, TASK-R2-O7) stay visibly `stale` with the reason recorded; do not edit an artifact to make a validator pass.</no_fake_freshness>
  <tests>Fix the two failing specs at the defect: `story-dod-tiers countOpen` must read a fixture, not the live repository; `landing-token-fallbacks` must assert the 6 landing fallbacks against the token source, not a hard-coded list. No spec is deleted or skipped.</tests>
  <lint_scope>Widen the root `lint` script to `packages/ apps/ e2e/`; fix the 9 errors as defects, not with disable comments.</lint_scope>
  <leftovers>Delete the 12 committed build outputs under packages/core/src/providers/ and add a gate (validate:exports or a new link) that fails when a `.js`/`.d.ts`/`.map` is tracked under `packages/*/src`.</leftovers>
  <chain>`validate:at-scripts` and `validate:tree-shake` join `validate:all`, in the position their inputs require; if either cannot join (runtime, flakiness), record the reason in the handoff — never silently leave it out.</chain>
  <d1_proof>In a throwaway copy of the repo (never on the tree), run `yarn changeset version` and then `validate:changelog` and `validate:mcp`; record which fails and why. Report only — the decision belongs to TASK-R0-O1.</d1_proof>
  <example>
    Handoff table row for a stale cell:
    | Cell | Why stale at 99b963a | Refreshed by | State after |
    |---|---|---|---|
    | DzOrderList · perf-baseline | 11 perf cells need a ≥5-run capture (N0-05 F5) | TASK-R2-O7 | stale (visible, reasoned) |
  </example>
</requirements>

<steps>
  1. Complete <discovery>; write the stale-cell table and the first-failing-link record before editing anything.
  2. Fix the stamp helper; regenerate the chain in order; confirm every artifact stamps HEAD.
  3. Fix the two specs, the 7 tooling type errors, the 9 e2e lint errors; widen the lint target.
  4. Delete the 12 leftovers; add the tracked-build-output gate with a seeded failure proving it fires.
  5. Chain the two validators (or record exclusions); run `yarn validate:all` end-to-end again, unpiped, and record every link.
  6. Run the D1 dry-run proof in a scratch copy; record the result.
  7. Hand off with the ratchet board updated (first failing link 16 → 0, test failures 2 → 0, stale cells 12 → n with reasons).
</steps>

<validation>
  yarn validate:all > /tmp/validate-all.log 2>&1; echo "exit $?"      # read the code directly, never through a pipe
  yarn test > /tmp/test.log 2>&1; echo "exit $?"
  npx tsc -p packages/tooling --noEmit; echo "exit $?"
  npx eslint packages/ apps/ e2e/ --max-warnings 0; echo "exit $?"
  npx tsx packages/tooling/src/validators/capability-matrix.ts; echo "exit $?"
  yarn typecheck && yarn build
</validation>

<success_criteria>`validate:all` exits 0 end-to-end at HEAD (first failing link 16 → none); `yarn test` 0 failed; tooling tsc 0; e2e lint 0 and in the target; every generated artifact's sourceCommit equals HEAD; the 12 stale cells are each refreshed or recorded stale with a lane and a task id; tracked-build-output gate fires on a seeded file; D1 proof recorded with the exact failing validator and message.</success_criteria>

<stop_conditions>Stop and report when a stale cell can only be refreshed by editing the artifact by hand; when a failing spec encodes a real defect in a component (route it to TASK-R2-O3 with the spec path); when the stamp fix would change an artifact's schema version (owner decision); when `validate:all` fails on a link this task did not touch and whose cause is outside this repository.</stop_conditions>
```

---

### [x] TASK-R1-O2 — Consumer-truth gates: Node `import()` of every published entry, pack freshness, the i18n catalog export 🔴

_Gap: three things a consumer would hit are gated nowhere at `99b963a`.
(1) No validator imports every `exports` target of every public package under
plain Node — `@dzup-ui/contracts` shipped invalid ESM until N5-03 fixed 27
specifiers, and the fix has no gate (N5-03 D3(2)); the Pro release rehearsal
found the same defect from the other side (G8-7). (2) `test:nuxt-fixtures:pack`
packs whatever `dist` is present without building or checking freshness, so a
green Nuxt run may be against a stale build (N5-04 F10). (3) The i18n catalog
is unreachable from the published package — `ERR_PACKAGE_PATH_NOT_EXPORTED`
×3 and an empty catalog type for consumers because the `declare module` d.ts is
unreferenced (N5-04 D4) — which blocks every locale pack. Sources:
`../program-2026-09/reports/N5-03-toolchain-currency-handoff.md`,
`N5-04-peer-hygiene-handoff.md`, FORM-R7 row 50._

```xml
<role>You are a packaging engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You test what a consumer installs — the packed tarball — never the workspace source.</role>

<task>Build three consumer-truth gates and make them validate:all links: (1) `validate:published-imports` — packs every public package with `yarn pack` (never `npm pack`: workspace:* would ship verbatim), installs the tarballs into a scratch consumer, and `import()`s every `exports` target (root and every subpath, every condition) under plain Node, failing on any resolution or syntax error; (2) a dist-freshness check in `test:nuxt-fixtures:pack` that refuses a `dist` older than its sources or builds first; (3) the i18n catalog exported as a real subpath with its types reachable from `index.d.ts`, snapshotted by validate:exports so removal fails a gate. Verify from a packed tarball that the `@dzup-ui/contracts` extensionless-re-export defect is closed at 99b963a.</task>

<motivation>The repository's install docs are fixture-backed (P1-04) and its ESM was still broken for a whole package until a Pro rehearsal tripped over it. A gate that imports every published entry is the cheapest gate in the program and the one that would have caught G8-7, D4 and the 27 specifiers. It must land before ADR acceptance (N5-03's sequencing note) because ADR-20's i18n promises are unverifiable while the catalog cannot be imported.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -c 'validate:published-imports' package.json` → ≥ 2 (script + inside the validate:all chain).
  - `grep -n 'dist' package.json | grep -i 'nuxt-fixtures:pack'` shows a build or freshness step before packing (or `scripts/` contains it and the handoff names it).
  - `node -e "console.log(Object.keys(require('./packages/core/package.json').exports))"` lists an i18n subpath (e.g. `./i18n`), and from a scratch dir with the packed core tarball installed `node -e "import('@dzup-ui/core/i18n').then(m=>console.log(Object.keys(m).length))"` prints > 0.
  - `git log --oneline -1 -- packages/tooling/src/validators/exports*` is newer than `5773f65` and the exports snapshot contains the i18n entry.
  - From a scratch dir: `node -e "import('@dzup-ui/contracts')"` exits 0 against the packed tarball of 99b963a.
</done_check>

<discovery>
  1. Read N5-03's D3(2) note and the contracts ESM fix (27 specifiers) to learn what class of defect the gate must catch (extensionless relative specifiers, missing `type: module` conditions, `.d.ts` pointing outside the package).
  2. Read N5-04 D4: which three import paths fail with ERR_PACKAGE_PATH_NOT_EXPORTED and where the `declare module` augmentation lives; read packages/core/src/i18n/{messages,useComponentMessages}.ts to see what the public surface should be.
  3. Read N5-04 F10 and scripts around `test:nuxt-fixtures:pack`; confirm with a deliberately stale dist that the current command passes when it should not.
  4. Read packages/tooling/scripts/release-policy.json `published` list — those six packages are the gate's inventory; withheld/private packages are reported, not gated.
</discovery>

<requirements>
  <gate_scope>The import gate covers every package in `published`, every `exports` key, every condition (`import`, `types` via `tsc --noEmit` on a generated probe, and `default`). It runs against tarballs in a temporary directory, with `--ignore-scripts`, and cleans up. Runtime under 3 minutes or it records why.</gate_scope>
  <failure_shape>
    <example>
      validate:published-imports FAILED
        @dzup-ui/core@0.2.0  ./i18n  import  → ERR_PACKAGE_PATH_NOT_EXPORTED (exports has no "./i18n")
        @dzup-ui/contracts@0.1.0  .  import  → SyntaxError: ./types/base (extensionless specifier at dist/index.js:12)
      2 of 41 entries failed · tarballs: /tmp/dzup-pack-xxxx
    </example>
  </failure_shape>
  <freshness>The pack step either runs `yarn build` for the packages it packs or compares the newest mtime under `packages/*/src` with `dist` and refuses when dist is older; the refusal message names both timestamps.</freshness>
  <i18n_export>The catalog subpath exports the catalog value, the message key types and the augmentation entry; `DzMessageCatalog` augmentation must be reachable from the package's root `index.d.ts` (consumers see a non-empty type). No component behaviour changes. A changeset (`minor` under VERSIONING.md if any existing import path changes; otherwise `patch`) accompanies it.</i18n_export>
  <no_scope_growth>No locale pack, no plural formatter (TASK-R5-O4). No Pro packages (Pro has its own consumer matrix).</no_scope_growth>
</requirements>

<steps>
  1. Complete <discovery>; reproduce D4 and F10 before editing; record the reproduction commands.
  2. Build `validate:published-imports` in packages/tooling with a seeded failure (an export pointing at a missing file) proving it fires; add it to validate:all.
  3. Export the i18n subpath + types; extend the validate:exports snapshot; run the new gate — it must now pass for `./i18n`.
  4. Add the freshness check to the pack path; prove it with a stale dist.
  5. Verify the contracts tarball imports cleanly; record the result for FORM-R7 row 50 / G8-7.
  6. Full validation ladder; handoff with the gate's inventory (packages × entries) and runtime.
</steps>

<validation>
  yarn validate:published-imports; echo "exit $?"              # read directly, never through a pipe
  yarn validate:exports; echo "exit $?"
  yarn test:nuxt-fixtures:pack; echo "exit $?"                  # then stale-dist negative test
  yarn test packages/core/src/i18n; echo "exit $?"
  yarn validate:all > /tmp/validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>The import gate covers 100 % of `exports` entries of the six published packages, fails on a seeded defect, passes at HEAD, and is a validate:all link; `import('@dzup-ui/core/<i18n subpath>')` works from a packed tarball with a non-empty catalog type; the pack path refuses a stale dist; the contracts ESM verification is recorded; validate:all links 37 → 38 (or more) with exit 0.</success_criteria>

<stop_conditions>Stop and report when an `exports` entry cannot be made importable without a breaking path change beyond the i18n subpath (that is a VERSIONING decision for TASK-R0-O1); when the gate needs network access; when the freshness check would force a full build into every test run (propose the cheaper mtime check instead).</stop_conditions>
```

---

## 🟠 Release evidence and its execution

### [x] TASK-R1-O3 — Release evidence parity with Pro: API diff, SBOM, hashes, rehearsal, the 8-section report 🟠

_Gap: the 08-11 validation matrix (doc 08 §Package, §Report) requires per
release an API diff, an SBOM with a vulnerability and licence report, tarball
hashes and provenance, and an 8-section release report. Pro built all of
these (REL-01/02/03: `tools/release/{api-diff,evidence,consumer-matrix}.mjs`,
`docs/qa/release/2026-09-03-cda4816/{ledger,recommendation,canary}.md`). OSS
at `99b963a` has `validate:licenses`, a `rehearse:release` script, and CI
workflows that request `id-token: write` but have never exercised provenance —
no API diff, no SBOM, no hash record, no report has ever been produced
(R-038, R-041, R-060). Sources: CAND-18, 08-11 doc 08, 08-11 doc 06 §Supply chain._

```xml
<role>You are a release engineer in ui/dzup-ui with read access to ui/dzup-ui-pro. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Port patterns; do not copy files across repositories without adapting them to OSS's packages, manifests and policy.</role>

<task>Give OSS the same release evidence Pro has: (1) an API-diff tool in packages/tooling that records the public surface of every published package at a clean commit and diffs a candidate against it, classifying changes per packages/contracts/VERSIONING.md (0.x: minor = breaking) — and that reports the `generate:exports` drift (would drop 5 composables, add 2) as a finding for TASK-R0-O1; (2) a release-evidence tool producing a CycloneDX SBOM, a vulnerability + licence report with owned exceptions, per-tarball hashes and a provenance statement; (3) a run of scripts/release-rehearsal (the existing `rehearse:release`) at HEAD; (4) the first OSS release report under docs/qa/release/<date>-<sha>/ with the eight independent sections doc 08 §Report requires, every row bound to one commit.</task>

<motivation>The 1.0 exit memo says nothing here has been verified in CI and no rehearsal bundle has ever been produced; the 08-11 release stop conditions ("unexplained API diff", "tarball ≠ reviewed build") cannot even be evaluated without these tools. Pro's rehearsal found four packaging defects invisible from the worktree; OSS has never looked.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `ls packages/tooling/src/release/` (or the location the handoff names) contains an api-diff module and an evidence module; `grep -c 'release:api-diff\|release:api-surface:record\|release:evidence' package.json` → ≥ 3.
  - `ls docs/qa/release/` shows a `<date>-<sha>` directory whose `ledger.md` first row names a clean commit and whose `sbom.cdx.json` exists.
  - `node -e "const s=require('./docs/qa/release/'+require('fs').readdirSync('docs/qa/release').sort().pop()+'/sbom.cdx.json');console.log(s.bomFormat)"` prints `CycloneDX`.
  - The report has all eight section headings of 08-11 doc 08 §Report (custody · aggregate gates · browser/AT by tier · package matrix · API diff · supply chain · canary · operator approval — as named in the doc).
</done_check>

<discovery>
  1. Read ui/dzup-ui-pro/tools/release/*.mjs, ui/dzup-ui-pro/docs/qa/release/2026-09-03-cda4816/{ledger,recommendation}.md and the REL-01/02/03 handoffs to learn the shapes and the six evidence-layer defects (E-1…E-6) — do not port those defects (cap-50 dirty list, first-path truncation, ledger promotion on file existence).
  2. Read workspace-docs/repos/ui/docs/architecture/dzup-ui-system-reassessment-2026-08-11/08-validation-and-release-matrix.md §Package and §Report for the exact rows and section names.
  3. Read packages/tooling/scripts/release-policy.json and packages/contracts/VERSIONING.md; the API diff classifies against them.
  4. Run the existing `rehearse:release` once as-is and record what it covers today.
</discovery>

<requirements>
  <api_surface>Recorded surface = every runtime export and every exported type of every published package, taken from the built dist declarations (the packed truth), keyed by package + subpath. `release:api-surface:record` refuses to run on a dirty tree. The diff classifies each change (added / removed / signature changed / deprecated) and maps it to the changeset level VERSIONING.md requires; an unexplained removal is a release stop condition, reported not auto-fixed.</api_surface>
  <supply_chain>SBOM in CycloneDX JSON for each tarball; vulnerability report from the lockfile (record the audit source and date); licence report with an exceptions file that names an owner per exception; SHA-256 per tarball; a provenance statement recording the commit, the builder and whether trusted publishing was exercised (it was not — say so).</supply_chain>
  <admissibility>Every artifact carries `sourceCommit` and `admissible: true|false` (false on a dirty tree), the Pro convention. Provenance fields are never byte-compared by a gate.</admissibility>
  <report>
    <example>
      ## 1. Custody
      | Candidate | Commit | Worktree | Tarballs (sha256) |
      |---|---|---|---|
      | @dzup-ui/core 0.2.0 | 99b963a | clean (0 entries) | 3f9c…e1 |
      ## 5. API diff
      | Package | Added | Removed | Changed | Level required | Changeset present |
      |---|---|---|---|---|---|
      | @dzup-ui/core | 2 composables | 5 composables (generate:exports drift — owner decision R0-O1) | 0 | minor | no |
    </example>
  </report>
  <no_publication>No `changeset version`, no `changeset publish`, no tag, no push. The operator-approval section stays empty by design.</no_publication>
</requirements>

<steps>
  1. Complete <discovery>; write the tool inventory (Pro pattern → OSS adaptation) in the handoff before coding.
  2. Build the API-surface recorder + diff; record the surface at HEAD; run the diff against the `generate:exports` dry-run output and report the 5/2 drift.
  3. Build the evidence tool (SBOM, vuln, licence, hashes, provenance) with admissibility stamping.
  4. Run the rehearsal; write the 8-section report; every row bound to `git rev-parse HEAD`.
  5. Wire `release:*` scripts; add the API diff to `rehearse:release`; handoff with what the report found.
</steps>

<validation>
  yarn release:api-surface:record; echo "exit $?"        # refuses on a dirty tree — prove it once
  yarn release:api-diff; echo "exit $?"
  yarn release:evidence; echo "exit $?"
  yarn rehearse:release > /tmp/rehearsal.log 2>&1; echo "exit $?"
  yarn validate:licenses && yarn validate:all > /tmp/validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>API surface recorded at a clean HEAD; diff tool classifies a seeded removal as a stop condition; SBOM validates as CycloneDX; hashes and provenance recorded; the first OSS release report exists with all eight sections and no row unbound; the `generate:exports` drift appears as an owner finding, not a silent resolution.</success_criteria>

<stop_conditions>Stop and report when the audit source is unavailable offline (record the gap, do not fabricate a vulnerability count); when the API diff finds a removal no changeset explains (release stop condition — report to TASK-R0-O1); when porting a Pro tool would import Pro runtime code into OSS (forbidden dependency direction).</stop_conditions>
```

---

### [!] TASK-R1-O4 — CI dispatch of the never-run lanes and a minimum-peer lane 🟠 `[!owner dispatches]`

_Gap: three CI workflows exist and have never run: `validate-min-runtime`
(the ADR-18 Node floor `^20.19.0 || >=22.13.0` — "a floor nothing has run on
is a claim, not a floor", 1.0 criterion C10), `nuxt-majors` and `vue-next`
(the Vue 3.6-RC lane, 9,181/9,183 locally). The 08-11 package matrix also
requires a *minimum* Vue/Reka peer lane; only *current* versions are exercised
(R-058c). Sources: `../program-2026-09/reports/N5-03-toolchain-currency-handoff.md`,
`1-0-exit-criteria-2026-09.md` C10, 08-11 doc 08 §Package._

```xml
<role>You are a CI engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You prepare dispatchable workflows and a dispatch request; you never dispatch — CI dispatch is owner authority.</role>

<task>Make the three never-run workflows dispatchable and provably correct (dry-validated locally where the matrix allows), add a minimum-peer lane that installs the lowest declared `vue` and `reka-ui` peer versions and runs the focused suites, write a dispatch request naming each workflow's expected outcome and what a red result would mean, and — after the owner dispatches — triage the results and record the first runs in the evidence pages (`apps/docs` evidence section, capability matrix cells that read CI evidence).</task>

<motivation>The runtime floor, the Nuxt majors and Vue 3.6 are all claims the README generates from package.json; none has a recorded run. Criterion C10 exists because a floor nothing has executed on is not a floor. The min-peer lane closes the last row of the package matrix that has no lane at all.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `ls .github/workflows/ | grep -E 'validate-min-runtime|nuxt-majors|vue-next'` → all three present; each has `workflow_dispatch:`.
  - `ls .github/workflows/ | grep -i 'min-peer'` → a minimum-peer workflow exists (or the lane is a matrix entry inside an existing workflow — the handoff names it).
  - `ls docs/program-2026-09-04/reports/ | grep -i 'ci-dispatch'` → a dispatch request/record exists; if it records a run id and result for each workflow, the task is done.
  - `grep -rn 'validate-min-runtime' apps/docs/evidence/*.md | head -1` shows a recorded run (not "never dispatched").
</done_check>

<discovery>
  1. Read the three workflow files; note their triggers, matrices and the exact commands; compare with the N5-03 handoff's description of what each should prove.
  2. Read ADR-18 for the declared floor and the N5-04 D3 memo (Node floor decoupled from the RTL list); the min-runtime lane must run the *declared* floor, not this machine's Node 24.
  3. Read packages/core/package.json and packages/*/package.json peer ranges; the lowest declared `vue` and `reka-ui` versions are the min-peer inputs. Check yarn's resolution for pinning a lower peer inside a workspace (a scratch consumer may be needed).
  4. Locally, run the commands each workflow would run under the current Node to separate "workflow bug" from "lane fails on the floor".
</discovery>

<requirements>
  <dispatchable>Every workflow has `workflow_dispatch` with documented inputs; no workflow mutates the repository, publishes, or writes to a baseline; artifacts are uploaded, not committed.</dispatchable>
  <min_peer>The lane installs the minimum declared `vue` and `reka-ui`, runs typecheck + `yarn test` for core + contracts + the Nuxt unit suite, and reports the versions it actually resolved (a lockfile can silently lift a floor — assert the installed version equals the floor).</min_peer>
  <request>
    <example>
      | Workflow | Ref | Expected | If red it means |
      |---|---|---|---|
      | validate-min-runtime | main@99b963a | validate:all exit 0 on Node 20.19 and 22.13 | ADR-18's floor is false; amendment needed before 1.0 (C10) |
      | vue-next | main@99b963a | 9,181/9,183 with the 2 known Vapor exclusions | a Vue 3.6 regression — watch-list item becomes a task |
    </example>
  </request>
  <recording>After dispatch: each run id, date, ref, result and log link go into the handoff and into the evidence pages' generator input (not hand-typed into a page).</recording>
</requirements>

<steps>
  1. Complete <discovery>; fix any workflow defect found by the local dry run.
  2. Add the min-peer lane; prove locally (scratch consumer) that it resolves the floor versions.
  3. Write the dispatch request in docs/program-2026-09-04/reports/ci-dispatch-request-2026-09.md; stop here and hand off — `[!owner dispatches]`.
  4. After the owner dispatches: triage each result, fix workflow bugs (not lane failures — those become findings with a task id), record the runs, regenerate the evidence pages.
</steps>

<validation>
  npx yaml-lint .github/workflows/*.yml 2>/dev/null || node -e "require('js-yaml')"   # or the repo's workflow linter
  yarn validate:engines; echo "exit $?"
  yarn test packages/nuxt; echo "exit $?"
  yarn validate:docs-pages; echo "exit $?"                                             # after recording runs
</validation>

<success_criteria>Three workflows dispatchable and locally dry-validated; a min-peer lane exists and asserts the resolved floor; the dispatch request names expected outcomes; after dispatch, every run is recorded with id/date/result and the evidence pages no longer say "never dispatched" for C10.</success_criteria>

<stop_conditions>Stop at the dispatch request — the owner dispatches. Stop and report when the min-peer lane cannot pin a lower `reka-ui` because of a transitive constraint (that is peer-hygiene input for TASK-R1-O6); when a lane fails on the declared floor (ADR-18 amendment input for TASK-R0-O2, not a fix here).</stop_conditions>
```

---

### [!] TASK-R1-O5 — Docs-site publication readiness: size gate, registry gate, content defects, deployment packet 🟠 `[!owner deploy]`

_Gap: the VitePress site (`apps/docs`, 144 component pages + evidence pages,
`validate:docs-pages` green) is built, not live: the domain does not resolve
(A4-D1, NXDOMAIN), the dist is the only static artifact in the repo under
**no size gate** (16.04 → 20.67 MB after N2-D2 per its handoff; 29.82 MB at
the 1.0 memo — D3-D3), `validate:registry` does not exist while 282 files ship
under `apps/landing/public/r/` (A4-D3), the registry theme item is inert and
unlayered (A4-F4), 12 descriptions carry unescaped HTML, 15 examples are not
paste-ready, 3 components have no prose (`DzAsyncBoundary`, `DzErrorBoundary`,
`DzFieldArray`), and the playground chrome is not page-conditional (D3-F8).
Sources: `../program-2026-09/reports/N2-D1-docs-site-handoff.md`,
`N2-D3-playgrounds-handoff.md`, `registry-evaluation-2026-09.md`, 1.0 criteria C13/C14._

```xml
<role>You are a docs-platform engineer in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Every docs page is generated; you fix generators and inputs, never a rendered page.</role>

<task>Make the docs site publishable: add a size budget for the docs dist to validate:all (ratchet down-only, seeded from the measured size); build `validate:registry` for everything under apps/landing/public/r/ (schema validity, every referenced file present, theme item layered and dark-mode-aware — A4-F4) and chain it; fix the content defects at their source (12 unescaped-HTML descriptions in component-meta, 15 non-paste-ready examples, 3 prose-less components, page-conditional playground chrome); then write the deployment packet — target (static host / Pages), domain, workflow, cache policy, rollback — for the owner. Do not deploy.</task>

<motivation>Criterion C14 ("docs site under a size gate and deployed") and C13 (`validate:registry` before anything is published from `/r/`) are the two 1.0 criteria that are cheap engineering plus one owner decision. A 20–30 MB static site with no budget will grow unnoticed; a registry that ships 282 files that resolve nothing (npm 404) is a consumer trap the day the packages publish.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -c 'validate:registry' package.json` → ≥ 2 (script + inside validate:all); `yarn validate:registry; echo "exit $?"` → 0.
  - `grep -n 'docs' packages/tooling/scripts/*budget*.json 2>/dev/null | head -1` (or the bundle-budget config the handoff names) contains an `apps/docs` dist entry with a byte ceiling.
  - `yarn validate:docs-pages; echo "exit $?"` → 0 and its output reports 0 unescaped-HTML descriptions and 0 non-paste-ready examples.
  - `ls docs/program-2026-09-04/reports/ | grep -i 'docs-deployment'` → a deployment packet exists; `curl -sI https://<domain>/ | head -1` returns 200 only if the owner has deployed (then the task is fully done).
</done_check>

<discovery>
  1. Read the N2-D1/D2/D3 handoffs' findings sections (D1-D4/D3-D3 size, D3-F8 chrome, D3-F10 ungated artifacts) and the registry study's A4-D3/A4-F4/A4-F5 items (Pro source registry is irrevocable — compositions only).
  2. Measure the dist: `yarn docs:build` then `du -sb apps/docs/.vitepress/dist`; record the number as the seed ceiling.
  3. Find where component descriptions enter component-meta.json (N2-A2) and where examples are marked paste-ready; the 12/15/3 defects are input defects.
  4. Read the existing `validate:bundle-budget` to reuse its ratchet mechanics for the docs dist.
</discovery>

<requirements>
  <size_gate>One ceiling for the docs dist, seeded at the measured size rounded up ≤ 5 %, ratchet down-only, in validate:all; the failure message names the biggest three files.</size_gate>
  <registry_gate>Validates every `registry.json`/item against the schema the study verified, checks every `files[].path` exists, forbids source-copy of Pro components (A4-F5), and requires the theme item to declare its cascade layer and both colour schemes. Seeded failure proves it fires.</registry_gate>
  <content>Descriptions are escaped at the generator, not the page; the 15 examples get a real runnable seed or a typed refusal reason (D3's refusal vocabulary); the 3 prose-less components get a description in their `.types.ts` doc comment (the meta pipeline's source).</content>
  <deployment_packet>
    <example>
      | Item | Recommendation | Alternative | Owner input |
      |---|---|---|---|
      | Host | GitHub Pages from a `docs-deploy` workflow on tag | Cloudflare Pages | which org account |
      | Domain | dzup-ui.com → CNAME | subpath of datazup.com | DNS authority |
      | Cache | immutable hashed assets, 5 min HTML | — | — |
      | Rollback | redeploy previous tag | — | — |
    </example>
  </deployment_packet>
  <no_deploy>No DNS change, no hosting account, no deploy workflow run. The packet ends at the owner.</no_deploy>
</requirements>

<steps>
  1. Complete <discovery>; record the measured dist size and the defect inventory.
  2. Build the size gate; build validate:registry with a seeded failure; chain both.
  3. Fix the content defects at their sources; regenerate meta → docs pages; confirm validate:docs-pages reports zero.
  4. Make the playground chrome page-conditional (D3-F8) without a second implementation.
  5. Write the deployment packet; hand off — `[!owner deploy]`.
</steps>

<validation>
  yarn docs:build; echo "exit $?"; du -sb apps/docs/.vitepress/dist
  yarn validate:registry; echo "exit $?"
  yarn validate:docs-pages && yarn validate:component-meta && yarn validate:playground-parity; echo "exit $?"
  yarn validate:all > /tmp/validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Docs dist under a down-only ceiling in validate:all; validate:registry green at HEAD and red on a seeded defect; 12 → 0 unescaped descriptions, 15 → 0 non-paste-ready examples (or typed refusals), 3 → 0 prose-less components; chrome page-conditional; deployment packet written with a recommendation per item.</success_criteria>

<stop_conditions>Stop and report when the dist cannot get under a sane ceiling without dropping content (that is a scope decision — propose the split, do not cut); when a registry item can only pass by copying Pro source (forbidden); when a description fix would require changing a public prop's documented meaning.</stop_conditions>
```

---

## 🟢 Hygiene and owner packets

### [!] TASK-R1-O6 — Peer and dependency hygiene execution 🟢 `[!owner]`

_Gap: `lucide-vue-next@0.477` is deprecated upstream in favour of `@lucide/vue`
1.0, two versions are installed and no gate notices (N5-04); `reka-ui` is a
non-optional peer because of a single edge `DzSpeedDial → DzTooltip` (N5-04
D1: leave as is — measured); the Node floor decision is open and now decoupled
from the RTL list (N5-04 D3: `getTextInfo` first in Node 24); `apps/sandbox`
was retired and is still a live workspace (P-422). `report:peer-surface` exists
and is report-only. Sources: `../program-2026-09/reports/N5-04-peer-hygiene-handoff.md`,
`peer-hygiene-2026-09.md`, 08-28 gap analysis §C rows 8 and 17._

```xml
<role>You are a dependency steward in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. A dependency change is a public-API change under VERSIONING.md; every one carries a changeset and an owner decision.</role>

<task>Prepare, and where the owner has already decided execute, the four hygiene items: (1) the `lucide-vue-next` → `@lucide/vue` swap contract (icon-name mapping, tree-shaking check, codemod entry, changeset level) plus a gate that fails when two icon-library versions are installed; (2) the recorded `reka-ui` decision (leave; document the single edge and the condition that would reopen it); (3) the Node-floor memo (drop 20 or keep; inputs: N5-04 D3, Nuxt 4.4.6+ dropping Node 20 per N5-03 D4, the ADR-18 floor, `validate-min-runtime` results from TASK-R1-O4); (4) the `apps/sandbox` removal or a written justification for keeping a retired workspace.</task>

<motivation>A deprecated icon dependency with two installed versions is the kind of thing a supply-chain report (TASK-R1-O3) will flag on every release; deciding it once, with a swap contract and a gate, is cheaper than explaining it each time. The Node floor decides what ADR-18 says at acceptance.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `yarn why lucide-vue-next 2>/dev/null | grep -c 'lucide-vue-next@'` → 0 (swapped) or 1 (single version) and `grep -c '@lucide/vue' packages/core/package.json` → 1 if swapped.
  - A gate exists that fails on two installed icon-library versions (`grep -rn 'icon' packages/tooling/src/validators/*peer* | head -1` or the script the handoff names).
  - `ls docs/program-2026-09-04/reports/ | grep -i 'peer-hygiene'` → a decision memo with the four items each marked decided/recommended.
  - `ls apps/ | grep -c sandbox` → 0, or the memo records the owner's keep decision.
</done_check>

<discovery>
  1. Read peer-hygiene-2026-09.md and the N5-04 handoff (D1–D4, F10); run `yarn report:peer-surface` and `yarn why lucide-vue-next` and record the two versions and their importers.
  2. Inventory every `lucide-vue-next` import in packages/core/src and stories; check `@lucide/vue` 1.0's export names against them (a mapping table is the contract).
  3. Read ADR-18 and the N5-03/N5-04 Node inputs; if TASK-R1-O4's min-runtime run exists, read its result.
  4. Check what `apps/sandbox` is still wired into (workspaces, changesets config, CI).
</discovery>

<requirements>
  <swap_contract>Mapping table old → new for every icon used; a codemod transform in packages/codemods with fixtures; bundle-size before/after via validate:bundle-budget; changeset `minor` (a peer/dependency change is breaking under 0.x). Execute only if the owner has decided; otherwise stop at the packet.</swap_contract>
  <gate>The two-versions gate reads the lockfile, fails when more than one version of the icon library (either name) resolves, and joins `validate:peers`.</gate>
  <memo>
    <example>
      | # | Item | Options | Recommendation | Blocks |
      |---|---|---|---|---|
      | 1 | lucide swap | (a) swap now, minor · (b) pin + gate, swap at 1.0 | (a) — deprecated upstream, two versions today | supply-chain report cleanliness |
      | 3 | Node floor | (a) keep ^20.19 · (b) drop to >=22.13 with Nuxt 4.4.6+ | decide after validate-min-runtime runs | ADR-18 acceptance text |
    </example>
  </memo>
  <no_scope_growth>No other dependency bumps; no Reka major; nothing published.</no_scope_growth>
</requirements>

<steps>
  1. Complete <discovery>; write the memo with all four items.
  2. Build the two-versions gate (fires today — prove it), join validate:peers.
  3. Prepare the swap contract + codemod + fixtures; run the bundle comparison; stop before applying unless decided `[!owner]`.
  4. Hand off with the memo and the gate's current (red) state.
</steps>

<validation>
  yarn report:peer-surface; yarn validate:peers; echo "exit $?"     # read directly
  yarn test packages/codemods; echo "exit $?"
  yarn validate:bundle-budget; echo "exit $?"
</validation>

<success_criteria>Memo with four decided/recommended items; two-versions gate exists and reflects reality; swap contract complete with mapping, codemod fixtures and measured bundle delta; if executed, one icon library version installed and all icons render (storybook:test green).</success_criteria>

<stop_conditions>Stop at the memo for any item the owner has not decided. Stop and report when `@lucide/vue` lacks an icon the library uses (contract gap — list them); when removing `apps/sandbox` breaks a changeset or fixture reference.</stop_conditions>
```

---

## 🔴 / 🟠 Owner packets

### [!] TASK-R0-O1 — Publication decision packet and the consolidated owner-decision register 🔴 `[!owner]`

_Gap: the N1/N2/N5 ledgers hold ~125 open `[!owner]` items scattered across
three status files and 28 handoffs; nothing consolidates them, so the two that
gate everything — **A4-D1 publish-or-freeze** (packages 404 on npm, the domain
does not resolve, three registries ship 282 files that resolve nothing) and
**N5-01 D1** (`validate:changelog` needs an ISO date, `validate:mcp` forbids
one; the first `changeset version` turns validate:all red) — sit beside items
like the 29 unclassified ownership entries and schema 1.2.0 kinds, the
`generate:exports` drift (would drop 5 composables, add 2 — N0-05 F3), the
10 over-declared changesets (N5-01 D3), the permanently unreleasable
`@dzup-ui/compat` / `@dzup-ui/codemods` (N5-01 D2), Chromatic finish-or-retire,
the visual baseline platform, and `securityBoundary` set-valued. Criteria
C11/C12/C15 cannot move until someone decides. Sources: CAND-30,
`../program-2026-09/EXECUTION-STATUS{,-N2,-N5}.md`, `registry-evaluation-2026-09.md`,
`N5-01-release-policy-handoff.md`._

```xml
<role>You are a release manager preparing decisions in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. You consolidate, measure, recommend; you decide nothing.</role>

<task>Produce two documents: (1) docs/program-2026-09-04/reports/owner-decision-register-2026-09.md — one row per open `[!owner]` item across the N1/N2/N5 ledgers and handoffs (id · raised by · what it blocks · options · recommendation · state), grouped by what they gate (publication · 1.0 · evidence · hygiene); (2) a publication decision packet for A4-D1 — the 20 pending changesets with their declared levels and the level VERSIONING.md requires, the two withheld packages and what withholding costs, the D1 proof from TASK-R1-O1 (or reproduce it in a scratch copy — never on the tree), the D3 re-levelling proposal, the `generate:exports` 5/2 drift with the API-diff evidence from TASK-R1-O3, and the three options (publish 0.x now · freeze and stop advertising install commands · publish to a private registry first) each with its first implementation packet. Stop at the owner.</task>

<motivation>Every consumer surface built in N2 (docs, MCP, llms.txt, registries) advertises packages that do not exist on npm. Publish-or-freeze is the decision that makes those surfaces honest, and it cannot be taken while its inputs are spread over 28 reports. A register that other ledgers link to instead of restating is also how the next program avoids re-deriving ~125 decisions.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `ls docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` exists and `grep -c '^| ' docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` → ≥ 100 rows.
  - `ls docs/program-2026-09-04/reports/ | grep -i 'publication-decision'` → the packet exists with the three costed options.
  - `grep -n 'A4-D1' docs/program-2026-09-04/reports/owner-decision-register-2026-09.md` shows state `decided` with a date → fully done; `open` → the packet is done, the decision is not (leave `[!]`).
</done_check>

<discovery>
  1. Extract every `[!owner]` / "Owner decision" row from ../program-2026-09/EXECUTION-STATUS.md, EXECUTION-STATUS-N2.md, EXECUTION-STATUS-N5.md and each reports/*-handoff.md; keep the original ids (N5-01 D1, A4-D3, S1-D4 …).
  2. Read registry-evaluation-2026-09.md §options and its verified-vs-unverified split; read N5-01's system-of-record memo §6 (D1) and 1-0-exit-criteria-2026-09.md §3 (C11–C15).
  3. List .changeset/*.md with their frontmatter levels; read packages/tooling/scripts/release-policy.json for `published`/`withheld` and validate-release-policy's rules.
  4. If TASK-R1-O1's D1 proof and TASK-R1-O3's API diff exist, cite them; otherwise reproduce D1 in a scratch copy only.
</discovery>

<requirements>
  <register>
    <example>
      | Id | Raised by | Gates | Options | Recommendation | State |
      |---|---|---|---|---|---|
      | A4-D1 | N2-A4 registry-evaluation-2026-09.md | every consumer surface; C12 | publish 0.x · freeze + stop advertising · private registry first | publish 0.x after R1-O1/R1-O2 are green; freeze the registries until then | open |
      | N5-01 D1 | N5-01-release-policy-handoff.md | first `changeset version`; C15 | relax validate:mcp anchor rule · make validate:changelog accept the mcp heading | (b) — one-line gate change | open |
    </example>
    Every row cites the report by path; no row restates a decision already taken (mark `decided <date>` with the evidence).
  </register>
  <packet>Each option carries its first implementation packet (task ids from this program), its risk, and what it costs in the consumer surfaces (docs, llms.txt, MCP, registry). The changeset table shows declared level vs required level per VERSIONING.md and flags the 10 over-declared ones (D3).</packet>
  <no_action>No changeset edited, no `changeset version`, no publish, no registry mutation, no DNS. Read-only on everything but the two new documents.</no_action>
</requirements>

<steps>
  1. Complete <discovery>; build the register (aim for completeness over polish — every open item, once).
  2. Write the publication packet with the three options and the changeset table.
  3. Cross-link: each predecessor ledger's owner-decision section gets a one-line pointer to the register (append, do not rewrite history).
  4. Hand off; mark the task `[!]` until A4-D1 is decided.
</steps>

<validation>
  ls .changeset/*.md | wc -l                                    # 20 expected at 99b963a
  yarn validate:release-policy; echo "exit $?"
  # in a scratch copy only: yarn changeset version && yarn validate:changelog; yarn validate:mcp
</validation>

<success_criteria>Register complete (every open `[!owner]` from N1/N2/N5 appears once with a recommendation), publication packet decidable in one sitting, D1 proven with the exact failing validator, changeset table complete; the owner can take A4-D1 from the packet alone.</success_criteria>

<stop_conditions>Stop at the packet — the owner decides. Stop and report when two ledgers record contradictory states for the same decision (record both, flag it); when an option requires infrastructure that does not exist (private registry) — describe, do not build.</stop_conditions>
```

---

### [!] TASK-R0-O2 — ADR-18 / ADR-19 / ADR-20 acceptance execution 🟠 `[!owner]`

_Gap: all three load-bearing ADRs carry `Status: Proposed` at `99b963a` while
32 anatomy files, 27 `ui` props and 10 provider composables are built on
them; acceptance packets exist (`../program-2026-09/reports/N5-05-adr-19-acceptance-packet.md`
with 13 divergences, `N5-05-adr-20-acceptance-packet.md` with 9). ADR status is
gated nowhere: ADR-18/19/20 are absent from `adr-registry.json` (ceiling 14
undocumented) and the ADR-debt ratchet is status-blind, so acceptance moves it
by zero. Pending inputs: ADR-18 amendment (Node floor decoupled from RTL —
N5-04 D3; Nuxt 4.4.6+ drops Node 20 — N5-03 D4), the two-ADR-13 collision
(Core/Pro number clash), `ariaInvalid` misplaced in `BaseAccessibilityProps`
(N5-02 D1, a contracts-wide `minor`). Criterion C1. Depends on TASK-R5-O1
(the code the ADR-19 packet says must exist first) and TASK-R1-O2 (N5-03's
sequencing note). Sources: OSS-R12, `N5-05-adr-acceptance-handoff.md`._

```xml
<role>You are the ADR steward in ui/dzup-ui. Follow <repo_conventions> in docs/program-2026-09-04/README.md §5. Acceptance is the owner's signature; you execute the consequences of a decision that has been taken, and prepare the rest.</role>

<task>For each of ADR-18/19/20: (1) confirm the packet's preconditions are met (TASK-R5-O1's cascade layers / DataState widening / vocabulary for ADR-19; TASK-R1-O2's import gate for ADR-20's i18n promises; the Node-floor memo from TASK-R1-O6 for ADR-18); (2) apply the packet's amendments to the ADR text (ADR-19: 8 amend-ADR items; ADR-20: motion §7 consumers-or-amendment, the sanitizer seam for Pro from TASK-R3-O2; ADR-18: floor decoupled from RTL, Nuxt 4.4.6+ consequence); (3) if the owner has accepted, flip `Status: Accepted (<date>, <owner>)` in the ADR file itself; (4) register 18/19/20 in adr-registry.json and make the ADR gate status-aware (Proposed ADRs that code cites become a counted debt; Accepted ones clear it); (5) resolve the two-ADR-13 collision (renumber or namespace, with cross-references); (6) move `ariaInvalid` to `BaseValidationProps` with a `minor` changeset.</task>

<motivation>Code is building on decisions nobody has signed; the 1.0 memo's first criterion is the three signatures. A status-blind registry means acceptance changes nothing measurable — fixing that makes "ADRs accepted" a gate, not prose.</motivation>

<done_check>
  Run from ui/dzup-ui. If every check passes, record `[x] found-done <date>` in EXECUTION-STATUS.md and move on; if some pass, run only the residual steps.
  - `grep -n 'Status:' docs/adr/ADR-18-*.md docs/adr/ADR-19-*.md docs/adr/ADR-20-*.md` → all three `Accepted`.
  - `node -e "const r=require('./packages/tooling/scripts/adr-registry.json');console.log(['ADR-18','ADR-19','ADR-20'].every(id=>JSON.stringify(r).includes(id)))"` (adjust path to the registry the handoff names) → `true`, and `yarn validate:adr-references` reports statuses.
  - `grep -n 'ariaInvalid' packages/contracts/src/*.ts` shows it under the validation props type, not `BaseAccessibilityProps`.
  - `ls docs/adr/ | grep -c 'ADR-13'` → 1 in this repo with a cross-reference note resolving the Core/Pro collision.
</done_check>

<discovery>
  1. Read both acceptance packets in full: the divergence tables (13 and 9) and which items are amend-ADR vs fix-code; check each fix-code item against the tree (TASK-R5-O1 may have landed them).
  2. Read ADR-18 and the N5-03 D4 / N5-04 D3 inputs; draft the amendment text.
  3. Read the ADR registry and `validate:adr-references`; find where status could be read (a `Status:` line parser) and where the ratchet is computed.
  4. Read N5-02 D1 for the `ariaInvalid` misplacement and the components that consume it.
</discovery>

<requirements>
  <preconditions>Do not flip a status whose packet preconditions are unmet; record which are unmet and stop. Acceptance text names the owner and date the owner gives — never invent either.</preconditions>
  <status_gate>The registry records status per ADR; the gate fails when a `Proposed` ADR is cited from code beyond a declared ceiling (seed the ceiling at today's count and ratchet down); `Accepted` ADRs are excluded. Seeded failure proves it.</status_gate>
  <contracts_change>`ariaInvalid` move is a `minor` under VERSIONING.md with a changeset naming every component whose props type changes; form-readiness matrix regenerated (it consumes these props).</contracts_change>
  <collision>ADR-13 exists in both repos with different subjects; resolve on the OSS side by a dated note and a stable cross-reference, never by renaming the Pro document.</collision>
</requirements>

<steps>
  1. Complete <discovery>; write the precondition table per ADR.
  2. Apply amendments; if accepted, flip statuses; register; build the status-aware gate.
  3. Move `ariaInvalid`; regenerate form-readiness; changeset.
  4. Resolve the ADR-13 collision note.
  5. Validation ladder; handoff with the ratchet (ADRs Accepted 0/3 → n/3) and the ADR-debt count.
</steps>

<validation>
  yarn validate:adr-references; echo "exit $?"          # read directly
  yarn validate:form-readiness && yarn validate:exports; echo "exit $?"
  yarn typecheck && yarn test packages/contracts packages/core/src/components/forms; echo "exit $?"
  yarn validate:all > /tmp/validate-all.log 2>&1; echo "exit $?"
</validation>

<success_criteria>Each ADR either `Accepted` with its amendments applied or left `Proposed` with an explicit unmet-precondition list; registry contains 18/19/20 and the gate is status-aware and fires on a seeded Proposed citation; `ariaInvalid` relocated with a `minor` changeset and green form-readiness; ADR-13 collision resolved; C1 measurable.</success_criteria>

<stop_conditions>Stop before flipping any status without the owner's recorded acceptance. Stop and report when an amend-ADR item would change a contract the code already violates (that is fix-code, route to TASK-R5-O1); when the status-aware gate would fail on ADR-04 (cited 547×, undocumented) — record as the ceiling's seed, do not write a retro-ADR here.</stop_conditions>
```
