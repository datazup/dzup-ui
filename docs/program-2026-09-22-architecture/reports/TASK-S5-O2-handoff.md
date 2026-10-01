# TASK-S5-O2 — Toolchain migration execution (handoff)

> Repository: `ui/dzup-ui` (OSS, scope `@dzup-ui/*`).
> Commit measured: **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`** (`4e4e46f`).
> Worktree **not clean** by design — the dirty paths of sixteen prior tasks of
> this programme, uncommitted because the owner commits. Nothing here was
> reverted, stashed, checked out or cleaned.
> **No commit, push, CI dispatch, publish or deployment was performed.**
>
> *Written incrementally while the task ran, in the order the conventions
> require. §1 was written before any slice started; §8 last.*

## 0. done_check outcome (run first, before reading the prompt)

Run from `ui/dzup-ui` at `4e4e46f`. Exit codes read **directly**, never
through a pipe.

| # | Clause | Result | Exit | Verdict |
|---|---|---|---|---|
| 1 | `ls …/TASK-S5-O2-slice-*.md` | `No such file or directory` | 2 | **fail** — no slice evidence existed |
| 2 | `node -e "…packages/nuxt/package.json…"` | `{"@dzup-ui/contracts":"workspace:*","@nuxt/kit":"4.5.2"}` / `{…,"nuxt":">=3.0.0"}` | 0 | **informational, not a check** (§9) |
| 3 | `grep -rn 'browser' vitest.config.* … \| head -3` | matched `vitest.config.ts:144: *     in a real browser instead.` | 0 | **false green** (§9) |
| 4 | `ls …/TASK-S5-O2-vapor-statement.md` | `No such file or directory` | 2 | **fail** |

**Outcome: 1 of 4 at `4e4e46f`**, and the one that "passed" cannot fail.
README §4 → *no deciding clause passes* → run the task in full. §9 records the
two defective clauses.

## 1. First measurement — does the Vitest browser lane work on this machine?

TASK-S3-O2 recommended this as the first thing to measure and reported "3
attempts over ~32 minutes with **no browser process ever starting**". That
characterisation is **wrong in the way that matters**, and correcting it is the
most useful single fact this task produced.

### 1.1 The lane, run bounded on one story file

```
cd apps/storybook
node ../../node_modules/vitest/vitest.mjs run --project=storybook \
  ../../packages/core/stories/forms/AsyncOptionsStates.stories.ts
```

Result: **killed by a 420 s timeout, exit 124** (the wrapper's kill, not
vitest's own code). Vitest's own summary before the kill:

```
RUN v3.2.6  …/apps/storybook
Error: [vitest] Browser connection was closed while running tests.
        Was the page closed unexpectedly?
  at WebSocket ../../node_modules/@vitest/browser/dist/index.js:3071:16
Test Files  (1)
     Tests  no tests
    Errors  1 error
  Duration  415.05s (transform 0ms, collect 0ms, tests 0ms, environment 0ms)
```

**The browser starts and connects, then the page dies.** A WebSocket was
established and `emitClose` fired — that cannot happen without a browser page.
So the failure is not "no browser process": it is **orchestration**, and
`collect 0ms` says the run never reached collection.

### 1.2 Playwright and the browser binary are NOT the fault — measured

The app-local Playwright (`apps/storybook` sets
`installConfig.hoistingLimits: "workspaces"`, so it holds its own copy) launches
chromium and renders a page in **236 ms**:

```
playwright 1.61.1  ->  apps/storybook/node_modules/playwright
@vitest/browser 3.2.6
LAUNCH OK ok 149.0.7827.55 236ms          # exit 0
```

`C:/Users/Ekii/AppData/Local/ms-playwright` holds `chromium-1228`,
`chromium_headless_shell-1228` (plus the 1217 pair), firefox and webkit. The
browser layer is healthy. **The defect is between `@vitest/browser@3.2.6` and
the page it serves**, on win32, and it is a **regression**: R5-O9 ran this same
lane on 2026-09-18 to `exit 1`, 5 failed / 1,448 passed (1,453) in 169 files, on
a tree whose `apps/storybook` dependencies have not changed since.

**Consequence, stated before slice 3 ran:** the repository's *only* browser-mode
lane does not complete here, so no claim about browser mode could be measured
through it. Slice 3 therefore entered browser mode a **second, independent** way,
to separate "browser mode is broken here" from "the Storybook addon lane is
broken here". It is the latter: **browser mode itself works** (slice 3 §2.2).

## 2. Implemented files + API effect

| File | Change | API effect |
|---|---|---|
| `packages/nuxt/README.md` | **the only source-tree write in this task.** Line 3 "**Nuxt 3** module" → "Nuxt module … built against `@nuxt/kit` v4 and supports **both Nuxt 3 and Nuxt 4**". §"Supported Nuxt versions": the stale sentence *"The fixtures build on **Nuxt 3.21.11**"* replaced by the measured `engines` table, the two real matrix pins (`3.19.0`, `4.4.5`), why they are pinned rather than ranged, and an explicit statement that the floor is **not** being narrowed | **none.** Prose only, outside every `validate:doc-snippets` snippet block and outside every `facts:*` region |
| `…/reports/TASK-S5-O2-slice-vue-3.6.md` | new — slice 1 evidence | — |
| `…/reports/TASK-S5-O2-slice-nuxt-4.md` | new — slice 2 evidence | — |
| `…/reports/TASK-S5-O2-slice-vitest-browser-mode.md` | new — slice 3 evidence | — |
| `…/reports/TASK-S5-O2-slice-tsdown-vite-8.md` | new — slice 4 evidence | — |
| `…/reports/TASK-S5-O2-vapor-statement.md` | new — the Vapor-interop compatibility statement | — |
| `…/reports/TASK-S5-O2-handoff.md` | this file | — |
| `…/reports/owner-decision-register-2026-09-22.md` | **§8.5 appended** (§7) | — |
| `…/EXECUTION-STATUS.md` | TASK-S5-O2 row + the closing summary line | — |

**Nothing was landed that the owner has not scheduled.** The README correction is
a *documentation defect fix*, not a cutover: the cutover this slice was asked to
prepare — narrowing `peerDependencies.nuxt` — was **not** performed.
**Revert:** that file was **already dirty at START** (another packet's work), so
`git checkout -- packages/nuxt/README.md` would destroy that packet's edits too.
The safe revert is to re-apply the two original paragraphs by hand; both are
quoted verbatim in `TASK-S5-O2-slice-nuxt-4.md` §2.3.

Two throwaway artifacts existed during the task and **both are gone**: the probe
directory `.s5o2-probe/` (`rm -rf`, never added to `.gitignore`) and the
throwaway worktree at `C:/Users/Ekii/AppData/Local/Temp/s5w`
(`git worktree remove --force` + prune + `rm -rf`; `ls` now returns
`No such file or directory` and `git worktree list` shows **one** entry).

## 3. The four slices — one line each

| # | Slice | Target | Landed | Verdict | Window |
|---|---|---|---|---|---|
| 1 | **Vue 3.6** | `vue@3.6.0-rc.9` (lane pins rc.6) | no — nothing in the shared tree changes | **GO** — install clean, typecheck **0**, **4,870/4,870**, Vapor verified for real | **~10 min** to repin the lane, then one owner dispatch |
| 2 | **Nuxt 4** | `@nuxt/kit` v4 + the peer range | **kit retarget already landed before this task**; README corrected | **NO-GO on narrowing the peer range** — the packet's premise is falsified by the registry | ~40 min to run the missing `3.19.0` matrix leg |
| 3 | **Vitest 4 / browser mode** | `vitest@4.1.11`, browser mode | no | **NO-GO on the runner** (D91); **GO on a boundary move**, but third in line | ~2 h runner · ~8 h spec rewrite · ~4 h migration |
| 4 | **tsdown / Vite 8** | `tsdown@0.21.10`, `vite@8.3.1` | no | **NO-GO tsdown** (three grounds, now measured) · **Vite 8 conditional GO that nothing is asking for** | ~3 h Vite 8 after D91 |

Each has its own evidence document, as `<done_check>` clause 1 requires. **None
of the four landed a cutover** — a document exists for each anyway, recording
*why*, so the owner is not left guessing which slice has no file because it
failed versus because nobody looked.

### 3.1 The one-line summary of each slice's headline number

- **Vue 3.6:** `vue@3.6.0-rc.9` installed in a throwaway worktree; `vue-tsc`
  **exit 0, zero errors**; `vitest run packages/core/src` → **340 files, 4,870
  passed, 1 skipped, exit 0**. The alien-signals reactivity rewrite breaks
  nothing here. Vapor interop **verified for real** (previous evidence was rc.6).
- **Nuxt 4:** `nuxt@3.21.11` was published **2026-08-05**, five days *after* the
  claimed EOL and on the same day as `nuxt@4.5.2`. `nuxt` ≤ 4.4.5 admits Node
  20.19.0; **≥ 4.4.6 does not**, and `latest` (4.5.2) now demands `^22.19.0`. So
  narrowing to `>=4.0.0` would drop a still-shipping major **and** admit versions
  the declared Node floor forbids.
- **Vitest browser mode:** works. **2.7× faster than jsdom** on 153 specs
  (22.32 s vs 60.28 s), 2,058/2,071 passing; all **13** failures triage to
  test-harness assumptions, **0** to component source. The blocker is **25 specs
  repo-wide that do `document.body.innerHTML = ''`** — 12 of them in `overlays`,
  which is exactly the 12 files that failed.
- **tsdown / Vite 8:** Vite 8 builds `tokens` with an **identical file list and
  byte-identical declarations**, and a 3-file JS delta with a visible bundler
  explanation. tsdown builds too — into **23 files instead of 48**, `.mjs`/`.d.mts`
  instead of `.js`/`.d.ts`, **16 source maps to 0**, and **both declared `exports`
  targets missing**.

## 4. Aggregate qualification — what ran, what is red, whose fault it is

Exact commands and exit codes in §8. The standing reds, all **pre-existing**,
none introduced here:

| Red | Where | Pre-existing? | Class |
|---|---|---|---|
| `validate:all` exits **1 at link 51 of 59** | `validate:peers`' second command `validate:icon-duplicates` — `lucide-vue-next` 0.475.0 **and** 0.477.0 in one tree | **yes** — register row #3; fixed on `origin/main`, not on this checkout | **tooling**, not a component failure |
| `yarn storybook:test` never completes | the repository's only browser-mode lane | **yes as of today, but NEW since 2026-09-18** | **tooling** — `D-S5O2-1`, found by this task (§1) |

**Reported separately, as `<validation>` requires:** every failure this task
observed is a **tooling** failure. **Zero component failures were found or
introduced** — the library passed 4,870 tests under an unreleased Vue and 2,058
tests in a real browser, and all 13 browser-mode failures triaged to test-harness
assumptions rather than to component source. The `<stop_conditions>` clause *"a
slice would require changing component source to pass"* **did not fire in any
slice**.

## 5. Ratchet movements (old → new)

| Ratchet | Old | New | Note |
|---|---|---|---|
| `validate:all` chain links | 59 | **59 — unchanged** | measured with `node -e`, never quoted |
| Pending changesets | 42 | **42 — unchanged** | measured with `validate:release-policy`; `find .changeset -name '*.md' -not -name README.md` independently agrees. **The register's correction to "41" is itself stale** — §7 |
| `maxProposedCitedFromCode` | 3 | **3 — untouched** | no ADR status changed |
| Measured browser failures | (no record) | **13 recorded, 0 are component defects** | new evidence. **Not** a ceiling: no ratchet was raised and no allowlist widened anywhere in this task |
| Generated artifacts (ownership → quality → capability → component-meta → llms → docs-pages) | — | **not regenerated, deliberately** | this task changed no component, no export, no token and no public API, so the sanctioned regeneration order was never entered. The one write is prose in a package README |

## 6. Owner decisions raised (numbered, with options and a recommendation)

1. **`D-S5O2-1` 🔴 — the only browser-mode lane regressed, and no gate says so.**
   `yarn storybook:test` opens a browser, connects, and the page dies before
   collection (415 s, `collect 0ms`, `no tests`); R5-O9 ran it to 1,453
   assertions on 2026-09-18. It is **not** in `validate:all`, so the aggregate is
   green while 1,453 story assertions and the `addon-a11y` axe pass are silently
   unrun. **(a)** diagnose and fix, then add a **smoke** link asserting the lane
   *collects at least one test* (not that it passes) · **(b)** leave it and mark
   the story-DoD evidence `unrun` with this reason · **(c)** drop the lane.
   **Recommendation (a)** — (b) is honest but loses the repository's only
   browser-qualified component evidence; (c) throws away the thing slice 3 shows
   is worth having.
2. **`D-S5O2-2` 🟢 — the Nuxt support range is prose, and prose drifted twice.**
   `packages/nuxt/README.md` is in `FACT_DOCUMENTS` and carries **0** fact
   regions — the gate reports it itself: `packages/nuxt/README.md: no fact
   markers (0 region(s))`. **(a)** add a `facts:nuxt-support` region modelled on
   `renderVapor`, reading `peerDependencies.nuxt`, `dependencies["@nuxt/kit"]`
   and the matrix pins (lifted out of the YAML into a `nuxt-majors.json` beside
   `vue-next-lane.json`, so one file is the truth for both CI and the README) ·
   **(b)** leave it as prose · **(c)** remove the file from `FACT_DOCUMENTS` so
   the list stops implying coverage it has not got.
   **Recommendation (a), as its own packet** — see §9 for why it was not built
   here.
3. **`D-S5O2-3` 🟠 — `validate:engines` cannot see a build-tool floor breach.**
   `GATE_DEPENDENCIES` is
   `['vite','vitest','eslint','tsx','typescript','jsdom','@playwright/test']`;
   **`tsdown` and `rolldown` are both absent.** Measured in slice 4: installing
   `tsdown@0.21.10` silently downgraded hoisted `rolldown` 1.2.11 →
   **1.0.0-rc.17** and split it against Vite's nested copy, with no warning and
   no gate movement. **(a)** add both to the array · **(b)** leave it.
   **Recommendation (a)** — ~30 min, one array and a test.
4. **`D95` is no longer a prediction — it is measured, and it needs a gate.**
   Bumping `vite` to `^8` while `vitest` is 3.2.6 gives `yarn install` **exit 0
   with zero peer warnings**, hoisted `vite@8.3.1` building the packages and a
   nested `vite@7.3.5` transforming every test lane — and the suite runs
   **282/282 green** in that state. Nothing in the repository can detect it:
   `validate:engines` reads the *hoisted* vite and would pass; `validate:peers`
   reads declared peers, not installed duplicates. **(a)** add a
   one-major-per-tree assertion · **(b)** rely on the memo's sequencing note.
   **Recommendation (a)** — the cheapest protection against the single most
   plausible accidental toolchain break in this repository.
5. **`D-S2O4-1` (existing) — repin the Vue lane rc.6 → rc.9.** Now backed by a
   full green run at rc.9 (typecheck 0, 4,870/4,870, Vapor verified). ~10 min,
   one JSON file, six string values, no install. **Recommendation: take it**, and
   dispatch `vue-next.yml` once afterwards — its three historical runs all
   measured the wrong Vue, so the lane has never produced a valid record.
6. **`D91` (existing) is the keystone, and it is cheaper than it looks.** It is
   the **only** thing blocking Vitest 4, and Vitest 4 is the **only** thing
   blocking Vite 8 — one decision releases two slices. R5-O9 §7.4c proved the
   coverage drop is *not caused by Vitest 4*
   (`vitest@3.2.6 --coverage.experimentalAstAwareRemapping=true` reproduces it to
   the digit), so **D91 can be taken with Vitest 4 nowhere near the tree**, and
   afterwards the migration is coverage-neutral.

## 7. Register interaction — §8.5 appended, and one correction

**The toolchain cutover windows were never carried into the owner-decision
register.** README §7 item **11** names them as an open owner decision. Measured
against the register at `4e4e46f`:

```
grep -c <id> owner-decision-register-2026-09-22.md
  D85 0 · D91 0 · D95 0 · D96 0 · D-S2O4-1 0
  "cutover" 0 · "tsdown" 0 · "Vite 8" 0
```

**Zero hits for all eight.** Same defect class the register already records in
§8.1 (three deployment decisions dropped) and §8.4 (the three README §7 item-9
decisions dropped): **dropped, not closed** — they appear in neither §6.1
(consolidated), §6.2 (superseded) nor §6.3 (out of scope). A **§8.5** addendum
restores them, **appended rather than inserted**, so no row number above moves
and no row above is edited.

**A correction, made because falsifying a row obliges it.** Part-A row #1 carries
*"~~42~~ **41** pending changesets (corrected 2026-09-24 by TASK-S2-O3: `ls
.changeset/*.md` counts `.changeset/README.md` …)"*. The *reasoning* is right and
the *number is now wrong*. Measured today, two independent ways:

```
node node_modules/tsx/dist/cli.mjs packages/tooling/scripts/validate-release-policy.ts
  -> "… 42 pending changeset(s), 0 major, 0 mixed …"
find .changeset -name '*.md' -not -name 'README.md' | wc -l   -> 42
ls .changeset/*.md | wc -l                                    -> 43   (the README)
```

**42, not 41.** The likely cause is a changeset added by a task that ran *after*
S2-O3 measured — which is exactly why the register's own row **#41** conclusion
applies here too: *a number that has never been right for a whole day should not
be written in prose.*

## 8. Final validation — exact commands and exit codes

Every command below was run from `ui/dzup-ui` at `4e4e46f`, written to a
**repo-local/scratchpad log** (`/tmp` is not writable on this machine), and its
exit code **read from the log file, never through a pipe**.

### 8.1 Focused validation — the two gates this task's one edit could touch

| Command | Exit | Output |
|---|---|---|
| `yarn validate:readme-facts` | **0** | `✓ readme-facts: 6 generated region(s) across the repository` — and, from the gate's own mouth, `packages/nuxt/README.md: no fact markers (0 region(s))`, which is the evidence for `D-S5O2-2` |
| `yarn validate:doc-snippets` | **0** | `✓ doc-snippets: 20 fixture-backed snippet(s) match their fixtures` |

### 8.2 The full ladder

| Command | Exit | Result |
|---|---|---|
| `yarn typecheck` | **0** | — |
| `yarn typecheck:tooling` | **0** | — |
| `yarn lint` | **0** | — |
| `yarn build` | **0** | `✓ built in 15.45s`; `[vite:dts] Declaration files built in 15042ms` |
| `yarn test` | **0** | **572 files passed (572)** · **11,126 passed \| 3 skipped \| 1 todo (11,130)** · 342.10 s |
| `yarn validate:all` | **1** | **59 links** (measured, never quoted); **33 lanes printed a green line**; **stops at link 51** |

**`yarn test` needed no re-run.** The known load-related "exit 1 with zero failing
tests" flake did **not** occur: one run, exit 0, and the totals match the
pre-task baseline **exactly** (572 / 11,126 / 0 failed). Since this task changed
no source, an exact match is the expected result and it is what happened.

### 8.3 The one red — pre-existing, and not this task's

```
✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
    lucide-vue-next@0.475.0  declared as "^0.475.0" by @dzup-ui/landing, @dzup-ui/sandbox
    lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core
1 icon-library violation(s).
```

**Link 51 is `validate:peers`; `validate:peers` itself passes** — the failing half
is its second chained command **`validate:icon-duplicates`** (register row #3,
D174/D175, and S0-O2's correction confirmed verbatim again). **No new red.** The
only other failing lane this task observed, `yarn storybook:test`, is
**pre-existing as of today but new since 2026-09-18** and is raised as
`D-S5O2-1`; it is not part of `validate:all`, which is precisely the problem.

**Links 52–59 are unreached in the aggregate and each exits 0 individually** —
verified both ways rather than assumed:

| Link | Gate | In the aggregate log? | Individually |
|---|---|---|---|
| 52 | `validate:licenses` | absent → unreached | **0** |
| 53 | `validate:tree-shake` | absent → unreached | **0** |
| 54 | `validate:evidence-binding` | absent → unreached | **0** |
| 55 | `validate:deprecations` | absent → unreached | **0** |
| 56 | `validate:adr-status` | absent → unreached | **0** |
| 57 | `validate:at-runs` | absent → unreached | **0** |
| 58 | `validate:docs-freshness` | absent → unreached | **0** |
| 59 | `validate:runtime-floor` | absent → unreached | **0** |

Every gate appended since S0-O1 therefore remains **locally qualified, not
aggregate-qualified**. *Incidental correction:* `validate:tree-shake` now exits
**0**; R5-O9's 2026-09-17 baseline recorded it **red with 3 FAILs** (`F-2`). It
was fixed by a later task in this programme, and any report still citing that red
is quoting a stale state.

### 8.4 The harness hazard, observed a second time

The register (S0-O2) records *"a background-task completion notice reported 'exit
code 0' for `validate:all` while the gate exited **1** — the wrapper's status, not
the gate's."* **It happened again here, identically:** the task-completion notice
for the `validate:all` run read `completed (exit code 0)` while the log's own last
line read `VALIDATE_ALL_EXIT=1`. The only reason this handoff reports **1** is
that the exit code was written into the log by the command itself and read back
from the file. **Second confirmed occurrence — the register should promote this
from an observation to a rule:** never accept a wrapper's status for a gate;
append `; echo "EXIT=$?"` to the redirect and read the file.

### 8.5 Proof the install state is unchanged — re-verified after every run

| Check | START | **END (after all runs above)** |
|---|---|---|
| `sha256sum -c` on `yarn.lock` + `package.json` | `6332fae9…87adb` / `a9eb7c4a…52498` | **`yarn.lock: OK` · `package.json: OK` · exit 0** |
| `git status --porcelain -- yarn.lock package.json` | ` M package.json` | **` M package.json` — unchanged** (pre-existing, another packet) |
| `node_modules` spot-check | `vue 3.5.31` · `reka-ui 2.9.2` · `vitest 3.2.6` · `vite 7.3.5` · `@nuxt/kit 4.5.2` · `nuxt 4.4.5` | **all six identical** |
| `tsdown` resolvable? | no | **no** — `require('tsdown/package.json')` still throws |
| `rolldown` hoisted? | no | **no** |
| `git worktree list` | 1 entry | **1 entry** — the throwaway worktree removed, pruned, directory gone |
| `git status --porcelain` | **289 paths** | **289 paths, and `diff` against the START listing exits 0 — byte-identical** |

The porcelain is byte-identical because the new report documents land inside
`docs/program-2026-09-22-architecture/reports/`, already a single `??` directory
entry, and `packages/nuxt/README.md` was already ` M`.

**One residue was created and removed, and it is a finding.** The browser-mode
probes wrote **133 failure screenshots** into
`packages/core/src/components/{data,layout,media,overlays}/__screenshots__/` —
**inside `src/`, and not gitignored** (`git check-ignore` returns no match). All
133 were deleted; `find packages/core/src -name '__screenshots__'` now returns
**0**. Recorded in the slice-3 document §2.6 as a migration prerequisite: any
adoption of browser mode must gitignore `**/__screenshots__/` in the same change,
or the first red run offers a pile of binaries for commit.

## 9. The two defective `<done_check>` clauses — 17 of 17 in this programme

Register row **#41** predicted this; it holds again, and this prompt contributes a
**new** sub-class worth naming.

**Clause 2 — informational, not a check.**
`node -e "…console.log(JSON.stringify(p.dependencies),JSON.stringify(p.peerDependencies))"`
is glossed in the prompt as *"**shows whether** the `@nuxt/kit` retarget landed
and what Nuxt range is declared"*. It prints two JSON blobs and exits **0**
whatever they contain. There is no value of the repository for which it fails, so
it cannot participate in a done/not-done decision — and it was the **only** clause
of the four that "passed". A check that cannot fail inflates the score of every
prompt that carries one. **Fix:** assert, don't print —
`node -e "…; process.exit(p.dependencies['@nuxt/kit']?.startsWith('4') ? 0 : 1)"`.

**Clause 3 — a false green, twice over.**
`grep -rn 'browser' vitest.config.* packages/*/vitest.config.* 2>/dev/null | head -3`
is glossed as *"shows whether a browser-mode project exists"*. Two independent
defects:

1. **It is a pipe**, so the shell reports `head`'s status and `grep`'s exit code
   is discarded — the repository's own standing rule, and class (iii) in row #41.
2. **Its only match is prose.** Run directly, the single hit is
   `vitest.config.ts:144: *     in a real browser instead.` — a **comment**. It
   returns 0 while the repository has **no browser-mode project at either path
   the clause searches**. The one browser-mode config in the repository is
   `apps/storybook/vitest.config.ts`, which the glob
   `packages/*/vitest.config.*` cannot reach.

So the clause reports "a browser-mode project exists" on the strength of an
English sentence about browsers. **This is a sub-class row #41 does not yet
name: a grep whose pattern matches documentation rather than code.** It is more
dangerous than the `/tmp` and `npx` classes because it produces a *plausible*
green — an agent that trusted it would have skipped slice 3 entirely and never
found `D-S5O2-1`. **Fix:** search for the config key, not the word, and read the
exit code directly —
`grep -rn 'browser:' --include='vitest.config.*' . ; echo "exit $?"`.

**Recorded outcome: `done_check` 1 of 4 at `4e4e46f`**, and the 1 is clause 2,
which cannot fail. Effectively **0 of 3 deciding clauses passed**, and the task
ran in full.

## 10. Ranked next packet

1. **Take `D91`** (~1 h of owner judgement, no code). It is the only blocker of
   Vitest 4, which is the only blocker of Vite 8. One decision releases two of
   this task's four slices, and R5-O9 proved it can be taken on the committed
   runner with `--coverage.experimentalAstAwareRemapping=true`.
2. **Diagnose `D-S5O2-1`** (~3–4 h). The repository's only browser-mode lane is
   dark and no gate says so; 1,453 story assertions and the addon-a11y axe pass
   are silently unrun today.
3. **Repin the Vue lane to `3.6.0-rc.9` and dispatch it once** (~10 min + CI).
   Closes `D-S2O4-1` on measured evidence; the lane's three historical runs all
   measured the wrong Vue.
4. **Add `tsdown` + `rolldown` to `validate:engines`'s `GATE_DEPENDENCIES`, and a
   one-major-per-tree assertion** (`D-S5O2-3`, `D95`) (~1 h together). Two
   silent-split hazards this task reproduced, neither visible to any gate.
5. **Rewrite the 25 `document.body`-owning specs** (~8 h). Better specs under
   jsdom *today*, and the precondition for a 2.7× browser-mode lane. Do
   `overlays` (12 of the 25) first.
6. **Run the `nuxt@3.19.0` matrix leg** (~40 min under Node 20.19.0). The only
   evidence that could legitimately move trigger C1, and the one matrix leg
   nobody has run at this commit.

## 11. Closing section — what the programme's final summary must carry

*Written because this is the last task of the programme. These are things the
ledger or the register currently gets wrong, or does not carry at all.*

**1. The register is missing a whole category, for the third time.** §8.1 found
three deployment decisions dropped; §8.4 found three README §7 item-9 decisions
dropped; **§8.5 (this task) found all eight toolchain decisions dropped** — `grep
-c` returns **0** for `D85`, `D91`, `D95`, `D96`, `D-S2O4-1`, `cutover`, `tsdown`
and `Vite 8`. Three independent tasks each discovered a different missing
category by accident. **The final summary should say plainly that the register is
a harvest of whatever the last few handoffs mentioned, not a closed enumeration
of README §7** — and that the cheapest fix is to walk README §7's twelve items
and assert each one has a row.

**2. Two ledger numbers are stale right now, at the same commit they were
written.** Pending changesets: the register and `EXECUTION-STATUS.md` both say
**41**; the gate says **42**, and so does `find`. `validate:all` links:
`EXECUTION-STATUS.md` states **55**, **58** and **59** in one file; the chain is
**59**. Both fields were "corrected" within the last two days and both aged
within hours. **Recommendation: delete both from prose entirely** and keep only
the probes. `D-S3O2-6` already says this for the link count; it applies verbatim
to the changeset count.

**3. A packet premise was false, and nobody had checked it.** The S5-O2 prompt
asserts *"Nuxt 3 reached EOL 2026-07-31, which makes the `>=3.0.0` floor debate
moot."* `nuxt@3.21.11` shipped **2026-08-05**, paired with `nuxt@4.5.2`, and the
`3x` dist-tag points at it. Acting on that premise would have shipped a breaking,
irreversible peer-range narrowing for no benefit. **This is the strongest
available argument for README §4.6** (*"a packet's stated gap is a hypothesis,
not a fact"*) and the final summary should carry it as the worked example — it is
the only case in the programme where the premise, not the measurement, was the
defect.

**4. Three of this programme's tasks have now corrected a *prior* task's
characterisation, not just its numbers.** S3-O2 reported the browser lane as "no
browser process ever starting"; it starts, connects, and dies at collection — and
the difference decided whether slice 3 was measurable at all. **Successor tasks
should be told to re-run a predecessor's negative result before building on it**,
because a negative result is exactly the kind nobody re-runs.

**5. There is an evidence lane going dark with no gate watching.**
`yarn storybook:test` is not in `validate:all`. It covers 1,453 story assertions
and the only axe pass that runs in a real browser, and it regressed between
2026-09-18 and 2026-09-24 without moving a single number in any ledger. The
programme's ratchet board tracks *measured browser failures → 0*; that ratchet is
currently satisfied by the lane **not running**. **That is the most important
structural finding of this task** and it generalises: any ratchet whose green
state is indistinguishable from "the lane did not run" needs a liveness check,
not just a threshold.

**6. Browser mode writes into `src/` and nothing ignores it.** 133 PNGs across
four families appeared in the source tree from two probe runs (all removed; the
porcelain is byte-identical to START). `**/__screenshots__/` must be gitignored
in the same change that adopts browser mode. Small, but it is the kind of thing
that only a real run finds.

**7. What the owner should schedule first, across the whole programme, is one
decision and one diagnosis:** **D91** (unblocks two toolchain slices at once,
takeable without touching the toolchain) and **`D-S5O2-1`** (restores the
repository's only browser-qualified evidence). Everything else in this task's
ranked list is cheap and can follow in any order.
