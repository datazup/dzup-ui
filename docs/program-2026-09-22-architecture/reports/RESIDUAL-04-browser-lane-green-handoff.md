# RESIDUAL-04 — the browser lane to zero red (`D-RES03-2`, R5-O9 `F-5`)

> Repository `ui/dzup-ui`, HEAD **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`**,
> worktree dirty by design (**301 paths at start**). No commit, push, CI dispatch,
> publish, `yarn install`, baseline replacement or screenshot capture was performed.
> Written incrementally, phase by phase, so a stall cannot lose the work.

**Status: COMPLETE.** The lane is **0-red** — `yarn storybook:test` → **170 files,
1,462 tests, 1,462 passed, 0 failed, `EXIT=0`**, with the **test count unchanged**
(1,462 → 1,462: no test deleted, no story skipped, no threshold loosened, no
`continue-on-error`). `D-RES03-2` closed. **Two of its four rows were misdiagnosed:
the `Async Options` pair is a real, user-visible component defect of `DzCombobox` and
`DzMultiSelect`, not a harness assumption** — and the recommendation this programme
carried for it would have turned the lane green *over* the defect. Fixed in
`DzOptionsState.vue`, which turns out to be a **conformance gap**: the rule was
already renderer contract **C9.4**, and one control in seven kept it. Three seeded
breaks prove the three fixes discriminate, each restored byte-identically. Two owner
decisions raised (`D-RES04-1`, `D-RES04-2`), **no ratchet moved**, two generated
artifacts regenerated with their deltas verified to the key, tree delta **+3 paths**.

## 0. Start state, recorded before anything was touched

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **301** |
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` |
| `find packages apps e2e -name '__screenshots__'` | **nothing** |
| `git worktree list` | one entry |

Canonical entry re-confirmed **before** any edit, with the app-local runner
(`apps/storybook` owns its own `vitest` / `@vitest/browser` / `vite` 6.4.1 under
`installConfig.hoistingLimits: "workspaces"`; the root binary hangs ~415 s with
`collect 0ms`):

```
cd apps/storybook
node node_modules/vitest/vitest.mjs run --project=storybook \
  ../../packages/core/stories/buttons/DzButton.stories.ts
→ 1 file, 16 tests, 16 passed, 9.59 s, EXIT=0   (file-captured)
```

<!-- PHASES APPENDED BELOW -->

---

## 1. Root cause of each of the four reds — and the triage that has to be corrected

RESIDUAL-03 triaged all four as **harness assumptions, 0 component defects**. Two of
those four calls hold. **Two do not.** Measured, not argued:

| # | Story | What the assertion claimed | Why it failed | Class, measured |
|---|---|---|---|---|
| 1 | `layout/DzGrid.stories.ts` › `Form Layout Node (colSpan + rowSpan)` | `notes.height > first.height * 1.5` | **The assertion was wrong about CSS grid.** `notes` carried `colSpan: 6, rowSpan: 2` in a `cols=6` grid, so it was the **sole occupant** of both tracks it spanned. Both implicit tracks are content-sized, so grid distributes the item's own content across them and the item is **not** taller than a one-row sibling: `54` px vs `54` px, hence `expected 54 to be greater than 81` | **harness** — confirmed |
| 2 | `forms/AsyncOptionsStates.stories.ts` › `5. Stale-response discard` | after the newest request is answered with `PEOPLE`, `Ada Lovelace` renders | **The fixture contradicted the control.** The walk types `ab` into the panel's search box, and `DzSelect`'s `searchable` path **re-filters host-supplied items locally** (`filteredItems`, label substring). No label in `PEOPLE` contains `ab`, so the host's answer arrived and was then filtered away. `TestingLibraryElementError` | **harness** — confirmed, and it uncovered a **second** finding (`D-RES04-2`) |
| 3 | `forms/DzCombobox.stories.ts` › `Async Options: loading → ready → error → retry` | pressing the in-panel `Try again` emits `retry-options` + a fresh request, then the list returns | **A real component defect.** See below | **component defect** — RESIDUAL-03 / R5-O9 `F-5` had the cause wrong |
| 4 | `forms/DzMultiSelect.stories.ts` › same story | same | same | **component defect** |

### #3 / #4 — `F-5` is not a harness assumption, and the recorded cause was wrong

R5-O9's `F-5` and RESIDUAL-03 §2 both explain the pair by quoting
`AsyncOptionsStates.stories.ts`'s header: *"the panel is a dismissable layer and a
pointer-down outside it closes the panel"*. That sentence is **true and about a
different thing** — it is about the story's on-page **host buttons**, which really
are outside the panel. The retry control is **inside** the panel, so no
pointer-down-outside occurs, and the pair fails for a cause nobody had measured.

Two probes, one variable, in real chromium (`apps/storybook`, app-local runner),
reading the live DOM at the instant after the press:

| Probe | How the retry was activated | `[data-part="content"]` | `data-state` | retry still in DOM | `activeElement` | `retries`/`requests` |
|---|---|---|---|---|---|---|
| A | `userEvent.click(retry)` — focuses first, as a browser does | **0** | `NO-CONTENT` | **false** | **`BODY`** | 1 / 2 |
| B | `retry.click()` — activates without moving focus | **1** | **`open`** | **true** | **`INPUT#input`** | 1 / 2 |

Both probes fire the handler (`retries=1`, `requests=2`), so the click is not the
problem. The only variable is **focus**, and it flips the outcome. The chain:

1. `useAsyncOptions`'s `canRetry` is `state === 'error'` and nothing else, so the
   retry control **removes itself the instant it is pressed** — pressing it makes
   the state `loading`, which makes `canRetry` false.
2. A pointer press focuses a `<button>` first. Removing the focused element hands
   focus to `document.body`.
3. Reka's `DismissableLayer` (which wraps `ComboboxContent`) reads focus arriving on
   `body` as focus leaving the layer, dismisses, and `ComboboxContentImpl`'s
   `onDismiss` calls `onOpenChange(false)`. The panel **closes under the user.**

So a real person clicking `Try again` in a `DzCombobox` or `DzMultiSelect` panel
never sees the retry result. It is user-visible, it is not a story artefact, and
jsdom could not show it because the layer's `focusin` bookkeeping and jsdom's focus
model do not interact the same way.

**`DzSelect` is not affected, and the two halves of that claim have different
confidence.** *Measured:* `AsyncOptionsStates` › `3. Error with retry` drives the same
`userEvent.click(retry)` against `DzSelect` and **passed both before and after this
fix** — so the defect is specific to the two controls whose panels are Reka
`Combobox` content. *Inferred:* the reason is that Reka's `SelectContent` is a modal,
focus-trapped layer, so focus landing on `body` is pulled back inside instead of
reading as an escape. The behavioural difference is the evidence; the mechanism is a
reading of Reka's source, not a probe. Either way it is the difference `F-5`'s
"verified in jsdom only" label hid for a week: **one control in the family passed the
identical walk**, which should have been the clue that the walk was not the problem.

---

## 2. Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/core/src/components/forms/DzOptionsState.vue` | **+1 binding, +30 comment lines.** The retry control gains `@mousedown.prevent`, so activating it does not move focus off the panel's focus owner | **Behavioural fix to a published package** (`@dzup-ui/core`). No prop, emit, slot, `data-part`, message key or class changed; `DzOptionsState` is internal and not exported from the family barrel. The only change is that a pointer press on `Try again` no longer takes focus — and therefore no longer dismisses a non-modal dismissable panel. **Changeset added** (see below) |
| `packages/core/stories/layout/DzGrid.stories.ts` | `Form Layout Node` now renders the layout its own prose describes: `notes` is `colSpan: 3, rowSpan: 2` **beside** `email`/`phone` stacked, and a seventh node `total` (`colSpan: 6`) is added so the `6 of 6 === 'full'` claim keeps a subject. `play()` rewritten: **12 `expect` calls where there were 6**, counted | none — `apps/storybook` and the stories are not published. **No test lost: the file is 14 tests before and after** (one per story) |
| `packages/core/stories/forms/AsyncOptionsStates.stories.ts` | `5. Stale-response discard` types `ad` instead of `ab`, so the mock answers a query its dataset matches, as a real host does; **+1 assertion** pinning finding `D-RES04-2` | none. **8 tests before and after** |
| `.changeset/pressing-try-again-no-longer-closes-the-panel-under-you.md` | **new.** `@dzup-ui/core: patch` | the changeset itself |
| `packages/core/docs/component-meta.json` | **regenerated** (`yarn generate:component-meta`). Required: the `DzGrid` story file is a declared input and its example **line ranges** moved. Verified delta — **1 entry changed (`DzGrid`), 0 added, 0 removed, every diff line a `lines: [from, to]` pair** (§11) | none. Already ` M` at session start |
| `apps/docs/.vitepress/generated/nav.json` | **regenerated** (`yarn generate:docs-pages`). Required by the two-way freshness handshake: nav records the meta artifact's sha256. Verified delta — **one key, `artifactSha256`, `74d0d2cb…` → `347b2530…`**; all 153 component pages and the 6 evidence pages regenerated **byte-identically** (§11) | none. Already ` M` at session start |
| `docs/.../owner-decision-register-2026-09-22.md` | §11 addendum: `D-RES03-2` closed, `D-RES04-1`/`D-RES04-2` raised, R5-O9 `F-5`'s diagnosis corrected. Nothing renumbered, no row rewritten | none |
| `docs/.../EXECUTION-STATUS.md` | `## Residual batch — RESIDUAL-04` appended | none |

**A changeset IS owed and was added.** `DzOptionsState.vue` is inside
`@dzup-ui/core`, which **is** in `packages/tooling/scripts/release-policy.json`'s
`published` list (`contracts`, `core`, `mcp`, `nuxt`, `testing`, `tokens`). The two
story files and this report are not: stories ship with the repository, not the
package, and `@dzup-ui/storybook` is `private: true`. Level `patch`, because no
declared surface changed — a defect that made a documented control unusable is a
fix, not a feature.

**What the `DzGrid` assertion asserts now.** The old check compared a `rowSpan: 2`
item against a one-row sibling **while that item was the sole occupant of both
tracks it spanned** — a comparison CSS grid is entitled to answer `54 === 54`. Four
independent facts replace it, and each of them is false if `rowSpan` stops working:

```ts
await expect(phone.top).toBeGreaterThanOrEqual(email.bottom)   // the premise: two tracks
await expect(notes.height).toBeGreaterThan(email.height * 1.5) // it covers both
await expect(Math.round(notes.top)).toBe(Math.round(email.top))
await expect(Math.round(notes.bottom)).toBe(Math.round(phone.bottom))
await expect(getComputedStyle(node('notes')).gridRowEnd).toBe('span 2')
```

The last line is the one the class-name check could never make: `className` proves
the component *emitted* `row-span-2`; `gridRowEnd` proves the stylesheet *resolved*
it to two tracks. A `row-span-2` Tailwind never emitted reads `auto`.

---

## 3. Seeded-break proofs — three of them, each restored byte-identical

A test that cannot be made to fail is not a test. Two earlier defects in this
programme passed while asserting `toBeTruthy()` on SSR output that was literally
`'<!---->'`, so every fix here was driven red **on the live tree** before it was
believed green. Each seed was applied to *component* source, never to the test, so
what is proved is that the **test** notices.

| # | What was broken | File | Result under the break | Line that failed | Restored sha256 |
|---|---|---|---|---|---|
| 1 | `rowSpan` handling removed from `DzGridItem`'s class list (`spanClassesFor(props.rowSpan, gridItemRowSpanMap)` → `''`) | `packages/core/src/components/layout/DzGridItem.vue` | **1 failed / 13 passed, `EXIT=1`** — `expected 54 to be greater than 81` | `DzGrid.stories.ts:313`, the **geometry** assertion | `88f33367…1feac` — **identical** to the pre-seed byte |
| 2 | `@mousedown.prevent` deleted from the retry control | `packages/core/src/components/forms/DzOptionsState.vue` | **2 failed / 26 passed, `EXIT=1`** — both `Async Options` stories, at `asyncOptionsHost.ts:170` | the exact pre-fix failure, reproduced on demand | `d35840b8…0a21d` — **identical** |
| 3 | The supersede fence removed from `useAsyncOptions.request()` (`abort()` deleted before the new controller) | `packages/core/src/composables/useAsyncOptions/useAsyncOptions.ts` | **1 failed / 7 passed, `EXIT=1`** — `expected +0 to be 3` | `AsyncOptionsStates.stories.ts:581`, `aborted() === total - 1` | `e3982e87…bb4b7` — **identical** |

Proof 1 matters most for the `DzGrid` fix, because the thing to prove is that the
*geometry* discriminates and not merely the class-name check that sits four lines
later: the run stops at line 313, before any `className` assertion is reached.

Proof 3 matters most for the `AsyncOptionsStates` fix, because that fix changed a
**fixture** (`ab` → `ad`). A fixture change is exactly the shape that can defang a
test by accident, so the story was driven red through the invariant it exists to
prove — the fence — and it still fails when the fence goes.

All three restores are `cp` from a byte copy taken before the seed, verified by
`sha256sum` against the recorded value; `git status --porcelain` confirms
`useAsyncOptions.ts` is **clean** again (it was clean before) and that
`DzGridItem.vue` carries exactly the ` M` it already carried at session start.

**One hash to read carefully.** `DzOptionsState.vue`'s *final* sha256 is
`6fb0b264…b53f1c`, not the `d35840b8…0a21d` that proof 2 restored to. That is not a
failed restore: proof 2 restored the file byte-for-byte to its state at the time, and
the file was edited **afterwards**, to rewrite the comment that broke
`validate:anatomy-parts` (§9). The behaviour-bearing line — `@mousedown.prevent` — is
identical in both. Proof 2 was then **re-run against the final bytes** so the
published hash is the one under proof:

| Re-proof on the final bytes | Result |
|---|---|
| `@mousedown.prevent` deleted from `6fb0b264…b53f1c` | **2 failed / 26 passed, `EXIT=1`** — both `Async Options` stories |
| restored from the byte copy of the final file | sha256 **`6fb0b264…b53f1c`** — identical |
| whole lane re-run after the restore | **170 files · 1,462 tests · 1,462 passed · 0 failed** (§5) |

---

## 4. What was refused, and why — the three things this packet did **not** do

**1. It did not take the lane green by loosening anything.** No assertion deleted,
no threshold widened, no story skipped, no `continue-on-error`, no `.skip`, no
`screenshotFailures`, no ceiling raised. Test count per touched file is unchanged:
`DzGrid` **14 → 14**, `AsyncOptionsStates` **8 → 8**, `DzCombobox` **16 → 16**,
`DzMultiSelect` **12 → 12**. The `DzGrid` story's `play()` went from **6 `expect`
calls to 12** and gained a seventh layout node; `AsyncOptionsStates` gained one
`expect`.

**2. It did not switch the `Async Options` pair to a programmatic drive**, which is
what `D-RES03-2` option (c) and RESIDUAL-03 §11 item 2 both recommended. That was
the right recommendation under the belief that the pair was a harness artefact. It
is not: the measurement in §1 shows a focusing press is exactly what a user does,
and a story that stopped doing it would have gone green over a live defect. Both
stories still call `userEvent.click(retry)`, unchanged, and now **pass because the
component was fixed** — which is why seeded-break proof 2 is possible at all.

**3. It did not rebuild focus management across the seam.** The fix closes the
**pointer** path, which is the path a user takes and the path the stories drive. A
**keyboard** question remains open, and it is raised rather than answered because it
is a design decision with more than one defensible answer. Two halves, stated at the
confidence each deserves:

- **Measured:** `canRetry` is `state === 'error'` and nothing else, so the retry
  control still unmounts on activation. A keyboard user who *did* have it focused
  would lose focus to `document.body` exactly as the pointer path did, and the same
  dismissal would follow. The pointer fix does not cover that.
- **Inferred, not measured:** whether a keyboard user can reach the control at all.
  It is a `<button>` inside a panel portalled to `document.body`, so with focus in
  the panel's input, `Tab` follows document order into the host page rather than the
  portal. That reading comes from the markup and the portal target, **not** from a
  key-by-key probe, and it is written here as a hypothesis for the owner to test.

Raised as **`D-RES04-1`**. It is a WCAG 2.1.1 / 2.4.3 question about the seam and
touches seven published controls, which is not a red-lane packet's call to make.

---

## 5. The lane — 4 red to 0 red, with no test lost

`yarn storybook:test` (the shipped entry point, whole lane, nothing filtered),
against `4e4e46f` plus the dirty tree:

| | RESIDUAL-03 measured, 2026-09-25 | **After the four fixes** | **Confirmation run, final bytes** |
|---|---|---|---|
| Files | 170 | **170** | **170** |
| Tests | 1,462 | **1,462** | **1,462** |
| Passed | 1,458 | **1,462** | **1,462** |
| **Failed** | **4** | **0** | **0** |
| Wall | 95.86 s / 103.80 s | **102.62 s** | 134.41 s |
| Exit (file-captured) | `EXIT=1` | **`EXIT=0`** | **`EXIT=0`** |
| `FAIL` lines in the log | 4 | **0** (`grep -c FAIL` → 0) | **0** |

The lane was run twice green: once on the bytes that fixed the four reds, and again
after `DzOptionsState.vue`'s comment was rewritten for §9 and the seeded-break
re-proof was restored — so the published 0-red result is measured on the **exact
bytes the owner will commit**. The 102.62 s and 134.41 s figures are the same suite on
the same machine at different cache temperatures; neither is a CI number.

**The test count is identical, 1,462 → 1,462.** Nothing was reached by removing a
test: the four reds became four passes, and the four extra `DzGrid` /
`AsyncOptionsStates` assertions live inside stories that were already counted as one
test each. Phase breakdown, for the record:
`setup 423.62s, collect 383.39s, tests 354.38s, environment 0ms, prepare 11241.58s`
— aggregate worker time against 102.62 s wall, and `environment 0ms` is still the
browser lane's structural advantage over jsdom.

### What each fix asserts now, against what it claimed before

| Story | Claimed | Why that was wrong | Asserts now |
|---|---|---|---|
| `DzGrid` › `Form Layout Node` | `notes.height > first.height * 1.5` with `notes` the sole occupant of both spanned tracks | CSS grid distributes a sole occupant's own content across content-sized tracks, so the item is **not** taller — `54 === 54`, and the check could never pass for any working `rowSpan` | `notes` is `colSpan: 3, rowSpan: 2` **beside** `email`/`phone` stacked: `phone.top ≥ email.bottom` (two tracks exist) · `notes.height > email.height * 1.5` · `notes.top === email.top` · `notes.bottom === phone.bottom` · `getComputedStyle(notes).gridRowEnd === 'span 2'`. Plus, on the column axis, `notes.width === first.width`, `summary.width > first.width * 1.5`, and `total.width === summary.width` — a new 7th node that keeps the `colSpan 6 of 6 === 'full'` claim alive |
| `AsyncOptionsStates` › `5. Stale-response discard` | the newest request's answer renders `Ada Lovelace`, having typed `ab` | `DzSelect`'s `searchable` path re-filters **host-supplied** items locally, and no `PEOPLE` label contains `ab` — the answer arrived and was filtered away | the query is `ad`, which the dataset matches, as a real host's answer would; the fence assertions are untouched; **+1 new assertion** that `Grace Hopper` — a row the host *did* return — is **not** on screen, pinning finding `D-RES04-2` instead of leaving it to be tripped over again |
| `DzCombobox` / `DzMultiSelect` › `Async Options` | pressing the in-panel `Try again` emits `retry-options` + a fresh request, then the list returns | **nothing** — the claim was right and the component was wrong | **exactly the same assertions, unchanged**, including `userEvent.click(retry)`. They pass because `DzOptionsState`'s retry no longer takes focus, so the panel is no longer dismissed out from under the retry it started |

---

## 6. The fix was already the contract — six of seven controls were not keeping it

This reclassifies `#3`/`#4` a second time, from "a defect with a judgement call
attached" to a **conformance gap with a precedent in the repository**.

`DzMention` already prevents the mousedown on its own `DzOptionsState` instance, and
its contract spec asserts it **by clause number**:

```ts
// DzMention.contract.spec.ts:198
// A pointer retry must not steal focus from the text control (C9.4).
const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
retry.element.dispatchEvent(mousedown)
expect(mousedown.defaultPrevented).toBe(true)
```

Measured spread of that clause before this batch:

| Probe | Result |
|---|---|
| `grep -rn 'C9\.4' packages/ docs/` | **2 hits, both inside `DzMention`'s own files** (`DzMention.vue:323`, `DzMention.contract.spec.ts:198`) |
| `grep -rn mousedown packages/core/src/components/forms/*.vue` | the retry binding on **`DzMention` only** (`:845`) — plus two unrelated handlers (`DzMention`'s option rows, `DzTagsInput`'s field) |

So **one** of the seven hosts of the shared row implemented C9.4 and tested it, and
**six** did not — and the clause lives nowhere a reader would find it except in the
one control that happened to obey it. Putting the rule on the shared row is what the
shared row is for; its own header says as much (*"it exists so that seven controls
render the same row rather than seven near-copies of it"*). `DzMention`'s binding is
left in place — belt and braces, and its contract spec still passes (573 files /
11,153 passed).

**`DzMention` also shows the second half of the answer**, which is why
`D-RES04-1` is cheap for the owner rather than open-ended:
`handleRetryOptions()` ends with `void nextTick(() => controlRef.value?.focus())`,
an explicit return of focus to the text control. That is precisely the piece
`DzCombobox` and `DzMultiSelect` lack, and it closes the keyboard half. It was not
copied here because neither control holds a template ref to its Reka
`ComboboxInput`, so it is a real change to two components rather than a one-line
generalisation — and it should be made after the reachability question in
`D-RES04-1` is answered, not before.

---

## 7. Ratchet movements — none

Every frozen figure re-read from the artifact that owns it, not quoted from a prior
report. **No ceiling raised, no allowlist widened, and no `*ceilings*.json` file
opened for writing.**

| Ratchet | Frozen at | Measured after this packet | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `fail` | 0 | **0** (A 0 + B 0 + C 0 + D 0) | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `stale` | 22 | **22** (0 + 0 + 21 + 1) | same |
| capability `unrun` | 400 | **400** (65 + 247 + 87 + 1) | same |
| capability `excepted` | 47 | **47** (4 + 41 + 2 + 0) | same |
| AT executed | 0 of 534 | **0 of 534** — 89 entries × 6 pairs, **0** recorded `pass`/`fail` results, counted programmatically | `e2e/at-matrix/index.json` |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `packages/tooling/src/validators/i18n-completeness-ceilings.json` |

**Two generated artifacts were regenerated, both required, both with the delta
verified rather than assumed** — `component-meta.json` and
`apps/docs/.vitepress/generated/nav.json`, for the reason and to the byte in §11.
Nothing else: no export, token, anatomy, ownership entry or public API moved, so the
capability matrix, quality matrix, `llms-full.txt` and the 153 docs component pages
have no moved input (the pages were re-rendered as part of `generate:docs-pages` and
came out **byte-identical**). `yarn build` ran clean (`EXIT=0`) and rewrote **no
tracked file**: the `git status` diff against session start adds exactly the lines
this packet intended and removes none.

**Nothing that moved is a ratchet.** `validate:all` is still **61 links**, measured
by splitting `scripts['validate:all']` on `&&` (never quoted), with
`yarn validate:peers` at **link 51** and `yarn validate:browser-lane` at **link 61**.
The unit suite is **11,153 passed**, identical to the baseline — this packet added no
test and lost none.

---

## 8. Owner decisions — one closed, two raised

Recorded in the register's **§11** addendum (appended, nothing renumbered).
`D-RES03-2`'s row keeps its original text — including the triage this batch
falsifies — and gains a dated `Status, 2026-09-25` row. `F-5` in
`docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md` is treated the same way: the
row is left as written and gains a dated `RESOLVED` note.

**Closed**

- **`D-RES03-2`** 🟠 → 🟢 **CLOSED.** All four reds fixed, lane 0-red, test count
  held. Option (a) discharged; option (c) **deliberately not taken**, because it was
  the recommendation that would have hidden the defect.

**Raised**

- **`D-RES04-1`** 🟠 — **the retry control's keyboard path.** `canRetry` is
  `state === 'error'` and nothing else, so the control still unmounts on activation;
  a keyboard user who had it focused would lose focus to `document.body` exactly as
  the pointer path did. `@mousedown.prevent` does not cover that. Separately, and
  **inferred rather than measured**, a keyboard user may not be able to reach the
  control at all — it is a `<button>` in a panel portalled to `document.body`, so
  `Tab` follows document order into the host page. `DzMention` already shows the fix
  (`void nextTick(() => controlRef.value?.focus())` in its retry handler, the second
  half of C9.4); the other six controls lack it, and `DzCombobox`/`DzMultiSelect`
  hold no template ref to their Reka `ComboboxInput`, so it is a real change to two
  components. Options: (a) accept the pointer fix and schedule the rest ·
  (b) **probe reachability first (~15 min in this lane), then choose** · (c) take the
  general focus-restoration fix now across seven controls with an a11y review.
  **Recommend (b) then (c)** — (b) decides whether this is a focus-restoration bug or
  a reachability bug, and they have different fixes. ~45 min for (c) with the
  precedent in hand.
- **`D-RES04-2`** 🟠 — **a `searchable` control re-filters the rows its host
  returned.** `DzSelect.filteredItems` applies a label-substring filter to
  `props.items` whenever `searchable` is set, including when a host is driving the
  options — while the comment on `handleSearch` says that filter *"is a no-op"* in
  exactly that case. Measured: the host answered a query with three people and **all
  three were hidden**. A host matching on an e-mail, a fuzzy score or a server
  ranking has rows it deliberately returned silently removed. Same class as
  `D-S3O2-5` and **pinned the same way** rather than fixed, because it changes what
  seven published controls render. Options: (a) leave and document on the seam's page
  · (b) skip the local filter when the control is host-driven (`isAsync`) · (c) add an
  opt-out prop. **Recommend (b)** as a minor, updating the pinning assertion in the
  same change.

**Left explicitly to their owners, unchanged by this packet:** the icon
`yarn install` that clears `validate:all` link 51 (RESIDUAL-01 `D-RES01-1`), the
`browser-matrix` input's missing `gate` block and the question of whether the
Storybook lane should be a capability-matrix input at all (RESIDUAL-03 items 3–4),
the 25 body-wiping jsdom specs (S5-O2), and `D91`.

---

## 9. A gate this packet broke, and what that says about the comment it broke on

Worth its own section, because it is the second time in this programme that the
*evidence* for a fix was the thing that failed a gate, and because a reader of
`DzOptionsState.vue` will otherwise be tempted to undo the workaround.

The first draft of the `@mousedown.prevent` comment quoted the measurement verbatim,
including the attribute-literal forms of a part name and a state value.
`validate:anatomy-parts` reads an SFC **as text**, so it cannot tell a quoted
anatomy name inside an HTML comment from an emission, and `yarn validate:all` came
back:

```
✗ packages/core/src/components/forms/DzOptionsState.vue:83 emits data-part="…",
  which no anatomy declares — not DzOptionsState's own, not a composing parent's.
✗ packages/core/src/components/forms/DzOptionsState.vue:85 can emit data-state="…",
  which DzOptionsState's anatomy does not declare.
✗ undeclared-emission: 1 … exceed the checked-in ceiling of 0.
✗ undeclared-state:    1 … over the ceiling of 0.
```

That is **link 14 of the measured 61** (`yarn validate:anatomy-parts`), i.e. the
chain stopped 37 links earlier than its standing pre-existing red at link 51 — so a
packet that had only re-run the *focused* gates, or had quoted RESIDUAL-03's
`validate:all` result instead of measuring its own, would have handed the owner a
chain that dies at link 14.

**Two failures, both mine, both false positives, and neither a reason to raise a
ceiling.** The ceilings are 0 and stayed 0. The comment was rewritten to name the
part and the state in prose instead of in attribute syntax, and
`yarn validate:anatomy-parts` returns **`EXIT=0`**. A note now sits in the comment
telling the next editor why the prose form is deliberate, because the obvious
"improvement" — quoting the attributes properly — re-breaks the gate.

It is also a small, genuine finding about the validator, recorded rather than filed:
`validate:anatomy-parts` has **no comment stripping**, so any SFC comment that quotes
an anatomy attribute fails it. That is arguably the right trade (a regex that
understood comments could be fooled by a string that looks like one), the ceiling is
0 either way, and the failure is loud and immediate rather than silent — which is the
opposite of the defect class this programme keeps finding. Left as is.

---

## 10. Focused validation — every command, every exit read out of a file

No exit code below was read from a harness completion notice. Each command ran as
`cmd > local.log 2>&1; echo "EXIT=$?" >> local.log` and the value was read back out
of the log. The reason is RESIDUAL-03 §6.2's, restated because it keeps being worth
restating: the wrapper's last statement is the `echo`, so the notice reports the
**wrapper**, not the gate, and is 0 by construction whatever the gate did. **In this
batch the harness reported "exit code 0" for a run whose log ends
`VALIDATE_ALL_EXIT=1`** — correctly, and uselessly.

| # | Command | Result | Exit (from the log) |
|---|---|---|---|
| 1 | app-local runner on `DzButton.stories.ts` — the canonical entry, **before any edit** | 1 file, **16 tests, 16 passed**, 9.59 s | **`EXIT=0`** |
| 2 | app-local runner on the four failing story files — **reproduction before any fix** | **4 files, 50 tests, 46 passed, 4 failed**, 13.71 s; the four errors at `DzGrid.stories.ts:294`, `AsyncOptionsStates.stories.ts:590`, `asyncOptionsHost.ts:170` ×2 | **`EXIT=1`** |
| 3 | probe A — instrumented walk, `userEvent.click(retry)` | `contentCount=0 · retryConnected=false · active=BODY · retries=1 requests=2` | `EXIT=1` (the probe's own throw) |
| 4 | probe B — same, `retry.click()` | `contentCount=1 · contentState=open · retryConnected=true · active=INPUT#input · retries=1 requests=2` | `EXIT=1` (same throw) |
| 5 | `DzCombobox` + `DzMultiSelect` **after the component fix** | **2 files, 28 tests, 28 passed**, 10.16 s | **`EXIT=0`** |
| 6 | `DzGrid` + `AsyncOptionsStates` **after the story fixes** | **2 files, 22 tests, 22 passed**, 10.91 s | **`EXIT=0`** |
| 7 | seeded break 1 — `rowSpan` handling removed from `DzGridItem` | **1 failed / 13 passed**, at `DzGrid.stories.ts:313` | **`EXIT=1`** |
| 8 | seeded break 2 — `@mousedown.prevent` deleted | **2 failed / 26 passed**, both at `asyncOptionsHost.ts:170` | **`EXIT=1`** |
| 9 | seeded break 3 — `abort()` removed from `useAsyncOptions.request()` | **1 failed / 7 passed**, at `AsyncOptionsStates.stories.ts:581` | **`EXIT=1`** |
| 10 | `yarn storybook:test` — **the whole lane** | **170 files · 1,462 tests · 1,462 passed · 0 failed · 102.62 s**; `grep -c FAIL` → **0** | **`EXIT=0`** |
| 11 | `yarn typecheck` | no output | **`EXIT=0`** |
| 12 | `yarn typecheck:all` | no output | **`EXIT=0`** |
| 13 | `yarn lint` | **no output at all** (`--max-warnings 0`); `--fix` **not** used | **`EXIT=0`** |
| 14 | unit suite — `node node_modules/vitest/vitest.mjs run` | **573 files · 11,153 passed · 3 skipped · 1 todo (11,157) · 0 failed**, 374.50 s — **identical to the handed baseline** | **`EXIT=0`** |
| 15 | `yarn build` | clean; rewrote **no tracked file** | **`EXIT=0`** |
| 16 | `yarn validate:all` — **first attempt** | **died at link 14** on two false positives caused by this packet's own comment (§9) | **`VALIDATE_ALL_EXIT=1`** |
| 17 | `yarn validate:anatomy-parts` after the comment was rewritten | passes | **`EXIT=0`** |
| 18 | `yarn lint` · `yarn typecheck` re-run on the final bytes | no output | **`EXIT=0`** · **`EXIT=0`** |
| 19 | `yarn validate:all` — **second attempt** | reached **link 35**, `component-meta.json` STALE (§11) | **`VALIDATE_ALL_EXIT=1`** |
| 20 | `yarn generate:component-meta` · `yarn validate:component-meta` | `209 components (144 public, 65 compound parts), 0 unclassifiable` · `✓ fresh, complete for all 144 public components, and every debt number at its ceiling` | **`EXIT=0`** · **`EXIT=0`** |
| 21 | `yarn validate:all` — **third attempt** | reached **link 38**, `nav.json` STALE (the meta-artifact sha handshake, §11) | **`VALIDATE_ALL_EXIT=1`** |
| 22 | `yarn generate:docs-pages` · `yarn validate:docs-pages` | **exactly one file changed** (`nav.json`, one key) · `✓ docs pages fresh — 144 component pages + index + 6 evidence pages + nav + playground seeds` | **`EXIT=0`** · **`EXIT=0`** |
| 23 | seeded break 2, **re-run on the final bytes** (§3) | **2 failed / 26 passed** | **`EXIT=1`** |
| 24 | `yarn storybook:test` — **confirmation run on the final bytes** | **170 files · 1,462 tests · 1,462 passed · 0 failed · 134.41 s**; `grep -c FAIL` → **0** | **`EXIT=0`** |
| 25 | `yarn validate:all` — **final** | **61 links** (measured, never quoted) · **exactly one `✗` in 471 lines**, at **link 51** · `validate:peers` passes, `validate:icon-duplicates` fails on `[single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0)` with the `0.475.0` row carrying **no declarant** — byte-for-byte the pre-existing red RESIDUAL-01/02/03 all recorded | **`VALIDATE_ALL_EXIT=1` — no new failure** |

Runs **2, 10 and 24** are the lane before and after, on the shipped entry point. Runs
**7–9 and 23** are the proof that runs 5, 6, 10 and 24 mean something. Runs **16, 19
and 21** are the three times this packet's own work broke the chain, each fixed without
touching a ceiling — and each of them invisible to runs 11–14, which were green
throughout.

**The aggregate qualification, stated plainly.** `validate:all` is **exit 1 for the
same reason and at the same link as the baseline this packet was handed** (link 51,
`^0.475.0` now with no declarant, clears on the owner's `yarn install`). Links **52–61
remain unreached inside the aggregate**, which is this programme's standing caveat, so
the three gates this packet drove red and green again — `validate:anatomy-parts` (14),
`validate:component-meta` (35) and `validate:docs-pages` (38) — are all **inside** the
part of the chain that does execute, and all three are green in run 25.

---

## 11. The generated artifact this packet did have to regenerate

RESIDUAL-03 regenerated nothing and owed nothing, because it changed no declared
input. **This packet changed one:** `packages/core/stories/layout/DzGrid.stories.ts`
is an input to `packages/core/docs/component-meta.json`, which records each story
example's **line range**. Adding a node and rewriting a `play()` moved those lines, so
`validate:all` came back a second time at **link 35**:

```
✗ [freshness] packages/core/docs/component-meta.json is STALE — it disagrees with a
  fresh extraction of the sources. Run `yarn generate:component-meta` and commit the result.
```

Regenerated with `yarn generate:component-meta` (`EXIT=0`,
`209 components (144 public, 65 compound parts), 0 unclassifiable`), and the delta was
verified rather than assumed — a structural diff of the parsed JSON before and after:

| Check | Value |
|---|---|
| Entries changed | **1 — `DzGrid`, and nothing else** |
| Entries added / removed | **0 / 0** |
| Diff hunks | **63 diff lines, every one a `lines: [from, to]` pair** of a `DzGrid` story example |
| Any description, prop, event, slot, type or template text changed | **no** |
| `validate:component-meta` after | `✓ fresh, complete for all 144 public components, and every debt number at its ceiling` · **`EXIT=0`** |
| Its own ratchets after | `unclassifiable 0 · unresolvedTypes 0 · publicComponentsWithoutRecord 0 · propsWithoutDescription 0 · slotsWithoutDescription 0 · eventsWithoutDescription 0 · exposedWithoutDescription 0 · publicComponentsWithoutExample 1 · componentsWithoutStaticTemplate 80 · descriptionsWithBareHtml 0` — **none moved** |

`component-meta.json` was **already ` M`** at session start, so regenerating it adds
no path to the owner's tree; it is the same file the packet that added `rowSpan` had
already regenerated. **No other generated artifact was regenerated**, and the chain
confirms none needed to be: the capability matrix, quality matrix, `llms-full.txt`,
DESIGN.md and the docs pages have no moved input — `yarn build` regenerates DESIGN.md
and the token artifacts on every run and rewrote **no tracked file**.

**Why this is worth a section rather than a footnote.** Both `validate:all` failures
this packet caused were caused by **evidence**, not by behaviour: a comment that
quoted an anatomy attribute (§9) and a story whose line numbers moved. Neither would
have been visible to `typecheck`, `lint`, the unit suite or the browser lane — all
five of which were green while the chain died at link 14, and then at link 35. That
is the argument for measuring `validate:all` rather than quoting a previous batch's
result for it.

---

## 12. Ranked next packet

1. **`D-RES04-1` step (b) — probe whether the retry control is keyboard-reachable** —
   ~15 minutes in this lane, and the cheapest decision-unblocker in the list. One
   story that tabs from the panel's input and asserts where focus lands settles
   whether the remaining gap is focus *restoration* or focus *reachability*. They have
   different fixes and the wrong one is wasted work.
2. **`D-RES04-1` step (c) — the second half of C9.4 across the seam** — ~45 minutes
   plus an a11y review, and only after (1). `DzMention` already has the shape
   (`void nextTick(() => controlRef.value?.focus())` in its retry handler); the work is
   giving `DzCombobox` and `DzMultiSelect` a template ref to their Reka
   `ComboboxInput` and doing the same. Needs a changeset, and a browser-lane assertion
   that drives the retry **by keyboard** — otherwise it regresses exactly the way the
   pointer path did.
3. **`D-RES04-2` option (b) — stop a host-driven `searchable` control re-filtering its
   host's rows** — ~1 h. A `minor` to `@dzup-ui/core`, plus updating the pinning
   assertion in `AsyncOptionsStates` › `5. Stale-response discard` in the same change.
   The only item here with a wrong comment in the source to delete as well as a
   behaviour to fix — `DzSelect.handleSearch` calls the local filter "a no-op".
4. **Decide (do not necessarily build) whether `validate:anatomy-parts` should skip SFC
   comments** — ~30 min of deciding. §9's false positive cost this packet a full
   `validate:all` run. The counter-argument is real: a regex that skips comments can be
   fooled by a string literal that looks like one, and a loud false positive against a
   0 ceiling is a much better failure than a quiet false negative. Recording the trade
   is most of the value.
5. **Give the capability matrix's `browser-matrix` input a `gate` block** — ~1 h,
   unchanged from RESIDUAL-03 item 3 and unchanged by this batch: it needs
   `capability-matrix.json` regenerated and `stale 22` is frozen.
6. **Consider making the Storybook lane a capability-matrix input** — ~2 h, still a
   design question rather than a wiring one (RESIDUAL-03 item 4), and now a **stronger**
   case: this batch found a real component defect that no other lane in the repository
   could have found, and the matrix has no cell that knows the lane exists.
7. **The 25 body-wiping jsdom specs** (S5-O2's packet) — ~8 h, untouched, still the
   prerequisite for moving the 153 clean component specs into browser mode.
8. **`D91`** — the owner's coverage re-baseline. Still the keystone for Vitest 4 and
   therefore Vite 8. Nothing here changed it.
---

## 13. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git status --porcelain \| wc -l` | **301** | **304** |
| `diff` of the two listings | — | **exactly 3 added lines, none removed, none modified:** ` M docs/program-2026-09-04/reports/TASK-R5-O9-handoff.md` (the dated `F-5` note) · ` M packages/core/src/components/forms/DzOptionsState.vue` (the fix) · `?? .changeset/pressing-try-again-no-longer-closes-the-panel-under-you.md`. Everything else this packet touched was **already** dirty at session start: `packages/core/stories/layout/DzGrid.stories.ts` ` M`, `packages/core/stories/forms/AsyncOptionsStates.stories.ts` `??`, `packages/core/docs/component-meta.json` ` M`, `apps/docs/.vitepress/generated/nav.json` ` M`, `docs/program-2026-09-22-architecture/EXECUTION-STATUS.md` ` M`, and the register plus this report inside the already-`??` `docs/program-2026-09-22-architecture/reports/` entry |
| `sha256sum yarn.lock` | `6332fae9…87adb` | **`6332fae9…87adb` — identical** |
| `yarn install` run? | — | **no.** None owed: no manifest dependency or version changed |
| `find packages apps e2e -name '__screenshots__'` | nothing | **nothing.** Ten browser-lane runs, four of them with failing stories (three of those deliberately seeded), wrote **zero** PNGs — the addon sets `screenshotFailures: false` |
| `*.png` newer than session start under `packages`/`apps`/`e2e` | — | **none** |
| Files temporarily modified and restored | — | **four**, each verified by `sha256sum` against a byte copy taken first: `packages/core/stories/_shared/asyncOptionsHost.ts` (the diagnostic probe — restored to `cd6cc490…d65d0`, back to **clean**) · `DzGridItem.vue` (`88f33367…1feac`) · `useAsyncOptions.ts` (`e3982e87…bb4b7`, back to **clean**) · `DzOptionsState.vue` (`6fb0b264…b53f1c`). `component-meta.json` was also swapped back and forth during an isolation test and ends on the regenerated bytes (`347b2530…f5008`), which is the state `validate:all` requires |
| Probe directory | — | `.residual04-probe/` created and **removed**; it held only logs, byte copies and two JSON snapshots, was never added to `.gitignore`, and appears in no listing at the end |
| `git worktree list` | one entry | one entry |
| Commit / push / CI dispatch / publish / baseline capture / screenshot capture | — | **none** |
| Ceilings, allowlists, `*ceilings*.json` | — | **untouched** (§7) |

---

## 14. The question this packet existed to answer

**Would the owner's first push now pass CI's `storybook-test` job?**

On this evidence, **yes, on the lane's own terms** — with one honest boundary, stated
in the `inputs[].gate` shape RESIDUAL-03 used:

| | Value |
|---|---|
| `platform` | **`win32`** (this machine, chromium via `playwright@1.61.1`) |
| `authoritative` | **`linux`** — CI's `storybook-test` is `ubuntu-latest`, and it is the only runner whose result can block a merge |
| `ciGate` | **`true` for the lane, `false` for these numbers.** The lane can and does fail CI; this run cannot qualify anything for anyone else |
| `blockedOn` | one `storybook-test` run on `ubuntu-latest` — a CI act, not an agent act |

What a win32 run **can** say: the four failures were reproduced here, root-caused
here, fixed here, and each fix was driven red on demand and green again — and two of
the four (`#3`, `#4`) fail on a mechanism that is **host-independent** (a focus
transfer and a layer's `focusin` bookkeeping), reproduced identically on 2026-09-18
and on 2026-09-25, which is itself the argument that the fix travels.

What it **cannot** say: that CI will be green. `DZUP_APP_SPECIFIC=1` is not set here,
so CI collects four story files this run did not; the tree is dirty by 304 paths; and
`#1`'s replacement assertions are **geometry**, the one class that is allowed to read
differently per host. Those assertions were written to be robust to that — they
compare siblings within the same grid and round to whole pixels, rather than testing
an absolute height — but a first `ubuntu-latest` run is still the only thing that
closes it, and no cell, baseline or matrix state was changed on the strength of a
win32 measurement.

**The pre-existing `validate:all` red at link 51 is unrelated and untouched**; it is
not in CI's `storybook-test` path and it clears on the owner's `yarn install`.

