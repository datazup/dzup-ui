# TASK-R3-O4 — Shared security-corpus format (OSS half) — handoff

## Progress

- 2026-09-17 — started. `main` @ `569d887` + dirty tree (251 `git status --short` lines at start, R5-O4 + R3-O3 work, not mine). Status row set `[~]`.
- Done-check run as written: 0/4 genuinely pass (check 3 reported exit 0 only because `| head` masks grep's exit 2). **Path defect**: `packages/testing/src/security-corpus/` does not exist; the corpus is `packages/testing/src/security-corpus.ts` (module) + `packages/testing/security-corpus/*.corpus.json` (data), schema `1.0.0`. Evaluated against the real location: no JSON Schema, version 1.0.0 (< 1.1.0), no incompatible-peer shape, no compatibility table → run the task in full.
- Discovery done. Read: N1-O5 handoff, corpus module/spec/README, `boundary-suites.ts`, R3-O2 handoff (seam terms), `json-schema-draft07.ts` (existing evaluator — reused, no ajv), `validate-peers.ts`, `peer-surface.ts`; Pro @ `1c55355`: `corpus/{html,markdown}.json`, `corpus.security.spec.ts`, `html-sinks.manifest.json`, `fixtures/consumers/{README.md,optional-peer/*}`, Pro TASK-R2-P9 prompt (expects an "extension namespace agreed with OSS").
- Baselines: focused lane `vitest run packages/core/security packages/testing/src/security-corpus.spec.ts packages/core/src/components/forms/DzFileUpload.spec.ts` → 7 files, **372 passed**, exit 0. `yarn validate:peers` → exit 0, 7 compatible.
- Compatibility-table draft written (`TASK-R3-O4-corpus-compatibility.md`).
- Implemented: schema 1.1.0 in `security-corpus.ts` (sinks `markdown`/`mermaid-svg`, outcome `admitted`, `extensions`, strict keys, peer-compatibility record + checker + loader); 2 JSON Schemas; 6 corpus files migrated (`$schema` + `1.1.0`); `peer-compatibility.fixtures.json` (2 records); `peer-ranges.ts` extracted from `validate-peers.ts` (output byte-identical, exit 0); gate `packages/tooling/src/validators/security-corpus.ts` → first run exit 0 (34 fixtures, 2 peer fixtures, 2 diagnostics executed).
- Specs: `packages/tooling/src/validators/security-corpus.spec.ts` 47 pass (10 seeded defects, schema⇔checker agreement table, ajv oracle); testing spec 14 → 22 pass. `validate:security-corpus` wired as link 8 of 42. Seeded proof: live edit `navigation: "sanitised"` → exit 1 (2 violations: json-schema + checker); restored (md5 OK) → exit 0. README contribution path rewritten; changeset `@dzup-ui/testing: minor`.
- Focused: 372-lane → **380 pass** (372 + 8 new), exit 0. `validate:{exports,release-policy,changelog,dts,boundaries,package-names,externals,peers}` exit 0. eslint on touched files clean; testing tsc exit 0; tooling tsc 12 errors, none in touched files (pre-existing).
- Next: `yarn validate:all` end-to-end, `yarn test`, finalize docs/status.
- 2026-09-17, second session: log verified claim by claim (§1 below). The crash broke nothing in code, but compatibility-table §6 named a record that does not exist, so it was corrected. The types ⇔ schema spec gap was closed (+7 tests). The full ladder was run. **Task closed `[x]`**, see the closing section.

---

## Closing session — 2026-09-17 (second session, same commit `569d887` + dirty tree)

The first session ended after its focused gates with "Next: `yarn validate:all`
end-to-end, `yarn test`, finalize docs/status". This session verified every
claim in the log above against the files and the gates before relying on it,
closed one requirement gap, corrected one stale section of the compatibility
table, and ran the remaining ladder. `git status --short`: **271** lines at
this session's start (251 when the task started).

### 1. Verification of the progress log (nothing trusted, everything re-run)

| Log claim | Checked how | Result |
|---|---|---|
| Schema 1.1.0 in `packages/testing/src/security-corpus.ts` | read the module | holds — `SECURITY_CORPUS_SCHEMA_VERSION = '1.1.0'` (line 87); sinks `markdown`/`mermaid-svg`, outcome `admitted`, `extensions`, strict keys, `PeerCompatibilityFixture` + checker + loader all present and complete (no half-written function) |
| 2 JSON Schemas | read both; gate + ajv oracle | holds — `packages/testing/security-corpus/{security-corpus,peer-compatibility}.schema.json`, draft-07 |
| 6 corpus files migrated | `git diff --stat` | holds — 6 files, +12/−6: each gained `$schema` and `schemaVersion 1.0.0 → 1.1.0`, **no fixture id, payload or outcome changed** |
| `peer-compatibility.fixtures.json` (2 records) | read | holds — `peer.vue.wrong-major` (incompatible, `2.7.16` vs `^3.5.0`) + `peer.reka-ui.absent` |
| `peer-ranges.ts` extracted from `validate-peers.ts`, output byte-identical | HEAD's script (via `git show`, ROOT re-pointed, run from the scratchpad) vs today's script, `diff` | holds — **IDENTICAL**, both exit 0, 7 compatible. Logic diff read line by line: only the lookup became a parameter and the print line a function. `validate-peers.ts` sits outside every tsconfig (`scripts/`), so it was type-checked standalone: exit 0 |
| Gate `packages/tooling/src/validators/security-corpus.ts` + spec | read; ran | holds — gate exit 0; spec 47/47 before this session's addition |
| `validate:security-corpus` in `validate:all` | `package.json` diff | holds — link 8 (after `i18n-packs`, which R5-O4 added at link 7) |
| README contribution path | read `packages/testing/security-corpus/README.md` | holds — §5 "Contributing a fixture", §7 "Changing the format" |
| Changeset `@dzup-ui/testing: minor` | read | holds — `.changeset/the-security-corpus-is-one-format-for-both-repositories.md` |
| "eslint on touched files clean; testing tsc exit 0; tooling tsc 12 errors, none in touched files" | re-ran | holds — eslint exit 0 over the 7 touched `.ts` files, the corpus README, both reports and the corpus JSON (the changeset is lint-ignored); testing tsc exit 0; tooling tsc exit 2 with **12** errors in 10 files, **0** in task files |

**What the crash left broken: nothing in code.** No unsorted import, no lint
error, no half-written file. **One document was wrong:** §6 of
`TASK-R3-O4-corpus-compatibility.md` named an executable example
`peer.reka-ui.wrong-major` / `1.9.0` that was never written — the data, README,
changeset, specs and gate all say `peer.vue.wrong-major` / `2.7.16`. Pro TASK-R2-P9
would have read the wrong record id. Corrected, with a dated note in the table.

### 2. What this session changed

| File | Change | Why |
|---|---|---|
| `packages/tooling/src/validators/security-corpus.spec.ts` | **+7 tests** (47 → 54): a `Record<Union, true>` table per vocabulary union and a `Presence<T>` table per record interface, asserted against the exported constants and the schemas' `properties`/`required`; plus one record carrying every optional field accepted by both validators | `<requirements><schema>` asks for types "with a spec that they agree". The gate proves *schema enum = exported constant*, but a constant typed `readonly SecuritySink[]` compiles with a member missing, and **nothing compared interface fields or optionality with the schema**. Measured blind spot: dropping `"title"` from the fixture schema's `required` leaves `validate:security-corpus` **green** (the data still has titles; the gate only flags a schema *stricter* than the checker) |
| `docs/program-2026-09-04/reports/TASK-R3-O4-corpus-compatibility.md` | §6 example corrected; §6 now lists **every** field of Pro's `optional-peer/fixture.json` (`title`, `packages`, `components`, `install.strictPeers`, lane `column`/`run`/`note`, the `not-bundled` lane) with a disposition and file:line paths; §3 URL-overlap claim made exact (same class, not byte-identical; names the two Pro URLs OSS has no fixture for) | success criterion "lists every Pro field with a disposition" + "exact paths" |

**Seed-and-prove for the new spec** — both halves bite:
- *Type half* (scratchpad file importing the real types by absolute path, `tsc` with the tooling config): `repeat` mislabelled `required` → TS2322; `SINK_TABLE` without `file` → TS2741; an extra `lane` field → TS2353. `tsc` exit 2.
- *Value half* (live edit of `security-corpus.schema.json`, `"title"` removed from the fixture `required`): spec **exit 1**, exactly `SecurityFixture: every field and its optionality match the schema` red; file restored from a byte copy, `md5sum -c` **OK**, spec exit 0 (54/54).

### 3. `<done_check>` re-run (README §4)

| # | As written | Exit | With corrected paths | Exit |
|---|---|---|---|---|
| 1 | `ls packages/testing/src/security-corpus/*.schema.json …/schema.ts` | **2 — fails** (directory does not exist) | `ls packages/testing/security-corpus/*.schema.json packages/testing/src/security-corpus.ts` | 0 |
| 2 | `grep -n "version" packages/testing/src/security-corpus/index.ts` | **2 — fails** (file does not exist) | `grep -n "SECURITY_CORPUS_SCHEMA_VERSION = " packages/testing/src/security-corpus.ts` → `'1.1.0'` | 0 |
| 3 | `grep -rn "incompatible" packages/testing/src/security-corpus \| head` | **0 — FALSE PASS**: `grep` exits 2 (no such directory), `\| head` returns 0 | `grep -rn "incompatible" packages/testing/src/security-corpus.ts packages/testing/security-corpus` → 18 lines in 4 files | 0 |
| 4 | `ls docs/program-2026-09-04/reports/TASK-R3-O4-corpus-compatibility.md` | 0 — passes as written (the file this task created) | same | 0 |

**As written: 1 genuine pass of 4 (plus 1 false pass). With corrected paths: 4 of 4.** → **D77**.

### 4. Validation (exit codes read directly, logs in the session scratchpad, never through a pipe)

Focused (narrowest first):

| Command | Exit | Result |
|---|---|---|
| `yarn test packages/testing` | 0 | 3 files / 59 tests; `security-corpus.spec.ts` **22** (14 at HEAD) |
| `yarn validate:security-corpus` | 0 | schema 1.1.0 — 6 category files, 34 fixtures valid against JSON Schema **and** checker (rejected 13 · stripped 7 · escaped 35 · inert 11 · admitted 0); 2 peer fixtures, 2 validate-stage diagnostics executed |
| same gate, CLI, `--dir` = scratchpad copy with `navigation: "rejected"` → `"sanitised"` | **1** | 18 violations, `[json-schema]` and `[checker]` both; the real directory re-run exit 0 |
| `vitest run packages/tooling/src/validators/security-corpus.spec.ts` | 0 | **54** (47 + 7 this session) |
| the 372 lane: `vitest run packages/core/security packages/testing/src/security-corpus.spec.ts packages/core/src/components/forms/DzFileUpload.spec.ts` | 0 | 7 files / **380** = 372 + the 8 new testing-spec tests — no pre-existing test changed or removed |
| `yarn validate:exports` · `yarn validate:release-policy` | 0 · 0 | 202 declared exports, 0 errors · 31 pending changesets, 0 major |
| `yarn typecheck` · `yarn lint` | 0 · 0 | (lint re-run inside the ladder after the spec addition — see below) |
| `tsc -p packages/testing` · `tsc -p packages/tooling` | 0 · 2 | tooling: 12 pre-existing errors, 0 in task files (was 7 at `99b963a`; the +5 are other packets') |
| `yarn validate:peers` | 0 | byte-identical to HEAD's script |
| `npm pack --dry-run --ignore-scripts` in `packages/testing` | 0 | tarball lists both schemas, the peer fixtures, the 6 corpus files and the README |

Aggregate (run after this session's spec addition, so it measures the final tree):

| Command | Exit | Result |
|---|---|---|
| `yarn validate:all` **end to end** | **1** | first red = **link 19 of 42, `validate:capability-matrix`**: 22 stale cells, `[tier-d] DzFileUpload browser-matrix unrun` (input `test-results/matrix-report.json` absent), `[freshness] capability-matrix.json is stale`. Links 1–18 green inside the run, including **link 8 `validate:security-corpus`** |
| every one of the 42 links, individually (`yarn <link>`, enumerated from `package.json`, not assumed) | **41 × 0, 1 × 1** | only link 19 red. Links 20–42 (`visual-baselines` … `licenses`) all exit 0; each log's last line read to rule out an `ERR_MODULE_NOT_FOUND` masquerade |
| `yarn test` (full) | **1** | 533 files (3 failed) · **9,947 tests: 3 failed · 9,939 passed · 4 skipped · 1 todo**. This task's files inside the run: `packages/testing/src/security-corpus.spec.ts` 22/22, `packages/tooling/src/validators/security-corpus.spec.ts` 54/54, `peer-surface.spec.ts` 10/10. **All 3 failures are the inherited ones**: `story-dod-tiers.spec.ts > countOpen > subtracts a waiver` (TypeError, no `required` item) · `landing-token-fallbacks.spec.ts` (6 landing fallbacks disagree with their tokens) · `dzup-resolution.spec.ts > covers exactly the specifiers the packages declare` (inline snapshot lacks `@dzup-ui/tokens/css/high-contrast` — the snapshot's `@dzup-ui/testing/security-corpus` line is unchanged, since this task added no subpath). **Also red, not previously recorded in the ledger: "Vitest caught 656 unhandled errors"**, every one `ReferenceError: requestAnimationFrame is not defined` from `@formkit/auto-animate` timers firing after `apps/landing/src/pages/AnimationsPage.v2.spec.ts`'s environment was torn down. That spec **alone** passes 15/15 with **0** errors (exit 0), and no dirty change touches it (last commit `96daaad`), so it is a teardown race that depends on load. It has nothing to do with this task. Reported, not fixed |

**Attribution of the red link — not this task's.** A scratchpad script diffed the
committed `capability-matrix.json` against a fresh `buildCapabilityMatrix()` with
the validator's own normalisation: every differing line is a **visual-baseline**
cell (baselines captured before component commit `a01965fa`, and the buttons
family baseline count 8 → 12 from R5-O4's dirty `visual-baselines.ts`). No
security, testing or peer cell differs; the matrix reads `packages/core/security/*`,
which this task did not touch. Pre-existing, left for TASK-R1-O1 / R2-O1 — **not
called green**, and the capability matrix was deliberately not regenerated.

### 5. Success criteria — re-checked against the tree

| # | Criterion (`<success_criteria>`) | Evidence | State |
|---|---|---|---|
| 1 | Schema + types + validator **published from `@dzup-ui/testing`** | Types, `checkCorpusFile`/`checkPeerCompatibilityFile`/`assert*`, loaders and `SECURITY_CORPUS_SCHEMA_FILE`/`PEER_COMPATIBILITY_SCHEMA_FILE` exported from the `./security-corpus` subpath (`packages/testing/src/security-corpus.ts`), types also from the barrel (`src/index.ts`); both JSON Schemas ship via `files: ["security-corpus"]` — `npm pack --dry-run` lists them. Gate: `yarn validate:security-corpus` (link 8). Types ⇔ schema agreement now has its spec (§2) | **met** — *focused-validated / aggregate-qualified* locally. **Packaged not claimed**: `packages/testing/dist` is a gitignored local build from 2026-09-01 still at `1.0.0`, and no build was run |
| 2 | Fixtures validate | gate exit 0: 34 fixtures / 6 files against JSON Schema **and** checker; 2 peer records; ajv oracle agrees on every data file | **met** |
| 3 | One outcome vocabulary with definitions | `NeutralizationOutcome` (5 values, strongest first) defined in the module doc, in `definitions.outcome.description` and in README §2; the seam mapping (`stripped`/`escaped`/`rejected`) stated once | **met** |
| 4 | Corpus version bumped + changeset | `1.0.0 → 1.1.0` in the module and in all 7 data files; `.changeset/the-security-corpus-is-one-format-for-both-repositories.md` `@dzup-ui/testing: minor` (checker refuses files it used to accept → breaking → `minor` under VERSIONING.md, never `major`); `validate:release-policy` exit 0 | **met** |
| 5 | Incompatible-peer shape + one executable example | `PeerCompatibilityFixture` / `peer-compatibility.schema.json`; `peer.vue.wrong-major` executed by the gate against `validate:peers`' own check (2 validate-stage diagnostics executed); seeded contradictions red in the spec | **met** — the optional-peer half is synthetic in OSS by necessity (D76) |
| 6 | Compatibility table lists every Pro field with a disposition (and exact paths) | `TASK-R3-O4-corpus-compatibility.md`: file level (`description`, `policy`, `payloads`), fixture level (`id`, `category`, `input`, `mustNotSurvive`, `why`), runner/registry fields, all 13 Pro categories, the sink registry, and — after this session — every field of `optional-peer/fixture.json`; field inventory re-derived from Pro's files at `1c55355` (46 payloads, `why` on 23) | **met** (after the §6 correction) |
| 7 | 372 tests green, or the difference explained | lane re-run: **380 / 380** exit 0 = 372 + 8 new cases in `security-corpus.spec.ts` (14 → 22); no pre-existing case edited or removed | **met** |

`<stop_conditions>` re-checked: no Pro outcome loses information (§3 of the
table — `admitted` exists so the homoglyph case is not mislabelled, D73; Pro's
"refuses or absorbs" gains a pinned value); the two new sinks are **optional
vocabulary no OSS fixture uses** (0 of 34 name `markdown`/`mermaid-svg`/`admitted`;
Core has 0 HTML sinks) — kept optional and noted, as the stop condition asks;
the only public-name change is additive and the changeset is `minor`.

### 6. Ratchet movements

| Ratchet | Before | After |
|---|---|---|
| `validate:all` links / first failing link | 41 / 18 (R5-O4) | **42 / 19** — `validate:security-corpus` inserted at link 8, before the failing link; cause unchanged (`capability-matrix`) |
| security-corpus schema version | 1.0.0 | **1.1.0** |
| published JSON Schemas for the corpus | 0 | **2** |
| peer-compatibility fixtures (states covered: absent · installed · incompatible) | 0 (no shape) | **2** records (absent, incompatible); the `installed` state is exercised by spec |
| corpus-format tests | 14 (testing spec) | **22** testing + **54** gate spec |
| pending changesets | 25 (last recorded) | **31** measured by `validate:release-policy` — +1 is this task's; the other +5 are R3-O3 / R5-O4 / earlier packets |
| `tsc -p packages/tooling` errors | 7 at `99b963a` | **12**, **0** in this task's files (not this task's movement; recorded so nobody attributes it here) |

### 7. Decisions

D73–D76 were taken by the first session and cited in the compatibility table,
but never entered in the ledger; they are recorded now with that provenance.

| # | Decision | Options / recommendation | State |
|---|---|---|---|
| **D73** 🟢 | A fifth outcome, **`admitted`** — a value that reaches the sink live because a named policy admits it (Pro's `unicode-homoglyph-url`) | (a) add `admitted`, same > 80-char rationale rule as `inert` — **taken** · (b) record it as `stripped` (false: nothing is removed) · (c) drop the payload (the policy then has no fixture to fail) | taken by the first session (agent, reversible until first publication) |
| **D74** 🟢 | Sinks **`markdown`** and **`mermaid-svg`**, spelled as the sanitizer seam's `DzSanitizeSink` contexts, instead of folding Markdown/Mermaid source into `html` | (a) separate sinks — **taken** · (b) fold into `html` (a Markdown payload in a raw-HTML sink is inert text that proves nothing) | taken by the first session |
| **D75** 🟢 | Pro's `mustNotSurvive` and file-level `policy` move under **`extensions["com.dzup.pro"]`**, not into the shared format; unknown top-level keys are rejected | (a) namespaced extension — **taken on the OSS side** · (b) a shared optional `mustNotSurvive` (OSS measures structure, not tokens, and could never assert it) | **joint** — OSS half taken; Pro TASK-R2-P9 confirms the namespace (its prompt asks for "an extension namespace agreed with OSS") |
| **D76** 🟢 | The executable incompatible-peer example uses a **required** peer (`vue` wrong major), because OSS declares no optional peer; the `optional` flag is exercised synthetically (`pdfjs-dist`) and Pro instantiates it for real | (a) required peer — **taken** · (b) add an optional peer to an OSS package just to have an example (changes a published surface for a test) | taken by the first session |
| **D77** 🟢 | **The TASK-R3-O4 `<done_check>` cannot run as written** — the D42/D57/D66/D72 pattern. Checks 1–3 name a directory `packages/testing/src/security-corpus/` that never existed; check 3's `\| head` turns grep's exit 2 into a pass | (a) amend to the corrected block in §3 above — **rec. (a)** · (b) leave | open |
| **D78** 🟠 | **The type half of the new types ⇔ schema spec is enforced only by `tsc -p packages/tooling/tsconfig.json`**, which is not a `validate:all` link and already carries 12 errors. A union member added to `SecuritySink` without the constant, or an interface field changed without the schema, still passes `yarn validate:all` and `yarn test`; only the value half (schema drift) is caught there | (a) TASK-R1-O1 clears the 12 errors and adds `tsc -p packages/tooling` as a link — **rec. (a)** · (b) run vitest with `--typecheck` for `*.spec.ts` · (c) leave it to review | open |

### 8. Findings handed on (not decisions, no Pro edit made)

- **Pro — 4 mermaid payloads run nowhere.** `corpus.security.spec.ts:271` filters
  `MARKDOWN_CORPUS` on `category.startsWith('markdown')`; the 4 `mermaid` payloads
  only feed the category-presence test. Input to Pro TASK-R2-P9.
- **Pro — the runner checks "nothing forbidden survived", not an outcome.** Adopting
  the shared labels without classifying (`measure()` in
  `packages/core/security/boundary-suites.ts` is the pattern) would claim more than
  Pro has proven. Table, top note.
- **The gate cannot see a schema looser than the checker** (the `title` probe in
  §2). Covered now by the spec, whose type half is D78.
- **OSS, not this task's: full `yarn test` reports 656 unhandled errors** from
  `AnimationsPage.v2.spec.ts` (auto-animate `requestAnimationFrame` after teardown),
  on top of the 3 inherited failures. The spec is clean on its own, so this is a
  race that depends on load. No ledger row records it yet. It belongs with the
  known-red list TASK-R1-O1 owns.

### 9. Ranked next packet

1. **Pro TASK-R2-P9** — adopt the format using the compatibility table; confirm D75; add `peer.pdfjs-dist.wrong-major` as the consumer-matrix `incompatible` lane; wire the 4 mermaid payloads.
2. **TASK-R1-O1** — the capability-matrix red link (visual-baseline staleness, DzFileUpload Tier D browser cell) and D78's tooling `tsc` link.
3. Before the first publication of `@dzup-ui/testing`: build and pack-verify it (the local `dist` is still 1.0.0).

The ledger docs were written after the ladder, so every link that reads `docs/` was re-run afterwards: `validate:adr-references`, `validate:tokens:refs`, `validate:readme-facts`, `validate:doc-snippets` and `validate:security-corpus` all exit 0.

`git status --short` at END: **271** lines. That is 271 at this session's start and 251 when the task started. The line set is byte-identical to this session's start, because every path this session wrote was already dirty or untracked. No commit, stash, checkout, revert or clean was run, and no file inside `ui/dzup-ui-pro` was edited.
