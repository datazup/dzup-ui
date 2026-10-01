# TASK-S5-O2 · slice 1 — Vue 3.6 lane

> **Landed: NO (nothing in the shared tree changed). Measured: YES, in full, in
> a throwaway `git worktree`.** Repository `ui/dzup-ui`, commit **`4e4e46f`**.
> No commit, push, CI dispatch or publish was performed.
>
> **This is the half TASK-S2-O4 could not run.** S2-O4 verified the lane's pin
> was *resolvable* but never installed it ("declared dependency set **NO**… the
> one worktree slot went to the lane whose answer nothing else will ever
> produce"). This slice installs it and runs the suite.

## 1. Declared target and current state — measured

| Thing | Declared | Installed (shared tree) | Read from |
|---|---|---|---|
| `vue` (core peer) | **`^3.5.0`** — *proved false by S2-O4*: typecheck fails below 3.5.13 | **3.5.31** | `packages/core/package.json`, `node_modules` |
| `vue` (root dependency) | `^3.5.13` | 3.5.31 | root `package.json` |
| Lane pin | **`3.6.0-rc.6`**, channel `rc` | not installed | `packages/tooling/scripts/vue-next-lane.json` |
| Lane wiring | `.github/workflows/vue-next.yml` job `suite`, `schedule 0 4 * * 1` + `workflow_dispatch`, **`continue-on-error: true`** (advisory) | 3 historical runs, all predating `589be13` | S2-O4 §6.3 |
| Vapor evidence | `packages/core/tests/vapor-interop.spec.ts`, verified only by `yarn test:vue-next:vapor` | present | — |

### 1.1 Upstream re-verified 2026-09-24 — and the drift, reported not silently taken

```
yarn npm info vue --fields dist-tags
→ latest 3.5.43 · rc 3.6.0-rc.9 · beta 3.6.0-beta.17 · alpha 3.6.0-alpha.7
```

| Fact | Memo / lane file | **Today (2026-09-24)** | Consequence |
|---|---|---|---|
| Vue `latest` | 3.5.43 (S2-O4) | **3.5.43 — unchanged** | **Vue 3.6 is NOT GA.** README §8's watch-list item "Vue 3.6 GA" has **not fired**; memo trigger **D1** (the lane becomes blocking the day `vue@latest` is 3.6.x) has **not fired** |
| Lane pin | **`3.6.0-rc.6`** | `rc` tag is **`3.6.0-rc.9`** | **three RCs stale** — confirms `D-S2O4-1`, still open |
| `vue@3.6.0-rc.9` `engines` | — | **`{}`** (none) · peers `{"typescript":"*"}` | no ADR-18 interaction from Vue itself |

**`<no_silent_repin>` compliance, stated plainly: every number below was measured
against `vue@3.6.0-rc.9`, not against the `3.6.0-rc.6` the lane file names.** The
lane file was **not** edited. The proposal is in §6.

## 2. What breaks — run, not predicted

**Method (TASK-S2-O4's standard).** A throwaway `git worktree` at `4e4e46f`,
created with `git -c core.longpaths=true worktree add --detach` at the short path
`C:/Users/Ekii/AppData/Local/Temp/s5w` (the long path fails on Windows `MAX_PATH`
against the visual-baseline snapshot names — S2-O4 §7). All six Vue packages
pinned through root `resolutions`, exactly as `vue-next-lane.json` specifies,
then `yarn install --no-immutable`.

**Stated deviations from the CI job**, rather than glossed:
- the eight already-built `packages/*/dist` directories were **copied** from the
  main checkout instead of running `yarn workspace @dzup-ui/tokens build`. The CI
  job builds tokens under the **default** toolchain before the pin is applied, so
  a dist built at `vue@3.5.31` is what that step produces. The deviation is that
  all eight were copied, not one built. Without it the run cannot start at all:
  `createDzupResolution: @dzup-ui/tokens/css points at ./dist/tokens.css, and
  neither a source equivalent nor the built artifact exists`;
- win32, not `ubuntu-latest`; Node **v24.14.1**, not the lane's literal `20.19.0`;
- the lane runner (`vue-next-lane.mjs`) was **not** invoked — it applies the pin
  to the *shared* tree and restores it. Doing the same thing inside a worktree
  removes the restore risk entirely.

### 2.1 Install — clean

```
resolutions: vue · @vue/compiler-sfc · @vue/runtime-core · @vue/runtime-dom
             · @vue/shared · @vue/server-renderer   all at 3.6.0-rc.9
yarn install --no-immutable          → exit 0, "Done with warnings in 1m 40s"

resolved on disk:
  vue 3.6.0-rc.9 · @vue/runtime-core 3.6.0-rc.9 · @vue/runtime-dom 3.6.0-rc.9
  @vue/compiler-sfc 3.6.0-rc.9 · @vue/shared 3.6.0-rc.9
  @vue/server-renderer 3.6.0-rc.9 · reka-ui 2.9.2 (unchanged, as intended)
```

All six moved together — which is the whole point of `resolutions` over a
dependency bump, and the lane file says so in its own `//` comment.

### 2.2 Typecheck under Vue 3.6 — **0 errors**

```
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p packages/core/tsconfig.json
→ exit 0, 0 lines of output          (21 s)
```

This is the exact target `yarn typecheck` runs. Note `vue-tsc` (3.3.3) and
`vue-component-meta` (3.3.7) were **deliberately not overridden** — the lane
file's `//not-overridden` block explains why, and this run honours it. So the
result is: *the 3.5-era language tooling type-checks this library against the 3.6
runtime types cleanly.*

### 2.3 The suite under Vue 3.6 — **zero failures**

```
node node_modules/vitest/vitest.mjs run packages/core/src
→ exit 0
  Test Files  340 passed (340)
       Tests  4870 passed | 1 skipped (4871)
    Duration  142.12s
```

**340 files, 4,870 tests, 0 failures.** Nothing to triage. The reactivity-sensitive
surface — 17 composables, every `computed`/`watch`/`watchEffect` path in 208 SFCs,
the whole ADR-20 provider chain — passes unchanged under the alien-signals
reactivity rewrite.

That is the headline result, and it is worth naming what it does **not** say:
this is the *unit + contract* suite, which is exactly what the lane's own
`//gates` block scopes it to. It deliberately excludes every generated-artifact
freshness gate (`validate:component-meta`, `validate:llms`, `validate:docs-pages`,
`validate:readme-facts`), because under a different Vue those compare committed
bytes against a fresh extraction and fail on the *extractor*, not on the library.

### 2.4 Vapor interop — **verified for real, under rc.9**

Two runs, because the difference between them is the whole point:

```
# default resolution — the spec REFUSES to claim anything
node node_modules/vitest/vitest.mjs run packages/core/tests/vapor-interop.spec.ts
→ exit 0, 2 passed | 1 skipped
  · vapor-interop: vue 3.6.0-rc.9 — VERIFICATION NOT PERFORMED
  · vapor-interop: UNRUN — vue 3.6.0-rc.9 is 3.6+, but the `vue` module this
    process loaded has no `createVaporApp` — its CJS build carries no Vapor
    runtime … do not quote the Vapor compatibility statement as tested from
    this run. Verify with `yarn test:vue-next:vapor`.

# the single-runtime config — the ONLY run entitled to back the claim
node node_modules/vitest/vitest.mjs run \
  -c packages/tooling/scripts/vue-next.vitest.config.ts \
  packages/core/tests/vapor-interop.spec.ts
→ exit 0, 2 passed | 1 skipped
  · vapor-interop: vue 3.6.0-rc.9 — single Vue runtime with vaporInteropPlugin,
    running for real
```

The second run mounted a real Vapor application (`createVaporApp` +
`defineVaporComponent` + `vaporInteropPlugin`), rendered `DzButton` inside it via
`createComponent`, and asserted the emitted `<button>` and its
`data-tone="primary"`. Previous evidence was under **rc.6**; this is the first
run under **rc.9**, which satisfies memo trigger **D3** ("the Vapor statement is
re-verified on every promotion"). The full statement is
[`./TASK-S5-O2-vapor-statement.md`](./TASK-S5-O2-vapor-statement.md).

## 3. Triage — library defect vs upstream change

**Empty, and that is a result, not an omission.** 0 failures across 4,870 tests
and 0 typecheck errors means there is nothing to classify. The
`<stop_conditions>` clause *"a slice would require changing component source to
pass"* does not fire.

## 4. Revertibility

| Revert | Command | What it does NOT restore |
|---|---|---|
| **This slice** | `git worktree remove --force <path>` then `rm -rf <path>` | **nothing — there is nothing to restore.** The shared tree was never pinned. §5 proves it |
| Repinning the lane to `rc.9` (§6) | `git checkout -- packages/tooling/scripts/vue-next-lane.json` | nothing, while uncommitted. It is a **data** file that is inert until the runner is invoked on purpose |
| Making the lane **blocking** (memo D1) | re-add the two `continue-on-error: true` lines in `vue-next.yml` and move `suite` back out of `ci.yml` | **the merges it blocked in the meantime.** This is the one genuinely one-way step of the four, because a blocking lane on an *unreleased* Vue turns an upstream regression into a merge block here |
| Bumping `dependencies.vue` to `^3.6.0` (memo D2) | `git checkout -- package.json packages/core/package.json && yarn install` | **the published peer range**, once released. Under `VERSIONING.md` (0.x: minor = breaking) narrowing a peer range is a **minor**, i.e. a breaking change, and after publication it cannot be un-published |

**The claim to disprove, addressed:** for slices measured in a throwaway
worktree, "revertible" is not a claim at all — nothing was changed, so nothing is
reverted. The install-state proof in §5 is what makes that checkable rather than
asserted.

## 5. Proof the install state is unchanged

| Check | Before | After |
|---|---|---|
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` | **`sha256sum -c` exit 0 — identical** |
| `sha256sum package.json` | `a9eb7c4af03e949341bb8a64bbfed767f4ca99c4a25d3645a30263f306852498` | **identical** |
| `git status --porcelain -- yarn.lock package.json` | ` M package.json` (pre-existing, another packet) | **unchanged — still exactly that one line** |
| `node_modules` spot-check | `vue 3.5.31` · `reka-ui 2.9.2` · `vitest 3.2.6` · `vite 7.3.5` | **all four unchanged** |
| `git worktree list` | one entry | **one entry** — the throwaway worktree was removed and pruned; its directory is gone (`ls` → `No such file or directory`) |
| `packages/tooling/scripts/vue-next-lane.json` | clean | **clean — not edited** |

## 6. Go / no-go, with a costed window

**GO — but as a *pin refresh and a schedule*, not as a cutover.** There is no
cutover to schedule here: nothing in the shared tree changes, because the lane is
already built and already advisory-by-design.

| Move | Verdict | Window | Evidence |
|---|---|---|---|
| **Repin `vue-next-lane.json` `3.6.0-rc.6` → `3.6.0-rc.9`** | **GO** | **~10 min** — one JSON file, six string values, no install | rc.9 measured green here: install clean, typecheck 0, 4,870/4,870, Vapor verified. Closes `D-S2O4-1` |
| **Dispatch `vue-next.yml`** (owner act) | **GO** | ~15 min of CI | the lane has 3 historical runs, **all measuring the wrong Vue** (S2-O4 §6.3), so it has never produced a valid record. One dispatch after the repin gives it one |
| **Make the lane blocking** (memo D1) | **NO-GO — the trigger has not fired** | — | `vue@latest` is **3.5.43**. A red run under an RC is a fact about an unreleased Vue, not a defect claim here |
| **Bump `dependencies.vue` to `^3.6.0`** (memo D2) | **NO-GO** | — | D2 requires **two consecutive green scheduled runs on a *stable* 3.6**. There have been zero, because 3.6 is not stable |
| **Narrow the `vue` peer `^3.5.0` → `^3.5.13`** | **GO, and unrelated to 3.6** | ~30 min + a changeset | this is `D-S2O4-5`, already measured false by S2-O4 (622 TS errors at the declared floor). It is the *only* genuinely owed change in this slice's area and it is being held behind an unrelated decision |

**What this slice unblocks:** the Vapor statement (delivered), and a lane whose
next scheduled run is finally about the Vue it claims to be about.
**What a "no-go on blocking" forgoes:** nothing measurable — 3.6 is not GA, so a
blocking lane would gate this repository's merges on someone else's RC.

## 7. ADR-18 interaction

**None from Vue.** `vue@3.6.0-rc.9` declares **no `engines`** field at all, so it
admits any Node and cannot conflict with ADR-18's `^20.19.0 || >=22.13.0`.
The ADR-18 pressure in this task comes entirely from **Nuxt** (slice 2) and, in a
different direction, from **tsdown** (slice 4). Recorded here so a future reader
does not attribute it to the Vue lane.
