# TASK-R3-O1 — Consume the Pro ownership manifest: resolver Pro tier and the `core-pro` fixture

**Status: `[!]` BLOCKED on Pro TASK-R1-P4.**
**Commit observed: `99b963a`** (`main`, verified at start and end). Every number
in §0–§8 is bound to that commit.

> **§9 (2026-09-18, `569d887`) is a later session** and supersedes §1.4: the two
> latent defects F2 and F3 are **fixed and pinned**, and the collision list is
> **not empty** — `CalendarView` already overlaps. Numbers in §9 are bound to
> `569d887`. The block itself is unchanged.

## 0. Why this is blocked, and what was deliberately not run

The `<done_check>`'s first gate fails:

```
$ ls ../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json
ls: cannot access '...': No such file or directory     # exit 2
```

Pro TASK-R1-P4 has not run, so no Pro ownership manifest exists anywhere on this
machine. The task's own instruction for that gate is *"stop: prepare steps 1–2
only"*.

| Step | Ran? | Why |
|---|---|---|
| 1 — discovery, manifest header facts, collision list | **yes** | §1 below |
| 2 — extend generator, regenerate map + `OWNERSHIP_TIERS` | **prepared, not executed** | needs the Pro manifest as input. **Finding F1: no generator extension is needed — the code already exists.** §2 |
| 3 — fix `canResolvePro()`, two unit specs | **yes, implemented** (4 specs) | independent of the Pro manifest; R4a is a live defect today. §3 |
| 4 — build + pack both repos, run `core-pro` fixture | **no** | no Pro tarball can exist; out of scope by orchestrator instruction |
| 5 — full validation ladder, record C7 measurable | **partial** | the ladder ran for what changed (§5); C7 stays unmeasurable until step 2 executes |

No commit, push, publish or CI dispatch was performed. Nothing inside
`ui/dzup-ui-pro` was read for mutation, checked out, or cleaned.

---

## 1. Discovery

### 1.1 The ownership-map generator, and how `compat` is actually merged

The task's gap note says the manifest "has two tiers (`@dzup-ui/core` 1,314,
`@dzup-ui/compat` 13)". **That is a package split inside one tier, not two
tiers.** Measured at `99b963a`:

```
entries by package: { '@dzup-ui/core': 1314, '@dzup-ui/compat': 13 }   # 1,327 total
distinct entry-level `tier` values: [ undefined ]                      # entries carry no tier
```

`OwnershipTier` is `'core' | 'pro'` and nothing else
(`packages/tooling/src/ownership/ownership-manifest.types.ts:16`). `compat` is
folded into the **Core** manifest by the Core generator — its
`generatedFrom` lists `packages/compat/src/adapters/*.vue` and
`packages/compat/src/index.ts`. So **the Pro tier does not follow the compat
path**; compat is not a precedent for it. Pro follows the *manifest-merge* path,
which is a different mechanism and already built:

| Concern | Where it lives |
|---|---|
| Merge of N manifests into one map | `packages/tooling/src/ownership/build-ownership-map.ts:96-222` (`buildOwnershipMap`) |
| Tier order | **Not a declared policy.** `map.inputs` preserves input order (`build-ownership-map.ts:215`); `renderRuntimeLookup` then *sorts* them (`emit-runtime-lookup.ts:44`), so `OWNERSHIP_TIERS` is alphabetical → `['core', 'pro']` |
| Collision policy (data) | `packages/tooling/src/ownership/collision-decisions.json` — currently `"decisions": {}`, with a `$comment` recording "zero overlapping symbols between Core @ `be76ddb` and Pro @ `origin/main`", verified 2026-08-20 |
| Collision policy (code) | `build-ownership-map.ts:157-181`. Unresolved collisions are **excluded from `symbols`** (lines 177-180) and land in `map.collisions`; the CLI exits non-zero on them (line 295) |
| Runtime table emitter | `packages/tooling/src/ownership/emit-runtime-lookup.ts:43-87` |
| Pro input, by env var | `PRO_MANIFEST_ENV = 'DZUP_PRO_OWNERSHIP_MANIFEST'` — `generate-ownership-manifest.ts:67` |
| Merge entry point | `buildRuntimeLookup(manifest, proManifestPath)` — `generate-ownership-manifest.ts:77-92` |
| Validator's two-way handling | `packages/tooling/src/validators/ownership-manifest.ts:166-203` |

### 1.2 Core ownership manifest header (verbatim, `99b963a`)

```json
{
  "schemaVersion": "1.1.0",
  "tier": "core",
  "sourceCommit": "51dec93c73214af2d1e424e3454a7122691fea48",
  "entries": 1327
}
```

`sourceCommit` `51dec93` **≠** HEAD `99b963a` — this is the already-tracked
"artifact `sourceCommit` == HEAD: no" ratchet row, pre-existing and not this
task's to move.

Top-level keys are `schemaVersion, tier, sourceCommit, generatedFrom, entries`.
There is **no `tiers` key** — see owner decision **D2**.

### 1.3 Pro ownership manifest header

**Unavailable.** File does not exist. The header facts this section is supposed
to quote verbatim (schema version, `sourceCommit`, entry count, `unclassified`
count) must be filled in by whoever resumes this task after Pro TASK-R1-P4.

### 1.4 Collision list

> **Superseded on 2026-09-18 (§9).** What follows was the state at `99b963a`;
> the list is **not** empty, and the correction is below it.

~~**Empty — but only provisionally, and only by proxy.** With no Pro manifest, no
collision can be computed at `99b963a`. The last real measurement is the one
recorded in `collision-decisions.json`: zero overlapping symbols between Core @
`be76ddb` and Pro @ `origin/main`, on 2026-08-20. Core has moved since. This
must be recomputed against the real Pro manifest before step 2 is called done.~~

**Measured 2026-09-18 at `569d887`: one latent cross-tier collision,
`CalendarView`.**

Pro still emits no ownership manifest, so the collision cannot be computed from
the two ownership manifests. It can be computed from the input Pro TASK-R1-P4
will *derive* that manifest from — Pro's hand-maintained
`packages/pro/manifests/public-api.manifest.json` — and that is the measurement
that matters, because it says what will collide on the day the manifest lands.

| Side | Fact | Evidence |
|---|---|---|
| Core | `CalendarView`, `kind: "type"`, `package: @dzup-ui/core`, subpath `.` | `packages/core/manifests/component-ownership.manifest.json` (`sourceCommit 569d887`, 1,336 entries); the entry's own evidence path is `packages/core/src/composables/useCalendar/useCalendar.ts` |
| Pro | `CalendarView` is listed in `exports.types` (700 type names) | `../dzup-ui-pro/packages/pro/manifests/public-api.manifest.json#exports.types` |
| Pro source | **no such export exists** | `grep -rn "\bCalendarView\b" ../dzup-ui-pro/packages/pro/src` → no match. The only real symbol is `EventCalendarView` (`packages/pro/src/components/planning/DzCalendar.types.ts`), which `\b` excludes |
| Overlap size | **1** of 1,012 distinct Pro public-api symbols against 1,336 Core symbols | recomputed this session, read-only, both manifests |

So the row looks **stale in Pro's hand-maintained manifest** — but Pro
TASK-R1-P4 derives its ownership entries from exactly that manifest, so unless
Pro drops the row first, the collision ships on day one of the Pro tier. That is
a **pre-known output to file against Pro TASK-R1-P4**, not an OSS defect:
`CalendarView` would be withheld from `COMPONENT_OWNERSHIP` (it is a `type`, so
no runtime row is lost — but the collision still fails the gates added in §9).

Not resolved here, and deliberately: `collision-decisions.json` awards a winning
tier, and naming a winner is an owner act. The file's `$comment` now records the
measurement instead of the superseded "zero overlapping symbols" claim.

### 1.5 Resolver and Nuxt module — Pro-absent behaviour

Two independent consumers read the generated table, and **neither needs a code
change** for the Pro tier:

- `packages/core/src/resolver.ts:116-123` — `DzResolver` warns at construction
  time when `includePro` is set but `OWNERSHIP_TIERS` lacks `'pro'`, and the
  warning already names the fix: *"Regenerate with `DZUP_PRO_OWNERSHIP_MANIFEST`
  pointing at a Pro ownership manifest"*. Lookup at line 132 is table-driven, so
  Pro names resolve the moment the table has them.
- `packages/nuxt/src/module.ts` — `PRO_PACKAGE` (line 16), `canResolvePro`
  (line **66** at `99b963a`; **80-102** after the §3 change),
  `proMissingMessage` (110), `proTierMissingMessage` (121), `proAvailability`
  (136), `componentsToRegister` (156), and the `setup` branch (197-205) that
  picks one of the three availabilities. `no-ownership-tier` is the branch that
  fires today. All line numbers other than the noted `99b963a` one are
  post-change.

Nuxt unit specs asserting Pro-absent behaviour, all of which must keep passing:
`packages/nuxt/src/module.spec.ts` (32 tests) and
`packages/nuxt/src/module.pro.spec.ts` (14 tests at `99b963a`) = **46**.

### 1.6 N5-04 F10 (pack freshness)

`docs/program-2026-09/reports/N5-04-peer-hygiene-handoff.md:199-211`:
`test:nuxt-fixtures:pack` runs `yarn pack` with **no build step and no freshness
assertion**. Measured there: tarballs staged 2026-09-03 were built from a
`packages/core/dist` last written 2026-08-25; after a rebuild the same pack grew
557,112 → **583,429 bytes**. F10 was *reported, not fixed* — it is N5-03's file
(handoff line 444). **Step 4, when it runs, must build both repos before
packing**, or the `core-pro` result proves a stale `dist`.

---

## 2. Step 2 — the concrete plan (prepared, not executed)

### F1 — the generator already reads a Pro manifest by path. No extension is required.

This is the principal finding of this packet. The task brief assumes the
generator must be extended; it must not. Writing a new merge path here would be
exactly the "second mechanism" drift the task file's governing rule forbids.

The whole chain exists at `99b963a`:

- `generate-ownership-manifest.ts:510` reads `process.env.DZUP_PRO_OWNERSHIP_MANIFEST`
- `:511` passes it to `buildRuntimeLookup(manifest, proManifest)`
- `buildRuntimeLookup` (`:77-92`) appends the Pro manifest to `inputs` when the
  path exists, calls `buildOwnershipMap`, and returns the rendered source + tiers
- `:541` prints the "no Pro tier — set `DZUP_PRO_OWNERSHIP_MANIFEST`" diagnostic
- `validators/ownership-manifest.ts:177-188` regenerates with **the tier set the
  committed file records**, so a Core-only checkout does not fail a table a
  Pro-equipped machine generated, and vice versa

**Proof it works, run this session** (pure function, nothing written to disk; a
synthetic schema-1.1.0 Pro manifest with 3 entries, one of them a deliberate
`DzButton` collision probe):

```
tiers        : ["core","pro"]
problems     : []
TIERS line   : export const OWNERSHIP_TIERS = ['core', 'pro'] as const
pro rows     :
  DzEventCalendar: { from: '@dzup-ui-pro/pro', kind: 'public-component' },
  DzEventCalendarDay: { from: '@dzup-ui-pro/pro', kind: 'compound-part' },
DzButton     : (ABSENT — collision failed closed)
deterministic: true            # two consecutive builds byte-identical
```

So `OWNERSHIP_TIERS` gains `'pro'`, Pro entries are emitted with
`from: '@dzup-ui-pro/pro'`, compound parts survive, collisions fail closed, and
the generator is deterministic — all already true.

### The residual step 2, in full

1. Obtain the Pro manifest from Pro TASK-R1-P4; record its header verbatim into
   §1.3 above.
2. `DZUP_PRO_OWNERSHIP_MANIFEST=../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json yarn generate:ownership`
3. `git diff --stat packages/core/manifests packages/core/src/generated` — expect
   the Core manifest **unchanged** and only
   `packages/core/src/generated/component-ownership.ts` to move (`OWNERSHIP_TIERS`
   plus the Pro rows).
4. Run it twice, diff for byte-identity.
5. `yarn validate:ownership` **with the same env var exported** — without it the
   validator refuses the now-Pro-claiming committed file by design
   (`validators/ownership-manifest.ts:179-186`). See owner decision **D3**.
6. Recompute the collision list against the real manifest and write it into §1.4.

### Two latent defects that will bite on the day the Pro manifest lands

Both are invisible today because there is no second tier. Both are in the step-2
path, so they are reported here rather than fixed — fixing them blind, with no
Pro manifest to exercise them against, would be unexercised code.

**F2 — `buildRuntimeLookup` discards the collision decisions.**
`generate-ownership-manifest.ts:86` calls `buildOwnershipMap(inputs)` with **no
second argument**, so `decisions` defaults to `{ decisions: {} }`. The
`build-ownership-map.ts` CLI, by contrast, passes `readCollisionDecisions()`
(line 267). Consequence: once an owner records a collision decision naming an
ADR, `yarn generate:ownership:map` honours it and `yarn generate:ownership` —
the command that writes the file the resolver actually reads — ignores it. The
two artifacts disagree, and the resolver follows the wrong one.
*Fix: pass `readCollisionDecisions()` at `generate-ownership-manifest.ts:86`.*

**F3 — an unresolved collision is silent in both the generator and the validator.**
`buildOwnershipMap` puts unresolved collisions in `map.collisions`, **not** in
`problems` (`build-ownership-map.ts:171-180`). `buildRuntimeLookup` returns only
`problems` and drops `map.collisions` on the floor (`:88-91`). So a colliding
component name vanishes from `COMPONENT_OWNERSHIP` while `generate:ownership`
prints nothing about it, and `checkRuntimeLookup` raises no violation — the
committed file and the regenerated file agree, because both dropped it. The
Nuxt module then registers nothing for that name: *a silent `Dz*` import that
resolves to nothing*, which is the precise failure mode this task exists to
eliminate, one level up.
*Fix: surface `map.collisions` through `buildRuntimeLookup`'s return and fail the
generator and `validate:ownership` on any `resolution === 'unresolved'`.*

Note also that `generate-ownership-manifest.ts`'s CLI **never calls
`process.exit`** — it `console.error`s problems and exits 0 regardless.

---

## 3. Implemented files + API effect

### `packages/nuxt/src/module.ts:80-102` — `canResolvePro()` (Pro REL-01 finding R4a)

**Defect, reproduced empirically this session** against a package whose `exports`
map is ESM-only plus the condition-free `./package.json` export:

```
THROW  @dzup-ui-pro/pro              -> ERR_PACKAGE_PATH_NOT_EXPORTED
                                        No "exports" main defined in .../pro/package.json
OK     @dzup-ui-pro/pro/package.json -> .../node_modules/@dzup-ui-pro/pro/package.json
```

`createRequire(...).resolve()` is CJS resolution, so it applies the `require`
condition; an ESM-only `exports` map matches nothing and throws. The old code
read that throw as "not installed" and told a consumer who *had* installed Pro to
install it.

**Change:** resolve `@dzup-ui-pro/pro/package.json` first, then fall back to the
bare name.

```ts
const resolver = createRequire(resolveFrom)
try { resolver.resolve(`${PRO_PACKAGE}/package.json`); return true }
catch { /* fall through */ }
try { resolver.resolve(PRO_PACKAGE); return true }
catch { return false }
```

The fallback is deliberate and is not belt-and-braces: it keeps a Pro published
*before* REL-01 added `./package.json` resolvable. It can only turn a `false`
into a `true` for a package genuinely on disk — a missing package fails both
attempts — so `not-installed` keeps its meaning.

**API effect:** signature and return type unchanged. `proMissingMessage()` is
**byte-identical** — no message, option name or command changed. The only
behavioural difference is that an installed, ESM-only Pro is now reported as
present instead of absent.

### `packages/nuxt/src/module.pro.spec.ts` — +4 specs (46 → 50)

Two new fixtures, both real package shapes:

- `projectWithEsmOnlyPro()` — a real ESM-only `exports` map plus `./package.json`,
  and **no `main`** (with `exports` present, `main` is not consulted; omitting it
  is what makes the fixture reproduce R4a rather than accidentally resolving
  through a legacy path).
- `projectWithLegacyPro()` — an `exports` map with a `require` condition but
  **no `./package.json` export**: the shape of any Pro published before REL-01.

Specs:

- *"finds a Pro whose exports map is ESM-only (REL-01 R4a)"* — the regression pin.
- *"still finds a Pro whose exports map omits ./package.json"* — covers the
  fallback arm. **This is why the fix is two attempts and not one line.** Measured
  against `projectWithLegacyPro()` this session:
  `@dzup-ui-pro/pro/package.json` → `ERR_PACKAGE_PATH_NOT_EXPORTED`, bare name →
  resolves. The single-specifier change the task brief names would have turned
  this working case from `true` into `false` — trading R4a for its mirror image.
- *"still answers false for a bare root next to an ESM-only Pro fixture"* — guards
  the fixtures themselves against leaking into an ancestor directory, which would
  make the tests above pass for the wrong reason.
- *"emits the Pro-absent diagnostic byte for byte"* — asserts the whole sentence,
  not a substring, so the "unchanged diagnostic" requirement is actually pinned.

Both arms of the fix are now covered, and so is the `false` path. The
pre-existing `projectWithPro()` fixture (a `main`, no `exports` map) resolves
through the first arm, since a package with no `exports` map exposes every file
by path.

**No other file was modified by this packet.** My diff is exactly
`packages/nuxt/src/module.ts` and `packages/nuxt/src/module.pro.spec.ts`, plus the
two documents under `docs/program-2026-09-04/` that this task is required to
write. The five pre-existing dirty files noted at hand-off
(`CLAUDE.md`, `apps/landing/vite/serve-storybook.ts`,
`docs/program-2026-09/README.md`, `packages/tooling/README.md`,
`packages/tooling/scripts/adr-registry.json`) were preserved untouched, as were
the ten further files a **second, concurrent session** added to the working tree
*during* this packet (§5). Nothing was reverted, stashed, cleaned or checked out
at any point.

---

## 4. Focused validation output

All exit codes read directly from `$?`, never through a pipe.

| Command | Exit | Result |
|---|---|---|
| `npx vitest run packages/nuxt/src` | **0** | 2 files, **50 passed** (was 46) — `module.pro.spec.ts` 14 → **18**, `module.spec.ts` 32 unchanged |
| `npx eslint packages/nuxt/src/module.ts packages/nuxt/src/module.pro.spec.ts --max-warnings 0` | **0** | clean |
| `npx vue-tsc --noEmit -p packages/core/tsconfig.json` (the `yarn typecheck` lane) | **0** | clean |
| `node node_modules/typescript/bin/tsc --noEmit -p packages/nuxt/tsconfig.json` | **0** | clean — the repo `typecheck` script covers only `packages/core`, so the changed package was typechecked separately |
| `npx tsx packages/tooling/src/validators/ownership-manifest.ts` (`validate:ownership`) | **0** | unchanged; unclassified entries reported under ceiling. **Re-run later in the session: exit 1**, `+useDzSanitizer` — caused by a concurrent session's edits, not by this packet (§5) |

`npx tsc` is shadowed in this environment by a decoy that prints *"This is not
the tsc command you are looking for"* and exits 1 — use
`node node_modules/typescript/bin/tsc`.

---

## 5. Aggregate qualification

**Locally qualified only. Not CI, release, or production evidence.**

> **Read this section with the concurrency caveat below.** A *second agent
> session is editing this working tree while this packet ran.* The aggregate was
> measured twice, and the two runs disagree — because of that session's work,
> not because of anything here.

| Lane | Ran | Exit | Verdict |
|---|---|---|---|
| `yarn test` — **run 1**, 14:58 | yes | **1** | **2 failed / 504 passed** files; **2 failed / 9,194 passed / 3 skipped / 1 todo**. Exactly the documented inherited pair: `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts > every fallback matches the value its token resolves to` and `packages/tooling/src/validators/story-dod-tiers.spec.ts > countOpen > subtracts a waiver`. **No new failure.** |
| `yarn test` — **run 2**, 15:05 | yes | **1** | **3 failed / 503 passed** files; **6 failed / 9,196 passed**. The inherited pair, **plus 4 new failures in `packages/tooling/src/validators/ownership-manifest.spec.ts`** — *not this packet's*, see below. |

### The 4 extra failures in run 2 are a concurrent session's in-flight work

Between the two runs, `git status` gained ten modified files and two untracked
paths that are **not mine and were not present when this packet started**:
`packages/core/src/security/` and
`packages/core/src/composables/provider/useDzSanitizer.ts` (new), plus
`packages/contracts/src/index.ts`, `packages/contracts/src/provider.types.ts`,
`packages/core/src/providers/DzProvider.{vue,types.ts,spec.ts,contract.spec.ts}`,
`packages/core/src/composables/provider/{index.ts,provider.spec.ts}` and the two
SSR provider specs. That is **TASK-R3-O2 (sanitizer provider seam)** running in
parallel in the same tree.

Diagnosed directly, not inferred:

```
$ npx tsx packages/tooling/src/validators/ownership-manifest.ts   # exit 1
✗ [freshness] the committed manifest differs from what the generator produces
  now (+useDzSanitizer -). Run `yarn generate:ownership:core`
```

A new public export changes what the ownership generator derives, so the
committed manifest is stale *with respect to their tree*, and every
`ownership-manifest.spec.ts` case that regenerates from source fails. The same
validator returned **exit 0** earlier in this session, before their edits landed
(§4). **I did not regenerate the manifest**: doing so would fold their in-flight
work into an artifact they own and are mid-way through changing. It is theirs to
regenerate when TASK-R3-O2 lands.

**Attribution:** `packages/nuxt/src/module.ts` and
`packages/nuxt/src/module.pro.spec.ts` are the only files this packet touched;
neither is read by `ownership-manifest.spec.ts`. The packet's own lanes are green
in both runs.

**Consequence for the reader:** run 1 is the honest aggregate for *this packet's*
change. Run 2's extra failures belong to TASK-R3-O2 and should disappear the
moment that packet regenerates the ownership manifest. Anyone re-measuring this
tree should re-check `git status` first.
| `yarn validate:all` | **no** | — | known-red at link 16/37 (capability-matrix, 12 stale cells) at `99b963a`; nothing this packet changed touches any of the 37 links, and `validate:ownership` — the one link that could have moved — was run directly and is green |
| `yarn test:nuxt-fixtures` | **no** | — | requires `test:nuxt-fixtures:pack` staging first (`packages/nuxt/test/fixtures.spec.ts:160-163`), i.e. step 4, which is out of scope. `core-pro` remains **unrun**, not skipped — the correct and visible state |
| `yarn build`, `storybook:*`, `test:e2e*`, perf | **no** | — | out of scope for a two-file change in `packages/nuxt/src` |

Pre-existing red at `99b963a`, **not this packet's and not fixed here**:
`validate:all` link 16/37 (capability-matrix, 12 stale cells) · `yarn test` 2
inherited failures (`landing-token-fallbacks`, `story-dod-tiers countOpen`) ·
`packages/tooling` tsc 7 errors · `eslint e2e/` 9 errors.

**No new failure was introduced.** The aggregate is **not** green and is not
claimed to be.

---

## 6. Ratchet movements (old → new)

| Ratchet | At `99b963a` | After this packet |
|---|---|---|
| Nuxt unit specs | 46 | **50** (+4, all green) |
| `yarn test` failures | 2 | **2** in run 1 (unmoved). Run 2 shows 6, the extra 4 belonging to the concurrent TASK-R3-O2 session — see §5 |
| `yarn test` passing tests | ≈9,191 (derived: run 1's 9,194 less this packet's 3 specs then present) | 9,194 (run 1) / 9,196 (run 2, tree now also carries another session's work) |
| `OWNERSHIP_TIERS` | `['core']` | `['core']` — **unmoved, blocked** |
| Ownership manifest tiers | 1 (`core`; 1,314 core + 13 compat packages) | unmoved |
| Pro entries reachable by a Nuxt consumer with `includePro: true` | 0 of 208 (R4b) | **0 of 208 — unmoved, blocked** |
| `canResolvePro()` against an ESM-only Pro | `false` (wrong, R4a) | **`true`** |
| 1.0 exit criterion **C7** | "Core half done" | **still "Core half done"** — see §7 D1 |
| `validate:all` first failing link (of 37) | 16 | not re-run (no link touched; `validate:ownership` verified green directly) |

**C7 is not yet measurable.** The command that will measure it, once the Pro
manifest exists:

```
DZUP_PRO_OWNERSHIP_MANIFEST=../dzup-ui-pro/packages/pro/manifests/component-ownership.manifest.json \
  yarn generate:ownership && grep -n "OWNERSHIP_TIERS" packages/core/src/generated/component-ownership.ts
```

---

## 7. Owner decisions raised

**D1 — TASK-R3-O1 cannot complete; schedule Pro TASK-R1-P4 first.**
The OSS half of C7 is *already built* (F1) and idle for want of one JSON file.
- *(a)* Schedule Pro TASK-R1-P4 now and resume this task immediately after —
  residual work is one env-var-prefixed regeneration plus steps 4–5.
- *(b)* Leave C7 unmeasured until the next program cycle.
- **Recommendation: (a).** The cost is a single generator run in the Pro repo,
  and it unblocks a 🔴 criterion whose consumer-visible symptom is a silent
  `Dz*` import that resolves to nothing.

**D2 — the `<done_check>` for this task is mis-specified in three places; correct it.**
Two of its five checks can never pass, however correct the code is:

(i) `node -e "…console.log(Object.keys(m.tiers||{}))"` inspects the **Core**
manifest for a `tiers` key. No ownership manifest has one — a manifest is
single-tier by construction (`tier: "core"`), and only the *merged map* has
tiers, which is not a committed artifact.

(ii) Check 4 is
`grep -n "package.json" packages/nuxt/src/*.ts packages/core/src/resolver/*.ts | grep -i canResolvePro`.
It requires **one line** to contain both `package.json` and `canResolvePro`, which
no reasonable implementation produces — the resolve call and the function name
are necessarily on different lines. It also globs
`packages/core/src/resolver/*.ts`, a directory that does not exist (the file is
`packages/core/src/resolver.ts`). Verified this session against the *fixed* code:
the check returns nothing, exit 1.

(iii) The gap note calls `@dzup-ui/core` / `@dzup-ui/compat` "two tiers"; they
are two *packages* in one tier (§1.1).

- *(a)* Rewrite both checks against the real signals —
  `grep -n "OWNERSHIP_TIERS" packages/core/src/generated/component-ownership.ts`
  (already check 3) and
  `grep -n 'PRO_PACKAGE}/package.json' packages/nuxt/src/module.ts` — and drop
  the `m.tiers` probe.
- *(b)* Commit the merged map as an artifact so `tiers` becomes inspectable.
- **Recommendation: (a).** (b) adds a committed artifact with no consumer; the
  generated `.ts` file *is* the artifact the resolver reads. Left as-is, the next
  agent will read two impossible checks as "work not done" and redo §3.

**D3 — `validate:ownership` will require `DZUP_PRO_OWNERSHIP_MANIFEST` on every
machine once the table claims a Pro tier.**
By design (`validators/ownership-manifest.ts:179-186`), a committed file claiming
`'pro'` fails validation wherever the Pro manifest is absent — which is CI, and
every OSS-only contributor's checkout. This is a deliberate "missing input, not
drift" refusal, but it converts a green lane into a red one for people who
cannot fix it.
- *(a)* Vendor the Pro manifest into the OSS repo as a checked-in input (names
  and package strings only — no Pro source; the existing
  `__fixtures__/pro.manifest.json` proves the shape is inert).
- *(b)* Publish the Pro manifest as an artifact CI fetches.
- *(c)* Accept the red and gate `validate:ownership` behind manifest presence.
- **Recommendation: (a).** It is the only option that keeps the lane green for a
  contributor with no Pro access, and the manifest is data the resolver already
  ships inside `component-ownership.ts` anyway.

**D4 — fix F2 and F3 as part of step 2, not after it.**
The collision machinery is currently decorative on the path that matters: the
runtime-lookup generator ignores `collision-decisions.json` (F2) and reports
unresolved collisions nowhere (F3). The first real Core/Pro collision would
silently delete a component name from the resolver's table with every gate green.
- *(a)* Fold both fixes into step 2, exercised against the real Pro manifest.
- *(b)* File as separate follow-ups.
- **Recommendation: (a).** They are one-line and ~10-line changes respectively,
  and step 2 is the only context in which they can be tested honestly.

**D5 — two packets are editing one working tree, and it has already made
aggregate evidence unattributable.**
TASK-R3-O1 and TASK-R3-O2 ran concurrently in the same checkout today. The
consequence is measured, not hypothetical: two `yarn test` runs seven minutes
apart disagreed by four failures, and diagnosing which packet owned them cost a
`git status` diff and a validator re-run (§5). The program's evidence rules bind
every metric to a commit — but a dirty tree shared by two agents is not
described by a commit at all, and `sourceCommit`-stamped artifacts cannot
arbitrate it.
- *(a)* Give each concurrent packet its own git worktree; aggregate lanes then
  measure one packet's change.
- *(b)* Serialise 🔴 packets that touch generated artifacts, and let only
  independent ones overlap.
- *(c)* Keep sharing the tree and require every handoff to record `git status`
  before and after.
- **Recommendation: (a)**, with **(c)** as the cheap immediate mitigation. Any
  packet that regenerates a manifest — ownership, quality, capability,
  component-meta — will otherwise absorb a neighbour's uncommitted work into a
  committed artifact, which is precisely the silent-drift failure the
  `generated_authority` rules exist to prevent.

---

## 8. Ranked next packet

1. **[owner] Run Pro TASK-R1-P4** — emits the manifest. Everything else here is
   blocked behind it. (D1)
2. **Resume TASK-R3-O1 step 2** with F2 + F3 folded in (D4): regenerate with
   `DZUP_PRO_OWNERSHIP_MANIFEST`, diff twice for determinism, recompute the
   collision list, run `validate:ownership` with the env var exported.
3. **[owner] Decide D3** before step 2 lands, because the moment
   `OWNERSHIP_TIERS` gains `'pro'`, every Pro-less checkout goes red.
4. **TASK-R3-O1 steps 4–5** — build **both** repos, then pack (N5-04 F10: never
   pack an unbuilt `dist`), run the `core-pro` fixture, capture the registration
   list and SSR output. Expect Pro peer-range friction (D6 / Pro TASK-R1-P3); if
   it appears, one `--legacy-peer-deps` run with the caveat recorded, and widen
   nothing in Pro.
5. **Correct the `<done_check>`** in `contract-conformance-tasks.md` per D2 so the
   next agent is not chasing a check that cannot pass.
6. **TASK-R1-O2** — its pack-freshness gate is the permanent fix for N5-04 F10,
   which step 4 currently has to work around by hand.

---

## 9. Session 2026-09-18 — F2 and F3 fixed, the collision list corrected

**Commit observed: `569d887`** (`main`, 0 ahead / 0 behind `origin/main`).
**The working tree is dirty with several other packets' uncommitted work**
(1,100+ modified files at session start, including `apps/docs/`, the generated
ownership artifacts and `packages/core/manifests/`). Nothing of it was touched,
reverted, stashed or regenerated. No commit, push or publish.

**The block is unchanged.** `../dzup-ui-pro/packages/pro/manifests/` still holds
only `html-sinks`, `public-api` and `risk-tiers` — no
`component-ownership.manifest.json`, and Pro has no ownership generator at all.
Steps 2, 4 and 5 remain unexecuted; `OWNERSHIP_TIERS` is still `['core']`.

What *was* done is the work that does not need the Pro manifest: **the two
latent defects §2 reported (D4) are fixed and pinned**, because they sit in the
code that runs the moment the manifest lands, and D4's own recommendation —
"fold them into step 2" — assumed step 2 was imminent. It is now three sessions
old. Fixing them blind was the objection; that objection is answered by the
fixture-driven specs below, which exercise both paths against a real Pro-shaped
manifest without a Pro checkout.

### 9.1 Files changed

| File | Change |
|---|---|
| `packages/tooling/src/ownership/build-ownership-map.ts:225-234` | New exported `unresolvedCollisions(collisions)`. One predicate for the `'unresolved'` literal, now shared by three call sites; `:284` (the CLI) uses it in place of its inline filter. No behaviour change. |
| `packages/tooling/src/ownership/generate-ownership-manifest.ts:75-124` | **F2 + F3.** `buildRuntimeLookup` takes a third parameter, `decisions: CollisionDecisions = readCollisionDecisions()`, and passes it to `buildOwnershipMap` (F2); it returns `collisions: MapCollision[]` alongside `source`/`tiers`/`problems` (F3). The default reads the same `collision-decisions.json` the sibling CLI reads; the parameter exists so a spec can drive it without editing the real file. |
| `packages/tooling/src/ownership/generate-ownership-manifest.ts:578-603` | **F3, CLI.** Prints `✗ collision: <symbol> is exported by <tiers>. It is absent from the runtime lookup and resolves to null until collision-decisions.json records a tier and the ADR that decided it.` for each unresolved collision, then `process.exit(unresolved.length + problems.length > 0 ? 1 : 0)` — the same exit condition as `build-ownership-map.ts:295`. The command previously exited 0 unconditionally. Drift notes stay non-fatal (47 are open by design). |
| `packages/tooling/src/validators/ownership-manifest.ts:158-232` | **F3, gate.** `checkRuntimeLookup` gains two overridable parameters (`lookupPath`, `proManifestPath`) in the style `validateOwnershipManifest(manifestPath)` already documents, and raises one `runtime-lookup` violation per unresolved collision. Freshness alone cannot see one: the colliding name is omitted from *both* the committed and the regenerated table, so they agree. |
| `packages/tooling/src/ownership/emit-runtime-lookup.spec.ts` | **New, 21 tests.** `buildRuntimeLookup` and `emit-runtime-lookup.ts` had zero coverage. |
| `packages/tooling/src/validators/ownership-manifest.spec.ts:330-384` | **+4 tests** (36 → 40): the collision gate, the fresh-Pro control, drift-reported-separately, and the missing-input branch. |
| `packages/tooling/src/ownership/collision-decisions.json` | `$comment` rewritten: the "zero overlapping symbols, verified 2026-08-20" claim is superseded by the 2026-09-18 measurement in §1.4. **No decision entry added** — awarding a tier is an owner act. |
| `packages/tooling/src/ownership/__fixtures__/collision.pro.manifest.json` | Same stale claim in its `$comment`, same correction. |
| `packages/tooling/src/ownership/build-ownership-map.spec.ts:169-176` | The spec title `'is checked in and empty while no real Core/Pro name collides'` asserted the same stale fact. Retitled and annotated; the assertion (`decisions === {}`) is unchanged and still correct. |
| `docs/program-2026-09-04/reports/TASK-R3-O1-handoff.md` | §1.4 superseded with the measured collision; this section. |

No `packages/core` source, no generated artifact, and nothing in
`ui/dzup-ui-pro` was modified. The three generated ownership artifacts were last
written **2026-09-17 13:51** by another session and still carry that mtime — the
generator was only ever run with `--check`.

### 9.2 What each defect would have caused in production

**F3 — a component name deleted from the resolver with every gate green.**
`buildOwnershipMap` puts unresolved collisions in `map.collisions`, never in
`problems`, and excludes them from `symbols`. `buildRuntimeLookup` returned only
`{ source, tiers, problems }`, so the row vanished from `COMPONENT_OWNERSHIP`
and *nothing* said why: the generator printed nothing and exited 0, and
`checkRuntimeLookup` compared a committed file that had dropped the name against
a regenerated file that had dropped the name — identical, therefore fresh. The
Nuxt module registers only what the table contains, so a consumer writing
`<DzX />` gets an unresolved component: a silent `Dz*` import that resolves to
nothing, which is the precise failure this whole task exists to eliminate, one
level up. It was reachable the first time any Core and Pro name overlapped —
and §1.4 now shows one already does.

**F2 — two artifacts disagreeing about the same decision.**
`generate:ownership:map` passed `readCollisionDecisions()`;
`generate:ownership`, the command that writes the file the resolver actually
reads, did not. An owner recording `{"DzX": {"tier": "core", "adr": "…"}}` would
have seen the map honour it and the runtime table ignore it — the symbol
withheld from the resolver by a decision that says it belongs to Core. The
reviewable-reasoning contract the file exists for would have been reviewable and
inert.

**Demonstrated end to end, this session** (`--check`, nothing written; a
synthetic schema-1.1.0 Pro manifest carrying the *real* latent `CalendarView`
overlap from §1.4):

```
$ DZUP_PRO_OWNERSHIP_MANIFEST=<clean synthetic pro> tsx …/generate-ownership-manifest.ts --check
✓ runtime lookup → packages/core/src/generated/component-ownership.ts (tiers: core, pro)     exit 0

$ DZUP_PRO_OWNERSHIP_MANIFEST=<synthetic pro with CalendarView> tsx …/generate-ownership-manifest.ts --check
✓ runtime lookup → packages/core/src/generated/component-ownership.ts (tiers: core, pro)
✗ collision: CalendarView is exported by core and pro. It is absent from the runtime
  lookup and resolves to null until collision-decisions.json records a tier and the
  ADR that decided it.                                                                       exit 1
```

Before this session the second run also printed `✓ … (tiers: core, pro)` and
exited **0**.

### 9.3 Seed-and-prove

Both fixes were proven to bite by seeding the pre-fix behaviour back in and
re-running, then restoring byte-identically:

| Seed | Result |
|---|---|
| `buildRuntimeLookup` reverted to `buildOwnershipMap(inputs)` + `collisions: []` | `emit-runtime-lookup.spec.ts` **exit 1 — 5 failed / 16 passed** (the one F3 assertion and all four F2 assertions). The "withholds the colliding name" spec passes in both, correctly: that half of the defect is the *intended* fail-closed behaviour, and its silence was the bug. |
| validator's collision loop neutralised | `ownership-manifest.spec.ts` **exit 1 — 1 failed / 39 passed** ("fails on an unresolved collision, which freshness alone cannot see"). |
| both restored | 21/21 and 40/40, exit 0. |

### 9.4 Gate results — every exit code read directly from `$?`, never through a pipe

| Command | Baseline before | After | Verdict |
|---|---|---|---|
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/ownership packages/nuxt/src` | **0** — 8 files / 178 tests | **0** — **9 files / 199 tests** | +1 file, **+21 tests** |
| `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/ownership-manifest.spec.ts` | 0 — 36 tests | **0** — **40 tests** | +4. *Not covered by the command above*, which globs `src/ownership` only |
| `node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/ownership-manifest.ts` | **0** | **0** | 1,336 entries fresh, runtime lookup in sync, 29/29 unclassified, 41/41 without anatomy |
| `node node_modules/tsx/dist/cli.mjs …/generate-ownership-manifest.ts --check` | 0 | **0** | `tiers: core`; 47 drift notes (pre-existing, non-fatal by design) |
| `yarn typecheck` | 0 | **0** | clean |
| `yarn lint` | 0 | **0** | clean, `--max-warnings 0` over `packages/ apps/` |
| `node node_modules/typescript/bin/tsc --noEmit -p packages/tooling/tsconfig.json` | — | **2** — **12** errors | **pre-existing, and none in a file this session touched** (`anatomy-source{,.spec}`, `perf-bench.spec`, `playground.spec`, `accept-visual-baseline`, `story-dod-triage`, `at-matrix.spec`, `component-meta.spec`, `story-dod-tiers.spec`, `vendor-sublayers.spec`). Note the program's standing figure for this lane is **7**; it is 12 in this tree, which is dirty with three other packets |

`yarn validate:all`, `yarn test`, `build`, `storybook:*` and the e2e lanes were
**not** run: nothing here touches a link of the aggregate other than
`validate:ownership`, which was run directly and is green. The aggregate is not
claimed green — its documented red at `99b963a` (link 16, capability-matrix)
stands.

### 9.5 Ratchet movements (old → new)

| Ratchet | Before | After |
|---|---|---|
| Specs covering `buildRuntimeLookup` / `emit-runtime-lookup.ts` | **0** | **21** |
| `packages/tooling/src/ownership` + `packages/nuxt/src` suite | 8 files / 178 tests | **9 files / 199 tests** |
| `validators/ownership-manifest.spec.ts` | 36 tests | **40 tests** |
| Exit code of `generate:ownership` on an unresolved collision | **0** (silent) | **1**, with the symbol and both tiers named |
| `validate:ownership` violations on an unresolved collision | **0** | **1 per collision** |
| Collision decisions honoured by `generate:ownership` | **none** — argument never passed | the checked-in file, same as `generate:ownership:map` |
| Known cross-tier collisions | "zero, verified 2026-08-20" | **1 — `CalendarView`, measured 2026-09-18** (§1.4) |
| `OWNERSHIP_TIERS` | `['core']` | `['core']` — **unmoved, still blocked** |
| 1.0 exit criterion **C7** | "Core half done" | **"Core half done"** — unmoved |

### 9.6 Owner decisions

**D4 is closed** — taken as option (a) minus the "only inside step 2" clause:
both fixes landed, exercised against fixture Pro manifests rather than against a
Pro manifest that does not exist. D1, D2, D3 and D5 remain open as written.

**D6 (new) — recording the first collision decision will turn every Pro-less
checkout red, and the culprit is not the collision.**
Now that `generate:ownership` reads `collision-decisions.json`, a decision
recorded there is evaluated on *every* run — including the Core-only runs that
are all this repository can do today and all CI can do. With one tier there are
no collisions by construction, so `buildOwnershipMap:186-193` reports the
decision as one that "resolves no collision", `problems` gains an entry, and
both `generate:ownership` and `validate:ownership` fail. The dead-decision
report is right in general (it stops the file accreting entries that outlive
their conflict) and wrong for this case.

- *(a)* Scope the dead-decision report to inputs that could collide — i.e. skip
  it when fewer than two tiers were merged. Small, and it keeps the report's
  purpose intact for the multi-tier case.
- *(b)* Vendor the Pro manifest into OSS (**D3 option (a)**), so every checkout
  merges two tiers and the question disappears.
- *(c)* Accept it: record no decision until the Pro manifest is vendored.
- **Recommendation: (a) now, (b) as the real fix.** (a) is ~3 lines in
  `build-ownership-map.ts` and is not this task's to take — it changes the
  semantics of a report an owner reads. Until one of them is chosen, **do not
  record a decision for `CalendarView`**, which is the other reason §1.4 leaves
  it open.

**D7 (new) — `CalendarView` in Pro's `public-api.manifest.json` looks like a
stale row; file it against Pro TASK-R1-P4 before that task derives from it.**
Core owns `CalendarView` as a `type`
(`packages/core/src/composables/useCalendar/useCalendar.ts`). Pro lists it in
`exports.types` but no Pro source exports it — the real symbol is
`EventCalendarView`. Pro TASK-R1-P4 derives its ownership entries from that
manifest, so the stale row becomes a real cross-tier collision the day the
manifest lands, and the gates added in §9.1 will (correctly) fail on it.

- *(a)* Pro drops the row from `public-api.manifest.json` — the collision never
  exists. **Recommended**, if the row is indeed stale.
- *(b)* Pro genuinely re-exports Core's `CalendarView`; then it is a legitimate
  re-export and an owner records a decision naming Core as the winner (subject
  to D6).
- The determination is Pro's to make; this repository has no authority over
  Pro's manifest and did not touch it.

### 9.7 Ranked next packet

1. **[owner] Run Pro TASK-R1-P4** (D1, open across four sessions now) — and
   resolve **D7** while doing it, since that task is the one reading the row.
2. **Resume step 2** — regenerate with `DZUP_PRO_OWNERSHIP_MANIFEST`, diff twice
   for determinism, run `validate:ownership` with the env var exported. F2/F3
   are no longer part of it.
3. **[owner] Decide D3, then D6** — in that order: D3 option (a) makes D6 moot.
4. **Steps 4–5** unchanged (build both repos before packing — N5-04 F10).
5. **Correct the `<done_check>`** per D2.
