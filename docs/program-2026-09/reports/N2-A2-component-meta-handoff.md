# TASK-N2-A2 — `vue-component-meta` metadata pipeline

> Handoff for [`consumer-agent-surface-tasks.md` → TASK-N2-A2](../consumer-agent-surface-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-01 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `51dec93c73214af2d1e424e3454a7122691fea48` (`51dec93 new version for themes`)
> **Worktree at run start:** **dirty — 158 entries** (the uncommitted N1 evidence
> program **plus** TASK-N2-T1's DTCG export **plus** TASK-N2-A1's MCP governance).
> Nothing was reverted, stashed, cleaned or committed.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`.
>
> **Evidence class: `locally qualified, worktree-dirty`.** Not CI, not release,
> not production. Every number below is bound to `51dec93` **plus** the
> uncommitted N1 + T1 + A1 working tree.
>
> **Nothing is committed, pushed, dispatched to CI, or published.**

---

## 1. Headline

`vue-component-meta` works on this catalog, and it works better than the task
prompt's `<discovery>` step anticipated — with **one structural blind spot that
is not fixable by configuration** and is quantified rather than hidden.

| Measure | Result |
|---|---|
| Components processed | **208 / 208** (144 `public-component` + 64 `compound-part`) |
| Components vue-component-meta could not process | **0** — the `<stop_conditions>` unclassifiable branch was never reached |
| Own props extracted | **1,712** |
| Own props carrying a description | **1,649 (96.3 %)** |
| **Emit descriptions from vue-component-meta** | **0 / 359 (0.0 %)** — structural, see F-1 |
| Emit descriptions recovered from source via the same TS program | **253 / 359 (70.5 %)** |
| Slot descriptions | **305 / 326 (93.6 %)** |
| `exposed` member descriptions | **0 / 26** — no per-member JSDoc exists in source (F-2) |
| Cold extraction time, whole catalog | **~9.6 s** (generate-time only; the MCP server reads the finished file) |
| Determinism | **byte-identical** across two cold runs, `sha256 4fbd7382…` |
| MCP tools | **9 → 12**, `validate:mcp` exit 0, `toolsWithoutE2eSmoke` **held at 6** |
| `validate:all` | **exit 0, 30 → 31 links** |

**The one thing to carry forward:** every field in this artifact is real, and the
one field that is *structurally* unavailable — emit descriptions from
`vue-component-meta` — was root-caused to Vue's own `ShortEmits` mapped type,
then recovered through the same TypeScript program at 70.5 % and labelled
`descriptionSource: "emits-interface"` so a renderer can tell. Nothing is
published that a consumer cannot trust, and §13 says exactly where the trust
stops.

## 2. What was built

| # | File | Status | API effect |
|---|---|---|---|
| A1 | `packages/tooling/src/meta/component-meta.ts` | **new**, 276 lines | The artifact's types, `schemaVersion 1.0.0`, the single serializer and `stripProvenance`. |
| A2 | `packages/tooling/src/meta/extract-component-meta.ts` | **new**, 451 lines | The extraction layer: `vue-component-meta` + the two joins that need the same `ts.Program` (emit-description recovery, story parsing). |
| A3 | `packages/tooling/src/meta/generate-component-meta.ts` | **new**, 397 lines | `yarn generate:component-meta`. Ownership-manifest-driven; joins capability matrix, anatomy, stories. `--check` mode. |
| A4 | `packages/tooling/src/meta/extract-component-meta.spec.ts` | **new**, 180 lines, 17 tests | Drives the pure helpers, including every branch of the story parser. |
| A5 | `packages/tooling/src/validators/component-meta.ts` | **new**, 334 lines | `yarn validate:component-meta`. Five clause groups. Does **not** import `@dzup-ui/*`. |
| A6 | `packages/tooling/src/validators/component-meta.spec.ts` | **new**, 371 lines, 23 tests | Every clause driven to failure with a fabricated artifact, plus a green run of the real repository. |
| A7 | `packages/tooling/src/validators/component-meta-ceilings.json` | **new** | Nine downward-only extraction-debt ratchets, each with its measured reason. |
| A8 | `packages/core/docs/component-meta.json` | **new**, generated, 1,472,622 B | The artifact. 208 components. |
| A9 | `packages/mcp/src/registry.ts` | modified | `COMPONENT_META_PATH`, `componentMeta()`, `componentMetaFor()`, the record types, and one local-mode resolution candidate. **Additive public API.** |
| A10 | `packages/mcp/src/tools.ts` | modified | `searchComponents`, `getComponentMetadata`, `getComponentExample`. **Additive public API.** |
| A11 | `packages/mcp/src/index.ts` | modified | Three `registerTool` calls (**9 → 12 tools**); `INSTRUCTIONS` now points agents at the metadata path first. |
| A12 | `packages/mcp/src/__fixtures__/catalog.ts` | modified | `/r/component-meta.json` fixture — four components chosen so every branch of the three tools is reachable. |
| A13 | `packages/mcp/src/tools.spec.ts` | modified | Three new top-level `describe` blocks (**50 → 75 tests**), each with `[malformed]` and `[error]` cases. |
| A14 | `packages/mcp/src/server.spec.ts` | modified | Three `ROUND_TRIPS` rows; tool-list and tool-count assertions updated 9 → 12. |
| A15 | `packages/mcp/scripts/generate-tool-surface.ts` | modified | Three `PROBES` and two `MISS_PROBES` entries. |
| A16 | `packages/mcp/scripts/e2e-smoke.mjs` | modified | Three new end-to-end calls against the built `dist/` — which is why the `toolsWithoutE2eSmoke` ratchet stays at **6** instead of rising to 9. |
| A17 | `packages/mcp/docs/mcp-tool-surface.json` · `packages/mcp/README.md` | regenerated | 9 → 12 tools; `validate:mcp` green. |
| A18 | `apps/landing/scripts/build-registry.ts` | modified | One `copyFile` so the deployed site serves `/r/component-meta.json`. That directory is wiped on every build, so the copy has to live here. |
| A19 | `package.json` (root) | modified — **additive** | `generate:component-meta`, `validate:component-meta` (+ `//` doc keys), one link appended to `validate:all`. |
| A20 | `package.json` · `yarn.lock` | modified — **additive** | `vue-component-meta@3.3.7` as a root devDependency. |

**Dependency effect.** `vue-component-meta` was **already in the tree**: `@storybook/vue3-vite@10.5.1` depends on `^3.2.7`, resolved to `3.3.7`. Pinning the direct devDependency to the exact same version **deduped to the existing copy** — the whole `yarn.lock` diff is 2 lines and **zero new packages were fetched**. The extractor now used by the docs pipeline is byte-identical to the one Storybook's own docgen uses.

**Public API effect on `@dzup-ui/mcp`:** three new tools; three new exports on `.` (`searchComponents`, `getComponentMetadata`, `getComponentExample`) and three on `./registry` (`COMPONENT_META_PATH`, `componentMeta`, `componentMetaFor` — the last two are methods). **No new export subpath**, so the public-API specifier snapshot at `packages/tooling/src/resolution/dzup-resolution.spec.ts` needed no edit.

## 3. Discovery — the spike, and what it measured

The task's `<discovery>` step 1 asked for three representative components. All
three were spiked, then the spike was widened to the whole catalog before any
design was fixed, because the interesting number was not "does it work on
DzButton" but "what fraction of 1,712 props carries real prose".

| Class | Component | Result |
|---|---|---|
| simple | `DzButton` | 16 own props, **16 described**, 11 with a declared default; 3 events, 3 slots; inherited `BaseAccessibilityProps` members (`id`, `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`) **resolve with their JSDoc**. |
| compound | `DzCard` / `DzCardBody` | `DzCard` 9 own props all described, 5 slots; `DzCardBody` **0 own props, 12 global** — a compound part with no API of its own, correctly reported as empty rather than as a failure. |
| generic-typed | `DzDataGrid` | `type: function` (a generic component is a function component); 20 own props all described; `data: T[]` and `columns: ColumnDef<T>[]` **keep their type parameters**; the `cell` slot resolves to `{ row: T; column: ColumnDef<T>; value: unknown; }`. |

Answering the three questions the task asked directly:

- **Are descriptions picked up from JSDoc?** For props and slots, yes —
  **96.3 %** and **93.6 %**. For **events, no: 0 of 359.** Root-caused in §8/F-1.
- **Do `Base*Props` inherited props resolve?** Yes, with descriptions, and they
  are indistinguishable from own props in the output — so the artifact records
  `declaredIn` per prop, and a docs renderer can group by declaring file if it
  wants "own vs. inherited".
- **Are slot types usable?** Yes where a payload exists (**86 of 326** carry a
  non-trivial payload type). The other 240 print as `any` or `{}`, both of which
  mean "no slot props"; the artifact publishes `hasPayload: false` rather than
  showing a reader the literal string `any`.

Cold cost: **~9.6 s** for all 208 components (one TS program build, then 12–130 ms
each; the first component pays the program's lazy type-check, 6.7 s of the 9.6).
That is a generate-time cost. The MCP server reads the finished file.

## 4. The artifact and how it derives

`packages/core/docs/component-meta.json` — one file, beside
`capability-matrix.json`, which is the generated-truth home in this repository.
**208 records**: 144 `public-component` + 64 `compound-part`.

| Field | Derived from |
|---|---|
| the component list | `component-ownership.manifest.json`, entries with `kind` `public-component` or `compound-part` — **not** `public-api.manifest.json` (see below) |
| `props` / `events` / `slots` / `exposed` | `vue-component-meta@3.3.7` over `packages/core/tsconfig.json` — the same program `vue-tsc` type-checks with |
| `events[].description` | the `Dz{Name}Emits` interface members, read through **the checker's own `ts.Program`** — stamped `descriptionSource: "emits-interface"` |
| `family` / `tier` / `pattern` / `securityBoundary` / `traits` / `componentCommit` / `capability` | `capability-matrix.json` |
| `anatomy.parts` | `Dz{Name}.anatomy.ts`, through the ownership package's existing `readAnatomyFor` — not a second parser |
| `stories` | the component's `.stories.ts`, parsed with the TypeScript AST; `primary.source` is a **verbatim slice** |
| `sourceCommit` | `git rev-parse HEAD`, and **excluded from the freshness diff** |

**Why the ownership manifest.** Constraint **B-A1-F1**: `public-api.manifest.json`
is stale by exactly 43 symbols that the ownership manifest classifies
`public-component`. Generating from it would have handed D1, A3 and the MCP
tools the same 43-component blind spot that already makes 30 % of the catalog
invisible to every AI client. Measured coverage of the choice actually made:
**144 / 144** `public-component` symbols have a record, held as a ratchet
(`publicComponentsWithoutRecord`, ceiling 0).

### Determinism — measured, and the `sourceCommit` question answered

Two cold runs of `yarn generate:component-meta`:

```
$ rm packages/core/docs/component-meta.json && yarn generate:component-meta
4fbd73824b6082959b2310106815916c19d43e9da31c2bf206e25e9617241425 *packages/core/docs/component-meta.json
$ rm packages/core/docs/component-meta.json && yarn generate:component-meta
4fbd73824b6082959b2310106815916c19d43e9da31c2bf206e25e9617241425 *packages/core/docs/component-meta.json
```

**Byte-identical.** Four things make that true rather than lucky:

1. **Everything is sorted** — components by name, props/events/slots/exposed by
   name, anatomy parts, traits, capability cell keys, `unrun`/`stale` lists,
   subpaths. All with `localeCompare(…, 'en')`, so the host locale cannot reorder.
2. **The printer is pinned to `ts.NewLineKind.LineFeed`.** Without it a
   multi-line printed type carries the host's newline and the artifact differs
   between Windows and CI.
3. **`normalizeType()` rewrites `import("<absolute path>")` to a repo-relative
   path.** TypeScript prints unresolvable module references with the full host
   path; one of those would put this checkout's home directory into a committed
   file. **Measured count on this catalog: 0** — the normalization stays anyway,
   because a determinism property that holds by luck is not a property.
4. **`sourceCommit` is stamped from `git rev-parse HEAD` and stripped before the
   freshness comparison** (`stripProvenance`), exactly as the ownership and
   capability validators do. This is the deliberate handling of the hazard the
   orchestrator named: the field records *which checkout produced the file*, so
   on a dirty worktree it is stable within a run but would differ across
   commits — and nothing gates on it, so **constraint B1's off-by-one cannot
   bite here**. The freshness gate compares the 208 records, not the stamp.

## 5. Proof the gates can fail

Five seeded violations, each with the verbatim error, each restored and
re-verified. **All six touched files hash byte-identical to their pre-seed
state.**

### S1 · a prop added to source that nobody regenerated for

Seed — in `packages/core/src/components/buttons/DzButton.types.ts`, before the
`type` prop:

```ts
  /** SEEDED: a new prop nobody regenerated for */
  seededProp?: string
```

`yarn validate:component-meta` → exit **1**:

```
✗ [freshness] packages/core/docs/component-meta.json is STALE — it disagrees with a fresh extraction of the sources. Run `yarn generate:component-meta` and commit the result.
```

This is the clause the task's `<freshness>` requirement names, and it fires on a
**source** change, not on an artifact edit — which is the whole point.

### S2 · a prop's JSDoc deleted, **then regenerated**

Seed — the same file, `/** Semantic color tone */` removed from `tone`, then
`yarn generate:component-meta` run so freshness is green and only the debt
ratchet can catch it.

```
✗ [ratchet] `propsWithoutDescription` is 64, above the ceiling of 63. Ratchets move one way only.
```

### S3 · the deployed site loses the artifact — **and the gate's first version did not notice**

Seed — the `await copyFile(COMPONENT_META_SRC, …)` statement and its comment
deleted from `apps/landing/scripts/build-registry.ts`.

**First run: exit 0 — green.** The clause was
`buildRegistrySource.includes('component-meta.json')`, and the file still
mentioned the filename in the `COMPONENT_META_SRC` constant and its doc comment.
See finding **F-4**; this is why the probe is mandatory rather than a formality.

Clause tightened to match the **call**, not the string:

```ts
!/await\s+copyFile\(\s*COMPONENT_META_SRC\b/.test(buildRegistrySource)
  || !/resolve\(\s*OUT_DIR\s*,\s*'component-meta\.json'\s*\)/.test(buildRegistrySource)
```

Same seed re-run → exit **1**:

```
✗ [reachability] apps/landing/scripts/build-registry.ts does not copy component-meta.json into /r/. It wipes and rewrites that directory on every build, so without the copy the deployed site 404s on /r/component-meta.json and every MCP client loses search_components, get_component_metadata and get_component_example in production while they keep working locally.
```

The tightened clause is strict enough that it later rejected a **paraphrase** of
the statement in this task's own spec fixture (a `copyFile(…)` without `await`),
which had to be corrected to the verbatim call.

### S4 · the artifact deleted

```
✗ [freshness] packages/core/docs/component-meta.json does not exist. Run `yarn generate:component-meta`.
```

### S5 · a new tool's description changed without regenerating the MCP surface

Seed — `search_components`' `description` in `packages/mcp/src/index.ts` changed
from "…so it covers all 144 public components plus their compound parts." to
"…so it covers everything." `yarn validate:mcp` → exit **1**:

```
  ✗ The generated surface is stale or the generator failed:
  • packages/mcp/docs/mcp-tool-surface.json is STALE — it disagrees with a live tools/list round-trip. Run `yarn generate:mcp-surface`.
  • packages/mcp/README.md's generated tool table is STALE. Run `yarn generate:mcp-surface`.
```

This proves the three new tools are **inside** A1's freshness gate, not beside it.

### Restoration

```
$ diff hashes-before.txt hashes-after.txt
ALL SEEDED FILES RESTORED BYTE-IDENTICAL
$ npx tsx packages/tooling/src/validators/component-meta.ts ; echo $?
✓ component-meta: fresh, complete for all 144 public components, and every debt number at its ceiling.
0
$ npx tsx packages/tooling/src/validators/mcp-surface.ts ; echo $?
@dzup-ui/mcp surface OK — 12 tools, all with a contract clause, a unit spec, a [malformed] case and an observed data source
0
```

Beyond the seeded runs, `component-meta.spec.ts` drives **every** clause to
failure with a fabricated artifact — 23 tests, including five that run the real
committed artifact through `checkComponentMeta()` and assert zero errors, that
no absolute host path appears anywhere in it, that every description agrees with
its `descriptionSource`, and that every published example's `source` really
contains `export const <id>` and its stories file really exists on disk.

## 6. Focused validation output

Narrowest owning command first, then widening — §7 carries the aggregate.

### 6a. The new gate — `yarn validate:component-meta`, exit 0

```
Component metadata — TASK-N2-A2

  208 components: 144 public-component, 64 compound-part; 0 unclassifiable
  extractor: vue-component-meta@3.3.7

  field      total  described  source
  props       1712       1649  vue-component-meta
  events       359        253  0 extractor + 253 emits-interface
  slots        326        305  vue-component-meta
  exposed       26          0  none exist in source

  examples: 143/208 have a real story source; 128 also yield a paste-ready template

  ratchets: unclassifiable 0 · unresolvedTypes 0 · publicComponentsWithoutRecord 0 ·
            propsWithoutDescription 63 · slotsWithoutDescription 21 · eventsWithoutDescription 106 ·
            exposedWithoutDescription 26 · publicComponentsWithoutExample 1 ·
            componentsWithoutStaticTemplate 80

✓ component-meta: fresh, complete for all 144 public components, and every debt number at its ceiling.
```

Cost: **17 s** for the validator (it re-extracts the whole catalog), **18 s** for
the generator. Both are generate-time; the MCP server reads the finished file and
pays nothing.

### 6b. Focused test lanes — 164 tests, green

```
$ npx vitest run packages/tooling/src/meta packages/tooling/src/validators/component-meta.spec.ts packages/mcp
 ✓ packages/mcp/src/registry.spec.ts                        (17 tests)
 ✓ packages/mcp/src/tools.spec.ts                           (75 tests)
 ✓ packages/mcp/src/server.spec.ts                          (20 tests)
 ✓ packages/mcp/src/tools.contract.spec.ts                  (12 tests)
 ✓ packages/tooling/src/meta/extract-component-meta.spec.ts (17 tests)
 ✓ packages/tooling/src/validators/component-meta.spec.ts   (23 tests)
 Test Files  6 passed (6)
      Tests  164 passed (164)
```

**+68 tests** over the state A1 left: `packages/mcp` **96 → 124** (tools 50 → 75,
server 17 → 20; registry 17 and contract 12 unchanged), plus **40** new in
`packages/tooling` (17 extraction helpers + 23 validator clauses).

### 6c. `yarn validate:mcp` — exit 0, **12 tools**

```
@dzup-ui/mcp surface OK — 12 tools, all with a contract clause, a unit spec, a [malformed] case and an observed data source; version 0.2.0 agrees across package.json, server.json (x2), CHANGELOG.md and the artifact.
  ratchets: 43 public components unreachable · 6 tools not smoke-called
```

**The `toolsWithoutE2eSmoke` ratchet stayed at 6 rather than rising to 9** because
all three new tools were added to `scripts/e2e-smoke.mjs`. A ratchet is not
allowed to rise, and raising it would have been the easy wrong answer.

### 6d. `node packages/mcp/scripts/e2e-smoke.mjs` — exit 0, against the rebuilt `dist/`

```
✓ initialize → serverInfo.version = 0.2.0 (package.json says 0.2.0)
✓ tools/list → exactly the 12 tools in docs/mcp-tool-surface.json: get_block, get_component,
  get_component_example, get_component_metadata, get_install_command, get_template, list_blocks,
  list_components, list_templates, list_tokens, search, search_components
…
✓ get_component_metadata(DzRating) → a real prop table for a component get_component cannot see
✓ search_components(buttons) → includes DzButton
✓ get_component_example(DzButton) → verbatim story source, not synthesised

All end-to-end MCP checks passed.
```

`DzRating` is chosen deliberately: it is **one of the 43 symbols
`public-api.manifest.json` omits**, so `get_component` cannot see it and this
tool can. That assertion is the end-to-end proof that the ownership-manifest
choice in §4 reached a real client over real JSON-RPC against the built `dist/`.

### 6e. `packages/tooling` typecheck — 0 errors in this task's files

`packages/tooling` is **not** in `typecheck:all` (constraint **B-A1-F7**, owner
decision D4), so it was checked explicitly:

```
$ node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json ; echo $?
… 7 errors …
2
```

**All 7 are the pre-existing set A1 measured** — `perf-bench.spec.ts` (2),
`quality/story-dod-triage.ts` (1), `validators/at-matrix.spec.ts` (1),
`validators/story-dod-tiers.spec.ts` (1) on the committed tree, plus
`quality/accept-visual-baseline.ts` (2) from N1's untracked work. **Zero are in
`src/meta/` or `validators/component-meta*`.**

One error in this task's own code was found and fixed by this run
(`extract-component-meta.ts` TS6133, an unused `sf` parameter). Because
`packages/tooling` is outside `typecheck:all`, **no gate in this repository would
have caught it** — a small, concrete instance of why D4 matters. The fix was
verified not to change the artifact: regenerating after it produced a
byte-identical file.

## 7. Aggregate qualification

Run from a clean shell after every source change was final. Each exit code was
written to a file and echoed bare — never read through a pipe.

| Gate | Exit | Result |
|---|---|---|
| `yarn typecheck` | **0** | Unchanged coverage; `packages/tooling` is still outside it (B-A1-F7 / D4), so §6e checked this task's files explicitly. |
| `yarn lint` | **0** | `--max-warnings 0` over `packages/ apps/`. One error in this task's own spec was found and fixed (see below). |
| `yarn validate:all` | **0** | **31 links** (30 → 31; `validate:component-meta` appended after `validate:mcp`). It reports green **inside the chain at line 141** of the run log, with all four fidelity rows and its nine ratchets. |
| `yarn test` | **1** | **8,777 passed · 2 failed · 2 skipped · 1 todo (8,782)**, 486/488 files. The two failures are **exactly** B5's pre-existing pair. |

### The two failures are the known pre-existing ones — not this task's

```
FAIL  packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts > landing token fallbacks > every fallback matches the value its token resolves to
FAIL  packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver
```

That is **B5 verbatim, and nothing else**. Neither file was read for edit by this
task, neither is in `packages/mcp` or `packages/tooling/src/meta/`, and no ceiling
was moved to make either pass.

### What this task added to the aggregate — the delta reconciles exactly

| | A1 left | now | delta |
|---|---|---|---|
| tests | 8,714 | **8,782** | **+68** |
| passing | 8,709 | **8,777** | **+68** |
| test files | 486 | **488** | **+2** |
| failing | 2 | **2** | **0** |

**+68 = +28 in `packages/mcp`** (`tools.spec.ts` 50 → 75, `server.spec.ts`
17 → 20) **+40 in `packages/tooling`** (two new files:
`meta/extract-component-meta.spec.ts` 17, `validators/component-meta.spec.ts`
23 — which is also the +2 files). Every one is green in the aggregate run,
including the five cases that drive the **real committed artifact** through
`checkComponentMeta()`.

### The one lint error was this task's, and it was the F-8 class again

```
packages/tooling/src/validators/component-meta.spec.ts
  345:43  error  The character class(es) '[A-Za-z]' can be simplified using the `i` flag  regexp/use-ignore-case
```

The same rule that, in A1, would have silently broken a **published** JSON Schema
`pattern` (A1 F-8). Here the regex is a local test assertion that is never
serialised, so applying the `i` flag is correct — and the reason is now written
at the line, so the next reader does not have to re-derive which case they are
in. Fixed; `yarn lint` exit 0.

### Maturity level reached

Per `<maturity_levels>`, this packet reaches **aggregate-qualified** and stops:

- **specified** — artifact schema `1.0.0` with a typed contract and a single
  serializer; three MCP tools with contract clauses under A1's bar.
- **implemented** — one extractor, one artifact, one freshness gate, three tools.
- **focused-validated** — §6: 164 tests, `validate:component-meta` exit 0,
  `validate:mcp` exit 0 at 12 tools, e2e smoke exit 0 against the rebuilt
  `dist/`, five seeded gate failures with byte-identical restoration.
- **aggregate-qualified** — this section.
- **browser/AT-qualified** — **n/a**: this is a generator and a stdio server.
- **packaged** — `yarn workspace @dzup-ui/mcp build` exit 0; the smoke drives the
  emitted `dist/index.js` over real JSON-RPC. **The landing `/r/` copy has NOT
  been produced** — owner decision D6.
- **released** — **not reached, not attempted.** No changeset, no version bump,
  no publish, no registry action.

Everything above is **locally qualified, worktree-dirty**.

## 8. Findings

Extraction against 144 real components is an unusually good instrument. These
are what it revealed about the **sources**, not about the pipeline. Ranked by
blast radius.

### F-1 · Vue's `ShortEmits` mapped type erases emit JSDoc — 0 of 359 🔴

The prose **exists**. `DzButton.types.ts`:

```ts
export interface DzButtonEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
```

`vue-component-meta` returns `description: ""` for it, and for all 359 events in
the catalog. Root-caused rather than guessed — every event's `getDeclarations()`
points **outside the repository**:

```
event click: desc="" decls=[{"file":"…/node_modules/@vue/runtime-core/dist/runtime-core.d.ts","range":[18052,18087]}]
  -> "(event: key, ...args: Args) => void"
```

That is Vue's own `ShortEmits<T>` / `UnionToIntersection` machinery. By the time
`defineEmits<DzButtonEmits>()` becomes a callable type, the mapped type has
produced *new* members and the JSDoc on the original interface members is gone.
**No `MetaCheckerOptions` setting recovers it**; it is structural to the
`defineEmits<Interface>` + tuple-payload form this repo uses everywhere (and
which `CLAUDE.md` documents as the house style).

**Not omitted — recovered, and labelled.** The `Dz{Name}Emits` interface is read
back through **the checker's own `ts.Program` and `ts.TypeChecker`**
(`prop.getDocumentationComment(tc)`), which is the same extractor, not a second
one. Result: **253 of 359 (70.5 %)**, every one stamped
`descriptionSource: "emits-interface"` so a renderer can distinguish them.

The residual 106 decomposes honestly:

| | count | why |
|---|---|---|
| `update:*` from `defineModel` (ADR-16) | **71** | Vue synthesises the event; there is no authored member anywhere in the repo to carry prose. Cannot reach 0 without a Vue-level change. |
| authored emits with no JSDoc | **35** | A real source gap. Concentrated in Reka-forwarded compound parts: `DzDialogContent`(5), `DzPopoverContent`(5), `DzTagsInput`(5), `DzSheetContent`(3), `DzFieldArray`(3) — mostly `escapeKeyDown` / `pointerDownOutside` / `interactOutside` / `closeAutoFocus`. |

(12 of the 83 `update:*` events **do** carry prose, because their component
declares them explicitly in its `Emits` interface rather than leaving them to
`defineModel`.)

### F-2 · Every one of the 26 `defineExpose` members in the catalog is undocumented 🟠

`exposed` extracts cleanly — 26 members across 21 components, all with correct
names and resolved types (`inputRef: HTMLInputElement | null`, `start`, `pause`,
`reset`, …). **Descriptions: 0 of 26.**

This is **not** an extraction limitation. The prose is written on the *call*:

```ts
/** Expose the native input ref for programmatic focus */
defineExpose({ inputRef })
```

No extractor can attribute a call-site comment to individual members. Meanwhile
`defineExpose` is **public API** — a consumer writes
`inputRef.value.inputRef.focus()` or `countdownRef.value.start()` — and it has
**zero published documentation** anywhere in the catalog. It is also absent from
the capability matrix's cell kinds, so no evidence lane covers it either.

Published anyway (names and types are real and useful), with
`exposedWithDescription 0/26` printed by the validator on every run and ratcheted
at 26. → **owner decision D1**.

### F-3 · 487 props declare `undefined` as their default, and the stories say something else 🔴

Three different "defaults" exist for the same prop, and two of them are published:

| Source | `DzButton.variant` says |
|---|---|
| `DzButton.vue` `withDefaults` — what this artifact records | `undefined` |
| `DzButton.stories.ts` `argTypes.table.defaultValue.summary` — what Storybook's docs page shows | `'solid'` |
| the rendered button | solid |

The source is not wrong: `variant: undefined` is deliberate, so the **ADR-20
provider contract** supplies the effective value at runtime. But the *story*
carries a hand-typed second answer, and nothing compares them.

Catalog-wide split of the 1,712 props:

| declared default | count |
|---|---|
| a real value (`'md'`, `false`, `[]`, …) | **727** |
| literally `undefined` (provider-supplied or genuinely none) | **487** |
| no default declared at all | **498** |

The artifact keeps `null` (none declared) and `"undefined"` (declared as
`undefined`) as **different values**, because collapsing them would tell a docs
reader that `variant` has no default when the source deliberately declares one.
**This is the single most consequential thing D1 must get right** — see §13.

**Class:** the fourth sighting of hand-typed facts disagreeing with generated
ones (P2-02 READMEs; T1's K4 phantom token exports; A1's F-3 version literals;
now story `argTypes`). → **owner decision D3**.

### F-4 · A gate clause that matches a substring can be satisfied by a comment 🟠 *(gate design)*

The reachability clause's first version was
`buildRegistrySource.includes('component-meta.json')`. The seeded probe deleted
the entire `await copyFile(…)` statement **and the gate stayed green** — the
`COMPONENT_META_SRC` constant and its doc comment still contained the filename.

Had the probe not been mandatory, this task would have shipped a gate that
cannot fail for the exact regression it exists to prevent, and the failure mode
in production is invisible locally (the local reader falls back to
`packages/core/docs/`, so every developer machine keeps working while the
deployed site 404s).

The generalisation is worth recording next to A1's **F-8**, which is its mirror
image: there, a lint autofix silently changed a *published* JSON Schema pattern
while the local regex stayed equivalent. Both are the same shape — **the thing
the gate asserts and the thing the gate means are different objects, and only an
observed failure tells you which one you wrote.**

### F-5 · Four public components' stories live outside the family convention, and two are not `Dz`-prefixed 🟠

`packages/core/stories/{family}/Dz{Name}.stories.ts` is the documented layout
(`CLAUDE.md`). Four `public-component` symbols break it —
`GovernanceBadge`, `TeamMemberBadge`, `DzRunStatusBadge`, `DzTokenProgressBar`
— whose stories are under `packages/core/stories/_app-specific/`. The first two
are not `Dz`-prefixed at all.

A convention-only story lookup reported all four as example-less. Reading the
`.stories.ts` path from the **ownership manifest's own evidence array** instead
recovered them: `publicComponentsWithoutExample` fell from 6 to **1**. Worth
noting because A3 and D1 will both be tempted to glob the convention.

The remaining one is **`DzThemeProvider` — the only public component in the
catalog with no stories file at all.**

### F-6 · `DzProvider` and `DzThemeProvider` live in a 12th family that `CLAUDE.md` does not mention 🟢

They are in `packages/core/src/providers/`, not
`packages/core/src/components/{family}/`. `CLAUDE.md` states 11 families;
`capability-matrix.json` already files these two under a 12th, `providers`. The
first family-derivation here produced `unknown` for them and **the schema clause
failed the build**, which is how it was found. Both documents are internally
consistent; they disagree with each other.

### F-7 · `vue-component-meta` was never missing — it was already installed and unused 🟢

The task's gap statement says the accepted extraction tool "is unused here".
Measured: `@storybook/vue3-vite@10.5.1` depends on `vue-component-meta@^3.2.7`,
resolved to **3.3.7**, present in `node_modules` for the life of the Storybook
install. Pinning the direct devDependency to that exact version deduped onto the
existing copy — **2-line lockfile diff, zero packages fetched**. The repo has
been shipping a docgen extractor it never read from.

### F-8 · Two program numbers independently confirmed by a different extraction path 🟢

The capability join reproduced, from a completely separate code path:

- **tiers A 55 · B 67 · C 21 · D 1 = 144** — exactly the documented tiering.
- **8 public components declaring an anatomy** (`DzButton`, `DzDialog`,
  `DzFileUpload`, `DzInput`, `DzProvider`, `DzSelect`, `DzTable`,
  `DzThemeProvider`) → **144 − 8 = 136 non-declaring**, confirming constraint
  **B2**: the anatomy ceiling is **136, not 137**. N2-S1's stated "137 → 124"
  would book a phantom −1.

Three of the eight declare `parts: 'none'` (`DzDialog`, `DzProvider`,
`DzThemeProvider`), so only **5 public components actually name a part**, plus
one compound part (`DzDialogContent`).

### F-9 · The catalog carries almost no `@deprecated` or `@example` JSDoc 🟢

Across 1,712 props: **1** `@deprecated` tag and **6** `@example` blocks. The
artifact publishes both fields, so a docs site can render deprecation banners and
inline examples — it will just have six of them. Cheap, high-visibility
documentation debt that nothing currently measures.

### F-10 · A type error in this task's own new code reached a locally-green state 🟠

`extract-component-meta.ts` carried a TS6133 (unused parameter). `yarn typecheck`
was **green**, because `packages/tooling` is not in `typecheck:all` (A1's F-7,
owner decision **D4**). It was found only by running `tsc -p
packages/tooling/tsconfig.json` by hand.

This is a small, concrete instance of the abstract risk A1 recorded: the home of
all 31 validators and every generator is outside the type gate, and new code
written there is unchecked by default.

### What this task did to A1's F-1, without touching `public-api.manifest.json`

A1 measured **43 public components invisible to every MCP client** and correctly
declined to fix it (constraint **B3**). The three tools added here are generated
from the **ownership manifest**, so they reach **all 144** — proven end to end by
the smoke assertion on `DzRating`, one of the 43.

The ratchet stays at **43** and is *not* lowered, because it measures a specific
thing that is still true: `list_components` / `get_component` still answer from
`llms.txt`, still built from the stale manifest. The practical damage is now
routed around; the defect is not fixed. → **owner decision D4**.

## 9. Ratchet movements

| Ratchet | Before | After | Direction |
|---|---|---|---|
| `validate:all` links | **30** (A1) | **31** | up, by design — `validate:component-meta` added |
| components with a metadata record / 144 | *(uninitialised)* | **144 / 144** | initialised — the packet's success criterion, held as a gate |
| `unclassifiable` (extractor could not process) | *(uninitialised)* | **0** | initialised |
| `unresolvedTypes` | *(uninitialised)* | **0** | initialised |
| `propsWithoutDescription` | *(uninitialised)* | **63** of 1,712 | initialised |
| `slotsWithoutDescription` | *(uninitialised)* | **21** of 326 | initialised |
| `eventsWithoutDescription` | *(uninitialised)* | **106** of 359 (71 model-derived + 35 authored) | initialised |
| `exposedWithoutDescription` | *(uninitialised)* | **26** of 26 | initialised |
| `publicComponentsWithoutExample` | *(uninitialised)* | **1** (`DzThemeProvider`) | initialised |
| `componentsWithoutStaticTemplate` | *(uninitialised)* | **80** of 208 (64 are compound parts) | initialised |
| MCP tools | **9** | **12** | up — `search_components`, `get_component_metadata`, `get_component_example` |
| MCP tools with a contract clause / unit spec / `[malformed]` case / observed data source | 9 / 9 | **12 / 12** | held at 100 % |
| `toolsWithoutE2eSmoke` | **6** | **6 — held** | held deliberately: three new tools, three new smoke calls |
| `catalogVisibilityUnreachable` | **43** | **43 — unchanged** | held deliberately (§8) |
| `packages/mcp` tests | 96 | **124** | up |
| `packages/tooling` tests (this lane) | 30 (A1) | **70** | up — +40 |
| anatomy non-declaring | 136 | **136 — unchanged** | held; independently confirmed (F-8) |
| ownership-manifest entries | 1,327 | **1,327 — unchanged** | held — this task adds no entry |
| capability-matrix rows | 144 | **144 — unchanged** | held — no artifact outside this task's own was regenerated |

## 10. Unresolved owner decisions

**D1 · `defineExpose` members are undocumented public API (F-2).** 26 members
across 21 components, 0 descriptions, and no evidence cell covers them. Options:
(a) move the prose from the `defineExpose()` call onto the members and let the
ratchet fall; (b) add an `exposed` cell kind to the capability matrix; (c) accept
that exposed members are documented only by name and type. Not decidable by a
task.

**D2 · Emit descriptions: accept the recovery mechanism, or change the
declaration style (F-1).** The `emits-interface` join recovers 70.5 % and is
stamped as such. The alternative — declaring emits in the call-signature form
`defineEmits<{ (e: 'click', ev: MouseEvent): void }>()` — may let
`vue-component-meta` read them directly, but it is a repo-wide change to a style
`CLAUDE.md` documents, on 208 components, for a mechanism that already works.
Recommendation: keep the recovery; decide whether the 35 authored-but-undescribed
emits are worth authoring.

**D3 · Which default is canonical (F-3)?** `DzButton.variant` declares
`undefined` in source and `'solid'` in its story's `argTypes`. A generated prop
table must show one of them. Options: (a) show the declared default and a
separate "effective default (provider)" column, which needs the provider's
defaults to become generated data; (b) show the declared default only, which
tells a reader `variant` has no default; (c) make `argTypes` *generated from this
artifact*, which removes the second answer entirely and is the option consistent
with `<generated_authority>`. **This blocks nothing but shapes D1's prop table.**

**D4 · Repoint `list_components` / `get_component` at the metadata artifact?**
That would close A1's F-1 for every consumer without running `generate:exports`
(which B3 forbids), because this artifact covers all 144. It changes the data
source and output format of two already-published tools — a behaviour change to a
public surface, and A1's seam #4 flagged it as an explicit decision rather than a
default. Not taken here.

**D5 · Changeset for `@dzup-ui/mcp` (minor).** Three new tools, three new exports
on `.`, three on `./registry`. Purely additive. No changeset written — N5-01 owns
changelog reconciliation and 17 changesets are already unreleased.

**D6 · The landing site copy has not been produced.**
`apps/landing/scripts/build-registry.ts` now copies the artifact to
`/r/component-meta.json`, and `validate:component-meta` fails if that stops. The
build itself was **deliberately not run**: it does `rm -rf` on
`apps/landing/public/r/` and rewrites **282 tracked files**, which is not a safe
thing to do to a worktree carrying three uncommitted programs. So
`apps/landing/public/r/component-meta.json` does not exist yet. Local MCP works
via the source-of-truth fallback; **production needs one `yarn workspace
@dzup-ui/landing build:registry` run before the three tools work over HTTP.**

**D7 · `vue-component-meta` is pinned exact (`3.3.7`) to dedupe with
Storybook's `^3.2.7`.** If Storybook's range later resolves higher, the tree gets
two copies and the artifact could change under a version bump nobody reviewed.
Either keep the exact pin and bump both together, or add an extractor-version
lane. The extractor version **is** recorded in the artifact (`extractor` field),
so a change is at least visible in the diff.

**D8 · `CLAUDE.md` says 11 component families; there are 12 (F-6).**
One-line doc fix, but it is the architecture reference every agent reads.

**D9 · `validate:all` is ~17 s slower.** The freshness gate re-extracts the whole
catalog, which is the only honest way to answer "is this stale relative to
source". A cheaper input-digest check would miss a generator-logic change. Flagged
as a cost, not proposed as a change.

## 11. Ranked next packet

1. **TASK-N2-D1 (docs site) is unblocked and this artifact is its input.** §13
   states exactly what it can and cannot render. Nothing else in this handoff
   should precede it.
2. **Run `build:registry` once and confirm `/r/component-meta.json` exists (D6,
   ~2 minutes + a 282-file diff to review).** Until then the three new MCP tools
   are locally-green and production-404. This is the only item here that is a
   live defect rather than debt.
3. **Take D4 — repoint `list_components`/`get_component` at the artifact
   (~40 lines).** Closes A1's F-1 for every AI client without touching
   `public-api.manifest.json` and without running `generate:exports`. The largest
   single improvement still available to the agent surface, and it is now cheap
   because the data already exists.
4. **Generate story `argTypes` from the artifact (D3, ~half a day).** Removes the
   second published answer for every prop default, and deletes several hundred
   hand-typed lines across 143 story files. The cleanest instance yet of the
   hand-typed-facts class this program keeps finding.
5. **Fix the 5 committed `packages/tooling` type errors and add it to
   `typecheck:all` (A1's D4, ~1 hour).** F-10 is the second sighting in two
   tasks; the next one will not be caught by an agent running `tsc` by hand.
6. **Author the 35 authored-but-undescribed emits and the 63 undescribed props
   (~2 hours).** Both ratchets fall immediately and the validator prints the
   improvement. Concentrated in ~17 components, listed in F-1 and §12.

## 12. Per-component extraction-quality stats

Every record carries an `extraction` block, and the artifact carries a `totals`
block. Nothing below is estimated; all of it is read out of
`packages/core/docs/component-meta.json`, and the validator prints the headline
numbers on every run.

### 12a. Catalog totals

| Measure | Value | % |
|---|---|---|
| components with a record | **208** (144 public + 64 compound parts) | 100 % of the ownership manifest |
| **components the extractor could not process** | **0** | — |
| **unresolved types** (empty · bare `any` · `__VLS_*` · `import(…)`) | **0** | 0.0 % |
| own props extracted | **1,712** | — |
| **props carrying a description** | **1,649** | **96.3 %** |
| props with a declared default (a real value) | 727 | 42.5 % |
| props declaring `undefined` as the default | 487 | 28.4 % |
| props with no default declared | 498 | 29.1 % |
| required props | 57 | 3.3 % |
| props with `@deprecated` | 1 | 0.06 % |
| props with `@example` | 6 | 0.35 % |
| global props (Vue's own), counted not listed | ~12 per component | — |
| events extracted | **359** | — |
| **events carrying a description** | **253** | **70.5 %** |
| …from `vue-component-meta` | **0** | 0.0 % |
| …recovered from the `Dz*Emits` interface | **253** | 100 % of the described |
| events synthesised by `defineModel` | 83 | 23.1 % |
| slots extracted | **326** | — |
| **slots carrying a description** | **305** | **93.6 %** |
| slots with a non-trivial payload type | 86 | 26.4 % |
| `exposed` members extracted | **26** | — |
| **`exposed` members carrying a description** | **0** | **0.0 %** |
| components with a stories file | 143 | 68.8 % of 208 · **99.3 % of public** |
| components with a published example (real story source) | 143 | same |
| components whose example also yields paste-ready markup | 128 | 61.5 % |
| story entries indexed (id + name + line range) | **1,355** | — |

### 12b. By kind — the two populations behave differently

| | public-component (144) | compound-part (64) |
|---|---|---|
| own props | 1,579 | 133 |
| props described | **1,516 (96.0 %)** | **133 (100 %)** |
| events | 334 | 25 |
| events described | 253 (75.7 %) | **0 (0 %)** |
| slots | 253 | 73 |
| slots described | 240 (94.9 %) | 65 (89.0 %) |
| `exposed` | 26 | 0 |
| published example | **143 / 144** | **0 / 64** |

The two zeros are both explained, not hidden. Compound parts have **no
`Dz{Name}Emits` interface** (most have no `.types.ts` at all — they are bare
`.vue` sub-parts), so there is nothing for the recovery join to read; and they
have no stories of their own by design.

### 12c. Where the description debt actually sits

**Props — 63 undescribed, spread across 54 components, 49 of which are missing
exactly one.** The concentrations:

```
DzDataView(4) · DzAsyncBoundary(3) · DzFieldArray(3) · DzCalendar(2) · DzTour(2)
```

**89 of the 143 public components with props are 100 % documented.**

**Slots — 21 undescribed, across 12 components:**

```
DzCard(5) · DzAsyncBoundary(3) · DzCardHeader(2) · DzErrorBoundary(2) · DzFieldArray(2)
DzCardBody(1) · DzCardFooter(1) · DzDataGridBody(1) · DzFormDescription(1)
DzFormLabel(1) · DzFormMessage(1) · DzThemeProvider(1)
```

**Events — 35 authored ones undescribed, across 17 components:**

```
DzDialogContent(5) · DzPopoverContent(5) · DzTagsInput(5) · DzFieldArray(3) · DzSheetContent(3)
DzContextMenuContent(2) · DzDropdownMenuContent(2) · then 10 components with one each
```

**`exposed` — all 26, across all 21 components that expose anything.**

### 12d. Joins, and how complete each one is

| Join | Coverage | Note |
|---|---|---|
| family | **208 / 208** | 12 families, not the 11 `CLAUDE.md` documents (F-6) |
| risk tier | **144 / 144 public** | A 55 · B 67 · C 21 · D 1 — reproduces the documented tiering exactly |
| capability cells | **144 / 144 public** | compound parts have no matrix row and correctly carry none |
| anatomy | **9 / 208 declared** | 8 public + `DzDialogContent`; only 5 public actually name a part. Confirms the 136 ceiling (F-8) |
| stories | **143 / 208** | 143 / 144 public; the one gap is `DzThemeProvider` |
| `componentCommit` | 144 / 144 public | from the capability matrix; `unknown` for compound parts |

### 12e. Component-type distribution

`class` **203** · `function` **5**. The five function components are the
generically-typed ones (`DzDataGrid` and peers); `vue-component-meta` resolves
their type parameters intact (`data: T[]`, `cell` slot →
`{ row: T; column: ColumnDef<T>; value: unknown; }`).

## 13. What D1 / D2 / A3 can and cannot render from this artifact

The section D1 should read before writing a line of its prop table.

### CAN render, at full fidelity

| Surface | From | Confidence |
|---|---|---|
| **Prop tables** — name, resolved type, required, declared default, description | `components[].props` | **96.3 % have prose**; 100 % have a correct name and type; **0 unresolved types**. Nothing needs a fallback renderer. |
| **Slot tables** — name, payload type, description | `components[].slots` | 93.6 % described. Render the payload column only where `hasPayload` is true; the other 240 print `any`/`{}` in the raw data and mean "no slot props". |
| **Event tables** — name, payload tuple, description | `components[].events` | 70.5 % described. **Render `descriptionSource`** — see below. |
| **A usage example per component**, as real Storybook source | `components[].stories.primary.source` | **143 / 144 public components.** Verbatim slices; a spec asserts each one contains `export const <id>` and that its file exists. |
| **A paste-ready `<template>` snippet** | `components[].stories.primary.template` | **128 / 208.** Present only when the story's template is a static literal. |
| **A story index** (ids, display names, line ranges) for deep links into Storybook | `components[].stories.stories` | 1,355 entries across 143 files. |
| **Family / tier / status / import path / subpath navigation** | top-level fields + `subpaths` | 144 / 144 public. |
| **ADR-19 anatomy part lists** (for `ui`-prop and `data-part` docs) | `components[].anatomy.parts` | Only **5 public components** name parts today. Render the section conditionally; do not imply the other 139 have no parts — they have not *declared* any (that is N2-S1's ratchet, not missing data). |
| **Evidence badges** (D2) — per-component cell counts and the named `unrun` / `stale` kinds | `components[].capability` | 144 / 144 public, **and the names are kept, not collapsed into a count** — which is `<evidence_rules>`'s requirement. |
| **Compound-component docs** — which parts belong to which parent | `kind` + `parentComponent` | 64 compound parts, all attributed. |
| **`llms-full.txt`** (A3) — a complete per-component API section | the whole record | Strictly more complete than today's `llms-full.txt`, which is built from the manifest that omits 43 components. |

### CANNOT render — and must not be faked

| Wanted | Why not | The honest rendering |
|---|---|---|
| **The default a user actually gets** | 487 props declare `undefined` and rely on the ADR-20 provider for the effective value. The artifact records **what the source declares**, which is not the same thing (F-3). | Label the column **"Declared default"**, print `—` for `null` and `undefined` for the literal. **Do not print `solid` for `DzButton.variant`** — nothing generated says that. Resolving it needs the provider's defaults to become generated data first (owner decision D3). |
| **`defineExpose` member descriptions** | 0 of 26 exist anywhere in the repo (F-2). | Render the name and type table; omit the description column entirely rather than showing 26 empty cells. |
| **Event descriptions as if they all came from the same place** | 253 of 253 descriptions are **recovered from the `Dz*Emits` interface**, not from the extractor, and 106 events have none. | Read `descriptionSource`. `emits-interface` is real authored prose and can be rendered plainly. For `descriptionSource: "none"` **and `modelDerived: true`** (71 events), render "synthesised by `defineModel`" — that is a fact, not an apology. For the 35 authored-and-undescribed, render `—`. |
| **An example for any compound part** | 0 of 64 have their own story. | Link to the parent component's example. Do not synthesise `<DzCardBody>…</DzCardBody>`. |
| **An example for `DzThemeProvider`** | No stories file exists. | The MCP tool already returns an explicit "no published Storybook story… this server never synthesises example markup". A docs page should say the same. |
| **A second, third, … example per component** | Only the **primary** story's source is published; the others carry id, name and line range only. | Link to Storybook by story id, or ask A2 to widen the artifact (it would roughly double the stories payload — 97 KB → ~1 MB). |
| **Composables, types, recipes, token modules** | The artifact covers `public-component` and `compound-part` only — 208 of the ownership manifest's 1,327 entries. The 38 composables (including the 5 that B3 protects) are **not** here. | A composables page needs its own generator, or an A2 follow-up. Do not infer them from this file. |
| **Prop grouping into "own vs. inherited from `Base*Props`"** | Inherited props are indistinguishable from own props in the output — deliberately, because a consumer does not care where `ariaLabel` was declared. | `props[].declaredIn` carries the declaring file where the extractor resolved one inside the repo. Group on that if the distinction is wanted; do not guess from names. |
| **Anything about `@dzup-ui/compat`, `@dzup-ui/nuxt` or Pro components** | The generator reads `packages/core` only. | Out of scope; the ownership manifest's 13 compat entries are `compat-alias`, not `public-component`. |

### Two operational notes for D1

1. **Read the file, do not re-extract.** The whole premise is one extractor. If
   D1 needs a field this artifact lacks, add it to
   `packages/tooling/src/meta/` and regenerate — do not reach for
   `vue-component-meta` (or a `.vue` parser) inside the docs app. The freshness
   gate protects the artifact; it cannot protect a second copy of the logic.
2. **The artifact is 1,472,622 B (~1.4 MiB).** Fine for a build-time import, **not** fine to
   ship whole to a browser. Project it: a per-component page needs one record
   (~7 KB); a search index needs name/family/tier/description only (~30 KB for
   all 208). Constraint **B8** (0.85 MB of Storybook budget headroom) applies to
   the storybook static build if A3 embeds any of this into `llms-full.txt`.

## 14. Suggested changeset for D5 (not written to `.changeset/`)

```md
---
'@dzup-ui/mcp': minor
---

Answer component questions from the generated metadata artifact (TASK-N2-A2).

- New tools `search_components`, `get_component_metadata` and
  `get_component_example`, backed by `/r/component-meta.json` — every
  component's props, events, slots and exposed members extracted from source
  with `vue-component-meta`, joined to family, risk tier, ADR-19 anatomy parts
  and evidence-cell state.
- `get_component_example` returns real Storybook story source, verbatim. A
  component with no story returns an explicit absence; the server never
  synthesises example markup.
- These three see all 144 public components. `list_components` and
  `get_component` are unchanged and still answer from the published docs index,
  which omits 43 of them.
- New: `COMPONENT_META_PATH`, `RegistryClient#componentMeta()` and
  `RegistryClient#componentMetaFor()` on `@dzup-ui/mcp/registry`;
  `searchComponents`, `getComponentMetadata`, `getComponentExample` on the root
  entry point.
```

## Appendix — reproduction

```sh
# the artifact (~18 s; run twice, diff — it is byte-identical)
yarn generate:component-meta
npx tsx packages/tooling/src/meta/generate-component-meta.ts --check   # freshness only

# the gate (~17 s; re-extracts the whole catalog)
yarn validate:component-meta
yarn validate:component-meta --all      # every stale/report line, not the first 40

# focused tests
npx vitest run packages/tooling/src/meta
npx vitest run packages/tooling/src/validators/component-meta.spec.ts
npx vitest run packages/mcp                 # the ROOT config -- what CI runs
npx vitest run --root packages/mcp          # the package config, node env

# the MCP surface (must be regenerated whenever a tool changes)
yarn generate:mcp-surface
yarn validate:mcp

# the published artifact, over real JSON-RPC
yarn workspace @dzup-ui/mcp build
node packages/mcp/scripts/e2e-smoke.mjs

# packages/tooling is NOT in typecheck:all -- check it by hand (7 pre-existing errors)
node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json

# the aggregate
yarn typecheck && yarn lint && yarn validate:all
```

### Custody

Nothing was committed, pushed, dispatched to CI or published. No registry
mutation. `apps/landing/scripts/build-registry.ts` was **edited but not run** —
it wipes and rewrites 282 tracked files (owner decision D6). Five seeded
edits were made to prove the gates fail; all six touched files were restored
**byte-identical** (`sha256sum` diff clean) and both gates re-verified green.
`packages/mcp/dist/` (git-ignored) was rebuilt. Every other dirty path in the
worktree belongs to the N1 program, TASK-N2-T1 or TASK-N2-A1 and was not touched.
