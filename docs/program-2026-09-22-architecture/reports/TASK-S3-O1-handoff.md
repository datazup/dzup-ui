# TASK-S3-O1 — Publish the second-tier ownership schema and wire the resolver's second tier

**Status: `[x]` DONE** — engineering complete, nothing committed (the owner
commits). One step is a **named skip**, §6: the second-tier package is not
installed and not published, so live integration is unmeasured. That is the
correct outcome for this task, not a blocker: the schema, the consumption path,
the diagnostics and the fixture are all `ui/dzup-ui` work and all done.

**Commit observed: `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`** (`main`),
**173 dirty paths at start → 194 at end** (17 added or changed by this task, plus this file and the two ledgers); every inherited path preserved.
Nothing committed, pushed, published, dispatched or replaced.
README §2 says `589be13`; that is stale — every number below is bound to
`4e4e46f`, re-measured at the start of this session.

> **Repository boundary.** Everything here is `ui/dzup-ui` work. The commercial
> tier appears only as (a) a **published package name** this repository resolves
> as *data*, and (b) a **yes/no probe**. No sibling checkout was read, written,
> or reported on.

---

## 0. Progress log (append-only, written while the task ran)

| # | When | What |
|---|---|---|
| 1 | session start | HEAD `4e4e46f`, **173 dirty paths** from TASK-S0-O1 / TASK-S1-O2 — preserved, not touched. |
| 2 | session start | **External precondition probed once.** `node -e "require.resolve('@dzup-ui-pro/pro/package.json')"` → **`NOT installed`**. The live-integration half is therefore a **named skip** (§6); the schema, fixture and diagnostic halves run in full. |
| 3 | done_check | Run before reading the rest of the prompt — see §1. **2 of 4 pass, 1 partial, 1 defective**; the decisive check (the schema in `contracts`) fails. Task runs in full. |
| 4 | discovery | Read `../program-2026-09-04/reports/TASK-R3-O1-handoff.md` (735 lines), `packages/core/src/resolver.ts`, `packages/nuxt/src/module.ts`, `packages/tooling/src/ownership/ownership-manifest.types.ts`, the Core manifest header, `packages/tooling/src/validators/ownership-manifest.ts`, `packages/nuxt/test/fixtures.spec.ts`. Findings in §2. |
| 5 | implementation | Schema in `contracts` → resolver → Nuxt module → synthetic fixture → three spec suites → `validate:ownership` gate 6 → fixture skip reason → docs + changeset. §3. |
| 6 | validation | Narrowest first, then the aggregate. `validate:all` failed **twice** before the recorded result — once at **lint** (§5, command 8) and once at **`validate:component-meta`** (§5.1). Both were mine, both are recorded rather than quietly fixed. |
| 7 | end | 18 paths added/changed by this task; **194 dirty paths total, the 173 inherited ones all preserved.** Nothing committed. |

---

## 1. `<done_check>` outcome — **2 of 4 at `4e4e46f`**, 1 partial, 1 defective

Run before reading the rest of the prompt, per README §4.

| # | Check | Result at start |
|---|---|---|
| 1 | `grep -rn 'ownershipManifest\|OwnershipManifestSchema' packages/contracts/src \| head -3` | **FAIL** — zero matches. The schema is **not** published from `contracts`; it exists only inside the **private** `@dzup-ui/tooling` (`src/ownership/ownership-manifest.types.ts`). The decisive check, and the defect the task names, confirmed. |
| 2 | `yarn test packages/core/src/resolver packages/nuxt` → 0, *and the suite covers Core, second-tier-via-fixture, prefix collision, unknown symbol and second-tier-absent* | **PARTIAL.** The exit code was 0 (TASK-S1-O2 measured the whole suite green at this commit), but the **coverage clause was false**: no fixture manifest existed anywhere in the repository, so "second-tier-via-fixture" and "prefix collision" could not have been covered by anything. A check whose exit code passes while its stated condition is false is the kind that lets a seam sit open. |
| 3 | `yarn test:nuxt-fixtures` → `core-pro` runs or **skips with a named reason** | **PASS** — already loud since TASK-OSS-P1-03 (`fixtures.spec.ts:338-347`). See §2 D-3 and §4 for the one thing it did not name. |
| 4 | `npx tsx packages/tooling/src/validators/ownership.ts` → 0, *stating second-tier presence/absence explicitly* | **DEFECTIVE as written** (see below). Under the corrected invocation the exit code was **0**, but the "states presence or absence explicitly" clause was **false**: the validator said nothing whatever about a second tier. |

**Decision.** Check 1 fails and it is the one the task exists to fix, so the task
ran **in full**. Checks 2 and 4 are the more interesting result: both would have
been recorded as green by an agent reading exit codes alone, while the condition
each states was false. Recorded here rather than silently re-run.

**Defective check #4 — 8th recurrence in this programme.** Two faults in one
line:
1. **The path does not exist.** The validator is
   `packages/tooling/src/validators/ownership-manifest.ts`; the prompt names
   `ownership.ts`. As written the command exits **1** with
   `ERR_MODULE_NOT_FOUND`, which reads exactly like a failing gate — the
   filename-vs-script-name trap `<repo_conventions>` already warns about.
2. **`npx` is unsafe in this repository.** It fetches dependency-confusion
   placeholders that exit **0** without running, so the same line can also
   produce a false *pass*.

Executed instead as
`node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/ownership-manifest.ts`,
which is what `yarn validate:ownership` runs. **Correction for future prompts:
write the script name (`yarn validate:ownership`), never a guessed file path,
and never `npx`.**

---

## 2. Discovery — what was already true, and what the packet assumed wrongly

Per README §6, *a packet's stated gap is a hypothesis*. Three corrections:

**D-1. The schema existed; it was just unpublishable.** The full shape is in
`packages/tooling/src/ownership/ownership-manifest.types.ts` — `OwnershipEntry`,
`OwnershipManifest`, `OWNERSHIP_SCHEMA_VERSION = '1.1.0'`, `OWNERSHIP_KINDS`.
`@dzup-ui/tooling` is **private** (`packages/tooling/scripts/release-policy.json`),
so no downstream package can import it. The defect was never "we do not know the
shape"; it was "the shape lives in a package nobody outside this repository can
read". That is why publishing it — rather than designing it — is the deliverable.

**D-2. The consumption path the packet describes is *a second* path, not the
missing one.** `TASK-R3-O1` §2 finding F1 established that a build-time merge
already works end to end: `DZUP_PRO_OWNERSHIP_MANIFEST` → `buildRuntimeLookup`
→ `buildOwnershipMap` → `renderRuntimeLookup` → `COMPONENT_OWNERSHIP` +
`OWNERSHIP_TIERS`. What it cannot do is answer for the version a **consumer**
installed: a table baked at our build time is a claim about a package on *our*
machine. So this task adds the runtime read and keeps the build-time merge, and
the two compose (see §3).

**D-3. Step 4 was already done.** `packages/nuxt/test/fixtures.spec.ts:330-347`
already reports `core-pro` as **`unrun` with a named reason and the command that
would fix it** (`it.skipIf(isRunnable('core-pro'))('is unrun without a Pro
tarball')`, plus the stage-wide assertion at :175-181 that *every* unrun fixture
states what it is missing). The vocabulary differs from the prompt's — the suite
says `unrun`, deliberately, because `packages/nuxt/test/fixtures.spec.ts:19-20`
states "an unrun cell and a passing cell must not look the same" — but the
requirement (`<skip_loudly>`: one line naming what is missing and what would
unblock it) is met. See §4 for the one thing that was **not** met.

### The external precondition — probed once, answered `NOT installed`

```
$ node -e "try{require.resolve('@dzup-ui-pro/pro/package.json');console.log('second-tier package resolvable')}catch{console.log('NOT installed')}"
NOT installed
```

Per `<repository_boundary>`, nothing further was asked about the other tier. The
schema, fixture and diagnostic halves ran in full; §6 records the one skipped
step and its named reason.

---

## 3. Implemented files + API effect

### 3.1 `packages/contracts/src/ownership-manifest.ts` — **new, the published contract**

The artifact that was missing. Pure, zero `node:*`, zero DOM — it runs in a build
tool, on a server and in a browser. Public surface:

| Export | Kind | What it is |
|---|---|---|
| `OWNERSHIP_MANIFEST_SCHEMA_VERSION` | const `'1.1.0'` | the schema version this build emits and reads |
| `OWNERSHIP_MANIFEST_SCHEMA_MAJOR` | const `1` | the only major it will read; a different major is **refused with the version named**, never parsed best-effort |
| `OWNERSHIP_MANIFEST_SUBPATH` | const | `'./manifests/component-ownership.manifest.json'` — a **declared exports subpath**, not a deep path into the package directory |
| `OWNERSHIP_MANIFEST_KINDS` / `_STATUSES` | const | the same value sets the generator emits |
| `MOUNTABLE_OWNERSHIP_KINDS` | const | `['public-component', 'compound-part']` — the filter that stops a resolver importing a type |
| `OwnershipManifestDocument` / `Entry` / `Kind` / `Status` / `Tier` / `Deprecation` | types | the shape |
| `readOwnershipManifest(value, opts?)` | fn | pure validation; returns `{ ok, manifest?, rejection?, schemaVersion?, problems[] }` |
| `isSupportedOwnershipSchema(version)` | fn | the version gate, exported so nobody forms a second opinion about it |
| `indexOwnershipManifest(manifest)` | fn | mountable-only, prototype-free `Record<symbol, resolution>` |
| `ownershipSpecifier(pkg, subpath)` | fn | joins without producing `pkg/./sub` |
| `consumeOwnershipManifest(pkg, io)` | fn | resolve → read → validate → index, with the three-failure discrimination, over **injected** IO |
| `ownershipManifestDiagnostic(availability, ctx)` | fn | the one actionable sentence, built once for both consumers |
| `ownershipCollisionDiagnostic(symbol, ctx)` | fn | names both packages, awards no winner |

**Why `contracts` and not `tooling`** — tooling is private; a contract a consumer
cannot import is not published. **Why not `core`** — `packages/core/src`'s runtime
exports land in `component-ownership.manifest.json`, whose schema has no
`utility` kind, so each one lands as `unclassified` under a ceiling of **29 that
only ratchets down**. Eleven functions there would have taken it to 40. This is
the same reasoning, and the same precedent, as `packages/contracts/src/form-value.ts`
(its module doc states it verbatim). **The unclassified ratchet therefore did not
move: 29 → 29.**

**Field-by-field rationale** is a table in the `OwnershipManifestEntry` docblock.
The governing constraint is the prompt's own: *a schema that cannot be satisfied
is the same failure as no schema*. Every required field
(`symbol`, `package`, `subpath`, `kind`) is something a component library can
generate about **itself**. `since`, `deprecated`, `family`, `status`, `subpaths`
and `anatomy` are optional additions over the tooling shape.

**One deliberate divergence, recorded in the docblock: `evidence` is optional
here and required in this repository's own manifest.** Its content is authority
*file paths inside the producing repository*; it exists so a generator can prove
its classification to its own validator. A consumer cannot open those paths and
the resolver never reads the field, so requiring a second tier to publish its
internal file layout would be requiring a field for no consumer benefit. It is
still accepted and still validated when present.

`anatomy` is typed `unknown` rather than `ComponentAnatomy`: the anatomy contract
versions on its own schedule, and pinning this field would make a second tier's
manifest fail to type-check the day the vocabulary grows — over a field no
resolver reads. Validated as "an object if present".

### 3.2 `packages/core/src/resolver.ts` — the resolver's second tier

- `DzResolverOptions` gains **`resolveFrom?: string`** (a type, so it costs no
  ownership budget). It is the consumer's project directory, and resolution is
  anchored on `<dir>/package.json` because `createRequire` resolves relative to
  the directory of the *filename* it is given — handing it a bare directory
  starts the lookup one level above the project. `@dzup-ui/nuxt` paid for that
  lesson already; this repeats the fix, not the bug. Default `process.cwd()`.
- A module-private `loadSecondTier()` supplies six lines of IO to
  `consumeOwnershipManifest`. **Nothing new is exported from core.**
- `resolve()` now falls through to the second tier: first tier → second tier →
  `undefined`. Unknown names answer `undefined` in **both** tiers.
- A second-tier answer's `from` is `ownershipSpecifier(package, subpath)`, so a
  second tier can route a part to a narrower entry point. The generated table can
  only ever say "the package"; the published schema is what makes the narrower
  answer expressible.
- The construction-time warning is now built from
  `ownershipManifestDiagnostic`. **One message, never two** — the baked-in table
  and the installed manifest are two routes to one tier, so a project missing
  both has one problem. The message still contains `includePro` and
  `DZUP_PRO_OWNERSHIP_MANIFEST`, so the pre-existing pin in `resolver.spec.ts`
  holds unchanged.

**Core imports no second-tier runtime source.** The manifest is resolved as a
JSON subpath and parsed; the package is never `import()`ed, so nothing in it
executes in a consumer's build. A contracts spec asserts this against
`consumeOwnershipManifest.toString()`.

### 3.3 `packages/nuxt/src/module.ts` — `includePro` resolves something

- **New exports:** `loadSecondTierOwnership(projectRoot?)`,
  `secondTierMissingMessage(load)`, `withoutCollisions(symbols, report)`.
- `componentsToRegister(includePro, secondTier = {})` — **optional** second
  parameter, so every existing call site and its specs are unchanged.
- `setup()` now: package unresolvable → `proMissingMessage()` (byte-for-byte
  unchanged); otherwise read the installed manifest → register the second tier,
  or emit `secondTierMissingMessage(load)`, which names **which** of the three
  failures occurred. A `no-manifest` result while the baked-in table *does* carry
  the tier is reported at `warn`, not `error`: nothing is broken for that
  consumer, but the two sources disagree and the baked-in table will go stale.
- `filePath` for a second-tier component is the manifest's own specifier, so
  `DzFixtureGizmoPanel` registers from `@dzup-ui-pro/pro/gizmos`.
- **API effect:** `proTierMissingMessage()` is marked `@deprecated` and is no
  longer emitted by `setup()`. It is **kept exported** — removing a published
  export is a breaking change — and its text is still a true statement about the
  baked-in table. Its own unit test is unaffected.
- `packages/nuxt/package.json`: `@dzup-ui/contracts: workspace:*` added to
  `dependencies` (mirroring how `@dzup-ui/core` declares it). Not a peer:
  `validate:peers` checks `peerDependencies` only, and contracts is an
  implementation detail of this module's logic, not something the consumer
  installs.

### 3.4 `packages/core/test/fixtures/second-tier-ownership.manifest.json` — **new, synthetic**

Carries `"fixture": true` and a `$comment` stating in one line that it is fake
and must never move under a `manifests/` directory. Every component name is
fictitious (`DzFixtureGizmo`, `DzFixtureGizmoPanel`, `DzFixtureRetiredWidget`),
plus a deliberate `DzButton` **collision probe**, a `type` and a `composable` that
must never resolve as components. **One fixture serves both consumers**: if the
resolver and the Nuxt module were tested against two different fake manifests,
the two could drift apart and both suites would stay green — which is the
original defect, one level up.

### 3.5 Specs — 90 new tests, none of which need anything installed

| File | Tests | Covers |
|---|---|---|
| `packages/contracts/src/ownership-manifest.spec.ts` (new) | 48 | version policy, every accept/refuse rule, indexing, the three-failure discrimination, diagnostics |
| `packages/core/src/resolver.second-tier.spec.ts` (new) | 23 | the five named cases + fail-closed rules |
| `packages/nuxt/src/module.second-tier.spec.ts` (new) | 19 | the five named cases through `setup()` |

Resolution is **real, not mocked**, in both consumer suites: a package directory
is written under a temp root with an **ESM-only `exports` map**, because the
thing most likely to break is Node's resolution base and a mocked `createRequire`
agrees with that bug (it did, twice, in `@dzup-ui/nuxt`). Both suites include a
guard that resolution does not leak into an ancestor directory, so the fixtures
cannot pass for the wrong reason.

### 3.6 `packages/tooling/src/validators/ownership-manifest.ts` — gate 6

New `checkSecondTierManifest(env?)` + `formatSecondTier(report)`, and a new
`secondTier` field on `OwnershipReport`. It runs **first** and is reported on
every path, including the early returns — a validator that only mentions the
second tier when everything else is fine is silent exactly when someone is
looking.

Two places are checked, in priority order, **with the same reader a consumer
uses**: `DZUP_PRO_OWNERSHIP_MANIFEST` (the build-time merge input) and the
installed package. Rules:

- **Absent → reported, never failed.** An OSS-only checkout is the normal case,
  and it now prints a sentence instead of nothing.
- **Present and non-conforming → failed.** A consumer's build would refuse it
  too; discovering that downstream is the failure mode H1 recorded.
- **New: the published contract and the generator must agree.** If
  `@dzup-ui/contracts`'s `OWNERSHIP_MANIFEST_SCHEMA_VERSION` and
  `@dzup-ui/tooling`'s `OWNERSHIP_SCHEMA_VERSION` drift, a downstream package
  conforming to the published contract would produce a manifest this repository
  refuses — the defect this packet closed, inverted. Two files, and nothing
  else compared them. Also pinned in the spec for the kind and status
  vocabularies.

Live output at `4e4e46f`:

```
✓ ownership-manifest: 1338 entries fresh and internally consistent, runtime lookup in sync;
  29/29 unclassified; 41/41 public components without anatomy
  second tier: ABSENT — "@dzup-ui-pro/pro" (not installed in this checkout). Expected in an
  OSS-only checkout; a conforming manifest at ./manifests/component-ownership.manifest.json
  would be consumed if one were installed. Reported, not a failure.
```

The validator imports contracts' **source** relatively, as it already does for
`ANATOMY_PART_VOCABULARY`, for the reason recorded there: it runs under `tsx`
with no build step, and the package specifier resolves to
`packages/contracts/dist/`, which a fresh clone has not built.

### 3.7 Documentation — how a downstream consumer discovers the contract

- `packages/contracts/README.md` — new section with the schema module, version,
  readable major, subpath, required/optional fields, a generator snippet, and
  the three rules the consumers apply. Added **outside** the
  `<!-- facts:versioning -->` block; `validate:readme-facts` = **0**.
- `packages/nuxt/README.md` — new "What `includePro` actually resolves" section
  under the existing "When Pro is missing".
- `.changeset/a-second-tier-can-publish-a-manifest-and-have-it-resolved.md` —
  `@dzup-ui/contracts` · `@dzup-ui/core` · `@dzup-ui/nuxt`, all **patch**.
  Patch, not minor, under `packages/contracts/VERSIONING.md`: nothing was
  removed from the breaking surface (manifest-recorded public symbols, the
  ADR-19 contract, the token ABI, the `exports` map, the ADR-20 provider
  contract) and no existing answer changed. Names that used to resolve to
  `undefined` because no second tier could exist may now resolve — the option
  finally doing what it says.

---

## 4. Step 4 — the `core-pro` tarball fixture

**Already loud; made complete.** The pre-existing skip named **one**
precondition (a tarball). With the schema published there are **two**, and a
tarball that installs but publishes no conforming manifest would stage green,
build, and register nothing — so naming only the tarball would send whoever
unblocks this down the wrong path.

1. `packages/nuxt/test/fixtures.spec.ts` — the unrun line now names both, with
   the exact subpath and the schema major.
2. A new `it.runIf(isRunnable('core-pro'))` assertion,
   **`publishes a conforming ownership manifest`**, runs *before* the render
   assertion. It checks the installed package's `exports` map declares the
   subpath, that the file is there, that it parses, and that
   `readOwnershipManifest` accepts it. Without it a conformance failure would
   surface as "`DzDataGridPro` is not a component" — a symptom three layers from
   its cause. Checked after install rather than at pack time because a `.tgz`
   would have to be un-tarred, and after `:install` the package is already
   unpacked on disk.
3. `packages/nuxt/scripts/pack-fixtures.mjs` — the "DZUP_PRO_TARBALL is not set"
   note names the second precondition too.

Measured output of the run in §5:

```
· core-pro: unrun — needs BOTH (1) DZUP_PRO_TARBALL set to a tarball from a second-tier
  checkout, then `yarn test:nuxt-fixtures:pack` and `:install`; and (2) that tarball exporting
  "./manifests/component-ownership.manifest.json" at schema major 1 (this build reads 1.1.0),
  per the schema published from @dzup-ui/contracts.
```

**Vocabulary note.** The suite says `unrun`, not `skipped`, and that is
deliberate: `fixtures.spec.ts:19-20` records "an unrun cell and a passing cell
must not look the same". The prompt's `<skip_loudly>` requirement — one line
naming what is missing and what would unblock it — is met by the stronger word.

---

## 5. Validation — exact commands and exit codes, bound to `4e4e46f`

Every command was run end to end with output to a log and the exit code read
**directly**, never through a pipe.

| # | Command | Exit | Note |
|---|---|---|---|
| 1 | `node node_modules/vitest/vitest.mjs run packages/core/src/resolver packages/contracts/src/ownership-manifest` | **0** | 3 files, 94 passed, 1 skipped |
| 2 | `node node_modules/vitest/vitest.mjs run packages/nuxt/src` | **0** | 3 files, **69** passed (was 50) |
| 3 | `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/ownership-manifest.spec.ts` | **0** | **48** passed (was 40) |
| 4 | `yarn test:nuxt-fixtures` | **0** | 20 tests, 12 passed, 8 skipped; 345.6 s; `core-pro` unrun with **both** reasons named |
| 5 | `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/ownership-manifest.ts` | **0** | second tier stated explicitly (§3.6) |
| 6 | `yarn typecheck` | **0** | |
| 7 | `yarn typecheck:tooling` | **0** | |
| 8 | `yarn lint` | **0** | see the note below — it was **1** for one round |
| 9 | `yarn test` | **0** | **556 files** (was 553), **10,637 passed** (was 10,531), 0 failed, 3 skipped, 1 todo. **Re-run after the §5.1 regeneration — identical figures**, so no spec reads the two artifacts in a way the regeneration disturbed. |
| 10 | `yarn validate:all` | **1** | **48 of 51 green**; first red at link **44/51** `validate:externals`. Read end to end from a log, exit code read directly. |
| 11 | `yarn validate:dts` (45) · `changelog` (46) · `release-policy` (47) · `peers` (48) · `licenses` (49) · `tree-shake` (50) · `evidence-binding` (51) | **1 · 0 · 0 · 1 · 0 · 0 · 0** | run individually because the chain is `&&` |
| 12 | `yarn build` | **1** | **exactly 14 `error TS`**, all in `packages/codemods/src/transforms/__fixtures__/swap-icon-library/*` |
| 13 | `yarn validate:{component-meta,provider-defaults,llms,docs-pages,playground-parity,registry,docs-size,package-names,doc-snippets,engines,adr-references,readme-facts,exports,published-imports,boundaries,hardcoded-strings}` | **0** each | the downstream-of-contracts links, re-checked one by one after §5.1 |

**The three reds are the same three, unchanged, and none of them is mine.**

| Link | Gate | Failure | Whose |
|---|---|---|---|
| 44 | `validate:externals` | **1 package** — `@dzup-ui/codemods`, undeclared `@lucide/vue/*`, `reka-ui`, `vue` inside `dist/transforms/__fixtures__/swap-icon-library/*` | pre-existing, landed at `589be13` |
| 45 | `validate:dts` | 1 error — missing `.d.ts` for `codemods/dist/.../04-dynamic-and-reexport.input.js` | pre-existing |
| 48 | `validate:peers` | `[single-version]` two icon-library versions resolve (`0.475.0`, `0.477.0`) | pre-existing |
| — | `yarn build` | 14 TS errors, same fixtures | pre-existing, ungated (**D-S0O1-1**) |

All four are **one open decision** — D174/D175, the icon swap, tracked by
TASK-R1-O6. This task touched nothing under `packages/codemods/` or
`apps/landing/`. **Identical to the state TASK-S1-O2 left**, which is the bar
`<stop_conditions>` sets: do not fix them, do not make them worse.

### 5.1 Two generated artifacts moved, and exactly why

`validate:all` caught something a narrower run would not have: publishing five
new string-union types from `@dzup-ui/contracts` makes a **generated artifact**
stale. That is the artifact doing its job, and the fix is to regenerate in the
prescribed order (`<generated_authority>`: ownership → quality → capability →
component-meta → llms → docs-pages), starting at the first stale one.

| Artifact | Why it moved | Verified how |
|---|---|---|
| `packages/core/docs/component-meta.json` | its `taxonomies` section enumerates the string-union types `@dzup-ui/contracts` exports; five were added (`OwnershipManifestAvailability`, `…Kind`, `…Rejection`, `…Status`, `…Tier`) | **diffed field by field against the pre-task file: `taxonomies` is the ONLY top-level key that changed, and `components` differs in 0 of 209 records.** Nothing about any component moved. `sourceCommit` restamped `589be13` → `4e4e46f`, i.e. the binding improved. |
| `apps/docs/.vitepress/generated/nav.json` | it carries `artifactSha256` of `component-meta.json` | **the only line that changed.** `validate:docs-pages` reported exactly one violation before and zero after; the 151 generated `.md` pages were rewritten byte-identically (the dirty-path count did not move: **193 before, 193 after**). |

`validate:llms`, `validate:playground-parity` and `validate:registry` were each
run separately and were **already green** — the taxonomies do not reach them.

**A method note worth keeping.** The first attempt to attribute this diff
compared the regenerated file against `HEAD`, which showed ~96 changed lines of
capability-matrix cells and looked like this task had moved TASK-S1-O2's work.
It had not: those lines are S1-O2's own uncommitted regeneration. The right
comparison is *pre-task working tree* → *post-task working tree*, not
`HEAD` → *post-task*, in a worktree that already carries 173 dirty paths from
two earlier tasks. Stated because the next task in this programme inherits an
even dirtier tree.

**Command 8, stated rather than glossed.** `yarn lint` went red once mid-task
and the aggregate is what caught it. Two `jsdoc/check-param-names` warnings on
the new module were "fixed" by folding destructured sub-params into one
`@param`; the rule then wanted the sub-params back, so one warning became
**five**, and the root script's `--max-warnings 0` turned that into a failing
link. Both levels are now documented and `yarn lint` = **0**. Recorded because
the first `validate:all` run of this task failed at **lint**, not at the three
known reds, and a handoff that only showed the final green would have hidden
that the aggregate did its job.

**Command 4 caveat, stated rather than glossed:** the staged tarballs predate
this change (`packages/nuxt/test/.tarballs/stage.json`), so that run is evidence
about the **previously packed** artifacts plus the current `fixtures.spec.ts`
source. It is not evidence that this working tree packs and installs cleanly;
re-packing is `yarn test:nuxt-fixtures:pack` + `:install` + another ~6 minutes,
and N5-04 finding F10 (pack has no build step and no freshness assertion) is
still open and is not this task's file.

---

## 6. The one skipped step, and its named reason

**Skipped: live integration against a real second-tier package.**

**Reason:** `@dzup-ui-pro/pro` is **not installed and not published**. Probed
once, at the start, with the exact command the orchestrator specified; the
answer was `NOT installed`. No further question was asked about the other tier
(`<repository_boundary>`).

**What that means, precisely, so nobody over- or under-reads it:**

| Claim | Status at `4e4e46f` |
|---|---|
| The schema is published and usable by a downstream package | **proven** — `packages/contracts/src/ownership-manifest.ts`, 48 tests |
| The resolver consumes a conforming manifest by exact name | **proven** against the synthetic fixture with **real Node resolution** (23 tests) |
| The Nuxt module registers a second tier from a conforming manifest | **proven** the same way (19 tests) |
| Every failure path is actionable and tested | **proven** (both suites + 8 validator tests) |
| A **real** second-tier package publishes a conforming manifest | **UNMEASURED** — no such package exists to ask |
| `core-pro` builds a real Nuxt app against a real second-tier tarball | **UNRUN**, with both preconditions named |

On the maturity ladder in `<evidence_rules>`: the schema, the consumption path,
the diagnostics and the fixture are **aggregate-qualified** (they ran in
`yarn test`). Nothing here is packaged-qualified or released, and the
`core-pro` cell stays unmeasured. **Two levels were not collapsed.**

**A finding for whoever unblocks it** (`<repository_boundary>`: written here,
not pushed anywhere): `packages/nuxt/test/fixtures/core-pro/app.vue` renders
`<DzDataGridPro>`. Nothing in this repository has ever verified that a package
exports that name — it is a fixture written before any manifest existed. The day
a tarball lands, the fixture asserts (a) the manifest conforms, then (b) that
`DzDataGridPro` renders. If the real manifest does not carry that exact symbol,
(b) fails for a reason that has nothing to do with the seam. Fix the fixture's
component name from the manifest, not the other way round.

---

## 7. Ratchet movements (old → new)

| Ratchet | Before | After | Note |
|---|---|---|---|
| **Published second-tier ownership schema** | **0** | **1** | the artifact the seam waited on for two programmes |
| **Packages able to produce a conforming manifest** | **0** (schema was private) | **any** | `@dzup-ui/contracts` is published |
| Resolver tiers actually resolvable | 1 (core) | **2** (core + an installed second tier) | second tier via the consumer's own `node_modules` |
| Second-tier consumption paths | 1 (build-time env merge, our machine) | **2** (+ runtime read, the consumer's machine) | they compose |
| `validate:ownership` gates | 5 | **6** | second-tier presence/absence + contract-vs-generator version |
| `validate:ownership` statements about the second tier | **0 (silent)** | **1 on every run** | absent and fine no longer print the same nothing |
| `core-pro` unrun preconditions named | 1 (tarball) | **2** (+ conforming manifest at the declared subpath) | |
| `core-pro` conformance assertions | 0 | **1** (runs before the render) | a conformance failure names its cause |
| Test files / tests | 553 / 10,531 | **556 / 10,637** | +3 files, +106 tests |
| `packages/nuxt/src` tests | 50 | **69** | |
| `packages/tooling/.../ownership-manifest.spec.ts` tests | 40 | **48** | |
| `validate:all` links | 51 | **51** | gate 6 lives inside link 30 (`validate:ownership`); the chain is unchanged |
| **unclassified** | 29 | **29** | deliberately — nothing new exported from `packages/core/src`; see §3.1 |
| `maxWithoutAnatomy` | 41 | **41** | untouched |
| `maxProposedCitedFromCode` | 3 | **3** | untouched |
| Capability-matrix stale / unrun | 22 / 400 | **22 / 400** | untouched |
| AT matrix executed | 0/534 | **0/534** | untouched — an agent never moves this |
| Published contract taxonomies in `component-meta.json` | 5 fewer | **+5** | `OwnershipManifest{Availability,Kind,Rejection,Status,Tier}` — the artifact reporting a real API change |
| `component-meta.json` `sourceCommit` | `589be13` | **`4e4e46f`** (HEAD) | regeneration restamped it; the binding improved |
| Artifacts bound to HEAD | 4 of 4 | **4 of 4** | `component-ownership.manifest.json` is byte-identical (`validate:ownership` = 0 without regeneration); `component-meta.json` + `nav.json` regenerated, §5.1 |
| Pending changesets | 38 | **39** | one added for the three packages; `validate:changelog` = 0 |
| `@deprecated` symbols without a record | *unmeasured* | *unmeasured* **+1 known** | `proTierMissingMessage()` — a named input to TASK-S2-O2 |

**No ratchet was raised. No allowlist, ceiling or exception file was widened.**
`validate:ownership` was 0 before this task and is 0 after, with one more gate
inside it.

---

## 8. Owner decisions raised

**S3O1-D1 — the cross-tier collision rule at a consumer's build time.**
A name both tiers export keeps the **first tier's** answer, and both packages
are named in a diagnostic. Choosing a winner is explicitly an owner act
(`<stop_conditions>`), so this packet chose the one behaviour that awards
nothing.
- (a) **Additive overlay** — first tier wins, loudly. *Recommended.*
- (b) Second tier shadows the first. Rejected here: it lets a package installed
  downstream silently replace an upstream component.
- (c) Withhold the name from **both** tiers, exactly as `buildOwnershipMap` does
  for an unresolved build-time collision. Consistent, but it lets a downstream
  package **remove** a first-tier component from a consumer's build — a
  downstream-breaks-upstream failure nobody has authorised.
- (d) Honour `collision-decisions.json` at runtime too, so an owner's recorded
  decision applies in both paths.
- **Recommendation: (a) now, (d) when a real collision exists.** (d) needs the
  decisions file to ship inside `@dzup-ui/core`, which is a packaging change.
- *Context:* TASK-R3-O1 §9 recorded one pre-known cross-tier collision,
  `CalendarView`. It is `kind: "type"`, therefore **not mountable**, therefore
  it can never reach this overlay. It can still fail the **build-time** gate.
  Do not double-count it.

**S3O1-D2 — two routes to the second tier: keep both, or retire the build-time
merge?** `DZUP_PRO_OWNERSHIP_MANIFEST` bakes a tier into the shipped table at
*our* build time; the new path reads the consumer's installed package.
- (a) **Keep both** (today). They compose and the diagnostic covers both.
- (b) Retire the baked-in merge: a table baked on our machine is a claim about a
  package on our machine, and it goes stale invisibly the moment the second tier
  ships a new version.
- (c) Keep the merge for docs/registry generation only, not for the shipped
  resolver table.
- **Recommendation: (b), but not in this packet.** It changes what
  `OWNERSHIP_TIERS` means and what `checkRuntimeLookup` re-derives, and it is a
  behaviour change to a published package that deserves its own decision.

**S3O1-D3 — `evidence` optional downstream, required here.** (a) Optional
*(chosen — it names paths inside the producing repository, which a consumer
cannot open and no resolver reads)*; (b) required, mirroring this repository's
own manifest exactly. **Recommendation: (a).**

**S3O1-D4 — the tier vocabulary is closed at `'core' | 'pro'`.** A partner
package or an internal design system cannot publish a conforming manifest today.
- (a) **Keep closed** until someone asks. *Recommended.*
- (b) Open `tier` to any string and key by package name instead.
- *Note:* opening `tier` alone would not be enough — both consumers resolve a
  single hard-coded second-tier package name. A third tier is a larger change
  than a schema field.

**S3O1-D5 — `proTierMissingMessage()` is now `@deprecated`.** Kept exported
(removing a published export is a breaking change under
`packages/contracts/VERSIONING.md`), no longer emitted from `setup()`.
- (a) **Keep until the 1.0 act, then remove.** *Recommended.*
- (b) Remove at the next minor.
- **This is a direct input to TASK-S2-O2**, whose ratchet is "`@deprecated`
  symbols without a record → 0". It is the repository's newest such symbol and
  has no record yet.

**S3O1-D6 — should the contract-vs-generator schema-version check be its own
`validate:all` link?** It currently lives inside link 30
(`validate:ownership`). (a) **Leave it there** *(recommended — it is an
ownership fact and the link count stays 51)*; (b) promote it, for a named gate
in the release report.

---

## 9. Findings filed, not fixed

**F1 — `module.pro.spec.ts`'s "says nothing on the logger when everything
resolves" asserts only `mocks.error`.** With a baked-in `pro` tier present and
an installed package that publishes no manifest, `setup()` now emits one
`logger.warn` — correct behaviour (the two sources of truth disagree and the
baked-in table will go stale), but the test's *name* is now broader than what it
asserts. Left as-is rather than renamed: the fixture in that file has no
manifest by construction, and tightening the assertion there belongs with
S3O1-D2.

**F2 — `packages/nuxt/test/fixtures/core-pro/app.vue` names `DzDataGridPro`**,
a symbol no artifact in this repository has ever verified. See §6.

**F3 — N5-04 finding F10 is still open.** `test:nuxt-fixtures:pack` runs
`yarn pack` with no build step and no freshness assertion, so the §5 command-4
run is evidence about tarballs staged before this change. Recorded in
`docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md:199-211`; it is
N5-03's file, not this one's.

---

## 10. Ranked next packet

1. **TASK-S2-O1 — package-qualification matrix, the seven uncovered rows**
   (doc-08 rows covered 5/12 → 12/12). Nothing in this task blocks it. It is the
   orchestrator's stated next task and the one this packet leaves cleanest: the
   `core-pro` row's two preconditions are now both named, which is exactly the
   kind of row that matrix has to carry honestly.
2. **TASK-S2-O2 — release report + stop-condition gate + deprecation
   machinery.** This packet hands it three concrete inputs: one new
   `@deprecated` symbol with no record (`proTierMissingMessage`, S3O1-D5), three
   new published symbols in `@dzup-ui/nuxt` and twelve in `@dzup-ui/contracts`
   for the release report, and a changeset already written.
3. **TASK-S3-O2** — form-control primitives; independent of everything here.

Nothing in this task blocks TASK-S2-O1 or TASK-S2-O2.
