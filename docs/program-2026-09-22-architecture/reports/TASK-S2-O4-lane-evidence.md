# TASK-S2-O4 — lane evidence and dispatch recommendation

> **For the owner. Dispatch is owner authority; nothing here was dispatched.**
> Companion to [`ci-dispatch-request-2026-09.md`](../../program-2026-09-04/reports/ci-dispatch-request-2026-09.md)
> (TASK-R1-O4, prepared at `527dbd1`) — this document supplies the **local
> evidence that request lacked**, and corrects three of its premises.
> Reasoning, deviations and the full command log:
> [`TASK-S2-O4-handoff.md`](./TASK-S2-O4-handoff.md).
>
> Local tree: `main` @ **`4e4e46f`**
> (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`), **269 dirty paths** from thirteen
> prior tasks, all preserved (274 at the end — the five paths this task added or edited).
> Machine: **win32** (Windows 11 Pro 26200).
> Toolchain obtained for this task: **Node v20.19.0** (`node-v20.19.0-win-x64`,
> fetched into a scratchpad, never installed) driving **yarn 4.16.0**.
> Developer default, for contrast: **Node v24.14.1**.
>
> **Every exit code below is a win32 exit code. No CI runner is win32** — **19 of
> 19** `runs-on:` declarations across the eight workflow files are
> `ubuntu-latest`, re-counted here rather than quoted (TASK-S1-O3 said 18, before
> `min-peer.yml` and `validate-min-runtime.yml` existed). A green here is
> **locally qualified**: not CI, not release, not production evidence.

---

## 0. The headline

**The `min-peer` lane, run in full for the first time, found that BOTH published
peer ranges are false.** `@dzup-ui/core` publishes
`peerDependencies: { vue: "^3.5.0", reka-ui: "^2.0.0" }` (and `contracts` and
`compat` publish the `vue` range too). Both floors **install**. Neither **works**:

| Half of the lane | Result at the declared floor | Cause |
|---|---|---|
| `typecheck` | **exit 1 — 622 errors in 127 files across 11 of 11 families** | **`vue@3.5.0`.** Vue widened `ComponentTypeEmits` from `Record<string, any[]>` to `Record<string, any>` at **exactly 3.5.13**, and every `Dz*Emits` here is an `interface`, which has no implicit index signature. **3.5.0 – 3.5.12 — thirteen releases the range admits — have never worked.** §4.1 |
| the suite | **exit 1 — 9 of 373 files, 32 of 5,705 tests** | **`reka-ui@2.0.0`.** 31 of the 32 are downstream of two behaviours: the combobox option list does not open, and a dialog scroll lock is not released. The 32nd is a load flake, named as such. §4.2 |

The root manifest already depends on `vue: ^3.5.13` — the repository has been
developing against the right number and publishing the wrong one. Nothing is
published yet, so narrowing costs a changeset **today** and a breaking 0.x minor
after first publication. **This is an A4-D1 precondition** (`D-S2O4-5`,
`D-S2O4-6`).

It was found on a laptop, in 20 minutes, by a lane that had never run.

---

## 1. Which file holds which job

The `<done_check>`'s first clause counts *files mentioning a lane name* and is
defective (§9). Run per-file, the map is:

| Lane | File | Job | Individually dispatchable? |
|---|---|---|---|
| `validate-min-runtime` | `.github/workflows/validate-min-runtime.yml` | `validate-min-runtime` | **yes** (`workflow_dispatch`), and `ci.yml` calls it via `workflow_call` — so it is **already in the blocking graph** |
| `min-peer` | `.github/workflows/min-peer.yml` | `min-peer` | **yes** (`workflow_dispatch`); `workflow_call` present but **not wired into `ci.yml`**, so a dispatch is the only way it ever runs |
| `vue-next` | `.github/workflows/vue-next.yml` | `suite` | **yes** (`workflow_dispatch` + `schedule '0 4 * * 1'`) |
| `nuxt-majors` | `.github/workflows/vue-next.yml` **line 165** | `nuxt-majors`, matrix `3.19.0` / `4.4.5` | **NO — it rides the `vue-next.yml` dispatch.** A job cannot be dispatched alone |

There is **no `nuxt-majors.yml`**. `chromatic.yml`,
`landing-e2e-snapshots.yml`, `publish-prerelease.yml` and `release.yml` contain
no lane content; `ci.yml`'s two matches are its `uses:` line and the comment
above it. **Four lanes, three files, three dispatch handles.**

## 2. The declared environment, and how far this machine reproduced it

| | Declared | Here | Reproduced? |
|---|---|---|---|
| OS | `ubuntu-latest`, all four lanes | **win32** | **No, and it cannot be** |
| Node | **20.19.0** — `.nvmrc` for min-runtime and min-peer, the literal `'20.19.0'` for both `vue-next.yml` jobs | default v24.14.1; **no version manager installed** | **Yes — obtained.** Every run below verified `node -v` in the same shell |
| Package manager | corepack → yarn 4.16.0 | yarn 4.16.0 | **Yes.** `yarn.CMD` hard-codes `"%~dp0\node.exe"`, so a `PATH` change alone silently keeps Node 24; a scratchpad shim invoking `corepack/v1/yarn/4.16.0/yarn.js` with the Node 20 binary was used instead |
| `yarn install --immutable`, cold | min-runtime refuses a cache restore on purpose | shared `node_modules` installed under Node 24 | **No — skipped.** It would mutate the install state behind 269 dirty paths and a concurrent session. For `min-peer` the install **was** reproduced, in a throwaway worktree (§4) |
| `yarn build` | min-runtime builds before validating | all eight `packages/*/dist` present; `tokens/dist/tokens.css` written **today 15:14** by the concurrent session | **No — skipped**, to avoid rewriting shared gitignored output another session is building into |

It changes **one variable** — the Node major — against a fixed tree and a fixed
`node_modules`. That is exactly what the min-runtime lane exists to ask, and it
is the 08-11 finding **H4** verbatim. It says nothing about linux, about a cold
`--immutable` install, or about native rebuilds.

## 3. `validate-min-runtime` — the run record

| Command | Declared | Actual | Exit | Time | What it proves · what it does not |
|---|---|---|---|---|---|
| `node -v` | node 20.19.0 | **v20.19.0** | 0 | — | the floor was actually obtained |
| `yarn --version` | yarn 4.16.0 | **4.16.0 on v20.19.0** | 0 | — | yarn itself runs at the floor |
| `yarn install --immutable` | cold, no cache | — | **not run** | — | the one step with no local answer (§2) |
| `yarn validate:engines` | node 20.19.0 | v20.19.0 | **0** | 8 s | *"floor `^20.19.0 \|\| >=22.13.0` is declared consistently and every gate dependency satisfies it."* Proves the **declarations** agree; proves nothing about which built-ins this repo's own source calls — §5 |
| `generate:ownership:core --check` | node 20.19.0 | v20.19.0 | **0** | 31 s | the ownership generator starts and completes at the floor |
| `generate:exports:core` | node 20.19.0 | v20.19.0 | **0** | 9 s | starts at the floor — **and rewrote `packages/core/src/index.ts`** (`e6237d9…` → `379be8a…`), so **D158's generator drift is live at `4e4e46f`**. Restored byte-for-byte, `sha256sum -c` exit 0 |
| `git checkout -- .` (lane step 4) | — | — | **refused** | — | correct in CI; **locally it would destroy all 269 uncommitted paths** |
| `yarn build` | node 20.19.0 | — | **not run** | — | §2 |
| **`yarn validate:all`** | node 20.19.0 | **v20.19.0** | **1** | **325 s** | **fails at link 51 of 58 — and not because of Node.** `validate:peers` → `validate:icon-duplicates`: `✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may`. Identical link, identical message under v24.14.1. Links 1–50 all run at the floor |
| links 52–58, individually | node 20.19.0 | v20.19.0 | **0 each** | 96 s | `validate:{licenses,tree-shake,evidence-binding,deprecations,adr-status,at-runs,docs-freshness}` — **their first execution in any context**, because link 51 makes them unreachable in the aggregate. All seven are floor-clean |
| `vitest run …/landing-token-fallbacks.spec.ts` | node 20.19.0 | **v20.19.0** | **1** | 11 s | **`TypeError: globSync is not a function`, `Tests: no tests`** |
| same spec, contrast | — | **v24.14.1** | **0** | 9 s | **9 passed.** Same tree, same `node_modules`, same command, one variable changed |

### 3.1 The lane cannot currently return a floor verdict

Three different non-floor failures stand between this lane and the step that
carries its question, and they are not the same on every ref:

| Ref | First failure | Node-dependent? |
|---|---|---|
| `4e4e46f` + the 269 working-tree paths (local) | link 51, `validate:icon-duplicates` | **no** — identical on v20 and v24 |
| remote `main` (`3147432`, CI, today) | **`validate:capability-matrix`** — `✗ [freshness] packages/core/docs/capability-matrix.json is stale` | **no** |
| a ref carrying the 269 paths **and** `main`'s 11 commits | *expected:* `yarn test` → `globSync` | **yes — this is the floor verdict** |

The `lucide-vue-next` dual version is **already fixed on `main`** (all three
declarants read `^0.477.0` there) and the fresh capability matrix is **already in
this working tree** (`validate:capability-matrix` exit 0 locally). Neither fix is
in the same place. **Until the owner commits the tree, no dispatch of this lane
reaches the floor question** — and a reader who sees *"Validators at the minimum
runtime — failed"* will conclude the floor is broken, which is R1-O4's DEFECT 2
pattern repeating one level up.

## 4. `min-peer` — the run record, and the finding

Run **in a throwaway `git worktree` at `4e4e46f`** under Node 20.19.0, outside
the repository, removed afterwards. Deviations from the CI job are listed in the
handoff §7; the material ones are that the job's first default `yarn install`
was skipped (the runner's pinned install was the only one) and that the eight
already-built `packages/*/dist` directories were copied in rather than built.

| Command | Declared | Actual | Exit | Time | Verdict |
|---|---|---|---|---|---|
| `min-peer-lane.mjs --plan` | floors **derived**, never written down | v20.19.0 | **0** | 3 s | derives **`vue 3.5.0`** (from `@dzup-ui/core`, `contracts`, `compat`, all `^3.5.0`) and **`reka-ui 2.0.0`** (`@dzup-ui/core` `^2.0.0`); pins 7 packages; writes nothing. On-disk before the run: `vue 3.5.31`, `reka-ui 2.9.2` — the floor had **never** been resolved here |
| registry probe | both floors must exist | — | **0** | 6 s | `vue@3.5.0` and `reka-ui@2.0.0` both exist (`reka-ui@latest` 2.10.5) |
| the runner's pinned `yarn install --no-immutable` | `vue 3.5.0` + `reka-ui 2.0.0` + the 5-package Vue lockstep set | **all seven landed on disk**, asserted by the runner | **0** | 119 s | **not an `exit 2`** — the declared floor **is installable** |
| **`yarn typecheck`** (`vue-tsc -p packages/core/tsconfig.json`) | at the floor | **v20.19.0, vue 3.5.0, reka-ui 2.0.0, vue-tsc 3.3.3** | **1** | 171 s total lane | **622 errors in 127 files across 11 of 11 families.** `TS2345` 341 · `TS2344` 95 · `TS2769` 92 · `TS2339` 87 · `TS2322` 6 · `TS7006` 1 |
| `vitest run packages/core packages/contracts packages/nuxt` | the lane's second command | v20.19.0, vue 3.5.0, reka-ui 2.0.0 | **see §4.2** | — | the lane stops at the first failing command, so this was run **directly in the same worktree**, whose `node_modules` still held the floor |
| `git diff --exit-code -- package.json yarn.lock` (the workflow's own check) | — | worktree | **0** | — | `git status --porcelain -- package.json yarn.lock` was **empty** after the run: the runner's restore verified independently |

### 4.1 Root cause, measured to the patch release

Only **16** of the 127 failing files are the `reka-ui`-backed overlays, so this
is **not** a Reka finding. **95 of the 622 errors are one message** —
`Type 'Dz…Emits' does not satisfy the constraint 'ComponentTypeEmits'` — and
`ComponentTypeEmits` is a Vue type. Read out of the registry tarballs of
`@vue/runtime-core`:

| Vue | `ComponentTypeEmits` |
|---|---|
| 3.5.0 – **3.5.12** | `((...args: any[]) => any) \| Record<string, any[]>` |
| **3.5.13** – 3.5.31 | `((...args: any[]) => any) \| Record<string, any>` |

Probed at 3.5.1, .5, .8, .11, **.12**, **.13**, .17, .22, .31 — the widening
lands at **3.5.13**. The mechanism, isolated in a nine-line `tsc --strict` probe
rather than asserted:

```
interface E { escapeKeyDown: [event: Event] }
declare function narrow<T extends ((...a: any[]) => any) | Record<string, any[]>>(): T
narrow<E>()
→ error TS2344: Type 'E' does not satisfy the constraint …
    Index signature for type 'string' is missing in type 'E'.
```

**An `interface` has no implicit index signature.** It satisfies the widened
`Record<string, any>` and fails the narrow `Record<string, any[]>`. Every
`Dz*Emits` here is an `interface` — the documented pattern in `CLAUDE.md`. So 95
constraint failures follow from one upstream type change, and the other 527
errors are its downstream fallout in `mount()` overloads and `$el` access.

**The published range is false, and the repository already knows the right
number**: the root manifest depends on `vue: ^3.5.13`. See `D-S2O4-5`.

### 4.2 The suite at the floor — a **second**, independent false range

`vitest run packages/core packages/contracts packages/nuxt`, Node 20.19.0,
`vue 3.5.0`, `reka-ui 2.0.0`: **exit 1 in 256 s — 9 failed / 364 passed (373 files);
32 failed / 5,670 passed / 3 skipped (5,705 tests).**

Every failure triaged, because "32 red" is not a finding and a cause is:

| Cluster | Tests | Measured | Cause |
|---|---:|---|---|
| `DzPersonaSelector` security corpus — `url-boundary.url-policy` (9) + `url-boundary.malicious-corpus` (11) | **20** | every one measured **`rejected`** where the corpus requires `inert` or `escaped` — *"no `src` rendered"*, *"the value does not appear in the DOM at all"* | **The combobox option list never opens under `reka-ui@2.0.0`, so the sink is never rendered.** `rejected` is the **strictest** outcome in the corpus's vocabulary, so **these are not security regressions** — the corpus asserts the exact mechanism and the mechanism is absent |
| `DzCombobox` (3) · `DzMultiSelect` (2) · `DzCascader` (1) | **6** | `expected undefined to be truthy`; `expected  to have a length of 3 but got +0`; `expected false to be true` | the listbox / the inline Reka options do not appear — same root cause |
| `useDialog` (3) | **3** | `expected 'hidden' not to be 'hidden'` on unmount cleanup and in non-modal mode | **a scroll lock that is applied when it should not be and not released on unmount** — a genuine behavioural defect at the `reka-ui` floor, and the one in this list a consumer would actually notice |
| `DzPanel` · `DzDatePicker` aria wiring | **2** | `aria-controls` / native `required` semantics | `reka-ui` id-and-aria wiring differs at 2.0.0 |
| `count-bearing` → `DzCountdown announces plurals and the finished state` | **1** | `expected '2 days, 2 hours, 2 seconds remaining' to be 'Countdown finished'`, the file took **70.2 s**, and the run also reported `Error: [vitest-worker]: Timeout calling "onTaskUpdate"` | **Classified as a load flake, not a floor finding.** This machine has produced exactly this shape before (a `yarn test` exit 1 with no failing test under load). Not counted as evidence either way |

**So the two halves of the lane found two different things, which is exactly what
it was built to separate:**

- **`typecheck` fails because of `vue@3.5.0`** — one type, boundary at 3.5.13,
  mechanism proven (§4.1).
- **the suite fails because of `reka-ui@2.0.0`** — 31 of 32 failures, all
  downstream of *the option list not opening* and *a dialog scroll lock not
  releasing*. `@dzup-ui/core` publishes `reka-ui: ^2.0.0` and the tree resolves
  2.9.x; **2.0.0 has never been installed here and does not work.** The exact
  boundary is **not** bisected — that is a follow-up task, not a guess
  (`D-S2O4-6`).

## 5. `vue-next` — the run record

| Command | Declared | Actual | Exit | Time | Verdict |
|---|---|---|---|---|---|
| `vue-next-lane.mjs --plan`, `DZUP_VUE_NEXT=""` | the **schedule** trigger's shape (no inputs → empty string) | v20.19.0 | **0** | 3 s | *"pinning 6 package(s) at 3.6.0-rc.6"*. **R1-O4's F1 fix holds** — the empty string falls through to the config pin instead of pinning `""`, which is how three scheduled runs measured Vue 3.5.43 while claiming 3.6 |
| `vue-next-lane.mjs --plan`, `=3.6.0-rc.9` | the **dispatch** trigger's input path | v20.19.0 | **0** | 3 s | *"pinning 6 package(s) at 3.6.0-rc.9"* — the override works, so a specific RC can be triaged without editing the data file |
| registry probe | the pin must resolve | — | **0** | 5 s | **`3.6.0-rc.6` still resolves** — not a stop condition. But the `rc` dist-tag is **`3.6.0-rc.9`**: the pin is **three RCs stale**. **Not silently repinned** — `D-S2O4-1` |
| the pinned install + `vitest run` | node 20.19.0 + vue 3.6.0-rc.6 | — | **not run** | — | **Skipped with a reason.** The runner leaves `node_modules` on the pinned versions and says so; it cannot be run against the shared tree, and the worktree slot was spent on `min-peer`, whose answer nothing else will ever produce. **This lane produces its own answer on Monday 2026-09-28 at 04:00 UTC, free** |

`vue@latest` is **`3.5.43`**, so Vue 3.6 is still an RC and the lane's documented
"becomes blocking" trigger has **not** fired. Advisory remains correct.

## 6. `nuxt-majors` — the run record

| Command | Declared | Actual | Exit | Time | Verdict |
|---|---|---|---|---|---|
| `pack-fixtures.mjs` (without `--build`; dist exists) | node 20.19.0, `DZUP_FIXTURE_NUXT=4.4.5` | **v20.19.0** | **0** | 34 s | 4 tarballs; **6 of 7 fixtures staged ready**; `core-pro` `unrun` (needs `@dzup-ui-pro/pro` — the TASK-S3-O1 precondition, reported rather than skipped silently). The dist-freshness gate **approved** the existing build rather than being bypassed |
| `tar -tzf` on each tarball | tarballs must carry `dist/` | — | **0** | 2 s | **`dzup-ui-core.tgz` carries 1,454 `package/dist/…` entries** (tokens 13, contracts 48, nuxt 3). This is the direct, artifact-level verification of R1-O4's root cause: six fixtures previously failed identically on *both* majors because the tarball had no build output |
| `install-fixtures.mjs` | `npm install` per staged fixture | v20.19.0 | **0** | 261 s | 6 fixtures, 639 packages each |
| **`yarn test:nuxt-fixtures`** | build + assert, nuxt 4.4.5 | **v20.19.0** | **0** | **330 s** | **12 passed, 8 skipped (20).** All six staged fixtures build and assert: `core-only` auto-imports `DzButton` from the installed tarball · `custom-prefix` registers `<XButton>` · `css-order` loads tokens before component styles · `ssr-hydration` renders on the server · `pro-missing` builds with Core and says why Pro is absent · `optional-peer` installs `reka-ui` as a required peer and needs it. **The six assertions that used to fail identically on both majors now pass** |
| the `3.19.0` leg | matrix entry 2 | — | **not run** | — | a second full per-fixture `npm install` plus six Nuxt builds; the marginal question is the Nuxt 3 `srcDir` layout, which the staging code handles explicitly. Named as not run |
| `nuxt` engines probe | matrix pins 3.19.0 / 4.4.5 | — | **0** | 8 s | `3.19.0` and `4.4.5` declare `^20.19.0 \|\| >=22.12.0`; **`4.4.6` declares `^22.12.0 \|\| ^24.11.0 \|\| >=26.0.0`** and **`4.5.2` (today's `latest`) declares `^22.19.0 \|\| …`**. The workflow's comment is correct and now understated: **while this repo's floor is 20.19.0 this lane structurally cannot test a current Nuxt** — `D-S2O4-2` |

## 7. The ADR-18 / Node-22 finding

**`validate-min-runtime` is the only one of the four lanes this affects**, and it
affects it decisively: the lane's last step is `yarn test`.

TASK-S0-O3's finding holds at `4e4e46f`. There are **two** `node:fs` glob sites,
not the one **D160** records, and their reachability differs:

| Site | Reachable from | Lane impact |
|---|---|---|
| `packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49` (used at :110) | **`yarn test`** — the `Test at the floor` step | **the lane's red.** Exit 1, `Tests: no tests` |
| `packages/codemods/scripts/run-story-color-tokens.ts:15` (used at :33, :53) | `yarn codemod:story-colors`, a root script | **no lane runs it** — no CI job, no `validate:all` link, no test project. A contributor on the floor meets it; CI never will |

A third `globSync` at `packages/codemods/src/runner.ts:13` imports from the
**`glob` package** — not a breach, and the proof that the replacement is already
a dependency here.

```
v20.19.0 → typeof require('node:fs').globSync === 'undefined'
v24.14.1 → typeof require('node:fs').globSync === 'function'
```

**CI agrees, today.** Run `36004699830`'s `Unit Tests (Node 20.19.0)` job:
`TypeError: globSync is not a function`, **1 failed / 553 passed (554)**. The
local Node-20 reproduction matches it line for line. `Unit Tests (Node 22.13.0)`
was cancelled by fail-fast, so **the upper half of the declared range is still
unmeasured**.

So the lane's verdict is knowable without dispatching it, and it is: **red at
`Test at the floor`. 1.0 criterion C10 is answered, and the answer is no.**

### 7.1 `validate:runtime-floor` — the gate built in response (link 59)

The floor decision is the owner's (**D160 / D176 / `N5-04 D3`**, register row 19)
and this task does not take it. What it does is stop the breach set growing while
the decision is open:

- `packages/tooling/src/validators/runtime-floor.ts` — derives the floor from
  `engines.node` (the **lowest** version any branch admits), cross-checks
  `.nvmrc`, scans **2,309** source files, and requires every use of an API newer
  than the floor to be listed with an `api`, a `since`, a `reachableFrom`, a
  dated `reason` and an `exit` condition.
- `runtime-floor-ceilings.json` — the two sites, `maxBreaches: 2`. The ceiling
  must **equal** the list, so a swap (one repaired, one added) is red.
- `runtime-floor-apis.json` — the API table **as data**, because the scanner
  matches literal substrings and a table inside the validator made the validator
  its own worst offender: the first run reported 15 violations, every one a row
  of its own table. The three `Set` methods whose names collide with ordinary
  user code are omitted on purpose and the file says so.
- `runtime-floor.spec.ts` — **23 tests**. `--self-test` — **10/10** clauses fire.
- It is **not** a second `validate:engines`: that gate is green at `4e4e46f`
  *while the floor is unusable*, because a dependency's `engines` field says
  nothing about which built-ins this repository's own source calls.

`validate:all` is **58 → 59 links**, appended at the **end**, so every existing
link number holds. **One caveat stated rather than buried:** the chain exits at
link 51, so link 59 is **not reached in the aggregate** — the same condition
links 52–58 are in, which is itself a finding above. The gate is proven by its
own invocation (exit 0), its `--self-test` (10/10) and its spec (23 tests), not
by the aggregate.

Gates at the end of this task, on the developer default v24.14.1, each exit code
read directly: **`yarn validate:all` exit 1 in 360 s** (link 51, `lucide-vue-next`,
pre-existing and already fixed on `main`; links 1–50 all pass with this task's four
new files and two new reports in the tree) · **the whole suite exit 0 in 339 s,
570 files / 11,084 passed / 3 skipped / 1 todo** — up from 569 / 11,061, a delta of
exactly this task's one new spec and its 23 tests.

## 8. Go / no-go, one per lane

| Lane | Call | Blocking vs reporting | Reason |
|---|---|---|---|
| **`min-peer`** | **GO — dispatch first, today** | **Blocking after its first green run** — wire the existing `workflow_call` into `ci.yml` then, not before | It has already earned its keep: run locally it found **two false published peer ranges** (§0, §4). Dispatch now because **the evidence is perishable** — the moment `peerDependencies` names a higher floor the lane derives *that* floor and passes, and the CI record of *why* the ranges were narrowed will exist nowhere. It has **no schedule**, so a dispatch is the only way it ever runs. Expect **exit 1 at `typecheck`** (the runner stops there, so CI will not reach the suite); that is the wanted answer, and the changeset should cite the run id. Use `-f commands='vitest run packages/core'` for a second dispatch if the suite half is wanted on linux too |
| **`vue-next` + `nuxt-majors`** (one dispatch, three jobs) | **GO — dispatch second**, or accept Monday | `suite`: **reporting** — `vue@latest` is 3.5.43, and gating merges on a third party's RC hands them a veto. `nuxt-majors`: **blocking once green** — both its majors are *released*, so a red row is a defect claim (**N5-03-D6 / D164**) | It will be the **first real run this lane has ever had**: three scheduled runs (2026-09-07, -14, -21, all before `589be13`) reported workflow conclusion `success` with **all three jobs `failure`** — re-verified here with `gh run view … --json jobs`. Both causes are fixed on `main` and both fixes are proven locally: the empty-string pin (§5) and the tarball-without-`dist` (§6). **Cheaper option: the `schedule` fires Monday 2026-09-28 04:00 UTC and runs the fixed lane for free.** Dispatch now only if the answer is wanted sooner — and it is, because the `3.19.0` leg is the one thing §6 left unrun |
| **`validate-min-runtime`** | **NO-GO as a separate dispatch** | Already blocking — `ci.yml` calls it on every push, so it is not an optional lane whose dispatch is in question; it is a red job in the blocking graph | Dispatching buys a red badge and no information. Its answer is known three independent ways (§7: local Node 20, CI's `Unit Tests (Node 20.19.0)` today, and `@types/node`'s `@since`), and from `main` it cannot even reach the step that carries the floor question (§3.1). **Dispatch it when either (a) the tree is committed — which fixes the capability-matrix link — or (b) D160/D176 is taken.** The next push after (a) re-runs it for free |
| **`ci.yml`** (the request's fifth row) | **NO-GO — already answered** | — | `36004699830` *is* that run, and it is more informative than a fresh one: `Typecheck`, `Lint` and **`Validate (boundaries + tokens)`** are **success** for the first time in this programme's records. Read it (§10) rather than spending another 15 minutes |

### 8.1 Minimality, as `<requirements><minimality>` asks

- **`vue-next` · `suite`** already runs `vitest run` and **deliberately skips
  every generated-artifact freshness gate** (`vue-next-lane.json`'s `//gates`
  block states why). It is already the reduced matrix. Narrowing further to a
  "reactivity-sensitive subset" is **not recommended**: the Vapor-interop smoke
  (`packages/core/tests/vapor-interop.spec.ts`) runs for real only in this job,
  and hand-picking the sensitive subset is the judgement an 11,061-test suite
  exists to avoid. Cost of staying whole: ~2 minutes.
- **`nuxt-majors`** is two entries and **cannot be reduced to one**: the question
  *is* per-major, because Nuxt 4 moved `srcDir` to `app/` and a root `app.vue`
  under Nuxt 4 silently prerenders nothing. It should be **widened** when the
  floor allows `nuxt@4.5.x` (`D-S2O4-2`).
- **`min-peer`** is already minimal: `typecheck` plus
  `vitest run packages/core packages/contracts packages/nuxt`, deliberately not
  `yarn test`, so an unpublished app's spec cannot make a floor failure look like
  a library failure. The `commands` dispatch input exists for triage narrowing.
- **`validate-min-runtime`** is **not** minimal and should not be: it is the one
  lane whose question is *"does everything start at the floor?"*.

## 9. `ci.yml` red since 2026-07-03 — re-measured, and it moved under this task

`gh run list --workflow=ci.yml --limit 100 --json conclusion,createdAt,headSha`,
read from the JSON, never through a pipe:

| | R1-O4 (2026-09-21) | **this task (2026-09-24)** |
|---|---|---|
| failure / cancelled / success | 83 / 13 / 4 | **82 / 13 / 4** (+1 in flight) |
| window | last 100 runs | 2026-06-29 → 2026-09-24 |
| newest success | 2026-07-03 | **2026-07-03** (`974019d`; the others are `6926619` 07-03, `568334e` 06-30, `4e5bbec` 06-29) |

**The claim holds — `ci.yml` has not been green for 83 days.** The 83 → 82 move
is one in-flight run entering the window, not an improvement.

**Attribution corrected.** This number is **D167's *rationale***, not D167. D167
is the docs-deploy **trigger** decision. The register carries no row for the
streak itself; it is TASK-R1-O4's finding. Nothing is contradicted.

## 10. The remote is 11 commits ahead, and three of them are CI fixes

`gh api …/compare/4e4e46f...main` → `status: ahead, ahead_by: 11,
behind_by: 0`. **None of the 11 touches `.github/`**, so all four lane files are
byte-identical to `589be13`. Three are CI repairs pushed 2026-09-24 between
12:44 and 12:59 UTC: `e528fd9` *"make main's typecheck, unit-test, boundary and
build steps pass on a clean checkout"*, `8b46ab4` *"clear the layer the first
four failures hid — peers, doc gates, releases snapshot"*, `bc02789` *"generate
the DTCG export with the tokens, and make component-meta OS-independent"*.

Run **`36004699830`** (head `3147432`) is the first `ci.yml` run after them:

| Job | Then (2026-09-20, R1-O4 §6) | Now (`3147432`) |
|---|---|---|
| Typecheck · Lint | red | **success** |
| **Validate (boundaries + tokens)** | red — `tooling` → `@dzup-ui/contracts` | **success** |
| **Unit Tests (Node 20.19.0)** | red — config load, nothing built (**D161**) | **red for a different reason: `globSync`, 1 failed / 553 passed.** D161 discharged; **D160 confirmed on CI** |
| Unit Tests (Node 22.13.0) | — | cancelled by fail-fast — **the upper half of the range is still unmeasured** |
| **validate-min-runtime** | red — generator drift misread as the floor (F2) | **red at `validate:capability-matrix` (stale)** — a third, different non-floor cause |
| Storybook Build · E2E · Landing E2E · Storybook Tests | red | red, pre-existing |
| Build (library mode) · Test Coverage | — | skipped (dependency of a failed job) |
| workflow conclusion | failure | **cancelled** |

## 11. What the owner dispatches, and in what order

`gh` is authenticated as `eisic1` with scopes `gist, read:org, repo, workflow`
(verified at `4e4e46f`). **Dispatch at a named sha, never `main`** — and record
whether that sha carries the 269 working-tree paths, because §3.1 makes that
difference decide what a red means.

```bash
# 0. READ FIRST — the run that shows three CI jobs green for the first time.
gh run view 36004699830 --json conclusion,jobs \
  -q '.conclusion, (.jobs[] | "\(.name)\t\(.conclusion)")'

# 1. The declared peer floor. Dispatch TODAY: the evidence is perishable (§8).
#    Expect exit 1 at `typecheck`. That is the answer, not a lane defect.   ~10 min
gh workflow run min-peer.yml --ref <sha>
#    …narrowed, while triaging:
gh workflow run min-peer.yml --ref <sha> -f commands='vitest run packages/core'

# 2. Vue 3.6 RC + BOTH Nuxt majors — one dispatch, three jobs.               ~8 min
#    Skip if Monday 2026-09-28 04:00 UTC is soon enough; the schedule now runs
#    the FIXED lane for the first time, at no cost.
gh workflow run vue-next.yml --ref <sha>
#    …to triage the current RC rather than the pinned one (D-S2O4-1):
gh workflow run vue-next.yml --ref <sha> -f version=3.6.0-rc.9

# 3. NOT YET: validate-min-runtime.yml, and NOT ci.yml. §8.

# Collect — never the workflow conclusion, always --json jobs:
gh run list --limit 10
gh run view <run-id> --json jobs -q '.jobs[] | "\(.name)\t\(.conclusion)"'
gh run view <run-id> --log-failed > <run-id>-failed.log
```

**Read the run summary, not the tick, for `vue-next.yml`.** Every job in it is
`continue-on-error: true`; R1-O4 added an `if: always()` step per job that writes
the true outcome into `$GITHUB_STEP_SUMMARY`. The tick has read `success` over
three fully-failed runs.

**Never run `validate-min-runtime`'s step list locally in a dirty tree.** Step 4
is `git checkout -- .`.

## 12. Decisions this evidence raises

Numbered in this task's own namespace so no existing register row moves.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **`D-S2O4-5`** 🔴 | **The published `vue` peer range is false.** `@dzup-ui/core`, `contracts` and `compat` publish `vue: ^3.5.0`; the library does not typecheck on 3.5.0–3.5.12 (§4). The root manifest already depends on `^3.5.13` | (a) narrow all three to **`vue: ^3.5.13`** with a changeset · (b) change every `Dz*Emits` from `interface` to `type` so it gains an implicit index signature · (c) leave the range and document the gap | **(a).** It is the version the repository already develops against, the boundary is measured to the patch, and it is *free today* — nothing is published, so narrowing costs a changeset now and a breaking 0.x `minor` after first publication. **This is an A4-D1 precondition.** (b) is ~90 interface→type edits across every family for the benefit of supporting 13 Vue patches nobody asked for, and it would need the same lane to prove it. (c) publishes a promise this repository has measured to be false |
| **`D-S2O4-6`** 🔴 | **The published `reka-ui` peer range is false too.** `@dzup-ui/core` publishes `reka-ui: ^2.0.0`; at 2.0.0 the combobox option list does not open and a dialog scroll lock is not released — 31 of 32 suite failures (§4.2). The tree resolves 2.9.2 | (a) **bisect the boundary** (2.0.0 → 2.9.2, ~4 probes of `min-peer` with a `reka-ui` pin) and narrow the range to it, with a changeset · (b) narrow straight to **`^2.9.0`**, the range the tree has actually exercised · (c) leave it | **(a), with (b) as the safe fallback if the bisect is not worth the minutes.** A bisect is the honest answer and the lane already does the pinning; (b) over-narrows and may exclude versions that work, which costs consumers nothing today (nothing is published) and is easy to widen later with evidence. **(c) is not available**: `useDialog` leaking a scroll lock is a defect a consumer meets on the first modal. **Same changeset as `D-S2O4-5`** |
| **`D-S2O4-1`** 🟢 | **The `vue-next` pin is three RCs stale.** `3.6.0-rc.6` pinned, `rc` dist-tag is `3.6.0-rc.9`. It still resolves, so drift, not breakage — and **not silently repinned** | (a) repin to `3.6.0-rc.9` · (b) make the lane resolve the `rc` **dist-tag** at run time · (c) leave it and use `-f version=` | **(a) now, (b) at the next toolchain window.** A pin ages by itself and a stale pin gives a confident answer about a version nobody is on — which the lane's own header calls worse than no answer. (b) makes the lane non-reproducible run to run, so it needs the summary to record the version actually resolved: a runner change, not a data change |
| **`D-S2O4-2`** 🟠 | **`nuxt-majors` cannot test a current Nuxt while the floor is 20.19.0.** `nuxt@4.4.6`+ needs ≥22.12, `4.5.2` needs ≥22.19; the matrix pins 4.4.5 because it is the newest 4.x installable at the floor | (a) fold into D160/D176 as a second, independent argument for `>=22.13.0` · (b) add a `4.5.x` leg with its **own** `node-version` · (c) accept testing two minors behind `latest` | **(a), with (b) as the interim.** (a) is the honest framing: the floor now costs coverage, not tidiness. (b) is three lines and the only way the lane says anything about the Nuxt a consumer installs today — but it changes two variables, so it must be a separate matrix entry with its own `node-version`, never a silent bump of the shared one |
| **`D-S2O4-3`** 🟠 | **`validate-min-runtime` reports non-floor failures as floor failures** — three different ones on three refs (§3.1), none Node-dependent | (a) settle #3/#17 and commit the fresh capability matrix, so the step can reach a verdict · (b) split the `Validators` step so a Node-independent failure is named as such · (c) leave it | **(a), with (b) as cheap insurance.** (a) is the real fix and `main` has already done half of it. (b) is worth doing anyway: this lane has now mis-attributed a failure to Node **three times** (R1-O4's DEFECT 1, link 51, the capability matrix), and a lane that cannot distinguish *"the floor is broken"* from *"a validator is red"* is not a floor gate |
| **`D-S2O4-4`** 🟢 | **`min-peer.yml` has `workflow_call` and is not wired into `ci.yml`.** Promoting it is one line; its own header says to promote after the first green dispatch | (a) wire it after its first green run · (b) wire it now · (c) leave it dispatch-only, run before releases | **(a).** (b) gates every merge on an unknown, which the file explicitly refuses. (c) is how the visual lane became unowned — a lane nobody is required to run is a lane nobody runs. Pair with **N5-03-D6 / D164**, which is the same question one file over |

---

*Nothing was dispatched, committed, pushed, published or deployed. The install
state was not changed: `yarn.lock`'s sha256 is unchanged and the shared
`node_modules` still resolves `vue 3.5.31` / `reka-ui 2.9.2`. See the handoff §9
for the full proof.*
