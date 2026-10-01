# TASK-S5-O2 · slice 3 — Vitest 4 / browser mode

> **Landed: NO. Measured: YES, in full.** Written so the owner is not left
> guessing which of four slices has no file because it failed versus because
> nobody looked. Repository `ui/dzup-ui`, commit **`4e4e46f`**.
> No commit, push, CI dispatch or publish was performed.

## 1. Declared target and current state — measured

| Thing | Declared | Installed | Read from |
|---|---|---|---|
| `vitest` | `^3.2.4` + **exact `resolutions` 3.2.6** | **3.2.6** | `node_modules/vitest/package.json` |
| `@vitest/browser` | `^3.2.6` | **3.2.6** | root + `apps/storybook` (own copy) |
| `@vitest/coverage-v8` | `^3.2.4`, pinned 3.2.6 | **3.2.6** | — |
| `playwright` | `1.61.1` exact | **1.61.1**, chromium **149.0.7827.55** | `apps/storybook/node_modules` |
| `jsdom` | `^29.0.2` | **29.1.1** | the unit environment |
| Browser-mode projects in the repo | — | **exactly one**: `apps/storybook/vitest.config.ts` (`provider: 'playwright'`, `headless`, `instances: [{browser:'chromium'}]`, name `storybook`) | grep, read directly |

**Registry, re-read 2026-09-24 (`yarn npm info`, never `npx`):**

| Package | `latest` | other tags |
|---|---|---|
| `vitest` | **5.0.1** | `V4` **4.1.11** · `V3` **3.2.7** · `rc` 5.0.0-rc.4 |
| `@vitest/browser` | 5.0.1 | `V3` 3.2.7 |

**Drift since the 2026-09-18 R5-O9 reading: none that changes a decision.**
`V4` is still `4.1.11`; `V3` moved 3.2.6 → **3.2.7**, a patch this repository has
not taken. `vitest@4.1.11` declares `engines.node "^20.0.0 || ^22.0.0 || >=24.0.0"`
— **floor-compatible** with ADR-18's `^20.19.0 || >=22.13.0` — and
`peerDependencies.vite "^6.0.0 || ^7.0.0 || ^8.0.0"`, which is the link slice 4
depends on. `vitest@5` remains **unexecutable** here (`engines.node ^22.12.0`).
In Vitest 4 the browser provider is a separate package,
**`@vitest/browser-playwright@4.1.11`** (peers `vitest 4.1.11`, `playwright *`).

## 2. What breaks — run, not predicted

### 2.1 The repository's only browser-mode lane does not complete here

```
cd apps/storybook
node ../../node_modules/vitest/vitest.mjs run --project=storybook \
  ../../packages/core/stories/forms/AsyncOptionsStates.stories.ts
→ killed at 420 s (exit 124). Vitest's own summary:
  Error: [vitest] Browser connection was closed while running tests.
          Was the page closed unexpectedly?
    at WebSocket ../../node_modules/@vitest/browser/dist/index.js:3071:16
  Test Files (1) · Tests no tests · Errors 1 error
  Duration 415.05s (transform 0ms, collect 0ms, tests 0ms, prepare 0ms)
```

**Correction to TASK-S3-O2**, which reported "3 attempts over ~32 minutes with
no browser process ever starting": a **browser process does start and connect**
— a WebSocket was opened and `emitClose` fired, which cannot happen without a
page — and `collect 0ms` shows the run dies before collection. The defect is
Storybook-lane orchestration, not the browser.

**Playwright and the browser binary are healthy — measured, 236 ms:**

```
# from apps/storybook, using its own hoisted playwright@1.61.1
chromium.launch({headless:true}) -> newPage -> setContent -> textContent
LAUNCH OK ok 149.0.7827.55 236ms        # exit 0
```

R5-O9 ran this same lane on 2026-09-18 to `exit 1`, 5 failed / 1,448 passed
(1,453) in 169 files. It has therefore **regressed between 2026-09-18 and now**,
on a tree whose `apps/storybook` dependencies did not change. That is a defect
in its own right (see §7, `D-S5O2-1`) and it is **not** a Vitest-4 question.

### 2.2 Browser mode itself WORKS here — the decisive measurement

Because the Storybook lane cannot answer the migration question, browser mode was
entered a **second, independent** way: a standalone browser-mode config
(throwaway, deleted — §5) over `@vue/test-utils` component specs. Vitest 3.2.6
**refuses CLI-only browser mode** (`Error: Vitest received --browser flag, but no
project had a browser configuration`), so a config file is required.

| Run | Files | Tests | Result | Wall |
|---|---|---:|---|---|
| `DzSelect.asyncStates.spec.ts` — **jsdom** (root config) | 1 | 21 | **exit 0**, 21 passed | **6.84 s** |
| `DzSelect.asyncStates.spec.ts` — **browser (chromium)** | 1 | 21 | **exit 0**, 21 passed | 11.03 s |

**21 of 21 pass in a real browser.** This is the cheap check TASK-S3-O2 named,
and it answers its question: browser mode is available on this machine.

### 2.3 The interaction-sensitive family — `overlays` (the prompt's own pick)

| Run | Files | Tests | Wall |
|---|---|---|---|
| **jsdom** | **21 passed** (21) | **272 passed** (272) · exit 0 | 13.63 s |
| **browser (chromium)** | 12 failed / 9 passed (21) | **120 failed** / 152 passed (272) · exit 1 | 10.45 s |

**Cause, found and then counted rather than inferred.** The overlay specs take
exclusive ownership of `document.body`:

```ts
// packages/core/src/components/overlays/DzConfirmDialog.contract.spec.ts:31
afterEach(() => { document.body.innerHTML = '' })
```

Legal under jsdom (a fresh document per test file); **catastrophic in browser
mode**, where the runner's own DOM lives in that same body — which is why
`TypeError: Cannot read properties of null (reading 'insertBefore')` appears
inside Vue's patcher. Counted across the repository:

| Family | specs wiping `document.body` | spec files | browser failures |
|---|---:|---:|---:|
| overlays | **12** | 21 | **12 files** |
| forms | 8 | 59 | — |
| feedback | 1 | 39 | — |
| navigation | 1 | 25 | — |
| buttons · cards · data · inputs · layout · media · typography | **0** | 153 | see §2.4 |
| **repo total (`packages/core/src`)** | **25** | **355** | — |

**12 body-wipers in overlays, 12 overlay files failed. The correspondence is
exact.** Also measured: **66** spec files use `attachTo: document.body` and
**71** read `document.body` / `document.querySelector`.

### 2.4 The seven families with zero body-wipers — 153 specs, both environments

| Run | Files | Tests | Wall |
|---|---|---|---|
| **jsdom** | **153 passed** (153) | **2,109 passed** · exit 0 | **60.28 s** |
| **browser (chromium)** | 143 passed / 10 failed (153) | 2,058 passed / **13 failed** (2,071) · exit 1 | **22.32 s** |

**Browser mode is 2.7x faster** (22.32 s vs 60.28 s). The reason is visible in
the phase breakdown: jsdom spends **438.52 s** of aggregate worker time in
`environment`; browser mode spends **0**. The test-count gap (2,109 → 2,071 =
**38**) is fully explained: two files failed to *import*, and those two files
hold exactly 38 tests (`DzCopyButton.spec.ts` + `DzCodeBlock.spec.ts`, verified
by running them alone: `2 passed, 38 passed`).

### 2.5 All 13 failures triaged — **zero are library defects**

| # | Failure | Error, as printed | Class |
|---|---|---|---|
| 1–2 | `DzCopyButton.spec.ts`, `DzCodeBlock.spec.ts` (whole file) | `TypeError: Cannot set property clipboard of #<Navigator> which has only a getter` | **harness** — jsdom allows assigning `navigator.clipboard`; a real browser does not. Fix: `Object.defineProperty`. |
| 3 | `DzImage` aspect-ratio | `expected 'aspect-ratio: 16 / 9;' to contain 'aspect-ratio: 16/9'` | **harness** — the browser **normalises** the CSS value; jsdom preserves the author string. |
| 4–5 | `DzImageComparison` clip-path x2 | `expected 'clip-path: inset(0px 70% 0px 0px);' to contain 'inset(0 70% 0 0)'` | **harness** — same normalisation (`0` → `0px`). |
| 6–7 | `DzImageComparison` pointer mapping x2 | `expected undefined to deeply equal [ 75 ]` / `[ 20 ]` | **jsdom approximation** — real layout geometry vs jsdom's all-zero `getBoundingClientRect`. This is the class the migration exists to expose. |
| 8 | `DzMasonry` reflow | `expected [] to have a length of 3 but got +0` | **jsdom approximation** — a real `ResizeObserver` is asynchronous; the test-environment stub fires synchronously. |
| 9–10 | `DzOrderList` pointer drag x2 | `TypeError: Failed to construct 'DragEvent': Failed to read the 'dataTransfer' property … Failed to convert value to 'DataTransfer'` | **harness** — the spec passes a plain object as `dataTransfer`; Chromium's WebIDL rejects it. Same family as the recorded VTU event limitation. |
| 11–12 | `DzAccordionItem` x2, `DzLightbox` x2 | `expected '' to contain 'Body text'` · `Cannot call classes on an empty DOMWrapper` · `Error: Fallthrough contract (TASK-R5-O6) — DzLightbox:` | **harness** — teleported content is outside `wrapper`. |
| 13 | `DzStack` rtl contract | `expected '' to be truthy` | **harness** — the spec selects `host.find('div > div')`; browser mode mounts inside an extra container, so the descendant selector matches a different element. |

**Not one of the 13 requires a change to component source.** The
`<stop_conditions>` clause *"a slice would require changing component source to
pass"* therefore **does not fire**. Two of the 13 (#6–#8) are genuine
jsdom-approximation findings: the component behaviour is real, the *assertions*
are only satisfiable because jsdom returns zeros.

### 2.6 A migration cost nobody has priced — browser mode writes into `src/`

Found by accident, and it is the kind of thing that only shows up by running the
thing. On every failing browser-mode test Vitest writes a **failure screenshot**
next to the spec:

```
packages/core/src/components/{data,layout,media,overlays}/__screenshots__/
  <SpecFile>.spec.ts/<test name>-1.png
→ 133 PNG files across 4 families, from the two probe runs in §2.3–§2.4
```

**None of it is gitignored** — `git check-ignore -v
packages/core/src/components/media/__screenshots__` returns **no match**, and the
four directories showed up as four new `??` entries in `git status`. So the first
red browser-mode run in CI, or on a contributor's machine, drops a pile of
binaries into the **source tree** and offers them for commit.

All 133 were removed by this task and the worktree's porcelain is byte-identical
to its start state (§5). **Recorded as a migration prerequisite:** any move to
browser mode must add `**/__screenshots__/` to `.gitignore` in the *same* change,
or set `browser.screenshotDirectory` to a gitignored path. It is one line, and it
is invisible until the first failure.

## 3. The boundary, proposed **from measurement** (not from principle)

| Suite class | Environment | Why, measured |
|---|---|---|
| The **153 specs in the 7 zero-body-wiper families** | **browser mode is viable today** | 143/153 files and 2,058/2,071 tests already pass; the 13 failures are 13 assertion rewrites, itemised above, and the lane is **2.7x faster** |
| `overlays` (21) plus the 13 other body-wipers (`forms` 8, `feedback` 1, `navigation` 1) — **25 files repo-wide** | **stay jsdom until rewritten** | 120 of 272 overlay tests fail for one mechanical reason; the rewrite is "own a container, not the document" |
| Non-DOM logic: validators under `packages/tooling/scripts`, `packages/{contracts,testing,mcp,codemods}`, `packages/nuxt/test` (node env, 600 s timeouts) | **jsdom / node — never move** | browser mode buys nothing and costs a browser per file. The memo's invariant ("the unit suite must **not** be re-platformed into browser mode") is re-affirmed by measurement |
| Story-driven browser tests (`apps/storybook`, 1,453 assertions) | **already browser mode, currently broken** | §2.1 — fix before anything else moves |

Sequencing that follows: **fix `D-S5O2-1` → rewrite the 25 body-wipers →
migrate the 7 clean families → only then consider Vitest 4.**

## 4. Revertibility — and what a revert does *not* restore

The Vitest **4** cutover was already executed in full and reverted, byte for
byte, by TASK-R5-O9 phase 2 on 2026-09-18
(`../../program-2026-09-04/reports/TASK-R5-O9-handoff.md` §7.1, §7.8). Its
revert is **proved, not asserted**: 13/13 migration files and 55/55
baseline-manifest files `sha256sum -c` clean, and the restored tree was re-run,
not merely re-hashed.

| Revert | Command | What it does NOT restore |
|---|---|---|
| This slice's measurement | `rm -rf .s5o2-probe/` | nothing — **no dependency, lockfile or committed file was touched** (§5) |
| A Vitest 4 cutover | restore the 9 changed lines across 8 `package.json` files from a pre-edit hashed backup, then `yarn install` | **the coverage ratchet's meaning.** The four re-baselined thresholds are a *judgement* recorded in `vitest.config.ts`; reverting the runner does not un-decide them. Also not restored: `apps/storybook/node_modules` resolution order, and file **mtimes** — which matters here because `pack-fixtures.mjs`'s dist-freshness gate is mtime-based (TASK-S2-O4 §9 hit exactly this) |
| A browser-mode boundary move | `git checkout -- <the migrated spec files>` | **nothing, while uncommitted** — but note that once specs are rewritten to own a container instead of the document, they are *better* specs under jsdom too, so the rewrite is **not** a revertible-only-together change. That is an argument for doing the rewrite as its own packet, independent of any runner move |

## 5. Proof the install state is unchanged

| Check | Before | After |
|---|---|---|
| `sha256sum yarn.lock` | `6332fae9…87adb` | **identical** |
| `sha256sum package.json` | `a9eb7c4a…52498` | **identical** |
| `git status --porcelain -- yarn.lock package.json` | ` M package.json` (pre-existing, another packet) | **unchanged — still exactly that one line** |
| `node_modules` spot-check | `vitest 3.2.6` · `@vitest/browser 3.2.6` · `vite 7.3.5` · `vue 3.5.31` | **unchanged** |
| `git worktree list` | one entry | one entry |
| Probe files | — | `.s5o2-probe/` created and **removed**; it was never added to `.gitignore` and appears in no listing at the end |
| `__screenshots__` residue (§2.6) | — | **133 PNGs across 4 families, all removed.** `find packages/core/src -name '__screenshots__'` → **0** |
| `git status --porcelain` | 289 paths | **289 paths — `diff` against the START listing returns exit 0, i.e. byte-identical.** The new report documents do not add a line because `docs/program-2026-09-22-architecture/reports/` was already a single `??` directory entry, and `packages/nuxt/README.md` was already ` M` |

**No dependency was added, removed or repinned for this slice.** Every
measurement above ran on the committed toolchain.

## 6. Go / no-go, with a costed window

**NO-GO on the Vitest 3 → 4 cutover. GO on a browser-mode boundary move, but
not first, and not as part of the runner upgrade.**

| Move | Verdict | Window | Blocked on |
|---|---|---|---|
| **Vitest 3.2.6 → 4.1.11** | **NO-GO (unchanged from R5-O9)** | ~2 h once unblocked — the change is 9 lines across 8 files and every functional gate is already proven identical | **D91 only** — the owner re-baselines four coverage thresholds. R5-O9 §7.4c proved the drop is *not caused by Vitest 4*: `vitest@3.2.6 --coverage.experimentalAstAwareRemapping=true` reproduces it to the digit. So **D91 can be taken with Vitest 4 nowhere near the tree**, and afterwards the upgrade is coverage-neutral |
| **Fix the Storybook browser lane (`D-S5O2-1`)** | **GO — do this first** | ~3–4 h diagnosis; fix unknown until diagnosed | nothing. It is a **regression since 2026-09-18** and it currently costs the repository its only browser-qualified evidence (1,453 story assertions) |
| **Rewrite the 25 body-wiping specs** | **GO** | ~25 x 20 min ≈ **8 h**, one family per sitting; `overlays` (12) is half of it | nothing — it is an improvement under jsdom too |
| **Move the 7 clean families to browser mode** | **GO, after the two above** | ~4 h (13 assertion rewrites + one config + one script + CI wiring) | nothing technical. Costs one chromium download in CI; buys 2.7x and real geometry |
| **`vitest` 3.2.6 → 3.2.7** | **GO, trivially** | ~15 min | nothing. Unrelated to any of the above; a patch on the pinned `V3` tag |

**What the slice unblocks:** taking **D91** unblocks Vitest 4, and Vitest 4 is
the *only* thing blocking **Vite 8** (slice 4). One decision releases two slices.
**What a no-go forgoes:** a 21 % faster `yarn test` (305 s → 241 s, R5-O9 §7.6),
and browser-mode evidence for the 2 genuine jsdom approximations in §2.5.

## 7. Decision raised

**`D-S5O2-1` 🔴 NEW — the only browser-mode lane in the repository regressed
between 2026-09-18 and 2026-09-24 and no gate says so.** `yarn storybook:test`
opens a browser, connects, and the page dies before collection; it is not part of
`validate:all`, so the aggregate is green while 1,453 story assertions and the
`@storybook/addon-a11y` axe pass are silently unrun. Options: (a) diagnose and
fix, then add a **smoke** link to the chain that asserts the lane *collects at
least one test* (not that it passes) · (b) leave it and mark the story-DoD
evidence `unrun` with this reason · (c) drop the lane. **Recommendation (a)** —
(b) is honest but loses the repository's only browser-qualified component
evidence, and (c) throws away the thing slice 3 shows is worth having.
