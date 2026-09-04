# TASK-N5-01 — 0.x semver statement, changelog system of record, changeset reconciliation

> Handoff for [`release-and-toolchain-tasks.md` → TASK-N5-01](../release-and-toolchain-tasks.md).
> Conventions: [`README.md §3 <repo_conventions>`](../README.md#3-how-these-tasks-are-written).
>
> **Run date:** 2026-09-03 · **Repo:** `ui/dzup-ui` · **Branch:** `main`
> **HEAD:** `6f1f6539…` (`6f1f653 Merge remote-tracking branch 'origin/main'`)
> **Worktree at run start:** **clean — 0 entries**, 0 ahead / 0 behind `origin/main`.
> **Toolchain:** Node `v24.14.1`, Yarn `4.16.0`, `@changesets/cli` `2.30.0`, `@changesets/config` `3.1.3`.
>
> **Evidence class: `locally qualified, against a committed tree`.** Not CI, not
> release, not production.
>
> **Nothing is committed, pushed, dispatched to CI, or published. Zero version
> bumps. Zero publishes. No `changeset version`, no `changeset publish`, no
> registry contact of any kind.**
>
> Companion memos, both `[!owner]`:
> [`changelog-system-of-record-2026-09.md`](./changelog-system-of-record-2026-09.md) ·
> [`1-0-exit-criteria-2026-09.md`](./1-0-exit-criteria-2026-09.md)

---

## 1. Headline

**`changeset status` was already green.** The failure the task brief sends this
packet to fix was fixed by TASK-SK-1 in August. What SK-1 did *not* fix — and
said so in its own write-up — is the reason nobody saw the failure for weeks:
**no gate in this repository ran `changeset status`.** That gate now exists,
runs the real command end-to-end, and is proven to catch the original failure.

Three latent traps of the same shape were found and one was live: a **private
app was standing in the release plan**, a package created by a sibling packet
was **never added to the changesets config**, and two **public, publishable
packages are permanently unreleasable** — with a measured cost, a changeset
whose body describes a change to a package its frontmatter is forbidden to name.

And the packet found what it did not go looking for: **`yarn validate:all` is red
on `main`**, at link 15 of 37, on a gate that byte-compares a git-derived
provenance field — a defect this repository has already recorded once, in a
different artifact, and already knows how to avoid.

---

## 2. The stop condition fired, and the conflict is real

> `<stop_conditions>` — *"…when the breaking-surface definition conflicts with an
> ADR — surface the conflict."*

**It conflicts with ADR-19, with `TOKENS.md`, and with a versioning policy that
already existed and nobody cited.** All three are recorded in
`packages/contracts/VERSIONING.md` §7 as `[!owner]` reconciliations. **No ADR
status was flipped, no ADR text was edited, and the older documents were not
deleted.**

| Source | Says | Under the mandated 0.x mapping |
|---|---|---|
| `docs/adr/ADR-19-public-styling-contract.md` §6 | *"Dual-emit lasts one minor release series. Removal is a **major** change"* | Before 1.0 there is no next major. Read literally, ADR-19 forbids removing a part until the library is stable. |
| `packages/tokens/TOKENS.md` (`DEPRECATED_TOKENS`) | the two sidebar aliases are *"removed in the next major"* | Same shape. |
| `apps/storybook/stories/Versioning.mdx` | bump table: *"**major** — a breaking change"*, *"**minor** — additive, your code still runs"*; breaking list headed *"Breaking (major only)"* | The correct table for 1.x, and the **exact inverse** of the mandated 0.x rule, for the version range every package is actually in. |

The third one matters most: **a versioning policy already existed** and the task
brief did not know about it. It is a good document — its breaking-surface list
and its deprecation policy are largely absorbed into the new statement, with
attribution. It is simply written for a version the library has not reached.

`TOKENS.md` §1, by contrast, *already defers to this packet* — *"the 0.x release
policy for `@dzup-ui/*` is an open packet (`TASK-N5-01`)… treat this section as a
statement of contract, and the release policy as the thing that will make it a
promise."* That deferral can now be retired.

---

## 3. Findings

### N5-01-F1 — `changeset status` is green, and was green at run start. The defect is the missing gate.

Measured first thing, on the clean tree, before any edit:

```
$ yarn changeset status
🦋  info Packages to be bumped at patch:  - @dzup-ui/nuxt  - @dzup-ui/landing
🦋  info Packages to be bumped at minor:  - @dzup-ui/core  - @dzup-ui/contracts  - @dzup-ui/testing
🦋  info NO packages to be bumped at major
EXIT=0
```

The recorded failure is SK-1's, and SK-1's own write-up
(`docs/program-2026-08/EXECUTION-STATUS-REC.md` §"Fourth defect") states both the
cause and the durable half of the problem:

> `.changeset/the-catalog-says-what-it-owes.md` … names `@dzup-ui/tooling`
> alongside `@dzup-ui/core` and `@dzup-ui/contracts`. `@dzup-ui/tooling` is on
> the changesets `ignore` list, and changesets refuses a changeset that mixes
> ignored and non-ignored packages … So `changeset status` — and `changeset
> version` — **failed outright on `main`**. **No local gate runs it**
> (`validate:changelog` is a different script), which is why nobody saw it.

SK-1 removed the offending line. It did not add the gate. **That is what this
packet adds**, and §5 proves it catches the original failure.

Mechanism, confirmed in the installed dependency rather than assumed —
`@changesets/assemble-release-plan/dist/…esm.js:565`:

```js
if (skippedPackages.length > 0 && notSkippedPackages.length > 0) {
  throw new Error(`Found mixed changeset ${changeset.id}\n` + …)
}
```

and `@changesets/should-skip-package`: a package is skipped when it is in
`ignore` **or** when it is private and `privatePackages.version` is not true.

### N5-01-F2 — `npx yarn` reproduces the symptom for an entirely unrelated reason

```
$ npx yarn changeset status
error This project's package.json defines "packageManager": "yarn@4.16.0".
However the current global version of Yarn is 1.22.22.
EXIT=1
```

`npx yarn` resolves to a globally installed Yarn 1.22.22, which refuses the
Corepack pin. Plain `yarn` in this environment is 4.16.0 via the Corepack shim
and works. **Recorded because it is a perfect false positive**: an agent
following the memory note "use `npx yarn`" would report `changeset status` as
failing and misdiagnose it as the SK-1 defect. In `ui/dzup-ui`, use plain
`yarn`.

### N5-01-F3 — a private app was standing in the release plan (fixed)

`@dzup-ui/landing` is `private: true`. npm can never see it. It was nonetheless
in the standing release plan for a patch bump, because it depends on
`@dzup-ui/core` and `updateInternalDependencies: "patch"` pulls dependents in —
and `.changeset/config.json` had no `privatePackages` key, so the default
(`version: true`) applied and private packages were versionable.

A `changeset version` run would have bumped a private app's version and written
it a `CHANGELOG.md` for a release that cannot happen.

**Fix:** `"privatePackages": { "version": false, "tag": false }`.

### N5-01-F4 — `@dzup-ui/docs` was never added to the changesets config

`apps/docs` was created by TASK-N2-D1. It is private and was in neither
`ignore` nor any other classification. Reproduced on the clean tree:

```
PROBE B: a changeset naming "@dzup-ui/docs" + "@dzup-ui/core"
  → Mixed changesets that contain both ignored and not ignored packages are not allowed
  → EXIT 1
```

Identical failure to SK-1's, one packet later, from a package nobody had thought
about. **This is why the guard's R3 requires *every* workspace package to be
classified**: the failure mode is not "someone edited the ignore list wrongly",
it is "someone added a package and the release config never heard about it".

### N5-01-F5 — two public, publishable packages are permanently unreleasable `[!owner]`

| Package | `private` | `publishConfig.access` | in changesets `ignore` | in `ci.yml` pack smoke test | releasable |
|---|---|---|---|---|---|
| `@dzup-ui/compat` | no | public | **yes** | yes | **never** |
| `@dzup-ui/codemods` | no | public | **yes** | yes | **never** |

Both are `0.1.0-alpha.0`, both are listed in the root README's generated package
table as installable, and no changeset can ever bump or publish either. Being on
`ignore` is not the same as being private — it is a *decision*, and it was
recorded nowhere. It is now recorded, with a reason each, in
`packages/tooling/scripts/release-policy.json`.

### N5-01-F6 — the cost of F5, measured

`.changeset/pro-package-is-named-dzup-ui-pro-pro.md` states in its body:

> - `@dzup-ui/codemods`' `rename-imports` now rewrites `dzup-ui/pro` and
>   `@dzup-ui/pro-components` to `@dzup-ui-pro/pro`, so a migrated codebase no
>   longer lands on the dead name.

Its frontmatter names `@dzup-ui/core` and `@dzup-ui/nuxt`. It **cannot** name
`@dzup-ui/codemods` — reproduced, exit 1, the SK-1 error verbatim (§5, probe A).
So a behaviour change to a public migration tool ships with **no changelog
entry**, and the author had no way to give it one.

This is the only measured consequence of F5 in the current changeset set, and it
is a good one: the `ignore` list is not merely withholding releases, it is
suppressing the record of changes.

### N5-01-F7 — two gates enforce mutually exclusive CHANGELOG formats, and the first release trips it

Proven by running both gates' own regexes over real files:

| Heading | `validate:changelog` (needs an ISO date) | `validate:mcp` (`latestChangelogVersion`, anchored) |
|---|---|---|
| `## 0.2.0` — what `changeset version` writes | **FAIL** | PASS → `0.2.0` |
| `## 0.2.0 (2026-08-10)` — what 7 packages carry | PASS | **FAIL** → `null` |

No changelog can satisfy both. `packages/mcp/CHANGELOG.md` is in the first shape
and passes CI only because `validate:changelog` does not list the package;
`apps/landing/CHANGELOG.md` is the same.

**Consequence: the first `changeset version` turns `validate:all` red** for
every package it bumps, because it rewrites each `CHANGELOG.md` into the shape
`validate:changelog` rejects. Full treatment, options and costs: the
system-of-record memo §3 and §6 (decision **N5-01-D1**).

**What this packet did:** recorded it as a **ratchet** (`R9`, ceiling `1`) rather
than weakening `validate:changelog`. Choosing the grammar is an owner decision;
letting the defect spread quietly in the meantime is not acceptable either.

### N5-01-F8 — `validate:changelog`'s package list is hand-typed and already wrong

`PUBLISHABLE_PACKAGES` in `packages/tooling/scripts/validate-changelog.ts` is a
hand-typed array of 7. The derived published set is 6, and the two sets are not
nested: the array **omits `@dzup-ui/mcp`** (public, published, governed as a
public package per the conventions) and **includes `compat` and `codemods`**,
which F5 shows can never be released.

This is the same class of defect that `generate-readme-facts.ts` exists to
prevent: *"the hand-typed table … five of its six rows named a version the
package had already moved past"*. Same repository, one directory apart. Guard
clause `R10` requires every published package to be covered or exempt-with-a-
reason; `@dzup-ui/mcp` is exempt today because adding it is blocked on F7.

### N5-01-F9 — a versioning policy already existed

`apps/storybook/stories/Versioning.mdx` (157 lines, `TASK-FREE-14`). Not cited by
the task brief, not linked from the README, not linked from `CONTRIBUTING.md`
(whose entire versioning content is *"This project uses Changesets for
versioning"*), and stating the **1.x** mapping. See §2. Not deleted; absorbed and
reconciled as `VERSIONING.md` §7.1.

### N5-01-F10 — the audit: 11 of 16 changesets are over-declared, 0 are under-declared

Full table in §6. Under the strict 0.x mapping, most of the pending changesets
are `minor` for work that is additive — the level a 1.x convention would give
them. **The error is uniformly in the safe direction.** No changeset ships a
breaking change in a position a consumer auto-upgrades through.

### N5-01-F11 — the case that made "widening an outbound type is breaking" a policy clause

`selection-controls-can-be-driven-by-a-remote-option-source.md` declares
`@dzup-ui/core: minor` and describes itself as additive. It is not, quite. In
`e986952`, `DzFileUpload`'s public `file-item` slot changed:

```diff
-  'file-item'?: (props: { file: File, remove: () => void }) => unknown
+  'file-item'?: (props: {
+    file: File | DzFileRef
+    row: { name: string, size: number, status: DzFileRef['status'], error?: string }
+    remove: () => void
+  }) => unknown
```

Widening a type the library hands *out* breaks consumer source that already
type-checked: `#file-item="{ file }"` followed by `file.arrayBuffer()` no longer
compiles, under the default `model-mode="file"` where the runtime value is still
a `File`. **Its `minor` is correct — for a reason its own prose does not state.**
`VERSIONING.md` §2.1 now names this direction explicitly, because it is the one
that gets missed.

### N5-01-F12 — `yarn validate:all` is red on `main`, and one cause is isolated to the byte `[inherited]`

Run end-to-end, not sampled (per S1-F10). **Exit 1 at link 15 of 37.**

Neither failing gate is touched by this packet (`git status` confirms
`e2e/at-matrix/` and `packages/core/docs/capability-matrix.json` are unmodified).

**Link 15 — `validate:at-matrix`.** The *only* lines differing between the
committed `e2e/at-matrix/index.json` and a fresh build are `componentCommit`
values: committed entries carry `80ce3012…` / `e986952e…` / `4c9fb7a1…`, a fresh
build returns `e0d17078…` for all of them. `e0d1707` is the commit that landed
N1+N2 and touched those component sources, while the index it carried had been
generated before it. `componentCommit` is `lastCommitFor(row.source)` — **git
provenance inside a byte comparison** — so the artifact cannot be green in a
committed state.

**The repository has already recorded this defect**, in a different artifact:
`docs/program-2026-08/EXECUTION-STATUS-REC.md` defect #2, *"A test that could
never be green in a committed state — byte-comparing a manifest whose
`sourceCommit` is stamped from `HEAD`"*. `validate:component-meta` learned it and
says so in its own script comment (*"`sourceCommit` excluded — it is provenance,
and gating on it would fail on every unrelated commit"*). `validate:at-matrix`
did not.

**Link 16 — `validate:capability-matrix`**: *"packages/core/docs/capability-matrix.json
is stale"*. Same class — the file carries `sourceCommit: 51dec93c…`, from before
`e0d1707`. **I did not isolate its cause to that field** and do not claim it is
identical to link 15.

**Not fixed here.** Both artifacts are owned by other lanes (N1-O4, OSS-P5-06),
regenerating them would go stale again on the next commit, and the real fix for
link 15 is a change to a *gate*, not to evidence. Filed as owner decision D6 and
as criterion **C7** in the 1.0 memo.

### N5-01-F13 — `packages/tooling` is not typechecked by `typecheck:all` `[inherited]`

`yarn typecheck:all` chains tokens, contracts, testing, core, compat, codemods,
mcp (×2) and the landing app. It does **not** include `packages/tooling`, which
has its own `tsc --noEmit` script. Running it reports **7 pre-existing errors
across 5 files** (`perf-bench.spec.ts` ×2, `accept-visual-baseline.ts` ×2,
`story-dod-triage.ts`, `at-matrix.spec.ts`, `story-dod-tiers.spec.ts`).

**None are in files this packet added or edited**, which is the only claim I can
make about my own code's type health, since no chained gate covers that
directory. Recorded, not fixed — it is a validator-lane finding, not a release
one.

---

## 4. What shipped

### 4.1 The policy statement

**`packages/contracts/VERSIONING.md`** (new). The versioning statement for every
`@dzup-ui/*` package, placed in contracts because it is the package everything
else depends on inward. Added to `packages/contracts/package.json` `files` so it
ships in the tarball and is citable by a consumer, not only by this repository.

It states the 0.x mapping, refuses `major` before 1.0 with a gate behind the
refusal, and defines the breaking surface across five artifacts that already
exist rather than inventing vocabulary:

| Surface | Recorded in | Named authority |
|---|---|---|
| Component API — props, emits, slots, expose, exported types | `public-api.manifest.json`, `component-ownership.manifest.json` (1,327 symbols) | ADR-01 |
| Parts, states, recipe attributes, `ui`, cascade layers | component `*.anatomy.ts`, `ANATOMY_PART_VOCABULARY` | ADR-19 |
| `--dz-*` names **and resolved values** | `packages/tokens/TOKENS.md` | TOKENS-01 |
| Package names, `exports` subpaths, peers, `engines.node` | each `package.json` | ADR-18 |
| Injection keys, provider option shapes | `provider.types.ts` | ADR-20 |

Two clauses are load-bearing for downstream packets:

- **§2.1 — widening an outbound type is breaking.** From F11.
- **§3 — the accessibility carve-out.** Correcting a *rendered* a11y attribute is
  a `patch`; removing a *declared* prop is a `minor`, with type removal +
  `warnDeprecated` + codemod + changeset. This is the clause TASK-N5-02 is gated
  on. See §9.

### 4.2 The generated-facts wiring

Per the brief, the README mention is **generated, not typed**.
`packages/tooling/scripts/generate-readme-facts.ts` gains a `versioning` region
rendered from the published packages' own versions:

> All 8 published `@dzup-ui/*` packages are `0.x`. Under the [0.x versioning
> policy](packages/contracts/VERSIONING.md): a **minor** bump is a **breaking
> change**, a **patch** is additive or a fix, and `major` is not used before
> 1.0 — a major bump *is* the 1.0 release. …

`renderRegions()` now takes the document it renders for, so the link is correct
relative to each file (`packages/contracts/VERSIONING.md` from the root README,
`VERSIONING.md` from the contracts README). And the sentence **stops saying
"all"** the moment a package crosses 1.0 — spec-covered, because a generated
claim that outlives the fact it describes is the failure this whole mechanism
exists to prevent.

### 4.3 The guard

**`yarn validate:release-policy`** — `packages/tooling/scripts/validate-release-policy.ts`,
data in `release-policy.json`, 14 unit tests in `validate-release-policy.spec.ts`.
Wired into `validate:all`.

| Clause | Checks | Written against |
|---|---|---|
| **R1** | spawns the real `changeset status`; fails on non-zero | **F1 — the gate that never existed** |
| R2 | `privatePackages.version === false` | F3 |
| R3 | every workspace package classified published/withheld/private, agreeing with its `private` flag and the `ignore` array | F4 |
| R4 | no changeset mixes skipped + published — named by file and package | F1, F6 |
| R5 | no `major` while the target is 0.x | `VERSIONING.md` §1 |
| R6 | every published package is 0.x, else the policy's scope has expired | `VERSIONING.md` §1 |
| R7 | every changeset names a real package at a legal level | hygiene |
| R8 | no `.changeset/pre.json` residue | the brief's third hypothesis |
| R9 | ratchet on published packages whose CHANGELOG heading `validate:changelog` rejects | **F7** |
| R10 | every published package covered by `validate:changelog` or exempt-with-reason | **F8** |

R1 spawns the CLI rather than importing it: `packages/tooling` carries no
changesets dependency, and the authority on whether a plan assembles is the tool
that assembles it.

---

## 5. The guard, proven against the failure it exists for

Four negative tests. Each probe was created, run, and **removed**; `ls .changeset`
confirms no residue, and `.changeset/config.json` was restored byte-for-byte.

| Probe | Injected | `changeset status` | `validate:release-policy` |
|---|---|---|---|
| A | `core: patch` + `codemods: patch` (**the exact SK-1 shape**) | exit 1 | **exit 1** — `✗ [R1]` quoting the mixed-changeset error, **and** `✗ [R4]` naming the file and both packages |
| B | `core: patch` + `docs: patch` (F4) | exit 1 | caught by the same two clauses |
| C | a changeset naming a non-existent package | exit 1 | `✗ [R7]` |
| D | `core: major` on `0.2.0` | exit **0** — changesets is happy to ship 1.0.0 | **exit 1** — `✗ [R5]` |
| E | `privatePackages` removed from config | exit 0 | **exit 1** — `✗ [R2]` |
| F | `.changeset/pre.json` planted | exit 0 | **exit 1** — `✗ [R8]` |

**Probes D, E and F are the interesting ones**: `changeset status` is perfectly
happy in all three. A `major` changeset on a `0.x` package would have shipped
`1.0.0` — declaring the library stable — as a side effect of a routine change,
and nothing in the repository would have objected.

Green state, after restoring:

```
✓ release-policy: `changeset status` assembles; 6 published, 2 withheld, 5 private
  of 13 workspace packages; 16 pending changeset(s), 0 major, 0 mixed;
  changelog-format collisions at the ceiling of 1
```

---

## 6. The changeset audit

**16 changesets, not 17.** `ls .changeset/*.md` minus `README.md`. The figure 17
appears in `02-capability-matrix-oss.md` §"Release engineering", in the N5 task
file and in the N5 execution status; it is off by one. Every N5 document now
uses 16.

They map to **four commits**: `7d351cd` (1), `4c9fb7a` (8), `8d80bc3` (1),
`e986952` (5).

| # | Changeset | Commit | Declared | Correct under the 0.x policy | Action |
|---|---|---|---|---|---|
| 1 | `a-field-no-longer-describes-its-control-with-ids-that-do-not-exist` | `e986952` | core: minor | core: **patch** | over-declared → **D3** |
| 2 | `a-form-renderer-can-bind-v-model-to-every-selection-control` | `e986952` | core: minor | core: **patch** | over-declared → **D3** |
| 3 | `an-application-can-configure-more-than-the-theme` | `4c9fb7a` | contracts, core: minor | both **patch** — its own text: *"mechanical and non-breaking"* | over-declared → **D3** |
| 4 | `a-wizard-can-take-you-to-the-error-instead-of-just-naming-it` | `e986952` | core: minor | core: **patch** | over-declared → **D3** |
| 5 | `command-palette-label-is-the-search-key` | `7d351cd` | core: patch | core: patch | ✅ **correct** |
| 6 | `components-declare-their-styling-surface` | `4c9fb7a` | contracts, testing, core: minor | all **patch** — its own text: *"Nothing is removed, and every existing override keeps working"* | over-declared → **D3** |
| 7 | `every-string-the-library-shows-you-can-be-translated` | `4c9fb7a` | contracts, core: minor | both **patch** | over-declared → **D3** |
| 8 | `nuxt-module-registers-from-generated-ownership` | `4c9fb7a` | nuxt: patch, core: minor | nuxt: patch ✅, core: **patch** | core over-declared → **D3** |
| 9 | `one-provider-configures-the-whole-library` | `4c9fb7a` | contracts, core: minor | both **patch** — `DzProvider` is a new component | over-declared → **D3** |
| 10 | `overlays-go-where-your-application-says` | `4c9fb7a` | core: patch | core: patch — *"Nothing changes without a provider"* | ✅ **correct** |
| 11 | `pro-package-is-named-dzup-ui-pro-pro` | `4c9fb7a` | core, nuxt: patch | core, nuxt: patch — *"the previous behaviour could not work for anybody"* | ✅ level correct; **package coverage wrong** — omits `@dzup-ui/codemods` (**F6**) → **D2** |
| 12 | `resolver-resolves-by-exact-name` | `4c9fb7a` | core: minor | core: **minor** — *"Unknown names no longer resolve to Core"* removes a documented fallback | ✅ **correct, genuinely breaking** |
| 13 | `selection-controls-can-be-driven-by-a-remote-option-source` | `e986952` | contracts, core: minor | core: **minor** ✅ (**F11** — slot prop widened); contracts: **patch** | core correct; contracts over-declared → **D3** |
| 14 | `text-inputs-say-in-the-dom-what-they-say-in-their-types` | `e986952` | core: minor | core: **patch** — new `data-readonly`, honoured ARIA props, all additive | over-declared → **D3** |
| 15 | `the-catalog-knows-which-way-it-reads` | `4c9fb7a` | contracts, testing: minor, core: patch | all **patch** — physical→logical utilities change class names, which ADR-19 excludes from the contract | contracts, testing over-declared → **D3** |
| 16 | `the-catalog-says-what-it-owes` | `8d80bc3` | contracts, core: minor | both **minor** — *"`RiskTier` was inverted and is now corrected"*: an exported scale whose meaning flipped, plus `DzFileUpload` now rejecting drops it previously accepted | ✅ **correct, genuinely breaking** |

**Outcome: 5 correctly leveled · 10 over-declared · 1 correct-where-it-matters
with a secondary over-declaration · 0 under-declared.**

**Zero changeset files were edited, and that is a deliberate action, not an
omission.** The reasoning:

- **Every error is in the safe direction.** An over-declared `minor` withholds a
  release from `^0.2.0` consumers until they widen the range. An under-declared
  `patch` pushes a break into every `yarn install`. There are none of the second
  kind.
- **Re-leveling would change the next release's version numbers.** Dropping the
  11 over-declarations to `patch` takes `@dzup-ui/core` from `0.3.0` to `0.2.1`
  and `@dzup-ui/contracts` from `0.2.0` to `0.1.1`. That is a release-behaviour
  change, not a content edit, and the brief authorises the latter only.
- **Item 11's real defect cannot be fixed by editing the changeset.** Adding
  `@dzup-ui/codemods` to its frontmatter reproduces the SK-1 failure exactly
  (probe A). It is blocked on **D2**.

Recorded as **D3** for the owner, with the exact list.

---

## 7. Before / after

| Reading | Before | After | Note |
|---|---|---|---|
| `changeset status` exit | 0 | 0 | already green (F1) |
| Release plan — patch | `@dzup-ui/nuxt`, **`@dzup-ui/landing`** | `@dzup-ui/nuxt` | private app removed (F3) |
| Release plan — minor | core, contracts, testing | core, contracts, testing | unchanged |
| Release plan — major | none | none | now also gated (R5) |
| Gates that run `changeset status` | **0** | **1** | the headline |
| `validate:all` links | 36 | **37** | `validate:release-policy` added |
| `generate:readme-facts` documents | 4 | **5** | `packages/contracts/README.md` added |
| `generate:readme-facts` regions | 3 | **5** | `versioning` in two documents |
| Workspace packages with a recorded release classification | 5 (the `ignore` array, no reasons) | **13 of 13**, each with a reason where it is withheld | R3 |
| `changelogFormatCollisionCeiling` | — | **1** (new ratchet, initialised) | F7 |
| Published packages uncovered by `validate:changelog` | 1, unrecorded | 1, **recorded with a reason** | F8 |
| Package versions changed | — | **none** | zero bumps |

**No existing ratchet was moved in either direction.** `maxWithoutAnatomy` (113),
`maxUnclassified` (29), `maxUndocumented` (14) and every `*-ceilings.json` are
untouched.

---

## 8. Validation ladder

Narrowest first, then widened. **Exact commands, exact exit codes.**

| # | Command | Exit | Note |
|---|---|---|---|
| 1 | `yarn changeset status` | **0** | before and after the config change |
| 2 | `npx tsx packages/tooling/scripts/validate-release-policy.ts` | **0** | + 6 negative probes, §5 |
| 3 | `npx vitest run packages/tooling/scripts/validate-release-policy.spec.ts` | **0** | 14 passed |
| 4 | `npx vitest run …/validate-release-policy.spec.ts …/generate-readme-facts.spec.ts` | **0** | **32 passed**, 0 failed |
| 5 | `npx tsx packages/tooling/scripts/generate-readme-facts.ts` | **0** | 5 regions across 2 documents |
| 6 | `yarn typecheck` | **0** | |
| 7 | `yarn lint` (`--max-warnings 0`) | **0** | 18 errors in this packet's own new files, all fixed |
| 8 | `cd packages/tooling && npx tsc --noEmit` | **2** | **7 pre-existing errors, none in this packet's files** — F13 |
| 9 | **`yarn validate:all`** | **1** | **failed at link 15 of 37** — F12 |

### The `validate:all` run, unpacked

Run **in full, end-to-end**, per S1-F10. It is not green, and the honest split:

| Links | Gates | Result |
|---|---|---|
| 1–14 | typecheck, lint, boundaries, interaction-contract, contract-parity, hardcoded-strings, tv-slots, anatomy-parts, rtl, form-readiness, quality-tiers, story-status, story-dod, story-dod-tiers | **pass** |
| **15** | `validate:at-matrix` | **FAIL — inherited** (F12) |
| **16** | `validate:capability-matrix` | **FAIL — inherited** (F12) |
| 17–37 | visual-baselines, tokens, tokens:dtcg, exports, ownership, mcp, component-meta, llms, docs-pages, playground-parity, package-names, doc-snippets, engines, adr-references, readme-facts, externals, dts, changelog, **release-policy**, peers, licenses | **pass** (run individually after the chain stopped) |

**35 of 37 green. 2 red, both inherited, neither touched by this packet.**

> **A methodological note, because S1-F10 nearly happened again.** My first
> `validate:all` invocation ended `; echo "VALIDATE_ALL_EXIT=$?"`, and the
> background runner reported the *wrapper's* exit code — **0** — while
> `validate:all` itself had exited **1**. The failure was only caught by reading
> the last six lines of the output. This is the same shape as S1-F10 (a green
> aggregate read through something that swallowed the real result), in a
> different disguise. The numbers above come from reading the gate output
> directly and from re-running every link past the failure individually.

### Separated per the conventions

- **Tooling failures:** 2 — `validate:at-matrix` (link 15), `validate:capability-matrix`
  (link 16). Both are generated-evidence **freshness** failures on a committed
  tree. Both inherited from `e0d1707`. One root-caused to the byte (F12).
- **Component failures:** **0.** No component gate failed. `validate:contract-parity`,
  `validate:anatomy-parts`, `validate:rtl`, `validate:form-readiness`,
  `validate:quality-tiers`, `validate:story-dod*` all pass.
- **Caused by this packet:** **0.**

---

## 9. Ranked next step for TASK-N5-02 — how the six ARIA-prop removals must ship

The policy makes N5-02 legal. Precisely what it authorises:

1. **A removal is a `minor`, never a `patch`** — `VERSIONING.md` §3, second half.
   The prop did nothing at runtime, but it *type-checked in consumer source*, and
   deleting it stops that source compiling. That is a break under §2.1 regardless
   of the prop's runtime behaviour. **A `patch` here would push the break into
   every `^0.x` consumer's next install.**
2. **Implementing a prop honestly is a `patch`** — §3, first half. If the Reka
   primitive can honour it, forwarding it changes a rendered ARIA attribute, and
   correcting rendered accessibility attributes is explicitly a patch. So
   *implement-vs-remove decides the level*, per prop, and the per-prop evidence
   table N5-02 is asked to build is therefore also the level table.
3. **`DzOrderList.dragHandleLabel` rendering its label is a `patch`.** It becomes
   honest without any type changing.
4. **Every removal ships four things** (§3): the type removed from `.types.ts`; a
   dev-mode warning via **`warnDeprecated`**; a codemod entry; a changeset at
   `minor` naming the removal in its first line.
5. **`warnDeprecated` is in `@dzup-ui/compat`, not `@dzup-ui/codemods`.** The
   N5-02 brief says *"the codemods package's deprecation utilities"* — there are
   none there. The utility is
   `packages/compat/src/utils/deprecation.ts` → `warnDeprecated(oldName, newName,
   packageName = '@dzup-ui/core')` and `resetDeprecationWarnings()`, re-exported
   from `packages/compat/src/index.ts`. **Core must not import it** (the boundary
   rule: compat is never imported by stable core), so N5-02 needs either a
   Core-local warning helper or an owner decision on the boundary. **Flag this
   before writing code.**
6. **The codemod entry lands in a package that cannot be released** (F5). N5-02's
   codemod work is real and useful; its changelog entry is currently
   unrepresentable. Either take **D2** first, or accept the same silent gap F6
   documents and record it.
7. **The deprecation window** (§4): a deprecated API keeps working for at least
   one full `0.x` minor series. Announcing and removing in the same release is
   not deprecation — so if any of the six is to be *deprecated* rather than
   *removed outright*, that is two releases, and there has not yet been one.

---

## 10. `[!owner]` decisions

| # | Decision | Where the evidence is | Priority |
|---|---|---|---|
| **D1** | **The CHANGELOG heading grammar.** `validate:changelog` and `validate:mcp` enforce mutually exclusive formats; the first `changeset version` turns `validate:all` red. Three costed options; recommendation **D1-a** (relax the ISO-date clause — the dates were hand-typed and unreproducible). | F7; system-of-record memo §3, §6 | 🔴 |
| **D2** | **Release or formally withhold `@dzup-ui/compat` and `@dzup-ui/codemods`.** Both are public, publishable, in CI's pack smoke test, and permanently unreleasable. The cost is measured: a changeset that cannot name the package it changed. | F5, F6 | 🟠 |
| **D3** | **Re-level the 11 over-declared changesets, or keep them conservative.** Re-leveling takes `@dzup-ui/core` from `0.3.0` to `0.2.1` — a release-behaviour change this packet refused to make unilaterally. Exact list in §6. | F10, §6 | 🟠 |
| **D4** | **The three reconciliations in `VERSIONING.md` §7**: ADR-19 §6 ("removal is a major"), `TOKENS.md` ("removed in the next major"), and `Versioning.mdx`'s 1.x bump table. All three are wrong for a 0.x library; none was edited. | §2; `VERSIONING.md` §7 | 🟠 |
| **D5** | **The refined 1.0 exit criteria** — 15 criteria, 4 of them new, with today's measurement against each. Which are exit criteria and which are post-1.0 is the decision. | `1-0-exit-criteria-2026-09.md` | 🟠 |
| **D6** | **Fix `validate:at-matrix` to stop byte-comparing `componentCommit`** (the way `validate:component-meta` already excludes `sourceCommit`), and diagnose `validate:capability-matrix`. `validate:all` is red on `main` and regenerating the artifacts fixes it only until the next commit. | F12; 1.0 memo §2, C7 | 🔴 |
| **D7** | **Was `@dzup-ui/mcp` meant to be under `validate:changelog`?** It is a public package governed as one everywhere else. Blocked on D1. | F8 | 🟢 |

---

## 11. Files

**New**

| Path | What |
|---|---|
| `packages/contracts/VERSIONING.md` | The versioning policy — 0.x mapping, five-surface breaking definition, a11y carve-out, deprecation, three `[!owner]` reconciliations |
| `packages/tooling/scripts/validate-release-policy.ts` | The guard — R1–R10 |
| `packages/tooling/scripts/release-policy.json` | Its data — classification, `allowMajor`, ratchets, exemptions, each with a reason |
| `packages/tooling/scripts/validate-release-policy.spec.ts` | 14 unit tests |
| `docs/program-2026-09/reports/N5-01-release-policy-handoff.md` | This document |
| `docs/program-2026-09/reports/changelog-system-of-record-2026-09.md` | `[!owner]` memo |
| `docs/program-2026-09/reports/1-0-exit-criteria-2026-09.md` | `[!owner]` memo |

**Modified**

| Path | Change |
|---|---|
| `.changeset/config.json` | `+4 lines` — `privatePackages: { version: false, tag: false }` |
| `package.json` | `validate:release-policy` script + its `//` doc comment; added to `validate:all` (36 → 37 links) |
| `packages/tooling/scripts/generate-readme-facts.ts` | `versioning` region; `renderVersioning()`; `renderRegions(document)`; `packages/contracts/README.md` added to `FACT_DOCUMENTS` |
| `packages/tooling/scripts/generate-readme-facts.spec.ts` | 3 tests for the new region |
| `README.md` | `## Versioning` section + generated region |
| `packages/contracts/README.md` | `## Versioning` section + generated region |
| `packages/contracts/package.json` | `VERSIONING.md` added to `files` so the policy ships |

**Deliberately not modified:** any `.changeset/*.md` (§6) · any ADR · `TOKENS.md` ·
`Versioning.mdx` · `validate-changelog.ts` · `e2e/at-matrix/` ·
`packages/core/docs/capability-matrix.json` · any package version · any existing
ratchet.

---

## 12. What this work refuses to imply

- **That `changeset status` was broken and I fixed it.** It was green when I
  arrived (F1). What was broken is that nothing checked, and that had been true
  since before SK-1. Claiming the headline fix would be claiming SK-1's work.
- **That the release path now works.** It assembles a plan. It has never
  versioned or published anything: the hand-typed dates in seven CHANGELOGs are
  the evidence, and F7 says the first real run turns `validate:all` red. **A
  green `changeset status` means the plan parses, not that a release would
  succeed.**
- **That the 16 changesets are ready to ship.** Eleven are mis-levelled under the
  policy this packet just wrote, in the safe direction, and correcting them
  changes the next release's version numbers — an owner decision (D3).
- **That the R9 ratchet makes anything safe.** It records a known, unresolved
  defect at its current size so it cannot spread quietly. The JSON comment says
  so in as many words. It is not a fix and it is not evidence that a release
  would pass.
- **That `validate:all` certifies this packet.** It exits 1 on `main` for
  inherited reasons. 35 of 37 links are green and the two red ones are untouched
  by this work — that is the strongest true statement available, and it is weaker
  than "validate:all passes".
- **That the policy is accepted.** It is authored, gated and citable. ADR-18/19/20
  are still `Proposed`, `Versioning.mdx` still states the opposite mapping, and
  nothing here carries a maintainer's signature. **A policy a gate enforces is
  still not a policy an owner has agreed to.**
- **That any number here is CI evidence.** Every measurement is a local run
  against a committed tree. `validate-min-runtime` — the job that would run
  `validate:all` at the declared Node floor — has still never been dispatched.
