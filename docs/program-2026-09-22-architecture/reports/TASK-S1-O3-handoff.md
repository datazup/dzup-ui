# TASK-S1-O3 — Visual-regression capture on the authoritative platform, and the CI gate

> **Status: `[x]` engineering complete. The capture itself is `[!owner]`.**
> Repository: `ui/dzup-ui` · Commit observed: **`4e4e46f`**
> (`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`). The worktree carried **209 dirty
> paths** from five prior tasks of this programme at the start and **225** at the
> end — every pre-existing one preserved, nothing committed, nothing stashed,
> reverted or cleaned. README §2 quotes `589be13`; that is **stale**. Every
> number below is bound to `4e4e46f`.
>
> **Nothing in this task captured, replaced, moved or rewrote a baseline image.**
> All 58 committed PNGs are byte-identical to their recorded SHA-256 digests, and
> `git status --porcelain e2e/visual/ | grep -i png` is empty. Capture is an
> owner action; this task built the mechanism and proved the refusal.

---

## 0. Progress log (written as the task ran — long tasks cross context windows)

| # | step | state |
|---|---|---|
| 1 | Discovery: platform provenance of every committed baseline | done |
| 2 | Discovery: realistic CI runner | done |
| 3 | done_check executed and critiqued | done |
| 4 | Platform gate implemented (shared module + three specs) | done |
| 5 | Refusal proved on the wrong platform | done |
| 6 | Visual declared as a capability-matrix input | done |
| 7 | Review workflow + owner capture command recorded | done |
| 8 | Aggregate re-run; `validate:docs-pages` went red from the matrix regeneration, closed with `yarn generate:docs-pages` (the sanctioned order: capability → component-meta → llms → **docs-pages**) | done |
| 9 | `validate:all` re-run **end to end** after that fix, so the reading is not of a chain that stopped at link 33 | done |

---

## 1. The `<done_check>`, read critically — **2 of 4 at `4e4e46f`**, two clauses defective

README §4.3 warns that a check can itself be wrong, and all five prior tasks in
this programme found at least one defect. This one has two, and the second is
the more serious kind: a verification step that performs the action the same
prompt forbids.

| # | clause | verdict at `4e4e46f` | assessment |
|---|---|---|---|
| 1 | `ls e2e/visual/__screenshots__/ 2>/dev/null \| head` → platform-keyed path | **pass (substance)** | **DEFECTIVE as written.** `e2e/visual/__screenshots__/` does not exist and never has: this repo never set `snapshotPathTemplate`, so Playwright uses `<spec>-snapshots/` with the platform in the **file name** (`…-chromium-linux.png`). As literally written the command prints nothing, `2>/dev/null` swallows the error, and `head` exits 0 — so an agent reading the exit code records a pass **from an empty listing**. That is the precise "green from absence" failure this task exists to eliminate, embedded in the check for it. The clause's own escape hatch ("or the equivalent baseline directory") is what saves it. Substance: baselines *were* already platform-keyed. |
| 2 | `grep -rn 'process.platform' e2e/visual/ \| head -3` | **FAIL** | Correct and decisive — nothing in `e2e/visual/` read the running platform. This was the whole of the work. (Note the pipe: `grep \| head` exits 0 on no match, so this clause too must be read by its *output*, not its status. The repo's "never read a gate result through a pipe" rule applies to done_checks, not only to gates.) |
| 3 | `yarn test:e2e:visual > /tmp/vis.log 2>&1; echo "exit $?"` | **not run as written** | **DEFECTIVE on two counts.** (a) `/tmp` is not writable on this machine — corrected to the session scratchpad. (b) Far worse: at `4e4e46f` this command **would have performed a forbidden baseline capture**. The gallery and theme-recipe lanes had linux baselines, no platform guard, and Playwright's default `updateSnapshots: 'missing'`, which answers an absent baseline by *writing* it. Running the verification step would have written win32 PNGs — a "baseline replacement", explicitly withheld from this agent by `<authority>`. This is the same defect class the 2026-09-04 packets hit twice ("could only be satisfied by an action the same prompt forbade"). **Decided from evidence instead:** implement the guard first, then run. It now exits 1 with one named refusal — which the clause explicitly accepts as a pass. |
| 4 | `node -e "…Object.keys(c.inputs)"` → a visual input is declared | **PASS** | Already true at `4e4e46f`: `visual-baselines` was one of five declared inputs. What it could not say was whether that input can gate anything, which is what `inputs[].gate` now adds. |

**Recorded outcome: `2 of 4 at 4e4e46f`** (clauses 1 and 4 pass; clause 2 fails;
clause 3 unsafe to execute as written). **4 of 4 after this task**, with clause 1
read by substance and clause 3 read against the corrected log path.

---

## 2. Discovery — what the evidence actually says

### 2.1 What platform the committed baselines were captured on — measured, not assumed

`e2e/visual/` holds **58 accepted baselines in three lanes**, and they are
**already platform-keyed** — by Playwright's own filename suffix
`{arg}-{project}-{platform}.png`, not by a `__screenshots__/<platform>/`
directory. The split is not uniform, and that is the finding:

| lane | spec | snapshot dir | baselines | platform suffix on disk | ledger `platform` |
|---|---|---|---|---|---|
| screen-level | `gallery.spec.ts` | `e2e/visual/gallery.spec.ts-snapshots` | 16 | `chromium-linux` ×16 | `linux` ×16 |
| theme recipes | `theme-recipe-matrix.spec.ts` | `…theme-recipe-matrix.spec.ts-snapshots` | 18 | `chromium-linux` ×18 | `linux` ×18 |
| per-component | `component-baselines.spec.ts` | `…component-baselines.spec.ts-snapshots` | 24 | `chromium-win32` ×24 | `win32` ×24 |

How it was proved, three independent ways that agree:

1. **The filenames.** `find e2e/visual -name '*-snapshots' -type d` then `ls`:
   34 files end `-chromium-linux.png`, 24 end `-chromium-win32.png`. Playwright
   writes that suffix from `process.platform` at capture time; it is not
   editable metadata, it is the path the comparison resolves.
2. **The ledger.** `e2e/visual/visual-baselines.json` records a `platform` field
   per baseline: `{ win32: 24, linux: 34 }` — byte-for-byte agreement with the
   filenames, and each entry carries `sourceCommit`, `acceptedBy`, `acceptedAt`
   and `reason`.
3. **Git history.** The two linux lanes predate the win32 one:
   `gallery.spec.ts-snapshots` last moved at `078c1dd`, `theme-recipe-matrix…`
   at `fd5dd49`; the per-component pilot landed at `2d51eec` (TASK-N1-O6),
   captured on this Windows machine.

So the gap note in the S1-O3 packet ("the committed baselines were captured on
`linux` while the pilot runs on `win32`") is **half right and the half it gets
wrong is the operative half**: the *screen-level* baselines are linux, the
*per-component pilot* baselines are win32. There is no lane whose baselines are
linux and whose pilot is win32; there are two lane groups at two different
platforms, and `visual-baselines.json` declares one global `scope.platform`
(`win32`) for both. That single global is the actual defect.

### 2.2 The realistic runner

`grep -rn 'runs-on' .github/workflows/` → **18 of 18 jobs across 8 workflow
files are `runs-on: ubuntu-latest`** (`ci.yml` ×11, `chromatic.yml`,
`landing-e2e-snapshots.yml`, `min-peer.yml`, `publish-prerelease.yml`,
`release.yml`, `validate-min-runtime.yml`, `vue-next.yml` ×2). There is no
Windows and no macOS runner anywhere in the repository. The gate, if it ever
runs in CI, runs on **linux**.

### 2.3 What was already built (do not rebuild — README §4.6)

The packet's `<task>` asks for six things. Four already existed at `4e4e46f`
and are cited rather than redone:

- **(4) scope** — declared per *family* in `scope.families` (`buttons`) + four
  stress fixtures, joined against `e2e/matrix/targets.generated.ts`
  (`e2e/visual/coverage.ts`). Recorded in `e2e/visual/README.md` §"Scope is
  declared, not discovered". TASK-N1-O6 / TASK-R5-O4.
- **(5) capability-matrix input** — `visual-baselines` is **already** one of the
  five declared `inputs` in `packages/core/docs/capability-matrix.json`, with
  per-row `visual` cells (`covered` / `stale` / `not-covered`).
  `done_check` clause 4 therefore passed before this task started.
- **(6) review workflow** — `e2e/visual/README.md` §"Review workflow" +
  §"The authority rule"; enforced by `e2e/visual/authority.ts` in-run and
  `validate:visual-baselines` out-of-run; `test:e2e:update` is a refusal stub.
- **(1) the decision** — TASK-R2-O1 already recorded
  `scope.platformDecision.authoritative = "linux"` on 2026-09-19, with its
  rationale, and deliberately did **not** write it into `scope.platform`
  because that would make the ledger claim 24 baselines that do not exist.

What did **not** exist, and is the whole of this task:

- **(2) the harness never reads the running platform.**
  `grep -rn 'process.platform' e2e/visual/` returned **nothing** at `4e4e46f`.
  Nothing compares `process.platform` against the declared authority.
- Consequently, running `yarn test:e2e:visual` on this win32 machine would have
  driven `gallery.spec.ts` and `theme-recipe-matrix.spec.ts` — whose baselines
  are `chromium-linux` — under Playwright's default `updateSnapshots: 'missing'`,
  which **writes the actual PNG and fails the test**. That is an unauthorised
  baseline capture (forbidden to an agent by README §5 `<authority>`) performed
  as a side effect of a *read-only-looking* verification command. The lane was
  one `yarn` invocation away from a 34-file capture storm.
- The per-component lane's `authority.ts` guard covers *bulk `--update-snapshots`*.
  It does **not** cover `missing`, and it is not wired into the two screen-level
  specs at all.

---

## 3. The decision: `linux` is the authoritative platform

**Declared in data**, at `e2e/visual/visual-baselines.json` →
`scope.authoritativePlatform: "linux"`, with the reasoning, the evidence and
the owner action beside it in `scope.platformAuthority`.

Why linux and not this machine:

1. **Only linux has a runner.** 18 of 18 jobs across the 8 files in
   `.github/workflows/` are `runs-on: ubuntu-latest`. A baseline captured for a
   platform no runner has is a baseline that can never gate anything.
2. **The majority of the evidence is already there.** 34 of 58 accepted
   baselines are `chromium-linux`; only the 24-image per-component pilot is
   `win32`.
3. **It is not a new decision.** TASK-R2-O1 recorded exactly this answer on
   2026-09-19 (`scope.platformDecision.authoritative = "linux"`) and left it
   unenforced because writing it into `scope.platform` would have made the
   ledger claim 24 baselines that do not exist. This task **ratifies and
   enforces** it without that cost, by moving the platform from one global onto
   each lane.

**This machine (`win32`) is not the authoritative platform**, so no capture was
attempted here. `<authority>` names baseline replacement explicitly, and the
refusal path was proved here instead.

### 3.1 One authority, three lanes — how the two coexist

`<one_platform>` requires exactly one authoritative platform. There is exactly
one: `linux`. What varies per lane is whether a lane *is on it* yet, and that is
now stated rather than averaged:

| lane | `capturedOn` | `role` | can fail CI? |
|---|---|---|---|
| `gallery` | `linux` | `gate` | **yes** |
| `theme-recipe` | `linux` | `gate` | **yes** |
| `component-baselines` | `win32` | `developer-local` | no — blocked on an owner capture |

A `gate` lane whose `capturedOn` is not the authoritative platform is now a hard
validator error ("a gate whose images are for another platform can never pass").
A `developer-local` lane is legal, honest, and **ratcheted**: see §7.

### 3.2 Scope, and what it excludes (`<scope_written>`)

Each lane now carries its own `scope` and `excludes` strings in the ledger, and
a lane with an empty `excludes` is a validator error — an unwritten scope is
exactly how this lane became unowned the first time.

- `gallery` — 8 demo screens × light/dark. **Excludes:** says nothing about
  *which component* moved when a screen changes.
- `theme-recipe` — 2 screens × the 9-case theme/density/direction/motion
  covering array. **Excludes:** two screens only; a provider regression on any
  other screen is invisible.
- `component-baselines` — every component in an opted-in family (today
  `buttons` → 8 components) × light/dark + 4 stress fixtures, `maxDiffPixels: 0`.
  **Excludes:** the other 136 of 144 components read `not-covered`; LTR only;
  one viewport; chromium only.

The scope was **not widened**. Widening it means capturing baselines, which is
the owner action this task is forbidden to take.

---

## 4. What was implemented

### 4.1 New files

| file | what it is |
|---|---|
| `e2e/visual/platform.ts` | The authority. Reads `process.platform`, the declared `scope.authoritativePlatform` and each lane's `capturedOn`; produces a verdict, a capture-environment descriptor (`chromium/win32-x64 · playwright 1.61.1 · node v24.14.1`) and the refusal prose. **Imports no Playwright**, so it runs with no runner. |
| `e2e/visual/platform-guard.ts` | The in-run half. `guardVisualLane(laneId, expectedShots)` → `false` means the spec registers **no snapshot tests at all**, and a module-scope singleton registers **exactly one** refusal test per process however many lanes refuse. |
| `e2e/visual/preflight-platform.ts` | The out-of-run half. `yarn visual:platform [lane…]`, exit 1 with one named refusal. Runs **before** the tokens build, the Storybook build and the browser. |
| `packages/tooling/src/validators/visual-baselines-ceilings.json` | The `developerLocalLanes` one-way ratchet (ceiling **1**). |
| `packages/tooling/src/validators/visual-baselines.spec.ts` | 17 unit tests: the proof that each silent-green path is closed, plus an assertion that the **committed** ledger passes every hard gate. |

### 4.2 Changed files, and the API effect

| file | change | API effect |
|---|---|---|
| `e2e/visual/visual-baselines.json` | schema **1.1.0 → 1.2.0**. `+scope.authoritativePlatform: "linux"`, `+scope.platformAuthority{}` (decision, evidence, rationale, enforcement), `+lanes[3]` (id/spec/snapshotDir/capturedOn/role/scope/excludes). | Additive. Every 1.1.0 reader still finds every field it knew. `scope.platform` and the 58 baseline records are **untouched**. |
| `e2e/visual/coverage.ts` | `+VisualLane`, `+scope.authoritativePlatform?`, `+lanes?` on `VisualLedger`. | Additive types only. |
| `e2e/visual/{gallery,theme-recipe-matrix,component-baselines}.spec.ts` | each wrapped in `if (guardVisualLane(<id>, <n>))`. | On the lane's own platform: identical behaviour, identical test titles (`visual:accept --grep` still matches). On any other: zero snapshot tests. |
| `playwright.config.ts` | `+updateSnapshots: 'none'`. | A missing baseline now **fails without writing**. `visual:accept` is unaffected — it passes `--update-snapshots=all` on the command line, which overrides config. `apps/landing` has its own config and is untouched. |
| `packages/tooling/src/validators/visual-baselines.ts` | `+platformSuffixOf()`, `+checkLaneAuthority()`, `+checkDeveloperLocalRatchet()`, `+readVisualCeilings()`; two new rule kinds `lane` / `authority`; `checkVisualBaselines` takes an optional third `ceilings` arg; richer CLI output. | Backward compatible: the third arg defaults. |
| `packages/tooling/src/quality/accept-visual-baseline.ts` | refuses a capture on a platform that is neither the lane's nor the authoritative one. | The owner's linux capture is explicitly **permitted** — that opening is what makes the migration possible. |
| `packages/tooling/src/quality/capability-matrix.ts` | `+inputs[].gate{platform,authoritative,ciGate,blockedOn?}`; `CAPABILITY_SCHEMA_VERSION` **1.1.0 → 1.2.0**. | Additive. |
| `packages/tooling/src/quality/generate-capability-matrix.ts` | `+visualInputGate()`; `visualInputNote()` now names the authoritative platform and every lane's platform + role. | The visual input now says whether it can fail CI, not only that it was read. |
| `package.json` | `+visual:platform`; `test:e2e:visual` and `test:e2e:visual:pilot` now start with it. | A wrong-platform run costs ~1 s instead of a 4-minute Storybook build, and cannot reach the code that writes a PNG. |

### 4.3 The capability-matrix input (`<task>` item 5)

`visual-baselines` was **already** one of the five declared `inputs` before this
task — `done_check` clause 4 passed at `4e4e46f`. What it could not say was
whether that input can gate anything. It now carries:

```json
"visual-baselines": {
  "available": true,
  "path": "e2e/visual/visual-baselines.json",
  "note": "… The authoritative platform is `linux` (every CI runner is that platform) and
           these baselines are `win32` … CANNOT fail a CI run until one accept pass is made
           on linux. Lanes: gallery (linux, gate); theme-recipe (linux, gate);
           component-baselines (win32, developer-local).",
  "gate": { "platform": "win32", "authoritative": "linux", "ciGate": false,
            "blockedOn": "one `yarn visual:accept` pass per snapshot on linux, then
                          `lanes[component-baselines].capturedOn` → \"linux\"." }
}
```

`available: true` and `ciGate: false` are different facts, and before this change
a reader seeing `visual: covered` on eight components would reasonably have
concluded CI was watching those pixels. It is not.

---

### 4.4 One requirement deliberately NOT implemented: the `__screenshots__/<platform>/` layout

The packet's `<example>` suggests
`e2e/visual/__screenshots__/<platform>/<project>/<test>-<n>.png`. **Not done,
deliberately.** Playwright already keys every baseline by platform — in the leaf
name, `{arg}-{project}-{platform}.png` — so the requirement the example
illustrates ("baselines live under a platform-keyed path") has been satisfied
since the first capture. Adopting the example's exact shape means setting
`snapshotPathTemplate` and **renaming all 58 committed PNGs**, which rewrites the
`file` field of all 58 ledger entries and detaches every image from its git
history, to buy a directory separator in place of a hyphen.

What was missing was never the *path*. It was that **nothing read the running
platform and compared it against a declared authority** —
`grep -rn 'process.platform' e2e/visual/` returned nothing at `4e4e46f`. That is
what was built. The requirement is met by the existing layout plus an explicit
per-lane declaration, at a cost of zero moved files and zero changed digests.

---

## 5. Focused validation — the refusal is proved un-silenceable

**Correction to the packet, recorded as README §4.3 requires.** The `<done_check>`
and `<validation>` blocks write to `/tmp/vis.log` and `/tmp/s1o3-*.log`. **`/tmp`
is not writable on this machine**; every log below was written to the session
scratchpad instead, and every exit code was read **directly** (`cmd > log 2>&1;
echo "exit $?"`), never through a pipe.

### 5.1 The refusal, four ways

**(a) The lane command itself — `yarn test:e2e:visual` → exit 1.**
One refusal, both platforms named, and it never reached the tokens build, the
Storybook build or a browser:

```
✗ visual:platform — 2 lane(s) refused: gallery, theme-recipe

visual: baselines for lane `gallery` are authoritative on "linux"; this run is on
"win32". Re-run on linux, or re-declare the authoritative platform in
e2e/visual/visual-baselines.json (owner action).
```

**(b) Bypassing the yarn script — `playwright test e2e/visual --project=chromium
--list` → 25 tests in 2 files.**
This is the decisive count. Two lanes refused and the listing contains **exactly
one** refusal test; the 34 gallery + theme-recipe snapshot tests are **not
registered at all**, so there is no diff storm and nothing for Playwright to
write into:

```
  [chromium] › visual\component-baselines.spec.ts:57:5 › visual DzButton light
  … 24 per-component tests …
  [chromium] › visual\platform-guard.ts:43:3 › visual: REFUSED — platform-mismatch
Total: 25 tests in 2 files
```

**(c) Executing that refusal test → exit 1.** It is a real failure with the full
message, not a skip:

```
1) [chromium] › e2e\visual\platform-guard.ts:43:3 › visual: REFUSED — platform-mismatch
   Error: visual: baselines for lane `gallery` are authoritative on "linux"; this run is on "win32". …
```

**(d) The positive path still works — `yarn test:e2e:visual:pilot` → exit 0.**
The guard is not a blanket refusal. The per-component lane's images *are* win32,
so the preflight passes it and the lane actually compares:

```
  ✓ component-baselines  images for win32   · developer-local
✓ visual:platform: every requested lane is on its authoritative platform.
  24 passed (26.8s)
```

**`git status --porcelain e2e/visual/ | grep -i png` → empty after every one of
the four runs.** No baseline was captured, replaced or written by this task.

### 5.2 Why a silent pass is now structurally impossible

Five independent holes, each closed by a different mechanism that fails for a
different reason — the repo's own "neither control is sufficient alone" doctrine:

| the silent-green path | what closes it | fails where |
|---|---|---|
| wrong platform → Playwright writes the missing baseline and the lane "passes" next time | `visual:platform` preflight | before the build, exit 1 |
| someone calls `playwright test e2e/visual` directly | `guardVisualLane` singleton | in-run, exactly one failure |
| a missing baseline on the *right* platform is written instead of failed | `updateSnapshots: 'none'` | in-run, fails writing nothing |
| a lane resolves to **0 snapshots** and exits 0 having compared nothing | `guardVisualLane(id, expectedShots)` | in-run, named refusal |
| a lane holds **0 accepted baselines**, or images for a platform it does not declare, or is a `gate` for a platform no runner has | `checkLaneAuthority` in `validate:visual-baselines` | no browser, inside `validate:all` |

The last row is the important one: it means the repository cannot *reach* the
broken state, not merely that a run would notice it. It is covered by 17 unit
tests in `packages/tooling/src/validators/visual-baselines.spec.ts`, the last of
which asserts the **committed** ledger passes every hard gate — so the gates are
exercised against real repository state, not only fixtures.

```
node node_modules/vitest/vitest.mjs run packages/tooling/src/validators/visual-baselines.spec.ts
  → 17 passed, exit 0
```

### 5.3 The narrow validators

```
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/visual-baselines.ts   → exit 0
yarn generate:capability-matrix                                                          → exit 0
node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/capability-matrix.ts  → exit 0
yarn typecheck                                                                           → exit 0
```

`validate:visual-baselines` now prints the authority and every lane:

```
  scope      families [buttons] · chromium · light+dark · ltr · win32
  baselines  58 on disk, 58 accepted
  authority  linux — the one platform a gate lane runs on (TASK-S1-O3)
    gallery              16 on linux   · gate
    theme-recipe         18 on linux   · gate
    component-baselines  24 on win32   · developer-local
```

**`npx` was not used anywhere.** Per the repo's measured toolchain note, `npx`
here fetches dependency-confusion placeholders that exit 0 without running — a
silent green, which is precisely the failure this task exists to eliminate. Every
`npx tsx …` in the packet's `<validation>` block was run as
`node node_modules/tsx/dist/cli.mjs …` instead.

---

## 6. Aggregate qualification

All five aggregate lanes were run **end to end** at `4e4e46f` on a 225-path
dirty worktree, each written to its own log and each exit code read **directly**
— never through a pipe, because a pipe returns the last stage's status and this
repository has already had an aggregate report green over a stale artifact for
three packets.

| lane | before (S2-O2 baseline) | after | verdict |
|---|---|---|---|
| `yarn build` | 0 | **0** | unchanged |
| `yarn typecheck` | 0 | **0** | unchanged |
| `yarn lint` | 0 | **0** | unchanged — two of my own files needed `--fix` first (`style/operator-linebreak`, `test/prefer-lowercase-title`); fixed, re-run clean |
| `yarn test` | 558 files · 10,699 passed · 0 failed | **559 files · 10,716 passed · 3 skipped · 1 todo · 0 failed** | **+1 file, +17 tests — exactly `packages/tooling/src/validators/visual-baselines.spec.ts`.** No pre-existing test changed state |
| `yarn validate:all` | "52 links · 51 green · red = link 48 `validate:peers`" | **exit 1 · 52 links · links 1–47 green · link 48 `validate:peers` RED · links 49–52 not reached** | **unchanged — the same single pre-existing red, in the same place** |

The one `✗` in 432 lines of output is verbatim the known one:

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
```

That is open decision **D174/D175** (the icon swap). Not this task's, not
touched, not worked around.

**A correction to the inherited baseline, while it is in front of us.** The
figure this task was handed — *"52 links, 51 green, sole red is link 48"* — is
**arithmetically impossible**, and the impossibility is instructive.
`validate:all` is a `&&` chain: it stops at the first non-zero exit. If link 48
is red, links 49–52 never execute, so the most that can be green is 47. "51
green" would require the chain to have continued past its own failure. The
measured shape is **47 green · 1 red · 4 unreached**, and the four unreached
links (`validate:licenses`, `validate:tree-shake`, `validate:evidence-binding`,
`validate:deprecations`) have **no current measurement at all** while D174/D175
stays open — including link 51, which S0-O1 built specifically to catch stale
evidence. Worth an owner's attention: the icon decision is silently suppressing
four gates, one of them the evidence-binding gate.

**Link count: 52 → 52.** No link was added. That is deliberate and is argued in
§7: the platform check is *environment*-dependent and would be a permanent red
on every non-linux developer machine, so it lives in the two lane scripts;
the *repository-state* half lives in link 23 `validate:visual-baselines`, which
needs no browser.

**One ordering caveat, stated rather than hidden.** The last source edit —
making `preflight-platform.ts` read its lane list from the ledger instead of a
hardcoded copy — landed while the `validate:all` chain was already past its
typecheck and lint links. Those two were therefore re-verified standalone
afterwards, by module path (`node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
-p tsconfig.json` → **0**; `node node_modules/eslint/bin/eslint.js
e2e/visual/preflight-platform.ts` → **0**), and the file is not read by any
validator in the chain. `yarn visual:platform` was re-run after the edit and
still refuses correctly (exit 1), and an unknown lane id now names the declared
set from the ledger rather than a second list that would drift silently.

### 6.1 Maturity level reached

Per `<evidence_rules>`, this task reaches **aggregate-qualified** and no further.

- **specified → implemented → focused-validated → aggregate-qualified** ✔
- **browser-qualified** — partially: `yarn test:e2e:visual:pilot` ran a real
  Chromium against a real Storybook build and passed 24/24 **on win32 only**.
  The two gate lanes have *not* been browser-qualified in this task, because
  doing so requires a linux host.
- **packaged / released** — not reached, and not attempted.

Everything above is **locally qualified**: measured on one machine, on a dirty
worktree, never in CI. It is not CI, release or production evidence.

### 6.2 What is red, and whose it is

| red | pre-existing or new | owner |
|---|---|---|
| `validate:all` link 48 `validate:peers` | **pre-existing** — open decision D174/D175 (icon swap), red since before this task | not this task's |
| `yarn test:e2e:visual` on win32 (exit 1) | **new, and intended** — this is the deliverable. It is a refusal, not a failure: the lane declines to compare linux baselines on a win32 host | resolved by running on linux |
| `yarn test:e2e` (all 24 Playwright projects) on win32 | **improved, still red** — before this task the visual specs inside it wrote 34 PNGs per project and failed ~102 times; now they register **one** refusal per project worker and write nothing | resolved by running on linux |
| `validate:all` link 33 `validate:docs-pages` | **new, caused by this task, and CLOSED** — see below | this task; fixed |

### 6.3 The one new red this task caused, and how it was closed

The first end-to-end `validate:all` **stopped at link 33** with seven stale
generated pages (`apps/docs/evidence/{index,capability-matrix,at-matrix,accessibility,browser-support,styling-posture}.md`
and `.vitepress/generated/nav.json`). Cause: regenerating
`capability-matrix.json` (schema 1.2.0 + the new `gate` field + a rewritten
visual `note`) made every page derived from it disagree with a fresh render.

This is the documented consequence of the regeneration order in
`<generated_authority>` — *ownership → quality → capability → component-meta →
llms → **docs-pages** → playground seeds* — and the fix is to finish the order,
not to edit a generated page:

```
yarn generate:docs-pages   → exit 0
yarn validate:docs-pages   → exit 0
  ✓ 144 component pages + index + 6 evidence pages + nav + playground seeds
    evidence: 1662 capability cells (400 unrun, 22 stale) · AT cells executed 0/534
```

Two things worth recording about it:

- **The first run's reading was worthless past link 33 and is not quoted.**
  `validate:all` is a `&&` chain, so links 34–52 — including link 48
  `validate:peers`, the known pre-existing red — were never reached. The chain
  was therefore re-run **end to end** after the fix, and only that second run is
  quoted above. A "51 green" claim built from a chain that stopped two-thirds of
  the way through would be exactly the kind of aggregate this repository has
  already been burned by.
- **It confirms the visual input really is wired into the matrix.** A change to
  `e2e/visual/visual-baselines.json` propagated through the capability matrix
  into 7 generated evidence pages. That is the `<task>` item 5 property —
  "a visual cell is evidence, not a side artifact" — demonstrated by a gate
  noticing, rather than asserted.

**Net: no new red remains in `validate:all`, `build`, `typecheck`, `lint` or
`test`.**

---

## 7. Ratchet movements (old → new)

| ratchet | old | new | direction | note |
|---|---|---|---|---|
| `developerLocalLanes.ceiling` | *(did not exist)* | **1** | new, one-way | `packages/tooling/src/validators/visual-baselines-ceilings.json`. Two-way handshake: a rise fails, and a fall fails unless the ceiling is lowered in the same change. Blocked on D-S1O3-1. |
| visual lanes declared as CI gates | 0 (undeclared) | **2 of 3** (`gallery`, `theme-recipe`) | ↑ | Previously no lane declared a role at all. |
| visual-ledger schema | 1.1.0 | **1.2.0** | additive | `+scope.authoritativePlatform`, `+scope.platformAuthority`, `+lanes[]`. |
| capability-matrix schema | 1.1.0 | **1.2.0** | additive | `+inputs[].gate`. |
| capability-matrix `stale` | 22 | **22** | unchanged | All 22 still `perf-baseline`, ceiling 22, owned by TASK-S1-O4. **Not touched.** |
| capability-matrix `unrun` | 400 | **400** | unchanged | Baseline 400 held; per-tier A 65 / B 247 / C 87 / D 1 unchanged. |
| capability-matrix `excepted` | 47 | **47** | unchanged | |
| capability-matrix `fail` | 0 | **0** | unchanged | |
| capability-matrix `pass` / `present` | 585 / 608 | **585 / 608** | unchanged | |
| visual coverage (per-row field) | covered 0 · stale 8 · not-covered 136 | **unchanged** | — | Scope was not widened; widening it is a capture. |

**S1-O2's gates are intact.** `validate:capability-matrix` exits 0 and still
reports `22 stale cell(s) — ceiling 22, blocked on TASK-S1-O4 / owner decision
O2-D1` and `unrun 400 (baseline 400)`. Not one of the 22 `perf-baseline` cells
was read, cleared or altered.

**`validate:all` link count is unchanged at 52.** No new link was added, and
that is a decision, not an oversight: `visual:platform` is
*environment*-dependent — on any developer's non-linux machine it correctly
exits 1, so putting it in `validate:all` would turn a legitimate state into a
permanent red and the lane would be switched off within the week. The half of
this work that is a *repository-state* question (lane declarations coherent, no
gate off the authoritative platform, no lane with zero baselines, no image whose
platform contradicts its lane) went into `validate:visual-baselines`, which is
already link 22 and needs no browser. That split is the same one
`validate:capability-matrix` and `validate:at-matrix` already make.

---

## 8. Owner decisions raised

### D-S1O3-1 — Capture the per-component lane on linux, or retire it 🔴

*The only thing standing between this lane and a real CI gate.*

The 24 per-component baselines are `win32`; every runner is `linux`. The lane is
therefore honest, digested, attributed — and unable to fail a CI run. Capture is
a baseline replacement and is forbidden to every agent in this programme, so it
stops here.

| option | cost | result |
|---|---|---|
| **A — capture on linux (recommended)** | 24 `visual:accept` invocations on a linux host, each with an author and a reason; then 4 bookkeeping edits. Exact commands in `e2e/visual/README.md` §"Promoting the per-component lane". | `component-baselines` becomes a gate; `developerLocalLanes.ceiling` → 0; 8 components move from developer-local to CI-gated pixels. |
| B — capture in a CI job, accept from the artifact | a new `runs-on: ubuntu-latest` job + a human reviewing 24 PNGs | same result, no linux host needed locally, but the acceptance identity becomes "whoever clicked", which is what the authority rule exists to prevent |
| C — retire the per-component lane | delete 24 images, the lane and the spec | the repo keeps only screen-level evidence and loses the "which component moved" answer TASK-N1-O3 had to compute by hand |

**Recommendation: A.** The scope is 8 components; the cost is one sitting. B
trades the thing the ledger is for. C throws away the only lane that answers the
question the other two cannot.

### D-S1O3-2 — The screen-level lanes have no acceptance tool 🟠

`yarn visual:accept` takes `--component` and `--fixture` and drives the
per-component spec only. The 34 `gallery` / `theme-recipe` baselines predate the
authority rule: their digests are gated by `validate:visual-baselines`, but
accepting a change to one means committing the PNG, with no enforced author and
no enforced reason. The two lanes now declared as **gates** are precisely the two
with the weaker acceptance control.

| option | cost | result |
|---|---|---|
| **A — extend `visual:accept` with `--screen` / `--recipe` (recommended)** | ~half a day in `accept-visual-baseline.ts`: a second spec target and two more snapshot-arg shapes | one acceptance path, one authority rule, for all 58 baselines |
| B — leave it, document it | zero | the gates keep the weaker control; the asymmetry is written down but real |
| C — retire the screen-level lanes in favour of per-component | deletes 34 images | loses composition-level evidence entirely; not recommended |

**Recommendation: A**, sized as a follow-on packet rather than smuggled into this
one. Until then the gap is stated in `e2e/visual/README.md` and in the refusal
message itself, which refuses to print a `visual:accept` command for a lane that
command cannot address.

### D-S1O3-3 — Is the visual lane wired into CI at all? 🟠

This task made the lane *able* to gate: two lanes are declared gates, their
images are on the authoritative platform, and a wrong-platform run refuses. **No
workflow file was edited** — adding a job is a CI change, and CI dispatch and
workflow authorship are owner actions under `<authority>`.

| option | cost | result |
|---|---|---|
| **A — add a `visual` job to `ci.yml` (recommended)** | one job: `yarn visual:platform gallery theme-recipe && yarn test:e2e:visual`. `runs-on: ubuntu-latest`, which is already every job. | 34 screen-level baselines become a real gate on every PR |
| B — attach it to the existing e2e job | no new job, but the visual lane's 4-minute gallery build lands in a job that does not need it | slower feedback on unrelated failures |
| C — leave it local | zero | the machinery is proved and unused, which is how it became unowned the first time |

**Recommendation: A.** The preflight makes the job self-diagnosing: if the
runner image ever changes platform, the job refuses by name instead of
silently recapturing.

### D-S1O3-5 — D174/D175 is suppressing four gates, including the evidence-binding one 🟠

Raised as a by-product of measuring, not part of this task's scope, and recorded
because the next agent will otherwise quote a number that was never taken.
`validate:all` stops at link 48, so while the icon-library decision stays open,
links **49 `validate:licenses`, 50 `validate:tree-shake`, 51
`validate:evidence-binding`, 52 `validate:deprecations`** have no measurement.
Link 51 is the gate TASK-S0-O1 built to catch exactly the "artifact stamped
before its inputs changed" failure, and it has not run end-to-end in this
programme's aggregate since D174/D175 opened.

| option | cost | result |
|---|---|---|
| **A — close D174/D175 (recommended)** | an owner decision already prepared | all 52 links measured again |
| B — run links 49–52 individually and record them | ~minutes per packet, forever | the numbers exist but nobody reading `validate:all` sees them |
| C — move `validate:peers` to the end of the chain | one line | the four gates run, but the chain then hides *whichever* link is last to fail; treats the symptom |

**Recommendation: A**, with B as the stopgap any packet can apply today.

### D-S1O3-4 — Widen `scope.families` beyond `buttons` 🟢

136 of 144 components read `not-covered`. Widening is mechanical (add a family;
every component in it is covered through the story the browser matrix already
drives) but each added component costs 2 baseline captures — an owner action.
Recommend deferring until D-S1O3-1 lands, so the capture pass happens once, on
linux, at the final scope. Rough cost: ~2 images per component, ~180 KB per
image at the current viewport.

---

## 9. Ranked next packet

1. **TASK-S1-O4 — performance contract, stale cells 22 → 0.** 🔴 Unblocked by
   this task and by S1-O2; nothing here touched the 22 `perf-baseline` cells or
   their ceiling. It is the last thing holding `capability stale` above zero.
   **Nothing in S1-O3 blocks it.** One useful inheritance: the lane/`gate` idea
   applies directly — `perf-baselines` is the other platform- and
   host-sensitive input in the matrix, its 33 baselines all stamp `4c9fb7a`, and
   it should gain an `inputs[].gate` entry of its own saying on which host they
   are qualified. Recapture is an owner action there too.
2. **D-S1O3-1 — the linux capture pass.** 🔴 One sitting on a linux host, exact
   commands in `e2e/visual/README.md`. Turns 8 components from developer-local
   pixels into CI-gated pixels and drops `developerLocalLanes.ceiling` to 0.
3. **D-S1O3-3 — the `visual` CI job.** 🟠 One `ubuntu-latest` job. The two gate
   lanes are ready *now*; without the job the machinery is proved and unused.
4. **D-S1O3-2 — `visual:accept --screen` / `--recipe`.** 🟠 Closes the
   acceptance-authority asymmetry on the two lanes that are gates.
5. **TASK-S1-O1 — AT matrix wave 1.** 🟠 Unaffected by this task; still
   `0/534`, still needs a human tester. An agent never fills a manual cell.


---

## 10. The owner's capture command, in one place

Everything this task could not do, as a single copy-paste. **On a linux host**,
because `scope.authoritativePlatform` is `linux`:

```bash
# 0. Confirm you are somewhere the lane will accept a capture.
yarn visual:platform                 # expect: every lane ✓ once on linux

# 1. Build what the lane drives.
yarn workspace @dzup-ui/tokens build && yarn storybook:build

# 2. Twenty-four acceptances, one per snapshot. There is no bulk path, by design.
for c in DzButton DzButtonGroup DzCopyButton DzFab DzIconButton DzSpeedDial DzSplitButton DzToggleButton; do
  for t in light dark; do
    yarn visual:accept --component "$c" --theme "$t" \
      --by "<your name>" \
      --reason "First per-component baseline on linux, the authoritative platform. Promotes the lane from developer-local evidence to a CI gate; supersedes the win32 image captured by TASK-N1-O6."
  done
done
for f in text-stress-cjk text-stress-combining-marks text-stress-long-run-4096 text-stress-pseudo-expansion-40; do
  for t in light dark; do
    yarn visual:accept --fixture "$f" --theme "$t" \
      --by "<your name>" \
      --reason "First stress-fixture baseline on linux, the authoritative platform. Records CURRENT overflow behaviour, not desired behaviour — button labels neither wrap nor truncate."
  done
done

# 3. Six bookkeeping edits, in the same change. The gate fails until all six land.
#    a. lanes[component-baselines].capturedOn -> "linux", role -> "gate", drop notGating
#    b. scope.platform -> "linux"
#    c. delete the 24 *-chromium-win32.png images AND their ledger entries
#    d. visual-baselines-ceilings.json: developerLocalLanes.ceiling -> 0
#    e. package.json: add component-baselines to `visual:platform` args and the
#       spec to the `test:e2e:visual` playwright invocation
#    f. yarn generate:capability-matrix && yarn generate:docs-pages

# 4. Prove it.
yarn validate:visual-baselines && yarn test:e2e:visual && yarn validate:all
```

Step 3(c) is not optional tidying: while a lane holds images for two platforms
`checkLaneAuthority` fails and names the half-finished migration, and
`visual:accept` itself refuses a capture on any platform that is neither the
lane's own nor the authoritative one.

**The reason text above is a template, not a script to run verbatim.** The
authority rule exists so that a baseline carries a cause somebody wrote after
looking at the image. A loop that pastes the same sentence 24 times satisfies the
validator and defeats the control — which is precisely the failure
`e2e/visual/README.md` describes as "anyone willing to run the accept tool
without reading the diff". Look at each diff first; the loop is here to save
typing the flags, not the thinking.
