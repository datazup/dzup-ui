# RESIDUAL-06 — the WCAG 2.1.1 reachability failure (`D-RES05-1`) and three earned `axe` cells (`D-RES05-2`)

> Repository `ui/dzup-ui` (OSS, `@dzup-ui/*`), HEAD
> **`4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a`**, worktree dirty **by design**
> (**311 paths handed in** — the 16-task programme plus RESIDUAL-01…05). No commit,
> push, CI dispatch, publish, `yarn install`, baseline replacement or screenshot
> capture was performed. Written **incrementally**, phase by phase: three agents in
> this programme stalled mid-task and only incremental writes saved their work.

**Status: COMPLETE.** Both items done, each proved able to fail by a seeded break on
non-test source, each seed restored byte-identically. Item 1 **decided** the design
`D-RES05-1` raised, implemented it across all eight hosts of the seam, and drove the keys
in real chromium — and found that RESIDUAL-05's own recommended option would not have
fixed the thing it was recommended for. Item 2 gave the three `unrun` cells real renders,
so `unrun` returns to **400** and `present` to **608** with no ceiling opened and no
baseline moved. **Three accessibility findings came out of the new renders**: one real
defect fixed, one real upstream defect raised, and one jsdom limitation named as such.
Two decisions closed, two raised. Both lanes hold: unit **574 / 11,182 / 0 failed**,
browser **170 / 1,462 / 0 failed**.

## 0. Start state, recorded before anything was touched

| Check | Value at start |
|---|---|
| `git rev-parse HEAD` | `4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a` |
| `git status --porcelain \| wc -l` | **312 as printed, 311 handed in** — the listing (not just the count, per RESIDUAL-05 §6's lesson) was snapshotted by the same command that created this batch's own probe directory, so the snapshot counted `?? .residual06/` itself. Subtracting it gives **311**, which is exactly RESIDUAL-05's exit number (§6) |
| `sha256sum yarn.lock` | `6332fae92448b45b41c114ab44e47087038eb59e48116cddccf3d17644e87adb` |
| `find packages apps e2e -name '__screenshots__'` | **nothing** |
| `git worktree list` | one entry |

RESIDUAL-05 ended on **311** paths and could not attribute one of its own, because it
had snapshotted only the *count*. This batch snapshotted the **listing**, which is the
whole of that lesson — and the listing immediately paid for itself by resolving the
question rather than repeating it. The `312` above is **this batch's own probe
directory counting itself**: `mkdir -p .residual06` and `git status --porcelain >
.residual06/start-status.txt` ran in the same command, so `?? .residual06/` is in the
snapshot. Subtract it and the handed-in tree is **311 paths, exactly RESIDUAL-05's exit
number**. **There is no unattributed path**, and RESIDUAL-05's own unattributed 311th
was most likely the same artefact one batch earlier. The cheap lesson, one turn further
on: **snapshot the listing before creating anything, and read your own directory out of
it** (§6).

<!-- PHASES APPENDED BELOW -->

---

## 1. Item 1 (`D-RES05-1`) — the WCAG 2.1.1 failure, decided and closed

RESIDUAL-05 raised this as a decision rather than a fix, correctly: there is more than
one defensible answer and the wrong one breaks the combobox pattern. **The decision is
taken here, implemented, driven in real chromium, and the rejected alternatives are
recorded** — the shape TASK-S3-O2 used for the `DzGrid` span API.

### 1.1 The pattern followed: the ARIA APG combobox, with the arrow keys it leaves free

The APG rule for a combobox with a listbox popup is that **`Tab` leaves the widget**
and the popup's own members are reached with the **arrow keys**. Both halves matter
here, and the second is the opening:

- `Tab` was never the route and must not become one. RESIDUAL-05 measured it leaving
  the panel and dismissing it, which is `Tab` doing exactly what the pattern says.
- In the **error** state the popup has no options, so the arrow keys are measured
  no-ops — RESIDUAL-05 drove `ArrowDown`, `ArrowUp`, `Home`, `End` and `PageDown` and
  focus never left the input. The popup's navigable set is empty, and the retry
  control is the one thing in the popup a user can act on.

So the retry control becomes **the popup's navigable set while the popup has no
options**: a bare `ArrowDown` or `ArrowUp` from the element that owns the control's
focus moves to it, `Enter` and `Space` activate it, `ArrowUp` hands focus back. `Tab`
keeps its APG meaning untouched, and **focus never leaves the widget**, which is why
the panel cannot be dismissed at any point in the route.

**Read how this repo already navigates its popups first, as the brief asked.** Two
findings from that reading decided the implementation, and the second ruled out the
obvious answer:

| What was read | What it showed |
|---|---|
| `DzMention.vue:536` `onKeydown`, `:aria-activedescendant="activeOptionId"` on its text control; `DzTreeSelect.vue:504` (*"…without moving DOM focus off the trigger"*); `components/data/treeNavigation.ts` | the repo's own hand-rolled popups keep focus on the control and drive `aria-activedescendant` — and `treeNavigation.ts` is the precedent for a bare helper module in a family directory, which is what `optionsStateFocus.ts` already is |
| `node_modules/reka-ui/src/Listbox/ListboxFilter.vue:46-47,73` | **Reka already owns `aria-activedescendant` on the combobox input**: `watchSyncEffect(() => activedescendant.value = rootContext.highlightedElement.value?.id)`, bound as `:aria-activedescendant`. The value comes from the listbox **collection** |
| `ListboxRoot.vue:166` | Reka's own listbox has a **real-focus** mode for the same navigation — `highlightedElement.value.focus()` when `focusable` — so moving DOM focus is not a foreign idea here, it is the primitive library's other setting |
| `ComboboxInput.vue` `handleBlur` | it closes the popup when focus leaves, **except** when the new target is inside the root or inside the content: `if (!isInsideRoot && !isInsideContent) rootContext.onOpenChange(false)`. Focus moving onto a control *inside* the panel is explicitly allowed |

### 1.2 The four alternatives rejected, and why

1. **Make the retry tabbable / trap `Tab` in the panel.** Rejected on measurement: it
   is *already* tabbable (`tabIndex 0`, not disabled, the only tabbable element in the
   panel). The problem is not the button, it is that `Tab` means "leave the combobox"
   and the panel is portalled to `document.body`. Intercepting `Tab` would fix 2.1.1
   by breaking the pattern 2.4.3 depends on.
2. **Make the error row an `aria-activedescendant` target.** This was the first choice
   and it is **not available**: Reka binds that attribute on the combobox input from
   its own `highlightedElement`, so a second writer either fights the binding or has to
   register the retry into the listbox **collection** as an option — which makes an
   error row `role="option"`, selectable, and part of the filter set. That is an
   anatomy and AT re-baseline for a control that is not a choice.
3. **RESIDUAL-05's own recommendation, option (b): stop unmounting the control, keep it
   rendered and `aria-disabled` while loading.** Rejected, and the rejection is a
   correction worth stating plainly: **(b) does not fix reachability.** It stops focus
   being *dropped* when the control unmounts — which `withRetryFocusReturn` already
   does — but `Tab` still leaves the panel and the arrows still do nothing, so a
   keyboard user still cannot get to the control in the first place. RESIDUAL-05 wrote
   *"smallest change that fixes reachability"*; on the measurement in §1.3 it fixes
   none of it. It would also change what eight published controls render in the
   `loading` state, for no reachability gain.
4. **Move retry onto the control's own keyboard map (`Enter` in the error state
   re-requests).** Rejected: `Enter` is the combobox's accept key and submits a form
   when nothing is highlighted, so silently repurposing it in one state makes `Enter`
   mean two things and is undiscoverable. It also never gives the control focus, so the
   button stays unreachable for an AT working from its own reading cursor.

A fifth was considered and rejected on review rather than measurement: **a
document-level keydown listener owned by the row**, which would have needed no host
edits. Ownership cannot be determined reliably when two in-canvas controls are on one
page, and a document listener is a second mechanism by definition — which the brief
forbids and which `optionsStateFocus.ts` exists to avoid.

### 1.3 The measured keyboard route — `document.activeElement` at every step

Driven in real chromium with the app-local runner, on a throwaway probe story
(`packages/core/stories/forms/Residual06Probe.stories.ts`, deleted in §6) that reads
the live DOM after each real key. Five controls, three portalled and two in-canvas, all
on one page. `panel` is the popup's own `data-state`, or `in-canvas` when the row is
not inside a portalled content part.

**`DzCombobox` — portalled Reka combobox.** Shape first: `portalled=true`,
`retryTabIndex=0`, `focusablesOutsideRow=2` (`INPUT[input]{combobox}`, `BUTTON[trigger]`).

| Step | `document.activeElement` | on retry? | row | panel | req / retries |
|---|---|---|---|---|---|
| fresh error state | `INPUT[input]{combobox}` | false | `error` | **open** | 1 / 0 |
| **`{ArrowDown}`** | **`BUTTON[options-retry]<Try again>`** | **true** | `error` | **open** | 1 / 0 |
| `{ArrowUp}` | `INPUT[input]{combobox}` | false | `error` | **open** | 1 / 0 |
| `{ArrowDown}` again | **`BUTTON[options-retry]<Try again>`** | **true** | `error` | **open** | 1 / 0 |
| **`{Enter}`** | `INPUT[input]{combobox}` | false | `loading` | **open** | **2 / 1** |
| the answer arrives | `INPUT[input]{combobox}` | false | gone | **open** | 2 / 1 |

**`DzMultiSelect` — identical**: `ArrowDown` → `BUTTON[options-retry]`, panel `open`;
`Enter` → `req 2`, `retries 1`, focus back on `INPUT[input]`, panel `open`.

**`DzSelect` — its own copy of the row, inside a modal focus-trapped `SelectContent`.**
Shape: `portalled=true`, `focusablesOutsideRow=1` (`BUTTON[trigger]{combobox}`), and
note where focus actually is when the panel is open with no items — **on the trigger**,
not inside the portal.

| Step | `document.activeElement` | on retry? | row | panel | req / retries |
|---|---|---|---|---|---|
| fresh error state | `BUTTON[trigger]{combobox}` | false | `error` | **open** | 2 / 0 |
| **`{ArrowDown}`** | **`BUTTON[options-retry]<Try again>`** | **true** | `error` | **open** | 2 / 0 |
| `{ArrowUp}` | `BUTTON[trigger]{combobox}` | false | `error` | **open** | 2 / 0 |
| **`{Enter}`** | `BUTTON[trigger]{combobox}` | false | `loading` | **open** | **3 / 1** |
| `[Space]`, on a later fresh error | `BUTTON[trigger]{combobox}` | false | `loading` | **open** | **4 / 2** |
| **`{Tab}`**, measured last | **`BUTTON[root]<After>`** — the host page's next button | false | `error` | **open** | — |

That last row is the finding that makes `DzSelect` part of this defect rather than the
control group RESIDUAL-04 used: **its modal focus trap does not contain the tab
order.** `Tab` from the open panel lands on the host page and the panel stays open, so
`Try again` was no more reachable here than anywhere else. RESIDUAL-05 had already
shown `DzSelect` is a **near-copy** of the row rather than a host of it; this shows the
copy carries the same conformance gap.

One probe artefact, recorded because it briefly looked like a component defect: an
earlier run reported `Space` not activating the control inside `SelectContent`. That was
`userEvent.keyboard('{Space}')`, which is not a key descriptor user-event understands;
`[Space]` activates it and advances `retries`. **Re-measured rather than reported** —
the opposite mistake to RESIDUAL-04's inference, in the same place.

**The two in-canvas hosts, `DzListbox` and `DzTransfer`** — measured because the
contract has to hold on them too, and it holds for a different reason:

```
lb shape: portalled=false  retryTabIndex=0  focusablesOutsideRow=1 → DIV[viewport]{listbox}
lb   tab walk → … → BUTTON[options-retry]<Try again>        (reached, row still error)
lb   after Enter → BUTTON[trigger]…   row=loading   retries=1
tr shape: portalled=false  retryTabIndex=0  focusablesOutsideRow=0
tr   tab 0 → DIV[item]{option}    tab 1 → BUTTON[options-retry]<Try again>
tr   after Enter → DIV[item]{option}   row=loading   retries=1
```

**`Tab` reaches the control on both, and always did** — the row is in the control's own
tab order and there is no layer to dismiss. So `D-RES05-1` is precisely a
**portalled-panel** defect, which is a narrowing of the row as raised, and the honest
statement of what was broken.

### 1.4 A second defect the route exposed, fixed in the same place

The probe caught this, and it is a real user-visible loss rather than a test artefact:

```
cb 6 options back   active=BODY   row=NULL   content=1        (before the fix below)
```

RESIDUAL-05 parked focus on the **row** after activation, and argued for it well: the
row is stable while the state is `loading`. It stops being stable the moment the retry
**succeeds** — the row unmounts, and focus falls to `document.body` at the exact instant
the user gets what they asked for, so they cannot reach the options they just loaded
without restarting from the top of the document.

The fix is one preference order, in one place (`retryFocusDestination`): **where the
keyboard route took focus from, and the row only when nothing came before it.** That is
the control's own input or trigger — the APG resting place for a combobox, still
mounted when the options arrive. Measured after: `active=INPUT[part=input]` at every
step including `options back`, on all three portalled hosts.

`document.body` is explicitly refused as a destination (`isReturnTarget`). It really
turns up: `Tab` wrapping past the end of the document arrives at the next element with
`relatedTarget` set to the body, which is how a keyboard user reaches the retry control
on `DzListbox`, and focusing the body is indistinguishable from losing focus.

### 1.5 Implemented files, and the API effect

| File | Change | API effect |
|---|---|---|
| `packages/core/src/components/forms/optionsStateFocus.ts` | **extended, not replaced** — the single definition RESIDUAL-05 established. New: `RetryKeyboardRoute` + `createRetryKeyboardRoute`, `retryRouteOwnerKeydown`, `retryRouteRowKeydown`, `retryRouteRowFocusIn`, `retryFocusDestination`, `isReturnTarget`, and the `provide`/`inject` pair `provideRetryKeyboardRoute` / `useRetryKeyboardRoute`. `withRetryFocusReturn` is **unchanged** | **internal module in `@dzup-ui/core`.** Not exported from the family barrel, not in any `index.ts`, so no public surface |
| `packages/core/src/components/forms/DzOptionsState.vue` | builds the route from the refs it already had, registers itself with its host through the component tree, binds `focusin` and `keydown` on the row, and takes its focus destination from `retryFocusDestination` instead of the row | **behavioural fix, published package.** No prop, emit, slot, anatomy part, state value, message key or variant changed |
| `DzCascader.vue` · `DzCombobox.vue` · `DzListbox.vue` · `DzMention.vue` · `DzMultiSelect.vue` · `DzTransfer.vue` · `DzTreeSelect.vue` | **three lines each, identical in shape**: one import, one `provideRetryKeyboardRoute()` call, one `@keydown` on the element every one of them already has — its `root` part. The row self-registers, so no template ref and no `InstanceType` typing | same. Nothing else in these seven files moved |
| `packages/core/src/components/forms/DzSelect.vue` | the near-copy, wired to the **same module**: route, `provideRetryKeyboardRoute(route)`, `retryFocusDestination`, row `keydown` + `focusin`, and the owner handler on **three** elements (§1.8). Its `@keydown.stop` on the search box became `handleSearchKeydown`, which still stops propagation | same |
| `packages/core/stories/_shared/asyncOptionsHost.ts` | the fifth phase of `walkAsyncOptionsStates` now **drives the route** instead of placing focus itself, and gains the post-success clause. Asserted on the **contract** | none — stories are not published. **No test added or removed:** the phase is a `step` inside one `play()`, so all nine story files keep their exact test counts |
| `.changeset/the-async-options-retry-control-is-reachable-by-keyboard.md` | **new.** `@dzup-ui/core: patch` | the changeset itself |

**A changeset IS owed and was added.** `@dzup-ui/core` is in
`packages/tooling/scripts/release-policy.json`'s `published` list. `patch`, because no
declared surface changed and the keys the route consumes were measured to do nothing in
the state where it consumes them; the changeset itself records that a reader who counts
a new keyboard affordance as an addition would say `minor`, and that the bump is the
release owner's to raise.

**Why `provide`/`inject` and not a template ref per host.** The row and the focus owner
are in different component subtrees, and whenever the panel is portalled they are in
different DOM trees, so the two halves cannot be joined by a DOM walk. `provide` /
`inject` follows the component tree and survives a `Teleport`. The consequence is that
each host's diff is **three lines with no types in it**, which is what makes seven
identical edits reviewable.

### 1.6 What the walk asserts now — the contract, and the route it picks

The phase decides which route applies from **one measurable fact**, not from the host's
name: whether the row is inside the control's own `root` part or portalled out of it
(`current.closest('[data-part="root"]')`).

| Clause | Portalled row | In-canvas row |
|---|---|---|
| 1. **Reachable** (2.1.1) | `{ArrowDown}` from the control's focus owner lands on the retry; `{ArrowUp}` goes back; `{ArrowDown}` returns — driven, two-way | `Tab` is **driven**, up to 12 presses, and must land on the retry. "It is a tabbable button" is the inference that hid this for a week |
| 2. **Activatable** | `{Enter}` on the element the keyboard just reached advances `retries` **and** `requests` | same |
| 3. **The panel survives** | the row is still in the document, and focus is on a connected, non-body element carrying a `data-part` | same |
| 4. **And it survives success** | after the answer renders, focus is still a named non-body element | same, **except** when the keyboard arrived from the body (§1.7) |

The owner is also required to be a **named part**, so a control that had quietly lost
focus fails loudly instead of proving the route on the wrong element — which is exactly
the trap an early probe iteration fell into when a previous control's trigger was still
focused.

### 1.7 The one exception, measured rather than declared

Clause 4 is skipped when the row is in the canvas **and** the keyboard arrived at the
retry control from `document.body` — which is what `Tab` wrapping past the end of the
document does. Measured on `DzListbox` and `DzTransfer`, whose entire tab order in the
error state is the row itself (`focusablesOutsideRow` is 1 and 0).

The clause is *"focus goes back where the keyboard came from"*, and it needs the
keyboard to have come from somewhere. The row cannot invent a destination: the right one
is the list the **host** has just rendered in its place, and moving focus into a freshly
rendered list is a host decision about focus order (2.4.3), not a Level A
keyboard-operability failure — both controls remain fully operable, because nothing is
portalled and nothing is trapped. **Raised as `D-RES06-1` (§5), not guessed at.**

### 1.8 Seeded breaks — two, on component source, each restored byte-identically

Final bytes under proof:

```
1699efadb257c666ea4984afb0f1281e45f8cc9c0b9e680eccda60194c631828  optionsStateFocus.ts
93caea5e549810abae35c6478b85911f10f76902c9a4e17ec73d0570b6abe951  DzOptionsState.vue
a7fe9b604ef0fd67b86fb0b6b34e60597fb97529a4d41618615b374b284d5391  DzSelect.vue
```

Both seeds were run **against these exact bytes** (RESIDUAL-04 §3's lesson: a seed
proved against earlier bytes proves earlier bytes).

| # | Seed, on component source | Result | Failing line | Restore |
|---|---|---|---|---|
| 1 | `retry.focus()` deleted from `retryRouteOwnerKeydown` — the reachability half, and nothing else (`optionsStateFocus.ts`) | **5 failed / 100 passed, `EXIT=1`** — `DzCascader`, `DzCombobox`, `DzMultiSelect`, `DzSelect`, `DzTreeSelect`: **every portalled host and only those** | `asyncOptionsHost.ts:233` — `expect(doc.activeElement).toBe(retry)` after `{ArrowDown}` | `sha256sum -c` all three **OK**, `EXIT=0` |
| 2 | `@keydown` deleted from **`DzSelect`'s own root**, nothing else (`DzSelect.vue`) | **1 failed / 104 passed, `EXIT=1`** — **`DzSelect` alone** | same line | `sha256sum -c` all three **OK**, `EXIT=0` |

Two results are worth reading rather than skipping:

- **Seed 1's three passes are the contract refusing to over-claim.** `DzListbox`,
  `DzTransfer` and `DzMention` keep passing with the arrow route destroyed, because
  their rows are in the canvas and `Tab` is their route. A walk that failed them would
  be asserting an implementation, not a clause.
- **Seed 2 is the answer to "is `DzSelect`'s near-copy covered?"** Yes, and
  independently: breaking only `DzSelect` fails only `DzSelect`. The shared row's own
  wiring cannot carry it, because `DzSelect` is not on the shared row — the same
  property RESIDUAL-05 proved from the other direction.

An earlier attempt at seed 2 deleted the `@keydown` from `SelectContent` instead and
**nothing failed**. That is recorded rather than buried, because it is a true fact about
the fix: while the row is on screen `DzSelect` has no items for Reka to focus, so the
open panel leaves focus on the trigger and the root binding is the one every driven
route uses. The content binding covers a route no test drives — the list showing, focus
on an item, then a host-driven reload replacing the list with the row — and the comment
in `DzSelect.vue` now says exactly that instead of implying all three are proved.

### 1.9 Focused validation for item 1

| # | Command | Result | Exit (from a log file) |
|---|---|---|---|
| 1 | probe runs 1–2 — a `getByRole` ambiguity, then the first route measurement | §1.3 | `EXIT=1` (the probe's own throw) |
| 2 | probe runs 3–5 — three hosts, the full route, `Enter` and `Space` | §1.3 | `EXIT=1` (same) |
| 3 | probe runs 6–8 — the two in-canvas hosts, shape + driven tab walk | §1.3 | `EXIT=1` (same) |
| 4 | the **nine** seam story files, first run of the new phase | **2 failed / 95 passed** — `DzListbox`, `DzTransfer`, both at clause 4: the §1.4 / §1.7 finding | **`EXIT=1`** |
| 5 | same, after the `focusin` capture and `isReturnTarget`'s refusal of the body | **1 failed / 104 passed** — `DzListbox` only | **`EXIT=1`** |
| 6 | same, after clause 4 was made conditional on a measured origin | **9 files · 105 tests · 105 passed** | **`EXIT=0`** |
| 7 | the same nine files re-run on the **final bytes** | **9 files · 105 tests · 105 passed** | **`EXIT=0`** |
| 8 | seeded break 1 | **5 failed / 100 passed** | **`EXIT=1`** |
| 9 | seeded break 2 | **1 failed / 104 passed** | **`EXIT=1`** |
| 10 | restores | `sha256sum -c` on all three **OK**, twice | **`EXIT=0`** |
| 11 | `node …/vue-tsc --noEmit -p packages/core/tsconfig.json` | no output | **`EXIT=0`** |
| 12 | `node …/eslint --max-warnings 0` on the eleven changed files | clean. `--fix` **not** used — one `jsdoc/no-multi-asterisks` on a line beginning with an emphasised word was fixed by hand, the same rule RESIDUAL-05 hit | **`EXIT=0`** |

Runs 4 and 5 are worth keeping in the record: **the new assertion found a second real
defect on its first run**, and the packet reported and fixed it rather than relaxing the
clause to make it green.

---

## 2. Item 2 (`D-RES05-2`) — three `axe` cells earned back, and the violation they found

RESIDUAL-05 made citation attribution structural and three cells became honestly
`unrun`: the `axe` input for **`DzCarousel`** (Tier B), **`DzDatePicker`** (Tier C) and
**`DzTree`** (Tier C), each previously "cited" by a sentence in a docblock. All three
now have **real imports and real renders**, so `unrun` returns to **400** because the
evidence exists, not because a number was adjusted.

### 2.1 What each one got, following the existing pattern exactly

The shape was copied from the specs that already work (`render(Component, { props })`
or `render({ template, components })`, then `await axe(container)` and
`expect(results).toHaveNoViolations()`), and each render was put in **its own family's
file** — the same file whose prose had been granting the citation.

| Component | Tier | File | Renders added | Chosen shape, and why |
|---|---|---|---|---|
| `DzCarousel` | B | `packages/core/tests/a11y/media.a11y.spec.ts` | **3** | the whole compound (`DzCarousel` + two `DzCarouselSlide` + `Previous` + `Next` + `Dots`), horizontal and vertical, plus **a carousel with no slides**. The root is a `role="region"` wrapper; every control axe has an opinion about lives in a child, so rendering the root alone would have exercised nothing |
| `DzDatePicker` | C | `packages/core/tests/a11y/forms.a11y.spec.ts` | **3** | the closed trigger: with `aria-label`, with `invalid` + `required`, and inside a labelled `DzFormField`. **Scope stated in the file**: the calendar panel is a portalled popover, so it is not inside `container` and an axe run over that container could not see it either way — the grid's evidence belongs with `DzCalendar` |
| `DzTree` | C | `packages/core/tests/a11y/data.a11y.spec.ts` | **2** | a **nested** tree with expanded branches, then the same tree `selectable` + `checkable`. The APG `tree` role puts `aria-expanded`, `aria-level` and the roving `tabindex` on the *item*, so a single flat node would exercise none of the rules that can fail |

`DzDatePicker` was the sharpest of the three: `forms.a11y.spec.ts`'s header opens
*"Tests DzDatePicker…"* and the file never imported it, so a Tier C component's entire
accessibility evidence was one stale sentence. Each new block carries a comment saying
so, and naming `D-RES05-2`, so the next reader knows why the renders exist.

### 2.2 Proof the renders are not hollow — axe rules that actually ran

"Give them a real render" can be satisfied dishonestly by rendering something axe has
nothing to say about, so this was measured with a throwaway spec
(`packages/core/tests/a11y/residual06-depth.spec.ts`, deleted in §6) that counted the
DOM and the axe rules each render actually evaluated:

| Render | elements | roles present | axe rules **passed** | incomplete | violations |
|---|---:|---|---:|---:|---:|
| `DzCarousel` (2 slides) | **16** | `region, group, group, tablist, tab, tab` | **14** | 1 | 0 |
| `DzTree` (nested, checkable) | **18** | `tree, treeitem, checkbox, group, treeitem, checkbox, treeitem, checkbox` | **17** | 1 | 0 |
| `DzDatePicker` (closed) | **17** | `group, spinbutton, spinbutton, spinbutton` | **16** | 1 | 0 |

The rule lists are the point, not the totals. `DzTree` passes exactly the rules a tree
can fail — `aria-required-children`, `aria-required-parent`, `aria-treeitem-name`,
`tabindex`, `nested-interactive`, `aria-toggle-field-name`. `DzDatePicker` passes
`aria-input-field-name`, `button-name` and `color-contrast`. `DzCarousel` passes
`button-name`, `nested-interactive` and `landmark-unique`. These are renders with
something in them.

### 2.3 The accessibility findings — one fixed, one raised, one explained

**All three renders returned zero `violations`. They did not return zero `incomplete`,
and that is where the payoff was.** `incomplete` is axe saying *"this may be broken and
I cannot decide from here"*, which `toHaveNoViolations()` does not see — so each one was
opened rather than skipped.

| # | Render | Rule | What axe said | Verdict |
|---|---|---|---|---|
| 1 | `DzCarousel` | `aria-required-children` | on `DzCarouselDots`' `role="tablist"`: *"Expecting ARIA child role to be added: tab"* | **a real defect, fixed** |
| 2 | `DzDatePicker` | `aria-valid-attr-value` | on the trigger: *"Unable to determine if aria-controls referenced ID exists on the page while using aria-haspopup: `aria-controls=""`"* | **a real defect, upstream — raised as `D-RES06-2`** |
| 3 | `DzTree` | `color-contrast` | *"Axe encountered an error; test the page for this type of problem manually"* | **not a finding** — jsdom computes no layout, so axe cannot sample pixels. Structural, not this component's |

**Finding 1, fixed.** ARIA requires a `tablist` to own at least one `tab`, and this one
owns a `tab` per registered slide — so a carousel whose slides come from an **empty
collection** published a named, childless `tablist`. Re-measured deliberately in that
state, after a settle, so it could not be dismissed as a mount-order flicker:

```
Carousel-0   elements=10   roles=region,tablist   passes=14  violations=0
             incomplete: aria-required-children — "Expecting ARIA child role to be added: tab"
             tablist present=true   tabs=0
```

Fixed in `DzCarouselDots.vue` with one `v-if`: the list renders nothing until it has a
tab to own. **`toHaveNoViolations()` cannot hold that fix in place** — axe reports the
empty `tablist` as `incomplete`, not a violation — so the new spec asserts the structure
directly (`[role="tablist"]` is `null`, zero `[role="tab"]`) beside the axe run. A test
that only asserted the axe result would have passed before and after, which is worth
saying out loud: this is a case where axe found the problem and axe cannot guard it.

That fix has one consequence, and it broke a test — reported rather than quietly
absorbed. Slides register themselves in their own `mounted` hooks, so the dot count is
unknown during `DzCarouselDots`' first render; `DzCarousel.spec.ts` › `renders dot
navigation` asserted the `tablist` **synchronously** and went red. It was asserting a
transient over-render — the empty list every carousel used to emit for one tick — so it
is now `await nextTick()` and **stronger than it was**: the list must exist *and* own
its three tabs. One microtask, before first paint, so nothing a user can see changed.

**Finding 2, raised not fixed.** `DzDatePicker`'s popover trigger emits
`aria-controls=""` — an empty IDREF, which is invalid — while closed, alongside
`aria-haspopup="dialog"`. It is **not ours to patch**: the attribute is bound by Reka,
`PopoverTrigger.vue:39` `:aria-controls="rootContext.contentId"`, and `contentId` is
empty until the content mounts. The same line exists in `ComboboxTrigger.vue:39` and
`ComboboxInput.vue:135`, and the RESIDUAL-06 item-1 probe caught it independently on
`DzCombobox`'s toggle — so this is a **seam-wide, upstream** issue, not a
`DzDatePicker` one. Overriding it here would mean binding `aria-controls` against
Reka's own binding, which is the same conflict class that ruled out
`aria-activedescendant` in §1.2. Raised as **`D-RES06-2`** (§5).

### 2.4 The capability-matrix movement — old → new, exactly

| Total | Handed in (RESIDUAL-05) | **This batch** | Δ |
|---|---|---|---|
| `pass` | 585 (A 106 · B 325 · C 147 · D 7) | **585** (106 · 325 · 147 · 7) | **0 — `pass` did not move** |
| `fail` | 0 | **0** | 0 |
| `present` | 605 (175 · **303** · **115** · 12) | **608** (175 · **304** · **117** · 12) | **+3** |
| `stale` | 22 (0 · 0 · 21 · 1) | **22** (0 · 0 · 21 · 1) | 0 |
| `unrun` | **403** (65 · **248** · **89** · 1) | **400** (65 · **247** · **87** · 1) | **−3** |
| `excepted` | 47 (4 · 41 · 2 · 0) | **47** (4 · 41 · 2 · 0) | 0 |
| rows / cells | 144 / 1662 | 144 / 1662 | 0 |

**`present` 605 → 608 and `unrun` 403 → 400**, which is RESIDUAL-05's correction
reversed **by adding evidence**, not by restoring a citation. The three cells, read back
out of the regenerated artifact:

```
DzCarousel     B  {"kind":"axe","state":"present","artifacts":["packages/core/tests/a11y/media.a11y.spec.ts"]}
DzDatePicker   C  {"kind":"axe","state":"present","artifacts":["packages/core/tests/a11y/forms.a11y.spec.ts"]}
DzTree         C  {"kind":"axe","state":"present","artifacts":["packages/core/tests/a11y/data.a11y.spec.ts"]}
```

Each artifact is now a file that **imports and renders** the component, which is what
RESIDUAL-05's `filesLoading` predicate requires and what prose cannot fake. `pass` did
not move, because the `axe` kind produces `present` or `unrun` and never `pass`.

**No ceiling was raised and no allowlist widened.** `unrunCells` is report-only and its
recorded baseline is **400**, untouched — the gate now prints the baseline with no drift
instead of `+3`:

```
unrun 400 (baseline 400) · A 65 · B 247 · C 87 · D 1
✓ capability-matrix: fresh, and no Tier D cell is unexplained.          EXIT=0
```

That is `D-RES05-2` closed by its own recommended option (c), and it is the option that
improves the product rather than the bookkeeping: **option (a), re-baselining 400 → 403,
was deliberately not taken and is now unnecessary.**

**Nothing was left `unrun` for want of a render.** All three could be given a
meaningful one. The scope limit that *is* recorded, in the spec itself rather than only
here, is `DzDatePicker`'s: the axe run covers the closed trigger, because the calendar
panel is portalled out of the container being scanned.

### 2.5 Focused validation for item 2

| # | Command | Result | Exit (from a log file) |
|---|---|---|---|
| 1 | `node …/vitest run` on the three a11y specs, first run | **3 files · 40 tests · 40 passed** (+7 new) | **`EXIT=0`** |
| 2 | the depth probe — DOM size and axe rules per render | §2.2; three `incomplete` rules identified by node and message | `EXIT=1` (the probe's own throw) |
| 3 | the depth probe on a **0-slide** carousel | `tablist present=true · tabs=0`, `aria-required-children` incomplete — the finding, isolated | `EXIT=1` (same) |
| 4 | `node …/vitest run …/tests/a11y/media.a11y.spec.ts …/src/components/media/` — **after** the `DzCarouselDots` fix, first run | **1 failed / 205 passed** — `DzCarousel.spec.ts` › `renders dot navigation`, asserting the transient (§2.3) | **`EXIT=1`** |
| 5 | same, after that assertion was awaited and strengthened | **22 files · 206 tests · 206 passed** | **`EXIT=0`** |
| 6 | `yarn generate:capability-matrix` | `144 components, 1662 evidence cells`; totals in §2.4 | **`EXIT=0`** |
| 7 | `yarn validate:capability-matrix` | `✓ fresh` · `unrun 400 (baseline 400)` — **no drift printed** | **`EXIT=0`** |
| 8 | `yarn csp:inline-style-inventory` | **9 line numbers moved, 0 sites added, 0 removed**, 133 → 133, and every disposition count identical (78 / 3 / 0 / 19 / 33) | **`EXIT=0`** |

Run 8 is the regeneration the sanctioned order does not name — RESIDUAL-05 §3.3's
warning, heeded rather than rediscovered. Item 1 added ten lines above an inline style
in eight published components, and only the full unit suite would have caught it.

---

## 3. Aggregate qualification — pre-existing vs new

Every exit code below was read out of a **file**, never from a harness completion
notice. RESIDUAL-03 §6.2's reason keeps earning its restatement, and it earned it again
here: a wrapper whose last statement is `echo` reports the wrapper.

### 3.1 The lanes

| Lane | Handed baseline | **This batch** | Verdict |
|---|---|---|---|
| `yarn typecheck` | 0 | **`EXIT=0`**, no output | held |
| `yarn typecheck:all` | 0 | **`EXIT=0`**, no output | held |
| `yarn lint` | 0 | **`EXIT=0`**, no output under `--max-warnings 0`; `--fix` **not** used | held |
| `yarn build` | 0 | **`EXIT=0`**; the `git status --porcelain` listing is **identical** before and after, `diff` exit 0 | held |
| unit suite | 574 files · 11,174 passed · 3 skipped · 1 todo · 0 failed | **574 files · 11,182 passed · 3 skipped · 1 todo · 0 failed · 304.63 s · `EXIT=0`** | **+8 tests, no new file — exactly this batch's eight new a11y cases** |
| browser lane | 170 files · 1,462 tests · 1,462 passed · 0 failed | **170 files · 1,462 tests · 1,462 passed · 0 failed · 96.86 s · `EXIT=0`**, `grep -c FAIL` → **0** | **identical — no regression** |
| `yarn validate:all` | 61 links, exit 1 at link 51 only | **61 links (measured), exit 1, exactly one `✗` in 470 lines, at link 51** | **same link, same clause, same text — no new failure** |

**The unit suite needed two runs, and both are reported — but the first one was not a
flake.** Run 1: **574 files, 1 failed, 11,181 passed, `EXIT=1`**, and the failure was
real:

```
FAIL  packages/tooling/src/docs/evidence.spec.ts > the real catalogue
      > agrees with the capability join in component-meta.json
+   "DzCarousel: component-meta.json says unrun = [at-manual, axe, …],
     capability-matrix.json says [at-manual, …]. One artifact is stale."
+   "DzDatePicker: …"   +   "DzTree: …"
```

`component-meta.json` carries a **join** of the capability matrix, so moving three cells
out of `unrun` made it stale — a gate doing exactly its job, on exactly the three
components item 2 touched. Fixed by **regenerating the artifact**, not by touching the
assertion (§3.3). Run 2 of the whole suite: **`EXIT=0`, 0 failed.** Both runs are quoted
rather than only the green one, and the documented `requestAnimationFrame`-after-teardown
flake from `apps/landing` did **not** appear in either.

**The browser-lane count is unchanged for a structural reason, not by luck.** The
rewritten C9.4 phase is a `step` inside an existing `play()`, and Storybook's vitest
integration counts one test per **story** — so the lane gains a driven keyboard route on
**eight** components and stays at 1,462. Recorded so nobody reads 1,462 → 1,462 as
"nothing happened", which is the same note RESIDUAL-05 had to leave.

### 3.2 `validate:all` — the failing link, and what it is not

```
node -e "…scripts['validate:all'].split('&&').length"   →  LINKS=61      (measured, never quoted)
yarn validate:all > log 2>&1 ; echo "VALIDATE_ALL_EXIT=$?" >> log
  470 lines · 39 lines carrying ✓ · exactly one ✗        →  VALIDATE_ALL_EXIT=1

✗ [single-version] 2 versions of the icon library resolve (0.475.0, 0.477.0); exactly 1 may.
      lucide-vue-next@0.475.0  declared as "^0.475.0"              ← no declarant at all
      lucide-vue-next@0.477.0  declared as "^0.477.0" by @dzup-ui/core, @dzup-ui/landing, @dzup-ui/sandbox
```

**Failing link: 51** (`yarn validate:peers` → `validate:icon-duplicates`). Identical
link, clause and text to RESIDUAL-01 §4.5, RESIDUAL-02 §3.3, RESIDUAL-03, RESIDUAL-04
run 25 and RESIDUAL-05 §3.2. **PRE-EXISTING**: every manifest reads `^0.477.0` and the
`0.475.0` row is an orphan lockfile resolution, which clears on the owner's
`yarn install` — an act withheld from every agent. `yarn.lock` was not touched.

**The chain reached link 51, so links 1–50 are green against this batch's files in fact
rather than by argument** — including the four this batch's inputs feed:

```
✓ anatomy-parts: 622 data-part emissions across 142 components … 0/0 undeclared      (link 14)
✓ capability-matrix: fresh, and no Tier D cell is unexplained.                       (link 24)
  unrun 400 (baseline 400) · A 65 · B 247 · C 87 · D 1     ← no drift printed
✓ component-meta: fresh …                                                            (link 35)
✓ docs pages fresh …                                                                 (link 38)
```

No gate was driven red by this batch's own evidence, and that is not an accident: the
`data-part` literals this batch needed to discuss live in **`.ts` files and in report
prose**, never in a `.vue` comment. `validate:anatomy-parts` collects `*.vue` only
(`anatomy-parts.ts:170`), which is why RESIDUAL-04's trap did not fire twice.

**Links 52–61 remain unreached inside the aggregate** — the programme's standing caveat,
since `&&` halts at 51. Each was run individually against this tree:

| link | gate | exit |
|---|---|---:|
| 52 | `validate:licenses` | **0** |
| 53 | `validate:tree-shake` | **0** |
| 54 | `validate:evidence-binding` | **0** |
| 55 | `validate:deprecations` | **0** |
| 56 | `validate:adr-status` | **0** |
| 57 | `validate:at-runs` | **0** |
| 58 | `validate:docs-freshness` | **0** |
| 59 | `validate:runtime-floor` | **0** |
| 60 | `yarn build` | **0** |
| 61 | `validate:browser-lane` | **0** |

### 3.3 Regeneration — the sanctioned order, plus the two artifacts outside it

The sanctioned order ran **end to end**, and the `git status --porcelain` listing is
identical before and after it (`diff` exit 0 — no path appeared or disappeared):

| # | Command | Exit |
|---|---|---:|
| 1 | `yarn generate:ownership` | **0** |
| 2 | `yarn generate:quality-matrix` | **0** |
| 3 | `yarn generate:capability-matrix` | **0** |
| 4 | `yarn generate:component-meta` | **0** |
| 5 | `yarn generate:llms` | **0** |
| 6 | `yarn generate:docs-pages` | **0** |

**`component-meta.json` had to move, and a gate said so before the chain did.** It
carries a join of the capability matrix, and `evidence.spec.ts` failed on the three
components whose `axe` cells moved (§3.1). This is worth its own note because
RESIDUAL-05's movement was in the same direction and did **not** break it — that batch
verified `component-meta.json` was byte-identical and concluded it was not an input. It
is an input; RESIDUAL-05's regeneration simply happened to be a no-op because the three
cells were already recorded as `unrun` there too. **The join is real and it is caught by
the unit suite, not by `validate:all`.**

**`packages/core/security/inline-style-inventory.json` is the second, and the sanctioned
order still does not name it** (RESIDUAL-05 §3.3, heeded rather than rediscovered). Item
1 added ten lines above an inline `style=` in **eight** published components, so:

```
yarn csp:inline-style-inventory   → EXIT=0
  9 line numbers MOVED · 0 sites added · 0 removed · 133 → 133
  DzCascader 544→554 · DzCombobox 376→386 · DzListbox 398→408 · DzMention 751→761 and 830→841
  DzMultiSelect 270→280 · DzSelect 387→441 · DzTransfer 227→242 · DzTreeSelect 650→660
  dispositions unchanged: recipe-movable 78 · layout-static 3 · custom-property 0
                        · required-dynamic 19 · unclassified-binding 33
```

**`packages/core/docs/i18n.md` was NOT regenerated by this batch** and shows as ` M`
only because it was already dirty at session start — its mtime predates this session and
belongs to a programme this batch never opened. Stated because it appears in the diff.

---

## 4. Ratchet movements (old → new)

Every figure re-read from the artifact that owns it, not quoted from a prior report.
**No ceiling raised, no allowlist widened, and no `*ceilings*.json` file opened for
writing** — all eleven still carry pre-session mtimes, the newest `09-24`.

| Ratchet / counted quantity | Old | **New** | Source of truth |
|---|---|---|---|
| `maxUnclassified` | 29 | **29** | `packages/tooling/src/ownership/unclassified-ceiling.json` |
| `maxWithoutAnatomy` | 41 | **41** | same file |
| `maxProposedCitedFromCode` | 3 | **3** | `packages/tooling/scripts/adr-registry.json` |
| capability `pass` | 585 | **585** | `packages/core/docs/capability-matrix.json` `.totals` |
| capability `fail` | 0 | **0** | same |
| capability `present` | 605 | **608** | same — **+3, and every one of the three is a render that exists** |
| capability `stale` | 22 | **22** | same |
| capability `unrun` | **403** | **400** | same — **back to the recorded baseline, by evidence** |
| capability `excepted` | 47 | **47** | same |
| capability rows / cells | 144 / 1662 | **144 / 1662** | same |
| AT executed | 0 of 534 | **0 of 534** | `validate:at-runs` (link 57) and `generate:docs-pages` |
| locales ≥ 95 % | 1 | **1** (`minSupportedLocales: 1`, `minCompletenessPercent: 95`) | `i18n-completeness-ceilings.json` |
| inline-style dispositions | 78 / 3 / 0 / 19 / 33 | **78 / 3 / 0 / 19 / 33** | `inline-style-inventory.json` |
| `validate:all` links | 61 | **61** (measured) | `package.json` |
| `validate:all` failing link | 51 | **51** (same clause, same text) | §3.2 |
| unit suite | 574 files / 11,174 | **574 / 11,182** | +8 a11y cases, no new file |
| browser lane | 170 files / 1,462 tests | **170 / 1,462** | unchanged |
| Pending changesets | 45 | **47** (+2, both `@dzup-ui/core: patch`) | `ls .changeset/` excluding `README.md` and `config.json` — **measured** |
| Dirty paths | **311** | **325** | §6 — +14, all fourteen attributed |

**Two numbers moved and both moved toward truth.** `present` +3 and `unrun` −3 are the
same three cells, and they moved because three components now have accessibility
evidence that exists. **`pass` did not move, no ceiling was adjusted, and the `unrunCells`
baseline of 400 was left exactly where RESIDUAL-05's derivation put it** — the
measurement came back to meet the baseline rather than the baseline being moved to meet
the measurement. That is `D-RES05-2` option (c) rather than option (a), and it is the
difference between closing a gap and renaming it.

---

## 5. Owner decisions — two closed, two raised

Recorded in the register's **§13** addendum (appended; §12's rows keep their original
text and gain dated status rows).

### Closed

- **`D-RES05-1`** 🟠 → 🟢 — **CLOSED.** Reachable, activatable, panel survives, proved
  by two seeded breaks on component source. **And its own recommended option was
  wrong**: §12.3 recommended (b) *"stop unmounting it — the smallest change that fixes
  reachability"*, and (b) fixes none of the reachability (§1.2). That correction is the
  most useful thing in this row, because (b) was also the top of RESIDUAL-05's ranked
  next packet and would have been a day's work in the wrong place.
- **`D-RES05-2`** 🟠 → 🟢 — **CLOSED by option (c)**, the recommended one. `unrun`
  returns to 400 because three components have real axe renders. **Option (a),
  re-baselining to 403, is now unnecessary and was never done.**

### Raised

1. **`D-RES06-1` 🟢 — where focus should go when the async-options row unmounts on an
   in-canvas control.** Measured: on `DzListbox` and `DzTransfer` the row **is** the
   whole tab order in the error state (`focusablesOutsideRow` 1 and 0), so a keyboard
   user can arrive at the retry control having wrapped past the end of the document,
   with `relatedTarget` = `document.body` — which the row refuses, because focusing the
   body is indistinguishable from losing focus. After a successful retry, focus is then
   on nothing. Not a 2.1.1 failure: nothing is portalled and nothing is trapped, so the
   fresh list is one `Tab` away. Options: (a) accept and document · (b) each host moves
   focus into the list it just rendered · (c) **give the shared row a host-supplied
   "where focus goes when I leave" destination**, which is (b) with one definition
   instead of eight. **Recommend (c)**, after `D-RES04-2`, since both re-open the same
   seam. ~1–2 h plus an a11y review, and the walk already holds the assertion — it skips
   it only for the measured no-origin case, so wiring (c) turns a skip into a pass on two
   more hosts with no new test.
2. **`D-RES06-2` 🟡 — `aria-controls=""` on every Reka popover and combobox trigger.**
   An empty IDREF list is invalid, and it sits beside `aria-haspopup="dialog"` on a
   closed trigger; axe: *"Unable to determine if aria-controls referenced ID exists on
   the page while using aria-haspopup"*. **Upstream**:
   `reka-ui/src/Popover/PopoverTrigger.vue:39` binds `:aria-controls="rootContext.contentId"`
   and `contentId` is empty until the content mounts; the identical line is in
   `ComboboxTrigger.vue:39` and `ComboboxInput.vue:135`, and the item-1 probe caught it
   independently on `DzCombobox`. Not fixed here: overriding it means binding
   `aria-controls` against Reka's own binding on the same element, which is the conflict
   class that ruled out `aria-activedescendant` (§1.2). Options: (a) report upstream and
   wait · (b) pin it with an assertion so it cannot silently get worse and document the
   deviation · (c) override on every affected Dz trigger. **Recommend (a) then (b).**

**Left explicitly to their owners, unchanged by this batch:** the one `yarn install` that
clears `validate:all` link 51 (`D-RES01-1`) · `D-RES04-2`, the host-driven `searchable`
double filter · the `browser-matrix` input's missing `gate` block and whether the
Storybook lane should be a capability-matrix input at all (RESIDUAL-03 items 3–4) · the
193 structurally-verified-but-not-outcome-verified citations (RESIDUAL-05 item 5) · the
25 body-wiping jsdom specs (S5-O2) · `D91` · register #2 / `D127`, the commit itself.

---

## 6. Residue — nothing left behind, proved by difference

| Check | Start | End |
|---|---|---|
| `git rev-parse HEAD` | `4e4e46f…410a` | **`4e4e46f…410a`** — unchanged |
| `git status --porcelain \| wc -l` | **312 printed / 311 handed in** | **326 printed / 325 after the probe directory was removed** — **+14, all fourteen attributed** |
| `diff` of the two **listings** | — | **exactly 14 added lines, none removed, none modified** (§6.1). `?? .residual06/` is in **both** listings, so it does not appear in the diff — which is how the `312` was resolved rather than inherited as a mystery |
| `sha256sum yarn.lock` | `6332fae9…87adb` | **`6332fae9…87adb` — identical**, and `git status --porcelain yarn.lock` prints nothing |
| `yarn install` run? | — | **no.** None owed: no manifest dependency or version changed |
| `find packages apps e2e -name '__screenshots__'` | nothing | **nothing.** Eight browser-lane runs, four with failing stories (two deliberately seeded), wrote **zero** PNGs — the addon sets `screenshotFailures: false` |
| `*.png` newer than session start under `packages`/`apps`/`e2e` | — | **none** |
| Probe files | — | `packages/core/stories/forms/Residual06Probe.stories.ts` and `packages/core/tests/a11y/residual06-depth.spec.ts` created and **deleted**; `ls packages/core/stories/forms/ \| grep -ci residual` → **0**, and `packages/core/tests/a11y/` lists the eleven family specs plus `register-matchers.ts` and nothing else. Both deletions happened **before** the final unit suite and the final browser lane, so neither run was measuring a tree with a probe in it |
| Probe directory | — | `.residual06/` created and **removed**; it held only logs, byte copies and two small scripts, was never added to `.gitignore`, and appears in no listing at the end |
| Files temporarily modified and restored | — | **two**, each verified by `sha256sum -c` against a byte copy taken first: `optionsStateFocus.ts` (`1699efad…1828`) and `DzSelect.vue` (`a7fe9b60…5391`), restored after seeded breaks 1 and 2. `DzOptionsState.vue` ends on `93caea5e…e951` and was never seeded |
| `git worktree list` | one entry | one entry |
| Commit / push / CI dispatch / publish / baseline capture / screenshot capture | — | **none** |
| Ceilings, allowlists, `*ceilings*.json` | — | **untouched** (§4). Five show as `??` because earlier batches created them and they are not committed; **none was opened for writing here** and every one of the eleven carries a pre-session mtime |

### 6.1 The fourteen paths, named

```
 M packages/core/src/components/forms/DzCascader.vue
 M packages/core/src/components/forms/DzCombobox.vue
 M packages/core/src/components/forms/DzListbox.vue
 M packages/core/src/components/forms/DzMention.vue
 M packages/core/src/components/forms/DzMultiSelect.vue
 M packages/core/src/components/forms/DzTransfer.vue
 M packages/core/src/components/forms/DzTreeSelect.vue
 M packages/core/src/components/media/DzCarousel.spec.ts
 M packages/core/src/components/media/DzCarouselDots.vue
 M packages/core/tests/a11y/data.a11y.spec.ts
 M packages/core/tests/a11y/forms.a11y.spec.ts
 M packages/core/tests/a11y/media.a11y.spec.ts
?? .changeset/an-empty-carousel-no-longer-publishes-a-childless-tablist.md
?? .changeset/the-async-options-retry-control-is-reachable-by-keyboard.md
```

Everything else this batch touched was **already dirty at session start**, each verified
by name against the start listing: `optionsStateFocus.ts`, `DzOptionsState.vue`,
`DzSelect.vue`, `packages/core/stories/_shared/asyncOptionsHost.ts`,
`capability-matrix.json`, `apps/storybook/stories/_data/capability.generated.ts`,
`component-meta.json`, `quality-matrix.json`, `llms.txt`, `llms-full.txt`,
`apps/docs/.vitepress/generated/nav.json`, `inline-style-inventory.json`,
`EXECUTION-STATUS.md`, and the register plus this report inside the already-`??`
`reports/` directory entry.

**Every path is accounted for, which is new.** 311 handed in + 14 = 325, and
`git status --porcelain | wc -l` prints **325** once the probe directory is gone. The
`312` in §0 was this batch's own `?? .residual06/`, counted because the snapshot command
created it first — so RESIDUAL-05's unattributed 311th very likely had the same cause
(`.residual05/` in its own start snapshot), and the "concurrent session" hypothesis was
never needed. **No concurrent-session change is being claimed or blamed here.**
`packages/core/docs/i18n.md` is still ` M` with a pre-session mtime and belongs to a
programme this batch never opened, but it was already dirty at session start and is
inside the 311.

---

## 7. Ranked next packet

1. **`D-RES06-1` option (c) — a host-supplied focus destination on the shared row.**
   ~1–2 h plus an a11y review. It is the last measured focus loss in the seam, the
   assertion that proves it already exists (the walk skips it only for the measured
   no-origin case), and it is the natural successor to this batch rather than a new
   idea. Do it **with** item 6 below, because both open the same files.
2. **Register #2 / `D127` — commit the 325-path worktree.** Owner-only, unchanged as the
   single act that unblocks the most, and now also the only thing between two WCAG fixes
   and any consumer seeing them.
3. **`D-RES01-1` — the one `yarn install`.** Still the cheapest act with the largest
   measured effect: link 51 is this batch's only red and it is the same red, for the
   same reason, with **zero** declarants left on the old range.
4. **`D-RES06-2` step (b) — pin `aria-controls=""` with an assertion.** ~30 min, no
   behaviour change, and it converts an upstream defect that axe can only call
   `incomplete` into something that cannot silently get worse. Report it upstream in the
   same sitting; (c) is the option most likely to break when Reka fixes it.
5. **Outcome-verify the 193 surviving citations.** Unchanged from RESIDUAL-05's ranking
   and now more pointed: this batch added three citations that are *imports plus real
   renders plus measured axe rule counts*, which is a higher bar than the other 193
   meet. The `gate` shape the matrix already uses elsewhere is the vehicle. ~3 h.
6. **`D-RES04-2` option (b) — stop a host-driven `searchable` control re-filtering its
   host's rows.** ~1 h, a `minor` to `@dzup-ui/core`. Unchanged from RESIDUAL-04's and
   RESIDUAL-05's ranking.
7. **Decide whether `DzSelect` should host the shared row.** The argument keeps growing:
   **three** of the last four defects in this seam were "the copy did not get the fix",
   and this batch had to wire the same module into it by hand for the third time. ~2 h of
   deciding, more of doing, because merging means giving `DzOptionsState` a slot.
8. **Drive `DzSelect`'s third binding, or delete it.** The `@keydown` on `SelectContent`
   covers the list-showing → item-focused → host-reload route and **no test drives it**;
   a seeded break on it fails nothing. ~30 min to add that route to `DzSelect`'s own
   story, or a decision to remove the binding. Recorded here rather than left as a
   comfortable assumption.
9. **Add `csp:inline-style-inventory` to the documented regeneration order**, and add
   `component-meta` to the list of things a **capability** change owes (§3.3). ~10
   minutes of editing a list; it has now cost two consecutive batches a red suite.
10. **The 25 body-wiping jsdom specs** (S5-O2's packet) — ~8 h, untouched, still the
    prerequisite for moving the 153 clean component specs into browser mode.
11. **`D91`** — the owner's coverage re-baseline. Still the keystone for Vitest 4 and
    therefore Vite 8. Nothing here changed it.

---

## 8. The two questions this packet existed to answer

**1. Can a keyboard user operate `Try again` now?** **Yes**, and it is driven rather
than argued: on every portalled host a bare `ArrowDown` from the control's focus owner
lands on the retry control with the panel still `open`, `Enter` advances both the retry
and the request counters, `ArrowUp` gets back out, and focus ends on the control's own
input — measured at every step, on three controls, with `document.activeElement` printed.
On the in-canvas hosts `Tab` reaches it and always did, which narrows `D-RES05-1` to what
it actually was. Both seeded breaks fail exactly the hosts they should and nothing else.
The route also exposed a second, real focus loss on *success*, which is fixed, and a
third on two in-canvas controls, which is raised rather than guessed at.

**2. Are the three `axe` cells real now?** **Yes**, and the number came back to 400 the
honest way: `present` 605 → 608, `unrun` 403 → 400, `pass` untouched, no ceiling opened,
no baseline moved. Each of the three renders was measured for depth — 16 to 18 elements,
real ARIA roles, 14 to 17 axe rules actually evaluated — because "give it a render" is
satisfiable dishonestly. And the renders paid for themselves: one **real defect**
(`DzCarouselDots` publishing a childless `tablist`, fixed), one **real upstream defect**
(`aria-controls=""` across the Reka popover and combobox seam, raised), and the
observation that `toHaveNoViolations()` could see neither of them.

**Status: COMPLETE**, to the limit of agent authority. What remains is owner work: one
commit, one `yarn install`, and two new decisions.
