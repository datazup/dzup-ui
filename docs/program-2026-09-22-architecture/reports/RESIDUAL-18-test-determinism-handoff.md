# RESIDUAL-18 — making `yarn test` deterministic: the rAF-after-teardown leak, and the body-wiping specs

**Repository** `ui/dzup-ui` (OSS, scope `@dzup-ui/*`) · **HEAD** `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`
· **entry dirty paths** 422 → **exit 459** · **date** 2026-09-30

## 0. The two items

1. **`yarn test` exited non-zero on a suite with zero failing tests.** RESIDUAL-17 §5.1 ran it three
   times — exits **1 / 0 / 1**, all three **581 files, 11,500 passed, ZERO failed**. Every non-zero
   exit was vitest `Unhandled Errors`: **58 ×** `ReferenceError: requestAnimationFrame is not
   defined` in `apps/landing`, plus one `[vitest-worker]: Timeout calling "onTaskUpdate"`
   (`D-RES13-2`) and one `chunk load failed`.
2. **The `document.body.innerHTML = ''` specs** — tests that reach around Vue's teardown and wipe
   the mount point mid-suite. The same family of defect as item 1: a test stepping outside the
   framework's own lifecycle instead of using it.

Both are closed by **source** changes, not by relaxing a runner setting. Nothing was silenced:
`dangerouslyIgnoreUnhandledErrors` is still absent from every config, no reporter was filtered, no
`pool`/`isolate` option was touched, and no ceiling or allowlist moved.

---

## 1. Item 1 — the mechanism behind the 58 `requestAnimationFrame` errors

### 1.1 It is one mechanism, not a class of sites

The 58 errors are **not** 58 components with their own rAF loops, nor tests that unmount without
awaiting. Every one of them comes from a single third-party function, reached from a single call
site, with the count determined by the DOM:

```js
// node_modules/@formkit/auto-animate/index.mjs:159
function poll(el) {
  setTimeout(() => {                                          // ← stage 1: id never stored
    intervals.set(el, setInterval(() => lowPriority(updatePos.bind(null, el)), 2000))
  }, Math.round(2000 * Math.random()))                        // ← stage 2: id stored, too late
}

// index.mjs:168
function lowPriority(callback) {
  if (typeof requestIdleCallback === "function") requestIdleCallback(() => callback())
  else requestAnimationFrame(() => callback())                // ← jsdom has no requestIdleCallback
}
```

`poll()` is called **only** from `autoAnimate()` — `forEach(el, updatePos, poll, observe)` at
`index.mjs:689` — and `forEach` walks the parent **plus its direct children**, synchronously. So one
registration schedules exactly `1 + children.length` cold polls, each of which becomes a 2-second
interval that calls `requestAnimationFrame` forever.

`controller.destroy()` can reach **neither** stage:

| Stage | Where the id lives | Why `destroy()` misses it |
|---|---|---|
| 1 — the `setTimeout` | **nowhere** | never stored, so nothing can cancel it. A poll that fires *after* the directive's `unmounted` hook installs a fresh interval into a map no caller can see |
| 2 — the `setInterval` | `intervals`, keyed per node | `destroy()` clears it by walking `parent.children`, which no longer contains a child removed **before** teardown. `cleanUp()` (`index.mjs:499`) deletes a removed node's coords, siblings, animations and IntersectionObserver — but **not** its interval |

**In a browser this is invisible** — nothing tears the page down under it. Under `yarn test` the
file's jsdom environment *is* torn down, the global stops existing, and each surviving interval
raises `ReferenceError: requestAnimationFrame is not defined` from a Node timer with no test to
attach it to. Whether it lands before or after teardown is a race with machine load, which is the
whole of the nondeterminism.

### 1.2 The counts, per site class

| Sites | Where | Registration | Polls scheduled | Observed in RESIDUAL-17 |
|---:|---|---|---:|---|
| 1 | `apps/landing/src/pages/AnimationsPage.vue:556` — `v-auto-animate` on the bento | via the motion barrel's re-export of the npm directive | **1 grid + 1 per catalogue card** | **58** errors from `pages.interactions.spec.ts` (run 3), which mounts the whole app at `/animations` |
| 1 | `apps/landing/src/gallery/demos/AutoAnimateListDemo.vue:56` — `autoAnimate(listRef.value)` | the npm default export, directly | **1 list + 1 per row** (3 rows at mount) | **1** error from `gallery/render.spec.ts` (run 1) |
| 1 | `apps/landing/src/motion/index.ts:190` — the barrel | re-exported `vAutoAnimate` / `useAutoAnimate` straight from `@formkit/auto-animate/vue` | — (the conduit both of the above went through, and what a copied-out registry snippet inherited) | — |

**58 is the bento's own arithmetic**, not a load-dependent number of distinct faults: the grid plus
the cards rendered for the default (unfiltered) category. Run 1's single error is the same mechanism
with a smaller subtree and a luckier race.

`apps/landing/src/pages/AnimationsPage.v2.spec.ts` had already found this — its header quotes
`poll()` and records **127** unhandled errors — and had fixed it **inside that one spec file** by
wrapping `globalThis.setTimeout`/`setInterval`, filtering on whether the stack contained
`auto-animate`, and clearing the residue after every test. That workaround is real engineering, but
it is a test-local patch on a source defect: the two files that had no such patch
(`pages.interactions.spec.ts`, `gallery/render.spec.ts`) went on producing the errors, and any new
spec would have had to copy it.

### 1.3 What was fixed, and where

**A new module owns the timers at the only point that can see both stages:**
`apps/landing/src/motion/autoAnimate.ts`.

For the duration of the single **synchronous** `autoAnimate()` call, `globalThis.setTimeout` is
wrapped so every stage-1 id is recorded; each recorded callback is then itself run with
`globalThis.setInterval` wrapped, so the stage-2 id it installs is recorded too. `destroy()`
delegates to the library's own `destroy()` and then cancels both sets. Both wrappers restore **the
value they replaced** (not a pristine captured one) in a `finally`, so an outer instrumentation — a
test harness, an APM agent — keeps its place in the chain, and neither wrapper is installed for
longer than one synchronous call or one timer callback.

The module also exports a `vAutoAnimate` directive and a `useAutoAnimate` composable over it, with
two further corrections to the library's Vue adapter that are defects in their own right:

- its `watchEffect` re-registers when the template ref changes but **never destroys the controller
  for the element it just left**, so a host swap leaks a whole registration. Here the effect's own
  `onCleanup` destroys what it created, which also covers unmount.
- the returned ref is typed `Ref<T | undefined>`, not `Ref<T>`. It *is* undefined until the element
  mounts, and a consumer told otherwise writes `listRef.value.something`.

| File | Change |
|---|---|
| `apps/landing/src/motion/autoAnimate.ts` | **new** — the tracked `autoAnimate`, `vAutoAnimate`, `useAutoAnimate` |
| `apps/landing/src/motion/index.ts` | the barrel no longer re-exports from `@formkit/auto-animate/vue`; it exports the three names from `./autoAnimate.ts` |
| `apps/landing/src/gallery/demos/AutoAnimateListDemo.vue` | imports `autoAnimate` through the motion barrel instead of from npm |
| `apps/landing/src/pages/AnimationsPage.v2.spec.ts` | **the global-scheduler workaround is deleted** — 32 lines of wrapper, filter and sweep, plus the `afterEach` clear and the `afterAll` restore. `cleanup()` is now the whole teardown |
| `apps/landing/src/motion/autoAnimate.spec.ts` | **new** — 8 tests, the timer contract (§1.4) |
| `apps/landing/public/r/animations/auto-animate-list.json`, `registry.json` | regenerated: the item now bundles `motion/autoAnimate.ts`, so a copied-out snippet inherits the fix |

**This is a product fix, not a test accommodation.** Every visit to `/animations` left one 2-second
interval per card behind, each tick calling `getBoundingClientRect()` on a detached node, for the
lifetime of the document. **No changeset**, because the fix is entirely inside `@dzup-ui/landing`,
which is `private: true` and carries `privatePackages: { version: false }` in `.changeset/config.json`
— a changeset naming it would version nothing. Nothing under `packages/` changed for item 1.

### 1.4 The contract that keeps it fixed

`apps/landing/src/motion/autoAnimate.spec.ts` asserts on **time**, not markup: after the host
unmounts, AutoAnimate must schedule no further frame. Each teardown test is a **pair** — first that
the poll machinery is genuinely armed in the fixture (advance the clock while mounted → frames are
requested), then that teardown silences it (advance the clock after unmount → not one frame).
Without the first half the second would pass on a fixture where AutoAnimate never registered, which
is exactly what a reduced-motion or empty-list fixture would produce.

It carries two guards that will tell the next reader the truth rather than going quiet:

- **`the unwrapped library still schedules a frame after its own destroy()`** — the upstream
  tripwire. If it ever fails, `poll()` has started cancelling its own timers and
  `motion/autoAnimate.ts` can go back to being a re-export. The failure message says so.
- **`AnimationsPage.v2.spec.ts › renders the AutoAnimate branch of the bento, and through the
  wrapped directive`** — replaces the old "still sees the timers it exists to clear" guard. It
  asserts the bento takes its AutoAnimate branch *and* that the barrel's `vAutoAnimate` is the
  wrapper and **not** `@formkit/auto-animate/vue`'s. That second clause is the one that rots
  quietly: anyone "simplifying" `motion/index.ts` back to the npm one-liner brings the 127 errors
  back while every test in that file still passes.

### 1.5 Three comment blocks were edited after run 1, and that is stated

Runs 1–3 ran against a tree that differed from the final one by **three JSDoc comment blocks** in
`DzCascader`, `DzMention` and `DzTagsInput` — a `describe`-count wording correction (8 of 9 blocks
carried a wipe, not 9). Comment-only, lint clean, and no test count changed. **Runs 4 and 5 ran
against the final tree**, so the determinism claim does not rest on the earlier three.

### 1.6 Upstream

The defect is `@formkit/auto-animate`'s: `poll()` stores no handle for its outer `setTimeout`, and
`cleanUp()` does not clear a removed node's interval. Both are quoted with line numbers in
`autoAnimate.ts`'s docstring, and the wrapper is written so that it can be deleted in one edit when
upstream fixes it — with a test that fails on that day to say so. **Nothing about it is outside this
repository's control**: the boundary we own is the barrel, and the barrel is where the fix lives.

---

## 2. Item 2 — the body-wiping specs

### 2.1 The population, recounted

RESIDUAL-03 §5 measured **25** with `grep -rl "document.body.innerHTML = ''" packages/core/src
--include=*.spec.ts`. Re-measured at this HEAD with the same command: **28** — the `forms` row has
grown from 8 to 11 since. The task brief's "29" is that population plus `packages/core/tests/
portal-target.spec.ts`.

The honest total is larger than any of those numbers, because the RESIDUAL-03 scope was
`packages/core/src` only. **Repo-wide, statement form, at entry: 70 sites in 37 files.**

| Where | Files | Sites |
|---|---:|---:|
| `packages/core/src/components/overlays` | 12 | 13 |
| `packages/core/src/components/forms` | 11 | 36 |
| `packages/core/src/components/navigation` | 1 | 1 |
| `packages/core/src/components/feedback` | 1 | 1 |
| **outside `components/`** — `composables/provider/provider-adoption.spec.ts` · `composables/useScrollSpy/useScrollSpy.spec.ts` · `i18n/count-bearing.spec.ts` | **3** | **3** |
| — *subtotal, the RESIDUAL-03 scope* | *28* | *54* |
| `packages/core/security` (3 specs + the shared `boundary-suites.ts` helper) | 4 | 8 |
| `packages/core/tests/portal-target.spec.ts` | 1 | 1 |
| `apps/landing/src` | 4 | 7 |
| **total** | **37** | **70** |

**The 3 outside `components/` are handled**, and each says so in its own header, because RESIDUAL-03
warned that a `components/**` glob would miss them. They were the most worth doing: `count-bearing`
mounts `DzCountdown`, whose ticking interval the wipe left running while the next case installed fake
timers; `useScrollSpy` never ran the composable's `disconnect()`, so its IntersectionObserver kept
observing detached sections; `provider-adoption` left every `DzProvider` subtree mounted, intervals
and scroll listeners included.

### 2.2 All 37 converted; none needed a pristine `body`

**Exit state: `grep -rn "^\s*document\.body\.innerHTML" packages apps e2e` → zero matches.**

Four shapes of replacement, chosen per file by what that file already did:

| Replacement | Files | When |
|---|---:|---|
| `enableAutoUnmount(afterEach)` | **31** | the file mounts through VTU. Matches the four-file precedent already in the repo (`DzDropdownMenu`, `DzContextMenu`, `DzCombobox`, `DzMultiSelect`), which is now a 35-file pattern |
| `cleanup()` alone — the wipe deleted as redundant | **4** | `@testing-library/vue`; `cleanup()` already unmounts and removes the container (`Footer`, `TopNav`, `ThemesPage.copy`, `ThemesPage.v2` — the last also had three *mid-test* wipes after a `cleanup()`, all removed) |
| a locally tracked wrapper list | **1** | `packages/core/security/boundary-suites.ts`. `enableAutoUnmount` **cannot** be used: the helper is called once per binding and a spec file declares several, and VTU throws on a second call. The suite now tracks its own wrappers and unmounts them in `afterEach`, which additionally covers what the wipe never did — a fixture that throws between render and its explicit `unmount()` |
| the wipe deleted, the existing explicit `unmount()` left as the teardown | **1** | `url-boundary.malicious-corpus.spec.ts`, whose one affected case already unmounted. The same reasoning removed three *in-test* wipes inside files that also took `enableAutoUnmount` — `DzConfirmDialog.contract`'s size loop, `DzTreeSelect`'s two-half test and `boundary-suites`' baseline reset — each of which had an explicit `unmount()` on the line above |

Sum is 37 files, each counted once by the shape that replaced its wipes.

**Not one file legitimately needed a pristine `body`.** Every case the wipe appeared to serve was a
teleported or portalled subtree, and unmounting removes a `Teleport`'s children — measured, not
assumed. The clearest case is `DzSelect.contract.spec.ts`, whose comment asserted the opposite:

> *"Reka teleports the panel to the body, and an unmounted wrapper does not always take the
> teleported node with it — so each case starts from a clean document."*

That is refuted here and the comment now records why: **the cases in that block never unmounted at
all** — nothing tracked the wrappers — so the rows survived because the component was still mounted,
not because a Teleport resists unmounting. All 22 tests in the file pass with
`enableAutoUnmount(afterEach)` as the only reset. Three specs whose assertions read the **whole
document** and would have been the strongest candidates for keeping a wipe —
`overlays.anatomy.spec.ts` (`partsInDocument()` scans every `data-part` in the document),
`DzSelect.asyncStates.spec.ts`, `portal-target.spec.ts` — all pass the same way.

**Four nodes are appended to `document.body` by the tests themselves**, not by any component, so no
unmount can know about them. Each is now registered and removed by name, which the wipe was doing
only as a side effect of removing everything: `DzTour.spec.ts` (two step targets + an opener),
`DzTour.contract.spec.ts` (two targets), `DzAnchor.spec.ts` (four sections),
`useScrollSpy.spec.ts` (three sections), plus single hand-made hosts in
`DzConfirmDialog.spec.ts`, `DzConfirmDialog.contract.spec.ts` and `DzPopconfirm.spec.ts`.

**No assertion was deleted, skipped or weakened.** Test counts per file are unchanged; the only
deletions are hook bodies and — in `DzCascader`, `DzMention`, `DzTagsInput`, `DzTimePicker` — the
**28 duplicate per-`describe` hooks** those four files carried (8 + 7 + 8 + 5), replaced by one
`enableAutoUnmount` each. Three of those four files had a `describe` block with **no** wipe at all
(9, 9 and 9 blocks against 8, 7 and 8 hooks), so the single hook also covers blocks that previously
had no teardown — which is the other half of why nine hand-copied hooks is worse than one.

### 2.3 Every converted file, run

Run in eight passes as the conversions landed, each pass a real `vitest run` with the exit code read
from a log file:

| Pass | Files | Result |
|---|---:|---|
| overlays 1 — `DzSheet`, `DzTooltip`, `DzPopover` | 3 | **0** · 35/35 |
| overlays 2 — `DzDialog`, `DzConfirmDialog`, `DzConfirmDialog.contract` | 3 | **0** · 64/64 |
| overlays 3 — `DzCommandPalette`, `DzPopconfirm`, `DzPopconfirm.contract` | 3 | **0** · 48/48 |
| overlays 4 — `DzTour`, `DzTour.contract`, `overlays.anatomy` | 3 | **0** · 40/40 |
| forms 1 — `DzCascader` · then `DzMention`, `DzTagsInput`, `DzTimePicker` | 1 + 3 | **0** · 27/27 · **0** · 84/84 |
| forms 2 — `DzTreeSelect`, `DzSelect.asyncStates`, `DzSelect.contract`, `DzMention.contract`, `DzColorPicker`, `DzDatePicker`, `DzDateRangePicker` | 7 | **0** · 160/160 |
| `DzBlockUI`, `DzAnchor` · the 3 outside `components/` | 2 + 3 | **0** · 22/22 · **0** · 95/95 |
| `packages/core/security` (whole directory) · `portal-target` · the 4 landing specs | 7 + 1 + 4 | **0** · 387/387 · **0** · 6/6 · **0** · 47/47 |

---

## 3. Seeded breaks — four, on SOURCE, each failing exactly one named test

Every one restored **byte-identically**, verified with `sha256sum -c`:

```
apps/landing/src/motion/autoAnimate.ts: OK
packages/core/security/boundary-suites.ts: OK
packages/core/src/composables/useScrollSpy/useScrollSpy.ts: OK
```

### 3.1 The two halves of the item-1 fix are separately load-bearing

| # | Seeded edit (source) | Predicted | Measured |
|---|---|---|---|
| 1a | `autoAnimate.ts` `destroy()` — drop the **stage-1 timeout** cancellation, keep intervals | **3** tests | **1** test: `the wrapper is still needed › the wrapper closes exactly that case` — `expected 28 to be +0` |
| 1b | `autoAnimate.ts` `destroy()` — drop the **stage-2 interval** cancellation, keep timeouts | 1 test | **1** test: `v-auto-animate teardown › cancels a detached row's interval, which the library's own destroy() walks past` — `expected 10 to be +0` |

**The 1a prediction was wrong and the reason is worth keeping.** I predicted that the two
`requests frames while mounted, and none at all after unmount` tests would also fail. They do not:
each advances the clock **5 000 ms before unmounting**, so every stage-1 timeout has already fired
and every interval is in `tracked.intervals` — they exercise stage 2, not stage 1. Only the test
that destroys **inside** the 0–2000 ms poll window depends on stage-1 cancellation, and that is the
one that failed. Symmetrically, 1b fails only the **detached-row** test, because for nodes still
attached the library's own `destroy()` does clear the interval — which is precisely the gap §1.1
documents. Each half has exactly one test that can see it, and 678 other tests in those eight files
were unaffected in both runs.

### 3.2 The converted specs still bite

Both on `packages/core/src/composables/useScrollSpy/useScrollSpy.ts` — product source read by one of
the **three outside-`components/`** specs this batch converted, and by `DzAnchor`:

| # | Seeded edit (source) | Predicted | Measured |
|---|---|---|---|
| 2a | `resolveActive()` — drop the `next === null` half of the flicker guard, so "nothing intersects" resets to `null` | **1** test, and **0** of `DzAnchor`'s 8 | **1**: `useScrollSpy › keeps the last active id when nothing intersects (no flicker)` — `expected null to be 'a'`. DzAnchor 8/8 pass |
| 2b | `resolveActive()` — drop the `break`, so the **last** intersecting target wins instead of the first | **1** test, and **0** of `DzAnchor`'s 8 | **1**: `useScrollSpy › reports the topmost intersecting target in list order` — `expected 'b' to be 'a'`. DzAnchor 8/8 pass |

Both predictions exact. DzAnchor is untouched by either because every one of its cases sets exactly
one section intersecting, where first-wins and last-wins agree and nothing ever stops intersecting —
which is also why `useScrollSpy.spec.ts` is not redundant with it.

---

## 4. Owner decisions

### `D-RES13-2` 🟡 → 🟡 — the dominant half is FIXED; **the half the row literally names is NOT closed**

**The row conflated two symptoms under one exit code.** `D-RES13-2` (register §19.5) was raised for
`[vitest-worker]: Timeout calling "onTaskUpdate"` — a reporter-RPC error carrying no file and no
test name — and recommended option **(a)**, pin `poolOptions.threads.maxThreads`. By RESIDUAL-17 §5.1
the same non-zero exit code was overwhelmingly being produced by something else: **58 ×** rAF against
the reporter error's **1**. Anyone acting on option (a) would have been tuning a thread pool at a
leaked timer.

**The rAF half is fixed at its source: 0 occurrences in five consecutive runs** (§5.1), including
one run under six cores of deliberate CPU contention and one immediately after a complete
`validate:all` with a full `yarn build` — the exact condition under which RESIDUAL-17's run 3
produced 58.

**The reporter-RPC half reproduced verbatim, and is left open.** Run **5** — the post-build one —
exited **1** on **one** unhandled error, and it is this, quoted from the log:

```
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
```

on a run reporting **582 files, 11,508 passed, ZERO failed**. That is `D-RES13-2` as written, and
nothing in this batch addresses it — **the batch removes the noise that was hiding how rare it is**,
which is worth something on its own: the register's own analysis said the symptom is contention on a
green suite, and it is now the *only* thing left in that channel. §19.5's option (a) stands as the
recommendation for this half, unchanged, and it remains the gate owner's call. **Not fixed here**,
for the reason §19.5 already gave: choosing a gate's own configuration to make a run fit is the
wrong order, and it is not this packet's to choose.

**So: `D-RES13-2` is narrowed, not closed.** The claim this batch makes is precise —
`requestAnimationFrame is not defined` will not come back, and that is measured five times; a lone
`onTaskUpdate` under heavy contention still can, and did.

### No new decision is raised

Nothing here needed an owner choice. The fix was available inside the repository's own boundary
(the motion barrel), it required no gate configuration, no ceiling and no allowlist, and every
rAF-class residue is gone. The three known decisions this batch was told not to re-litigate were not
touched: `D-RES13-1` (`DzColorPicker`'s HSV slider), `D-RES16-1` (ratifying the 27 `excepted`),
`D-RES17-1` (jsdom cannot measure a teleport *target*).

---

## 5. Validation — every exit code read from a log FILE, never through a pipe

Every command below was run as `cmd > <absolute>.log 2>&1` with the exit code captured to a file and
read from it. **`npx` was never used** (it exits 0 without running here); vitest was invoked as
`node node_modules/vitest/vitest.mjs`, eslint as `node node_modules/eslint/bin/eslint.js`, vue-tsc as
`node node_modules/vue-tsc/bin/vue-tsc.js`. **`yarn install` was never run**; ` M yarn.lock` is
untouched and still hashes `dcef3ed2…`.

| Gate | Exit | Result |
|---|---:|---|
| **`yarn test` — run 1** | **0** | 582 files · **11,508 passed** · 3 skipped · 1 todo · **0 failed** · **0 unhandled errors** · `grep -c FAIL` **0** · 331 s |
| **`yarn test` — run 2** | **0** | **identical summary** · **0 unhandled errors** · 459 s · *under six cores of deliberate CPU load* |
| **`yarn test` — run 3** | **0** | **identical summary** · **0 unhandled errors** · 430 s · *under the same load* |
| **`yarn test` — run 4** | **0** | **identical summary** · **0 unhandled errors** · 333 s · quiet host |
| **`yarn test` — run 5** | **1** | **identical summary — 0 failed** · **1** unhandled error, and it is `onTaskUpdate` (§4), **0** rAF · 427 s · *immediately after a complete `validate:all` including a full `yarn build`* |
| **`yarn validate:all`** | **0** (×2) | **62 links, 53 `✓`, ZERO `✗`** on both runs — identical to entry. 486 s and 588 s. The second is the authoritative one: it ran **after** every docs, register and status edit (§5.5) |
| **`yarn validate:capability-matrix`** (alone, for the movement) | **0** | `pass` **558 (recorded 558)** · `present` **611 (recorded 611)** over 23 kinds · `unrun` **397** · `stale` **22 (ceiling 22)** — **gate 8 did not fire** |
| **`yarn validate:registry`** | **0** | 191 of 191 items resolve, every file present, after the animations registry was regenerated |
| **`yarn workspace @dzup-ui/landing build:animations-registry`** | **0** | registry.json + 59 items rewritten |
| **`node node_modules/vue-tsc/bin/vue-tsc.js -p tsconfig.json --noEmit`** | **0** | ×2 (after item 1, after item 2), **no output** |
| **`yarn typecheck:tooling`** | **0** | no output |
| **`eslint --max-warnings 0`** over **211** changed `.ts`/`.vue` files | **0** | 3 findings fixed **BY HAND** — `perfectionist/sort-exports`, `jsdoc/no-multi-asterisks`, `style/padded-blocks`, plus one `unused-imports` — **`--fix` was never used** |
| **per-file `vitest run` passes during item 2** | **0** ×8 | §2.3 |
| **seeded breaks** | **1** ×4 | §3 — each exactly one named failing test |

### 5.1 `yarn test` — five runs, and the rAF channel is empty in all five

| Run | Exit | Files | Passed | Failed | `Unhandled Errors` | rAF errors | Load |
|---:|---:|---:|---:|---:|---:|---:|---|
| 1 | **0** | 582 | 11,508 | **0** | **0** | **0** | quiet |
| 2 | **0** | 582 | 11,508 | **0** | **0** | **0** | 6 CPU burners |
| 3 | **0** | 582 | 11,508 | **0** | **0** | **0** | 6 CPU burners |
| 4 | **0** | 582 | 11,508 | **0** | **0** | **0** | quiet |
| 5 | **1** | 582 | 11,508 | **0** | **1** (`onTaskUpdate`) | **0** | straight after `validate:all` + `yarn build` |

**Entry was 581 files / 11,500 passed. Exit is 582 / 11,508: +1 file and +8 tests, all of them the
new `autoAnimate.spec.ts`.** `AnimationsPage.v2.spec.ts` is net ±0 — one guard test replaced by
another. No test was skipped, deleted or weakened anywhere.

**The load was generated deliberately, and no process was killed to stop it.** Six CPU-only Node
loops (no allocation, so no memory pressure on a host with 2.2 GB free) ran for a fixed 700 s across
runs 2 and 3 and **exited on their own**, each writing its own `load done` line. Nothing was matched
by process name at any point in this batch — no `kill`, no `taskkill`, no `chrome.exe`.

**Why five and not four.** RESIDUAL-17's 58-error run was *"run 3 followed a complete `validate:all`
including a full `yarn build` on a machine that had also slept"*. Four runs on an otherwise ordinary
host would not have reproduced that, so run 5 was placed **immediately after** a full `validate:all`
— and produced **zero** rAF errors. That is the strongest single data point in this report: the same
condition, the same tree shape, 58 → 0.

**Durations sanity-checked.** 331 / 459 / 430 / 333 / 427 s, and `validate:all` 486 s — all plausible,
and the two slow test runs are the two under load. No `built in 811m` artifact this time; the host did
not sleep.

### 5.2 Pre-existing vs new, separated

**New: nothing red.** Every gate above that can fail, passed, and the only non-zero exit is run 5's
`onTaskUpdate`, which is a pre-existing standing note (§4) and not a test.

**Pre-existing and untouched, quoted from `validate-all-1.log` so a reader can match them line for
line:**

- **3 distinct `TS7022`/`TS7024` implicit-`any` errors** for `DzToolbar.vue` — `52:7` (TS7022),
  `55:7` (TS7022), `55:25` (TS7024) — printed **6 times** because two typecheck steps each emit them
  (`src/components/layout/…` at log lines 609/613/617 and `../core/src/components/layout/…` at
  1286/1290/1294), **inside steps that exit 0**. Not a file this batch opened.
- `validate:docs-freshness` `! [stale] 155 of 160 input(s)` plus its
  `⚠ the BUILD is unmeasured or stale` — a report off CI by design.
- `22 stale cell(s) — ceiling 22`, all `perf-baseline`, blocked on `D-S1O4-1`/`D-S1O4-2`.
- `warn: README.md links to ../../DESIGN.md, which is outside the package` (log line 276) — a warn,
  not a `✗`, present before this packet.
- **`Error: chunk load failed`** appears once in **every** run, including all four green ones. It is
  **not an unhandled error and not a defect**: it is the rejection
  `apps/landing/src/router.spec.ts:69` injects on purpose to prove `lazyComponent` renders its error
  state after three failed attempts, and the `[Vue warn]` it prints is that test working. Worth
  naming, because RESIDUAL-17 listed a `chunk load failed` among its unhandled errors and a reader
  could otherwise mistake this stderr line for the same thing.

**`D-RES13-2` reproduced once, in run 5** — see §4. All five runs are quoted, per the standing rule.

### 5.3 Frozen ratchets — every one re-read, none moved

| Ratchet | Entry | Exit |
|---|---|---|
| capability `pass` / `fail` / `present` / `stale` / `unrun` / `excepted` | 558 / 0 / 611 / 22 / 397 / 74 | **558 / 0 / 611 / 22 / 397 / 74** — validator prints `pass 558 (recorded 558) · present 611 (recorded 611)`; **gate 8 did not fire** |
| `unclassified` | 29 | **29** |
| `maxWithoutAnatomy` | 41 | **41** |
| `maxProposedCitedFromCode` | 3 | **3** |
| AT | 0 of 534 | **0 of 534** |
| locales ≥ 95 % | 1 | **1** |
| inline-style sites | 133 | **133** — and regeneration step 7 is **not owed**: the inventory scans `packages/core/src/**/*.vue` only (`inline-style-inventory.ts:49`) and this batch left **no** `.vue` under `packages/core/src` modified |
| `maxUndeclaredHandlers` | 0 | **0** |
| `anatomy-keyboard` | 0 / 0 / 0, 401 of 401 | **0 / 0 / 0, 401 of 401 backed** (quoted from `validate:all`) |

**NO CEILING WAS RAISED AND NO ALLOWLIST WAS WIDENED.** `capability-matrix-ceilings.json` and
`anatomy-keyboard-ceilings.json` were **not opened**. Capability citations are **file paths, not line
anchors** (checked: `grep 'spec\.ts#L[0-9]'` over `capability-matrix.json` → **0**), which is why 70
edited hook sites moved no cell.

**`yarn regenerate:all` was not run, and that is argued rather than assumed.** Of its seven steps,
1–5 are triggered by a component, tier, evidence, story or capability change and none occurred; 6 is
triggered by a `component-meta.json` change and it did not change; 7 is triggered by an inline-`style`
edit in a `packages/core/src` `.vue` and no such file was touched. The one generated artifact this
batch *does* own — the animations registry — was regenerated with its own script and re-gated with
`validate:registry`, and `validate:all`'s own `yarn build` then reproduced it **byte-identically** (no
new dirty path appeared after the build).

### 5.4 The authoritative `validate:all` ran AFTER every docs edit

Both runs exit **0** with **62 links, 53 `✓`, zero `✗`** — 486 s and 588 s, the second after this
report, the register addendum and the status block were complete, so `docs-size` and `doc-snippets`
measured the tree a reader will actually get. Every pre-existing notice in §5.2 is quoted from the
**first** log with line numbers and reproduced identically in the second (`TS7022` ×4 / `TS7024` ×2
occurrences, `[stale] 155 of 160`, `22 stale cell(s) — ceiling 22`, the `DESIGN.md` warn).

**The ordering rule was honoured, and the reason it holds is inherited from measurement rather than
assumed:** RESIDUAL-17 §5.2 established that **no `validate:all` link reads
`docs/program-2026-09-22-architecture/` at all** — `validate:doc-snippets` scans `apps/docs/guide`,
`validate:docs-size` budgets only `docsDist` and `storybookStatic`, and `validate:docs-freshness`
names no input under `docs/`. The edits that follow the authoritative run are all under that unread
path: this subsection, the one table cell quoting its exit code, and the two dated status notes
placed at the sections they update (register §19.5 and RESIDUAL-03 §5) so a reader landing there is
sent to §23.1 / §23.2 rather than reading a superseded claim as current.

**The build was reproducible.** `validate:all` includes a full `yarn build`, which rewrites
`apps/landing/public/r/` — and `git status` is **459 paths both before and after both runs**, so the
animations registry this batch regenerated by hand is byte-identical to what the build produces.

### 5.5 No lane was run, and no lane leaked

The browser lane was **not** run: nothing in this batch touches a `*.stories.ts`, a `.vue` under
`packages/core/src`, a `.variants.ts`, a token or a colour. Its last known state stands at
170 files / 1,462 / 1,462. **Nothing leaked and nothing was killed.** The only extra processes this
batch started were the six CPU loops of §5.1, which self-terminated at their own deadline and left
their own completion lines. No process was ever matched or terminated by name.

---

## 6. Residue — every dirty path attributed

**422 → 459. +37, nothing removed, and every entry line is still present verbatim** — checked by
`comm -23` over the two `git status --porcelain` snapshots, which returns empty. Status letters went
` M` 318 → 353 (+35) and `??` 104 → 106 (+2), which is the 37.

| # | Path(s) | Why |
|---:|---|---|
| **2** | `apps/landing/src/motion/autoAnimate.ts` · `autoAnimate.spec.ts` | **new** (the `??` pair) — the wrapper and its 8-test contract |
| 1 | `apps/landing/src/motion/index.ts` | the barrel exports the three names from the wrapper instead of npm |
| 1 | `apps/landing/src/gallery/demos/AutoAnimateListDemo.vue` | imports `autoAnimate` through the barrel |
| 1 | `apps/landing/src/pages/AnimationsPage.v2.spec.ts` | the 32-line global-scheduler workaround deleted; its guard test replaced |
| **2** | `apps/landing/public/r/animations/auto-animate-list.json` · `registry.json` | regenerated by `build:animations-registry`; the item now bundles `motion/autoAnimate.ts`. Reproduced byte-identically by `validate:all`'s own `yarn build` |
| **30** | the item-2 specs and `boundary-suites.ts` that were **clean** at entry | §2.2 |
| *(7 more, already dirty at entry, so not in the +37)* | `DzCascader` · `DzColorPicker` · `DzDatePicker` · `DzDateRangePicker` · `DzSelect.asyncStates` · `DzTimePicker` · `DzTour.spec` | item 2 as well — 37 item-2 files were edited, 30 of them newly dirty |

**Total files this batch edited: 44** — 37 for item 2, 5 for item 1, 2 generated.

**` M yarn.lock` was not touched.** It is the owner's `yarn install`, still hashing `dcef3ed2…`, and
`yarn install` was never run.

### 6.1 Byte copies, every one verified

Three files were byte-copied before a seeded edit and restored, and `sha256sum -c` printed `OK` for
all three at the end (§3). Thirty-eight files (the 37 item-2 targets plus
`AnimationsPage.v2.spec.ts`) were byte-copied into the scratchpad **before** the first edit as
insurance against the no-git-safety-net rule, with their entry hashes recorded; none had to be
restored. No `git checkout` or `git restore` was run at any point.

### 6.2 Scratchpad

Everything transient lives under the session scratchpad, nothing inside the repository: the entry and
exit `git status` snapshots, the 37-file byte-copy tree, every gate log, and the five `yarn test`
logs. **No scratch directory was created inside the repo, and no temporary spec was left behind** —
the exit listing carries exactly the two new `??` files named above.

---

## 7. Not done, named rather than left to be discovered

1. **`D-RES13-2`'s reporter-RPC half is still open** (§4). It reproduced once in five runs, under the
   heaviest contention this batch could arrange. Option (a) — pin `poolOptions.threads.maxThreads` —
   is still the recommendation and still the gate owner's.
2. **The upstream defect is upstream.** `@formkit/auto-animate`'s `poll()` still stores no handle for
   its outer `setTimeout` and `cleanUp()` still leaves a removed node's interval running. The wrapper
   is the boundary we own, and `autoAnimate.spec.ts` carries the tripwire that will fail on the day
   upstream fixes it so the wrapper can be deleted. **Filing it with the project is not something an
   agent can do here** and is named as an owner action, not silently skipped.
3. **The wrapper borrows a global for one synchronous call.** That is the only way to reach an id the
   library keeps private, it is restored in a `finally` to the value it replaced, and it is covered by
   two tests — but it *is* a monkeypatch, and a reviewer should see it as one rather than discover it.
   If upstream ever exposes the poll handles, delete it.
4. **The browser-mode move that TASK-S5-O2 named this work as the prerequisite for is not done.**
   The blocker is cleared; the move is its own decision with its own cost, and RESIDUAL-03 already
   established the lane it was feared to affect never saw the problem.
5. **`useAutoAnimate` is not used by any component in this repository** — only the directive is. Its
   four tests exercise it, and the corrections to the library's adapter (the leaked controller on a
   host swap, the over-confident `Ref<T>`) are therefore proved but not exercised in production.
6. **One prediction in this report was wrong and is left visible** (§3.1): seeded break 1a was
   predicted to fail 3 tests and failed 1. The reasoning that produced the wrong number, and the
   measurement that corrected it, are both recorded because the corrected version is the thing worth
   knowing — which half of the fix each test can actually see.

---

## 8. Ranked next packet

1. **`D-RES13-2`'s remaining half**, if the owner wants `yarn test` to be unconditionally
   deterministic on a loaded CI runner. It is now a single, isolated symptom with nothing else in the
   channel, which is the cheapest it will ever be to act on.
2. **`contract-spec`/`unit-spec` still measure existence plus one live assertion, not conformance** —
   283 citations, unchanged by this batch and still RESIDUAL-17's top-ranked item.
3. **The three `toBeTruthy()`-only SSR citations** RESIDUAL-16 named.
4. **A browser-mode move of the component specs**, now unblocked (§2), as a costed decision rather
   than an assumed improvement.
