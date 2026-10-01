# RESIDUAL-07 — the last measured focus loss (`D-RES06-1`) and the real regeneration order

> Repository `ui/dzup-ui` (OSS, `@dzup-ui/*`), HEAD
> **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`**, worktree dirty **by design**
> (**325 paths handed in** — the 16-task programme plus RESIDUAL-01…06). No commit,
> push, CI dispatch, publish, `yarn install`, baseline replacement or screenshot
> capture was performed. Written **incrementally**, phase by phase.

**Status: COMPLETE.** Both items done, each proved able to fail by a seeded break on
non-test source, each seed restored byte-identically. Item 1 **reproduced** the measured
focus loss before touching anything, confirmed option (c) and then **amended it on
measurement** — the host destination has to be resolved lazily, which seeded break 3
proves. Item 2 corrected the regeneration order in **six** live locations after verifying
every claim by running it, and named the seventh it deliberately left alone. One decision
closed, two raised. Both lanes hold: unit **574 / 11,182 / 0 failed**, browser
**170 / 1,462 / 0 failed**. `validate:all` is **61 links, exit 1 at link 51 only** — the
same pre-existing red **at the time of measurement**. That `yarn install` has since
been run by someone other than this batch, so the current tree is **61 links, `EXIT=0`,
zero `✗`**, with two defect-pin tests now failing because their defect is fixed — measured, and recorded in §9.

## 0. Start state, recorded before anything was touched

The start listing was snapshotted **to the scratchpad, outside the repository**, and by
a command that creates nothing inside it — RESIDUAL-06 §6's lesson, taken one step
further: a probe directory that cannot be inside the tree cannot inflate the count.

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **325** — the full listing snapshotted to `<scratchpad>/git-status-start.txt`, matching RESIDUAL-06's exit number exactly |
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` |
| `sha256sum` of the seven files this batch could touch | `optionsStateFocus.ts` `1699efad…1828` · `DzListbox.vue` `cda4d1e8…78c6` · `DzTransfer.vue` `251860a8…d3a3` · `DzMention.vue` `69f0332d…54bf` · `DzSelect.vue` `a7fe9b60…5391` · `DzOptionsState.vue` `93caea5e…e951` · `asyncOptionsHost.ts` `dc44617f…a53b` |
| `find packages apps e2e -name '__screenshots__'` | **nothing** |

<!-- PHASES APPENDED BELOW -->

---

## 1. Item 1 (`D-RES06-1`) — the last measured focus loss, reproduced then closed

### 1.1 The measurement first — the failing sequence, with `document.activeElement`

RESIDUAL-06 recorded the defect and **skipped** the clause that would have caught it
(`asyncOptionsHost.ts`, clause 4: `if (controlRoot !== null && (cameFrom === null ||
cameFrom === doc.body)) return`). So the first act here was to turn that skip into a
measurement: the skip was replaced with a log and the assertions were left to run, and
the **nine seam story files** were driven in real chromium with the app-local runner.

```
cd apps/storybook
node node_modules/vitest/vitest.mjs run --project=storybook \
  ../../packages/core/stories/forms/{AsyncOptionsStates,DzCascader,DzCombobox,DzListbox,
    DzMention,DzMultiSelect,DzSelect,DzTransfer,DzTreeSelect}.stories.ts
→ 9 files · 105 tests · 2 failed / 103 passed · EXIT=1   (file-captured)
```

**Exactly two hosts fail, and `document.activeElement` is `document.body` on both.**

| Host | row | `cameFrom` | `settled` after the retry succeeds |
|---|---|---|---|
| **`DzListbox`** | in-canvas | **`BODY`** | **`BODY`** |
| **`DzTransfer`** | in-canvas | **`BODY`** | **`BODY`** |
| `DzMention` | in-canvas | `TEXTAREA[input]` | `TEXTAREA[input]` |
| `DzCascader` · `DzCombobox` · `DzMultiSelect` · `DzTreeSelect` | portalled | — | `INPUT[input]` |
| `DzSelect` · `AsyncOptionsStates` | portalled | — | `BUTTON[trigger]` |

Then the same walk was instrumented to print every key, so the **sequence** is on the
record and not just the outcome:

```
DzListbox    start  outsideRow=1  active=DIV[viewport]<No options>
             tab 0 → BUTTON[root]<Resolve>        (the story's host buttons)
             tab 1 → BUTTON[root]<Fail>
             tab 2 → BUTTON[root]<Reload>
             tab 3 → BODY                          ← Tab wrapped past the document end
             tab 4 → BUTTON[options-retry]<Try again>   REACHED, cameFrom = BODY
             {Enter} → DIV[options-state]<Loading options>   row=present  retries=2 req=3
             the answer arrives → activeElement = BODY       row=gone

DzTransfer   start  outsideRow=0  active=BODY      ← nothing tabbable outside the row
             tab 0 → BUTTON[options-retry]<Try again>   REACHED, cameFrom = BODY
             {Enter} → DIV[options-state]<Loading options>   row=present  retries=2 req=3
             the answer arrives → activeElement = BODY       row=gone

DzMention    start  outsideRow=1  active=TEXTAREA[input]
             tab 0 → BUTTON[options-retry]<Try again>   REACHED, cameFrom = TEXTAREA[input]
             {Enter} → TEXTAREA[input]   the answer arrives → TEXTAREA[input]   (never lost)
```

**The failing sequence, stated once:** `Tab` until the retry control is reached — which
on both controls means passing through `document.body`, because on `DzListbox` the tab
order runs off the end of the page and wraps, and on `DzTransfer` there is nothing else
tabbable at all — then `Enter`, then the host answers. `document.activeElement` is
**`document.body`**. The register's row named the right two hosts.

One correction to RESIDUAL-06 §1.3 while reproducing it: that report recorded
`DzTransfer`'s walk as `tab 0 → DIV[item]{option}`, `tab 1 → retry`. Driven here it is
`tab 0 → retry` directly, because in the error state the source list has no items at
all. The conclusion is unchanged and in fact stronger — `DzTransfer` has **zero**
tabbable elements outside the row, not one.

### 1.2 Did option (c) survive the measurement? Yes — and the measurement amended it

Three times in this thread a prior batch's recommendation was falsified by measuring, so
option (c) was treated as a hypothesis. It survived, with one amendment that the
measurement forced and that no reading of the code would have produced.

**What survived.** The row genuinely cannot invent the destination. The element focus
should go to is *the list the host has just rendered in the row's place*, and nothing in
the row's own subtree names it. A host-supplied destination consumed in the shared
module is therefore right, and it is one definition rather than the eight of option (b).

**The amendment: the destination must be resolved LAZILY, after the row has gone.**
The obvious implementation of (c) — add the host's destination to
`retryFocusDestination`'s preference order, so `withRetryFocusReturn` uses it at
activation time — **fixes `DzListbox` and does not fix `DzTransfer`**. In the error state
`DzTransfer` has `outsideRow=0`: the option focus should land on **does not exist yet**
when the retry is pressed, because it is created by the same answer that unmounts the
row. Anything resolved at activation time resolves to `null` there. This is not reasoned
out — it is seeded break 3 below, which fails `DzTransfer` and passes `DzListbox`,
exactly as the eager reading predicts and the recommendation's wording does not.

**Rejected, with reasons:** (a) accept and document — it is a real, reproducible focus
loss on a Level A affordance and two lines of host wiring fix it. (b) each host moves
focus itself — eight answers to one question, which is the failure the shared row exists
to prevent, and it was rejected for the same reason in RESIDUAL-06 §1.2. A row-side
heuristic (*"focus the next sibling"*, *"focus the control root"*) — rejected because it
is guessing, and because `DzListbox`'s destination and `DzTransfer`'s have nothing
structurally in common.

### 1.3 Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/core/src/components/forms/optionsStateFocus.ts` | **extended, not replaced** — the same single definition RESIDUAL-05 established and RESIDUAL-06 grew. New: `RetryRowExit` and `useRetryRowExit`, plus one `RetryRouteChannel` interface so the host's exit travels the `provide`/`inject` channel the route already uses. `provideRetryKeyboardRoute` gains a second optional parameter. `withRetryFocusReturn`, `retryFocusDestination`, `isReturnTarget` and all three route handlers are **unchanged** | **internal module in `@dzup-ui/core`.** Not exported from the family barrel, not in any `index.ts`, so no public surface |
| `packages/core/src/components/forms/DzListbox.vue` | a `ref` on the `ListboxContent` it already rendered, a four-line `asyncOptionsExit()`, and the exit passed to the call it already made | **behavioural fix, published package.** No prop, emit, slot, anatomy part, state value, message key or variant changed |
| `packages/core/src/components/forms/DzTransfer.vue` | `ref` on the source list's body, the same four-line exit resolving the first enabled `role="option"`, and the exit passed in. `ref` added to the `vue` import | same |
| `packages/core/src/components/forms/DzSelect.vue` | the near-copy, wired to the **same** exported function — `useRetryRowExit(retryRoute, null)`, on the same route object it already built | same |
| `packages/core/stories/_shared/asyncOptionsHost.ts` | clause 4's **skip is gone**; the clause is now unconditional on all eight hosts, and `settled.isConnected` is asserted beside the two assertions that already existed. `cameFrom` and its assignment are deleted, because nothing reads them any more | none — stories are not published. **No test added or removed:** still **105 tests across 9 files**, because the phase is a `step` inside one `play()` |
| `.changeset/the-async-options-row-hands-focus-to-the-list-that-replaces-it.md` | **new.** `@dzup-ui/core: patch` | the changeset itself |

**A changeset IS owed and was added.** `@dzup-ui/core` is in
`packages/tooling/scripts/release-policy.json`'s `published` list. `patch`: no declared
surface changed, and the change is the repair of a focus loss rather than a new
affordance.

**Why the anatomy-part literal is absent from `DzTransfer`'s selector.**
`validate:anatomy-parts` reads a `.vue` file as text (`staticPartsIn`, one regex over
the whole source), so an attribute literal inside a `querySelector` string in
`<script setup>` is indistinguishable from an emission and would have changed the gate's
emission count. The exit queries `[role="option"]` instead, which is also the more
honest predicate: it is the first *option*, not the first element carrying a part name.

### 1.4 Where focus lands now — measured, not asserted

The same instrumentation, on the fixed tree:

```
[RES07] AFTER FIX portalled=false settled=DIV[item]<Ada Lovelace>         ← DzListbox
[RES07] AFTER FIX portalled=false settled=DIV[item]<Ada Lovelace>         ← DzTransfer
[RES07] AFTER FIX portalled=false settled=TEXTAREA[input]<>               ← DzMention
[RES07] AFTER FIX portalled=true  settled=BUTTON[trigger]<Pick a person>  ← DzSelect
[RES07] AFTER FIX portalled=true  settled=INPUT[input]<>                  ← DzCombobox
```

**`DzListbox` lands on the first option, not on the viewport it names.** That is Reka
doing the right thing rather than a coincidence worth hiding: the exit names
`ListboxContent`, and `ListboxContent` forwards focus to its highlighted item. So the
keyboard user who retried successfully is standing on `Ada Lovelace` with the arrow keys
live, which is a better destination than the one the host asked for. Recorded because a
future reader comparing the host's stated destination with the measured one will
otherwise think one of them is wrong.

### 1.5 Seeded breaks — three, all on component source, each restored byte-identically

Final bytes under proof (every seed was run against **these** bytes — RESIDUAL-04 §3's
lesson, that a seed proved against earlier bytes proves earlier bytes):

```
8ae0e623e0094ba763f8fde394175c91397c19b5ee619d881bd7dc37dbc4946b  optionsStateFocus.ts
d3653def14f3dd5ad5ba4d8d01df738b8945690e85d11787eb74d4b1ccfe367e  DzListbox.vue
b83c19d53210dccd77e5d032973e64d8fa8df5e2a565a388c0a754bc0ee5dd60  DzTransfer.vue
66fdbc59709924d8695a8db134b97cb977a769d1fb781faf40183e63cb34d1bf  DzSelect.vue
da95d1cb7daf467365b64cdca70e45f75e0894ca96bc10f8e94d8eb3477fc368  asyncOptionsHost.ts
```

| # | Seed, on component source | Result | Hosts that fail | Restore |
|---|---|---|---|---|
| 1 | the host exit dropped from `useRetryRowExit`'s destination chain — the whole of the fix, and nothing else (`optionsStateFocus.ts`) | **2 failed / 103 passed, `EXIT=1`** at `asyncOptionsHost.ts:303` (`expect(settled).not.toBe(doc.body)`) | **`DzListbox`** and **`DzTransfer`** — **every in-canvas host whose keyboard arrived from the body, and only those** | `sha256sum -c` all five **OK**, `EXIT=0` |
| 2 | the `exit` argument removed from **`DzTransfer`'s own** `provideRetryKeyboardRoute` call, nothing else (`DzTransfer.vue`) | **1 failed / 104 passed, `EXIT=1`**, same line | **`DzTransfer` alone** | `sha256sum -c` all five **OK**, `EXIT=0` |
| 3 | the exit resolved **eagerly**, in `onBeforeUnmount`, instead of after the flush (`optionsStateFocus.ts`) | **1 failed / 21 passed, `EXIT=1`** | **`DzTransfer` alone — `DzListbox` passes** | `sha256sum -c` all five **OK**, `EXIT=0` |

Two of these are worth reading rather than counting:

- **Seed 1's seven passes are the contract refusing to over-claim.** `DzMention` keeps
  passing with the exit destroyed, because its own retry handler returns focus to the
  text control and its route therefore has a real origin. A walk that failed it would be
  asserting an implementation rather than the clause.
- **Seed 3 is the evidence for the amendment in §1.2.** The eager reading of option (c)
  is the obvious one, it fixes `DzListbox`, and it leaves `DzTransfer` broken. Without
  this seed the report would be *claiming* lazy resolution is necessary; with it, the
  claim is measured.

### 1.6 Is `DzSelect`'s near-copy covered? Yes — and the honest limit of the proof

`DzSelect` renders its own copy of the row and is the reason `optionsStateFocus.ts` is a
module at all. It now calls **the same exported `useRetryRowExit`** on the same route
object it already built, so the copy carries C9.4's fourth part by the shared definition
and not by a paste.

**What is not claimed:** no seeded break can fail that call. `DzSelect`'s panel is
portalled, so its keyboard route always arrives from the **trigger**, which outlives the
row — focus is on the trigger, not on the row, when a successful retry unmounts it, so
the handoff has nothing to do on any route the walk drives. Its host destination is
therefore `null`, deliberately, and the file says so. The hole the call closes is the row
unmounting *with focus on it*, and the one route in `DzSelect` that no test drives (the
third `@keydown` binding: list showing, item focused, host-driven reload) is exactly a
route that can end that way. RESIDUAL-06 recorded that binding as undriven; this is the
second thing about it that is unproven, and it is ranked in §7 rather than asserted away.

`DzSelect`'s clause-4 pass is real and measured (`settled=BUTTON[trigger]`); it is simply
carried by `returnTo` rather than by the exit.

### 1.7 Focused validation for item 1

| # | Command | Result | Exit (from a log file) |
|---|---|---|---|
| 1 | the nine seam story files, skip replaced by a log | **9 files · 105 tests · 2 failed / 103 passed** — `DzListbox`, `DzTransfer` | **`EXIT=1`** |
| 2 | the three in-canvas hosts, every key logged | §1.1's traces | `EXIT=1` (the same failure) |
| 3 | the nine seam story files, **after** the fix | **9 files · 105 tests · 105 passed** | **`EXIT=0`** |
| 4 | five hosts, destination logged on the fixed tree | §1.4 | **`EXIT=0`** |
| 5 | `node …/vue-tsc --noEmit -p packages/core/tsconfig.json` | no output | **`EXIT=0`** |
| 6 | `node …/eslint --max-warnings 0` on the five changed files | clean. `--fix` **not** used | **`EXIT=0`** |
| 7 | seeded break 1 | **2 failed / 103 passed** | **`EXIT=1`** |
| 8 | seeded break 2 | **1 failed / 104 passed** | **`EXIT=1`** |
| 9 | seeded break 3 | **1 failed / 21 passed** | **`EXIT=1`** |
| 10 | restores, after each seed | `sha256sum -c` on all five **OK**, three times | **`EXIT=0`** |

---

## 2. Item 2 — the real regeneration order, verified before it was written down

### 2.1 Every place the order was documented, and what happened to each

Searched `CLAUDE.md`, `CONTRIBUTING.md`, all of `docs/`, every programme README, the
`<generated_authority>` / `<validation>` convention blocks, `package.json`'s `//`-prefixed
script documentation, and generator/validator source. **Six live locations, plus one
deliberately left alone.**

| # | Location | What it said | What it says now |
|---|---|---|---|
| 1 | `docs/program-2026-09-22-architecture/README.md` §5 `<generated_authority>` — **the canonical block, this programme's entry point** | *"Regeneration order when several are stale: ownership → quality → capability → component-meta → llms → docs-pages → playground seeds."* | the same order **with the trigger for each step**, the `component-meta` join and the story-line-range reason, the `nav.json` ↔ `component-meta.json` sha identity **with both shas quoted**, and `csp:inline-style-inventory` named as a seventh command that **no link above refreshes and `validate:all` never checks** |
| 2 | `packages/tooling/src/validators/evidence-binding.ts` — printed to the operator when the gate fails | one line: the bare six-step order | the order, then *why* `component-meta` and `docs-pages` are owed, then `csp:inline-style-inventory` with the reason it is invisible to `validate:all`. This is the copy an agent actually reads, because a red gate prints it |
| 3 | `packages/tooling/src/validators/docs-freshness.ts` — the `stamp` violation message | *"Regenerate in the sanctioned order (…)"* | same, plus the two obligations and the seventh command |
| 4 | `package.json` → `"//csp:inline-style-inventory"` | described what the command does, never **when it is owed** | adds *"RUN THIS AFTER ANY EDIT TO A `.vue` THAT CARRIES AN INLINE `style=`"*, the line-number reason, and the measured fact that the six links leave it stale |
| 5 | **`CLAUDE.md`** — *"Authoritative reference for all agents"* | **documented no regeneration order at all** | a new `### Regenerating generated artifacts` table under **Quality Gates**: seven rows, each with the command and *owed when*, plus the measurement showing steps 1–6 leave step 7's artifact stale. This is the gap that mattered most: the agent-facing reference never carried the order, so every agent got it second-hand |
| 6 | `docs/program-2026-09-04/README.md` §5 `<generated_authority>` — the **superseded** programme's copy of the same standing instruction | the same bare list | kept verbatim, then marked incomplete, pointed at location 1 as the version to follow, and given the three corrections in one sentence. Its historical **counts** were not touched |

**Left alone, deliberately:** `docs/program-2026-09-04/contract-conformance-tasks.md:540`
carries a four-command chain (`generate:ownership && generate:quality-matrix &&
generate:capability-matrix && generate:component-meta`) inside the `<validation>` block of
a **task that has already been executed**. It is not the canonical order — it omits `llms`
and `docs-pages` too — and rewriting an executed task's prescribed validation falsifies
the record of what that task was told to run. Named here instead, which is the whole point
of naming it.

`CONTRIBUTING.md` documents `yarn generate:i18n-packs` for the i18n path and no
regeneration order, so there was nothing there to correct.

### 2.2 The claim, verified by running it — the exact sequence

Item 1 of this batch was the perfect test case: it inserted lines into three published
`.vue` files that each carry an inline `style=`. Every step below was run and its exit code
read from a **file**, never from a completion notice.

| # | Command | Result | Exit |
|---|---|---|---|
| 1 | `node node_modules/vitest/vitest.mjs run packages/core/security/inline-style-inventory.spec.ts` | **FAILS** — `AssertionError: expected [ Array(133) ] to deeply equal [ Array(133) ]`. Same 133 sites, different line numbers | **`EXIT=1`** |
| 2 | the six documented links, in order: `generate:ownership` → `generate:quality-matrix` → `generate:capability-matrix` → `generate:component-meta` → `generate:llms` → `generate:docs-pages` | each one **`EXIT=0`** | **six × `EXIT=0`** |
| 3 | the same spec again | **STILL FAILS, identically** — this is the whole finding, measured rather than argued | **`EXIT=1`** |
| 4 | `yarn csp:inline-style-inventory` | `81 static site(s) in 78 file(s) · 52 bound site(s) in 38 file(s)` | **`EXIT=0`** |
| 5 | the same spec a third time | **PASSES** | **`EXIT=0`** |

**What actually moved**, diffed out of the artifact before and after step 4:

```
sites before / after : 133 / 133        (0 added, 0 removed)
LINE NUMBERS MOVED   : 3
  DzListbox.vue  408 → 429
  DzSelect.vue   441 → 458
  DzTransfer.vue 242 → 263
dispositions before  : recipe-movable 78 · layout-static 3 · custom-property 0
                     · required-dynamic 19 · unclassified-binding 33
dispositions after   : identical
```

So the trap is exactly as described and it is **not** a case of "the inventory noticed a
new inline style". Nothing was added, nothing was removed, no disposition changed — three
line numbers moved and a published package's security artifact went stale, invisibly to
`validate:all` and visibly only to one unit spec. That is the third consecutive batch this
has caught (RESIDUAL-05, RESIDUAL-06, and it would have caught this one).

**The `component-meta` half, verified the same way.** The claim is that its story example
line ranges shift when a story changes, which then shifts `nav.json`'s `artifactSha256`.
Both halves checked directly:

```
component-meta.json → components[].examples.stories[].lines : [112,124], [130,156], …
                      keyed to packages/core/stories/<family>/<Name>.stories.ts

sha256sum packages/core/docs/component-meta.json
  347b253000ce003fd8bcc590c8f4c14d3d65126cca974e49d5e1f7e598bf5008
nav.json .artifactSha256
  347b253000ce003fd8bcc590c8f4c14d3d65126cca974e49d5e1f7e598bf5008      ← identical
```

`nav.json`'s `artifactSha256` **is** the sha256 of `component-meta.json`
(`generate-docs-pages.ts:180` → `buildNav(artifact, artifactSha256, evidence)`). So a story
edit that moves one `lines` pair changes `component-meta.json`'s bytes, changes its sha,
and leaves `nav.json` stale — which is why `component-meta` needs naming as *owed by a
story change*, not only as a position in a list. And `component-meta` is **also** owed by a
capability change, because it carries a join of `capability-matrix.json` that
`packages/tooling/src/docs/evidence.spec.ts` checks — the failure RESIDUAL-06 hit.

### 2.3 Is the documented order sufficient? Run end to end, then measured

The corrected **seven-step** order was run end to end on the final tree:

| # | Command | Exit |
|---|---|---:|
| 1 | `yarn generate:ownership` | **0** |
| 2 | `yarn generate:quality-matrix` | **0** |
| 3 | `yarn generate:capability-matrix` | **0** |
| 4 | `yarn generate:component-meta` | **0** |
| 5 | `yarn generate:llms` | **0** |
| 6 | `yarn generate:docs-pages` | **0** |
| 7 | `yarn csp:inline-style-inventory` | **0** |

`git status --porcelain` was snapshotted before and after the whole chain and the two
listings are **identical** (`diff` exit 0 — no path appeared or disappeared), so the order
is idempotent on this tree and step 7 is not quietly rewriting something else.

Then the aggregate: **`yarn validate:all` reaches link 51 and fails only there**
(§3.2) — no link fails on a stale artifact, which is the sufficiency claim the brief asked
to be proved rather than asserted. The gates the two items' inputs feed are green **inside**
the chain: `validate:anatomy-parts` (14), `validate:capability-matrix` (24),
`validate:component-meta` (35), `validate:llms` (37), `validate:docs-pages` (38); and
`validate:docs-freshness` and `validate:evidence-binding` — the two whose **source text**
this item edited — were each run individually and exit 0 (§3.3).

---

## 3. Aggregate qualification — pre-existing vs new

Every exit code below was read out of a **file**. RESIDUAL-03 §6.2's reason still holds: a
wrapper whose last statement is `echo` reports the wrapper.

### 3.1 The lanes

| Lane | Handed baseline | **This batch** | Verdict |
|---|---|---|---|
| `yarn typecheck` | 0 | **`EXIT=0`**, no output | held |
| `yarn typecheck:all` | 0 | **`EXIT=0`**, no output | held |
| `yarn lint` | 0 | **`EXIT=0`**, no output under `--max-warnings 0`; **`--fix` not used** | held |
| `yarn build` | 0 | **`EXIT=0`**, and the `git status --porcelain` listing is **identical** before and after (`diff` exit 0) | held |
| unit suite | 574 files · 11,182 passed · 3 skipped · 1 todo · 0 failed | **574 files · 11,182 passed · 3 skipped · 1 todo · 0 failed · 343.09 s · `EXIT=0`** | **identical, and green on the FIRST run** |
| browser lane | 170 files · 1,462 tests · 1,462 passed · 0 failed | **170 files · 1,462 tests · 1,462 passed · 0 failed · 94.20 s · `EXIT=0`**, `grep -c FAIL` → **0** | **identical — no regression** |
| `yarn validate:all` | 61 links, exit 1 at link 51 only | **61 links (measured), exit 1, exactly one `✗` in 470 lines, at link 51** | **same link, same clause, same text** |

**The unit suite needed only one run and is quoted as such.** The documented
`apps/landing` `requestAnimationFrame`-after-teardown flake and the reporter timeout did
**not** appear, and no spec had to be re-run. **11,182 is exactly the handed number**: item
1 added no test (its phase is a `step` inside an existing `play()`) and item 2 added none.

**The browser lane ran with the app-local runner**, from `apps/storybook`:

```
cd apps/storybook
node node_modules/vitest/vitest.mjs run --project=storybook
→ 170 files · 1,462 tests · 1,462 passed · 0 failed · 94.20 s · EXIT=0   (file-captured)
```

`1,462 → 1,462` is not "nothing happened": the C9.4 clause-4 **skip was removed**, so two
hosts that previously skipped the post-success assertion now run it and pass. Storybook's
vitest integration counts one test per **story**, so a strengthened `play()` cannot move
the number. Recorded because RESIDUAL-05 and RESIDUAL-06 both had to leave the same note.

**No probe file existed when either final lane ran.** All measurement in this batch was
done by temporarily editing `asyncOptionsHost.ts` and restoring it byte-identically, so no
story or spec file was ever created inside the repository —
`ls packages/core/stories/forms/ | grep -i residual` → empty, and
`packages/core/tests/a11y/` holds the eleven family specs plus `register-matchers.ts` and
nothing else.

### 3.2 `validate:all` — the failing link, and what it is not

```
node -e "…scripts['validate:all'].split('&&').length"   →  LINKS=61      (measured, never quoted)
yarn validate:all > log 2>&1 ; echo "VALIDATE_ALL_EXIT=$?" >> log
  470 lines · 39 lines carrying ✓ · exactly one ✗        →  VALIDATE_ALL_EXIT=1

✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"              ← no declarant at all
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

**Failing link: 51** (`yarn validate:peers` → `validate:icon-duplicates`). Confirmed to be
the halt point rather than inferred: nothing from links 52–61 appears anywhere in the 470
lines (`grep -c -i "license|tree-shake|deprecations|adr-status|at-runs|runtime-floor|browser-lane"`
→ **0**). Identical link, clause and text to RESIDUAL-01 §4.5, RESIDUAL-02 §3.3,
RESIDUAL-03, RESIDUAL-04 run 25, RESIDUAL-05 §3.2 and RESIDUAL-06 §3.2.
**PRE-EXISTING**: every manifest reads `^0.477.0` and the `0.475.0` row is an orphan
lockfile resolution with **zero** declarants, which clears on the owner's `yarn install`.
`yarn.lock` was not touched. **No new red of any kind.**

### 3.3 Links 52–61, run individually

The `&&` chain halts at 51, so each was run on its own against this tree:

| link | gate | exit |
|---|---|---:|
| 52 | `validate:licenses` | **0** |
| 53 | `validate:tree-shake` | **0** |
| 54 | `validate:evidence-binding` | **0** — the gate whose **message text** item 2 rewrote |
| 55 | `validate:deprecations` | **0** |
| 56 | `validate:adr-status` | **0** |
| 57 | `validate:at-runs` | **0** |
| 58 | `validate:docs-freshness` | **0** — the other gate item 2 rewrote |
| 59 | `validate:runtime-floor` | **0** |
| 60 | `yarn build` | **0** |
| 61 | `validate:browser-lane` | **0** |

### 3.4 Order of operations, stated so the evidence can be trusted

Every source and documentation edit in both items was made **before** the gate runs, so all
seven lanes measured the final tree. The only writes after `validate:all` are this report,
the register addendum and `EXECUTION-STATUS.md` — three paths that were **already dirty**,
none of which any link reads: `validate:docs-size` measures the built
`apps/docs/.vitepress/dist` bundle, and `validate:doc-snippets` scans a fixed list of four
`README.md` files. Stated rather than left for a reader to worry about.

---

## 4. Ratchet movements (old → new)

Every figure re-read from the artifact that owns it, not quoted from a prior report.
**No ceiling raised, no allowlist widened, and no `*ceilings*.json` file opened for
writing** — `find packages -name '*ceiling*.json' -newermt <session start>` returns
**nothing**.

| Ratchet / counted quantity | Old | **New** | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `pass` | 585 | **585** (A 106 · B 325 · C 147 · D 7) | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `fail` | 0 | **0** | same |
| capability `present` | 608 | **608** (175 · 304 · 117 · 12) | same |
| capability `stale` | 22 | **22** (0 · 0 · 21 · 1) | same |
| capability `unrun` | 400 | **400** (65 · 247 · 87 · 1) | same |
| capability `excepted` | 47 | **47** (4 · 41 · 2 · 0) | same |
| AT executed | 0 of 534 | **0 of 534** | `validate:at-runs` (link 57) |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `i18n-completeness-ceilings.json` |
| inline-style dispositions | 78 / 3 / 0 / 19 / 33 | **78 / 3 / 0 / 19 / 33** | `inline-style-inventory.json` `.totals.byDisposition` |
| inline-style sites | 133 | **133** (81 static / 52 bound) | same |
| `validate:all` links | 61 | **61** (measured) | `package.json` |
| `validate:all` failing link | 51 | **51** (same clause, same text) | §3.2 |
| unit suite | 574 files / 11,182 | **574 / 11,182** | unchanged |
| browser lane | 170 files / 1,462 tests | **170 / 1,462** | unchanged |
| Pending changesets | 47 | **48** (+1, `@dzup-ui/core: patch`) | `ls .changeset/` excluding `README.md` and `config.json` — **measured** |
| Dirty paths | **325** | **329** | §6 — +4, all four attributed |

**Every frozen quantity is unmoved.** This batch fixed a focus loss and corrected six
documents; neither owes a ratchet movement, and none was taken. The only numbers that
changed are the changeset count and the dirty-path count, both of which are additions this
report names line by line.

---

## 5. Owner decisions — one closed, two raised

Recorded in the register's **§13** addendum (appended; earlier rows keep their original
text and gain dated status rows).

### Closed

- **`D-RES06-1`** 🟢 → **CLOSED by option (c)**, the recommended one — **with one measured
  amendment.** A host-supplied focus destination on the shared row is right, and the
  destination must be resolved **lazily**, after the row has unmounted and Vue has
  flushed. The eager reading — put the host's destination into
  `retryFocusDestination`'s preference order — fixes `DzListbox` and leaves `DzTransfer`
  broken, because `DzTransfer` has **zero** tabbable elements outside the row in the error
  state and the option focus should land on is created by the same answer that removes the
  row. That is seeded break 3, not a reading. The walk's clause-4 **skip is deleted**, so
  the assertion now runs on all eight hosts, and two seeded breaks fail exactly the hosts
  they should.

### Raised

1. **`D-RES07-1` 🟡 — `DzSelect` now has *two* pieces of C9.4 that no test drives.**
   RESIDUAL-06 recorded the first: the `@keydown` on `SelectContent`, covering the
   list-showing → item-focused → host-reload route; deleting it fails nothing. This batch
   adds the second: its `useRetryRowExit(retryRoute, null)` call, which cannot be failed by
   any seeded break while the trigger holds focus (§1.6). The two are the **same** undriven
   route seen from two sides, which is an argument for driving it once rather than for
   deleting either piece. Options: (a) add that route to `DzSelect`'s own story — list
   showing, arrow onto an item, host-driven reload — which would drive both at once, ~45
   min · (b) delete the content binding and pass no exit, and record the route as
   unsupported · (c) accept and re-record. **Recommend (a)**, and note it is the cheapest
   remaining item in this seam.
2. **`D-RES07-2` 🟢 — should the regeneration order be a script rather than a list?**
   This batch corrected the order in **six** places and found it transcribed
   inconsistently in a seventh. A list that must be copied correctly by hand into six
   documents will drift again; `yarn regenerate:all` chaining the seven commands with
   `&&` cannot. Options: (a) add the script and have every document point at it, leaving
   the per-step *why* in `CLAUDE.md` only · (b) leave it as prose, since a script hides
   which step was owed and encourages regenerating everything on every change · (c) add
   the script **and** keep the annotated table, the script for correctness and the table
   for judgement. **Recommend (c)**, ~20 min. A `package.json` script is a published
   manifest change, so it wants an owner's eye rather than an agent's.

**Left explicitly to their owners, unchanged by this batch:** the one `yarn install` that
clears `validate:all` link 51 (`D-RES01-1`) · **`D-RES06-2`**, `aria-controls=""` across
the Reka popover and combobox seam (upstream; report then pin) · `D-RES04-2`, the
host-driven `searchable` double filter · the `browser-matrix` input's missing `gate` block
(RESIDUAL-03 items 3–4) · the 193 structurally-verified-but-not-outcome-verified citations
· the 25 body-wiping jsdom specs (S5-O2) · `D91` · register #2 / `D127`, the commit itself.

---

## 6. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git rev-parse HEAD` | `4e4e46f…410a` | **`4e4e46f…410a`** — unchanged |
| `git status --porcelain \| wc -l` | **325** | **329** — **+4, all four attributed** |
| `diff` of the two **listings** | — | **exactly 4 added lines, none removed, none modified** (§6.1) |
| `sha256sum yarn.lock` | `6332fae9…87adb` | **`6332fae9…87adb` — identical**, and `git status --porcelain yarn.lock` prints nothing |
| `yarn install` run? | — | **no.** None owed: no manifest dependency or version changed (`package.json`'s edit is inside a `//`-prefixed documentation key) |
| `find packages apps e2e -name '__screenshots__'` | nothing | **nothing.** Seven browser-lane runs, four with failing stories (three deliberately seeded), wrote **zero** PNGs |
| `*.png` newer than session start under `packages`/`apps`/`e2e` | — | **none** |
| Probe files inside the repository | — | **none were ever created.** Measurement was done by temporarily editing `asyncOptionsHost.ts`; all logs, byte copies and scripts live in the session scratchpad **outside** the repository, which is why this batch's own tooling cannot appear in its own count (RESIDUAL-06 §6's lesson, taken one step further) |
| Files temporarily modified and restored | — | **two**, each verified by `sha256sum -c` against a byte copy taken first: `optionsStateFocus.ts` (seeds 1 and 3) and `DzTransfer.vue` (seed 2), plus `asyncOptionsHost.ts` twice for instrumentation. **All five files verified `OK` after every restore, `EXIT=0`** |
| `git worktree list` | one entry | one entry |
| `*ceilings*.json` opened for writing | — | **none** — `find … -newermt <session start>` is empty |
| Commit / push / CI dispatch / publish / baseline capture / screenshot capture / `yarn install` | — | **none** |

### 6.1 The four paths, named

```
 M CLAUDE.md                                                    ← item 2, location 5
 M docs/program-2026-09-04/README.md                            ← item 2, location 6
 M docs/program-2026-09-22-architecture/README.md               ← item 2, location 1
?? .changeset/the-async-options-row-hands-focus-to-the-list-that-replaces-it.md   ← item 1
```

Everything else this batch touched was **already dirty at session start**, each verified by
name against the start listing: `optionsStateFocus.ts`, `DzListbox.vue`, `DzTransfer.vue`,
`DzSelect.vue`, `asyncOptionsHost.ts`, `package.json`, `evidence-binding.ts`,
`docs-freshness.ts`, `capability-matrix.json`, `component-meta.json`,
`quality-matrix.json`, `inline-style-inventory.json`,
`apps/docs/.vitepress/generated/nav.json`, `EXECUTION-STATUS.md`, and the register plus
this report inside the already-`??` `reports/` directory entry.

**325 + 4 = 329**, and `git status --porcelain | wc -l` prints **329**.

---

## 7. Ranked next packet

1. **Register #2 / `D127` — commit the 329-path worktree.** Owner-only, and now the only
   thing between **three** WCAG fixes and any consumer seeing them. It has been the top of
   this list for three batches and it has not moved.
2. **`D-RES01-1` — the one `yarn install`.** Still the cheapest act with the largest
   measured effect: link 51 is the only red in the aggregate, for the seventh consecutive
   batch, with **zero** declarants left on the old range.
3. **`D-RES07-2` option (c) — `yarn regenerate:all`, plus the annotated table.** ~20 min.
   This batch corrected the same list in six places and found a seventh transcription that
   was already different; the next hand-copy will drift again. Do it before the list grows
   an eighth home.
4. **`D-RES07-1` option (a) — drive `DzSelect`'s list-showing → item-focused →
   host-reload route in its own story.** ~45 min, drives **two** currently-unproven pieces
   of C9.4 at once, and is the last untested route in a seam that has now had four batches
   of work.
5. **`D-RES06-2` step (b) — pin `aria-controls=""` with an assertion.** ~30 min, no
   behaviour change; converts an upstream defect axe can only call `incomplete` into
   something that cannot silently get worse. Report it upstream in the same sitting.
6. **Outcome-verify the 193 surviving citations.** ~3 h. Unchanged in rank and sharper
   every batch: the citations added by RESIDUAL-06 are *imports plus real renders plus
   measured axe rule counts*, a higher bar than the other 193 meet.
7. **`D-RES04-2` option (b) — stop a host-driven `searchable` control re-filtering its
   host's rows.** ~1 h, a `minor` to `@dzup-ui/core`. Unchanged from RESIDUAL-04/05/06.
8. **Decide whether `DzSelect` should host the shared row.** The argument has now grown
   for a fourth time: every C9.4 part has had to be wired into the near-copy by hand, and
   this batch made that four for four. ~2 h to decide; merging means giving
   `DzOptionsState` a slot.
9. **The 25 body-wiping jsdom specs** (S5-O2's packet) — ~8 h, untouched, still the
   prerequisite for moving the 153 clean component specs into browser mode.
10. **`D91`** — the owner's coverage re-baseline. Still the keystone for Vitest 4 and
    therefore Vite 8. Nothing here changed it.

---

## 8. State of the tree at handover

*Last agent of this session. Read this first.*

> **⚠ SUPERSEDED IN PART — read §9 with this section.** Between this batch's gate runs
> (2026-09-25) and its hand-off, **someone ran `yarn install`** (2026-09-28 09:36; not this
> batch — proof in §9.1). That closed `D-RES01-1`, so **`validate:all` is now 61 links and
> `EXIT=0` with zero `✗`** rather than the one red described below, and the unit suite now
> has **two failures, both defect PINS whose defect has just been fixed** (§9.4). The rest of
> this section stands. §9.5 is the corrected one-paragraph headline.

**Commit and tree.** HEAD is `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` with **329 dirty
paths, uncommitted by design** — the 16-task architecture programme plus RESIDUAL-01…07.
Nothing was reverted, stashed, checked out, cleaned, pulled, merged, rebased or committed.
`yarn.lock` is byte-identical (`6332fae9…87adb`) and no `yarn install` was run or is owed.
No `__screenshots__` directory, no stray PNG, no probe file, one worktree, and no
`*ceilings*.json` was opened for writing.

**What is green, measured on this tree.**

| Lane | Result |
|---|---|
| `yarn typecheck` · `yarn typecheck:all` · `yarn lint` · `yarn build` | **all `EXIT=0`**; the dirty listing is identical before and after `build` |
| unit suite | **574 files · 11,182 passed · 3 skipped · 1 todo · 0 failed · `EXIT=0`**, first run, no flake |
| browser lane (app-local runner, `apps/storybook`) | **170 files · 1,462 tests · 1,462 passed · 0 failed · `EXIT=0`**, `grep -c FAIL` → 0 |
| `validate:all` links 1–50 | reached and green **in fact**, since the chain got to 51 |
| `validate:all` links 52–61 | each run individually, **all ten `EXIT=0`** |

**The single remaining red, and its one-command fix.** `yarn validate:all` exits **1** at
**link 51 of 61** (measured, never quoted) — `yarn validate:peers` →
`validate:icon-duplicates`: *"2 versions of the icon library resolve (0.475.0, 0.477.0);
exactly 1 may"*, where the `0.475.0` row has **no declarant at all** and every manifest
reads `^0.477.0`. It is an orphan lockfile resolution, identical in link, clause and text
across RESIDUAL-01…07.

> **The fix is `yarn install`** — one command, withheld from every agent in this programme
> by the authority limits. Nothing else in 470 lines of aggregate output is red.

**Owner-blocked, in order of what it unblocks.** (1) **The commit** — 329 paths, register
#2 / `D127`; three WCAG repairs and 48 pending changesets are behind it. (2) **`yarn
install`** — clears the only red. (3) **ADR-18 / 19 / 20 acceptance** — all three still
`Proposed`, and `maxProposedCitedFromCode` is frozen at 3 until one is accepted and the
ceiling lowered in the same change. (4) **`D91`**, the coverage re-baseline, which gates
Vitest 4 and therefore Vite 8. (5) **The AT matrix** — 0 of 534 cells executed; an agent
may never fill a manual result. (6) **The visual baselines** — capture is owner work.
(7) The four open seam decisions: `D-RES04-2`, `D-RES06-2`, `D-RES07-1`, `D-RES07-2`.

**Ranked remaining work** is §7 above. The first three items total well under an hour of
owner time and clear the aggregate, the custody gap and the recurrence risk that cost this
programme three agents' validation runs.

**What this batch leaves behind that a reader should not misread.** The browser lane is
`1,462 → 1,462` because Storybook counts one test per story, not because nothing changed —
the C9.4 clause-4 skip was **deleted**, so two hosts that used to skip the post-success
assertion now run it. And `DzListbox` hands focus to its viewport while the *measured*
resting place is the first option: Reka's `ListboxContent` forwards focus to its
highlighted item, so the host's stated destination and the measured one differ on purpose.

**Status: COMPLETE**, to the limit of agent authority. Both items done, each proved able to
fail by a seeded break on non-test source, every seed restored byte-identically, one
decision closed and two raised.

---

## 9. Post-`install` re-measurement — the tree changed under this batch, 2026-09-28

**§3 and §8 were measured on 2026-09-25 against the pre-`install` tree and are left
verbatim. This section supersedes their numbers.** It exists because something happened
between this batch's gate runs and its hand-off that neither this batch nor its brief
anticipated, and pretending otherwise would hand the owner a page of stale facts.

### 9.1 What changed, and who changed it

```
ls -la --time-style=full-iso yarn.lock
  682669  2026-09-28 09:36:06  yarn.lock
ls -la --time-style=full-iso node_modules/.yarn-state.yml
  221263  2026-09-28 09:36:16  node_modules/.yarn-state.yml       ← a REAL install, not just a lockfile rewrite

sha256sum yarn.lock
  before (§0, and re-proved clean AFTER every gate run in §3)
    6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb
  now
    dcef3ed26f23fd00ea99f64ba8c977442bdcc6abd776300c323dc99a63e076cf
```

```
git diff --stat yarn.lock   →   1 file changed, 3 insertions(+), 11 deletions(-)

- apps/landing   lucide-vue-next: "npm:^0.475.0"   →  +  "npm:^0.477.0"
- apps/sandbox   lucide-vue-next: "npm:^0.475.0"   →  +  "npm:^0.477.0"
- the whole "lucide-vue-next@npm:^0.475.0" resolution block, DELETED
+ @dzup-ui/nuxt gains "@dzup-ui/contracts": "workspace:*"
```

**`yarn install` was run at 09:36 on 2026-09-28, and this batch did not run it.** The
evidence is positive, not a plea: `yarn.lock` was proved clean by sha256 **after** every
gate run in §3, and every `yarn` command this batch has issued since has been bracketed by
a `sha256sum yarn.lock` before and after, each pair identical
(`dcef3ed2… → dcef3ed2…`). The repository carries a `.claude-concurrency-ok` marker and
this programme's memory records concurrent sessions writing here, so the most likely author
is the owner or a sibling session. **Nothing was reverted, checked out or restored** — the
brief forbids it and the change is an improvement.

**This batch's own work is intact**, proved rather than assumed:

```
sha256sum -c <the five implementation files' final bytes>
  optionsStateFocus.ts   OK      DzListbox.vue   OK      DzTransfer.vue   OK
  DzSelect.vue           OK      asyncOptionsHost.ts  OK             EXIT=0
```

### 9.2 `D-RES01-1` is closed, by the one act withheld from every agent

That install is precisely what seven consecutive reports said would clear
`validate:all` link 51, and it did:

| | 2026-09-25, pre-install (§3.2) | **2026-09-28, post-install** |
|---|---|---|
| `validate:all` links | 61 (measured) | **61** (measured) |
| exit code | **1** | **`EXIT=0`** |
| output | 470 lines · 39 `✓` · **one `✗`** at link 51 | **1,304 lines · 52 `✓` · ZERO `✗`** |
| `lucide-vue-next` resolutions | 2 (`0.475.0` orphan + `0.477.0`) | **1 — `0.477.0`**, and `node_modules/lucide-vue-next/package.json` reads `0.477.0` |

**All 61 links are green for the first time in this programme's residual thread.** That
includes `yarn typecheck`, `yarn typecheck:tooling`, `yarn lint` and `yarn build` (links
1–3 and 60), which the chain now reaches and passes, and `validate:browser-lane` (61). The
lockfile sha before and after this run is identical, so the green was not bought by a
further resolution change.

### 9.3 The lanes, re-run against the post-install tree

| Lane | 2026-09-25 | **2026-09-28, post-install** | Verdict |
|---|---|---|---|
| `yarn validate:all` | 61 links, exit 1 at link 51 | **61 links, `EXIT=0`, zero `✗`** | **improved — the standing red is gone** |
| browser lane (app-local runner) | 170 files · 1,462 tests · 1,462 passed · 0 failed | **170 files · 1,462 tests · 1,462 passed · 0 failed · 145.68 s · `EXIT=0`**, `grep -c FAIL` → **0** | **held — item 1's fix survives the reinstall** |
| unit suite | 574 files · 11,182 passed · 0 failed | **574 files · 11,180 passed · 2 failed · 3 skipped · 1 todo · `EXIT=1`** | **two tests flipped, and they are defect PINS** |

### 9.4 The two failing tests are defect pins, not a regression — named precisely

Both failures are in **one** file, `packages/tooling/src/validators/peer-icon-duplicates.spec.ts`,
and both assert that the repository **still has** the icon duplication:

```
FAIL  peer-icon-duplicates.spec.ts > the real repository
        > records the duplication that is open as TASK-R1-O6 item 1 (D174)
  AssertionError: expected [ '0.477.0' ] to deeply equal [ '0.475.0', '0.477.0' ]
  at peer-icon-duplicates.spec.ts:225   expect(report.versions).toEqual(['0.475.0', '0.477.0'])

FAIL  peer-icon-duplicates.spec.ts > the real repository
        > names every declarer in the diagnostic a human reads
  AssertionError: expected '' to contain 'packages/core/package.json'
```

The spec's own comment says why it was written that way — *"this fact is asserted rather
than tolerated, so nobody can quietly re-introduce a second version under cover of the
first"*. **The pinned fact no longer exists, so the pin fails. That is the pin working.**

**Arithmetic confirms nothing was added or lost:** 11,180 passed + 2 failed = **11,182**,
the handed baseline exactly, over the same **574** files. 573 of 574 files pass. **Not one
failure touches this batch's work** — item 1's files are in
`packages/core/src/components/forms/`, and the seam's own nine story files are in the
browser lane, which is green. `packages/core/security/inline-style-inventory.spec.ts`
**passes**, so item 2's artifact is fresh on the post-install tree too.

**This batch did not edit that spec, deliberately.** Inverting the two assertions would be
*deciding* that `D174` / TASK-R1-O6 item 1 is closed, and that decision is entangled with a
second open fact the gate itself reports — `lucide-vue-next` is **deprecated upstream**
(*"Please use @lucide/vue instead"*) — so "exactly one version resolves" may not be the
assertion the owner wants next. Raised as **`D-RES07-3`** instead (§5 / register §14.5).
A pin that outlives its defect is retired by the person who decided the defect was fixed.

### 9.5 Corrected headline for the owner

- **`validate:all`: 61 links, `EXIT=0`, zero `✗`.** The seven-report-old red at link 51 is
  **closed**, by the `yarn install` `D-RES01-1` always named.
- **Browser lane: green, unchanged** — 170 / 1,462 / 0 failed.
- **Unit suite: `EXIT=1`, 2 failed of 11,182, both in one file, both defect pins whose
  defect has been fixed.** One-line fix, and it is a decision: retire or invert
  `peer-icon-duplicates.spec.ts:225` and the declarer assertion beneath it.
- **`yarn.lock` is modified and this batch did not modify it.** Left exactly as found.
