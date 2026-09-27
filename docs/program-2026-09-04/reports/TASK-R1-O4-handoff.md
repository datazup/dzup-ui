# TASK-R1-O4 — CI dispatch of the never-run lanes, and a minimum-peer lane

> Program: [2026-09-04](../README.md) · Task file: [`release-exit-tasks.md`](../release-exit-tasks.md)
> **Baseline observed: `main` @ `527dbd1` (`527dbd150036b5f07bd69e672825ff14ec3a592d`), worktree carrying
> 231 uncommitted paths — 221 inherited from TASK-R1-O1/O2/O3 and 10 added here (7 new files, 4 newly
> modified, 3 of the 7 modified having already been dirty). Every unrelated path preserved untouched.**
> The README's stated baseline `99b963a` is four commits stale. **Every number below binds to `527dbd1` + that tree.**
> Nothing was committed, pushed, tagged, published, deployed **or dispatched** — this task is `[!owner dispatches]`
> and stops at the request.
>
> Deliverable for the owner: [`ci-dispatch-request-2026-09.md`](./ci-dispatch-request-2026-09.md).
>
> Predecessors cited rather than re-derived: [`TASK-R1-O1-handoff.md`](./TASK-R1-O1-handoff.md) (green tree,
> 48 links, D145–D148), [`TASK-R1-O2-handoff.md`](./TASK-R1-O2-handoff.md) (packed-tarball import gate, D149–D153),
> [`TASK-R1-O3-handoff.md`](./TASK-R1-O3-handoff.md) (release evidence, D154–D159).

---

## 0. `<done_check>` at `527dbd1` — 1 of 4 passed, and the one that passed was answering a different question

| # | Check as written | Result | Verdict |
|---|---|---|---|
| 1 | `ls .github/workflows/ \| grep -E 'validate-min-runtime\|nuxt-majors\|vue-next'` → "all three present; each has `workflow_dispatch:`" | grep exit **0**, one match: `vue-next.yml` | **MISLEADING PASS.** A grep that exits 0 on 1 of 3 patterns. Only `vue-next` is a workflow. `nuxt-majors` is a **job inside** `vue-next.yml:117`; `validate-min-runtime` was a **job inside `ci.yml`**, and `ci.yml` had **no `workflow_dispatch` at all**. A job cannot carry `workflow_dispatch`, so one of the three was structurally undispatchable. |
| 2 | `ls .github/workflows/ \| grep -i 'min-peer'` | exit **1** | FAIL — correct, nothing existed. |
| 3 | `ls docs/program-2026-09-04/reports/ \| grep -i 'ci-dispatch'` | exit **1** | FAIL — correct. |
| 4 | `grep -rn 'validate-min-runtime' apps/docs/evidence/*.md \| head -1` shows a recorded run | **0 matches across all 6 evidence pages**, and `head` would have masked the exit code anyway | FAIL — correct, but see §7: the pages are **generated** and have no CI-evidence input at all, so this check can never pass without building one first. |

---

## 1. The `_Gap:_` preamble is false in its central claim, and the truth is worse

> _"three CI workflows exist and have never run"_

**They are not three workflows, and they have all run.** `gh` is authenticated
(`eisic1`, scopes include `workflow`), so this was checked rather than assumed.

| Claim | Verdict at `527dbd1` |
|---|---|
| "three CI workflows exist" | **FALSE.** Two are jobs. `validate-min-runtime` was `ci.yml:112`; `nuxt-majors` is `vue-next.yml:117`. One workflow file, one job in it, one job in a different file. |
| "…and have never run" | **FALSE.** `vue-next.yml` has run **three times on schedule** — runs `34102568752` (09-07), `34828022212` (09-14), `35583557452` (09-21), all reporting **`success`**. `validate-min-runtime` ran on **every push** as part of `ci.yml`. |
| "`vue-next` … 9,181/9,183 locally" | True locally (N5-03) and **never once reproduced on CI** — see F1. |
| "only *current* versions are exercised (R-058c)" | **TRUE**, and sharper than recorded: the root manifest depends on `vue@^3.5.13` while `@dzup-ui/core` publishes the peer `vue@^3.5.0`, so **3.5.0–3.5.12 have never been installed here**. `reka-ui` resolves 2.9.2 against a published floor of `2.0.0`. |
| ADR-18's floor is a claim nothing has run on (C10) | **The lane ran. It failed. Nobody looked.** And the reason it failed is not the one anybody assumed — F2. |

### The finding that reframes the task

**All three lanes were failing, and all three were reporting success.** The
three scheduled `vue-next` runs are green ticks over three failed jobs, because
every job in that file is `continue-on-error: true`. `validate-min-runtime`'s
red was inside a `ci.yml` run that was red for six other reasons.

And underneath: **`ci.yml` has not been green since 2026-07-03.** Of the last
100 runs — **83 failure · 13 cancelled · 4 success**, every success in
June/early July. No handoff in this programme records that. Every "locally
qualified" claim in the programme is sitting on top of a CI that has been red
for eleven weeks.

---

## 2. Four defects found, each from a real CI log, each fixed

### F1 — `vue-next` pinned Vue to the **empty string**, for three consecutive weeks

`vue-next.yml` passes `DZUP_VUE_NEXT: ${{ inputs.version }}`. On a `schedule`
trigger there are no inputs, so that expands to `''` — not to nothing. The
runner read:

```js
const version = process.env.DZUP_VUE_NEXT ?? config.resolutions.vue
```

`??` does not fall through on `''`. Every scheduled run therefore wrote
`"vue": ""` (and five `@vue/*` entries likewise) into `resolutions`, yarn
resolved the default range, and the log said so in a sentence with a hole in it:

```
· vue resolved to 3.5.43
  ! that is not . Something else in the tree pinned it; the result below
    is evidence about 3.5.43 and must be reported as such.
```

"that is not ." is the bug printing itself. And the lane **ran the suite
anyway**, on the version it exists to move away from.

**Fixed** by an exported, spec-driven `versionFor(config, envValue)` that trims
and treats empty as absent — and by making the mismatch **exit 2 (did not run)**
instead of a warning. *Proof:* `DZUP_VUE_NEXT="" node …/vue-next-lane.mjs --plan`
now prints `pinning 6 package(s) at 3.6.0-rc.6`.

### F2 — `validate-min-runtime` sabotaged its own validators, and the red was blamed on Node

Step 8 runs `yarn generate:exports:core`, which **rewrites
`packages/core/src/index.ts`** from `public-api.manifest.json`. That manifest has
drifted (TASK-R1-O3 **D158**: five composables dropped, two added). Step 9 then
runs `yarn validate:all`, whose third link is `lint`, over the file step 8 just
rewrote:

```
Generated packages/core/src/index.ts from packages/core/manifests/public-api.manifest.json
…
47:1  error  Expected "./composables/provider/index.ts" to come before "./i18n/index.ts"
             perfectionist/sort-exports
##[error]Process completed with exit code 1.
```

(CI run `35511985882`, 2026-09-20, step 9.) The job's own question — *do the
generators start at the floor?* — was answered **yes** at step 8. What failed
was a different question the job accidentally asked itself. **Every historical
red of this job is unreadable as floor evidence.**

**Fixed** by a `git checkout -- .` step between the generators and the
validators, with the reasoning in the file. The drift itself stays gated:
`validate:ownership` and `validate:exports` are links 28 and 30 of the chain and
compare committed artifacts against a fresh generation.

### F3 — three lanes could not load their own test config, because nothing builds first

`dist/` is gitignored (ADR-12) and **no published package declares a `prepack`
hook**. The root vitest config resolves four `@dzup-ui/tokens` subpaths to built
artifacts with no source equivalent — measured, not assumed:

```
DIST   @dzup-ui/tokens/css                -> ./packages/tokens/dist/tokens.css
DIST   @dzup-ui/tokens/css/high-contrast  -> ./packages/tokens/dist/tokens.high-contrast.css
DIST   @dzup-ui/tokens/tailwind           -> ./packages/tokens/dist/tailwind-theme.js
DIST   @dzup-ui/tokens/dtcg               -> ./packages/tokens/dist/tokens.dtcg.json
```

So on a clean CI checkout:

- **`vue-next` · suite** — `failed to load config from vitest.config.ts` →
  `createDzupResolution: @dzup-ui/tokens/css points at ./dist/tokens.css …`.
  **Zero tests ran, on all three scheduled runs.** The "9,181/9,183 under Vue
  3.6" figure has never been reproduced anywhere but a developer's machine.
- **`vue-next` · nuxt-majors** — `yarn pack` archived tarballs with no build
  output, the fixtures installed and built cleanly, and every assertion came
  back `expected '' to contain 'data-testid="core-button"'`. **Six red fixtures
  on both majors, identically, saying nothing at all about Nuxt.**
- **`ci.yml` · test** — same error on `@dzup-ui/tokens/dtcg`, at config load,
  on both matrix legs.

**Scoped honestly:** of `ci.yml`'s 12 jobs, **five have no build step at all**
(`typecheck`, `lint`, `test`, `e2e`, `coverage`) and three of those five load a
vite/vitest/playwright config (`test`, `e2e`, `coverage`). Only **`test`** was
*verified* to fail this way, from its log. The other red jobs fail for their own
separate reasons (§6) — I am not attributing them to F3.

**Fixed in the lanes this task owns:** `yarn workspace @dzup-ui/tokens build`
before the suite (only the tokens workspace — those four specifiers are the
entire dist surface the suite touches), `--build` on the fixture pack step (the
flag `pack-fixtures.mjs` already documents), and `yarn build` moved *before*
`validate:all` in the min-runtime lane. **Not fixed in `ci.yml`'s other six
jobs** — outside this task, routed as **D161**.

### F4 — a green tick over three failed jobs

`continue-on-error: true` on every job in `vue-next.yml` is the right call for an
unreleased Vue (the file argues it well), and it also means the Actions list
shows `success` whether the lane passed, failed or never started. Three weeks of
that went unnoticed.

**Fixed without changing what blocks:** each job now ends with an
`if: always()` step that writes `steps.<id>.outcome` — the
pre-`continue-on-error` result — into `$GITHUB_STEP_SUMMARY`, with a line saying
the tick is not the answer. The blocking behaviour is untouched; whether
`nuxt-majors` *should* block is **N5-03-D6**, still the owner's.

---

## 3. And a fifth finding, which answers criterion C10 without a dispatch

**The declared Node floor is false on its 20.x branch, and it can be proven from
the source tree.**

`packages/tooling/src/token-checks/landing-token-fallbacks.spec.ts:49`:

```ts
import { globSync, readFileSync } from 'node:fs'
```

`fs.globSync` is `@since v22.0.0` (`node_modules/@types/node/fs.d.ts:4442`).
`engines.node` is `^20.19.0 || >=22.13.0`; `.nvmrc` is `20.19.0`. So `yarn test`
**cannot pass** on the lower half of the declared range, and CI has already said
so: `Release` run `35511985926` (2026-09-20, `node-version: '20.19.0'`) fails
with `TypeError: globSync is not a function`.

**Not fixed here, deliberately.** This task's `<stop_conditions>` name exactly
this case: *"when a lane fails on the declared floor (ADR-18 amendment input for
TASK-R0-O2, not a fix here)"*. Routed as **D160**.

This machine runs Node 24.14.1 and no version manager is installed (`nvm`,
`fnm`, `volta` all absent), so **no local run on 20.19.0 was possible and none
is claimed.** The floor evidence above is a static fact plus a CI log, which is
stronger than a local run would have been anyway.

---

## 4. Implemented files + API effect

**4 new files, 5 modified.** No component source touched. **No public runtime
API changed** — everything new is a workflow, a private `@dzup-ui/tooling`
script, or a `package.json` script.

### 4a. New

| File | What it is |
|---|---|
| `.github/workflows/validate-min-runtime.yml` | The floor lane, extracted from `ci.yml` into a **reusable** workflow (`workflow_call` + `workflow_dispatch`). `ci.yml` calls it, so the blocking graph is byte-for-byte the same set of steps on the same trigger; what is new is that the floor is answerable on demand in ~8 min instead of by pushing a commit and waiting ~15. Carries the F2 and F3 fixes. |
| `.github/workflows/min-peer.yml` | The minimum-peer lane. `workflow_dispatch` + `workflow_call`, **not** chained into `ci.yml` (an unrun lane in the blocking graph gates every merge on an unknown) and **not** scheduled (its inputs only move when somebody edits a `peerDependencies` range). Promoting it is one line in `ci.yml`, written in the file. |
| `packages/tooling/scripts/min-peer-lane.mjs` | The runner. Derives each floor **from `peerDependencies` at run time**, pins it with `resolutions` plus Vue's lockstep set, installs, **asserts the resolved version equals the floor**, runs the commands, restores `package.json` + `yarn.lock` and verifies the restore. Exit 0/1/2/3 with the same meanings as the Vue lane. |
| `packages/tooling/scripts/min-peer-lane.json` | The lane as data: which peers, which workspaces declare them, the lockstep set, the commands — and three `//` entries recording what is deliberately *not* pinned (`vue-component-meta`, `vue-tsc`, `nuxt`) and why. **No version literal anywhere**: a number here would be a second declaration of the floor, and two declarations drift. |
| `packages/tooling/scripts/min-peer-lane.spec.ts` | **24 tests** over the pure half. |

### 4b. Modified

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | `workflow_dispatch` added to `on:` — CI had none, so it could only be re-asked by pushing. The `validate-min-runtime` job body replaced by `uses: ./.github/workflows/validate-min-runtime.yml`. Nothing else touched; R1-O2's `validate:published-imports --built` step preserved. |
| `.github/workflows/vue-next.yml` | Tokens build before the suite (F3); `--build` on the fixture pack (F3); `if: always()` outcome-to-summary steps on both jobs (F4); exit-code comment updated for the new exit 2. |
| `packages/tooling/scripts/vue-next-lane.mjs` | `versionFor()` extracted and exported (F1); a resolved-version mismatch is now **exit 2**, not a warning that runs the suite anyway. |
| `packages/tooling/scripts/vue-next-lane.spec.ts` | **+4 tests** pinning F1, including the exact `''` case the workflow produces. |
| `package.json` | `test:min-peer`, `test:min-peer:plan`, with a `//` rationale. **`validate:all` unchanged at 48 links** — the lane needs its own full install and cannot be a chain link. |
| `packages/tooling/README.md` | Rows for `test:vue-next` (previously documented in **no** README) and `test:min-peer`. |

---

## 5. Focused validation

Every command run unpiped, exit read directly (`cmd > log 2>&1; echo "exit $?"`).
`npx` is unusable here; invocations are `yarn <script>` or by module path.

| Command | Exit | What it produced |
|---|---|---|
| workflow **schema** validation — all 8 files against SchemaStore's `github-workflow.json`, via the repo's own `ajv` + `js-yaml` | **0** | 8/8 OK, including the two new files |
| seeded-defect calibration of that validator | — | **6 of 7** seeded defects rejected (`runs-on` non-string · unknown job key · a step with both `uses` and `run` · unknown trigger · job name with a space · `workflow_call` input without `type`). The one it misses — a job with neither `steps` nor `uses` — is stated rather than hidden. It validates **structure, not expressions**: `${{ … }}` syntax, a `uses:` path that exists, and action versions are out of its reach and only a dispatch can settle them. |
| `yarn validate:engines` | **0** | `floor "^20.19.0 \|\| >=22.13.0" is declared consistently and every gate dependency satisfies it`. The validator **enumerates every `.github/workflows/*.yml`** (`validate-engines.ts:94`), so it ran over the two new files and found no conflicting pin — both use `node-version-file: .nvmrc` rather than a literal, which is the one-number rule the validator exists to enforce, taken one step further. Note the gap it leaves: a workflow using `node-version-file` contributes **no** entry to this check, so it is trusted rather than verified. Acceptable, because `.nvmrc` *is* the number the check compares everything else against. |
| `yarn test packages/nuxt` | **0** | 3 files, **58 tests** |
| `yarn validate:docs-pages` | **0** | 144 pages + 6 evidence pages fresh; `AT cells executed 0/534` unchanged |
| `yarn validate:readme-facts` | **0** | 6 generated regions, after the README edit |
| `yarn validate:doc-snippets` | **0** | |
| `yarn validate:adr-references` | **0** | 17 cited · 3 documented · 14 registry-only (ceiling 14) — ADR-12/18 citations in the new workflows are within it |
| `node …/vitest.mjs run …/min-peer-lane.spec.ts …/vue-next-lane.spec.ts` | **0** | **37 tests** (24 new + 13, of which 4 new) |
| `node …/eslint.js --max-warnings 0` over all 4 touched scripts | **0** | (3 errors on first pass, fixed: a simplifiable character class, a string concatenation, an import order) |
| `node …/min-peer-lane.mjs --plan` | **0** | derived `vue 3.5.0` (from three workspaces) and `reka-ui 2.0.0`; 7 packages pinned; **`package.json` and `yarn.lock` provably unwritten** |
| `DZUP_VUE_NEXT="" node …/vue-next-lane.mjs --plan` | **0** | `pinning 6 package(s) at 3.6.0-rc.6` — F1 proven against the exact condition CI produces |
| `yarn validate:all` | **0** | all **48** links end to end, after every edit above |

### The min-peer floor, proven locally as far as a local machine can

The task asks for a scratch-consumer proof that the lane resolves the floor.
Done, in the session scratchpad, never in the repository:

| Step | Result |
|---|---|
| `npm install vue@3.5.0 reka-ui@2.0.0` in a fresh consumer | exit **0**, no `--legacy-peer-deps`. `vue 3.5.0 · reka-ui 2.0.0 · @vue/runtime-core 3.5.0 · @vue/shared 3.5.0` — the lockstep set the lane pins comes out in lockstep on its own. |
| `yarn pack` of `contracts` + `tokens` + `core`, installed into that consumer | exit **0**. `@dzup-ui/core 0.2.0` alongside the floor pair, **npm's own peer resolution satisfied**, and neither version lifted. |
| SSR render of 8 components from the packed barrel at the floor | exit **0**. `DzButton · DzCard · DzBadge · DzAlert · DzInput · DzAvatar · DzSpinner · DzTooltip` all render; `DzTooltip` is `reka-ui`-backed, so `reka-ui@2.0.0` is exercised and not merely installed. 437 exports on the packed barrel. |
| transitive-constraint check (a `<stop_conditions>` case) | **`reka-ui` is declared in exactly one place** (`packages/core/package.json`, as both dev and peer). Nothing else in the tree constrains it, so the resolver has nothing to fight. The stop condition does **not** fire — but the definitive answer is the dispatch, not this. |

**What this does not prove:** that the suite passes at the floor. Nothing has
ever run it, and no claim is made. That is the dispatch.

**Incidental, and it corroborates TASK-R1-O6:** the consumer install printed
`npm warn deprecated lucide-vue-next@0.477.0: Package deprecated. Please use
@lucide/vue instead.` The migration on R1-O6's list is no longer housekeeping —
every consumer install of `@dzup-ui/core` prints that warning today.

---

## 6. Aggregate qualification

**Locally qualified only.** The ladder reads *specified → implemented →
focused-validated → aggregate-qualified → browser/AT-qualified → packaged →
released*. This task reaches the **fourth** rung and its whole purpose is the
rung nobody has reached: **nothing here has run on CI**, and the two new
workflows have never executed anywhere.

| Lane | Result | Read how |
|---|---|---|
| `yarn validate:all` | **exit 0**, all 48 links end to end | unpiped, after every edit |
| `yarn test packages/nuxt` | **exit 0** — 58 tests | unpiped |
| the two lane specs | **exit 0** — 37 tests | unpiped |
| `eslint --max-warnings 0` over every touched script | **exit 0** | unpiped |
| workflow schema, 8/8 | **exit 0** | with a 7-seed calibration of the validator itself |

**Still red — pre-existing, reported, not fixed:**

- **`ci.yml` has not been green since 2026-07-03** (83 failure / 13 cancelled /
  4 success in the last 100 runs). Seven jobs were red on 2026-09-20 run
  `35511985882`, and **each has its own cause** — read one by one from the log
  rather than attributed to a single theory:

  | Job | Cause at `527dbd1` |
  |---|---|
  | `test` (Node 22.13.0; the 20.19.0 leg was cancelled with it) | **config load** — `@dzup-ui/tokens/dtcg` missing, no build step (F3). **D161** |
  | `validate` | `validate:boundaries`: `packages/tooling/src/validators/i18n-packs.ts:62` imports `@dzup-ui/contracts` — *"Package `tooling` cannot import from `@dzup-ui/contracts`. Allowed: none"*. A boundary violation in committed source, **not** a build problem |
  | `validate-min-runtime` | F2 — the generator rewrote the barrel, lint rejected it |
  | `storybook` | **`Storybook build 25.00 MB EXCEEDS budget 25 MB`** — a size gate firing by 0.00 MB. Input for **TASK-R1-O5**, whose whole subject is size budgets |
  | `landing-e2e` | Playwright assertion failures (`expect(received).toBe(expected)`) |
  | `storybook-test`, `landing-perf`, `e2e` | **not determined** — `--log-failed` returns no error line for these three, and running them down is outside this task. Recorded as unknown rather than guessed |

  `build` and `coverage` were `skipped` (their `needs` failed), not red.
- **`Release` fails on every push**, at `yarn test` after a successful build,
  with three errors: a snapshot mismatch, `TypeError: globSync is not a
  function` (**D160**, the floor), and `Cannot read properties of undefined
  (reading 'component')`.
- **Every run warns** that `actions/checkout@v4`, `actions/setup-node@v4` and
  `actions/cache@v4` target Node 20 and are being forced onto Node 24
  (GitHub's 2025-09-19 deprecation). **D163.**
- `apps/landing`'s `AnimationsPage.v2.spec.ts` flake (R1-O3 **D155**) was not
  encountered by anything this task ran.
- 441 capability cells `unrun`, 37 `stale`, AT matrix **0 of 534** — unchanged.

**Not claimed anywhere:** that any lane here has run on CI; that the floor was
executed locally; that the min-peer suite passes; that any evidence page records
a run.

---

## 7. What was NOT done, and why

**Step 4 of the task — "after the owner dispatches: triage each result, fix
workflow bugs, record the runs, regenerate the evidence pages" — is out of
reach today.** It begins after an owner action this task is forbidden to take.
The recording scaffold is ready in
[`ci-dispatch-request-2026-09.md`](./ci-dispatch-request-2026-09.md) §3, with the
triage rule written down so the rows mean the same thing to whoever fills them.

**The evidence pages were deliberately not touched.** `apps/docs/evidence/*.md`
are generated from `packages/core/docs/component-meta.json` and the matrices;
`<repo_conventions>` forbids hand-editing a generated page, and there is **no
CI-evidence input to the generator at all** — `grep -rn 'validate-min-runtime'
apps/docs/evidence/*.md` returns nothing across all six pages. Building that
input before a single run exists would be a schema with nothing in it and a
"never dispatched" string that is *already* out of date the moment the owner
dispatches. Proposed as **D162**.

Also not done, each with a reason rather than an omission: the `actions/*@v5`
bump (**D163**), the missing build step in `ci.yml`'s other six jobs
(**D161**), and the `globSync` floor break (**D160**, a `<stop_conditions>`
case).

---

## 8. Ratchet movements (old → new, bound to `527dbd1`)

| Ratchet | Before | After (working tree) |
|---|---|---|
| Workflow files | 6 | **8** |
| Dispatchable workflows | **3 of 6** (`landing-e2e-snapshots`, `publish-prerelease`, `vue-next`) | **6 of 8** (+ `ci`, `min-peer`, `validate-min-runtime`) |
| Of the three lanes C10/R-058c name, how many are dispatchable | **2 of 3** — `validate-min-runtime` was a job in a workflow with no dispatch trigger at all | **3 of 3**, plus the new fourth |
| Package-matrix rows with a lane | current versions only | **+ the minimum declared peer row** (08-11 doc 08; R-058c closed as *built*, not yet as *run*) |
| Lanes that pin a version and **assert** it resolved | **0** | **2** (`vue-next` now exits 2 on a mismatch; `min-peer` was built that way) |
| Lanes that could silently test the wrong version | **1** (`vue-next`, and it did, three runs running) | **0** |
| Lanes whose true outcome is visible without opening a log | 0 of 3 | **3 of 3** (`$GITHUB_STEP_SUMMARY`, `if: always()`) |
| Lanes this task owns that build before loading a vitest/vite config | **0 of 3** (`vue-next` suite · `nuxt-majors` · min-runtime's `validate:all`) | **3 of 3**, plus `min-peer` built that way |
| `ci.yml` jobs that load a test config with no build step | **3** (`test`, `e2e`, `coverage`) + `validate` half-built | unchanged — **D161**, outside this task |
| Floor lanes that sabotage their own validators | **1** | **0** |
| Tooling specs | — | **+28** (24 new + 4 added to `vue-next-lane.spec.ts`), all passing |
| Peer floors that are *derived* rather than written down | 0 | **2** (`vue`, `reka-ui` — a literal would be a second declaration) |
| `validate:all` links | 48 | **48** — unchanged, deliberately |
| 1.0 criterion **C10** ("a floor nothing has run on is not a floor") | unmeasured | **measured, and the answer is no** — `fs.globSync` is `@since v22.0.0` and the floor's 20.x branch cannot run `yarn test` (**D160**) |

The ratchet that moved the "wrong" way: **CI jobs known to be red, with a named
cause: 0 → 7** (four causes identified, three recorded as *not determined*).
That is the measurement starting, not CI degrading — CI has been red since
2026-07-03 and no handoff in this programme had said so.

---

## 9. Owner decisions raised

Numbered from TASK-R1-O3's **D159**.

### D160 — the declared Node floor is false on its 20.x branch

`landing-token-fallbacks.spec.ts:49` imports `globSync` from `node:fs`;
`fs.globSync` is `@since v22.0.0`; `engines.node` says `^20.19.0 || >=22.13.0`
and `.nvmrc` says `20.19.0`. CI already recorded the `TypeError`. This is 1.0
criterion **C10**, and an ADR-18 amendment either way.

- **(a) Fix the spec — replace `node:fs`'s `globSync` with a Node-20-safe walk (or the `glob` package `packages/codemods` already depends on), keep the floor. Recommended.** It is one import in one spec, the floor is a published promise, and `^20.19.0` is what every consumer's `engines` check will read.
- (b) Raise the floor to `^22.13.0`, drop Node 20, amend ADR-18 and `.nvmrc`. Honest, larger, and it collides with the Node-20 question already open as N5-04 D3 / TASK-R1-O6 item 3 — Nuxt ≥4.4.6 has already dropped Node 20, so this may be where it ends anyway.
- (c) Leave it and let `validate-min-runtime` stay red. **Rejected**: that is precisely the state C10 exists to end.

**Whichever is chosen, a sweep is owed, not just this one fix.** One `@since v22`
API reached the tree unnoticed because nothing runs on the floor; there may be
others, and they will only surface one dispatch at a time.

### D161 — three `ci.yml` jobs load a test config with nothing built

`test`, `e2e` and `coverage` have **no build step at all**, and
`@dzup-ui/tokens/{css,css/high-contrast,tailwind,dtcg}` do not exist on a clean
checkout (ADR-12). `test` is *proven* to fail at config load; `e2e` and
`coverage` are the same shape and were not separately confirmed. A fourth job is
half-covered: `validate` runs `yarn tokens:generate`, which is only
`src/generate.ts` — it produces `tokens.css` and `tokens.high-contrast.css` but
**not** `tokens.dtcg.json` (that is `generate:dtcg`) and **not**
`tailwind-theme.js` (that is `vite build`), so two of the four specifiers are
still missing there.

- **(a) Add `yarn workspace @dzup-ui/tokens build` to `test`, `e2e` and `coverage`, and replace `yarn tokens:generate` with it in `validate` — recommended.** Four lines, the same fix this task applied to the two lanes it owns, ~15 s per job. It is the difference between a CI that has been red since July and one that can confirm R1-O1's green tree. It does **not** fix the other red jobs, which have their own causes (§6).
- (b) Give `@dzup-ui/tokens` a `prepare`/`postinstall` that generates its assets, so every install produces them. Fewer edits, but it puts a build inside `yarn install` for every contributor and every unrelated job.
- (c) Make `createDzupResolution` fall back to a source equivalent for generated assets. **Rejected**: there is no source equivalent — `tokens.css` and `tokens.dtcg.json` *are* generated — and a silent fallback would hide a genuinely missing build.

Whoever takes this should re-read TASK-R1-O1: its green tree is real locally and
**unconfirmed on CI**, and (a) is what would confirm it.

### D162 — how a CI run becomes evidence

The `<done_check>` expects `apps/docs/evidence/*.md` to show a recorded
`validate-min-runtime` run. The pages are generated and there is no input for
one: no file anywhere in the repository holds a run id, and 6 of 6 evidence
pages mention CI nowhere.

- **(a) A `packages/core/evidence/ci-runs.json` — append-only, one record per dispatch (workflow · run id · ref · commit · conclusion · per-job result · date · log link) — read by the evidence-page generator and by the capability matrix's CI-backed cells. Recommended**, and it is the same shape the AT matrix already uses for append-only run records with a named operator.
- (b) Fold CI runs into the release bundle instead (`docs/qa/release/<date>-<sha>/`), where `report.md` §3 already has a place for them. Cheaper, but a bundle is per-release and a lane run is per-dispatch.
- (c) Leave the evidence pages silent about CI. **Rejected**: C10's whole claim is that a run happened, and a claim with no record is the thing this programme keeps finding.

Note for whoever builds it: `gh run view <id> --json jobs` is the honest source,
**not** the run conclusion — `continue-on-error` makes the conclusion `success`
over failed jobs, which is how three weeks went by.

### D163 — `actions/*@v4` are being force-migrated off Node 20

Every run since GitHub's 2025-09-19 deprecation warns:
`actions/checkout@v4, actions/setup-node@v4, actions/cache@v4 target Node.js 20
but are being forced to run on Node.js 24`. Today it is a warning.

- **(a) Bump all three to `@v5` across the 8 workflow files and dispatch `ci.yml` to verify — recommended, but only after D161**, so the verification run is readable rather than red for six other reasons.
- (b) Wait for a hard failure. It is a warning today, and the runner is already forcing Node 24, so the observable behaviour has *already* changed — waiting buys nothing but a surprise.
- (c) Pin `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true`. **Rejected**: the variable's own name is the argument against it.

This task did not make the bump: six files, unverifiable without a dispatch, and
an unverified edit on the way past is how the F1/F2/F3 defects got in.

### D164 — should `min-peer` and `nuxt-majors` block?

`min-peer.yml` is wired with `workflow_call` but is **not** in `ci.yml`, because
adding an unrun lane to the blocking graph gates every merge on an unknown. It
is not advisory *in meaning* — 3.5.0 and 2.0.0 are released versions this
repository publishes a promise about. `nuxt-majors` is the same shape and is
already open as **N5-03-D6**.

- **(a) Dispatch both; if green, promote `min-peer` into `ci.yml` (one line) and delete `nuxt-majors`'s `continue-on-error`. Recommended**, and it is the natural close-out of this packet's step 4.
- (b) Keep both out of the blocking graph and dispatch before each release. Cheaper per merge; relies on somebody remembering.
- (c) Promote `min-peer` only. Defensible — a peer range is a published promise and a Nuxt fixture is a consumer scenario — but it leaves N5-03-D6 open for a third cycle.

---

## 10. Ranked next packet

1. **Commit and push, then dispatch the five lanes** in
   [`ci-dispatch-request-2026-09.md`](./ci-dispatch-request-2026-09.md) §2. Every
   expectation in this handoff is a prediction until then, and three of the five
   lanes have literally never produced a readable result.
2. **D161** — four lines that would let `yarn test` start on CI for the first
   time since 2026-07-03, and let R1-O1's green tree be confirmed rather than
   asserted. Highest value per character in this document. It will **not** make
   CI green on its own: §6's table lists four other independent causes, three of
   which are still undiagnosed.
3. **D160** — the floor. One import, and it is 1.0 criterion C10.
4. **Step 4 of this task**: triage the runs, fill §3's table, and build **D162**'s
   `ci-runs.json` so the evidence pages can stop being silent about CI.
5. **D164 / N5-03-D6** — promote what turns out green; a lane that never blocks
   is a lane that eventually lies.
6. **D163** — the `@v5` bump, after (2) so its verification run is readable.
7. **TASK-R1-O6** — peer hygiene, now with two new inputs: `lucide-vue-next` is
   **deprecated on the registry** (every consumer install says so), and the Node-20
   question is forced by D160 rather than optional.
