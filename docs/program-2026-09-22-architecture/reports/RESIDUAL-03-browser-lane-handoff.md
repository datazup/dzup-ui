# RESIDUAL-03 — the browser lane (`D-S5O2-1`)

> Repository `ui/dzup-ui`, HEAD **`4e4e46f`**, worktree dirty by design (297 paths
> at start). No commit, push, CI dispatch, publish, `yarn install` or baseline
> capture was performed. Written incrementally, phase by phase, so a stall cannot
> lose the work.

**Status: COMPLETE.** `D-S5O2-1` **closed as not-a-defect** — the lane was never
broken; the probe was. Fixed (a config guard that refuses the fatal invocation in
~1 s instead of hanging for 415 s), gated (`validate:browser-lane`, **link 61** of a
**measured 61-link** chain), and the lane's evidence recovered: **170 files, 1,462
tests, 1,458 passed, 4 failed, 95.86 s in real chromium — 0 of the 4 are component
defects.** CI has been gating the lane on `ubuntu-latest` all along, so the "silently
unrun" half of the decision is falsified too. Two decisions raised
(`D-RES03-1`, `D-RES03-2`), no ratchet moved, tree delta exactly 4 files.

## 0. What this packet was handed

`D-S5O2-1` 🔴, raised by TASK-S5-O2 slice 3: the repository's only configured
browser-mode lane (`yarn storybook:test` → `apps/storybook`, `--project=storybook`)
starts a browser, connects, and then dies **before collection**
(`collect 0ms`, ~415 s wall, `Browser connection was closed while running tests`).
S5-O2 proved by independent measurement that browser mode *itself* works in this
checkout (153 specs, 2,058/2,071 passing in real chromium, 22.3 s vs jsdom 60.3 s),
so the question is narrowly **why the repo's own configured lane dies**.

Start state recorded before any probe ran:

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **297** |
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` |
| `sha256sum package.json` | `9c4d4883cf627a7c01c714aabcd27a5b6972e1ab433adacdf51401193adaa22c` |

<!-- PHASES APPENDED BELOW -->

---

## 1. Root cause — named from a controlled experiment, not a hypothesis

**`D-S5O2-1` is not a regression, and the lane is not broken. The *invocation* used
to probe it was.**

`apps/storybook/package.json` declares `"installConfig": { "hoistingLimits": "workspaces" }`.
That gives the app its **own** `node_modules`, physically separate from the root's:

| Resolved from | `vitest` | `@vitest/browser` | `vite` |
|---|---|---|---|
| `node_modules/vitest` (root) | 3.2.6 `./node_modules/vitest` | 3.2.6 `./node_modules/@vitest/browser` | **7.3.5** `./node_modules/vite` |
| `apps/storybook` (app-local) | 3.2.6 `./apps/storybook/node_modules/vitest` | 3.2.6 `./apps/storybook/node_modules/@vitest/browser` | **6.4.1** `./apps/storybook/node_modules/vite` |

TASK-S5-O2 §2.1 (and, on the evidence of its symptom, TASK-S3-O2 before it) drove
the lane with **`node ../../node_modules/vitest/vitest.mjs`** — the *root* binary —
from inside `apps/storybook`. That runs the Node-side orchestrator out of the root
install while the Vite server, the `storybookTest` plugin and the browser-side
client are all resolved relative to the config file, i.e. out of the **app-local**
install. Two `@vitest/browser` copies and two `vite` majors in one run: the page
loads, the client connects, the handshake does not agree, the socket closes
(`Browser connection was closed while running tests`), nothing is ever collected
(`collect 0ms`), and the Node side waits forever — which is why every observation
of this defect is a wall-clock number ending in a kill, never an exit code.

### The experiment — 4 runs, one variable at a time

Same config, same `--project=storybook`, same machine, same chromium.

| # | Binary | Target story | Result | Wall | Exit (file-captured) |
|---|---|---|---|---|---|
| 1 | **app-local** `node_modules/vitest/vitest.mjs` | `buttons/DzButton.stories.ts` | **1 file, 16 tests, 16 passed** | **19.41 s** | `EXIT=0` |
| 2 | **app-local** | `forms/AsyncOptionsStates.stories.ts` (the exact file S5-O2 used) | **1 file, 8 tests, 7 passed / 1 failed** | **9.99 s** | `EXIT=1` |
| 3 | **root** `../../node_modules/vitest/vitest.mjs` | `buttons/DzButton.stories.ts` | **dies at collection**, output stops after one `[vite] Re-optimizing dependencies` line | killed at cap | `SIGKILL` at the cap |
| 4 | `yarn storybook:test` (the shipped entry) | whole lane | see §2 | | |

Run 2 is the decisive one: it is S5-O2's own target file, and under the app-local
binary it **collects and runs in 9.99 s**. So neither the story file (untracked,
added by the uncommitted programme) nor the config is the cause. Run 1 vs run 3
isolates the single remaining variable — which binary is invoked — and it flips the
outcome both ways. Cause identified by elimination, n = 2 on the working side and
n = 2 on the failing side (S5-O2's run plus run 3).

### What changed around 2026-09-18 — nothing that touches this lane

`git log --since=2026-09-15` over `vitest.config.*`, `packages/*/vitest.config.*`,
`apps/storybook/**` and `package.json` returns four commits
(`a01965f` 09-17, `2d51eec` 09-18, `527dbd1` 09-20, `589be13` 09-22, plus the docs
commit `4e4e46f`). The only change to `apps/storybook/package.json` in that window
is **one line**: `check:size --max-mb 25` → `26`. Nothing touched
`apps/storybook/vitest.config.ts`, `.storybook/`, the provider block, the
`@vitest/browser` pin or `yarn.lock`. `apps/storybook/node_modules` is dated
**2026-09-18 13:26**, i.e. the install R5-O9's successful run used, and it has not
been reinstalled since.

**So the "regression since 2026-09-18" in `D-S5O2-1` does not exist.** R5-O9's
2026-09-18 run and this packet's runs agree; the two intervening failures were
measurement artifacts of the root-binary invocation. `D-S5O2-1`'s severity and its
"no gate says so" clause survive for a *different* reason, recorded in §4: the
lane's evidence is real and is still not read by anything.

### Why this trap is easy to fall into, and why it is worth a gate

The repository's own agent guidance says to invoke test runners as
`node node_modules/vitest/vitest.mjs` because `npx` fetches dependency-confusion
placeholders. That instruction is correct **for the root workspace** and is a trap
for `apps/storybook`, the one workspace with `hoistingLimits`. The failure is
silent (no error for ~7 minutes, then a socket message that blames the browser) and
it has now cost three separate agents a combined ~45 minutes and produced one
🔴 defect that was never a defect. Nothing in the repository warns about it.

---

## 2. The lane's real numbers — and the second thing `D-S5O2-1` got wrong

`yarn storybook:test` (the shipped entry point, whole lane, nothing filtered):

| | Measured 2026-09-25, `4e4e46f` + the dirty tree | 2026-09-18, R5-O9 §4a |
|---|---|---|
| Files | **170** | 169 |
| Tests | **1,462** | 1,453 |
| Passed | **1,458** | 1,448 |
| Failed | **4** | 5 |
| Wall | **103.80 s** | 117 s → 102 s |
| Exit (file-captured) | **`EXIT=1`** | 1 |

Phase breakdown: `transform 0ms, setup 428.88s, collect 362.84s, tests 343.99s,`
**`environment 0ms`**`, prepare 11780.55s` — aggregate worker time against 103.8 s
wall, i.e. heavily parallel, and `environment 0ms` is the browser lane's structural
advantage (S5-O2 measured jsdom spending 438.52 s of worker time there).

### It is not ungated. CI already gates it, on the authoritative platform.

`.github/workflows/ci.yml` job **`storybook-test`** ("Storybook Tests (play +
a11y)"), `runs-on: ubuntu-latest`, `needs: [typecheck]`, installs chromium with
`playwright install --with-deps chromium` and runs
`yarn workspace @dzup-ui/storybook test-storybook:ci` with `DZUP_APP_SPECIFIC=1`.
The step carries **no `continue-on-error`**, so a red lane fails the job and blocks
the PR.

`D-S5O2-1` said "it is not part of `validate:all`, so the aggregate is green while
1,453 story assertions and the `@storybook/addon-a11y` axe pass are silently
unrun." The first clause is true and the conclusion is false: it is not in
`validate:all`, and it **is** in CI. The correction matters because option (b) of
that decision — "mark the story-DoD evidence `unrun`" — would have recorded 1,462
browser-qualified assertions as unrun while CI was executing them on every PR.

### All 4 failures triaged — 0 component defects

| # | Story | Error, as printed | Pre-existing? | Class |
|---|---|---|---|---|
| 1 | `forms/DzCombobox.stories.ts` › `Async Options: loading → ready → error → retry` | `expect(received).toHaveAttribute()` · `Received: null`, from the shared helper `stories/_shared/asyncOptionsHost.ts:170` | **yes** — named in R5-O9 F-5 on 2026-09-18 | **harness** |
| 2 | `forms/DzMultiSelect.stories.ts` › same story | same, same helper line | **yes** — R5-O9 F-5 | **harness** |
| 3 | `forms/AsyncOptionsStates.stories.ts` › `5. Stale-response discard` | `TestingLibraryElementError: Unable to find role="option" and name "Ada Lovelace"`; the dumped DOM still shows `class="sb-preparing-story"` | **no — NEW**, the file is untracked (added by the uncommitted programme) | **harness** |
| 4 | `layout/DzGrid.stories.ts` › `Form Layout Node (colSpan + rowSpan)` | `AssertionError: expected 54 to be greater than 81` at `DzGrid.stories.ts:294` | **no — NEW**, the file is uncommitted-modified | **harness** |

**Not one of the four requires a change to component source.** Reasoning, per class:

- **#1, #2** fail inside `stories/_shared/asyncOptionsHost.ts:170`, where `row()`
  returns `null` for the whole `waitFor` window. The repository has already written
  down why, in `AsyncOptionsStates.stories.ts`'s own header: *"the panel is a
  dismissable layer and a pointer-down outside it closes the panel, which aborts
  the request in flight"* — which is why that newer story drives its host
  programmatically instead of clicking. The two older stories still click. Under
  jsdom the dismiss never happens; in a real browser it does. R5-O9 routed these as
  F-5, *"verified in jsdom only"*, and they are unchanged.
- **#3** is the same seam. The dumped DOM shows the story still in
  `sb-preparing-story` when the assertion ran, and the options list is teleported
  out of the panel. Its jsdom twin, `DzSelect.asyncStates.spec.ts`, passes 21/21
  (S5-O2 §2.2). New story, verified in jsdom only, fails in a browser — the same
  pattern as F-5, one packet later.
- **#4** is worth stating precisely, because it looks like a component defect and
  is not. `notes` carries `colSpan: 6, rowSpan: 2` in a `cols=6` grid and is the
  **only** occupant of both rows it spans; the two implicit row tracks are
  content-sized, so CSS grid distributes the item's own content height across them
  and the item is **not** taller than a one-row sibling (54 px vs 54 px, hence
  `expected 54 to be greater than 81`). The assertion
  `notes.height > first.height * 1.5` encodes a false expectation about grid row
  sizing, not a broken `rowSpan`; the story's own later assertions confirm the
  component emitted the right span classes. This is exactly the class the browser
  rung exists to expose — jsdom returns all-zero rects, so it could never have been
  caught there, and stories run in no other lane.

So: **4 failures, 4 harness assumptions, 0 component defects** — consistent with
S5-O2's 13/13 finding on the component-spec side.

### Net movement since 2026-09-18: 3 of R5-O9's 5 were fixed, 2 persist, 2 new

R5-O9 named its five. Three of them — `DzFormField` › `Invalid With Error`,
`DzFormParts` › `Invalid with Error Message`, `Localisation` › `Translated` — now
**pass**, and the three files are precisely the three story files that appear in
`git diff 2d51eec..HEAD -- packages/core/stories apps/storybook`. The two that
persist are F-5's `AsyncOptions` pair. The two new ones are both in files the
uncommitted programme added or changed. **5 → 4 is not a wash; it is three fixes,
two survivors and two new browser-only reds owned by another packet.**

### What a win32 run may and may not qualify — the S1-O3 platform-authority answer

Recorded in the shape `inputs[].gate` uses (`platform` / `authoritative` /
`ciGate` / `blockedOn`), because "an input that is read" and "an input that can fail
CI" are different claims:

| | Value |
|---|---|
| `platform` | **`win32`** (this machine, chromium 149.0.7827.55 via `playwright@1.61.1`) |
| `authoritative` | **`linux`** — CI's `storybook-test` job is `ubuntu-latest`, and it is the only runner whose result can block a merge |
| `ciGate` | **`true` for the lane, `false` for these numbers.** The lane can and does fail CI. This run cannot qualify anything for anyone else |
| `blockedOn` | nothing, for the lane. For *these* numbers: one `storybook-test` run on `ubuntu-latest`, which is a CI act, not an agent act |

Honestly stated: what a win32 run **can** qualify is *structural* — that the lane
collects, orchestrates and executes, and which assertions are host-independent
enough to fail identically here and on 09-18 (#1 and #2 do; that reproducibility is
itself the evidence). What it **cannot** qualify is the pass/fail verdict as release
or CI evidence: the tree is dirty by 297 paths, `DZUP_APP_SPECIFIC=1` is not set
here so CI runs four story files this run did not, and geometry, font metrics and
scheduling differ between win32 and linux chromium — #4 is a *geometry* assertion,
which is exactly the class that is allowed to read differently per host. **No cell,
baseline or matrix state was changed by this packet, and none should be from a
win32 run.**

---

## 3. Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `apps/storybook/vitest.config.ts` | **+79 lines.** Adds `canonical()` (realpath + case-fold, so a Windows path differing only in drive-letter case cannot false-positive) and `assertAppLocalRunner()`, called at module top level. Imports `existsSync, realpathSync` from `node:fs` and `process` from `node:process` — explicit, per the repo's `node/prefer-global/process` rule, exactly as `.storybook/main.ts` does | **none on any published surface.** `apps/storybook` is `private: true`. No test, config key, provider, instance or timeout changed — the exported `defineConfig({...})` object is unchanged. The only behavioural change is that a **cross-install invocation now throws instead of hanging** |
| `packages/tooling/src/validators/browser-lane.ts` | **new.** Exports `CI_JOB_ID`, `CI_LANE_SCRIPT`, `REQUIRED_APP_DEV_DEPS`, `GUARD_CALL`, `extractJobBlock()`, `checkBrowserLane()`, `readBrowserLaneInputs()`, plus a `/* c8 ignore */`-guarded CLI entry in the house shape | **none.** `@dzup-ui/tooling` is `private: true` and is **not** in `packages/tooling/scripts/release-policy.json`'s `published` list (`contracts`, `core`, `mcp`, `nuxt`, `testing`, `tokens`) |
| `packages/tooling/src/validators/browser-lane.spec.ts` | **new, 18 tests.** Every rule has a fixture that makes it fail, plus one test that reads the **live repository** and requires zero violations | none |
| `package.json` | **+2 script entries** (`//validate:browser-lane` doc + `validate:browser-lane`), and `validate:all` gains `yarn validate:browser-lane` **after** `yarn build` | **`validate:all` 60 → 61 links, measured** by splitting the script on `&&`. Appended at the very end, so links 1–60 keep their numbers — the convention `validate:at-runs`, `validate:runtime-floor` and `yarn build` each already state in their own `//` doc |
| `docs/storybook-decisions.md` | **+1 section**, "How to run the browser test lane — and the one way that hangs" | none |
| `docs/.../owner-decision-register-2026-09-22.md` | `D-S5O2-1`'s status cell gains a dated pointer; **new §10** closing it and raising `D-RES03-1` / `D-RES03-2` | none |
| `docs/.../EXECUTION-STATUS.md` | **+1 section**, `## Residual batch — RESIDUAL-03` | none |

**No changeset was added, and that is a decision rather than an omission.** The rule
is a changeset for any change to a *published* package. Every file above sits in a
package that is not published: `@dzup-ui/storybook` and `@dzup-ui/tooling` both
declare `private: true`, and neither appears in `release-policy.json`'s `published`
array. A changeset here would announce a version bump for something with no version
to bump.

**No dependency, manifest version or `yarn.lock` byte changed**, so no install
command is owed to the owner. `package.json` was edited (scripts only) so its sha256
moves; `yarn.lock`'s does not. Both are re-proved in §7.

### The weakness this packet found in its own gate

The first form of the `runner-guard` clause was
`vitestConfigSource.includes('assertAppLocalRunner()')`. Proving the gate could fail
— by mutating a **live** tree in memory rather than trusting the fixtures — produced
**1** violation where **2** were expected, because `assertAppLocalRunner(): void`
*contains* `assertAppLocalRunner()`: the **declaration** satisfied a check meant to
find the **call**. Deleting only the call is the whole of the damage, and it would
have passed. The clause is now anchored to a top-level call statement
(`GUARD_CALL`), and both the false-positive and the true-positive shapes are pinned
by tests. Recorded because it is the same class of defect this programme keeps
finding in its own gates — a check that asserts less than it appears to — and
because it is the argument for proving a gate red before believing it green.

---

## 4. Gateability — what was added, what was refused, and why

### The lane itself was already gateable, and already gated

This is the finding that reframes the packet. `.github/workflows/ci.yml` job
`storybook-test` runs the lane on `ubuntu-latest` with chromium installed and **no
`continue-on-error`**. Nothing had to be built to make the browser lane able to fail
CI; it can, and it does, on every PR.

### What was genuinely ungated: whether the lane can still run at all

Four ways the lane could stop being evidence with every existing gate still green —
three of them have happened, and none of the three was caught by a gate:

| Failure mode | Happened? | Now caught by |
|---|---|---|
| Cross-install invocation (root binary vs app-local) | **yes, 3 times**, ~45 min lost, one 🔴 filed | `assertAppLocalRunner()` refuses in ~1 s · `validate:browser-lane` `[runner-guard]` |
| The app stops declaring its own `vitest`/`@vitest/browser`/`vite`/`playwright` | not yet | `[own-runner]` |
| `browser.enabled` / provider / instances removed — the suite still passes, in **jsdom**, and stops being browser evidence | **yes in spirit**: S3-O2 grepped for the word `browser` in `vitest.config.*`, matched a **prose comment** in the root config, and concluded a browser project existed there | `[browser-mode]` |
| The CI job gains `continue-on-error` or is renamed | not yet | `[ci-gate]`, `[ci-advisory]` |
| A script teaches the invocation that hangs | **yes** — the invocation is what S5-O2 recorded as the reproduction | `[cross-install-invocation]` |

`yarn validate:browser-lane` is **link 61** of `validate:all` (60 → 61, appended
after `yarn build` so every existing number holds). It is browser-free: it never
runs the lane, downloads no chromium and measures nothing.

**It can fail, and that was proved rather than assumed.** Eighteen tests, of which
ten drive a rule to failure on a fixture, and one reads the live repository and
requires zero violations. Separately, the live inputs were mutated in memory (guard
call deleted, CI job renamed) and the check returned **2 violations**; against the
real tree, **0**.

### Why the smoke link `D-S5O2-1` asked for was deliberately *not* built

The row recommended "add a **smoke** link to the chain that asserts the lane
*collects at least one test*". That was the right instinct against the hypothesis it
was written under (a lane that dies at collection). Measured, it is the wrong
mechanism here, on three grounds:

1. **It needs chromium inside `validate:all`.** The chain has no browser dependency
   anywhere today, and `docs-size.ts` already refuses to put a 40 s build in front of
   every run for the same stated reason.
2. **It is not cheap.** One story file through this lane cost **19.41 s** cold and
   **7.26 s** warm — the cold cost is Vite dep pre-bundling, which a CI cache would
   not have on a fresh clone.
3. **It would have to be skippable, and a skippable link cannot fail CI** — which is
   precisely the "read but cannot fail" state TASK-S1-O3's `inputs[].gate` exists to
   make visible. A chain link that goes quiet when chromium is absent would be the
   perf gate's problem all over again.

The alternative, if the owner wants a fast-fail signal, is to put the smoke step in
the **CI job**, where chromium is already installed — `D-RES03-1` option (c), ~10
minutes. Recorded as a decision rather than silently substituted.

### The platform-authority answer, in the `inputs[].gate` shape

`generate-capability-matrix.ts` records, for each input, `{ platform, authoritative,
ciGate, blockedOn? }`, and its `browser-matrix` input currently carries a `note` but
**no `gate`**. That is a real (and separate) gap — but it is about
`e2e/matrix/browser-evidence.json`, the **Playwright** matrix, not this lane. The
Storybook browser lane is not an input to the capability matrix at all.

**Deliberately not changed here.** Adding an input, or a `gate` block, means
regenerating `packages/core/docs/capability-matrix.json`, whose `fail 0 / stale 22 /
unrun 400 / excepted 47` are frozen for this batch and whose validator holds a
two-way staleness handshake. A win32 packet that cannot qualify a browser result has
no business rewriting the artifact that records browser results. The answer is
therefore recorded as prose, in the same shape, in §2 — and as the ranked next packet
in §8, where it belongs with the Playwright ledger it actually concerns.

---

## 5. The `document.body.innerHTML = ''` question — recounted, and it is a *separate* packet that does not touch this lane

S5-O2 §2.3 named 25 body-wiping specs as "the structural blocker". Recounted here
independently (`grep -rl "document.body.innerHTML = ''" packages/core/src
--include=*.spec.ts`):

| Where | Count |
|---|---:|
| `components/overlays` | **12** |
| `components/forms` | **8** |
| `components/navigation` | 1 |
| `components/feedback` | 1 |
| `composables/provider/provider-adoption.spec.ts` · `composables/useScrollSpy/useScrollSpy.spec.ts` · `i18n/count-bearing.spec.ts` | **3** |
| **total** | **25** |

S5-O2's total of 25 is confirmed to the file. Its table listed only the four family
rows (22); the remaining **3 are outside `components/` entirely** and are named above,
because a rewrite packet that globbed `components/**` would miss them.

**And they are irrelevant to `D-S5O2-1`.** The two lanes do not overlap:

- The 25 are `*.spec.ts` under `packages/core/src`, collected by the **root** config's
  `include` and run in **jsdom** — where wiping `document.body` is survivable.
- The storybook lane collects **`*.stories.ts` only** (the `storybookTest` plugin
  derives `test.include` from `.storybook/main.ts`'s `stories` globs; the app config
  declares no `test.include` of its own, and its only `include:` key is under
  `coverage`). Measured: `grep -rl "document.body.innerHTML = ''"` over
  `packages/core/stories` and `apps/storybook/stories` → **0 files**.

So the body-wipe problem cannot reach the lane this packet was about, and fixing it
would not have fixed anything here. **It remains S5-O2's own separate packet** (~8 h,
one family per sitting, `overlays` is half of it), it is still worth doing because
those specs are better under jsdom too, and it is still the prerequisite for moving
the 153 clean component specs into browser mode. Nothing in this batch changed it.

> **Status 2026-09-30 (RESIDUAL-18): EXECUTED — and the population was larger than this table.**
> Recounted with this section's own command at the same HEAD: **28**, not 25 — the `forms` row has
> grown **8 → 11** since. Repo-wide, in statement form, it was **70 sites in 37 files**: the 28 plus
> `packages/core/security` (3 specs + the shared `boundary-suites.ts` helper),
> `packages/core/tests/portal-target.spec.ts`, and 4 specs in `apps/landing/src`. **All 37 are
> converted and zero body wipes remain repo-wide** — `enableAutoUnmount(afterEach)` in 31, `cleanup()`
> alone in the 4 `@testing-library/vue` files, a locally tracked wrapper list in `boundary-suites.ts`
> (where `enableAutoUnmount` cannot be used: it is called once per binding and VTU throws on a second
> call), and the wipe simply deleted where an explicit `unmount()` already was the teardown.
> **The 3 named above as outside `components/` are handled and each says so in its own header.**
> **Not one file legitimately needed a pristine `body`**: `DzSelect.contract.spec.ts`'s recorded belief
> that *"an unmounted wrapper does not always take the teleported node with it"* is refuted — the cases
> in that block never unmounted at all. No assertion was deleted, skipped or weakened. This section's
> two other findings stand unchanged: the storybook lane still collects `*.stories.ts` only, so this
> was never `D-S5O2-1`'s problem, and clearing it **unblocks** the browser-mode move without deciding
> it. See [`./RESIDUAL-18-test-determinism-handoff.md`](./RESIDUAL-18-test-determinism-handoff.md) §2
> and the register §23.2.

### A correction to S5-O2 §2.6 while on the subject

S5-O2 recorded "browser mode writes 133 PNGs into `src/`" as a **migration
prerequisite** for any browser-mode move. That hazard is real for a *hand-written*
browser config and **does not exist in the storybook lane**, which is the lane
`D-S5O2-1` is about. `@storybook/addon-vitest`'s plugin sets
`browser.screenshotFailures: false` whenever the consuming config declares a
`test.browser` block without that key — which `apps/storybook/vitest.config.ts` does.
Measured: the full lane run with **4 failing stories** produced
`find packages apps -name '__screenshots__'` → **nothing**. The `.gitignore` line is
still worth adding before anyone writes a second browser config; it is not owed by
this lane.

---

## 6. Focused validation — every command, every exit read from a file

No exit code below was read from a harness summary. Each command was run as
`cmd > local.log 2>&1; echo "EXIT=$?" >> local.log` and the value read back out of
the log, because the harness has now mis-reported an exit code five times in this
programme (the fifth is recorded in §6.1).

| # | Command | Result | Exit (from the log) |
|---|---|---|---|
| 1 | `cd apps/storybook && node node_modules/vitest/vitest.mjs run --project=storybook ../../packages/core/stories/buttons/DzButton.stories.ts` | 1 file, **16 tests, 16 passed**, 19.41 s | **`EXIT=0`** |
| 2 | …same, on `../../packages/core/stories/forms/AsyncOptionsStates.stories.ts` (S5-O2's own target) | 1 file, **8 tests, 7 passed / 1 failed**, 9.99 s | **`EXIT=1`** |
| 3 | `cd apps/storybook && node ../../node_modules/vitest/vitest.mjs run --project=storybook …DzButton.stories.ts` — **the cross-install shape, before the fix** | no output past one `[vite] Re-optimizing dependencies` line; nothing collected | **`EXIT=137`** (SIGKILL at a 200 s cap) |
| 4 | `yarn storybook:test` — **the whole lane, before the fix** | **170 files · 1,462 tests · 1,458 passed · 4 failed · 103.80 s** | **`EXIT=1`** |
| 5 | run 3 repeated **after the fix** | **immediate** `Startup Error` naming both paths and the correct command | **`EXIT=1`** |
| 6 | run 1 repeated **after the fix** | 1 file, **16 tests, 16 passed**, 7.26 s (warm cache) | **`EXIT=0`** |
| 7 | `yarn storybook:test` — **the whole lane, after the fix** | **170 files · 1,462 tests · 1,458 passed · 4 failed · 95.86 s — identical** | **`EXIT=1`** |
| 8 | `yarn validate:browser-lane` | `✓ browser-lane: the lane is invocable, is still a browser lane, and can still fail CI.` | **`EXIT=0`** |
| 9 | `node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/browser-lane.spec.ts` | **18 tests, 18 passed**, 1.84 s | **`EXIT=0`** |
| 10 | `node node_modules/tsx/dist/cli.mjs` over a live tree with the guard call and the CI job name mutated **in memory** | **2 violations** on the broken inputs, **0** on the real ones | 0 (the probe itself; the violations are its output) |
| 11 | `yarn typecheck` | no output | **`EXIT=0`** |
| 12 | `yarn typecheck:all` | no output | **`EXIT=0`** |
| 13 | `yarn lint` | **no output at all** (`--max-warnings 0`) | **`EXIT=0`** |
| 14 | `node node_modules/vitest/vitest.mjs run` (whole unit suite) | **573 files · 11,153 passed · 3 skipped · 1 todo (11,157)** · 327.13 s | **`EXIT=0`** |

Runs **3 and 5 are the defect and its fix on the same command**: 200 s of silence
ending in a kill, against an immediate refusal that names the right command. Runs
**4 and 7** are the lane before and after, to the test: the guard changes nothing for
anyone invoking it correctly.

### 6.1 Two lint errors were mine, and `--fix` was not used

`yarn lint` came back **`EXIT=1`** the first time with exactly two errors, both in
files created by this packet: a `perfectionist/sort-imports` ordering in the new spec
and a `style/indent-binary-ops` continuation in the new validator. Both were fixed
**by hand**, in two passes, because `eslint --fix` has previously corrupted a string
literal in this repository. The second pass surfaced a *different* ordering
requirement for the same import (`sibling-type` before `external`, not merely before
`sibling`), which is exactly the sort of thing a blind `--fix` hides. Final state:
`yarn lint` prints nothing and exits 0.

### 6.2 The "harness reports exit 0" hazard, stated more precisely than before

Four background-task notices in this batch read *"completed (exit code 0)"* over logs
whose own last lines read `EXIT=137`, `EXIT=1`, `EXIT=1` and `VALIDATE_ALL_EXIT=1`.
S0-O2, S5-O2 and RESIDUAL-01/02 each recorded this class and called it the harness
lying. **In this batch it was not lying, and the distinction matters.** Every command
here was wrapped as
`( cmd > log 2>&1; echo "EXIT=$?" >> log )`, whose **last** statement is the `echo` —
so the wrapper's own status is 0 by construction, and 0 is what the notice correctly
reports.

The practical rule is therefore stronger than "the harness sometimes lies": **a
completion notice can never be a gate's verdict**, whether the harness is accurate or
not, because the thing it reports is the wrapper and not the gate. That is why all 14
exits in the table above were read back out of a file, and it is the reason this
convention is worth keeping even though it is what makes the notice uninformative.

---

## 7. Aggregate qualification — pre-existing versus new

| Gate | Baseline handed to this packet | Measured here | New? |
|---|---|---|---|
| `yarn typecheck` | 0 | **0** | no |
| `yarn typecheck:all` | 0 | **0** | no |
| `yarn lint` | 0 | **0** (after two hand fixes, §6.1) | no |
| `yarn test` | 572 files · **11,135** passed · 0 failed | **573 files · 11,153 passed · 3 skipped · 1 todo · 0 failed** · `EXIT=0` | **+1 file, +18 tests — exactly this packet's new spec.** 11,135 + 18 = 11,153 |
| `yarn validate:all` | **60 links, exit 1 at link 51 only**, pre-existing | **61 links** (measured by splitting the script on `&&`, not quoted) · **exit 1** · **exactly one `✗` in 470 lines**, at **link 51** | **no new failure** |
| `yarn storybook:test` | recorded as dead (415 s, `collect 0ms`) | **170 files · 1,462 tests · 1,458 passed · 4 failed · 95.86 s** · `EXIT=1` | the lane is alive; 2 of its 4 reds are new and belong to another packet (§2, `D-RES03-2`) |

**The single `✗` is byte-for-byte the pre-existing one.** Link 51 is
`yarn validate:peers` (measured: `scripts['validate:all'].split('&&').indexOf('yarn
validate:peers') + 1 === 51`), `validate:peers` itself passes, and the failing half is
its second command:

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

Note that the `0.475.0` row now has **no declarant** — every manifest reads
`^0.477.0`. That is RESIDUAL-01's alignment, and it is the state its §9.1 predicted:
the gate reads `yarn.lock`, so the last step is the owner's `yarn install`. This
packet did not run one and `yarn.lock`'s sha256 is unchanged (§9).

**Link numbering held.** `validate:browser-lane` is **link 61**, appended after
`yarn build` (link 60). Links 1–60 keep the numbers they had, which is why the
failure is still reported at 51 and not at 52.

**Honest consequence: link 61 is *locally* qualified, not aggregate-qualified.** The
chain stops at 51, so links 52–61 did not execute inside the aggregate — the same
standing caveat links 52–60 already carry in this programme. `validate:browser-lane`
was therefore run **standalone** and read from its own log (`EXIT=0`, §6 run 8), and
its rules are additionally executed on every `yarn test` through
`browser-lane.spec.ts`, which *is* inside a gate that runs. It will join the aggregate
the moment the owner's `yarn install` clears link 51.

---

## 8. Ratchet movements — none

Every frozen figure was re-read from the artifact that owns it, not quoted from a
prior report. **No ceiling was raised, no allowlist widened, and no `*ceilings*.json`
file was opened for writing.**

| Ratchet | Frozen at | Measured after this packet | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `fail` | 0 | **0** (A 0 + B 0 + C 0 + D 0) | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `stale` | 22 | **22** (0 + 0 + 21 + 1) | same |
| capability `unrun` | 400 | **400** (65 + 247 + 87 + 1) | same |
| capability `excepted` | 47 | **47** (4 + 41 + 2 + 0) | same |
| AT executed | 0 of 534 | **0 of 534** (89 entries × 6 pairs, no recorded results) | `e2e/at-matrix/index.json` |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `packages/tooling/src/validators/i18n-completeness-ceilings.json` |

**No generated artifact was regenerated**, and none needed to be: this packet changed
no component, export, token, story, anatomy, ownership entry or public API, so no
declared input of the capability matrix, quality matrix, component-meta,
`llms-full.txt` or the docs pages moved. That is why link 24 (the capability-matrix
freshness link that RESIDUAL-02 tripped) is green here without any regeneration
sequence being run.

**Two counts moved, and neither is a ratchet:** `validate:all` links **60 → 61**
(appending a gate is the opposite of relaxing one) and the unit suite **11,135 →
11,153** tests. The `validate:all` count is measured, never quoted.

---

## 9. Owner decisions — one closed, two raised

Recorded in the register's §10 addendum (appended, nothing renumbered; `D-S5O2-1`'s
row keeps its original text and gains a dated pointer).

**Closed**

- **`D-S5O2-1`** 🔴 → 🟢 **CLOSED as not-a-defect.** There was no regression and the
  lane is not dark. Both premises are falsified with evidence in §1 and §2. The
  recommended option (a) is executed in substance: diagnosed, fixed, and gated — with
  one deliberate deviation, raised below rather than substituted silently.

**Raised**

- **`D-RES03-1`** 🟢 — **the smoke link was deliberately not built.** `D-S5O2-1`
  option (a) asked for a `validate:all` link asserting the lane collects ≥ 1 test. A
  browser-free wiring gate was built instead, on three measured grounds (§4): it would
  put a chromium download in a chain with no browser dependency; one story file costs
  19.4 s cold; and a link that must be skipped when chromium is absent cannot fail CI,
  which is the exact state `inputs[].gate` exists to name. Options: (a) accept the
  wiring gate as the discharge · (b) add the smoke link anyway · (c) put it in the CI
  `storybook-test` job, where chromium is already installed. **Recommend (a), with (c)
  available for ~10 min.**
- **`D-RES03-2`** 🟠 — **two new browser-only reds belong to the uncommitted
  programme.** `AsyncOptionsStates.stories.ts` › `5. Stale-response discard`
  (untracked file) and `DzGrid.stories.ts` › `Form Layout Node (colSpan + rowSpan)`
  (uncommitted-modified) fail only in the browser lane, which is the only lane that
  runs stories. Since CI's `storybook-test` blocks the PR, the owner's first push is
  red unless they are fixed. Options: (a) owning packets fix both before the commit ·
  (b) commit 4-red · (c) additionally rewrite the two older `Async Options` stories to
  drive their host programmatically, closing R5-O9's F-5. **Recommend (a) then (c).**

**Left explicitly to their owners, unchanged by this packet:** the 25 body-wiping
specs (S5-O2's packet, §5), `D91` (the coverage re-baseline that unblocks Vitest 4
and therefore Vite 8), and the icon `yarn install` that clears link 51
(RESIDUAL-01 `D-RES01-1`).

---

## 10. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git status --porcelain \| wc -l` | **297** | **301** |
| `diff` of the two listings | — | **exactly 4 added lines**, all intended: ` M apps/storybook/vitest.config.ts` · ` M docs/storybook-decisions.md` · `?? packages/tooling/src/validators/browser-lane.ts` · `?? packages/tooling/src/validators/browser-lane.spec.ts`. **No line removed, none modified.** `package.json` was already ` M`; the register, `EXECUTION-STATUS.md` and this report live inside the already-`??` `docs/program-2026-09-22-architecture/reports/` entry, so none of them adds a line |
| `sha256sum yarn.lock` | `6332fae9…87adb` | **`6332fae9…87adb` — identical** |
| `sha256sum package.json` | `9c4d4883…aa22c` | `45524b09…93728` — **moved by design** (two script entries + the chain link; no dependency, no version) |
| `yarn install` run? | — | **no.** No install command is owed to the owner: no manifest dependency or version changed |
| `find packages apps e2e -name '__screenshots__'` | — | **nothing.** Seven browser-lane runs, one of them with 4 failing stories, wrote **zero** PNGs — the addon sets `screenshotFailures: false` (§5) |
| `*.png` newer than the session start under `packages`/`apps`/`e2e` | — | **none** |
| Probe directory | — | `.residual03-probe/` created and **removed**; it held only logs plus one throwaway `.mts` probe, was never added to `.gitignore`, and appears in no listing at the end |
| `git worktree list` | one entry | one entry |
| Commit / push / CI dispatch / publish / baseline capture | — | **none** |

---

## 11. Ranked next packet

1. **Fix the two new browser-only reds** (`D-RES03-2` option (a)) — ~1 h, and it is
   the only item that stands between the owner's first push and a green
   `storybook-test`. `DzGrid` is a two-line assertion change (the `rowSpan` expectation
   is false about CSS grid, §2); `AsyncOptionsStates` › `5. Stale-response discard`
   needs the same programmatic drive its own file header prescribes. **Highest value
   per hour in this list, because it is the only one with a red CI run behind it.**
2. **Close R5-O9's F-5** (`D-RES03-2` option (c)) — ~40 min. Rewrite `DzCombobox` and
   `DzMultiSelect` › `Async Options` to drive the host programmatically instead of
   clicking. Takes the lane to **0-red**, and retires a finding that has been open and
   correctly diagnosed since 2026-09-18. Do it with item 1.
3. **Give the capability matrix's `browser-matrix` input a `gate` block** — ~1 h, and
   it is the gap this packet found while *looking for* one. `visual-baselines` and
   `perf-baselines` both carry `{ platform, authoritative, ciGate, blockedOn }`;
   `browser-matrix` carries only a `note`, so the Playwright ledger still cannot say
   whether it can fail CI. Deliberately not done here: it requires regenerating
   `capability-matrix.json`, whose `stale 22` handshake is frozen for this batch, and a
   win32 packet that cannot qualify a browser result should not rewrite the artifact
   that records browser results.
4. **Consider adding the Storybook lane as a capability-matrix input** — ~2 h, and it
   should be *decided* before it is built. 1,462 browser-qualified story assertions
   plus the addon-a11y axe pass are currently invisible to the matrix, which is the
   real version of `D-S5O2-1`'s "no gate says so": CI gates the lane, but no
   *evidence artifact* records what it proved. Needs a projection step of its own
   (`test-storybook:ci` already writes `a11y-report/junit.xml` and
   `a11y-results.json`), so it is a design question, not a wiring one.
5. **The 25 body-wiping specs** (S5-O2's packet, §5) — ~8 h. Unchanged by this batch,
   unrelated to this defect, and still the prerequisite for moving the 153 clean
   component specs into browser mode (2.7× faster, and real layout geometry).
6. **`D91`** — the owner's coverage re-baseline. Still the keystone: the only blocker
   of Vitest 4, which is the only blocker of Vite 8. Nothing here changed it.
