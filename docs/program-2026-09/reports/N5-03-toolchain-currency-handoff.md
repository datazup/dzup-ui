# TASK-N5-03 — the gate that could never be green, a Vue 3.6 lane, and a published package Node could not load

> **Packet:** TASK-N5-03, dzup-ui System Program 2026-09, lane N5 (release &
> toolchain). Executed 2026-09-03 on `main` @ `6f1f653`, 0 ahead / 0 behind
> `origin/main`, on a working tree already carrying the uncommitted output of
> TASK-N5-01 and TASK-N5-02. **Nothing was committed, pushed, dispatched,
> versioned or published.** No pre-existing change was reverted, stashed,
> cleaned or restored.
>
> **Runtime:** Node v24.14.1, Yarn 4.16.0, engines floor `^20.19.0 || >=22.13.0`.
> Every result below was observed on this machine and is **locally qualified**.
> None of it is CI evidence, release evidence, or production evidence.
>
> Companion: `N5-03-toolchain-migration-memo.md` (Vitest, Vite 8/tsdown, and the
> three cheap items nobody was blocked on).

---

## 1. Headline

Five things happened. The third was not on the packet's list.

1. **Item 0 — `validate:at-matrix` can be green again.** It compared
   `componentCommit` — a git hash — inside a byte-for-byte artifact diff, which
   made the artifact stale in the very commit that wrote it. Excluded, the way
   `validate:component-meta` already excludes `sourceCommit`. Proven with a
   negative probe. **`validate:all` moved from exit 1 at link 15 to exit 1 at
   link 16.**
2. **Item 0, second half — `validate:capability-matrix` had *two* causes, not
   one.** The same provenance defect (33 stamps) **plus** genuine content
   staleness (8 cells). The first is fixed. The second is real: the committed
   matrix currently **overstates**, calling 7 visual-baseline cells `covered`
   and one perf cell `pass` where a fresh build calls them `stale`. Left red on
   purpose and filed `[!owner]`.
3. **`@dzup-ui/contracts` could not be loaded by Node's ESM resolver at all**,
   and had not been able to for as long as the package has existed. Five
   extensionless re-exports in the published `dist/index.js`. **The Nuxt
   consumer fixtures were red on Nuxt 3 *and* Nuxt 4 for this one reason**, and
   the reason nothing else saw it is that every other gate resolves modules the
   way a bundler does. Fixed; the fixtures now pass on both majors.
4. **The Vue 3.6-RC lane exists, ran here, and its state is recorded
   truthfully.** `9,181` tests pass under `vue@3.6.0-rc.6`; the only two that
   fail are the two that already fail on the default Vue. **Zero library
   defects, zero RC behaviour changes.** The lane pins Vue, installs, runs, then
   restores `package.json` and `yarn.lock` and **verifies the restore**.
5. **The Vapor statement is backed by a run, not by architecture.** A real
   Vapor app with `vaporInteropPlugin` renders `DzButton` and its `data-tone`
   reaches the DOM, under `vue@3.6.0-rc.6` — and the README paragraph that says
   so is **generated from the spec's existence**, so deleting the spec turns the
   claim into "UNBACKED" and fails `validate:readme-facts` rather than leaving
   the README asserting it.

That is five, not four, because item 3 was not on the packet's list — it was
found by running the fixture lane the packet asked for.

---

## 2. Item 0 — the gate that could never be green

### 2.1 What the defect was

`e2e/at-matrix/index.json` is compared byte-for-byte against a fresh build.
Every entry in it carries:

```ts
componentCommit: lastCommitFor(row.source)     // generate-at-matrix.ts:168
```

That is **git provenance recorded inside an artifact that is then byte-compared
against a fresh build**, and the combination has no green state in a committed
tree. The mechanism is an off-by-one nothing in the working tree can fix: a
commit that touches `DzButton.vue` *becomes* the answer to
`lastCommitFor('…/DzButton.vue')` the instant it lands, but the artifact
regenerated *before* that commit recorded the previous hash. The file is stale
at birth, in the same commit that created it. Regenerating fixes it only until
the next source-touching commit, at which point CI is red again on that commit.

TASK-N5-01 root-caused this to the byte. The measured diff on this tree:

```
44 differing lines in e2e/at-matrix/index.json
 = 22 changed `componentCommit` values
 + 0 differing content lines
```

**`validate:component-meta` already excludes `sourceCommit` for exactly this
reason**, and says so in `stripProvenance`'s doc comment. `componentCommit` is
the same field one level down; it was missed because it repeats per row rather
than appearing once at the top.

### 2.2 What changed

One new helper, used by two validators:

- `packages/tooling/src/quality/git.ts` — `stripComponentCommits(json)`. It
  lives in the module that *produces* the field (`lastCommitFor`), with a doc
  comment stating the off-by-one and the precedent.
- `packages/tooling/src/validators/at-matrix.ts` — the index comparison strips
  it. Clause header updated.
- `packages/tooling/src/validators/capability-matrix.ts` — composed with the
  `sourceCommit` strip that file already had. Clause header updated.
- `packages/tooling/src/quality/git.spec.ts` — 5 new cases, including the
  guardrail one: *a real content difference must still compare unequal.*

**No content clause was weakened.** Nothing in either validator reads the
*committed* `componentCommit`: both staleness clauses run against the **freshly
built** index, where the value is recomputed from git on every run. The field
exists in the file so a human reading the artifact can see which revision a row
was measured against — which is the definition of provenance.

### 2.3 The negative probe

Four probes, two per gate. Every mutation was restored from a byte copy and the
restore verified with `git status --short` on the path (empty output).

| # | Probe | Expected | Observed |
|---|---|---|---|
| **A2** | Mutate **one** `componentCommit` in `e2e/at-matrix/index.json` to `deadbeef…` | exit 0 — provenance is excluded | **exit 0** |
| **A3** | Mutate **one content field** (`"result": "unrun"` → `"pass"`) | exit 1 — content still bites | **exit 1**, `✗ [index] … disagrees with the markdown files` |
| **B1** | Write `capability-matrix.json` = **fresh content** with the **old** `sourceCommit` and all **144** old `componentCommit` stamps re-implanted | exit 0 — proves the residual redness is content, not provenance | **exit 0**, `✓ capability-matrix: fresh` |
| **B2** | From that green state, flip **one** cell `"state": "stale"` → `"pass"` | exit 1 | **exit 1**, `✗ [freshness] … is stale` |

B1 is the load-bearing one: **144 deliberately wrong provenance stamps and the
gate is green; one wrong cell state and it is red.** That is the exclusion doing
exactly what it was meant to do and nothing more.

Both files restored:

```
git status --short -- e2e/at-matrix/index.json              # (empty)
git status --short -- packages/core/docs/capability-matrix.json   # (empty)
```

### 2.4 `validate:all` — before → after

Read from the command's own exit code, not through a pipe. **The background
task wrapper reported "exit code 0" while the command itself exited 1** — the
exact trap this lane's standing rule names, caught because the exit code was
echoed inside the command rather than read from the wrapper.

| | Links | Exit | First failing link |
|---|---|---|---|
| **Before** (inherited) | 37 | 1 | **15** — `validate:at-matrix` |
| **After Item 0** | 37 | 1 | **16** — `validate:capability-matrix` |

Link 15 is green. Links 1–15 and 17–37 pass. **Link 16 remains red, and it is
red for a real reason** — see 2.5.

### 2.5 Link 16 is red on content, and the content is an overstatement

After the provenance exclusion, the residual diff in
`packages/core/docs/capability-matrix.json` is **34 lines, 0 of them
provenance**:

| Component | Cell | Committed says | A fresh build says |
|---|---|---|---|
| `DzButtonGroup` | `visual` | `covered` | **`stale`** |
| `DzCopyButton` | `visual` | `covered` | **`stale`** |
| `DzFab` | `visual` | `covered` | **`stale`** |
| `DzIconButton` | `visual` | `covered` | **`stale`** |
| `DzSpeedDial` | `visual` | `covered` | **`stale`** |
| `DzSplitButton` | `visual` | `covered` | **`stale`** |
| `DzToggleButton` | `visual` | `covered` | **`stale`** |
| `DzOrderList` | `perf-baseline` | `pass` | **`stale`** |
| — | tier C totals | `pass: 158, stale: 10` | `pass: 157, stale: 11` |

The generator's own words for the seven: *"2/2 baseline(s) were captured before
the component's last change (e0d17078) — a pass about different code."*

This is **not** the provenance defect. It is the freshness gate working: the
committed artifact was generated before `e0d1707` landed and has been
overstating its evidence ever since. The packet's guardrail explicitly forbids
regenerating `capability-matrix.json`, so it was not regenerated, and link 16
stays red. See `N5-03-D1`.

---

## 3. Findings

### N5-03-F1 — `componentCommit` is provenance, and two gates were diffing it

Covered in §2. Recorded as a finding rather than only as a fix because the
*class* is what matters: **any git hash written into an artifact that is later
byte-compared makes that comparison unfailable-into-green.** This repository now
has three instances of the pattern (`sourceCommit` in `component-meta.json`,
`sourceCommit` in the ownership manifest and `capability-matrix.json`, and
`componentCommit` in two places) and has had to discover it three times. The
fourth generator that stamps a commit will do it again unless the rule is
written down where a generator author reads it: **stamp provenance, then exclude
it from every byte comparison, in the same change.**

### N5-03-F2 — `validate:capability-matrix` had two causes and only one was known `[!owner]`

TASK-N5-01 root-caused link 15 and explicitly did not isolate link 16. It is 66
lines of provenance (fixed here) plus 34 lines of real staleness (not fixed
here). Both had to be separated before either could be acted on, and separating
them is what B1 above did.

### N5-03-F3 🔴 — `@dzup-ui/contracts` cannot be loaded by Node ESM, and never could

**The most consequential finding in this packet, and it was not on the list.**

`packages/contracts/dist/index.js` — the file `exports["."].import` points at,
the file every consumer's Node loads — contained five **extensionless** relative
re-exports:

```js
export { ANATOMY_PART_VOCABULARY } from './anatomy.types'
export { …10 helpers… } from './form-value'
export { …10 injection keys… } from './provider.types'
export { …19 quality-tier symbols… } from './quality-tiers'
export { assertNever } from './utility.types'
```

`anatomy.types.js` is on disk beside it. Node's ESM resolver does not care:
relative specifiers in ESM must carry their extension. The consumer failure,
reproduced on this machine:

```
Cannot find module '…/node_modules/@dzup-ui/contracts/dist/anatomy.types'
  imported from '…/node_modules/@dzup-ui/contracts/dist/index.js'
[nitro]   ├─ / (60ms)
  │ └── [500] Server Error
ERROR  Exiting due to prerender errors.
```

**Attribution — this is pre-existing and version-independent.** Measured, not
assumed:

| Leg | Before the fix | After the fix |
|---|---|---|
| `nuxt@3.19.0` | **red**, `ERR_MODULE_NOT_FOUND` on `dist/anatomy.types` | green (§5.2) |
| `nuxt@4.4.5` | **red**, byte-identical error | **6/6 pass** |

The Nuxt 3 leg was run specifically to answer "did the `@nuxt/kit` retarget
cause this?" — it did not. The lane was already red on this tree.

**Why 37 validate links, ~2,000 unit tests and `typecheck:all` all missed it.**
Every one of them resolves modules the way a **bundler** does. `tsconfig.base.json`
sets `moduleResolution: "bundler"`, which tells TypeScript to assume a bundler
will fill in the extension; Vite and Vitest then do. `validate:exports`,
`validate:dts` and `validate:externals` read the built files but do not
`import()` them under Node. **The Nuxt consumer fixtures are the only lane in
this repository that puts the published tarball through Node's own resolver** —
which is the entire argument for their existence, made concrete.

`packages/contracts` was also the only `tsc`-built package doing this.
`@dzup-ui/testing`, `@dzup-ui/mcp` and `@dzup-ui/codemods` all already write
`./anatomy.js`-style specifiers and emit correctly. The fix adopts their
convention: **27 specifiers across 7 files**, no type, export or runtime value
changed.

Verified directly, which is the check nothing in the repository had:

```
node --input-type=module -e "const m = await import('./packages/contracts/dist/index.js'); …"
imported OK, exports: 39
ANATOMY_PART_VOCABULARY present: true
```

### N5-03-F4 — Nuxt 4 moved `srcDir` to `app/`, and a fixture that ignores it fails silently as the module's fault

Once F3 was out of the way, the Nuxt 4 fixtures failed a second, different way,
and the failure was a liar. Nuxt 4 changed the default `srcDir` from `.` to
`app/`. A root `app.vue` under Nuxt 4 is not an error — it is **ignored**. The
app then has no root component, `nuxt generate` prerenders no route, and
`.output/public/` contains only the SPA fallback `200.html` / `404.html` with an
empty `<div id="__nuxt">`. The suite reads the missing `index.html` as `''` and
reports:

```
AssertionError: expected '' to contain 'data-testid="core-button"'
```

which is indistinguishable from a broken auto-import. `pack-fixtures.mjs` now
stages `app.vue`, `assets/`, `pages/` and `components/` under `app/` when the
target major is >= 4, and leaves them at the root otherwise. `nuxt.config.ts`
and `server/` stay at the root in both.

### N5-03-F5 — Nuxt 4 stopped inlining critical CSS, and the `css-order` assertion was reading the delivery mechanism

The last Nuxt 4 failure. `styleBlocks()` read `<style>` blocks, with a comment
saying *"Nuxt inlines critical CSS rather than emitting `<link>` elements, so
the ordering assertion has to read the blocks, not the links."* True of Nuxt 3.
**Nuxt 4 emits one `<link rel="stylesheet">` to a bundled `_nuxt/entry.<hash>.css`
and no `<style>` block at all**, so the search returned `-1` and the suite
reported *"no token stylesheet reached the page"* about a page whose stylesheet
was present and correctly ordered:

```
--dz-primary: at byte 16690
dz-prose     at byte 40363     → tokens first: True
```

The property under test survives both majors; only the reading did not.
`styleSources(html, dir)` now returns inline blocks **and** the linked sheets
resolved from `.output/public`, in document order, and the assertion searches
the concatenation — which is what the browser's cascade actually sees.

### N5-03-F6 — the packet's own brief named a Vitest major that is already over

`vitest@latest` is **5.0.0**; the 4.x line ended at `4.1.11`. A migration memo
scheduled to Vitest 4 would schedule a move to a line receiving no further
features. The memo is written against 5.0.0 and carries the fact as `N5-03-M1`,
with a quarterly re-read of its version table as the mitigation. Recorded here
because it is evidence for the cadence, not a criticism of the brief: the gap
between "we last checked" and "now" was large enough to matter.

### N5-03-F7 — `nuxt` >= 4.4.6 drops Node 20, and this repository declares Node 20

Measured across the 4.x line rather than assumed from release notes:

| `nuxt` | `engines.node` |
|---|---|
| 4.0.0 – **4.4.5** | `^20.19.0 \|\| >=22.12.0` |
| **4.4.6** – 4.5.2 | `^22.12.0 \|\| ^24.11.0 \|\| >=26.0.0` |

`@nuxt/kit` itself declares `>=18.12.0` at every 4.x, so **the module** is
Node-20-safe on any of them; it is the *consumer app* that is not. This
repository declares `^20.19.0 || >=22.13.0`, `.nvmrc` says `20.19.0`, and every
CI job requests `20.19.0`. **A fixture on `nuxt@^4` — which resolves to 4.5.2 —
cannot install in CI.** That is why the fixture matrix pins `4.4.5` exactly, and
why raising past it is an ADR-18 amendment rather than a dependency bump
(`validate:engines` requires `.nvmrc`, two `package.json` files and ~14 CI
`node-version:` values to agree).

### N5-03-F8 — the Vapor statement had to be built so that it *cannot* be quoted from a run that never happened

`vaporInteropPlugin` does not exist before Vue 3.6, so on the repository's
default Vue there is nothing to test. Three ways to write that spec, two of them
dishonest:

- **Assert the architecture.** dzup-ui components are ordinary vDOM SFCs, so of
  course they work under interop. This assertion is free, plausible, and would
  survive right up until somebody tried it.
- **`describe.skip`.** A skipped test and a passing test look the same in a
  summary line, which is the failure mode the AT matrix and the Nuxt fixtures
  both already refuse.
- **Report `unverified` by name** — what was built. On Vue 3.5 the spec prints
  the installed version and *"VERIFICATION NOT PERFORMED … do not quote the
  Vapor compatibility statement as tested from this run"*, with the command that
  would verify it.

The Vue 3.6 export surface was established by fetching the RC tarball and
reading it, not from memory: `vue@3.6.0-rc.6` has **no `./vapor` export
subpath**; it `export *`s `@vue/runtime-vapor`, which is where
`vaporInteropPlugin`, `createVaporApp`, `defineVaporComponent` and
`createComponent` come from. That is why the smoke builds its Vapor root with
`defineVaporComponent` rather than a `<script setup vapor>` SFC: an SFC would
need a Vapor-capable compiler in the default lane's transform pipeline, and Vue
3.5 runs would then fail to *collect* the file.

---

## 4. The Vue 3.6-RC lane

### 4.1 How a one-lane override is expressed without touching default resolution

Yarn 4 has no "resolutions for this command only". Three options; two are worse:

| Option | Why not |
|---|---|
| A second lockfile / workspace | Honest isolation, but a duplicate 4 MB lockfile nothing keeps in step — the lane slowly stops testing this repository |
| `yarn add vue@rc` in CI, never restore | Fine in an ephemeral checkout, catastrophic locally — and running it locally is the first thing anybody does with a lane that finds something |
| **Apply → run → restore** | Taken |

`packages/tooling/scripts/vue-next-lane.mjs` copies `package.json` and
`yarn.lock` before the first write, merges the lane's `resolutions`, installs,
runs, and restores both in a `finally` — so an exception, a failing suite and a
Ctrl-C all land in the same place. **The restore is verified, not assumed:** the
runner re-reads both files, compares them to the copies, and exits **3** if
either differs *even when the suite passed*, because a lane that quietly leaves
an unreleased Vue pinned is worse than a lane that failed. The workflow then
runs `git diff --exit-code -- package.json yarn.lock` as an independent second
opinion that does not trust the runner's report of its own cleanup.

Exit codes are three-valued on purpose: **1** = the suite failed (a result),
**2** = the lane could not run (install/network — *not* a result), **3** = the
restore did not verify.

The override is **data**, in `packages/tooling/scripts/vue-next-lane.json`, and
it pins the whole `@vue/*` set with `vue`. Vue's packages release in lockstep;
`@vue/runtime-core` 3.6 against `@vue/shared` 3.5 is a state nobody ships, so a
red run in it says nothing about 3.6.

**`vue-component-meta` and `vue-tsc` are deliberately NOT pinned**, per N5-02's
ranked note: `component-meta.json`, both `llms*.txt`, 144 docs pages, the
playground seeds and the docs nav are all projections of `vue-component-meta`'s
output and each is byte-compared by a gate. Dragging the extractor into a
runtime lane would make every run of it look like a five-artifact regression,
and a lane whose failures are all self-inflicted is a lane people switch off.

### 4.2 Advisory, and the trigger that ends that

`.github/workflows/vue-next.yml`, **its own workflow rather than a job in
`ci.yml`**: the lane needs a `schedule` (an RC moves without this repository
changing), and a schedule on `ci.yml` would run a Storybook build, three browser
matrices and a coverage pass weekly to answer a question about somebody else's
prerelease.

Both jobs are `continue-on-error: true`. **It becomes blocking the day
`vue@latest` is 3.6.x** — delete the two lines, move the `suite` job into
`ci.yml`. That trigger is written down in the migration memo, not left to
whoever notices.

---

## 5. Nuxt 4

### 5.1 What was retargeted

| | Before | After |
|---|---|---|
| `dependencies["@nuxt/kit"]` | `3.14.0` | **`4.5.2`** |
| `devDependencies["@nuxt/schema"]` | `3.14.0` | `4.4.5` |
| `devDependencies.nuxt` | `3.14.0` | `4.4.5` |
| `peerDependencies.nuxt` | `>=3.0.0` | **unchanged — `[!owner]`** |
| `meta.compatibility.nuxt` | `>=3.0.0` | **unchanged — `[!owner]`** |

`src/module.ts` needed **no change**. Every kit API it uses —
`defineNuxtModule`, `addComponent`, `useLogger`, `nuxt.options.css`,
`nuxt.options.build.transpile`, `nuxt.options.app.head.script`,
`nuxt.options.rootDir` — is unchanged between kit 3 and kit 4.

The dev-dependency `nuxt` is `4.4.5`, not `4.5.2`, for the F7 reason: 4.4.6+
cannot be installed on the Node floor this repository declares and CI runs.

---

### 5.2 The fixture evidence — both majors, before and after

The lane is `yarn test:nuxt-fixtures:pack` → `:install` → `yarn test:nuxt-fixtures`,
with `DZUP_FIXTURE_NUXT` selecting the major. Six fixtures are runnable;
`core-pro` is `unrun` on any checkout without a Pro tarball, which is every
checkout today, and it says so rather than skipping silently.

| Fixture | `nuxt@3.19.0` before | `nuxt@4.4.5` before | `nuxt@3.19.0` after | `nuxt@4.4.5` after |
|---|---|---|---|---|
| `core-only` | ✗ | ✗ | **✓** | **✓** |
| `custom-prefix` | ✗ | ✗ | **✓** | **✓** |
| `css-order` | ✗ | ✗ | **✓** | **✓** |
| `ssr-hydration` | ✗ | ✗ | **✓** | **✓** |
| `pro-missing` | ✗ | ✗ | **✓** | **✓** |
| `optional-peer` | ✗ | ✗ | **✓** | **✓** |
| `core-pro` | unrun | unrun | unrun | unrun |
| **suite exit** | **1** | **1** | **0** | **0** |

Observed suite lines, verbatim, after the fixes — identical on both majors:

```
Test Files  1 passed (1)
     Tests  12 passed | 7 skipped (19)
```

Three separate causes had to be removed, and only the first was a library
defect:

1. **F3 — `@dzup-ui/contracts` unloadable by Node ESM.** Killed all six on
   both majors. A library defect, fixed in `packages/contracts/src`.
2. **F4 — Nuxt 4's `app/` srcDir.** Killed all six on Nuxt 4 only. A fixture
   harness defect, fixed in `pack-fixtures.mjs`.
3. **F5 — Nuxt 4 stopped inlining critical CSS.** Killed `css-order` on Nuxt 4
   only. A spec-assertion defect, fixed in `fixtures.spec.ts`.

**What this evidence settles.** The retargeted module — carrying
`@nuxt/kit@4.5.2` as a hard dependency — works on a real Nuxt 3 consumer app.
The floor does **not** have to drop now, which is precisely the stop condition
the packet named. See `N5-03-D2`.

**What it does not settle.** It is one Nuxt 3 version (`3.19.0`) and one Nuxt 4
version (`4.4.5`), built on one machine, on Node v24.14.1. The CI matrix that
would make it a continuous fact was written and **never dispatched**.

---

## 6. The Vapor-interop statement

### 6.1 The claim, and where it is published

`packages/core/README.md`, section *"Vue compatibility, including Vapor mode"*:

> `@dzup-ui/core` is a **virtual-DOM** component library. Every component is an
> ordinary vDOM SFC and **none of them is compiled in Vapor mode** — nor is that
> planned. […] Vue 3.6 ships `vaporInteropPlugin`, which lets a Vapor component
> render a vDOM child.

**The evidence paragraph is generated, not typed** — a `facts:vapor` region in
`packages/tooling/scripts/generate-readme-facts.ts`, gated by
`yarn validate:readme-facts`. Three of its facts are read off disk rather than
remembered:

| Fact | Read from |
|---|---|
| the declared peer range (`vue@^3.5.0`) | `packages/core/package.json` |
| the version the lane pins (`vue@3.6.0-rc.6`) and its channel (`rc`) | `packages/tooling/scripts/vue-next-lane.json` |
| whether the claim is backed at all | `existsSync(packages/core/tests/vapor-interop.spec.ts)` |

That third one is the point. **Delete the spec and the block rewrites itself to
say the claim is UNBACKED**, `validate:readme-facts` goes red, and the README
stops asserting something nothing tests. A hand-typed paragraph cannot do that,
and F8 is about exactly that failure mode. Five spec cases hold it
(`generate-readme-facts.spec.ts`), including one asserting the prose outside the
region carries no second, hand-typed copy of the peer range — a duplicated fact
is a fact that can disagree with itself.

What the generator deliberately does **not** emit is the bare word "verified".
A generator can see that evidence exists; it cannot see that anybody ran it. The
run record belongs here, with a date and a machine attached.

### 6.2 The actual run behind it

```
$ yarn test:vue-next:vapor        # node packages/tooling/scripts/vue-next-lane.mjs --vapor

  channel     rc
  pinning     6 package(s) at 3.6.0-rc.6
  command     vitest run -c packages/tooling/scripts/vue-next.vitest.config.ts
                packages/core/tests/vapor-interop.spec.ts

· vue resolved to 3.6.0-rc.6
· vapor-interop: vue 3.6.0-rc.6 — single Vue runtime with vaporInteropPlugin, running for real

 ✓ packages/core/tests/vapor-interop.spec.ts (3 tests | 1 skipped) 88ms
 Test Files  1 passed (1)
      Tests  2 passed | 1 skipped (3)

✓ vue-next lane PASSED under vue 3.6.0-rc.6 (advisory).
· restored package.json and yarn.lock

exit 0
```

**What was actually asserted:** a Vapor application built with `createVaporApp`,
with `vaporInteropPlugin` installed, whose root is a real Vapor component
(`defineVaporComponent`) rendering `DzButton` through `createComponent` — and
then, on the resulting DOM, that a `<button>` exists and carries
`data-tone="primary"`. Not a shape check on the exports; the component rendered.

**Maturity level: locally qualified.** One machine, jsdom, Vue 3.6.0-**rc**.6.
Not CI, not browser-qualified, not a statement about Vue 3.6 stable.

### 6.3 Two things had to be true before the run meant anything

Both were discovered by running it, and both are recorded because either one
would have produced a confident wrong answer.

**(a) `vue`'s CJS build carries no Vapor runtime at all.** `vue/package.json`
routes the `node` import condition to `index.js` → `dist/vue.cjs.js`, and only
`dist/vue.runtime.esm-bundler.js` does `export * from "@vue/runtime-vapor"`:

```
$ node -e "const m = await import('vue'); console.log('createVaporApp' in m)"
false        # vue@3.6.0-rc.6
```

The first run of the smoke failed with
`vue@3.6.0-rc.6 does not export 'createVaporApp'` — which the spec's export
guard reported by name instead of surfacing as `x is not a function` three
frames deep.

**(b) Reaching past that to `@vue/runtime-vapor` gets the exports but not a
runtime.** The vapor esm-bundler build imports `initFeatureFlags` from
`@vue/runtime-dom`, which only *its* esm-bundler build re-exports (transitively,
from `@vue/runtime-core`). On the CJS runtime-dom the symbol is absent and
`createVaporApp` dies inside `prepareApp`:

```
TypeError: (0 , initFeatureFlags) is not a function
 ❯ prepareApp node_modules/@vue/runtime-vapor/dist/runtime-vapor.esm-bundler.js:4166:2
 ❯ createVaporApp …:4186:2
```

**Two Vue builds in one process is not a state anybody ships**, so a red run in
it measures the seam between them, not Vapor interop.
`packages/tooling/scripts/vue-next.vitest.config.ts` removes the seam by
aliasing `vue` to Vue's own single-file `vue.runtime-with-vapor.esm-browser.js`
— one module carrying both runtimes, which is what a Vite-bundled Vapor app ends
up with. **That config is used only by `--vapor`.** The default lane command
runs on the root config, because "does this library work under Vue 3.6" and
"does Vapor interop work" are different questions needing different module
graphs, and answering the first through a rewritten resolution graph would
answer a question nobody asked.

### 6.4 The spec has three outcomes, and they stay distinguishable

| Condition | Outcome |
|---|---|
| Vue < 3.6 | `unverified`, named, **does not fail** |
| Vue >= 3.6 but `vue` has no `createVaporApp` (split runtime) | `unverified`, a **different** named reason, **does not fail** |
| Vue >= 3.6, one runtime | mounts for real, asserts hard |

The discriminator is a fact, not a heuristic:
`typeof vue.createVaporApp === 'function'` on the *same module object* `DzButton`
was compiled against. The `unverified` case additionally asserts that the reason
is one of the two known ones, so a third cause cannot make this file quietly
report `unverified` forever.

Observed on the default toolchain:

```
· vapor-interop: vue 3.5.31 — VERIFICATION NOT PERFORMED
· vapor-interop: UNRUN — vue 3.5.31 predates 3.6, where Vapor mode and
  `vaporInteropPlugin` arrive. Nothing here has been verified; do not quote the
  Vapor compatibility statement as tested from this run.
  Verify with `yarn test:vue-next:vapor`.
```

**This was a defect in the first version of this spec and it is worth recording.**
The first full 3.6 lane run reported the vapor smoke as a **failure** — because
the lane's default command uses the root config, where the runtime is split. A
test-environment problem was being reported as a library defect, in the file
whose entire purpose is to keep those two apart.

---

## 7. The 3.6-RC triage

Full unit + contract suite under `vue@3.6.0-rc.6`, root config. Run twice —
before and after the spec fix that row 1 describes:

```
first run    Test Files  3 failed | 502 passed (505)
                  Tests  3 failed | 9175 passed | 3 skipped | 1 todo (9182)

after fix    Test Files  2 failed | 503 passed (505)
                  Tests  2 failed | 9181 passed | 3 skipped | 1 todo (9187)
```

| # | Failure | Library defect / RC change / test-env | Action |
|---|---|---|---|
| 1 | `vapor-interop.spec.ts` — `(0 , initFeatureFlags) is not a function` | **test-env** — split Vue runtime under the root config's resolution (§6.3) | **Fixed in the spec**, which now reports `unverified` for this condition instead of failing. Not a library defect and not an RC bug. |
| 2 | `landing-token-fallbacks.spec.ts` — a fallback disagrees with its token (6 items) | **inherited** — fails identically on the default Vue | None. Not this packet's; proven byte-identical to HEAD by N5-02. |
| 3 | `story-dod-tiers.spec.ts` — `Cannot read properties of undefined (reading 'component')` | **inherited** — fails identically on the default Vue | None. Not this packet's. |

**Category counts: library defects 0 · RC behaviour changes 0 · test-env 1 · inherited 2.**

**9,181 tests pass under Vue 3.6.0-rc.6, and the only two that fail are the two
that already fail on the default Vue.** That is the headline result of the lane,
and it is an advisory one: a fact about a release candidate on one machine. It
neither promises that Vue 3.6 stable will behave the same nor authorises moving
`dependencies.vue`.

**Zero library changes were made in response to the RC**, which is what the
packet's step 1 asked for ("fix only library defects") — there were none to fix.

---

## 8. The migration memo, in one paragraph

`N5-03-toolchain-migration-memo.md` schedules six tracks and executes none. Its
finding, rather than its contents, is the thing worth carrying: **the two
expensive tracks are blocked on third parties and the three cheap ones are
blocked on nobody.**

| Track | Status | Trigger |
|---|---|---|
| **A** Vitest 3.2.6 → 5.x + browser mode | blocked on `@storybook/addon-vitest` | A1 addon supports Vitest 5; A2 an unbackported advisory |
| **B** Vite 7 → 8, tsdown adoption | blocked on Track A | B1 Vite 7 leaves support; B3 `vite-plugin-dts` blocks a `validate:dts` fix |
| **C** Nuxt floor | **actionable** | C1 the Nuxt 3 fixture leg goes red; C2 fixtures need `nuxt` >= 4.4.6 (ADR-18 amendment) |
| **D** Vue 3.6 / Vapor | **actionable** | D1 `vue@latest` is 3.6.x → the lane becomes blocking |
| **E** `vue-component-meta` pin | **actionable** | E1 only when its output must change, never for currency |
| **F** docs-site size ceiling (N2-D3 `D3-D3`) | **actionable, cheapest item in the memo** | immediate — it needs one number, not one investigation |

Three memo positions worth surfacing here, because they are recommendations
rather than neutral summary:

- **Hold Vitest 3.2.6.** A pinned, green, fully-measured runner two majors behind
  is a smaller liability than a re-measured coverage ratchet nobody trusts. Any
  Vitest major upgrade must re-measure that ratchet **in the same change**, with
  both numbers recorded.
- **Do not move the unit suite to browser mode.** That is not a toolchain
  upgrade; it re-platforms every piece of unit-level evidence in the repository
  and invalidates the maturity level of every component at once.
- **Adopt tsdown on the five `tsc`-built packages first, never on `core` first.**
  `core` builds SFCs, which is where a new bundler is least proven, and ADR-12
  commits `dist/`.

`N5-03-M1`: the packet's brief named **Vitest 4**, and the 4.x line ended at
`4.1.11` with `latest` at `5.0.0`. The memo is written against 5.0.0 and carries
a quarterly re-read of its version table as the mitigation.

---

## 9. Validation ladder

Every exit code below was read from the command itself. **Not once through a
pipe, and never as `; echo "…$?"` appended to a gate** — the standing lane rule,
and it earned its keep three times in this packet: the background-task wrapper
reported **"exited with code 0"** for `yarn validate:all`, for the Vue 3.6 lane
and for `yarn test`, all three of which actually exited **1**. The real codes
survived only because they were captured inside the command and read back by
name.

### `yarn validate:all` — 37 links

| | Links | Exit | First failing link |
|---|---|---|---|
| **Inherited (before Item 0)** | 37 | **1** | **15** — `validate:at-matrix` |
| **After this packet** | 37 | **1** | **16** — `validate:capability-matrix` |

Links **1–15 pass**. Link 16 fails. Because `validate:all` is `&&`-chained,
**links 17–37 did not execute in that run** — a fact worth stating plainly,
because "links 17–37 pass" is a claim the chained run cannot make. They were
therefore each run individually:

| # | Link | Exit | # | Link | Exit |
|---|---|---|---|---|---|
| 17 | `validate:visual-baselines` | **0** | 28 | `validate:doc-snippets` | **0** |
| 18 | `validate:tokens` (3 checks) | **0** | 29 | `validate:engines` | **0** |
| 19 | `validate:tokens:dtcg` | **0** | 30 | `validate:adr-references` | **0** |
| 20 | `validate:exports` | **0** | 31 | `validate:readme-facts` | **0** |
| 21 | `validate:ownership` | **0** | 32 | `validate:externals` | **0** |
| 22 | `validate:mcp` | **0** | 33 | `validate:dts` | **0** |
| 23 | `validate:component-meta` | **0** | 34 | `validate:changelog` | **0** |
| 24 | `validate:llms` | **0** | 35 | `validate:release-policy` | **0** |
| 25 | `validate:docs-pages` | **0** | 36 | `validate:peers` | **0** |
| 26 | `validate:playground-parity` | **0** | 37 | `validate:licenses` | **0** |
| 27 | `validate:package-names` | **0** | | | |

**36 of 37 links pass. The one failure is link 16, and it is the content
staleness of `N5-03-D1` — not something this packet caused and not something it
was permitted to regenerate.**

Worth naming individually, because these are the ones the F3 fix could have
broken and did not: `validate:exports` (0 errors, 3 flat-export packages),
`validate:dts` (261 `.js`, 754 `.d.ts`), `validate:externals` (8 passed, 1
skipped), `validate:component-meta` (fresh, 144/144), `validate:llms` (both
documents fresh, 144/144 discoverable), `validate:peers` (7 compatible — incl.
`nuxt >=3.0.0 — 4.4.5 satisfies >=3.0.0`), `validate:engines` (floor
`^20.19.0 || >=22.13.0` consistent and satisfiable).

### Tests

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | **0** | link 1 of the chain above |
| `yarn lint` | **0** | link 2, `--max-warnings 0` |
| `yarn test` | **1** | `2 failed \| 503 passed (505)` · `2 failed \| 9181 passed \| 3 skipped \| 1 todo (9187)` |
| `vitest run packages/nuxt` | **0** | `3 passed (3)` · `54 passed (54)` |
| `yarn test:nuxt-fixtures` @ `nuxt@4.4.5` | **0** | `12 passed \| 7 skipped (19)` |
| `yarn test:nuxt-fixtures` @ `nuxt@3.19.0` | **0** | `12 passed \| 7 skipped (19)` |
| `yarn test:vue-next:vapor` | **0** | Vapor smoke green under `vue@3.6.0-rc.6` |
| `yarn test:vue-next` (full suite, RC) | **1** | `2 failed \| 503 passed (505)` — both inherited. **Advisory.** |

### Failures separated

**Inherited — not mine.** Both were red before this packet and are red
identically on the default Vue and on the 3.6 RC:

1. `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts` — 6
   fallbacks disagree with their tokens.
2. `packages/tooling/src/validators/story-dod-tiers.spec.ts` — `countOpen >
   subtracts a waiver`, `Cannot read properties of undefined (reading 'component')`.

Neither was diagnosed. The inherited baseline recorded them as `2 failed / 499
passed` files; the count moved to `2 failed / 503 passed` because this packet
**added four spec files**, not because anything changed about these two.

**Caused by this packet: none.** The one failure this packet introduced —
`vapor-interop.spec.ts` reporting a test-environment problem as a test failure —
was found by the first full RC run and fixed before the ladder was recorded
(§7, row 1).

### Ratchet movements

| Ratchet | Old → New | |
|---|---|---|
| `validate:all` first failing link | **15 → 16** | one gate closed |
| pending changesets | **18 → 20** | `+contracts` patch, `+nuxt` minor |
| spec files in the default lane | **501 → 505** | 4 added |
| tests in the default lane | **≈9,133 → 9,187** | 54 added |
| generated README fact regions | **5 → 6** | `facts:vapor` |
| `adr-references` registry-only | **14 / ceiling 14** | unchanged |
| `component-meta` extraction debt (9 numbers) | unchanged | at ceiling |
| `story-dod-tiers` ceilings | unchanged | not touched |
| `mcp` surface ratchets | unchanged | not touched |

**No ceiling was raised, lowered, or rewritten by this packet.** The only
monotone quantity that moved in the "worse" direction is the pending-changeset
count, which is what a changeset is for.

---

## 10. `[!owner]` decisions

Six, numbered, each with what was measured and what it would cost to decide
either way. None was taken by this packet.

### `N5-03-D1` — the capability matrix currently overstates. Regenerate, re-capture, or leave red?

`validate:all` link 16 is red on **content**, not provenance (§2.5). The
committed `capability-matrix.json` calls 7 button-family `visual` cells
`covered` and `DzOrderList`'s `perf-baseline` cell `pass`; a fresh build calls
all 8 `stale`, because the artifacts predate `e0d1707`.

The packet forbade regenerating it, so it was not regenerated. But note what
that leaves standing: **the committed artifact claims more evidence than
exists.** Under this repository's own evidence rules an overstating artifact is
worse than a red gate.

| Option | Effect |
|---|---|
| **(a) regenerate** | Artifact becomes truthful (`stale` where stale), link 16 goes green, tier-C totals move `pass 158 → 157`, `stale 10 → 11`. **Produces no new evidence** — it stops claiming evidence it does not have. |
| **(b) re-capture the 7 visual baselines** | Produces real evidence. Needs Playwright, a reviewer and `validate:visual-baselines`' acceptance record. Not a tooling change. |
| **(c) leave red** | The gate keeps failing and the artifact keeps overstating. The worst of both. |

**Recommendation: (a) now, (b) scheduled.** (a) is a two-minute change that makes
the artifact honest; (b) is the actual work.

### `N5-03-D2` — the Nuxt compatibility floor

`@dzup-ui/nuxt` now depends on `@nuxt/kit@4.5.2`, while `peerDependencies.nuxt`
and `meta.compatibility.nuxt` both still say `>=3.0.0`.

**The measurement:** with kit 4 as a hard dependency, all six consumer fixtures
build and pass on `nuxt@3.19.0` (§5.2). The floor does **not** have to drop now.

| Option | Case for it |
|---|---|
| **keep `>=3.0.0`** | It is what the evidence says. Narrowing a floor on principle costs every Nuxt 3 consumer for nothing. |
| **narrow to `>=4.0.0`** | Honest about the kit major the module drags in; removes a combination nobody continuously tests. |

**Recommendation: keep `>=3.0.0`, and make the Nuxt 3 fixture leg the tripwire.**
That leg exists (`.github/workflows/vue-next.yml`, `nuxt-majors`) but has never
run — see `N5-03-D6`.

### `N5-03-D3` — CLAUDE.md rule 5 is wrong for `tsc`-emitted packages, and nothing gates it

CLAUDE.md Quick Rule 5 says *"Use `.ts` extensions in all relative imports."*
That is correct for `packages/core`, which Vite bundles. It is **actively
harmful** in a package `tsc` emits: `tsc` strips the extension, and the emitted
ESM is unloadable by Node (F3).

The repository already disagrees with itself about this. `@dzup-ui/testing`,
`@dzup-ui/mcp` and `@dzup-ui/codemods` write `.js` and emit correctly;
`@dzup-ui/contracts` followed rule 5 and shipped a broken package. **No gate
noticed either fact.**

Two things to decide:

1. Amend rule 5 with an explicit carve-out for `tsc`-built packages (`.js`
   specifiers, resolved to `.ts` by `moduleResolution: "bundler"`).
2. Add the gate that would have caught this: for every published package, `import()`
   its `exports["."].import` target **under Node** and fail if it throws. That
   is a handful of lines and it is the only check in this class that Vite's
   resolver cannot pass vacuously. `validate:exports`, `validate:dts` and
   `validate:externals` all read the built files without ever loading one.

**Recommendation: do both.** (2) is the one that matters — a written rule that
nothing enforces is how this defect survived.

### `N5-03-D4` — the fixture Nuxt pin, and the Node floor behind it

Fixtures pin `nuxt@4.4.5` exactly, not `^4`, because `nuxt` >= 4.4.6 requires
Node `^22.12.0 || ^24.11.0 || >=26.0.0` and this repository declares
`^20.19.0 || >=22.13.0` with CI on 20.19.0 (F7).

| Option | Cost |
|---|---|
| **hold** the floor and the pin | The Nuxt 4 leg tests a version that is already behind `latest`, and the gap widens. |
| **raise** the Node floor to `>=22.12.0` | An **ADR-18 amendment**: `.nvmrc`, `engines` in two `package.json` files and ~14 CI `node-version:` values move together, or `validate:engines` fails. Drops Node 20 for consumers. |

**Recommendation: hold until a Nuxt security fix lands above 4.4.5.** That is the
trigger, and it is written into the memo as `C2`.

### `N5-03-D5` — the docs site still has no size ceiling

Carried from N2-D3 (`D3-F10` / `D3-D3`), unchanged by this packet: `apps/docs`
`dist/` is **29,822,709 B** and is the only static artifact in the repository
under no size gate. Three consecutive packets grew it, the last by **+44 %**.

The missing piece is a number, and a ceiling somebody invents is a ceiling that
gets raised the first time it fires. **Recommendation: freeze the measured
29.82 MB as a downward-only ratchet** — the repository's existing idiom, and it
stops a fourth consecutive growth without demanding a fix first. Mechanism
already exists (`validate:bundle-budget`); it reads `storybook-static` only.

### `N5-03-D6` — should the `nuxt-majors` matrix be blocking?

Both jobs in `.github/workflows/vue-next.yml` are `continue-on-error: true`.
That is right for the Vue RC job — it tests somebody else's prerelease. It is
arguably wrong for `nuxt-majors`, whose **Nuxt 3 leg is the tripwire that
`N5-03-D2` depends on**. A tripwire nobody is required to look at is not a
tripwire.

**Recommendation: move the `nuxt@3.19.0` leg into `ci.yml` as blocking and leave
the `4.4.5` leg advisory** — the first is a promise to existing consumers, the
second is forward-looking. Not done here: `ci.yml`'s job graph is not this
packet's to restructure, and nothing was dispatched to find out how long the leg
takes on a runner.

---

## 11. Files

Grouped by what they are. Nothing was committed.

### Item 0 — the provenance exclusion

| File | Change |
|---|---|
| `packages/tooling/src/quality/git.ts` | **+** `stripComponentCommits()`, with the off-by-one stated |
| `packages/tooling/src/quality/git.spec.ts` | **new** — 5 cases, incl. the guardrail (content must still differ) |
| `packages/tooling/src/validators/at-matrix.ts` | index comparison strips provenance; clause 5 header rewritten |
| `packages/tooling/src/validators/capability-matrix.ts` | freshness strip composed with the existing `sourceCommit` one; clause 1 header rewritten |

### The Vue 3.6 lane

| File | Change |
|---|---|
| `packages/tooling/scripts/vue-next-lane.json` | **new** — the override as data; pins `@vue/*` in lockstep, deliberately not `vue-component-meta` |
| `packages/tooling/scripts/vue-next-lane.mjs` | **new** — apply → run → **verified** restore; exit 1/2/3 kept distinct |
| `packages/tooling/scripts/vue-next-lane.spec.ts` | **new** — 9 cases over the pure halves |
| `packages/tooling/scripts/vue-next.vitest.config.ts` | **new** — single-Vue-runtime config, used only by `--vapor` |
| `packages/core/tests/vapor-interop.spec.ts` | **new** — the interop smoke, three distinguishable outcomes |
| `.github/workflows/vue-next.yml` | **new** — advisory, scheduled, own workflow. **Never dispatched.** |
| `package.json` | **+** `test:vue-next`, `:plan`, `:vapor` and their `//` doc key |

### The Vapor statement

| File | Change |
|---|---|
| `packages/tooling/scripts/generate-readme-facts.ts` | **+** `renderVapor()`, `readPeerVue()`, `readVaporLane()`, `vapor` region |
| `packages/tooling/scripts/generate-readme-facts.spec.ts` | **+** 5 cases incl. "says UNBACKED when the spec is gone" |
| `packages/core/README.md` | **+** *Vue compatibility, including Vapor mode*, with a generated `facts:vapor` region |

### Nuxt 4

| File | Change |
|---|---|
| `packages/nuxt/package.json` | `@nuxt/kit` `3.14.0` → `4.5.2`; dev `nuxt`/`@nuxt/schema` → `4.4.5`. **Peer range untouched.** |
| `packages/nuxt/scripts/pack-fixtures.mjs` | **+** `DZUP_FIXTURE_NUXT`, `applyNuxtOverride`, `appDirLayout`, per-fixture `nuxt` in the manifest |
| `packages/nuxt/scripts/pack-fixtures.spec.ts` | **new** — 8 cases over the staging decisions |
| `packages/nuxt/test/fixtures.spec.ts` | `styleBlocks` → `styleSources` (both CSS delivery mechanisms); **+** the "which Nuxt" recorder |
| `yarn.lock` | the Nuxt 4 tree. Restored byte-identically after every Vue-lane run. |

### The library defect (F3)

| File | Change |
|---|---|
| `packages/contracts/src/{index,compound.types,data-attributes.types,form-value,props.types,provider.types,quality-tiers}.ts` | 27 relative specifiers gain `.js` — 7 files, 23 insertions, 23 deletions. No type, export or runtime value changed. |

### Changesets and reports

| File | |
|---|---|
| `.changeset/the-contracts-package-can-now-be-loaded-by-node.md` | **new** — `@dzup-ui/contracts` **patch** |
| `.changeset/nuxt-module-now-builds-against-nuxt-kit-4.md` | **new** — `@dzup-ui/nuxt` **minor** (breaking, per `VERSIONING.md`) |
| `docs/program-2026-09/reports/N5-03-toolchain-currency-handoff.md` | **new** — this document |
| `docs/program-2026-09/reports/N5-03-toolchain-migration-memo.md` | **new** — the schedule |

### Untouched, deliberately

`e2e/at-matrix/index.json` and `packages/core/docs/capability-matrix.json` were
**mutated during the negative probes and restored byte-for-byte**; `git status`
on both paths is empty. Every uncommitted TASK-N5-01 and TASK-N5-02 file is
still in the tree.

---

## 12. What this work refuses to imply

- **It does not claim `validate:all` is green.** It is 37 links, exit 1 at link
  16, and the reason is stated rather than absorbed.
- **It does not claim CI evidence.** Every number here was observed on one
  Windows machine on Node v24.14.1. The CI lanes were *written*; **nothing was
  dispatched** and no workflow in this packet has ever executed on a runner.
- **It does not claim the Nuxt floor decision.** `peerDependencies.nuxt` still
  says `>=3.0.0`. The changeset describes what the tree does; it does not ship a
  decision nobody made.
- **It does not claim `@dzup-ui/contracts` is now correct in every consumer.**
  It claims one thing, measured: the built `dist/index.js` can be imported by
  Node's ESM resolver, and six Nuxt consumer fixtures that could not build now
  build. Bun, Deno and CommonJS interop were not tested.
- **It does not claim the Vitest / Vite / tsdown migrations were assessed by
  running anything.** Every version in the memo is a registry read on
  2026-09-03.
- **It does not claim the 12 reported `stale` cells in the capability matrix
  were investigated.** They are reported by that gate, they are not new, and
  they are not this packet's.

## 13. Ranked next step for TASK-N5-05 (ADR-19 / ADR-20 acceptance)

**One note, and it is about what your acceptance criteria can and cannot see.**

ADR-19 (parts, states, `ui`) and ADR-20 (provider contract) are both **runtime**
contracts on **published** packages, and this packet found that the repository
had no way to observe a published package at runtime at all. `@dzup-ui/contracts`
— the package ADR-20's injection keys and ADR-19's `ANATOMY_PART_VOCABULARY`
both live in — shipped an entry point Node could not `import()`, and **37
validate links, 9,187 tests, `typecheck:all` and three build-output gates all
passed over it** (F3). Every one of them resolves modules the way a bundler
does; `tsconfig.base.json` says `moduleResolution: "bundler"` and Vite and
Vitest oblige.

So, ranked:

1. **Do not accept an ADR-19/20 criterion that is only checked through Vitest.**
   A `data-part` assertion or an injection-key round-trip that passes under the
   repo's own resolver is evidence about the source tree, not about the artifact
   a consumer installs. Both ADRs describe what `@dzup-ui/*` *ships*.
2. **The cheapest fix is `N5-03-D3`(2)** — one gate that `import()`s each
   published package's `exports["."].import` target under Node. It is a handful
   of lines, it is the only check in this class a bundler cannot pass vacuously,
   and it would have caught F3 on the day it landed. Land it *before* the
   acceptance packets, so their criteria have something real to stand on.
3. **The Nuxt fixture lane is the only existing runtime observation post**, and
   it is now green on both Nuxt majors (§5.2). If an ADR-19/20 criterion needs
   end-to-end proof, extend a fixture rather than inventing a new harness — the
   fixtures already install tarballs, run outside the monorepo, and build under
   Node. The `app/` layout switch and the CSS-delivery generalisation (F4, F5)
   mean they now work on Nuxt 3 and Nuxt 4 unchanged.
4. **Inherit `N5-03-D1` deliberately, not accidentally.** `validate:all` link 16
   is red, and the reason is that the capability matrix claims 8 cells of
   evidence it does not have. An acceptance packet that quotes that matrix will
   quote an overstatement. Resolve D1 first, or state in the acceptance report
   that those 8 cells are excluded.

**One thing not to repeat.** Both preceding packets and this one spent a section
proving a red link was not theirs. Item 0 closed one such link permanently by
removing git provenance from a byte comparison; **the same class of defect will
recur in the next generator that stamps a commit**. If an ADR-19/20 acceptance
artifact records provenance — and an acceptance artifact almost certainly
will — exclude it from the freshness comparison in the same change that adds it,
and say so in the doc comment. The rule is in `stripComponentCommits`.
